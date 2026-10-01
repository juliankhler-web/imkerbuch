/* Erzeugt Beispiel-PDFs aus der App (Rechnung, Etikett, Bestandsbuch …) und legt
   sie als Dateien ab. Steuert Chrome über das DevTools-Protokoll – dieselbe
   Technik wie tools/shots.mjs.

   Läuft gegen die TEST-Datenbank (?testdb=1); echte Daten bleiben unberührt.
   Aufruf: node tools/pdfs.mjs <zielordner>
*/
import { writeFileSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';

const ZIEL = process.argv[2];
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
// Wegwerf-Profil neben den Werkzeugen, per Punkt vor dem Namen aus Git heraus
const PROFIL = new URL('.chromeprofil-pdf', import.meta.url).pathname;
const PORT = 9334;
const BASIS = 'http://localhost:8931/index.html?testdb=1';
const schlaf = (ms) => new Promise((r) => setTimeout(r, ms));

class Cdp {
  constructor(ws) { this.ws = ws; this.id = 0; this.warten = new Map(); this.session = null;
    ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); const w = this.warten.get(m.id);
      if (w) { this.warten.delete(m.id); m.error ? w.rej(new Error(m.error.message)) : w.res(m.result); } }); }
  send(method, params = {}, session = this.session) {
    const id = ++this.id;
    return new Promise((res, rej) => { this.warten.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params, ...(session ? { sessionId: session } : {}) }));
      setTimeout(() => { if (this.warten.delete(id)) rej(new Error('Zeitüberschreitung: ' + method)); }, 120000); });
  }
  async js(code) {
    const r = await this.send('Runtime.evaluate', { expression: `(async()=>{${code}})()`, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + ((r.exceptionDetails.exception || {}).description || ''));
    return r.result.value;
  }
}

async function verbinde() {
  for (let i = 0; i < 60; i++) {
    try {
      const v = await fetch(`http://127.0.0.1:${PORT}/json/version`).then((r) => r.json());
      const ws = new WebSocket(v.webSocketDebuggerUrl);
      await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
      return new Cdp(ws);
    } catch (e) { await schlaf(300); }
  }
  throw new Error('Chrome antwortet nicht');
}

/* Imkerei-Stammdaten, eigenes Logo (mit Transparenz!) und Bio-Logos setzen –
   genau die Konstellation, die vorher schwarze Felder ergab. */
const VORBEREITEN = `
  const imk = S.get('imkerei');
  Object.assign(imk, { name: 'Imkerei Sonnenwiese', strasse: 'Am Lindenweg 12', plz: '34266', ort: 'Frielendorf',
    telefon: '05684 123456', email: 'post@imkerei-sonnenwiese.de', registriernummer: '06 634 000 1234', steuernummer: '025 123 45678', ustIdNr: '',
    bio: 'ja', bioKontrollstelle: 'DE-ÖKO-006 – ABCERT AG', bioVerbandJN: 'ja', bioVerband: ['Bioland'] });
  // eigenes Logo: runde Wabe auf DURCHSICHTIGEM Grund
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const x = c.getContext('2d'); x.clearRect(0,0,256,256);
  x.fillStyle = '#E8A013'; x.beginPath();
  for (let i = 0; i < 6; i++) { const a = Math.PI/6 + i*Math.PI/3; const px = 128+96*Math.cos(a), py = 128+96*Math.sin(a); i ? x.lineTo(px,py) : x.moveTo(px,py); }
  x.closePath(); x.fill();
  x.fillStyle = '#26262B'; x.font = 'bold 74px -apple-system,sans-serif'; x.textAlign = 'center';
  x.fillText('IB', 128, 155);
  await S.set('logo', c.toDataURL('image/png'));
  // Bio-Logos als SVG – die wurden früher stillschweigend übersprungen
  const svg = (t, f) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" rx="14" fill="'+f+'"/>' +
    '<text x="60" y="70" font-family="Helvetica" font-size="22" font-weight="bold" fill="white" text-anchor="middle">'+t+'</text></svg>');
  imk.bioLogos = [svg('Bioland', '#046A38'), svg('EU-Bio', '#1B5E20')];
  await S.set('imkerei', imk);
  return 'bereit';
`;

