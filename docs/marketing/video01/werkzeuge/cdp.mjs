/* Gemeinsame Bausteine für die Bildschirmaufnahmen zu Erklärvideo Folge 1.
   Startet ein eigenes, kopfloses Chrome (eigenes Profil im tmp-Ordner), öffnet die App
   wie in der Store-App (nachgestellte App-Hülle aus tools/store-aufnahmen.mjs, Vollversion,
   Testmodus aus) gegen die TEST-Datenbank (?testdb=1) und lädt die Beispieldaten.
   Echte Daten werden nie angefasst. Braucht den lokalen Server auf Port 8931. */
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

export const TMP = '/private/tmp/claude-501/video01-tmp';
export const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export const BASIS = process.env.BASIS || 'http://localhost:8931/index.html?testdb=1';
export const schlaf = (ms) => new Promise((r) => setTimeout(r, ms));

/* Bildschirm: großes iPhone (440 × 956 pt, 3-fach = 1320 × 2868 px), oben 54 pt Statusleiste, unten 34 pt Home-Balken */
export const GERAET = { width: 440, height: 956, dpr: 3, oben: 54, unten: 34 };

/* Nachgestellte App-Hülle (Capacitor) – wie tools/store-aufnahmen.mjs */
export const HUELLE = `
  /* Zeitlupe für die Aufnahme: __zeitFaktor(0.25) lässt Uhr, Zeitgeber und Bildaufbau-Takt der Seite viermal langsamer laufen */
  (() => {
    const rNow = performance.now.bind(performance), oST = setTimeout, oSI = setInterval, oRAF = requestAnimationFrame, dNow = Date.now.bind(Date);
    let bR = rNow(), bV = bR, f = 1; const dBasis = dNow() - rNow();
    const vNow = () => bV + (rNow() - bR) * f;
    window.__zeitFaktor = (nf) => { bV = vNow(); bR = rNow(); f = nf; };
    performance.now = vNow;
    Date.now = () => Math.round(dBasis + vNow());
    window.setTimeout = (fn, ms = 0, ...a) => oST(fn, (Number(ms) || 0) / f, ...a);
    window.setInterval = (fn, ms = 0, ...a) => oSI(fn, (Number(ms) || 0) / f, ...a);
    window.requestAnimationFrame = (cb) => oRAF(() => cb(vNow()));
  })();
  window.__fehler = [];
  addEventListener('error', (e) => window.__fehler.push('Fehler: ' + e.message + ' @' + e.lineno));
  addEventListener('unhandledrejection', (e) => window.__fehler.push('Promise: ' + ((e.reason && (e.reason.message || e.reason)) || '?')));
  window.__ohneTestmodus = true; window.__ohneDemoHinweis = true;
  const ok = async () => ({});
  window.Capacitor = { getPlatform: () => 'ios', isNativePlatform: () => true, Plugins: {
    StatusBar: { setStyle: ok, setOverlaysWebView: ok, setBackgroundColor: ok },
    LocalNotifications: { checkPermissions: async () => ({ display: 'granted' }), requestPermissions: async () => ({ display: 'granted' }), addListener() {}, getPending: async () => ({ notifications: [] }), cancel: ok, schedule: ok },
    NativePurchases: { getPurchases: async () => ({ purchases: [{ productIdentifier: 'de.imkerbuch.app.vollversion', purchaseState: '1', purchaseDate: '2026-10-01T00:00:00Z' }] }),
      getProducts: async () => ({ products: [{ identifier: 'de.imkerbuch.app.vollversion', priceString: '' }, { identifier: 'de.imkerbuch.app.testphase30', priceString: '' }] }),
      restorePurchases: ok, purchaseProduct: ok, presentOfferCodeRedeemSheet: ok, addListener() {} },
    InAppReview: { requestReview: ok }, Share: { share: ok }, Filesystem: { writeFile: async () => ({ uri: 'file:///x' }), deleteFile: ok },
    App: { addListener() {}, minimizeApp: ok },
  } };
  /* Statusleiste (9:41, Empfang, WLAN, Akku) und Finger-Punkt für die Aufnahme */
  addEventListener('DOMContentLoaded', () => {
    const st = document.createElement('style');
    st.textContent = \`#__sb{position:fixed;left:0;right:0;top:0;height:54px;z-index:2147483646;pointer-events:none;display:flex;align-items:center;justify-content:space-between;padding:6px 34px 0 52px;box-sizing:border-box;font:600 17px -apple-system,'SF Pro Text',system-ui,sans-serif;color:#000;letter-spacing:-.2px}
      #__sb svg{display:block} #__sb .r{display:flex;gap:7px;align-items:center}
      .__tap{position:fixed;z-index:2147483647;pointer-events:none;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(40,40,40,.28);border:2px solid rgba(255,255,255,.85);box-shadow:0 0 0 1px rgba(0,0,0,.15);transform:scale(.6);opacity:0;transition:transform .18s ease-out,opacity .18s ease-out}
      .__tap.an{transform:scale(1);opacity:1} .__tap.weg{transform:scale(1.35);opacity:0;transition:transform .35s ease-out,opacity .35s ease-out}\`;
    document.head.appendChild(st);
    const sb = document.createElement('div'); sb.id = '__sb';
    sb.innerHTML = '<span>9:41</span><span class="r">'
      + '<svg width="19" height="12" viewBox="0 0 19 12"><rect x="0" y="8" width="3.2" height="4" rx="1" fill="currentColor"/><rect x="5" y="5.5" width="3.2" height="6.5" rx="1" fill="currentColor"/><rect x="10" y="3" width="3.2" height="9" rx="1" fill="currentColor"/><rect x="15" y="0" width="3.2" height="12" rx="1" fill="currentColor"/></svg>'
      + '<svg width="17" height="12" viewBox="0 0 17 12"><path d="M8.5 2.3c2.4 0 4.6.9 6.3 2.5l1.2-1.2C14 1.7 11.4.6 8.5.6S3 1.7 1 3.6l1.2 1.2C3.9 3.2 6.1 2.3 8.5 2.3zm0 3.4c1.5 0 2.8.5 3.9 1.5l1.2-1.2c-1.4-1.3-3.2-2-5.1-2s-3.7.7-5.1 2l1.2 1.2c1.1-1 2.4-1.5 3.9-1.5zm0 3.4c.6 0 1.1.2 1.5.6L8.5 11.2 7 9.7c.4-.4.9-.6 1.5-.6z" fill="currentColor"/></svg>'
      + '<svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2.2" fill="currentColor"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" fill="currentColor" opacity=".45"/></svg>'
      + '</span>';
    document.body.appendChild(sb);
  });
  window.__tippen = (x, y) => { const d = document.createElement('div'); d.className = '__tap'; d.style.left = x + 'px'; d.style.top = y + 'px'; document.body.appendChild(d);
    requestAnimationFrame(() => d.classList.add('an')); setTimeout(() => d.classList.add('weg'), 260); setTimeout(() => d.remove(), 700); };
`;

