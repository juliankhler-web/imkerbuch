// Executed by regression-run.mjs only in its isolated browser profile/test database.
const results = [];
const pause = (ms) => new Promise(r => setTimeout(r, ms));
const check = (ok, detail) => ({ok, detail});
const originalConfirm = UI.confirm;
async function reset() {
  document.querySelectorAll('.modal-back').forEach(e => e.remove());
  for (const store of DB.DATA_STORES) await DB.clear(store);
  await S.load();
  FormGuard.dirty = false;
  window.__auditHit = 0;
  const old = document.getElementById('audit-host'); if (old) old.remove();
  const host = document.createElement('div'); host.id = 'audit-host'; document.body.appendChild(host);
  UI.confirm = async () => true;
  return host;
}
async function test(id, name, fn) {
  try { const host = await reset(); const r = await fn(host); results.push({id,name,status:r.ok?'PASS':'FAIL',detail:r.detail}); }
  catch(e) { results.push({id,name,status:'ERROR',detail:String(e.stack || e)}); }
}
await test('F20', 'Verkauf aus Papierkorb wiederherstellen erhält Bestands- und Kassenbezug', async () => {
  await DB.put('chargen', {id:'c',losnummer:'L',mengeKg:5});
  await DB.put('abfuellungen',{id:'a',chargeId:'c',anzahl:10,bestand:10,gebindeG:500});
  const v=await verkaufErfassen({abfuellungId:'a',anzahl:2,preisJeGlas:5});
  await verkaufStornieren(v.id);
  const t=(await DB.getAll('papierkorb')).find(t=>t.store==='verkaeufe');
  await DB.trashRestore(t.id);
  const bestand=(await DB.get('abfuellungen','a')).bestand, cash=await DB.get('kassenbuch',v.kassenbuchId);
  return check(bestand===8&&!!cash,{bestand,erwartet:8,verkaufVorhanden:!!(await DB.get('verkaeufe',v.id)),kasseVorhanden:!!cash});
});
await test('F21','Änderung während Sicherung bleibt als ungesichert markiert',async()=>{
  const alt=Backup.buildBlob,download=U.download,picker=window.showSaveFilePicker;
  let datei;
  Backup.buildBlob=async function(){datei=await alt.call(this);await DB.put('staende',{id:'nach-snapshot',name:'Spätere Eingabe'});return datei;};
  U.download=()=>{};window.showSaveFilePicker=undefined;
  try{await Backup.exportDownload();}finally{Backup.buildBlob=alt;U.download=download;window.showSaveFilePicker=picker;}
  const gesichert=JSON.parse(await datei.text()).stores.staende.some(r=>r.id==='nach-snapshot');
  return check(!gesichert&&window._changedSinceBackup===true,{inDatei:gesichert,inDatenbank:!!(await DB.get('staende','nach-snapshot')),aenderungsflag:window._changedSinceBackup,erwartetesFlag:true});
});
await test('F22','Zwei Abfüllungen können gemeinsam die Charge nicht überziehen',async()=>{
  await DB.put('chargen',{id:'c',losnummer:'L',mengeKg:10});
  const original=UI.formModal,render=window.renderRoute,forms=[];
  UI.formModal=function(o){forms.push(o);return original.call(this,o);};
  try{await Views.honig.abfuellForm('c');await Views.honig.abfuellForm('c');}finally{UI.formModal=original;}
  let reads=0,freigeben;const warten=new Promise(r=>freigeben=r),getAll=DB.getAll;
  DB.getAll=async function(store){const value=await getAll.call(this,store);if(store==='abfuellungen'&&reads<2){if(++reads===2)freigeben();await warten;}return value;};
  window.renderRoute=async()=>{};
  let result;
  try{result=await Promise.allSettled(forms.map(f=>f.onSave({chargeId:'c',datum:'2026-09-22',g_500:15})));}finally{DB.getAll=getAll;window.renderRoute=render;}
  const a=await DB.getAll('abfuellungen'),kg=a.reduce((s,a)=>s+a.anzahl*a.gebindeG/1000,0);
  return check(kg<=10,{chargeKg:10,abgefuelltKg:kg,abfuellungen:a.length,erfolgreich:result.filter(r=>r.status==='fulfilled').length});
});
UI.confirm=originalConfirm;
return {results,pass:results.filter(x=>x.status==='PASS').length,fail:results.filter(x=>x.status==='FAIL').length,errors:results.filter(x=>x.status==='ERROR').length};
