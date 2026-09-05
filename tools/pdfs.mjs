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
    telefon: '05684 123456', email: 'post@imkerei-sonnenwiese.de', registriernummer: '06 634 000 1234',
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
  await cdp.js('Pdf.noDownloadForTest = true; return 1;');

  const jahr = new Date().getFullYear();
  const jobs = [
    ['rechnung', `const r = (await DB.getAll('rechnungen')).find(x => x.status === 'festgeschrieben') || (await DB.getAll('rechnungen'))[0];
                  await Pdf.rechnung(r.id);`],
    ['honig-etikett', `const a = (await DB.getAll('abfuellungen'))[0]; const c = await DB.get('chargen', a.chargeId);
                  await Pdf.honigEtikett(a, c, { anzahl: 4, bezeichnung: 'Sommerblütenhonig', ursprung: 'Deutschland', mitQr: true });`],
    ['bestandsbuch', 'await Pdf.bestandsbuch();'],
    ['chargenuebersicht', 'await Pdf.chargenuebersicht();'],
    ['kassenbuch-jahr', `await Pdf.kassenbuchJahr('${jahr}');`],
    ['bio-unterlagen', 'await Pdf.bioUnterlagen();'],
    ['bestandsmeldung', 'await Pdf.bestandsmeldung();'],
    ['tierseuchenkasse', 'await Pdf.tierseuchenkasse();'],
    ['fuetterungsliste', `await Pdf.fuetterungsliste('${jahr}');`],
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
