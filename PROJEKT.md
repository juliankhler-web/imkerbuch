# ImkerBuch – Projektstand (Master-Datei)

> **Diese Datei ist die einzige Wahrheitsquelle über den Projektstand.**
> Zu Beginn jeder Sitzung und nach jeder Kontext-Kompaktierung zuerst vollständig lesen
> (inkl. der verlinkten Docs, wenn am jeweiligen Thema gearbeitet wird).
> Stand: 2026-07-07 · **v0.51 · Imkerschule Phase 2 (Erfahrungsstufen + FAQ + Just-in-time) + alle Module + Marken-Logo + Rechtsseiten + Landing Page + Store-Assets, 60/60 Tests grün, LIVE auf GitHub Pages**

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
- Push via HTTPS + osxkeychain-Credential-Helper eingerichtet (2026-07-07). `git push origin main` funktioniert direkt.
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
- **Testsuite**: 60/60 grün (Format-Utils, Zuchtkalender, Rechnungssummen, DB/Papierkorb, Merge-Regeln, Backup-Roundtrip, Snapshots, Reminder-Stufen, PDF-Import-Heuristik, Listener-Leak-Regression, Aufgaben-Sync, Imkerschule-Lektionen, Level-Berechnung, FAQ-Suche, JIT-Empfehlungen).
- **DRY-Refactoring** angewendet: `bindAdd` (14×), `zielIdAus` (4×), `zielFormValues` (3×), `papierkorbDelete` (11×) ersetzen die früheren Kopien; öffentliche Modul-Oberfläche explizit am `window`.

## Offene Punkte

