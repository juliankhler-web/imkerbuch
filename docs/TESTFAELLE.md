# ImkerBuch – Testfälle & Testsetup (Docs as Code)

> Stand: 2026-07-04 · Automatisiert: **39 Testfälle, alle grün**

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
| 1 | Name | — |
| 2 | U.parseNum | deutsches Zahlenformat |
| 3 | U.fmtDate / fmtNum / fmtEur | — |
| 4 | U.addDays / daysBetween (Monats-/Jahresgrenzen) | — |
| 5 | U.dataURLToBlob / blobToDataURL Roundtrip | — |
| 6 | queenColor | internationale Zeichenfarben |
| 7 | zuchtTermine | Zuchtkalender ab Umlarvtag |
| 8 | rechnungSummen | Brutto & enthaltene USt |
| 9 | zielIdAus / zielFormValues (Formular-Helfer) | — |
| 10 | DB.put vergibt UUID, createdAt, lastModified | — |
| 11 | DB.softDel → Papierkorb → trashRestore | — |
| 12 | DB.purgeTrash | nur Einträge > 30 Tage löschen |
| 13 | Backup.applyMerge | neuer gewinnt, keine Duplikate |
| 14 | Backup.applyMerge | älterer Import verliert |
| 15 | Backup.applyMerge | Anhang ohne Datei wird übersprungen |
| 16 | Backup.buildData + applyReplace | Roundtrip erhält Daten |
| 17 | Backup | Dateiname imkerbuch-backup-JJJJ-MM-TT-HHMM.json |
| 18 | Backup.snapshotInternal | rollierend, ohne Anhang-Blobs |
| 19 | S.set / S.get Roundtrip (persistiert) | — |
| 20 | Backup.reminderInfo | Stufen ok/gelb/rot |
| 21 | Notif.faellige | überfällig + heute, ohne erledigte/zukünftige/ohne Datum |
| 22 | Notif.icsFuerAufgaben | gültiger Kalender mit Alarm und Escaping |
| 23 | PdfImport.parse | erkennt Behandlung und Ernte am Datum + Stichwort |
| 24 | PdfImport.parse | dedupliziert gleiche Treffer |
| 25 | Regression | View-Listener leaken nicht über Seitenwechsel |
| 26 | verkaufErfassen | mindert Bestand, bucht Einnahme, lehnt Überverkauf ab |
| 27 | verkaufStornieren | Bestand zurück, Buchung + Verkauf im Papierkorb |
| 28 | Reporting.zeiten | Minuten → Stunden je Tätigkeit, ohne Kategorie = Sonstiges |
| 29 | UI.pie | Donut mit Anteilen und Legende |
| 30 | koeniginStammbaumHtml | Ahnenlinie aufwärts + Töchter |
| 31 | koeniginStammbaumHtml | Zyklen brechen ab (kein Endlos) |
| 32 | Importer.parseDate | erkennt gängige Datumsformate → ISO |
| 33 | Importer | Spalten-Auto-Zuordnung + Import mit Referenzauflösung |
| 34 | Importer | Durchsicht ohne existierendes Volk wird übersprungen |
| 35 | pruefeMhd | warnt bei nahem/überschrittenem MHD, nicht bei fernem, keine Duplikate |
| 36 | varroaAmpelBefall + varroaMetrik | Milben je 100 Bienen |
| 37 | varroaAmpel | saisonale Schwellen (Juli streng, Januar sehr streng) |
| 38 | Reporting.fahrtStatistik | Kilometer und Fahrten je Jahr |
| 39 | Version & Changelog konsistent (Update-Fenster-Grundlag | — |
| 40 | syncZuchtAufgaben | 7 Termine als Aufgaben |

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
- [ ] **Marktverkauf** am Handy: Kacheln antippen, Preis setzen, Wechselgeld, Kassieren → Bestand + Kassenbuch stimmen
- [ ] **Dark Mode** + Systemwechsel, Responsive: Bottom-Nav mobil / Sidebar Desktop
- [ ] **Erinnerungen** (als installierte Home-Screen-App): Schalter aktivieren → iOS fragt Berechtigung; Probe-Benachrichtigung erscheint; Badge-Zähler am Icon bei fälliger Aufgabe; .ics-Export in Apple Kalender importieren → Alarm 08:00 am Fälligkeitstag

## Bekannte Test-Lücken (bewusst)
- UI-Klickpfade (Modals, Formulare) sind nicht automatisiert – abgedeckt durch die manuelle Checkliste; die Fachlogik dahinter ist über die Unit-/Integrationstests abgesichert.
- PDF-/Excel-Inhalte werden nicht byteweise geprüft (nur fehlerfreie Erzeugung, manuell gesichtet).
