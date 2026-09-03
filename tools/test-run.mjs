/* Führt die Testsuite kopflos aus – ohne npm-Paket, nur Node und Chrome.

   Startet einen kleinen Dateiserver, öffnet tests/test.html in einem
   headless Chrome (DevTools-Protokoll) und wartet auf window.testErgebnis.
   Beendet sich mit Code 1, sobald ein Test rot ist – dadurch taugt der
   Aufruf für die CI.

   Aufruf:  node tools/test-run.mjs [--coverage] [--port=8931] [--sichtbar]
   Coverage: schreibt tools/coverage/report.json und nennt ungetestete Funktionen.
*/
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { extname, join, normalize } from 'node:path';

const WURZEL = new URL('..', import.meta.url).pathname;
const ARG = process.argv.slice(2);
const COVERAGE = ARG.includes('--coverage');
const SICHTBAR = ARG.includes('--sichtbar');
const PORT = +((ARG.find((a) => a.startsWith('--port=')) || '').split('=')[1] || 8941);
const CDP_PORT = PORT + 400;
const CHROME = process.env.CHROME_BIN
  || ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium']
    .find((p) => existsSync(p));

const schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

/* ---------- Dateiserver (nur lesend, nur unterhalb der Projektwurzel) ---------- */
function serverStarten() {
  const srv = createServer(async (req, res) => {
    try {
      const pfad = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      const datei = join(WURZEL, normalize(pfad).replace(/^(\.\.[/\\])+/, ''));
      if (!datei.startsWith(WURZEL)) { res.writeHead(403).end(); return; }
      const inhalt = await readFile(datei);
      res.writeHead(200, { 'Content-Type': MIME[extname(datei)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(inhalt);
    } catch (e) { res.writeHead(404).end('nicht gefunden'); }
  });
  return new Promise((r) => srv.listen(PORT, '127.0.0.1', () => r(srv)));
}

/* ---------- kleiner CDP-Client (wie in tools/shots.mjs) ---------- */
class Cdp {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.warten = new Map(); this.session = null;
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
      setTimeout(() => { if (this.warten.delete(id)) rej(new Error('CDP-Zeitüberschreitung: ' + method)); }, 120000);
    });
  }
  async js(ausdruck) {
    const r = await this.send('Runtime.evaluate', { expression: `(async()=>{${ausdruck}})()`, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception || {}).description);
    return r.result.value;
  }
}

async function verbinde() {
  for (let i = 0; i < 80; i++) {
    try {
      const v = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`).then((r) => r.json());
      const ws = new WebSocket(v.webSocketDebuggerUrl);
      await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
      return new Cdp(ws);
    } catch (e) { await schlaf(300); }
  }
  throw new Error('Chrome antwortet nicht auf Port ' + CDP_PORT);
}

/* ---------- Coverage auswerten ----------
   V8 liefert Bereiche je Funktion mit Zählerstand. Um daraus Dateizeilen zu
   machen, suchen wir den Quelltext des Skripts in index.html – das eingebettete
   Skript steht dort unverändert drin. */
function zeileVon(text, offset) { let n = 1; for (let i = 0; i < offset && i < text.length; i++) if (text[i] === '\n') n++; return n; }

async function coverageAuswerten(cdp, htmlQuelle) {
  const { result } = await cdp.send('Profiler.takePreciseCoverage');
  const app = result.filter((s) => /index\.html/.test(s.url));
  let quelle = null, versatz = -1;
  for (const skript of app) {
    try {
      const { scriptSource } = await cdp.send('Debugger.getScriptSource', { scriptId: skript.scriptId });
      const i = htmlQuelle.indexOf(scriptSource.slice(0, 300));
      if (scriptSource.length > 100000 && i >= 0) { quelle = scriptSource; versatz = i; }
    } catch (e) { /* Skript nicht mehr da */ }
  }
  const funktionen = [];
  for (const skript of app) {
    for (const f of skript.functions) {
      const b = f.ranges[0]; if (!b) continue;
      funktionen.push({
        name: f.functionName || '(anonym)',
        treffer: b.count,
        zeile: versatz >= 0 ? zeileVon(htmlQuelle, versatz + b.startOffset) : null,
        laenge: b.endOffset - b.startOffset,
      });
    }
  }
  const benannt = funktionen.filter((f) => f.name !== '(anonym)');
  const ohne = benannt.filter((f) => f.treffer === 0).sort((a, b) => b.laenge - a.laenge);
  return {
    funktionenGesamt: benannt.length,
    abgedeckt: benannt.length - ohne.length,
    quote: benannt.length ? Math.round((benannt.length - ohne.length) / benannt.length * 1000) / 10 : 0,
    ungetestet: ohne.map((f) => ({ name: f.name, zeile: f.zeile, zeichen: f.laenge })),
  };
}

/* ---------- Hauptlauf ---------- */
async function main() {
  if (!CHROME) { console.error('Kein Chrome gefunden. CHROME_BIN setzen.'); process.exit(2); }
  const srv = await serverStarten();
  const profil = join(WURZEL, 'tools', '.chromeprofil-tests');
  const chrome = spawn(CHROME, [
    ...(SICHTBAR ? [] : ['--headless=new']),
    `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${profil}`,
    '--no-first-run', '--no-default-browser-check', '--disable-gpu',
    '--disable-dev-shm-usage', '--no-sandbox',
  ], { stdio: 'ignore' });
  const aufraeumen = () => { try { chrome.kill(); } catch (e) {} try { srv.close(); } catch (e) {} };
  process.on('exit', aufraeumen);

  const cdp = await verbinde();
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  cdp.session = sessionId;
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  if (COVERAGE) {
    await cdp.send('Debugger.enable');
    await cdp.send('Profiler.enable');
    await cdp.send('Profiler.startPreciseCoverage', { callCount: true, detailed: true });
  }

  console.log(`→ Testseite wird geladen (Port ${PORT}) …`);
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/tests/test.html` });

  let erg = null;
  for (let i = 0; i < 900; i++) {           // bis zu 3 Minuten
    try { erg = await cdp.js('return window.testErgebnis || null'); } catch (e) {}
    if (erg) break;
    await schlaf(200);
  }
  if (!erg) { console.error('✖ Die Testsuite hat nicht geantwortet (Zeitüberschreitung).'); aufraeumen(); process.exit(2); }

  const fehler = await cdp.js(`return [...document.querySelectorAll('.t.fail')].map(e => e.textContent)`);
  for (const f of fehler) console.log(f);
  console.log(`\n${erg.pass} von ${erg.gesamt} Tests grün${erg.fail ? ` – ${erg.fail} FEHLGESCHLAGEN` : ' ✓'}`);

  if (COVERAGE) {
    const html = await readFile(join(WURZEL, 'index.html'), 'utf8');
    const cov = await coverageAuswerten(cdp, html);
    await mkdir(join(WURZEL, 'tools', 'coverage'), { recursive: true });
    await writeFile(join(WURZEL, 'tools', 'coverage', 'report.json'), JSON.stringify(cov, null, 2));
    console.log(`\nAbdeckung: ${cov.abgedeckt} von ${cov.funktionenGesamt} benannten Funktionen aufgerufen (${cov.quote} %)`);
    console.log('Größte nie aufgerufene Funktionen:');
    for (const f of cov.ungetestet.slice(0, 40)) console.log(`  ${String(f.zeile ?? '?').padStart(6)}  ${f.name}  (${f.zeichen} Zeichen)`);
    console.log('Vollständige Liste: tools/coverage/report.json');
  }

  aufraeumen();
  process.exit(erg.fail ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(2); });