export class Cdp {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.warten = new Map(); this.session = null; this.horcher = [];
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.method === 'Page.javascriptDialogOpening') this.send('Page.handleJavaScriptDialog', { accept: true }, m.sessionId).catch(() => {});
      if (m.method) for (const h of this.horcher) h(m);
      const w = this.warten.get(m.id);
      if (w) { this.warten.delete(m.id); m.error ? w.rej(new Error(m.error.message)) : w.res(m.result); }
    });
  }
  send(method, params = {}, session = this.session) {
    const id = ++this.id;
    return new Promise((res, rej) => {
      this.warten.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params, ...(session ? { sessionId: session } : {}) }));
      setTimeout(() => { if (this.warten.delete(id)) rej(new Error('Zeitüberschreitung: ' + method)); }, 60000);
    });
  }
  async js(code) {
    const r = await this.send('Runtime.evaluate', { expression: `(async()=>{${code}})()`, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + ((r.exceptionDetails.exception || {}).description || ''));
    return r.result.value;
  }
}

export async function chromeStarten(port) {
  const profil = `${TMP}/chromeprofil-${port}`;
  mkdirSync(profil, { recursive: true });
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profil}`,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio', '--lang=de-DE'], { stdio: 'ignore' });
  process.on('exit', () => chrome.kill());
  for (let i = 0; i < 80; i++) {
    try {
      const v = await fetch(`http://127.0.0.1:${port}/json/version`).then((r) => r.json());
      const ws = new WebSocket(v.webSocketDebuggerUrl);
      await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
      const cdp = new Cdp(ws); cdp.chrome = chrome; return cdp;
    } catch (e) { await schlaf(300); }
  }
  throw new Error('Chrome antwortet nicht');
}

/* Neue Seite mit Gerät, App-Hülle, Beispieldaten (frisch) und erfundener Imkerei */
export async function appOeffnen(cdp) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  cdp.session = sessionId;
  await cdp.send('Page.enable');
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: HUELLE });
  await cdp.send('Network.enable').catch(() => {});
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true }).catch(() => {});
  await cdp.send('Storage.clearDataForOrigin', { origin: 'http://localhost:8931', storageTypes: 'cache_storage,service_workers' }).catch(() => {});
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: GERAET.width, height: GERAET.height, deviceScaleFactor: GERAET.dpr, mobile: true });
  await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: GERAET.oben, bottom: GERAET.unten, left: 0, right: 0 } }).catch((e) => console.warn('Sicherheitsabstand nicht nachgestellt:', e.message));
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }).catch(() => {});
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  await cdp.send('Page.navigate', { url: BASIS + '#/dashboard' });
  for (let i = 0; i < 200; i++) { try { if (await cdp.js('return !!window.appReady')) break; } catch (e) {} await schlaf(150); }
  if (!(await cdp.js('return typeof TEST_MODE !== "undefined" && TEST_MODE'))) throw new Error('Nicht in der Test-Datenbank – Abbruch');
  await cdp.js('await Demo.reset(); return 1;');
  await cdp.js(`await S.set('darkMode', 'hell'); applyTheme(); await S.set('wizardDone', true, { auto: true }); await S.set('letzteExterneSicherung', new Date().toISOString(), { auto: true }); document.querySelectorAll('#modal-root .modal-back').forEach((m) => m.remove()); return 1;`);
  await cdp.js(`const i = S.get('imkerei'); Object.assign(i, { name: 'Imkerei Sonnenhang', strasse: 'Musterweg 1', plz: '12345', ort: 'Musterstadt', registriernummer: '00 000 000 0000' }); await S.set('imkerei', i); return 1;`);
  return cdp;
}
