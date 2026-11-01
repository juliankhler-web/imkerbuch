/* Prüft den Start der App unter Störungen und das Update über alte Daten, jeweils im echten Ablauf (nicht in der Testseite).

   Aufruf:  node tools/start-pruefung.mjs [ordner-für-bilder]
   Basis:   BASIS=http://localhost:8931/index.html (Server im Projektordner, den die anderen Prüfungen auch nutzen)
   Playwright: PLAYWRIGHT_MODULE, sonst aus ~/TaschenBoerse/node_modules; es läuft das installierte Chrome.

   Teil 1, Störungen: Datenbank scheitert, hängt, Programmteil defekt, Umstellung scheitert, Einstellungen nicht lesbar.
   Teil 2, Update: Eine Datenbank der niedrigsten Stufe mit Altdaten (tests/fixtures/backup) und echtem Foto wird mit dem
   neuen Code geöffnet. Alle Einträge müssen danach da sein, das Foto unverändert, die Umstellungen abgehakt. */
import { readFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
const WURZEL = new URL('..', import.meta.url).pathname;
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || homedir() + '/TaschenBoerse/node_modules/playwright/index.mjs');
const BASIS = process.env.BASIS || 'http://localhost:8931/index.html';
const ORDNER = process.argv[2] || null;
if (ORDNER) mkdirSync(ORDNER, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
let fehler = 0;
const pruefe = (ok, text) => { console.log((ok ? '  ✓ ' : '  ✗ ') + text); if (!ok) fehler++; };
const seiteMit = async (vorbereiten, kontext = {}) => {
  const c = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true, ...kontext });
  const p = await c.newPage();
  p.fehlerliste = [];
  p.on('pageerror', (e) => p.fehlerliste.push(e.message));
  if (vorbereiten) await vorbereiten(p, c);
  return { c, p };
};
const bild = async (p, name) => { if (ORDNER) await p.screenshot({ path: `${ORDNER}/${name}.png` }); };

