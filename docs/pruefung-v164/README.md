# Prüfstand v1.64 – Übergabe für die Weiterentwicklung

Der ursprüngliche Zweig `codex/v164-pruefung` enthält Prüfunterlagen und Diagnosetests ohne Änderung der Anwendung. Auf `codex/v164-sicherheitskorrekturen` werden die Reparaturen getrennt weitergeführt: siehe [aktueller Reparaturstatus](REPARATURSTATUS.md). **Noch keine Freigabe für ein Update.** Das Originaldesign bleibt erhalten; die früheren Bedienentwürfe wurden verworfen.

## Zuerst lesen

1. [Datenerhalt und Freigabe](DATENERHALT-UND-FREIGABE.md): bestehende Nutzer und alte Sicherungen haben Vorrang.
2. [Prüfbericht](PRUEFBERICHT-v1.64.md): Einzelabnahme der bisherigen Funde, elf Reparaturen und 19 gruppierte offene Punkte mit Nachweisen und Lösungsvorschlägen.
3. [Bedienentwurf](bedienentwurf.html): eigenständige HTML-Datei mit künstlichen Daten. Wischaktionen und Rückgängig sind nur ein Bedienbeispiel, noch keine Funktion der App.

## Nachprüfen

Voraussetzungen: Node.js 24 und Google Chrome oder Chromium. Bei abweichendem Installationspfad die Umgebungsvariable `CHROME_BIN` setzen. Im Repository-Stamm ausführen:

```sh
node tools/test-run.mjs
node tools/audit-v164.mjs
node tools/audit-v164-browser.mjs
```

Die beiden Audit-Läufe verwenden eigene Browserprofile und lokale Adressen, künstliche Daten und keine bestehende Betriebsdatenbank. Nicht gleichzeitig mehrere Exemplare desselben Läufers starten. Die Fall-Datei `tools/audit-v164-cases.js` wird im Browser innerhalb einer asynchronen Funktion ausgeführt und ist kein eigenständig startbares Node-Skript.

Die Grundsuite meldete 412/412 grüne Tests. Die zusätzlichen 48 Gegenproben ergaben 22 bestandene und 26 verletzte Erwartungen ohne technische Abbrüche. Mehrere Gegenproben betreffen denselben Fehler. Die JSON-Protokolle dokumentieren die Ergebnisse; beim erneuten Ausführen werden sie überschrieben.

**Exit 0 der Audit-Läufe bedeutet nur, dass der Diagnoselauf abgeschlossen wurde.** Das ist kein grünes Freigabesignal. Für die spätere Übernahme als verpflichtende Regressionstests müssen die erwarteten Ergebnisse ausgewertet und die nachgewiesenen Fehler behoben werden. Der Browserlauf simuliert Wartungsantworten und eine neue Cache-Version ausschließlich in seinem lokalen Testserver.

## GitHub vorbereiten

Zweig: `codex/v164-pruefung`. Ausgangspunkt: `46e2923` (v1.64). Beim Anlegen lag dieser lokale Stand acht Commits vor dem lokal gespeicherten Stand von `origin/main`; es wurde kein Abgleich mit GitHub durchgeführt. Ein Push dieses Zweigs enthält auch diese Ausgangshistorie.

Im Checkout dieses Zweigs kann der Nutzer anschließend veröffentlichen:

```sh
git push -u origin codex/v164-pruefung
```

Es wurde noch nichts gepusht und nichts nach `main` übernommen. Ein Pull Request sollte zunächst als Prüf- und Übergabezweig behandelt werden. Repository-Einstellungen für automatische Bereitstellung vor einem Push selbst kontrollieren. Keine privaten Sicherungsdateien oder Browserprofile hinzufügen.

## Reihenfolge für die nächste Arbeit

1. Sicherheitslücken und unteilbare Buchungen reparieren, mit den Gegenproben belegen.
2. Alte Sicherungsformate, Migrationen mit Abbruch und parallele Fenster gemäß Datenerhalt-Vorgabe prüfen. Fehlende historische Beispiele ausdrücklich dokumentieren.
3. Erst danach Layout und Wischaktionen umsetzen; fachliche Lösch-, Rückbuchungs- und Stornoregeln beibehalten.

Der Bericht trennt bestätigte Befunde, bewusst akzeptierte Einschränkungen und noch nicht nachgewiesene Kompatibilität. Auch eine vollständig grüne Testsuite ersetzt diese Grenzen nicht.
