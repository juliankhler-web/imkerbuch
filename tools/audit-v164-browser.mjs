/* Separater Audit-Diagnoselauf mit künstlichen Daten in eigenem Browserprofil.
   Aufruf: node tools/audit-v164-browser.mjs [--port=8954]
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
const PORT = +((ARG.find((a) => a.startsWith('--port=')) || '').split('=')[1] || 8954);
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
let offlineServer = false; let poisonInstall = false;
function serverStarten() {
  const srv = createServer(async (req, res) => {
    if(process.env.AUDIT_DEBUG) console.error('GET',req.url);
    if (offlineServer) { req.socket.destroy(); return; }
    try {
      if (req.url.includes('audit-maintenance=1') || (poisonInstall && (req.url === '/' || req.url.startsWith('/index.html')))) { res.writeHead(200, {'Content-Type':'text/html'}).end('<!doctype html><title>Wartung</title><p>Audit-Wartungsseite</p>'); return; }
      const pfad = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      const datei = join(WURZEL, normalize(pfad.endsWith('/') ? pfad+'index.html' : pfad).replace(/^(\.\.[/\\])+/, ''));
      if (!datei.startsWith(WURZEL)) { res.writeHead(403).end(); return; }
      let inhalt = await readFile(datei); if (poisonInstall && datei.endsWith('service-worker.js')) inhalt = Buffer.from(inhalt.toString().replace('imkerbuch-v176', 'imkerbuch-v176-auditinstall'));
      res.writeHead(200, { 'Content-Type': MIME[extname(datei)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(inhalt);
    } catch (e) { console.error('Serverdatei', req.url, e.message); res.writeHead(404).end('nicht gefunden'); }
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
 const profil=await mkdtemp(join(WURZEL,'tools','.chromeprofil-offline-'));
 const chrome=spawn(CHROME,['--headless=new',`--remote-debugging-port=${CDP_PORT}`,`--user-data-dir=${profil}`,'--no-first-run','--no-default-browser-check','--disable-gpu','--enable-logging=stderr'],{stdio:process.env.AUDIT_DEBUG?'inherit':'ignore'});
 const results=[];
 try {
 const cdp=await verbinde();
 const {targetId}=await cdp.send('Target.createTarget',{url:'about:blank'});
 cdp.session=(await cdp.send('Target.attachToTarget',{targetId,flatten:true})).sessionId;
 await cdp.send('Page.enable');await cdp.send('Runtime.enable');await cdp.send('Network.enable');
 cdp.ws.addEventListener('message', (e) => { const m=JSON.parse(e.data); if(process.env.AUDIT_DEBUG&&(m.method==='ServiceWorker.workerErrorReported'||m.method==='Runtime.exceptionThrown'||m.method==='Runtime.consoleAPICalled')) console.error('SW-Diagnose',JSON.stringify(m.params)); });

 const base=`http://127.0.0.1:${PORT}`;
 async function ready(){for(let i=0;i<150;i++){try{if(await cdp.js('return !!window.appReady'))return true;}catch{}await schlaf(100);}return false;}
 await cdp.send('Page.navigate',{url:base+'/index.html?testdb=1'});await ready();
 const sweep=await cdp.js(`
 const d=await fetch('docs/pruefung-v164/beispieldaten.json').then(r=>r.json());await Backup.applyReplace(d,{blobsBehalten:false});await S.load();
 const result=[];
 for(const [name,view] of Object.entries(Views)){
  if(!view.render)continue;
  document.querySelectorAll('.modal-back').forEach(e=>e.remove());
  const host=document.createElement('div');document.body.appendChild(host);
  let id;
  const lookup={stand:'staende',volk:'voelker',rechnung:'rechnungen'};
  if(lookup[name])id=(await DB.getAll(lookup[name]))[0]?.id;
  try{await view.render(host,id);result.push({view:name,status:'PASS',textLength:host.textContent.length});}
  catch(e){result.push({view:name,status:'ERROR',error:e.message});}
  host.remove();
 }
 return result;`);
 results.push({id:'B1',name:'Alle registrierten Ansichten mit Beispieldaten aufrufen',views:sweep});
 // Zweites echtes Fenster: derselbe Testbestand, eigenes JavaScript-Gedächtnis.
 const ersteSession=cdp.session;
 const peerTarget=await cdp.send('Target.createTarget',{url:base+'/index.html?testdb=1'});
 const peerSession=(await cdp.send('Target.attachToTarget',{targetId:peerTarget.targetId,flatten:true})).sessionId;
 cdp.session=peerSession;await cdp.send('Runtime.enable');await ready();
 cdp.session=ersteSession;await cdp.js('await Backup.markExternal(await Backup.buildBlob());return true;');
 cdp.session=peerSession;await cdp.js("await DB.put('staende',{id:'fenster-test',name:'Änderung im zweiten Fenster'});return true;");
 cdp.session=ersteSession;
 let nachZweitemFenster=false;
 for(let i=0;i<50;i++){nachZweitemFenster=await cdp.js('return window._changedSinceBackup===true;');if(nachZweitemFenster)break;await schlaf(100);}
 await cdp.send('Target.closeTarget',{targetId:peerTarget.targetId});
 await cdp.js('window.appReady=false;');await cdp.send('Page.navigate',{url:base+'/index.html?testdb=1'});await ready();
 const nachNeustart=await cdp.js('return window._changedSinceBackup===true;');
 results.push({id:'B10',name:'Sicherungswarnung folgt zweitem Fenster und bleibt nach Neustart',nachZweitemFenster,nachNeustart});
 await cdp.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 const mobile=await cdp.js(`
 document.querySelectorAll('.modal-back').forEach(e=>e.remove());
 location.hash='/einstellungen';await new Promise(r=>setTimeout(r,300));
 return {viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,smallTargets:[...document.querySelectorAll('button,input,select')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&(r.width<44||r.height<44)}).map(e=>({text:(e.textContent||e.getAttribute('aria-label')||e.id).trim().slice(0,80),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})).slice(0,30)};`);
 results.push({id:'B2',name:'Mobile Messung Einstellungen, 390 Pixel',...mobile});
 await writeFile(new URL('./coverage/mobile-settings-v164.png',import.meta.url),Buffer.from((await cdp.send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await cdp.send('Emulation.clearDeviceMetricsOverride');
 await cdp.js('window.appReady=false');await cdp.send('Page.navigate',{url:base+'/index.html'});await ready();
 const sw=await cdp.js(`await Promise.race([navigator.serviceWorker.ready,new Promise((_,r)=>setTimeout(()=>r(new Error('SW timeout')),30000))]);return {controller:!!navigator.serviceWorker.controller,keys:await caches.keys(),cachedIndex:!!(await caches.match('./index.html'))};`);
 results.push({id:'B3',name:'Service Worker installiert und App gespeichert',...sw});
 await cdp.send('Page.navigate',{url:base+'/impressum.html'});await schlaf(300);
 offlineServer=true;
 await cdp.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
 await cdp.send('Page.navigate',{url:base+'/index.html'});const offlineReady=await ready();
 const offline=await cdp.js(`return {version:window.APP_VERSION||null,libs:await Promise.all(['jspdf.umd.min.js','jspdf.plugin.autotable.min.js','pdf.min.js','pdf.worker.min.js','qrcode.min.js','xlsx.full.min.js'].map(async f=>{try{const r=await fetch('./libs/'+f);return {file:f,ok:r.ok,bytes:(await r.arrayBuffer()).byteLength}}catch(e){return {file:f,ok:false,error:e.message}}}))};`);
 results.push({id:'B4',name:'Offline-Neustart nach Impressum und lokale Bibliotheken',ready:offlineReady,...offline});
 offlineServer=false;
 await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
 // Server-side HTML maintenance response is emulated only on this isolated origin.
 const maintenance=await cdp.js(`const r=await fetch('./index.html?audit-maintenance=1');await r.text();await new Promise(r=>setTimeout(r,500));const cached=await caches.match('./index.html');return {cachedMaintenance:(await cached.text()).includes('Audit-Wartungsseite')};`);
 results.push({id:'B5',name:'HTTP-200-Wartungsseite ersetzt Offline-App im Cache',...maintenance});
 offlineServer=true;
 await cdp.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
 await cdp.send('Page.navigate',{url:base+'/index.html'});await schlaf(500);
 results.push({id:'B6',name:'Offline nach falscher HTTP-200-Antwort',...(await cdp.js('return {appReady:!!window.appReady,title:document.title,text:document.body.innerText.slice(0,300)}'))});
 offlineServer=false;poisonInstall=true;
 await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
 await cdp.js(`const reg=await navigator.serviceWorker.getRegistration();await reg.update();return true;`);
 await schlaf(2000);
 results.push({id:'B8',name:'Neue Installation prüft die App-Hülle ebenfalls',...(await cdp.js(`const keys=await caches.keys();const c=keys.includes('imkerbuch-v176-auditinstall')?await caches.open('imkerbuch-v176-auditinstall'):null;const r=c?await c.match('./index.html'):null;return {cachedMaintenance:r?(await r.text()).includes('Audit-Wartungsseite'):null,keys};`))});
 offlineServer=true;
 await cdp.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
 await cdp.js('window.appReady=false');await cdp.send('Page.navigate',{url:base+'/index.html'});await ready();
 results.push({id:'B9',name:'Alte App startet offline nach abgelehnter Installation',...(await cdp.js('return {appReady:!!window.appReady,keys:await caches.keys()}'))});
 // A second origin on the same isolated server has no previous installation.
 await cdp.send('Page.navigate',{url:`http://localhost:${PORT}/index.html`});await schlaf(500);
 results.push({id:'B7',name:'Erstbesuch ohne Netz und ohne Cache',...(await cdp.js('return {appReady:!!window.appReady,url:location.href,title:document.title}'))});
 await writeFile(new URL('../docs/pruefung-v164/update-reparatur-results.json',import.meta.url),JSON.stringify({browser:browserKennung,date:new Date().toISOString(),results},null,2));
 console.log(JSON.stringify(results,null,2));
 } finally {chrome.kill();srv.close();}
 process.exit(0);
}
main().catch(e=>{console.error(e);process.exit(2)});
