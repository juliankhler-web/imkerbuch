/* Aufruf: PLAYWRIGHT_MODULE=<…>/playwright/index.mjs node tools/massendaten.mjs [ziel.json]
   (Vorschau-Server auf Port 8931). Erzeugt den Großbestand aus tools/massendaten.js in einer eigenen Test-Datenbank
   und speichert ihn als ganz normale Sicherungsdatei – auf jedem Gerät mit „Backup importieren“ einspielbar.
   Standardziel: testdaten/imkerbuch-backup-grossbestand.json (nicht im Git – zu groß). */
import fs from 'node:fs';
import path from 'node:path';

const pw = await import(process.env.PLAYWRIGHT_MODULE);
const { chromium } = pw.default || pw;
const ziel = path.resolve(process.argv[2] || new URL('../testdaten/imkerbuch-backup-grossbestand.json', import.meta.url).pathname);
fs.mkdirSync(path.dirname(ziel), { recursive: true });

const b = await chromium.launch({ channel: 'chrome' });
const p = await (await b.newContext()).newPage();
const fehler = [];
p.on('pageerror', (e) => fehler.push(e.message));
await p.goto('http://localhost:8931/index.html?testdb=massendaten');
await p.waitForFunction(() => typeof Backup !== 'undefined' && typeof DB !== 'undefined', null, { timeout: 30000 });
await p.waitForTimeout(1500);
await p.evaluate(async () => {
  document.querySelectorAll('.modal-back').forEach((m) => m.remove());
  await Backup.applyReplace({ stores: {} }, { blobsBehalten: false });
  await S.load();
  await S.set('wizardDone', true, { auto: true });
});
await p.addScriptTag({ path: new URL('./massendaten.js', import.meta.url).pathname });
console.log('Erzeuge Großbestand …');
const erg = await p.evaluate(() => massendatenErzeugen());
console.log(`fertig in ${erg.sekunden} s:`, JSON.stringify(erg.zaehl));
const t = Date.now();
const text = await p.evaluate(async () => { const blob = await Backup.buildBlob(); return blob.text(); });
fs.writeFileSync(ziel, text);
console.log(`Sicherung: ${(text.length / 1048576).toFixed(1)} MB in ${((Date.now() - t) / 1000).toFixed(1)} s → ${ziel}`);
if (fehler.length) console.log('JS-Fehler:\n' + [...new Set(fehler)].join('\n'));
await b.close();
