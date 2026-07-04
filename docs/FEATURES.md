# ImkerBuch – Feature-Liste (Docs as Code)

> Vollständige Checkliste aller Funktionen aus dem Anforderungs-Prompt.
> Status: ✅ fertig · 🔧 in Arbeit · ⬜ offen. Abweichungen sind je Punkt vermerkt und in
> [ARCHITEKTUR.md → Entscheidungen](ARCHITEKTUR.md#design-entscheidungen) begründet.
> Stand: 2026-07-03

## Branding & PWA
- ✅ Waben-Logo (3 Hexagone, 1 gefüllt Amber, 2 Outline Anthrazit) als Inline-SVG (`logoSvg()`)
- ✅ App-Icons 192/512 (+180 Apple) aus dem Logo (`icons.py`), Favicon als SVG-Data-URI
- ✅ `manifest.json`, `service-worker.js`, offline-fähig, als PWA installierbar
- ✅ Responsive Mobile-First: Bottom-Nav (mobil) / Sidebar (Desktop), Touch-Ziele ≥ 44 px
- ✅ Design Honig/Amber + Anthrazit, Karten-Layout, dezente Animationen, Dark Mode (auto/hell/dunkel)

## Sicherung & Datensicherheit
- ✅ JSON-Export `imkerbuch-backup-JJJJ-MM-TT-HHMM.json` (inkl. Anhänge als Base64)
- ✅ „Sicherung senden“: Web Share API L2 mit Datei; Fallback = Download + mailto mit Betreff „ImkerBuch-Sicherung vom TT.MM.JJJJ“ + Hinweis auf manuellen Anhang
- ✅ Import „Ersetzen“: Doppel-Bestätigung (inkl. Tipp-Bestätigung „ERSETZEN“) + Auto-Snapshot vorher
- ✅ Import „Zusammenführen“: Merge über UUID + `lastModified`, neuere gewinnen, keine Duplikate (testabgedeckt)
- ✅ Interne Snapshots: rollierend 10, Wiederherstellen in den Einstellungen (Doppel-Bestätigung, Auto-Snapshot vorher). *Abweichung: ohne Foto-/Audio-Binärdaten, damit 10 Snapshots den Speicher nicht sprengen – Blobs bleiben beim Restore erhalten.*
- ✅ Auto-Sicherung: Intervall täglich/wöchentlich/beim Schließen; File System Access API Ordner (Chrome/Edge Desktop) mit Berechtigungs-Reuse, sonst Auto-Download
- ✅ Backup-Reminder: Dashboard-Widget „vor X Tagen“, ab 7 Tagen gelber (wegklickbarer) Banner, ab 14 Tagen roter, NICHT wegklickbarer Banner mit Backup-Button
- ✅ `navigator.storage.persist()` beim Start; bei Ablehnung deutlicher Erklär-Banner
- ✅ Papierkorb statt Hartlöschen (30 Tage, Wiederherstellen + endgültig löschen + leeren)
- ✅ `onbeforeunload`-Warnung bei ungespeicherten Formularen (Dirty-Guard in `UI.formModal`)

## Gesamtexport & Druck
- ✅ Excel-Export (SheetJS): eine Arbeitsmappe, je Modul ein Blatt (17 Blätter inkl. Wetter/Gewichte/Fütterungen), Datumszellen als echte Excel-Daten
- ✅ Jedes Modul einzeln als Excel oder CSV (Semikolon-getrennt, BOM für Excel)
- ✅ Gesamt-PDF „Komplettausdruck“: Deckblatt, Inhaltsverzeichnis mit Seitenzahlen, alle 15 Module als Kapitel
- ✅ Druckansicht (print-CSS) für jede Listenansicht (Druck-Button in der Topbar)

## Module
1. ✅ **Dashboard**: 6 konfigurierbare Widgets (Völkerzahl, Aufgaben, letzte Behandlungen, Honigertrag-Jahresvergleich, Wetter, letzte Sicherung) – an-/abwählbar und sortierbar; tageszeitabhängige persönliche Begrüßung
2. ✅ **Bienenstände**: CRUD, „Aktuellen Standort übernehmen“ (Geolocation), Links zu Google Maps + OpenStreetMap, Wetter manuell + Open-Meteo (ohne API-Key), Wetterhistorie als Tabelle + Liniendiagramm
3. ✅ **Völker**: Stammdaten (Beutentyp/-kennung, Rähmchenmaß), Stand-/Königin-Zuordnung, Stockkarte chronologisch (Datum, Stärke/Brutbild/Sanftmut 1–5, Futter, Weiselzellen, Notiz), Fütterungen (Art, Menge, Winterfutter), Gewichtsverlauf mit Diagramm + Δ-Spalte, Duplizieren, Auflösen, Vereinigen – alles mit Historie
4. ✅ **Königinnen**: Jahrgang → automatische Zeichnungsfarbe (international), Herkunft/Linie, Status (aktiv/verloren/umgeweiselt, mit Volk-Rückwirkung), Zuordnungshistorie
5. ✅ **Zucht**: Serien (Startdatum, Anzahl), automatische Termine (Umlarven +0/+2, Käfigen +10, Schlupf +12, Begattung +13/+19, Kontrolle +28) als Aufgaben, Zuchtbuch-PDF
6. ✅ **Behandlungen/Bestandsbuch (TAMG)**: pro Volk oder Stand, Mittel/Menge/Einheit/Anwendungsart/Wartezeit, Beleg-Anhang (Foto/PDF), Wartezeit-Ende als Auto-Aufgabe, Bestandsbuch-PDF-Formblatt
7. ✅ **Trachten**: CRUD (Pflanze, Zeitraum, Region), Zuordnung zu Ständen (Mehrfachauswahl) und Wanderungen, Ertrag je Tracht in Liste + Reporting
8. ✅ **Wanderungen**: für Volk oder Stand, von/nach, Hin-/Rückdatum, Tracht-Zuordnung, Wanderbuch-PDF
9. ✅ **Honigverwaltung**: Ernten pro Volk/Stand (Datum, Sorte, kg, Tracht), Chargen mit Losnummern (Vorschlag `JJJJ-NN`), Rückverfolgung Glas → Charge → Ernte → Volk, Bestandsübersicht mit Korrektur, QR-Code je Charge + druckbarer Etiketten-Bogen (12×)
10. ✅ **Kassenbuch**: Einnahmen/Ausgaben mit Kategorien + Steuersatz, Kunden-/Lieferantenverwaltung mit Kontaktdaten, Belegfotos/-PDFs als Anhang (Belegarchiv), Jahresauswertung mit Monats-Diagramm + Kategorien-Tabelle + Jahres-PDF
11. ✅ **Rechnungen**: Positionen frei oder aus Honigbestand (Charge), §19 UStG oder USt (7/19 %, aus Brutto herausgerechnet), fortlaufende Nummern (Präfix + Zähler in den Einstellungen), PDF mit Logo/Anschrift/optional QR, Entwurf-/Storno-Wasserzeichen; Festschreiben mindert Bestand + bucht Kassenbuch-Einnahme; Storno stellt Bestand wieder her + Gegenbuchung
12. ✅ **Inventar**: Kategorien, Anschaffungsdatum, Preis, Stückzahl, Zuordnung Stand/Volk, Notizen, Gesamtwert
13. ✅ **Meldungen**: Bestandsmeldung Veterinäramt als ausgefülltes PDF-Formblatt (Imkereidaten, Völker, Standorte, Unterschriftszeile); Tierseuchenkassen-Daten als PDF
14. ✅ **Reporting**: Völkerentwicklung (aktive Völker je Jahresende), Honigertrag je Volk/Stand/Tracht/Jahr (umschaltbar), Behandlungsübersicht, Einnahmen/Ausgaben – jeweils Diagramm + Tabelle + PDF-Export
15. ✅ **Aufgaben/Kalender**: Fälligkeiten mit Gruppen (überfällig/heute/Woche/später/erledigt), Monatskalender mit Aufgaben-Punkten, Auto-Aufgaben aus Zuchtserien, Behandlungs-Wartezeiten und Fütterungs-Wiedervorlagen

## v0.32: Klickbare Kacheln & Fahrtenbuch (Nachtrag 2026-07-04, auf Julians Wunsch)
- ✅ **Dashboard-Kacheln klickbar**: Tipp auf eine Kachel springt in den passenden Bereich (Völker→Völker, Aufgaben→Aufgaben, Ertrag→Reporting, Wetter→Stände, Sicherung→Einstellungen); Buttons/Links in der Kachel behalten Vorrang
- ✅ **Fahrtenbuch für die Steuer**: je Stand Entfernung von zu Hause hinterlegbar (`kmEntfernung`), „Fahrt erfassen“ am Stand-Detail + unter Reporting → Fahrten (km vorbelegt mit 2 × Entfernung, Zweck-Vorschläge); Übersicht mit km/Fahrten/Pauschale (0,30 €/km) je Jahr und je Stand; **Fahrtenbuch-PDF** als Steuer-Nachweis; eigener Store `fahrten` (DB v3), in Excel/Backup/Komplett-PDF enthalten
- ✅ **Versionssystem** (ab 0.31): `APP_VERSION` + `CHANGELOG`, „Was ist neu?“-Fenster einmalig nach jedem Update, Version in Sidebar + Einstellungen

## Verkauf, Zeiterfassung & Vorschlagslisten (Nachtrag 2026-07-04, auf Julians Wunsch)
- ✅ **Verkäufe mit Lagerlogik** (Honig → Tab „Verkäufe“ + Buttons an Charge/Bestand): „X Gläser aus Los Y an Kunde Z“ → prüft Bestand, mindert die Charge, bucht die Einnahme automatisch im Kassenbuch; Stornieren macht beides rückgängig; eigener Store `verkaeufe` (DB v2), in Excel-Export/Backup/Komplett-PDF enthalten
- ✅ **Zeiterfassung je Aufgabe**: beim Abhaken fragt ein Schnell-Dialog Dauer (15/30/45/60/90/120 min oder frei) + Tätigkeit ab (Vorbelegung aus Aufgaben-Quelle, z. B. Zucht); Felder auch im Aufgaben-Formular; „Zeit nachtragen“ für Arbeiten ohne Aufgabe
- ✅ **Neuer Reiter „Zeiterfassung“** (Navigation → Auswertung): Tortendiagramm (Donut, eigener SVG-Helfer `UI.pie`) Stunden je Tätigkeit, Jahres-Filter, Kennzahlen, Einträge-Liste; Tätigkeiten-Liste in den Einstellungen frei anpassbar
- ✅ **Vorschlags-Dropdowns** (neuer Feldtyp `suggest` = Datalist): Rasse/Linie, Herkunft, Beutentyp, Rähmchenmaß, Futterart, Behandlungsmittel, Anwendungsart, Honig-Sorte, Trachtpflanze – sinnvolle Vorgaben + freie Eigeneingabe, bereits selbst verwendete Werte werden automatisch mit vorgeschlagen („lernend“)

## Erinnerungen (Nachtrag 2026-07-03, auf Julians Wunsch)
- ✅ Benachrichtigung bei fälligen Aufgaben: Systemmeldung über den Service Worker + Zähler am App-Icon (Badging API); Prüfung beim Öffnen, beim Sichtbarwerden und alle 30 Min. solange die App läuft; max. 1 Meldung/Tag (mehr nur bei neuen Fälligkeiten); Klick springt zu den Aufgaben; Feature-Schalter + Probe-Button in den Einstellungen
- ✅ Fütterungs-Wiedervorlage: „erneut prüfen in X Tagen“ beim Erfassen einer Fütterung → automatische Aufgabe
- ✅ Kalender-Export (.ics) der offenen Aufgaben mit Alarm 08:00 (Aufgaben-Ansicht + Einstellungen) → Apple/Google Kalender erinnern auch bei GESCHLOSSENER App, ohne Server
- ⚠️ Plattform-Grenze (dokumentiert, kein Bug): echte Push-Zustellung bei geschlossener App bräuchte einen Push-Server (Web Push/VAPID) – bewusst nicht gebaut, widerspräche dem 100-%-lokal-Prinzip; iOS zeigt Web-Benachrichtigungen nur für installierte Home-Screen-Apps (16.4+)

## PDF-Funktionen
- ✅ jsPDF + AutoTable: einheitlicher Kopf (eigenes Logo oder ImkerBuch-Logo + Imkereidaten), Tabellen, Seitenzahlen („Seite x von y“) – für Bestandsbuch, Wanderbuch, Zuchtbuch, Chargenübersicht, Rechnungen, Bestandsmeldung, TSK, Reports, Kassenbuch-Jahr, Komplettausdruck
- ✅ pdf.js: PDF hochladen → Text extrahieren und anzeigen → erkannte Behandlungs-/Ernteeinträge (Datum + Stichwort-Heuristik) als Vorschlag mit „Übernehmen“ in vorbefüllte Formulare

## Dokumente & Anhänge
- ✅ Anhänge (Fotos + Dokumente/PDF) an Völkern, Königinnen, Ständen, Behandlungen, Kassenbuch, Stockkarten-Einträgen; Größenlimit-Hinweis (>10 MB Rückfrage)
- ✅ Individuelle Dokumententypen in den Einstellungen (anlegen/entfernen), pro Anhang zuweisbar, Typ-Filter in der Galerie

## Fotos & OCR
- ✅ `<input type="file" accept="image/*" capture="environment">` – am Smartphone öffnet die Kamera
- ✅ Clientseitiges Verkleinern auf max. 1600 px + JPEG ~0.8, Speicherung in IndexedDB, Galerie + Vollbild-Viewer
- ✅ OCR mit Tesseract.js (deu): „Text aus Foto übernehmen“ mit Fortschrittsbalken, editierbares Ergebnis, Übernahme ins Notizfeld, Handschrift-Hinweis; per Feature-Schalter

## Sprachnotizen
- ✅ MediaRecorder-Aufnahme an Volk und jeder Stockkarte, Speicherung + Abspielen in der App
- ✅ Web Speech API de-DE als Live-Diktat während der Aufnahme (mit Chrome/Edge+online-Hinweis)
- ✅ Optional Whisper offline (@xenova/transformers, whisper-small, quantisiert) mit Ladefortschritt und Browser-Cache; per Feature-Schalter
- ✅ Transkript editierbar, Übernahme ins Notizfeld

## Einstellungen
- ✅ Profil (Vorname = Pflichtfeld im Assistenten), tageszeitabhängige Begrüßung, ein Benutzer ohne Login
- ✅ Eigenes Logo: Upload PNG/JPG/SVG, Vorschau, clientseitige Skalierung (Raster ≤ 512 px), entfernbar, auf ALLEN PDFs, optional im App-Header
- ✅ Imkereidaten (Name, Anschrift, Kontakt, Registrier-/Veterinärnummer, TSK-Nummer) → alle PDFs/Rechnungen
- ✅ Steuerdarstellung (§19/USt) + Rechnungsnummernkreis (Präfix + nächste Nummer)
- ✅ Feature-Schalter: OCR, Whisper, Wetter, Auto-Backup (Intervall + Ordnerwahl), Backup-Warnung beim Schließen
- ✅ Dark Mode (auto/hell/dunkel), Dokumententypen-Verwaltung

## Qualität
- ✅ Formular-Validierung (Pflichtfelder, Dezimalkomma-Zahlen), Lösch-Bestätigungen überall, leere Zustände mit Hinweistexten
- ✅ Einrichtungsassistent (Vorname*, Imkereiname, erster Stand, erstes Volk, optionale Demo-Daten)
- ✅ Testsuite (`tests/test.html`, 20 Testfälle) – siehe [TESTFAELLE.md](TESTFAELLE.md)
