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

## 22.09.2026 – Speicherbestätigung und Sicherungshinweis

- F09, nachgewiesener Datenverlustweg: `DB.put` bestätigt erst bei `transaction.oncomplete`. Ein Abbruch nach `request.success` wird als Fehler gemeldet. `S.set` übernimmt neue Werte erst nach erfolgreicher Speicherung; die Bio-Migration bearbeitet Kopien ihrer Einstellungen. Die Abbruchprobe lässt die Zertifikat-Quelle erhalten. Das macht die komplette Bio-Migration noch nicht zu einer einzigen Transaktion: getrennte Ziel-/Quellschreibvorgänge und parallele Migrationsläufe brauchen weiterhin eine weitergehende Prüfung.
- F18: Eine erfolgreiche `DB.schreibeAlles`-Transaktion mit Betriebsdaten setzt wieder das Änderungsflag für die Sicherung. Reine Einstellungen und Snapshots bleiben ausgenommen. Zurückgerollte Sammelbuchungen setzen es nicht.
- F19: Bei einem synchronen Fehler während des Einreihens wird auch die abgebrochene Transaktions-Promise behandelt. Der Aufrufer erhält weiterhin den ursprünglichen Fehler, ohne zusätzliche unbehandelte Ablehnung. Während des Einreihens selbst wird weiterhin nicht awaited.

Die zusätzlichen 48 Gegenproben liefern jetzt **33 bestanden, 15 verletzte Erwartungen und keinen technischen Abbruch**. Der TX-sync-Fall prüfte zuvor nur den Rollback; der neue verpflichtende Test prüft ausdrücklich zusätzlich die fehlende unbehandelte Ablehnung. Protokoll: `speicherkorrektur-results.json`.

Die übrigen Fehler sind nicht durch diese Korrekturen mitbehoben. Insbesondere Rechnungen aus parallelen Fenstern, Bestandskorrekturen und unterbrochene Zusammenführungen bleiben offene Arbeitsblöcke. Es gibt weiterhin keine Produktivfreigabe.

Vollständige Suite nach der Speicherkorrektur: **430/430 grün**, Chrome 153.0.8010.53, 22.09.2026, 03:49:14 UTC. Vier neue verpflichtende Tests prüfen Commit-Abbruch, unveränderte Einstellungen, behandelte Fehler und den Sicherungshinweis.

## 22.09.2026 – Material, Warenkorb und Bildlöschung

F04, F07 und F15 für die bestätigten Fälle korrigiert. Details, Auswirkungen auf Altdaten und offene Grenzen stehen in [Claude-Änderungsübergabe](CLAUDE-AENDERUNGEN-2026-09-22.md). Vollständige Suite: **435/435 grün**. Zusätzliche Gegenproben: **37 bestanden, 11 verletzte Erwartungen**, keine technischen Abbrüche. Keine Veröffentlichung.
