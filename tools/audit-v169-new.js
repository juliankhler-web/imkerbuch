// Executed by audit-v164.mjs only in its isolated browser profile/test database.
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

await test('G1','Bewertungen desselben Tags werden ergänzt',async()=>{
 await DB.put('koeniginnen',{id:'q',kennung:'B1'});await setBewertung('q',{sanftmut:5},'2026-09-22');await setBewertung('q',{fruehtracht:4},'2026-09-22');
 const b=gdebAktuell(await DB.get('koeniginnen','q'));return check(b.noten.sanftmut===5&&b.noten.fruehtracht===4,b);
});
await test('G2','Parallel gespeicherte Bewertungen behalten beide Merkmale',async()=>{
 await DB.put('koeniginnen',{id:'q',kennung:'B1'});const get=DB.get;let waits=[];
 DB.get=async function(st,id){const q=await get.call(this,st,id);if(st==='koeniginnen'&&id==='q'){await new Promise(r=>{waits.push(r);if(waits.length===2)waits.forEach(f=>f());});}return q;};
 try{await Promise.all([setBewertung('q',{sanftmut:5},'2026-09-22'),setBewertung('q',{fruehtracht:4},'2026-09-22')]);}finally{DB.get=get;}
 const b=gdebAktuell(await DB.get('koeniginnen','q'));return check(b.noten.sanftmut===5&&b.noten.fruehtracht===4,b);
});
await test('G3','Neue Bewertung am selben Tag erhält frühere Noten',async()=>{
 await DB.put('koeniginnen',{id:'q',kennung:'B1'});await setBewertung('q',{sanftmut:5},'2026-09-22');
 const form=UI.formModal,render=window.renderRoute;let opts;UI.formModal=o=>{opts=o;return {}};window.renderRoute=async()=>{};
 try{await gdebBewertungForm('q');await opts.onSave({datum:'2026-09-22',fruehtracht:4});}finally{UI.formModal=form;window.renderRoute=render;}
 const b=gdebAktuell(await DB.get('koeniginnen','q'));return check(b.noten.sanftmut===5&&b.noten.fruehtracht===4,b);
});
await test('G4','Alte Skala bleibt bei Teilergänzung erkennbar',async()=>{
 await DB.put('koeniginnen',{id:'q',kennung:'B1',bewertung:{sanftmut:4,wabensitz:4},bewertetAm:'2026-09-22'});
 await setBewertung('q',{fruehtracht:6},'2026-09-22');const b=gdebAktuell(await DB.get('koeniginnen','q'));return check(b.skalaAlt===true,{b,mittel:gdebMittel(b)});
});
await test('G5','Stammbaumschleife bleibt endlich',async()=>{
 const q={id:'q',kennung:'B1',mutterId:'m'},m={id:'m',kennung:'B2',mutterId:'q'};const p=pedigreeGdeB(q,new Map([['q',q],['m',m]]));return check(p.length<200,{p});
});
await test('G6','Zahl als importierte Kennung führt nicht zum Abbruch',async()=>{
 await Backup.applyMerge({stores:{koeniginnen:[{id:'q',kennung:123}]}});let error;try{pedigreeGdeB(await DB.get('koeniginnen','q'),await idMap('koeniginnen'));}catch(e){error=e.message;}return check(!error,{error});
});
await test('H1','OCR erkennt Tabelle mit Einwortzellen',async()=>{
 const texts=[['Bereich','Mittel','Häufigkeit'],['Schleuder','Wasser','täglich']];const lines=texts.map((row,j)=>({words:row.map((text,i)=>({text,bbox:{x0:i*150,x1:i*150+50,y0:j*20,y1:j*20+10}}))}));
 const text=spaltenAusWorten(lines),rows=hygieneplanParsen(text);return check(rows.length===1&&rows[0].mittel==='Wasser',{text,rows});
});
await test('H2','Mehr als 60 Planzeilen werden nicht still abgeschnitten',async()=>{
 const input='Bereich;Mittel;Häufigkeit\n'+Array.from({length:61},(_,i)=>`Raum ${i};Wasser;täglich`).join('\n');const rows=hygieneplanParsen(input);return check(rows.length===61,{inputRows:61,outputRows:rows.length});
});
await test('H3','Plan-Durchsicht führt importiertes HTML nicht aus',async()=>{
 const p='<img src=x onerror=window.__auditHit++>';Views.bio.planDurchsicht([{bereichName:p,mittel:p,haeufigkeit:p,verantwortlich:p,sicher:true}],p,p);await pause(100);return check(window.__auditHit===0,{scriptExecutions:window.__auditHit});
});
await test('H4','Doppelklick auf Planübernahme erzeugt keine Dubletten',async()=>{
 const render=window.renderRoute;window.renderRoute=async()=>{};
 try{Views.bio.planDurchsicht([{bereichName:'Raum',mittel:'Wasser',haeufigkeit:'täglich',verantwortlich:'',sicher:true}],'Plan');const b=document.querySelector('.modal-back [data-ok]');await Promise.all([b.onclick(),b.onclick()]);}finally{window.renderRoute=render;}
 const rows=await DB.getAll('bioeintraege');return check(rows.length===1,{rows:rows.length});
});

await test('G7','Zwei offene Bewertungsrunden erzeugen nicht zwei Königinnen für ein Volk',async()=>{
 await DB.put('voelker',{id:'v',name:'Volk',status:'aktiv'});
 const f=UI.formModal,step=Views.koeniginnen.bewertenStep2;const opts=[];UI.formModal=function(o){opts.push(o);return f.call(this,o);};Views.koeniginnen.bewertenStep2=()=>{};
 try{await Views.koeniginnen.bewertungsRunde();await Views.koeniginnen.bewertungsRunde();for(const o of opts)await o.onSave({volkIds:['v'],datum:'2026-09-22',neuJahrgang:2026});}finally{UI.formModal=f;Views.koeniginnen.bewertenStep2=step;}
 const queens=await DB.getAll('koeniginnen'),v=await DB.get('voelker','v');return check(queens.length===1,{queens:queens.length,linkedQueen:v.koeniginId,histories:queens.map(q=>q.historie)});
});
UI.confirm=originalConfirm;
return {results,pass:results.filter(x=>x.status==='PASS').length,fail:results.filter(x=>x.status==='FAIL').length,errors:results.filter(x=>x.status==='ERROR').length};
