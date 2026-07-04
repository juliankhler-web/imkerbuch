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
