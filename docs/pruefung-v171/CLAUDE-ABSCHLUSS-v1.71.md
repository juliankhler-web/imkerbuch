# ImkerBuch v1.71 – abgeschlossene Korrekturen für Claude

Stand: 23.09.2026. Reparaturzweig: `codex/v170-pruefung-abschliessen`.
Ausgangspunkt ist die inzwischen vorhandene v1.70 (`55931e0`) einschließlich
begonnener, uncommitteter Bewertungskorrekturen, die zuerst separat als
`48dca1a` gesichert wurden. Der ursprüngliche Arbeitsordner wurde nicht bearbeitet.
Die bewährten Reparaturen des separaten Codex-Zweigs wurden zusammengeführt,
nicht die ältere index.html über die neuen Funktionen kopiert.

## Ergebnis

Die 30 nachverfolgten Befundgruppen aus der v1.69-Prüfung sind bearbeitet.
F14 wird durch vollständige Ablehnung ungültiger Import-IDs gelöst; F16 durch
konkreten Hinweis und Bestätigung eines Zusatzetiketts. Beides sind ausdrücklich
beschriebene Fachentscheidungen, keine behauptete allgemeine Rechtsfreigabe.
Originaldesign, lokale Datenhaltung und Datenbankschema bleiben erhalten.

## Änderungen nach Befund

| ID | Korrektur |
| --- | --- |
| F01 | Tatsächliche HTML-Ausgaben entschärft; v1.70-Sicherheitsfix erhalten und ergänzende sichere Ausgaben übernommen. |
| F02 | Rechnungen und Bestände innerhalb einer gemeinsamen Schreibsperre prüfen; veraltete Entwurfseditoren können Festschreibung nicht überschreiben. |
| F03 | Fütterungsänderungen verwenden auch im Volk denselben Materialabgleich. |
| F04 | Materialhelfer meldet tatsächlich gebuchte Menge statt Sollverbrauch. |
| F05 | Wiederherstellung mit unzureichendem Material vollständig ablehnen. |
| F06 | Mehrere Materialabzüge desselben Postens gemeinsam fortschreiben. |
| F07 | Fehlpositionen bleiben nach Neuzeichnen sichtbar im Marktkorb. |
| F08 | Merge-Entscheidung und Bestandsabgleich gehören in dieselbe Transaktion. |
| F09 | DB-Erfolg erst nach Commit; Bio-Migration schreibt Ziel und löscht Quelle gemeinsam. |
| F10 | Verkauf, Storno, Kassenbeleg und Bestand gemeinsam buchen. |
| F11 | Recheneingänge für neue Belege numerisch behandeln. |
| F12 | Entgelt mit 0 % in neuer Netto-Gesamtsumme mitführen. |
| F13 | Gewählte Pfandsteuer auch bei Pauschalierung berücksichtigen. |
| F14 | Ungültige IDs vor allen Schreibvorgängen mit Fehlermeldung ablehnen; keine zufälligen Ersatz-IDs und verwaisten Verweise. |
| F15 | null als bewusste Löschmarke für Logo/Zahlungsbild übernehmen. |
| F16 | Fehlendes druckbares Bio-Logo konkret benennen; zusätzliches Etikett nur ausdrücklich bestätigen. |
| F17 | Auch bei Worker-Installation App-Inhalt prüfen; fehlerhaftes Update aktiviert sich nicht und ersetzt den alten Cache nicht. |
| F18 | Gemeinsame Schreibwege aktualisieren den Sicherungsstand nach Commit. |
| F19 | Synchroner Transaktionsfehler erzeugt keinen zweiten unbehandelten Fehler. |
| F20 | Verkauf und zugehörigen Kassenbeleg gemeinsam aus dem Papierkorb wiederherstellen; Bestand dabei prüfen. |
| F21 | Datenrevision persistent speichern, fensterübergreifend aktualisieren und genau den exportierten Stand quittieren. |
| F22 | Abfüllung samt Kapazitätsprüfung und Materialbuchung innerhalb derselben Schreibsperre. |
| F23 | DB.update als synchronen Einzelzeilen-Helfer auf DB.aendereAtomar aufgebaut; konkurrierende Noten ergänzen sich. |
| F24 | Vollständige Bewertungsmaske ergänzt vorhandene Tagesnoten. Bearbeitung überträgt nur geänderte Noten; bewusste Leerwahl kann eine neue Note entfernen. |
| F25 | Alte 1–4-Bewertung bleibt als eigene gekennzeichnete Spalte erhalten. Neue 1–6-Noten werden getrennt ergänzt, auch am selben Tag. Kein gemeinsamer Mittelwert beider Skalen. PDF, Excel, Liste und Historie nennen die Skala; Dashboard-Mittel umfasst nur neue Skala. Bewertungsrunde lädt Altwerte nicht als neue Noten vor. |
| F26 | Pedigree-Textzugriffe behandeln numerische importierte Kennung defensiv; Schleifenbegrenzung bleibt erhalten. |
| F27 | OCR-Spaltenschwelle auch durch Schrifthöhe begrenzen; Tabellen aus Einwortzellen bleiben getrennt. |
| F28 | Mehr als 60 Einträge bzw. fünf PDF-Seiten sichtbar als begrenzt kennzeichnen. Genau 60 Einträge erzeugen keinen falschen Kürzungshinweis. |
| F29 | Planübernahme vor dem ersten await sperren; Einträge und Beschreibung gemeinsam speichern. Nach Fehler bleibt Eingabe erhalten und Wiederholung möglich. |
| F30 | Königinnenkennung und Volk-Zuordnung aus dem aktuellen gesperrten Bestand berechnen; zweite Runde verwendet inzwischen vorhandene Königin. |

