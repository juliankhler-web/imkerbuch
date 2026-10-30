/* Variante B: frische Bildschirmfotos der aktuellen App – nur Beispieldaten.
   Wegwerf-Profil im Scratchpad, eigener Port. Julians echte Daten werden nie berührt.

   node app-shots.mjs <zielordner> [--neu] [--nur=name1,name2] [--format=png|webp]
   --neu : Profil löschen, Willkommens-Dialog durchklicken („Imkerei Sonnenwiese“, Demo-Daten laden)
*/
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';

const ZIEL = process.argv[2];
const NEU = process.argv.includes('--neu');
const NUR = ((process.argv.find((a) => a.startsWith('--nur=')) || '').split('=')[1] || '').split(',').filter(Boolean);
const FORMAT = ((process.argv.find((a) => a.startsWith('--format=')) || '').split('=')[1]) || 'png';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PROFIL = process.env.PROFIL || '/tmp/imkerbuch-app-shots-profil';   // Wegwerf-Profil, nie Julians Daten
const PORT = 9581;
const APP = 'file:///Users/juliankoehler/ImkerApp/index.html';
const B = 390, H = 844, DPR = 2;
const schlaf = (ms) => new Promise((r) => setTimeout(r, ms));

/* Nachgestellte App-Hülle wie tools/store-aufnahmen.mjs: Store-Modus, Testmodus aus, Vollversion gekauft */
const HUELLE = `
  window.__fehler = [];
  addEventListener('error', (e) => window.__fehler.push('Fehler: ' + e.message + ' @' + e.lineno));
  addEventListener('unhandledrejection', (e) => window.__fehler.push('Promise: ' + ((e.reason && (e.reason.message || e.reason)) || '?')));
  window.__ohneTestmodus = true; window.__ohneDemoHinweis = true;
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

class Cdp {
  constructor(ws) { this.ws = ws; this.id = 0; this.warten = new Map(); this.session = null;
    ws.addEventListener('message', (e) => { const m = JSON.parse(e.data);
      if (m.method === 'Page.javascriptDialogOpening') this.send('Page.handleJavaScriptDialog', { accept: true }, m.sessionId).catch(() => {});
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
  for (let i = 0; i < 80; i++) {
    try {
      const v = await fetch(`http://127.0.0.1:${PORT}/json/version`).then((r) => r.json());
      const ws = new WebSocket(v.webSocketDebuggerUrl);
      await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
      return new Cdp(ws);
    } catch (e) { await schlaf(250); }
  }
  throw new Error('Chrome antwortet nicht');
}

/* Hilfen im Seitenkontext */
const HILF = `
  const warte = (ms) => new Promise((r) => setTimeout(r, ms));
  const sichtbar = (el) => !!(el && el.offsetParent !== null);
  const zu = (re, off = 70, n = 0) => { const els = [...document.querySelectorAll('#main *')].filter((e) => e.children.length < 3 && re.test((e.textContent || '').trim()) && sichtbar(e)); const el = els[n] || els[0]; if (el) scrollTo(0, el.getBoundingClientRect().top + scrollY - off); return !!el; };
  const klick = (re, sel = 'button, a, [role=tab], .tab, .chip, label') => {
    const el = [...document.querySelectorAll(sel)].find((b) => sichtbar(b) && re.test((b.textContent || '').trim()));
    if (el) el.click(); return !!el; };
`;

