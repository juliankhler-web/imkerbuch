# ImkerBuch – Architektur (Docs as Code)

> Technische Referenz: Dateien, Datenmodell, Modul-Aufbau, Konventionen, Entscheidungen.
> Stand: 2026-07-03

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Gesamte App: eingebettetes CSS + Vanilla JS in klar getrennten Modul-Abschnitten (s. u.) |
| `manifest.json` | PWA-Manifest (Icons 192/512, any + maskable, standalone) |
| `service-worker.js` | Offline-Cache: App-Shell stale-while-revalidate, CDN-Bibliotheken cache-first, APIs + `/tests/` + `?testdb` network-only |
| `icon-*.png` | App-Icons, erzeugt aus `icons.py` (Pillow, Dev-Werkzeug) |
| `tests/test.html`, `tests/tests.js` | Testsuite (läuft gegen die App im iframe, eigene Test-DB) – siehe [TESTFAELLE.md](TESTFAELLE.md) |
| `docs/` | Diese Dokumentation ([FEATURES.md](FEATURES.md), [TESTFAELLE.md](TESTFAELLE.md)) |
| `PROJEKT.md` | Master-Datei: Projektstand, offene Punkte, Verweise hierher |
| `alt-prototyp-2026-07-03.html` | Archivierter localStorage-Prototyp (wird nicht weiterentwickelt) |

**Start/Entwicklung:** `python3 -m http.server 8931 -d ~/ImkerApp` → `http://localhost:8931`.
⚠️ Der Service Worker liefert cache-first: nach Code-Änderungen **zweimal neu laden** (oder DevTools → „Update on reload“).

## Modul-Aufbau in index.html

Eine Datei, aber modular: jeder Abschnitt beginnt mit einem Banner-Kommentar
(`/* ===== MODUL: … ===== */`) und kapselt seinen Zustand in einem Namespace.
Die öffentliche Oberfläche wird am Dateiende explizit via `Object.assign(window, {…})`
exportiert (const-Deklarationen landen sonst nicht am `window` – wichtig für Tests).

| Namespace / Bereich | Verantwortung |
|---|---|
| `ICONS`, `icon()`, `logoSvg()` | Inline-SVG-Iconset + Waben-Logo |
| `U` | Utilities: `uuid`, `esc`, Datums-/Zahlenformat de-DE (`fmtDate`, `fmtNum`, `fmtEur`, `parseNum`), `addDays`, `resizeImage`, `loadScript` (CDN lazy), `download`, Blob↔DataURL |
| `DB` | IndexedDB-Wrapper: `put` (UUID + `createdAt` + `lastModified`), `getAll`, `softDel` → Papierkorb, `trashRestore`, `purgeTrash` (30 Tage), `bulkPut` |
| `S` | Settings (Key-Value-Store, beim Start in den Speicher geladen, `S.get`/`S.set`) |
| `UI` | `toast`, `modal`, `confirm` (inkl. Tipp-Bestätigung), `formModal` (generisches Formular mit Validierung, Dezimalkomma, Dirty-Guard), `tabs`, `chart` (eigene SVG-Linien-/Balkendiagramme) |
| Router | Hash-Routing `#/route/param`, `Views`-Registry, `renderRoute()`, `navTo()`, `NAV`-Definition, App-Chrome (Sidebar/Bottom-Nav/Mehr-Sheet), `applyTheme()` |
| DRY-Helfer | `bindAdd` (Neu-Buttons), `zielIdAus` + `zielFormValues` (Volk/Stand-Formulare), `papierkorbDelete` (Standard-onDelete), `emptyState`, `pageHead`, `idMap` |
| `Anhang` | Foto-/Dokument-Anhänge: Galerie, Viewer, Dokumententypen, OCR-Anbindung |
| `Ocr` | Tesseract.js (deu), lazy |
| `Voice`, `Sprachnotiz` | MediaRecorder, Web-Speech-Live-Diktat, Whisper offline (transformers.js, 16-kHz-Resampling) |
| `Views.*` | Ein Eintrag je Modul: dashboard, staende/stand, voelker/volk, koeniginnen, zucht, behandlungen, trachten, wanderungen, honig, kassenbuch, rechnungen/rechnung, inventar, aufgaben, meldungen, reporting, einstellungen, papierkorb |
| `Wizard`, `Demo` | Einrichtungsassistent + Demo-Daten |
| `Reporting` | Datenaggregation für Reports (Völkerentwicklung, Ertrag, Behandlungen, Finanzen) |
| `Backup` | Export/Teilen, Import (Ersetzen/Merge), Snapshots, Auto-Sicherung (FS Access API/Download), Reminder-Banner, `storage.persist` |
| `makeQr` | QR-Codes (qrcode-generator) als PNG-DataURL |
| `Notif` | Erinnerungen: `faellige()` (überfällig+heute), `check()` (Badge + max. 1 Systemmeldung/Tag via SW-`showNotification`, Drossel in Setting `letzteNotif`), `badge()` (Badging API), `icsFuerAufgaben()`/`icsExport()` (Kalender-Export mit VALARM); SW-`notificationclick` fokussiert die App auf `#/aufgaben` |
| `Xlsx` | Excel-/CSV-Export (SheetJS), `Xlsx.defs()` = zentrale Spaltendefinitionen (auch vom Komplett-PDF genutzt) |
| `Pdf` | Alle PDF-Dokumente (jsPDF + AutoTable) mit einheitlichem Kopf/Fuß |
| `PdfImport` | pdf.js-Textextraktion + Übernahme-Heuristik |
| `boot()` | Startsequenz: DB → Settings → Theme → Chrome → Router → SW → Wizard |