console.log('Teil 1: Störungen beim Start');
{
  console.log(' Datenbank scheitert');
  const { c, p } = await seiteMit((p) => p.addInitScript(() => {
    IDBFactory.prototype.open = function () { const r = { error: new DOMException('Internal error', 'UnknownError') }; setTimeout(() => r.onerror && r.onerror({ preventDefault() {} }), 0); return r; };
  }));
  await p.goto(BASIS);
  await p.waitForSelector('#notfall', { timeout: 10000 });
  const t = await p.textContent('#notfall');
  pruefe(/nicht löschen|Websitedaten nicht löschen/.test(t), 'warnt vor dem Löschen');
  pruefe(/Neu versuchen/.test(t) && /Hilfe per E-Mail/.test(t), 'Knöpfe da');
  pruefe(/Internal error/.test(t), 'nennt den Fehler');
  await bild(p, 'datenbank-scheitert');
  await p.click('#notfall button:has-text("Sicherung speichern")');
  await p.waitForFunction(() => /Die Sicherung ging nicht/.test(document.getElementById('notfall').textContent), null, { timeout: 150000 });
  pruefe(true, 'Sicherung meldet, dass es nicht geht');
  await c.close();
}
{
  console.log(' Datenbank hängt');
  const { c, p } = await seiteMit((p) => p.addInitScript(() => { IDBFactory.prototype.open = function () { return {}; }; }));
  await p.goto(BASIS);
  await p.waitForSelector('#notfall', { timeout: 40000 });
  pruefe(/antwortet nicht|ungewöhnlich lange/.test(await p.textContent('#notfall')), 'Seite erscheint nach der Frist');
  await c.close();
}
{
  console.log(' Programmteil defekt');
  const { c, p } = await seiteMit(async (p) => {
    await p.route('**/index.html*', async (r) => {
      const a = await r.fetch(); const h = await a.text();
      await r.fulfill({ response: a, body: h.replace("const APP_VERSION = '", "const APP_VERSION = = '") });
    });
  });
  await p.goto(BASIS);
  await p.waitForSelector('#notfall', { timeout: 10000 });
  const t = await p.textContent('#notfall');
  pruefe(/Neu versuchen/.test(t), 'Seite erscheint auch ohne Hauptteil');
  pruefe(!/Sicherung speichern/.test(t), 'ohne Hauptteil kein Sicherungs-Knopf');
  await c.close();
}
{
  console.log(' Umstellung scheitert');
  const { c, p } = await seiteMit((p) => p.addInitScript(() => {
    const g = IDBObjectStore.prototype.getAll;
    IDBObjectStore.prototype.getAll = function (...a) { if (this.name === 'belegstellen' && !window.__einmal) { window.__einmal = true; throw new Error('kaputter Eintrag'); } return g.apply(this, a); };
  }));
  await p.goto(BASIS + '?testdb=1');
  await p.waitForFunction(() => window.appReady === true, null, { timeout: 30000 });
  pruefe(!(await p.$('#notfall')), 'App startet trotzdem');
  pruefe(await p.evaluate(() => window.STARTHINWEISE.includes('migriereBelegstellen')), 'gescheiterter Schritt vermerkt');
  await c.close();
}
{
  console.log(' Einstellungen nicht lesbar, Einträge schon');
  const { c, p } = await seiteMit((p) => p.addInitScript(() => {
    let erster = true;
    const g = IDBObjectStore.prototype.getAll;
    IDBObjectStore.prototype.getAll = function (...a) { if (this.name === 'settings' && erster) { erster = false; throw new Error('Einstellungen kaputt'); } return g.apply(this, a); };
  }));
  await p.goto(BASIS + '?testdb=1');
  await p.waitForSelector('#notfall', { timeout: 15000 });
  await bild(p, 'einstellungen-kaputt');
  const dl = p.waitForEvent('download', { timeout: 60000 });
  await p.click('#notfall button:has-text("Sicherung speichern")');
  const d = await dl;
  const pfad = await d.path();
  const sicherung = JSON.parse(readFileSync(pfad, 'utf8'));
  pruefe(sicherung.app === 'ImkerBuch' && !!sicherung.stores.voelker, 'Sicherung von der Notfallseite funktioniert');
  pruefe(/imkerbuch-backup-/.test(d.suggestedFilename()), 'Dateiname stimmt');
  await p.waitForFunction(() => /Die Sicherung ist fertig/.test(document.getElementById('notfall').textContent));
  pruefe(true, 'Meldung „fertig“');
  await c.close();
}
{
  console.log(' Zweites Lesen der Einstellungen scheitert (Umstellung liest sie neu)');
  const { c, p } = await seiteMit((p) => p.addInitScript(() => {
    const g = IDBObjectStore.prototype.getAll; let n = 0;
    IDBObjectStore.prototype.getAll = function (...a) { if (this.name === 'settings' && ++n === 2) throw new Error('Verbindung weg'); return g.apply(this, a); };
  }));
  await p.goto(BASIS + '?testdb=1');
  await p.waitForFunction(() => window.appReady === true, null, { timeout: 30000 });
  pruefe(!(await p.$('#notfall')), 'App startet');
  pruefe(await p.evaluate(() => Object.keys(window.S.data).length > 0), 'Einstellungen bleiben im Speicher');
  await c.close();
}
{
  console.log(' Normaler Start');
  const { c, p } = await seiteMit();
  await p.goto(BASIS + '?testdb=1');
  await p.waitForFunction(() => window.appReady === true, null, { timeout: 30000 });
  pruefe(!(await p.$('#notfall')), 'keine Notfallseite');
  pruefe(p.fehlerliste.length === 0, 'keine Fehler in der Seite' + (p.fehlerliste[0] ? ': ' + p.fehlerliste[0] : ''));
  await c.close();
}

