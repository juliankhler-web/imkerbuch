# ImkerBuch – Projektstand (Master-Datei)

> **Diese Datei ist die einzige Wahrheitsquelle über den Projektstand.**
> Zu Beginn jeder Sitzung und nach jeder Kontext-Kompaktierung zuerst vollständig lesen
> (inkl. der verlinkten Docs, wenn am jeweiligen Thema gearbeitet wird).
> Stand: 2026-07-03 · **Erst-Aufbau abgeschlossen, alle Module gebaut, 25/25 Tests grün**

## Dokumentation (Docs as Code)

| Dokument | Inhalt |
|---|---|
| [docs/FEATURES.md](docs/FEATURES.md) | Vollständige Feature-Checkliste aus dem Anforderungs-Prompt mit Status (aktuell: **alles ✅**) und Abweichungsvermerken |
| [docs/ARCHITEKTUR.md](docs/ARCHITEKTUR.md) | Dateien, Modul-Aufbau der index.html, Datenmodell (alle IndexedDB-Stores), Bibliotheken/CDN, Konventionen, Design-Entscheidungen |
| [docs/TESTFAELLE.md](docs/TESTFAELLE.md) | Testsetup (tests/test.html gegen `?testdb`-Instanz), 20 automatisierte Testfälle, manuelle Smoke-Checkliste |

**Regeln für die Pflege:**
- Neues Feature ⇒ Eintrag/Status in FEATURES.md, bei Architekturänderung ARCHITEKTUR.md nachziehen.
- Neue Fachlogik ⇒ Testfall in `tests/tests.js` im selben Schritt; Suite vor jedem „fertig“ laufen lassen.
- Bewusst zurückgestellte/anders gelöste Anforderungen ⇒ unten unter „Abweichungen“ UND am Feature in FEATURES.md vermerken.

## Schnellstart

```
python3 -m http.server 8931 -d ~/ImkerApp   # dann http://localhost:8931
# Tests: http://localhost:8931/tests/test.html
```
⚠️ Service Worker cached die App: nach Code-Änderungen zweimal neu laden.

## Deployment (LIVE)

- **App-URL: https://juliankhler-web.github.io/imkerbuch/** (GitHub Pages, Branch `main`, root)
- Repo: https://github.com/juliankhler-web/imkerbuch (öffentlich; von Julian am 2026-07-03 bestätigt)
- ⚠️ **Historie divergiert**: Der GitHub-Stand entstand per Web-Upload (eigener Commit), das lokale Repo hat seine eigene Historie. Für Updates entweder (a) geänderte Dateien erneut per Web-Upload ins Repo ziehen oder (b) einmalig Push-Auth einrichten (PAT/SSH) und dann `git push --force origin main` zum Angleichen. Remote `origin` ist lokal bereits gesetzt.
- iPhone-Installation: URL in Safari → Teilen → „Zum Home-Bildschirm“ (wichtig: schützt vor Safaris 7-Tage-Datenlöschung).

## Status-Kurzfassung

- **App komplett gebaut** (index.html, ~3.900 Zeilen): 15 Fachmodule, PWA/offline, Backup-System (Export/Teilen/Import mit Merge/Snapshots/Auto-Sicherung/Reminder), Excel-Gesamtexport, alle PDFs (Bestandsbuch, Wanderbuch, Zuchtbuch, Chargen, Rechnung, Meldungen, Reports, Kassenbuch-Jahr, Komplettausdruck), PDF-Import, OCR, Sprachnotizen mit Whisper-Option, Anhänge, Einrichtungsassistent, Demo-Daten, Dark Mode.
- **Verifiziert im Browser** (mobil + Desktop 1280px, Dark + Light): Wizard→Demo-Daten, ALLE Views einzeln geöffnet, Open-Meteo live, Zucht-Aufgaben-Automatik, Behandlung→Wartezeit-Aufgabe, Volk vereinigen (Historie beidseitig), kompletter Rechnungs-Flow inkl. Storno über die UI (Festschreiben: RE-0001, Bestand 34→28, Kassenbuch-Buchung; Storno: Bestand zurück auf 34, Gegenbuchung −39 €), Widget-Konfiguration, Papierkorb-Restore, PDF/Excel/QR-Erzeugung ohne Fehler.
- **Testsuite**: 23/23 grün (Format-Utils, Zuchtkalender, Rechnungssummen, DB/Papierkorb, Merge-Regeln, Backup-Roundtrip, Snapshots, Reminder-Stufen, PDF-Import-Heuristik, Listener-Leak-Regression, Aufgaben-Sync).
- **DRY-Refactoring** angewendet: `bindAdd` (14×), `zielIdAus` (4×), `zielFormValues` (3×), `papierkorbDelete` (11×) ersetzen die früheren Kopien; öffentliche Modul-Oberfläche explizit am `window`.