async function main() {
  mkdirSync(ZIEL, { recursive: true });
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFIL}`, '--no-first-run', '--no-default-browser-check',
    '--disable-gpu', '--hide-scrollbars'], { stdio: 'ignore' });
  process.on('exit', () => chrome.kill());

  const cdp = await verbinde();
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  cdp.session = sessionId;
  await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 900, deviceScaleFactor: 1, mobile: false });

  await cdp.send('Page.navigate', { url: BASIS });
  for (let i = 0; i < 200; i++) { try { if (await cdp.js('return !!window.appReady')) break; } catch (e) {} await schlaf(150); }
  if ((await cdp.js('return (await DB.getAll("voelker")).length')) < 5) {
    console.log('Beispieldaten anlegen …'); await cdp.js('await Demo.reset(); return 1;');
  }
  console.log(await cdp.js(VORBEREITEN));
  const STRESS = !!process.env.STRESS;
  if (STRESS) {
    console.log('Stresstest: extra lange Namen und Texte');
    await cdp.js(`
      const imk = S.get('imkerei');
      Object.assign(imk, { name: 'Imkerei Sonnenwiese Familie Müller-Lüdenscheidt & Söhne Bienenzucht und Honigvertrieb GmbH & Co. KG',
        strasse: 'Am Lindenweg zum Alten Bienenhaus 12 a', plz: '34266', ort: 'Frielendorf-Obergrenzebach',
        email: 'kontakt.und.bestellungen@imkerei-sonnenwiese-mueller-luedenscheidt.example.de' });
      await S.set('imkerei', imk);
      const lang = 'Die Imkerei wird als Familienbetrieb im Nebenerwerb geführt. Verantwortlich für die Einhaltung der Öko-Auflagen ist die Betriebsleitung; Vertretung übernimmt ein zweiter Imker, der ebenfalls geschult ist. Die Umstellung erfolgte im Jahr 2019, seitdem wird ohne Unterbrechung ökologisch geimkert.\\n\\nAlle Völker stehen an drei Ständen; ein vierter Wanderstand wird nur zur Rapsblüte genutzt. Für jeden Stand liegt eine Auswertung der Landbedeckung im Umkreis von drei Kilometern vor, die jährlich überprüft wird.';
      const bb = {}; for (const a of BIO_ABSCHNITTE) bb[a.key] = lang; await S.set('bioBetrieb', bb);
      const st = await DB.getAll('staende'); st[0].name = 'Heimstand Obstwiese am Waldrand oberhalb von Frielendorf-Obergrenzebach'; await DB.put('staende', st[0]);
      return 1;`);
  }
  const BEZ = STRESS ? 'Sommerblütenhonig aus Raps, Linde und Wildblumen – cremig gerührt' : 'Sommerblütenhonig';
  await cdp.js('Pdf.noDownloadForTest = true; return 1;');

  const jahr = new Date().getFullYear();
  const jobs = [
    ['rechnung', `const r = (await DB.getAll('rechnungen')).find(x => x.status === 'festgeschrieben') || (await DB.getAll('rechnungen'))[0];
                  await Pdf.rechnung(r.id);`],
    ['honig-etikett', `const a = (await DB.getAll('abfuellungen'))[0]; const c = await DB.get('chargen', a.chargeId);
                  await Pdf.honigEtikett(a, c, { anzahl: 4, bezeichnung: '${BEZ}', ursprung: 'Deutschland', mitQr: true });`],
    ['stockkarte', `const v = (await DB.getAll('voelker')).find(x => x.koeniginId && x.status === 'aktiv');
                  await setBewertung(v.koeniginId, { sanftmut: 6, wabenstetigkeit: 5, schwarmtraegheit: 4, bienen: 5, brut: 5, ueberwinterung: 4, fruchtbarkeit: 5, fruehtracht: 6, sommertracht: 4, wirrbau: 5, propolis: 4, varroaschaeden: 5, vsh: 4, hyg: 4 }, '2026-06-18', { wetter: 'sonnig', temperatur: 24, bemerkung: 'Sehr ruhig auf der Wabe, kein Wirrbau.' });
                  await setBewertung(v.koeniginId, { sanftmut: 5, wabenstetigkeit: 4, bienen: 4, brut: 5, ueberwinterung: 4 }, '2026-05-02', { wetter: 'bewölkt', temperatur: 17, bemerkung: 'Frühjahr etwas verhalten.' });
                  await Pdf.stockkarte(v.koeniginId);`],
    ['vorsorgekonzept', `const stand = { bereiche: {}, geprueftAm: '2026-03-14', erstelltAm: '2026-03-14' };
                  const ctx = await vorsorgeKontext({ bereiche: Object.fromEntries(VORSORGE_BEREICHE.map((b) => [b.key, { status: b.key === 'parallel' || b.key === 'fremd' ? 'nein' : 'ja' }])) });
                  for (const b of VORSORGE_BEREICHE) {
                    const nein = b.key === 'parallel' || b.key === 'fremd';
                    stand.bereiche[b.key] = { status: nein ? 'nein' : 'ja', text: nein ? '' : vorsorgeVorschlag(b, {}, ctx), antworten: {} };
                  }
                  await S.set('bioVorsorge', stand);
                  await Pdf.bioVorsorge();`],
    ['hygieneplan', `for (const [bereichName, mittel, haeufigkeit, verantwortlich] of [
                    ['Schleuderraum', 'heißes Wasser, mechanische Reinigung', 'vor jeder Schleuderung', 'Imkerei Sonnenwiese'],
                    ['Beuten und Rähmchen', 'Abflammen bzw. Dampf (physikalische Desinfektion)', 'bei Wiederbelegung bzw. nach Verdacht auf Faulbrut', 'Imkerei Sonnenwiese'],
                    ['Abfüllkessel und Abfülleimer', 'heißes Wasser, mechanische Reinigung', 'nach jedem Gebrauch', 'Imkerei Sonnenwiese'],
                  ]) await DB.put('bioeintraege', { bereich: 'hygieneplan', bereichName, mittel, haeufigkeit, verantwortlich });
                  await DB.put('bioeintraege', { bereich: 'hygienenachweis', bereichName: 'Schleuderraum', datum: '2026-06-18', mittel: 'heißes Wasser', verantwortlich: 'Julian', notiz: 'vor der Schleuderung' });
                  await Pdf.bioHygieneplan();`],
    ['bestandsbuch', 'await Pdf.bestandsbuch();'],
    ['chargenuebersicht', 'await Pdf.chargenuebersicht();'],
    ['kassenbuch-jahr', `await Pdf.kassenbuchJahr('${jahr}');`],
    ['bio-unterlagen', 'await Pdf.bioUnterlagen();'],
    ['jahresbericht', `await Pdf.jahresbericht('${new Date().getFullYear()}');`],
    ['bestandsmeldung', 'await Pdf.bestandsmeldung();'],
    ['tierseuchenkasse', 'await Pdf.tierseuchenkasse();'],
    ['fuetterungsliste', `await Pdf.fuetterungsliste('${jahr}');`],
    ['betriebsbeschreibung', `const c = await betriebKontext(); const bb = {}; for (const a of BIO_ABSCHNITTE) bb[a.key] = bbVorschlag(a.key, {}, c); delete bb.zucht; await S.set('bioBetrieb', bb); await Pdf.bioBetriebsbeschreibung();`],
    ['vorsorge-lang', `const lang = 'Dies ist ein langer eigener Absatz, der über die Seite laufen soll, damit man den Seitenumbruch prüfen kann. '.repeat(14); await S.set('bioVorsorgeEigen', [{ key: 'eigen_x', titel: 'Eigener Bereich mit sehr langem Namen für den Test des Umbruchs in der Überschrift' }]); const st = vorsorgeLaden(); const c = await vorsorgeKontext(st); for (const b of VORSORGE_BEREICHE) st.bereiche[b.key] = { status: 'ja', text: b.text({}, c) + (b.key === 'ernte' ? ' ' + lang : ''), antworten: {} }; st.bereiche.eigen_x = { status: 'ja', text: lang + '\\n' + lang, antworten: {} }; await S.set('bioVorsorge', st); await Pdf.bioVorsorge();`],
    ['bb-lang', `const lang = 'Dies ist ein langer eigener Absatz, der über die Seite laufen soll, damit man den Seitenumbruch prüfen kann. '.repeat(14); await S.set('bioBetriebEigen', [{ key: 'eigen_y', titel: 'Sonstige Angaben' }]); const c = await betriebKontext(); const bb = {}; for (const a of BIO_ABSCHNITTE) bb[a.key] = bbVorschlag(a.key, {}, c); bb.gesundheit += ' ' + lang; bb.eigen_y = lang; await S.set('bioBetrieb', bb); await Pdf.bioBetriebsbeschreibung(); await S.set('bioBetriebEigen', []);`],
    ['hygiene-alles', `const t = U.todayIso(); const P = (o) => DB.put('bioeintraege', o); for (let i = 0; i < 6; i++) await P({ bereich: 'hygienenachweis', datum: U.addDays(t, -i), bereichName: 'Schleuder und Siebe', art: i % 3 ? 'U' : 'G', mittel: 'heißes Wasser', verantwortlich: 'Julian' });
      await P({ bereich: 'honigverarbeitung', datum: t, losNr: 'L-2026-07', ernteText: 'Raps · 24 kg', punkte: ['raum', 'entdeckelmaschine', 'siebe', 'klaerbehaelter', 'lagerbehaelter'], wasser: 18.6, notiz: 'Wassergehalt zu hoch, Honig bleibt zurückgestellt.' });
      await P({ bereich: 'honigabfuellung', datum: t, losNr: 'L-2026-07', abfuellText: '80 × 500 g, 60 × 250 g', punkte: ['abfuellanlage', 'melitherm', 'ruehrstab', 'glaeser', 'deckel'], wasserAbfuellung: 17.8, waerme: 40, mhd: U.addDays(t, 700), rueckstellDatum: t, rueckstellNr: 'R-12' });
      for (let i = 0; i < 4; i++) await P({ bereich: 'honiglager', datum: U.addDays(t, -7 * i), temperatur: 13 + i, feuchte: 52 + 4 * i, massnahme: i > 1 ? 'Raumtrocknung' : '', verantwortlich: 'Julian' });
      await P({ bereich: 'schaedlinge', datum: t, befall: 'ja', welche: 'Wachsmotten', wo: 'Wabenlager', staerke: 'gering', massnahme: 'Waben tiefgefroren', nachkontrolle: U.addDays(t, 14), ergebnis: '', verantwortlich: 'Julian' });
      await P({ bereich: 'waage', datum: t, soll: 500, ist: 500.1, verantwortlich: 'Julian' });
      await P({ bereich: 'massnahmen', datum: t, bereich_: 'Lager', massnahme: 'Hygrometer ersetzen und Lüftung verbessern', frist: U.addDays(t, 20) });
      await Pdf.bioHygieneplan();`],
  ];
  for (const [name, code] of jobs) {
    try {
      const b64 = await cdp.js(`Pdf.lastDocForTest = null; ${code}
        const d = Pdf.lastDocForTest; if (!d) return null;
        return d.output('datauristring').split(',')[1];`);
      if (!b64) { console.log(`${name.padEnd(20)} — kein Dokument`); continue; }
      const pfad = `${ZIEL}/${name}.pdf`;
      writeFileSync(pfad, Buffer.from(b64, 'base64'));
      console.log(`${name.padEnd(20)} ${Math.round(Buffer.from(b64, 'base64').length / 1024)} KB`);
    } catch (e) { console.log(`${name.padEnd(20)} FEHLER: ${e.message.slice(0, 120)}`); }
  }
  chrome.kill(); process.exit(0);
}
main().catch((e) => { console.error('FEHLER:', e.message); process.exit(1); });
