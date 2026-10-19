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
const PROFIL = new URL('.chromeprofil-gesamt', import.meta.url).pathname;
const PORT = 9336;
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

async function main() {
  mkdirSync(ZIEL, { recursive: true });
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFIL}`,
    '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars'], { stdio: 'ignore' });
  process.on('exit', () => chrome.kill());
  const cdp = await verbinde();
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  cdp.session = sessionId;
  await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: HUELLE });
  // Immer den AKTUELLEN Stand prüfen: Offline-Speicher (Service Worker) und Browser-Cache leeren –
  // sonst prüft man still eine ältere Fassung der App.
  await cdp.send('Network.enable').catch(() => {});
  await cdp.send('Network.clearBrowserCache').catch(() => {});
  await cdp.send('Storage.clearDataForOrigin', { origin: 'http://localhost:8931', storageTypes: 'cache_storage,service_workers' }).catch(() => {});
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true }).catch(() => {});

  const bericht = [];
  for (const g of GERAETE) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: g.width, height: g.height, deviceScaleFactor: g.dpr, mobile: true });
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: 'window.__vw = ' + g.width });
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: g.dunkel ? 'dark' : 'light' }] });
    await cdp.send('Page.navigate', { url: 'about:blank' }); await schlaf(300);   // echtes Neuladen je Gerät
    await cdp.send('Page.navigate', { url: BASIS + '&geraet=' + g.name + '#/dashboard' });
    for (let i = 0; i < 200; i++) { try { if (await cdp.js('return !!window.appReady')) break; } catch (e) {} await schlaf(150); }
    if ((await cdp.js('return (await DB.getAll("voelker")).length')) < 5) await cdp.js('await Demo.reset(); return 1;');
    await cdp.js(`await S.set('darkMode', ${g.dunkel ? "'dark'" : "'light'"}); applyTheme(); await S.set('wizardDone', true, { auto: true }); document.querySelectorAll('#modal-root .modal-back').forEach((m) => m.remove()); return 1;`);
    // Selbstkontrolle: absichtlich eingebaute Fehler MÜSSEN gemeldet werden, sonst taugt die Prüfung nichts
    await schlaf(1500);   // Einblende-Animation der Seite abwarten (sonst gilt alles als unsichtbar)
    const probe = await cdp.js(`document.querySelector('#main').insertAdjacentHTML('beforeend', '<button id="__p1"><svg style="width:200px;height:200px"></svg></button><div id="__p2" style="width:4000px;max-width:none;min-width:4000px">x undefined</div>'); window.__fehler.push('Probe'); const r = await (async () => { ${PRUEFEN} })(); const p2 = document.getElementById('__p2'); r.diag = { rect: JSON.stringify(p2.getBoundingClientRect()), vw: innerWidth, kette: (() => { const k = []; for (let p = p2; p && p !== document.body; p = p.parentElement) { const cs = getComputedStyle(p); k.push(p.tagName + '#' + p.id + '.' + (p.className||'').toString().slice(0,20) + ' op=' + cs.opacity + ' vis=' + cs.visibility + ' ox=' + cs.overflowX); } return k; })() }; document.getElementById('__p1').remove(); p2.remove(); return r;`);
    if (!(probe.riesig.length && (probe.ueber.length || probe.seitlich) && probe.komisch.length && probe.fehler.length)) throw new Error(g.name + ': Selbstkontrolle fehlgeschlagen: ' + JSON.stringify(probe) + ' ' + await cdp.js(`return location.hash + ' ' + document.querySelector('#main').className + ' ' + getComputedStyle(document.querySelector('#main')).opacity + ' modal:' + document.querySelectorAll('#modal-root .modal-back').length`));
    const ids = await cdp.js(`const a = async (s) => ((await DB.getAll(s))[0] || {}).id; return { stand: await a('staende'), volk: (await DB.getAll('voelker')).find((v) => v.status === 'aktiv').id, koenigin: await a('koeniginnen'), rechnung: await a('rechnungen') };`);
    const routen = (await cdp.js('return NAV.filter((n) => n.route).map((n) => n.route)'))
      .concat([`stand/${ids.stand}`, `volk/${ids.volk}`, `koenigin/${ids.koenigin}`, `rechnung/${ids.rechnung}`, `durchsicht/${ids.volk}`]);
    for (const route of routen) {
      await cdp.js(`window.__fehler.length = 0; document.querySelectorAll('#modal-root .modal-back').forEach((m) => m.remove()); location.hash = '#/${route}'; return 1;`);
      await schlaf(900);
      const eintrag = { geraet: g.name, route, schritte: [] };
      eintrag.seite = await cdp.js(PRUEFEN);
      const bild = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 60 });
      writeFileSync(`${ZIEL}/${g.name}__${route.split('/')[0]}.jpg`, Buffer.from(bild.data, 'base64'));
      // Alle Reiter einmal antippen
      const reiter = await cdp.js(`return [...document.querySelectorAll('#main [role="tab"]')].filter((t) => t.offsetParent).map((t) => t.textContent.trim()).slice(0, 12)`);
      for (const r of reiter) {
        await cdp.js(`const t = [...document.querySelectorAll('#main [role="tab"]')].find((x) => x.textContent.trim() === ${JSON.stringify(r)}); if (t) t.click(); return 1;`);
        await schlaf(350);
        const p = await cdp.js(PRUEFEN);
        if (p.fehler.length || p.seitlich || p.ueber.length || p.riesig.length || p.komisch.length) eintrag.schritte.push({ reiter: r, ...p });
      }
      // Den Haupt-„Neu“-Knopf öffnen (Formular), prüfen, schließen
      const neu = await cdp.js(`const b = document.querySelector('#main #add, #main .page-head .btn-primary'); if (!b || !b.offsetParent) return null; const t = b.textContent.trim(); b.click(); return t;`);
      if (neu) {
        await schlaf(600);
        const p = await cdp.js(PRUEFEN);
        if (p.fehler.length || p.ueber.length || p.riesig.length || p.komisch.length || p.modalZuBreit) eintrag.schritte.push({ knopf: neu, ...p });
        await cdp.js(`FormGuard.dirty = false; document.querySelectorAll('#modal-root .modal-back').forEach((m) => m.remove()); return 1;`);
      }
      bericht.push(eintrag);
      const s = eintrag.seite, probleme = s.fehler.length + (s.seitlich ? 1 : 0) + s.ueber.length + s.riesig.length + s.komisch.length + (s.leer ? 1 : 0) + eintrag.schritte.length;
      console.log(`${probleme ? '⚠️ ' : '✓ '} ${g.name.padEnd(20)} ${route.split('/')[0].padEnd(14)} ${probleme ? JSON.stringify({ ...s, schritte: eintrag.schritte }).slice(0, 400) : ''}`);
    }
  }
  writeFileSync(`${ZIEL}/bericht.json`, JSON.stringify(bericht, null, 1));
  const mitProblem = bericht.filter((e) => { const s = e.seite; return s.fehler.length || s.seitlich || s.ueber.length || s.riesig.length || s.komisch.length || s.leer || e.schritte.length; });
  console.log(`\n${bericht.length} Seiten geprüft, ${mitProblem.length} mit Auffälligkeiten. Bericht: ${ZIEL}/bericht.json`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
