/* Separater Audit-Diagnoselauf mit künstlichen Daten in eigenem Browserprofil.
   Aufruf: node tools/audit-v164.mjs [--port=8952]
   Benötigt Node mit globalem WebSocket und Google Chrome/Chromium (CHROME_BIN optional).
   Ergebnisse: docs/pruefung-v164. Exit 0 bedeutet abgeschlossenen Lauf,
   NICHT Fehlerfreiheit; technische Abbrüche liefern Exit 2.
*/
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile, mkdtemp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { extname, join, normalize } from 'node:path';

const WURZEL = new URL('..', import.meta.url).pathname;
const ARG = process.argv.slice(2);
const PORT = +((ARG.find((a) => a.startsWith('--port=')) || '').split('=')[1] || 8952);
const CDP_PORT = PORT + 400;
const ERWEITERT = ARG.includes('--neufunde');
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

export let browserKennung = 'unbekannt';

async function verbinde() {
  for (let i = 0; i < 80; i++) {
    try {
      const v = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`).then((r) => r.json());
      browserKennung = v.Browser || 'unbekannt';
      const ws = new WebSocket(v.webSocketDebuggerUrl);
      await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
      return new Cdp(ws);
    } catch (e) { await schlaf(300); }
  }
  throw new Error('Chrome antwortet nicht auf Port ' + CDP_PORT);
}

async function main() {
 await mkdir(join(WURZEL, "tools", "coverage"), {recursive:true});
 const srv=await serverStarten();
 const profil=await mkdtemp(join(WURZEL,'tools','.chromeprofil-audit-'));
 const chrome=spawn(CHROME,['--headless=new',`--remote-debugging-port=${CDP_PORT}`,`--user-data-dir=${profil}`,'--no-first-run','--no-default-browser-check','--disable-gpu'],{stdio:'ignore'});
 try {
 const cdp=await verbinde();
 const {targetId}=await cdp.send('Target.createTarget',{url:'about:blank'});
 cdp.session=(await cdp.send('Target.attachToTarget',{targetId,flatten:true})).sessionId;
 await cdp.send('Page.enable');await cdp.send('Runtime.enable');
 await cdp.send('Page.navigate',{url:`http://127.0.0.1:${PORT}/index.html?testdb=1`});
 for(let i=0;i<200;i++){if(await cdp.js('return !!window.appReady'))break;await schlaf(100);}
 const script=await readFile(new URL(ERWEITERT ? './audit-v164-neufunde.js' : './audit-v164-cases.js',import.meta.url),'utf8');
 const result=await cdp.js(script);
 const out={version:'1.64',browser:browserKennung,datum:new Date().toISOString(),...result};
 await writeFile(new URL('../docs/pruefung-v164/'+(ERWEITERT?'neufunde-results.json':'abschluss-regression-results.json'),import.meta.url),JSON.stringify(out,null,2));
 console.log(JSON.stringify(out,null,2));
 }finally{chrome.kill();srv.close();}
 process.exit(0);
}
main().catch(e=>{console.error(e);process.exit(2)});