/* Aufnahmen: route, optional schritt (JS), scrollen auf Element */
const AUFNAHMEN = [
  { name: 'dashboard', route: 'dashboard' },
  { name: 'durchsicht', route: 'durchsicht/{volk}' },
  { name: 'durchsicht-2', route: 'durchsicht/{volk}', schritt: `
      for (let i = 0; i < 2; i++) { const w = [...document.querySelectorAll('#main button')].find((b) => /stark|mittel|gut|ruhig|ja/i.test(b.textContent) && sichtbar(b)); if (!w) break; w.click(); await warte(600); }` },
  { name: 'staende', route: 'staende' },
  { name: 'stand', route: 'stand/{stand}' },
  { name: 'voelker', route: 'voelker' },
  { name: 'volk', route: 'volk/{volk}' },
  { name: 'volk-varroa', route: 'volk/{volk}', schritt: `klick(/^Varroa/); await warte(800);` },
  { name: 'volk-gewicht', route: 'volk/{volk}', schritt: `klick(/^Gewicht/); await warte(800);` },
  { name: 'koeniginnen', route: 'koeniginnen' },
  { name: 'koenigin', route: 'koenigin/{koenigin}' },
  { name: 'koenigin-stammbaum', route: 'koenigin/{koenigin}', schritt: `klick(/^Stammbaum/); await warte(800);` },
  { name: 'behandlungen', route: 'behandlungen' },
  { name: 'fuetterung', route: 'fuetterung' },
  { name: 'trachten', route: 'trachten' },
  { name: 'honig', route: 'honig' },
  { name: 'honig-bestand', route: 'honig', schritt: `klick(/^Bestand/); await warte(800);` },
  { name: 'honig-chargen', route: 'honig', schritt: `klick(/^Chargen/); await warte(800);` },
  { name: 'markt', route: 'markt' },
  { name: 'kassenbuch', route: 'kassenbuch' },
  { name: 'kassenbuch-auswertung', route: 'kassenbuch', schritt: `klick(/^Auswertung$/); await warte(900);` },
  { name: 'rechnungen', route: 'rechnungen' },
  { name: 'aufgaben', route: 'aufgaben' },
  { name: 'aufgaben-kalender', route: 'aufgaben', schritt: `klick(/^Kalender$/); await warte(800);` },
  { name: 'zeiten', route: 'zeiten' },
  { name: 'fahrten', route: 'fahrten' },
  { name: 'meldungen', route: 'meldungen' },
  { name: 'reporting', route: 'reporting' },
  { name: 'rechner', route: 'rechner' },
  { name: 'bio', route: 'bio' },
  { name: 'hygiene', route: 'hygiene' },
  { name: 'assistent', route: 'assistent' },
  { name: 'material', route: 'material' },
  { name: 'wanderungen', route: 'wanderungen' },
  // --- Endgültige Bilder für Variante B ---
  { name: 'b-01-bienenstand', route: 'durchsicht/{anna}' },
  { name: 'b-02-voelker-koeniginnen', route: 'koenigin/{kg2}' },
  { name: 'b-03-gesundheit', route: 'volk/{anna}', schritt: `klick(/^Varroa$/); await warte(900);`, scroll: `zu(/^Varroa-Kontrolle$/, 150)` },
  { name: 'b-04-wetter-tracht', route: 'trachten' },
  { name: 'b-05-honig', route: 'honig', schritt: `klick(/^Bestand$/); await warte(900);` },
  { name: 'b-06-verkauf', route: 'kassenbuch', schritt: `klick(/^Auswertung$/); await warte(900);` },
  { name: 'b-07-aufgaben', route: 'aufgaben' },
  { name: 'b-08-unterlagen', route: 'meldungen' },
  { name: 'b-09-bio-hygiene', route: 'hygiene', schritt: `const b = document.querySelector('[data-plan-vorschlag]'); if (b) b.click(); await warte(1200);`, scroll: `zu(/^Hygieneplan$/, 70, 1)` },
  { name: 'b-10-imme', route: 'assistent', mitImme: true, schritt: `const i = document.querySelector('#bini-in'); i.value = 'Wie sichere ich meine Daten?'; document.querySelector('#bini-form').requestSubmit(); await warte(1800);`, scroll: `const b = [...document.querySelectorAll('#bini-chat > *')].pop(); if (b) scrollTo(0, b.getBoundingClientRect().bottom + scrollY - innerHeight + 150)` },
  // --- Runde 3 ---
  { name: 'durchsicht-anna', route: 'durchsicht/{anna}' },
  { name: 'anna-varroa2', route: 'volk/{anna}', schritt: `klick(/^Varroa$/); await warte(900);`, scroll: `zu(/^Varroa-Kontrolle$/, 150)` },
  { name: 'kg2-tabs', route: 'koenigin/{kg2}', scroll: `zu(/^Übersicht$/, 74)` },
  { name: 'imme-antwort', route: 'assistent', mitImme: true, schritt: `const i = document.querySelector('#bini-in'); i.value = 'Wie sichere ich meine Daten?'; document.querySelector('#bini-form').requestSubmit(); await warte(1800);`, scroll: `const b = [...document.querySelectorAll('#bini-chat > *')].pop(); if (b) scrollTo(0, b.getBoundingClientRect().top + scrollY - 300)` },
  // --- Runde 2 ---
  { name: 'anna', route: 'volk/{anna}', scroll: `zu(/^Durchsichten/, 64)` },
  { name: 'anna-varroa', route: 'volk/{anna}', schritt: `klick(/^Varroa$/); await warte(900);`, scroll: `zu(/^Varroa-Kontrolle/, 64)` },
  { name: 'anna-gewicht', route: 'volk/{anna}', schritt: `klick(/^Gewicht$/); await warte(900);`, scroll: `zu(/^Gewichtsverlauf/, 64)` },
  { name: 'kg2', route: 'koenigin/{kg2}' },
  { name: 'kg2-unten', route: 'koenigin/{kg2}', scroll: `zu(/^Kennung$/, 70)` },
  { name: 'kg2-stammbaum', route: 'koenigin/{kg2}', schritt: `klick(/^Stammbaum$/); await warte(900);`, scroll: `zu(/^Mutterlinie$/, 90)` },
  { name: 'kg2-bewertung', route: 'koenigin/{kg2}', schritt: `klick(/^Bewertung$/); await warte(900);`, scroll: `zu(/^Bewertung$/, 70, 1)` },
  { name: 'rechnung', route: 'rechnung/{rechnung}' },
  { name: 'aufgaben-sauber', route: 'aufgaben' },
  { name: 'hygiene-plan', route: 'hygiene', schritt: `const b = document.querySelector('[data-plan-vorschlag]'); if (b) b.click(); await warte(1200); klick(/^(Übernehmen|Speichern|Ja)/); await warte(1200);`, scroll: `zu(/^Hygieneplan$/, 70, 1)` },
  { name: 'bio-partner', route: 'bio', schritt: `klick(/^Partner$/); await warte(900);` },
  { name: 'bio-standorte', route: 'bio', schritt: `klick(/^Standorte$/); await warte(900);` },
  { name: 'bio-vorsorge', route: 'bio', schritt: `klick(/^Vorsorge$/); await warte(900);` },
  { name: 'imme-frage', route: 'assistent', mitImme: true, schritt: `klick(/^Wie sichere ich meine Daten\?$/); await warte(1500);`, scroll: `scrollTo(0, document.documentElement.scrollHeight)` },
  { name: 'reporting-unten', route: 'reporting', scroll: `zu(/^Auffällig$/, 70)` },
  { name: 'dashboard-unten', route: 'dashboard', mitImme: true, scroll: `scrollTo(0, 560)` },
  { name: 'zeiten-kreis', route: 'zeiten', scroll: `zu(/^Stunden \d{4}$/, 70)` },
  { name: 'kassenbuch-kat', route: 'kassenbuch', schritt: `klick(/^Auswertung$/); await warte(900);`, scroll: `scrollTo(0, 200)` },
  { name: 'staende-stand-unten', route: 'stand/{stand}', scroll: `zu(/^Völker an diesem Stand/, 70)` },
];

