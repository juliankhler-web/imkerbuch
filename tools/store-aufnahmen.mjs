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
const PROFIL = new URL('.chromeprofil-store', import.meta.url).pathname;
const PORT = 9338;
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


/* Store-Bilder, Schritt 1: echte Bildschirmfotos der aktuellen App (Store-Modus, Beispieldaten)
   für ein 6,9″-iPhone (440×902 pt unter der 54-pt-Statusleiste, 3-fach = 1320×2706 px; Statusleiste zeichnet das Studio). Ergebnis: <ziel>/<name>.png */
const DUNKEL = process.argv.includes('--dunkel');
const AUFNAHMEN = [
  { name: 'dashboard', route: 'dashboard' },
  { name: 'durchsicht', route: 'durchsicht/{volk}', schritt: `
      for (let i = 0; i < 3; i++) { const w = [...document.querySelectorAll('#main button')].find((b) => /weiter|ja|stark|ruhig/i.test(b.textContent) && b.offsetParent); if (!w) break; w.click(); await new Promise((r) => setTimeout(r, 500)); }` },
  { name: 'volk', route: 'volk/{volk}' },
  { name: 'voelker', route: 'voelker' },
  { name: 'honig', route: 'honig' },
  { name: 'assistent', route: 'assistent' },
  { name: 'behandlungen', route: 'behandlungen' },
  // Startseite selbst zusammenstellen (Julian: hervorheben) – das Fenster bleibt offen
  { name: 'dash-anpassen', route: 'dashboard', behalten: true, schritt: `document.querySelector('#dash-cfg').click(); await new Promise((r) => setTimeout(r, 1200));` },
  { name: 'kassenbuch', route: 'kassenbuch', schritt: `
      const t = [...document.querySelectorAll('#main button')].find((b) => /^Auswertung$/.test(b.textContent.trim())); if (t) t.click(); await new Promise((r) => setTimeout(r, 900));` },
  { name: 'rechnung', route: 'rechnung/{rechnung}' },
  // Echte PDFs der App: erste Seite als Bild (für die Store-Bilder „fertig als PDF“)
  { name: 'pdf-bestandsbuch', pdf: 'Pdf.bestandsbuch()' },
  { name: 'pdf-rechnung', pdf: 'Pdf.rechnung("{rechnung}")' },
];
const IPAD = process.argv.includes('--ipad');
async function main() {
  mkdirSync(ZIEL, { recursive: true });
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFIL}`,
    '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars'], { stdio: 'ignore' });
  process.on('exit', () => chrome.kill());
  const cdp = await verbinde();
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  cdp.session = sessionId;
  await cdp.send('Page.enable');
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: HUELLE + ';window.__ohneDemoHinweis = true;' });
  await cdp.send('Network.enable').catch(() => {});
  await cdp.send('Network.clearBrowserCache').catch(() => {});
  await cdp.send('Storage.clearDataForOrigin', { origin: 'http://localhost:8931', storageTypes: 'cache_storage,service_workers' }).catch(() => {});
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true }).catch(() => {});
  // iPad 13″ quer: 1376×1032 pt, minus 24 pt Statusleiste, 2-fach = 2752×2016 px
  await cdp.send('Emulation.setDeviceMetricsOverride', IPAD ? { width: 1376, height: 1008, deviceScaleFactor: 2, mobile: true } : { width: 440, height: 902, deviceScaleFactor: 3, mobile: true });
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: DUNKEL ? 'dark' : 'light' }] });
  await cdp.send('Page.navigate', { url: BASIS + '#/dashboard' });
  for (let i = 0; i < 200; i++) { try { if (await cdp.js('return !!window.appReady')) break; } catch (e) {} await schlaf(150); }
  await cdp.js('await Demo.reset(); return 1;');
  await cdp.js(`await S.set('darkMode', '${DUNKEL ? 'dunkel' : 'hell'}'); applyTheme(); await S.set('wizardDone', true, { auto: true }); await S.set('letzteExterneSicherung', new Date().toISOString(), { auto: true }); document.querySelectorAll('#modal-root .modal-back').forEach((m) => m.remove()); return 1;`);
  // Erfundene Beispiel-Imkerei für Briefkopf und Bestandsbuch (keine echten Personendaten)
  await cdp.js(`const i = S.get('imkerei'); Object.assign(i, { name: 'Imkerei Sonnenhang', strasse: 'Lindenweg 3', plz: '34123', ort: 'Kassel', registriernummer: '06 611 000 0001' }); await S.set('imkerei', i); return 1;`);
  // Aufgaben passend zur Jahreszeit (die Beispieldaten enthalten Zucht-Aufgaben, die im Store ausgeblendet sind)
  await cdp.js(`const alle = await DB.getAll('aufgaben'); for (const x of alle) await DB.del('aufgaben', x.id);
    const tag = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
    const neu = [['Varroa-Kontrolle alle Völker', 1], ['Futterkontrolle Heimstand', 3], ['Mäusegitter anbringen', 6], ['Honig abfüllen – Linde', 9]];
    for (const [titel, n] of neu) await DB.put('aufgaben', { id: crypto.randomUUID(), titel, faellig: tag(n), erledigt: false });
    return 1;`);
  const volk = await cdp.js(`return (await DB.getAll('voelker')).find((v) => v.status === 'aktiv').id`);
  const rechnung = await cdp.js(`const r = (await DB.getAll('rechnungen')).find((x) => x.status === 'festgeschrieben') || (await DB.getAll('rechnungen'))[0]; return r ? r.id : ''`);
  const endung = `${DUNKEL ? '-dunkel' : ''}${IPAD ? '-ipad' : ''}`;
  for (const a of AUFNAHMEN.filter((x) => !NUR.length || NUR.includes(x.name)).filter((x) => !(IPAD && x.pdf))) {
    if (a.pdf) {
      // PDF erzeugen, abfangen und Seite 1 mit dem eingebauten PDF-Leser in ein Bild verwandeln
      const bild = await cdp.js(`window.__pdf = null; const alt = Pdf.ausgeben; Pdf.ausgeben = async (doc) => { window.__pdf = doc.output('arraybuffer'); };
        try { await ${a.pdf.replace('{rechnung}', rechnung)}; } finally { Pdf.ausgeben = alt; }
        await U.loadScript(...CDN.pdfjs);
        const pdf = await pdfjsLib.getDocument({ data: window.__pdf, isEvalSupported: false }).promise;
        const seite = await pdf.getPage(1), vp = seite.getViewport({ scale: 4 });
        const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
        await seite.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
        return c.toDataURL('image/png').split(',')[1];`);
      writeFileSync(`${ZIEL}/${a.name}.png`, Buffer.from(bild, 'base64'));
      console.log('✓', a.name); continue;
    }
    await cdp.js(`document.querySelectorAll('#modal-root .modal-back, .toast').forEach((m) => m.remove()); location.hash = '#/${a.route.replace('{volk}', volk).replace('{rechnung}', rechnung)}'; await new Promise((r) => setTimeout(r, 300)); renderRoute(); return 1;`);
    await schlaf(1500);
    if (a.schritt) { await cdp.js(a.schritt + '; return 1;'); await schlaf(800); }
    await cdp.js(`document.querySelectorAll('.toast${a.behalten ? '' : ', #modal-root .modal-back'}').forEach((m) => m.remove()); scrollTo(0, 0); return 1;`);
    await schlaf(400);
    const bild = await cdp.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(`${ZIEL}/${a.name}${endung}.png`, Buffer.from(bild.data, 'base64'));
    console.log('✓', a.name);
  }
  console.log('FERTIG');
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
