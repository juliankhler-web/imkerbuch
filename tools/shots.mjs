/* Erzeugt neutrale App-Screenshots in Handygröße, hell und dunkel.
   Steuert Chrome über das DevTools-Protokoll (kein npm-Paket nötig, Node 24 hat WebSocket).

   Neutral heißt: kein Name im Gruß, kein Speicher-Hinweis-Banner, Beispieldaten
   statt echter Daten (eigene Test-Datenbank, Julians Daten bleiben unberührt).

   Aufruf: node shots.mjs <zielordner> [--only=dark|light]
*/
import { writeFileSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';

const ZIEL = process.argv[2];
const NUR = (process.argv.find((a) => a.startsWith('--only=')) || '').split('=')[1] || '';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
// Wegwerf-Profil neben den Werkzeugen, per Punkt vor dem Namen aus Git heraus
const PROFIL = new URL('.chromeprofil-shots', import.meta.url).pathname;
const PORT = 9333;
const BASIS = 'http://localhost:8931/index.html?testdb=1';

const ANSICHTEN = [
  ['01-dashboard', 'dashboard', 'Übersicht'],
  ['02-voelker', 'voelker', 'Völker'],
  ['03-stockkarte', 'volk', 'Stockkarte'],
  ['04-koeniginnen', 'koeniginnen', 'Königinnen'],
  ['05-zucht', 'zucht', 'Zucht'],
  ['06-honig', 'honig', 'Honig & Chargen'],
  ['07-kassenbuch', 'kassenbuch', 'Kassenbuch'],
  ['08-rechnungen', 'rechnungen', 'Rechnungen'],
  ['09-aufgaben', 'aufgaben', 'Aufgaben & Kalender'],
  ['10-material', 'material', 'Verbrauchsmaterial'],
  ['11-bio', 'bio', 'Öko-Kontrolle'],
  ['12-imkerschule', 'imkerschule', 'Imkerschule'],
  ['13-fahrten', 'fahrten', 'Fahrtenbuch'],
  ['14-reporting', 'reporting', 'Auswertungen'],
  ['15-markt', 'markt', 'Marktverkauf'],
  ['16-rechner', 'rechner', 'Rechner'],
];

const schlaf = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- kleiner CDP-Client ---------- */
class Cdp {
  constructor(ws) { this.ws = ws; this.id = 0; this.warten = new Map(); this.session = null;
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      const w = this.warten.get(m.id);
      if (w) { this.warten.delete(m.id); m.error ? w.rej(new Error(m.error.message)) : w.res(m.result); }
    });
  }
  send(method, params = {}, session = this.session) {
    const id = ++this.id;
    return new Promise((res, rej) => {
      this.warten.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params, ...(session ? { sessionId: session } : {}) }));
      setTimeout(() => { if (this.warten.delete(id)) rej(new Error('CDP-Zeitüberschreitung: ' + method)); }, 60000);
    });
  }
  async js(ausdruck) {
    const r = await this.send('Runtime.evaluate', { expression: `(async()=>{${ausdruck}})()`, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception || {}).description);
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
  throw new Error('Chrome antwortet nicht auf Port ' + PORT);
}

/* ---------- Vorbereitung im Seitenkontext ---------- */
const NEUTRAL = (theme) => `
  const p = S.get('profil') || {}; p.name = ''; await S.set('profil', p);
  const imk = S.get('imkerei') || {}; if (!imk.name) { imk.name = 'Imkerei Sonnenwiese'; await S.set('imkerei', imk); }
  await S.set('theme', '${theme}');
  document.documentElement.dataset.theme = '${theme}';
  try { Backup._dismissed.persist = true; Backup._dismissed.gelb = true; Backup._dismissed.rot = true; Backup.updateBanners(); } catch (e) {}
  document.querySelectorAll('.banner').forEach(b => b.remove());
  return document.documentElement.dataset.theme;
`;

async function main() {
  mkdirSync(ZIEL, { recursive: true });
  const chrome = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFIL}`,
    '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=3', '--font-render-hinting=none',
  ], { stdio: 'ignore' });
  process.on('exit', () => chrome.kill());

  const cdp = await verbinde();
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  cdp.session = sessionId;
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 430, height: 932, deviceScaleFactor: 3, mobile: true });

  const laden = async (url) => {
    await cdp.send('Page.navigate', { url });
    for (let i = 0; i < 200; i++) {
      try { if (await cdp.js('return !!window.appReady')) return true; } catch (e) {}
      await schlaf(150);
    }
    return false;
  };

  // 1) Beispieldaten anlegen (einmalig, in der Test-Datenbank)
  if (!(await laden(BASIS))) throw new Error('App wurde nicht bereit');
  const anzahl = await cdp.js('return (await DB.getAll("voelker")).length');
  if (anzahl < 5) {
    console.log('Beispieldaten werden angelegt …');
    await cdp.js('await Demo.reset(); return true;');
  }
  console.log('Völker in der Beispiel-Datenbank:', await cdp.js('return (await DB.getAll("voelker")).length'));

  const volkId = await cdp.js('return ((await DB.getAll("voelker"))[0]||{}).id || ""');

  // 2) Aufnahmen
  const themen = NUR ? [NUR] : ['dark', 'light'];
  let n = 0;
  for (const theme of themen) {
    for (const [datei, route, titel] of ANSICHTEN) {
      const ziel = route === 'volk' ? `${route}/${volkId}` : route;
      await cdp.js(NEUTRAL(theme));
      await cdp.js(`location.hash = '#/${ziel}'; await renderRoute(); window.scrollTo(0,0); return 1;`);
      await schlaf(700);
      await cdp.js(`document.querySelectorAll('.banner').forEach(b=>b.remove()); return 1;`);
      await schlaf(250);
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      const pfad = `${ZIEL}/${theme}-${datei}.png`;
      writeFileSync(pfad, Buffer.from(data, 'base64'));
      n++;
      console.log(`${theme.padEnd(5)} ${datei.padEnd(16)} ${titel}`);
    }
  }
  console.log(`\n${n} Aufnahmen in ${ZIEL}`);
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error('FEHLER:', e.message); process.exit(1); });
