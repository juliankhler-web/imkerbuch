# Prüfstand v1.64 – aktuelle Übergabe

Zuerst [CLAUDE-ABSCHLUSS-2026-09-22.md](CLAUDE-ABSCHLUSS-2026-09-22.md) lesen. Dort stehen alle gruppierten Befunde, aktuelle Korrekturen, Prüfnachweise und die noch ausstehende Release-Prüfung. Originaldesign unverändert.

Aktuell: **471/471 reguläre Tests**, **48/48 ursprüngliche Gegenproben**, **3/3 Anschlussgegenproben**. Die zunächst neu gefundenen F20–F22 sind ebenfalls repariert. Zwei echte Fenster, Neustart und Offline-Update-Abbruch wurden zusätzlich geprüft. **Noch keine Produktivfreigabe und keine Zusicherung für sämtliche alten Sicherungen oder Geräte.**

## Unterlagen

- [Aktuelle Claude-Übergabe](CLAUDE-ABSCHLUSS-2026-09-22.md): kompakter Einstieg und endgültiger Stand dieser Reparaturrunde.
- [Datenerhalt und Freigabe](DATENERHALT-UND-FREIGABE.md): Nutzerdaten und alte Sicherungen haben Vorrang.
- [Historischer Prüfbericht](PRUEFBERICHT-v1.64.md): Einzelabnahme der Altberichte und elf Reparaturen sowie ursprüngliche Befunde F01–F19.
- [Verlauf der Reparaturen](REPARATURSTATUS.md): Zwischenstände mit ihren jeweiligen Ergebnissen.
- [Transaktionsetappe](CLAUDE-TRANSAKTIONEN-2026-09-22.md): Stand vor den Folgekorrekturen, einschließlich ursprünglicher Nachweise F20–F22.

Die früheren Bedienentwürfe sind verworfen und keine Umsetzungsvorgabe. Kein grafischer Umbau wurde durchgeführt.

## Nachprüfen

Voraussetzungen: Node.js 24 und Chrome/Chromium; bei abweichendem Browserpfad `CHROME_BIN` setzen. Im Repository-Stamm:

```sh
node tools/test-run.mjs
node tools/audit-v164.mjs
node tools/audit-v164.mjs --neufunde --port=8970
node tools/audit-v164-browser.mjs
```

Nur isolierte Testdatenbanken und Browserprofile verwenden. Nicht mehrere Exemplare desselben Läufers auf demselben Port starten. Audit-Läufe: Exit 0 bedeutet vollständiger Lauf; zusätzlich JSON-Zähler und Einzelwerte prüfen. Ursprüngliche Protokolle bleiben erhalten; aktuelle Protokolle werden bei Wiederholung ersetzt.

## GitHub-Vorbereitung

Aktueller Arbeitszweig: `codex/v164-sicherheitskorrekturen`, Basis `46e2923` (v1.64). Der getrennte historische Prüfzweig heißt `codex/v164-pruefung`. Beim Anlegen lag die lokale Basishistorie acht Commits vor dem lokal gespeicherten `origin/main`; kein erneuter Abgleich mit GitHub erfolgte.

Der Reparaturzweig enthält Code, Tests, künstliche Fixtures und Dokumentation. Browserprofile, private Sicherungen und Testartefakte unter `tools/coverage` sind ausgeschlossen. Es wurde nichts gepusht oder in main übernommen. Vor Veröffentlichung Versions-/Cache-Namen und den tatsächlichen Updatepfad gemäß Abschlussübergabe prüfen.
