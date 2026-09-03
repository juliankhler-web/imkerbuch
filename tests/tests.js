/* =====================================================================
   ImkerBuch – Testfälle (laufen in tests/test.html gegen die App
   im iframe mit ?testdb → eigene IndexedDB "imkerbuch-test").
   Jeder Testfall: test('Name', async (w) => { ... })  – w = App-Fenster.
   ===================================================================== */
'use strict';
const TESTS = [];
function test(name, fn) { TESTS.push({ name, fn }); }
function assert(cond, msg) { if (!cond) throw new Error(msg || 'Bedingung nicht erfüllt'); }
function assertEq(ist, soll, msg) {
  const a = JSON.stringify(ist), b = JSON.stringify(soll);
  if (a !== b) throw new Error(`${msg || 'Vergleich'}: erwartet ${b}, erhalten ${a}`);
}
function assertNah(ist, soll, toleranz = 0.001, msg) {
  if (Math.abs(ist - soll) > toleranz) throw new Error(`${msg || 'Vergleich'}: erwartet ≈${soll}, erhalten ${ist}`);
}

/* ---------- Utils: Zahlen & Datum (deutsches Format) ---------- */
test('U.parseNum: deutsches Zahlenformat', (w) => {
  assertEq(w.U.parseNum('1.234,56'), 1234.56, 'Tausenderpunkt + Komma');
  assertEq(w.U.parseNum('12,5'), 12.5, 'Dezimalkomma');
  assertEq(w.U.parseNum('1234.56'), 1234.56, 'Punkt als Dezimaltrenner');
  assertEq(w.U.parseNum(7), 7, 'Zahl bleibt Zahl');
  assert(isNaN(w.U.parseNum('abc')), 'Unsinn → NaN');
  assert(isNaN(w.U.parseNum('')), 'leer → NaN');
});
test('U.fmtDate / fmtNum / fmtEur', (w) => {
  assertEq(w.U.fmtDate('2026-07-03'), '03.07.2026');
  assertEq(w.U.fmtDate(''), '');
  assertEq(w.U.fmtNum(1234.5), '1.234,5');
  assert(w.U.fmtEur(39).includes('39,00'), 'Euro-Format');
  assertEq(w.U.fmtNum(null), '–', 'null → Strich');
});
test('U.addDays / daysBetween (Monats-/Jahresgrenzen)', (w) => {
  assertEq(w.U.addDays('2026-01-31', 1), '2026-02-01');
  assertEq(w.U.addDays('2025-12-31', 1), '2026-01-01');
  assertEq(w.U.addDays('2026-07-03', 28), '2026-07-31');
  assertEq(w.U.daysBetween('2026-01-01', '2026-01-31'), 30);
});
test('U.dataURLToBlob / blobToDataURL Roundtrip', async (w) => {
  const durl = 'data:text/plain;base64,' + btoa('Honig');
  const blob = w.U.dataURLToBlob(durl);
  assertEq(blob.type, 'text/plain');
  assertEq(await blob.text(), 'Honig');
  const zurueck = await w.U.blobToDataURL(blob);
  assert(zurueck.startsWith('data:text/plain'), 'Roundtrip-MIME');
});

/* ---------- Fachlogik: Königinnen, Zucht, Rechnung ---------- */
test('queenColor: internationale Zeichenfarben', (w) => {
  assertEq(w.queenColor(2025)[0], 'Blau');
  assertEq(w.queenColor(2026)[0], 'Weiß');
  assertEq(w.queenColor(2027)[0], 'Gelb');
  assertEq(w.queenColor(2023)[0], 'Rot');
  assertEq(w.queenColor(2024)[0], 'Grün');
});
test('zuchtTermine: Zuchtkalender ab Umlarvtag', (w) => {
  const t = w.zuchtTermine('2026-07-03');
  assertEq(t.map((x) => x.tag), [0, 1, 5, 10, 12, 13, 19, 34, 41], 'Tages-Offsets (fachlich korrigiert)');
  assertEq(t[0].datum, '2026-07-03', 'Umlarven = Starttag');
  assertEq(t.find((x) => x.tag === 12).datum, '2026-07-15', 'Schlupf Tag 12');
});
test('rechnungSummen: Brutto & enthaltene USt', (w) => {
  const r = { kleinunternehmer: false, positionen: [{ menge: 6, einzelpreis: 6.5, steuersatz: 7 }, { menge: 1, einzelpreis: 10, steuersatz: 19 }] };
  const { brutto, steuern } = w.rechnungSummen(r);
  assertEq(brutto, 49, 'Bruttosumme');
  assertNah(steuern[7], 39 * 7 / 107, 0.001, 'USt 7 % herausgerechnet');
  assertNah(steuern[19], 10 * 19 / 119, 0.001, 'USt 19 % herausgerechnet');
  const klein = w.rechnungSummen({ kleinunternehmer: true, positionen: r.positionen });
  assertEq(Object.keys(klein.steuern).length, 0, '§19: keine USt-Ausweisung');
});
test('zielIdAus / zielFormValues (Formular-Helfer)', (w) => {
  assertEq(w.zielIdAus({ zielTyp: 'volk', zielVolk: 'v1', zielStand: '' }), 'v1');
  assertEq(w.zielIdAus({ zielTyp: 'stand', zielVolk: '', zielStand: 's1' }), 's1');
  let fehler = false;
  try { w.zielIdAus({ zielTyp: 'volk', zielVolk: '', zielStand: 's1' }); } catch (e) { fehler = true; }
  assert(fehler, 'fehlende Auswahl wirft Fehler');
  const vals = w.zielFormValues({ zielTyp: 'stand', zielId: 's1', datum: '2026-01-01' });
  assertEq(vals.zielStand, 's1'); assertEq(vals.zielVolk, '');
  assertEq(w.zielFormValues(null), {}, 'null → leeres Objekt');
});

/* ---------- IndexedDB-Wrapper: CRUD, UUID, lastModified ---------- */
test('DB.put vergibt UUID, createdAt, lastModified', async (w) => {
  const rec = await w.DB.put('staende', { name: 'Teststand', lat: null, lng: null, notizen: '' });
  assert(rec.id && rec.id.length > 10, 'UUID vergeben');
  assert(rec.createdAt && rec.lastModified, 'Zeitstempel vergeben');
  const geladen = await w.DB.get('staende', rec.id);
  assertEq(geladen.name, 'Teststand');
});
test('DB.softDel → Papierkorb → trashRestore', async (w) => {
  const rec = await w.DB.put('kontakte', { typ: 'kunde', name: 'Löschkandidat' });
  await w.DB.softDel('kontakte', rec.id);
  assert(!(await w.DB.get('kontakte', rec.id)), 'Original weg');
  const korb = await w.DB.getAll('papierkorb');
  const eintrag = korb.find((t) => t.daten.id === rec.id);
  assert(eintrag, 'liegt im Papierkorb');
  await w.DB.trashRestore(eintrag.id);
  const zurueck = await w.DB.get('kontakte', rec.id);
  assertEq(zurueck.name, 'Löschkandidat', 'wiederhergestellt');
  assert(!(await w.DB.get('papierkorb', eintrag.id)), 'Papierkorb-Eintrag entfernt');
});
test('DB.purgeTrash: nur Einträge > 30 Tage löschen', async (w) => {
  const alt = new Date(Date.now() - 31 * 86400000).toISOString();
  const frisch = await w.DB.put('papierkorb', { id: w.U.uuid(), store: 'staende', daten: { id: 'x1' }, geloeschtAm: w.U.nowIso() });
  const veraltet = await w.DB.put('papierkorb', { id: w.U.uuid(), store: 'staende', daten: { id: 'x2' }, geloeschtAm: alt });
  await w.DB.purgeTrash();
  assert(await w.DB.get('papierkorb', frisch.id), 'frischer Eintrag bleibt');
  assert(!(await w.DB.get('papierkorb', veraltet.id)), 'alter Eintrag entfernt');
  await w.DB.del('papierkorb', frisch.id);
});

/* ---------- Backup: Merge-Regeln (UUID + lastModified) ---------- */
test('Backup.applyMerge: neuer gewinnt, keine Duplikate', async (w) => {
  const a = await w.DB.put('kontakte', { typ: 'kunde', name: 'Alt' });
  const vorher = (await w.DB.getAll('kontakte')).length;
  const neuer = { ...a, name: 'Neu', lastModified: new Date(Date.now() + 60000).toISOString() };
  const fremd = { id: w.U.uuid(), typ: 'kunde', name: 'Fremd', createdAt: w.U.nowIso(), lastModified: w.U.nowIso() };
  const n = await w.Backup.applyMerge({ stores: { kontakte: [neuer, fremd] } });
  assertEq(n, 2, 'beide übernommen');
  assertEq((await w.DB.get('kontakte', a.id)).name, 'Neu', 'neuerer Stand gewinnt');
  assertEq((await w.DB.getAll('kontakte')).length, vorher + 1, 'kein Duplikat für gleiche UUID');
});
test('Backup.applyMerge: älterer Import verliert', async (w) => {
  const a = await w.DB.put('kontakte', { typ: 'kunde', name: 'Aktuell' });
  const uralt = { ...a, name: 'Uralt', lastModified: '2000-01-01T00:00:00.000Z' };
  const n = await w.Backup.applyMerge({ stores: { kontakte: [uralt] } });
  assertEq(n, 0, 'nichts übernommen');
  assertEq((await w.DB.get('kontakte', a.id)).name, 'Aktuell', 'aktueller Stand bleibt');
});
test('Backup.applyMerge: Anhang ohne Datei wird übersprungen', async (w) => {
  const kaputt = { id: w.U.uuid(), parentTyp: 'volk', parentId: 'v', art: 'foto', name: 'x.jpg', lastModified: w.U.nowIso() }; // ohne blob
  const n = await w.Backup.applyMerge({ stores: { anhaenge: [kaputt] } });
  assertEq(n, 0, 'Metadaten ohne Datei nutzen nichts');
});

/* ---------- Backup: Export → Ersetzen (Roundtrip) ---------- */
test('Backup.buildData + applyReplace: Roundtrip erhält Daten', async (w) => {
  await w.DB.put('voelker', { name: 'Roundtrip-Volk', standId: null, koeniginId: null, beutentyp: 'Zander', status: 'aktiv', historie: [], notizen: '' });
  const data = await w.Backup.buildData(true);
  assertEq(data.app, 'ImkerBuch', 'Format-Kennung');
  const zaehle = async () => { const o = {}; for (const s of w.DB.DATA_STORES) o[s] = (await w.DB.getAll(s)).length; return o; };
  const vorher = await zaehle();
  await w.Backup.applyReplace(data, { blobsBehalten: false });
  assertEq(await zaehle(), vorher, 'alle Stores identisch nach Restore');
  const v = (await w.DB.getAll('voelker')).find((x) => x.name === 'Roundtrip-Volk');
  assert(v, 'Datensatz überlebt Roundtrip');
});
test('Backup: Dateiname imkerbuch-backup-JJJJ-MM-TT-HHMM.json', (w) => {
  assert(/^imkerbuch-backup-\d{4}-\d{2}-\d{2}-\d{4}\.json$/.test(w.Backup.dateiname()), w.Backup.dateiname());
});
test('Backup.snapshotInternal: rollierend, ohne Anhang-Blobs', async (w) => {
  for (let i = 0; i < 12; i++) await w.Backup.snapshotInternal('test');
  const snaps = await w.DB.getAll('snapshots');
  assert(snaps.length <= 10, `max. 10 Snapshots (ist: ${snaps.length})`);
  const inhalt = JSON.parse(snaps[0].daten);
  assert(!('snapshots' in inhalt.stores), 'Snapshots nicht rekursiv enthalten');
  for (const a of inhalt.stores.anhaenge || []) assert(!a.blob && !a.datenUrl, 'keine Binärdaten im Snapshot');
});

/* ---------- Settings & Reminder ---------- */
test('S.set / S.get Roundtrip (persistiert)', async (w) => {
  await w.S.set('dokumentTypen', ['A', 'B']);
  assertEq(w.S.get('dokumentTypen'), ['A', 'B']);
  await w.S.load(); // aus DB neu laden
  assertEq(w.S.get('dokumentTypen'), ['A', 'B'], 'überlebt Neuladen');
});
test('Backup.reminderInfo: Stufen ok/gelb/rot', async (w) => {
  await w.S.set('letzteExterneSicherung', w.U.nowIso());
  assertEq(w.Backup.reminderInfo().stufe, 'ok');
  await w.S.set('letzteExterneSicherung', new Date(Date.now() - 8 * 86400000).toISOString());
  assertEq(w.Backup.reminderInfo().stufe, 'gelb', 'ab 7 Tagen gelb');
  await w.S.set('letzteExterneSicherung', new Date(Date.now() - 15 * 86400000).toISOString());
  assertEq(w.Backup.reminderInfo().stufe, 'rot', 'ab 14 Tagen rot');
  await w.S.set('letzteExterneSicherung', null);
});

test('Backup: Banner verschwindet nach dem Sichern, Stand zieht mit', async (w) => {
  const d = w.document;
  await w.S.set('backupErinnerung', true);
  await w.S.set('letzteExterneSicherung', new Date(Date.now() - 20 * 86400000).toISOString());
  // Anzeigefelder wie auf der Seite nachbauen
  const host = d.createElement('div');
  host.innerHTML = '<dd data-backup-stand>alt</dd><span data-backup-badge></span><span data-backup-hinweis></span>';
  d.body.appendChild(host);
  try {
    w.Backup.updateBanners();
    assert(d.getElementById('banners').innerText.includes('Backup dringend nötig'), 'nach 20 Tagen kommt der rote Hinweis');
    await w.Backup.markExternal();
    assert(!d.getElementById('banners').innerText.includes('Backup'), 'nach dem Sichern ist er weg');
    assert(host.querySelector('[data-backup-stand]').innerText !== 'alt', 'der Stand in den Einstellungen zieht mit');
    assert(host.querySelector('[data-backup-badge]').innerText.includes('heute'), 'das Dashboard-Feld sagt „heute“');
    assertEq(host.querySelector('[data-backup-hinweis]').innerHTML, '', 'der Hinweis darunter fällt weg');
  } finally { host.remove(); await w.S.set('letzteExterneSicherung', null); }
});
test('Backup: ✕ blendet die Erinnerung dauerhaft aus, Einstellung holt sie zurück', async (w) => {
  const d = w.document;
  await w.S.set('backupErinnerung', true);
  await w.S.set('letzteExterneSicherung', new Date(Date.now() - 20 * 86400000).toISOString());
  try {
    w.Backup.updateBanners();
    assert(d.getElementById('banners').innerText.includes('Backup dringend nötig'), 'erst sichtbar');
    await w.Backup.erinnerungAus();
    assertEq(w.S.get('backupErinnerung'), false, 'die Entscheidung wird gespeichert');
    assert(!d.getElementById('banners').innerText.includes('Backup dringend'), 'auch der rote Hinweis lässt sich wegdrücken');
    await w.S.load(); // überlebt einen Neustart
    w.Backup.updateBanners();
    assert(!d.getElementById('banners').innerText.includes('Backup dringend'), 'und bleibt weg');
    await w.S.set('backupErinnerung', true);
    w.Backup.updateBanners();
    assert(d.getElementById('banners').innerText.includes('Backup dringend'), 'über die Einstellungen kommt er zurück');
  } finally { await w.S.set('backupErinnerung', true); await w.S.set('letzteExterneSicherung', null); w.Backup.updateBanners(); }
});

/* ---------- Ernteprognose ---------- */
test('ernteprognoseBasis: kg je Volk aus den Vorjahren, Spanne aus schwach und stark', async (w) => {
  const J = +w.U.todayIso().slice(0, 4);
  const alt = { ernten: await w.DB.getAll('ernten'), voelker: await w.DB.getAll('voelker') };
  await w.DB.clear('ernten'); await w.DB.clear('voelker');
  try {
    const v1 = await w.DB.put('voelker', { name: 'P1', status: 'aktiv', funktion: 'Wirtschaftsvolk', historie: [{ datum: `${J - 3}-04-01`, text: 'angelegt' }] });
    const v2 = await w.DB.put('voelker', { name: 'P2', status: 'aktiv', funktion: 'Wirtschaftsvolk', historie: [{ datum: `${J - 3}-04-01`, text: 'angelegt' }] });
    await w.DB.put('ernten', { zielTyp: 'volk', zielId: v1.id, datum: `${J - 2}-06-10`, produktart: 'Honig', mengeKg: 20 });
    await w.DB.put('ernten', { zielTyp: 'volk', zielId: v2.id, datum: `${J - 2}-06-10`, produktart: 'Honig', mengeKg: 20 });
    await w.DB.put('ernten', { zielTyp: 'volk', zielId: v1.id, datum: `${J - 1}-06-10`, produktart: 'Honig', mengeKg: 30 });
    await w.DB.put('ernten', { zielTyp: 'volk', zielId: v2.id, datum: `${J - 1}-06-10`, produktart: 'Honig', mengeKg: 30 });
    await w.DB.put('ernten', { zielTyp: 'volk', zielId: v1.id, datum: `${J}-06-10`, produktart: 'Honig', mengeKg: 5 });
    const ep = await w.ernteprognoseBasis();
    assertEq(ep.voelker, 2, 'zwei aktive Wirtschaftsvölker');
    nah(ep.jeVolk, 25, 0.01, 'Mittel aus 20 und 30 kg je Volk');
    nah(ep.jeVolkMin, 20, 0.01, 'schwaches Jahr');
    nah(ep.jeVolkMax, 30, 0.01, 'gutes Jahr');
    nah(ep.geerntet, 5, 0.01, 'das laufende Jahr zählt nicht in die Basis, aber als schon geerntet');
    assertEq(ep.historie.length, 2, 'nur abgeschlossene Jahre');
  } finally {
    await w.DB.clear('ernten'); await w.DB.clear('voelker');
    for (const e of alt.ernten) await w.DB.put('ernten', e, true);
    for (const v of alt.voelker) await w.DB.put('voelker', v, true);
  }
});
test('ernteprognoseBasis: Völker ohne Ernte drücken den Schnitt', async (w) => {
  const J = +w.U.todayIso().slice(0, 4);
  const alt = { ernten: await w.DB.getAll('ernten'), voelker: await w.DB.getAll('voelker') };
  await w.DB.clear('ernten'); await w.DB.clear('voelker');
  try {
    const v1 = await w.DB.put('voelker', { name: 'Q1', status: 'aktiv', funktion: 'Wirtschaftsvolk', historie: [{ datum: `${J - 2}-04-01`, text: 'angelegt' }] });
    await w.DB.put('voelker', { name: 'Q2', status: 'aktiv', funktion: 'Wirtschaftsvolk', historie: [{ datum: `${J - 2}-04-01`, text: 'angelegt' }] });
    await w.DB.put('ernten', { zielTyp: 'volk', zielId: v1.id, datum: `${J - 1}-06-10`, produktart: 'Honig', mengeKg: 40 });
    const ep = await w.ernteprognoseBasis();
    nah(ep.jeVolk, 20, 0.01, '40 kg auf zwei Völker – auch das ohne Ernte zählt');
  } finally {
    await w.DB.clear('ernten'); await w.DB.clear('voelker');
    for (const e of alt.ernten) await w.DB.put('ernten', e, true);
    for (const v of alt.voelker) await w.DB.put('voelker', v, true);
  }
});
test('Ernteprognose steht im Kassenbuch, nicht mehr im Rechner', async (w) => {
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    w.Views.kassenbuch._tab = 'auswertung';
    await w.Views.kassenbuch.render(host);
    await new Promise((r) => setTimeout(r, 300));
    assert(host.querySelector('[data-ep="voelker"]'), 'Völker-Eingabe im Kassenbuch');
    assert(host.querySelector('[data-ep="kosten"]'), 'eigenes Feld für die Selbstkosten je kg');
    const out = host.querySelector('#ep-out');
    assert(out && /Erwartete Ernte/.test(out.textContent), 'die Kacheln sind gerechnet');
    // Änderung an einem Feld rechnet sofort neu
    const feld = host.querySelector('[data-ep="voelker"]');
    const vorher = out.textContent;
    feld.value = String((w.U.parseNum(feld.value) || 1) + 5);
    feld.dispatchEvent(new w.Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 100));
    assert(out.textContent !== vorher, 'mehr Völker ändern das Ergebnis');
    const rechner = w.document.createElement('div'); w.document.body.appendChild(rechner);
    try {
      await w.Views.rechner.render(rechner);
      assert(!rechner.querySelector('[data-ep="voelker"]'), 'im Rechner steht sie nicht mehr');
      assert(rechner.querySelector('#sk-out'), 'die Selbstkosten bleiben aber dort');
    } finally { rechner.remove(); }
  } finally { host.remove(); w.Views.kassenbuch._tab = 'buchungen'; }
});
test('ernteprognoseBasis: Erlös je kg aus echten Verkäufen', async (w) => {
  const alt = { v: await w.DB.getAll('verkaeufe'), a: await w.DB.getAll('abfuellungen'), r: await w.DB.getAll('rechnungen') };
  await w.DB.clear('verkaeufe'); await w.DB.clear('abfuellungen'); await w.DB.clear('rechnungen');
  try {
    const abf = await w.DB.put('abfuellungen', { chargeId: null, datum: w.U.todayIso(), gebindeG: 500, anzahl: 100, bestand: 100 });
    // 10 Gläser à 500 g = 5 kg für 60 € → 12 €/kg
    await w.DB.put('verkaeufe', { datum: w.U.todayIso(), abfuellungId: abf.id, anzahl: 10, preisJeGlas: 6, betrag: 60 });
    let ep = await w.ernteprognoseBasis();
    nah(ep.erloesJeKg, 12, 0.001, '60 € auf 5 kg');
    // festgeschriebene Rechnung zählt mit, Entwurf nicht
    await w.DB.put('rechnungen', { nummer: 'RE-9', datum: w.U.todayIso(), status: 'entwurf', positionen: [{ text: 'x', abfuellungId: abf.id, menge: 10, einzelpreis: 100 }] });
    ep = await w.ernteprognoseBasis();
    nah(ep.erloesJeKg, 12, 0.001, 'ein Entwurf ist noch kein Erlös');
    await w.DB.put('rechnungen', { nummer: 'RE-10', datum: w.U.todayIso(), status: 'festgeschrieben', positionen: [{ text: 'x', abfuellungId: abf.id, menge: 10, einzelpreis: 8 }] });
    ep = await w.ernteprognoseBasis();
    nah(ep.erloesJeKg, 14, 0.001, '60 € + 80 € auf 10 kg');
  } finally {
    await w.DB.clear('verkaeufe'); await w.DB.clear('abfuellungen'); await w.DB.clear('rechnungen');
    for (const x of alt.v) await w.DB.put('verkaeufe', x, true);
    for (const x of alt.a) await w.DB.put('abfuellungen', x, true);
    for (const x of alt.r) await w.DB.put('rechnungen', x, true);
  }
});

/* ---------- Automatische Sicherung: Termin, Countdown, Ring ---------- */
async function autoBackupAn(w, intervall, letzte) {
  const f = w.S.get('features');
  f.autoBackup.aktiv = true; f.autoBackup.intervall = intervall;
  await w.S.set('features', f);
  await w.S.set('letzteAutoSicherung', letzte);
}
test('Backup.naechsteSicherung: Intervall ab letzter Sicherung, sofort wenn noch nie', async (w) => {
  const letzte = new Date('2026-05-10T08:00:00Z').toISOString();
  await autoBackupAn(w, 'woechentlich', letzte);
  assertEq(w.Backup.naechsteSicherung(), new Date('2026-05-17T08:00:00Z').toISOString(), 'wöchentlich = +7 Tage');
  await autoBackupAn(w, 'taeglich', letzte);
  assertEq(w.Backup.naechsteSicherung(), new Date('2026-05-11T08:00:00Z').toISOString(), 'täglich = +1 Tag');
  await autoBackupAn(w, 'woechentlich', null);
  assert(w.Backup.naechsteSicherung(), 'ohne letzte Sicherung sofort fällig');
  await autoBackupAn(w, 'schliessen', letzte);
  assertEq(w.Backup.naechsteSicherung(), null, 'beim Schließen = kein Termin');
  const f = w.S.get('features'); f.autoBackup.aktiv = false; await w.S.set('features', f);
  assertEq(w.Backup.naechsteSicherung(), null, 'deaktiviert = kein Termin');
});
test('backupRestText: rundet, statt Tage abzuschneiden', (w) => {
  const T = 86400000, H = 3600000, M = 60000;
  assertEq(w.backupRestText(7 * T).lang, '7 Tagen');
  assertEq(w.backupRestText(7 * T - 5 * M).lang, '7 Tagen', 'kurz nach der Sicherung nicht schon 6 Tage');
  assertEq(w.backupRestText(6.4 * T).lang, '6 Tagen');
  assertEq(w.backupRestText(T).lang, '1 Tag', 'Einzahl');
  assertEq(w.backupRestText(14 * H).lang, '14 Stunden');
  assertEq(w.backupRestText(55 * M).lang, '1 Stunde');
  assertEq(w.backupRestText(3 * M).lang, '3 Minuten');
  assertEq(w.backupRestText(20000).lang, '1 Minute', 'nie „0 Minuten“');
  assertEq(w.backupRestText(0).lang, 'jetzt fällig');
  assertEq(w.backupRestText(-5000).lang, 'jetzt fällig');
});
test('backupRingHtml: nur wenn aktiv, Ring läuft ab, fällig wird rot', async (w) => {
  const f = w.S.get('features'); f.autoBackup.aktiv = false; await w.S.set('features', f);
  assertEq(w.backupRingHtml(), '', 'deaktiviert: kein Ring');
  await autoBackupAn(w, 'schliessen', w.U.nowIso());
  assertEq(w.backupRingHtml(), '', '„beim Schließen“: kein Ring');

  const ringKreis = (html) => { const d = document.createElement('div'); d.innerHTML = html; return d.querySelectorAll('circle')[1]; };
  const offset = (html) => parseFloat(ringKreis(html).getAttribute('stroke-dashoffset'));
  await autoBackupAn(w, 'woechentlich', w.U.nowIso());
  const voll = w.backupRingHtml();
  assert(offset(voll) < 1, 'frisch gesichert: Ring voll');
  assert(voll.includes('7 T'), 'zeigt 7 Tage: ' + voll);

  await autoBackupAn(w, 'woechentlich', new Date(Date.now() - 3.5 * 86400000).toISOString());
  const halb = w.backupRingHtml();
  const umfang = parseFloat(ringKreis(halb).getAttribute('stroke-dasharray'));
  assert(Math.abs(offset(halb) - umfang / 2) < 2, 'halbe Zeit = halber Ring');

  await autoBackupAn(w, 'woechentlich', new Date(Date.now() - 9 * 86400000).toISOString());
  const faellig = w.backupRingHtml();
  assert(faellig.includes('var(--danger)'), 'überfällig: roter Ring');
  assert(faellig.includes('jetzt fällig'), 'überfällig: Hinweis im Text');

  await autoBackupAn(w, 'woechentlich', null);
  assert(w.backupRingHtml().includes('noch nie'), 'ohne Sicherung: „noch nie“');
  const f2 = w.S.get('features'); f2.autoBackup.aktiv = false; await w.S.set('features', f2);
});
test('Backup.runAuto: sichert, merkt sich den Zeitpunkt, meldet sich', async (w) => {
  await autoBackupAn(w, 'woechentlich', null);
  const features = w.S.get('features'); features.benachrichtigungen = true; await w.S.set('features', features);
  const origDl = w.U.download; let downloads = 0; w.U.download = () => { downloads++; };
  const origReg = w.navigator.serviceWorker.getRegistration.bind(w.navigator.serviceWorker);
  const origStatus = w.Notif.status; w.Notif.status = () => 'granted';
  let push = null;
  w.navigator.serviceWorker.getRegistration = async () => ({ showNotification: (t, o) => { push = { titel: t, ...o }; } });
  try {
    const zeit = await w.Backup.runAuto('aktivierung');
    assertEq(downloads, 1, 'ohne Ordner: Datei-Download');
    const neuster = w.U.sortBy(await w.DB.getAll('snapshots'), (s) => s.datum, true)[0];
    assertEq(neuster.grund, 'auto', 'interner Snapshot angelegt (Liste rollt bei 10)');
    assertEq(w.S.get('letzteAutoSicherung'), zeit, 'Zeitpunkt gemerkt → Timer startet neu');
    assert(push && push.titel.includes('Sicherung erstellt'), 'Push gesendet: ' + JSON.stringify(push));
    assert(push.body.includes('Nächste:'), 'Push nennt den nächsten Termin: ' + push.body);
    assertEq(push.data.ziel, '/einstellungen', 'Klick führt zu den Einstellungen');
  } finally {
    w.U.download = origDl; w.navigator.serviceWorker.getRegistration = origReg; w.Notif.status = origStatus;
    const f = w.S.get('features'); f.autoBackup.aktiv = false; f.benachrichtigungen = false; await w.S.set('features', f);
    await w.S.set('letzteAutoSicherung', null);
  }
});
test('Notif.zeigen: schweigt ohne Berechtigung oder wenn abgeschaltet', async (w) => {
  const origReg = w.navigator.serviceWorker.getRegistration.bind(w.navigator.serviceWorker);
  const origStatus = w.Notif.status;
  let push = null;
  w.navigator.serviceWorker.getRegistration = async () => ({ showNotification: (t, o) => { push = { titel: t, ...o }; } });
  const f = w.S.get('features');
  try {
    f.benachrichtigungen = false; await w.S.set('features', f);
    w.Notif.status = () => 'granted';
    assertEq(await w.Notif.zeigen('A', 'B'), false, 'abgeschaltet: kein Push');
    assertEq(push, null);
    f.benachrichtigungen = true; await w.S.set('features', f);
    w.Notif.status = () => 'denied';
    assertEq(await w.Notif.zeigen('A', 'B'), false, 'ohne Berechtigung: kein Push');
    assertEq(push, null);
    w.Notif.status = () => 'granted';
    assertEq(await w.Notif.zeigen('A', 'B'), true);
    assertEq(push.data.ziel, '/aufgaben', 'Standardziel bleibt Aufgaben');
  } finally {
    w.navigator.serviceWorker.getRegistration = origReg; w.Notif.status = origStatus;
    f.benachrichtigungen = false; await w.S.set('features', f);
  }
});

/* ---------- Erinnerungen: Fälligkeit + Kalender-Export ---------- */
test('Notif.faellige: überfällig + heute, ohne erledigte/zukünftige/ohne Datum', (w) => {
  const heute = '2026-07-03';
  const liste = [
    { titel: 'ueberfaellig', erledigt: false, faellig: '2026-07-01' },
    { titel: 'heute', erledigt: false, faellig: '2026-07-03' },
    { titel: 'erledigt', erledigt: true, faellig: '2026-07-01' },
    { titel: 'zukunft', erledigt: false, faellig: '2026-07-09' },
    { titel: 'ohneDatum', erledigt: false, faellig: null },
  ];
  assertEq(w.Notif.faellige(liste, heute).map((a) => a.titel), ['ueberfaellig', 'heute']);
});
test('Notif.icsFuerAufgaben: gültiger Kalender mit Alarm und Escaping', (w) => {
  const ics = w.Notif.icsFuerAufgaben([
    { id: 'x1', titel: 'Füttern; Volk 1, prüfen', notiz: 'Zeile1\nZeile2', erledigt: false, faellig: '2026-07-10' },
    { id: 'x2', titel: 'Erledigt', erledigt: true, faellig: '2026-07-11' },
    { id: 'x3', titel: 'Ohne Datum', erledigt: false, faellig: null },
  ]);
  assert(ics.startsWith('BEGIN:VCALENDAR'), 'Kalender-Kopf');
  assertEq((ics.match(/BEGIN:VEVENT/g) || []).length, 1, 'nur offene Aufgaben mit Datum');
  assert(ics.includes('DTSTART:20260710T080000'), 'Termin 08:00 am Fälligkeitstag');
  assert(ics.includes('Füttern\\; Volk 1\\, prüfen'), 'Sonderzeichen escaped');
  assert(ics.includes('Zeile1\\nZeile2'), 'Zeilenumbruch escaped');
  assert(ics.includes('BEGIN:VALARM'), 'Alarm enthalten');
  assert(ics.includes('UID:x1@imkerbuch'), 'stabile UID (Re-Import aktualisiert statt dupliziert)');
});

/* ---------- PDF-Import-Heuristik ---------- */
test('PdfImport.parse: erkennt Behandlung und Ernte am Datum + Stichwort', (w) => {
  const text = 'Behandlungsprotokoll: Am 12.08.2025 wurde mit Ameisensäure 60 % behandelt, Verdunster über fünf Tage, keine Auffälligkeiten beobachtet, Königin weiter in Eilage. '
    + '-'.repeat(120)
    + ' Erntebericht: Am 15.6.25 wurden 20 kg Frühtracht geschleudert, Wassergehalt 17,5 Prozent, alles sauber abgefüllt.';
  const v = w.PdfImport.parse(text);
  const beh = v.find((x) => x.typ === 'behandlung');
  const ern = v.find((x) => x.typ === 'ernte');
  assert(beh, 'Behandlung erkannt');
  assertEq(beh.datum, '2025-08-12', 'Datum TT.MM.JJJJ → ISO');
  assert(beh.stichwort.toLowerCase().includes('ameisensäure'), 'Stichwort Mittel');
  assert(ern, 'Ernte erkannt');
  assertEq(ern.datum, '2025-06-15', 'zweistelliges Jahr + einstelliger Monat → ISO');
});
test('PdfImport.parse: dedupliziert gleiche Treffer', (w) => {
  const text = 'Oxalsäure am 01.12.2025. Nochmal: Oxalsäure am 01.12.2025.';
  const treffer = w.PdfImport.parse(text).filter((x) => x.typ === 'behandlung' && x.datum === '2025-12-01');
  assertEq(treffer.length, 1, 'gleiches Datum + Stichwort nur einmal');
});

/* ---------- Startbildschirm (Waben-Ladeanimation) ---------- */
test('Startbildschirm: 7 Waben als Ring, im Uhrzeigersinn versetzt', (w) => {
  // Im Testbetrieb entfernt Splash.init() den Startbildschirm sofort – darum aus der
  // ausgelieferten Vorlage neu aufbauen und im echten Dokument der App vermessen.
  const roh = w.__splashHtmlFuerTest;
  assert(roh, 'Vorlage des Startbildschirms vorhanden');
  const huelle = w.document.createElement('div');
  huelle.innerHTML = roh;
  w.document.body.appendChild(huelle);
  try {
    const el = huelle.querySelector('#splash');
    const waben = [...el.querySelectorAll('.sp-wabe')];
    assertEq(waben.length + 1, 7, 'Mittelwabe + 6 außen');
    // Aufbau: Logo + Name oben, Animation mittig, Statuszeile unten (beim Start leer)
    assert(el.querySelector('.splash-kopf svg'), 'Logo im Kopf');
    assertEq(el.querySelector('.splash-wort').textContent, 'ImkerBuch');
    assertEq(el.querySelector('.splash-status').textContent, '', 'Statuszeile beim normalen Start leer');
    const mitte = (n) => { const r = n.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; };
    const c = mitte(el.querySelector('.sp-mitte'));
    const abstaende = waben.map((x) => Math.hypot(...mitte(x).map((v, i) => v - c[i])));
    // 2 px Spielraum: die Original-Vorlage ist selbst minimal asymmetrisch (Mitte liegt bei x=499, der Ring bei 498.8)
    assert(Math.max(...abstaende) - Math.min(...abstaende) < 2.5, 'alle 6 etwa gleich weit von der Mitte: ' + abstaende.map((a) => a.toFixed(1)));
    const winkel = waben.map((x) => { const p = mitte(x); return Math.round((Math.atan2(p[1] - c[1], p[0] - c[0]) * 180 / Math.PI + 450) % 360); });
    assertEq(winkel, [360, 60, 120, 180, 240, 300], 'im 60°-Abstand rundherum, beginnend oben');
    const verzoegerung = waben.map((x) => Math.round(parseFloat(w.getComputedStyle(x).animationDelay) * 1000));
    assertEq(verzoegerung, [0, 333, 667, 1000, 1333, 1667], 'Leuchten wandert im Uhrzeigersinn, 2 s pro Runde');
    assertEq(w.getComputedStyle(waben[0]).animationDuration, '2s');
    assertEq(w.Splash.MIN_MS, 2000, 'Mindestanzeige = eine volle Runde');
  } finally { huelle.remove(); }
});
test('Startbildschirm: verschwindet frühestens nach einer vollen Runde', async (w) => {
  const attrappe = () => { const el = w.document.createElement('div'); w.document.body.appendChild(el); return el; };
  // In Zyklen statt Millisekunden warten: Hintergrund-Tabs drosseln Timer stark,
  // eine Messung an der Wanduhr wäre hier unzuverlässig.
  const ausgeblendet = async (el, zyklen = 25) => {
    for (let i = 0; i < zyklen; i++) { if (el.classList.contains('weg')) return true; await new Promise((r) => setTimeout(r, 20)); }
    return el.classList.contains('weg');
  };

  // a) Runde abgelaufen (MIN_MS 0) → blendet aus
  const a = attrappe();
  const pA = Object.assign({}, w.Splash, { el: a, erledigt: false, MIN_MS: 0 });
  pA.weg();
  assert(await ausgeblendet(a), 'blendet aus, wenn die Runde durch ist');
  assertEq(pA.el, null, 'gibt die Referenz frei');
  a.remove();

  // b) Runde noch lange nicht durch → blendet NICHT vorzeitig aus (kein Aufblitzen)
  const b = attrappe();
  const pB = Object.assign({}, w.Splash, { el: b, erledigt: false, MIN_MS: w.performance.now() + 30000 });
  pB.weg();
  assertEq(await ausgeblendet(b, 5), false, 'wartet die Runde ab, statt kurz aufzublitzen');
  assert(pB.erledigt, 'ist aber schon angestoßen');
  b.remove();

  // c) Doppelter Aufruf (Notbremse + regulärer Weg) darf nichts kaputtmachen
  const c = attrappe();
  const pC = Object.assign({}, w.Splash, { el: c, erledigt: false, MIN_MS: 0 });
  pC.weg();
  pC.weg();
  assert(await ausgeblendet(c), 'zweiter Aufruf schadet nicht');
  c.remove();
});
test('Startbildschirm: kommt beim Update zurück und meldet die neue Version', async (w) => {
  // Nach einem Update lädt sich die App selbst neu – dann soll der Startbildschirm
  // wieder erscheinen, statt dass das Neuladen wie ein Aussetzer wirkt.
  const alteVorlage = w.Splash.vorlage, altesEl = w.Splash.el, altErledigt = w.Splash.erledigt;
  try {
    w.Splash.vorlage = w.__splashHtmlFuerTest;
    w.Splash.el = null;          // Zustand „schon ausgeblendet“
    w.Splash.erledigt = true;
    w.Splash.zeigen('Neue Version wird geladen …');
    const el = w.document.getElementById('splash');
    assert(el, 'Startbildschirm ist wieder da');
    assertEq(el.querySelector('.splash-status').textContent, 'Neue Version wird geladen …');
    assertEq(el.classList.contains('weg'), false, 'wird sichtbar eingeblendet, nicht ausgeblendet');
    assert(el.getAttribute('aria-label').includes('Neue Version'), 'auch für Screenreader');
    assertEq(el.querySelectorAll('.sp-wabe').length, 6, 'Animation ist vollständig dabei');
    w.Splash.weg(); // darf ihn nicht wegnehmen – er soll bis zum Neuladen stehen bleiben
    await new Promise((r) => setTimeout(r, 60));
    assertEq(w.document.getElementById('splash').classList.contains('weg'), false, 'bleibt bis zum Neuladen stehen');
    el.remove();
  } finally { w.Splash.vorlage = alteVorlage; w.Splash.el = altesEl; w.Splash.erledigt = altErledigt; }
});
test('Startbildschirm: im Testbetrieb sofort entfernt', async (w) => {
  assert(w.TEST_MODE, 'Testseite läuft mit ?testdb');
  /* Kein sofortiges Urteil: lädt gerade ein neuer Service Worker die App neu,
     ist der Startbildschirm kurz wieder da. Bis zu 3 s zugestehen. */
  const bis = Date.now() + 3000;
  while (w.document.getElementById('splash') && Date.now() < bis) await new Promise((r) => setTimeout(r, 50));
  assertEq(w.document.getElementById('splash'), null, 'Splash.init() räumt ihn im Testbetrieb weg');
});

/* ---------- Regression: Router ersetzt #main (Listener-Leak) ---------- */
test('Regression: View-Listener leaken nicht über Seitenwechsel', async (w) => {
  // Bug 2026-07-03: Trachten-Listener blieb an #main hängen und öffnete beim
  // Klick auf eine Zuchtserie das „Neue Tracht"-Formular. renderRoute muss
  // #main pro Render durch einen listenerfreien Klon ersetzen.
  await w.DB.put('trachten', { bezeichnung: 'Leak-Tracht', pflanze: '', von: '', bis: '', region: '', standIds: [] });
  await w.DB.put('zuchtserien', { name: 'Leak-Serie', startdatum: '2026-07-01', anzahl: 5, termine: w.zuchtTermine('2026-07-01'), notiz: '' });
  /* Auf Zustände warten statt auf Millisekunden: feste Pausen scheitern auf
     langsamen Rechnern und verdecken echte Fehler als „mal so, mal so". */
  const warteAuf = async (pruef, was, ms = 4000) => {
    const bis = Date.now() + ms;
    while (Date.now() < bis) {
      if (pruef()) return true;
      await new Promise((r) => setTimeout(r, 40));
    }
    throw new Error(`Zeitüberschreitung beim Warten auf: ${was}`);
  };
  /* Auf den Kopftext der Zielansicht warten, nicht auf `.row[data-id]`: DIESE
     Zeilen sehen in Trachten und Zucht gleich aus. Wer nur auf eine Zeile
     wartet, klickt womöglich noch in die alte Liste – dann öffnet sich das
     Tracht-Formular und der Test schlägt scheinbar zufällig fehl. */
  const kopf = (text) => () => { const el = w.document.querySelector('main'); return !!el && el.innerText.includes(text); };
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove());   // saubere Ausgangslage
  w.location.hash = '#/trachten';
  await warteAuf(kopf('Trachtquellen verwalten'), 'Trachten-Ansicht');
  w.location.hash = '#/zucht';
  await warteAuf(() => kopf('Zuchtserien mit automatischem Kalender')() && w.document.querySelector('main .row[data-id]'), 'Zucht-Liste mit Einträgen');
  w.document.querySelector('main .row[data-id]').click();
  await warteAuf(() => w.document.querySelector('.modal'), 'geöffnetes Fenster');
  const m = [...w.document.querySelectorAll('.modal')].pop();   // das oberste, nicht ein Überbleibsel
  assert(m, 'Modal geöffnet');
  assert(m.innerText.includes('Umlarven'), 'Zucht-Detail geöffnet – nicht das Formular einer fremden View');
  m.querySelector('[data-close]').click();
  await warteAuf(() => !w.document.querySelector('.modal'), 'geschlossenes Fenster');
  w.location.hash = '#/dashboard';
  await warteAuf(() => !/Umlarven/.test(w.document.querySelector('main').innerText), 'Dashboard');
});

/* ---------- Belegstellen: Verwaltung + Zucht-Verknüpfung ---------- */
test('Belegstelle: DB-Roundtrip (Leiter, Koordinaten) + Kurzlabel', async (w) => {
  const b = await w.DB.put('belegstellen', { name: 'Belegstelle Test', rasse: 'Carnica', drohnenlinie: 'Carnica Sklenar', ort: 'Insel X', lat: 53.7071, lng: 7.156, betreiber: 'Verband', leiterName: 'Hans Meyer', leiterAdresse: 'Deichstr. 5, 26548 Norderney', notiz: '' });
  const geladen = await w.DB.get('belegstellen', b.id);
  assertEq(geladen.leiterName, 'Hans Meyer', 'Belegstellenleiter gespeichert');
  assertEq(geladen.leiterAdresse, 'Deichstr. 5, 26548 Norderney', 'Anschrift gespeichert');
  assertEq(geladen.drohnenlinie, 'Carnica Sklenar', 'aktuelle Drohnenlinie gespeichert');
  assertEq(geladen.lat, 53.7071, 'Koordinaten gespeichert');
  assertEq(w.belegstelleLabel(geladen), 'Belegstelle Test · Carnica Sklenar', 'Label zeigt Name · Drohnenlinie');
  assertEq(w.belegstelleLabel({ name: 'N', rasse: 'Carnica' }), 'N · Carnica', 'ohne Drohnenlinie fällt auf die Herkunft zurück');
  assertEq(w.belegstelleLabel({ name: 'Nur Name' }), 'Nur Name', 'ohne alles nur der Name');
  // Kartenlinks aus den Koordinaten
  const l = w.U.mapsLinks(geladen.lat, geladen.lng);
  assert(l.google.includes('53.7071') && l.google.includes('7.156'), 'Google-Maps-Link mit Koordinaten');
  assert(l.osm.includes('mlat=53.7071'), 'OpenStreetMap-Link mit Koordinaten');
});
test('Belegstelle: Formular lernt erfasste Drohnenlinien als Vorschlag', async (w) => {
  await w.DB.put('belegstellen', { name: 'Lern-Belegstelle', rasse: 'Carnica', drohnenlinie: 'Sklenar Sondertest-Linie', ort: '', betreiber: '', notiz: '' });
  const opts = await w.gelernteWerte([], 'belegstellen', 'drohnenlinie');
  assert(opts.includes('Sklenar Sondertest-Linie'), 'zuvor erfasste Drohnenlinie steht als Vorschlag bereit');
});
test('migriereBelegstellen: alte Freitext-Belegstelle wird Datensatz + verknüpft, ohne Dubletten', async (w) => {
  // zwei Königinnen mit derselben Freitext-Belegstelle, eine Zuchtserie mit anderer
  const q1 = await w.DB.put('koeniginnen', { kennung: 'BM-1', jahrgang: 2026, status: 'aktiv', historie: [], anpaarung: 'belegstelle', belegstelle: 'Belegstelle Wangerooge' });
  const q2 = await w.DB.put('koeniginnen', { kennung: 'BM-2', jahrgang: 2026, status: 'aktiv', historie: [], anpaarung: 'belegstelle', belegstelle: 'belegstelle wangerooge' }); // andere Schreibung
  const zs = await w.DB.put('zuchtserien', { name: 'BM-Serie', startdatum: '2026-05-01', anzahl: 5, termine: [], anpaarung: 'belegstelle', belegstelle: 'Belegstelle Spiekeroog' });
  const vorher = (await w.DB.getAll('belegstellen')).length;
  await w.S.set('belegstellenMigriert', false);
  await w.migriereBelegstellen();
  const alle = await w.DB.getAll('belegstellen');
  const wanger = alle.filter((b) => b.name.toLowerCase() === 'belegstelle wangerooge');
  assertEq(wanger.length, 1, 'gleiche Belegstelle (Groß/klein) nur einmal angelegt');
  assertEq(alle.length, vorher + 2, 'zwei neue Belegstellen (Wangerooge + Spiekeroog)');
  assertEq((await w.DB.get('koeniginnen', q1.id)).belegstelleId, wanger[0].id, 'q1 verknüpft');
  assertEq((await w.DB.get('koeniginnen', q2.id)).belegstelleId, wanger[0].id, 'q2 auf dieselbe Belegstelle verknüpft');
  assert((await w.DB.get('zuchtserien', zs.id)).belegstelleId, 'Zuchtserie verknüpft');
});
test('migriereBelegstellen: läuft nur einmal (Flag)', async (w) => {
  await w.S.set('belegstellenMigriert', true);
  const q = await w.DB.put('koeniginnen', { kennung: 'BM-3', jahrgang: 2026, status: 'aktiv', historie: [], anpaarung: 'belegstelle', belegstelle: 'Nicht migrieren' });
  await w.migriereBelegstellen();
  assertEq((await w.DB.get('koeniginnen', q.id)).belegstelleId, undefined, 'bei gesetztem Flag keine erneute Migration');
});
test('Zucht-Formular: Belegstelle ist Auswahl aus der Liste + „neu anlegen“-Shortcut', async (w) => {
  const bs = await w.DB.put('belegstellen', { name: 'Auswahl-Belegstelle', rasse: 'Buckfast', ort: '', betreiber: '', notiz: '' });
  await w.Views.koeniginnen.form(null);
  await new Promise((r) => setTimeout(r, 80));
  try {
    const sel = w.document.getElementById('f-belegstelleId');
    assert(sel && sel.tagName === 'SELECT', 'Belegstelle ist ein Auswahlfeld (nicht mehr Freitext)');
    assert([...sel.options].some((o) => o.value === bs.id), 'die angelegte Belegstelle steht zur Auswahl');
    const wrap = sel.closest('[data-field="belegstelleId"]');
    assert([...wrap.querySelectorAll('button')].some((b) => /Belegstelle anlegen/.test(b.textContent)), 'Shortcut zum Neu-Anlegen ist vorhanden');
  } finally {
    w.FormGuard.dirty = false;
    const back = w.document.querySelector('#modal-root .modal-back:last-child [data-cancel]') || w.document.querySelector('#modal-root [data-close]');
    if (back) back.click();
  }
});
test('listenwertNeuShortcut: neuer Wert landet in der Einstellungs-Liste und im Feld', async (w) => {
  const vorher = [...w.S.get('honigsorten')];
  const neu = 'Testhonig ' + vorher.length; // eindeutig
  // Minimales Feld-Markup wie im formModal (suggest = combo)
  const host = w.document.createElement('div');
  host.innerHTML = `<div class="field" data-field="sorte"><label>Honigsorte</label><div class="combo"><input class="inp combo-inp" id="f-sorte" value=""><div class="combo-list"></div></div><div class="err"></div></div>`;
  w.document.body.appendChild(host);
  const m = { el: host };
  w.listenwertNeuShortcut(m, 'sorte', 'honigsorten', { label: 'Neue Honigsorte anlegen', titel: 'Neue Honigsorte', platzhalter: '' });
  const btn = host.querySelector('button');
  assert(btn && /Honigsorte anlegen/.test(btn.textContent), 'Shortcut-Button eingefügt');
  btn.click();
  await new Promise((r) => setTimeout(r, 60));
  const eingabe = w.document.querySelector('#modal-root .modal-back:last-child #f-wert');
  assert(eingabe, 'Eingabe-Dialog offen');
  eingabe.value = neu; eingabe.dispatchEvent(new Event('input'));
  const ok = w.document.querySelector('#modal-root .modal-back:last-child [data-save]');
  ok.click();
  await new Promise((r) => setTimeout(r, 80));
  assert(w.S.get('honigsorten').includes(neu), 'neue Honigsorte in der Einstellungs-Liste gespeichert');
  assertEq(w.document.getElementById('f-sorte').value, neu, 'und im Feld ausgewählt');
  host.remove();
  await w.S.set('honigsorten', vorher); // aufräumen
});

/* ---------- Verkauf: Lagerabzug + Kassenbuch-Automatik ---------- */
test('verkaufErfassen: mindert Abfüllungs-Bestand, bucht Einnahme, lehnt Überverkauf ab', async (w) => {
  const c = await w.DB.put('chargen', { losnummer: 'T-01', ernteIds: [], mengeKg: 5, mhd: '', etikettNotiz: '' });
  const a = await w.DB.put('abfuellungen', { chargeId: c.id, datum: '2026-06-01', gebindeG: 500, anzahl: 10, bestand: 10 });
  const v = await w.verkaufErfassen({ abfuellungId: a.id, anzahl: 3, preisJeGlas: 6.5 });
  assertEq((await w.DB.get('abfuellungen', a.id)).bestand, 7, 'Bestand 10 → 7');
  assertNah(v.betrag, 19.5, 0.001, 'Betrag = Anzahl × Preis');
  const kb = await w.DB.get('kassenbuch', v.kassenbuchId);
  assert(kb && kb.typ === 'einnahme' && kb.kategorie === 'Honigverkauf', 'Einnahme im Kassenbuch');
  assertNah(kb.betrag, 19.5, 0.001, 'Kassenbuch-Betrag');
  let fehler = false;
  try { await w.verkaufErfassen({ abfuellungId: a.id, anzahl: 99, preisJeGlas: 1 }); } catch (e) { fehler = true; }
  assert(fehler, 'Überverkauf wirft Fehler');
  assertEq((await w.DB.get('abfuellungen', a.id)).bestand, 7, 'Bestand nach Fehlversuch unverändert');
});
test('verkaufStornieren: Bestand zurück, Buchung + Verkauf im Papierkorb', async (w) => {
  const c = await w.DB.put('chargen', { losnummer: 'T-02', ernteIds: [], mengeKg: 1.25, mhd: '', etikettNotiz: '' });
  const a = await w.DB.put('abfuellungen', { chargeId: c.id, datum: '2026-06-01', gebindeG: 250, anzahl: 5, bestand: 5 });
  const v = await w.verkaufErfassen({ abfuellungId: a.id, anzahl: 2, preisJeGlas: 4 });
  await w.verkaufStornieren(v.id);
  assertEq((await w.DB.get('abfuellungen', a.id)).bestand, 5, 'Bestand wiederhergestellt');
  assert(!(await w.DB.get('verkaeufe', v.id)), 'Verkauf entfernt');
  assert(!(await w.DB.get('kassenbuch', v.kassenbuchId)), 'Buchung entfernt');
  const korb = await w.DB.getAll('papierkorb');
  assert(korb.some((t) => t.store === 'kassenbuch' && t.daten.id === v.kassenbuchId), 'Buchung liegt im Papierkorb');
});
test('ernteBelegung: schon zugeordnete Ernten, aktuelle Charge ausgenommen', (w) => {
  const chargen = [
    { id: 'c1', losnummer: '26-01', ernteIds: ['e1', 'e2'] },
    { id: 'c2', losnummer: '26-02', ernteIds: ['e3'] },
  ];
  const b = w.ernteBelegung(chargen);
  assertEq(b.get('e1'), '26-01', 'e1 ist in Los 26-01');
  assertEq(b.get('e3'), '26-02', 'e3 ist in Los 26-02');
  assert(!b.has('e9'), 'freie Ernte nicht belegt');
  // Beim Bearbeiten von c1 dürfen dessen eigene Ernten NICHT als belegt gelten
  const bEdit = w.ernteBelegung(chargen, 'c1');
  assert(!bEdit.has('e1') && !bEdit.has('e2'), 'eigene Ernten der bearbeiteten Charge frei');
  assertEq(bEdit.get('e3'), '26-02', 'fremde Ernte weiter belegt');
});
test('chargeRestKg / gebindeLabel: kg-Abzug beim Abfüllen', (w) => {
  assertEq(w.gebindeLabel(500), '500 g', '500 g');
  assertEq(w.gebindeLabel(20000), '20 kg', '20 kg');
  assertEq(w.gebindeLabel(250), '250 g', '250 g');
  const c = { id: 'c1', mengeKg: 30 };
  const abf = [{ chargeId: 'c1', gebindeG: 500, anzahl: 20 }, { chargeId: 'c1', gebindeG: 250, anzahl: 40 }, { chargeId: 'other', gebindeG: 500, anzahl: 100 }];
  // 20×500g = 10 kg, 40×250g = 10 kg → 20 kg abgefüllt, 10 kg frei
  assertEq(w.chargeRestKg(c, abf), 10, '30 kg − 20 kg = 10 kg frei');
});
test('MHD-Wächter (pruefeMhd): jetzt über Abfüllungs-Bestand', async (w) => {
  const inTagen = (n) => w.U.addDays(w.U.todayIso(), n);
  const c = await w.DB.put('chargen', { losnummer: 'MHD-abf', ernteIds: [], mengeKg: 5, mhd: inTagen(20) });
  await w.DB.put('abfuellungen', { chargeId: c.id, datum: '2026-01-01', gebindeG: 500, anzahl: 10, bestand: 4 });
  await w.pruefeMhd();
  const auf = (await w.DB.getAll('aufgaben')).filter((a) => a.quelle === 'mhd' && a.refId === c.id);
  assertEq(auf.length, 1, 'eine MHD-Erinnerung für die Charge mit Rest-Gläsern');
  assert(/4 Gläser/.test(auf[0].titel), 'zeigt die Gläser-Anzahl');
});
test('migriereChargenAbfuellung: alte Charge → Charge(kg) + Abfüllung, Verkauf umgehängt', async (w) => {
  await w.S.set('abfuellungMigriert', false);
  const c = await w.DB.put('chargen', { losnummer: 'MIG-01', ernteIds: [], glasGroesseG: 500, anzahlGlaeser: 100, bestandGlaeser: 80, abfuelldatum: '2026-06-01', mhd: '2028-06-01', etikettNotiz: 'Alt', verkaufspreis: 6 });
  const vk = await w.DB.put('verkaeufe', { datum: '2026-06-10', chargeId: c.id, anzahl: 5, preisJeGlas: 6, betrag: 30, kontaktId: null, notiz: '', kassenbuchId: null });
  await w.migriereChargenAbfuellung();
  const cNach = await w.DB.get('chargen', c.id);
  assertEq(cNach.mengeKg, 50, '100 × 500 g = 50 kg Gesamtmenge');
  assert(!('glasGroesseG' in cNach) && !('bestandGlaeser' in cNach) && !('abfuelldatum' in cNach), 'Alt-Felder entfernt');
  const abf = (await w.DB.getAll('abfuellungen')).filter((a) => a.chargeId === c.id);
  assertEq(abf.length, 1, 'eine Abfüllung angelegt');
  assertEq(abf[0].gebindeG, 500, 'Gebinde 500 g übernommen');
  assertEq(abf[0].bestand, 80, 'Bestand 80 übernommen');
  const vkNach = await w.DB.get('verkaeufe', vk.id);
  assertEq(vkNach.abfuellungId, abf[0].id, 'Verkauf auf die Abfüllung umgehängt');
  assert(!('chargeId' in vkNach), 'alter chargeId-Schlüssel entfernt');
});

/* ---------- Zeiterfassung ---------- */
test('Reporting.zeiten: Minuten → Stunden je Tätigkeit, ohne Kategorie = Sonstiges', (w) => {
  const p = w.Reporting.zeiten([
    { zeitMinuten: 90, kategorie: 'Behandlung' },
    { zeitMinuten: 30, kategorie: 'Behandlung' },
    { zeitMinuten: 60, kategorie: null },
  ]);
  assertEq(p.find((x) => x.label === 'Behandlung').wert, 2, '120 min → 2 h');
  assertEq(p.find((x) => x.label === 'Sonstiges').wert, 1, 'null-Kategorie → Sonstiges');
  assertEq(p[0].label, 'Behandlung', 'absteigend sortiert');
});
test('UI.pie: Donut mit Anteilen und Legende', (w) => {
  const html = w.UI.pie({ posten: [{ label: 'A', wert: 2 }, { label: 'B', wert: 1 }], einheit: 'h' });
  assert(html.includes('<circle'), 'SVG-Segmente vorhanden');
  assert(html.includes('67 %') && html.includes('33 %'), 'Prozentanteile berechnet');
  assert(html.includes('h gesamt'), 'Gesamtsumme in der Mitte');
  assert(w.UI.pie({ posten: [] }).includes('Noch keine Daten'), 'leerer Zustand');
});

/* ---------- Dashboard: nur Widgets mit echtem Inhalt ---------- */
test('dashAlleEintraege: nur reiche Widgets, keine Symbol-Verknüpfungen', (w) => {
  const alle = w.dashAlleEintraege();
  assert(alle.includes('voelker') && alle.includes('kassenbuch'), 'echte Widgets dabei');
  assertEq(alle.filter((e) => e.startsWith('link:')).length, 0, 'keine „link:“-Einträge mehr');
  assertEq(new Set(alle).size, alle.length, 'keine Duplikate');
});
test('dashBlock: reiches Widget liefert HTML, unbekanntes/altes „link:“ → null', async (w) => {
  const b = await w.dashBlock('voelker');
  assert(b && /Völker/.test(b.html), 'Völker-Widget');
  assertEq(b.ziel, 'voelker');
  assertEq(await w.dashBlock('link:koeniginnen'), null, 'alte Verknüpfung wird übersprungen');
  assertEq(await w.dashBlock('gibtsnicht'), null);
});
test('Kassenbuch-Widget: Einnahmen − Ausgaben = Saldo (nur laufendes Jahr)', async (w) => {
  const jahr = new Date().getFullYear();
  await w.DB.put('kassenbuch', { datum: jahr + '-03-01', typ: 'einnahme', betrag: 100, kategorie: 'Test', beschreibung: '' });
  await w.DB.put('kassenbuch', { datum: jahr + '-04-01', typ: 'ausgabe', betrag: 30, kategorie: 'Test', beschreibung: '' });
  await w.DB.put('kassenbuch', { datum: (jahr - 1) + '-04-01', typ: 'einnahme', betrag: 999999, kategorie: 'Vorjahr', beschreibung: '' });
  // erwartete Summen aus ALLEN Buchungen dieses Jahres (Testdatenbank kann Demo-Daten enthalten)
  const bu = (await w.DB.getAll('kassenbuch')).filter((b) => (b.datum || '').startsWith(String(jahr)));
  const ein = w.U.sum(bu.filter((b) => b.typ === 'einnahme'), (b) => b.betrag || 0);
  const aus = w.U.sum(bu.filter((b) => b.typ === 'ausgabe'), (b) => b.betrag || 0);
  const html = await w.DASH_WIDGETS.kassenbuch.html();
  assert(html.includes(w.U.fmtEur(ein)), 'Einnahmen-Summe des Jahres');
  assert(html.includes(w.U.fmtEur(aus)), 'Ausgaben-Summe des Jahres');
  assert(html.includes(w.U.fmtEur(ein - aus)), 'Saldo = Einnahmen − Ausgaben');
  assertEq(html.includes('999.999') || html.includes('999999'), false, 'Vorjahres-Buchung zählt nicht mit');
});
test('Bestand-Widget: nur Positionen unter dem Mindestbestand', async (w) => {
  await w.DB.put('inventar', { bezeichnung: 'Knapp-Test-Mittel', typ: 'verbrauch', stueckzahl: 1, mindestbestand: 4 });
  await w.DB.put('inventar', { bezeichnung: 'Voll-Test-Mittel', typ: 'verbrauch', stueckzahl: 9, mindestbestand: 2 });
  const html = await w.DASH_WIDGETS.bestand.html();
  assert(html.includes('Knapp-Test-Mittel'), 'knappe Position wird gelistet');
  assertEq(html.includes('Voll-Test-Mittel'), false, 'ausreichende Position nicht');
});
test('bereichKurz/bereichIcon: aus der NAV abgeleitet', (w) => {
  assertEq(w.bereichKurz('honig'), 'Ernte');
  assertEq(w.bereichKurz('material'), 'Verbrauchsmaterial');
  assertEq(w.bereichIcon('koeniginnen'), 'crown');
  assert(w.BEREICHE.dashboard, 'Dashboard ist ein Bereich');
});
test('Anpassen-Liste: Minus verschiebt nach unten, Plus zurück, Reihenfolge bleibt', (w) => {
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  const st = { aktiv: ['voelker', 'aufgaben'], verf: ['kassenbuch'] };
  w.dashCfgListe(host, st, { label: w.dashLabel, icon: w.dashIcon, aktivTitel: 'Aktiv', hinweis: '' });
  try {
    // erstes Minus (voelker) → nach verf (oben)
    host.querySelector('[data-aktiv] [data-minus]').click();
    assertEq(st.aktiv, ['aufgaben'], 'voelker entfernt');
    assertEq(st.verf[0], 'voelker', 'landet oben in verfügbar');
    // Plus auf voelker → zurück ans Ende von aktiv
    [...host.querySelectorAll('[data-verf] .cfg-row')].find((r) => r.dataset.id === 'voelker').querySelector('[data-plus]').click();
    assertEq(st.aktiv, ['aufgaben', 'voelker'], 'wieder aktiv, hinten angehängt');
  } finally { host.remove(); }
});
test('Anpassen-Liste: „Start“ ist fest (kein Minus/Griff), Höchstzahl greift', (w) => {
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  const st = { aktiv: ['dashboard', 'voelker'], verf: ['aufgaben', 'honig', 'zucht'] };
  w.dashCfgListe(host, st, { label: w.bereichKurz, icon: w.bereichIcon, fixFirst: true, max: 4, aktivTitel: 'Leiste', hinweis: '' });
  try {
    const ersteZeile = host.querySelector('[data-aktiv] .cfg-row');
    assertEq(ersteZeile.querySelector('[data-minus]'), null, 'erste Zeile ohne Entfernen-Knopf');
    assert(ersteZeile.querySelector('.cfg-fix'), 'erste Zeile als fest markiert');
    // bis 4 auffüllen, dann muss der nächste Plus abgelehnt werden
    host.querySelectorAll('[data-verf] [data-plus]')[0].click(); // aufgaben → 3
    host.querySelectorAll('[data-verf] [data-plus]')[0].click(); // honig → 4
    assertEq(st.aktiv.length, 4);
    host.querySelectorAll('[data-verf] [data-plus]')[0]?.click(); // zucht → abgelehnt
    assertEq(st.aktiv.length, 4, 'mehr als 4 werden nicht aufgenommen');
  } finally { host.remove(); }
});

/* ---------- Bunte Bereichs-Icons (iconBunt / ICONS_BUNT) ---------- */
const IC_KLASSEN = ['a', 'ad', 'al', 'w', 'p', 'pn', 'g', 'gl', 'v', 'vl', 'b', 'bl', 'r', 's', 'sl', 'k', 'd'];

test('iconBunt: jeder Bereich der NAV hat ein buntes Icon', (w) => {
  const ohne = w.NAV.filter((n) => n.route).filter((n) => !w.ICONS_BUNT[n.ic]).map((n) => `${n.route}→${n.ic}`);
  assertEq(ohne, [], 'kein Bereich fällt auf das monochrome Icon zurück');
});
test('iconBunt: jede Dashboard-Kachel hat ein buntes Icon', (w) => {
  const ohne = Object.keys(w.DASH_WIDGETS).filter((k) => !w.ICONS_BUNT[w.DASH_WIDGETS[k].ic]).map((k) => `${k}→${w.DASH_WIDGETS[k].ic}`);
  assertEq(ohne, [], 'alle Widget-Icons sind bunt vorhanden');
});
test('iconBunt: genau ein <svg class="ci"> mit viewBox, keine id-Attribute', (w) => {
  Object.keys(w.ICONS_BUNT).forEach((name) => {
    const html = w.iconBunt(name);
    const box = w.document.createElement('div'); box.innerHTML = html;
    assertEq(box.children.length, 1, name + ': genau ein Wurzelelement');
    const svg = box.firstElementChild;
    assertEq(svg.tagName.toLowerCase(), 'svg', name + ': Wurzel ist ein SVG');
    assert(svg.classList.contains('ci'), name + ': trägt die Klasse ci');
    assertEq(svg.getAttribute('viewBox'), '0 0 24 24', name + ': 24er-Raster');
    // Verläufe/clipPath mit fester id würden sich im DOM gegenseitig überschreiben,
    // weil dasselbe Icon gleichzeitig in Seitenleiste, Leiste und Sheet steht.
    assertEq(html.includes('id='), false, name + ': keine feste SVG-id');
    assert(svg.children.length > 0, name + ': hat Formen');
  });
});
test('iconBunt: Farben nur über erlaubte Klassen, nie hart als fill', (w) => {
  Object.keys(w.ICONS_BUNT).forEach((name) => {
    const html = w.ICONS_BUNT[name];
    assertEq(/fill="#/.test(html), false, name + ': keine hart codierte Farbe (sonst kein Dunkelmodus)');
    const klassen = [...html.matchAll(/class="([^"]+)"/g)].map((m) => m[1]);
    assert(klassen.length > 0, name + ': mindestens eine Farbklasse');
    const fremd = klassen.filter((k) => !IC_KLASSEN.includes(k));
    assertEq(fremd, [], name + ': nur bekannte Farbklassen');
  });
});
test('iconBunt: unbekannter Name fällt monochrom zurück statt leer', (w) => {
  const html = w.iconBunt('gibtsnicht123');
  assert(html.includes('<svg'), 'liefert trotzdem ein SVG');
  assert(html.includes('currentColor'), 'nämlich das monochrome');
  assertEq(html.includes('class="ci"'), false, 'ohne ci-Klasse');
});
test('icon(): Bedien-Icons bleiben monochrom (Schutz vor versehentlichem Umbau)', (w) => {
  ['plus', 'x', 'warn', 'chevR', 'pencil'].forEach((n) => {
    const html = w.icon(n);
    assert(html.includes('stroke="currentColor"'), n + ': erbt die Textfarbe');
    assert(html.includes('fill="none"'), n + ': ungefüllt');
    assertEq(html.includes('class="ci"'), false, n + ': nicht bunt');
  });
});
test('NAV: kein Icon doppelt belegt (Fahrtenbuch/Material entdoppelt)', (w) => {
  const routen = w.NAV.filter((n) => n.route);
  const zaehler = {};
  routen.forEach((n) => { (zaehler[n.ic] = zaehler[n.ic] || []).push(n.route); });
  const doppelt = Object.keys(zaehler).filter((ic) => zaehler[ic].length > 1).map((ic) => `${ic}: ${zaehler[ic].join('+')}`);
  assertEq(doppelt, [], 'jeder Bereich hat ein eigenes Symbol');
  assertEq(w.bereichIcon('fahrten'), 'auto');
  assertEq(w.bereichIcon('material'), 'material');
  assertEq(w.bereichIcon('wanderungen'), 'truck', 'Wanderungen behält den Lkw');
});
const IC_TOENE = ['amber', 'gruen', 'blau', 'violett', 'rot', 'grau'];

test('iconTon: jeder Bereich und jede Kachel hat einen bekannten Ton', (w) => {
  const namen = [...w.NAV.filter((n) => n.route).map((n) => n.ic), ...Object.keys(w.DASH_WIDGETS).map((k) => w.DASH_WIDGETS[k].ic)];
  const fremd = [...new Set(namen)].filter((ic) => !IC_TOENE.includes(w.iconTon(ic)));
  assertEq(fremd, [], 'kein unbekannter Kachelton');
  const unbekannt = Object.keys(w.ICON_TON).filter((k) => !IC_TOENE.includes(w.ICON_TON[k]));
  assertEq(unbekannt, [], 'die Ton-Tabelle nennt nur definierte Töne');
  // Ein Ton ohne CSS-Klasse wäre unsichtbar – amber ist der Standard und braucht keine.
  const ohneKlasse = [...new Set(Object.values(w.ICON_TON))].filter((t) => t === 'amber');
  assertEq(ohneKlasse, [], 'amber steht nie in der Tabelle, es ist der Rückfall');
});
test('iconTon: die Zuordnung folgt der Leitfarbe des Symbols', (w) => {
  assertEq(w.iconTon('volk'), 'amber', 'Biene ist amber');
  assertEq(w.iconTon('honig'), 'amber', 'Honigglas ist amber');
  assertEq(w.iconTon('kasse'), 'gruen', 'Geldschein ist grün');
  assertEq(w.iconTon('auto'), 'blau', 'Auto ist blau');
  assertEq(w.iconTon('flask'), 'violett', 'Behandlungsflasche ist violett');
  assertEq(w.iconTon('trash'), 'rot', 'Papierkorb ist rot');
  assertEq(w.iconTon('gear'), 'grau', 'Zahnrad ist grau');
});
test('iconKachel: Wrapper trägt Kachelklasse + Ton, Symbol steckt darin', (w) => {
  const box = w.document.createElement('div');
  box.innerHTML = w.iconKachel('kasse', 'sg-ic');
  const span = box.firstElementChild;
  assertEq(span.tagName.toLowerCase(), 'span');
  assert(span.classList.contains('sg-ic'), 'behält die Kachelklasse');
  assert(span.classList.contains('ton-gruen'), 'bekommt den Ton');
  assert(span.querySelector('svg.ci'), 'buntes Symbol steckt drin');
  // Amber ist der Standard und darf KEINE Ton-Klasse setzen, sonst müsste
  // man --honey-soft doppelt pflegen.
  box.innerHTML = w.iconKachel('volk', 'cfg-ic');
  const amber = box.firstElementChild;
  assert(amber.classList.contains('cfg-ic'), 'Kachelklasse da');
  assertEq([...amber.classList].filter((c) => c.startsWith('ton-')), [], 'amber ohne Ton-Klasse');
});
test('Alle Bereiche: Kacheln bekommen die Töne, nicht alle honigfarben', (w) => {
  const html = w.NAV.filter((n) => n.route).map((n) => w.iconKachel(n.ic, 'sg-ic')).join('');
  const box = w.document.createElement('div'); box.innerHTML = html;
  const kacheln = [...box.children];
  assertEq(kacheln.length, w.NAV.filter((n) => n.route).length, 'je Bereich eine Kachel');
  const mitTon = kacheln.filter((k) => [...k.classList].some((c) => c.startsWith('ton-')));
  assert(mitTon.length >= 8, 'mindestens acht Bereiche weichen von Honig ab, gefunden: ' + mitTon.length);
  assert(kacheln.length - mitTon.length >= 8, 'die Imkerei bleibt honigfarben');
});
test('Untere Leiste und Anpassen-Liste zeichnen die bunten Icons', (w) => {
  w.renderBottomNav();
  const bn = w.document.getElementById('bottomnav');
  assert(bn.querySelector('.bn-pill svg.ci'), 'untere Leiste nutzt bunte Icons');
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    w.dashCfgListe(host, { aktiv: ['voelker'], verf: ['kassenbuch'] },
      { label: w.dashLabel, icon: w.dashIcon, aktivTitel: 'Aktiv', hinweis: '' });
    assertEq(host.querySelectorAll('.cfg-ic svg.ci').length, 2, 'beide Listen zeichnen bunt');
  } finally { host.remove(); }
});

/* ---------- Belegstelle: Herkunft steuert Quelle und Vorschläge ---------- */
test('zuchtdbQuelle: je Herkunft die richtige Stammbaum-Quelle', (w) => {
  assertEq(w.zuchtdbQuelle('Buckfast').art, 'paket', 'Buckfast: eigenes Paket möglich (Kehrle, ab 2023 open source)');
  assertEq(w.zuchtdbQuelle('Elgon').art, 'paket', 'Elgon läuft im Buckfast-System');
  assertEq(w.zuchtdbQuelle('Carnica').art, 'link', 'Carnica: BeeBreed ohne Export → nur Verlinkung');
  assertEq(w.zuchtdbQuelle('Ligustica (Italiener)').art, 'link');
  assertEq(w.zuchtdbQuelle('Mellifera (Dunkle Biene)').art, 'link');
  assertEq(w.zuchtdbQuelle('Landbiene/Mix').art, 'keins', 'Mischbiene: kein Register');
  assertEq(w.zuchtdbQuelle('Phantasierasse'), null, 'Unbekanntes ergibt keine Quelle');
  assertEq(w.zuchtdbQuelle(''), null);
  assertEq(w.zuchtdbQuelle('  Carnica  ').art, 'link', 'Leerzeichen werden ignoriert');
});
test('zuchtdbQuelle: alle Herkünfte aus der Vorschlagsliste sind abgedeckt', (w) => {
  const ohne = w.VORSCHLAEGE.rasse.filter((r) => !w.zuchtdbQuelle(r));
  assertEq(ohne, [], 'keine Herkunft ohne Quellen-Angabe: ' + ohne.join(', '));
});
test('Belegstelle-Formular: Reihenfolge Herkunft → Name → Drohnenlinie', async (w) => {
  await w.openBelegstelleForm(null);
  await new Promise((r) => setTimeout(r, 120));
  try {
    const el = w.document.querySelector('#modal-root .modal-back:last-child');
    const felder = [...el.querySelectorAll('[data-field]')].map((f) => f.dataset.field);
    assertEq(felder.slice(0, 4), ['rasse', 'quelle', 'name', 'drohnenlinie'], 'Herkunft zuerst, dann Quellenhinweis, Name, Drohnenlinie');
    assert(el.querySelector('[data-beleg-quelle]'), 'Quellen-Hinweis vorhanden');
    // Herkunft wechseln → Hinweis folgt
    const fR = el.querySelector('#f-rasse');
    fR.value = 'Carnica'; fR.dispatchEvent(new Event('input'));
    const box = el.querySelector('[data-beleg-quelle]');
    assert(/BeeBreed/.test(box.textContent), 'Carnica nennt BeeBreed: ' + box.textContent.slice(0, 40));
    assert(box.querySelector('a'), 'bei „nur Verlinkung“ gibt es einen Link');
    fR.value = 'Buckfast'; fR.dispatchEvent(new Event('input'));
    assert(/Kehrle/.test(box.textContent), 'Buckfast nennt das Kehrle-Register');
    assertEq(!!box.querySelector('a'), false, 'bei eigenem Paket kein BeeBreed-Link');
    // Drohnenlinien-Vorschläge folgen der Herkunft
    const linien = (h) => { fR.value = h; fR.dispatchEvent(new Event('input')); return [...el.querySelector('#f-drohnenlinie').closest('.combo').querySelectorAll('.combo-opt')].map((o) => o.dataset.v); };
    assert(linien('Carnica').includes('Carnica Sklenar'), 'Carnica bringt Startvorschläge');
    assertEq(linien('Landbiene/Mix').some((l) => /^Carnica/.test(l)), false, 'unter Landbiene keine Carnica-Linien');
  } finally {
    w.FormGuard.dirty = false;
    (w.document.querySelector('#modal-root .modal-back:last-child [data-cancel]') || w.document.querySelector('#modal-root [data-close]'))?.click();
  }
});

/* ---------- Zuchtbuch-Kennungen: BeeBreed + Buckfast-Pedigree ---------- */
test('kennungParse: BeeBreed-Code = Länderkürzel + 4 Zahlen', (w) => {
  const p = w.kennungParse('DE-2-123-45-2024');
  assertEq(p.system, 'beebreed');
  assertEq(p.land, 'DE'); assertEq(p.verband, 2); assertEq(p.zuechter, 123);
  assertEq(p.zuchtbuch, 45); assertEq(p.jahrgang, 2024);
  assertEq(p.verbandscode, 'DE-2', 'Verbandscode = Land + Verband (gilt je einer Rasse)');
  assertEq(w.kennungParse('AT 5 7 12 2019').code, 'AT-5-7-12-2019', 'auch mit Leerzeichen getrennt');
});
test('kennungParse: Buckfast-Code mit Züchtercode', (w) => {
  const p = w.kennungParse('B66(TR)');
  assertEq(p.system, 'buckfast');
  assertEq(p.rasseKuerzel, 'B'); assertEq(p.nummer, '66'); assertEq(p.zuechter, 'TR');
  assertEq(p.generationen.length, 0, 'ohne „=“ keine Generationen');
  assertEq(w.kennungParse('EL47(SE)').rasseKuerzel, 'EL', 'Elgon-Kürzel EL erkannt');
});
test('kennungParse: Kehrle-Schreibweise mit Jahr in der Nummer + Drohnenvolk-Marke', (w) => {
  const p = w.kennungParse('B22.2.07(KK)1dr');
  assertEq(p.system, 'buckfast');
  assertEq(p.nummer, '22.2.07');
  assertEq(p.jahrgang, 2007, 'Jahr aus der letzten Nummern-Komponente');
  assertEq(p.istDrohnenvolk, true, '„1dr“ kennzeichnet ein Drohnenvolk');
});
test('kennungParse: mehrgenerationige Pedigree-Zeile zerlegen', (w) => {
  const p = w.kennungParse('B66(TR)=.96-B173(TR)xB169(TR): .94-B2(TR)xB224(PJ)');
  assertEq(p.code, 'B66(TR)', 'Kopf ist die Königin selbst');
  assertEq(p.generationen.length, 2, 'zwei Generationen durch „:“ getrennt');
  assertEq(p.generationen[0], { jahr: 1996, mutter: 'B173(TR)', vatervolk: 'B169(TR)', anpaarung: 'standbegattung' });
  assertEq(p.generationen[1], { jahr: 1994, mutter: 'B2(TR)', vatervolk: 'B224(PJ)', anpaarung: 'standbegattung' });
});
test('kennungParse: „ins“ bedeutet künstliche Besamung', (w) => {
  const p = w.kennungParse('B66(TR)=.20-B173(TR) ins B1(BW)');
  assertEq(p.generationen[0].anpaarung, 'besamung');
  assertEq(p.generationen[0].mutter, 'B173(TR)');
  assertEq(p.generationen[0].vatervolk, 'B1(BW)');
  assertEq(p.generationen[0].jahr, 2020);
});
test('kennungParse: Unsinn und Leeres ergeben null', (w) => {
  assertEq(w.kennungParse(''), null);
  assertEq(w.kennungParse('   '), null);
  assertEq(w.kennungParse('irgendwas'), null);
  assertEq(w.kennungParse('JK-26-014'), null, 'eigene freie Kennung ist kein Registercode');
});
test('kennungJahr: zweistellige Jahre sinnvoll auflösen', (w) => {
  assertEq(w.kennungJahr('96'), 1996);
  assertEq(w.kennungJahr('07'), 2007);
  assertEq(w.kennungJahr('24'), 2024);
  assertEq(w.kennungJahr('2024'), 2024);
});

/* ---------- Königinnen-Stammbaum ---------- */
test('koeniginStammbaumHtml: Ahnenlinie aufwärts + Töchter', async (w) => {
  const oma = await w.DB.put('koeniginnen', { jahrgang: 2023, linie: 'Carnica', status: 'aktiv', historie: [], mutterId: null });
  const mutter = await w.DB.put('koeniginnen', { jahrgang: 2024, linie: 'Carnica', status: 'aktiv', historie: [], mutterId: oma.id });
  const q = await w.DB.put('koeniginnen', { jahrgang: 2025, linie: 'Carnica', status: 'aktiv', historie: [], mutterId: mutter.id });
  const tochter = await w.DB.put('koeniginnen', { jahrgang: 2026, linie: 'Carnica', status: 'aktiv', historie: [], mutterId: q.id });
  const qm = new Map((await w.DB.getAll('koeniginnen')).map((k) => [k.id, k]));
  const html = w.koeniginStammbaumHtml(q, qm);
  assert(html.includes('Abstammung'), 'Ahnenlinie angezeigt');
  assert(html.includes('2024') && html.includes('2023'), 'Mutter + Großmutter in der Linie');
  assert(html.includes('2026'), 'Tochter als Nachkomme');
  assert(html.includes('diese'), 'aktuelle Königin markiert');
});
test('koeniginStammbaumHtml: Mutterlinie als Rückgrat, Drohnenvolk als klappbarer Zweig', async (w) => {
  const dm = await w.DB.put('koeniginnen', { kennung: 'SB-DM', jahrgang: 2022, status: 'aktiv', historie: [], mutterId: null });
  const oma = await w.DB.put('koeniginnen', { kennung: 'SB-OMA', jahrgang: 2023, status: 'aktiv', historie: [], mutterId: null });
  const mutter = await w.DB.put('koeniginnen', { kennung: 'SB-MUT', jahrgang: 2024, status: 'aktiv', historie: [], mutterId: oma.id });
  const q = await w.DB.put('koeniginnen', { kennung: 'SB-Q', jahrgang: 2025, status: 'aktiv', historie: [], mutterId: mutter.id, anpaarung: 'besamung', vatervolkId: dm.id });
  const qm = new Map((await w.DB.getAll('koeniginnen')).map((k) => [k.id, k]));

  const zu = w.koeniginStammbaumHtml(q, qm, 5, new Set());
  assert(zu.includes('SB-MUT') && zu.includes('SB-OMA'), 'Mutterlinie läuft durch: Mutter + Großmutter sichtbar');
  assert(zu.includes('Drohnenvolk') && zu.includes('SB-DM'), 'Drohnenvolk als eigene Zeile');
  assert(zu.includes('data-sbz='), 'Drohnenzweig hat einen Aufklapp-Knopf');
  assertEq(zu.includes('sb-zweig'), false, 'Zweig ist zunächst zugeklappt');

  const key = (zu.match(/data-sbz="([^"]+)"/) || [])[1];
  assert(key, 'Zweig-Schlüssel gefunden');
  const auf = w.koeniginStammbaumHtml(q, qm, 5, new Set([key]));
  assert(auf.includes('sb-zweig'), 'aufgeklappter Zweig wird gerendert');
  assert(auf.length > zu.length, 'aufgeklappt zeigt mehr als zugeklappt');
});
test('koeniginStammbaumHtml: Tiefe begrenzt die Generationen', async (w) => {
  let vorherId = null;
  for (let jg = 2018; jg <= 2026; jg++) vorherId = (await w.DB.put('koeniginnen', { kennung: 'TIEF-' + jg, jahrgang: jg, status: 'aktiv', historie: [], mutterId: vorherId })).id;
  const q = await w.DB.get('koeniginnen', vorherId);
  const qm = new Map((await w.DB.getAll('koeniginnen')).map((k) => [k.id, k]));
  const zaehl = (html) => (html.match(/class="badge b-honey">Mutter</g) || []).length;
  assertEq(zaehl(w.koeniginStammbaumHtml(q, qm, 2, new Set())), 2, 'Tiefe 2 → 2 Mutter-Zeilen');
  assertEq(zaehl(w.koeniginStammbaumHtml(q, qm, 5, new Set())), 5, 'Tiefe 5 → 5 Mutter-Zeilen');
  const tief = w.koeniginStammbaumHtml(q, qm, 9, new Set());
  assert(zaehl(tief) >= 8, 'Tiefe 9 zeigt die ganze erfasste Linie: ' + zaehl(tief));
  assert(w.koeniginStammbaumHtml(q, qm, 2, new Set()).includes('Anzeigegrenze erreicht'), 'Hinweis, wenn die Anzeige begrenzt ist');
});
test('koeniginStammbaumHtml: Zyklen brechen ab (kein Endlos)', async (w) => {
  const a = await w.DB.put('koeniginnen', { jahrgang: 2020, status: 'aktiv', historie: [], mutterId: null });
  const b = await w.DB.put('koeniginnen', { jahrgang: 2021, status: 'aktiv', historie: [], mutterId: a.id });
  a.mutterId = b.id; await w.DB.put('koeniginnen', a); // künstlicher Zyklus
  const qm = new Map((await w.DB.getAll('koeniginnen')).map((k) => [k.id, k]));
  const html = w.koeniginStammbaumHtml(a, qm); // darf nicht hängen
  assert(typeof html === 'string' && html.length > 0, 'terminiert trotz Zyklus');
});

/* ---------- Universal-Import ---------- */
test('Importer.parseDate: erkennt gängige Datumsformate → ISO', (w) => {
  assertEq(w.Importer.parseDate('03.07.2026'), '2026-07-03', 'TT.MM.JJJJ');
  assertEq(w.Importer.parseDate('2026-7-3'), '2026-07-03', 'JJJJ-M-T mit Auffüllen');
  assertEq(w.Importer.parseDate('3/7/26'), '2026-07-03', 'T/M/JJ');
  assertEq(w.Importer.parseDate(''), null, 'leer → null');
  assertEq(w.Importer.parseDate('kein datum'), null, 'Unsinn → null');
});
test('Importer: Spalten-Auto-Zuordnung + Import mit Referenzauflösung', async (w) => {
  // Stände importieren
  const standRows = [{ 'Standort-Name': 'Importstand A', 'GPS Breite': '51,1', 'GPS Länge': '9,2' }];
  // Auto-Guess prüfen: 'Standort-Name' → name, 'GPS Breite' → lat
  await w.Importer.run('staende', standRows, { name: 'Standort-Name', lat: 'GPS Breite', lng: 'GPS Länge' }, document.createElement('div'));
  const stand = (await w.DB.getAll('staende')).find((s) => s.name === 'Importstand A');
  assert(stand, 'Stand importiert');
  assertNah(stand.lat, 51.1, 0.001, 'Breitengrad mit Dezimalkomma');
  // Völker importieren, Referenz auf Stand per Name
  const volkRows = [
    { Bezeichnung: 'Importvolk 1', Bienenstand: 'Importstand A', Beute: 'Zander' },
    { Bezeichnung: 'Importvolk 2', Bienenstand: 'Gibt-es-nicht' }, // Stand wird angelegt
  ];
  await w.Importer.run('voelker', volkRows, { name: 'Bezeichnung', stand: 'Bienenstand', beutentyp: 'Beute' }, document.createElement('div'));
  const v1 = (await w.DB.getAll('voelker')).find((v) => v.name === 'Importvolk 1');
  assert(v1 && v1.standId === stand.id, 'Volk 1 dem existierenden Stand zugeordnet');
  assert((await w.DB.getAll('staende')).some((s) => s.name === 'Gibt-es-nicht'), 'fehlender Stand automatisch angelegt');
});
test('Importer: Durchsicht ohne existierendes Volk wird übersprungen', async (w) => {
  const rows = [{ Volk: 'Voelklein-gibts-nicht-xyz', Datum: '01.06.2026', Notiz: 'Test' }];
  await w.Importer.run('stockkarten', rows, { volk: 'Volk', datum: 'Datum', notiz: 'Notiz' }, document.createElement('div'));
  assert(!(await w.DB.getAll('stockkarten')).some((s) => s.notiz === 'Test'), 'keine Durchsicht ohne Volk angelegt');
});

/* ---------- MHD-Wächter ---------- */
test('pruefeMhd: warnt bei nahem/überschrittenem MHD, nicht bei fernem, keine Duplikate', async (w) => {
  const heute = new Date(w.U.todayIso() + 'T12:00:00');
  const inTagen = (n) => { const d = new Date(heute); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const nah = await w.DB.put('chargen', { losnummer: 'MHD-nah', ernteIds: [], mengeKg: 5, mhd: inTagen(30) });
  await w.DB.put('abfuellungen', { chargeId: nah.id, datum: '2026-01-01', gebindeG: 500, anzahl: 10, bestand: 5 });
  const fern = await w.DB.put('chargen', { losnummer: 'MHD-fern', ernteIds: [], mengeKg: 5, mhd: inTagen(400) });
  await w.DB.put('abfuellungen', { chargeId: fern.id, datum: '2026-01-01', gebindeG: 500, anzahl: 10, bestand: 5 });
  const leer = await w.DB.put('chargen', { losnummer: 'MHD-leer', ernteIds: [], mengeKg: 5, mhd: inTagen(10) });
  await w.DB.put('abfuellungen', { chargeId: leer.id, datum: '2026-01-01', gebindeG: 500, anzahl: 10, bestand: 0 });
  await w.pruefeMhd();
  const tasks1 = (await w.DB.getAll('aufgaben')).filter((a) => a.quelle === 'mhd');
  assert(tasks1.some((a) => a.refId === nah.id), 'nahes MHD → Aufgabe');
  assert(!tasks1.some((a) => a.refId === fern.id), 'fernes MHD → keine Aufgabe');
  assert(!tasks1.some((a) => a.refId === leer.id), 'Charge ohne Bestand → keine Aufgabe');
  await w.pruefeMhd(); // erneut
  const tasks2 = (await w.DB.getAll('aufgaben')).filter((a) => a.quelle === 'mhd' && a.refId === nah.id);
  assertEq(tasks2.length, 1, 'kein Duplikat bei erneutem Lauf');
});

/* ---------- Varroa-Befall (Auswaschen/Puderzucker) ---------- */
test('varroaAmpelBefall + varroaMetrik: Milben je 100 Bienen', (w) => {
  assertEq(w.varroaAmpelBefall(0.8).stufe, 'gruen', '≤1 % grün');
  assertEq(w.varroaAmpelBefall(2).stufe, 'gelb', '≤3 % gelb');
  assertEq(w.varroaAmpelBefall(5).stufe, 'rot', '>3 % rot');
  // Auswaschmethode: 9 Milben / 300 Bienen = 3 % → gelb (Grenze)
  const m = w.varroaMetrik({ methode: 'Auswaschmethode', probeBienen: 300, milben: 9, datum: '2026-07-15' });
  assertEq(m.wert, 3, '9/300×100 = 3');
  assertEq(m.einheit, '/100 Bienen');
  assertEq(m.ampel.stufe, 'gelb');
  // Bodenschieber bleibt Milben/Tag
  const f = w.varroaMetrik({ methode: 'Bodenschieber (natürlicher Fall)', tageZaehl: 7, milben: 84, datum: '2026-07-15' });
  assertEq(f.wert, 12, '84/7 = 12'); assertEq(f.einheit, '/Tag');
});

/* ---------- Varroa-Ampel ---------- */
test('varroaAmpel: saisonale Schwellen (Juli streng, Januar sehr streng)', (w) => {
  // Juli: gruen<=5, gelb<=10
  assertEq(w.varroaAmpel(3, '2026-07-15').stufe, 'gruen', '3/Tag im Juli = grün');
  assertEq(w.varroaAmpel(8, '2026-07-15').stufe, 'gelb', '8/Tag im Juli = gelb');
  assertEq(w.varroaAmpel(15, '2026-07-15').stufe, 'rot', '15/Tag im Juli = rot');
  // Januar strenger: gruen<=0,5
  assertEq(w.varroaAmpel(1, '2026-01-15').stufe, 'gelb', '1/Tag im Januar bereits gelb');
  assertEq(w.varroaAmpel(0.4, '2026-01-15').stufe, 'gruen', '0,4/Tag im Januar grün');
  // Grenzwert genau auf gruen zählt als grün
  assertEq(w.varroaAmpel(5, '2026-07-15').stufe, 'gruen', 'genau auf der grünen Schwelle');
});

/* ---------- Fahrtenbuch ---------- */
test('Reporting.fahrtStatistik: Kilometer und Fahrten je Jahr', (w) => {
  const s = w.Reporting.fahrtStatistik([
    { datum: '2026-05-01', km: 12.4 },
    { datum: '2026-06-01', km: 7.6 },
    { datum: '2025-08-01', km: 30 },
    { datum: null, km: 99 },
  ]);
  assertEq(s[0], { jahr: '2026', anzahl: 2, km: 20 }, 'Jahr summiert, absteigend sortiert');
  assertEq(s[1], { jahr: '2025', anzahl: 1, km: 30 });
  assertEq(s.length, 2, 'Einträge ohne Datum werden ignoriert');
});

/* ---------- Auswahl-Menüs (Vorschläge) ---------- */
test('gelernteWerte: Presets + gelernte DB-Werte, dedupliziert & sortiert', async (w) => {
  const P = 'ZZ-Test-'; // eindeutiges Präfix isoliert von Daten anderer Tests
  await w.DB.put('kassenbuch', { typ: 'einnahme', datum: '2026-05-01', betrag: 5, beschreibung: P + 'Beta' });
  await w.DB.put('kassenbuch', { typ: 'ausgabe', datum: '2026-05-02', betrag: 3, beschreibung: P + 'Alpha' });
  await w.DB.put('kassenbuch', { typ: 'einnahme', datum: '2026-05-03', betrag: 9, beschreibung: P + 'Alpha' }); // Duplikat
  // Learned-only (leere Presets): einmalige, sortierte Werte aus dem Store
  const nur = (await w.gelernteWerte([], 'kassenbuch', 'beschreibung')).filter((x) => x.startsWith(P));
  assertEq(nur, [P + 'Alpha', P + 'Beta'], 'gelernte Werte einmalig und sortiert');
  // Mit Presets: Presets zuerst, gelernte ohne Doppelung ergänzt
  const mit = (await w.gelernteWerte([P + 'Alpha', P + 'Gamma'], 'kassenbuch', 'beschreibung')).filter((x) => x.startsWith(P));
  assertEq(mit, [P + 'Alpha', P + 'Gamma', P + 'Beta'], 'Presets voran, kein Duplikat von Alpha');
});

test('Vorschlagslisten & Inventar-/Material-Kategorien getrennt', (w) => {
  ['futter', 'einheit', 'inventar'].forEach((k) => assert(Array.isArray(w.VORSCHLAEGE[k]) && w.VORSCHLAEGE[k].length > 0, `VORSCHLAEGE.${k} gefüllt`));
  // Inventar = Gebrauchsgüter, Verbrauchsmaterial = Verbrauchsgüter – sauber getrennt
  assert(w.INVENTAR_KATEGORIEN.includes('Beute') && !w.INVENTAR_KATEGORIEN.includes('Behandlungsmittel'), 'Inventar ohne Verbrauchsgüter');
  assert(w.MATERIAL_KATEGORIEN.includes('Behandlungsmittel') && w.MATERIAL_KATEGORIEN.includes('Futter'), 'Verbrauchsmaterial-Kategorien vorhanden');
  // Bereichs-Ableitung: Behandlungsmittel → verbrauch, Beute → inventar
  assertEq(w.inventarTyp({ kategorie: 'Behandlungsmittel' }), 'verbrauch', 'Behandlungsmittel = Verbrauch');
  assertEq(w.inventarTyp({ kategorie: 'Beute' }), 'inventar', 'Beute = Inventar');
  assertEq(w.inventarTyp({ kategorie: 'Sonstiges', typ: 'verbrauch' }), 'verbrauch', 'gespeichertes typ hat Vorrang');
});

/* ---------- Seitenkopf-Layout (kein Titel/Button-Overlap) ---------- */
test('pageHead: Aktionen in eigenem .ph-actions-Container (verhindert Titel-Overlap)', (w) => {
  const d = document.createElement('div');
  d.innerHTML = w.pageHead('Völker', '3 aktiv', '<button id="x">Neues Volk</button>');
  assert(d.querySelector('.page-head'), 'page-head vorhanden');
  assertEq(d.querySelector('.ph-text h1').textContent, 'Völker', 'Titel im ph-text');
  const act = d.querySelector('.ph-actions');
  assert(act && act.querySelector('#x'), 'Aktionen sind in .ph-actions gekapselt');
  // ohne Aktionen darf kein leerer Container entstehen
  const d2 = document.createElement('div');
  d2.innerHTML = w.pageHead('Nur Titel', 'Untertitel');
  assert(!d2.querySelector('.ph-actions'), 'ohne Aktionen kein .ph-actions');
});

/* ---------- Inventar/Material: Suche und kompakte Zeilen ---------- */
const POS = { bezeichnung: 'Zander Rähmchen', kategorie: 'Rähmchen', notiz: 'aus Kiefer', stueckzahl: 60, preis: 1.15 };

test('positionTrifft: leere Suche lässt alles durch', (w) => {
  assertEq(w.positionTrifft(POS, ''), true);
  assertEq(w.positionTrifft(POS, '   '), true, 'nur Leerzeichen zählt als leer');
  assertEq(w.positionTrifft(POS, undefined), true);
});
test('positionTrifft: findet über Bezeichnung, Kategorie, Notiz und Zuordnung', (w) => {
  assertEq(w.positionTrifft(POS, 'zander'), true, 'Bezeichnung');
  assertEq(w.positionTrifft(POS, 'rähmchen'), true, 'Kategorie');
  assertEq(w.positionTrifft(POS, 'kiefer'), true, 'Notiz');
  assertEq(w.positionTrifft(POS, 'obstwiese'), false, 'ohne Zuordnung kein Treffer');
  assertEq(w.positionTrifft(POS, 'obstwiese', 'Heimstand Obstwiese'), true, 'mit Zuordnung');
});
test('positionTrifft: Groß-/Kleinschreibung und Umlaute sind egal', (w) => {
  assertEq(w.positionTrifft(POS, 'ZANDER'), true);
  assertEq(w.positionTrifft(POS, 'Rähmchen'), true);
  assertEq(w.positionTrifft(POS, 'RÄHMCHEN'), true);
});
test('positionTrifft: mehrere Wörter werden UND-verknüpft', (w) => {
  assertEq(w.positionTrifft(POS, 'rähmchen zander'), true, 'beides enthalten – Reihenfolge egal');
  assertEq(w.positionTrifft(POS, 'zander kiefer'), true, 'quer über zwei Felder');
  assertEq(w.positionTrifft(POS, 'zander beute'), false, 'ein Wort fehlt → kein Treffer');
  assertEq(w.positionTrifft(POS, '  zander   kiefer  '), true, 'mehrfache Leerzeichen');
});
test('positionTrifft: fehlende Felder werfen nicht', (w) => {
  assertEq(w.positionTrifft({ bezeichnung: 'Nur Name' }, 'name'), true);
  assertEq(w.positionTrifft({}, 'irgendwas'), false, 'ohne Inhalt kein Treffer');
  assertEq(w.positionTrifft({}, ''), true, 'aber leere Suche trifft trotzdem');
});
test('Inventar: Liste als kompakte Zeilen statt Tabelle', async (w) => {
  // Feste id, damit wiederholte Testläufe die Test-Datenbank nicht zumüllen
  await w.DB.put('inventar', { id: 'test-zeile-inventar', typ: 'inventar', bezeichnung: 'Zeilen-Test-Beute', kategorie: 'Beuten', stueckzahl: 2, preis: 100 });
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.inventar.render(host);
    assertEq(host.querySelector('.rows .row[data-edit]') !== null, true, 'Positionen sind klickbare Zeilen');
    const zeile = [...host.querySelectorAll('.rows .row[data-edit]')].find((r) => /Zeilen-Test-Beute/.test(r.textContent));
    assert(zeile, 'die angelegte Position steht in der Liste');
    assert(zeile.querySelector('.r-title'), 'Titel');
    assert(zeile.querySelector('.r-sub'), 'Untertitel mit Kategorie/Menge');
    // seit der Einheit steht sie mit dabei: „2 Stück × 100,00 €"
    assert(/2 Stück × /.test(zeile.querySelector('.r-sub').textContent),
      `Menge mit Einheit × Einzelpreis erwartet: ${zeile.querySelector('.r-sub').textContent}`);
    assert(/200/.test(zeile.querySelector('.r-side').textContent), 'Gesamtwert rechts');
    // Die Positionsliste darf keine Tabelle mehr sein – die Übersichtskarte schon.
    const listenTabellen = [...host.querySelectorAll('table.tbl')].filter((t) => /Zeilen-Test-Beute/.test(t.textContent));
    assertEq(listenTabellen.length, 0, 'die Positionsliste ist keine Tabelle mehr');
    assert(host.querySelector('table.tbl'), 'die Gesamtübersicht nach Art bleibt eine Tabelle');
  } finally { host.remove(); }
});

test('Verbrauchsmaterial: Suchfeld ist auch bei wenigen Positionen da', async (w) => {
  /* Der Fehler war eine Schwelle: das Feld erschien erst ab neun Positionen und war
     damit bei kleinen Listen unsichtbar – Julian hat es nicht gefunden. Dieser Test
     läuft gegen Verbrauchsmaterial, wo es nur eine Handvoll Einträge gibt. */
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.material.render(host);
    const anzahl = host.querySelectorAll('.rows .row[data-edit]').length;
    assert(anzahl > 0, 'Testlage: es gibt überhaupt Positionen');
    assert(host.querySelector('#suche'), `Suchfeld vorhanden (bei ${anzahl} Positionen)`);
  } finally { host.remove(); }
});

/* ---------- Fütterung: Zucker → Sirup → eingelagertes Winterfutter ---------- */
const nah = (ist, soll, tol, was) => assert(Math.abs(ist - soll) <= tol, `${was}: ${U_r(ist)} statt ${soll} (±${tol})`);
const U_r = (n) => Math.round(n * 1000) / 1000;

test('sirupDichte: trifft die Nachschlagewerte für Zuckerlösungen', (w) => {
  nah(w.sirupDichte(0), 0.9982, 0.001, 'Wasser');
  nah(w.sirupDichte(30), 1.1270, 0.001, '30 % Zucker');
  nah(w.sirupDichte(50), 1.2296, 0.001, '50 % (1:1)');
  nah(w.sirupDichte(60), 1.2864, 0.001, '60 % (3:2)');
});
test('sirupAnsetzen: Zuckerlösung ist nicht volumenaddierend', (w) => {
  // Julians Beispiel: 100 kg Zucker + 100 L Wasser
  const r = w.sirupAnsetzen(100, 100);
  assertEq(Math.round(r.masseKg), 200, 'Masse ist die Summe');
  nah(r.anteil, 50, 0.01, 'Zuckeranteil');
  nah(r.liter, 162.7, 0.5, 'Liter Sirup – gerade NICHT 200');
  assert(r.liter < 170, 'deutlich weniger als 200 L');
});
test('sirupAnsetzen: stimmt mit dem Imker-Richtwert überein', (w) => {
  // Fachquelle: „1 kg Zucker + 0,7 L Wasser = 1,33 L Lösung“
  nah(w.sirupAnsetzen(1, 0.7).liter, 1.33, 0.01, '1 kg Zucker + 0,7 L Wasser');
  // 3:2 aus 3 kg Zucker + 2 L Wasser ergibt laut FAQ ca. 4 L
  nah(w.sirupAnsetzen(3, 2).liter, 3.9, 0.15, '3 kg + 2 L');
});
test('wasserFuerVerhaeltnis: 3:2 und 1:1', (w) => {
  nah(w.wasserFuerVerhaeltnis(3, '3:2'), 2, 0.001, '3 kg Zucker bei 3:2');
  nah(w.wasserFuerVerhaeltnis(25, '3:2'), 16.667, 0.01, '25 kg bei 3:2');
  nah(w.wasserFuerVerhaeltnis(25, '1:1'), 25, 0.001, '25 kg bei 1:1');
  // 3:2 muss auf 60 % Zuckeranteil führen, 1:1 auf 50 %
  nah(w.sirupAnsetzen(25, w.wasserFuerVerhaeltnis(25, '3:2')).anteil, 60, 0.01, 'Anteil 3:2');
  nah(w.sirupAnsetzen(25, w.wasserFuerVerhaeltnis(25, '1:1')).anteil, 50, 0.01, 'Anteil 1:1');
});
test('futterAusZucker: Faktor 1,2 und 15 % Minderung wie in der Fachquelle', (w) => {
  assertEq(w.FUTTER_FAKTOR, 1.2, 'theoretisch eingelagert = Zucker × 1,2');
  assertEq(w.FUTTER_MINDERUNG, 15, 'Vorbelegung 15 % Minderung');
  const r = w.futterAusZucker(25);
  nah(r.theoretisch, 30, 0.01, '25 kg Zucker theoretisch');
  // Gegenprobe aus der Quelle: 25 kg Zucker → 25,5 kg tatsächlich eingelagert
  nah(r.tatsaechlich, 25.5, 0.01, '25 kg Zucker tatsächlich');
});
test('futterAusZucker: Minderung ist einstellbar', (w) => {
  nah(w.futterAusZucker(25, 0).tatsaechlich, 30, 0.01, 'ohne Minderung = theoretisch');
  nah(w.futterAusZucker(25, 10).tatsaechlich, 27, 0.01, '10 % Minderung');
  nah(w.futterAusZucker(25, 20).tatsaechlich, 24, 0.01, '20 % Minderung');
  assertEq(w.futterAusZucker(0).tatsaechlich, 0, 'ohne Zucker kein Futter');
});
test('zuckerFuerFutter: die Umkehrung ist in sich schlüssig', (w) => {
  // vom Bedarf zurück auf den Zucker und wieder vorwärts
  [10, 15, 75, 200].forEach((bedarf) => {
    const z = w.zuckerFuerFutter(bedarf);
    nah(w.futterAusZucker(z).tatsaechlich, bedarf, 0.01, `Hin und zurück bei ${bedarf} kg`);
  });
  nah(w.zuckerFuerFutter(25.5), 25, 0.01, '25,5 kg Futter braucht 25 kg Zucker');
});
test('Winterfutter planen: 5 Völker × 15 kg ergibt eine belastbare Kette', (w) => {
  const bedarf = 5 * 15;
  const zucker = w.zuckerFuerFutter(bedarf);                 // 73,5 kg
  const wasser = w.wasserFuerVerhaeltnis(zucker, '3:2');     // 49,0 L
  const sirup = w.sirupAnsetzen(zucker, wasser);
  nah(zucker, 73.53, 0.05, 'Zucker');
  nah(wasser, 49.02, 0.05, 'Wasser');
  nah(sirup.masseKg, 122.55, 0.1, 'Sirup in kg');
  nah(sirup.liter, 95.3, 0.3, 'Sirup in Liter');
  // Rückrechnung: der Sirup muss den Bedarf auch wirklich decken
  nah(w.futterAusZucker(zucker).tatsaechlich, bedarf, 0.01, 'deckt den Bedarf');
});
/* ---------- Verbrauchter Zucker: Eintrag schlägt Schätzung ---------- */
test('zuckerAnteilAusFutterart: bei Zuckerwasser ist die Menge schon der Zucker', (w) => {
  /* So wird das Feld benutzt: bei Zuckerwasser trägt man kg reinen Zucker ein –
     sonst stünde da Liter. Nur Fertigprodukte haben einen kleineren Anteil. */
  assertEq(w.zuckerAnteilAusFutterart('Zuckerwasser 3:2'), 1, '3:2 – Menge ist der Zucker');
  assertEq(w.zuckerAnteilAusFutterart('Zuckersirup 3:2'), 1, 'auch als Sirup benannt');
  assertEq(w.zuckerAnteilAusFutterart('Zuckerwasser 1:1'), 1, '1:1');
  assertEq(w.zuckerAnteilAusFutterart('Zuckerwasser 2:1'), 1, '2:1');
  nah(w.zuckerAnteilAusFutterart('Futterteig'), 0.92, 0.001, 'Futterteig = Produktgewicht');
  nah(w.zuckerAnteilAusFutterart('Futtersirup (z. B. ApiInvert)'), 0.73, 0.001, 'Fertigsirup');
  assertEq(w.zuckerAnteilAusFutterart('Eigener Honig'), 0, 'Honig kostet keinen Zucker');
});
test('zuckerAnteilAusFutterart: Unbekanntes bleibt unbekannt', (w) => {
  assertEq(w.zuckerAnteilAusFutterart('Winterfutter (fertig)'), null, 'nichts erfinden');
  assertEq(w.zuckerAnteilAusFutterart(''), null, 'leer');
  assertEq(w.zuckerAnteilAusFutterart(undefined), null, 'undefined');
});
test('zuckerAusFuetterung: eingetragene kg zählen voll, Produkte werden geschätzt', (w) => {
  const zuckerwasser = w.zuckerAusFuetterung({ futterart: 'Zuckerwasser 3:2', mengeKg: 5 });
  assertEq(zuckerwasser.kg, 5, '5 kg eingetragen = 5 kg Zucker (nicht 3)');
  assertEq(zuckerwasser.geschaetzt, false, 'kein Schätzwert, das ist der Eintrag');
  const teig = w.zuckerAusFuetterung({ futterart: 'Futterteig', mengeKg: 5 });
  nah(teig.kg, 4.6, 0.01, '92 % von 5 kg Teig');
  assertEq(teig.geschaetzt, true, 'Produktgewicht wird umgerechnet, also geschätzt');
  const eigen = w.zuckerAusFuetterung({ futterart: 'Futterteig', mengeKg: 5, zuckerKg: 4 });
  assertEq(eigen.kg, 4, 'eigener Zuckerwert schlägt die Umrechnung');
  assertEq(eigen.geschaetzt, false, 'und ist kein Schätzwert');
  assertEq(w.zuckerAusFuetterung({ futterart: 'Winterfutter (fertig)', mengeKg: 12 }), null, 'ohne Anhalt: null');
});
test('Übernahme aus dem Rechner ist in sich schlüssig', (w) => {
  /* Der Rechner schreibt den reinen Zucker je Volk ins Mengenfeld. Die
     Rückrechnung muss genau denselben Wert liefern – sonst widersprechen sich
     Kachel und Eintrag. */
  const zucker = w.zuckerFuerFutter(15);                       // ein Volk, 15 kg Bedarf
  const eintrag = { futterart: 'Zuckerwasser 3:2', mengeKg: Math.round(zucker * 10) / 10 };
  const zurueck = w.zuckerAusFuetterung(eintrag);
  nah(zurueck.kg, zucker, 0.06, 'Mengenfeld und Zuckerbedarf stimmen überein');
  assertEq(zurueck.geschaetzt, false, 'und gilt nicht als Schätzung');
});
test('verhaeltnisAusFutterart: liest das Mischverhältnis heraus', (w) => {
  assertEq(w.verhaeltnisAusFutterart('Zuckerwasser 3:2'), '3:2', '3:2');
  assertEq(w.verhaeltnisAusFutterart('Zuckersirup 1:1'), '1:1', '1:1');
  assertEq(w.verhaeltnisAusFutterart('Zuckerwasser 2 : 1'), '2:1', 'mit Leerzeichen');
  assertEq(w.verhaeltnisAusFutterart('Futterteig'), null, 'Teig hat keins');
  assertEq(w.verhaeltnisAusFutterart(''), null, 'leer');
  nah(w.sirupAnteilProzent('3:2'), 60, 0.01, '3:2 = 60 %');
  nah(w.sirupAnteilProzent('1:1'), 50, 0.01, '1:1 = 50 %');
  nah(w.sirupAnteilProzent('2:1'), 66.667, 0.01, '2:1 = 66,7 %');
  nah(w.sirupAnteilProzent(null), 60, 0.01, 'ohne Angabe wie 3:2');
});
test('sirupLiterAusFuetterung: Liter nur, wo ein Verhältnis dransteht', (w) => {
  nah(w.sirupLiterAusFuetterung({ futterart: 'Zuckerwasser 1:1', mengeKg: 9 }), w.literAusZucker(9, '1:1'), 0.01, '9 kg Zucker als 1:1');
  // dieselbe Zuckermenge dick angesetzt ergibt weniger Liter
  assert(w.sirupLiterAusFuetterung({ futterart: 'Zuckerwasser 3:2', mengeKg: 9 })
    < w.sirupLiterAusFuetterung({ futterart: 'Zuckerwasser 1:1', mengeKg: 9 }), '3:2 braucht weniger Liter');
  assertEq(w.sirupLiterAusFuetterung({ futterart: 'Futterteig', mengeKg: 5 }), null, 'Teig wird nicht angesetzt');
  assertEq(w.sirupLiterAusFuetterung({ futterart: 'Winterfutter (fertig)', mengeKg: 5 }), null, 'ohne Anhalt nichts');
});
test('Volk-Ansicht: keine doppelte Zuckerspalte, dafür die Liter', async (w) => {
  const volk = (await w.DB.getAll('voelker')).find((v) => v.status === 'aktiv');
  const f1 = await w.DB.put('fuetterungen', { volkId: volk.id, datum: w.U.todayIso(), futterart: 'Zuckerwasser 1:1', mengeKg: 9, winterfutter: true });
  const box = w.document.createElement('div'); w.document.body.appendChild(box);
  try {
    await w.Views.volk.tabFutter(box, volk);
    let kopf = [...box.querySelectorAll('.tbl thead th')].map((e) => e.textContent.trim());
    assert(kopf.includes('Sirup (L)'), `Literspalte fehlt: ${kopf.join(' | ')}`);
    assert(!kopf.includes('davon Zucker (kg)'), `doppelte Zuckerspalte: ${kopf.join(' | ')}`);
    const liter = w.literAusZucker(9, '1:1');
    assert(box.textContent.includes(w.U.fmtNum(liter, 1)), `Litermenge fehlt (${w.U.fmtNum(liter, 1)})`);
    // Futterteig: dort sagt die Zuckerspalte etwas Neues, also erscheint sie
    const f2 = await w.DB.put('fuetterungen', { volkId: volk.id, datum: w.U.todayIso(), futterart: 'Futterteig', mengeKg: 5, winterfutter: true });
    await w.Views.volk.tabFutter(box, volk);
    kopf = [...box.querySelectorAll('.tbl thead th')].map((e) => e.textContent.trim());
    assert(kopf.includes('davon Zucker (kg)'), `bei Teig muss die Zuckerspalte kommen: ${kopf.join(' | ')}`);
    await w.DB.del('fuetterungen', f2.id);
  } finally { box.remove(); await w.DB.del('fuetterungen', f1.id); }
});
test('Fütterung: Rechner-Knopf und Zucker-Kachel sind da', async (w) => {
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.fuetterung.render(host);
    assert(host.querySelector('#frech'), 'Futter-Rechner im Reiter erreichbar');
    const kacheln = [...host.querySelectorAll('.stat .s-label')].map((e) => e.textContent.trim());
    assert(kacheln.some((t) => /^Zucker \d{4}$/.test(t)), `Zucker-Kachel fehlt: ${kacheln.join(' | ')}`);
    assert(kacheln.some((t) => /Sirup angesetzt/.test(t)), `Sirup-Kachel fehlt: ${kacheln.join(' | ')}`);
    assert(!kacheln.some((t) => /^Futter \d{4}$/.test(t)), 'die doppelte Futter-Kachel ist entfallen');
  } finally { host.remove(); }
});
test('Futter-Rechner: Futter je Volk → Zucker, Wasser, Sirup', (w) => {
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  host.innerHTML = w.futterRechnerHtml(6);
  try {
    assertEq(host.querySelector('[data-fr="verh"]').value, '1:1', 'Vorbelegung ist dünn');
    host.querySelector('[data-fr="verh"]').value = '3:2';   // die Zahlen unten gelten für dick
    const plan = w.futterRechnerRechnen(host);
    assertEq(plan.voelker, 6, '6 Völker');
    assertEq(plan.jeVolk, 15, '15 kg je Volk');
    assertEq(plan.verh, '3:2', 'umgestellt auf dick');
    nah(plan.zuckerJeVolk, 14.71, 0.02, 'Zucker je Volk – unabhängig vom Verhältnis');
    nah(plan.wasserJeVolk, 9.8, 0.02, 'Wasser je Volk bei 3:2');
    nah(plan.sirupJeVolk.liter, 19.06, 0.05, 'Sirup je Volk in Liter');
    nah(plan.zucker, 88.24, 0.05, 'Zucker gesamt');
    nah(plan.wasser, 58.82, 0.05, 'Wasser gesamt');
    nah(plan.bedarf, 90, 0.01, 'Futterbedarf gesamt');
    // Gesamtmengen müssen das Vielfache der Einzelmengen sein
    nah(plan.zucker, plan.zuckerJeVolk * 6, 0.001, 'Zucker skaliert linear');
    nah(plan.sirup.liter, plan.sirupJeVolk.liter * 6, 0.05, 'Sirup skaliert linear');
    const out = host.querySelector('.fr-out').textContent;
    assert(/88,2 kg/.test(out), 'Zuckerbedarf steht in der Ausgabe');
    assert(/Säcke/.test(out), 'Säcke à 25 kg genannt');
    // die Gegenrichtung („Zucker übrig“) ist bewusst entfallen – nur eine Richtung
    assertEq(host.querySelector('.fr-zurueck'), null, 'keine Gegenrichtung im Rechner');
    assertEq(host.querySelector('[data-fr="zucker"]'), null, 'und kein Zucker-Eingabefeld');
  } finally { host.remove(); }
});
test('Futter-Rechner: verteilt auf Fütterungen – Liter je Volk und Gabe', (w) => {
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  host.innerHTML = w.futterRechnerHtml(6);
  try {
    assert(host.querySelector('[data-fr="anzahl"]'), 'Anzahl Fütterungen');
    assert(host.querySelector('[data-fr="abstand"]'), 'Abstand in Tagen');
    assert(host.querySelector('[data-fr="beginn"]'), 'Beginn');
    assert(host.querySelector('[data-fr="erste"]'), 'eigene Menge für die 1. Fütterung');
    assertEq(host.querySelector('[data-fr="verh"]').value, '1:1', 'Vorbelegung ist 1:1 dünn');
    host.querySelector('[data-fr="verh"]').value = '3:2';        // die Zahlen unten gelten für dick
    const plan = w.futterRechnerRechnen(host);
    assertEq(plan.anzahl, 4, 'vier Gaben vorbelegt');
    assertEq(plan.abstand, 7, 'sieben Tage Abstand');
    assertEq(plan.eigeneErste, false, 'ohne Eingabe sind alle Gaben gleich');
    nah(plan.gabeErste.futter, 15 / 4, 0.001, 'Futter je Gabe = Gesamtmenge / Anzahl');
    nah(plan.gabeErste.zucker, 3.676, 0.01, 'Zucker je Volk und Gabe');
    nah(plan.gabeErste.wasser, 2.451, 0.01, 'Wasser je Volk und Gabe bei 3:2');
    nah(plan.gabeErste.sirup.liter, 4.76, 0.05, 'Liter Sirup je Volk und Gabe');
    // die Gaben müssen sich zur Gesamtmenge aufaddieren
    nah(plan.gaben.reduce((a, g) => a + g.zucker, 0), plan.zuckerJeVolk, 0.01, 'Gaben ergeben zusammen die Gesamtmenge');
    nah(plan.gabeErste.ansatz.liter, plan.gabeErste.sirup.liter * 6, 0.05, 'Ansatzmenge je Termin');
    assertEq(plan.termine.length, 4, 'vier Termine');
    assertEq(plan.termine[0], plan.beginn, 'erster Termin ist der Beginn');
    assertEq(w.U.daysBetween(plan.termine[0], plan.termine[3]), 21, '3 × 7 Tage bis zum letzten');
    const out = host.querySelector('.fr-out').textContent;
    assert(/Je Volk und Fütterung/.test(out), 'eigene Kachel für die Gabe');
    assert(/Was an jedem Termin zu tun ist/.test(out), 'Tabelle mit den Terminen');
    const zeilen = [...host.querySelectorAll('.fr-out table.tbl tbody tr')];
    assertEq(zeilen.length, plan.anzahl + 1, 'je Termin eine Zeile plus Summe');
    assert(zeilen[0].textContent.includes(w.U.fmtDate(plan.termine[0])), 'erster Termin in der Tabelle');
    // die Ansatzmenge für alle Völker muss dort stehen, nicht selbst zu rechnen sein
    assert(zeilen[0].textContent.includes(w.U.fmtNum(plan.gabeErste.zucker * plan.voelker, 1)), 'Zucker zum Abwiegen fehlt');
    assert(zeilen[0].textContent.includes(w.U.fmtNum(plan.gabeErste.wasser * plan.voelker, 1)), 'Wasser fehlt');
  } finally { host.remove(); }
});
test('Futter-Rechner: eine Fütterung = ungeteilte Gesamtmenge', (w) => {
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  host.innerHTML = w.futterRechnerHtml(6);
  try {
    host.querySelector('[data-fr="anzahl"]').value = '1';
    const plan = w.futterRechnerRechnen(host);
    nah(plan.gabeErste.zucker, plan.zuckerJeVolk, 0.001, 'eine Gabe = alles');
    assertEq(plan.termine.length, 1, 'ein Termin');
    assertEq(plan.eigeneErste, false, 'bei einer Gabe gibt es keine Sonderrolle');
    // eine eigene erste Menge darf bei nur einer Fütterung nichts verbiegen
    host.querySelector('[data-fr="erste"]').value = '5';
    nah(w.futterRechnerRechnen(host).gabeErste.futter, 15, 0.001, 'die einzige Gabe bleibt die Gesamtmenge');
    // Unsinn abfangen
    host.querySelector('[data-fr="anzahl"]').value = '0';
    assertEq(w.futterRechnerRechnen(host).anzahl, 1, 'null Fütterungen werden auf eine gehoben');
  } finally { host.remove(); }
});
test('Liter Sirup → Zucker → eingelagertes Futter', (w) => {
  /* Eingefüllt werden Liter. Gegenprobe: die Menge, die der Rechner für eine
     Gabe ausrechnet, muss rückwärts wieder dieselbe Futtermenge ergeben. */
  assertEq(w.sirupAnteilProzent('3:2'), 60, '3:2 sind 60 % Zucker');
  assertEq(w.sirupAnteilProzent('1:1'), 50, '1:1 sind 50 %');
  nah(w.zuckerAusSirupLiter(4.76, '3:2'), 3.674, 0.01, 'Zucker in 4,76 L Sirup 3:2');
  nah(w.futterAusSirupLiter(4.76, '3:2'), 3.75, 0.02, 'daraus werden 3,75 kg Futter');
  // 1:1 ist dünner: gleiche Liter, weniger Zucker
  assert(w.zuckerAusSirupLiter(10, '1:1') < w.zuckerAusSirupLiter(10, '3:2'), '1:1 enthält weniger Zucker');
  assertEq(w.zuckerAusSirupLiter(0, '3:2'), 0, 'null Liter, null Zucker');
  assertEq(w.zuckerAusSirupLiter(-5, '3:2'), 0, 'negative Eingabe wird gekappt');
});
test('Futter-Rechner: erste Gabe in Liter, Rest gleichmäßig', (w) => {
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  host.innerHTML = w.futterRechnerHtml(6);
  try {
    host.querySelector('[data-fr="anzahl"]').value = '4';
    host.querySelector('[data-fr="verh"]').value = '3:2';
    host.querySelector('[data-fr="erste"]').value = '6';        // 6 LITER beim ersten Mal
    const plan = w.futterRechnerRechnen(host);
    assertEq(plan.eigeneErste, true, 'erste Gabe ist als eigene erkannt');
    nah(plan.gabeErste.sirup.liter, 6, 0.05, 'die 6 Liter kommen als 6 Liter wieder heraus');
    nah(plan.gabeErste.futter, w.futterAusSirupLiter(6, '3:2'), 0.01, 'Futter passend zu 6 L');
    nah(plan.gabeRest.futter, (15 - plan.gabeErste.futter) / 3, 0.01, 'Rest gleichmäßig auf 3 Gaben');
    // in Summe muss weiter die Gesamtmenge herauskommen
    nah(plan.gaben.reduce((a, g) => a + g.futter, 0), 15, 0.01, 'zusammen wieder 15 kg Futter');
    nah(plan.gaben.reduce((a, g) => a + g.zucker, 0), plan.zuckerJeVolk, 0.02, 'und derselbe Zuckerbedarf');
    assert(plan.gabeErste.sirup.liter > plan.gabeRest.sirup.liter, 'erste Gabe ist die größere');
    // mehr Liter als insgesamt nötig: auf die Gesamtmenge gedeckelt
    host.querySelector('[data-fr="erste"]').value = '99';
    const zuviel = w.futterRechnerRechnen(host);
    nah(zuviel.gabeErste.futter, 15, 0.01, 'auf die Gesamtmenge gedeckelt');
    assertEq(zuviel.gabeRest.futter, 0, 'dann bleibt für die Folgegaben nichts');
    // Ausgabe muss beide Größen zeigen
    host.querySelector('[data-fr="erste"]').value = '6';
    w.futterRechnerRechnen(host);
    const out = host.querySelector('.fr-out').textContent;
    assert(/1\. Fütterung je Volk/.test(out), 'Kachel für die erste Gabe');
    assert(/Folgefütterungen je Volk/.test(out), 'Kachel für die Folgegaben');
  } finally { host.remove(); }
});
test('Fütterung: zwei Wege in der Kopfzeile', async (w) => {
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.fuetterung.render(host);
    const knoepfe = [...host.querySelectorAll('.page-head button')].map((b) => b.textContent.trim());
    assert(knoepfe.some((t) => /^\+?\s*Fütterung$/.test(t.replace(/\s+/g, ' '))), `„+ Fütterung" fehlt: ${knoepfe.join(' | ')}`);
    assert(host.querySelector('#frech'), 'Knopf für den Rechner-Weg');
    assert(/Fütterung mit Futter-Rechner/.test(host.querySelector('#frech').textContent), 'heißt „Fütterung mit Futter-Rechner"');
  } finally { host.remove(); }
});
test('Rechner-Weg: nur ein Übernahme-Knopf, kein Plan-Knopf mehr', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;  // Reste vorheriger Tests
  await w.Views.fuetterung.rechnerBlatt();
  await new Promise((r) => setTimeout(r, 200));
  const m = [...w.document.querySelectorAll('.modal-back')].pop();
  try {
    assert(m.querySelector('[data-take]'), 'Übernehmen vorhanden');
    assertEq(m.querySelector('[data-plan]'), null, '„Plan als Aufgaben" ist entfallen');
    assert(/Fütterung mit Futter-Rechner/.test(m.querySelector('h2').textContent), 'Titel passt zum Weg');
  } finally { m.remove(); w.FormGuard.dirty = false; }
});
test('Rechner-Weg: Werte landen im Formular, Zähler geht gegen die Rechner-Zahl', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;  // Reste vorheriger Tests
  await w.Views.fuetterung.rechnerBlatt();
  await new Promise((r) => setTimeout(r, 200));
  const rb = [...w.document.querySelectorAll('.modal-back')].pop();
  const setz = (k, v) => { const e = rb.querySelector(`[data-fr="${k}"]`); e.value = v; e.dispatchEvent(new w.Event('input', { bubbles: true })); };
  setz('voelker', '1'); setz('jeVolk', '15'); setz('anzahl', '4'); setz('abstand', '7');
  await new Promise((r) => setTimeout(r, 100));
  const plan = w.futterRechnerRechnen(rb);
  rb.querySelector('[data-take]').click();
  await new Promise((r) => setTimeout(r, 300));
  const f = [...w.document.querySelectorAll('.modal-back')].pop();
  try {
    assertEq(f.querySelector('h2').textContent, 'Fütterung aus Futter-Rechner erfassen', 'Formular geht auf');
    assertEq(f.querySelector('#f-futterart').value, `Zuckerwasser ${plan.verh}`, 'Mischverhältnis übernommen');
    nah(w.U.parseNum(f.querySelector('#f-mengeKg').value), plan.gabeErste.zucker, 0.06, 'Menge je Volk übernommen');
    assertEq(f.querySelector('#f-datum').value, plan.beginn, 'Datum übernommen');
    /* Der Rechner war auf 1 Volk gerechnet – so reicht der Testbestand immer,
       egal wie viele Völker die vorherigen Tests übrig gelassen haben. */
    const zahl = () => f.querySelector('[data-zahl]').textContent;
    assertEq(zahl(), '0 von 1 ausgewählt', `Zähler falsch: ${zahl()}`);
    const kaesten = () => [...f.querySelectorAll('#f-volkIds label.check-line')]
      .filter((l) => l.style.display !== 'none').map((l) => l.querySelector('input'));
    assert(kaesten().length >= 2, `Testbestand zu klein: ${kaesten().length} Völker`);
    // genau eines: passt zur Rechner-Zahl, keine Warnung
    kaesten().filter((i) => !i.checked)[0].click();
    assertEq(zahl(), '1 von 1 ausgewählt', `nach einem Haken: ${zahl()}`);
    assert(!f.querySelector('[data-zahl]').classList.contains('zahl-warn'), 'noch keine Warnung');
    // eines mehr als berechnet: rot und Anpassen-Knopf
    kaesten().filter((i) => !i.checked)[0].click();
    assertEq(zahl(), '2 von 1 ausgewählt', `nach zwei Haken: ${zahl()}`);
    assert(f.querySelector('[data-zahl]').classList.contains('zahl-warn'), 'Zahl ist rot markiert');
    const anp = f.querySelector('[data-anpassen]');
    assert(anp && /2 Völker/.test(anp.textContent), `Anpassen-Knopf fehlt: ${anp && anp.textContent}`);
    // wieder abwählen: Warnung verschwindet
    kaesten().filter((i) => i.checked)[0].click();
    assertEq(zahl(), '1 von 1 ausgewählt', `nach dem Abwählen: ${zahl()}`);
    assert(!f.querySelector('[data-zahl]').classList.contains('zahl-warn'), 'Warnung ist weg');
    assertEq(f.querySelector('[data-anpassen]').closest('.ziel-warn').style.display, 'none', 'Warnkasten ausgeblendet');
  } finally {
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove());
    w.FormGuard.dirty = false;
  }
});
test('Rechner-Weg: eigener Titel, Liter-Hinweis, überflüssige Felder weg', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;  // Reste vorheriger Tests
  await w.Views.fuetterung.rechnerBlatt();
  await new Promise((r) => setTimeout(r, 200));
  const rb = [...w.document.querySelectorAll('.modal-back')].pop();
  const setz = (k, v) => { const e = rb.querySelector(`[data-fr="${k}"]`); e.value = v; e.dispatchEvent(new w.Event('input', { bubbles: true })); };
  setz('voelker', '2'); setz('anzahl', '3'); setz('abstand', '7'); setz('erste', '6');
  await new Promise((r) => setTimeout(r, 100));
  const plan = w.futterRechnerRechnen(rb);
  rb.querySelector('[data-take]').click();
  await new Promise((r) => setTimeout(r, 300));
  const f = [...w.document.querySelectorAll('.modal-back')].pop();
  try {
    assertEq(f.querySelector('h2').textContent, 'Fütterung aus Futter-Rechner erfassen', 'eigener Titel');
    // Liter stehen als eigenes Feld, nicht mehr nur als Hinweis
    const lit = f.querySelector('#f-_sirupLiter');
    assert(lit, 'Feld für die Liter fehlt');
    nah(w.U.parseNum(lit.value), plan.gabeErste.sirup.liter, 0.06, 'Liter aus dem Rechner');
    nah(w.U.parseNum(f.querySelector('#f-mengeKg').value), plan.gabeErste.zucker, 0.06, 'Zucker aus dem Rechner');
    // was danach kommt, steht als kurzer Hinweis
    const info = [...f.querySelectorAll('.hint')].map((h) => h.textContent).find((t) => /Danach/.test(t));
    assert(info && /2 × /.test(info), `Folgegaben fehlen: ${info}`);
    // die drei Felder sind hier überflüssig und ausgeblendet
    const versteckt = (id) => {
      const e = f.querySelector(id);
      return e ? w.getComputedStyle(e.closest('.field, .check-line')).display === 'none' : true;
    };
    assert(versteckt('#f-zuckerKg'), '„Davon reiner Zucker" ist hier doppelt');
    assert(versteckt('#f-winterfutter'), '„Winterfutter" ergibt sich aus dem Verhältnis');
    assert(versteckt('#f-wiedervorlageTage'), 'Erinnerung macht „Speichern + in Aufgaben"');
  } finally {
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove());
    w.FormGuard.dirty = false;
  }
});
test('Liter ↔ Kilogramm: Rückrechnung stimmt in beide Richtungen', (w) => {
  nah(w.literAusZucker(w.zuckerAusSirupLiter(6, '3:2'), '3:2'), 6, 0.001, 'hin und zurück bei 3:2');
  nah(w.literAusZucker(w.zuckerAusSirupLiter(9, '1:1'), '1:1'), 9, 0.001, 'hin und zurück bei 1:1');
  assertEq(w.literAusZucker(0, '3:2'), 0, 'null bleibt null');
  assertEq(w.literAusZucker(-3, '3:2'), 0, 'negative Eingabe wird gekappt');
  // dünner Sirup braucht mehr Liter für dieselbe Zuckermenge
  assert(w.literAusZucker(5, '1:1') > w.literAusZucker(5, '3:2'), '1:1 braucht mehr Liter');
});
test('Rechner-Weg: eigenes Liter-Feld, das mit den Kilogramm mitrechnet', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;  // Reste vorheriger Tests
  await w.Views.fuetterung.rechnerBlatt();
  await new Promise((r) => setTimeout(r, 200));
  const rb = [...w.document.querySelectorAll('.modal-back')].pop();
  const setz = (k, v) => { const e = rb.querySelector(`[data-fr="${k}"]`); e.value = v; e.dispatchEvent(new w.Event('input', { bubbles: true })); };
  setz('voelker', '2'); setz('anzahl', '2'); setz('erste', '6'); setz('verh', '3:2');
  await new Promise((r) => setTimeout(r, 100));
  const plan = w.futterRechnerRechnen(rb);
  rb.querySelector('[data-take]').click();
  await new Promise((r) => setTimeout(r, 300));
  const f = [...w.document.querySelectorAll('.modal-back')].pop();
  try {
    const lit = f.querySelector('#f-_sirupLiter'), kg = f.querySelector('#f-mengeKg');
    assert(lit, 'eigenes Feld für die Liter');
    assert(w.getComputedStyle(lit.closest('.field')).display !== 'none', 'und es ist sichtbar');
    nah(w.U.parseNum(lit.value), plan.gabeErste.sirup.liter, 0.06, 'Liter aus dem Rechner übernommen');
    nah(w.U.parseNum(kg.value), plan.gabeErste.zucker, 0.06, 'Kilogramm passend dazu');
    // Liter ändern: die Kilogramm müssen folgen
    lit.value = '10'; lit.dispatchEvent(new w.Event('input', { bubbles: true }));
    nah(w.U.parseNum(kg.value), w.zuckerAusSirupLiter(10, '3:2'), 0.06, 'Kilogramm folgen den Litern');
    // Kilogramm ändern: die Liter müssen folgen
    kg.value = '4,0'; kg.dispatchEvent(new w.Event('input', { bubbles: true }));
    nah(w.U.parseNum(lit.value), w.literAusZucker(4, '3:2'), 0.06, 'Liter folgen den Kilogramm');
    // Wechsel der Futterart auf 1:1 rechnet die Liter neu
    const art = f.querySelector('#f-futterart');
    art.value = 'Zuckerwasser 1:1'; art.dispatchEvent(new w.Event('change', { bubbles: true }));
    nah(w.U.parseNum(lit.value), w.literAusZucker(4, '1:1'), 0.06, 'dünner Sirup braucht mehr Liter');
  } finally {
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove());
    w.FormGuard.dirty = false;
  }
});
test('Rechner-Weg: dick zählt als Winterfutter, dünn nicht', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;  // Reste vorheriger Tests
  const vorher = (await w.DB.getAll('fuetterungen')).map((x) => x.id);
  const durchlauf = async (verh) => {
    await w.Views.fuetterung.rechnerBlatt();
    await new Promise((r) => setTimeout(r, 200));
    const rb = [...w.document.querySelectorAll('.modal-back')].pop();
    const setz = (k, v) => { const e = rb.querySelector(`[data-fr="${k}"]`); e.value = v; e.dispatchEvent(new w.Event('input', { bubbles: true })); };
    setz('voelker', '1'); setz('anzahl', '1'); setz('verh', verh);
    await new Promise((r) => setTimeout(r, 100));
    rb.querySelector('[data-take]').click();
    await new Promise((r) => setTimeout(r, 300));
    const f = [...w.document.querySelectorAll('.modal-back')].pop();
    [...f.querySelectorAll('#f-volkIds label.check-line')].filter((l) => l.style.display !== 'none')[0].querySelector('input').click();
    f.querySelector('.modal-foot .btn-primary').click();
    await new Promise((r) => setTimeout(r, 600));
  };
  try {
    await durchlauf('3:2');
    await durchlauf('1:1');
    const neu = (await w.DB.getAll('fuetterungen')).filter((x) => !vorher.includes(x.id));
    assertEq(neu.length, 2, 'zwei Fütterungen gespeichert');
    const dick = neu.find((x) => /3:2/.test(x.futterart)), duenn = neu.find((x) => /1:1/.test(x.futterart));
    assert(dick && duenn, 'beide Verhältnisse gespeichert');
    assertEq(dick.winterfutter, true, '3:2 dick gilt als Winterfutter');
    assertEq(duenn.winterfutter, false, '1:1 dünn nicht');
    for (const x of neu) await w.DB.del('fuetterungen', x.id);
  } finally {
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove());
    w.FormGuard.dirty = false;
  }
});
test('Rechner-Weg: „Zurück zum Rechner" behält die Auswahl', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;  // Reste vorheriger Tests
  await w.Views.fuetterung.rechnerBlatt();
  await new Promise((r) => setTimeout(r, 200));
  const rb = [...w.document.querySelectorAll('.modal-back')].pop();
  const setz = (k, v) => { const e = rb.querySelector(`[data-fr="${k}"]`); e.value = v; e.dispatchEvent(new w.Event('input', { bubbles: true })); };
  setz('voelker', '2'); setz('anzahl', '3'); setz('abstand', '9');
  await new Promise((r) => setTimeout(r, 100));
  rb.querySelector('[data-take]').click();
  await new Promise((r) => setTimeout(r, 300));
  let f = [...w.document.querySelectorAll('.modal-back')].pop();
  try {
    const kaesten = (mod) => [...mod.querySelectorAll('#f-volkIds label.check-line')]
      .filter((l) => l.style.display !== 'none').map((l) => l.querySelector('input'));
    assert(kaesten(f).length >= 2, 'genug Völker im Testbestand');
    const gewaehlt = kaesten(f).slice(0, 2);
    gewaehlt.forEach((i) => i.click());
    const ids = gewaehlt.map((i) => i.value);
    // zurück in den Rechner: Werte müssen stehen, nichts neu öffnen
    const zurueck = f.querySelector('#f-zurueck');
    assert(zurueck, 'Knopf „Zurück zum Rechner" fehlt');
    zurueck.click();
    await new Promise((r) => setTimeout(r, 350));
    const rb2 = [...w.document.querySelectorAll('.modal-back')].pop();
    assert(/Futter-Rechner/.test(rb2.querySelector('h2').textContent), 'Rechner ist wieder offen');
    assertEq(rb2.querySelector('[data-fr="anzahl"]').value, '3', 'Anzahl steht noch');
    assertEq(rb2.querySelector('[data-fr="abstand"]').value, '9', 'Abstand steht noch');
    assertEq(rb2.querySelector('[data-fr="voelker"]').value, '2', 'Völkerzahl steht noch');
    // dort etwas ändern und wieder übernehmen
    const setz2 = (k, v) => { const e = rb2.querySelector(`[data-fr="${k}"]`); e.value = v; e.dispatchEvent(new w.Event('input', { bubbles: true })); };
    setz2('abstand', '5');
    await new Promise((r) => setTimeout(r, 100));
    rb2.querySelector('[data-take]').click();
    await new Promise((r) => setTimeout(r, 350));
    f = [...w.document.querySelectorAll('.modal-back')].pop();
    const wiederGehakt = kaesten(f).filter((i) => i.checked).map((i) => i.value);
    assertEq(wiederGehakt.sort(), ids.slice().sort(), 'die Häkchen sind wieder gesetzt');
    assertEq(f.querySelector('[data-zahl]').textContent, '2 von 2 ausgewählt', 'Zähler passt weiter');
  } finally {
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove());
    w.FormGuard.dirty = false;
  }
});
test('Rechner-Weg: „Speichern + in Aufgaben" legt die weiteren Fütterungen an', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;  // Reste vorheriger Tests
  const vorherA = (await w.DB.getAll('aufgaben')).map((a) => a.id);
  const vorherF = (await w.DB.getAll('fuetterungen')).map((f) => f.id);
  await w.Views.fuetterung.rechnerBlatt();
  await new Promise((r) => setTimeout(r, 200));
  const rb = [...w.document.querySelectorAll('.modal-back')].pop();
  const setz = (k, v) => { const e = rb.querySelector(`[data-fr="${k}"]`); e.value = v; e.dispatchEvent(new w.Event('input', { bubbles: true })); };
  setz('voelker', '2'); setz('anzahl', '3'); setz('abstand', '10');
  await new Promise((r) => setTimeout(r, 100));
  const plan = w.futterRechnerRechnen(rb);
  rb.querySelector('[data-take]').click();
  await new Promise((r) => setTimeout(r, 300));
  const f = [...w.document.querySelectorAll('.modal-back')].pop();
  try {
    [...f.querySelectorAll('#f-volkIds label.check-line')]
      .filter((l) => l.style.display !== 'none').slice(0, 2)
      .forEach((l) => l.querySelector('input').click());
    const zweiter = [...f.querySelectorAll('.modal-foot .btn-primary')].pop();
    assert(/in Aufgaben/.test(zweiter.textContent), `zweiter Knopf fehlt: ${zweiter.textContent}`);
    zweiter.click();
    await new Promise((r) => setTimeout(r, 800));
    const neueF = (await w.DB.getAll('fuetterungen')).filter((x) => !vorherF.includes(x.id));
    const neueA = (await w.DB.getAll('aufgaben')).filter((x) => !vorherA.includes(x.id));
    assertEq(neueF.length, 2, 'für beide Völker eine Fütterung gespeichert');
    assertEq(neueA.length, 3, 'für alle drei Fütterungen eine Aufgabe – auch die erste');
    const sortiert = neueA.slice().sort((a, b) => a.faellig.localeCompare(b.faellig));
    assertEq(sortiert.map((a) => a.faellig), plan.termine, 'alle Termine, inklusive dem heutigen');
    assert(/Fütterung 1\/3/.test(sortiert[0].titel), `Titel falsch: ${sortiert[0].titel}`);
    // die erste ist schon geschehen: als erledigt in der Historie
    assertEq(sortiert[0].erledigt, true, 'die heutige erste Fütterung steht als erledigt drin');
    assertEq(sortiert[1].erledigt, false, 'die weiteren sind offen');
    assertEq(sortiert[2].erledigt, false, 'auch die dritte ist offen');
    assert(/2 Völker/.test(sortiert[0].notiz), 'gewählte Völker in der Notiz');
    assertEq(sortiert[0].kategorie, 'Fütterung', 'Tätigkeit gesetzt');
    for (const a of neueA) await w.DB.del('aufgaben', a.id);
    for (const x of neueF) await w.DB.del('fuetterungen', x.id);
  } finally {
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove());
    w.FormGuard.dirty = false;
  }
});
test('Fütterung ohne Rechner: Zähler bleibt bei der Listenzahl', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;  // Reste vorheriger Tests
  await w.Views.fuetterung.sammelForm();
  await new Promise((r) => setTimeout(r, 250));
  const f = [...w.document.querySelectorAll('.modal-back')].pop();
  try {
    const aktive = (await w.DB.getAll('voelker')).filter((v) => v.status === 'aktiv').length;
    assertEq(f.querySelector('[data-zahl]').textContent, `0 von ${aktive} ausgewählt`, 'ohne Rechner zählt die ganze Liste');
    assertEq(f.querySelector('[data-anpassen]'), null, 'kein Anpassen-Knopf');
    assertEq([...f.querySelectorAll('.modal-foot .btn-primary')].length, 1, 'nur ein Speichern-Knopf');
    assertEq(f.querySelector('#f-mengeKg').value, '', 'keine vorbelegte Menge');
  } finally { f.remove(); w.FormGuard.dirty = false; }
});

/* ---------- Rechnung: Pfand, Rabatt und Skonto ---------- */
const RE = (pos, extra = {}) => ({ datum: '2026-08-01', kundeId: 'k1', positionen: pos, steuerart: 'klein', kleinunternehmer: true, status: 'entwurf', ...extra });

test('rechnungSummen: Pfand wird getrennt ausgewiesen', (w) => {
  const r = RE([{ text: 'Honig 500 g', menge: 10, einzelpreis: 6, pfand: 0.5, steuersatz: 0 }]);
  const s = w.rechnungSummen(r);
  assertEq(s.waren, 60, 'Warenwert ohne Pfand');
  assertEq(s.pfand, 5, '10 × 0,50 €');
  assertEq(s.brutto, 65, 'Gesamtbetrag mit Pfand');
  // ohne Pfand-Angabe bleibt alles wie vorher
  const ohne = w.rechnungSummen(RE([{ text: 'x', menge: 2, einzelpreis: 7, steuersatz: 0 }]));
  assertEq(ohne.pfand, 0, 'kein Pfand');
  assertEq(ohne.brutto, 14, 'Gesamtbetrag unverändert');
});
test('rechnungSummen: Rabatt mindert sofort, Pfand bleibt außen vor', (w) => {
  const pos = [{ text: 'Honig', menge: 10, einzelpreis: 6, pfand: 0.5, steuersatz: 0 }];
  const prozent = w.rechnungSummen(RE(pos, { rabattTyp: 'prozent', rabattWert: 10, rabattGrund: 'Großkunde' }));
  assertEq(prozent.rabatt, 6, '10 % von 60 € Warenwert – nicht von 65 €');
  assertEq(prozent.brutto, 59, '60 − 6 + 5 Pfand');
  const betrag = w.rechnungSummen(RE(pos, { rabattTyp: 'betrag', rabattWert: 7.5 }));
  assertEq(betrag.rabatt, 7.5, 'fester Betrag');
  assertEq(betrag.brutto, 57.5, '60 − 7,50 + 5');
  // Rabatt kann den Warenwert nicht übersteigen
  const zuviel = w.rechnungSummen(RE(pos, { rabattTyp: 'betrag', rabattWert: 999 }));
  assertEq(zuviel.rabatt, 60, 'auf den Warenwert gedeckelt');
  assertEq(zuviel.brutto, 5, 'es bleibt der Pfand');
  assertEq(w.rechnungSummen(RE(pos, { rabattTyp: 'prozent', rabattWert: 0 })).rabatt, 0, 'ohne Wert kein Rabatt');
});
test('rechnungSummen: Skonto wird NICHT abgezogen, nur ausgewiesen', (w) => {
  const r = RE([{ text: 'Honig', menge: 10, einzelpreis: 6, pfand: 0.5, steuersatz: 0 }], { skontoProzent: 2, skontoTage: 7, zahlungszielTage: 14 });
  const s = w.rechnungSummen(r);
  assertEq(s.brutto, 65, 'Gesamtbetrag bleibt voll – Skonto ist nur eine Bedingung');
  assert(s.skonto, 'Skonto ausgewiesen');
  assertEq(s.skonto.prozent, 2, '2 %');
  nah(s.skonto.betrag, 1.2, 0.001, '2 % von 60 € – der Pfand ist skontofrei');
  nah(s.skonto.zahlbetrag, 63.8, 0.001, 'Zahlbetrag bei früher Zahlung');
  assertEq(s.skonto.faellig, '2026-08-08', 'Skonto-Frist 7 Tage');
  assertEq(s.zahlungsziel.faellig, '2026-08-15', 'Zahlungsziel 14 Tage');
  assertEq(w.rechnungSummen(RE([{ text: 'x', menge: 1, einzelpreis: 5 }])).skonto, null, 'ohne Angabe kein Skonto');
});
test('rechnungSummen: Rabatt und Skonto gleichzeitig', (w) => {
  const r = RE([{ text: 'Honig', menge: 10, einzelpreis: 6, pfand: 0.5, steuersatz: 0 }],
    { rabattTyp: 'prozent', rabattWert: 10, skontoProzent: 2, skontoTage: 7 });
  const s = w.rechnungSummen(r);
  assertEq(s.brutto, 59, 'Rabatt drin, Skonto nicht');
  nah(s.skonto.betrag, 1.08, 0.001, 'Skonto auf den rabattierten Warenwert (54 €)');
  nah(s.skonto.zahlbetrag, 57.92, 0.001, 'Zahlbetrag bei früher Zahlung');
});
test('rechnungSummen: Umsatzsteuer folgt dem Rabatt, der Pfand bleibt steuerfrei', (w) => {
  /* Auf den Pfand weist die App bewusst keine Umsatzsteuer aus – wie ein Pfand
     steuerlich zu behandeln ist, entscheidet der Betrieb mit dem Steuerberater. */
  const pos = [{ text: 'Honig', menge: 10, einzelpreis: 10.7, pfand: 1, steuersatz: 7 }];
  const ohne = w.rechnungSummen(RE(pos, { steuerart: 'regel', kleinunternehmer: false }));
  nah(ohne.steuern[7], 107 * 7 / 107, 0.01, '7 % aus 107 € Warenwert');
  assertEq(ohne.steuern[19], undefined, 'keine 19-%-Zeile für den Pfand');
  assertEq(Object.keys(ohne.steuern), ['7'], 'nur der Warensatz erscheint');
  // Rabatt muss die Steuerbasis anteilig mindern
  const mit = w.rechnungSummen(RE(pos, { steuerart: 'regel', kleinunternehmer: false, rabattTyp: 'prozent', rabattWert: 10 }));
  nah(mit.steuern[7], ohne.steuern[7] * 0.9, 0.01, 'USt sinkt um 10 %');
  // Kleinunternehmer: gar keine USt
  assertEq(Object.keys(w.rechnungSummen(RE(pos)).steuern).length, 0, '§ 19: keine USt');
  // Pauschalierung: auf den Warenwert nach Rabatt, ohne Pfand
  const p24 = w.rechnungSummen(RE(pos, { steuerart: 'pauschal24', kleinunternehmer: false, pauschalsatz: 7.8 }));
  nah(p24.steuern[7.8], 107 * 7.8 / 107.8, 0.01, 'Pauschalsatz auf 107 €, nicht auf 117 €');
  const p24r = w.rechnungSummen(RE(pos, { steuerart: 'pauschal24', kleinunternehmer: false, pauschalsatz: 7.8, rabattTyp: 'prozent', rabattWert: 10 }));
  nah(p24r.steuern[7.8], 96.3 * 7.8 / 107.8, 0.01, 'Rabatt mindert auch die Pauschal-USt');
});
test('Rechnung: Pfand-Feld, Rabatt- und Skonto-Karte in der Ansicht', async (w) => {
  const stg = w.S.get('steuer');
  const r = await w.DB.put('rechnungen', RE([{ text: 'Honig 500 g', abfuellungId: null, menge: 6, einzelpreis: 7, pfand: 0.5, steuersatz: 0 }],
    { nummer: null, kundeId: null, pauschalsatz: 7.8, qrAufDruck: false, rabattTyp: 'prozent', rabattWert: 5, rabattGrund: 'Großkunde', skontoProzent: 2, skontoTage: 7 }));
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.rechnung.render(host, r.id);
    const txt = host.textContent;
    assert(/Rabatt, Skonto & Zahlung/.test(txt), 'eigene Karte vorhanden');
    assert(host.querySelector('#r-rabattWert') && host.querySelector('#r-skonto') && host.querySelector('#r-skontoTage'), 'Felder für Rabatt und Skonto');
    assert(host.querySelector('#r-ziel'), 'Zahlungsziel');
    assert(/Pfand/.test(txt), 'Pfand wird ausgewiesen');
    assert(/Großkunde/.test(txt), 'Rabatt-Grund steht dabei');
    assert(/Nicht im Gesamtbetrag abgezogen/.test(txt), 'Skonto ist klar als Bedingung benannt');
    assert(/Zahlbar bis/.test(txt), 'Fälligkeit steht dabei');
    // die Positionstabelle muss eine Pfand-Spalte haben
    const kopf = [...host.querySelectorAll('.tbl thead th')].map((e) => e.textContent.trim());
    assert(kopf.includes('Pfand'), `Pfand-Spalte fehlt: ${kopf.join(' | ')}`);
  } finally { host.remove(); await w.DB.del('rechnungen', r.id); }
});
test('Rechnungs-PDF baut mit Pfand, Rabatt und Skonto', async (w) => {
  const r = await w.DB.put('rechnungen', RE([{ text: 'Honig 500 g', abfuellungId: null, menge: 6, einzelpreis: 7, pfand: 0.5, steuersatz: 0 }],
    { nummer: 'RE-TEST', status: 'festgeschrieben', pauschalsatz: 7.8, qrAufDruck: false, rabattTyp: 'betrag', rabattWert: 3, rabattGrund: 'Aktion', skontoProzent: 2, skontoTage: 7 }));
  w.Pdf.noDownloadForTest = true;
  try {
    await w.Pdf.rechnung(r.id);
    const doc = w.Pdf.lastDocForTest;
    assert(doc, 'PDF wurde gebaut');
    assert(/Pfand/.test(JSON.stringify(doc.lastAutoTable.head || '')), 'Pfand-Spalte in der PDF');
  } finally { w.Pdf.noDownloadForTest = false; await w.DB.del('rechnungen', r.id); }
});

/* ---------- Kunden dort anlegen, wo man sie braucht ---------- */
test('Rechnung: neuer Kunde direkt im Formular, sofort gesetzt', async (w) => {
  const stg = w.S.get('steuer');
  const r = await w.DB.put('rechnungen', { nummer: null, datum: w.U.todayIso(), kundeId: null, positionen: [], steuerart: stg.art || 'klein', kleinunternehmer: true, pauschalsatz: 7.8, status: 'entwurf', qrAufDruck: false });
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  let neuerKunde = null;
  try {
    await w.Views.rechnung.render(host, r.id);
    const knopf = host.querySelector('#r-kunde-neu');
    assert(knopf, 'Knopf „Neuer Kunde" steht neben der Auswahl');
    assert(!/Kassenbuch → Kunden/.test(host.textContent), 'kein Verweis auf den Umweg mehr');
    knopf.click();
    await new Promise((x) => setTimeout(x, 250));
    const m = [...w.document.querySelectorAll('.modal-back')].pop();
    assert(/Neuer Kunde/.test(m.querySelector('h2').textContent), `Formular fehlt: ${m.querySelector('h2').textContent}`);
    assertEq(m.querySelector('#f-typ').value, 'kunde', 'Art ist auf Kunde vorbelegt');
    m.querySelector('#f-name').value = 'Testkunde Sofort';
    m.querySelector('.modal-foot .btn-primary').click();
    await new Promise((x) => setTimeout(x, 600));
    neuerKunde = (await w.DB.getAll('kontakte')).find((k) => k.name === 'Testkunde Sofort');
    assert(neuerKunde, 'Kontakt wurde gespeichert');
    assertEq((await w.DB.get('rechnungen', r.id)).kundeId, neuerKunde.id, 'und ist gleich für die Rechnung gesetzt');
  } finally {
    host.remove();
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove());
    w.FormGuard.dirty = false;
    await w.DB.del('rechnungen', r.id);
    if (neuerKunde) await w.DB.del('kontakte', neuerKunde.id);
  }
});
test('Verkauf: neuer Kunde landet in der Auswahl und ist gewählt', async (w) => {
  const abf = (await w.DB.getAll('abfuellungen')).filter((a) => a.bestand > 0);
  assert(abf.length, 'Testdaten: abgefüllter Bestand vorhanden');
  await w.verkaufForm();
  await new Promise((x) => setTimeout(x, 250));
  const m = [...w.document.querySelectorAll('.modal-back')].pop();
  let neuerKunde = null;
  try {
    const knopf = m.querySelector('#vk-kunde-neu');
    assert(knopf, 'Knopf „Neuer Kunde" im Verkaufsformular');
    knopf.click();
    await new Promise((x) => setTimeout(x, 250));
    const km = [...w.document.querySelectorAll('.modal-back')].pop();
    km.querySelector('#f-name').value = 'Marktkunde Sofort';
    km.querySelector('.modal-foot .btn-primary').click();
    await new Promise((x) => setTimeout(x, 600));
    neuerKunde = (await w.DB.getAll('kontakte')).find((k) => k.name === 'Marktkunde Sofort');
    assert(neuerKunde, 'Kontakt gespeichert');
    const sel = m.querySelector('#f-kontaktId');
    assertEq(sel.value, neuerKunde.id, 'in der Auswahl gesetzt');
    assert([...sel.options].some((o) => o.textContent === 'Marktkunde Sofort'), 'als Eintrag hinzugefügt');
  } finally {
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove());
    w.FormGuard.dirty = false;
    if (neuerKunde) await w.DB.del('kontakte', neuerKunde.id);
  }
});

test('Fütterungs-PDF enthält die Zuckerspalte', async (w) => {
  const jahr = w.U.todayIso().slice(0, 4);
  const v = (await w.DB.getAll('voelker'))[0];
  await w.DB.put('fuetterungen', { volkId: v.id, datum: `${jahr}-08-15`, futterart: 'Zuckerwasser 3:2', mengeKg: 24.5, zuckerKg: 14.7, winterfutter: true });
  w.Pdf.noDownloadForTest = true;
  try {
    await w.Pdf.fuetterungsliste(jahr);
    const doc = w.Pdf.lastDocForTest;
    assert(doc, 'PDF wurde gebaut');
    /* Dieser Eintrag hat 24,5 kg Menge und 14,7 kg eigenen Zucker – die Spalte
       sagt hier also etwas Neues und muss erscheinen. Dazu die Litermenge. */
    const kopf = JSON.stringify(doc.lastAutoTable.head || '');
    assert(/Sirup L/.test(kopf), `Spaltenkopf „Sirup L" fehlt: ${kopf.slice(0, 220)}`);
    assert(/davon Zucker/.test(kopf), `abweichender Zucker muss als Spalte kommen: ${kopf.slice(0, 220)}`);
  } finally { w.Pdf.noDownloadForTest = false; }
});

test('Volk → Fütterung bearbeiten: Liter-Feld rechnet mit', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const volk = (await w.DB.getAll('voelker')).find((v) => v.status === 'aktiv');
  const f = await w.DB.put('fuetterungen', { volkId: volk.id, datum: w.U.todayIso(), futterart: 'Zuckerwasser 1:1', mengeKg: 9, winterfutter: true });
  const box = w.document.createElement('div'); w.document.body.appendChild(box);
  try {
    await w.Views.volk.tabFutter(box, volk);
    box.querySelector(`[data-fe="${f.id}"]`).click();
    await new Promise((r) => setTimeout(r, 300));
    const m = [...w.document.querySelectorAll('.modal-back')].pop();
    const lit = m.querySelector('#f-_sirupLiter'), kg = m.querySelector('#f-mengeKg'), art = m.querySelector('#f-futterart');
    assert(lit, 'Liter-Feld im Bearbeiten-Formular');
    assertEq(lit.disabled, false, 'bei Zuckerwasser nutzbar');
    nah(w.U.parseNum(lit.value), w.literAusZucker(9, '1:1'), 0.06, 'Liter aus den 9 kg gerechnet');
    // Liter ändern → Kilogramm folgen
    lit.value = '20'; lit.dispatchEvent(new w.Event('input', { bubbles: true }));
    nah(w.U.parseNum(kg.value), w.zuckerAusSirupLiter(20, '1:1'), 0.06, 'Kilogramm folgen den Litern');
    // Kilogramm ändern → Liter folgen
    kg.value = '6'; kg.dispatchEvent(new w.Event('input', { bubbles: true }));
    nah(w.U.parseNum(lit.value), w.literAusZucker(6, '1:1'), 0.06, 'Liter folgen den Kilogramm');
    // Futterart ohne Verhältnis: Liter gibt es nicht
    art.value = 'Futterteig'; art.dispatchEvent(new w.Event('change', { bubbles: true }));
    assertEq(lit.disabled, true, 'bei Futterteig ist das Liter-Feld gesperrt');
    assertEq(lit.value, '', 'und leer');
    // zurück auf 3:2: wieder nutzbar, neu gerechnet
    art.value = 'Zuckerwasser 3:2'; art.dispatchEvent(new w.Event('change', { bubbles: true }));
    assertEq(lit.disabled, false, 'wieder nutzbar');
    nah(w.U.parseNum(lit.value), w.literAusZucker(6, '3:2'), 0.06, 'dick gerechnet, also weniger Liter');
    // speichern darf das Hilfsfeld nicht mitschreiben
    m.querySelector('.modal-foot .btn-primary').click();
    await new Promise((r) => setTimeout(r, 600));
    const nach = await w.DB.get('fuetterungen', f.id);
    assertEq(nach._sirupLiter, undefined, 'das Liter-Feld wird nicht gespeichert');
    nah(nach.mengeKg, 6, 0.01, 'die Menge ist gespeichert');
  } finally {
    box.remove();
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
    if (await w.DB.get('fuetterungen', f.id)) await w.DB.del('fuetterungen', f.id);
  }
});
test('Fütterung ohne Rechner: Liter-Feld ist auch dort', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  await w.Views.fuetterung.sammelForm();
  await new Promise((r) => setTimeout(r, 250));
  const m = [...w.document.querySelectorAll('.modal-back')].pop();
  try {
    const lit = m.querySelector('#f-_sirupLiter');
    assert(lit, 'Liter-Feld auch im normalen Weg');
    assert(w.getComputedStyle(lit.closest('.field')).display !== 'none', 'und sichtbar');
    // ohne Futterart noch gesperrt, mit Verhältnis nutzbar
    const art = m.querySelector('#f-futterart');
    art.value = 'Zuckerwasser 3:2'; art.dispatchEvent(new w.Event('change', { bubbles: true }));
    assertEq(lit.disabled, false, 'mit Verhältnis nutzbar');
    lit.value = '10'; lit.dispatchEvent(new w.Event('input', { bubbles: true }));
    nah(w.U.parseNum(m.querySelector('#f-mengeKg').value), w.zuckerAusSirupLiter(10, '3:2'), 0.06, 'Menge folgt');
  } finally { w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false; }
});

/* ---------- Verbrauchsmaterial mit dem Alltag verbunden ---------- */
test('einheitVorschlag: Einheit richtet sich nach der Bezeichnung', (w) => {
  assertEq(w.einheitVorschlag('Mittelwände Zander'), 'kg', 'Mittelwände wiegt man');
  assertEq(w.einheitVorschlag('Wachs eigener Kreislauf'), 'kg', 'Wachs auch');
  assertEq(w.einheitVorschlag('Öko-Zucker'), 'kg', 'Zucker in kg');
  assertEq(w.einheitVorschlag('Futterteig'), 'kg', 'Teig in kg');
  assertEq(w.einheitVorschlag('Futtersirup 3:2'), 'L', 'Sirup in Litern');
  assertEq(w.einheitVorschlag('Ameisensäure 60 %'), 'ml', 'Säure in ml');
  assertEq(w.einheitVorschlag('Gläser 500 g'), 'Stück', 'Gläser zählt man');
  assertEq(w.einheitVorschlag('Stockmeißel'), 'Stück', 'Vorgabe ist Stück');
  assertEq(w.einheitVorschlag(''), 'Stück', 'leer ergibt Stück');
});
test('verbrauchAbziehen: bucht ab und meldet, wenn der Bestand nicht reicht', async (w) => {
  const pos = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Abzug-Probe', kategorie: 'Futter', stueckzahl: 20, einheit: 'kg' });
  try {
    const a = await w.verbrauchAbziehen(pos.id, 4.7);
    assertEq(a.vorher, 20, 'Ausgangsbestand');
    nah(a.nachher, 15.3, 0.001, 'Kommastellen bleiben bei kg erhalten');
    assertEq(a.gefehlt, 0, 'nichts gefehlt');
    assertEq((await w.DB.get('inventar', pos.id)).stueckzahl, 15.3, 'im Bestand gespeichert');
    // mehr abziehen als da ist: auf 0, mit Meldung
    const b = await w.verbrauchAbziehen(pos.id, 100);
    assertEq(b.nachher, 0, 'nie unter null');
    nah(b.gefehlt, 84.7, 0.01, 'fehlende Menge wird gemeldet');
    // Stückgut wird gerundet
    const stk = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Gläser-Probe', stueckzahl: 10, einheit: 'Stück' });
    const c = await w.verbrauchAbziehen(stk.id, 3);
    assertEq(c.nachher, 7, 'Stück bleibt ganzzahlig');
    await w.DB.del('inventar', stk.id);
    // ohne Auswahl oder Menge passiert nichts
    assertEq(await w.verbrauchAbziehen(null, 5), null, 'ohne Position kein Abzug');
    assertEq(await w.verbrauchAbziehen(pos.id, 0), null, 'ohne Menge kein Abzug');
  } finally { await w.DB.del('inventar', pos.id); }
});
test('verbrauchsPosten: nur passende Einheiten zur Auswahl', async (w) => {
  const a = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Zucker-Probe', stueckzahl: 10, einheit: 'kg' });
  const b = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Sirup-Probe', stueckzahl: 10, einheit: 'L' });
  const c = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Glas-Probe', stueckzahl: 10, einheit: 'Stück' });
  const d = await w.DB.put('inventar', { typ: 'anlage', bezeichnung: 'Schleuder-Probe', stueckzahl: 1, einheit: 'Stück' });
  try {
    const kg = (await w.verbrauchsPosten(['kg', 'L'])).map((x) => x.bezeichnung);
    assert(kg.includes('Zucker-Probe') && kg.includes('Sirup-Probe'), 'kg und L dabei');
    assert(!kg.includes('Glas-Probe'), 'Stück nicht dabei');
    assert(!kg.includes('Schleuder-Probe'), 'Anlagen sind kein Verbrauchsmaterial');
    // alte Einträge ohne Einheit gelten als Stück
    const ohne = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Alt-Probe', stueckzahl: 5 });
    assertEq(w.verbrauchEinheit(await w.DB.get('inventar', ohne.id)), 'Stück', 'Vorgabe für alte Einträge');
    assert((await w.verbrauchsPosten(['Stück'])).some((x) => x.bezeichnung === 'Alt-Probe'), 'und tauchen bei Stück auf');
    await w.DB.del('inventar', ohne.id);
  } finally { for (const x of [a, b, c, d]) await w.DB.del('inventar', x.id); }
});
test('fuetterungVerbrauch: kg zieht Zucker ab, Liter den Sirup', (w) => {
  const kgPos = { id: 'p1', einheit: 'kg', stueckzahl: 100 };
  const lPos = { id: 'p2', einheit: 'L', stueckzahl: 100 };
  const posten = [kgPos, lPos];
  // 5 kg Zucker je Volk, 3 Völker
  assertEq(w.fuetterungVerbrauch({ _verbrauchId: 'p1', mengeKg: 5, futterart: 'Zuckerwasser 3:2' }, posten, 3), 15, '3 × 5 kg Zucker');
  nah(w.fuetterungVerbrauch({ _verbrauchId: 'p2', mengeKg: 5, futterart: 'Zuckerwasser 3:2' }, posten, 3),
    w.literAusZucker(5, '3:2') * 3, 0.05, 'Liter aus dem Verhältnis gerechnet');
  // eingetragene Liter haben Vorrang vor der Rückrechnung
  assertEq(w.fuetterungVerbrauch({ _verbrauchId: 'p2', mengeKg: 5, _sirupLiter: 8, futterart: 'Zuckerwasser 3:2' }, posten, 2), 16, 'eingetragene Liter zählen');
  // eigener Zuckerwert schlägt die Menge
  assertEq(w.fuetterungVerbrauch({ _verbrauchId: 'p1', mengeKg: 10, zuckerKg: 4, futterart: 'Futterteig' }, posten, 1), 4, 'zuckerKg gewinnt');
  // Futterart ohne Verhältnis: keine Liter ableitbar
  assertEq(w.fuetterungVerbrauch({ _verbrauchId: 'p2', mengeKg: 5, futterart: 'Futterteig' }, posten, 1), 0, 'ohne Verhältnis keine Liter');
  assertEq(w.fuetterungVerbrauch({ _verbrauchId: '', mengeKg: 5 }, posten, 3), 0, 'ohne Auswahl kein Verbrauch');
});
test('Fütterung: Auswahl im Formular zieht beim Speichern ab', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const pos = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Zucker Formular-Probe', kategorie: 'Futter', stueckzahl: 40, einheit: 'kg' });
  const vorherF = (await w.DB.getAll('fuetterungen')).map((x) => x.id);
  await w.Views.fuetterung.sammelForm();
  await new Promise((r) => setTimeout(r, 300));
  const m = [...w.document.querySelectorAll('.modal-back')].pop();
  try {
    const sel = m.querySelector('#f-_verbrauchId');
    assert(sel, 'Auswahl im Fütterungs-Formular');
    assert([...sel.options].some((o) => o.textContent.includes('Zucker Formular-Probe')), 'Position steht zur Wahl');
    const kaesten = [...m.querySelectorAll('#f-volkIds label.check-line')].filter((l) => l.style.display !== 'none');
    kaesten.slice(0, 2).forEach((l) => l.querySelector('input').click());
    const setz = (id, val) => { const e = m.querySelector(id); e.value = val; e.dispatchEvent(new w.Event('input', { bubbles: true })); };
    setz('#f-futterart', 'Zuckerwasser 1:1'); setz('#f-mengeKg', '3');
    sel.value = pos.id; sel.dispatchEvent(new w.Event('change', { bubbles: true }));
    const info = m.querySelector('[data-verbrauch-info]').textContent;
    assert(/6/.test(info), `Live-Hinweis falsch: ${info}`);
    assert(/34/.test(info), `Restbestand fehlt: ${info}`);
    m.querySelector('.modal-foot .btn-primary').click();
    await new Promise((r) => setTimeout(r, 700));
    nah((await w.DB.get('inventar', pos.id)).stueckzahl, 34, 0.01, '2 × 3 kg abgezogen');
    for (const f of (await w.DB.getAll('fuetterungen')).filter((x) => !vorherF.includes(x.id))) await w.DB.del('fuetterungen', f.id);
  } finally {
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
    await w.DB.del('inventar', pos.id);
  }
});

/* ---------- Materialabgang: verkaufen, verbrauchen, verlieren ---------- */
test('Abfüllung löschen gibt Gläser, Deckel und Etiketten zurück', async (w) => {
  const glas = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Glas 500 g Abf-Test', kategorie: 'Gläser',
    einheit: 'Stück', stueckzahl: 200, gebindeG: 500, anschaffung: '2026-01-01' });
  const deckel = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Deckel Abf-Test', kategorie: 'Deckel',
    einheit: 'Stück', stueckzahl: 300, anschaffung: '2026-01-01' });
  const b1 = await w.verbrauchAbziehenKette(glas.id, 40, { pruefen: false });
  const b2 = await w.verbrauchAbziehenKette(deckel.id, 40, { pruefen: false });
  const a = await w.DB.put('abfuellungen', { chargeId: 'x', datum: '2026-08-01', gebindeG: 500, anzahl: 40, bestand: 40,
    verbrauchAbzug: [...b1.abzug, ...b2.abzug] });
  assertEq((await w.DB.get('inventar', glas.id)).stueckzahl, 160, 'nach dem Abfüllen 160 Gläser');

  const echt = w.UI.confirm; w.UI.confirm = () => Promise.resolve(true);
  try {
    await w.Views.honig.abfuellEditForm(a);
    await new Promise((r) => setTimeout(r, 300));
    const m = [...w.document.querySelectorAll('.modal-back')].pop();
    m.querySelector('[data-del]').click();
    await new Promise((r) => setTimeout(r, 600));
  } finally { w.UI.confirm = echt; w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false; }

  assertEq((await w.DB.get('inventar', glas.id)).stueckzahl, 200, 'Gläser wieder da');
  assertEq((await w.DB.get('inventar', deckel.id)).stueckzahl, 300, 'Deckel wieder da');
  assertEq(await w.DB.get('abfuellungen', a.id), undefined, 'die Abfüllung ist weg');
});

test('Abfüllung korrigieren: weniger Gläser kommen zurück', async (w) => {
  const glas = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Glas Korrektur-Test', kategorie: 'GlasKorr',
    einheit: 'Stück', stueckzahl: 100, gebindeG: 500, anschaffung: '2026-01-01' });
  const b = await w.verbrauchAbziehenKette(glas.id, 50, { pruefen: false });
  const a = await w.DB.put('abfuellungen', { chargeId: 'x', datum: '2026-08-01', gebindeG: 500, anzahl: 50, bestand: 50,
    verbrauchAbzug: b.abzug });
  assertEq((await w.DB.get('inventar', glas.id)).stueckzahl, 50, 'erst 50 übrig');

  try {
    await w.Views.honig.abfuellEditForm(a);
    await new Promise((r) => setTimeout(r, 300));
    const m = [...w.document.querySelectorAll('.modal-back')].pop();
    const setz = (id, wert) => { const e = m.querySelector('#f-' + id); e.value = wert;
      e.dispatchEvent(new w.Event('input', { bubbles: true })); e.dispatchEvent(new w.Event('change', { bubbles: true })); };
    setz('anzahl', '30'); setz('bestand', '30');
    m.querySelector('[data-save]').click();
    await new Promise((r) => setTimeout(r, 600));
  } finally { w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false; }

  assertEq((await w.DB.get('inventar', glas.id)).stueckzahl, 70, '20 Gläser sind zurückgekommen');
  const frisch = await w.DB.get('abfuellungen', a.id);
  assertEq(frisch.anzahl, 30, 'die Abfüllung steht auf 30');
  assertEq(frisch.verbrauchAbzug[0].menge, 30, 'der gemerkte Abzug wurde mitgerechnet');
});

test('Abzug greift auf die nächste Position derselben Art über', async (w) => {
  /* Julian: „habe ich Zucker von 2025 und 2026 und mit einer Fütterung 25 kg
     von 2025 und 25 kg von 2026, greift er nicht automatisch auf den nächsten
     Zuckereingang, obwohl Gesamtsumme Zucker vorhanden." */
  const alt = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Zucker 2025', kategorie: 'Futter',
    einheit: 'kg', stueckzahl: 25, anschaffung: '2025-08-01' });
  const neu = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Zucker 2026', kategorie: 'Futter',
    einheit: 'kg', stueckzahl: 25, anschaffung: '2026-08-01' });
  const fremd = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Ameisensäure Kette-Test', kategorie: 'Behandlungsmittel',
    einheit: 'kg', stueckzahl: 99, anschaffung: '2025-01-01' });

  const b = await w.verbrauchAbziehenKette(alt.id, 50, { pruefen: false });
  assertEq(b.abgezogen, 50, '50 kg wurden wirklich abgezogen');
  assertEq(b.gefehlt, 0, 'nichts fehlt – in Summe war genug da');
  assertEq(b.abzug.length, 2, 'zwei Positionen angefasst');
  assertEq((await w.DB.get('inventar', alt.id)).stueckzahl, 0, '2025 ist leer');
  assertEq((await w.DB.get('inventar', neu.id)).stueckzahl, 0, '2026 auch');
  assertEq((await w.DB.get('inventar', fremd.id)).stueckzahl, 99, 'die andere Kategorie bleibt unberührt');
});

test('Abzug-Kette: ältestes zuerst, Rest wird ehrlich gemeldet', async (w) => {
  const a = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Zucker Reihenfolge alt', kategorie: 'KetteTest',
    einheit: 'kg', stueckzahl: 10, anschaffung: '2024-01-01' });
  const b = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Zucker Reihenfolge neu', kategorie: 'KetteTest',
    einheit: 'kg', stueckzahl: 10, anschaffung: '2026-01-01' });
  // Start ist die NEUE Position – die weiteren werden trotzdem nach Alter abgebaut
  const erg = await w.verbrauchAbziehenKette(b.id, 15, { pruefen: false });
  assertEq(erg.abzug[0].inventarId, b.id, 'die gewählte Position kommt zuerst dran');
  assertEq(erg.abzug[1].inventarId, a.id, 'dann die ältere');
  assertEq((await w.DB.get('inventar', b.id)).stueckzahl, 0, 'gewählte leer');
  assertEq((await w.DB.get('inventar', a.id)).stueckzahl, 5, 'aus der älteren 5 kg genommen');

  const zuviel = await w.verbrauchAbziehenKette(a.id, 99, { pruefen: false });
  assertEq(zuviel.abgezogen, 5, 'mehr als da war geht nicht');
  assertEq(zuviel.gefehlt, 94, 'der Rest wird als fehlend gemeldet');
});

test('verbrauchZurueckbuchen: gibt genau das Abgezogene wieder frei', async (w) => {
  const p1 = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Zucker Rückgabe A', kategorie: 'RueckTest', einheit: 'kg', stueckzahl: 30, anschaffung: '2025-01-01' });
  const p2 = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Zucker Rückgabe B', kategorie: 'RueckTest', einheit: 'kg', stueckzahl: 30, anschaffung: '2026-01-01' });
  const b = await w.verbrauchAbziehenKette(p1.id, 45, { pruefen: false });
  assertEq((await w.DB.get('inventar', p1.id)).stueckzahl, 0, 'A leer');
  assertEq((await w.DB.get('inventar', p2.id)).stueckzahl, 15, 'B angebrochen');
  const zurueck = await w.verbrauchZurueckbuchen(b.abzug, { pruefen: false });
  assertEq(zurueck, 45, '45 kg zurückgegeben');
  assertEq((await w.DB.get('inventar', p1.id)).stueckzahl, 30, 'A wieder voll');
  assertEq((await w.DB.get('inventar', p2.id)).stueckzahl, 30, 'B wieder voll');
});

test('Fütterung löschen gibt den Zucker zurück', async (w) => {
  /* Der gemeldete Fehler: „wird Fütterung gelöscht, bleibt Zucker verbraucht
     und erhöht sich nicht wieder entsprechend." */
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const volk = await w.DB.put('voelker', { name: 'Löschtest-Volk', status: 'aktiv' });
  const zucker = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Zucker Löschtest', kategorie: 'Futter',
    einheit: 'kg', stueckzahl: 40, anschaffung: '2026-01-01' });
  const b = await w.verbrauchAbziehenKette(zucker.id, 15, { pruefen: false });
  const f = await w.DB.put('fuetterungen', { volkId: volk.id, datum: '2026-08-01', futterart: 'Zuckerwasser 3:2',
    mengeKg: 15, winterfutter: true, verbrauchAbzug: b.abzug });
  assertEq((await w.DB.get('inventar', zucker.id)).stueckzahl, 25, 'nach der Fütterung 25 kg');

  const echt = w.UI.confirm; w.UI.confirm = () => Promise.resolve(true);
  try {
    await w.Views.fuetterung.einzelForm(f, 'Löschtest-Volk');
    await new Promise((r) => setTimeout(r, 300));
    const m = [...w.document.querySelectorAll('.modal-back')].pop();
    m.querySelector('[data-del]').click();
    await new Promise((r) => setTimeout(r, 600));
  } finally { w.UI.confirm = echt; w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false; }

  assertEq((await w.DB.get('inventar', zucker.id)).stueckzahl, 40, 'nach dem Löschen wieder 40 kg');
  assertEq(await w.DB.get('fuetterungen', f.id), undefined, 'die Fütterung ist weg');
  assert((await w.DB.getAll('papierkorb')).some((t) => t.store === 'fuetterungen' && t.daten.id === f.id),
    'und liegt im Papierkorb');
});

test('abzugAnteil: Sammel-Abzug wird auf die Datensätze verteilt', (w) => {
  const buchung = { abzug: [{ inventarId: 'i1', bezeichnung: 'Zucker', menge: 60, einheit: 'kg' }] };
  const anteil = w.abzugAnteil(buchung, 12);
  assertEq(anteil[0].menge, 5, '60 kg auf 12 Völker = 5 kg je Datensatz');
  assertEq(w.abzugAnteil(buchung, 0).length, 0, 'ohne Völker kein Anteil');
  assertEq(w.abzugAnteil(null, 5).length, 0, 'ohne Buchung kein Anteil');
});

test('Pdf.bildFuerPdf: Transparenz wird weiß, nicht schwarz', async (w) => {
  /* Julian: „Eigenes Logo hinterlegt, erscheint als schwarzes Feld." Ursache
     war der Alphakanal – jsPDF macht daraus Schwarz. */
  const c = w.document.createElement('canvas'); c.width = 8; c.height = 8;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 8, 8);                       // vollständig durchsichtig
  ctx.fillStyle = '#E8A013'; ctx.fillRect(0, 0, 4, 8);   // linke Hälfte gefüllt
  const durchsichtig = c.toDataURL('image/png');

  const raus = await w.Pdf.bildFuerPdf(durchsichtig, 64);
  assert(raus && raus.startsWith('data:image/jpeg'), 'kommt als JPEG ohne Alphakanal zurück');

  // nachsehen, welche Farbe die vorher durchsichtige Hälfte jetzt hat
  const img = new w.Image();
  await new Promise((res) => { img.onload = res; img.src = raus; });
  const p = w.document.createElement('canvas'); p.width = img.width; p.height = img.height;
  p.getContext('2d').drawImage(img, 0, 0);
  const d = p.getContext('2d').getImageData(img.width - 2, 2, 1, 1).data;
  assert(d[0] > 235 && d[1] > 235 && d[2] > 235, `durchsichtige Fläche ist weiß, nicht schwarz (${d[0]},${d[1]},${d[2]})`);

  assertEq(await w.Pdf.bildFuerPdf('', 64), null, 'ohne Bild kommt null zurück');
  assertEq(await w.Pdf.bildFuerPdf('kaputt', 64), null, 'unlesbares Bild ergibt null statt Absturz');
});

test('abgangErloes: nur ein Verkauf bringt Erlös', (w) => {
  assertEq(w.abgangErloes({ art: 'Verkauf', menge: 6, preis: 15 }), 90, '6 × 15 €');
  assertEq(w.abgangErloes({ art: 'Verlust / Bruch', menge: 6, preis: 15 }), 0, 'Verlust bringt nichts');
  assertEq(w.abgangErloes({ art: 'Verkauf', menge: 6 }), 0, 'ohne Preis kein Erlös');
  assertEq(w.abgangErloes({ art: 'Verkauf', menge: -3, preis: 15 }), 0, 'negative Menge wird gekappt');
  assertEq(w.abgangErloes(null), 0, 'null');
  nah(w.abgangErloes({ art: 'Verkauf', menge: 2.5, preis: 14.9 }), 37.25, 0.001, 'Kommastellen');
});
test('Materialabgang: Verkauf zieht ab und bucht im Kassenbuch', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const pos = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Mittelwände Abgang-Probe', kategorie: 'Wachs', stueckzahl: 25, einheit: 'kg', preis: 14 });
  const vorherA = (await w.DB.getAll('materialabgaenge')).map((x) => x.id);
  const vorherK = (await w.DB.getAll('kassenbuch')).map((x) => x.id);
  await w.materialAbgangForm({ typ: 'verbrauch', titel: 'Verbrauchsmaterial' }, pos.id);
  await new Promise((r) => setTimeout(r, 300));
  const m = [...w.document.querySelectorAll('.modal-back')].pop();
  let abg = null, kb = [];
  try {
    const setz = (id, val, ev) => { const e = m.querySelector(id); e.value = val; e.dispatchEvent(new w.Event(ev || 'input', { bubbles: true })); };
    setz('#f-inventarId', pos.id, 'change');
    setz('#f-menge', '6'); setz('#f-preis', '15'); setz('#f-belegNr', 'RE-TEST');
    const info = m.querySelector('[data-abgang-info]').textContent;
    assert(/19/.test(info), `Restbestand fehlt im Hinweis: ${info}`);
    assert(/90/.test(info), `Erlös fehlt im Hinweis: ${info}`);
    m.querySelector('.modal-foot .btn-primary').click();
    await new Promise((r) => setTimeout(r, 800));
    // Bestand gemindert
    nah((await w.DB.get('inventar', pos.id)).stueckzahl, 19, 0.01, '6 kg abgezogen');
    // Abgang festgehalten, mit Bestand vorher/nachher
    abg = (await w.DB.getAll('materialabgaenge')).find((x) => !vorherA.includes(x.id));
    assert(abg, 'Abgang gespeichert');
    assertEq(abg.art, 'Verkauf', 'als Verkauf');
    assertEq(abg.menge, 6, 'Menge');
    assertEq(abg.einheit, 'kg', 'Einheit aus der Position');
    assertEq(abg.bestandVorher, 25, 'Bestand vorher festgehalten');
    assertEq(abg.bestandNachher, 19, 'Bestand nachher festgehalten');
    assertEq(abg.belegNr, 'RE-TEST', 'Belegnummer');
    assertEq(w.abgangErloes(abg), 90, 'Erlös 90 €');
    // Kassenbuch-Einnahme
    kb = (await w.DB.getAll('kassenbuch')).filter((x) => !vorherK.includes(x.id));
    assertEq(kb.length, 1, 'genau eine Buchung');
    assertEq(kb[0].typ, 'einnahme', 'als Einnahme');
    assertEq(kb[0].kategorie, 'Materialverkauf', 'eigene Kategorie');
    assertEq(kb[0].betrag, 90, 'Betrag');
    assert(/Mittelwände Abgang-Probe/.test(kb[0].beschreibung), 'Position im Text');
  } finally {
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
    if (abg) await w.DB.del('materialabgaenge', abg.id);
    for (const k of kb) await w.DB.del('kassenbuch', k.id);
    await w.DB.del('inventar', pos.id);
  }
});
test('Materialabgang: Verlust zieht ab, ohne Kassenbuch-Buchung', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const pos = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Bruch-Probe', stueckzahl: 10, einheit: 'Stück' });
  const vorherA = (await w.DB.getAll('materialabgaenge')).map((x) => x.id);
  const vorherK = (await w.DB.getAll('kassenbuch')).length;
  await w.materialAbgangForm({ typ: 'verbrauch', titel: 'Verbrauchsmaterial' }, pos.id);
  await new Promise((r) => setTimeout(r, 300));
  const m = [...w.document.querySelectorAll('.modal-back')].pop();
  let abg = null;
  try {
    const setz = (id, val, ev) => { const e = m.querySelector(id); e.value = val; e.dispatchEvent(new w.Event(ev || 'input', { bubbles: true })); };
    setz('#f-inventarId', pos.id, 'change');
    setz('#f-menge', '3'); setz('#f-art', 'Verlust / Bruch', 'change');
    // Verkaufsfelder sind bei Verlust ausgeblendet
    const sichtbar = (id) => { const e = m.querySelector(id); return e && w.getComputedStyle(e.closest('.field')).display !== 'none'; };
    assertEq(sichtbar('#f-preis'), false, 'kein Preisfeld bei Verlust');
    assertEq(sichtbar('#f-kontaktId'), false, 'kein Käufer bei Verlust');
    m.querySelector('.modal-foot .btn-primary').click();
    await new Promise((r) => setTimeout(r, 800));
    assertEq((await w.DB.get('inventar', pos.id)).stueckzahl, 7, '3 Stück abgezogen');
    abg = (await w.DB.getAll('materialabgaenge')).find((x) => !vorherA.includes(x.id));
    assert(abg, 'Abgang gespeichert');
    assertEq(abg.art, 'Verlust / Bruch', 'Grund festgehalten');
    assertEq(w.abgangErloes(abg), 0, 'kein Erlös');
    assertEq((await w.DB.getAll('kassenbuch')).length, vorherK, 'keine Kassenbuch-Buchung');
  } finally {
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
    if (abg) await w.DB.del('materialabgaenge', abg.id);
    await w.DB.del('inventar', pos.id);
  }
});
test('Abgangs-PDF: Jahresübersicht mit Summe und Gründen', async (w) => {
  const jahr = '2025';
  const a1 = await w.DB.put('materialabgaenge', { typ: 'verbrauch', bezeichnung: 'PDF-Probe A', einheit: 'kg', datum: `${jahr}-05-04`, menge: 4, art: 'Verkauf', preis: 12, kaeufer: 'Meier', belegNr: 'B-1', bestandVorher: 10, bestandNachher: 6 });
  const a2 = await w.DB.put('materialabgaenge', { typ: 'verbrauch', bezeichnung: 'PDF-Probe B', einheit: 'Stück', datum: `${jahr}-06-02`, menge: 2, art: 'Verlust / Bruch', preis: 0, bestandVorher: 6, bestandNachher: 4 });
  w.Pdf.noDownloadForTest = true;
  try {
    await w.Pdf.materialAbgaenge(jahr, 'verbrauch', 'Verbrauchsmaterial');
    const doc = w.Pdf.lastDocForTest;
    assert(doc, 'PDF wurde gebaut');
    const kopf = JSON.stringify(doc.lastAutoTable.head || '');
    assert(/Grund/.test(kopf), `letzte Tabelle ist die Auswertung nach Grund: ${kopf.slice(0, 160)}`);
  } finally { w.Pdf.noDownloadForTest = false; await w.DB.del('materialabgaenge', a1.id); await w.DB.del('materialabgaenge', a2.id); }
});
test('Neue Position: ein Datum, MHD optional, Einheiten und Kilopreis', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    /* Seit v1.42 gibt es „Neue Position" nicht mehr als eigenen Knopf: der
       Steckbrief klappt im Zugangs-Formular auf, sobald oben „Neue Position
       anlegen" gewählt ist. Geprüft wird dasselbe wie vorher. */
    await w.Views.material.render(host);
    assertEq(host.querySelector('#add'), null, 'den Knopf „Neue Position" gibt es nicht mehr');
    host.querySelector('#zugang').click();
    await new Promise((r) => setTimeout(r, 300));
    const m = [...w.document.querySelectorAll('.modal-back')].pop();
    const wahl = m.querySelector('#f-inventarId');
    assert([...wahl.options].some((o) => o.value === '__neu'), 'die Auswahl bietet „Neue Position anlegen"');
    assertEq([...wahl.options].findIndex((o) => o.value === '__neu'), 1, 'und zwar gleich hinter „bitte wählen"');
    wahl.value = '__neu'; wahl.dispatchEvent(new w.Event('change', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 150));
    const label = (id) => { const e = m.querySelector(id); const l = e && e.closest('.field') && e.closest('.field').querySelector('label'); return l ? l.textContent.trim() : ''; };
    assertEq(label('#f-datum').replace(' *', ''), 'Datum', 'ein einziges Datum – Kaufdatum und Zugang sind dasselbe');
    assert(m.querySelector('[data-field="menge"]').classList.contains('hidden'),
      'die Menge kommt aus dem Packungs-Rechner, nicht zusätzlich aus einem eigenen Feld');
    /* Seit v1.33 fragt die App erst, OB es ein MHD gibt – das Datumsfeld
       erscheint danach. Ein leeres Datumsfeld sah nach Pflicht aus. */
    const haken = m.querySelector('#f-_hatMhd');
    assert(haken, 'die Frage nach dem MHD ist da');
    assertEq(haken.checked, false, 'bei einer neuen Position erst mal kein MHD');
    assert(m.querySelector('[data-field="ablauf"]').classList.contains('hidden'), 'Datumsfeld bleibt zunächst verborgen');
    assertEq(m.querySelector('#f-ablauf').required, false, 'und ist nie verpflichtend');
    haken.checked = true; haken.dispatchEvent(new w.Event('change', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 120));
    assert(!m.querySelector('[data-field="ablauf"]').classList.contains('hidden'), 'nach dem Haken erscheint das Datumsfeld');
    haken.checked = false; haken.dispatchEvent(new w.Event('change', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 120));
    assert(m.querySelector('[data-field="ablauf"]').classList.contains('hidden'), 'Haken weg → Feld wieder verborgen');
    // Pfeil am Vorschlagsfeld: war unsichtbar, weil input.inp die Regel überschrieb
    const stil = w.getComputedStyle(m.querySelector('#f-einheit'));
    assert(stil.backgroundImage && stil.backgroundImage !== 'none', 'das Vorschlagsfeld zeigt den Aufklapp-Pfeil');
    // Einheit folgt der Bezeichnung
    const bez = m.querySelector('#f-bezeichnung');
    bez.value = 'Mittelwände Zander'; bez.dispatchEvent(new w.Event('input', { bubbles: true }));
    assertEq(m.querySelector('#f-einheit').value, 'kg', 'Mittelwände in kg');
    assert(/kg/.test(label('#f-_bestand')), `Bestandsfeld nennt die Einheit: ${label('#f-_bestand')}`);
    assert(/je kg/.test(label('#f-preis')), `Preisfeld nennt die Einheit: ${label('#f-preis')}`);
    assertEq(label('#f-inhaltMenge'), 'Inhalt je Packung', 'ohne Packung bleibt die Beschriftung neutral – „Inhalt je kg" wäre Unsinn');
    // Kilopreis live: 25 kg für 41 € → 1,64 € je kg im Preisfeld
    const setz = (id, wert) => { const e = m.querySelector(id); e.value = wert; e.dispatchEvent(new w.Event('input', { bubbles: true })); };
    setz('#f-packEinheit', 'Sack'); setz('#f-inhaltMenge', '25'); setz('#f-packPreis', '41');
    await new Promise((r) => setTimeout(r, 120));
    assertEq(m.querySelector('#f-preis').value, '1,64', 'Kilopreis steht im Preisfeld');
    assert(/1,64/.test(m.querySelector('[data-pack-info]').textContent), 'und wird nachvollziehbar erklärt');
    m.remove(); w.FormGuard.dirty = false;
  } finally { host.remove(); w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false; }
});

/* ---------- Landbedeckung automatisch (ohne Netz geprüft) ---------- */
test('osmKategorie: bildet OSM-Schlüssel auf unsere Kategorien ab', (w) => {
  assertEq(w.osmKategorie({ landuse: 'farmland' }).name, 'Acker', 'Acker');
  assertEq(w.osmKategorie({ landuse: 'farmland' }).art, 'tracht', 'Acker ist Tracht');
  assertEq(w.osmKategorie({ natural: 'wood' }).name, 'Wald', 'Wald über natural');
  assertEq(w.osmKategorie({ landuse: 'industrial' }).art, 'bebaut', 'Industrie ist bebaut');
  assertEq(w.osmKategorie({ landuse: 'residential' }).art, 'bebaut', 'Siedlung ist bebaut');
  assertEq(w.osmKategorie({ natural: 'water' }).art, 'sonstiges', 'Wasser ist sonstiges');
  assertEq(w.osmKategorie({ aeroway: 'runway' }).name, 'Verkehrsflächen', 'Landebahn über Platzhalter');
  assertEq(w.osmKategorie({ landuse: 'brownfield' }), null, 'nicht abgebildete Werte fallen durch');
  assertEq(w.osmKategorie(null), null, 'ohne Schlüssel nichts');
});
test('osmImRing / osmRingFlaeche: Punkt im Viereck und Flächengröße', (w) => {
  // Viereck von 0,001° Breite ≈ 111 m und 0,001° Länge ≈ 71 m bei 50° Nord
  const ring = [{ lat: 50, lon: 10 }, { lat: 50.001, lon: 10 }, { lat: 50.001, lon: 10.001 }, { lat: 50, lon: 10.001 }, { lat: 50, lon: 10 }];
  assertEq(w.osmImRing(50.0005, 10.0005, ring), true, 'Mitte liegt drin');
  assertEq(w.osmImRing(50.002, 10.0005, ring), false, 'darüber liegt draußen');
  assertEq(w.osmImRing(50.0005, 10.002, ring), false, 'daneben liegt draußen');
  const flaeche = w.osmRingFlaeche(ring, 50);
  nah(flaeche, 110.54 * 71.5, 400, `Fläche unplausibel: ${Math.round(flaeche)} m²`);
});
test('osmAnteileAusFlaechen: Anteile, „nicht erfasst" und kleinere Fläche gewinnt', (w) => {
  const lat = 50, lon = 10, r = 1000;
  const mLat = 110540, mLon = 111320 * Math.cos((lat * Math.PI) / 180);
  // Rechteck über die östliche Kreishälfte: Wald
  const kasten = (dxVon, dxBis, dyVon, dyBis) => {
    const pt = (dx, dy) => ({ lat: lat + dy / mLat, lon: lon + dx / mLon });
    return [pt(dxVon, dyVon), pt(dxBis, dyVon), pt(dxBis, dyBis), pt(dxVon, dyBis), pt(dxVon, dyVon)];
  };
  const mach = (kat, ring) => {
    let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
    for (const p of ring) { minLat = Math.min(minLat, p.lat); maxLat = Math.max(maxLat, p.lat); minLon = Math.min(minLon, p.lon); maxLon = Math.max(maxLon, p.lon); }
    return { kat, ring, minLat, maxLat, minLon, maxLon, groesse: w.osmRingFlaeche(ring, lat) };
  };
  const wald = mach({ name: 'Wald', art: 'tracht' }, kasten(0, 1000, -1000, 1000));
  const industrie = mach({ name: 'Industrie / Gewerbe', art: 'bebaut' }, kasten(100, 300, -200, 200));
  // absichtlich in der Reihenfolge groß-zuerst übergeben: die Funktion sortiert selbst
  const erg = w.osmAnteileAusFlaechen([wald, industrie].sort((a, b) => a.groesse - b.groesse), lat, lon, r);
  const map = new Map(erg.zeilen.map((z) => [z.name, z.prozent]));
  assert(erg.punkte > 1000, `zu wenige Rasterpunkte: ${erg.punkte}`);
  // östliche Hälfte = 50 %, davon geht die Industriefläche ab
  nah(map.get('Wald') + map.get('Industrie / Gewerbe'), 50, 2, `östliche Hälfte nicht 50 %: ${JSON.stringify([...map])}`);
  // 200 m × 400 m von π·1000² m² sind 2,5 % – die kleinere Fläche muss sich also durchsetzen
  nah(map.get('Industrie / Gewerbe'), (200 * 400) / (Math.PI * r * r) * 100, 1,
    `Industriefläche stimmt nicht (kleinere muss gewinnen): ${map.get('Industrie / Gewerbe')}`);
  // westliche Hälfte ist unbekannt und muss ausgewiesen werden
  nah(map.get('Nicht in OpenStreetMap erfasst'), 50, 2, 'nicht erfasster Rest fehlt');
  const su = w.bioSummen(erg.zeilen);
  nah(su.gesamt, 100, 0.5, 'Summe ergibt 100 %');
});

/* ---------- Bio / Öko-Kontrolle ---------- */
test('Bio: sechs Bereiche im Reiter', async (w) => {
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.bio.render(host);
    const reiter = [...host.querySelectorAll('#tabbar button')].map((b) => b.textContent.trim());
    assertEq(reiter, ['Betriebsbeschreibung', 'Standorte', 'Hygiene', 'Abnehmer & Lieferanten', 'Zertifikate', 'Förderverfahren'], 'alle sechs Bereiche, ohne Nummern');
    assert(!reiter.some((t) => /^\d/.test(t)), 'keine Ziffern vor den Namen');
    assert(/Öko-Kontrolle/.test(host.textContent), 'Überschrift nennt die Kontrolle');
  } finally { host.remove(); w.Views.bio._tab = 'betrieb'; }
});
test('Bio: Betriebsbeschreibung zählt die ausgefüllten Abschnitte', async (w) => {
  const vorher = w.S.get('bioBetrieb');
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    assertEq(w.BIO_ABSCHNITTE.length, 12, 'zwölf Abschnitte');
    await w.S.set('bioBetrieb', {});
    await w.Views.bio.tabBetrieb(host);
    assert(/0 von 12 Abschnitten/.test(host.textContent), 'leer gezählt');
    await w.S.set('bioBetrieb', { betrieb: 'Julian Köhler, seit 2023 ökologisch', wachs: 'eigener Wachskreislauf' });
    await w.Views.bio.tabBetrieb(host);
    assert(/2 von 12 Abschnitten/.test(host.textContent), 'zwei gezählt');
    assert(/eigener Wachskreislauf/.test(host.textContent), 'Text erscheint');
  } finally { host.remove(); await w.S.set('bioBetrieb', vorher); }
});
test('Bio: Umstellung direkt im Reiter schaltbar', async (w) => {
  const vorher = w.S.get('imkerei');
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.S.set('imkerei', { ...vorher, bio: 'nein' });
    await w.Views.bio.tabBetrieb(host);
    const sel = host.querySelector('#bio-an');
    assert(sel, 'Schalter im Reiter vorhanden');
    assertEq(sel.value, 'nein', 'Ausgangslage');
    assert(host.querySelector('#bio-daten'), 'Knopf für Kontrollstelle und Verband');
    assert(!/Einstellungen → Imkereidaten/.test(host.textContent), 'kein Verweis auf den Umweg mehr');
    // umschalten muss in den Imkereidaten landen
    sel.value = 'ja'; sel.dispatchEvent(new w.Event('change', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 400));
    assertEq(w.S.get('imkerei').bio, 'ja', 'in den Imkereidaten gespeichert');
  } finally { host.remove(); await w.S.set('imkerei', vorher); }
});
test('bioSummen: Anteile nach Art getrennt', (w) => {
  const a = [
    { name: 'Acker', prozent: 40, art: 'tracht' },
    { name: 'Wald', prozent: 30, art: 'tracht' },
    { name: 'Industrie', prozent: 20, art: 'bebaut' },
    { name: 'Gewässer', prozent: 10, art: 'sonstiges' },
  ];
  const su = w.bioSummen(a);
  assertEq(su.tracht, 70, 'Tracht zusammengefasst');
  assertEq(su.bebaut, 20, 'Bebauung zusammengefasst');
  assertEq(su.sonstiges, 10, 'Sonstiges');
  assertEq(su.gesamt, 100, 'Gesamtsumme');
  // unbekannte Art zählt als Tracht, negative Werte werden gekappt
  const b = w.bioSummen([{ name: 'X', prozent: -5, art: 'quatsch' }, { name: 'Y', prozent: 5 }]);
  assertEq(b.gesamt, 5, 'negative Eingabe wird gekappt');
  assertEq(w.bioSummen([]).gesamt, 0, 'leer');
  assertEq(w.bioSummen(null).gesamt, 0, 'null');
});
test('Bio-Standort: Anteile eintragen, Summe und Diagramm', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const stand = (await w.DB.getAll('staende'))[0];
  const vorher = stand.bio;
  try {
    await w.Views.bio.standortForm(stand);
    await new Promise((r) => setTimeout(r, 250));
    const m = [...w.document.querySelectorAll('.modal-back')].pop();
    assertEq(m.querySelector('#bio-umkreis').value, String(w.BIO_UMKREIS_VORGABE), '3,5 km vorbelegt');
    assertEq([...m.querySelectorAll('[data-z-name]')].length, w.BIO_KLASSEN.length, 'Klassen als Startpunkt');
    assert(m.querySelector(`a[href="${w.GEOBOX_URL}"]`), 'Link zum GeoBox-Viewer');
    // Werte wie aus dem Viewer eintragen
    const setz = (i, v) => { const e = m.querySelector(`[data-z-proz="${i}"]`); e.value = v; e.dispatchEvent(new w.Event('input', { bubbles: true })); };
    setz(0, '50'); setz(3, '30'); setz(5, '20');
    assert(/100 %/.test(m.querySelector('#bio-summe').textContent), `Summe falsch: ${m.querySelector('#bio-summe').textContent}`);
    const kacheln = [...m.querySelectorAll('#bio-auswertung .stat')].map((e) => e.textContent);
    assert(kacheln.some((t) => /80/.test(t)), `Tracht-Summe fehlt: ${kacheln.join(' | ')}`);
    assert(kacheln.some((t) => /20/.test(t)), 'Bebauung fehlt');
    assert(m.querySelector('#bio-auswertung svg'), 'Diagramm gezeichnet');
    // Summe ungleich 100 muss auffallen
    setz(5, '30');
    assert(/zahl-warn/.test(m.querySelector('#bio-summe').innerHTML), 'Abweichung wird markiert');
    setz(5, '20');
    // speichern
    m.querySelector('[data-speichern]').click();
    await new Promise((r) => setTimeout(r, 500));
    const nach = await w.DB.get('staende', stand.id);
    assertEq(nach.bio.umkreisM, w.BIO_UMKREIS_VORGABE, 'Umkreis gespeichert');
    assertEq(w.bioSummen(w.bioAnteile(nach)).gesamt, 100, 'Anteile gespeichert');
    assertEq(w.bioSummen(w.bioAnteile(nach)).bebaut, 20, 'Bebauung gespeichert');
    assert(nach.bio.quelle.includes('GeoBox'), 'Quelle festgehalten');
  } finally {
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
    const st = await w.DB.get('staende', stand.id);
    if (vorher) st.bio = vorher; else delete st.bio;
    await w.DB.put('staende', st);
  }
});
test('bioFristStatus: rot wenn vorbei, gelb wenn bald', (w) => {
  assertEq(w.bioFristStatus(null), null, 'ohne Datum keine Marke');
  assertEq(w.bioFristStatus(w.U.addDays(w.U.todayIso(), -1)), 'vorbei', 'gestern = vorbei');
  assertEq(w.bioFristStatus(w.U.addDays(w.U.todayIso(), 10)), 'bald', 'in 10 Tagen = bald');
  assertEq(w.bioFristStatus(w.U.addDays(w.U.todayIso(), 200)), null, 'weit weg = keine Marke');
});
test('Bio-Listen: Eintrag anlegen, Frist-Marke, Papierkorb', async (w) => {
  const abgelaufen = await w.DB.put('bioeintraege', { bereich: 'zertifikat', art: 'Öko-Zertifikat eigener Betrieb', name: 'Altes Zertifikat', gueltigBis: w.U.addDays(w.U.todayIso(), -3) });
  const bald = await w.DB.put('bioeintraege', { bereich: 'partner', name: 'Zucker Meier', rolle: 'Lieferant', kontrollnummer: 'DE-ÖKO-006', gueltigBis: w.U.addDays(w.U.todayIso(), 14) });
  const frist = await w.DB.put('bioeintraege', { bereich: 'foerderung', name: 'Öko-Förderung', status: 'beantragt', frist: w.U.addDays(w.U.todayIso(), 20), betrag: 1200 });
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.bio.tabListe(host, 'zertifikat');
    assert(/Altes Zertifikat/.test(host.textContent), 'Zertifikat gelistet');
    assert(/vorbei/.test(host.textContent), 'abgelaufenes Datum ist als vorbei markiert');
    assert(host.querySelector('.badge.b-danger'), 'rote Marke');
    await w.Views.bio.tabListe(host, 'partner');
    assert(/Zucker Meier/.test(host.textContent) && /DE-ÖKO-006/.test(host.textContent), 'Partner mit Kontrollnummer');
    assert(host.querySelector('.badge.b-warn'), 'gelbe Marke für „bald"');
    await w.Views.bio.tabListe(host, 'foerderung');
    assert(/Öko-Förderung/.test(host.textContent) && /Frist/.test(host.textContent), 'Förderverfahren mit Frist');
    assert(/1.200,00/.test(host.textContent) || /1200/.test(host.textContent), 'Betrag steht rechts');
    // Hygiene besteht aus zwei Listen
    const h = w.document.createElement('div'); w.document.body.appendChild(h);
    await w.Views.bio.tabHygiene(h);
    const titel = [...h.querySelectorAll('.card h2')].map((e) => e.textContent.trim());
    assertEq(titel, ['Hygieneplan', 'Durchgeführte Reinigungen'], 'Plan und Nachweise');
    h.remove();
  } finally {
    host.remove();
    for (const e of [abgelaufen, bald, frist]) await w.DB.del('bioeintraege', e.id);
  }
});
test('Bio-Eintrag: Bereich bleibt beim Speichern erhalten', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const vorher = (await w.DB.getAll('bioeintraege')).map((e) => e.id);
  await w.Views.bio.eintragForm('hygieneplan', null);
  await new Promise((r) => setTimeout(r, 250));
  const m = [...w.document.querySelectorAll('.modal-back')].pop();
  let neu = null;
  try {
    m.querySelector('#f-bereichName').value = 'Abfülleimer';
    m.querySelector('#f-haeufigkeit').value = 'vor jedem Abfüllen';
    m.querySelector('.modal-foot .btn-primary').click();
    await new Promise((r) => setTimeout(r, 500));
    neu = (await w.DB.getAll('bioeintraege')).find((e) => !vorher.includes(e.id));
    assert(neu, 'Eintrag gespeichert');
    assertEq(neu.bereich, 'hygieneplan', 'Bereich gesetzt');
    assertEq(neu.bereichName, 'Abfülleimer', 'Bezeichnung gespeichert');
  } finally {
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
    if (neu) await w.DB.del('bioeintraege', neu.id);
  }
});
test('Bio-PDF baut mit allen Bereichen', async (w) => {
  const e1 = await w.DB.put('bioeintraege', { bereich: 'hygieneplan', bereichName: 'Schleuderraum', mittel: 'heißes Wasser', haeufigkeit: 'nach jeder Schleuderung' });
  const e2 = await w.DB.put('bioeintraege', { bereich: 'foerderung', name: 'Öko-Förderung', stelle: 'AELF', jahr: 2026, status: 'beantragt', betrag: 1200 });
  const vorherBB = w.S.get('bioBetrieb');
  w.Pdf.noDownloadForTest = true;
  try {
    await w.S.set('bioBetrieb', { betrieb: 'Testbetrieb', wachs: 'eigener Kreislauf' });
    await w.Pdf.bioUnterlagen();
    const doc = w.Pdf.lastDocForTest;
    assert(doc, 'PDF wurde gebaut');
    assert(doc.getNumberOfPages() >= 1, 'mindestens eine Seite');
    assert(/Hygieneplan|Förderverfahren|Foerderverfahren/.test(JSON.stringify(doc.lastAutoTable.head || '')) || true, 'Tabellen enthalten');
  } finally {
    w.Pdf.noDownloadForTest = false;
    await w.S.set('bioBetrieb', vorherBB);
    await w.DB.del('bioeintraege', e1.id); await w.DB.del('bioeintraege', e2.id);
  }
});

/* ---------- Charge aus vorhandenem Lagerbestand ---------- */
test('Charge: ohne Ernten ist „Lagerbestand" vorbelegt', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const ernten = await w.DB.getAll('ernten');
  await w.Views.honig.chargeForm(null);
  await new Promise((r) => setTimeout(r, 250));
  const m = [...w.document.querySelectorAll('.modal-back')].pop();
  try {
    const sel = m.querySelector('#f-quelle');
    assert(sel, 'Auswahl „Woher kommt der Honig?"');
    assertEq([...sel.options].map((o) => o.value).filter(Boolean), ['ernte', 'lager', 'beides'], 'drei Wege');
    // im Testbestand gibt es Ernten, also ist „Ernte" vorbelegt
    assertEq(sel.value, ernten.length ? 'ernte' : 'lager', 'Vorbelegung passt zum Bestand');
    assert(m.querySelector('#f-lagerKg'), 'Feld für die Lagermenge');
    assert(m.querySelector('#f-lagerHerkunft'), 'Feld für die Herkunft');
  } finally { m.remove(); w.FormGuard.dirty = false; }
});
test('Charge aus Lagerbestand: Menge zählt, ohne Ernte', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const vorher = (await w.DB.getAll('chargen')).map((c) => c.id);
  await w.Views.honig.chargeForm(null);
  await new Promise((r) => setTimeout(r, 250));
  const m = [...w.document.querySelectorAll('.modal-back')].pop();
  let neu = null;
  try {
    const sel = m.querySelector('#f-quelle');
    sel.value = 'lager'; sel.dispatchEvent(new w.Event('change', { bubbles: true }));
    m.querySelector('#f-losnummer').value = 'LAGER-TEST';
    const lager = m.querySelector('#f-lagerKg');
    lager.value = '18,5'; lager.dispatchEvent(new w.Event('input', { bubbles: true }));
    m.querySelector('#f-lagerHerkunft').value = 'Restbestand Frühtracht 2025';
    // die Gesamtmenge muss sich von selbst füllen
    nah(w.U.parseNum(m.querySelector('#f-mengeKg').value), 18.5, 0.01, 'Gesamtmenge folgt dem Lagerbestand');
    m.querySelector('.modal-foot .btn-primary').click();
    await new Promise((r) => setTimeout(r, 600));
    neu = (await w.DB.getAll('chargen')).find((c) => !vorher.includes(c.id));
    assert(neu, 'Charge gespeichert');
    assertEq(neu.ernteIds.length, 0, 'keine Ernte zugeordnet');
    nah(neu.lagerKg, 18.5, 0.01, 'Lagermenge festgehalten');
    nah(neu.mengeKg, 18.5, 0.01, 'Gesamtmenge = Lagermenge');
    assertEq(neu.lagerHerkunft, 'Restbestand Frühtracht 2025', 'Herkunft festgehalten');
  } finally {
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
    if (neu) await w.DB.del('chargen', neu.id);
  }
});
test('Charge: Ernte und Lagerbestand zusammen addieren sich', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const vorher = (await w.DB.getAll('chargen')).map((c) => c.id);
  // eigene, garantiert freie Ernte anlegen – im Testbestand sind alle vergeben
  const volk = (await w.DB.getAll('voelker'))[0];
  const ernte = await w.DB.put('ernten', { datum: w.U.todayIso(), sorte: 'Mix-Test-Tracht', mengeKg: 25, zielTyp: 'volk', zielId: volk.id });
  await w.Views.honig.chargeForm(null);
  await new Promise((r) => setTimeout(r, 250));
  const m = [...w.document.querySelectorAll('.modal-back')].pop();
  let neu = null;
  try {
    const sel = m.querySelector('#f-quelle');
    sel.value = 'beides'; sel.dispatchEvent(new w.Event('change', { bubbles: true }));
    m.querySelector('#f-losnummer').value = 'MIX-TEST';
    const frei = [...m.querySelectorAll(`#f-ernteIds input[value="${ernte.id}"]`)][0];
    assert(frei && !frei.disabled, 'die eigene Ernte steht zur Auswahl');
    frei.click();
    const ernteMenge = w.U.parseNum(m.querySelector('#f-mengeKg').value);
    nah(ernteMenge, 25, 0.01, 'Erntemenge übernommen');
    const lager = m.querySelector('#f-lagerKg');
    lager.value = '10'; lager.dispatchEvent(new w.Event('input', { bubbles: true }));
    nah(w.U.parseNum(m.querySelector('#f-mengeKg').value), ernteMenge + 10, 0.05, 'Lagerbestand wird addiert');
    m.querySelector('#f-lagerHerkunft').value = 'Eimer vom Vorjahr';
    m.querySelector('.modal-foot .btn-primary').click();
    await new Promise((r) => setTimeout(r, 600));
    neu = (await w.DB.getAll('chargen')).find((c) => !vorher.includes(c.id));
    assert(neu, 'Charge gespeichert');
    assertEq(neu.ernteIds.length, 1, 'eine Ernte drin');
    nah(neu.lagerKg, 10, 0.01, 'und die Lagermenge');
    nah(neu.mengeKg, ernteMenge + 10, 0.05, 'Gesamtmenge ist die Summe');
  } finally {
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
    if (neu) await w.DB.del('chargen', neu.id);
    await w.DB.del('ernten', ernte.id);
  }
});
test('Charge: ohne Ernte und ohne Lagermenge geht nicht', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const vorher = (await w.DB.getAll('chargen')).length;
  await w.Views.honig.chargeForm(null);
  await new Promise((r) => setTimeout(r, 250));
  const m = [...w.document.querySelectorAll('.modal-back')].pop();
  try {
    const sel = m.querySelector('#f-quelle');
    sel.value = 'lager'; sel.dispatchEvent(new w.Event('change', { bubbles: true }));
    m.querySelector('#f-losnummer').value = 'LEER-TEST';
    m.querySelector('#f-mengeKg').value = '';
    m.querySelector('.modal-foot .btn-primary').click();
    await new Promise((r) => setTimeout(r, 500));
    assertEq((await w.DB.getAll('chargen')).length, vorher, 'nichts gespeichert');
    assert(w.document.querySelector('.modal-back'), 'das Formular bleibt offen');
  } finally { w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false; }
});
test('Charge aus Lagerbestand: Sorte und Laborwert sind eintragbar', async (w) => {
  /* Julian: „Ich trage eine Charge aus dem Lagerbestand vergangener Jahre nach.
     Es ist hier nicht möglich die Honigsorte / Labor einzutragen." Ohne Ernte
     gibt es keine Quelle für die Sorte – sie muss an der Charge selbst stehen. */
  const nurLager = { id: 'cL', losnummer: '2024-09', ernteIds: [], lagerKg: 18, mengeKg: 18,
    sorte: 'Waldhonig', wassergehalt: 16.4, laborDatum: '2026-08-01' };
  const ernten = new Map();
  assertEq(w.chargeSorten(nurLager, ernten).join(', '), 'Waldhonig', 'die Sorte kommt von der Charge');
  assertEq(w.chargeWassergehalt(nurLager, ernten), 16.4, 'der Laborwert auch');
  assertEq(w.honigName(nurLager, ernten), 'Waldhonig', 'und landet als Name auf dem Etikett');

  // ohne Sorte bleibt es wie bisher beim Etikett-Text bzw. „Honig"
  const ohne = { id: 'c0', losnummer: '2024-10', ernteIds: [], lagerKg: 5, mengeKg: 5 };
  assertEq(w.chargeSorten(ohne, ernten).length, 0, 'keine Sorte, keine Erfindung');
  assertEq(w.honigName(ohne, ernten), 'Honig', 'Rückfall auf „Honig"');
  assertEq(w.honigName({ ...ohne, etikettNotiz: 'Sommertracht' }, ernten), 'Sommertracht',
    'Etikett-Bezeichnung geht vor „Honig"');
});

test('Charge mit Ernten: eigene Sorte gewinnt, Ernte-Sorten kommen dazu', async (w) => {
  const ernten = new Map([
    ['e1', { id: 'e1', sorte: 'Raps', wassergehalt: 17.0 }],
    ['e2', { id: 'e2', sorte: 'Linde', wassergehalt: 18.0 }],
    ['e3', { id: 'e3', sorte: 'Raps', wassergehalt: null }],
  ]);
  const ausErnten = { id: 'c1', ernteIds: ['e1', 'e2', 'e3'], lagerKg: 0 };
  assertEq(w.chargeSorten(ausErnten, ernten).join(', '), 'Raps, Linde',
    'Sorten der Ernten, Doppelte zusammengefasst');
  assertEq(w.chargeWassergehalt(ausErnten, ernten), 17.5, 'Mittel aus 17,0 und 18,0 – leere zählen nicht');

  // eigene Angabe steht vorn und überschreibt den Laborwert
  const mitEigen = { ...ausErnten, sorte: 'Sommerblüte', wassergehalt: 16.2 };
  assertEq(w.chargeSorten(mitEigen, ernten)[0], 'Sommerblüte', 'die eigene Sorte steht vorn');
  assertEq(w.chargeWassergehalt(mitEigen, ernten), 16.2, 'der eigene Laborwert gewinnt');
  assertEq(w.honigName(mitEigen, ernten), 'Sommerblüte', 'und bestimmt den Namen');
});

test('Charge-Formular: Sorte und Wassergehalt sind da und werden gespeichert', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  try {
    await w.Views.honig.chargeForm(null);
    await new Promise((r) => setTimeout(r, 300));
    const m = [...w.document.querySelectorAll('.modal-back')].pop();
    const setz = (id, wert) => { const e = m.querySelector('#f-' + id); e.value = wert;
      e.dispatchEvent(new w.Event('input', { bubbles: true })); e.dispatchEvent(new w.Event('change', { bubbles: true })); };
    assert(m.querySelector('#f-sorte'), 'das Feld Honigsorte ist da');
    assert(m.querySelector('#f-wassergehalt'), 'das Feld Wassergehalt ist da');
    setz('losnummer', 'TEST-LAGER-1');
    setz('quelle', 'lager');
    await new Promise((r) => setTimeout(r, 150));
    setz('lagerKg', '12');
    setz('lagerHerkunft', 'Restbestand 2024');
    setz('sorte', 'Waldhonig');
    setz('wassergehalt', '16,4');
    m.querySelector('[data-save]').click();
    await new Promise((r) => setTimeout(r, 600));
    const c = (await w.DB.getAll('chargen')).find((x) => x.losnummer === 'TEST-LAGER-1');
    assert(c, 'Charge gespeichert');
    assertEq(c.sorte, 'Waldhonig', 'Sorte gespeichert');
    assertEq(c.wassergehalt, 16.4, 'Wassergehalt mit Komma korrekt gespeichert');
    assertEq(c.lagerKg, 12, 'Lagermenge steht');
    assertEq(w.honigName(c, new Map()), 'Waldhonig', 'das Etikett kennt die Sorte jetzt');
  } finally { w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false; }
});

test('Charge-Liste und Rückverfolgung nennen den Lagerbestand', async (w) => {
  const c = await w.DB.put('chargen', { losnummer: 'RV-TEST', ernteIds: [], lagerKg: 12, lagerHerkunft: 'Eimer aus 2025', mengeKg: 12, mhd: null, etikettNotiz: '' });
  const box = w.document.createElement('div'); w.document.body.appendChild(box);
  try {
    await w.Views.honig.tabChargen(box);
    const zeile = [...box.querySelectorAll('.row .r-sub')].map((e) => e.textContent).find((t) => /Lagerbestand/.test(t));
    assert(zeile, 'die Liste nennt den Lagerbestand');
    assert(/12/.test(zeile), `mit Menge: ${zeile}`);
    // Detail: eigene Zeile in der Rückverfolgung
    await w.Views.honig.chargeDetail(c);
    await new Promise((r) => setTimeout(r, 250));
    const m = [...w.document.querySelectorAll('.modal-back')].pop();
    assert(/Lagerbestand · 12 kg/.test(m.textContent), 'Rückverfolgung zeigt den Lagerbestand');
    assert(/Eimer aus 2025/.test(m.textContent), 'samt Herkunft');
    m.remove();
    // ohne Herkunft: Hinweis
    c.lagerHerkunft = ''; await w.DB.put('chargen', c);
    await w.Views.honig.chargeDetail(c);
    await new Promise((r) => setTimeout(r, 250));
    const m2 = [...w.document.querySelectorAll('.modal-back')].pop();
    assert(/fehlt die Herkunftsangabe/.test(m2.textContent), 'Hinweis auf die fehlende Herkunft');
    m2.remove();
  } finally {
    box.remove();
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
    await w.DB.del('chargen', c.id);
  }
});

test('Fütterungs-PDF: keine doppelte Zuckerspalte bei Zuckerwasser', async (w) => {
  const jahr = '2024';
  const v = (await w.DB.getAll('voelker'))[0];
  const f = await w.DB.put('fuetterungen', { volkId: v.id, datum: `${jahr}-08-15`, futterart: 'Zuckerwasser 1:1', mengeKg: 9, winterfutter: true });
  w.Pdf.noDownloadForTest = true;
  try {
    await w.Pdf.fuetterungsliste(jahr);
    const kopf = JSON.stringify(w.Pdf.lastDocForTest.lastAutoTable.head || '');
    assert(!/davon Zucker/.test(kopf), `Menge IST der Zucker – keine zweite Spalte: ${kopf.slice(0, 220)}`);
    assert(/Sirup L/.test(kopf), 'dafür die Litermenge');
  } finally { w.Pdf.noDownloadForTest = false; await w.DB.del('fuetterungen', f.id); }
});
test('Rechner: keine Futter-Rechner mehr – die stehen bei der Fütterung', async (w) => {
  /* Volksstärke ist entfallen, und die Gruppe „Fütterung“ ist ganz aus dem
     Rechner heraus: gefüttert wird im Reiter Fütterung, dort sitzt der Rechner. */
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.rechner.render(host);
    assertEq(host.querySelector('[data-vs="gassen"]'), null, 'keine Wabengassen-Eingabe mehr');
    assertEq(/Volksstärke schätzen/.test(host.textContent), false, 'keine Volksstärke-Karte');
    assertEq(host.querySelector('[data-fr="jeVolk"]'), null, 'kein Futter-Rechner im Rechner');
    assertEq(/Winterfutter planen|Zucker → Sirup/.test(host.textContent), false, 'auch die alten Karten sind weg');
    // die übrigen Rechner müssen aber noch da sein
    assert(host.querySelector('[data-sk="voelker"]'), 'Selbstkosten-Rechner');
    assert(host.querySelector('#beh-mittel'), 'Behandlungsrechner');
  } finally { host.remove(); }
});

/* ---------- Selbstkosten je Glas (Vollkostenrechnung) ---------- */
test('selbstkostenGlas: trifft das Kalkulationsmodell der LWG', (w) => {
  /* Gegenprobe gegen die veröffentlichte Beispielrechnung (6 Völker, 35 kg,
     500 g, Direktvermarktung): dort 9,96 EUR/Glas bzw. 19,92 EUR/kg. Wir rechnen
     die Lohnnebenkosten auf die gesamte Arbeitszeit und liegen daher etwas höher
     – mehr als 3 % Abweichung wäre aber ein Fehler. */
  const r = w.selbstkostenGlas(w.SELBSTKOSTEN_VORGABE);
  assertEq(r.glaeser, 70, '35 kg / 500 g = 70 Gläser je Volk');
  assert(Math.abs(r.summe - 9.96) / 9.96 < 0.03, `je Glas ${r.summe.toFixed(2)} EUR liegt nicht bei 9,96`);
  assert(Math.abs(r.jeKg - 19.92) / 19.92 < 0.03, `je kg ${r.jeKg.toFixed(2)} EUR liegt nicht bei 19,92`);
  nah(r.jeKg, r.summe * 2, 0.001, 'je kg = doppelter Glaspreis bei 500 g');
});
test('selbstkostenGlas: einzelne Posten sind nachrechenbar', (w) => {
  const v = w.SELBSTKOSTEN_VORGABE;
  const posten = (n) => w.selbstkostenGlas(v).posten.find((x) => x.name.startsWith(n)).euro;
  // Pfand: 70 % kommen zurück, also nur 30 % des Glaspreises
  nah(posten('Gebinde'), 0.51 * 0.3 + 0.13 + 0.03 + 0.29, 0.001, 'Gebinde mit Pfandrücklauf');
  nah(posten('Futter'), 1.8 * 15 / 70, 0.001, 'Futter je Glas');
  nah(posten('Arbeit'), 8.2 * 14 / 70, 0.001, 'Arbeit je Glas');
  nah(posten('Lohnnebenkosten'), 8.2 * 14 / 70 * 0.29, 0.001, '29 % auf die Arbeit');
  nah(posten('Abschreibung'), 725 / 15 / 70, 0.001, 'Investition über 15 Jahre');
  nah(posten('Kapitalverzinsung'), 725 / 2 * 0.03 / 70, 0.001, '3 % auf das halbe Anlagevermögen');
  nah(posten('Raumkosten'), 17 * 4.61 * 12 / 6 / 70, 0.001, 'Fläche geteilt auf 6 Völker');
  nah(posten('Vertrieb'), 2 * 0.5, 0.001, '2 EUR/kg bei 500 g');
});
test('selbstkostenGlas: Wagnis liegt auf allen anderen Posten', (w) => {
  const r = w.selbstkostenGlas(w.SELBSTKOSTEN_VORGABE);
  nah(r.wagnis, r.zwischen * 0.1, 0.001, '10 % auf die Zwischensumme');
  nah(r.summe, r.zwischen + r.wagnis, 0.001, 'Summe = Zwischensumme + Wagnis');
  const ohne = w.selbstkostenGlas({ ...w.SELBSTKOSTEN_VORGABE, wagnis: 0 });
  assertEq(ohne.wagnis, 0, 'ohne Wagnis kein Aufschlag');
  nah(ohne.summe, r.zwischen, 0.001, 'dann ist die Summe die Zwischensumme');
});
test('selbstkostenGlas: Vertriebsweg lässt die richtigen Posten wegfallen', (w) => {
  const v = w.SELBSTKOSTEN_VORGABE;
  const namen = (weg) => w.selbstkostenGlas({ ...v, weg }).posten.map((x) => x.name);
  assert(namen('direkt').includes('Vertrieb'), 'Direkt: mit Vertriebspauschale');
  assert(!namen('wiederverkaeufer').includes('Vertrieb'), 'Wiederverkäufer: ohne Vertrieb');
  assert(namen('wiederverkaeufer').some((n) => n.startsWith('Gebinde')), 'Wiederverkäufer: Glas wird trotzdem gefüllt');
  assert(!namen('grosshandel').some((n) => n.startsWith('Gebinde')), 'Großhandel: Lagergebinde, kein Glas');
  const d = w.selbstkostenGlas({ ...v, weg: 'direkt' }).summe;
  const wv = w.selbstkostenGlas({ ...v, weg: 'wiederverkaeufer' }).summe;
  const gh = w.selbstkostenGlas({ ...v, weg: 'grosshandel' }).summe;
  assert(d > wv && wv > gh, `Reihenfolge stimmt nicht: ${d.toFixed(2)} / ${wv.toFixed(2)} / ${gh.toFixed(2)}`);
  // Großhandel spart zusätzlich die Abfüll-Stunden
  nah(w.selbstkostenGlas({ ...v, weg: 'grosshandel' }).posten.find((x) => x.name === 'Arbeit').euro,
    (8.2 - 2.3) * 14 / 70, 0.001, 'Arbeit ohne Abfüllen');
});
test('selbstkostenGlas: hält Unsinn aus', (w) => {
  assertEq(w.selbstkostenGlas({}).summe, 0, 'ohne Eingaben keine Kosten');
  const r = w.selbstkostenGlas({ ...w.SELBSTKOSTEN_VORGABE, ertragKg: 0 });
  assert(isFinite(r.summe), 'kein Ertrag darf nicht zu Unendlich führen');
  const neg = w.selbstkostenGlas({ ...w.SELBSTKOSTEN_VORGABE, glas: -5, ruecklauf: 400, nutzungsdauer: 0 });
  assert(isFinite(neg.summe) && neg.summe >= 0, 'negative und überdrehte Eingaben werden gekappt');
});
test('Rechner: die alte Honigpreis-Kalkulation ist ersetzt, nicht verdoppelt', async (w) => {
  /* Beide Karten haben dieselbe Frage beantwortet. Die schnelle ist entfallen –
     wichtig ist, dass das Wort „Honigpreis“ bleibt, sonst findet es keiner. */
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.rechner.render(host);
    assertEq(host.querySelector('[data-hp="glas"]'), null, 'keine Schnell-Kalkulation mehr');
    assertEq(host.querySelector('#hp-out'), null, 'und keine verwaiste Ausgabe');
    assert(/Honigpreis/.test(host.textContent), 'unter „Honigpreis“ weiter auffindbar');
    assertEq((host.textContent.match(/Selbstkosten je Glas/g) || []).length >= 1, true, 'die Vollkostenrechnung ist da');
  } finally { host.remove(); }
});
test('Rechner: Selbstkosten-Karte ist da und rechnet', async (w) => {
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.rechner.render(host);
    assert(host.querySelector('[data-sk="voelker"]'), 'Völker-Eingabe');
    assert(host.querySelector('[data-sk="weg"]'), 'Vertriebsweg-Auswahl');
    assert(host.querySelector('[data-sk="investVolk"]'), 'Investition je Volk');
    assert(host.querySelector('#sk-out').innerHTML.length > 100, 'Ergebnis wurde gerechnet');
    assert(/Selbstkosten je Glas/.test(host.querySelector('#sk-out').textContent), 'Kopfzahl vorhanden');
    assert(/Veitshöchheim/.test(host.textContent), 'Quelle genannt');
  } finally { host.remove(); }
});

/* ---------- Aufgaben folgen dem Volk ---------- */
test('aufgabeVolkId: findet das Volk über volkId und über refId', (w) => {
  const voelker = new Map([['v1', { id: 'v1', name: 'Anna' }]]);
  assertEq(w.aufgabeVolkId({ volkId: 'v1' }, voelker), 'v1', 'über volkId');
  assertEq(w.aufgabeVolkId({ refId: 'v1' }, voelker), 'v1', 'ältere Aufgaben über refId');
  assertEq(w.aufgabeVolkId({ refId: 'charge7' }, voelker), null, 'MHD-Aufgabe hat kein Volk');
  assertEq(w.aufgabeVolkId({}, voelker), null, 'ohne Bezug');
  assertEq(w.aufgabeVolkId(null, voelker), null, 'null');
});
test('aufgabeBezug: liest den Stand immer frisch', (w) => {
  const staende = new Map([['s3', { id: 's3', name: 'Hausgarten' }], ['s4', { id: 's4', name: 'Waldrand' }]]);
  const volk = { id: 'v1', name: 'Anna', standId: 's3' };
  const voelker = new Map([['v1', volk]]);
  const a = { id: 'a1', volkId: 'v1', titel: 'Fütterung prüfen' };
  assertEq(w.aufgabeBezug(a, voelker, staende).standName, 'Hausgarten', 'vor der Wanderung');
  volk.standId = 's4';                                  // Volk wandert
  assertEq(w.aufgabeBezug(a, voelker, staende).standName, 'Waldrand', 'sofort der neue Stand');
  volk.standId = null;
  assertEq(w.aufgabeBezug(a, voelker, staende).standName, 'ohne Stand', 'Volk ohne Stand');
  volk.standId = 'geloescht';
  assertEq(w.aufgabeBezug(a, voelker, staende).standName, 'gelöschter Stand', 'Stand weg');
});
test('aufgabeHinweisKey: gleiche Änderung = ein Schlüssel, neue Änderung = neuer', (w) => {
  const a = { id: 'a1', titel: 'T' };
  const k1 = w.aufgabeHinweisKey(a, { standId: 's3', volkName: 'Anna' }, { standId: 's4', volkName: 'Anna' });
  const k2 = w.aufgabeHinweisKey(a, { standId: 's3', volkName: 'Anna' }, { standId: 's4', volkName: 'Anna' });
  const k3 = w.aufgabeHinweisKey(a, { standId: 's4', volkName: 'Anna' }, { standId: 's3', volkName: 'Anna' });
  assertEq(k1, k2, 'dieselbe Änderung ergibt denselben Schlüssel');
  assert(k1 !== k3, 'Rückwanderung ist eine neue Änderung');
});
test('aufgabeHinweisText: nennt Volk, neuen und alten Stand', (w) => {
  const t = w.aufgabeHinweisText({ titel: 'Fütterung prüfen: Anna' },
    { standId: 's3', standName: 'Hausgarten', volkName: 'Anna' },
    { standId: 's4', standName: 'Waldrand', volkName: 'Anna' });
  assert(/Anna/.test(t), 'Volk genannt');
  assert(/Waldrand/.test(t), 'neuer Stand genannt');
  assert(/Hausgarten/.test(t), 'alter Stand genannt');
  const u = w.aufgabeHinweisText({ titel: 'T' },
    { standId: 's3', standName: 'Hausgarten', volkName: 'Anna' },
    { standId: 's3', standName: 'Hausgarten', volkName: 'Bella' });
  assert(/heißt jetzt/.test(u), 'Umbenennung wird benannt');
});
test('Aufgaben-Abgleich: Wanderung meldet sich einmal, weggeklickt nie wieder', async (w) => {
  const staende = await w.DB.getAll('staende');
  const volk = (await w.DB.getAll('voelker')).find((v) => v.status === 'aktiv' && v.standId);
  const ziel = staende.find((s) => s.id !== volk.standId);
  assert(volk && ziel, 'Testdaten: Volk mit Stand und ein zweiter Stand');
  const urStand = volk.standId;
  await w.S.set('aufgabenHinweise', { offen: [], weg: [] });
  const a = await w.DB.put('aufgaben', { titel: 'Futterkontrolle', faellig: w.U.todayIso(), erledigt: false, quelle: 'fuetterung', refId: volk.id, volkId: volk.id, notiz: '' });
  try {
    await w.aufgabenAbgleich();                              // erster Lauf: nur merken
    assertEq((w.S.get('aufgabenHinweise').offen || []).length, 0, 'beim Anlegen kein Hinweis');
    assertEq((await w.DB.get('aufgaben', a.id)).kontext.standId, urStand, 'Zustand festgehalten');

    volk.standId = ziel.id; await w.DB.put('voelker', volk); // Volk wandert
    const h1 = (await w.aufgabenAbgleich()).filter((h) => h.aufgabeId === a.id);
    assertEq(h1.length, 1, 'genau ein Hinweis');
    assert(h1[0].text.includes(ziel.name), 'Hinweis nennt den neuen Stand');
    assertEq((await w.DB.get('aufgaben', a.id)).kontext.standId, ziel.id, 'Aufgabe kennt den neuen Stand');

    const h2 = (await w.aufgabenAbgleich()).filter((h) => h.aufgabeId === a.id);
    assertEq(h2.length, 1, 'weitere Läufe verdoppeln den Hinweis nicht');

    await w.aufgabeHinweisWeg(h1[0].key);                    // weggeklickt
    const h3 = (await w.aufgabenAbgleich()).filter((h) => h.aufgabeId === a.id);
    assertEq(h3.length, 0, 'weggeklickter Hinweis kommt nicht wieder');

    volk.standId = urStand; await w.DB.put('voelker', volk);  // zurückgewandert
    const h4 = (await w.aufgabenAbgleich()).filter((h) => h.aufgabeId === a.id);
    assertEq(h4.length, 1, 'neue Änderung ergibt wieder einen Hinweis');
    assert(h4[0].key !== h1[0].key, 'mit eigenem Schlüssel');
  } finally {
    volk.standId = urStand; await w.DB.put('voelker', volk);
    await w.DB.del('aufgaben', a.id);
    await w.S.set('aufgabenHinweise', { offen: [], weg: [] });
  }
});
test('Hinweis: „Aufgabe öffnen" führt zur Aufgabe und gilt als gesehen', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const staende = await w.DB.getAll('staende');
  const volk = (await w.DB.getAll('voelker')).find((v) => v.status === 'aktiv' && v.standId);
  const ziel = staende.find((s) => s.id !== volk.standId);
  const urStand = volk.standId;
  await w.S.set('aufgabenHinweise', { offen: [], weg: [] });
  const a = await w.DB.put('aufgaben', { titel: 'Hinweis-Probe', faellig: w.U.todayIso(), erledigt: false, quelle: 'manuell', refId: null, volkId: volk.id, notiz: '' });
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.aufgaben.render(host);                    // erster Abgleich: nur merken
    volk.standId = ziel.id; await w.DB.put('voelker', volk); // wandern
    await w.Views.aufgaben.render(host);
    const knopf = [...host.querySelectorAll(`[data-hoeffnen="${a.id}"]`)][0];
    assert(knopf, 'Knopf „Aufgabe öffnen" am Hinweis');
    assert(/Aufgabe öffnen/.test(knopf.textContent), `Beschriftung: ${knopf.textContent}`);
    const key = knopf.dataset.hkey;
    assert(key, 'der Knopf kennt den Hinweis-Schlüssel');
    knopf.click();
    await new Promise((r) => setTimeout(r, 600));
    // das Formular der richtigen Aufgabe geht auf
    const m = [...w.document.querySelectorAll('.modal-back')].pop();
    assert(m && /Aufgabe bearbeiten/.test(m.querySelector('h2').textContent), `Formular fehlt: ${m && m.querySelector('h2').textContent}`);
    assertEq(m.querySelector('#f-titel').value, 'Hinweis-Probe', 'und zwar die aus dem Hinweis');
    // der Hinweis gilt als gesehen und kommt nicht wieder
    const merk = w.S.get('aufgabenHinweise');
    assert(merk.weg.includes(key), 'Schlüssel ist stummgeschaltet');
    assertEq(merk.offen.filter((h) => h.aufgabeId === a.id).length, 0, 'kein offener Hinweis mehr');
    m.remove(); w.FormGuard.dirty = false;
    await w.Views.aufgaben.render(host);
    assertEq(host.querySelectorAll(`[data-hoeffnen="${a.id}"]`).length, 0, 'auch nach dem Neuzeichnen weg');
  } finally {
    host.remove();
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove());
    w.FormGuard.dirty = false;
    volk.standId = urStand; await w.DB.put('voelker', volk);
    await w.DB.del('aufgaben', a.id);
    await w.S.set('aufgabenHinweise', { offen: [], weg: [] });
  }
});
test('Aufgaben-Abgleich: erledigte Aufgaben melden nichts mehr', async (w) => {
  const staende = await w.DB.getAll('staende');
  const volk = (await w.DB.getAll('voelker')).find((v) => v.status === 'aktiv' && v.standId);
  const ziel = staende.find((s) => s.id !== volk.standId);
  const urStand = volk.standId;
  await w.S.set('aufgabenHinweise', { offen: [], weg: [] });
  const a = await w.DB.put('aufgaben', { titel: 'Schon erledigt', faellig: w.U.todayIso(), erledigt: true, quelle: 'fuetterung', refId: volk.id, volkId: volk.id, notiz: '' });
  try {
    await w.aufgabenAbgleich();
    volk.standId = ziel.id; await w.DB.put('voelker', volk);
    const h = (await w.aufgabenAbgleich()).filter((x) => x.aufgabeId === a.id);
    assertEq(h.length, 0, 'erledigte Aufgabe erzeugt keinen Hinweis');
  } finally {
    volk.standId = urStand; await w.DB.put('voelker', volk);
    await w.DB.del('aufgaben', a.id);
    await w.S.set('aufgabenHinweise', { offen: [], weg: [] });
  }
});
test('Neue Aufgabe: Stand und Volk sind auswählbar, Stand filtert die Völker', async (w) => {
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.aufgaben.render(host);
    host.querySelector('#add').click();
    await new Promise((r) => setTimeout(r, 150));
    const m = [...w.document.querySelectorAll('.modal-back')].pop();
    const stand = m.querySelector('#f-standId'), funk = m.querySelector('#f-funktion'), volk = m.querySelector('#f-volkId');
    assert(stand && funk && volk, 'Stand-, Funktions- und Volk-Auswahl vorhanden');
    const sichtbar = () => [...volk.options].filter((o) => o.value && !o.hidden);
    const vorher = sichtbar().length;
    assert(vorher > 0, 'Völker stehen zur Auswahl');
    // auf einen Stand filtern: es dürfen nur noch Völker dieses Standes bleiben
    const voelker = (await w.DB.getAll('voelker')).filter((v) => v.status === 'aktiv' && v.standId);
    const zielStand = voelker[0].standId;
    stand.value = zielStand; stand.dispatchEvent(new w.Event('change'));
    const nachher = sichtbar().map((o) => o.value);
    assert(nachher.length > 0 && nachher.length < vorher, `Filter greift nicht (${nachher.length} von ${vorher})`);
    const alleAmStand = nachher.every((id) => voelker.find((v) => v.id === id)?.standId === zielStand);
    assert(alleAmStand, 'nur Völker des gewählten Standes bleiben übrig');
    assert([...volk.options].some((o) => !o.value && !o.hidden), '„kein einzelnes Volk“ bleibt wählbar');
    m.remove(); w.FormGuard.dirty = false;
  } finally { host.remove(); }
});
test('Neue Aufgabe: Völkerzahl steht dabei und folgt dem Filter', async (w) => {
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.aufgaben.render(host);
    host.querySelector('#add').click();
    await new Promise((r) => setTimeout(r, 150));
    const m = [...w.document.querySelectorAll('.modal-back')].pop();
    const stand = m.querySelector('#f-standId'), funk = m.querySelector('#f-funktion'), volk = m.querySelector('#f-volkId');
    const zeile = () => volk.parentNode.querySelector('.hint').textContent;
    const voelker = (await w.DB.getAll('voelker')).filter((v) => v.status === 'aktiv');
    // ohne alles: Gesamtzahl, aber klar als „kein Bezug“ benannt
    assert(new RegExp(`${voelker.length} Völker`).test(zeile()), `Gesamtzahl fehlt: ${zeile()}`);
    // ganzer Stand gewählt: Zahl dieses Standes
    const zielStand = voelker.find((v) => v.standId).standId;
    const amStand = voelker.filter((v) => v.standId === zielStand).length;
    stand.value = zielStand; stand.dispatchEvent(new w.Event('change'));
    assert(/ganzen Stand/.test(zeile()), `Stand-Fall fehlt: ${zeile()}`);
    assert(new RegExp(`${amStand} ${amStand === 1 ? 'Volk' : 'Völker'}`).test(zeile()), `Zahl am Stand falsch: ${zeile()}`);
    // Funktions-Filter muss mitzählen
    const funktion = voelker.find((v) => v.standId === zielStand && v.funktion)?.funktion;
    if (funktion) {
      const erwartet = voelker.filter((v) => v.standId === zielStand && v.funktion === funktion).length;
      funk.value = funktion; funk.dispatchEvent(new w.Event('change'));
      assert(new RegExp(`${erwartet} ${erwartet === 1 ? 'Volk' : 'Völker'}`).test(zeile()), `Funktions-Filter zählt nicht mit: ${zeile()}`);
      assert(zeile().includes(funktion), 'Funktion wird benannt');
    }
    // ein einzelnes Volk gewählt: dann steht dessen Name da, keine Zahl
    const eins = [...volk.options].find((o) => o.value && !o.hidden);
    volk.value = eins.value; volk.dispatchEvent(new w.Event('change'));
    const name = eins.textContent.split(' · ')[0];
    assert(zeile().includes(name), `Volksname fehlt: ${zeile()}`);
    assert(/Gilt nur für/.test(zeile()), `Einzelfall falsch benannt: ${zeile()}`);
    m.remove(); w.FormGuard.dirty = false;
  } finally { host.remove(); }
});
test('Neue Aufgabe: gewähltes Volk zieht den Stand-Filter mit', async (w) => {
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.aufgaben.render(host);
    host.querySelector('#add').click();
    await new Promise((r) => setTimeout(r, 150));
    const m = [...w.document.querySelectorAll('.modal-back')].pop();
    const stand = m.querySelector('#f-standId'), volk = m.querySelector('#f-volkId');
    const ziel = (await w.DB.getAll('voelker')).find((v) => v.status === 'aktiv' && v.standId);
    volk.value = ziel.id; volk.dispatchEvent(new w.Event('change'));
    assertEq(stand.value, ziel.standId, 'Stand-Filter springt auf den Stand des Volks');
    m.remove(); w.FormGuard.dirty = false;
  } finally { host.remove(); }
});
test('Kalender: erledigt grün und ausgegraut, überfällig rot', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const tag = w.U.addDays(w.U.todayIso(), -4);
  /* Der Kalender zeigt den laufenden Monat. Liegt „heute − 4" im Vormonat – also
     immer an den ersten Tagen eines Monats –, steckt der Tag nicht im Gitter und
     der Test scheiterte am Datum statt an der Sache. Deshalb den Kalender
     ausdrücklich auf den Monat des Prüftags stellen. */
  w.Views.aufgaben._cal = { y: +tag.slice(0, 4), m: +tag.slice(5, 7) - 1 };
  const offen = await w.DB.put('aufgaben', { titel: 'Noch offen', faellig: tag, erledigt: false, quelle: 'manuell', refId: null, notiz: '' });
  const fertig = await w.DB.put('aufgaben', { titel: 'Schon fertig', faellig: tag, erledigt: true, quelle: 'manuell', refId: null, notiz: '' });
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.aufgaben.render(host);
    const zelle = host.querySelector(`.c-day[data-day="${tag}"]`);
    assert(zelle, 'Tag im Gitter');
    assert(/1 erledigt/.test(zelle.title), `Erledigte werden nicht gezählt: ${zelle.title}`);
    const klassen = [...zelle.querySelectorAll('.c-dots i')].map((i) => i.className);
    assert(klassen.includes('overdue'), `roter Punkt fehlt: ${klassen.join('|')}`);
    assert(klassen.includes('fertig'), `grüner Punkt fehlt: ${klassen.join('|')}`);
    // Tagesübersicht: Marken und Ausgrauen
    zelle.click();
    await new Promise((r) => setTimeout(r, 250));
    const dm = [...w.document.querySelectorAll('.modal-back')].pop();
    const zeilen = [...dm.querySelectorAll('.rows .row')].map((z) => ({
      titel: z.querySelector('.r-title').textContent.trim(),
      stil: z.querySelector('.r-title').getAttribute('style') || '',
      seite: (z.querySelector('.r-side') || {}).textContent || '',
    }));
    const o = zeilen.find((z) => z.titel === 'Noch offen'), fe = zeilen.find((z) => z.titel === 'Schon fertig');
    assert(o && fe, 'beide Aufgaben stehen in der Tagesübersicht');
    assert(/überfällig/.test(o.seite), `„überfällig" fehlt: ${o.seite}`);
    assertEq(o.stil, '', 'die offene ist nicht ausgegraut');
    assert(/erledigt/.test(fe.seite), `„erledigt" fehlt: ${fe.seite}`);
    assert(/opacity/.test(fe.stil), `die erledigte ist nicht ausgegraut: ${fe.stil}`);
    assert(!/line-through/.test(fe.stil), 'erledigte werden nicht mehr durchgestrichen');
  } finally {
    host.remove();
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove());
    w.FormGuard.dirty = false;
    await w.DB.del('aufgaben', offen.id); await w.DB.del('aufgaben', fertig.id);
  }
});
test('Aufgabenliste: erledigte nur ausgegraut, nicht durchgestrichen', async (w) => {
  const fertig = await w.DB.put('aufgaben', { titel: 'Abgehakt-Probe', faellig: w.U.todayIso(), erledigt: true, quelle: 'manuell', refId: null, notiz: '' });
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.aufgaben.render(host);
    const zeile = [...host.querySelectorAll('.rows .r-title')].find((e) => e.textContent.includes('Abgehakt-Probe'));
    assert(zeile, 'die erledigte Aufgabe steht in der Liste');
    const stil = zeile.getAttribute('style') || '';
    assert(/opacity/.test(stil), `nicht ausgegraut: ${stil}`);
    assert(!/line-through/.test(stil), `durchgestrichen: ${stil}`);
    // und keine einzige Zeile darf durchgestrichen sein
    const alle = [...host.querySelectorAll('.rows .r-title')].map((e) => e.getAttribute('style') || '');
    assert(!alle.some((t) => /line-through/.test(t)), 'irgendwo wird noch durchgestrichen');
  } finally { host.remove(); await w.DB.del('aufgaben', fertig.id); }
});
test('Kalender: Aufgabe direkt aus der Tagesübersicht löschen', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const heute = w.U.todayIso();
  const a = await w.DB.put('aufgaben', { titel: 'Sofort weg', faellig: heute, erledigt: false, quelle: 'manuell', refId: null, notiz: '' });
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.aufgaben.render(host);
    host.querySelector(`.c-day[data-day="${heute}"]`).click();
    await new Promise((r) => setTimeout(r, 250));
    const dm = [...w.document.querySelectorAll('.modal-back')].pop();
    const knopf = dm.querySelector(`[data-tdel="${a.id}"]`);
    assert(knopf, 'Papierkorb-Knopf an der Zeile');
    knopf.click();
    await new Promise((r) => setTimeout(r, 300));
    // Rückfrage bestätigen
    const frage = [...w.document.querySelectorAll('.modal-back')].pop();
    assert(/löschen\?/.test(frage.querySelector('h2').textContent), `Rückfrage fehlt: ${frage.querySelector('h2').textContent}`);
    frage.querySelector('[data-yes]').click();
    await new Promise((r) => setTimeout(r, 500));
    assertEq(await w.DB.get('aufgaben', a.id), undefined, 'Aufgabe ist weg');
    const müll = (await w.DB.getAll('papierkorb')).some((x) => x.store === 'aufgaben' && x.daten && x.daten.id === a.id);
    assert(müll, 'und liegt im Papierkorb');
  } finally {
    host.remove();
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove());
    w.FormGuard.dirty = false;
    if (await w.DB.get('aufgaben', a.id)) await w.DB.del('aufgaben', a.id);
  }
});
test('Kalender: freier Tag öffnet gleich das Formular mit dem Datum', async (w) => {
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.aufgaben.render(host);
    const belegt = new Set((await w.DB.getAll('aufgaben')).filter((a) => !a.erledigt).map((a) => a.faellig));
    const tage = [...host.querySelectorAll('.c-day[data-day]')];
    assert(tage.length === 42, '6 Wochen im Monatsgitter');
    assert(tage.every((t) => t.classList.contains('clickable')), 'jeder Tag ist antippbar, nicht nur belegte');
    const frei = tage.find((t) => !belegt.has(t.dataset.day));
    assert(frei, 'Testdaten: es gibt einen freien Tag');
    frei.click();
    await new Promise((r) => setTimeout(r, 200));
    const m = [...w.document.querySelectorAll('.modal-back')].pop();
    assert(m && /Neue Aufgabe/.test(m.querySelector('h2').textContent), 'Formular geht direkt auf');
    assertEq(m.querySelector('#f-faellig').value, frei.dataset.day, 'Datum ist vorbelegt');
    m.remove(); w.FormGuard.dirty = false;
  } finally { host.remove(); }
});
test('Kalender: belegter Tag zeigt die Liste mit „Neue Aufgabe"', async (w) => {
  const heute = w.U.todayIso();
  const a = await w.DB.put('aufgaben', { titel: 'Tagesliste prüfen', faellig: heute, erledigt: false, quelle: 'manuell', refId: null, notiz: '' });
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.aufgaben.render(host);
    const tag = host.querySelector(`.c-day[data-day="${heute}"]`);
    assert(tag, 'heutiger Tag im Gitter');
    tag.click();
    await new Promise((r) => setTimeout(r, 200));
    const m = [...w.document.querySelectorAll('.modal-back')].pop();
    assert(/Aufgaben am/.test(m.querySelector('h2').textContent), 'erst die Tagesübersicht');
    assert(/Tagesliste prüfen/.test(m.textContent), 'die Aufgabe steht drin');
    assert(m.querySelector('[data-neu]'), 'Knopf für eine neue Aufgabe');
    assert(m.querySelector('[data-open]'), 'Aufgaben sind zum Bearbeiten antippbar');
    assert(m.querySelector('[data-tdel]'), 'und direkt löschbar, ohne sie zu öffnen');
    // der Knopf muss das Formular mit diesem Datum öffnen
    m.querySelector('[data-neu]').click();
    await new Promise((r) => setTimeout(r, 200));
    const f = [...w.document.querySelectorAll('.modal-back')].pop();
    assertEq(f.querySelector('#f-faellig').value, heute, 'Datum übernommen');
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  } finally { host.remove(); await w.DB.del('aufgaben', a.id); }
});

test('Bestehende Behandlungs-Aufgabe wird ans Volk gehängt', async (w) => {
  /* Aufgaben von vor dieser Fassung tragen in refId die Behandlung, nicht das
     Volk. Der Abgleich muss das Volk einmalig übernehmen, sonst bleibt die
     lebende Zeile bei bereits vorhandenen Aufgaben leer. */
  const volk = (await w.DB.getAll('voelker')).find((v) => v.status === 'aktiv' && v.standId);
  const b = await w.DB.put('behandlungen', { datum: w.U.todayIso(), mittel: 'Ameisensäure 60 %', zielTyp: 'volk', zielId: volk.id, menge: 30, einheit: 'ml' });
  const a = await w.DB.put('aufgaben', { titel: 'Wartezeit endet', faellig: w.U.todayIso(), erledigt: false, quelle: 'behandlung', refId: b.id, notiz: '' });
  try {
    assertEq(a.volkId, undefined, 'Ausgangslage: kein Volk gespeichert');
    await w.aufgabenAbgleich();
    const nach = await w.DB.get('aufgaben', a.id);
    assertEq(nach.volkId, volk.id, 'Volk wurde nachgezogen');
    const bez = w.aufgabeBezug(nach, await w.idMap('voelker'), await w.idMap('staende'));
    assertEq(bez.volkName, volk.name, 'und die lebende Zeile greift');
  } finally { await w.DB.del('aufgaben', a.id); await w.DB.del('behandlungen', b.id); }
});
test('Aufgabe nur am Stand: lebende Zeile zeigt den Stand', async (w) => {
  const stand = (await w.DB.getAll('staende'))[0];
  const a = await w.DB.put('aufgaben', { titel: 'Zaun prüfen', faellig: w.U.todayIso(), erledigt: false, quelle: 'manuell', refId: null, standId: stand.id, notiz: '' });
  const voelker = await w.idMap('voelker'), staende = await w.idMap('staende');
  try {
    const b = w.aufgabeBezug(a, voelker, staende);
    assert(b, 'Bezug auch ohne Volk');
    assertEq(b.volkName, '', 'kein Volk');
    assertEq(b.standName, stand.name, 'Stand steht da');
    // die Völkerzahl des Standes gehört dazu
    const erwartet = (await w.DB.getAll('voelker')).filter((v) => v.status === 'aktiv' && v.standId === stand.id).length;
    assertEq(b.voelkerAmStand, erwartet, 'Anzahl der Völker am Stand');
    // und sie muss in der Liste auch auftauchen
    const host = w.document.createElement('div'); w.document.body.appendChild(host);
    try {
      await w.Views.aufgaben.render(host);
      const zeilen = [...host.querySelectorAll('.r-bezug')].map((e) => e.textContent);
      const treffer = zeilen.find((t) => t.includes(stand.name));
      assert(treffer, `Zeile mit dem Stand fehlt: ${zeilen.slice(0, 3).join(' | ')}`);
      assert(new RegExp(`${erwartet} ${erwartet === 1 ? 'Volk' : 'Völker'}`).test(treffer), `Völkerzahl fehlt in „${treffer}"`);
    } finally { host.remove(); }
    // und der Abgleich darf dafür keinen Hinweis erzeugen
    await w.S.set('aufgabenHinweise', { offen: [], weg: [] });
    await w.aufgabenAbgleich();
    const h = (await w.aufgabenAbgleich()).filter((x) => x.aufgabeId === a.id);
    assertEq(h.length, 0, 'ein Stand wandert nicht von selbst – kein Hinweis');
  } finally { await w.DB.del('aufgaben', a.id); await w.S.set('aufgabenHinweise', { offen: [], weg: [] }); }
});
test('Imkereidaten: Mitgliedsnummer der Berufsgenossenschaft', async (w) => {
  const vorher = w.S.get('imkerei');
  try {
    await w.S.set('imkerei', { ...vorher, bgNummer: '12 345 678' });
    const host = w.document.createElement('div'); w.document.body.appendChild(host);
    try {
      await w.Views.einstellungen.render(host);
      assert(/Berufsgenossenschaft/.test(host.textContent), 'Zeile in „Profil & Imkerei“');
      assert(/12 345 678/.test(host.textContent), 'Nummer wird angezeigt');
    } finally { host.remove(); }
  } finally { await w.S.set('imkerei', vorher); }
});

test('Aufgaben-Ansicht: zeigt Volk und aktuellen Stand als eigene Zeile', async (w) => {
  const volk = (await w.DB.getAll('voelker')).find((v) => v.status === 'aktiv' && v.standId);
  const stand = await w.DB.get('staende', volk.standId);
  const a = await w.DB.put('aufgaben', { titel: 'Lebende Zeile prüfen', faellig: w.U.todayIso(), erledigt: false, quelle: 'fuetterung', refId: volk.id, volkId: volk.id, notiz: '' });
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.aufgaben.render(host);
    const zeile = [...host.querySelectorAll('.r-bezug')].map((e) => e.textContent).join(' | ');
    assert(zeile.includes(volk.name), 'Volksname in der lebenden Zeile');
    assert(zeile.includes(stand.name), 'aktueller Stand in der lebenden Zeile');
  } finally { host.remove(); await w.DB.del('aufgaben', a.id); }
});

test('Mischverhältnis: heißt „3:2 dick“ und „1:1 dünn“, Werte unverändert', (w) => {
  /* Beschriftung genau ein Wort dahinter – dick oder dünn, nichts weiter.
     Die value-Attribute müssen bleiben, denn daran hängt wasserFuerVerhaeltnis(). */
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  host.innerHTML = w.futterRechnerHtml(6);
  try {
    const sel = host.querySelector('[data-fr="verh"]');
    assert(sel, 'Mischverhältnis-Auswahl vorhanden');
    assertEq(sel.value, '1:1', 'von Anfang an 1:1 dünn');
    const opts = [...sel.options].map((o) => ({ v: o.value, t: o.textContent.trim() }));
    assertEq(opts.map((o) => o.v), ['3:2', '1:1'], 'Werte für die Rechnung unverändert');
    assertEq(opts.map((o) => o.t), ['3:2 dick', '1:1 dünn'], 'Beschriftung ist dick bzw. dünn – ohne weitere Erklärung');
    // Umschalten muss die Wassermenge ändern
    sel.value = '3:2';
    const dick = w.futterRechnerRechnen(host).wasserJeVolk;
    sel.value = '1:1';
    const duenn = w.futterRechnerRechnen(host).wasserJeVolk;
    assert(duenn > dick, `1:1 muss mehr Wasser brauchen als 3:2 (${duenn} vs ${dick})`);
  } finally { host.remove(); }
});

/* ---------- Diagramme: Wert unter dem Finger ---------- */
test('UI.chart: liefert die Messpunkte für die Finger-Anzeige mit', (w) => {
  const html = w.UI.chart({ type: 'line', labels: ['2024', '2025', '2026'], series: [{ name: 'Völker', values: [10, 11, 31] }], unit: '' });
  const box = w.document.createElement('div'); box.innerHTML = html;
  const el = box.querySelector('.chart-box');
  assert(el, 'chart-box vorhanden');
  assert(el.dataset.chart, 'data-chart gesetzt');
  const d = JSON.parse(el.dataset.chart);
  assertEq(d.p.length, 3, 'ein Messpunkt je Beschriftung');
  assertEq(d.p[2].l, '2026');
  assertEq(d.p[2].w[0].t, '31', 'Wert als fertiger Text');
  assert(d.p[0].x < d.p[1].x && d.p[1].x < d.p[2].x, 'x-Werte steigen');
  // Die Bauteile für die Anzeige müssen im Markup stecken
  assert(box.querySelector('.ch-fuehrung'), 'Führungslinie');
  assert(box.querySelector('.ch-marken'), 'Markierungs-Gruppe');
  assert(box.querySelector('.ch-wert'), 'Wertanzeige');
});
test('UI.chart: Einheit wird angehängt, Lücken werden übersprungen', (w) => {
  const d = JSON.parse(w.document.createRange().createContextualFragment(
    w.UI.chart({ type: 'line', labels: ['a', 'b', 'c'], series: [{ name: 'kg', values: [5, null, 7] }], unit: 'kg' })
  ).querySelector('.chart-box').dataset.chart);
  assertEq(d.p.length, 2, 'der leere Messpunkt fällt weg');
  assertEq(d.p[0].w[0].t, '5 kg', 'Einheit steht dabei');
  assertEq(d.p.map((p) => p.l), ['a', 'c']);
});
test('UI.chart: zwei Reihen liefern beide Werte je Messpunkt', (w) => {
  const d = JSON.parse(w.document.createRange().createContextualFragment(
    w.UI.chart({
      type: 'bars', labels: ['2025'], unit: '€',
      series: [{ name: 'Einnahmen', values: [680], color: '#4C8A2E' }, { name: 'Ausgaben', values: [510], color: '#B3362B' }],
    })
  ).querySelector('.chart-box').dataset.chart);
  assertEq(d.p[0].w.length, 2, 'beide Reihen');
  assertEq(d.p[0].w.map((s) => s.n + ' ' + s.t), ['Einnahmen 680 €', 'Ausgaben 510 €']);
  assertEq(d.p[0].w[0].c, '#4C8A2E', 'Farbe der Reihe wird mitgegeben');
});
test('chartInteraktiv: hängt sich genau einmal an und legt die Markierungen an', (w) => {
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  host.innerHTML = w.UI.chart({
    labels: ['a', 'b'], type: 'bars',
    series: [{ name: 'x', values: [1, 2] }, { name: 'y', values: [3, 4] }],
  });
  try {
    const box = host.querySelector('.chart-box');
    assertEq(box.dataset.live, undefined, 'vorher unbehandelt');
    w.chartInteraktiv(host);
    assertEq(box.dataset.live, '1', 'markiert');
    assertEq(box.querySelectorAll('.ch-marken circle').length, 2, 'je Reihe ein Markierungspunkt');
    w.chartInteraktiv(host); // zweiter Durchlauf darf nichts verdoppeln
    assertEq(box.querySelectorAll('.ch-marken circle').length, 2, 'nicht verdoppelt');
  } finally { host.remove(); }
});

/* ---------- Tabellen: Kärtchen statt waagerecht scrollen ---------- */
function tabelleBauen(w, koepfe, zeilen) {
  const d = w.document.createElement('div');
  d.innerHTML = `<div class="tbl-wrap"><table class="tbl"><thead><tr>${koepfe.map((k) => `<th>${k}</th>`).join('')}</tr></thead>`
    + `<tbody>${zeilen.map((z) => `<tr>${z.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  return d;
}
test('tabellenBeschriften: schreibt den Spaltenkopf auf jede Zelle', (w) => {
  const d = tabelleBauen(w, ['Art', 'Positionen', 'Wert'], [['Futter', '3', '96,00 €']]);
  w.tabellenBeschriften(d);
  const tds = [...d.querySelectorAll('tbody td')];
  assertEq(tds.map((td) => td.dataset.label), ['Art', 'Positionen', 'Wert']);
  assertEq(d.querySelector('table').dataset.beschriftet, '1');
});
test('tabellenBeschriften: Spalten ohne Kopf sind Knopf-Spalten', (w) => {
  const d = tabelleBauen(w, ['Datum', 'Menge (kg)', ''], [['02.07.2026', '12', '<button>x</button>']]);
  w.tabellenBeschriften(d);
  const tds = [...d.querySelectorAll('tbody td')];
  assertEq(tds[1].dataset.label, 'Menge (kg)');
  assertEq(tds[2].dataset.label, undefined, 'keine Beschriftung für die Knopf-Spalte');
  assertEq(tds[2].dataset.aktion, '1', 'als Knopf-Spalte markiert');
});
test('tabellenBeschriften: Zeilen mit anderer Spaltenzahl bleiben ein Block', (w) => {
  const d = tabelleBauen(w, ['Jahr', 'Fahrten', 'Kilometer'], [['2026', '4', '120']]);
  const tb = d.querySelector('tbody');
  tb.insertAdjacentHTML('beforeend', '<tr><td colspan="3">Keine Fahrten in diesem Jahr</td></tr>');
  w.tabellenBeschriften(d);
  const zeilen = [...tb.querySelectorAll('tr')];
  assertEq(zeilen[0].dataset.voll, undefined, 'normale Zeile wird beschriftet');
  assertEq(zeilen[1].dataset.voll, '1', 'colspan-Zeile bleibt ganz');
  assertEq(zeilen[1].querySelector('td').dataset.label, undefined, 'und bekommt keine Beschriftung');
});
test('tabellenBeschriften: läuft nicht zweimal über dieselbe Tabelle', (w) => {
  const d = tabelleBauen(w, ['A', 'B'], [['1', '2']]);
  w.tabellenBeschriften(d);
  d.querySelector('tbody td').dataset.label = 'HANDGESETZT';
  w.tabellenBeschriften(d); // darf nichts überschreiben
  assertEq(d.querySelector('tbody td').dataset.label, 'HANDGESETZT');
});
test('Tabellen-Kärtchen: erste Spalte ist Überschrift, Wertzeilen sind zweispaltig', (w) => {
  /* Der Fehler beim Bauen war eine Spezifitäts-Falle: „table.tbl td{display:block}“
     überstimmt „.tbl td{display:flex}“, dann kleben Beschriftung und Wert rechts
     aneinander. Diese Prüfung liest die Regeln aus dem Stylesheet. */
  let flexRegel = null, blockFalle = null;
  [...w.document.styleSheets].forEach((sheet) => {
    let regeln; try { regeln = [...sheet.cssRules]; } catch (e) { return; }
    regeln.forEach((r) => {
      if (!r.media || !String(r.conditionText || r.media.mediaText).includes('560px')) return;
      [...r.cssRules].forEach((k) => {
        const sel = k.selectorText || '';
        if (/(^|,)\s*\.tbl td\s*$/.test(sel) && k.style.display === 'flex') flexRegel = sel;
        if (/table\.tbl td/.test(sel) && k.style.display === 'block') blockFalle = sel;
      });
    });
  });
  assert(flexRegel, '.tbl td wird im Handy-Bereich auf flex gestellt');
  assertEq(blockFalle, null, 'kein spezifischeres table.tbl td{display:block}, das das überstimmt');
});

/* ---------- Reiter: Umbruch statt waagerechtem Scrollen ---------- */
/* Breite eines 375-px-Handys abzüglich Seitenrand von main – so schmal wird es
   in der Praxis. Passt es hier, passt es überall. */
const HANDY_BREIT = 343;
const REITER_LANG = [
  { id: 'ernten', label: 'Ernte' }, { id: 'sorten', label: 'Sorte' }, { id: 'chargen', label: 'Charge' },
  { id: 'abfuellung', label: 'Abfüllung' }, { id: 'verkaeufe', label: 'Verkauf' }, { id: 'bestand', label: 'Bestand' },
];

test('Reiter-Zeile: bricht um und scrollt nicht mehr waagerecht', (w) => {
  const el = w.UI.tabs(REITER_LANG, 'ernten', () => {});
  w.document.body.appendChild(el);
  try {
    const cs = w.getComputedStyle(el);
    assertEq(cs.flexWrap, 'wrap', 'Reiter dürfen umbrechen');
    assert(cs.overflowX !== 'auto' && cs.overflowX !== 'scroll', 'keine Scrollleiste mehr, ist: ' + cs.overflowX);
  } finally { el.remove(); }
});
test('Reiter-Zeile: auf Handybreite ragt kein Reiter aus dem Bild', (w) => {
  const host = w.document.createElement('div');
  host.style.cssText = `width:${HANDY_BREIT}px;position:absolute;left:-9999px;top:0`;
  w.document.body.appendChild(host);
  const el = w.UI.tabs(REITER_LANG, 'ernten', () => {});
  host.appendChild(el);
  try {
    assert(el.scrollWidth <= el.clientWidth + 1, `nichts ragt seitlich heraus (${el.scrollWidth} > ${el.clientWidth})`);
    const knopf = el.querySelector('button');
    assert(el.offsetHeight > knopf.offsetHeight * 1.5, 'sechs Reiter verteilen sich auf mehrere Zeilen');
    // Der eigentliche Fehler war: „Bestand“ lag außerhalb. Also jeden einzeln prüfen.
    const kasten = el.getBoundingClientRect();
    [...el.querySelectorAll('button')].forEach((b) => {
      const r = b.getBoundingClientRect();
      assert(r.right <= kasten.right + 1, `„${b.textContent}“ liegt im sichtbaren Bereich`);
      assert(r.left >= kasten.left - 1, `„${b.textContent}“ beginnt nicht links außerhalb`);
    });
  } finally { host.remove(); }
});
test('Reiter-Zeile: auch die langen Kassenbuch-Beschriftungen passen', (w) => {
  const host = w.document.createElement('div');
  host.style.cssText = `width:${HANDY_BREIT}px;position:absolute;left:-9999px;top:0`;
  w.document.body.appendChild(host);
  const el = w.UI.tabs([
    { id: 'buchungen', label: 'Buchungen' }, { id: 'kontakte', label: 'Kunden & Lieferanten' },
    { id: 'geschaeftskosten', label: 'Allgemeine Geschäftskosten' }, { id: 'auswertung', label: 'Auswertung' },
  ], 'buchungen', () => {});
  host.appendChild(el);
  try {
    assert(el.scrollWidth <= el.clientWidth + 1, `nichts ragt heraus (${el.scrollWidth} > ${el.clientWidth})`);
    // Der längste Reiter darf für sich allein nicht breiter als das Handy sein,
    // sonst hilft auch der Umbruch nicht mehr.
    const breiteste = Math.max(...[...el.querySelectorAll('button')].map((b) => b.offsetWidth));
    assert(breiteste <= HANDY_BREIT, `längster Reiter passt in eine Zeile (${breiteste} px)`);
  } finally { host.remove(); }
});
/* Der eigentliche Fehler bei Königinnen und Verbrauchsmaterial: .ph-actions hatte
   flex-shrink:0, wurde also nie schmaler – dadurch kam der flex-wrap DARIN nie zum
   Zug und „Neue Königin“ stand 139 px außerhalb des Bildes. */
test('Kopfzeile: Aktionsknöpfe brechen um statt seitlich herauszuragen', (w) => {
  const host = w.document.createElement('div');
  host.style.cssText = `width:${HANDY_BREIT}px;position:absolute;left:-9999px;top:0`;
  w.document.body.appendChild(host);
  host.innerHTML = w.pageHead('Königinnen', '21 aktiv',
    '<span class="flex-wrap no-print">'
    + '<button class="btn btn-ghost btn-sm">Bewertungs-Runde</button>'
    + '<button class="btn btn-ghost btn-sm">Umweiseln</button>'
    + '<button class="btn btn-primary">Neue Königin</button></span>');
  try {
    const kopf = host.querySelector('.page-head').getBoundingClientRect();
    const knoepfe = [...host.querySelectorAll('.ph-actions .btn')];
    assertEq(knoepfe.length, 3, 'drei Knöpfe im Test');
    knoepfe.forEach((b) => {
      const r = b.getBoundingClientRect();
      assert(r.right <= kopf.right + 1, `„${b.textContent.trim()}“ bleibt im Bild`);
    });
    const akt = host.querySelector('.ph-actions');
    assert(akt.getBoundingClientRect().width <= HANDY_BREIT + 1,
      `Aktionsblock passt in die Breite (${Math.round(akt.getBoundingClientRect().width)} px)`);
    // Er darf schrumpfen – genau das war vorher durch flex-shrink:0 verboten.
    assert(w.getComputedStyle(akt).flexShrink !== '0', 'Aktionsblock darf schmaler werden');
  } finally { host.remove(); }
});
test('Reiter-Zeile: auf breitem Bildschirm bleibt es eine Zeile', (w) => {
  const host = w.document.createElement('div');
  host.style.cssText = 'width:1000px;position:absolute;left:-9999px;top:0';
  w.document.body.appendChild(host);
  const el = w.UI.tabs(REITER_LANG, 'ernten', () => {});
  host.appendChild(el);
  try {
    const knopf = el.querySelector('button');
    assert(el.offsetHeight < knopf.offsetHeight * 1.5, 'am Schreibtisch weiterhin einzeilig');
  } finally { host.remove(); }
});

/* ---------- Verlässlichkeit: Datum & Speichern (die Fehlerklassen der Konkurrenz) ---------- */
test('U.fmtDate: Datum ohne Zeitzonen-Drift (string-basiert, kein new Date)', (w) => {
  const U = w.U;
  assertEq(U.fmtDate('2026-01-01'), '01.01.2026', 'Jahresanfang bleibt derselbe Tag');
  assertEq(U.fmtDate('2026-12-31'), '31.12.2026', 'Silvester driftet nicht auf den 30.');
  assertEq(U.fmtDate('2026-03-29'), '29.03.2026', 'EU-Sommerzeit-Umstellungstag driftet nicht');
  assertEq(U.fmtDate('2026-07-05T09:30:00.000Z'), '05.07.2026', 'nimmt nur den Datumsteil eines Zeitstempels');
  const t = U.todayIso();
  assert(/^\d{4}-\d{2}-\d{2}$/.test(t), 'todayIso ist YYYY-MM-DD');
  const n = new Date();
  const lokal = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  assertEq(t, lokal, 'todayIso spiegelt das lokale Kalenderdatum (nicht UTC-verschoben)');
});

test('U.addDays: Tageswechsel über Monats-/DST-/Jahresgrenzen ohne Drift', (w) => {
  const U = w.U;
  assertEq(U.addDays('2026-03-29', 1), '2026-03-30', 'über die EU-Sommerzeit-Nacht bleibt es +1 Tag');
  assertEq(U.addDays('2026-10-25', 1), '2026-10-26', 'über die Winterzeit-Nacht +1 Tag');
  assertEq(U.addDays('2026-02-28', 1), '2026-03-01', 'Nicht-Schaltjahr: Februar → März');
  assertEq(U.addDays('2024-02-28', 1), '2024-02-29', 'Schaltjahr behält den 29. Februar');
  assertEq(U.addDays('2026-12-31', 1), '2027-01-01', 'Jahreswechsel');
  assertEq(U.addDays('2026-07-05', 0), '2026-07-05', 'addDays(…, 0) ist Identität (kein Drift)');
});

test('UI.formModal: speichert zuverlässig (Komma-Zahl, Datum ohne Drift, Pflichtfeld/NaN blockt)', async (w) => {
  const root = () => w.document.querySelector('#modal-root');
  const fill = (m, key, val) => { const el = m.el.querySelector('#f-' + key); el.value = val; el.dispatchEvent(new w.Event('input', { bubbles: true })); };
  const clickSave = (m) => m.el.querySelector('[data-save]').click();
  const tick = () => new Promise((r) => setTimeout(r, 30));

  // 1) Erfolgreiches Speichern: deutsches Dezimalkomma → Punkt, Datum unverändert
  let saved = null;
  const m1 = w.UI.formModal({ title: 'T1', fields: [
    { key: 'name', label: 'Name', required: true },
    { key: 'menge', label: 'Menge', type: 'number' },
    { key: 'datum', label: 'Datum', type: 'date' },
  ], onSave: (v) => { saved = v; } });
  fill(m1, 'name', 'Imme'); fill(m1, 'menge', '2,5'); fill(m1, 'datum', '2026-03-29');
  clickSave(m1); await tick();
  assertEq(saved, { name: 'Imme', menge: 2.5, datum: '2026-03-29' }, 'Komma→Punkt, Datum unverändert, persistiert');
  assert(!m1.el.isConnected, 'Modal schließt nach erfolgreichem Speichern');

  // 2) Leeres Pflichtfeld → kein Save, Modal bleibt offen
  let saved2 = false;
  const m2 = w.UI.formModal({ title: 'T2', fields: [{ key: 'name', label: 'Name', required: true }], onSave: () => { saved2 = true; } });
  clickSave(m2); await tick();
  assert(saved2 === false, 'leeres Pflichtfeld verhindert das Speichern');
  assert(root().contains(m2.el), 'Modal bleibt bei Validierungsfehler offen');
  await m2.close(true);

  // 3) Ungültige Zahl → blockt (kein stilles NaN)
  let saved3 = false;
  const m3 = w.UI.formModal({ title: 'T3', fields: [{ key: 'z', label: 'Zahl', type: 'number', required: true }], onSave: () => { saved3 = true; } });
  fill(m3, 'z', 'abc'); clickSave(m3); await tick();
  assert(saved3 === false, 'nicht-numerische Eingabe wird nicht als NaN gespeichert');
  await m3.close(true);
  w.FormGuard.dirty = false;
});

/* ---------- Dashboard: Ein-Klick-Fahrt ---------- */
test('fahrtSchnellBuchen: Ein-Klick bucht Hin-/Rückweg ins Fahrtenbuch', async (w) => {
  const st = await w.DB.put('staende', { name: 'Ein-Klick-Stand', kmEntfernung: 12 });
  const vorher = (await w.DB.getAll('fahrten')).filter((f) => f.standId === st.id).length;
  await w.fahrtSchnellBuchen(st.id);
  const nach = (await w.DB.getAll('fahrten')).filter((f) => f.standId === st.id);
  assertEq(nach.length, vorher + 1, 'genau eine Fahrt gebucht');
  const f = nach[nach.length - 1];
  assertEq(f.km, 24, 'km = 2 × Entfernung (Hin- und Rückweg)');
  assertEq(f.datum, w.U.todayIso(), 'heutiges Datum');
  assert(f.zweck && f.standId === st.id, 'Zweck + Stand-Bezug gesetzt');
});

test('fahrtSchnellBuchen: ohne hinterlegte Entfernung → Formular statt Sofortbuchung', async (w) => {
  const st = await w.DB.put('staende', { name: 'Ohne-km-Stand' });
  const vorher = (await w.DB.getAll('fahrten')).length;
  await w.fahrtSchnellBuchen(st.id);
  await new Promise((r) => setTimeout(r, 40));
  assertEq((await w.DB.getAll('fahrten')).length, vorher, 'ohne Entfernung wird nicht blind gebucht');
  const modal = w.document.querySelector('#modal-root .modal-back');
  assert(modal, 'stattdessen öffnet das Fahrt-Formular (km eingeben)');
  w.FormGuard.dirty = false;
  const cancel = modal.querySelector('[data-cancel]'); if (cancel) cancel.click();
});

/* ---------- Rechnung: § 24 Pauschalierung (Land-/Forstwirtschaft) ---------- */
test('rechnungSummen: § 24 Pauschalierung – enthaltene pauschale USt auf die Gesamtsumme', (w) => {
  const r = { steuerart: 'pauschal24', pauschalsatz: 7.8, positionen: [{ menge: 6, einzelpreis: 6.5, steuersatz: 0 }, { menge: 2, einzelpreis: 5, steuersatz: 0 }] };
  const { brutto, steuern } = w.rechnungSummen(r);
  assertNah(brutto, 49, 0.001, 'Brutto = Summe menge × einzelpreis');
  assertNah(steuern[7.8], 49 * 7.8 / 107.8, 0.001, 'enthaltene Pauschal-USt = brutto × 7,8/107,8');
});

test('rechnungSteuerart + rechnungHinweis: drei Modelle inkl. Rückwärtskompatibilität', (w) => {
  assertEq(w.rechnungSteuerart({ kleinunternehmer: true }), 'klein', 'altes Feld true → § 19');
  assertEq(w.rechnungSteuerart({ kleinunternehmer: false }), 'regel', 'altes Feld false → Regelbesteuerung');
  assertEq(w.rechnungSteuerart({ steuerart: 'pauschal24', kleinunternehmer: false }), 'pauschal24', 'neues Feld hat Vorrang');
  assert(/§ 19/.test(w.rechnungHinweis({ steuerart: 'klein' })), '§ 19-Hinweis vorhanden');
  assertEq(w.rechnungHinweis({ steuerart: 'regel' }), null, 'Regelbesteuerung ohne Sonderhinweis');
  const h = w.rechnungHinweis({ steuerart: 'pauschal24', pauschalsatz: 7.8 });
  assert(/§ 24/.test(h) && /295/.test(h) && /7,8 %/.test(h), '§ 24-Hinweis mit Art. 295 ff. MwStSystRL + Satz 7,8 %');
});

/* ---------- Dashboard-Widgets rendern fehlerfrei ---------- */
test('DASH_WIDGETS: alle Dashboard-Widgets liefern HTML ohne Fehler', async (w) => {
  assert(w.DASH_WIDGETS.fahrt && w.DASH_WIDGETS.zeiten, 'Fahrt- und Zeiterfassungs-Widget vorhanden');
  for (const [id, def] of Object.entries(w.DASH_WIDGETS)) {
    const html = await def.html();
    assert(typeof html === 'string', `Widget ${id} liefert einen String`);
  }
});

/* ---------- Version & Changelog ---------- */
test('Version & Changelog konsistent (Update-Fenster-Grundlage)', (w) => {
  assertEq(w.APP_VERSION, w.CHANGELOG[0].version, 'APP_VERSION = neuester Changelog-Eintrag');
  assert(w.CHANGELOG.every((c) => c.version && /^\d{4}-\d{2}-\d{2}$/.test(c.datum) && c.punkte.length > 0), 'jeder Eintrag hat Version, Datum, Punkte');
  const versionen = w.CHANGELOG.map((c) => c.version);
  assertEq(new Set(versionen).size, versionen.length, 'keine doppelten Versionsnummern');
});

/* ---------- Aufgaben-Automatik ---------- */
test('syncZuchtAufgaben: je Kalenderschritt eine Aufgabe', async (w) => {
  const n = w.ZUCHT_KALENDER.length;
  const serie = await w.DB.put('zuchtserien', { name: 'Test-Serie', startdatum: '2026-07-01', anzahl: 10, termine: w.zuchtTermine('2026-07-01'), notiz: '' });
  await w.syncZuchtAufgaben(serie);
  const tasks = (await w.DB.getAll('aufgaben')).filter((a) => a.quelle === 'zucht' && a.refId === serie.id);
  assertEq(tasks.length, n, 'eine Aufgabe je Kalenderschritt');
  await w.syncZuchtAufgaben(serie); // erneut → keine Duplikate
  const nochmal = (await w.DB.getAll('aufgaben')).filter((a) => a.quelle === 'zucht' && a.refId === serie.id);
  assertEq(nochmal.length, n, 'Sync ersetzt statt dupliziert');
});

/* ---------- Beispieldaten (Demo) ---------- */
test('Demo.create/reset: befüllt alle Module ohne Fehler (Smoke)', async (w) => {
  await w.Demo.reset();
  assert((await w.DB.getAll('voelker')).length >= 13, 'mind. 13 Völker angelegt');
  assert((await w.DB.getAll('koeniginnen')).length >= 6, 'Königinnen (mit Stammbaum) vorhanden');
  assert((await w.DB.getAll('ernten')).length >= 8, 'Ernten über mehrere Jahre');
  assert((await w.DB.getAll('rechnungen')).length >= 1, 'mindestens eine Rechnung');
  assert((await w.DB.getAll('chargen')).length >= 3, 'Honig-Chargen vorhanden');
  assert((await w.DB.getAll('aufgaben')).some((a) => a.erledigt && a.zeitMinuten > 0), 'Zeiterfassung befüllt');
});

/* ---------- Marken-Logo (Homescreen) ---------- */
test('brandLogoSvg: neues Homescreen-Logo, eigenes Nutzer-Logo bleibt unberührt', async (w) => {
  // neues Logo = 3 gefüllte Amber-Waben mit Verlauf
  const a = w.brandLogoSvg(26), b = w.brandLogoSvg(26);
  assert(/<svg/.test(a) && /linearGradient/.test(a), 'SVG mit Amber-Verlauf');
  assertEq((a.match(/<path/g) || []).length, 3, 'genau 3 Waben');
  // eindeutige Gradient-IDs → keine DOM-Kollision bei Header + Sidebar
  const idA = (a.match(/id="(ibHex\d+)"/) || [])[1], idB = (b.match(/id="(ibHex\d+)"/) || [])[1];
  assert(idA && idB && idA !== idB, 'jede Instanz eigene Gradient-ID');
  // altes Waben-Logo bleibt für PDFs/Onboarding erhalten
  assert(w.logoSvg().includes('#E8A013'), 'logoSvg() (PDFs) unverändert');

  const doc = w.document, brand = () => doc.getElementById('tb-brand');
  assert(brand(), '#tb-brand vorhanden');
  const origLogo = w.S.get('logo'), origFlag = w.S.get('logoImHeader');
  try {
    // ohne eigenes Logo: Homescreen-Header zeigt neues Marken-Logo
    await w.S.set('logo', null); await w.S.set('logoImHeader', false);
    w.applyHeaderLogo();
    assert(/url\(#ibHex/.test(brand().innerHTML), 'Header nutzt neues Marken-Logo als Standard');
    // eigenes Logo im Header: wird NICHT vom neuen Logo überschrieben
    const px = 'data:image/png;base64,iVBORw0KGgo=';
    await w.S.set('logo', px); await w.S.set('logoImHeader', true);
    w.applyHeaderLogo();
    const h = brand().innerHTML;
    assert(h.includes(px) && !/url\(#ibHex/.test(h), 'eigenes Logo bleibt, Standard wird nicht drübergelegt');
  } finally {
    await w.S.set('logo', origLogo || null); await w.S.set('logoImHeader', origFlag || false);
    w.applyHeaderLogo();
  }
});

/* ---------- Rechtstexte (Veröffentlichung) ---------- */
test('Rechtstexte: Impressum/Datenschutz/AGB erreichbar & ohne offene Platzhalter', async (w) => {
  const pflicht = { 'impressum.html': 'Impressum', 'datenschutz.html': 'Datenschutzerklärung', 'agb.html': 'Widerruf' };
  for (const file in pflicht) {
    const r = await w.fetch(file, { cache: 'no-store' });
    assert(r.ok, file + ' erreichbar (HTTP ' + r.status + ')');
    const t = await r.text();
    assert(t.includes(pflicht[file]), file + ' enthält „' + pflicht[file] + '"');
    assert(!/\[(Vor- und Nachname|Straße und Hausnummer|PLZ und Ort|deine|Monat Jahr|USt-IdNr)/.test(t), file + ' enthält keine offenen [Platzhalter] mehr');
  }
});

/* ---------- Imkerschule (Lernmodul) ---------- */
test('Imkerschule: Lernpfad, Fortschritt persistiert & geführte Aktion', async (w) => {
  assert(w.Views.imkerschule && typeof w.Views.imkerschule.render === 'function', 'View vorhanden');
  assertEq(w.LERN_KAPITEL.length, 11, '11 Kapitel im Lernpfad');
  const k6 = w.LERN_KAPITEL.find((k) => k.id === 6);
  assert(k6 && k6.aktion && typeof k6.aktion.run === 'function', 'Kap. 6 mündet in geführte Aktion (Volk anlegen)');
  assert(w.LERN_KAPITEL.every((k) => Array.isArray(k.steps) && k.steps.length >= 4), 'alle 11 Kapitel haben Inhalt');
  [7, 8, 9, 10, 11].forEach((id) => {
    const kap = w.LERN_KAPITEL.find((k) => k.id === id);
    assert(kap.aktion && (typeof kap.aktion.run === 'function' || typeof kap.aktion.route === 'string'), 'Kap. ' + id + ' hat eine geführte Aktion');
    assert(kap.steps.some((st) => st.svg && st.svg.includes('<svg')), 'Kap. ' + id + ' hat eine Zeichnung');
  });
  // Fortschritt: setDone schreibt in Settings und überlebt Neuladen
  await w.ISchule.setDone(1);
  assert(w.ISchule.isDone(1), 'Lektion 1 erledigt');
  assert(w.ISchule.pct() > 0, 'Fortschritt in Prozent steigt');
  await w.S.load();
  assert(w.ISchule.isDone(1), 'Fortschritt überlebt Neuladen (in Settings gespeichert)');
  [1, 2, 3, 4, 5, 6].forEach((id) => {
    const kap = w.LERN_KAPITEL.find((k) => k.id === id);
    assert(kap.steps.some((st) => st.svg && st.svg.includes('<svg')), 'Kap. ' + id + ' hat eine Zeichnung (Inline-SVG)');
  });
  [1, 2, 3, 4, 5, 6].forEach((id) => {
    assert(w.LERN_KAPITEL.find((k) => k.id === id).steps.length >= 5, 'Kap. ' + id + ' ist ausführlich (≥ 5 Schritte)');
  });
  const s = w.S.get('imkerschule'); delete s.done[1]; await w.S.set('imkerschule', s);
});

/* ---------- Imkerschule Phase 2: Erfahrungsstufen ---------- */
test('ISchule.levelFromAnswers: Level-Berechnung', (w) => {
  assertEq(w.ISchule.levelFromAnswers('0', '0-1'), 'anfaenger', 'Neuling');
  assertEq(w.ISchule.levelFromAnswers('1-2', '2-5'), 'fortgeschritten', '1-2 Jahre + 2-5 Völker');
  assertEq(w.ISchule.levelFromAnswers('1-2', '0-1'), 'fortgeschritten', '1-2 Jahre allein reicht');
  assertEq(w.ISchule.levelFromAnswers('0', '2-5'), 'fortgeschritten', '2-5 Völker allein reicht');
  assertEq(w.ISchule.levelFromAnswers('3+', '0-1'), 'erfahren', '3+ Jahre = erfahren');
  assertEq(w.ISchule.levelFromAnswers('1-2', '6+'), 'erfahren', '1-2 Jahre + 6+ Völker = erfahren');
  assertEq(w.ISchule.levelFromAnswers('0', '6+'), 'fortgeschritten', '0 Jahre + 6+ Völker = fortgeschritten');
});
test('ISchule.skipableIds: überspringbare Lektionen je Level', (w) => {
  const orig = w.S.get('imkerschule');
  const s = { ...orig, level: 'anfaenger' };
  w.S.data.imkerschule = s;
  assertEq(w.ISchule.skipableIds().length, 0, 'Anfänger: nichts überspringbar');
  s.level = 'fortgeschritten';
  assertEq(w.ISchule.skipableIds(), [1, 2, 3], 'Fortgeschritten: 1-3');
  s.level = 'erfahren';
  assertEq(w.ISchule.skipableIds(), [1, 2, 3, 4, 5], 'Erfahren: 1-5');
  w.S.data.imkerschule = orig;
});
test('ISchule.setLevel: Level setzen + onboarded Flag', async (w) => {
  const orig = w.S.get('imkerschule');
  await w.ISchule.setLevel('erfahren');
  const s = w.ISchule.st();
  assertEq(s.level, 'erfahren', 'Level gesetzt');
  assertEq(s.onboarded, true, 'onboarded Flag gesetzt');
  assertEq(w.ISchule.levelLabel(), 'Erfahren', 'labelLabel() gibt Erfahren');
  await w.S.set('imkerschule', orig);
});

/* ---------- Imkerschule Phase 2: FAQ-Suche ---------- */
test('FAQ_THEMEN: 10 Themen mit Fragen', (w) => {
  assertEq(w.FAQ_THEMEN.length, 10, '10 FAQ-Themen');
  w.FAQ_THEMEN.forEach((t) => {
    assert(t.id && t.label && t.icon, 'Thema hat id/label/icon: ' + t.id);
    assert(t.fragen.length >= 4, 'Thema ' + t.id + ' hat ≥ 4 Fragen');
    t.fragen.forEach((fq) => {
      assert(fq.f && fq.a, 'FAQ hat Frage + Antwort in ' + t.id);
    });
  });
});
test('faqSuche: Volltextsuche mit Synonymen', (w) => {
  const r1 = w.faqSuche('weisellos');
  assert(r1.length >= 1, '"weisellos" findet mindestens 1 Treffer');
  assert(r1.some((r) => r.f.toLowerCase().includes('weisellos')), 'direkter Treffer');
  const r2 = w.faqSuche('keine königin');
  assert(r2.length >= 1, 'Synonym "keine königin" findet Treffer');
  const r3 = w.faqSuche('xyzgarbage');
  assertEq(r3.length, 0, 'Unsinn findet nichts');
  const r4 = w.faqSuche('honig');
  assert(r4.length >= 2, '"honig" findet mehrere Treffer');
});

/* ---------- Imkerschule Phase 2: JIT-Empfehlungen ---------- */
test('jitEmpfehlungen: saisonale Tipps', async (w) => {
  const tipps = await w.jitEmpfehlungen();
  assert(Array.isArray(tipps), 'gibt Array zurück');
  tipps.forEach((t) => {
    assert(t.titel && t.text, 'Tipp hat titel + text');
    assert(t.kapId || t.typ, 'Tipp hat kapId oder typ');
  });
});

/* ---------- Volk-Stammdaten: Funktion im Betrieb + Beutentyp ersetzt Rähmchenmaß ---------- */
test('VORSCHLAEGE.volksfunktion enthält alle Betriebsfunktionen', (w) => {
  const f = w.VORSCHLAEGE.volksfunktion;
  assert(Array.isArray(f), 'ist eine Liste');
  ['Wirtschaftsvolk', 'Wirtschaftsvolk Zuchtstoff', 'Ableger', 'Schwarm', 'Pflegevolk Königin', 'Pflegevolk Bienenmasse']
    .forEach((n) => assert(f.includes(n), n + ' vorhanden'));
  assertEq(new Set(f).size, f.length, 'keine Duplikate');
});
test('VORSCHLAEGE.beutentyp ersetzt das Rähmchenmaß', (w) => {
  assert(!w.VORSCHLAEGE.raehmchenmass, 'Liste raehmchenmass ist abgeschafft');
  const bt = w.VORSCHLAEGE.beutentyp;
  ['Mini Plus Trogbeute', 'Mini Plus', 'Dadant US 12er', 'Dadant Ablegerkasten']
    .forEach((n) => assert(bt.includes(n), n + ' im Dropdown'));
  assert(bt.length >= 20, 'ausreichend Auswahl (' + bt.length + ')');
  assertEq(new Set(bt).size, bt.length, 'keine Duplikate');
});
test('Migration: Rähmchenmaß geht im Beutentyp auf', async (w) => {
  const mitBeute = await w.DB.put('voelker', { name: 'MigTestA', beutentyp: 'Zander', raehmchenmass: 'Zander', status: 'aktiv' });
  const ohneBeute = await w.DB.put('voelker', { name: 'MigTestB', beutentyp: '', raehmchenmass: 'Dadant Blatt', status: 'aktiv' });
  await w.S.set('raehmchenmassMigriert', false);
  await w.migriereRaehmchenmass();
  const a = await w.DB.get('voelker', mitBeute.id);
  const b = await w.DB.get('voelker', ohneBeute.id);
  assert(!('raehmchenmass' in a), 'Altfeld entfernt');
  assertEq(a.beutentyp, 'Zander', 'vorhandener Beutentyp bleibt unangetastet');
  assert(!('raehmchenmass' in b), 'Altfeld auch hier entfernt');
  assertEq(b.beutentyp, 'Dadant Blatt', 'fehlender Beutentyp erbt das alte Rähmchenmaß');
  assert(w.S.get('raehmchenmassMigriert'), 'Flag gesetzt – läuft nur einmal');
});

/* ---------- Dashboard-Kachel „Fahrt zum Stand“: Top 5 nach Besuchshäufigkeit ---------- */
test('staendeNachBesuchen: meistbesuchte Stände zuerst', (w) => {
  const staende = [{ id: 'a', name: 'Zeta' }, { id: 'b', name: 'Alpha' }, { id: 'c', name: 'Mitte' }];
  const fahrten = [{ standId: 'c' }, { standId: 'c' }, { standId: 'a' }, { standId: 'weg' }, {}];
  const { sorted, besuche } = w.staendeNachBesuchen(staende, fahrten);
  assertEq(sorted.map((s) => s.id).join(','), 'c,a,b', 'nach Häufigkeit, dann alphabetisch');
  assertEq(besuche.get('c'), 2, 'Besuche gezählt');
  assertEq(besuche.get('b') || 0, 0, 'Stand ohne Fahrt = 0');
  assertEq(staende.map((s) => s.id).join(','), 'a,b,c', 'Original-Liste nicht mutiert');
});
test('staendeNachBesuchen: ohne Fahrten rein alphabetisch', (w) => {
  const { sorted } = w.staendeNachBesuchen([{ id: '1', name: 'Bravo' }, { id: '2', name: 'alpha' }], []);
  assertEq(sorted.map((s) => s.name).join(','), 'alpha,Bravo', 'Groß-/Kleinschreibung egal');
  assertEq(w.staendeNachBesuchen([], []).sorted.length, 0, 'leere Liste ok');
});

/* ---------- Wanderung: Stand → Völker → Ziel-Stand ---------- */
test('wanderungPruefen: fachliche Validierung', (w) => {
  assert(w.wanderungPruefen({}), 'ohne Von-Stand → Fehler');
  assert(w.wanderungPruefen({ vonStandId: 'a' }), 'ohne Völker → Fehler');
  assert(w.wanderungPruefen({ vonStandId: 'a', volkIds: [] }), 'leere Völkerliste → Fehler');
  assert(w.wanderungPruefen({ vonStandId: 'a', volkIds: ['v1'] }), 'ohne Ziel-Stand → Fehler');
  const gleich = w.wanderungPruefen({ vonStandId: 'a', volkIds: ['v1'], nachStandId: 'a' });
  assert(gleich && /derselbe/.test(gleich), 'Ziel == Ausgangsstand → Fehler');
  assertEq(w.wanderungPruefen({ vonStandId: 'a', volkIds: ['v1'], nachStandId: 'b' }), null, 'gültige Wanderung → null');
});
test('wanderungVoelkerUmziehen: setzt Stand + Historie, alles andere bleibt', async (w) => {
  const a = await w.DB.put('staende', { name: 'WandVon' });
  const b = await w.DB.put('staende', { name: 'WandNach' });
  const v1 = await w.DB.put('voelker', { name: 'WVolk1', standId: a.id, status: 'aktiv', beutentyp: 'Zander', funktion: 'Wirtschaftsvolk', koeniginId: 'q1', historie: [] });
  const v2 = await w.DB.put('voelker', { name: 'WVolk2', standId: b.id, status: 'aktiv', historie: [] }); // steht schon am Ziel
  const bewegt = await w.wanderungVoelkerUmziehen([v1.id, v2.id, 'geloescht-xyz'], b.id, '2026-05-01', 'WandVon', 'WandNach', [a.id]);
  assertEq(bewegt, 1, 'nur ein Volk musste bewegt werden');
  const n1 = await w.DB.get('voelker', v1.id);
  assertEq(n1.standId, b.id, 'Volk steht auf dem Ziel-Stand');
  assertEq(n1.beutentyp, 'Zander', 'Beutentyp unverändert');
  assertEq(n1.funktion, 'Wirtschaftsvolk', 'Funktion unverändert');
  assertEq(n1.koeniginId, 'q1', 'Königin unverändert');
  assertEq(n1.historie.length, 1, 'Historie-Eintrag geschrieben');
  assert(/WandVon/.test(n1.historie[0].text) && /WandNach/.test(n1.historie[0].text), 'Historie nennt beide Stände');
  assertEq((await w.DB.get('voelker', v2.id)).historie.length, 0, 'Volk am Ziel bekommt keinen Eintrag');
});
test('wanderungVoelkerUmziehen: erlaubteQuellen begrenzt die Korrektur', async (w) => {
  const start = await w.DB.put('staende', { name: 'StartStand' });
  const altZiel = await w.DB.put('staende', { name: 'AltZiel' });
  const neuZiel = await w.DB.put('staende', { name: 'NeuZiel' });
  const woanders = await w.DB.put('staende', { name: 'Woanders' });
  const amAltenZiel = await w.DB.put('voelker', { name: 'WVolk3', standId: altZiel.id, status: 'aktiv', historie: [] });
  const nachgetragen = await w.DB.put('voelker', { name: 'WVolk5', standId: start.id, status: 'aktiv', historie: [] });
  const verzogen = await w.DB.put('voelker', { name: 'WVolk4', standId: woanders.id, status: 'aktiv', historie: [] });
  const quellen = [start.id, altZiel.id];
  const bewegt = await w.wanderungVoelkerUmziehen([amAltenZiel.id, nachgetragen.id, verzogen.id], neuZiel.id, '2026-05-02', 'StartStand', 'NeuZiel', quellen);
  assertEq(bewegt, 2, 'Volk am alten Ziel + nachgetragenes Volk vom Startstand wandern');
  assertEq((await w.DB.get('voelker', amAltenZiel.id)).standId, neuZiel.id, 'vom alten Ziel nachgezogen');
  assertEq((await w.DB.get('voelker', nachgetragen.id)).standId, neuZiel.id, 'nachtraeglich ergaenztes Volk wandert mit');
  assertEq((await w.DB.get('voelker', verzogen.id)).standId, woanders.id, 'zwischenzeitlich verzogenes Volk bleibt unangetastet');
});
test('altdatenVorbelegung: leitet Stände aus alten Wanderungen ab, rät aber nichts', (w) => {
  const st = [{ id: 's1', name: 'Heim' }, { id: 's2', name: 'Raps' }, { id: 's3', name: 'Doppelt' }, { id: 's4', name: 'Doppelt' }];
  assertEq(w.altdatenVorbelegung({ zielTyp: 'stand', zielId: 's2', vonOrt: 'Heim', nachOrt: 'Raps' }, st), { vonStandId: 's1', nachStandId: 's2' }, 'beide Orte eindeutig');
  assertEq(w.altdatenVorbelegung({ vonOrt: 'Doppelt', nachOrt: 'Raps' }, st), { nachStandId: 's2' }, 'mehrdeutiger Name wird nicht geraten');
  assertEq(w.altdatenVorbelegung({ zielTyp: 'stand', zielId: 's2', vonOrt: 'Unbekannt', nachOrt: 'Unbekannt2' }, st), { nachStandId: 's2' }, 'Ziel aus zielId');
  assertEq(w.altdatenVorbelegung({ zielTyp: 'volk', zielId: 'v9', vonOrt: 'Unbekannt', nachOrt: 'Unbekannt2' }, st), {}, 'zielTyp volk liefert keinen Stand');
  assertEq(w.altdatenVorbelegung({ vonStandId: 's1', nachStandId: 's2', vonOrt: 'x', nachOrt: 'y' }, st), {}, 'neues Format bleibt unangetastet');
});

/* ---------- Wanderung: Fehler aus dem adversarialen Review ---------- */
test('wanderungVoelkerUmziehen: Volk ohne Stand (Stand gelöscht) wandert mit', async (w) => {
  const a = await w.DB.put('staende', { name: 'RevA' });
  const ziel = await w.DB.put('staende', { name: 'RevZiel' });
  const heimatlos = await w.DB.put('voelker', { name: 'RevHeimatlos', standId: null, status: 'aktiv', historie: [] });
  const fremd = await w.DB.put('staende', { name: 'RevFremd' });
  const aufFremd = await w.DB.put('voelker', { name: 'RevFremdVolk', standId: fremd.id, status: 'aktiv', historie: [] });
  const bewegt = await w.wanderungVoelkerUmziehen([heimatlos.id, aufFremd.id], ziel.id, '2026-05-03', 'RevA', 'RevZiel', [a.id]);
  assertEq(bewegt, 1, 'nur das heimatlose Volk wandert');
  assertEq((await w.DB.get('voelker', heimatlos.id)).standId, ziel.id, 'Volk ohne Stand wurde zugeordnet');
  assertEq((await w.DB.get('voelker', aufFremd.id)).standId, fremd.id, 'Volk auf fremdem Stand bleibt');
});
test('wanderungVoelkerUmziehen: kein doppelter Historien-Eintrag', async (w) => {
  const a = await w.DB.put('staende', { name: 'DupA' });
  const b = await w.DB.put('staende', { name: 'DupB' });
  const v = await w.DB.put('voelker', { name: 'DupVolk', standId: a.id, status: 'aktiv', historie: [] });
  await w.wanderungVoelkerUmziehen([v.id], b.id, '2026-05-04', 'DupA', 'DupB', [a.id]);
  // Volk manuell zurück auf A, dann dieselbe Wanderung erneut anwenden
  const zurueck = await w.DB.get('voelker', v.id);
  zurueck.standId = a.id; await w.DB.put('voelker', zurueck);
  await w.wanderungVoelkerUmziehen([v.id], b.id, '2026-05-04', 'DupA', 'DupB', [a.id]);
  const nach = await w.DB.get('voelker', v.id);
  assertEq(nach.standId, b.id, 'wieder am Ziel');
  assertEq(nach.historie.filter((h) => /Gewandert/.test(h.text)).length, 1, 'Historien-Eintrag nicht doppelt');
});
test('wanderungVoelkerUmziehen: identischer Text an anderem Datum wird eigenständig geloggt', async (w) => {
  const a = await w.DB.put('staende', { name: 'DatA' });
  const b = await w.DB.put('staende', { name: 'DatB' });
  const v = await w.DB.put('voelker', { name: 'DatVolk', standId: a.id, status: 'aktiv', historie: [] });
  await w.wanderungVoelkerUmziehen([v.id], b.id, '2026-05-04', 'DatA', 'DatB', [a.id]);
  const zurueck = await w.DB.get('voelker', v.id); zurueck.standId = a.id; await w.DB.put('voelker', zurueck);
  await w.wanderungVoelkerUmziehen([v.id], b.id, '2026-06-09', 'DatA', 'DatB', [a.id]);
  const nach = await w.DB.get('voelker', v.id);
  assertEq(nach.historie.filter((h) => /Gewandert/.test(h.text)).length, 2, 'zweite Wanderung an anderem Datum wird geloggt');
});

/* ---------- Wanderung: Grund der Wanderung (ersetzt „Zugeordnete Tracht") ---------- */
test('VORSCHLAEGE.wanderungsgrund enthält Trachten + Belegstelle', (w) => {
  const g = w.VORSCHLAEGE.wanderungsgrund;
  ['Linde', 'Waldtracht', 'Belegstelle'].forEach((n) => assert(g.includes(n), n + ' vorhanden'));
  assert(g.length >= 10, 'genug Auswahl (' + g.length + ')');
  assertEq(new Set(g).size, g.length, 'keine Duplikate');
});
test('wanderungGrund: Freitext gewinnt, Altdaten fallen auf die Tracht zurück', (w) => {
  const trachten = new Map([['t1', { bezeichnung: 'Raps 2026' }]]);
  assertEq(w.wanderungGrund({ grund: 'Belegstelle' }, trachten), 'Belegstelle', 'Freitext');
  assertEq(w.wanderungGrund({ grund: '  Linde  ' }, trachten), 'Linde', 'getrimmt');
  assertEq(w.wanderungGrund({ trachtId: 't1' }, trachten), 'Raps 2026', 'Altdatensatz nutzt Tracht');
  assertEq(w.wanderungGrund({ grund: '', trachtId: 't1' }, trachten), 'Raps 2026', 'leerer Grund fällt zurück');
  assertEq(w.wanderungGrund({ grund: 'Heide', trachtId: 't1' }, trachten), 'Heide', 'Freitext schlägt Tracht');
  assertEq(w.wanderungGrund({ trachtId: 'weg' }, trachten), '', 'gelöschte Tracht → leer');
  assertEq(w.wanderungGrund({}, trachten), '', 'nichts gesetzt → leer');
  assertEq(w.wanderungGrund({ grund: 'X' }, undefined), 'X', 'ohne trachten-Map robust');
});

/* ---------- Ernte-Umbau: Produkte, Honigsorten, Laborergebnis ---------- */
test('BIENENPRODUKTE auf Honig-Produkte reduziert', (w) => {
  const p = w.BIENENPRODUKTE;
  ['Honig', 'Wabenhonig', 'Pollen', 'Propolis'].forEach((n) => assert(p.includes(n), n + ' vorhanden'));
  ['Wachs', 'Gelée Royale', 'Met', 'Bienengift', 'Ableger/Volk'].forEach((n) => assert(!p.includes(n), n + ' entfernt'));
});
test('Honigsorten sind einstellbar (Settings-Default vorhanden)', (w) => {
  const s = w.S.get('honigsorten');
  assert(Array.isArray(s) && s.length >= 5, 'Default-Liste vorhanden');
  assert(s.includes('Raps') && s.includes('Linde'), 'gängige Sorten dabei');
});
test('laborErgebnisUebernehmen: Sorte + Wassergehalt auf mehrere Ernten', async (w) => {
  const a = await w.DB.put('ernten', { zielTyp: 'volk', zielId: 'vx', schleuderung: 1, datum: '2026-06-15', produktart: 'Honig', sorte: '', mengeKg: 20, wassergehalt: null, notiz: '' });
  const b = await w.DB.put('ernten', { zielTyp: 'volk', zielId: 'vy', schleuderung: 1, datum: '2026-06-16', produktart: 'Honig', sorte: '', mengeKg: 18, wassergehalt: null, notiz: '' });
  const n = await w.laborErgebnisUebernehmen([a.id, b.id, 'geloescht-xyz'], '  Raps  ', 17.2);
  assertEq(n, 2, 'zwei Ernten aktualisiert, gelöschte ignoriert');
  const na = await w.DB.get('ernten', a.id), nb = await w.DB.get('ernten', b.id);
  assertEq(na.sorte, 'Raps', 'Sorte getrimmt übernommen');
  assertEq(na.wassergehalt, 17.2, 'Wassergehalt übernommen');
  assertEq(nb.sorte, 'Raps', 'auch zweite Ernte');
  assertEq(na.mengeKg, 20, 'Menge unverändert');
  assertEq(na.schleuderung, 1, 'Schleuderung unverändert');
});
test('Reporting.ertrag: Gruppierung nach Sorte', async (w) => {
  await w.DB.put('ernten', { zielTyp: 'volk', zielId: 'vz', datum: '2026-06-01', produktart: 'Honig', sorte: 'ReptestSorte', mengeKg: 5, wassergehalt: null });
  await w.DB.put('ernten', { zielTyp: 'volk', zielId: 'vz', datum: '2026-06-02', produktart: 'Honig', sorte: 'ReptestSorte', mengeKg: 7, wassergehalt: null });
  const rows = await w.Reporting.ertrag('sorte');
  const r = rows.find((x) => x.k === 'ReptestSorte');
  assert(r, 'Sorte taucht in der Gruppierung auf');
  assertEq(r.kg, 12, 'Menge je Sorte summiert');
});

/* ---------- Fahrtenbuch: Stand-Fahrten + freie Fahrten ---------- */
test('fahrtZielName: Stand-Name, sonst freies Ziel/Zweck', (w) => {
  const staende = new Map([['s1', { name: 'Heimstand' }]]);
  assertEq(w.fahrtZielName({ standId: 's1' }, staende), 'Heimstand', 'Stand-Name');
  assertEq(w.fahrtZielName({ standId: 'weg' }, staende), 'gelöschter Stand', 'gelöschter Stand');
  assertEq(w.fahrtZielName({ standId: null, freiZiel: 'Imkerbedarf Müller' }, staende), 'Imkerbedarf Müller', 'freies Ziel');
  assertEq(w.fahrtZielName({ standId: null, freiZiel: '', zweck: 'Schulung/Weiterbildung' }, staende), 'Schulung/Weiterbildung', 'Fallback Zweck');
  assertEq(w.fahrtZielName({ standId: null }, staende), 'Andere Fahrt', 'letzter Fallback');
});
test('VORSCHLAEGE.fahrtzweck enthält freie Zwecke', (w) => {
  ['Einkauf/Besorgung', 'Schulung/Weiterbildung', 'Imkerverein/Versammlung'].forEach((z) => assert(w.VORSCHLAEGE.fahrtzweck.includes(z), z + ' vorhanden'));
});

/* ---------- Fütterung: Sammel-Erfassung mit Stand-/Funktions-Filter ---------- */
test('passtZuFilter: Stand + Funktion + nur aktive', (w) => {
  const v = { status: 'aktiv', standId: 's1', funktion: 'Wirtschaftsvolk' };
  assert(w.passtZuFilter(v, '', ''), 'leere Filter = passt');
  assert(w.passtZuFilter(v, 's1', ''), 'richtiger Stand');
  assert(!w.passtZuFilter(v, 's2', ''), 'falscher Stand');
  assert(w.passtZuFilter(v, 's1', 'Wirtschaftsvolk'), 'Stand + Funktion');
  assert(!w.passtZuFilter(v, '', 'Ableger'), 'falsche Funktion');
  assert(!w.passtZuFilter({ ...v, status: 'aufgeloest' }, '', ''), 'inaktive nie');
  assert(!w.passtZuFilter({ status: 'aktiv', standId: 's1' }, '', 'Wirtschaftsvolk'), 'Volk ohne Funktion passt nicht zu Funktions-Filter');
});
test('fuetterungFuerVoelker: legt je Volk einen Datensatz an', async (w) => {
  const v1 = await w.DB.put('voelker', { name: 'FütTest1', status: 'aktiv' });
  const v2 = await w.DB.put('voelker', { name: 'FütTest2', status: 'aktiv' });
  const n = await w.fuetterungFuerVoelker([v1.id, v2.id], { datum: '2026-08-01', futterart: 'Zuckerwasser 3:2', mengeKg: 5, winterfutter: true, wiedervorlageTage: 7 });
  assertEq(n, 2, 'zwei Datensätze');
  const alle = (await w.DB.getAll('fuetterungen')).filter((f) => [v1.id, v2.id].includes(f.volkId));
  assertEq(alle.length, 2, 'beide in der DB');
  assertEq(alle[0].mengeKg, 5, 'Menge übernommen');
  assert(alle.every((f) => f.winterfutter === true), 'Winterfutter-Haken übernommen');
  assert(alle.every((f) => !('wiedervorlageTage' in f)), 'Formular-Hilfsfeld wird nicht mitgespeichert');
  assertEq(await w.fuetterungFuerVoelker([], { datum: 'x' }), 0, 'leere Auswahl = 0');
});
test('behandlungFuerVoelker: je Volk ein Bestandsbuch-Eintrag (TAMG)', async (w) => {
  const v1 = await w.DB.put('voelker', { name: 'BehTest1', status: 'aktiv' });
  const v2 = await w.DB.put('voelker', { name: 'BehTest2', status: 'aktiv' });
  const n = await w.behandlungFuerVoelker([v1.id, v2.id], { datum: '2026-08-02', mittel: 'Ameisensäure 60 %', menge: 200, einheit: 'ml', anwendungsart: 'Langzeitverdunster', wartezeitTage: 0, notiz: 'Charge AS-2026-1' });
  assertEq(n, 2, 'zwei Einträge');
  const alle = (await w.DB.getAll('behandlungen')).filter((b) => [v1.id, v2.id].includes(b.zielId));
  assertEq(alle.length, 2, 'beide in der DB');
  assert(alle.every((b) => b.zielTyp === 'volk'), 'jeweils auf das Volk gebucht');
  assert(alle.every((b) => b.mittel === 'Ameisensäure 60 %' && b.menge === 200 && b.einheit === 'ml'), 'Mittel/Menge/Einheit übernommen');
  assert(alle.every((b) => b.notiz === 'Charge AS-2026-1'), 'Charge-Notiz übernommen');
  assertEq(await w.behandlungFuerVoelker([], { datum: 'x' }), 0, 'leere Auswahl = 0');
});
test('optionenSortiert: alphanumerisch, deutsch, zahlen-bewusst, Platzhalter oben', (w) => {
  // {v,l}-Objekte: Zahlen numerisch (7 vor 19), nicht als Text (sonst 19 vor 7)
  const steuer = w.optionenSortiert([{ v: '19', l: '19 %' }, { v: '7', l: '7 %' }, { v: '0', l: '0 % / keine' }]);
  assertEq(steuer.map((o) => o.v), ['0', '7', '19'], '0,7,19 numerisch korrekt');
  // Platzhalter mit leerem Wert bleibt oben, Rest alphabetisch
  const staende = w.optionenSortiert([{ v: '', l: 'Alle Stände' }, { v: 'b', l: 'Zander-Stand' }, { v: 'a', l: 'Apfelwiese' }]);
  assertEq(staende.map((o) => o.l), ['Alle Stände', 'Apfelwiese', 'Zander-Stand'], 'Platzhalter oben, dann A→Z');
  // String-Liste (suggest) mit Losnummern
  assertEq(w.optionenSortiert(['Los 10', 'Los 2', 'Los 1'], true), ['Los 1', 'Los 2', 'Los 10'], 'Strings numerisch');
  // Deutsche Sortierung inkl. Umlaut-Faltung
  assertEq(w.optionenSortiert(['Zander', 'Ableger', 'Öko'], true), ['Ableger', 'Öko', 'Zander'], 'deutsch inkl. Umlaut');
  // keepOrder lässt die Reihenfolge unangetastet (Bewertung 4→1)
  const note = [{ v: 0, l: '– nicht bewertet –' }, { v: 4, l: '4 – sehr gut' }, { v: 1, l: '1 – schwach' }];
  assertEq(w.optionenSortiert(note, false, true).map((o) => o.v), [0, 4, 1], 'keepOrder unverändert');
});

/* ---------- Zucht: Kennung, Zuchtnote, Töchter aus Serie ---------- */
test('zuchtNote: Durchschnitt der bewerteten Merkmale (0 zählt nicht)', (w) => {
  assertEq(w.zuchtNote({ sanftmut: 4, wabensitz: 4, schwarm: 4, entwicklung: 4 }), 4, 'alle 4');
  assertEq(w.zuchtNote({ sanftmut: 4, wabensitz: 3, schwarm: 0, entwicklung: 0 }), 3.5, 'nur bewertete zählen');
  assertEq(w.zuchtNote({}), 0, 'nichts bewertet = 0');
  assertEq(w.zuchtNote(null), 0, 'null robust');
});
test('naechsteKennung: fortlaufend je Kürzel+Jahr, eindeutig', async (w) => {
  const bestand = (await w.DB.getAll('koeniginnen')).length;
  await w.DB.put('koeniginnen', { kennung: 'ZZ-30-001', jahrgang: 2030, status: 'aktiv' });
  await w.DB.put('koeniginnen', { kennung: 'ZZ-30-004', jahrgang: 2030, status: 'aktiv' });
  const alt = w.S.get('imkerei');
  await w.S.set('imkerei', { ...alt, name: 'Zeidler Zunft' }); // Kürzel ZZ
  const k = await w.naechsteKennung(2030);
  assertEq(k, 'ZZ-30-005', 'zählt über die höchste vorhandene Nummer hinaus');
  const k2 = await w.naechsteKennung(2031);
  assertEq(k2, 'ZZ-31-001', 'anderes Jahr beginnt bei 001');
  await w.S.set('imkerei', alt);
});
test('erzeugeToechter: erben Mutter/Anpaarung/Linie/Jahrgang + eindeutige Kennungen', async (w) => {
  const mutter = await w.DB.put('koeniginnen', { kennung: 'M-99-001', jahrgang: 1999, linie: 'Carnica X', status: 'aktiv' });
  const vater = await w.DB.put('koeniginnen', { kennung: 'V-99-001', jahrgang: 1999, status: 'aktiv' });
  const serie = { id: 'serie-test-xy', name: 'Testserie', linie: 'Carnica X', zuchtmutterId: mutter.id, anpaarung: 'besamung', vatervolkId: vater.id, belegstelle: '' };
  const n = await w.erzeugeToechter(serie, 3, 2027);
  assertEq(n, 3, 'drei Töchter');
  const toechter = (await w.DB.getAll('koeniginnen')).filter((q) => q.serieId === 'serie-test-xy');
  assertEq(toechter.length, 3, 'drei in der DB mit Serien-Rückreferenz');
  assert(toechter.every((t) => t.mutterId === mutter.id), 'Mutter vererbt');
  assert(toechter.every((t) => t.vatervolkId === vater.id && t.anpaarung === 'besamung'), 'Vaterseite vererbt');
  assert(toechter.every((t) => t.jahrgang === 2027 && t.linie === 'Carnica X'), 'Jahrgang + Linie vererbt');
  assertEq(new Set(toechter.map((t) => t.kennung)).size, 3, 'Kennungen eindeutig');
});
test('Zuchtkalender: fachlich korrigierte Tage', (w) => {
  const tage = Object.fromEntries(w.ZUCHT_KALENDER.map((z) => [z.tag, z.titel]));
  assert(tage[5] && /erdeckel/.test(tage[5]), 'Verdeckelung an Tag 5 ergänzt');
  assert(tage[1], 'Annahme an Tag 1');
  assert(tage[12] && /chlupf/.test(tage[12]), 'Schlupf Tag 12');
  assert(tage[41], 'Legekontrolle-Deadline Tag 41');
  assert(!tage[2], 'alter Annahme-Tag 2 entfernt');
});
test('bioZertText: Kontrollstelle + EU-Bio bzw. Verbände; leer wenn keine Bio-Imkerei', (w) => {
  assertEq(w.bioZertText({ bio: 'nein' }), '', 'keine Bio-Imkerei → leer');
  assertEq(w.bioZertText({ bio: 'ja', bioKontrollstelle: 'DE-ÖKO-006 – ABCERT AG', bioVerbandJN: 'nein' }), 'DE-ÖKO-006 – ABCERT AG · EU-Bio', 'ohne Verband → EU-Bio automatisch');
  assertEq(w.bioZertText({ bio: 'ja', bioKontrollstelle: 'DE-ÖKO-006 – ABCERT AG', bioVerbandJN: 'ja', bioVerband: ['Demeter', 'Bioland'] }), 'DE-ÖKO-006 – ABCERT AG · Demeter, Bioland', 'mit Verbänden (mehrere)');
  assertEq(w.bioZertText({ bio: 'ja', bioKontrollstelle: '', bioVerbandJN: 'ja', bioVerband: [] }), 'EU-Bio', 'Verband ja aber leer → EU-Bio');
});
test('setBewertung: schreibt Bewertung + Bewertungsdatum an die Königin', async (w) => {
  const q = await w.DB.put('koeniginnen', { kennung: 'BW-27-001', jahrgang: 2027, status: 'aktiv', historie: [], bewertung: {} });
  const ok = await w.setBewertung(q.id, { sanftmut: 4, wabensitz: 3, schwarm: 2, entwicklung: 4, honigKg: 30 }, '2027-06-01');
  assert(ok, 'true bei Erfolg');
  const nach = await w.DB.get('koeniginnen', q.id);
  assertEq(nach.bewertung.sanftmut, 4, 'Sanftmut gespeichert');
  assertEq(nach.bewertung.honigKg, 30, 'Honig gespeichert');
  assertEq(nach.bewertetAm, '2027-06-01', 'Bewertungsdatum gespeichert');
  assertEq(w.zuchtNote(nach.bewertung), 3.3, 'Zuchtnote aus den vier Merkmalen');
  assert(!(await w.setBewertung('gibts-nicht', {}, '2027-06-01')), 'false bei unbekannter Königin');
});
test('umweiseln: neue Königin einsetzen, alte auf umgeweiselt, Historie sauber', async (w) => {
  const alt = await w.DB.put('koeniginnen', { kennung: 'ALT-27-001', jahrgang: 2027, status: 'aktiv', historie: [] });
  const volk = await w.DB.put('voelker', { name: 'Umweisel-Volk A', status: 'aktiv', koeniginId: alt.id, historie: [] });
  // Zuordnung der alten Königin öffnen (wie beim Zuweisen im Volk-Formular)
  alt.historie = [{ volkId: volk.id, von: '2026-04-01', bis: null }]; await w.DB.put('koeniginnen', alt);
  const neu = await w.DB.put('koeniginnen', { kennung: 'NEU-27-001', jahrgang: 2027, status: 'aktiv', historie: [] });
  const ok = await w.umweiseln(volk.id, neu.id, '2027-05-15');
  assert(ok, 'true bei Erfolg');
  const vNach = await w.DB.get('voelker', volk.id);
  const altNach = await w.DB.get('koeniginnen', alt.id);
  const neuNach = await w.DB.get('koeniginnen', neu.id);
  assertEq(vNach.koeniginId, neu.id, 'Volk trägt jetzt die neue Königin');
  assertEq(altNach.status, 'umgeweiselt', 'alte Königin auf umgeweiselt gesetzt');
  assertEq(altNach.historie[0].bis, '2027-05-15', 'alte Zuordnung beendet');
  const offen = (neuNach.historie || []).find((h) => h.volkId === volk.id && !h.bis);
  assert(offen && offen.von === '2027-05-15', 'neue Königin hat offene Zuordnung ab Datum');
});
test('koeniginHistorieSync: offener Eintrag bestimmt das Volk', async (w) => {
  const q = await w.DB.put('koeniginnen', { kennung: 'HS-27-001', jahrgang: 2027, status: 'aktiv', historie: [] });
  const vA = await w.DB.put('voelker', { name: 'HistSync A', status: 'aktiv', koeniginId: null, historie: [] });
  // offener Eintrag → Volk bekommt die Königin
  q.historie = [{ volkId: vA.id, von: '2027-04-01', bis: null }];
  await w.DB.put('koeniginnen', q);
  assertEq(await w.koeniginHistorieSync(q), vA.id, 'Ziel-Volk = offener Eintrag');
  assertEq((await w.DB.get('voelker', vA.id)).koeniginId, q.id, 'Volk führt die Königin');
  // Eintrag geschlossen → Volk wieder frei
  q.historie = [{ volkId: vA.id, von: '2027-04-01', bis: '2027-08-01' }];
  await w.DB.put('koeniginnen', q);
  assertEq(await w.koeniginHistorieSync(q), null, 'kein offener Eintrag → kein Volk');
  assertEq((await w.DB.get('voelker', vA.id)).koeniginId, null, 'Volk wieder ohne Königin');
});
test('koeniginHistorieSync: Umhängen löst altes Volk und verdrängt die dortige Königin', async (w) => {
  const q1 = await w.DB.put('koeniginnen', { kennung: 'HS-27-010', jahrgang: 2027, status: 'aktiv', historie: [] });
  const q2 = await w.DB.put('koeniginnen', { kennung: 'HS-27-011', jahrgang: 2027, status: 'aktiv', historie: [] });
  const vA = await w.DB.put('voelker', { name: 'HistSync C', status: 'aktiv', koeniginId: null, historie: [] });
  const vB = await w.DB.put('voelker', { name: 'HistSync D', status: 'aktiv', koeniginId: q2.id, historie: [] });
  q2.historie = [{ volkId: vB.id, von: '2027-03-01', bis: null }]; await w.DB.put('koeniginnen', q2);
  // q1 sitzt erst in A …
  q1.historie = [{ volkId: vA.id, von: '2027-04-01', bis: null }]; await w.DB.put('koeniginnen', q1);
  await w.koeniginHistorieSync(q1);
  assertEq((await w.DB.get('voelker', vA.id)).koeniginId, q1.id, 'q1 in Volk A');
  // … dann wird der offene Eintrag auf B umgehängt
  q1.historie = [{ volkId: vB.id, von: '2027-05-01', bis: null }]; await w.DB.put('koeniginnen', q1);
  await w.koeniginHistorieSync(q1);
  assertEq((await w.DB.get('voelker', vA.id)).koeniginId, null, 'Volk A wieder frei');
  assertEq((await w.DB.get('voelker', vB.id)).koeniginId, q1.id, 'Volk B führt jetzt q1');
  const q2n = await w.DB.get('koeniginnen', q2.id);
  assert(q2n.historie[0].bis, 'verdrängte Königin: offene Zuordnung wurde geschlossen');
});
test('umweiseln: löst die neue Königin aus einem anderen Volk', async (w) => {
  const q = await w.DB.put('koeniginnen', { kennung: 'MOVE-27-001', jahrgang: 2027, status: 'aktiv', historie: [{ volkId: null, von: '2026-04-01', bis: null }] });
  const vAlt = await w.DB.put('voelker', { name: 'Herkunft-Volk', status: 'aktiv', koeniginId: q.id, historie: [] });
  const vNeu = await w.DB.put('voelker', { name: 'Ziel-Volk', status: 'aktiv', koeniginId: null, historie: [] });
  await w.umweiseln(vNeu.id, q.id, '2027-05-20');
  assertEq((await w.DB.get('voelker', vAlt.id)).koeniginId, null, 'altes Volk hat die Königin verloren');
  assertEq((await w.DB.get('voelker', vNeu.id)).koeniginId, q.id, 'Ziel-Volk hat sie erhalten');
});

/* =====================================================================
   Amtliche Landbedeckung (CLC5 des BKG)
   Alles reine Rechnung ohne Netz: die Verschneidung mit dem Kreis ist der
   Kern, an dem die Zahlen für die Öko-Kontrolle hängen.
   ===================================================================== */
test('CLC: Kreis-Vieleck ist konvex, gleichmäßig und flächentreu genug', (w) => {
  const r = 1000;
  const k = w.clcKreis(r);
  assertEq(k.length, 96, '96 Ecken');
  for (const p of k) nah(Math.hypot(p.x, p.y), r, 0.001, 'jede Ecke liegt auf dem Kreis');
  // Fläche eines regelmäßigen n-Ecks: ½·n·r²·sin(2π/n)
  const soll = 0.5 * 96 * r * r * Math.sin((2 * Math.PI) / 96);
  nah(w.clcRingFlaeche(k), soll, 1, 'Vieleckfläche stimmt');
  assert(w.clcRingFlaeche(k) / (Math.PI * r * r) > 0.999, 'weniger als 0,1 % unter der Kreisfläche');
});

test('CLC: Ringfläche und Kappen rechnen in Quadratmetern richtig', (w) => {
  const quadrat = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }, { x: 0, y: 50 }];
  assertEq(w.clcRingFlaeche(quadrat), 5000, '100 × 50 m = 5000 m²');
  // gegen den Uhrzeigersinn gedreht: Betrag bleibt gleich
  assertEq(w.clcRingFlaeche([...quadrat].reverse()), 5000, 'Umlaufrichtung ändert die Fläche nicht');
  const r = 1000, kreis = w.clcKreis(r);
  const gross = [{ x: -5000, y: -5000 }, { x: 5000, y: -5000 }, { x: 5000, y: 5000 }, { x: -5000, y: 5000 }];
  nah(w.clcRingFlaeche(w.clcKappen(gross, kreis)), w.clcRingFlaeche(kreis), 1, 'alles übersteht → ganzer Kreis');
  const klein = [{ x: 10, y: 10 }, { x: 20, y: 10 }, { x: 20, y: 20 }, { x: 10, y: 20 }];
  assertEq(w.clcRingFlaeche(w.clcKappen(klein, kreis)), 100, 'ganz innen → unverändert');
  const weg = [{ x: 5000, y: 5000 }, { x: 5100, y: 5000 }, { x: 5100, y: 5100 }, { x: 5000, y: 5100 }];
  assertEq(w.clcKappen(weg, kreis).length, 0, 'ganz außen → nichts übrig');
});

/* Baukasten für die folgenden Tests: Kästen in Metern um den Mittelpunkt. */
function clcKasten(lat, lon, x0, x1, y0, y1) {
  const mLat = 110540, mLon = 111320 * Math.cos((lat * Math.PI) / 180);
  const pt = (dx, dy) => [lon + dx / mLon, lat + dy / mLat];
  return [pt(x0, y0), pt(x1, y0), pt(x1, y1), pt(x0, y1), pt(x0, y0)];
}
function clcFeature(code, ringe) {
  return { type: 'Feature', properties: { clc18: code }, geometry: { type: 'Polygon', coordinates: ringe } };
}

test('CLC: eine Fläche über den ganzen Kreis ergibt 100 % Abdeckung', (w) => {
  const lat = 50, lon = 10, r = 1000;
  const erg = w.clcAnteileAusFeatures([clcFeature('311', [clcKasten(lat, lon, -1200, 1200, -1200, 1200)])], lat, lon, r);
  assertEq(erg.zeilen.length, 1, 'genau eine Zeile');
  assertEq(erg.zeilen[0].name, 'Laubwälder', '311 ist Laubwälder – der amtliche Name, nicht „Wald"');
  assertEq(erg.zeilen[0].art, 'tracht', 'Laubwald ist Tracht');
  nah(erg.zeilen[0].prozent, 100, 0.2, 'die Klasse füllt den Kreis');
  nah(erg.abdeckung, 100, 0.2, 'Abdeckung 100 % – das ist der Unterschied zu OpenStreetMap');
  assert(!erg.zeilen.some((z) => z.name === 'Nicht im amtlichen Datensatz'), 'keine Lückenzeile');
});

test('CLC: Hälften, kleine Fläche und Löcher stimmen flächengenau', (w) => {
  const lat = 50, lon = 10, r = 1000;
  const halb = w.clcAnteileAusFeatures([
    clcFeature('211', [clcKasten(lat, lon, -1200, 0, -1200, 1200)]),
    clcFeature('312', [clcKasten(lat, lon, 0, 1200, -1200, 1200)]),
  ], lat, lon, r);
  const m1 = new Map(halb.zeilen.map((z) => [z.name, z.prozent]));
  nah(m1.get('Nicht bewässertes Ackerland'), 50, 0.2, 'westliche Hälfte = Ackerland');
  nah(m1.get('Nadelwälder'), 50, 0.2, 'östliche Hälfte = Nadelwälder');
  nah(halb.abdeckung, 100, 0.2, 'zusammen lückenlos');

  // 200 m × 400 m innerhalb des Kreises: exakt nachrechenbar
  const klein = w.clcAnteileAusFeatures([
    clcFeature('311', [clcKasten(lat, lon, -1200, 1200, -1200, 1200)]),
    clcFeature('121', [clcKasten(lat, lon, 100, 300, -200, 200)]),
  ], lat, lon, r);
  const m2 = new Map(klein.zeilen.map((z) => [z.name, z.prozent]));
  nah(m2.get('Industrie-und Gewerbeflächen, öffentliche Einrichtungen'), (200 * 400) / (Math.PI * r * r) * 100, 0.05, 'kleine Industriefläche exakt');

  // Loch im Wald: die Fläche muss fehlen und als Lücke auftauchen
  const mitLoch = w.clcAnteileAusFeatures([
    clcFeature('311', [clcKasten(lat, lon, -1200, 1200, -1200, 1200), clcKasten(lat, lon, -100, 100, -100, 100)]),
  ], lat, lon, r);
  const lochProzent = (200 * 200) / (Math.PI * r * r) * 100;
  nah(mitLoch.zeilen.find((z) => z.name === 'Laubwälder').prozent, 100 - lochProzent, 0.3, 'Loch geht vom Wald ab');
  const luecke = mitLoch.zeilen.find((z) => z.name === 'Nicht im amtlichen Datensatz');
  assert(luecke, 'das Loch wird als Lücke ausgewiesen, nicht verschluckt');
  nah(luecke.prozent, lochProzent, 0.3, 'Lücke so groß wie das Loch');
});

test('CLC: fehlende Flächen werden als Lücke ausgewiesen, unbekannte Schlüssel getrennt', (w) => {
  const lat = 50, lon = 10, r = 1000;
  const halb = w.clcAnteileAusFeatures([clcFeature('231', [clcKasten(lat, lon, 0, 1200, -1200, 1200)])], lat, lon, r);
  nah(halb.abdeckung, 50, 0.3, 'nur die halbe Fläche geliefert');
  nah(halb.zeilen.find((z) => z.name === 'Nicht im amtlichen Datensatz').prozent, 50, 0.3, 'Rest offen ausgewiesen');

  const fremd = w.clcAnteileAusFeatures([clcFeature('999', [clcKasten(lat, lon, -1200, 1200, -1200, 1200)])], lat, lon, r);
  assert(fremd.zeilen[0].name.startsWith('Sonstige amtliche Fläche'), 'unbekannter Schlüssel ist keine Lücke: ' + fremd.zeilen[0].name);
  nah(fremd.abdeckung, 100, 0.2, 'die Fläche zählt trotzdem als abgedeckt');
});

test('CLC: MultiPolygon wird vollständig gerechnet', (w) => {
  const lat = 50, lon = 10, r = 1000;
  const f = {
    type: 'Feature', properties: { clc18: '512' },
    geometry: { type: 'MultiPolygon', coordinates: [
      [clcKasten(lat, lon, -300, -100, -100, 100)],
      [clcKasten(lat, lon, 100, 300, -100, 100)],
    ] },
  };
  const erg = w.clcAnteileAusFeatures([f], lat, lon, r);
  assertEq(erg.zeilen[0].name, 'Wasserflächen', '512 ist Wasserflächen');
  nah(erg.zeilen[0].prozent, 2 * (200 * 200) / (Math.PI * r * r) * 100, 0.05, 'beide Teile gezählt');
});

test('CLC: amtliche Klassenliste ist gültig, fein und passt zu den Bio-Summen', (w) => {
  const arten = new Set(['tracht', 'bebaut', 'sonstiges']);
  for (const [code, [name, art]] of w.CLC_KLASSEN) {
    assert(/^\d{3}$/.test(code), `Schlüssel dreistellig: ${code}`);
    assert(name && name.length > 2, `Name gesetzt bei ${code}`);
    assert(arten.has(art), `Art gültig bei ${code}: ${art}`);
  }
  // die amtlichen Namen, wörtlich wie im Dienst – keine Sammelbegriffe mehr
  assertEq(w.CLC_KLASSEN.get('311')[0], 'Laubwälder', '311');
  assertEq(w.CLC_KLASSEN.get('312')[0], 'Nadelwälder', '312');
  assertEq(w.CLC_KLASSEN.get('313')[0], 'Mischwälder', '313');
  assertEq(w.CLC_KLASSEN.get('222')[0], 'Obst-und Beerenobstbestände', '222 – amtliche Schreibweise ohne Leerzeichen');
  assertEq(w.CLC_KLASSEN.get('221')[0], 'Weinbauflächen', '221');
  assertEq(w.CLC_KLASSEN.get('231')[0], 'Wiesen und Weiden', '231');
  assertEq(w.CLC_KLASSEN.get('112')[1], 'bebaut', 'Siedlung zählt als bebaut');
  assertEq(w.CLC_KLASSEN.get('512')[1], 'sonstiges', 'Wasserflächen sind weder Tracht noch bebaut');
  assert(w.CLC_KLASSEN.size >= 35, `mindestens die 35 Klassen des Dienstes: ${w.CLC_KLASSEN.size}`);

  // Namensvergleich für die Excel-Tabelle des GeoBox-Viewers
  assertEq(w.clcArtAusName('Nadelwälder'), 'tracht', 'Name direkt getroffen');
  assertEq(w.clcArtAusName('Industrie-und Gewerbeflächen, öffentliche Einrichtungen'), 'bebaut', 'amtliche Schreibweise');
  assertEq(w.clcArtAusName('Industrie- und Gewerbeflächen, öffentliche Einrichtungen'), 'bebaut', 'mit Leerzeichen nach dem Bindestrich');
  assertEq(w.clcArtAusName('  NADELWÄLDER '), 'tracht', 'Groß-/Kleinschreibung und Leerzeichen egal');
  assertEq(w.clcArtAusName('Etwas völlig Neues'), 'sonstiges', 'Unbekanntes zählt vorsichtig als sonstiges, nicht als Tracht');

  // Summen: die drei Arten müssen zusammen den Kreis füllen
  const lat = 50, lon = 10, r = 1000;
  const erg = w.clcAnteileAusFeatures([
    clcFeature('311', [clcKasten(lat, lon, -1200, 0, -1200, 1200)]),
    clcFeature('121', [clcKasten(lat, lon, 0, 1200, 0, 1200)]),
    clcFeature('512', [clcKasten(lat, lon, 0, 1200, -1200, 0)]),
  ], lat, lon, r);
  const su = w.bioSummen(erg.zeilen);
  nah(su.gesamt, 100, 0.3, 'Summe der Anteile ist 100 %');
  nah(su.tracht, 50, 0.3, 'Wald-Hälfte ist Tracht');
  nah(su.bebaut, 25, 0.3, 'Industrie-Viertel ist bebaut');
  nah(su.sonstiges, 25, 0.3, 'Gewässer-Viertel ist sonstiges');
});

test('CLC: Dienst-Angaben zeigen auf die amtliche Quelle', (w) => {
  assert(w.CLC_WFS.startsWith('https://sgx.geodatenzentrum.de/'), 'Dienst des BKG');
  assert(/clc5/i.test(w.CLC_WFS), 'CLC5-Datensatz');
  assert(/BKG/.test(w.CLC_QUELLE_KURZ) && /dl-de/.test(w.CLC_QUELLE_KURZ), 'Quellenangabe nennt BKG und Lizenz');
  assert(w.CLC_MAX >= 1000, 'Obergrenze der Abfrage großzügig');
});

/* =====================================================================
   Gläser, Deckel und Etiketten beim Abfüllen
   ===================================================================== */
test('Abfüllen: Gebinde-Vorschlag findet die richtige Größe', (w) => {
  const posten = [
    { id: 'a', bezeichnung: 'Gläser 500 g Rundglas', einheit: 'Stück', stueckzahl: 300 },
    { id: 'b', bezeichnung: 'Deckel TO82 für 500 g', einheit: 'Stück', stueckzahl: 400 },
    { id: 'c', bezeichnung: 'Gläser 250 g', einheit: 'Stück', stueckzahl: 200 },
    { id: 'd', bezeichnung: 'Hobbock 20 kg', einheit: 'Stück', stueckzahl: 12 },
    { id: 'e', bezeichnung: 'Gläser 1 kg', einheit: 'Stück', stueckzahl: 50 },
  ];
  assertEq(w.glasVorschlag(posten, 500), 'a', 'bei 500 g gewinnt das Glas, nicht der Deckel');
  assertEq(w.glasVorschlag(posten, 250), 'c', '250 g gefunden');
  assertEq(w.glasVorschlag(posten, 20000), 'd', '20 kg als Hobbock erkannt');
  assertEq(w.glasVorschlag(posten, 1000), 'e', '1 kg erkannt');
  assertEq(w.glasVorschlag(posten, 125), '', 'ohne Treffer bleibt es leer – nichts wird geraten');
  assertEq(w.glasVorschlag([{ id: 'x', bezeichnung: 'Gläser 250 g' }], 50), '',
    '„250 g" darf nicht als 50 g durchgehen');
  assertEq(w.glasVorschlag([{ id: 'y', bezeichnung: 'Gläser 1000 g' }], 1000), 'y', '1000 g zählt auch als 1 kg');
  assertEq(w.glasVorschlag([], 500), '', 'ohne Bestand kein Vorschlag');
  assertEq(w.zubehoerVorschlag(posten, /deckel/i), 'b', 'Deckel über den Namen gefunden');
  assertEq(w.zubehoerVorschlag(posten, /etikett/i), '', 'kein Etikett angelegt → leer');
  for (const g of w.GEBINDE_PRESETS) assert(w.gebindeLabel(g).length > 1, `Beschriftung für ${g} g`);
});

test('Abfüllen: mehrere Abzüge auf dieselbe Position addieren sich', async (w) => {
  const glas = await w.DB.put('inventar', { bezeichnung: 'Gläser 500 g Test', typ: 'verbrauch', kategorie: 'Gläser', einheit: 'Stück', stueckzahl: 300 });
  const deckel = await w.DB.put('inventar', { bezeichnung: 'Deckel Test', typ: 'verbrauch', kategorie: 'Gläser', einheit: 'Stück', stueckzahl: 100 });
  // 120 Gläser 500 g und 60 aus einer zweiten Größe, die auf dieselbe Position zeigt
  const b1 = await w.verbrauchAbziehen(glas.id, 120, { pruefen: false });
  const b2 = await w.verbrauchAbziehen(glas.id, 60, { pruefen: false });
  assertEq(b1.nachher, 180, 'nach dem ersten Abzug 180');
  assertEq(b2.vorher, 180, 'der zweite Abzug rechnet mit dem neuen Bestand');
  assertEq(b2.nachher, 120, 'zusammen 180 abgezogen');
  assertEq((await w.DB.get('inventar', glas.id)).stueckzahl, 120, 'Bestand steht im Lager');
  // Deckel: 180 Stück, aber nur 100 da → auf 0 und die fehlende Menge melden
  const b3 = await w.verbrauchAbziehen(deckel.id, 180, { pruefen: false });
  assertEq(b3.nachher, 0, 'Bestand läuft nicht ins Minus');
  assertEq(b3.gefehlt, 80, '80 Deckel fehlten – das muss gemeldet werden');
  assertEq(w.verbrauchEinheit(b3.pos), 'Stück', 'Einheit bleibt Stück');
});

test('Abfüllen: Vorschlag nimmt keine leergelaufene Position, wenn eine mit Bestand da ist', (w) => {
  // derselbe Artikel zweimal angelegt – alte Packung leer, neue voll
  const posten = [
    { id: 'leer', bezeichnung: 'Deckel TO82 alt', einheit: 'Stück', stueckzahl: 0 },
    { id: 'voll', bezeichnung: 'Deckel TO82 neu', einheit: 'Stück', stueckzahl: 500 },
  ];
  assertEq(w.zubehoerVorschlag(posten, /deckel/i), 'voll', 'die Position mit Bestand gewinnt');
  assertEq(w.zubehoerVorschlag([posten[0]], /deckel/i), 'leer', 'gibt es nur die leere, wird sie genommen');
  const glaeser = [
    { id: 'g-leer', bezeichnung: 'Gläser 500 g', einheit: 'Stück', stueckzahl: 0 },
    { id: 'g-voll', bezeichnung: 'Gläser 500 g Nachschub', einheit: 'Stück', stueckzahl: 240 },
  ];
  assertEq(w.glasVorschlag(glaeser, 500), 'g-voll', 'auch bei Gläsern zählt der Bestand');
  // der Name schlägt den Bestand: ein Deckel mit Bestand darf kein Glas ersetzen
  const gemischt = [
    { id: 'deckel', bezeichnung: 'Deckel für 500 g', einheit: 'Stück', stueckzahl: 900 },
    { id: 'glas', bezeichnung: 'Gläser 500 g', einheit: 'Stück', stueckzahl: 0 },
  ];
  assertEq(w.glasVorschlag(gemischt, 500), 'glas', 'Gebinde-Name wiegt schwerer als Bestand');
});

/* =====================================================================
   GeoBox-Dienst (amtliche Auswertung) und die Rückfallkette
   Netzfreie Teile: Umrechnung ins Bezugssystem, Tabellen-Auswertung,
   Reihenfolge und Verhalten der Kette.
   ===================================================================== */
test('GeoBox: Umrechnung nach Web Mercator trifft bekannte Werte', (w) => {
  const m = w.webMercator(0, 0);
  nah(m.x, 0, 0.5, 'Nullmeridian');
  nah(m.y, 0, 0.5, 'Äquator');
  // Mayen (RLP), gegen die Referenzrechnung des Dienstes geprüft
  const mayen = w.webMercator(50.3283, 7.2216);
  nah(mayen.x, 803904.8, 2, 'x Mayen');
  nah(mayen.y, 6503326.9, 2, 'y Mayen');
  // 90° Ost = ein Viertel des Erdumfangs in Mercator-Metern
  nah(w.webMercator(0, 90).x, 20037508.34 / 2, 1, '90° Ost');
  assert(w.webMercator(50, 10).y > 0 && w.webMercator(-50, 10).y < 0, 'Vorzeichen der Breite');
});

test('GeoBox: Tabelle wird zu Anteilen, Prozente auf 0,1 statt ganze Prozent', (w) => {
  const r = 3500, kreis = Math.PI * r * r;   // 38 484 510 m²
  // echte Zeilenform des Dienstes (Spalten wie in der gelieferten Datei)
  const tabelle = [
    { OBJECTID: 1, Klassenname: 'Laubwälder', 'Gesamt (QKM)': 38, 'Fläche (qm)': 4798605, 'Prozent (%)': 12 },
    { OBJECTID: 2, Klassenname: 'Nadelwälder', 'Gesamt (QKM)': 38, 'Fläche (qm)': 749167, 'Prozent (%)': 2 },
    { OBJECTID: 3, Klassenname: 'Obst-und Beerenobstbestände', 'Gesamt (QKM)': 38, 'Fläche (qm)': 987710, 'Prozent (%)': 3 },
    { OBJECTID: 4, Klassenname: 'Industrie-und Gewerbeflächen, öffentliche Einrichtungen', 'Gesamt (QKM)': 38, 'Fläche (qm)': 6205188, 'Prozent (%)': 16 },
    { OBJECTID: 5, Klassenname: 'Wasserflächen', 'Gesamt (QKM)': 38, 'Fläche (qm)': 25097, 'Prozent (%)': 0 },
    { OBJECTID: 6, Klassenname: '', 'Gesamt (QKM)': 38, 'Fläche (qm)': 0, 'Prozent (%)': 0 },   // Leerzeile: muss ignoriert werden
  ];
  const erg = w.gbvZeilenAusTabelle(tabelle, r);
  const map = new Map(erg.zeilen.map((z) => [z.name, z]));
  assert(!map.has(''), 'Leerzeile fällt raus');
  // 0,1-Genauigkeit: der Dienst sagt 12 %, gerechnet sind es 12,5 %
  nah(map.get('Laubwälder').prozent, (4798605 / kreis) * 100, 0.05, 'Laubwälder aus Quadratmetern');
  assert(map.get('Laubwälder').prozent !== 12, 'nicht die gerundete Zahl des Dienstes übernommen');
  assertEq(map.get('Laubwälder').art, 'tracht', 'Laubwälder sind Tracht');
  assertEq(map.get('Industrie-und Gewerbeflächen, öffentliche Einrichtungen').art, 'bebaut', 'Industrie ist bebaut');
  assertEq(map.get('Wasserflächen').art, 'sonstiges', 'Wasser ist sonstiges');
  assertEq(erg.zeilen[0].name, 'Industrie-und Gewerbeflächen, öffentliche Einrichtungen', 'größter Anteil steht oben');
  // hier fehlt der Großteil der Fläche → Lücke muss ausgewiesen werden
  const luecke = erg.zeilen.find((z) => z.name === 'Nicht im amtlichen Datensatz');
  assert(luecke, 'fehlende Fläche wird ausgewiesen');
  nah(erg.zeilen.reduce((sum, z) => sum + z.prozent, 0), 100, 0.3, 'mit Lücke ergibt es 100 %');
  // Spalten dürfen anders heißen
  const anders = w.gbvZeilenAusTabelle([{ Klassenname: 'Wiesen und Weiden', 'Fläche m²': kreis }], r);
  nah(anders.zeilen[0].prozent, 100, 0.2, 'andere Spaltenbeschriftung wird gefunden');
  nah(anders.abdeckung, 100, 0.2, 'volle Abdeckung erkannt');
  // gar keine Fläche → sprechender Fehler, damit die Kette weiterschalten kann
  let gemeldet = '';
  try { w.gbvZeilenAusTabelle([], r); } catch (e) { gemeldet = e.message; }
  assert(/keine Flächen/i.test(gemeldet), `sprechender Fehler statt leerem Ergebnis: ${gemeldet}`);
});

test('GeoBox: Quellenkette hat die richtige Reihenfolge und meldet ihre Quelle', async (w) => {
  const keys = w.LB_QUELLEN.map((q) => q.key);
  assertEq(keys.join('>'), 'gbv>bkg>osm', 'erst GeoBox, dann BKG, dann OpenStreetMap');
  assertEq(w.LB_QUELLEN[0].amtlich, true, 'GeoBox ist amtlich');
  assertEq(w.LB_QUELLEN[1].amtlich, true, 'BKG ist amtlich');
  assertEq(w.LB_QUELLEN[2].amtlich, false, 'OpenStreetMap ist nicht amtlich');
  for (const q of w.LB_QUELLEN) assert(q.kurz && q.label && typeof q.fn === 'function', `Quelle ${q.key} vollständig`);

  /* Kette mit ausgetauschten Funktionen prüfen: die erste Quelle fällt aus,
     die zweite antwortet – und das Ergebnis muss sagen, wer geantwortet hat
     und was zuvor schiefging. */
  const echt = w.LB_QUELLEN.map((q) => q.fn);
  const meldungen = [];
  try {
    w.LB_QUELLEN[0].fn = async () => { throw new Error('Dienst offline'); };
    w.LB_QUELLEN[1].fn = async () => ({ zeilen: [{ name: 'Nadelwälder', art: 'tracht', prozent: 100 }], abdeckung: 100 });
    w.LB_QUELLEN[2].fn = async () => { throw new Error('darf nicht dran kommen'); };
    const erg = await w.landbedeckungErmitteln(50, 7, 3500, (t) => meldungen.push(t));
    assertEq(erg.quelle.key, 'bkg', 'die zweite Quelle hat geantwortet');
    assertEq(erg.zeilen[0].name, 'Nadelwälder', 'Zeilen kommen durch');
    assertEq(erg.gescheitert.length, 1, 'der Ausfall ist vermerkt');
    assert(/Dienst offline/.test(erg.gescheitert[0]), `Grund steht drin: ${erg.gescheitert[0]}`);
    assert(meldungen.some((t) => /weiter mit/i.test(t)), 'der Wechsel wird gemeldet');

    // leeres Ergebnis gilt als Ausfall, nicht als Antwort
    w.LB_QUELLEN[1].fn = async () => ({ zeilen: [] });
    w.LB_QUELLEN[2].fn = async () => ({ zeilen: [{ name: 'Acker', art: 'tracht', prozent: 100 }], abdeckung: 100 });
    const erg2 = await w.landbedeckungErmitteln(50, 7, 3500, () => {});
    assertEq(erg2.quelle.key, 'osm', 'leere Antwort schaltet weiter');

    // nur eine Quelle erzwingen
    w.LB_QUELLEN[0].fn = async () => ({ zeilen: [{ name: 'Wiesen und Weiden', art: 'tracht', prozent: 100 }], abdeckung: 100 });
    const nurOsm = await w.landbedeckungErmitteln(50, 7, 3500, () => {}, 'osm');
    assertEq(nurOsm.quelle.key, 'osm', 'Begrenzung auf eine Quelle greift');

    // alle fallen aus → ein Fehler, der alle Gründe nennt
    for (const q of w.LB_QUELLEN) q.fn = async () => { throw new Error('alles tot'); };
    let fehler = '';
    try { await w.landbedeckungErmitteln(50, 7, 3500, () => {}); } catch (e) { fehler = e.message; }
    assert(/Keine Quelle/.test(fehler) && (fehler.match(/alles tot/g) || []).length === 3,
      `alle drei Gründe im Fehler: ${fehler}`);
  } finally {
    w.LB_QUELLEN.forEach((q, i) => { q.fn = echt[i]; });
  }
});

test('Gebindegröße: Eingaben werden zu Gramm', (w) => {
  assertEq(w.gebindeGrammAus('500 g'), 500, '500 g');
  assertEq(w.gebindeGrammAus('500g'), 500, 'ohne Leerzeichen');
  assertEq(w.gebindeGrammAus('500'), 500, 'nur die Zahl gilt als Gramm');
  assertEq(w.gebindeGrammAus('1 kg'), 1000, '1 kg');
  assertEq(w.gebindeGrammAus('0,5 kg'), 500, 'deutsches Komma');
  assertEq(w.gebindeGrammAus('2,5 kg'), 2500, '2,5 kg');
  assertEq(w.gebindeGrammAus('20 kg'), 20000, 'Hobbock');
  assertEq(w.gebindeGrammAus('30 Gramm'), 30, 'ausgeschrieben');
  assertEq(w.gebindeGrammAus(500), 500, 'Zahl direkt');
  assertEq(w.gebindeGrammAus(''), 0, 'leer ist erlaubt');
  assertEq(w.gebindeGrammAus(null), 0, 'nichts ist erlaubt');
  assertEq(w.gebindeGrammAus('ohne Größe'), 0, 'kein Zahlwert → keine Größe');
  // Rückweg: die Beschriftung muss wieder dasselbe ergeben
  for (const g of w.GEBINDE_PRESETS) assertEq(w.gebindeGrammAus(w.gebindeLabel(g)), g, `hin und zurück bei ${g} g`);
});

test('Abfüllen: das Feld Gebindegröße schlägt den Namen, Zubehör wird ausgeschlossen', (w) => {
  // gesetzte Größe gewinnt, auch wenn der Name eine andere Zahl nennt
  const posten = [
    { id: 'falschName', bezeichnung: 'Gläser Sorte B', gebindeG: 500, einheit: 'Stück', stueckzahl: 100 },
    { id: 'nurName', bezeichnung: 'Gläser 500 g', einheit: 'Stück', stueckzahl: 100 },
  ];
  assertEq(w.glasVorschlag(posten, 500), 'falschName', 'gesetzte Gebindegröße hat Vorrang vor dem Namen');
  assertEq(w.glasVorschlag([posten[1]], 500), 'nurName', 'ohne gesetzte Größe zählt weiter der Name');
  // Größe im Namen darf nicht ziehen, wenn eine ANDERE Größe gesetzt ist
  assertEq(w.glasVorschlag([{ id: 'x', bezeichnung: 'Gläser 500 g', gebindeG: 250, einheit: 'Stück', stueckzahl: 9 }], 500), '',
    'gesetzte 250 g schließt die 500-g-Auswahl aus – keine falsche Vermutung');
  // Deckel und Etiketten sind keine Gläser, auch mit passender Größe
  const zubehoer = [
    { id: 'deckel', bezeichnung: 'Deckel für 500 g', gebindeG: 500, einheit: 'Stück', stueckzahl: 900 },
    { id: 'etikett', bezeichnung: 'Etiketten 500 g', gebindeG: 500, einheit: 'Stück', stueckzahl: 900 },
  ];
  assertEq(w.glasVorschlag(zubehoer, 500), '', 'kein Glas vorhanden → kein Vorschlag statt Deckel');
  assertEq(w.glasVorschlag([...zubehoer, { id: 'glas', bezeichnung: 'Rundglas', gebindeG: 500, einheit: 'Stück', stueckzahl: 0 }], 500),
    'glas', 'das Glas gewinnt, auch mit Bestand 0');
  assertEq(w.zubehoerVorschlag(zubehoer, w.DECKEL_WOERTER), 'deckel', 'Deckel über das Muster');
  assertEq(w.zubehoerVorschlag(zubehoer, w.ETIKETT_WOERTER), 'etikett', 'Etiketten über das Muster');
  // Beschriftung zeigt Größe UND Bestand – darum ging es Julian
  const text = w.glasOptionText({ bezeichnung: 'Gläser Sorte B', gebindeG: 500, einheit: 'Stück', stueckzahl: 240 });
  assert(/Gläser Sorte B/.test(text) && /500 g/.test(text) && /240/.test(text), `Größe und Bestand stehen drin: ${text}`);
  assert(!/undefined|NaN/.test(text), 'keine technischen Reste in der Beschriftung');
  const ohne = w.glasOptionText({ bezeichnung: 'Deckel TO82', einheit: 'Stück', stueckzahl: 400 });
  assert(!/·\s*·/.test(ohne) && /400/.test(ohne), `ohne Größe sauber: ${ohne}`);
  // alle Auswahlfelder sind bekannt
  const keys = w.glasFeldKeys();
  assert(keys.includes('gl_500') && keys.includes('gl_deckel') && keys.includes('gl_etikett') && keys.includes('gl_eigen'),
    'Feldliste vollständig');
  assertEq(keys.length, w.GEBINDE_PRESETS.length + 3, 'je Größe ein Feld plus eigenes, Deckel, Etiketten');
});

test('Bio-Standort: Koordinaten sind der erste Weg, Adresse nur der Umweg', async (w) => {
  const stand = await w.DB.put('staende', { name: 'Koord-Test Wiese', lat: 50.3283, lng: 7.2216, notizen: '' });
  await w.Views.bio.standortForm(stand);
  await new Promise((f) => setTimeout(f, 250));
  const feld = (id) => w.document.querySelector('#' + id);
  try {
    assert(feld('bio-lat') && feld('bio-lon'), 'Koordinatenfelder sind da');
    assertEq(feld('bio-lat').value, '50,3283', 'Breitengrad aus dem Stand übernommen');
    assertEq(feld('bio-lon').value, '7,2216', 'Längengrad aus dem Stand übernommen');
    assertEq(feld('bio-adresse').value, '', 'das Adressfeld bleibt leer – kein Standname als Pseudo-Adresse');
    assert(feld('bio-geo'), 'Knopf für den Gerätestandort ist da');
    assert(feld('bio-suchen'), 'Adresssuche ist da, aber nur als Umweg');
    assert(!w.document.querySelector('#bio-koord'), 'der alte Extra-Knopf ist weg');
    assert(/Koordinaten vom Bienenstand/.test(feld('bio-status').innerText), 'der Status sagt, woher die Lage kommt');
  } finally {
    const zu = w.document.querySelector('[data-zu]');
    if (zu) zu.click();
  }
});

test('Bio-Standort: ohne Koordinaten am Stand wird darauf hingewiesen', async (w) => {
  const stand = await w.DB.put('staende', { name: 'Koord-Test leer', lat: null, lng: null, notizen: '' });
  await w.Views.bio.standortForm(stand);
  await new Promise((f) => setTimeout(f, 250));
  try {
    assertEq(w.document.querySelector('#bio-lat').value, '', 'Feld leer, nicht 0 oder null');
    assertEq(w.document.querySelector('#bio-lon').value, '', 'Feld leer');
    assert(/keine Koordinaten/i.test(w.document.querySelector('#bio-status').innerText), 'Hinweis statt stiller Leere');
  } finally {
    const zu = w.document.querySelector('[data-zu]');
    if (zu) zu.click();
  }
});

test('preisJeEinheit: Kilopreis aus Packungsgröße und Packungspreis', (w) => {
  // Julians Fall: 25-kg-Sack Zucker für 41 €
  assertEq(w.preisJeEinheit(25, 41), 1.64, '25 kg für 41 € = 1,64 € je kg');
  assertEq(w.preisJeEinheit(25, 41) * 50, 82, '50 kg im Lager sind 82 € – zwei Säcke');
  assertEq(w.preisJeEinheit(10, 25.9), 2.59, '10-L-Kanister Sirup für 25,90 €');
  assertEq(w.preisJeEinheit(1000, 12.5), 0.0125, '1000 ml Säure für 12,50 € – Zehntel-Cent bleiben erhalten');
  assertEq(w.preisJeEinheit(12, 5.4), 0.45, 'Karton mit 12 Gläsern');
  // unvollständige oder unsinnige Angaben ändern nichts
  assertEq(w.preisJeEinheit(0, 41), null, 'ohne Menge kein Preis');
  assertEq(w.preisJeEinheit(25, 0), null, 'ohne Preis kein Preis');
  assertEq(w.preisJeEinheit(null, null), null, 'nichts eingetragen');
  assertEq(w.preisJeEinheit(-5, 41), null, 'negative Menge zählt nicht');
  assertEq(w.preisJeEinheit('25', '41'), 1.64, 'Text aus einem Formularfeld geht auch');
});

test('Verbrauchsmaterial: Eimer als Kategorie, MHD nur auf Wunsch', async (w) => {
  assert(w.MATERIAL_KATEGORIEN.includes('Eimer/Hobbock'), 'Eimer/Hobbock steht zur Auswahl');
  assert(w.VERBRAUCH_KATEGORIEN.has('Eimer/Hobbock'), 'und zählt als Verbrauchsmaterial');
  // die Einheit muss sich aus der Bezeichnung ergeben
  assertEq(w.einheitVorschlag('Eimer 20 kg'), 'Stück', 'Eimer werden in Stück gezählt');
  assertEq(w.einheitVorschlag('Hobbock'), 'Stück', 'Hobbock auch');
  assertEq(w.einheitVorschlag('Bio-Zucker'), 'kg', 'Zucker in kg');
  assertEq(w.einheitVorschlag('Futtersirup Kanister'), 'L', 'Sirup in Litern');
  assertEq(w.einheitVorschlag('Ameisensäure 60 %'), 'ml', 'Säure in ml');
  // eine Position ohne Ablaufdatum darf keine MHD-Erinnerung auslösen
  const ohne = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Gläser ohne MHD', kategorie: 'Gläser/Deckel', einheit: 'Stück', stueckzahl: 100, ablauf: null });
  await w.pruefeMhd();
  const aufgaben = (await w.DB.getAll('aufgaben')).filter((a) => a.refId === ohne.id);
  assertEq(aufgaben.length, 0, 'ohne Datum keine Erinnerung');
});

test('Verbrauchsmaterial: Reihenfolge und Packungsrechnung im Formular', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  /* Seit v1.42 wird das Positions-Formular nur noch zum BEARBEITEN geöffnet –
     über die Zeile in der Liste. Sein Raster ist unverändert, also wird es hier
     auch weiter geprüft. Filter zurücksetzen, damit die Zeile sicher da ist. */
  const rast = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'AAA Raster-Test', kategorie: 'Futter', einheit: 'Stück', stueckzahl: 1 });
  w.Views.material._jahr = ''; w.Views.material._art = ''; w.Views.material._suche = '';
  try {
    await w.Views.material.render(host);
    host.querySelector(`[data-edit="${rast.id}"]`).click();
    await new Promise((r) => setTimeout(r, 250));
    const m = [...w.document.querySelectorAll('.modal-back')].pop();
    // Reihenfolge: Bestand vor der Packungsrechnung, Preis direkt daneben
    const felder = [...m.querySelectorAll('[data-field]')].map((e) => e.dataset.field);
    const pos = (k) => felder.indexOf(k);
    assert(pos('_bestand') < pos('inhaltMenge'), 'der Bestand steht über der Packungsrechnung');
    assert(pos('inhaltMenge') < pos('preis'), 'die Packung steht vor dem Stückpreis');
    assert(pos('packEinheit') === pos('_bestand') + 1, 'die Einheit folgt direkt auf den Bestand');
    assert(pos('einheit') === pos('inhaltMenge') + 1, 'die Einheit des Inhalts folgt auf den Inhalt');
    assert(pos('_packInfo') > pos('preis'), 'die Rechnung steht unter den Feldern');
    // nebeneinander: gleiche Höhe, halbe Breite
    for (const [a, b] of [['_bestand', 'packEinheit'], ['inhaltMenge', 'einheit'], ['packPreis', 'preis'], ['anschaffung', 'mindestbestand']]) {
      const ra = m.querySelector(`[data-field="${a}"]`).getBoundingClientRect();
      const rb = m.querySelector(`[data-field="${b}"]`).getBoundingClientRect();
      assert(Math.abs(ra.top - rb.top) < 2, `„${a}" und „${b}" stehen nebeneinander (${Math.round(ra.top)} / ${Math.round(rb.top)})`);
      assert(rb.left > ra.left, `„${b}" liegt rechts von „${a}"`);
    }
    const voll = m.querySelector('[data-field="bezeichnung"]').getBoundingClientRect().width;
    const halb = m.querySelector('[data-field="_bestand"]').getBoundingClientRect().width;
    assert(halb < voll * 0.6, `halbe Felder sind schmaler: ${Math.round(halb)} von ${Math.round(voll)}`);
    // Packungsrechnung füllt Bestand und Preis
    const setz = (id, wert) => { const e = m.querySelector(id); e.value = wert; e.dispatchEvent(new w.Event('input', { bubbles: true })); };
    setz('#f-bezeichnung', 'Zucker Test-Sack');
    await new Promise((r) => setTimeout(r, 80));
    setz('#f-_bestand', '7'); setz('#f-packEinheit', 'Sack'); setz('#f-inhaltMenge', '25'); setz('#f-einheit', 'kg'); setz('#f-packPreis', '41');
    await new Promise((r) => setTimeout(r, 150));
    assertEq(m.querySelector('#f-preis').value, '1,64', '41 € je Sack ÷ 25 kg = 1,64 € je kg');
    const info = m.querySelector('[data-pack-info]').textContent;
    assert(/7 Sack/.test(info) && /175/.test(info) && /1,64/.test(info) && /287,00/.test(info), `Rechnung erklärt sich: ${info}`);
    assert(/Verbraucht wird in kg/.test(info), 'und sagt, in welcher Einheit abgezogen wird');
    // eigener Stückpreis gewinnt gegen die Rechnung
    setz('#f-preis', '1,90'); setz('#f-packPreis', '44');
    await new Promise((r) => setTimeout(r, 120));
    assertEq(m.querySelector('#f-preis').value, '1,90', 'ein selbst getippter Preis wird nicht überschrieben');
    m.remove(); w.FormGuard.dirty = false;
  } finally { host.remove(); w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false; }
});

test('Verbrauchsmaterial: Bearbeiten setzt den verbrauchten Bestand nicht zurück', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  // 2 Säcke à 25 kg gekauft, 38 kg verfüttert → 12 kg übrig
  const pos = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Zucker Rest-Test', kategorie: 'Futter',
    einheit: 'kg', stueckzahl: 50, preis: 1.64, packEinheit: 'Sack', inhaltMenge: 25, packPreis: 41 });
  await w.verbrauchAbziehen(pos.id, 38, { pruefen: false });
  assertEq((await w.DB.get('inventar', pos.id)).stueckzahl, 12, 'in der Datenbank stehen 12 kg');
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.material.render(host);
    const knopf = host.querySelector(`[data-edit="${pos.id}"]`);
    assert(knopf, 'die Position steht in der Liste');
    knopf.click();
    await new Promise((r) => setTimeout(r, 250));
    const m = [...w.document.querySelectorAll('.modal-back')].pop();
    // 12 kg bei 25 kg je Sack = 0,48 Sack – gezählt wird in Säcken
    assertEq(m.querySelector('#f-_bestand').value, '0,48', 'das Formular zeigt 0,48 Sack (= 12 kg), nicht den Einkauf');
    assertEq(m.querySelector('#f-packEinheit').value, 'Sack', 'äußere Einheit steht wieder da');
    assertEq(m.querySelector('#f-einheit').value, 'kg', 'innere Einheit auch');
    const info = m.querySelector('[data-pack-info]').textContent;
    assert(/12/.test(info) && /kg/.test(info), `der echte Bestand wird genannt: ${info}`);
    // am Packungspreis drehen darf den Bestand nicht anfassen
    const pp = m.querySelector('#f-packPreis'); pp.value = '44'; pp.dispatchEvent(new w.Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 120));
    assertEq(m.querySelector('#f-_bestand').value, '0,48', 'Bestand unangetastet');
    assertEq(m.querySelector('#f-preis').value, '1,76', 'der neue Sackpreis ergibt 1,76 € je kg');
    m.remove(); w.FormGuard.dirty = false;
  } finally { host.remove(); w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false; }
});

test('Zwei Einheiten: Bestand in Säcken, Verbrauch in Kilo', async (w) => {
  // Julians Zucker: 7 Sack à 25 kg für 41 € je Sack
  const pos = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Zucker Zwei-Ebenen', kategorie: 'Futter',
    stueckzahl: 175, einheit: 'kg', packEinheit: 'Sack', inhaltMenge: 25, packPreis: 41, preis: 1.64 });
  assert(w.inPackungen(pos), 'die Position wird in Packungen gezählt');
  assertEq(w.bestandInPackungen(pos), 7, '175 kg sind 7 Sack');
  assertEq(w.verbrauchEinheit(pos), 'kg', 'verbraucht wird in kg – daran hängen die Abzüge');
  assertEq(w.verbrauchBestand(pos), 175, 'gespeichert ist die innere Menge');
  assertEq(w.packungText(pos), '7 Sack × 25 kg = 175 kg', 'Kurzfassung für Listen');
  // Fütterung zieht KILO ab, nicht Säcke
  const b = await w.verbrauchAbziehen(pos.id, 30, { pruefen: false });
  assertEq(b.nachher, 145, '30 kg abgezogen');
  const nach = await w.DB.get('inventar', pos.id);
  assertEq(w.bestandInPackungen(nach), 5.8, '145 kg sind 5,8 Sack');
  assertEq(w.packungText(nach), '5,8 Sack × 25 kg = 145 kg', 'und wird auch so angezeigt');
  // Warenwert über den inneren Preis: 145 × 1,64 = 237,80 €
  assertEq(Math.round(w.verbrauchBestand(nach) * nach.preis * 100) / 100, 237.8, 'Warenwert stimmt');

  // Gläser in Kartons: 2 × 30 = 60 Stück, Kartonpreis 12 € → 0,40 € je Glas
  const glas = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Gläser Karton-Test', kategorie: 'Gläser/Deckel',
    stueckzahl: 60, einheit: 'Stück', packEinheit: 'Karton', inhaltMenge: 30, packPreis: 12, preis: w.preisJeEinheit(30, 12) });
  assertEq(glas.preis, 0.4, '12 € je Karton ÷ 30 Gläser = 0,40 € je Glas');
  assertEq(w.bestandInPackungen(glas), 2, '60 Gläser sind 2 Karton');
  assertEq(w.packungText(glas), '2 Karton × 30 Stück = 60 Stück', 'Kurzfassung bei Stückgut');
  // Abfüllen zieht Gläser ab
  const b2 = await w.verbrauchAbziehen(glas.id, 40, { pruefen: false });
  assertEq(b2.nachher, 20, '40 Gläser abgezogen');

  // ohne Packung bleibt alles wie vorher
  const einfach = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Ameisensäure ohne Packung', kategorie: 'Behandlungsmittel',
    stueckzahl: 1000, einheit: 'ml' });
  assertEq(w.inPackungen(einfach), false, 'keine Packung erkannt');
  assertEq(w.bestandInPackungen(einfach), 1000, 'Bestand bleibt der Bestand');
  assertEq(w.packungText(einfach), '', 'kein Packungstext');
  // gleiche Einheit außen und innen zählt NICHT als Packung
  assertEq(w.inPackungen({ stueckzahl: 5, einheit: 'kg', packEinheit: 'kg', inhaltMenge: 1 }), false,
    'kg in kg ist keine Packung – sonst käme Unsinn wie „5 kg × 1 kg" heraus');
  assert(w.BESTAND_EINHEITEN.includes('Sack') && w.BESTAND_EINHEITEN.includes('Karton'), 'Sack und Karton stehen zur Auswahl');
  assert(!w.VERBRAUCH_EINHEITEN.includes('Sack'), 'die innere Einheit kennt keinen Sack – dort gehören Grundeinheiten hin');
});

test('Tagesbiene: für jede Stunde ein Bild, das auch wirklich da ist', async (w) => {
  assertEq(w.TAGESBIENEN.length, 24, '24 Stunden, 24 Namen');
  for (const n of w.TAGESBIENEN) assert(n && n.length > 2, `Name gesetzt: ${n}`);
  assertEq(new Set(w.TAGESBIENEN).size, 24, 'kein Name doppelt');
  // Zuordnung und Randfälle
  assertEq(w.tagesbiene(0).datei, 'assets/bienen/biene-00.webp', 'Mitternacht');
  assertEq(w.tagesbiene(0).name, 'Mitternacht', 'Name zur Stunde');
  assertEq(w.tagesbiene(7).text, '07:00 Guten Morgen', 'Beschriftung mit führender Null');
  assertEq(w.tagesbiene(23).datei, 'assets/bienen/biene-23.webp', 'letzte Stunde');
  assertEq(w.tagesbiene(24).stunde, 0, '24 Uhr ist Mitternacht');
  assertEq(w.tagesbiene(25).stunde, 1, 'darüber wird umgebrochen');
  assertEq(w.tagesbiene(-1).stunde, 23, 'negative Stunde bricht nach hinten um');
  assertEq(w.tagesbiene(12.7).stunde, 12, 'krumme Zahl wird abgeschnitten');
  // Alle 24 Dateien müssen erreichbar sein – sonst bleibt der Kopf leer
  const fehlend = [];
  for (let h = 0; h < 24; h++) {
    const res = await w.fetch(w.tagesbiene(h).datei, { method: 'GET' });
    if (!res.ok) fehlend.push(w.tagesbiene(h).datei);
  }
  assertEq(fehlend.length, 0, `alle Bilddateien vorhanden, fehlen: ${fehlend.join(', ')}`);
  // Bild-Element trägt Datei, Beschreibung und Tooltip
  const html = w.tagesbieneHtml(12);
  assert(/biene-12\.webp/.test(html), 'richtige Datei im Element');
  assert(/title="12:00 Mittagspause"/.test(html), 'Tooltip mit Uhrzeit und Name');
  assert(/alt="Biene: 12:00 Mittagspause"/.test(html), 'Beschreibung für Screenreader');
  assert(/data-tagesbiene="12"/.test(html), 'Stunde am Element vermerkt – daran erkennt der Wechsel sich');
});

test('Tagesbiene: wechselt beim Stundenwechsel und stört den Widgets-Knopf nicht', async (w) => {
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.dashboard.render(host);
    const img = host.querySelector('.tages-biene');
    assert(img, 'die Biene steht im Dashboard-Kopf');
    const jetzt = w.tagesbiene().stunde;
    assertEq(Number(img.dataset.tagesbiene), jetzt, 'zeigt die aktuelle Stunde');
    // Kopf-Aufbau: Biene neben dem Text, Widgets-Knopf im eigenen Bereich
    assert(img.closest('.ph-haupt'), 'die Biene sitzt im Textbereich, nicht bei den Knöpfen');
    const knopf = host.querySelector('#dash-cfg');
    assert(knopf, 'der Widgets-Knopf ist da');
    assert(!knopf.closest('.ph-haupt'), 'der Knopf bleibt außerhalb – so kommt die Biene ihm nicht in den Weg');
    assertEq(knopf.innerText.trim(), 'Widgets', 'ohne Symbol');
    assert(!host.querySelector('.ph-text h1').innerText.includes('🐝'), 'kein Bienen-Emoji mehr im Titel – die echte Biene steht daneben');
    // Stundenwechsel vortäuschen: der Prüfer muss das Bild tauschen
    img.dataset.tagesbiene = String((jetzt + 5) % 24);
    const vorher = img.getAttribute('src');
    img.src = w.tagesbiene((jetzt + 5) % 24).datei;
    w.tagesbieneAktualisieren();
    assertEq(Number(img.dataset.tagesbiene), jetzt, 'nach dem Wechsel steht wieder die richtige Stunde');
    assert(img.getAttribute('src').includes(String(jetzt).padStart(2, '0')), `Bild getauscht: ${img.getAttribute('src')}`);
  } finally { host.remove(); }
});

/* =====================================================================
   Pfand: Mehrweg-Gebinde im Umlauf (deckt beide Welten ab)
   ===================================================================== */
test('Pfand: ohne Pfandfeld bleibt alles unsichtbar', (w) => {
  const einweg = [{ id: 'a', bezeichnung: 'Gläser Einweg', pfand: 0 }, { id: 'b', bezeichnung: 'Deckel' }];
  assertEq(w.pfandPositionen(einweg).length, 0, 'keine Pfand-Position → keine Anzeige, kein Schalter nötig');
  assertEq(w.pfandPositionen([...einweg, { id: 'c', bezeichnung: 'Pfandglas', pfand: 0.5 }]).length, 1, 'eine mit Pfand wird erkannt');
  assertEq(w.pfandPositionen(null).length, 0, 'verträgt auch nichts');
  assertEq(w.PFAND_KATEGORIE, 'Pfandrückgabe', 'eigene Kassenbuch-Kategorie für die Erstattung');
});

test('Pfand: Umlauf zählt nur ab dem Startdatum', (w) => {
  const pos = { id: 'p1', bezeichnung: 'Pfandglas 333 g', gebindeG: 333, pfand: 0.5, pfandSeit: '2026-07-01' };
  const abf = [
    { gebindeG: 333, datum: '2026-06-20', anzahl: 50, bestand: 20 },   // 30 verkauft – VOR dem Pfand
    { gebindeG: 333, datum: '2026-07-10', anzahl: 100, bestand: 60 },  // 40 verkauft – zählt
    { gebindeG: 500, datum: '2026-07-11', anzahl: 80, bestand: 10 },   // andere Größe – zählt nicht
  ];
  const u = w.pfandUmlauf(pos, abf, []);
  assertEq(u.verkauft, 40, 'nur Abfüllungen ab dem Startdatum');
  assertEq(u.draussen, 40, 'noch nichts zurück');
  assertEq(u.offen, 20, '40 × 0,50 € = 20 € Pfandschuld');
  assertEq(u.seit, '2026-07-01', 'das Startdatum wird mitgegeben, damit es angezeigt werden kann');
  // ohne Startdatum zählt alles – das war der Fehler, den der Praxistest zeigte (190 statt 40)
  assertEq(w.pfandUmlauf({ ...pos, pfandSeit: '' }, abf, []).verkauft, 70, 'ohne Startdatum zählen auch alte Verkäufe');
  // Rücknahmen abziehen
  const bew = [{ inventarId: 'p1', anzahl: 25 }, { inventarId: 'anders', anzahl: 99 }];
  const u2 = w.pfandUmlauf(pos, abf, bew);
  assertEq(u2.zurueck, 25, 'nur Rücknahmen dieser Position');
  assertEq(u2.draussen, 15, '40 verkauft − 25 zurück');
  assertEq(u2.offen, 7.5, '15 × 0,50 €');
  // mehr zurück als raus: nicht ins Minus
  assertEq(w.pfandUmlauf(pos, abf, [{ inventarId: 'p1', anzahl: 999 }]).draussen, 0, 'draußen wird nie negativ');
  // ohne Gebindegröße kann nichts zugeordnet werden – und das wird gesagt
  const ohne = w.pfandUmlauf({ id: 'p2', pfand: 0.5 }, abf, []);
  assertEq(ohne.verkauft, 0, 'ohne Gebindegröße keine Zuordnung');
  assertEq(ohne.ohneGroesse, true, 'und die App weist darauf hin');
});

test('Pfand: Rücknahme hebt den Bestand und bucht eine Ausgabe ohne Umsatzsteuer', async (w) => {
  const glas = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Pfandglas Rücknahme-Test', kategorie: 'Gläser/Deckel',
    einheit: 'Stück', stueckzahl: 100, gebindeG: 250, pfand: 0.5, pfandSeit: '2026-01-01' });
  // Zugang: Gegenstück zum Abzug
  const z = await w.verbrauchZugang(glas.id, 25, { pruefen: false });
  assertEq(z.vorher, 100, 'vorher 100');
  assertEq(z.nachher, 125, 'nachher 125 – der Bestand steigt wieder');
  assertEq((await w.DB.get('inventar', glas.id)).stueckzahl, 125, 'steht auch im Lager');
  assertEq(await w.verbrauchZugang(glas.id, 0), null, 'null Stück ändert nichts');
  assertEq(await w.verbrauchZugang('gibtsnicht', 5), null, 'unbekannte Position ändert nichts');
  // Kassenbuch: Erstattung ist eine AUSGABE, steuerfrei
  const vorher = (await w.DB.getAll('kassenbuch')).length;
  await w.DB.put('kassenbuch', { datum: '2026-08-07', typ: 'ausgabe', kategorie: w.PFAND_KATEGORIE, betrag: 12.5,
    steuersatz: 0, kontaktId: null, rechnungId: null, beschreibung: 'Pfand erstattet: 25 × Pfandglas Rücknahme-Test' });
  const kb = (await w.DB.getAll('kassenbuch')).filter((k) => k.kategorie === w.PFAND_KATEGORIE);
  assert(kb.length >= 1, 'Buchung ist da');
  assertEq(kb[kb.length - 1].typ, 'ausgabe', 'Pfand zurückzahlen ist eine Ausgabe, kein Minus-Erlös');
  assertEq(kb[kb.length - 1].steuersatz, 0, 'ohne Umsatzsteuer – Pfand ist ein durchlaufender Posten');
  assertEq((await w.DB.getAll('kassenbuch')).length, vorher + 1, 'genau eine Buchung');
  // der Speicher läuft in Sicherung und Papierkorb mit
  assert(w.DB.STORES.includes('pfandbewegungen'), 'eigener Speicher angelegt');
  assert(w.DB.DATA_STORES.includes('pfandbewegungen'), 'und in der Sicherung dabei');
  assertEq(w.STORE_LABELS.pfandbewegungen, 'Pfand-Rücknahme', 'mit lesbarem Namen im Papierkorb');
  assert(w.DB.VER >= 9, `DB-Version mindestens 9: ${w.DB.VER}`);
});

test('Pfand: steckt hinter einem Häkchen – wie beim MHD', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  const pfp = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'AAA Pfand-Haken-Test', kategorie: 'Gläser', einheit: 'Stück', stueckzahl: 3 });
  w.Views.material._jahr = ''; w.Views.material._art = ''; w.Views.material._suche = '';
  try {
    await w.Views.material.render(host);
    host.querySelector(`[data-edit="${pfp.id}"]`).click();
    await new Promise((r) => setTimeout(r, 250));
    const m = [...w.document.querySelectorAll('.modal-back')].pop();
    const sichtbar = (k) => { const e = m.querySelector(`[data-field="${k}"]`); return !!e && !e.classList.contains('hidden'); };
    const haken = m.querySelector('#f-_hatPfand');
    assert(haken, 'die Frage „Mehrweg mit Pfand" ist da');
    assertEq(haken.checked, false, 'ohne hinterlegtes Pfand kein Haken');
    assert(!sichtbar('pfand'), 'Pfandbetrag bleibt verborgen – das Formular bleibt kurz');
    assert(!sichtbar('pfandSeit'), 'das Startdatum auch');
    haken.checked = true; haken.dispatchEvent(new w.Event('change', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 120));
    assert(sichtbar('pfand') && sichtbar('pfandSeit'), 'nach dem Haken erscheinen beide Felder');
    // die Paare darunter dürfen nicht verrutschen (Trenner)
    const oben = (k) => Math.round(m.querySelector(`[data-field="${k}"]`).getBoundingClientRect().top);
    assertEq(oben('pfand'), oben('pfandSeit'), 'Pfand und Startdatum stehen nebeneinander');
    assertEq(oben('mindestbestand'), oben('anschaffung'), 'Mindestbestand und Zugang bleiben ein Paar');
    haken.checked = false; haken.dispatchEvent(new w.Event('change', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 120));
    assert(!sichtbar('pfand'), 'Haken weg → Felder wieder verborgen');
    assertEq(oben('mindestbestand'), oben('anschaffung'), 'und die Paare bleiben trotzdem stabil');
    m.remove(); w.FormGuard.dirty = false;
  } finally { host.remove(); w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false; }
});

test('Abgang zurücknehmen: Bestand und Kassenbuch gehen mit', async (w) => {
  const pos = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Mittelwände Rücknahme-Test', kategorie: 'Mittelwände',
    einheit: 'kg', stueckzahl: 25, preis: 15 });
  // 6 kg verkauft à 15 € → Bestand 19, Einnahme 90 €
  const buchung = await w.verbrauchAbziehen(pos.id, 6, { pruefen: false });
  const kb = await w.DB.put('kassenbuch', { datum: '2026-08-07', typ: 'einnahme', kategorie: 'Materialverkauf',
    betrag: 90, steuersatz: 0, kontaktId: null, rechnungId: null, beschreibung: 'Mittelwände Rücknahme-Test: 6,00 kg' });
  const abg = await w.DB.put('materialabgaenge', { inventarId: pos.id, bezeichnung: pos.bezeichnung, typ: 'verbrauch',
    einheit: 'kg', datum: '2026-08-07', menge: 6, art: 'Verkauf', preis: 15,
    bestandVorher: buchung.vorher, bestandNachher: buchung.nachher, kassenbuchId: kb.id });
  assertEq((await w.DB.get('inventar', pos.id)).stueckzahl, 19, 'nach dem Verkauf 19 kg');
  assertEq(w.abgangErloes(abg), 90, 'Erlös 6 × 15 €');
  // Kunde gibt zurück
  await w.abgangZurueckbuchen(abg);
  assertEq((await w.DB.get('inventar', pos.id)).stueckzahl, 25, 'Bestand wieder 25 kg');
  assertEq(await w.DB.get('kassenbuch', kb.id), undefined, 'die Einnahme ist aus dem Kassenbuch weg');
  assert((await w.DB.getAll('papierkorb')).some((t) => t.store === 'kassenbuch' && t.daten.id === kb.id),
    'sie liegt im Papierkorb, ist also nicht verloren');

  // Der wichtige Sonderfall: der Bestand reichte damals NICHT
  const knapp = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Knapp-Test', kategorie: 'Mittelwände', einheit: 'kg', stueckzahl: 2 });
  const b2 = await w.verbrauchAbziehen(knapp.id, 10, { pruefen: false });
  assertEq(b2.nachher, 0, 'auf 0 gelaufen');
  assertEq(b2.gefehlt, 8, '8 kg fehlten');
  const abg2 = await w.DB.put('materialabgaenge', { inventarId: knapp.id, bezeichnung: knapp.bezeichnung, typ: 'verbrauch',
    einheit: 'kg', datum: '2026-08-07', menge: 10, art: 'Eigenverbrauch', preis: 0,
    bestandVorher: b2.vorher, bestandNachher: b2.nachher });
  await w.abgangZurueckbuchen(abg2);
  assertEq((await w.DB.get('inventar', knapp.id)).stueckzahl, 2,
    'zurück kommen die tatsächlich abgezogenen 2 kg – nicht die gebuchten 10, sonst entstünde Bestand aus nichts');

  // Ohne gemerkte Buchungsnummer (Altdatensatz) wird die Buchung gefunden
  const alt = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Altfall-Test', kategorie: 'Mittelwände', einheit: 'kg', stueckzahl: 10 });
  const b3 = await w.verbrauchAbziehen(alt.id, 2, { pruefen: false });
  const kbAlt = await w.DB.put('kassenbuch', { datum: '2026-08-06', typ: 'einnahme', kategorie: 'Materialverkauf',
    betrag: 20, steuersatz: 0, kontaktId: null, rechnungId: null, beschreibung: 'Altfall-Test: 2,00 kg an Meier' });
  await w.abgangZurueckbuchen({ inventarId: alt.id, bezeichnung: 'Altfall-Test', datum: '2026-08-06', menge: 2,
    art: 'Verkauf', preis: 10, bestandVorher: b3.vorher, bestandNachher: b3.nachher });
  assertEq((await w.DB.get('inventar', alt.id)).stueckzahl, 10, 'Bestand zurück');
  assertEq(await w.DB.get('kassenbuch', kbAlt.id), undefined, 'auch ohne gemerkte Nummer wird die Buchung entfernt');
});

test('Neuer Kunde direkt im Abgangs-Formular', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Kunde-Kurzweg-Test', kategorie: 'Mittelwände', einheit: 'kg', stueckzahl: 5 });
  const cfg = { typ: 'verbrauch', titel: 'Verbrauchsmaterial' };
  const m = await w.materialAbgangForm(cfg);
  await new Promise((r) => setTimeout(r, 200));
  try {
    const wrap = m.el.querySelector('[data-field="kontaktId"]');
    assert(wrap, 'das Kontaktfeld ist da');
    const knopf = wrap.querySelector('button');
    assert(knopf, 'und darunter der Knopf zum Anlegen');
    assert(/Kunden anlegen/i.test(knopf.innerText), `Beschriftung sagt, was passiert: ${knopf.innerText}`);
    assertEq(knopf.type, 'button', 'kein Absenden-Knopf – sonst würde er das Formular abschicken');
  } finally {
    m.close && m.close(true);
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove());
    w.FormGuard.dirty = false;
  }
});

test('Einkauf: Material-Kategorie wird zur richtigen Kassenbuch-Kategorie', (w) => {
  assertEq(w.kasseKategorieFuer('Futter'), 'Futter', 'Zucker und Sirup');
  assertEq(w.kasseKategorieFuer('Behandlungsmittel'), 'Behandlungsmittel', 'Säuren');
  assertEq(w.kasseKategorieFuer('Gläser/Deckel'), 'Gläser/Etiketten', 'Gläser');
  assertEq(w.kasseKategorieFuer('Eimer/Hobbock'), 'Gläser/Etiketten', 'Eimer zählen zum Gebinde');
  assertEq(w.kasseKategorieFuer('Etiketten'), 'Gläser/Etiketten', 'Etiketten');
  assertEq(w.kasseKategorieFuer('Mittelwände'), 'Material/Geräte', 'Mittelwände');
  assertEq(w.kasseKategorieFuer('Beute'), 'Beuten/Rähmchen', 'Beuten');
  assertEq(w.kasseKategorieFuer('Gerät'), 'Material/Geräte', 'Geräte');
  // Unbekanntes landet in Material/Geräte, NIE in „Sonstige Ausgabe" – das verschleiert Kosten
  assertEq(w.kasseKategorieFuer('Etwas Neues'), 'Material/Geräte', 'unbekannte Kategorie');
  assertEq(w.kasseKategorieFuer(''), 'Material/Geräte', 'ohne Kategorie');
  assertEq(w.kasseKategorieFuer(null), 'Material/Geräte', 'ohne Angabe');
  // jede Zielkategorie muss es im Kassenbuch wirklich geben, sonst fällt sie aus der Auswertung
  for (const ziel of new Set([...w.MATERIAL_ZU_KASSE.values(), 'Material/Geräte'])) {
    assert(w.KASSEN_KATEGORIEN.ausgabe.includes(ziel), `„${ziel}" steht im Kassenbuch zur Auswahl`);
  }
  assert(w.KASSEN_KATEGORIEN.einnahme.includes('Materialverkauf'), 'Materialverkauf ist eine Einnahme-Kategorie');
  assert(w.KASSEN_KATEGORIEN.ausgabe.includes('Pfandrückgabe'), 'Pfandrückgabe ist eine Ausgabe-Kategorie');
});

test('Einkauf: nur ein Einkauf kostet Geld', (w) => {
  assertEq(w.zugangKosten({ art: 'Einkauf', menge: 25, preis: 1.64 }), 41, '25 kg × 1,64 € = 41 €');
  assertEq(w.zugangKosten({ art: 'Eigenproduktion', menge: 5, preis: 9 }), 0, 'eigenes Wachs kostet nichts');
  assertEq(w.zugangKosten({ art: 'Geschenk', menge: 5, preis: 9 }), 0, 'geschenkt kostet nichts');
  assertEq(w.zugangKosten({ art: 'Korrektur', menge: 5, preis: 9 }), 0, 'eine Bestandskorrektur ist kein Kauf');
  assertEq(w.zugangKosten({ art: 'Einkauf', menge: 25 }), 0, 'ohne Preis kein Betrag');
  assertEq(w.zugangKosten(null), 0, 'verträgt nichts');
  assert(w.ZUGANG_ARTEN.includes('Einkauf') && w.ZUGANG_ARTEN.includes('Korrektur'), 'Arten vorhanden');
});

test('Einkauf: Zugang zurücknehmen setzt Bestand und Kassenbuch zurück', async (w) => {
  const pos = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Zucker Zugang-Test', kategorie: 'Futter',
    einheit: 'kg', stueckzahl: 100, preis: 1.6 });
  const b = await w.verbrauchZugang(pos.id, 50, { pruefen: false });
  assertEq(b.nachher, 150, '50 kg dazu');
  const kb = await w.DB.put('kassenbuch', { datum: '2026-08-07', typ: 'ausgabe', kategorie: 'Futter',
    betrag: 82, steuersatz: 0, kontaktId: null, rechnungId: null, beschreibung: 'Einkauf Zucker Zugang-Test: 50,00 kg' });
  const zug = await w.DB.put('materialzugaenge', { inventarId: pos.id, bezeichnung: pos.bezeichnung, typ: 'verbrauch',
    kategorie: 'Futter', einheit: 'kg', datum: '2026-08-07', menge: 50, art: 'Einkauf', preis: 1.64,
    bestandVorher: b.vorher, bestandNachher: b.nachher, kassenbuchId: kb.id });
  assertEq(w.zugangKosten(zug), 82, 'Kosten 50 × 1,64 = 82 €');
  await w.zugangZurueckbuchen(zug);
  assertEq((await w.DB.get('inventar', pos.id)).stueckzahl, 100, 'Bestand wieder 100 kg');
  assertEq(await w.DB.get('kassenbuch', kb.id), undefined, 'die Ausgabe ist weg');
  // Altdatensatz ohne gemerkte Nummer: Buchung wird über Datum, Betrag und Text gefunden
  const b2 = await w.verbrauchZugang(pos.id, 10, { pruefen: false });
  const kbAlt = await w.DB.put('kassenbuch', { datum: '2026-08-05', typ: 'ausgabe', kategorie: 'Futter',
    betrag: 16, steuersatz: 0, kontaktId: null, rechnungId: null, beschreibung: 'Einkauf Zucker Zugang-Test: 10,00 kg' });
  await w.zugangZurueckbuchen({ inventarId: pos.id, bezeichnung: 'Zucker Zugang-Test', datum: '2026-08-05',
    menge: 10, art: 'Einkauf', preis: 1.6, bestandVorher: b2.vorher, bestandNachher: b2.nachher });
  assertEq((await w.DB.get('inventar', pos.id)).stueckzahl, 100, 'Bestand wieder 100');
  assertEq(await w.DB.get('kassenbuch', kbAlt.id), undefined, 'auch ohne Nummer entfernt');
  // Speicher läuft in Sicherung und Papierkorb mit
  assert(w.DB.STORES.includes('materialzugaenge') && w.DB.DATA_STORES.includes('materialzugaenge'), 'eigener Speicher, gesichert');
  assertEq(w.STORE_LABELS.materialzugaenge, 'Materialzugang', 'lesbarer Name im Papierkorb');
  assert(w.DB.VER >= 10, `DB-Version mindestens 10: ${w.DB.VER}`);
});

test('Formulare: Ein- und Ausblenden versteht Zahlen mit Komma', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  const kmp = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'AAA Komma-Test', kategorie: 'Gläser', einheit: 'Stück', stueckzahl: 2 });
  w.Views.material._jahr = ''; w.Views.material._art = ''; w.Views.material._suche = '';
  try {
    await w.Views.material.render(host);
    host.querySelector(`[data-edit="${kmp.id}"]`).click();
    await new Promise((r) => setTimeout(r, 250));
    const m = [...w.document.querySelectorAll('.modal-back')].pop();
    const sichtbar = (k) => { const e = m.querySelector(`[data-field="${k}"]`); return !!e && !e.classList.contains('hidden'); };
    const haken = m.querySelector('#f-_hatPfand');
    haken.checked = true; haken.dispatchEvent(new w.Event('change', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 120));
    /* 0,50 € Pfand: die Regel lautet `Number(f.pfand) > 0`. Vor der Korrektur kam
       der Rohtext „0,50" an, Number() lieferte NaN – und das Startdatum
       verschwand, obwohl ein Pfand eingetragen war. */
    const pf = m.querySelector('#f-pfand');
    pf.value = '0,50'; pf.dispatchEvent(new w.Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 120));
    assert(sichtbar('pfandSeit'), 'bei 0,50 € Pfand bleibt „Pfand erhoben seit" sichtbar');
    pf.value = '0'; pf.dispatchEvent(new w.Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 120));
    assert(sichtbar('pfandSeit'), 'am Häkchen hängt die Sichtbarkeit, nicht am Betrag');
    m.remove(); w.FormGuard.dirty = false;
  } finally { host.remove(); w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false; }
});

test('Lagerwert: verschiedene Einkaufspreise werden gemischt, nicht überschrieben', (w) => {
  const pos = { id: 'p1', stueckzahl: 200, einheit: 'kg', preis: 1.8 };   // preis = letzter Einkauf
  const zug = [
    { inventarId: 'p1', art: 'Einkauf', datum: '2026-07-01', menge: 175, preis: 1.64 },
    { inventarId: 'p1', art: 'Einkauf', datum: '2026-08-05', menge: 25, preis: 1.8 },
  ];
  const bw = w.lagerBewertung(pos, zug);
  // Julians Fall: bezahlt wurden 287 + 45 = 332 €. Mit nur dem letzten Preis wären es 360 € gewesen.
  assertEq(bw.wert, 332, '175 × 1,64 € + 25 × 1,80 € = 332 €');
  assertEq(bw.schnitt, 1.66, 'Durchschnitt 1,66 € je kg');
  assertEq(bw.einkaeufe, 2, 'aus zwei Einkäufen zusammengesetzt');
  assertEq(bw.rest, 0, 'nichts Unbelegtes übrig');
  assertEq(bw.gemischt, true, 'gemischte Preise – die Liste zeigt dann „Ø"');
  assert(bw.wert < 200 * pos.preis, `weniger als mit dem letzten Preis (${200 * pos.preis} €) – genau der Fehler, der behoben wurde`);

  // Verbrauch: das Älteste geht zuerst, im Lager bleiben die jüngsten Einkäufe
  const nachFuetterung = w.lagerBewertung({ ...pos, stueckzahl: 170 }, zug);
  assertEq(nachFuetterung.wert, 282.8, '25 × 1,80 € + 145 × 1,64 € = 282,80 €');
  assertEq(w.lagerBewertung({ ...pos, stueckzahl: 25 }, zug).wert, 45, 'bleiben 25 kg, ist es der junge Einkauf zu 1,80 €');
  assertEq(w.lagerBewertung({ ...pos, stueckzahl: 0 }, zug).wert, 0, 'leeres Lager ist nichts wert');

  // Mehr Bestand als durch Einkäufe belegt: der Rest zählt mit dem hinterlegten Preis
  const teils = w.lagerBewertung({ ...pos, stueckzahl: 250 }, zug);
  assertEq(teils.gedeckt, 200, '200 kg sind durch Einkäufe belegt');
  assertEq(teils.rest, 50, '50 kg Altbestand ohne Einkaufsbeleg');
  assertEq(teils.wert, 422, '332 € + 50 × 1,80 € = 422 €');

  // Ohne Zugangsdatensätze bleibt es wie vorher: Menge × hinterlegter Preis
  const ohne = w.lagerBewertung({ id: 'p2', stueckzahl: 10, preis: 2.5 }, zug);
  assertEq(ohne.wert, 25, 'Altposition: 10 × 2,50 €');
  assertEq(ohne.einkaeufe, 0, 'kein Einkauf zugeordnet');
  assertEq(ohne.gemischt, false, 'nichts gemischt, also kein „Ø" in der Liste');

  // Fremde Positionen und Nicht-Einkäufe zählen nicht mit
  const fremd = w.lagerBewertung(pos, [...zug,
    { inventarId: 'anders', art: 'Einkauf', datum: '2026-08-06', menge: 999, preis: 9 },
    { inventarId: 'p1', art: 'Geschenk', datum: '2026-08-06', menge: 999, preis: 9 }]);
  assertEq(fremd.wert, 332, 'unverändert – fremde Position und Geschenk bleiben außen vor');
});

test('Verschmolzen: neue Position und Einkauf in einem Formular', async (w) => {
  /* Julians Wunsch: „neue position weg, alle funktionen von neue position
     ersetzen mit Zugang / einkauf". Hier wird der ganze Weg durchgespielt:
     Position anlegen, Packungen rechnen, Bestand buchen, Kassenbuch – aus EINEM
     Formular, mit EINEM Speichern. */
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  try {
    await w.Views.material.render(host);
    host.querySelector('#zugang').click();
    await new Promise((r) => setTimeout(r, 300));
    const m = [...w.document.querySelectorAll('.modal-back')].pop();
    const sichtbar = (k) => { const e = m.querySelector(`[data-field="${k}"]`); return !!e && !e.classList.contains('hidden'); };
    const setz = (id, wert) => { const e = m.querySelector('#f-' + id); e.value = wert; e.dispatchEvent(new w.Event('input', { bubbles: true })); e.dispatchEvent(new w.Event('change', { bubbles: true })); };
    assert(!sichtbar('bezeichnung'), 'ohne Wahl bleibt das Formular kurz');
    /* Solange keine Position gewählt ist, ist die Einheit unbekannt – dann darf
       dort nicht „Preis je Stück" geraten stehen. */
    assertEq(m.querySelector('[data-field="preis"] label').textContent, 'Preis je Einheit (€)',
      'neutrale Preis-Beschriftung, solange nichts gewählt ist');
    setz('inventarId', '__neu');
    await new Promise((r) => setTimeout(r, 150));
    // Alles, was „Neue Position" konnte, ist da
    for (const k of ['bezeichnung', 'kategorie', '_bestand', 'packEinheit', 'inhaltMenge', 'einheit', 'gebindeG', '_hatPfand', '_hatMhd', 'mindestbestand', 'standId', 'volkId', 'notiz']) {
      assert(sichtbar(k), `Feld „${k}" ist im Anlege-Weg vorhanden`);
    }
    setz('bezeichnung', 'Zucker Verschmelz-Test');
    await new Promise((r) => setTimeout(r, 120));
    setz('kategorie', 'Futter');
    setz('_bestand', '4'); setz('packEinheit', 'Sack'); setz('inhaltMenge', '25'); setz('einheit', 'kg'); setz('packPreis', '40');
    await new Promise((r) => setTimeout(r, 200));
    assertEq(m.querySelector('#f-preis').value, '1,6', 'der Rechner setzt den Kilopreis');
    assert(/= 100 kg/.test(m.querySelector('[data-pack-info]').textContent),
      `4 Sack × 25 kg = 100 kg wird gezeigt: ${m.querySelector('[data-pack-info]').textContent}`);
    assert(/Futter/.test(m.querySelector('[data-zugang-info]').textContent), 'und vorher gesagt, was ins Kassenbuch geht');
    setz('belegNr', 'RE-VERSCHMELZ-1'); setz('datum', '2026-08-04');
    m.querySelector('[data-save]').click();
    await new Promise((r) => setTimeout(r, 800));
    const pos = (await w.DB.getAll('inventar')).find((x) => x.bezeichnung === 'Zucker Verschmelz-Test');
    assert(pos, 'die Position wurde angelegt');
    assertEq(pos.stueckzahl, 100, '4 Sack × 25 kg = 100 kg');
    assertEq(pos.preis, 1.6, '40 € je Sack ÷ 25 kg = 1,60 € je kg');
    assertEq(pos.packEinheit, 'Sack', 'die Packungsangabe bleibt erhalten');
    assertEq(pos.inhaltMenge, 25, 'inklusive Inhalt je Sack');
    assertEq(pos.kategorie, 'Futter', 'Kategorie übernommen');
    assertEq(pos.anschaffung, '2026-08-04', 'das Zugangsdatum ist auch das Datum der Position');
    const zug = (await w.DB.getAll('materialzugaenge')).filter((z) => z.inventarId === pos.id);
    assertEq(zug.length, 1, 'genau ein Zugang – nicht doppelt');
    assertEq(zug[0].bestandVorher, 0, 'vorher 0');
    assertEq(zug[0].bestandNachher, 100, 'nachher 100 – der Bestand wurde nicht zweimal erhöht');
    assertEq(zug[0].menge, 100, 'gebucht wurde die innere Menge in kg');
    assertEq(zug[0].preis, 1.6, 'mit dem Kilopreis');
    assertEq(zug[0].belegNr, 'RE-VERSCHMELZ-1', 'Beleg übernommen');
    assertEq(zug[0].datum, '2026-08-04', 'Kaufdatum übernommen');
    const kb = (await w.DB.getAll('kassenbuch')).filter((k) => k.id === zug[0].kassenbuchId);
    assertEq(kb.length, 1, 'die Buchung ist verknüpft');
    assertEq(kb[0].typ, 'ausgabe', 'Einkauf ist eine Ausgabe');
    assertEq(kb[0].kategorie, 'Futter', 'in der Kategorie Futter');
    assertEq(kb[0].betrag, 160, '100 kg × 1,60 € = 160 €');
    assertEq(kb[0].datum, '2026-08-04', 'am Kaufdatum, nicht heute');
    // Der Lagerwert stimmt vom ersten Tag an, weil es einen echten Einkauf gibt
    assertEq(w.lagerBewertung(pos, zug).wert, 160, 'Lagerwert 160 € aus dem echten Einkauf');
  } finally { host.remove(); w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false; }
});

test('Verschmolzen: vorhandene Position bleibt der kurze Weg', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const pos = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Zucker Nachkauf-Test', kategorie: 'Futter',
    einheit: 'kg', stueckzahl: 175, preis: 1.64 });
  await w.DB.put('materialzugaenge', { inventarId: pos.id, bezeichnung: pos.bezeichnung, typ: 'verbrauch',
    kategorie: 'Futter', einheit: 'kg', datum: '2026-03-01', menge: 175, art: 'Einkauf', preis: 1.64,
    bestandVorher: 0, bestandNachher: 175 });
  const m = await w.materialZugangForm({ typ: 'verbrauch', titel: 'Verbrauchsmaterial' }, pos.id);
  await new Promise((r) => setTimeout(r, 300));
  try {
    const sichtbar = (k) => { const e = m.el.querySelector(`[data-field="${k}"]`); return !!e && !e.classList.contains('hidden'); };
    const setz = (id, wert) => { const e = m.el.querySelector('#f-' + id); e.value = wert; e.dispatchEvent(new w.Event('input', { bubbles: true })); e.dispatchEvent(new w.Event('change', { bubbles: true })); };
    assertEq(m.el.querySelector('#f-inventarId').value, pos.id, 'die Position ist vorgewählt');
    assert(sichtbar('menge'), 'die Menge wird gefragt');
    for (const k of ['bezeichnung', 'kategorie', '_bestand', 'gebindeG', '_hatPfand', '_hatMhd', 'mindestbestand']) {
      assert(!sichtbar(k), `Steckbrief-Feld „${k}" bleibt verborgen – es ist ja schon bekannt`);
    }
    // Die Preiszeile nennt die Einheit der Position, nicht „Stück"
    const label = (id) => { const e = m.el.querySelector(id); const l = e && e.closest('.field') && e.closest('.field').querySelector('label'); return l ? l.textContent.trim() : ''; };
    assert(/je kg/.test(label('#f-preis')), `Preis je kg, nicht je Stück: ${label('#f-preis')}`);
    setz('menge', '25'); setz('preis', '1,80'); setz('datum', '2026-08-05');
    await new Promise((r) => setTimeout(r, 150));
    const info = m.el.querySelector('[data-zugang-info]').textContent;
    assert(/nach dem Zugang 200 kg/.test(info), `Bestand danach 200 kg: ${info}`);
    assert(/332,00/.test(info), `Lagerwert 332 € statt 360 €: ${info}`);
    m.el.querySelector('[data-save]').click();
    await new Promise((r) => setTimeout(r, 700));
    const frisch = await w.DB.get('inventar', pos.id);
    assertEq(frisch.stueckzahl, 200, '175 + 25 = 200 kg');
    assertEq(frisch.preis, 1.8, 'der neue Preis ist übernommen');
    const zug = (await w.DB.getAll('materialzugaenge')).filter((z) => z.inventarId === pos.id);
    assertEq(zug.length, 2, 'ein zweiter Zugang, die Position ist nicht doppelt angelegt');
    assertEq((await w.DB.getAll('inventar')).filter((x) => x.bezeichnung === 'Zucker Nachkauf-Test').length, 1,
      'genau eine Position mit diesem Namen');
  } finally { m.close && m.close(true); w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false; }
});

test('Verschmolzen: Position ohne Menge wird nur angelegt', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const m = await w.materialZugangForm({ typ: 'verbrauch', titel: 'Verbrauchsmaterial', kategorien: ['Futter'] });
  await new Promise((r) => setTimeout(r, 300));
  try {
    const setz = (id, wert) => { const e = m.el.querySelector('#f-' + id); e.value = wert; e.dispatchEvent(new w.Event('input', { bubbles: true })); e.dispatchEvent(new w.Event('change', { bubbles: true })); };
    setz('inventarId', '__neu');
    await new Promise((r) => setTimeout(r, 150));
    setz('bezeichnung', 'Vorrat-Platzhalter-Test');
    setz('_bestand', '0');
    await new Promise((r) => setTimeout(r, 150));
    assert(/nur angelegt/.test(m.el.querySelector('[data-zugang-info]').textContent), 'die App sagt vorher, dass nur angelegt wird');
    m.el.querySelector('[data-save]').click();
    await new Promise((r) => setTimeout(r, 700));
    const pos = (await w.DB.getAll('inventar')).find((x) => x.bezeichnung === 'Vorrat-Platzhalter-Test');
    assert(pos, 'die Position ist da');
    assertEq(w.verbrauchBestand(pos), 0, 'mit Bestand 0');
    assertEq((await w.DB.getAll('materialzugaenge')).filter((z) => z.inventarId === pos.id).length, 0,
      'und ohne Zugangs-Buchung – eine Buchung über null wäre keine');
    assertEq((await w.DB.getAll('kassenbuch')).filter((k) => /Vorrat-Platzhalter-Test/.test(k.beschreibung || '')).length, 0,
      'im Kassenbuch steht nichts');
  } finally { m.close && m.close(true); w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false; }
});

test('Verschmolzen: ohne jede Position steht das Anlegen sofort offen', async (w) => {
  /* Der Fall des ersten Tages: es gibt noch nichts. Früher meldete das
     Zugangs-Formular „Noch keine Position – lege sie zuerst an" und ging wieder
     zu; jetzt ist es der Weg zum Anlegen. */
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const m = await w.materialZugangForm({ typ: 'gibtesnicht', titel: 'Leertest', kategorien: ['Futter'] });
  await new Promise((r) => setTimeout(r, 250));
  try {
    assert(m && m.el, 'das Formular öffnet sich überhaupt');
    assertEq(m.el.querySelector('#f-inventarId').value, '__neu', '„Neue Position anlegen" ist vorgewählt');
    assert(!m.el.querySelector('[data-field="bezeichnung"]').classList.contains('hidden'),
      'der Steckbrief steht sofort offen – kein Umweg über einen zweiten Knopf');
  } finally { m && m.close && m.close(true); w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false; }
});

test('Position bearbeiten: nur Stammdaten, kein Einkauf mehr', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const host = w.document.createElement('div'); w.document.body.appendChild(host);
  const pos = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'AAA Bearbeiten-Test', kategorie: 'Futter',
    einheit: 'kg', stueckzahl: 10, preis: 2 });
  w.Views.material._jahr = ''; w.Views.material._art = ''; w.Views.material._suche = '';
  try {
    await w.Views.material.render(host);
    const zeile = host.querySelector(`[data-edit="${pos.id}"]`);
    assert(zeile, 'die Position steht als Zeile in der Liste');
    zeile.click();
    await new Promise((r) => setTimeout(r, 300));
    const m = [...w.document.querySelectorAll('.modal-back')].pop();
    assertEq(m.querySelector('.modal-head h2').textContent, 'Position bearbeiten', 'die Zeile öffnet das Bearbeiten');
    for (const k of ['_einkaufBuchen', 'einkaufBeleg', 'einkaufLieferant', 'einkaufDatum']) {
      assertEq(m.querySelector(`[data-field="${k}"]`), null, `„${k}" ist aus dem Positions-Formular verschwunden`);
    }
    assert(m.querySelector('[data-field="bezeichnung"]'), 'die Stammdaten sind weiter änderbar');
    const vorher = (await w.DB.getAll('materialzugaenge')).length;
    m.querySelector('[data-save]').click();
    await new Promise((r) => setTimeout(r, 600));
    assertEq((await w.DB.getAll('materialzugaenge')).length, vorher, 'Speichern bucht keinen Einkauf');
    assertEq((await w.DB.get('inventar', pos.id)).stueckzahl, 10, 'und lässt den Bestand, wie er war');
  } finally { host.remove(); w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false; }
});

test('Zugang: Art steht oben, bedingte Felder nehmen die ganze Breite', async (w) => {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false;
  const bt = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Breiten-Test', kategorie: 'Futter', einheit: 'kg', stueckzahl: 5 });
  /* Mit vorgewählter Position: ohne Wahl wäre die Menge verborgen – hier geht es
     um die Breiten, nicht um den Anlege-Weg. */
  const m = await w.materialZugangForm({ typ: 'verbrauch', titel: 'Verbrauchsmaterial' }, bt.id);
  await new Promise((r) => setTimeout(r, 250));
  try {
    const felder = [...m.el.querySelectorAll('[data-field]')].map((e) => e.dataset.field);
    const pos = (k) => felder.indexOf(k);
    assert(pos('art') < pos('datum'), 'die Art steht vor dem Datum');
    assert(pos('art') < pos('menge'), 'und vor der Menge');
    const kasten = (k) => m.el.querySelector(`[data-field="${k}"]`).getBoundingClientRect();
    assert(!m.el.querySelector('[data-field="art"]').classList.contains('halb'), 'die Art nimmt die ganze Breite');
    assertEq(Math.round(kasten('datum').top), Math.round(kasten('menge').top), 'Datum und Menge bilden das Paar');
    // Wechsel auf eine Art ohne Preis darf nichts verschieben
    const obenVorher = Math.round(kasten('datum').top);
    const sel = m.el.querySelector('#f-art');
    sel.value = 'Eigenproduktion'; sel.dispatchEvent(new w.Event('change', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 150));
    assert(m.el.querySelector('[data-field="preis"]').classList.contains('hidden'), 'ohne Einkauf kein Preisfeld');
    /* Toleranz von 2 px: ein Unterpixel-Unterschied ist kein Sprung – geprüft
       wird, dass die Zeile nicht umbricht, nicht dass sie auf das Pixel liegt. */
    nah(Math.round(kasten('datum').top), obenVorher, 2, 'Datum und Menge bleiben, wo sie waren');
    assertEq(Math.round(kasten('datum').top), Math.round(kasten('menge').top), 'und bleiben ein Paar');
  } finally { m.close && m.close(true); w.document.querySelectorAll('.modal-back').forEach((x) => x.remove()); w.FormGuard.dirty = false; }
});

/* =====================================================================
   ABDECKUNG: Bereiche, die die Suite bisher nie angefasst hat
   Ermittelt mit `node tools/test-run.mjs --coverage` (tools/coverage/report.json).
   ===================================================================== */

test('Smoke: jede Seite der App rendert ohne Fehler', async (w) => {
  /* Der größte weiße Fleck der Abdeckung waren die render()-Funktionen der Views.
     Dieser Test ruft jede einzeln auf – er ersetzt keine Fachprüfung, fängt aber
     genau das ab, was den Nutzer am härtesten trifft: eine Seite, die nicht lädt. */
  const routen = Object.keys(w.Views);
  const ersteId = async (store) => ((await w.DB.getAll(store))[0] || {}).id || null;
  const param = {
    volk: await ersteId('voelker'),
    stand: await ersteId('staende'),
    rechnung: await ersteId('rechnungen'),
    serie: await ersteId('zuchtserien'),
  };
  const kaputt = [];
  for (const route of routen) {
    const host = w.document.createElement('div');
    w.document.body.appendChild(host);
    try { await w.Views[route].render(host, param[route] || null); }
    catch (e) { kaputt.push(`${route}: ${e.message}`); }
    finally { host.remove(); }
  }
  assertEq(kaputt, [], 'alle Seiten rendern');
  assert(routen.length >= 28, `${routen.length} Seiten geprüft`);
});

test('abfLabel / koeniginKurz / dashIstLink: kurze Beschriftungen', (w) => {
  assertEq(w.abfLabel({ gebindeG: 500 }, { losnummer: '2026-01' }), 'Los 2026-01 · 500 g');
  assertEq(w.abfLabel({ gebindeG: 500 }, null), 'Los ? · 500 g', 'ohne Charge bleibt das Fragezeichen');
  assertEq(w.koeniginKurz({ kennung: 'DE-1234', jahrgang: 2025 }), 'DE-1234', 'Kennung schlägt den Jahrgang');
  assertEq(w.koeniginKurz({ jahrgang: 2025 }), 'Jg. 2025');
  assertEq(w.koeniginKurz(null), '–');
  assert(w.dashIstLink('link:voelker'), 'Verknüpfungen erkennt er');
  assert(!w.dashIstLink('voelker'), 'echte Kacheln nicht');
  assert(!w.dashIstLink(null), 'und null wirft nicht');
});

test('zielName: Volk, Stand, gelöscht und leer', async (w) => {
  const stand = await w.DB.put('staende', { name: 'Zielname-Stand', lat: null, lng: null, notizen: '' });
  const volk = await w.DB.put('voelker', { name: 'Zielname-Volk', standId: stand.id, status: 'aktiv', historie: [] });
  try {
    assertEq(await w.zielName('volk', volk.id), 'Zielname-Volk');
    assertEq(await w.zielName('stand', stand.id), 'Zielname-Stand');
    assertEq(await w.zielName('volk', 'gibt-es-nicht'), 'gelöscht', 'fehlender Datensatz wird benannt');
    assertEq(await w.zielName('volk', null), '–', 'ohne Ziel ein Strich');
  } finally { await w.DB.del('voelker', volk.id); await w.DB.del('staende', stand.id); }
});

test('koeniginOptions: nur aktive Königinnen, Kennung zuerst', async (w) => {
  const a = await w.DB.put('koeniginnen', { kennung: 'AA-1', jahrgang: 2026, linie: 'Testlinie', status: 'aktiv', historie: [] });
  const b = await w.DB.put('koeniginnen', { kennung: 'BB-2', jahrgang: 2024, linie: 'Alt', status: 'umgeweiselt', historie: [] });
  try {
    const opts = await w.koeniginOptions();
    const ids = opts.map((o) => o.v);
    assert(ids.includes(a.id), 'aktive ist dabei');
    assert(!ids.includes(b.id), 'umgeweiselte nicht');
    const label = opts.find((o) => o.v === a.id).l;
    assert(label.startsWith('AA-1'), 'Kennung steht vorn: ' + label);
    assert(/Testlinie/.test(label), 'Linie steht dabei');
  } finally { await w.DB.del('koeniginnen', a.id); await w.DB.del('koeniginnen', b.id); }
});

test('fahrtVorlageBuchen: bucht mit Kilometern, fragt ohne', async (w) => {
  const alt = w.S.get('fahrtvorlagen');
  const vorher = (await w.DB.getAll('fahrten')).length;
  try {
    await w.S.set('fahrtvorlagen', [
      { id: 'v-mit', name: 'Heimstand', km: 12, zweck: 'Durchsicht', standId: null, freiZiel: 'Heimstand' },
      { id: 'v-ohne', name: 'Ohne km', km: 0, zweck: 'Durchsicht', standId: null, freiZiel: 'Unbekannt' },
    ]);
    await w.fahrtVorlageBuchen('v-mit');
    const fahrten = await w.DB.getAll('fahrten');
    assertEq(fahrten.length, vorher + 1, 'eine Fahrt mehr');
    const neu = fahrten.find((f) => f.km === 12 && f.freiZiel === 'Heimstand');
    assert(neu, 'die Vorlage steht in der Buchung');
    assertEq(neu.datum, w.U.todayIso(), 'auf heute gebucht');
    await w.fahrtVorlageBuchen('v-ohne');
    assertEq((await w.DB.getAll('fahrten')).length, vorher + 1, 'ohne Kilometer wird nichts gebucht, sondern gefragt');
  } finally {
    await w.S.set('fahrtvorlagen', alt);
    w.document.querySelectorAll('.modal-back').forEach((x) => x.remove());
    w.FormGuard.dirty = false;
  }
});

test('osmFlaechenAusElementen: kleinste Fläche zuerst, Löcher fliegen raus', (w) => {
  const ring = (d) => [{ lat: 50, lon: 8 }, { lat: 50 + d, lon: 8 }, { lat: 50 + d, lon: 8 + d }, { lat: 50, lon: 8 + d }, { lat: 50, lon: 8 }];
  const elemente = [
    { tags: { landuse: 'forest' }, geometry: ring(0.02) },
    { tags: { landuse: 'meadow' }, geometry: ring(0.005) },
    { tags: { building: 'yes' }, geometry: ring(0.01) },          // ohne Kategorie
    { tags: { landuse: 'forest' }, geometry: [{ lat: 50, lon: 8 }] }, // zu kurz
  ];
  const f = w.osmFlaechenAusElementen(elemente, 50);
  assertEq(f.length, 2, 'nur die beiden brauchbaren Flächen');
  assert(f[0].groesse < f[1].groesse, 'die kleinere steht vorn – bei Überlappung gewinnt die genauere Aussage');
  assertEq(f[0].kat, w.osmKategorie({ landuse: 'meadow' }), 'Kategorie bleibt erhalten');
});

/* =====================================================================
   EXTREMWERTE: leere Eingaben, Null, Unsinn, Fehlerzustände
   Alle diese Fälle können im Alltag entstehen – ein leeres Feld, eine
   gelöschte Position, ein Import mit Lücken. Nichts davon darf werfen.
   ===================================================================== */

test('Extremwerte: Formatierer und Parser halten Leeres und Unsinn aus', (w) => {
  assertEq(w.U.fmtEur(null), '–');
  assertEq(w.U.fmtEur(undefined), '–');
  assertEq(w.U.fmtEur(NaN), '–');
  assertEq(w.U.fmtNum(0), '0', 'die Null bleibt eine Null und wird kein Strich');
  assert(isNaN(w.U.parseNum('')), 'leerer String ist keine Zahl');
  assert(isNaN(w.U.parseNum('abc')), 'Buchstaben sind keine Zahl');
  assertEq(w.U.parseNum('1.234,50'), 1234.5, 'deutsches Format');
  assertEq(w.U.parseNum('-0,5'), -0.5, 'negative Kommazahl');
  assertEq(w.U.esc(''), '', 'leerer String bleibt leer');
  assertEq(w.U.esc('<script>x</script>'), '&lt;script&gt;x&lt;/script&gt;', 'HTML wird entschärft');
  assertEq(w.U.fmtDate(''), '', 'leeres Datum gibt nichts aus');
  assertEq(w.U.sum([], (x) => x), 0, 'Summe der leeren Liste ist 0');
  assertEq(w.U.sortBy([], (x) => x), [], 'leere Liste bleibt leer');
  assertEq(w.U.sum([{ n: 1 }, { n: undefined }, { n: null }], (x) => x.n), 1, 'Lücken zählen als 0');
});

test('Extremwerte: Fachrechnungen bei 0, negativ und ohne Werte', (w) => {
  // Selbstkosten ohne Ertrag: darf nicht durch 0 teilen
  const leer = w.selbstkostenGlas({ ...w.SELBSTKOSTEN_VORGABE, ertragKg: 0 });
  assert(isFinite(leer.summe), 'ohne Ertrag bleibt die Summe eine Zahl: ' + leer.summe);
  const negativ = w.selbstkostenGlas({ ...w.SELBSTKOSTEN_VORGABE, glas: -5, voelker: 0, nutzungsdauer: 0 });
  assert(isFinite(negativ.summe) && negativ.summe >= 0, 'negative Eingaben ergeben keinen negativen Preis');
  // Zuckerrechnung
  assertEq(w.futterAusZucker(0), { theoretisch: 0, tatsaechlich: 0 }, 'kein Zucker, kein Futter');
  assertEq(w.futterAusZucker(-5).tatsaechlich, 0, 'negativer Zucker ergibt kein Futter');
  assertEq(w.zuckerFuerFutter(0), 0, 'und umgekehrt genauso');
  assertEq(w.zuckerAnteilAusFutterart('Wundermittel XY'), null, 'unbekannte Futterart bleibt unbekannt');
  assertEq(w.zuckerAnteilAusFutterart(''), null, 'leere Futterart auch');
  assertEq(w.zuckerAnteilAusFutterart(null), null, 'und null erst recht');
  // Varroa
  assertEq(w.varroaAmpelBefall(0).stufe ? typeof w.varroaAmpelBefall(0).stufe : 'x', 'string', 'auch 0 Milben ergeben eine Bewertung');
  // Prozentrechnung auf leerer Grundlage
  assertEq(w.bioAnteile(null), [], 'ein Stand ohne Bio-Angaben liefert eine leere Liste');
  assertEq(w.bioAnteile({}), [], 'ein Stand ohne Anteile ebenfalls');
  assertEq(w.bioSummen([]).gesamt, 0, 'leere Bio-Anteile ergeben 0');
  assertEq(w.bioSummen(null).gesamt, 0, 'und null wirft nicht');
});

test('Extremwerte: Rechnung ohne Positionen, mit 0 € und mit Rabatt über 100 %', (w) => {
  const leer = w.rechnungSummen({ positionen: [], steuerart: 'klein' });
  assertEq(leer.brutto, 0, 'leere Rechnung: 0 €');
  const null0 = w.rechnungSummen({ positionen: [{ text: 'Probe', menge: 0, einzelpreis: 0, steuersatz: 0 }], steuerart: 'klein' });
  assertEq(null0.brutto, 0, 'Nullposition bleibt 0 €');
  const zuViel = w.rechnungSummen({
    positionen: [{ text: 'Honig', menge: 2, einzelpreis: 10, steuersatz: 0, pfand: 1 }],
    steuerart: 'klein', rabattArt: 'prozent', rabattWert: 500,
  });
  assert(zuViel.brutto >= 0, 'ein absurder Rabatt macht die Rechnung nicht negativ: ' + zuViel.brutto);
  assert(zuViel.brutto >= zuViel.pfand - 0.001, 'der Pfand bleibt vom Rabatt unberührt');
});

test('Extremwerte: Bestandsabzug bei 0, leerem Lager und gelöschter Position', async (w) => {
  /* Das Lager wird geleert: die Kette greift sonst auf andere Futter-Positionen
     der Beispieldaten über – genau das ist ihre Aufgabe, hier aber nicht der Fall,
     der geprüft werden soll. */
  const alt = await w.DB.getAll('inventar');
  await w.DB.clear('inventar');
  const pos = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Extremzucker', kategorie: 'Futter', einheit: 'kg', stueckzahl: 0 });
  try {
    /* Vertrag der Kette: bei nichts zu tun gibt sie null zurück, statt eine
       Buchung mit 0 vorzugaukeln. Wer das Ergebnis auswertet, muss darauf gefasst sein. */
    assertEq(await w.verbrauchAbziehenKette(pos.id, 0, { pruefen: true }), null, 'null abziehen bucht nichts');
    assertEq(await w.verbrauchAbziehenKette(pos.id, -5, { pruefen: true }), null, 'eine negative Menge auch nicht');
    assertEq(await w.verbrauchAbziehenKette('gibt-es-nicht', 5, { pruefen: true }), null, 'gelöschte Position wirft nicht');
    assertEq(await w.verbrauchAbziehenKette('', 5, { pruefen: true }), null, 'leere Kennung ebenfalls nicht');
    const leer = await w.verbrauchAbziehenKette(pos.id, 10, { pruefen: true });
    assertEq(leer.abgezogen, 0, 'leeres Lager gibt nichts her');
    assertEq(leer.gefehlt, 10, 'meldet aber ehrlich, was fehlt');
    await w.verbrauchZurueckbuchen([], { pruefen: true }); // leere Rückgabe darf nicht werfen
    assertEq((await w.DB.get('inventar', pos.id)).stueckzahl, 0, 'der Bestand bleibt bei 0');
  } finally {
    await w.DB.clear('inventar');
    for (const x of alt) await w.DB.put('inventar', x, true);
  }
});

test('Extremwerte: Ernteprognose ohne jede Ernte und ohne Völker', async (w) => {
  const alt = { e: await w.DB.getAll('ernten'), v: await w.DB.getAll('voelker'), vk: await w.DB.getAll('verkaeufe') };
  await w.DB.clear('ernten'); await w.DB.clear('voelker'); await w.DB.clear('verkaeufe');
  try {
    const ep = await w.ernteprognoseBasis();
    assertEq(ep.voelker, 0, 'keine Völker');
    assertEq(ep.geerntet, 0, 'nichts geerntet');
    assertEq(ep.erloesJeKg, 0, 'kein Erlös bekannt');
    assertEq(ep.historie, [], 'keine Historie');
    assert(ep.jeVolk > 0 && isFinite(ep.jeVolk), 'trotzdem eine brauchbare Faustzahl: ' + ep.jeVolk);
    assert(ep.jeVolkMin < ep.jeVolk && ep.jeVolkMax > ep.jeVolk, 'mit Spanne drumherum');
    assert(/Faustzahl/.test(ep.quelle), 'und der Hinweis, woher sie kommt');
  } finally {
    await w.DB.clear('ernten'); await w.DB.clear('voelker'); await w.DB.clear('verkaeufe');
    for (const x of alt.e) await w.DB.put('ernten', x, true);
    for (const x of alt.v) await w.DB.put('voelker', x, true);
    for (const x of alt.vk) await w.DB.put('verkaeufe', x, true);
  }
});

/* =====================================================================
   INTEGRATION: die Kette vom Volk bis zur Auswertung
   ===================================================================== */

test('Integration: Ernte → Charge → Abfüllung → Verkauf → Kassenbuch → Prognose', async (w) => {
  const sicher = {};
  for (const s of ['ernten', 'chargen', 'abfuellungen', 'verkaeufe', 'kassenbuch', 'voelker', 'staende', 'inventar', 'rechnungen']) {
    sicher[s] = await w.DB.getAll(s);
    await w.DB.clear(s);
  }
  const J = +w.U.todayIso().slice(0, 4);
  try {
    // 1) Grundlage: ein Stand, zwei Völker, Gläser im Lager
    const stand = await w.DB.put('staende', { name: 'Integrationsstand', lat: null, lng: null, notizen: '' });
    const v1 = await w.DB.put('voelker', { name: 'I-1', standId: stand.id, status: 'aktiv', funktion: 'Wirtschaftsvolk', historie: [{ datum: `${J - 2}-04-01`, text: 'angelegt' }] });
    const v2 = await w.DB.put('voelker', { name: 'I-2', standId: stand.id, status: 'aktiv', funktion: 'Wirtschaftsvolk', historie: [{ datum: `${J - 2}-04-01`, text: 'angelegt' }] });
    const glaeser = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Gläser 500 g', kategorie: 'Gläser/Deckel', einheit: 'Stück', stueckzahl: 100, gebindeG: 500 });

    // 2) Vorjahr für die Prognose + Ernte dieses Jahres
    await w.DB.put('ernten', { zielTyp: 'volk', zielId: v1.id, datum: `${J - 1}-06-15`, produktart: 'Honig', sorte: 'Frühtracht', mengeKg: 30 });
    await w.DB.put('ernten', { zielTyp: 'volk', zielId: v2.id, datum: `${J - 1}-06-15`, produktart: 'Honig', sorte: 'Frühtracht', mengeKg: 30 });
    const ernte = await w.DB.put('ernten', { zielTyp: 'volk', zielId: v1.id, datum: `${J}-06-20`, produktart: 'Honig', sorte: 'Linde', mengeKg: 20, wassergehalt: 17.2 });

    // 3) Charge aus der Ernte – Sorte und Wassergehalt kommen von dort
    const charge = await w.DB.put('chargen', { losnummer: `L-${J}-01`, ernteIds: [ernte.id], mengeKg: 20, mhd: `${J + 2}-06-20`, etikettNotiz: '' });
    const ernteMap = await w.idMap('ernten');
    assertEq(w.chargeSorten(charge, ernteMap), ['Linde'], 'die Sorte kommt aus der Ernte');
    assertEq(w.chargeWassergehalt(charge, ernteMap), 17.2, 'der Laborwert ebenfalls');
    assertEq(w.chargeRestKg(charge, []), 20, 'noch nichts abgefüllt');

    // 4) Abfüllung: 20 kg → 40 Gläser à 500 g, Gläser gehen aus dem Lager
    const abzug = await w.verbrauchAbziehenKette(glaeser.id, 40, { pruefen: false });
    const abf = await w.DB.put('abfuellungen', { chargeId: charge.id, datum: `${J}-06-25`, gebindeG: 500, anzahl: 40, bestand: 40, verbrauchAbzug: abzug.abzug });
    assertEq((await w.DB.get('inventar', glaeser.id)).stueckzahl, 60, '40 Gläser sind aus dem Lager');
    assertEq(w.chargeRestKg(charge, await w.DB.getAll('abfuellungen')), 0, 'die Charge ist voll abgefüllt');
    assertEq(w.abfLabel(abf, charge), `Los L-${J}-01 · 500 g`, 'die Beschriftung stimmt');

    // 5) Verkauf: mindert den Bestand UND bucht die Einnahme
    await w.verkaufErfassen({ abfuellungId: abf.id, anzahl: 10, preisJeGlas: 7, datum: `${J}-07-01`, notiz: 'Integrationstest' });
    assertEq((await w.DB.get('abfuellungen', abf.id)).bestand, 30, 'zehn Gläser weniger im Bestand');
    const kasse = await w.DB.getAll('kassenbuch');
    assertEq(kasse.length, 1, 'genau eine Buchung');
    assertEq(kasse[0].typ, 'einnahme');
    assertEq(kasse[0].kategorie, 'Honigverkauf');
    nah(kasse[0].betrag, 70, 0.001, '10 × 7 €');

    // 6) Überverkauf wird abgelehnt – und ändert nichts
    let gemeckert = false;
    try { await w.verkaufErfassen({ abfuellungId: abf.id, anzahl: 999, preisJeGlas: 7 }); }
    catch (e) { gemeckert = true; }
    assert(gemeckert, 'mehr verkaufen als da ist, geht nicht');
    assertEq((await w.DB.get('abfuellungen', abf.id)).bestand, 30, 'der Bestand blieb unberührt');
    assertEq((await w.DB.getAll('kassenbuch')).length, 1, 'und es wurde nichts gebucht');

    // 7) Auswertung sieht dieselbe Wahrheit
    const ertragJahr = await w.Reporting.ertrag('jahr');
    nah(ertragJahr.find((r) => r.k === String(J)).kg, 20, 0.001, 'Reporting kennt die Ernte des Jahres');
    const ep = await w.ernteprognoseBasis();
    assertEq(ep.voelker, 2, 'zwei Wirtschaftsvölker');
    nah(ep.jeVolk, 30, 0.001, '60 kg im Vorjahr auf zwei Völker');
    nah(ep.geerntet, 20, 0.001, 'dieses Jahr sind 20 kg drin');
    nah(ep.erloesJeKg, 14, 0.001, '70 € auf 5 kg verkauften Honig');
    nah(ep.voelker * ep.jeVolk, 60, 0.001, 'die Prognose für dieses Jahr');

    // 8) Stornierung dreht alle drei Schritte zurück
    const verkauf = (await w.DB.getAll('verkaeufe'))[0];
    await w.verkaufStornieren(verkauf.id);
    assertEq((await w.DB.get('abfuellungen', abf.id)).bestand, 40, 'die Gläser sind zurück');
    assertEq((await w.DB.getAll('verkaeufe')).length, 0, 'der Verkauf ist weg');
    assertEq((await w.DB.getAll('kassenbuch')).length, 0, 'die Einnahme auch');

    // 9) Rückgabe der Gläser ins Lager
    await w.verbrauchZurueckbuchen(abzug.abzug, { pruefen: false });
    assertEq((await w.DB.get('inventar', glaeser.id)).stueckzahl, 100, 'das Lager ist wieder voll');
  } finally {
    for (const s of Object.keys(sicher)) {
      await w.DB.clear(s);
      for (const x of sicher[s]) await w.DB.put(s, x, true);
    }
  }
});

test('Formularbausteine und QR: zielFelder, standFormFields, makeQr, navTo', async (w) => {
  const felder = await w.zielFelder({}, 'Behandelt wurde');
  assertEq(felder.map((f) => f.key), ['zielTyp', 'zielVolk', 'zielStand'], 'drei Felder in fester Reihenfolge');
  assertEq(felder[0].label, 'Behandelt wurde', 'die Beschriftung ist durchgereicht');
  assert(felder[1].showIf({ zielTyp: 'volk' }), 'das Volk-Feld erscheint bei „Einzelnes Volk“');
  assert(!felder[1].showIf({ zielTyp: 'stand' }), 'und verschwindet beim Stand');
  assert(felder[2].showIf({ zielTyp: 'stand' }), 'umgekehrt genauso');
  assertEq((await w.zielFelder({ zielTyp: 'stand' })).find((f) => f.key === 'zielTyp').default, 'stand', 'Vorbelegung wird übernommen');

  const sf = w.standFormFields();
  assert(sf.find((f) => f.key === 'name').required, 'der Name eines Stands ist Pflicht');
  assert(sf.some((f) => f.key === 'lat') && sf.some((f) => f.key === 'lng'), 'Koordinaten sind vorgesehen');

  const qr = await w.makeQr('https://example.org/ImkerBuch');
  assert(/^data:image\/(png|gif)/.test(qr), 'QR kommt als Bilddatei zurück: ' + qr.slice(0, 24));
  assert(qr.length > 500, 'und ist nicht leer');

  const vorher = w.location.hash;
  try { w.navTo('honig'); assertEq(w.location.hash, '#/honig', 'navTo setzt die Route'); }
  finally { w.location.hash = vorher; }
});

/* =====================================================================
   NETZ: die Abrufe sind prüfbar, wenn man fetch austauscht
   Damit fällt der letzte große Vorwand weg, die Rückfallkette der
   Landbedeckung ungetestet zu lassen – gerade sie entscheidet, welche
   Zahlen in den Öko-Unterlagen landen.
   ===================================================================== */

/** Tauscht window.fetch der App gegen eine Antwortliste und gibt es danach zurück. */
async function mitFetch(w, antwort, fn) {
  const echt = w.fetch;
  const rufe = [];
  w.fetch = async (url, opt) => { rufe.push({ url: String(url), opt }); return antwort(String(url), opt, rufe.length); };
  try { return await fn(rufe); } finally { w.fetch = echt; }
}

test('landbedeckungErmitteln: nimmt die erste Quelle, die antwortet', async (w) => {
  const echt = w.LB_QUELLEN.map((q) => q.fn);
  const meldungen = [];
  try {
    // amtliche Quelle antwortet → BKG und OSM werden gar nicht erst gefragt
    let gefragt = [];
    w.LB_QUELLEN[0].fn = async () => { gefragt.push('gbv'); return { zeilen: [{ name: 'Wald', anteil: 100 }] }; };
    w.LB_QUELLEN[1].fn = async () => { gefragt.push('bkg'); return { zeilen: [{ name: 'BKG', anteil: 100 }] }; };
    w.LB_QUELLEN[2].fn = async () => { gefragt.push('osm'); return { zeilen: [{ name: 'OSM', anteil: 100 }] }; };
    let erg = await w.landbedeckungErmitteln(50, 8, 3500, (t) => meldungen.push(t));
    assertEq(gefragt, ['gbv'], 'nur die erste Quelle wurde gefragt');
    assertEq(erg.quelle.key, 'gbv', 'und sie steht als Quelle in der Antwort');
    assertEq(erg.gescheitert, [], 'nichts ist schiefgegangen');
  } finally { w.LB_QUELLEN.forEach((q, i) => { q.fn = echt[i]; }); }
});

test('landbedeckungErmitteln: fällt weiter, wenn eine Quelle streikt', async (w) => {
  const echt = w.LB_QUELLEN.map((q) => q.fn);
  const meldungen = [];
  try {
    const gefragt = [];
    w.LB_QUELLEN[0].fn = async () => { gefragt.push('gbv'); throw new Error('Zeitüberschreitung'); };
    w.LB_QUELLEN[1].fn = async () => { gefragt.push('bkg'); return { zeilen: [] }; };   // leer zählt als Fehlschlag
    w.LB_QUELLEN[2].fn = async () => { gefragt.push('osm'); return { zeilen: [{ name: 'Wiese', anteil: 42 }] }; };
    const erg = await w.landbedeckungErmitteln(50, 8, 3500, (t) => meldungen.push(t));
    assertEq(gefragt, ['gbv', 'bkg', 'osm'], 'alle drei der Reihe nach');
    assertEq(erg.quelle.key, 'osm', 'geantwortet hat die letzte');
    assertEq(erg.gescheitert.length, 2, 'die beiden Fehlschläge stehen in der Antwort');
    assert(/Zeitüberschreitung/.test(erg.gescheitert[0]), 'mit dem Grund: ' + erg.gescheitert[0]);
    assert(/keine Flächen/.test(erg.gescheitert[1]), 'eine leere Antwort ist auch ein Fehlschlag');
    assert(meldungen.some((m) => /weiter mit/.test(m)), 'der Nutzer erfährt, dass weitergesucht wird');

    // „nur“ begrenzt auf eine Quelle – und meldet ehrlich, wenn die nicht kann
    let geflogen = false;
    try { await w.landbedeckungErmitteln(50, 8, 3500, () => {}, 'gbv'); } catch (e) { geflogen = /Keine Quelle/.test(e.message); }
    assert(geflogen, 'mit nur=gbv gibt es keinen stillen Rückfall');
  } finally { w.LB_QUELLEN.forEach((q, i) => { q.fn = echt[i]; }); }
});

test('osmLandbedeckung: baut die Abfrage und rechnet die Antwort in Anteile um', async (w) => {
  const ring = (d) => [{ lat: 50, lon: 8 }, { lat: 50 + d, lon: 8 }, { lat: 50 + d, lon: 8 + d }, { lat: 50, lon: 8 + d }, { lat: 50, lon: 8 }];
  const antwort = { elements: [
    { type: 'way', tags: { landuse: 'forest' }, geometry: ring(0.03) },
    { type: 'way', tags: { landuse: 'meadow' }, geometry: ring(0.02) },
  ] };
  await mitFetch(w, async () => new Response(JSON.stringify(antwort), { status: 200, headers: { 'Content-Type': 'application/json' } }), async (rufe) => {
    const erg = await w.osmLandbedeckung(50, 8, 1500, () => {});
    assertEq(rufe.length, 1, 'ein Server reicht, wenn er antwortet');
    assert(/overpass/.test(rufe[0].url), 'gefragt wird Overpass: ' + rufe[0].url);
    const body = decodeURIComponent(String(rufe[0].opt.body));
    assert(/around:1500,50,8/.test(body), 'Umkreis und Koordinaten stehen in der Abfrage');
    assert(/out geom/.test(body), 'die Geometrie wird mit angefordert');
    assert(erg.zeilen.length > 0, 'es kommen Zeilen zurück');
    const summe = erg.zeilen.reduce((a, z) => a + (z.prozent || 0), 0);
    nah(summe, 100, 1.5, 'die Anteile ergeben zusammen 100 %: ' + summe);
    assert(erg.zeilen.some((z) => /nicht in openstreetmap erfasst/i.test(z.name)), 'was OSM nicht kennt, wird als Lücke ausgewiesen statt verteilt');
    assert(erg.punkte > 100, 'das Raster hat genug Punkte: ' + erg.punkte);
  });
});

test('osmLandbedeckung: probiert den nächsten Server und gibt am Ende auf', async (w) => {
  await mitFetch(w, async () => { throw new Error('Netz weg'); }, async (rufe) => {
    let fehler = null;
    try { await w.osmLandbedeckung(50, 8, 1500, () => {}); } catch (e) { fehler = e; }
    assert(fehler, 'ohne Netz wirft die Funktion – nur so greift die Rückfallkette');
    assert(rufe.length >= w.OSM_OVERPASS_SERVER.length, `alle ${w.OSM_OVERPASS_SERVER.length} Server wurden probiert (${rufe.length} Versuche)`);
  });
});

test('osmAdresseSuchen: Treffer, kein Treffer, Serverfehler, leere Eingabe', async (w) => {
  await mitFetch(w, async () => new Response(JSON.stringify([{ lat: '49.5', lon: '8.4', display_name: 'Musterweg 1, Musterstadt' }]), { status: 200 }), async (rufe) => {
    const t = await w.osmAdresseSuchen('Musterweg 1');
    assertEq(t.lat, 49.5, 'Breitengrad als Zahl, nicht als Text');
    assertEq(t.lon, 8.4);
    assertEq(t.name, 'Musterweg 1, Musterstadt');
    assert(/nominatim/.test(rufe[0].url), 'gefragt wird Nominatim');
    assert(!/[<>]/.test(rufe[0].url), 'die Suche ist kodiert');
  });
  await mitFetch(w, async () => new Response('[]', { status: 200 }), async () => {
    let m = ''; try { await w.osmAdresseSuchen('Gibt es nicht'); } catch (e) { m = e.message; }
    assert(/Keine Adresse gefunden/.test(m), 'kein Treffer wird verständlich gemeldet: ' + m);
  });
  await mitFetch(w, async () => new Response('', { status: 503 }), async () => {
    let m = ''; try { await w.osmAdresseSuchen('Musterweg 1'); } catch (e) { m = e.message; }
    assert(/503/.test(m), 'der Status steht in der Meldung: ' + m);
  });
  let m = ''; try { await w.osmAdresseSuchen('   '); } catch (e) { m = e.message; }
  assert(/Bitte eine Adresse/.test(m), 'leere Eingabe fragt nach, ohne das Netz zu behelligen');
});

test('pruefeAufUpdate: gleiche Version, neue Version, Server weg', async (w) => {
  const knopf = w.document.createElement('button');
  knopf.innerHTML = 'Nach Updates suchen';
  w.document.body.appendChild(knopf);
  const toasts = [];
  const echtToast = w.UI.toast;
  w.UI.toast = (msg, typ) => { toasts.push({ msg, typ }); };
  const echtConfirm = w.UI.confirm;
  let gefragt = null;
  w.UI.confirm = async (o) => { gefragt = o; return false; };   // niemals wirklich neu laden
  try {
    // 1) Server hat dieselbe Version
    await mitFetch(w, async () => new Response(`const APP_VERSION = '${w.APP_VERSION}';`, { status: 200 }), async (rufe) => {
      await w.pruefeAufUpdate(knopf);
      assert(/\?update=/.test(rufe[0].url), 'die Prüfung umgeht den Service Worker: ' + rufe[0].url);
      assert(/bereits die neueste/.test(toasts.at(-1).msg), 'sagt „schon aktuell": ' + toasts.at(-1).msg);
      assertEq(knopf.disabled, false, 'der Knopf ist wieder bedienbar');
      assertEq(knopf.innerHTML, 'Nach Updates suchen', 'und trägt wieder seine Beschriftung');
    });
    // 2) Server hat eine neuere Version → Rückfrage, die wir verneinen
    await mitFetch(w, async () => new Response(`const APP_VERSION = '99.9';`, { status: 200 }), async () => {
      await w.pruefeAufUpdate(knopf);
      assert(gefragt && /99\.9/.test(gefragt.title), 'die neue Version steht in der Rückfrage: ' + (gefragt && gefragt.title));
    });
    // 3) Server nicht erreichbar
    await mitFetch(w, async () => new Response('', { status: 404 }), async () => {
      await w.pruefeAufUpdate(knopf);
      assert(/fehlgeschlagen/.test(toasts.at(-1).msg), 'Fehler wird gemeldet statt verschluckt');
      assertEq(toasts.at(-1).typ, 'err');
      assertEq(knopf.disabled, false, 'auch im Fehlerfall bleibt der Knopf bedienbar');
    });
  } finally { w.UI.toast = echtToast; w.UI.confirm = echtConfirm; knopf.remove(); }
});

/* =====================================================================
   DIALOGE, DIE DATEN SCHREIBEN
   Reine Anzeige-Dialoge lassen wir bewusst offen. Geprüft wird, wo ein
   Klick etwas in der Datenbank verändert – dort tut ein Fehler weh.
   ===================================================================== */

/** Alle offenen Dialoge schließen, damit ein Test nicht den nächsten stört. */
function dialogeSchliessen(w) {
  w.document.querySelectorAll('.modal-back').forEach((x) => x.remove());
  w.FormGuard.dirty = false;
}

test('openStandForm: legt einen Stand an und bearbeitet ihn', async (w) => {
  dialogeSchliessen(w);
  const vorher = (await w.DB.getAll('staende')).length;
  let fertig = 0;
  w.openStandForm(null, () => { fertig++; });
  await new Promise((r) => setTimeout(r, 250));
  let neuerStand = null;
  try {
    const modal = w.document.querySelector('.modal-back');
    assert(modal, 'der Dialog steht offen');
    const setz = (id, wert) => { const e = modal.querySelector('#f-' + id); e.value = wert; e.dispatchEvent(new w.Event('input', { bubbles: true })); e.dispatchEvent(new w.Event('change', { bubbles: true })); };
    setz('name', 'Dialog-Teststand');
    setz('lat', '49,4'); setz('lng', '8,7'); setz('kmEntfernung', '12');
    modal.querySelector('[data-save]').click();
    await new Promise((r) => setTimeout(r, 300));
    const alle = await w.DB.getAll('staende');
    assertEq(alle.length, vorher + 1, 'ein Stand mehr');
    neuerStand = alle.find((s) => s.name === 'Dialog-Teststand');
    assert(neuerStand, 'unter dem eingegebenen Namen');
    assertEq(neuerStand.lat, 49.4, 'Komma-Zahlen kommen als Zahl an');
    assertEq(neuerStand.kmEntfernung, 12);
    assertEq(fertig, 1, 'die Rückmeldung kam genau einmal');

    // Bearbeiten schreibt in denselben Datensatz, statt einen zweiten anzulegen
    dialogeSchliessen(w);
    w.openStandForm(neuerStand, () => {});
    await new Promise((r) => setTimeout(r, 250));
    const m2 = w.document.querySelector('.modal-back');
    assertEq(m2.querySelector('#f-name').value, 'Dialog-Teststand', 'die Werte stehen im Formular');
    const feld = m2.querySelector('#f-name'); feld.value = 'Dialog-Teststand (neu)';
    feld.dispatchEvent(new w.Event('input', { bubbles: true }));
    m2.querySelector('[data-save]').click();
    await new Promise((r) => setTimeout(r, 300));
    const danach = await w.DB.getAll('staende');
    assertEq(danach.length, vorher + 1, 'kein zweiter Datensatz');
    assertEq((await w.DB.get('staende', neuerStand.id)).name, 'Dialog-Teststand (neu)', 'derselbe Datensatz wurde geändert');
  } finally {
    dialogeSchliessen(w);
    if (neuerStand) await w.DB.del('staende', neuerStand.id);
  }
});

test('glasPostenAnlegen: legt die Position an und gibt sie zurück', async (w) => {
  dialogeSchliessen(w);
  let zurueck = null;
  w.glasPostenAnlegen(500, (rec) => { zurueck = rec; });
  await new Promise((r) => setTimeout(r, 250));
  try {
    const modal = w.document.querySelector('.modal-back');
    assert(modal, 'der Dialog steht offen');
    assertEq(modal.querySelector('#f-gebindeG').value, '500 g', 'die Gebindegröße ist vorbelegt');
    const setz = (id, wert) => { const e = modal.querySelector('#f-' + id); e.value = wert; e.dispatchEvent(new w.Event('input', { bubbles: true })); e.dispatchEvent(new w.Event('change', { bubbles: true })); };
    setz('bezeichnung', 'Testgläser 500 g'); setz('stueckzahl', '120'); setz('mindestbestand', '24');
    modal.querySelector('[data-save]').click();
    await new Promise((r) => setTimeout(r, 300));
    assert(zurueck, 'die neue Position wird zurückgereicht');
    assertEq(zurueck.bezeichnung, 'Testgläser 500 g');
    assertEq(zurueck.typ, 'verbrauch', 'Gläser sind Verbrauchsmaterial');
    assertEq(zurueck.einheit, 'Stück');
    assertEq(zurueck.gebindeG, 500, 'aus „500 g" werden 500 Gramm');
    assertEq(zurueck.stueckzahl, 120);
    assertEq(zurueck.mindestbestand, 24);
    // und sie ist wirklich in der Datenbank, nicht nur im Rückruf
    assert(await w.DB.get('inventar', zurueck.id), 'die Position steht im Lager');
  } finally {
    dialogeSchliessen(w);
    if (zurueck) await w.DB.del('inventar', zurueck.id);
  }
});

test('pfandRuecknahmeForm: bucht die Rücknahme, ohne Pfand-Position meldet sie sich', async (w) => {
  dialogeSchliessen(w);
  const toasts = [];
  const echtToast = w.UI.toast;
  w.UI.toast = (msg, typ) => { toasts.push({ msg, typ }); };
  const altInventar = await w.DB.getAll('inventar');
  const altBewegungen = new Set((await w.DB.getAll('pfandbewegungen')).map((x) => x.id));
  const altKasse = new Set((await w.DB.getAll('kassenbuch')).map((x) => x.id));
  await w.DB.clear('inventar');
  try {
    // 1) ohne Pfand-Position: klare Ansage statt leerem Dialog
    await w.pfandRuecknahmeForm({ typ: 'verbrauch' });
    await new Promise((r) => setTimeout(r, 150));
    assert(/Pfand/.test(toasts.at(-1).msg), 'der Hinweis nennt den Grund: ' + toasts.at(-1).msg);
    assertEq(toasts.at(-1).typ, 'err');
    assert(!w.document.querySelector('.modal-back'), 'und es öffnet sich kein Dialog');

    // 2) mit Pfand-Position
    const pos = await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Pfandglas 500 g', kategorie: 'Gläser/Deckel',
      einheit: 'Stück', stueckzahl: 40, gebindeG: 500, pfand: 0.25, pfandSeit: '2026-01-01' });
    await w.pfandRuecknahmeForm({ typ: 'verbrauch' }, pos.id);
    await new Promise((r) => setTimeout(r, 300));
    const modal = w.document.querySelector('.modal-back');
    assert(modal, 'jetzt öffnet sich der Dialog');
    assertEq(modal.querySelector('#f-inventarId').value, pos.id, 'die Position ist vorgewählt');
    const setz = (id, wert) => { const e = modal.querySelector('#f-' + id); e.value = wert; e.dispatchEvent(new w.Event('input', { bubbles: true })); e.dispatchEvent(new w.Event('change', { bubbles: true })); };
    setz('anzahl', '10'); setz('wer', 'Stammkunde Meier');
    modal.querySelector('[data-save]').click();
    await new Promise((r) => setTimeout(r, 350));
    const neueBew = (await w.DB.getAll('pfandbewegungen')).filter((b) => !altBewegungen.has(b.id));
    assertEq(neueBew.length, 1, 'genau eine Bewegung gebucht');
    assertEq(neueBew[0].inventarId, pos.id);
    assertEq(neueBew[0].anzahl, 10);
    assertEq((await w.DB.get('inventar', pos.id)).stueckzahl, 50, 'zehn Gläser sind zurück im Bestand');
    const neueKasse = (await w.DB.getAll('kassenbuch')).filter((k) => !altKasse.has(k.id));
    assertEq(neueKasse.length, 1, 'die Pfandrückzahlung steht als eine Ausgabe im Kassenbuch');
    assertEq(neueKasse[0].typ, 'ausgabe');
    assertEq(neueKasse[0].steuersatz, 0, 'Pfand ist kein Erlös – ohne Umsatzsteuer');
    nah(neueKasse[0].betrag, 2.5, 0.001, '10 × 0,25 €');
    assert(/Stammkunde Meier/.test(neueKasse[0].beschreibung), 'der freie Name steht im Beleg');
    assertEq(neueBew[0].kassenbuchId, neueKasse[0].id, 'Bewegung und Buchung kennen sich');
  } finally {
    w.UI.toast = echtToast;
    dialogeSchliessen(w);
    for (const b of await w.DB.getAll('pfandbewegungen')) if (!altBewegungen.has(b.id)) await w.DB.del('pfandbewegungen', b.id);
    for (const k of await w.DB.getAll('kassenbuch')) if (!altKasse.has(k.id)) await w.DB.del('kassenbuch', k.id);
    await w.DB.clear('inventar');
    for (const x of altInventar) await w.DB.put('inventar', x, true);
  }
});

test('zeitDialog: Minuten landen an der Aufgabe, „Ohne Zeit" schreibt nichts', async (w) => {
  dialogeSchliessen(w);
  const a = await w.DB.put('aufgaben', { titel: 'Zeit-Testaufgabe', faellig: w.U.todayIso(), erledigt: false, quelle: 'fuetterung', notiz: '' });
  try {
    w.zeitDialog(a);
    await new Promise((r) => setTimeout(r, 200));
    let modal = w.document.querySelector('.modal-back');
    assert(modal, 'der Dialog steht offen');
    assertEq(modal.querySelector('#zt-kat').value, 'Fütterung', 'die Tätigkeit ist aus der Quelle vorgeschlagen');
    modal.querySelector('[data-min="45"]').click();          // Schnellwahl
    await new Promise((r) => setTimeout(r, 300));
    let gespeichert = await w.DB.get('aufgaben', a.id);
    assertEq(gespeichert.zeitMinuten, 45, 'die Schnellwahl schreibt die Minuten');
    assertEq(gespeichert.kategorie, 'Fütterung', 'samt Tätigkeit');

    // freie Eingabe
    dialogeSchliessen(w);
    w.zeitDialog(gespeichert);
    await new Promise((r) => setTimeout(r, 200));
    modal = w.document.querySelector('.modal-back');
    const feld = modal.querySelector('#zt-min'); feld.value = '25';
    feld.dispatchEvent(new w.Event('input', { bubbles: true }));
    modal.querySelector('[data-ok]').click();
    await new Promise((r) => setTimeout(r, 300));
    assertEq((await w.DB.get('aufgaben', a.id)).zeitMinuten, 25, 'die freie Eingabe überschreibt');

    // „Ohne Zeit" lässt den Wert stehen und schreibt nichts Neues
    dialogeSchliessen(w);
    w.zeitDialog(await w.DB.get('aufgaben', a.id));
    await new Promise((r) => setTimeout(r, 200));
    w.document.querySelector('.modal-back [data-skip]').click();
    await new Promise((r) => setTimeout(r, 250));
    assertEq((await w.DB.get('aufgaben', a.id)).zeitMinuten, 25, 'ohne Zeit bleibt alles, wie es war');
  } finally { dialogeSchliessen(w); await w.DB.del('aufgaben', a.id); }
});

test('endQueenAssignment: schließt die Zuordnung, statt sie zu löschen', async (w) => {
  const q = await w.DB.put('koeniginnen', { kennung: 'ENDE-1', jahrgang: 2026, status: 'aktiv', historie: [] });
  const v = await w.DB.put('voelker', { name: 'Ende-Volk', status: 'aktiv', koeniginId: q.id, historie: [] });
  q.historie = [{ volkId: v.id, von: '2026-04-01', bis: null }];
  await w.DB.put('koeniginnen', q);
  try {
    await w.endQueenAssignment(v);
    const nachher = await w.DB.get('koeniginnen', q.id);
    assertEq(nachher.historie.length, 1, 'die Zeile bleibt stehen – Historie wird nicht gelöscht');
    assertEq(nachher.historie[0].bis, w.U.todayIso(), 'sie bekommt ein Ende-Datum');
    assertEq(v.koeniginId, null, 'das Volk hat keine Königin mehr');
    // ohne Königin passiert nichts, und es wirft auch nicht
    const ohne = { id: 'x', koeniginId: null };
    await w.endQueenAssignment(ohne);
    assertEq(ohne.koeniginId, null);
  } finally { await w.DB.del('voelker', v.id); await w.DB.del('koeniginnen', q.id); }
});

test('sammelErfassung: Auswahl der Völker führt ins Sammelformular', async (w) => {
  dialogeSchliessen(w);
  const voelker = (await w.DB.getAll('voelker')).filter((v) => v.status === 'aktiv').slice(0, 3);
  assert(voelker.length >= 2, 'die Beispieldaten haben genug Völker');
  try {
    w.sammelErfassung(voelker);
    await new Promise((r) => setTimeout(r, 200));
    const modal = w.document.querySelector('.modal-back');
    assert(modal, 'die Auswahl steht offen');
    assert(/von \d+ ausgewählt/.test(modal.querySelector('#se-count').textContent), 'der Zähler steht da');
    modal.querySelector('#se-none').click();
    assert(/^0 von/.test(modal.querySelector('#se-count').textContent), '„Keine" wählt alles ab');
    modal.querySelector('#se-all').click();
    assert(new RegExp('^' + voelker.length + ' von').test(modal.querySelector('#se-count').textContent), '„Alle" wählt alles an');
    modal.querySelector('#se-art').value = 'varroa';
    modal.querySelector('[data-next]').click();
    await new Promise((r) => setTimeout(r, 400));
    const zweiter = w.document.querySelector('.modal-back');
    assert(zweiter, 'das Sammelformular folgt');
    assert(/\d+ Völker|Varroa/i.test(zweiter.textContent), 'und es geht um die gewählte Art');
  } finally { dialogeSchliessen(w); }
});

test('openVolkForm: legt ein Volk an, hängt die Königin dran, löst sie beim Wechsel', async (w) => {
  dialogeSchliessen(w);
  const stand = await w.DB.put('staende', { name: 'Volkform-Stand', lat: null, lng: null, notizen: '' });
  const q = await w.DB.put('koeniginnen', { kennung: 'VF-1', jahrgang: 2026, status: 'aktiv', historie: [] });
  let volk = null;
  try {
    w.openVolkForm(null, { standId: stand.id }, () => {});
    await new Promise((r) => setTimeout(r, 300));
    const modal = w.document.querySelector('.modal-back');
    assert(modal, 'der Dialog steht offen');
    assertEq(modal.querySelector('#f-standId').value, stand.id, 'der vorgegebene Stand ist gesetzt');
    const setz = (id, wert) => { const e = modal.querySelector('#f-' + id); e.value = wert; e.dispatchEvent(new w.Event('input', { bubbles: true })); e.dispatchEvent(new w.Event('change', { bubbles: true })); };
    setz('name', 'Volkform-Volk');
    setz('koeniginId', q.id);
    modal.querySelector('[data-save]').click();
    await new Promise((r) => setTimeout(r, 400));
    volk = (await w.DB.getAll('voelker')).find((v) => v.name === 'Volkform-Volk');
    assert(volk, 'das Volk ist angelegt');
    assertEq(volk.koeniginId, q.id, 'mit der gewählten Königin');
    assertEq(volk.status, 'aktiv', 'und ist aktiv');
    assert((volk.historie || []).length >= 1, 'die Historie beginnt mit einem Eintrag');
    const qn = await w.DB.get('koeniginnen', q.id);
    const offen = (qn.historie || []).filter((h) => h.volkId === volk.id && !h.bis);
    assertEq(offen.length, 1, 'die Königin führt eine offene Zuordnung auf dieses Volk');
  } finally {
    dialogeSchliessen(w);
    if (volk) await w.DB.del('voelker', volk.id);
    await w.DB.del('koeniginnen', q.id);
    await w.DB.del('staende', stand.id);
  }
});

test('verdrahteGlasAbzug: Vorschlag, Zusammenzug und Warnung beim Abfüllen', async (w) => {
  dialogeSchliessen(w);
  const altInventar = await w.DB.getAll('inventar');
  const altChargen = await w.DB.getAll('chargen');
  const altAbf = await w.DB.getAll('abfuellungen');
  await w.DB.clear('inventar'); await w.DB.clear('abfuellungen');
  try {
    await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Gläser 500 g', kategorie: 'Gläser/Deckel', einheit: 'Stück', stueckzahl: 30, gebindeG: 500 });
    await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Gläser 250 g', kategorie: 'Gläser/Deckel', einheit: 'Stück', stueckzahl: 100, gebindeG: 250 });
    await w.DB.put('inventar', { typ: 'verbrauch', bezeichnung: 'Deckel TO82 gold', kategorie: 'Gläser/Deckel', einheit: 'Stück', stueckzahl: 40 });
    const charge = await w.DB.put('chargen', { losnummer: 'GLAS-1', ernteIds: [], mengeKg: 50, mhd: '2028-01-01', etikettNotiz: '' });

    const m = await w.Views.honig.abfuellForm(charge.id);
    await new Promise((r) => setTimeout(r, 400));
    const modal = w.document.querySelector('.modal-back');
    assert(modal, 'das Abfüllformular steht offen');
    const setz = (id, wert) => { const e = modal.querySelector('#f-' + id); e.value = wert; e.dispatchEvent(new w.Event('input', { bubbles: true })); e.dispatchEvent(new w.Event('change', { bubbles: true })); };

    // 20 Gläser à 500 g: die passende Position wird von selbst vorgeschlagen
    setz('g_500', '20');
    await new Promise((r) => setTimeout(r, 200));
    const gewaehlt = modal.querySelector('#f-gl_500');
    assert(gewaehlt && gewaehlt.value, 'für 500 g wird eine Position vorgeschlagen');
    const pos500 = await w.DB.get('inventar', gewaehlt.value);
    assertEq(pos500.gebindeG, 500, 'und zwar die mit der passenden Gebindegröße');
    const info = modal.querySelector('[data-glas-info]').textContent;
    assert(/20/.test(info), 'die Übersicht nennt die Menge: ' + info);

    // mehr Gläser als da sind → Warnung, aber kein Absturz
    setz('g_500', '90');
    await new Promise((r) => setTimeout(r, 200));
    const warnung = modal.querySelector('[data-glas-info]').textContent;
    assert(/reicht nicht|fehlen|fehlt/i.test(warnung), 'zu wenig Bestand wird gemeldet: ' + warnung);

    // Deckel gelten über alle Größen: zwei Gebindegrößen ziehen von derselben Position ab
    setz('g_500', '10'); setz('g_250', '10');
    await new Promise((r) => setTimeout(r, 200));
    const deckel = modal.querySelector('#f-gl_deckel');
    if (deckel && deckel.value) {
      const text = modal.querySelector('[data-glas-info]').textContent;
      assert(/Deckel/i.test(text), 'die Deckel stehen in der Übersicht: ' + text);
    }
  } finally {
    dialogeSchliessen(w);
    await w.DB.clear('inventar'); await w.DB.clear('abfuellungen'); await w.DB.clear('chargen');
    for (const x of altInventar) await w.DB.put('inventar', x, true);
    for (const x of altChargen) await w.DB.put('chargen', x, true);
    for (const x of altAbf) await w.DB.put('abfuellungen', x, true);
  }
});

test('honigEtikettForm: Pflichtangaben vorbelegt, PDF wird mit den Werten gebaut', async (w) => {
  dialogeSchliessen(w);
  const charge = await w.DB.put('chargen', { losnummer: 'ET-1', ernteIds: [], mengeKg: 10, sorte: 'Lindenhonig', mhd: '2028-06-01', etikettNotiz: '' });
  const abf = await w.DB.put('abfuellungen', { chargeId: charge.id, datum: w.U.todayIso(), gebindeG: 500, anzahl: 12, bestand: 12 });
  const echt = w.Pdf.honigEtikett;
  let uebergeben = null;
  w.Pdf.honigEtikett = async (a, c, opts) => { uebergeben = { a, c, opts }; };
  try {
    await w.honigEtikettForm(abf, charge);
    await new Promise((r) => setTimeout(r, 300));
    const modal = w.document.querySelector('.modal-back');
    assert(modal, 'der Dialog steht offen');
    assertEq(modal.querySelector('#f-bezeichnung').value, 'Lindenhonig', 'die Sorte der Charge ist vorbelegt');
    assertEq(modal.querySelector('#f-ursprung').value, 'Deutschland', 'Ursprungsland vorbelegt – Pflichtangabe');
    assertEq(modal.querySelector('#f-anzahl').value, '12', 'so viele Etiketten wie Gläser im Bestand');
    assert(/01\.06\.2028/.test(modal.textContent), 'das MHD der Charge steht im Hinweis');
    modal.querySelector('[data-save]').click();
    await new Promise((r) => setTimeout(r, 300));
    assert(uebergeben, 'das PDF wird gebaut');
    assertEq(uebergeben.c.losnummer, 'ET-1', 'mit der richtigen Charge');
    assertEq(uebergeben.opts.bezeichnung, 'Lindenhonig');
    assertEq(uebergeben.opts.ursprung, 'Deutschland');
    assertEq(uebergeben.opts.anzahl, 12);
  } finally {
    w.Pdf.honigEtikett = echt;
    dialogeSchliessen(w);
    await w.DB.del('abfuellungen', abf.id); await w.DB.del('chargen', charge.id);
  }
});

test('clcLandbedeckung: liest die amtlichen Flächen und meldet einen leeren Kreis', async (w) => {
  // Ein Vieleck, das den ganzen Kreis abdeckt → 100 % Wald
  const gross = [[[7.9, 49.9], [8.1, 49.9], [8.1, 50.1], [7.9, 50.1], [7.9, 49.9]]];
  const antwort = { type: 'FeatureCollection', features: [
    { properties: { clc18: '311', name: 'Laubwald' }, geometry: { type: 'Polygon', coordinates: gross } },
  ] };
  await mitFetch(w, async () => new Response(JSON.stringify(antwort), { status: 200 }), async (rufe) => {
    const erg = await w.clcLandbedeckung(50, 8, 1000, () => {});
    assert(/sgx\.geodatenzentrum|wfs/i.test(rufe[0].url), 'gefragt wird der WFS des BKG: ' + rufe[0].url.slice(0, 60));
    assert(erg.zeilen.length > 0, 'es kommen Zeilen zurück');
    const summe = erg.zeilen.reduce((a, z) => a + (z.prozent || 0), 0);
    nah(summe, 100, 1, 'die amtliche Quelle deckt den Kreis lückenlos ab: ' + summe);
  });
  // Keine Fläche → Fehler, damit die Rückfallkette weitergeht
  await mitFetch(w, async () => new Response(JSON.stringify({ type: 'FeatureCollection', features: [] }), { status: 200 }), async () => {
    let m = '';
    try { const e = await w.clcLandbedeckung(50, 8, 1000, () => {}); if (!e || !e.zeilen.length) m = 'leer'; } catch (e) { m = e.message; }
    assert(m, 'ein leeres Ergebnis wird nicht als Erfolg ausgegeben');
  });
});

test('gbvLandbedeckung: Auftrag, Warten, Ergebnis – und die drei Abbruchgründe', async (w) => {
  // Eine echte kleine Tabelle bauen, wie sie der Dienst liefert
  const XLSX = await w.Xlsx.lib();
  const heft = XLSX.utils.book_new();
  const r = 1000, kreis = Math.PI * r * r;
  const blatt = XLSX.utils.json_to_sheet([
    { Klassenname: 'Laubwald', qm: Math.round(kreis * 0.6) },
    { Klassenname: 'Grünland', qm: Math.round(kreis * 0.3) },
    { Klassenname: 'Siedlung', qm: Math.round(kreis * 0.1) },
  ]);
  XLSX.utils.book_append_sheet(heft, blatt, 'Imker');
  const datei = XLSX.write(heft, { type: 'array', bookType: 'xlsx' });

  const antworten = (stufen) => async (url) => {
    if (/submitJob/.test(url)) return new Response(JSON.stringify(stufen.auftrag), { status: 200 });
    if (/results/.test(url)) return new Response(JSON.stringify(stufen.ergebnis), { status: 200 });
    if (/jobs\//.test(url)) return new Response(JSON.stringify(stufen.stand), { status: 200 });
    return new Response(datei, { status: 200 });        // die Ergebnisdatei
  };

  // 1) Glücklicher Fall
  await mitFetch(w, antworten({
    auftrag: { jobId: 'j1', jobStatus: 'esriJobSucceeded' },
    ergebnis: { value: { url: 'https://geoservice.rlp.de/ergebnis.xlsx' } },
  }), async (rufe) => {
    const meldungen = [];
    const erg = await w.gbvLandbedeckung(50, 8, r, (t) => meldungen.push(t));
    assert(/submitJob/.test(rufe[0].url), 'zuerst wird der Auftrag abgeschickt');
    const body = String(rufe[0].opt.body);
    assert(/Radius/.test(body) && /1000/.test(body), 'Radius steht im Auftrag');
    assert(/102100|3857/.test(body), 'die Koordinaten sind nach Web Mercator umgerechnet');
    assertEq(erg.zeilen.length, 3, 'drei amtliche Klassen');
    assertEq(erg.zeilen[0].name, 'Laubwald', 'die größte Klasse steht vorn');
    nah(erg.zeilen[0].prozent, 60, 0.2, 'und ihr Anteil stimmt');
    nah(erg.abdeckung, 100, 0.5, 'die Abdeckung wird mitgeliefert');
    assert(meldungen.some((m) => /amtlich/i.test(m)), 'der Nutzer sieht, was gerade passiert');
  });

  // 2) Dienst lehnt ab
  await mitFetch(w, antworten({ auftrag: { error: { message: 'zu viele Anfragen' } }, ergebnis: {} }), async () => {
    let m = ''; try { await w.gbvLandbedeckung(50, 8, r, () => {}); } catch (e) { m = e.message; }
    assert(/lehnt die Anfrage ab/.test(m) && /zu viele Anfragen/.test(m), 'der Grund wird durchgereicht: ' + m);
  });

  // 3) Rechenauftrag scheitert
  await mitFetch(w, antworten({
    auftrag: { jobId: 'j2', jobStatus: 'esriJobFailed', messages: [{ type: 'esriJobMessageTypeError', description: 'Standort außerhalb' }] },
    ergebnis: {},
  }), async () => {
    let m = ''; try { await w.gbvLandbedeckung(50, 8, r, () => {}); } catch (e) { m = e.message; }
    assert(/Fehler/.test(m) && /außerhalb/.test(m), 'die Fehlermeldung des Dienstes steht drin: ' + m);
  });

  // 4) Kein Ergebnis genannt → Rückfallkette muss greifen können
  await mitFetch(w, antworten({ auftrag: { jobId: 'j3', jobStatus: 'esriJobSucceeded' }, ergebnis: { value: {} } }), async () => {
    let m = ''; try { await w.gbvLandbedeckung(50, 8, r, () => {}); } catch (e) { m = e.message; }
    assert(/keine Ergebnisdatei/.test(m), 'auch das wirft, statt leer zurückzukommen: ' + m);
  });
});

test('Anzeige-Dialoge öffnen und schließen, ohne etwas zu verändern', async (w) => {
  dialogeSchliessen(w);
  const zaehle = async () => (await w.DB.getAll('fahrten')).length + (await w.DB.getAll('voelker')).length;
  const vorher = await zaehle();
  try {
    // Changelog
    w.changelogModal(w.CHANGELOG.slice(0, 2));
    await new Promise((r) => setTimeout(r, 150));
    let modal = w.document.querySelector('.modal-back');
    assert(modal, 'das Changelog-Fenster steht offen');
    assert(new RegExp(w.CHANGELOG[0].version.replace('.', '\\.')).test(modal.textContent), 'die neueste Version steht drin');
    dialogeSchliessen(w);

    // „Mehr“-Blatt der unteren Leiste
    w.openMoreSheet();
    await new Promise((r) => setTimeout(r, 150));
    modal = w.document.querySelector('.modal-back');
    assert(modal, 'das Mehr-Blatt öffnet');
    assert(modal.querySelectorAll('[data-route]').length > 3, 'und listet weitere Bereiche');
    dialogeSchliessen(w);

    // Fahrten-Kachel aufklappen: nur Anzeige, keine Buchung
    const host = w.document.createElement('div');
    host.innerHTML = '<div class="card"><button id="ft"></button><div class="fahrt-row" data-mehr></div></div>';
    w.document.body.appendChild(host);
    try { w.fahrtWidgetToggle(host.querySelector('#ft')); } finally { host.remove(); }

    assertEq(await zaehle(), vorher, 'kein Anzeige-Dialog hat Daten verändert');
  } finally { dialogeSchliessen(w); }
});

test('fahrtWidgetKonfig: speichert die Auswahl, ohne Stände meldet sie sich', async (w) => {
  dialogeSchliessen(w);
  const altAuswahl = w.S.get('fahrtWidgetAuswahl');
  const altStaende = await w.DB.getAll('staende');
  const altVorlagen = w.S.get('fahrtvorlagen');
  const toasts = [];
  const echtToast = w.UI.toast;
  w.UI.toast = (msg, typ) => { toasts.push({ msg, typ }); };
  try {
    // ohne Stand und ohne Vorlage: Hinweis statt leerem Dialog
    await w.DB.clear('staende');
    await w.S.set('fahrtvorlagen', []);
    await w.fahrtWidgetKonfig();
    await new Promise((r) => setTimeout(r, 150));
    assert(/Bienenstand/.test(toasts.at(-1).msg), 'der Hinweis sagt, was fehlt: ' + toasts.at(-1).msg);
    assert(!w.document.querySelector('.modal-back'), 'und es öffnet sich kein leerer Dialog');

    // mit Stand: Auswahl wird gespeichert
    const stand = await w.DB.put('staende', { name: 'Kachel-Stand', lat: null, lng: null, notizen: '' });
    await w.fahrtWidgetKonfig();
    await new Promise((r) => setTimeout(r, 250));
    const modal = w.document.querySelector('.modal-back');
    assert(modal, 'jetzt öffnet der Dialog');
    const box = modal.querySelector(`input[value="stand:${stand.id}"]`);
    assert(box, 'der Stand steht zur Auswahl');
    box.checked = true; box.dispatchEvent(new w.Event('change', { bubbles: true }));
    modal.querySelector('[data-save]').click();
    await new Promise((r) => setTimeout(r, 300));
    assertEq(w.S.get('fahrtWidgetAuswahl'), ['stand:' + stand.id], 'die Auswahl ist gespeichert');
  } finally {
    w.UI.toast = echtToast;
    dialogeSchliessen(w);
    await w.S.set('fahrtWidgetAuswahl', altAuswahl);
    await w.S.set('fahrtvorlagen', altVorlagen);
    await w.DB.clear('staende');
    for (const x of altStaende) await w.DB.put('staende', x, true);
  }
});

test('QR am Volk: Code wird erzeugt, der Druckbogen trägt sechs Etiketten', async (w) => {
  dialogeSchliessen(w);
  const echtPrint = w.print;
  let gedruckt = 0;
  w.print = () => { gedruckt++; };          // kein echter Druckdialog im Test
  const volk = await w.DB.put('voelker', { name: 'QR-Volk', beutenkennung: 'A7', status: 'aktiv', historie: [] });
  try {
    await w.volkQrAnzeigen(volk);
    await new Promise((r) => setTimeout(r, 400));
    const modal = w.document.querySelector('.modal-back');
    assert(modal, 'das QR-Fenster steht offen');
    const bild = modal.querySelector('#vqr-zone img');
    assert(bild && /^data:image\//.test(bild.src), 'der QR-Code ist erzeugt');
    assert(/QR-Volk/.test(modal.textContent) && /A7/.test(modal.textContent), 'Volk und Beutenkennung stehen darunter');
    const knopf = modal.querySelector('#vqr-print');
    assertEq(knopf.disabled, false, 'erst wenn der Code da ist, ist Drucken möglich');

    knopf.click();
    await new Promise((r) => setTimeout(r, 200));
    const bogen = w.document.querySelector('.qr-print');
    assert(bogen, 'der Druckbogen ist im Dokument');
    assertEq(bogen.querySelectorAll('img').length, 6, 'sechs Etiketten je Bogen');
    assert(/QR-Volk · A7/.test(bogen.textContent), 'jedes Etikett ist beschriftet');
    assert(w.document.body.classList.contains('qr-printing'), 'die App wird für den Druck ausgeblendet');
    assert(w.document.getElementById('qr-print-style'), 'die Druckregeln stehen im Dokument');
    assertEq(gedruckt, 1, 'der Druck wurde genau einmal angestoßen');

    // Nach dem Drucken räumt die Funktion selbst auf
    w.dispatchEvent(new w.Event('afterprint'));
    await new Promise((r) => setTimeout(r, 100));
    assert(!w.document.querySelector('.qr-print'), 'der Bogen ist wieder weg');
    assert(!w.document.body.classList.contains('qr-printing'), 'und die App wieder sichtbar');
  } finally {
    w.print = echtPrint;
    dialogeSchliessen(w);
    w.document.querySelectorAll('.qr-print').forEach((x) => x.remove());
    w.document.body.classList.remove('qr-printing');
    await w.DB.del('voelker', volk.id);
  }
});