## Zusätzliche Absicherung der neuen Bereiche

- Keine neue asynchrone Transaktions-API mit beliebigen Callbacks eingeführt.
  Der begonnene `DB.transaktion`-Ansatz wurde durch den bereits geprüften,
  synchron planenden `DB.aendereAtomar` ersetzt. `DB.update` verweigert
  Promise-Rückgaben ausdrücklich und wartet auf den Commit.
- PDF-Zeilen werden nach Sortierung anhand der letzten Zeilengruppe zugeordnet;
  die wiederholte Suche durch alle früheren Zeilen entfällt.
- Plan-Dateien: 20 MB; PDF-Text: maximal fünf Seiten, 50.000 Textobjekte je Seite,
  500.000 Textzeichen; OCR-Layout: 50.000 Wörter; gerenderte Scan-Seite:
  vier Millionen Pixel. Fehlermeldungen fordern Aufteilen/Verkleinern.
- PDF-Dokumente werden auch bei Fehlern freigegeben. Diese Grenzen machen
  Fremdbibliotheken nicht beweisbar fehlerfrei; kein künstlicher Geräteabsturztest.
- API-Dokumentation, Paketversion 1.71.0, App-Version 1.71 und Worker-Cache v183
  stimmen überein. Browser-CI zeigt auf die neuen Ergebnisdateien.

## Daten- und Sicherungskompatibilität

Kein IndexedDB-Schemawechsel, kein Löschen vorhandener Betriebsdaten. Gültige
Kennungen bleiben unverändert. Historische Rechnungen behalten ihre eingefrorene
Berechnung; nur neue Belege verwenden die korrigierte Berechnungsversion.
Bereits falsch erfasste Bestände oder ausgestellte fehlerhafte Rechnungen werden
nicht eigenmächtig umgeschrieben.

Der Update-Lauf startet tatsächlich mit v1.70, speichert Daten und einen binären
Anhang, verwirft zunächst eine absichtlich falsche neue App-Datei und aktualisiert
danach auf v1.71. Er vergleicht alle exportierten Speicher sowie den alten
Rechnungswert und startet die neue Fassung offline mit sechs lokalen Bibliotheken.