## Datenmodell (IndexedDB `imkerbuch`, Version 1)

Jeder Datensatz: `id` (UUID), `createdAt`, `lastModified` (ISO). keyPath `id`, außer `settings` (`key`).
Im Testmodus (`?testdb`) heißt die Datenbank `imkerbuch-test`.

| Store | Wichtigste Felder |
|---|---|
| `staende` | name, lat, lng, notizen |
| `wetter` | standId, datum, tempC, windKmh, niederschlagMm, bemerkung, quelle (`manuell`/`open-meteo`) |
| `voelker` | name, standId, koeniginId, beutentyp, beutenkennung, raehmchenmass, status (`aktiv`/`aufgeloest`/`vereinigt`), historie[{datum,text}], notizen |
| `stockkarten` | volkId, datum, volksstaerke/brutbild/sanftmut (1–5), futter, weiselzellen, notiz |
| `fuetterungen` | volkId, datum, futterart, mengeKg, winterfutter |
| `gewichte` | volkId, datum, gewichtKg |
| `koeniginnen` | jahrgang (→ Farbe via `queenColor`), herkunft, linie, status, historie[{volkId,von,bis}], notiz |
| `zuchtserien` | name, startdatum, anzahl, termine[{tag,titel,datum}] (aus `zuchtTermine()`), notiz |
| `behandlungen` | zielTyp/zielId (volk/stand), datum, mittel, menge, einheit, anwendungsart, wartezeitTage, notiz |
| `trachten` | bezeichnung, pflanze, von, bis, region, standIds[] |
| `wanderungen` | zielTyp/zielId, vonOrt, nachOrt, datum, rueckDatum, trachtId, notiz |
| `ernten` | zielTyp/zielId, datum, sorte, mengeKg, trachtId, notiz |
| `chargen` | losnummer, abfuelldatum, ernteIds[], glasGroesseG, anzahlGlaeser, bestandGlaeser, mhd, etikettNotiz |
| `kontakte` | typ (`kunde`/`lieferant`), name, strasse, plz, ort, email, telefon, notiz |
| `kassenbuch` | datum, typ (`einnahme`/`ausgabe`), kategorie, betrag, steuersatz, kontaktId, beschreibung, rechnungId |
| `rechnungen` | nummer, datum, kundeId, positionen[{text,chargeId,menge,einzelpreis,steuersatz}], kleinunternehmer, status (`entwurf`/`festgeschrieben`/`storniert`), qrAufDruck |
| `inventar` | bezeichnung, kategorie, anschaffung, preis, stueckzahl, standId, volkId, notiz |
| `aufgaben` | titel, faellig, erledigt, quelle (`manuell`/`zucht`/`behandlung`), refId, notiz |
| `anhaenge` | parentTyp, parentId, art (`foto`/`dokument`/`audio`), dokumentTyp, name, mime, blob, groesse, datum, transkript (bei Audio) |
| `snapshots` | datum, grund (`auto`/`vor-import`/`manuell`/`vor-wiederherstellung`), daten (JSON-String ohne Blobs), groesse |
| `papierkorb` | store, daten (Original), geloeschtAm |
| `settings` | key/value: profil, imkerei, logo, logoImHeader, steuer, rechnungskreis, features (inkl. `benachrichtigungen`), dokumentTypen, dashboardWidgets, darkMode, wizardDone, letzteExterneSicherung, letzteAutoSicherung, letzteNotif, backupDirHandle/-Name |

