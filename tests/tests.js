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
  assertEq(t.map((x) => x.tag), [0, 2, 10, 12, 13, 19, 28], 'Tages-Offsets');
  assertEq(t[0].datum, '2026-07-03', 'Umlarven = Starttag');
  assertEq(t.find((x) => x.titel.includes('Schlupf')).datum, '2026-07-15', 'Schlupf Tag 12');
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

/* ---------- Regression: Router ersetzt #main (Listener-Leak) ---------- */
test('Regression: View-Listener leaken nicht über Seitenwechsel', async (w) => {
  // Bug 2026-07-03: Trachten-Listener blieb an #main hängen und öffnete beim
  // Klick auf eine Zuchtserie das „Neue Tracht"-Formular. renderRoute muss
  // #main pro Render durch einen listenerfreien Klon ersetzen.
  await w.DB.put('trachten', { bezeichnung: 'Leak-Tracht', pflanze: '', von: '', bis: '', region: '', standIds: [] });
  await w.DB.put('zuchtserien', { name: 'Leak-Serie', startdatum: '2026-07-01', anzahl: 5, termine: w.zuchtTermine('2026-07-01'), notiz: '' });
  const warte = () => new Promise((r) => setTimeout(r, 450));
  w.location.hash = '#/trachten'; await warte();
  w.location.hash = '#/zucht'; await warte();
  w.document.querySelector('.row[data-id]').click(); await warte();
  const m = w.document.querySelector('.modal');
  assert(m, 'Modal geöffnet');
  assert(m.innerText.includes('Umlarven'), 'Zucht-Detail geöffnet – nicht das Formular einer fremden View');
  m.querySelector('[data-close]').click(); await warte();
  w.location.hash = '#/dashboard'; await warte();
});

/* ---------- Verkauf: Lagerabzug + Kassenbuch-Automatik ---------- */
test('verkaufErfassen: mindert Bestand, bucht Einnahme, lehnt Überverkauf ab', async (w) => {
  const c = await w.DB.put('chargen', { losnummer: 'T-01', abfuelldatum: '2026-06-01', ernteIds: [], glasGroesseG: 500, anzahlGlaeser: 10, bestandGlaeser: 10, mhd: '', etikettNotiz: '' });
  const v = await w.verkaufErfassen({ chargeId: c.id, anzahl: 3, preisJeGlas: 6.5 });
  assertEq((await w.DB.get('chargen', c.id)).bestandGlaeser, 7, 'Bestand 10 → 7');
  assertNah(v.betrag, 19.5, 0.001, 'Betrag = Anzahl × Preis');
  const kb = await w.DB.get('kassenbuch', v.kassenbuchId);
  assert(kb && kb.typ === 'einnahme' && kb.kategorie === 'Honigverkauf', 'Einnahme im Kassenbuch');
  assertNah(kb.betrag, 19.5, 0.001, 'Kassenbuch-Betrag');
  let fehler = false;
  try { await w.verkaufErfassen({ chargeId: c.id, anzahl: 99, preisJeGlas: 1 }); } catch (e) { fehler = true; }
  assert(fehler, 'Überverkauf wirft Fehler');
  assertEq((await w.DB.get('chargen', c.id)).bestandGlaeser, 7, 'Bestand nach Fehlversuch unverändert');
});
test('verkaufStornieren: Bestand zurück, Buchung + Verkauf im Papierkorb', async (w) => {
  const c = await w.DB.put('chargen', { losnummer: 'T-02', abfuelldatum: '2026-06-01', ernteIds: [], glasGroesseG: 250, anzahlGlaeser: 5, bestandGlaeser: 5, mhd: '', etikettNotiz: '' });
  const v = await w.verkaufErfassen({ chargeId: c.id, anzahl: 2, preisJeGlas: 4 });
  await w.verkaufStornieren(v.id);
  assertEq((await w.DB.get('chargen', c.id)).bestandGlaeser, 5, 'Bestand wiederhergestellt');
  assert(!(await w.DB.get('verkaeufe', v.id)), 'Verkauf entfernt');
  assert(!(await w.DB.get('kassenbuch', v.kassenbuchId)), 'Buchung entfernt');
  const korb = await w.DB.getAll('papierkorb');
  assert(korb.some((t) => t.store === 'kassenbuch' && t.daten.id === v.kassenbuchId), 'Buchung liegt im Papierkorb');
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
  const nah = await w.DB.put('chargen', { losnummer: 'MHD-nah', abfuelldatum: '2026-01-01', ernteIds: [], glasGroesseG: 500, anzahlGlaeser: 10, bestandGlaeser: 5, mhd: inTagen(30) });
  const fern = await w.DB.put('chargen', { losnummer: 'MHD-fern', abfuelldatum: '2026-01-01', ernteIds: [], glasGroesseG: 500, anzahlGlaeser: 10, bestandGlaeser: 5, mhd: inTagen(400) });
  const leer = await w.DB.put('chargen', { losnummer: 'MHD-leer', abfuelldatum: '2026-01-01', ernteIds: [], glasGroesseG: 500, anzahlGlaeser: 10, bestandGlaeser: 0, mhd: inTagen(10) });
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

test('Vorschlagslisten & Inventar-Kategorien vorhanden', (w) => {
  ['futter', 'einheit', 'inventar'].forEach((k) => assert(Array.isArray(w.VORSCHLAEGE[k]) && w.VORSCHLAEGE[k].length > 0, `VORSCHLAEGE.${k} gefüllt`));
  assert(w.INVENTAR_KATEGORIEN.includes('Behandlungsmittel') && w.INVENTAR_KATEGORIEN.includes('Futter'), 'neue Inventar-Kategorien vorhanden');
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
test('syncZuchtAufgaben: 7 Termine als Aufgaben', async (w) => {
  const serie = await w.DB.put('zuchtserien', { name: 'Test-Serie', startdatum: '2026-07-01', anzahl: 10, termine: w.zuchtTermine('2026-07-01'), notiz: '' });
  await w.syncZuchtAufgaben(serie);
  const tasks = (await w.DB.getAll('aufgaben')).filter((a) => a.quelle === 'zucht' && a.refId === serie.id);
  assertEq(tasks.length, 7, 'eine Aufgabe je Kalenderschritt');
  await w.syncZuchtAufgaben(serie); // erneut → keine Duplikate
  const nochmal = (await w.DB.getAll('aufgaben')).filter((a) => a.quelle === 'zucht' && a.refId === serie.id);
  assertEq(nochmal.length, 7, 'Sync ersetzt statt dupliziert');
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
