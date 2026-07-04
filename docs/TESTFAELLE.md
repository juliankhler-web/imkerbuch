# ImkerBuch – Testfälle & Testsetup (Docs as Code)

> Stand: 2026-07-04 · Automatisiert: **32 Testfälle, alle grün**

## Testsetup

**Automatisierte Tests** liegen als Code in `tests/tests.js` und laufen im Browser:

1. Server starten: `python3 -m http.server 8931 -d ~/ImkerApp`
2. `http://localhost:8931/tests/test.html` öffnen → Tests starten automatisch („Tests ausführen“ wiederholt).

Funktionsweise:
- Die Testseite lädt die App in einem unsichtbaren iframe mit `../index.html?testdb=1`.
- Der Parameter `testdb` schaltet die App auf die **eigene IndexedDB `imkerbuch-test`** (echte Daten bleiben unberührt) und überspringt den Einrichtungsassistenten.
- Vor jedem Lauf wird `imkerbuch-test` gelöscht → deterministischer Startzustand.
- Der Service Worker cached `/tests/` und `?testdb`-URLs **nie** (immer frischer Code).
- Die App signalisiert Bereitschaft über `window.appReady`; ihre Namespaces (`U`, `DB`, `S`, `Backup`, …) sind explizit am `window` exportiert und damit im iframe zugreifbar.
- Ein Testfall = `test('Name', async (w) => { … })`, `w` = App-Fenster. Helfer: `assert`, `assertEq`, `assertNah`.

**Regel:** Nach jedem Umbau und vor jedem „fertig“ die Suite laufen lassen. Neue Fachlogik (Berechnungen, Merge-/Bestandsregeln) bekommt einen Testfall im selben Schritt.

## Automatisierte Testfälle (tests/tests.js)

| # | Testfall | Prüft |
|---|---|---|
| 1 | U.parseNum: deutsches Zahlenformat | `1.234,56` → 1234.56, Komma, Punkt, NaN-Fälle |
| 2 | U.fmtDate / fmtNum / fmtEur | `TT.MM.JJJJ`, Dezimalkomma, €-Format, null → „–“ |
| 3 | U.addDays / daysBetween | Monats-/Jahresgrenzen |
| 4 | dataURL↔Blob Roundtrip | MIME + Inhalt bleiben erhalten |
| 5 | queenColor | internationale Zeichenfarben 2022–2027 |
| 6 | zuchtTermine | Offsets 0/2/10/12/13/19/28, Schlupf = Tag 12 |
| 7 | rechnungSummen | Brutto, USt 7/19 % herausgerechnet, §19 ohne USt |
| 8 | zielIdAus / zielFormValues | Volk/Stand-Auflösung, Fehler bei fehlender Auswahl |
| 9 | DB.put | UUID, createdAt, lastModified, get |
| 10 | softDel → Papierkorb → Restore | Original weg, im Korb, Wiederherstellung vollständig |
| 11 | DB.purgeTrash | nur Einträge > 30 Tage werden entfernt |
| 12 | applyMerge: neuer gewinnt | Merge per UUID+lastModified, keine Duplikate |
| 13 | applyMerge: älterer verliert | älterer Import überschreibt nicht |
| 14 | applyMerge: Anhang ohne Datei | Metadaten ohne Blob werden übersprungen |
| 15 | buildData + applyReplace | Export→Restore-Roundtrip erhält alle Store-Zählungen |
| 16 | Backup-Dateiname | `imkerbuch-backup-JJJJ-MM-TT-HHMM.json` |
| 17 | snapshotInternal | rollierend max. 10, keine Blobs, nicht rekursiv |
| 18 | S.set/S.get | Settings persistieren über Neuladen |
| 19 | reminderInfo | Stufen ok / gelb (≥7 Tage) / rot (≥14 Tage) |
| 20 | Notif.faellige | überfällig + heute; erledigte/zukünftige/ohne Datum ausgenommen |
| 21 | Notif.icsFuerAufgaben | gültiges VCALENDAR, nur offene mit Datum, Alarm, Escaping, stabile UID |
| 22 | PdfImport.parse: Erkennung | Behandlung/Ernte aus Datum + Stichwort, TT.MM.JJ(JJ) → ISO |
| 23 | PdfImport.parse: Dedup | gleiches Datum + Stichwort nur einmal |
| 24 | verkaufErfassen | Bestand 10→7, Einnahme im Kassenbuch, Überverkauf abgelehnt ohne Nebenwirkung |
| 25 | verkaufStornieren | Bestand wiederhergestellt, Buchung + Verkauf im Papierkorb |
| 26 | Reporting.zeiten | Minuten → Stunden je Tätigkeit, null-Kategorie → „Sonstiges“, sortiert |
| 27 | UI.pie | SVG-Segmente, Prozentanteile, Gesamtsumme, leerer Zustand |
| 28 | varroaAmpel | saisonale Schwellen (Juli/Januar), Grenzwert = grün |
| 29 | Reporting.fahrtStatistik | km + Fahrten je Jahr, ohne Datum ignoriert, absteigend sortiert |
| 30 | Version & Changelog | APP_VERSION = neuester Eintrag, vollständige Einträge, keine Duplikate |
| 31 | Regression: Listener-Leak | Seitenwechsel Trachten→Zucht: Klick öffnet Zucht-Detail, kein fremdes Formular (renderRoute ersetzt `#main` pro Render) |
| 32 | syncZuchtAufgaben | 7 Aufgaben je Serie, erneuter Sync dupliziert nicht |

