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
const payload = '<img src=x onerror=window.__auditHit++>';
const setting = (key,value) => ({key,value,lastModified:'2099-01-01T00:00:00.000Z'});
const merge = stores => Backup.applyMerge({app:'ImkerBuch',stores});
async function renderAttack(host, view, id) { await S.load(); await Views[view].render(host,id); await pause(100); return check(window.__auditHit === 0,{scriptExecutions:window.__auditHit}); }

await test('N1','Importiertes Bild darf keine Ereignisattribute erzeugen',async h=>{
 await merge({settings:[setting('logo','data:image/png;base64,AA==" onerror=window.__auditHit++ x="')]});
 return renderAttack(h,'einstellungen');
});
await test('N2','Stockkarten-Feldtyp bleibt Text',async h=>{
 await merge({settings:[setting('stockkartenFelder',[{name:'Prüffeld',typ:payload}])]}); return renderAttack(h,'einstellungen');
});
await test('N3','Zuchtanzahl bleibt Text oder wird abgelehnt',async h=>{
 await merge({zuchtserien:[{id:'zucht-test',name:'Prüfserie',startdatum:'2026-09-01',termine:[],anzahl:payload}]}); return renderAttack(h,'zucht');
});
await test('N4','Standkoordinaten erzeugen kein HTML',async h=>{
 await merge({staende:[{id:'stand-test',name:'Prüfstand',lat:'0">'+payload,lng:8}]}); return renderAttack(h,'stand','stand-test');
});
await test('N5','Papierkorb-Bereich bleibt Text',async h=>{
 await merge({papierkorb:[{id:'trash-test',store:payload,daten:{id:'entry-test',name:'Prüfeintrag'},geloeschtAm:new Date().toISOString()}]}); return renderAttack(h,'papierkorb');
});
await test('N6','Fehlerhafter Restore erhält ursprüngliche Anhänge',async()=>{
 await DB.put('anhaenge',{id:'original',name:'Original.txt',blob:new Blob(['Originalinhalt'],{type:'text/plain'})});
 await Backup.snapshotInternal('audit');
 let error=null;try {await Backup.applyReplace({stores:{anhaenge:[{id:'bad',datenUrl:'ungueltig'}]}},{blobsBehalten:false});}catch(e){error=e.message;}
 const after=await DB.getAll('anhaenge');
 return check(after.some(x=>x.id==='original'),{remainingAttachments:after.length,error});
});
await test('N7','ID-Bereinigung erhält Zuordnung und wiederholter Import bleibt eindeutig',async()=>{
 const stores={staende:[{id:'stand:1',name:'Prüfstand'}],voelker:[{id:'volk-1',name:'Prüfvolk',status:'aktiv',standId:'stand:1'}]};
 await merge(stores);await merge(stores);
 const stands=await DB.getAll('staende'),v=await DB.get('voelker','volk-1');
 return check(stands.length===1&&stands.some(s=>s.id===v.standId),{standCount:stands.length,standIds:stands.map(s=>s.id),volkStandId:v.standId});
});
await test('N8','Neueres Entfernen eines Zahlungs-QR wird übernommen',async()=>{
 await S.set('rechnungQr','data:image/png;base64,AA==');
 await merge({settings:[setting('rechnungQr',null)]});await S.load();
 return check(S.get('rechnungQr')===null,{actual:S.get('rechnungQr'),expected:null});
});
await test('N9','Bio-Migration übersteht Unterbrechung nach Quellenlöschung',async()=>{
 await S.set('bioPartnerMigriert',false);
 await DB.put('bioeintraege',{id:'cert',bereich:'zertifikat',art:'Eigener Betrieb',nummer:'BIO-123',gueltigBis:'2027-12-31',ablage:'Ordner A'});
 const del=DB.del;let injected=false;
 DB.del=async function(store,id){await del.call(this,store,id);if(store==='bioeintraege'){await new Promise(r=>setTimeout(r,30));injected=true;throw new Error('Gezielter Abbruch nach Löschen');}};
 try {await migriereBioPartner();}catch(e){if(!injected)throw e;}finally{DB.del=del;}
 await S.load();await migriereBioPartner();
 return check(S.get('imkerei').oekoZertNummer==='BIO-123',{faultInjected:injected,remainingSources:(await DB.getAll('bioeintraege')).length,certificate:S.get('imkerei').oekoZertNummer||null});
});
async function invoiceSeed() {
 await DB.put('chargen',{id:'c',losnummer:'L1',mengeKg:5});
 const a=await DB.put('abfuellungen',{id:'a',chargeId:'c',gebindeG:500,anzahl:10,bestand:10});
 await DB.put('kontakte',{id:'k',name:'Testkunde'});
 return a;
}
await test('Q3','Rechnung prüft Summe mehrfach verwendeter Abfüllung',async()=>{
 const a=await invoiceSeed();const r=await DB.put('rechnungen',{id:'r',datum:'2026-09-21',kundeId:'k',status:'entwurf',steuerart:'klein',positionen:[{abfuellungId:'a',menge:6,einzelpreis:5},{abfuellungId:'a',menge:6,einzelpreis:5}]});
 await Views.rechnung.festschreiben(r,[a]);const stock=(await DB.get('abfuellungen','a')).bestand;
 return check(stock===10,{expected:10,actual:stock,status:(await DB.get('rechnungen','r')).status});
});
await test('Q4','Veralteter Rechnungsentwurf darf kein zweites Mal buchen',async()=>{
 const a=await invoiceSeed();const r=await DB.put('rechnungen',{id:'r',datum:'2026-09-21',kundeId:'k',status:'entwurf',steuerart:'klein',positionen:[{abfuellungId:'a',menge:2,einzelpreis:5}]});
 const stale=structuredClone(r);await Views.rechnung.festschreiben(r,[a]);await Views.rechnung.festschreiben(stale,[a]);
 const stock=(await DB.get('abfuellungen','a')).bestand,entries=(await DB.getAll('kassenbuch')).filter(x=>x.rechnungId==='r').length;
 return check(stock===8&&entries===1,{expectedStock:8,actualStock:stock,cashEntries:entries});
});
await test('Q10','Zusammenführen zweier Verkäufe bewahrt Gesamtbestand',async()=>{
 await invoiceSeed();await verkaufErfassen({abfuellungId:'a',anzahl:2,preisJeGlas:5});
 await merge({abfuellungen:[{id:'a',chargeId:'c',gebindeG:500,anzahl:10,bestand:7,lastModified:'2099-01-01T00:00:00.000Z'}],verkaeufe:[{id:'sale-b',abfuellungId:'a',anzahl:3,preisJeGlas:5,betrag:15}]});
 const stock=(await DB.get('abfuellungen','a')).bestand,sold=(await DB.getAll('verkaeufe')).reduce((n,v)=>n+v.anzahl,0);
 return check(stock===10-sold,{initial:10,sold,expected:10-sold,actual:stock});
});
await test('R1','Bestandskette verbraucht keine andere Glasgröße',async()=>{
 await DB.put('inventar',{id:'big',typ:'verbrauch',kategorie:'Gläser/Deckel',einheit:'Stück',bezeichnung:'Glas 500 g',gebindeG:500,stueckzahl:10});
 await DB.put('inventar',{id:'small',typ:'verbrauch',kategorie:'Gläser/Deckel',einheit:'Stück',bezeichnung:'Glas 250 g',gebindeG:250,stueckzahl:100});
 const booking=await verbrauchAbziehenKette('big',20,{pruefen:false});const small=(await DB.get('inventar','small')).stueckzahl;
 return check(small===100,{expectedSmall:100,actualSmall:small,booking});
});
await test('D1','Verkauf bei Schreibfehler hinterlässt keinen halben Vorgang',async()=>{
 await invoiceSeed();const put=DB.put;let error=null;
 DB.put=async function(store,...args){if(store==='kassenbuch')throw new DOMException('Gezielter Speicherausfall','QuotaExceededError');return put.call(this,store,...args);};
 try{await verkaufErfassen({abfuellungId:'a',anzahl:2,preisJeGlas:5});}catch(e){error=e.message;}finally{DB.put=put;}
 const stock=(await DB.get('abfuellungen','a')).bestand,sales=(await DB.getAll('verkaeufe')).length;
 return check(stock===10&&sales===0,{expectedStock:10,actualStock:stock,sales,injectedError:error});
});
await test('P1','Regelbesteuerung mit Rabatt und Skonto ohne Pfand',async()=>{
 const s=rechnungSummen({steuerart:'regel',datum:'2026-09-21',rabattTyp:'prozent',rabattWert:10,skontoProzent:2,skontoTage:7,positionen:[{menge:10,einzelpreis:10.7,steuersatz:7}]});
 return check(Math.abs(s.brutto-96.3)<1e-8&&Math.abs(s.steuern[7]-6.3)<1e-8&&Math.abs(s.skonto.zahlbetrag-94.374)<1e-8,s);
});
await test('P2','Kleinunternehmer ohne Steuerausweis',async()=>{const s=rechnungSummen({steuerart:'klein',positionen:[{menge:10,einzelpreis:10.7,steuersatz:7}]});return check(s.brutto===107&&Object.keys(s.steuern).length===0,s);});
await test('P3','Pauschalierung mit explizitem Satz 7,8 Prozent',async()=>{const s=rechnungSummen({steuerart:'pauschal24',pauschalsatz:7.8,positionen:[{menge:10,einzelpreis:10.78}]});return check(Math.abs(s.brutto-107.8)<1e-8&&Math.abs(s.steuern[7.8]-7.8)<1e-8,s);});
await test('P4','Futtermodell und Umkehrrechnung',async()=>{const f=futterAusZucker(25);return check(Math.abs(f.theoretisch-30)<1e-8&&Math.abs(f.tatsaechlich-25.5)<1e-8&&Math.abs(zuckerFuerFutter(25.5)-25)<1e-8,{f,reverse:zuckerFuerFutter(25.5)});});
await test('P5','Verkauf und Storno erhalten Honigmenge und Bestand',async()=>{await invoiceSeed();const v=await verkaufErfassen({abfuellungId:'a',anzahl:3,preisJeGlas:5});const sold=(await DB.get('abfuellungen','a')).bestand;await verkaufStornieren(v.id);const restored=(await DB.get('abfuellungen','a')).bestand;return check(sold===7&&restored===10,{stockAfterSale:sold,stockAfterCancel:restored});});
await test('P6','Materialabzug und Rückgabe über zwei gleichartige Posten',async()=>{for(const [id,n]of [['s1',10],['s2',20]])await DB.put('inventar',{id,typ:'verbrauch',kategorie:'Futter/Zucker',einheit:'kg',stueckzahl:n});const b=await verbrauchAbziehenKette('s1',15,{pruefen:false});await verbrauchZurueckbuchen(b.abzug,{pruefen:false});const stocks=(await DB.getAll('inventar')).map(x=>x.stueckzahl);return check(stocks[0]===10&&stocks[1]===20,{booking:b,restored:stocks});});
await test('P7','Formelobjekt wird vor Excel-Ausgabe Text',async()=>{const v=Xlsx.zelleSicher({t:'n',f:'1+1',v:2});return check(typeof v==='string',{actual:v});});
await test('P8','CSV-Formeltext wird geschützt',async()=>{const v=Xlsx.zelleSicher('=1+1');return check(v==="'=1+1",{actual:v});});

