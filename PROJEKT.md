# ImkerBuch – Projektstand (Master-Datei)

> **Diese Datei ist die einzige Wahrheitsquelle über den Projektstand.**
> Zu Beginn jeder Sitzung und nach jeder Kontext-Kompaktierung zuerst vollständig lesen
> (inkl. der verlinkten Docs, wenn am jeweiligen Thema gearbeitet wird).
> Stand: 2026-07-04 · **v0.36 · Alle Module + Nachträge (…, Marktverkauf, MHD-Wächter, eigene Stockkarten-Felder, Bienenprodukte), 33/33 Tests grün, LIVE auf GitHub Pages**

## Dokumentation (Docs as Code)

| Dokument | Inhalt |
|---|---|
| [docs/FEATURES.md](docs/FEATURES.md) | Vollständige Feature-Checkliste aus dem Anforderungs-Prompt mit Status (aktuell: **alles ✅**) und Abweichungsvermerken |
| [docs/ARCHITEKTUR.md](docs/ARCHITEKTUR.md) | Dateien, Modul-Aufbau der index.html, Datenmodell (alle IndexedDB-Stores), Bibliotheken/CDN, Konventionen, Design-Entscheidungen |
| [docs/TESTFAELLE.md](docs/TESTFAELLE.md) | Testsetup (tests/test.html gegen `?testdb`-Instanz), 20 automatisierte Testfälle, manuelle Smoke-Checkliste |

**Regeln für die Pflege:**
- **Bei JEDEM Update: `APP_VERSION` in index.html hochzählen (0.31 → 0.32 → …) und oben in `CHANGELOG` einen nutzerverständlichen Eintrag ergänzen** – die App zeigt daraus nach dem Update einmalig das „Was ist neu?“-Fenster (Julian-Wunsch 2026-07-04).
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
- ⚠️ **Historie divergiert**: Der GitHub-Stand entstand per Web-Upload (eigener Commit), das lokale Repo hat seine eigene Historie. Alternative zu Web-Upload: einmalig Push-Auth einrichten (PAT/SSH) und `git push --force origin main`. Remote `origin` ist lokal bereits gesetzt.
- iPhone-Installation: URL in Safari → Teilen → „Zum Home-Bildschirm“ + Schalter „Als Web-App öffnen“ AN (schützt vor Safaris 7-Tage-Datenlöschung).
- ⚠️ **Wenn „pages build and deployment“ fehlschlägt** (Actions-Tab, roter Lauf, Meldung „Deployment failed, try again later.“): Das ist ein vorübergehender GitHub-Hänger, NICHT unser Code (der `build`-Schritt ist grün). Fix: Actions → fehlgeschlagenen Lauf → „Re-run failed jobs“. Bleibt er in „Queued“ hängen, hilft ein neuer, winziger Commit (triggert sauberes Deployment). Live-Version prüfen: `curl -sL https://juliankhler-web.github.io/imkerbuch/index.html | grep APP_VERSION`.

### Update aufspielen (Runbook, auch für Julian ohne Claude)

1. github.com/juliankhler-web/imkerbuch öffnen (eingeloggt) → **Add file → Upload files**
2. Im Finder **in den Ordner `ImkerApp` hinein**, `Cmd+A`, alles auf die Seite ziehen (Ordner-**Inhalt** ziehen, nicht den Ordner – sonst landet alles unter `ImkerApp/`)
3. Kurze Commit-Nachricht eintragen → **Commit changes**
4. 1–2 Minuten warten – GitHub Pages baut automatisch neu
5. Am Handy: App komplett schließen und **zweimal öffnen** (1. Start lädt das Update im Hintergrund, 2. Start zeigt es)

**Wichtig:** Es werden nur **Code-Dateien** hochgeladen – die Imkerei-DATEN (Völker, Kassenbuch, Fotos) liegen ausschließlich in der IndexedDB des jeweiligen Geräts, werden von Updates NICHT berührt und landen niemals auf GitHub. Datenverlust nur bei: App vom Home-Bildschirm löschen oder Website-Daten manuell löschen → dagegen schützt die Backup-Routine („Sicherung senden“).

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

- **2026-07-04 (v0.35/0.36)**: **Hochformat-Design-Audit** (paralleler Multi-Agent-Code-Audit über Workflow, 6 Kategorien + adversariale Verifikation, danach Live-Prüfung aller Routen hell+dunkel). Grundursachen: `.grid2/.grid3>*{min-width:0}` (Kalender/Dashboard sprengten Viewport), `.btn{white-space:normal;max-width:100%}`. Clipping ergänzt: `.row .r-title/.r-sub` (v0.35), `.stat .s-value`, `.markt-tile .mt-name/.mt-rest`; Volk-Historie bricht um; `.page-head .ph-text` min-width→0; Pie-Legende; `.sheet-grid` 4→3 Spalten <390px; Banner-Text fließt als `.b-msg` statt zerrissen. Kein horizontaler Seiten-Scroll mehr auf 19 Routen. 33/33 grün.

- **2026-07-04 (v0.35)**: **UI-Bugfix Hochformat**: `.row .r-title`/`.r-sub` waren `display:inline` → `text-overflow:ellipsis` griff nicht, langer Untertext lief über den Kartenrand. Fix: `display:block` (schneidet jetzt sauber ab); `.card-title` bekommt `flex-wrap:wrap` (Kopf bricht bei Enge um). 33/33 grün.