- **TWA-Packaging**: PWABuilder + assetlinks.json für Google Play
- **Play Console Setup**: 12-Tester-Regel (14 Tage), Store-Listing, Screenshots hochladen
- **CDN-Bibliotheken self-hosten** (für „100% lokal"-Versprechen)
- Manuelle Smoke-Checkliste am echten Smartphone durchgehen ([docs/TESTFAELLE.md](docs/TESTFAELLE.md#manuelle-smoke-checkliste-nicht-automatisierbar))
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

- **2026-07-07 (v0.51)**: **Imkerschule Phase 2** – (1) Erfahrungsstufen-Onboarding: 2 objektive Fragen (Jahre/Völker) → automatische Level-Berechnung (Anfänger/Fortgeschritten/Erfahren), überspringbare Lektionen je Level, nachträglicher Level-Picker per Modal. (2) „Frag ein Thema" FAQ: 10 Themenkacheln (Völkerführung bis Vermehrung), 42+ Fragen mit Accordion-Antworten, Volltextsuche mit Synonym-Erweiterung (z.B. „weisellos" → „keine königin"). (3) Just-in-time-Kopplung: saisonale Banner im Lernpfad (Monat → passende Lektion), Varroa-Ampel-Warnung bei Rot, Fütterungs-Erinnerung Aug/Sep. Dashboard-Widget „Lerntipp" zeigt aktuellen saisonalen Tipp. 6 neue Tests (Level/FAQ/JIT). 60/60 grün. SW → v052.
- **2026-07-07 (v0.50)**: **Imkerschule** – kompletter Lernpfad, 11 Kapitel ALLE mit ausführlichem Inhalt (5–6 Schritte), selbstgezeichneten SVG-Illustrationen und geführten App-Aktionen (Lernen = echte Daten anlegen). Kapitel: Bienenvolk verstehen, Beute & Standort, Völkerführung, Schwarmkontrolle, Honigernte, Varroa, Königinnenzucht, Wanderimkerei, Bienenprodukte, Wirtschaftlichkeit, Rechtliches. + **Landing Page** (`landing.html`) im Honig-Anthrazit-Look mit Hero, USPs, Features, Galerie, Imkerschule-Teaser, Preis 14,99€. 54/54 grün. SW → v051.
- **2026-07-07 (v0.49)**: **Rechtsseiten** – `impressum.html`, `datenschutz.html`, `agb.html` mit Julians echten Daten, verlinkt unter Einstellungen→Rechtliches.
- **2026-07-07 (v0.48)**: **Neues Marken-Logo** – `brandLogoSvg()` (3 Amber-Waben), nur Homescreen-Ansicht; Nutzer-Logo wird NICHT überschrieben.
- **2026-07-06 (v0.47)**: **Umfangreiche Beispieldaten** (Julian: „fülle den Demo-Modus komplett" – für Store-Screenshots). `Demo.create()` massiv erweitert (3 Stände, 15 Völker inkl. 2 Archiv, 7 Königinnen mit Stammbaum, Stockkarten/Varroa/Behandlungen/Trachten/Wanderungen, 10 Ernten über 3 Jahre → volle Reporting-Balken, 4 Chargen + 2 Verkäufe, 13 Kassenbuchungen mehrjährig, 2 Rechnungen § 24, 8 Inventar inkl. MHD-/Bestandswarnungen, 7 Fahrten, 21 Aufgaben inkl. 10 mit Zeiterfassung, Zuchtserie, Wetter). Neu `Demo.reset()` (leert alle Daten-Stores außer settings, dann create). Settings-Button „Beispieldaten laden" (Rückfrage, dandanch navTo dashboard). Smoke-Test #51. Live im Dark Mode verifiziert (Reporting-Honigertrag-Balken + Zeiterfassung-Widget gefüllt, keine Konsolenfehler). 51/51 grün. SW → v047.
- **2026-07-05 (v0.46)**: **Rechnungs-PDF nach DIN 5008 (Fensterkuvert)** (Julian: „in diesem Stil, Logo größer, Text ganz oben weg, genormt für Fensterumschläge"). `Pdf.rechnung`-Kopf neu: Logo 34 mm oben rechts (statt 22 mm), Absender-Header oben ENTFERNT, Anschriftfeld links x=25 mm mit kleiner Rücksendeangabe + Empfänger auf Fensterhöhe (y≈45–62 mm), Infoblock rechts (Nr./Datum/Reg-Nr), Betreff bei y=96, Tabelle startY=104 mit `margin.left=25`, Falz-/Lochmarken (105/210/148,5 mm), Absender in Fußzeile. `Pdf.table` um optionalen `margin`-Parameter erweitert (Default unverändert → keine anderen PDFs betroffen). Alle 3 Steuervarianten + QR fehlerfrei erzeugt. ⚠️ Julians Referenz-PDF lag im macOS-Pasteboard-Container (`shared-pasteboard`) → systemseitig NICHT lesbar (EPERM, auch ohne Sandbox); Layout nach DIN-Norm gebaut, Feinabgleich offen bis Julian die PDF in zugänglichen Ordner legt. 50/50 grün. SW → v046.
- **2026-07-05 (v0.45)**: **§ 24 UStG Pauschalierung (Land-/Forstwirtschaft)** – Julian ist Pauschallandwirt, nicht § 19. Steuermodell von boolean `kleinunternehmer` auf 3 Arten erweitert: `regel` / `klein` (§19) / `pauschal24` (§24). Neue Helfer `rechnungSteuerart(r)` (rückwärtskompatibel) + `rechnungHinweis(r)` (§-Rechtstexte, single source für Bildschirm+PDF), `rechnungSummen` rechnet Pauschal-USt = brutto×satz/(100+satz). Auswahl je Rechnung + Default in Einstellungen (`steuer.art`, `steuer.pauschalsatz`=7,8). § 24-Text: „Anwendung der Durchschnittssatzbesteuerung nach Art. 295 ff. MwStSystRL und § 24 UStG. Der Rechnungsbetrag enthält eine pauschalierende Umsatzsteuer von 7,8 %." Touch-Points: create/view/posForm-showIf/PDF/Excel-Spalte alle auf `rechnungSteuerart` umgestellt. 2 Tests (#46/#47). 50/50 grün. SW → v045. Damit ist Julians ursprüngliche Rückfrage „§-Satz stimmt nicht" gelöst.
- **2026-07-05 (v0.44)**: **Zeiterfassung-Dashboard-Widget** (`DASH_WIDGETS.zeiten`, Stunden/Jahr + Top-Tätigkeiten aus `Reporting.zeiten`) + **eigener Rechnungs-QR-Upload** (Julian: „QR ankreuzbar, aber nicht hochladbar"). Setting `rechnungQr` (dataURL), Upload/Entfernen in Einstellungen → Steuer & Rechnungen (Muster wie Logo), Rechnungs-Checkbox umbenannt „QR-Code auf die Rechnung drucken" + Hinweis, `Pdf.rechnung` bevorzugt eigenes Bild (JPEG/PNG erkannt), sonst Info-QR-Fallback. Migration generalisiert (Flag je Widget: fahrt/zeiten). DASH_WIDGETS exportiert + Render-Test (#46). 48/48 grün. SW-Cache → `imkerbuch-v044`. **OFFEN/Rückfrage: „§-Satz auf Rechnung stimmt nicht"** – Bedeutung unklar (Wortlaut vs. §24 UStG Landwirt-Pauschale vs. Zeichendarstellung); an Julian gestellt, noch nicht geändert.
- **2026-07-05 (v0.43)**: **Dashboard-Ein-Klick-Fahrt** (Julian-Wunsch). Neues Widget `DASH_WIDGETS.fahrt` „Fahrt zum Stand": pro Stand ein „Fahrt buchen"-Button → `fahrtSchnellBuchen(standId)` bucht heute + 2 × `kmEntfernung` in `fahrten` (Pauschale/PDF greifen). Stände ohne Entfernung → Fallback auf `fahrtForm()` (km eingeben). Default-Widget-Liste + einmalige Migration `fahrtWidgetSeen` blenden es bei Bestandsnutzern ein. 2 Tests (#44/#45). 47/47 grün. SW-Cache → `imkerbuch-v043`. Mockup vorab gezeigt; im echten Dashboard verifiziert (Button bucht real, kein Konsolenfehler).
- **2026-07-05 (v0.42)**: **Verlässlichkeit gehärtet** (aus Wettbewerbs-Recherche: Konkurrenz scheitert sichtbar an „speichert nicht" + „Datum verschiebt sich"). Audit ergab: Datums-Handling ist robust — `fmtDate` rein string-basiert (kein `new Date`→kein TZ-Drift), `todayIso` lokal, `addDays` via `T12:00:00` (DST-sicher), `fmtDateTime` nur auf echten Zeitstempeln. Realer Fix: `UI.formModal` setzte `FormGuard.dirty=false` VOR `await onSave` → bei Save-Fehler war der Ungespeichert-Schutz fälschlich entwaffnet; jetzt erst nach Erfolg. 3 neue Tests (#41 fmtDate-kein-Drift, #42 addDays-Grenzen, #43 echter formModal-Save-Pfad inkl. Komma-Zahl/Pflichtfeld/NaN-Block, im echten Browser-DOM). 45/45 grün. SW-Cache → `imkerbuch-v042`. Wettbewerbs-Recherche-Ergebnis siehe unten/Memory.
- **2026-07-04 (v0.41)**: **Seitenkopf-Layoutfix** (Julian-Report: Überschrift „Völker" wurde auf schmalen Handy-Breiten von den Buttons überdeckt/abgeschnitten). Ursache: `.page-head` (flex-wrap) stauchte `.ph-text` bei ~390px auf ~10px, der einwortige Titel lief über die Aktionen. Fix: `pageHead()` kapselt Aktionen in `.ph-actions`; `.ph-text{flex:1 1 auto;min-width:min(100%,14rem)}` verhindert die Stauchung → Aktionen brechen dank flex-wrap breitenunabhängig in eine eigene Zeile (verifiziert 375/390/414/637px, alle 20+ Routen inkl. Detailseiten, kein X-Overflow). Test #40 sichert die `.ph-actions`-Kapselung; Test-Harness bekam einen Cache-Buster (frische `tests.js`). SW-Cache → `imkerbuch-v041`. 42/42 grün.
- **2026-07-04 (v0.40)**: **Vorschläge überall im Freitext** (Julians Wunsch „überall wo noch Freitext ist“): Feldtyp `suggest` zusätzlich bei Stockkarten-Futter, Behandlungs-Einheit, Wanderung Von/Nach-Ort (aus Stand-Namen + gelernt via `gelernteWerte`), Inventar-Bezeichnung, Tracht-Region, Kassenbuch-Beschreibung, Kontakt-Ort; neue `VORSCHLAEGE` (futter/einheit/inventar) + Inventar-Kategorien „Behandlungsmittel“/„Futter“; SW-Cache → `imkerbuch-v040`. 41/41 grün.
- **2026-07-04 (v0.39)**: Wettbewerbs-Auftrag Teil 3/3 abgeschlossen: **Honig-Etiketten-PDF** (`Pdf.honigEtikett`/`honigEtikettForm`, Honigverordnungs-Pflichtangaben, optional QR), **Stockkarten-Vorlagen** (`stockkartenVorlagen`, Schnell-Buttons + Speichern im Formular + Verwaltung in Einstellungen), **Zucht-Stammbaum** (`koeniginnen.mutterId`, `koeniginStammbaumHtml` Ahnen+Töchter zyklensicher). Alle 7 Auftrags-Features (Import + Rechner + Betriebsmittel + Varroa-Befall + Etiketten + Vorlagen + Stammbaum) fertig. 39/39 grün.

- **2026-07-04 (v0.38)**: Aus der Wettbewerbsanalyse (Julian-Auftrag, Teil 2/3): **Imker-Rechner** (`Views.rechner`, NAV+Route: Honigpreis/Wassergehalt/Sirup/Futter), **Betriebsmittel-Warnung** (Inventar `ablauf`+`mindestbestand`, `pruefeMhd` erweitert, Badge), **Varroa-Befallsmethoden** (`varroaAmpelBefall`/`varroaMetrik`, Milben je 100 Bienen für Auswaschen/Puderzucker via `probeBienen`, `VARROA_BEFALL_METHODEN`). 37/37 grün. NOCH OFFEN: Honig-Etiketten, Stockkarten-Vorlagen, Zucht-Stammbaum.

- **2026-07-04 (v0.37)**: **Universal-Datenimport** für Umsteiger. `Importer`-Modul: CSV/Excel via SheetJS lesen, Spalten-Auto-Guess (Alias-Matching) + manuelle Zuordnung + Vorschau; Entitäten Stände/Völker/Königinnen/Durchsichten/Behandlungen/Ernten/Kontakte/Kassenbuch; `parseDate` flexibel; Referenzauflösung Volk→Stand/Durchsicht→Volk per Name (`_nameIndex`), fehlender Stand wird angelegt. In Meldungen & Export. 36/36 grün. NOCH OFFEN in diesem Auftrag (Julian): Honig-Etiketten, Imker-Rechner, Betriebsmittel-Warnung, Stockkarten-Vorlagen, Zucht-Stammbaum, Varroa-Zusatzmethoden.

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
