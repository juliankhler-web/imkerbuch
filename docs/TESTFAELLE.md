# ImkerBuch – Testfälle & Testsetup (Docs as Code)

> Stand: 2026-07-07 · Automatisiert: **52 Testfälle, alle grün**

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
| 1 | U.parseNum | deutsches Zahlenformat |
| 2 | U.fmtDate / fmtNum / fmtEur | — |
| 3 | U.addDays / daysBetween (Monats-/Jahresgrenzen) | — |
| 4 | U.dataURLToBlob / blobToDataURL Roundtrip | — |
| 5 | queenColor | internationale Zeichenfarben |
| 6 | zuchtTermine | Zuchtkalender ab Umlarvtag |
| 7 | rechnungSummen | Brutto & enthaltene USt |
| 8 | zielIdAus / zielFormValues (Formular-Helfer) | — |
| 9 | DB.put vergibt UUID, createdAt, lastModified | — |
| 10 | DB.softDel → Papierkorb → trashRestore | — |
| 11 | DB.purgeTrash | nur Einträge > 30 Tage löschen |
| 12 | Backup.applyMerge | neuer gewinnt, keine Duplikate |
| 13 | Backup.applyMerge | älterer Import verliert |
| 14 | Backup.applyMerge | Anhang ohne Datei wird übersprungen |
| 15 | Backup.buildData + applyReplace | Roundtrip erhält Daten |
| 16 | Backup | Dateiname imkerbuch-backup-JJJJ-MM-TT-HHMM.json |
| 17 | Backup.snapshotInternal | rollierend, ohne Anhang-Blobs |
| 18 | S.set / S.get Roundtrip (persistiert) | — |
| 19 | Backup.reminderInfo | Stufen ok/gelb/rot |
| 20 | Notif.faellige | überfällig + heute, ohne erledigte/zukünftige/ohne Datum |
| 21 | Notif.icsFuerAufgaben | gültiger Kalender mit Alarm und Escaping |
| 22 | PdfImport.parse | erkennt Behandlung und Ernte am Datum + Stichwort |
| 23 | PdfImport.parse | dedupliziert gleiche Treffer |
| 24 | Regression | View-Listener leaken nicht über Seitenwechsel |
| 25 | verkaufErfassen | mindert Bestand, bucht Einnahme, lehnt Überverkauf ab |
| 26 | verkaufStornieren | Bestand zurück, Buchung + Verkauf im Papierkorb |
| 27 | Reporting.zeiten | Minuten → Stunden je Tätigkeit, ohne Kategorie = Sonstiges |
| 28 | UI.pie | Donut mit Anteilen und Legende |
| 29 | koeniginStammbaumHtml | Ahnenlinie aufwärts + Töchter |
| 30 | koeniginStammbaumHtml | Zyklen brechen ab (kein Endlos) |
| 31 | Importer.parseDate | erkennt gängige Datumsformate → ISO |
| 32 | Importer | Spalten-Auto-Zuordnung + Import mit Referenzauflösung |
| 33 | Importer | Durchsicht ohne existierendes Volk wird übersprungen |
| 34 | pruefeMhd | warnt bei nahem/überschrittenem MHD, nicht bei fernem, keine Duplikate |
| 35 | varroaAmpelBefall + varroaMetrik | Milben je 100 Bienen |
| 36 | varroaAmpel | saisonale Schwellen (Juli streng, Januar sehr streng) |
| 37 | Reporting.fahrtStatistik | Kilometer und Fahrten je Jahr |
| 38 | gelernteWerte | Presets + gelernte DB-Werte, dedupliziert & sortiert |
| 39 | Vorschlagslisten & Inventar-Kategorien | futter/einheit/inventar gefüllt, neue Kategorien vorhanden |
| 40 | pageHead | Aktionen in eigenem .ph-actions-Container (verhindert Titel/Button-Overlap) |
| 41 | U.fmtDate | Datum ohne Zeitzonen-Drift (string-basiert, kein new Date) |
| 42 | U.addDays | Tageswechsel über Monats-/DST-/Jahresgrenzen ohne Drift |
| 43 | UI.formModal | Save-Pfad zuverlässig: Komma-Zahl, Datum unverändert, Pflichtfeld/NaN blockt, Modal schließt nur bei Erfolg |
| 44 | fahrtSchnellBuchen | Ein-Klick bucht Hin-/Rückweg (2 × Entfernung), heutiges Datum, ins Fahrtenbuch |
| 45 | fahrtSchnellBuchen | ohne hinterlegte Entfernung → Formular statt Sofortbuchung |
| 46 | rechnungSummen | § 24 Pauschalierung: enthaltene pauschale USt = brutto × 7,8/107,8 |
| 47 | rechnungSteuerart + rechnungHinweis | drei Steuermodelle (Regel/§19/§24) inkl. Rückwärtskompatibilität + korrekte Rechtstexte |
| 48 | DASH_WIDGETS | alle Dashboard-Widgets (inkl. Fahrt + Zeiterfassung) liefern HTML ohne Fehler |
| 49 | Version & Changelog konsistent | Update-Fenster-Grundlage |
| 50 | syncZuchtAufgaben | 7 Termine als Aufgaben |
| 51 | Demo.create/reset | Beispieldaten befüllen alle Module ohne Fehler (≥13 Völker, Königinnen, Ernten, Rechnungen, Chargen, Zeiterfassung) |
| 52 | brandLogoSvg (Homescreen-Logo) | Neues Marken-Logo (3 Waben, eindeutige Gradient-IDs); Header/Sidebar zeigen es als Standard – nur wenn KEIN eigenes Logo gesetzt ist; ein eigenes Nutzer-Logo wird nicht überschrieben; `logoSvg()` (PDFs) bleibt |

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