Vier historische Beispielpakete (v1.61–v1.64) werden einschließlich IDs, Werten,
Export/Import-Rundlauf und wiederholtem Merge geprüft. Zusätzlich prüft die neue
Suite den Rundlauf getrennter alter/neuer Bewertungen. Das sind konkrete
Kompatibilitätsnachweise, keine Behauptung, jede jemals erzeugte Nutzersicherung
auf jedem Gerät geprüft zu haben. Neue Belege mit Berechnungsversion 2 sollen
nicht anschließend in einer älteren App weiterbearbeitet werden.

## Prüfnachweise

Abschließender Lauf: **497/497 Chrome, 497/497 WebKit; 48+3+11 = 62/62
Gegenproben bestanden.** Keine roten fachlichen Fälle oder technischen Abbrüche
in diesen Läufen. Die Update-Läufe prüfen jeweils elf Bedingungen.

Die JSON-Dateien in diesem Ordner enthalten Datum, Browser und Einzelergebnisse.
`manifest.json` benennt die abschließend geprüften Datei-Hashes.

| Prüfung | Nachweis |
| --- | --- |
| Vollständige Suite Chrome | `testsuite-chrome.log` |
| Vollständige Suite WebKit | `webkit-suite.json` |
| Historische Gegenproben, 48 Fälle | `abschluss-regression-results.json` |
| Verkaufsrestore/Sicherungsstand/Abfüllung, 3 Fälle | `neufunde-reparatur-results.json` |
| GdeB/Hygiene, 11 Fälle | `neubereiche-results.json` |
| Update v1.70 auf v1.71 in Chrome | `chrome-update.json` |
| Update v1.70 auf v1.71 in WebKit | `webkit-update.json` |
| Ansichten, zwei echte Fenster, Offline, defektes Update | `browser-results.json` |
| Dokumentationsprüfung | `markdownlint.log` |
| Entwicklungsabhängigkeiten | `npm-audit.json` |

Die G4-Erwartung wurde fachlich präzisiert: Statt einer vermischten Tagesbewertung
mit pauschalem Altflag werden eine unveränderte Altspalte und eine neue Spalte
erwartet. H2 fordert bewusst nicht unbegrenzte Verarbeitung, sondern eine sichtbare
Kürzungsmarke bei weiterhin 60 Zeilen. Die ursprünglichen roten v1.69-Nachweise
bleiben in der separaten Auditkopie erhalten. Andere Erwartungen wurden nicht
an falsche Produktwerte angepasst.

## Für GitHub und Claude

Die Korrekturen liegen auf einem separaten lokalen Git-Zweig. Es wurde weder
gepusht noch produktiv veröffentlicht. Der Zweig kann zur Prüfung hochgeladen
werden; vor Übernahme in den Veröffentlichungszweig die konfigurierte CI abwarten.
Firefox war im vorherigen lokalen Umfeld nicht startfähig; daher keine erfundene
lokale Firefox-Freigabe. WebKit-Prüfung ersetzt keinen Test auf jedem iPhone.

Es wurde in diesem Durchgang kein zusätzlicher unabhängiger Astra-Agent beauftragt.
Diese Datei beschreibt tatsächlich umgesetzte Änderungen und nachgewiesene Tests,
keine Ergebnisse eines nicht erfolgten Zweitreviews. Änderungen von Claude,
übernommene ältere Codex-Reparaturen und neue Integrationskorrekturen sind durch
die Git-Elternstände nachvollziehbar.

Reproduktion aus der Arbeitskopie:

```sh
npm ci
npm run check
node tools/audit-v164.mjs
node tools/audit-v164.mjs --neufunde --port=8983
node tools/audit-v169-new.mjs --port=8984
node tools/audit-v164-browser.mjs --port=8985
node tools/release-pruefung.mjs chrome update
node tools/release-pruefung.mjs webkit suite
node tools/release-pruefung.mjs webkit update
```

Der Release-Läufer benötigt Playwright und die Browserinstallation; ein bestehender
Paketpfad kann über `PLAYWRIGHT_MODULE` gesetzt werden. Die Audit-Läufer benutzen
eigene Browserprofile und künstliche Daten. Exit 0 bedeutet dort abgeschlossene
Diagnose; fachliche PASS/FAIL/ERROR-Zähler in JSON zusätzlich prüfen.