async function main() {
  mkdirSync(ZIEL, { recursive: true });
  if (NEU && existsSync(PROFIL)) rmSync(PROFIL, { recursive: true, force: true });
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFIL}`,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--allow-file-access-from-files',
    '--disable-background-networking', '--lang=de-DE'], { stdio: 'ignore' });
  process.on('exit', () => { try { chrome.kill(); } catch (e) {} });
  const cdp = await verbinde();
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  cdp.session = sessionId;
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: B, height: H, deviceScaleFactor: DPR, mobile: true });
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }, { name: 'prefers-reduced-motion', value: 'reduce' }] });
  const bereit = async () => { for (let i = 0; i < 200; i++) { try { if (await cdp.js('return !!window.appReady')) return true; } catch (e) {} await schlaf(150); } return false; };

  if (NEU) {
    // 1) Erster Start im Testmodus: Willkommens-Dialog ausfüllen und Demo-Daten laden
    await cdp.send('Page.navigate', { url: APP + '?testmodus=1' });
    await bereit();
    await schlaf(1200);
    const r = await cdp.js(HILF + `
      for (let i = 0; i < 40 && !document.querySelector('#wz-imkerei'); i++) await warte(200);
      const imk = document.querySelector('#wz-imkerei'); if (!imk) return 'kein Willkommens-Dialog';
      imk.value = 'Imkerei Sonnenwiese';
      for (let i = 0; i < 3; i++) { document.querySelector('#wz-next').click(); await warte(300); }
      const demo = document.querySelector('#wz-demo'); if (!demo) return 'kein Demo-Knopf';
      demo.click();
      for (let i = 0; i < 100 && !S.get('wizardDone'); i++) await warte(200);
      await warte(1500);
      return 'ok: ' + (await DB.getAll('voelker')).length + ' Völker, Imkerei: ' + S.get('imkerei').name;`);
    console.log('Willkommens-Dialog:', r);
    // Testmodus-Merker wieder entfernen
    await cdp.send('Page.navigate', { url: APP + '?testmodus=0' });
    await bereit(); await schlaf(800);
  }

  // 2) Store-Modus (nachgestellte App-Hülle), Vollversion
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: HUELLE });
  await cdp.send('Page.navigate', { url: APP + '#/dashboard' });
  await bereit(); await schlaf(1500);
  console.log('Modus:', await cdp.js(`return JSON.stringify({ native: IST_NATIVE_APP, testmodus: Testmodus.an(), zucht: ZUCHT_AN, lizenzAktiv: Lizenz.aktiv(), status: Lizenz.status && Lizenz.status(), version: APP_VERSION, imkerei: S.get('imkerei').name, vorname: (S.get('profil')||{}).vorname })`));
  await cdp.js(`await S.set('letzteExterneSicherung', new Date().toISOString(), { auto: true }); document.querySelectorAll('#modal-root .modal-back').forEach((m) => m.remove()); return 1;`);

  const ids = await cdp.js(`const v = (await DB.getAll('voelker')).filter((x) => x.status === 'aktiv');
    const k = (await DB.getAll('koeniginnen')).filter((x) => x.status === 'aktiv' && x.mutterId);
    const s = await DB.getAll('staende');
    const kb = k.filter((x) => x.bewertungen && x.bewertungen.length);
    const r = (await DB.getAll('rechnungen')).find((x) => x.status === 'festgeschrieben') || (await DB.getAll('rechnungen'))[0];
    return { volk: v[0] && v[0].id, anna: (v.find((x) => x.name === 'Volk Anna') || {}).id, stand: s[0] && s[0].id, koenigin: (k[0] || {}).id, kg2: (kb[0] || k[1] || {}).id, rechnung: r && r.id };`);
  // Store-Fassung: Zucht gibt es dort nicht – Zucht-Aufgaben aus den Beispieldaten entfernen
  console.log('Zucht-Aufgaben entfernt:', await cdp.js(`let n = 0; for (const a of await DB.getAll('aufgaben')) if (a.quelle === 'zucht') { await DB.del('aufgaben', a.id); n++; } return n;`));
  console.log('IDs', JSON.stringify(ids));

  for (const a of AUFNAHMEN.filter((x) => !NUR.length || NUR.includes(x.name))) {
    const route = a.route.replace('{volk}', ids.volk).replace('{anna}', ids.anna).replace('{stand}', ids.stand).replace('{koenigin}', ids.koenigin).replace('{kg2}', ids.kg2).replace('{rechnung}', ids.rechnung);
    await cdp.js(`document.querySelectorAll('#modal-root .modal-back, .toast').forEach((m) => m.remove()); location.hash = '#/${route}'; await new Promise((r) => setTimeout(r, 300)); renderRoute(); return 1;`);
    await schlaf(1400);
    if (a.schritt) { try { await cdp.js(HILF + a.schritt + '; return 1;'); } catch (e) { console.log('Schritt-Fehler', a.name, e.message); } await schlaf(700); }
    await cdp.js(HILF + `document.querySelectorAll('.toast, .banner, #modal-root .modal-back').forEach((m) => m.remove());
      const fab = document.getElementById('bini-fab'); if (fab) fab.style.visibility = ${a.mitImme ? "''" : "'hidden'"};
      scrollTo(0, 0); ${a.scroll ? a.scroll + ';' : ''} return 1;`);
    await schlaf(400);
    const bild = await cdp.send('Page.captureScreenshot', FORMAT === 'webp' ? { format: 'webp', quality: 86 } : { format: 'png' });
    writeFileSync(`${ZIEL}/${a.name}.${FORMAT}`, Buffer.from(bild.data, 'base64'));
    const f = await cdp.js('return (window.__fehler || []).splice(0)');
    console.log('✓', a.name, f.length ? 'FEHLER: ' + f.join(' | ') : '');
  }
  console.log('FERTIG');
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
