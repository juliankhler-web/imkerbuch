/* Gesamtprüfung: öffnet JEDE Seite der App wie in der Store-App (nachgestellte
   App-Hülle, Testmodus aus) auf mehreren Gerätegrößen, klickt alle Reiter und
   die „Neu“-Knöpfe an und meldet:
   – JavaScript-Fehler (auch unbehandelte Promise-Fehler und console.error)
   – Seiten, die seitlich über den Bildschirm hinausragen
   – riesige Symbole (wie der Königin-Pfeil) und Texte wie „undefined“/„NaN“
   – leere Seiten und Fenster, die breiter als der Bildschirm sind
   Dazu ein Bildschirmfoto je Seite und Gerät zum Durchsehen.

   Läuft gegen die TEST-Datenbank (?testdb=1) in einem eigenen Chrome-Profil –
   echte Daten bleiben unberührt. Braucht den lokalen Server auf Port 8931.
   Aufruf: node tools/gesamtpruefung.mjs <zielordner> [--nur=iphone-se,ipad-quer]
*/
import { writeFileSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';

const ZIEL = process.argv[2];
const NUR = ((process.argv.find((a) => a.startsWith('--nur=')) || '').split('=')[1] || '').split(',').filter(Boolean);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PROFIL = new URL('.chromeprofil-studio', import.meta.url).pathname;
const PORT = 9339;
// BASIS=http://localhost:8931/native/www/index.html?testdb=1 prüft die App-Kopie MIT Schutzregel (CSP)
const BASIS = process.env.BASIS || 'http://localhost:8931/index.html?testdb=1';
const schlaf = (ms) => new Promise((r) => setTimeout(r, ms));

const GERAETE = [
  { name: 'iphone-se', width: 375, height: 667, dpr: 2, dunkel: false },
  { name: 'iphone-gross', width: 440, height: 956, dpr: 3, dunkel: false },
  { name: 'iphone-gross-dunkel', width: 440, height: 956, dpr: 3, dunkel: true },
  { name: 'ipad-hoch', width: 1032, height: 1376, dpr: 2, dunkel: false },
  { name: 'ipad-quer', width: 1376, height: 1032, dpr: 2, dunkel: false },
].filter((g) => !NUR.length || NUR.includes(g.name));

/* Nachgestellte App-Hülle (Capacitor) mit Plugins, Store-Modus, Vollversion gekauft. */
const HUELLE = `
  window.__fehler = [];
  addEventListener('error', (e) => window.__fehler.push('Fehler: ' + e.message + ' @' + e.lineno));
  addEventListener('unhandledrejection', (e) => window.__fehler.push('Promise: ' + ((e.reason && (e.reason.message || e.reason)) || '?')));
  document.addEventListener('securitypolicyviolation', (e) => window.__fehler.push('Schutzregel blockiert: ' + e.violatedDirective + ' ' + e.blockedURI));
  const ce = console.error; console.error = (...a) => { window.__fehler.push('console.error: ' + a.map(String).join(' ').slice(0, 200)); ce(...a); };
  window.__ohneTestmodus = true;
  const ok = async () => ({});
  window.Capacitor = { getPlatform: () => 'ios', isNativePlatform: () => true, Plugins: {
    StatusBar: { setStyle: ok, setOverlaysWebView: ok, setBackgroundColor: ok },
    LocalNotifications: { checkPermissions: async () => ({ display: 'granted' }), requestPermissions: async () => ({ display: 'granted' }), addListener() {}, getPending: async () => ({ notifications: [] }), cancel: ok, schedule: ok },
    NativePurchases: { getPurchases: async () => ({ purchases: [{ productIdentifier: 'de.imkerbuch.app.vollversion', purchaseState: '1', purchaseDate: '2026-10-01T00:00:00Z' }] }),
      getProducts: async () => ({ products: [{ identifier: 'de.imkerbuch.app.vollversion', priceString: '14,99 €' }, { identifier: 'de.imkerbuch.app.testphase30', priceString: '0,00 €' }] }),
      restorePurchases: ok, purchaseProduct: ok, presentOfferCodeRedeemSheet: ok, addListener() {} },
    InAppReview: { requestReview: ok }, Share: { share: ok }, Filesystem: { writeFile: async () => ({ uri: 'file:///x' }), deleteFile: ok },
    App: { addListener() {}, minimizeApp: ok },
  } };
`;

/* Prüfung der aktuell sichtbaren Seite – läuft im Browser. */
const PRUEFEN = `
  // Gerätebreite fest vorgeben: Im iPad-Quer-Format zieht der Browser sonst sein Fenster auf zu breiten Inhalt auf
  const vw = window.__vw || innerWidth, main = document.querySelector('#main');
  // Nur Scroll-Bereiche INNERHALB der Seite zählen (Tabellen, Reiterleisten) – nicht der Seiten-Rahmen selbst
  const scrollbar = (el) => { for (let p = el.parentElement; p && p !== document.body && p !== main && p.id !== 'modal-root'; p = p.parentElement) { const cs = getComputedStyle(p), o = cs.overflowX; if (o === 'auto' || o === 'scroll' || cs.textOverflow === 'ellipsis') return true; } return false; };
  const ueber = [];
  for (const el of document.querySelectorAll('#main *, #modal-root .modal *')) {
    const r = el.getBoundingClientRect();
    if (!r.width || getComputedStyle(el).position === 'fixed') continue;
    let unsichtbar = false; for (let p = el; p && p !== document.body; p = p.parentElement) { const cs = getComputedStyle(p); if (cs.opacity === '0' || cs.visibility === 'hidden' || cs.display === 'none') { unsichtbar = true; break; } }
    if (unsichtbar) continue;
    if (r.right > vw + 2 || r.left < -2) { if (!scrollbar(el)) { const k = (el.getAttribute('class') || '').slice(0, 30); const eltern = el.closest('[class]:not(svg *)'); ueber.push(((el.closest('.row, .card') || {}).innerText || '').split('\\n')[0].slice(0, 30) + ' | ' + el.tagName.toLowerCase() + (k ? '.' + k : '') + ' in ' + ((eltern && eltern !== el ? (eltern.getAttribute('class') || '').slice(0, 30) : '') || '?') + ' (' + Math.round(r.left) + '–' + Math.round(r.right) + ')'); } }
  }
  const riesig = [...document.querySelectorAll('#main svg, #modal-root svg')].filter((s) => {
    const r = s.getBoundingClientRect(); if (r.width < 60 && r.height < 60) return false;
    return !!s.closest('button, a, .kpill, .row, .chip, .btn, .card-title, .r-ic, .hilfe-ic');
  }).map((s) => (s.getAttribute('class') || 'svg') + ' ' + Math.round(s.getBoundingClientRect().width) + 'px');
  const text = (main ? main.innerText : '') + ' ' + [...document.querySelectorAll('#modal-root .modal')].map((m) => m.innerText).join(' ');
  const komisch = (text.match(/\\bundefined\\b|\\bNaN\\b|\\[object Object\\]|Invalid Date/g) || []);
  const modal = [...document.querySelectorAll('#modal-root .modal')].pop();
  return {
    fehler: window.__fehler.splice(0),
    seitlich: document.documentElement.scrollWidth > vw + 2,
    ueber: [...new Set(ueber)].slice(0, 6),
    riesig: [...new Set(riesig)].slice(0, 6),
    komisch: [...new Set(komisch)],
    leer: !main || main.innerText.trim().length < 15,
    modalZuBreit: modal ? modal.getBoundingClientRect().width > vw + 2 : false,
  };
`;

class Cdp {
  constructor(ws) { this.ws = ws; this.id = 0; this.warten = new Map(); this.session = null;
    ws.addEventListener('message', (e) => { const m = JSON.parse(e.data);
      // Browser-Dialoge („Seite verlassen?“, alert, confirm) blockieren sonst die Prüfung → bestätigen und merken
      if (m.method === 'Page.javascriptDialogOpening') { this.dialoge = (this.dialoge || 0) + 1; this.send('Page.handleJavaScriptDialog', { accept: true }, m.sessionId).catch(() => {}); }
      const w = this.warten.get(m.id);
      if (w) { this.warten.delete(m.id); m.error ? w.rej(new Error(m.error.message)) : w.res(m.result); } }); }
  send(method, params = {}, session = this.session) {
    const id = ++this.id;
    return new Promise((res, rej) => { this.warten.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params, ...(session ? { sessionId: session } : {}) }));
      setTimeout(() => { if (this.warten.delete(id)) rej(new Error('Zeitüberschreitung: ' + method)); }, 60000); });
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



