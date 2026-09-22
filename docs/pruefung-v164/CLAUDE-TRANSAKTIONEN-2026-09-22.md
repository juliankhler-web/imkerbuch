# Claude-Übergabe: Transaktionen, Sicherungen und Rechnungen

Stand 22.09.2026, unveröffentlichter Reparaturzweig `codex/v164-sicherheitskorrekturen`, Ausgang v1.64 (`46e2923`). Originaldesign unverändert. Keine Betriebsdaten angefasst, kein Push, keine Übernahme auf main. Diese Datei ergänzt die früheren Übergaben; der historische Prüfbericht bleibt unverändert.

## Was umgesetzt ist

| Fund | Stand dieser Etappe | Einstieg im aktuellen Code |
| --- | --- | --- |
| F01, kritisch | Nachgewiesene HTML-Ausgabepfade geschlossen, bereits vorher getestet; Rechnungsstatus zusätzlich geschützt | `index.html`, Rechnungsübersicht |
| F02, wichtig | Festschreiben liest und prüft unter Schreibsperre; Nummer, Bestand, Kasse und Rechnung gemeinsam. Veraltete Entwürfe werden abgelehnt | `index.html:9195`, `index.html:9437` |
| F03, wichtig | Beide Fütterungseditoren buchen alten Verbrauch zurück und neuen Verbrauch in einer Transaktion; veralteter Editor/Fehlbestand brechen vollständig ab | `index.html:5674` |
| F04, wichtig | Tatsächlicher Materialabzug statt gewünschter Menge, vorherige Etappe | siehe `CLAUDE-AENDERUNGEN-2026-09-22.md` |
| F05/F06, wichtig | Material-Restore unteilbar, Mehrfachposten summiert, Zielkonflikt und Fehlbestand abgelehnt, vorherige Etappe | `index.html:1973` |
| F07, wichtig | Fehlpositionen bleiben im Marktkorb, vorherige Etappe | siehe frühere Übergabe |
| F08, wichtig | Zusammenführen, aktuelle Daten lesen und Bestandsabgleich in derselben Transaktion | `index.html:13124` |
| F09, wichtig | Gesamte Bio-Migration einschließlich Quellenlöschung und Abschlussflag unteilbar; parallele Starts warten aufeinander | `index.html:15839` |
| F10, wichtig | Verkauf, Verkaufsstorno und Rechnungsstorno atomar; doppelte Stornos ohne zweite Rückgabe | `index.html:6604`, `index.html:6626`, `index.html:9205` |
| F11/F12/F13, wichtig | Zahlentext-Steuersatz, Netto zu 0 % und §24-Pfandsteuer korrigiert, mit Schutz historischer Belege | `index.html:9089`, `index.html:9137` |
| F14, wichtig | Ungültige IDs: gesamte Datei vor Schreibbeginn zurückweisen; keine Ersatz-IDs. ADR ausdrücklich ergänzt | `index.html:13067` |
| F15, wichtig | Neuere ausdrückliche Bildlöschung bleibt erhalten, vorherige Etappe | siehe frühere Übergabe |
| F16, wichtig | Bio-Etikett ohne druckbares Logo verlangt ausdrückliche Bestätigung als Zusatzetikett oder Abbruch | `index.html:14025` |
| F17, wichtig | Installation prüft vollständige Antworten und echte App-Hülle, bevor der Cache geschrieben wird | `service-worker.js:15` |
| F18, wichtig | Neue fachliche Transaktionen setzen Sicherungsmarke nach Commit, ursprünglicher Fall geschlossen | `index.html:1938`; separater neuer F21 siehe unten |
| F19, kosmetisch | Ursprüngliche Fehlermeldung ohne zweite unbehandelte Ablehnung, vorherige Etappe | `index.html:1914` |

Zusätzlich: `DB.leseAlles` liest eine Sicherung aus einem gemeinsamen Datenbankstand (`index.html:1852`, `index.html:12806`). Materialrückgabe und Löschen erfolgen zusammen (`index.html:2761`), nicht mehr nacheinander. Ein weiterer Löschaufruf gibt nichts doppelt zurück.

## Datenverträglichkeit und bewusste Grenzen

