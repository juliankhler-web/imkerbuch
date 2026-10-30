/* Aufruf: PLAYWRIGHT_MODULE=<…>/playwright/index.mjs node tools/pdf-pruefung.mjs [ausgabeordner]
   (Vorschau-Server auf Port 8931). Füllt eine eigene Test-Datenbank mit dem Großbestand (tools/massendaten.js) und
   erzeugt JEDES PDF der App – alle Unterlagen, dazu Volksakte, einzelne Rechnung, Königin-Stockkarte, Honig- und
   QR-Etiketten, Bio-Archive und den Komplettausdruck. Prüft automatisch: Zeichensalat (Null-Bytes), Text außerhalb
   des Blatts, leere Seiten, zu hohe Tabellenzeilen (zu schmale Spalten) – und legt je PDF ein Bild der ersten und
   einer mittleren Seite ab, zum Ansehen. Julian 21.10.2026: „überprüfe einmal alle voll gefüllten PDFs“. */
import fs from 'node:fs';
import path from 'node:path';

const pw = await import(process.env.PLAYWRIGHT_MODULE);
const { chromium } = pw.default || pw;
const aus = path.resolve(process.argv[2] || 'pdf-pruefung');
fs.mkdirSync(aus, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
const p = await (await b.newContext({ viewport: { width: 1400, height: 900 } })).newPage();
const jsFehler = [];
p.on('pageerror', (e) => jsFehler.push(e.message));
await p.goto('http://localhost:8931/index.html?testdb=pdfpruefung');
await p.waitForFunction(() => typeof Backup !== 'undefined', null, { timeout: 30000 });
await p.waitForTimeout(1500);
await p.evaluate(async () => { document.querySelectorAll('.modal-back').forEach((m) => m.remove()); await Backup.applyReplace({ stores: {} }, { blobsBehalten: false }); await S.load(); await S.set('wizardDone', true, { auto: true }); });
await p.addScriptTag({ path: new URL('./massendaten.js', import.meta.url).pathname });
await p.evaluate(() => massendatenErzeugen({ fotos: 10 }));
await p.evaluate(async () => {
  await U.loadScript('./libs/pdf.min.js'); window.pdfjsLib.GlobalWorkerOptions.workerSrc = './libs/pdf.worker.min.js';
  UI.confirm = async () => true;   // Rückfragen (z. B. „EU-Bio-Logo fehlt“) bestätigen – sonst wartet das PDF auf einen Tipp
});

// Liste aller PDF-Aufträge
const auftraege = await p.evaluate(() => {
  const l = unterlagenListe().filter((e) => e.pdf && e.id !== 'komplett').map((e) => ({ id: e.id, titel: e.titel, art: 'liste' }));
  return [...l, { id: 'volksakte', titel: 'Volksakte (ein Volk, Jahr)' }, { id: 'volksakte-alle', titel: 'Volksakte (alle Jahre)' }, { id: 'rechnung', titel: 'Einzelne Rechnung' },
    { id: 'stockkarte-koenigin', titel: 'Stockkarte einer Königin' }, { id: 'stockkarte-ahnen', titel: 'Stockkarte mit voller Ahnentafel' }, { id: 'zuchtbuch', titel: 'Zuchtbuch einer Serie' },
    { id: 'wanderschild', titel: 'Wanderschild (§ 5a)' }, { id: 'tsk-TH', titel: 'Tierseuchenkasse Thüringen' }, { id: 'tsk-NW', titel: 'Tierseuchenkasse NRW' }, { id: 'tsk-ohne', titel: 'Tierseuchenkasse ohne Land' }, { id: 'tsk-AT', titel: 'Völkermeldung VIS Österreich' }, { id: 'tsk-CH', titel: 'Bestandeskontrolle Schweiz' }, { id: 'land-AT-bestandsmeldung', titel: 'Registrierung Österreich' }, { id: 'land-CH-bestandsmeldung', titel: 'Registrierung Schweiz' }, { id: 'land-AT-wanderschild', titel: 'Standschild Österreich' }, { id: 'land-CH-wanderschild', titel: 'Standschild Schweiz' }, { id: 'honig-etikett', titel: 'Honig-Etiketten' }, { id: 'qr-etiketten', titel: 'QR-Etiketten' },
    { id: 'komplett', titel: 'Komplettausdruck (Jahr)' }, ...ARCHIV_BEREICHE.map((k) => ({ id: 'bio-archiv-' + k, titel: 'Bio-Archiv ' + k }))];
});
console.log(`${auftraege.length} PDFs werden erzeugt und geprüft …`);
const befunde = [], liste = [];
for (const [nr, a] of auftraege.entries()) {
  const r = await Promise.race([new Promise((ok) => setTimeout(() => ok({ fehler: 'Zeitüberschreitung (60 s)' }), 60000)), p.evaluate(async (a) => {
    const jahr = U.todayIso().slice(0, 4);
    const tabellen = [];
    const altTab = Pdf.table;
    Pdf.table = function (doc, o) {
      // Seite des Tabellenkopfs und der ersten Zeile merken: liegen sie auf verschiedenen Seiten, steht der Kopf allein unten
      const eigen = Object.prototype.hasOwnProperty.call(doc, 'autoTable'), altAT = doc.autoTable;
      let kopfSeite = null, ersteSeite = null;
      doc.autoTable = function (opt) {
        const dd = opt.didDrawCell;
        opt.didDrawCell = (d) => { const sn = doc.getCurrentPageInfo().pageNumber; if (d.section === 'head' && kopfSeite == null) kopfSeite = sn; if (d.section === 'body' && ersteSeite == null) ersteSeite = sn; if (dd) dd(d); };
        return altAT.call(this, opt);
      };
      let y;
      try { y = altTab.call(this, doc, o); } finally { if (eigen) doc.autoTable = altAT; else delete doc.autoTable; }
      const t = doc.lastAutoTable;
      tabellen.push({ maxZeile: Math.max(0, ...t.body.map((r) => r.height)), minSpalte: Math.min(...t.columns.map((c) => c.width)), spalten: t.columns.length, verwaist: kopfSeite != null && ersteSeite != null && ersteSeite > kopfSeite ? kopfSeite : null });
      return y;
    };
    Pdf.noDownloadForTest = true; Pdf.lastDocForTest = null;
    const t0 = performance.now();
    try {
      if (a.art === 'liste') { const e = unterlagenListe().find((x) => x.id === a.id); await e.pdf(e.jahr ? jahr : ''); }
      else if (a.id.startsWith('volksakte')) { const v = U.sortBy((await DB.getAll('voelker')).filter((x) => x.status === 'aktiv'), (x) => x.name)[3]; const j = a.id === 'volksakte' ? jahr : ''; await Pdf.abschnitte({ titel: `Volksakte ${v.name}`, untertitel: j ? 'Jahr ' + j : 'alle Jahre', teile: await Export.volkTeile(v, j), datei: 'volksakte.pdf' }); }
      else if (a.id === 'rechnung') { const r = (await DB.getAll('rechnungen')).filter((x) => x.status === 'festgeschrieben').sort((x, y) => y.positionen.length - x.positionen.length)[0]; await Pdf.rechnung(r.id); }
      else if (a.id === 'stockkarte-ahnen') {   // die Königin mit den meisten bekannten Vorfahren (Ahnentafel im PDF voll)
        const km = await idMap('koeniginnen'), zaehl = (n) => (!n ? 0 : (n.quelle !== 'fehlt' ? 1 : 0) + zaehl(n.mutter) + zaehl(n.vater));
        const q = U.sortBy([...km.values()], (x) => zaehl(koeniginAhnentafel(x, km, 3)), true)[0]; await Pdf.stockkarte(q.id);
      }
      else if (a.id === 'stockkarte-koenigin') { const q = (await DB.getAll('koeniginnen')).find((x) => (x.bewertungen || []).length >= 2) || (await DB.getAll('koeniginnen'))[0]; await Pdf.stockkarte(q.id); }
      else if (a.id === 'wanderschild') { const st = U.sortBy(await DB.getAll('staende'), (x) => -x.name.length)[0]; await Pdf.wanderschild(st.id); }
      else if (a.id.startsWith('land-')) {   // Österreich/Schweiz: dieselben PDFs mit eigenem Recht
        const [, land, was] = a.id.split('-'), alt = S.get('imkerei');
        await S.set('imkerei', { ...alt, bundesland: land });
        try { if (was === 'wanderschild') { const st = U.sortBy(await DB.getAll('staende'), (x) => -x.name.length)[0]; await Pdf.wanderschild(st.id); } else await Pdf.bestandsmeldung(); } finally { await S.set('imkerei', alt); }
      }
      else if (a.id.startsWith('tsk-')) { const alt = S.get('imkerei'); await S.set('imkerei', { ...alt, bundesland: a.id === 'tsk-ohne' ? '' : a.id.slice(4) }); try { await Pdf.tierseuchenkasse(); } finally { await S.set('imkerei', alt); } }
      else if (a.id === 'zuchtbuch') { const z = U.sortBy(await DB.getAll('zuchtserien'), (x) => x.name.length, true)[0]; await Pdf.zuchtbuch(z.id); }
      else if (a.id === 'honig-etikett') { const ab = (await DB.getAll('abfuellungen'))[0]; await Pdf.honigEtikett(ab, await DB.get('chargen', ab.chargeId), { anzahl: 12, bezeichnung: 'Sommerblütenhonig aus der Region „Dachauer Land“', ursprung: 'Deutschland' }); }   // wie das Formular (Pflichtfelder)
      else if (a.id === 'qr-etiketten') { const v = (await DB.getAll('voelker'))[0]; await qrEtikettPdf(`${v.name} · ${v.beutenkennung}`, await makeQr(`imkerbuch://volk/${v.id}`), 12); }   // der PDF-Bogen der App (im Browser käme der Druckdialog)
      else if (a.id === 'komplett') await Pdf.komplett({ jahr });
      else if (a.id.startsWith('bio-archiv-')) await Pdf.bioArchiv(a.id.slice(11));
    } catch (e) { Pdf.table = altTab; return { fehler: e.message }; }
    for (let i = 0; i < 300 && !Pdf.lastDocForTest; i++) await new Promise((r) => setTimeout(r, 50));
    Pdf.table = altTab;
    const doc = Pdf.lastDocForTest;
    document.querySelectorAll('.modal-back').forEach((m) => m.remove());
    if (!doc) return { leer: true };
    const ms = Math.round(performance.now() - t0);
    const seiten = doc.getNumberOfPages();
    const salat = doc.internal.pages.some((pg) => (pg || []).some((z) => /\u0000/.test(z)));
    // Text außerhalb und leere Seiten: mit pdf.js die ersten 25 und die letzte Seite lesen
    const pdf = await pdfjsLib.getDocument({ data: doc.output('arraybuffer') }).promise;
    const raus = [], leer = [];
    const pruefSeiten = [...new Set([...Array.from({ length: Math.min(25, seiten) }, (_, i) => i + 1), seiten])];
    for (const n of pruefSeiten) {
      const pg = await pdf.getPage(n), vp = pg.getViewport({ scale: 1 }), tc = await pg.getTextContent();
      const items = tc.items.filter((i) => i.str.trim());
      if (items.length <= 3) leer.push(n);
      for (const i of items) { const x = i.transform[4], y = i.transform[5]; if (x < 2 || x + i.width > vp.width - 2 || y < 2 || y > vp.height - 2) { raus.push(`S. ${n}: „${i.str.slice(0, 30)}“`); break; } }
    }
    // Bild: erste und mittlere Seite nebeneinander
    const bilder = [];
    for (const n of [...new Set([1, ...(a.id === 'komplett' ? [2] : []), Math.max(1, Math.ceil(seiten / 2)), seiten])]) {   // Komplett: dazu das Inhaltsverzeichnis; immer auch die letzte Seite
      const pg = await pdf.getPage(n), vp = pg.getViewport({ scale: 1 }), s = 760 / Math.max(vp.width, vp.height) * (vp.width > vp.height ? 1.25 : 1);
      const v2 = pg.getViewport({ scale: s }), c = document.createElement('canvas'); c.width = v2.width; c.height = v2.height;
      await pg.render({ canvasContext: c.getContext('2d'), viewport: v2 }).promise; bilder.push(c);
    }
    const w = bilder.reduce((s2, c) => s2 + c.width + 10, 10), h = Math.max(...bilder.map((c) => c.height)) + 20;
    const m = document.createElement('canvas'); m.width = w; m.height = h; const g = m.getContext('2d'); g.fillStyle = '#888'; g.fillRect(0, 0, w, h);
    let x = 10; for (const c of bilder) { g.drawImage(c, x, 10); x += c.width + 10; }
    return { seiten, ms, salat, raus, leer, tabellen, bild: m.toDataURL('image/jpeg', 0.72) };
  }, a)]);
  const datei = `${String(nr + 1).padStart(2, '0')}-${a.id}.jpg`;
  if (r.bild) fs.writeFileSync(path.join(aus, datei), Buffer.from(r.bild.split(',')[1], 'base64'));
  const probleme = [];
  if (r.fehler) probleme.push('FEHLER ' + r.fehler);
  if (r.leer === true) probleme.push('kein PDF entstanden');
  if (r.salat) probleme.push('ZEICHENSALAT');
  if (r.raus && r.raus.length) probleme.push('Text am/außerhalb des Rands: ' + r.raus.slice(0, 2).join(' · '));
  if (r.leer && r.leer.length) probleme.push('fast leere Seite(n): ' + r.leer.slice(0, 5).join(', '));
  const hoch = (r.tabellen || []).filter((t) => t.maxZeile > 30);
  const verwaist = (r.tabellen || []).filter((t) => t.verwaist).map((t) => t.verwaist);
  if (verwaist.length) probleme.push('Tabellenkopf allein am Seitenende: S. ' + verwaist.slice(0, 5).join(', '));
  if (hoch.length) probleme.push(`Tabellenzeile bis ${Math.round(Math.max(...hoch.map((t) => t.maxZeile)))} mm hoch (Spalte min. ${Math.round(Math.min(...hoch.map((t) => t.minSpalte)))} mm)`);
  liste.push(`${String(nr + 1).padStart(2, '0')} ${a.titel.padEnd(42)} ${String(r.seiten || '-').padStart(4)} S. ${String(r.ms || '-').padStart(5)} ms  ${probleme.length ? '⚠ ' + probleme.join(' | ') : 'ok'}`);
  console.log(liste[liste.length - 1]);
  if (probleme.length) befunde.push(`${a.titel}: ${probleme.join(' | ')}`);
}
console.log(befunde.length ? `\n${befunde.length} PDFs mit Befund.` : '\nKeine Befunde.');
if (jsFehler.length) console.log('JS-Fehler:\n' + [...new Set(jsFehler)].join('\n'));
console.log('Seitenbilder: ' + aus);
await b.close();