/* Store-Bilder, Schritt 2: store-bilder/studio.html (Panorama 3 × 1320 × 2868) fotografieren
   und in Einzelbilder schneiden → store-bilder/iphone/0N[-dunkel].png (Apple 6,9″: 1320×2868). */
async function main() {
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFIL}`,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--force-color-profile=srgb'], { stdio: 'ignore' });
  process.on('exit', () => chrome.kill());
  const cdp = await verbinde();
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  cdp.session = sessionId;
  await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 3960, height: 2868, deviceScaleFactor: 1, mobile: false });
  const ziel = new URL('../store-bilder/iphone/', import.meta.url).pathname;
  mkdirSync(ziel, { recursive: true });
  for (const thema of ['hell', 'dunkel']) {
    await cdp.send('Page.navigate', { url: `http://localhost:8931/store-bilder/studio.html${thema === 'dunkel' ? '?app=dunkel' : ''}` });
    for (let i = 0; i < 100; i++) { try { if (await cdp.js(`return document.readyState === 'complete' && [...document.images].every((b) => b.complete && b.naturalWidth)`)) break; } catch (e) {} await schlaf(150); }
    await schlaf(800);
    for (let n = 0; n < 3; n++) {
      const bild = await cdp.send('Page.captureScreenshot', { format: 'png', clip: { x: n * 1320, y: 0, width: 1320, height: 2868, scale: 1 } });
      writeFileSync(`${ziel}0${n + 1}${thema === 'dunkel' ? '-dunkel' : ''}.png`, Buffer.from(bild.data, 'base64'));
    }
    const pano = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
    writeFileSync(`${ziel}panorama${thema === 'dunkel' ? '-dunkel' : ''}.jpg`, Buffer.from(pano.data, 'base64'));
    console.log('✓', thema);
  }
  console.log('FERTIG'); process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
