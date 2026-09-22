# Verbindliche Vorgabe: bestehende Nutzer und Sicherungen erhalten

Vom Nutzer am 21.09.2026 ausdrücklich priorisiert: Die App wird bereits mit echten Betriebszahlen benutzt. Die erfasste Arbeit muss erhalten bleiben. Datenverträglichkeit hat Vorrang vor grafischem Umbau und neuen Funktionen.

## Was dieser Prüfzweig enthält

Bericht, reproduzierbare Gegenproben und einen getrennten Bedienentwurf. **Keine Änderung an index.html, Service Worker, Datenmodell oder bestehenden Nutzerdaten. Keine neue Produktivversion.** Die Originalsuite meldet 412 grüne Tests, die zusätzlichen Gegenproben weisen noch offene Fehler nach. Ein Push dieses Zweigs ist keine Freigabe zum Einsatz einer reparierten App; eine Reparatur ist hier noch nicht enthalten.

## Anforderungen an jede spätere Reparatur

1. IDs und Beziehungen bestehender gültiger Datensätze bleiben erhalten. Keine stillen Ersatz-IDs, keine Neubuchung alter Rechnungen, keine Umnummerierung. Ungültige Importwerte mit präzisem Hinweis melden, nicht unbemerkt verfälschen.
2. Vor Datenwanderungen steht eine vollständige, wieder einlesbare Sicherung inklusive Anhang-Dateien zur Verfügung. Ein interner Snapshot ohne Blobs genügt dafür nicht.
3. Alte Sicherungen werden weiterhin eingelesen. Prüffälle müssen die tatsächlich unterstützten historischen Formate enthalten; die vorhandenen v1.61–v1.64-Beispieldaten sind ein Anfang, kein Ersatz für sämtliche historischen Formate. Ältere Formate dürfen bei fehlender Unterstützung nicht teilweise importiert werden.
4. Vorher/nachher vergleichen: Datensatzanzahl und IDs je Speicher; Fremdschlüssel; Honig-/Materialbestände; Rechnungsnummer, Status, Positionen und Beträge; Kassenbuch; Behandlungsnachweise; Anhang-Inhalt und Dateityp. Bestehende festgeschriebene Rechnungen dürfen durch neue Berechnungsregeln nicht still andere Beträge erhalten.
5. Export → Ersetzen → Export und Export → Zusammenführen → erneut Zusammenführen prüfen. Ein wiederholter Import darf gültige Datensätze und Buchungen nicht verdoppeln. Bewusste Löschungen wie ein entferntes QR-Bild müssen nachvollziehbar bleiben.
6. Jeden zusammengehörigen Schreibvorgang mit Abbruch an den kritischen Stellen prüfen. Nach Fehler bleibt entweder der gesamte alte Zustand oder der gesamte neue; ein Neustart darf nichts erneut buchen. Auf tatsächlichen Transaktions-Commit warten.
7. Zwei offene Fenster prüfen: gleichzeitig speichern, festschreiben, stornieren, wiederherstellen und ein altes Formular nach neuerer Änderung speichern. Konflikte sichtbar ablehnen, nicht still überschreiben.
8. Offline-Aktualisierung prüfen: alte App/alter Cache mit vorhandener Datenbank, neue App, unterbrochene Installation, Wartungsantwort und Offline-Neustart. Die Produktivdatenbank zum Testen nie löschen.
9. Kleine, getrennte Commits: erst Sicherheits- und Datenkorrekturen, dann Oberfläche. Kein neues Datenmodell nur für ein neues Layout. Eine Wischaktion ruft denselben geprüften fachlichen Vorgang wie die sichtbare Schaltfläche auf.
10. Ein Zurücksetzen des Codes macht eine Datenmigration nicht automatisch rückgängig. Ein Rückweg muss mit Sicherung und kompatiblem Datenformat getestet sein, bevor ein Update verteilt wird.

## Freigabegrenze

Die oben genannten Punkte sind Abnahmekriterien, **noch keine Behauptung, sie seien alle erfüllt**. Keine Zusicherung „alle alten Backups funktionieren“, solange repräsentative alte Sicherungsformate und die jeweiligen Änderungen nicht getestet wurden. Keine Veröffentlichung oder Zusammenführung in main allein aufgrund einer grünen Grundtestsuite.

Für zusätzliche realitätsnahe Prüfungen nur mit Einwilligung bereitgestellte, vorher anonymisierte Datenkopien verwenden. Echte Kundendaten und vollständige private Sicherungen gehören nicht in den Git-Zweig.

## Bedienkonzept nach den Reparaturen

- Große, beschriftete Aktionen für Durchsicht, Fütterung und Behandlung.
- Wischen links zeigt Papierkorb; rechts kann eine Aufgabe erledigen. Sichtbare Alternativen bleiben vorhanden.
- Papierkorb und Rückgängig sind keine einfache Zeilenlöschung: zugehörige Mengen und Buchungen müssen konsistent mitgehen.
- Rechnungen nach Festschreibung und fachliche Nachweise behalten ihre ausdrücklichen Korrektur-/Stornowege.
- Der mitgelieferte Entwurf verwendet nur Beispieldaten und besitzt keinen Zugriff auf die Betriebsdatenbank.
