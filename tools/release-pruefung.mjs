/* Release-Prüfung ausschließlich mit Wegwerf-Profilen und künstlichen Daten.
   PLAYWRIGHT_MODULE optional: absoluter Pfad zum installierten playwright-Paket.
   node tools/release-pruefung.mjs [chrome|firefox|webkit] [suite|update]
   Exit 1 bei fachlichem Fehler, 2 bei technischem Abbruch. Kein Produktivzugriff.
*/
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir,mkdtemp} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve,extname,sep} from 'node:path';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=fileURLToPath(new URL('..',import.meta.url));
const engine=process.argv[2]||'chrome',mode=process.argv[3]||'update';
const basis='46e2923';let phase=mode==='suite'?'neu':'alt';
const html=await readFile(resolve(root,'index.html'),'utf8');
const version=html.match(/const APP_VERSION = '([^']+)'/)[1];
const sw=await readFile(resolve(root,'service-worker.js'),'utf8');
const cache=sw.match(/const CACHE = '([^']+)'/)[1];
const oldFiles=new Map();
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.webp':'image/webp','.css':'text/css','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(!pathname.startsWith('/imkerbuch/')){res.writeHead(404).end();return;}
  const relative=pathname.slice('/imkerbuch/'.length)||'index.html',path=resolve(root,relative);
  if(!path.startsWith(root.endsWith(sep)?root:root+sep)){res.writeHead(403).end();return;}
  if(phase==='aus'){req.socket.destroy();return;}
  if(phase==='defekt'&&relative==='index.html'){res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'}).end('<title>Wartung</title>Keine App');return;}
  let data;
  if(phase==='alt'&&!relative.startsWith('tests/')){
   if(!oldFiles.has(relative))oldFiles.set(relative,execFileSync('git',['show',basis+':'+relative],{cwd:root,maxBuffer:20*1024*1024,stdio:['ignore','pipe','ignore']}));
   data=oldFiles.get(relative);
  }else data=await readFile(path);
  res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-store'}).end(data);
 }catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}/imkerbuch/`;
const profile=await mkdtemp(resolve(root,'tools/.chromeprofil-release-'+engine+'-'));
let context;
try {
 context=await (engine==='chrome'?pw.chromium:pw[engine]).launchPersistentContext(profile,
  {headless:true,timeout:45000,...(engine==='chrome'?(process.env.CHROME_BIN?{executablePath:process.env.CHROME_BIN}:{channel:'chrome'}):{})});
} catch(e) {
 await mkdir(resolve(root,'docs/pruefung-v165'),{recursive:true});
 await writeFile(resolve(root,`docs/pruefung-v165/${engine}-${mode}.json`),JSON.stringify({version,basis,engine,mode,datum:new Date().toISOString(),results:[{id:'BROWSER-START',status:'BLOCKED',detail:e.message}]},null,2)+'\n');
 console.error('Browser konnte nicht gestartet werden:',e.message);server.close();process.exit(2);
}
const browser=context.browser();const page=await context.newPage();
const results=[];
if(process.env.RELEASE_DEBUG)page.on('console',async m=>{if(m.type()==='error')console.error('BROWSER',await Promise.all(m.args().map(a=>a.evaluate(v=>v instanceof Error?{name:v.name,message:v.message,stack:v.stack}:String(v)).catch(()=>null))));});
const check=(id,ok,detail)=>{results.push({id,status:ok?'PASS':'FAIL',detail});console.log(id,ok?'PASS':'FAIL');};
async function ready(p=page,v){await p.waitForFunction(v=>window.appReady&&(!v||window.APP_VERSION===v),v,{timeout:45000});}
async function bestand(p=page) {
 return p.evaluate(async()=>{
  await pruefeMhd();
  const data=await Backup.buildData(true);delete data.exportiert;
  data.stores.settings=data.stores.settings.map(r=>r.key==='inventarTypMigriert'?{key:r.key,value:r.value}:r);
  data.stores.settings=data.stores.settings.filter(r=>!['letzteGeseheneVersion','_datenRevision','_gesicherteRevision'].includes(r.key));
  for(const [store,rows] of Object.entries(data.stores))rows.sort((a,b)=>String(store==='settings'?a.key:a.id).localeCompare(String(store==='settings'?b.key:b.id)));
  return {data,sum:rechnungSummen(await DB.get('rechnungen','release-rechnung')),version:APP_VERSION,caches:await caches.keys()};
 });
}
try{
 if(mode==='suite'){
  await page.goto(base+'tests/test.html');
  await page.waitForFunction(()=>window.testErgebnis,null,{timeout:300000});
  const result=await page.evaluate(()=>({...window.testErgebnis,fehler:[...document.querySelectorAll('.t.fail')].map(e=>e.textContent)}));
  check('SUITE',result.fail===0,result);
 }else{
  await page.goto(base+'index.html');await ready(page,'1.64');
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  let before=await page.evaluate(async()=>{
   const fixture=await fetch('tests/fixtures/backup/v1.64.json').then(r=>r.json());
   await Backup.applyReplace(fixture,{blobsBehalten:false});await S.load();
   await S.set('wizardDone',true);await S.set('letzteGeseheneVersion','1.64');
   await DB.put('anhaenge',{id:'release-anlage',parentTyp:'stand',parentId:'release-s',blob:new Blob([new Uint8Array([0,1,127,128,255])],{type:'application/octet-stream'})});
   await DB.put('rechnungen',{id:'release-rechnung',nummer:'ALT-TEST-007',status:'festgeschrieben',datum:'2026-09-21',steuerart:'regel',positionen:[{menge:1,einzelpreis:107,steuersatz:'7'}]});
   const normalized=async()=>{const data=await Backup.buildData(true);delete data.exportiert;data.stores.settings=data.stores.settings.filter(r=>!['letzteGeseheneVersion','_datenRevision','_gesicherteRevision'].includes(r.key));for(const [store,rows] of Object.entries(data.stores))rows.sort((a,b)=>String(store==='settings'?a.key:a.id).localeCompare(String(store==='settings'?b.key:b.id)));return data;};
   return {data:await normalized(),sum:rechnungSummen(await DB.get('rechnungen','release-rechnung')),db:DB.NAME,caches:await caches.keys()};
  });
  check('ALT-INSTALLIERT',before.caches.includes('imkerbuch-v176')&&before.db==='imkerbuch',{version:'1.64',cache:before.caches,db:before.db});
  // New SW with intentionally broken application response: must not replace old cache.
  phase='defekt';
  await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await reg.update();});
  await page.waitForFunction(async()=>!(await navigator.serviceWorker.getRegistration()).installing,null,{timeout:30000});
  const rejected=await page.evaluate(async()=>({keys:await caches.keys(),html:await(await caches.match('./index.html')).text()}));
  check('DEFEKTES-UPDATE-ABGELEHNT',rejected.keys.includes('imkerbuch-v176')&&!rejected.keys.includes(cache)&&rejected.html.includes("const APP_VERSION = '1.64'"),{keys:rejected.keys});
  phase='aus';if(engine!=='webkit')await context.setOffline(true);await page.reload();await ready(page,'1.64');
  check('ALTE-APP-OFFLINE',await page.evaluate(()=>APP_VERSION==='1.64'),{version:'1.64'});
  // Erst nach dem alten Neustart vergleichen: dessen eigene Migrationen sind abgeschlossen.
  before=await bestand();
  phase='neu';if(engine!=='webkit')await context.setOffline(false);
  await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await reg.update();});
  await ready(page,version);
  await page.waitForFunction(async c=>(await caches.keys()).includes(c),cache);
  const after=await bestand();
  const unterschiede=Object.keys(before.data.stores).filter(s=>JSON.stringify(before.data.stores[s])!==JSON.stringify(after.data.stores[s]));
  check('ALLE-BESTANDSDATEN-ERHALTEN',unterschiede.length===0,{unterschiede,stores:Object.keys(before.data.stores).length,abweichungen:Object.fromEntries(unterschiede.map(s=>[s,{vorher:before.data.stores[s],nachher:after.data.stores[s]}]))});
  check('ALTER-BELEG-UNVERAENDERT',JSON.stringify(before.sum)===JSON.stringify(after.sum),{vorher:before.sum,nachher:after.sum});
  check('NEUE-VERSION-AKTIV',after.version===version&&after.caches.includes(cache)&&!after.caches.includes('imkerbuch-v176'),{version:after.version,caches:after.caches});
  phase='aus';if(engine!=='webkit')await context.setOffline(true);await page.reload();await ready(page,version);
  const offline=await page.evaluate(async()=>({version:APP_VERSION,bytes:[...new Uint8Array(await(await DB.get('anhaenge','release-anlage')).blob.arrayBuffer())],libs:await Promise.all(['jspdf.umd.min.js','jspdf.plugin.autotable.min.js','pdf.min.js','pdf.worker.min.js','qrcode.min.js','xlsx.full.min.js'].map(async x=>(await fetch('libs/'+x)).ok))}));
  check('NEUE-APP-OFFLINE',offline.version===version&&offline.libs.every(Boolean)&&JSON.stringify(offline.bytes)==='[0,1,127,128,255]',offline);
  phase='neu';if(engine!=='webkit')await context.setOffline(false);
  for(const v of ['1.61','1.62','1.63','1.64']){
   const r=await page.evaluate(async v=>{const d=await fetch('tests/fixtures/backup/v'+v+'.json').then(r=>r.json());await Backup.applyReplace(d,{blobsBehalten:false});const a=await Backup.buildData(true);await Backup.applyReplace(a,{blobsBehalten:false});const b=await Backup.buildData(true);await Backup.applyMerge(b);const c=await Backup.buildData(true);await Backup.applyMerge(b);const e=await Backup.buildData(true);return {roundtrip:JSON.stringify(a.stores)===JSON.stringify(b.stores),merge:JSON.stringify(c.stores)===JSON.stringify(e.stores)};},v);
   check('BACKUP-'+v,r.roundtrip&&r.merge,r);
  }
 }
}catch(e){results.push({id:'TECHNISCHER-ABBRUCH',status:'ERROR',detail:e.stack});console.error(e);}
finally{
 const out={version,basis,offlineMethode:engine==='webkit'?'Server verweigert alle Antworten':'Server verweigert Antworten und Browser-Netz abgeschaltet',engine,browser:browser.version(),mode,datum:new Date().toISOString(),sha256:createHash('sha256').update(html).digest('hex'),results};
 await mkdir(resolve(root,'docs/pruefung-v165'),{recursive:true});await writeFile(resolve(root,`docs/pruefung-v165/${engine}-${mode}.json`),JSON.stringify(out,null,2)+'\n');
 await context.close();await browser.close();await new Promise(r=>server.close(r));
}
process.exit(results.some(r=>r.status==='ERROR')?2:results.some(r=>r.status==='FAIL')?1:0);