- **2026-07-04 (v0.34)**: „Zweite Welle“ aus der Wettbewerbsanalyse: (1) **Marktverkauf** (`Views.markt`, Route `#/markt`, Touch-Kassenmodus, Warenkorb, Wechselgeld, `chargen.verkaufspreis`, bucht über `verkaufErfassen`). (2) **MHD-Wächter** (`pruefeMhd()` bei Boot, Aufgabe `quelle='mhd'`, ≤ `MHD_WARN_TAGE`, dedupliziert). (3) **Eigene Stockkarten-Felder** (Setting `stockkartenFelder`, dynamische Formularfelder, `stockkarten.zusatz`). (4) **Bienenprodukte** (`ernten.produktart`, `BIENENPRODUKTE`). 33/33 grün.

- **2026-07-04 (v0.33)**: Von BeeInTouch/iBeekeeper inspirierte Features: (1) **QR-Code je Volk** (`volkQrAnzeigen`/`qrEtikettDruck`, kodiert `#/volk/<id>` → Scan öffnet Stockkarte). (2) **Varroa-Kontrolle** (Store `varroa` DB v4, Milben/Tag, Verlauf, Ampel `varroaAmpel`/`VARROA_SCHWELLEN`). (3) **Sammel-Erfassung** (`sammelErfassung`/`sammelFormular`: Durchsicht/Fütterung/Varroa für mehrere Völker). Team-/Community-Features bewusst ausgelassen (Server nötig). 32/32 grün. Marktanalyse in dieser Sitzung: Einmalkauf ~19,99 € als USP vs. Abo-Konkurrenz; Play-Store via TWA (kein Umbau).

- **2026-07-04 (v0.32)**: Dashboard-Kacheln klickbar (data-ziel + Delegation, Buttons/Links behalten Vorrang). Fahrtenbuch: `staende.kmEntfernung`, Store `fahrten` (DB v3), `fahrtForm` (km = 2×Entfernung vorbelegt), Reporting → Fahrten (km/Pauschale je Jahr + je Stand), `Pdf.fahrtenbuch(jahr)` als Steuer-Nachweis. 31/31 Tests grün.
- **2026-07-04 (v0.31)**: Versionssystem: `APP_VERSION` + `CHANGELOG` + einmaliges „Was ist neu?“-Fenster nach Updates (Regel: bei jedem Update fortschreiben!).

- **2026-07-04**: Julians Ausbau-Wünsche gebaut: (1) **Verkäufe mit Lagerlogik** – neuer Store `verkaeufe` (DB v2), `verkaufErfassen()` prüft Bestand → mindert Charge → bucht Kassenbuch-Einnahme, Storno kehrt um; Honig-Tab „Verkäufe“ + Buttons an Bestand/Charge. (2) **Zeiterfassung** – Schnell-Dialog beim Aufgaben-Abhaken (Dauer + Tätigkeit), Felder im Formular, „Zeit nachtragen“. (3) **Neuer Reiter „Zeiterfassung“** mit Donut-Tortendiagramm (`UI.pie`), Jahres-Filter, Tätigkeiten in Einstellungen pflegbar. (4) **Vorschlags-Dropdowns** (`suggest`-Feldtyp, `VORSCHLAEGE` + lernende `gelernteWerte()`) für Rasse, Beutentyp, Futterart, Mittel, Sorte u. a. 29/29 Tests grün.

- **2026-07-03**: Erst-Aufbau komplett (alle Module + PWA + Backup + PDFs + Tests). Alter localStorage-Prototyp als `alt-prototyp-2026-07-03.html` archiviert. Docs-as-Code-Struktur (`docs/`, `tests/`) eingeführt, DRY-Refactoring, QR-CDN-Fix.
- **2026-07-03 (2)**: Gründlicher Rest-Durchlauf aller Ansichten/Flows. **Bug gefunden + gefixt**: View-Klick-Listener akkumulierten am persistenten `#main` (Klick auf Zuchtserie öffnete „Neue Tracht“) → `renderRoute` ersetzt `#main` jetzt pro Render durch listenerfreien Klon; Regressionstest #22. Neue Tests für `PdfImport.parse`. 23/23 grün.
- **2026-07-03 (3)**: Git-Repository initialisiert (Branch `main`), Baseline-Commit `d3691f6` mit komplettem Stand.
- **2026-07-03 (5)**: **Bug live am iPhone gefunden + behoben**: „PDF: Bibliothek konnte nicht geladen werden“ – Ursache war cdnjs (jsPDF 2.5.2 existiert dort nicht, 404). Fix: zentrale `CDN`-Konstante mit Multi-CDN-Fallback (jsdelivr→unpkg→cdnjs) für ALLE Bibliotheken, `loadScript` mit Ausweichkette, pdf.js-Worker vom Gewinner-CDN, `warmupBibliotheken()` lädt PDF/Excel/QR im Hintergrund vor (→ dauerhaft offline). Persist-Hinweis-Banner wird in installierten Apps (standalone) unterdrückt. 25/25 Tests grün.
- **2026-07-03 (4)**: Erinnerungen gebaut (Julian-Wunsch „Pushnachricht bei Ereignis, z. B. Fütterung“): `Notif`-Modul (Systemmeldung via SW + App-Icon-Badge bei fälligen Aufgaben, 1×/Tag gedrosselt), Fütterungs-Wiedervorlage → Auto-Aufgabe, Kalender-Export (.ics mit Alarm) für Erinnerungen bei geschlossener App. Echte Server-Push bewusst NICHT gebaut (bräuchte Backend, widerspricht 100-%-lokal). 25/25 Tests grün.
