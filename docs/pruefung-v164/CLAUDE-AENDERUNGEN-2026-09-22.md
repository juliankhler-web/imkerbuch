# Übergabe an Claude – Änderungen seit der Nachprüfung v1.64

## Verbindliche Vorgaben

Originaldesign beibehalten. Bestehende Nutzer haben echte Betriebsdaten: keine stillen Datenkorrekturen, keine Umnummerierung bestehender Rechnungen, keine neuen Ersatz-IDs. Alte Backups müssen weiterhin geprüft werden. Keine Produktivfreigabe allein wegen grüner Tests. Keine Veröffentlichung bisher.

Arbeitszweig: `codex/v164-sicherheitskorrekturen`. Ausgangspunkt der Reparaturen: `414e930`, ursprüngliche Anwendung: `46e2923`. Die Zeilen im historischen Prüfbericht beziehen sich auf den damaligen Stand; für Reparaturen die genannten Funktionen und Git-Diffs verwenden.

## Bereits zuvor abgeschlossen

| Commit | Änderung | Nachweis |
|---|---|---|
| `e4ce35e` | F01: neun nachgewiesene HTML-Einschleusungswege und verwandte Ausgaben mit U.esc geschützt; keine Änderung gespeicherter Werte | 426/426 Tests, alle neun ursprünglichen Angriffstests bestanden |
| `8fab802` | DB.put wartet auf Transaktionsabschluss; S.set aktualisiert erst danach den Arbeitsspeicher; Bio-Migration nutzt Kopien. F18: Sammelbuchung setzt Sicherungshinweis. F19: zweite unbehandelte Ablehnung beseitigt | 430/430 Tests, 33/48 zusätzliche Gegenproben bestanden |

F09 ist nur für den nachgewiesenen Verlust bei Abbruch des Ziel-Commits geschlossen. Die gesamte Bio-Migration ist weiterhin keine gemeinsame Transaktion; Wiederholung und parallele Migration bleiben weiter zu prüfen.

## Reparaturschritt: Material, Marktwarenkorb und Bildlöschung

### F04 – tatsächlich gebuchten Materialverbrauch merken

`index.html`, Funktion `verbrauchAbziehen`: `abgezogen` entspricht jetzt der gerundeten Differenz zwischen vorherigem und tatsächlich gespeichertem Bestand. Die Fehlmenge ergibt sich aus angeforderter minus tatsächlich gebuchter Menge.

Beispiel: Lager 0, angefordert 10 → abgezogen 0, gefehlt 10. Die Abfüllkorrektur merkt deshalb keine zusätzlichen 10 Gläser; beim Zurückgeben einer zuvor mit 10 gebuchten Abfüllung entstehen 10 statt 20 Gläser.

Alle fünf Aufrufstellen geprüft: Abfüllkorrektur und Bestandskette nutzen `abgezogen`; Materialabgang nutzt vorher/nachher; Rücknahme von Materialzugang und Pfandrücknahme ignorieren den Rückgabewert. Vorhandene historische `verbrauchAbzug`-Einträge werden nicht nachträglich umgeschrieben. Parallele Materialbuchungen sind dadurch noch nicht abgesichert.

### F07 – Fehlpositionen im Marktverkauf erhalten

`index.html`, `Views.markt.render`: Rendern entfernt keine Warenkorbpositionen mehr. Abfüllungen mit Bestand 0 bleiben sichtbar, solange sie im Warenkorb liegen. Knappe oder gelöschte Positionen erhalten einen Hinweis und eine ausdrücklich betätigte Schaltfläche zum einzelnen Entfernen. Restmengen werden nicht negativ dargestellt. Anzeige und Entfernen aus dem Korb buchen keine Bestandsänderung.

Das bestehende Design wird verwendet. Der Warenkorb bleibt wie zuvor nur im Arbeitsspeicher; dieser Schritt macht ihn nicht über Neustarts dauerhaft. Die Gesamtbuchung des Warenkorbs ist weiterhin kein atomarer Gesamtvorgang.

### F15 – neuere Logo-/QR-Löschung zusammenführen

`index.html`, `Backup._saeubereZeile`: `null` bleibt für `logo` und `rechnungQr` als ausdrückliche Löschung erhalten. Genau diesen Wert speichert die bestehende Oberfläche beim Entfernen. Der vorhandene Zeitstempelvergleich entscheidet weiterhin: neuere Löschung gewinnt, ältere Löschung überschreibt kein neueres Bild. Fehlender Schlüssel bedeutet keine Löschung. Unsichere Bildadressen bleiben abgelehnt.

Kein neues Backupformat, kein geändertes Datenbankschema und keine pauschale Bereinigung bestehender Daten.

### Nachweise dieses Schritts

- Vollständige Suite: **435/435 grün**, Chrome 153.0.8010.53, 22.09.2026 08:10:55 UTC.
- Fünf zusätzliche verpflichtende Tests: Materialabzug mit Rückgabe, echte Abfüllkorrektur, Logo-Merge, QR-Merge und echter Markt-Render mit knappen/leeren/gelöschten Positionen.
- Ursprüngliche Gegenproben: **37/48 bestanden, 11 verletzte Erwartungen, keine technischen Abbrüche**. Protokoll: `material-warenkorb-import-results.json`.
- Nur künstliche Testdaten auf isolierten Browserprofilen/Adressen; echte Nutzerdaten nicht benutzt.

## Weiter offen nach diesem Schritt

Fehlgeschlagene Gegenproben: N7 (ungültige Import-IDs), D1 (halber Verkauf), MONEY-zero, MONEY-pfand24, MONEY-string, STALE-edit, Q4-dialog, Q1-edit, RESTORE-short, RESTORE-repeat und MERGE-abort. Das sind Prüferwartungen, keine vollständige Zählung unabhängiger Fehler.

Zusätzlich die Grenzen des vollständigen Prüfberichts beachten, insbesondere F16 (Bio-Etikett), F17 (Service-Worker-Installation), historische Backup-Kompatibilität und parallele Fenster. F14/N7 berührt eine bewusste ADR-Entscheidung; nicht als beiläufige ID-Änderung lösen. Änderungen an Rechnungsberechnungen müssen den historischen Belegstand schützen.

Vor einer Veröffentlichung müssen Versionsnummer und Cache-Version passend erhöht und der Updateweg geprüft werden. Bisher unverändert, damit dieser Entwicklungsstand nicht mit einem freigegebenen Update verwechselt wird.