/* EXTRA */
await test('BIO-commit','Bio-Migration wartet auf dauerhafte Zielbuchung',async()=>{
 await S.set('bioPartnerMigriert',false);await DB.put('bioeintraege',{id:'z',bereich:'zertifikat',art:'Eigener Betrieb',nummer:'CERT-1'});
 const orig=IDBObjectStore.prototype.put;let injected=false;
 IDBObjectStore.prototype.put=function(o,...args){const rq=orig.call(this,o,...args);if(this.name==='settings'&&o.key==='imkerei'){const tx=this.transaction;rq.addEventListener('success',()=>{injected=true;tx.abort();});}return rq;};
 let error;try{await migriereBioPartner();}catch(e){error=e.message;}finally{IDBObjectStore.prototype.put=orig;}
 await S.load();const cert=S.get('imkerei').oekoZertNummer,source=await DB.get('bioeintraege','z');return check(cert==='CERT-1'||!!source,{injected,error,cert:cert||null,source:source||null});
});
await test('XSS-label','Losnummer im Etikettformular bleibt Text',async h=>{
 await merge({chargen:[{id:'c',losnummer:payload,mengeKg:10}],abfuellungen:[{id:'a',chargeId:'c',anzahl:10,bestand:10,gebindeG:500,datum:'2026-09-21'}]});await honigEtikettForm(await DB.get('abfuellungen','a'),await DB.get('chargen','c'));await pause(100);return check(window.__auditHit===0,{scriptExecutions:window.__auditHit});
});
await test('MONEY-zero','Netto-Summe umfasst auch Position mit Satz 0',async()=>{
 const r={steuerart:'regel',positionen:[{menge:1,einzelpreis:107,steuersatz:7},{menge:1,einzelpreis:50,steuersatz:0}]};const sum=rechnungSummen(r);const net=Object.values(sum.nettoJeSatz).reduce((a,b)=>a+b,0);return check(net===150,{expectedNet:150,actualNet:net,brutto:sum.brutto,taxes:sum.steuern});
});
await test('MONEY-pfand24','Pfand-Steuereinstellung wird bei Pauschalierung beachtet',async()=>{
 const sum=rechnungSummen({steuerart:'pauschal24',pauschalsatz:7.8,pfandSteuersatz:7.8,positionen:[{menge:10,einzelpreis:10.78,pfand:1.078}]});return check(Math.abs(sum.steuern[7.8]-8.58)<0.001,{expectedTax:8.58,actualTax:sum.steuern[7.8],brutto:sum.brutto});
});
await test('STALE-edit','Alter Rechnungseditor überschreibt Festschreibung nicht',async h=>{
 const a=await invoiceSeed();const r=await DB.put('rechnungen',{id:'r',datum:'2026-09-21',kundeId:'k',status:'entwurf',steuerart:'klein',positionen:[{abfuellungId:'a',menge:2,einzelpreis:5}]});await Views.rechnung.render(h,'r');const change=h.querySelector('#r-datum').onchange;
 await Views.rechnung.festschreiben(structuredClone(r),[a]);await change({target:{value:'2026-09-22'}});
 const after=await DB.get('rechnungen','r');return check(after.status==='festgeschrieben',{expected:'festgeschrieben',actual:after.status,number:after.nummer});
});
await test('XSS-invoice-tax','Rechnungs-Steuersatz bleibt Text',async h=>{
 await merge({rechnungen:[{id:'r',datum:'2026-09-21',status:'entwurf',steuerart:'regel',positionen:[{text:'Honig',menge:1,einzelpreis:10,steuersatz:payload}]}]});return renderAttack(h,'rechnung','r');
});
await test('XSS-invoice-deadline','Rechnungs-Zahlungsziel bleibt Text',async h=>{
 await merge({rechnungen:[{id:'r',datum:'2026-09-21',status:'entwurf',steuerart:'klein',zahlungszielTage:'">'+payload,positionen:[]}]});return renderAttack(h,'rechnung','r');
});
await test('XSS-hive-status','Volksstatus bleibt Text',async h=>{
 await merge({voelker:[{id:'v',name:'Anna',status:payload,historie:[]}]});return renderAttack(h,'volk','v');
});
await test('XSS-treatment','Wartezeit bleibt Text',async h=>{
 await merge({behandlungen:[{id:'b',datum:'2026-09-21',mittel:'Test',menge:1,wartezeitTage:payload}]});return renderAttack(h,'behandlungen');
});
await test('XSS-bottling','Abfüllungsanzahl bleibt Text',async h=>{
 await merge({chargen:[{id:'c',losnummer:'L1',mengeKg:10}],abfuellungen:[{id:'a',chargeId:'c',anzahl:payload,bestand:1,gebindeG:500,datum:'2026-09-21'}]});await Views.honig.tabAbfuellung(h);await pause(100);return check(window.__auditHit===0,{scriptExecutions:window.__auditHit});
});
await test('XSS-sale','Verkaufsanzahl bleibt Text',async h=>{
 await merge({verkaeufe:[{id:'v',anzahl:payload,betrag:5,datum:'2026-09-21'}]});await Views.honig.tabVerkaeufe(h);await pause(100);return check(window.__auditHit===0,{scriptExecutions:window.__auditHit});
});
await test('XSS-bio-date','Datum der Bio-Erhebung bleibt Text',async h=>{
 await merge({staende:[{id:'s',name:'Stand',bio:{erhebung:'">'+payload}}]});await Views.bio.standortForm(await DB.get('staende','s'));await pause(100);return check(window.__auditHit===0,{scriptExecutions:window.__auditHit});
});
await test('XSS-breeding-day','Zuchttag bleibt Text',async h=>{
 await merge({zuchtserien:[{id:'z',name:'Serie',startdatum:'2026-09-21',anzahl:1,termine:[{tag:payload,titel:'Test',datum:'2026-09-21'}]}]});await Views.zucht.detail(await DB.get('zuchtserien','z'));await pause(100);return check(window.__auditHit===0,{scriptExecutions:window.__auditHit});
});
await test('Q1-edit','Fütterungsänderung im Volk korrigiert Material',async h=>{
 await DB.put('inventar',{id:'s',stueckzahl:25,einheit:'kg',typ:'verbrauch',kategorie:'Futter'});await DB.put('fuetterungen',{id:'f',volkId:'v',datum:'2026-09-21',futterart:'Zuckerwasser 3:2',mengeKg:15,verbrauchAbzug:[{inventarId:'s',menge:15}]});
 await Views.volk.tabFutter(h,{id:'v',name:'Anna'});let opts;const old=UI.formModal;UI.formModal=function(o){opts=o;return old.call(this,o);};
 try{h.querySelector('[data-fe]').click();for(let n=0;n<100&&!opts;n++)await pause(5);if(!opts)throw new Error('Form nicht geöffnet');await opts.onSave({datum:'2026-09-21',futterart:'Zuckerwasser 3:2',mengeKg:20});}finally{UI.formModal=old;}
 const stock=(await DB.get('inventar','s')).stueckzahl;return check(stock===20,{expected:20,actual:stock});
});
await test('R2-edit','Abfüllkorrektur merkt keinen nie gebuchten Abzug',async()=>{
 await DB.put('chargen',{id:'c',mengeKg:20,losnummer:'L1'});await DB.put('inventar',{id:'g',stueckzahl:0,einheit:'Stück',typ:'verbrauch'});const a=await DB.put('abfuellungen',{id:'a',chargeId:'c',anzahl:10,bestand:10,gebindeG:500,verbrauchAbzug:[{inventarId:'g',menge:10}]});
 let opts;const old=UI.formModal;UI.formModal=o=>{opts=o;};try{await Views.honig.abfuellEditForm(a);await opts.onSave({anzahl:20,bestand:20,gebindeG:500,datum:'2026-09-21'});}finally{UI.formModal=old;}
 const rec=await DB.get('abfuellungen','a');await verbrauchZurueckbuchen(rec.verbrauchAbzug,{pruefen:false});const stock=(await DB.get('inventar','g')).stueckzahl;return check(stock===10,{expected:10,actual:stock,remembered:rec.verbrauchAbzug});
});
await test('Q8-render','Marktkorb behält Fehlposition auch nach Neuzeichnen',async h=>{
 const a=await invoiceSeed();a.bestand=1;await DB.put('abfuellungen',a);const korb={a:4};Views.markt._korb=korb;const old=window.renderRoute;window.renderRoute=async()=>{};try{await Views.markt.kassieren(korb,[a],()=>5,20);await Views.markt.render(h);}finally{window.renderRoute=old;}
 return check(Views.markt._korb.a===4,{expected:{a:4},actual:Views.markt._korb});
});
await test('TX-sync','Synchroner Fehler nach eingereihtem Put rollt zurück',async()=>{
 await DB.put('kontakte',{id:'k',name:'vorher'});
 let error;const unhandled=[];const handler=e=>{unhandled.push(String(e.reason));e.preventDefault();};window.addEventListener('unhandledrejection',handler);
 try{await DB.schreibeAlles([{op:'put',store:'kontakte',obj:{id:'k',name:'nachher'}},{op:'put',store:'settings',obj:{value:1}}]);}catch(e){error=e.name;}
 await pause(100);window.removeEventListener('unhandledrejection',handler);
 const k=await DB.get('kontakte','k');return check(k.name==='vorher',{error,name:k.name,unhandled});
});
await test('TX-async','Abbruch nach Request-Erfolg rollt beide Speicher zurück',async()=>{
 await DB.put('kontakte',{id:'k',name:'vorher'});await DB.put('staende',{id:'s',name:'vorher'});
 const orig=IDBObjectStore.prototype.put;let injected=false,error;
 IDBObjectStore.prototype.put=function(...a){const rq=orig.apply(this,a);if(this.name==='staende'){const tx=this.transaction;rq.addEventListener('success',()=>{injected=true;tx.abort();});}return rq;};
 try{await DB.schreibeAlles([{op:'put',store:'kontakte',obj:{id:'k',name:'nachher'}},{op:'put',store:'staende',obj:{id:'s',name:'nachher'}}]);}catch(e){error=e.name;}finally{IDBObjectStore.prototype.put=orig;}
 const rows=await Promise.all([DB.get('kontakte','k'),DB.get('staende','s')]);return check(injected&&rows.every(x=>x.name==='vorher'),{injected,error,rows});
});
await test('Q4-dialog','Zwei offene Bestätigungen derselben Rechnung',async()=>{
 const a=await invoiceSeed();const r=await DB.put('rechnungen',{id:'r',datum:'2026-09-21',kundeId:'k',status:'entwurf',steuerart:'klein',positionen:[{abfuellungId:'a',menge:2,einzelpreis:5}]});
 const waiting=[];UI.confirm=()=>new Promise(res=>waiting.push(res));
 const first=Views.rechnung.festschreiben(structuredClone(r),[a]);while(waiting.length<1)await pause(5);
 const second=Views.rechnung.festschreiben(structuredClone(r),[a]);while(waiting.length<2)await pause(5);
 waiting[0](true);await first;waiting[1](true);await second;
 const stock=(await DB.get('abfuellungen','a')).bestand,entries=(await DB.getAll('kassenbuch')).filter(x=>x.rechnungId==='r');
 return check(stock===8&&entries.length===1,{expectedStock:8,actualStock:stock,cashEntries:entries.length,amount:U.sum(entries,x=>x.betrag)});
});
await test('R2-return','Tatsächlich abgezogen bei leerem Materiallager',async()=>{
 await DB.put('inventar',{id:'g',typ:'verbrauch',einheit:'Stück',stueckzahl:0});
 const result=await verbrauchAbziehen('g',10,{pruefen:false});return check(result.abgezogen===0,{expected:0,actual:result.abgezogen,result});
});
await test('RESTORE-short','Wiederherstellen bei knappem Lager erzeugt keine Mengen',async()=>{
 await DB.put('inventar',{id:'s',typ:'verbrauch',einheit:'kg',stueckzahl:5});
 await DB.put('papierkorb',{id:'t',store:'fuetterungen',daten:{id:'f',verbrauchAbzug:[{inventarId:'s',menge:15}]}});
 let error;try{await DB.trashRestore('t');}catch(e){error=e.message;}
 const stock=(await DB.get('inventar','s')).stueckzahl, f=await DB.get('fuetterungen','f'), trash=await DB.get('papierkorb','t');
 return check(!!error&&stock===5&&!f&&!!trash,{expected:'Wiederherstellung abgelehnt, Bestand 5, Quelle erhalten',actual:stock,error,restored:!!f,trashPreserved:!!trash});
});
await test('RESTORE-repeat','Mehrere Abzüge desselben Postens werden summiert',async()=>{
 await DB.put('inventar',{id:'s',typ:'verbrauch',einheit:'Stück',stueckzahl:30});
 await DB.put('papierkorb',{id:'t',store:'abfuellungen',daten:{id:'a',verbrauchAbzug:[{inventarId:'s',menge:10},{inventarId:'s',menge:5}]}});
 await DB.trashRestore('t');const stock=(await DB.get('inventar','s')).stueckzahl;return check(stock===15,{expected:15,actual:stock});
});
await test('MERGE-abort','Merge und Bestandskorrektur gehören zusammen',async()=>{
 await invoiceSeed();const put=DB.put;DB.put=async function(st,...args){if(st==='abfuellungen')throw new Error('Abgleich-Abbruch');return put.call(this,st,...args);};
 let error;try{await merge({verkaeufe:[{id:'v',abfuellungId:'a',anzahl:3}]});}catch(e){error=e.message;}finally{DB.put=put;}
 const stock=(await DB.get('abfuellungen','a')).bestand, sales=(await DB.getAll('verkaeufe')).length;
 return check(stock===7||sales===0,{error,stock,sales,expected:'kein Verkauf oder Bestand 7'});
});
await test('MIGRATE-retry','Wiederanlauf nach abgeschlossenem Chargen-Commit',async()=>{
 await S.set('abfuellungMigriert',false);await DB.put('chargen',{id:'c',glasGroesseG:500,anzahlGlaeser:10});await DB.put('verkaeufe',{id:'v',chargeId:'c',anzahl:1});
 const write=DB.schreibeAlles;let injected=false;DB.schreibeAlles=async function(ops){await write.call(this,ops);if(ops.some(x=>x.store==='chargen')){injected=true;throw new Error('Abbruch nach Commit');}};
 try{await migriereChargenAbfuellung();}catch(e){if(!injected)throw e;}finally{DB.schreibeAlles=write;}
 await S.load();await migriereChargenAbfuellung();const v=await DB.get('verkaeufe','v'),bottlings=await DB.getAll('abfuellungen');return check(bottlings.length===1&&v.abfuellungId===bottlings[0].id,{injected,v,bottlings});
});
await test('MONEY-string','Importierter numerischer Steuersatz als Text',async()=>{
 const r={steuerart:'regel',positionen:[{menge:1,einzelpreis:107,steuersatz:'7'}]};await merge({rechnungen:[{id:'r',...r}]});const sum=rechnungSummen(await DB.get('rechnungen','r'));return check(Math.abs(sum.steuern[7]-7)<0.001,{expectedTax:7,actualTax:sum.steuern[7]});
});
await test('BACKUP-flag','Festschreiben merkt Änderungen seit Sicherung',async()=>{
 const a=await invoiceSeed();const r=await DB.put('rechnungen',{id:'r',datum:'2026-09-21',kundeId:'k',status:'entwurf',steuerart:'klein',positionen:[{abfuellungId:'a',menge:2,einzelpreis:5}]});window._changedSinceBackup=false;
 await Views.rechnung.festschreiben(r,[a]);return check(window._changedSinceBackup===true,{changed:window._changedSinceBackup});
});
UI.confirm=originalConfirm;
return {results,pass:results.filter(x=>x.status==='PASS').length,fail:results.filter(x=>x.status==='FAIL').length,errors:results.filter(x=>x.status==='ERROR').length};