## Manuelle Smoke-Checkliste (nicht automatisierbar)

Nach größeren Umbauten einmal am echten Gerät durchgehen:

- [ ] **PWA**: „Zum Home-Bildschirm“ installieren, offline öffnen (Flugmodus), Icon/Splash korrekt
- [ ] **Kamera**: Foto-Anhang am Smartphone öffnet direkt die Kamera; Bild landet verkleinert in der Galerie
- [ ] **Mikrofon**: Sprachnotiz aufnehmen/abspielen; Live-Diktat in Chrome; Whisper-Transkription (einmalig ~250 MB Download)
- [ ] **OCR**: „Text aus Foto übernehmen“ mit Etikett/Druckschrift
- [ ] **Sicherung senden**: Teilen-Dialog mit Datei (Mobil); Desktop-Fallback = Download + mailto
- [ ] **Auto-Backup-Ordner**: Chrome/Edge Desktop – Ordner wählen, Intervall „täglich“, Datei erscheint
- [ ] **Import**: Backup auf zweitem Gerät „Zusammenführen“ → keine Duplikate; „Ersetzen“ → Doppel-Bestätigung inkl. „ERSETZEN“-Tippen
- [ ] **Geolocation**: „Aktuellen Standort übernehmen“ am Stand, Kartenlinks stimmen
- [ ] **PDFs**: Bestandsbuch, Rechnung (mit Logo + QR), Komplettausdruck – Layout, Umlaute, Seitenzahlen
- [ ] **Druck**: Listenansicht drucken (Topbar-Button), QR-Etikettenbogen
- [ ] **Dark Mode** + Systemwechsel, Responsive: Bottom-Nav mobil / Sidebar Desktop
- [ ] **Erinnerungen** (als installierte Home-Screen-App): Schalter aktivieren → iOS fragt Berechtigung; Probe-Benachrichtigung erscheint; Badge-Zähler am Icon bei fälliger Aufgabe; .ics-Export in Apple Kalender importieren → Alarm 08:00 am Fälligkeitstag

## Bekannte Test-Lücken (bewusst)
- UI-Klickpfade (Modals, Formulare) sind nicht automatisiert – abgedeckt durch die manuelle Checkliste; die Fachlogik dahinter ist über die Unit-/Integrationstests abgesichert.
- PDF-/Excel-Inhalte werden nicht byteweise geprüft (nur fehlerfreie Erzeugung, manuell gesichtet).