console.log('Teil 2: Update über alte Daten');
for (const v of ['1.61', '1.62', '1.63', '1.64']) {
  console.log(' Fassung ' + v + ', niedrigste Datenbank-Stufe');
  const roh = JSON.parse(readFileSync(`${WURZEL}tests/fixtures/backup/v${v}.json`, 'utf8'));
  // Die Vorlagen sind schon umgestellt. Ohne Merker und mit einem Eintrag in alter Form laufen die Umstellungen wirklich.
  roh.stores.settings = (roh.stores.settings || []).filter((r) => !/Migriert$|^dokTypZertifikat$|^fahrtAuswahlV299$|^schnellzugriffeV301$/.test(r.key));
  roh.stores.koeniginnen = [...(roh.stores.koeniginnen || []), { id: 'alt-koenigin', kennung: 'ALT-1', belegstelle: 'Alte Belegstelle', status: 'aktiv', historie: [] }];
  const { c, p } = await seiteMit();
  await p.goto(BASIS.replace(/index\.html.*/, 'webview-veraltet.html'));   // gleiche Herkunft, ohne dass die App die Datenbank anlegt
  const vorher = await p.evaluate(async (roh) => {
    await new Promise((res) => { const d = indexedDB.deleteDatabase('imkerbuch'); d.onsuccess = d.onerror = d.onblocked = () => res(); });
    const db = await new Promise((res, rej) => {
      const r = indexedDB.open('imkerbuch', 1);
      r.onupgradeneeded = () => { for (const s of Object.keys(roh.stores)) r.result.createObjectStore(s, { keyPath: s === 'settings' ? 'key' : 'id' }); };
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    const foto = new Blob([new Uint8Array([255, 216, 255, 224, 1, 2, 3, 4, 5])], { type: 'image/jpeg' });
    const namen = [...db.objectStoreNames];
    const tx = db.transaction(namen, 'readwrite');
    const zahl = {};
    for (const s of namen) {
      const liste = (roh.stores[s] || []).map((z) => { const { datenUrl, ...rest } = z; return rest; });
      zahl[s] = liste.length;
      for (const z of liste) tx.objectStore(s).put(z);
    }
    if (namen.includes('settings')) {
      tx.objectStore('settings').put({ key: 'wizardDone', value: true });
      tx.objectStore('settings').put({ key: 'testerFreigabe', value: true });
    }
    if (namen.includes('anhaenge')) { tx.objectStore('anhaenge').put({ id: 'alt-foto', parentTyp: 'volk', parentId: 'x', art: 'foto', name: 'alt.jpg', mime: 'image/jpeg', blob: foto, groesse: 9 }); zahl.anhaenge++; }
    await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
    db.close();
    return zahl;
  }, roh);
  await p.goto(BASIS);
  await p.waitForFunction(() => window.appReady === true, null, { timeout: 45000 });
  await bild(p, 'update-' + v);
  pruefe(!(await p.$('#notfall')), 'startet ohne Notfallseite');
  const nach = await p.evaluate(async () => {
    const zahl = {};
    for (const s of window.DB.STORES) zahl[s] = await window.DB.count(s);
    const foto = await window.DB.get('anhaenge', 'alt-foto');
    const k = await window.DB.get('koeniginnen', 'alt-koenigin');
    const beleg = k && k.belegstelleId ? await window.DB.get('belegstellen', k.belegstelleId) : null;
    return { altBelegstelle: beleg && beleg.name, zahl, version: window.DB._db.version, hinweise: window.STARTHINWEISE, fotoBytes: foto && foto.blob ? [...new Uint8Array(await foto.blob.arrayBuffer())].join() : null,
      fehlt: window.DB.STORES.filter((s) => !window.DB._db.objectStoreNames.contains(s)), merker: ['raehmchenmassMigriert', 'abfuellungMigriert', 'inventarTypMigriert', 'chargeDatumMigriert', 'belegstellenMigriert'].filter((k) => !window.S.get(k)) };
  });
  pruefe(nach.version === await p.evaluate(() => window.DB.VER), 'Datenbank auf Stufe ' + nach.version);
  pruefe(nach.fehlt.length === 0, 'alle Bereiche vorhanden' + (nach.fehlt.length ? ': fehlt ' + nach.fehlt : ''));
  pruefe(nach.hinweise.length === 0, 'keine Umstellung gescheitert' + (nach.hinweise.length ? ': ' + nach.hinweise : ''));
  pruefe(nach.merker.length === 0, 'Umstellungen abgehakt' + (nach.merker.length ? ': offen ' + nach.merker : ''));
  pruefe(nach.altBelegstelle === 'Alte Belegstelle', 'alte Königin auf neue Belegstelle umgestellt');
  pruefe(nach.fotoBytes === '255,216,255,224,1,2,3,4,5', 'Foto unverändert');
  const weniger = Object.keys(vorher).filter((s) => s !== 'settings' && s !== 'snapshots' && (nach.zahl[s] || 0) < vorher[s]);

  pruefe(weniger.length === 0, 'kein Eintrag verloren' + (weniger.length ? ': ' + weniger.map((s) => `${s} ${vorher[s]}→${nach.zahl[s]}`) : ''));
  pruefe(p.fehlerliste.length === 0, 'keine Fehler in der Seite' + (p.fehlerliste[0] ? ': ' + p.fehlerliste[0] : ''));
  await p.evaluate(async () => { const b = await window.Backup.buildBlob(); JSON.parse(await b.text()); });
  pruefe(true, 'Sicherung danach möglich');
  await c.close();
}
await browser.close();
console.log(fehler ? `\n${fehler} Befunde.` : '\nKeine Befunde.');
process.exit(fehler ? 1 : 0);