- Keine Änderung an DB-Schema-Version oder bestehender gültiger ID. Sicherungsformat bleibt 1. Die zusätzlichen Eigenschaften bleiben beim Export/Import erhalten.
- Neue Festschreibungen tragen `berechnungVersion: 2`. Alte nummerierte, festgeschriebene oder stornierte Rechnungen ohne dieses Kennzeichen behalten exakt die bisherige Rechenfunktion. Alte steuerliche Fehler werden damit **nicht nachträglich geheilt**; solche Belege benötigen eine nachvollziehbare fachliche Korrektur.
- Die zwei Rechenfunktionen sind bewusst getrennt: `rechnungSummenAlt` ist eine eingefrorene historische Regel, `rechnungSummenNeu` die korrigierte. Nicht einfach zusammenführen oder die alte Funktion „aufräumen“, sonst ändern sich bereits ausgegebene Belege.
- Ein Downgrade auf alte App-Versionen ist für neue Rechnungen nicht freigegeben: Eine alte App kennt die neue Rechenversion nicht. Alte Backups in der neuen App wurden anhand der mitgelieferten Beispiele geprüft; die Gegenrichtung ist eine andere Anforderung.
- F14 ändert die frühere ADR-Regel ausdrücklich: Eine ungültige ID stoppt die gesamte Datei. Kein gültiger lokaler Datensatz wird deshalb gelöscht oder umnummeriert. Beschädigte Dateien brauchen Korrektur an der Quelle.
- F16 ist eine Bedienabsicherung, keine Bildinhaltsprüfung und keine allgemeine rechtliche Freigabe. Ein beliebiges hochgeladenes Bild kann nicht automatisch als korrektes EU-Bio-Logo erkannt werden. Ein Zusatzetikett ist nur sinnvoll, wenn die übrigen Pflichtangaben auf der Verpackung vorhanden sind. Hintergrund: [EU-Kommission zum Bio-Logo](https://agriculture.ec.europa.eu/farming/organic-farming/organic-logo_de).
- Bei der SW-Installation müssen Antwortkörper vollständig eingelesen werden, bevor alle Antworten auf den Cache warten. Die zunächst erprobte Variante mit offenen Antwortstreams scheiterte in frischen Chrome-Profilen. Die Endfassung mit `arrayBuffer()` besteht die Neuinstallation. Kein solcher Zwischenstand wurde veröffentlicht.

## Prüfnachweise

- **464/464 reguläre Tests bestanden**, Chrome 153.0.8010.53, 22.09.2026 09:01:08 UTC; `abschluss-tests.txt`.
- **48/48 ursprüngliche Audit-Gegenproben bestanden**, keine technischen Abbrüche; `abschluss-regression-results.json`.
- 28 registrierte Ansichten mit Beispieldaten ohne Ausnahme geöffnet. Bei 390 Pixeln kein horizontaler Überlauf in den geprüften Einstellungen; drei kleine Schaltflächen weiterhin 40 × 40 Pixel. Kein neuer Gestaltungsauftrag daraus abgeleitet.
- Frisches Offline-Profil: Installation, Neustart nach Impressumsbesuch, alle sechs lokalen Bibliotheken, Schutz vor HTTP-200-Wartungsseite, abgelehnte fehlerhafte neue Installation und anschließender Offline-Start bestanden. `update-reparatur-results.json`. Ein Erstbesuch ohne Netz und ohne Cache startet erwartungsgemäß nicht.
- Vier unterschiedliche mitgelieferte Beispielsicherungen aus den Paketen v1.61–v1.64: sämtliche Zeilen/IDs/Werte nach erster Übernahme verglichen; Export → Ersetzen → Export gleich; wiederholter Merge erzeugt keine Duplikate; zusätzliche binäre Anhang-Datei bytegleich. Quellenhashes: `tests/fixtures/backup/herkunft.json`. Keine privaten Sicherungen.
- Fehlerproben brechen **echte IndexedDB-Transaktionen nach erfolgreichen Einzelaufträgen** ab. Nur eine geworfene Ausnahme vor dem Schreiben wäre kein ausreichender Rollback-Nachweis.
- Parallelproben decken gleiche/verschiedene Rechnungen, Nummernvergabe, Verkäufe, Stornos, Merge, Migration und Material-Löschen ab; zusätzlich früherer Restore-Test mit zwei DB-Verbindungen. Keine pauschale Zusicherung für jedes Formular oder jedes Gerät.

Prüfannahmen wurden offen angepasst: Ungültige IDs werden jetzt vollständig abgelehnt; Fehlbestand beim Restore ebenfalls. Abbruchinjektionen setzen an den neuen tatsächlichen Schreibstellen an. Der Bio-Fall N9 verlangt nun ausdrücklich eine erreichte Abbruchstelle und eine erhaltene Quelle. Keine rote Erwartung wurde einfach entfernt.

## Drei neue, separat nachgewiesene offene Fälle

`neufunde-results.json`: drei verletzte fachliche Erwartungen, keine technischen Testabbrüche. Die 48 grünen ursprünglichen Gegenproben enthalten diese Fälle nicht.

### F20 – wichtig: Verkauf im Papierkorb wird ohne seine Gegenbuchungen wiederhergestellt

- Datei: `index.html:1973` (`DB.trashRestore`), `index.html:6626` (Verkaufsstorno).
- Auslösen: 10 Gläser anlegen, 2 zu je 5 Euro verkaufen, Verkauf stornieren, im Papierkorb den Verkauf wiederherstellen.
- Tatsächlich: Verkauf wieder vorhanden, Bestand weiterhin 10, zugehöriger Kassenbucheintrag fehlt. Erwartet: Bestand 8 und Einnahme 10 Euro, oder vollständige Ablehnung.
- Lösung: Verkauf, Kassenbucheintrag, Lager und beide Papierkorbeinträge als einen fachlichen Wiederherstellungsvorgang behandeln; knappen Bestand und vorhandene Ziel-IDs vorab innerhalb derselben Transaktion prüfen.

### F21 – wichtig: Änderung während des Sicherungsexports verliert ihre Warnmarkierung

- Datei: `index.html:12843`, `index.html:12875` (`exportDownload`, `markExternal`).
- Auslösen: Sicherungsstand bilden; während die Datei noch geschrieben wird eine Änderung speichern; Dateischreiben erfolgreich abschließen.
- Tatsächlich: Spätere Änderung steht in der Datenbank, nicht in der Datei, aber `_changedSinceBackup` wird trotzdem auf `false` gesetzt. Erwartet: weiterhin ungesicherte Änderung melden.
- Lösung: Änderungsstand mit der tatsächlich erzeugten Datei verbinden; beim Abschluss nur diesen Stand bestätigen. Parallele Fenster und Neustart berücksichtigen. Ein bloßes Verschieben der Flag-Zuweisung reicht nicht.

### F22 – wichtig: Gleichzeitige Abfüllungen überziehen die Charge

- Datei: `index.html:8510` (Kapazität lesen), `index.html:8517` (getrennte Anlage).
- Auslösen: Charge 10 kg; zwei offene Abfüllformulare; beide lesen noch 10 kg frei und speichern je 15 Gläser à 500 g.
- Tatsächlich: beide speichern, zusammen 15 kg statt höchstens 10 kg. Der Prüflauf synchronisiert die beiden Lesezeitpunkte, wie es mit zwei Fenstern vorkommen kann.
- Lösung: aktuelle Charge und Abfüllungen unter gemeinsamer Schreibsperre prüfen, dann alle Größen samt Materialverbrauch und gemerktem Abzug unteilbar anlegen. Auch den Korrekturweg auf dieselbe Regel führen.

## Noch keine Produktivfreigabe

F20–F22 sind zum Zeitpunkt dieser Übergabe offen. Darüber hinaus sind Browser-/Gerätevielfalt, sämtliche jemals erzeugten Sicherungen und ein echter Versionswechsel mit neuem Versions-/Cache-Namen nicht bewiesen. APP_VERSION und Cache-Version wurden absichtlich noch nicht als Release erhöht. Die bereits vorhandene Abnahme jeder Altbericht-Zeile und der elf Reparaturen steht im historischen `PRUEFBERICHT-v1.64.md`; seine damaligen offenen Zustände werden durch diese Reparaturübersicht ergänzt, nicht aus der Historie gelöscht.

Aktuelle Befehle:

```sh
node tools/test-run.mjs
node tools/audit-v164.mjs
node tools/audit-v164.mjs --neufunde --port=8970
node tools/audit-v164-browser.mjs
```

Die Audit-Läufer liefern bei vollständigem Lauf Exit 0, auch bei fachlich roten Erwartungen. Ergebniszahlen im JSON immer prüfen. Ursprüngliche historische Protokolle werden nicht mehr überschrieben.