## Offene Punkte

- Manuelle Smoke-Checkliste am echten Smartphone durchgehen ([docs/TESTFAELLE.md](docs/TESTFAELLE.md#manuelle-smoke-checkliste-nicht-automatisierbar)) – insbesondere Kamera, Mikrofon/Whisper, Web-Share, PWA-Install, FS-Access-Backup-Ordner.
- Optional (Ideen, nicht beauftragt): Etiketten-Layout konfigurierbar, Varroa-Zählung als eigenes Feld, CSV-Import.

## Bekannte Bugs

- (keine bekannt)

## Abweichungen vom Prompt (begründet)

- **Interne Snapshots ohne Foto-/Audio-Binärdaten** – 10 rollierende Snapshots mit Blobs würden den Gerätespeicher sprengen; externe JSON-Backups enthalten ALLES (Base64). Beim Snapshot-Restore bleiben vorhandene Blobs erhalten.
- **CDN-Bibliotheken lazy**: „offline läuft“ gilt ab Erstbesuch für die Kernfunktionen; Excel/PDF/OCR/QR/Whisper brauchen bei ihrer jeweils ersten Nutzung einmal Internet (danach im SW-Cache).
- **QR-Bibliothek**: `qrcode-generator@1.4.4` statt npm-`qrcode` – letzteres hat kein CDN-Browser-Bundle (404).
- **„Backup-Abfrage beim Schließen“** nutzt den generischen Browser-Bestätigungsdialog (`beforeunload`); eigene Texte sind dort technisch nicht mehr möglich.
- **Single-File-Modularität**: Auf ES-Module/Dateisplit wurde bewusst verzichtet (Prompt fordert eine index.html). Modularität über Namespaces + Banner-Abschnitte + expliziten window-Export, s. [ARCHITEKTUR.md](docs/ARCHITEKTUR.md#modul-aufbau-in-indexhtml).

## Historie

- **2026-07-03**: Erst-Aufbau komplett (alle Module + PWA + Backup + PDFs + Tests). Alter localStorage-Prototyp als `alt-prototyp-2026-07-03.html` archiviert. Docs-as-Code-Struktur (`docs/`, `tests/`) eingeführt, DRY-Refactoring, QR-CDN-Fix.
- **2026-07-03 (2)**: Gründlicher Rest-Durchlauf aller Ansichten/Flows. **Bug gefunden + gefixt**: View-Klick-Listener akkumulierten am persistenten `#main` (Klick auf Zuchtserie öffnete „Neue Tracht“) → `renderRoute` ersetzt `#main` jetzt pro Render durch listenerfreien Klon; Regressionstest #22. Neue Tests für `PdfImport.parse`. 23/23 grün.
- **2026-07-03 (3)**: Git-Repository initialisiert (Branch `main`), Baseline-Commit `d3691f6` mit komplettem Stand.
- **2026-07-03 (5)**: **Bug live am iPhone gefunden + behoben**: „PDF: Bibliothek konnte nicht geladen werden“ – Ursache war cdnjs (jsPDF 2.5.2 existiert dort nicht, 404). Fix: zentrale `CDN`-Konstante mit Multi-CDN-Fallback (jsdelivr→unpkg→cdnjs) für ALLE Bibliotheken, `loadScript` mit Ausweichkette, pdf.js-Worker vom Gewinner-CDN, `warmupBibliotheken()` lädt PDF/Excel/QR im Hintergrund vor (→ dauerhaft offline). Persist-Hinweis-Banner wird in installierten Apps (standalone) unterdrückt. 25/25 Tests grün.
- **2026-07-03 (4)**: Erinnerungen gebaut (Julian-Wunsch „Pushnachricht bei Ereignis, z. B. Fütterung“): `Notif`-Modul (Systemmeldung via SW + App-Icon-Badge bei fälligen Aufgaben, 1×/Tag gedrosselt), Fütterungs-Wiedervorlage → Auto-Aufgabe, Kalender-Export (.ics mit Alarm) für Erinnerungen bei geschlossener App. Echte Server-Push bewusst NICHT gebaut (bräuchte Backend, widerspricht 100-%-lokal). 25/25 Tests grün.
