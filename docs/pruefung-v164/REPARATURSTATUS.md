# Reparaturstatus nach der Prüfung von v1.64

## 22.09.2026 – erste Sicherheitskorrektur

Arbeitszweig: `codex/v164-sicherheitskorrekturen`. Der historische Prüfbericht und seine ursprünglichen Protokolle bleiben als Ausgangsbefund erhalten.

F01: Die neun nachgewiesenen HTML-Einschleusungswege sind an der Ausgabe mit `U.esc` geschlossen. Zusätzlich sind die verwandten Ausgaben für Skontofrist, Bio-Umkreis, Abfüllbestand und Abfüllungen im Chargendetail geschützt. Die Korrektur ändert keine gespeicherten Werte, IDs, Beziehungen, Importformate, Berechnungen oder Gestaltung. Ungültige Zahlen sind dadurch nicht fachlich validiert; die übrigen Rechen- und Datenbefunde bleiben offen.

Nachweise:

- Vollständige Suite: **426/426 grün**, Chrome 153.0.8010.53, 22.09.2026. Darin 14 neue Fälle mit echtem Zusammenführen und echten Ansichten, jeweils mit Angriffstext und harmlosen Sonderzeichen. Sie prüfen, dass kein eingeschleustes Element entsteht, kein Skript läuft und die dargestellten Datensätze in der Datenbank unverändert bleiben.
- Ursprüngliche 48 Gegenproben: jetzt **31 bestanden, 17 verletzte Erwartungen, kein technischer Abbruch**. Alle neun ursprünglichen XSS-Proben bestehen. Siehe `sicherheitskorrektur-results.json`.
- Es wurden ausschließlich isolierte Testdatenbanken und Browserprofile benutzt, keine Betriebsdaten.

**Noch keine Produktivfreigabe.** F02–F19 sind weiterhin nach dem Prüfbericht zu bearbeiten bzw. fachlich zu entscheiden. Historische Backups sind noch nicht umfassend freigegeben. Versionsnummer und Service-Worker-Cache bleiben auf dem Ausgangsstand; vor einer späteren Veröffentlichung ist ein eigener getesteter Versionswechsel erforderlich. Es wurde nichts gepusht oder auf main übernommen.

Die verworfenen Bedienentwürfe sind keine Umsetzungsvorgabe. Das Originaldesign bleibt erhalten.