### Wichtige Invarianten
- **`renderRoute` ersetzt `#main` bei jedem Render durch einen listenerfreien Klon.** Views dürfen deshalb Klick-Listener direkt an `main` hängen; ohne diesen Tausch feuern Handler alter Views weiter (Bug vom 2026-07-03: Trachten-Formular öffnete sich in der Zucht-Ansicht – Regressionstest #22).
- **Löschungen** laufen über `DB.softDel` (Papierkorb, 30 Tage) – nie direkt `DB.del` für Nutzdaten.
- **Königinnen-Zuordnung**: `voelker.koeniginId` ist führend; `koeniginnen.historie` wird bei jedem Wechsel gepflegt (`openVolkForm`, `endQueenAssignment`).
- **Rechnung festschreiben** ist die einzige Stelle, die Chargen-Bestand mindert und Kassenbuch bucht; Storno ist die Umkehrung (negative Einnahme-Buchung).
- **Merge-Regel** (Import „Zusammenführen“): pro UUID gewinnt der neuere `lastModified`; Anhänge ohne Binärdaten werden übersprungen.

## Bibliotheken (CDN, lazy geladen, danach im SW-Cache offline)

| Bibliothek | Zweck | URL |
|---|---|---|
| SheetJS 0.20.3 | Excel/CSV | `cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js` |
| jsPDF 2.5.2 + AutoTable 3.8.4 | PDFs | `cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/…`, `…/jspdf-autotable/3.8.4/…` |
| pdf.js 3.11.174 | PDF lesen | `cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js` (+ worker) |
| qrcode-generator 1.4.4 | QR-Codes | `cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js` ⚠️ das npm-Paket „qrcode“ hat **kein** CDN-Bundle (404) |
| Tesseract.js 5.1.1 | OCR deu | `cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js` |
| @xenova/transformers 2.17.2 | Whisper offline | ESM-`import()` von jsDelivr; Modell `Xenova/whisper-small` (quantisiert) |
| Open-Meteo | Wetter | `api.open-meteo.com/v1/forecast` (kein Key, network-only) |

Diagramme: **eigener SVG-Chart-Helfer** (`UI.chart`, Linie/Balken) – keine Bibliothek.

## Konventionen
- Deutsch für Fachbegriffe (Stores, Felder, UI), Englisch für Technik (`renderRoute`, `boot`).
- Anzeige `TT.MM.JJJJ` + Dezimalkomma (`U.fmtDate`/`U.fmtNum`/`U.parseNum`); intern ISO-Datum + Number.
- Jede Funktion mit kurzem Zweck-Kommentar; Modul-Banner trennen Abschnitte.
- DRY: wiederkehrende Muster liegen als Helfer vor (`bindAdd`, `zielIdAus`, `zielFormValues`, `papierkorbDelete`, `zielFelder`, `UI.formModal`, `Xlsx.defs` als einzige Spalten-Quelle). Bei neuen Modulen zuerst diese Helfer nutzen statt kopieren.

## Design-Entscheidungen
- **Single-File bleibt** (Anforderung „eine index.html“): Modularität über Namespaces, Banner-Abschnitte und expliziten window-Export statt ES-Module/Dateisplit. Tests greifen über das iframe-`window` auf die Namespaces zu.
- **CDN lazy**: App-Start lädt keine Bibliothek; erst Funktionsnutzung (Excel/PDF/OCR/QR/Whisper) lädt einmalig, der SW cached danach für offline. Konsequenz: Spezialfunktionen brauchen bei ihrer allerersten Nutzung Internet.
- **Snapshots ohne Blobs**, externe JSON-Backups mit allem (Base64) – Kompromiss aus Speicher und „keine Daten verlieren“.
- **Rechnungspreise sind Bruttopreise**; USt wird für die Ausweisung herausgerechnet (B2C-üblich, 7 % Honig). §19 blendet USt komplett aus.
- **Storno** als negative Einnahme-Buchung, damit Jahressummen stimmen.
- **Charts selbstgebaut**: eine Abhängigkeit weniger, reicht für Linie/Balken.
- **`beforeunload`-Backup-Warnung** nutzt den generischen Browser-Dialog (eigener Text ist in modernen Browsern nicht möglich).
- Papierkorb gehört zum Export (Datensicherheit), `snapshots` nie (Rekursionsvermeidung).
