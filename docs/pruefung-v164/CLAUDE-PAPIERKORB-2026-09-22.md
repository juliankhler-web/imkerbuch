# Übergabe an Claude – Papierkorb und Materialbestand

Arbeitszweig: `codex/v164-sicherheitskorrekturen`. Ausgangspunkt dieses Reparaturschritts: `50a8670`. Vorherige Änderungen stehen in [CLAUDE-AENDERUNGEN-2026-09-22.md](CLAUDE-AENDERUNGEN-2026-09-22.md). Die Originalgestaltung bleibt erhalten. Keine Veröffentlichung und keine Änderung echter Nutzerdaten.

## Problem und neue Regeln

F05: Ein Papierkorbeintrag mit gemerktem Verbrauch von 15 kg wurde bei nur 5 kg Lagerbestand trotzdem wiederhergestellt. Der Bestand fiel auf 0; später wurden die gemerkten 15 kg zurückgegeben. So entstanden 10 kg aus dem Nichts.

**Neue Regel:** Reicht das vorhandene Material nicht, wird der gesamte Vorgang abgelehnt. Ursprünglicher Papierkorbeintrag, Materialbestand und Zielbereich bleiben unverändert. Die Fehlermeldung nennt benötigte und vorhandene Menge. Der Nutzer kann den tatsächlichen Bestand prüfen und anschließend erneut wiederherstellen. Es wird nicht automatisch Material erzeugt oder ein alter Verbrauchsnachweis gekürzt.

F06: Mehrere gemerkte Abzüge desselben Postens wurden jeweils vom ursprünglichen Bestand berechnet und überschrieben sich beim Speichern.

**Neue Regel:** Abzüge je Inventar-ID werden vor der Bestandsprüfung summiert. Beispiel: 30−10−5 = 15. Die ursprünglichen Abzugszeilen des Datensatzes bleiben erhalten; eine spätere Rückgabe ergibt wieder 30.

## Umsetzung

`index.html`, `DB.trashRestore`:

1. Vorab wird ausschließlich gelesen, welche Speicher benötigt werden. Unbekannte Bereiche sowie settings, snapshots und papierkorb als Wiederherstellungsziel werden abgelehnt.
2. Eine gemeinsame Readwrite-Transaktion umfasst Papierkorb, Inventar und Zielbereich.
3. INNERHALB der Transaktion wird der Papierkorbeintrag erneut gelesen. Existiert er nicht mehr, liefert die Funktion null und bucht nichts. Hat sich sein Bereich inzwischen geändert, wird abgebrochen.
4. Ein bereits vorhandener Zieldatensatz mit derselben ID wird nicht überschrieben. Der Papierkorbeintrag bleibt zur Klärung erhalten.
5. Material wird ebenfalls innerhalb der Transaktion gelesen. Ungültige Mengen, fehlende Posten und unzureichender Bestand führen zum vollständigen Abbruch.
6. Erst nach allen Prüfungen werden Material, Zieldatensatz und Papierkorblöschung eingereiht. Zwischen diesen Aufträgen gibt es kein await, keine Benutzerabfrage und keinen Netzwerkaufruf.
7. Erfolg wird erst bei transaction.oncomplete gemeldet; Abbruch verwirft alle Schreibaufträge. Erfolgreiche Wiederherstellung setzt das Sicherungsflag.

`index.html`, Klickbehandlung in `Views.papierkorb`: Fehler werden sichtbar als Toast ausgegeben. Ein inzwischen von anderer Stelle wiederhergestellter Eintrag wird als nicht mehr vorhanden gemeldet; kein falscher erneuter Erfolgshinweis.

## Datenverträglichkeit

Keine Schemaänderung, keine Migration und kein neues Backupformat. Gültige IDs und gespeicherte Verbrauchszeilen bleiben erhalten. Bereits vorhandene Datensätze werden nicht rückwirkend bereinigt. Bei problematischen alten Papierkorbeinträgen ist die Wiederherstellung jetzt bewusst blockiert, statt die Daten zu verfälschen; die Einträge selbst bleiben erhalten.

Diese Korrektur betrifft die Wiederherstellung. Allgemeine Verkaufsbuchungen, Fütterungsbearbeitung, Löschen mit Rückbuchung und andere Lese-/Schreibfolgen sind nicht automatisch ebenfalls gegen parallele Fenster abgesichert.

## Nachweise

Vollständige Suite: **442/442 grün**, Chrome 153.0.8010.53, 22.09.2026 08:15:51 UTC.

Sieben neue verpflichtende Tests prüfen:

- Mehrere Abzüge desselben Postens und anschließende Rückgabe.
- Zu wenig Material mit vollständigem Erhalt beider Lagerposten.
- Fehlenden Materialposten.
- Ungültige Mengen.
- Konflikt mit bereits vorhandenem Zieldatensatz.
- Gleichzeitige Wiederherstellung über zwei getrennte IndexedDB-Verbindungen: genau ein erfolgreicher Vorgang und ein Materialabzug.
- Tatsächlichen Transaktionsabbruch nach erfolgreichem Materialauftrag: vollständiger Rollback aller beteiligten Speicher.

Zusätzliche Gegenproben: **39/48 bestanden, 9 verletzte Erwartungen, keine technischen Abbrüche**. Siehe `papierkorb-results.json`.

Die Gegenprobe RESTORE-short wurde an die ausdrücklich gewählte Regel angepasst: Sie erwartet jetzt Ablehnung plus unveränderten Bestand, erhaltenen Papierkorbeintrag und fehlenden Zieldatensatz. Zuvor erwartete sie erfolgreiche Wiederherstellung und sichere spätere Rückgabe. Es wurde kein fehlgeschlagener Fall entfernt; die neue Prüfung kontrolliert den vollständigen sicheren Fehlerzustand.

## Weiter offen

N7, D1, MONEY-zero, MONEY-pfand24, MONEY-string, STALE-edit, Q4-dialog, Q1-edit und MERGE-abort schlagen weiterhin fehl. Daneben bleiben die nicht von diesen Gegenproben abgedeckten Punkte des Prüfberichts offen, insbesondere Service-Worker-Installation, Bio-Etikett und umfassende historische Backup-Kompatibilität. Keine Produktivfreigabe.
