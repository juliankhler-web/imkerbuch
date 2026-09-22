# Claude-Übergabe: Release-Prüfung v1.64 → v1.65

## Entscheidung

**Der vorbereitete Prüfzweig kann auf GitHub gepusht werden.** Noch nicht unmittelbar auf `main` übernehmen: Die ergänzten GitHub-Prüfungen, insbesondere Firefox, müssen vorher grün sein. Ein echtes iPhone/Android-Gerät wurde hier nicht getestet. Kein Push, kein Merge und keine Veröffentlichung wurden durch den Assistenten ausgeführt.

Arbeitszweig: `codex/v164-sicherheitskorrekturen`. Die bisherigen Reparaturen sind in [der Abschlussübergabe](../pruefung-v164/CLAUDE-ABSCHLUSS-2026-09-22.md) beschrieben. Diese Datei ergänzt die danach ausdrücklich verlangte Release-Prüfung.

## Tatsächlicher Ausgangsstand

Am 22.09.2026 wurden GitHub-HEAD und `main` lesend geprüft: `46e2923d222c5e3ee0acc3ae28362f47edddcf40`. Die öffentlich erreichbare [App](https://juliankhler-web.github.io/imkerbuch/index.html) meldete v1.64; ihre HTML-Datei war SHA-256-identisch mit `index.html` dieses Commits. Der öffentliche Service Worker verwendete `imkerbuch-v176`.

Der neue Stand trägt **APP_VERSION 1.65**, **Cache `imkerbuch-v177`**, **package.json und package-lock.json 1.65.0**. Ein eigener Änderungshinweis in der App erklärt die Reparaturen und den Schutz historischer Rechnungen. Kein neues Produktdesign, kein neues IndexedDB-Schema, kein neues Sicherungsformat.

## Ergebnisse

| Prüfung | Chrome 153.0.8010.53 | WebKit 26.5 |
| --- | --- | --- |
| Vollständige Testsuite | 471/471 bestanden | 471/471 bestanden |
| Alte App v1.64 auf dem Pfad `/imkerbuch/` installieren | bestanden | bestanden |
| Neue SW-Version mit falscher HTTP-200-Wartungsseite zurückweisen | bestanden | bestanden |
| Anschließend alte App aus dem Offline-Cache starten | bestanden | bestanden |
| Tatsächliche neue Version 1.65 aktivieren | bestanden | bestanden |
| Alle 30 exportierten Speicher vor/nach Update vergleichen | bestanden | bestanden |
| Nummerierter alter Rechnungsbeleg mit problematischem Text-Steuersatz unverändert | bestanden | bestanden |
| Neuer Offline-Start, sechs lokale Bibliotheken und bytegleicher Anhang | bestanden | bestanden |
| Sicherungen aus v1.61–v1.64: Ersetzen, Export-Roundtrip und wiederholter Merge | bestanden | bestanden |

Zusätzlich auf v1.65 erneut bestanden: **48/48 ursprüngliche Gegenproben und 3/3 Anschlussgegenproben**, siehe `abschluss-regression-results.json` und `neufunde-reparatur-results.json`. `npm run check` ist ebenfalls grün; Protokoll `npm-check.txt`.

Einzelnachweise: `chrome-suite.json`, `webkit-suite.json`, `chrome-update.json`, `webkit-update.json`. Die Suite selbst enthält zusätzlich Transaktionsabbrüche, parallele Buchungen, Rückbuchungen, Import-Angriffe und Sicherungsrevisionen. Der letzte Codezustand ist in `manifest.json` mit Hashes festgehalten.

**Firefox 153.0 konnte auf diesem Mac nicht gestartet werden.** Der Browser meldete einen Sandbox-/Grafikstartfehler, bevor die App geprüft werden konnte. Das ist kein nachgewiesener App-Fehler und auch kein bestandener Firefox-Test. Siehe `firefox-start.json`.

## Was der Update-Test genau tut

`tools/release-pruefung.mjs` bedient ausschließlich einen lokalen Server mit einem neuen Wegwerf-Browserprofil. Anfangs liefert er die echten Dateien aus Git-Commit `46e2923`. Die Adresse enthält denselben Unterpfad `/imkerbuch/` wie GitHub Pages. Die normale Datenbank heißt im Test ebenfalls `imkerbuch`, gehört aber ausschließlich zu diesem isolierten lokalen Ursprung und hat keinerlei Verbindung zur Nutzer-Datenbank.

In die alte App kommen die mitgelieferten künstlichen Beispieldaten, ein binärer Anhang und ein festgeschriebener Rechnungsbeleg. Zuerst wird eine fehlerhafte neue Installation versucht, danach die alte App aus dem Cache gestartet. Anschließend werden die unveränderten Dateien des neuen Kandidaten bereitgestellt. Es werden Daten, Berechnung, Cache-Wechsel, Neustart und alte Sicherungen geprüft.

**Vergleichsregeln:** Vor der Vorheraufnahme wird die alte App einmal neu gestartet, damit ihre eigenen noch ausstehenden Beispiel-/Altdatenmigrationen abgeschlossen sind. Ausgenommen vom Vergleich sind nur der „Version bereits gesehen“-Eintrag, die zwei lokalen Sicherungsrevisionen sowie der Zeitstempel des schon bisher bei jedem Start erneut gesetzten Flags `inventarTypMigriert`. Dessen Schlüssel und Wert werden weiter verglichen. Keine Bestände, IDs, Beziehungen, Belege, Beträge oder Anhang-Dateien sind ausgenommen.

**Offline-Grenze:** In Chrome wurden Browsernetz und Serverantworten abgeschaltet. Bei WebKit verweigerte der Testserver sämtliche Antworten; die Playwright-Netzabschaltung selbst verursachte einen internen Browserfehler und wurde dort nicht als Produkttest verwendet. Der erfolgreiche Cache-Rückfall in WebKit ist damit nachgewiesen, ein vollständiger Flugmodus auf einem realen iPhone nicht.

## Korrekturen am Testaufbau

Die zusätzliche Browserprüfung zeigte zuerst rote Erwartungen, die nicht ungeprüft als App-Fehler übernommen wurden:

- Der alte Test-iframe war 1 × 1 Pixel groß und unsichtbar. WebKit lieferte dort bei einigen Elementen leeren `innerText`. Der iframe besitzt jetzt eine normale sichtbare Größe; die bisherigen Text-/Funktionsprüfungen bleiben bestehen.
- Ein Breitentest verglich die absolute Bildschirmhöhe eines Feldes. Beim Ausblenden weiterer Felder zentriert sich der gesamte Dialog neu. Jetzt prüft derselbe Test die Feldposition innerhalb des Dialogs und weiterhin die gemeinsame Zeile von Datum/Menge. Keine Gestaltung der App wurde geändert und kein Testfall entfernt.
- WebKits temporärer Playwright-Kontext konnte Blobs nicht in IndexedDB speichern (`UnknownError: Error preparing Blob/File data`). Mit einem eigenen dauerhaften Wegwerf-Profil bestehen Anhang- und Sicherungsprüfungen. Daraus folgt ausdrücklich keine Freigabe für beliebige Privatmodi; keine Datenumwandlung als vermeintlicher App-Fix eingebaut.

Beide Browser bestanden anschließend dieselben **471** Testfälle. Die erste rote Messung wurde nicht als Freigabe verwendet.

## GitHub-Prüfungen und Entwicklungswerkzeuge

Die bestehende Chrome-Suite bleibt verpflichtend. Ergänzt wurde ein CI-Job mit Firefox/WebKit auf Ubuntu. Er prüft jeweils die vollständige Suite und den Versionswechsel und lädt die Ergebnisse als Artefakte hoch. Er hat hier noch keinen GitHub-Lauf ausgeführt; diesen Nachweis gibt es erst nach dem Push.

`npm ci` deckte drei gemeldete Schwachstellen in den bisherigen **Dokumentations-Prüfwerkzeugen** auf. `markdownlint-cli2` wurde auf 0.23.3 aktualisiert; anschließendes `npm audit` meldete **0 bekannte Schwachstellen im npm-Abhängigkeitsbaum**. Das ist kein Audit der separat eingebundenen Bibliotheksdateien unter `libs/`. Die neue reine Tabellen-Ausrichtungsregel MD060 bleibt abgeschaltet, damit der Werkzeugwechsel keine sachfremde Umformatierung alter Unterlagen erzwingt. Die übrigen bisherigen Prüfregeln bleiben erhalten.

## So kann der Nutzer pushen

Im Terminal, ohne vorher `main` auszuchecken oder Dateien in den ursprünglichen Checkout zu kopieren:

```sh
git -C /Users/juliankoehler/ImkerApp push -u origin codex/v164-sicherheitskorrekturen
```

Anschließend einen Pull Request nach `main` öffnen und die GitHub-Prüfungen abwarten. Besonders `Zusätzliche Browser (firefox)` darf nicht fehlen oder rot sein. **Ein Push dieses Prüfzweigs ist nicht die Freigabe, die App sofort für alle Nutzer auszutauschen.** Bei späterem Merge/Release kann GitHub Pages die App veröffentlichen.

Vor dem produktiven Update eine externe Sicherung inklusive Anhängen aus der bisherigen App aufbewahren. Neue v1.65-Rechnungen nicht zur Weiterbearbeitung an eine ältere App-Version zurückgeben; deren Rechenregeln kennen die neue Belegversion nicht. Bereits historisch falsche Belege/Bestände werden durch das Update nicht automatisch korrigiert.

## Wiederholen

Für die regulären Prüfungen:

```sh
npm ci
npm run check
```

Zusätzliche Release-Prüfung (Playwright nur als Testwerkzeug, kein Bestandteil der App):

```sh
npm install --no-save --package-lock=false playwright@1.62.1
npx playwright install firefox webkit
node tools/release-pruefung.mjs chrome suite
node tools/release-pruefung.mjs chrome update
node tools/release-pruefung.mjs webkit suite
node tools/release-pruefung.mjs webkit update
node tools/release-pruefung.mjs firefox suite
node tools/release-pruefung.mjs firefox update
```

Chrome muss lokal installiert sein, alternativ `CHROME_BIN` setzen. `PLAYWRIGHT_MODULE` erlaubt den Pfad zu einer bereits vorhandenen Playwright-Installation. Release-Läufer: Exit 0 ausschließlich bei bestandenen Erwartungen, Exit 1 bei fachlichem Fehler, Exit 2 bei technischem Abbruch. Benutzerprofile und echte Sicherungen nicht zum Testen verwenden.
