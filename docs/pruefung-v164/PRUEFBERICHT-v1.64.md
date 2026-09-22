# ImkerBuch v1.64 – formale Nachprüfung und Übergabe

Stand: 21.09.2026. **Keine vollständige Abnahme: Mehrere behauptete Reparaturen sind nur teilweise wirksam.** Die Anwendung wurde für diese Prüfung nicht geändert.

Geprüft: `index.html`, Version 1.64, SHA-256 `724f0dba870ddc4ba520a7e662b7266ca6bc12fa97828ee5909b3ceb9ac49654`. Identisch mit dem lokalen Git-Stand `46e2923` in `/Users/juliankoehler/ImkerApp`. Alle folgenden App-Zeilen beziehen sich auf diesen Stand. Die erste, zu pauschale Fassung dieses Berichts ist durch diese Einzelprüfung ersetzt.

## Belege und Zählung

- Mitgelieferte Suite selbst ausgeführt: **412/412 grün**, Chrome 153.0.8010.48.
- Zusätzliche Regressionen gegen die echte App und IndexedDB: **48 Prüfungen, 22 bestanden, 26 verletzte Erwartungen, keine abgebrochenen Prüfungen**. Die 26 Verletzungen sind keine 26 verschiedenen Fehler: mehrere prüfen dieselbe Ursache. Protokoll: `regression-v164-results.json`; reproduzierbarer Läufer: `tools/audit-v164.mjs` mit `tools/audit-v164-cases.js`.
- Tests laufen auf einem eigenen lokalen Origin, einem eigenen Browserprofil und `?testdb=1`. Schreibfehler werden gezielt erzeugt; das ist kein gemessener Festplattenausfall. Dialogzeiten werden kontrolliert, um das Rennen reproduzierbar zu machen. Es wurden dafür keine echten Betriebsdaten benutzt.
- `docs/PRUEFUNG-2026-09.md` enthält **28 alte IDs**, nicht 34: S1–S6, Q1–Q12, R1–R5, J1–J5. Der vorhandene zweite Bericht enthält N1–N12; einige sind Wiederholungen/Vertiefungen. Deshalb unten alle 28 Tabellen-IDs, alle zwölf N-IDs und die elf Reparaturen separat. Eine eindeutige Liste von exakt 34 unabhängigen Funden ist in den Unterlagen nicht ausgewiesen; es wird nichts still ausgelassen oder passend gezählt.
- „Behoben“ bedeutet: der beschriebene ursprüngliche Fehler ist an den genannten Stellen geschlossen. Es bedeutet keine Freigabe des gesamten Moduls oder vollständige Rechtsprüfung. Zusätzliche Randfälle stehen ausdrücklich dabei.

## 1. Jede Zeile der alten Tabelle

| ID | Abnahme | Aktueller Code in index.html | Nachweis / verbleibende Grenze |
|---|---|---|---|
| S1 | Behoben | 12680–12696 | Unbekannte Speicher werden gezählt, bekannte Bezeichnungen escaped. Vorhandener S1-Test prüft die echte Vorschau. |
| S2 | Sicherheitsweg behoben | 12749–12775; 3861 ff. | ID-Muster und entschärfte Listenattribute; Datenfolgen der Ersatz-ID bleiben N7/F14. |
| S3 | Teilweise | 4502, 4611, 4882, 8489, 859–860; dagegen 4200, 8209–8210, 8273–8274 | Benannte Listenwerte gehärtet, aber andere Ausgaben derselben Zahlendaten bleiben offen. Siehe F01. |
| S4 | Benannte Wege behoben | 865–879, 12761–12767, 15030, 15145, 15149, 15429–15430 | Bildadressen, Feldtypen und Vorlagenwerte entschärft. N1/N2-Gegenproben bestehen. Keine globale Einstellungsfreigabe. |
| S5 | Behoben | 13234–13241, 13269–13272 | CSV-Export nutzt den Schutz für Formelanfänge. P8 besteht. |
| S6 | Behoben | 13239, 13256–13257, 13268–13269 | Fremde Zellobjekte werden vor SheetJS zu JSON-Text. P7 besteht. |
| Q1 | Teilweise | 2653–2660; 4376–4386; 5894–5897 | Löschen im Volk gibt zurück. Mengenänderung dort korrigiert weiterhin keinen Materialabzug: F03, Q1-edit. |
| Q2 | Teilweise | 1913–1933 | Standard-Restore zieht Material ab; knappes Lager und mehrfacher Posten fehlerhaft: F05/F06. |
| Q3 | Behoben für ursprünglichen Fall | 9160–9170 | Zwei Zeilen à 6 aus 10 werden abgelehnt; eigene Q3-Gegenprobe besteht. Prüfung während offener Bestätigung veraltet: F02. |
| Q4 | Teilweise | 9150–9172, 9190–9199 | Zweiter Aufruf nach abgeschlossener erster Buchung blockiert (Q4 bestanden). Zwei schon offene Bestätigungen nicht (Q4-dialog): F02. |
| Q5 | Behoben bei unterbrochenem Einzelanlauf | 15471–15506 | Herkunft wird gespeichert und wiederverwendet. Echter Abbruch nach Chargen-Commit mit Wiederanlauf geprüft: MIGRATE-retry bestanden. |
| Q6 | Behoben | 12793–12831 | Vorbereiten vor Löschen, alle Ersetzungen in gemeinsamer Transaktion. Ungültiger Anhang erhält Original: N6 bestanden. |
| Q7 | Behoben | 12918–12940, 12955–12958 | Fehlgeschlagene Ordner-Sicherung meldet Fehler und verschiebt Termin nicht. Vorhandener Q7-Test besteht. |
| Q8 | Nicht vollständig behoben | 8605–8619; 8537 | Kassieren behält Fehlerpositionen, anschließendes Rendern löscht sie wieder. Q8-render bestätigt F07. |
| Q9 | Ursprünglicher Rückfragefehler behoben | 2035–2042 | Nur Guard-Formulare löschen dirty; Abbrechen im Bestätigungsdialog erhält es. Vorhandener Q9-Test besteht. Globales Flag ist damit nicht zu einem Flag je Formular geworden. |
| Q10 | Standardfall behoben, Abbruch offen | 12853–12881 | 10−2−3 ergibt nach Merge 5 (Q10 bestanden). Korrekturen liegen außerhalb der Importtransaktion: F08. |
| Q11 | Behoben | 13309–13314 | Cache-Schlüssel enthält vollständige Bildadresse plus Zielgröße. |
| Q12 | Behoben | 13222 | Excel nutzt varroaMetrik für Kennzahl und Einheit. |
| R1 | Behoben | 11445–11453 | Folgeposten braucht gleiche Gebindegröße. Eigene R1-Gegenprobe erhält die 250-g-Gläser. |
| R2 | Nicht behoben | 8441–8444; 11419 | Aufrufer übernimmt b.abgezogen, Helfer liefert weiterhin Sollmenge. R2-edit und R2-return bestätigen F04. |
| R3 | Behoben für ursprünglichen Fall | 8413–8421 | Beim Bearbeiten: neue Abfüllmenge plus andere Abfüllungen gegen Chargenmenge. Quelltextprüfung; keine Zusage für zwei parallele Korrekturen. |
| R4 | Behoben | 10265–10269 | Erlöspositionen bekommen anteiligen Rechnungsrabatt. |
| R5 | Behoben | 12227–12230, 12315; 10052 ff. | Hilfetext entspricht Zuckerinterpretation, 92 % Teig und 73 % Fertigsirup. |
| J1 | Ursprüngliche Angaben ergänzt, Randfall offen | 13844–13849, 13893–13899; 8918 | Steuerkennung und Lieferdatum werden ausgegeben; Entgeltgliederung für positive Sätze vorhanden. 0-%-Position fehlt in Netto-Summe: F12. |
| J2 | Für Regelbesteuerung behoben, nicht für alle Modelle | 8966, 8927–8935, 15062–15063 | Pfandsteuersatz wird am neuen Beleg gespeichert. Pauschalzweig ignoriert ihn: F13. Keine Aussage, welcher Satz im Einzelfall rechtlich anzuwenden ist. |
| J3 | Ursprünglicher Sorten-Fallback behoben | 6291–6301, 6326 | „Raps“ wird „Rapshonig“. Freitext etikettNotiz bleibt bewusst editierbarer Vorrang. |
| J4 | Behoben | 6309–6314, 13436 | 0 Tage und nicht erfasst werden im Bestandsbuch unterschiedlich ausgegeben. |
| J5 | Teilweise | 13757–13773, 13801–13810 | EU-Logo 1:1,5 bleibt bei passenden Bilddaten proportional; Herkunft ergänzt. Kein Logo bleibt weiterhin möglich: F16. |

## 2. Abgleich der zusätzlichen IDs des zweiten Berichts

| ID | Ergebnis im aktuellen Code |
|---|---|
| N1 | Behoben: Bild-Präfixausbruch durch vollständige Prüfung verhindert (865–879); tatsächlicher Import/Render-Test bestanden. |
| N2 | Behoben: eigener Stockkarten-Feldtyp escaped (15145); tatsächlicher Render-Test bestanden. |
| N3 | Benannte Anzahl/Funnel-Werte behoben (5129, 5204–5207); Zucht-Termintag bleibt anderer offener Sink (5210), F01. |
| N4 | Behoben: Koordinaten numerisch/räumlich geprüft (888–896), Nullprüfung an Aufrufern (3805–3808, 3886). |
| N5 | Behoben: fremder Papierkorb-Bereich als konstanter Ersatztext (11898), Import/Render-Test bestanden. |
| N6 | Behoben: fehlerhafte Anhänge verursachen kein vorheriges Leeren mehr (12815–12831). |
| N7 | Verhalten bleibt: Zufalls-ID ohne Referenzabbildung (12773), F14. ADR-0004 erklärt den Verknüpfungsverlust ausdrücklich als bewusst; damit keine heimliche Regression, aber auch keine Reparatur. |
| N8 | Offen: null-Bildwerte werden beim Merge verworfen (12761–12764), F15. |
| N9 | Nur teilweise: Ziel-vor-Quelle vorhanden (15573 ff.), Ziel-Commit wird nicht abgewartet (1856), F09. |
| N10 | Teilweise: laufender Fetch prüft App-Hülle (SW:76–83), Installation nicht (SW:15), F17. |
| N11 | Kein Softwarefehler: Erstbesuch ohne Netz und ohne gespeicherte App kann nicht funktionieren. Die frühere kosmetische Fehlerklassifizierung wird zurückgenommen. |
| N12 | Offen: Verkauf schreibt weiterhin drei Teilvorgänge (6450–6452), F10. |

## 3. Elf Reparaturen von v1.63 nach v1.64

| Reparatur | Ergebnis / Begründung |
|---|---|
| S63-1 Bildquelle | Abgenommen für den gemeldeten HTML-Attributausbruch, index.html:865–879. |
| S63-2 Stockkarten-Feldtyp | Abgenommen, 15145. |
| S63-3 Zuchtzahlen | Abgenommen für anzahl/angenommen/geschluepft/begattet, 5129 und 5204–5207; t.tag ist zusätzlich offen, F01. |
| S63-4 Kartenlinks | Abgenommen, 888–896 und Aufrufer. |
| S63-5 Papierkorb-Bereich | Abgenommen für die Ausgabe, 11898. |
| 6 Import/Mehrspeichertransaktion | Ersetzen abgenommen (12831), Merge nur bis zum Commit (12853), nachfolgender Abgleich separat: F08. |
| 7 Chargenmigration | Abgenommen für Unterbrechung/Wiederanlauf: 15471–15506; MIGRATE-retry mit tatsächlich gesetztem Abbruch bestanden. |
| 8 Bio-Migration | Nicht vollständig abgenommen: nach erfolgreichem Ziel-Commit sicher (N9 bestanden), bei Ziel-Transaktionsabbruch nach Request-Erfolg Datenverlust (BIO-commit), F09. |
| 9 Rechnungsfestschreibung | Gemeinsamer Schreibblock technisch abgenommen (9199). Konkurrenzprüfung außerhalb und alte Editoren bleiben offen, F02. |
| 10 Papierkorb-Restore | Gemeinsamer Schreibblock technisch abgenommen (1932). Mengenberechnung nicht vollständig korrekt, F05/F06. |
| 11 Service Worker | Laufender Netzwerkpfad repariert, Installationspfad bleibt ungeschützt: F17. |

### DB.schreibeAlles genau geprüft

**Der zentrale Schreibblock ist tatsächlich atomar.** `DB.open()` wird vor Erzeugen der Transaktion abgewartet (1883). Zwischen `db.transaction` (1884), dem Einstellen aller Requests (1891–1901) und Rückgabe des Abschluss-Promises (1904) steht kein await. `oncomplete` meldet Erfolg; Fehler/Abort melden Ablehnung. Ein synchroner Fehler führt zu `tx.abort()`.

Zusätzlich zu den vorhandenen Tests wurden zwei echte Fehlerfälle ausgeführt: ungültiger Settings-Schlüssel nach bereits eingereihtem Kontakt-Put und Abbruch im Erfolgsereignis eines bereits ausgeführten Requests. In beiden Fällen blieben beide betroffenen Datenbestände unverändert. Die vorhandene B63-6-Prüfung mit unbekanntem Store allein prüft dagegen nur einen Fehler schon beim Anlegen der Transaktion, keinen mittendrin erfolgenden Rollback.

**Grenzen:** Der Schreibblock sperrt nicht die vorherigen Reads seiner Aufrufer. Er umfasst nicht `bestandAbgleich`, Rechnungszähler-Update oder normale Verkäufe. Er ersetzt `DB.put` nicht: dessen Promise wartet weiterhin nur auf Request-Erfolg. F09 und F18 beschreiben konkrete Folgen. Bei synchronem Fehler entsteht außerdem ein unbehandeltes zweites Promise (F19). Die lokal vergebenen IDs/Zeitstempel an Eingabeobjekten werden bei Rollback nicht zurückgesetzt; daraus allein wird kein Datenverlustfund gemacht.

## 4. Bestätigte offene Funde – nach Schweregrad

### F01 – kritisch: Importierte Inhalte führen weiterhin Code aus

**Was passiert:** Eine fremde Sicherung kann beim Öffnen normaler Ansichten Code mit Zugriff auf die lokalen App-Daten ausführen.

**Code und konkret getestete Eingaben:** In einer gültigen Sicherung jeweils einen Datensatz mit einer neuen gültigen ID ergänzen; als P den Text `<img src=x onerror=window.__auditHit++>` verwenden. Im isolierten Browser wurde der Zähler vor jeder Probe auf 0 gesetzt und anschließend 1 gemessen.

| Feld | Datei/Zeile | Auslösen nach Zusammenführen |
|---|---|---|
| rechnungen.positionen[0].steuersatz = P | index.html:9034 | Regelbesteuerte Rechnung mit einer Position öffnen. |
| rechnungen.zahlungszielTage = `">` + P | index.html:9025 | Rechnungsentwurf öffnen. Gleichartiger ungeschützter Wert: skontoTage, 9027. |
| voelker.status = P | index.html:4187 | Detailseite des Volks öffnen. |
| behandlungen.wartezeitTage = P | index.html:5300 | Behandlungen öffnen. |
| abfuellungen.anzahl = P | index.html:8273 | Honig → Abfüllungen öffnen, Charge mitliefern. Weitere Roh-Ausgaben: 8209–8210 und 8274. |
| verkaeufe.anzahl = P | index.html:7768 | Honig → Verkäufe öffnen. |
| staende.bio.erhebung = `">` + P | index.html:7548 | Bio → Standort/Landbedeckung bearbeiten. Gleicher Weg für bio.umkreisM, 7546. |
| zuchtserien.termine[0].tag = P | index.html:5210 | Zuchtserie mit gültigem Startdatum und Termin öffnen. |
| chargen.losnummer = P | index.html:6330 | Etikettformular einer zugehörigen Abfüllung öffnen. |

**Mitwirkung:** Präparierte Datei zusammenführen und betroffene Ansicht öffnen; keine weitere Skriptfreigabe. Kein bloßer Datei-Auswahl-Angriff behauptet. Die aktuelle Testumgebung hat keine zusätzliche Server-CSP; eine solche könnte Ausführung begrenzen, beseitigt aber die fehlerhafte HTML-Ausgabe nicht.

**Lösung:** Bei diesen Ausgaben U.esc oder DOM-textContent verwenden, Attribute ebenfalls kontextgerecht entschärfen. Fachlich numerische Felder beim Import validieren, statt still HTML/Objekte als Werte zu speichern. Die neun XSS-Prüfungen des Zusatzläufers müssen anschließend 0 Ausführungen liefern. Nicht nur das jeweilige Hilfsformat in einem künstlichen span testen, sondern Import plus echten View.

### F02 – wichtig: Rechnung lässt sich doppelt buchen oder wieder zum Entwurf machen

**Datei/Zeilen:** index.html:9150–9199 sowie 9050–9073.

**Was passiert:** Zwei offene Rechnungsfenster können eine Festschreibung doppelt buchen; ein alter Editor kann sie anschließend überschreiben.

**Auslösen:** Entwurf mit 2 Gläsern à 5 €, Lager 10, in A und B öffnen. In beiden Festschreiben bis zur Bestätigung starten. A bestätigen und abschließen; dann B bestätigen. Gemessen: Lager **6 statt 8**, **zwei statt einer** Kassenbuchzeile, **20 statt 10 €**. Die Nummer kann dabei erneut geändert werden; für die Reproduktion ist keine exakt gleichzeitige Ausführung nötig. Separat: A als Editor offen lassen, in B festschreiben; in A Rechnungsdatum ändern. Gemessen: gespeicherter Status wieder `entwurf`, während Bestand und Einnahme schon gebucht sind.

**Warum:** Die Prüfung steht vor der beliebig langen Rückfrage; Änderungen des alten Editors speichern dessen vollständiges altes Objekt ohne Statuskonfliktprüfung. Nur die nachfolgende Schreibtransaktion zu serialisieren reicht nicht.

**Lösung:** Nach Bestätigung innerhalb einer Readwrite-Transaktion Rechnung, aktuellen Bestand und Nummernkreis lesen, prüfen und schreiben. Entwurfsänderungen ebenfalls gegen Status/Revision in der Datenbank prüfen; ältere Editoren dürfen festgeschriebene Daten nicht überschreiben. Read-Requests innerhalb der Transaktion über ihre Ereignisse verketten; keine UI-/Netz-Wartezeiten in diese Transaktion aufnehmen. Belege: Q4-dialog, STALE-edit.

### F03 – wichtig: Fütterung bearbeiten zählt je nach Einstieg anders

**Datei/Zeilen:** index.html:4376–4379 gegenüber 5894–5897.

**Was passiert:** Eine Mengenänderung beim Volk lässt den zugehörigen Zuckerbestand unverändert.

**Auslösen/Rechnung:** 40 kg Ausgangslager, 15 kg Fütterung mit Materialabzug → 25 kg. Im Volk die Fütterung auf 20 kg ändern. Erwartet 40−20 = **20 kg**, gemessen weiterhin **25 kg**. Löschen wurde korrigiert, Bearbeiten nicht.

**Lösung:** Den Materialabgleich auch im Volk-Formular ausführen oder denselben fachlichen Speicherweg nutzen; alten und neuen Abzug plus Fütterung zusammen buchen. Beleg Q1-edit.

### F04 – wichtig: Abfüllkorrektur erzeugt weiterhin Gläser aus dem Nichts

**Datei/Zeilen:** index.html:8441–8444, 11407–11419.

**Was passiert:** Eine Korrektur merkt sich mehr Materialverbrauch, als tatsächlich abgezogen wurde.

**Auslösen/Rechnung:** 10 Gläser waren verbraucht, Materiallager jetzt 0, ausreichend Honig in der Charge. Abfüllung von 10 auf 20 Stück korrigieren und danach löschen. Helfer meldet `abgezogen:10` und gleichzeitig `gefehlt:10`; der Aufrufer merkt 20. Rückgabe ergibt **20 statt 10** Gläser. R2-edit und R2-return reproduzieren dies.

**Lösung:** Tatsächlichen Abzug aus vorherigem minus gespeichertem Nachherbestand zurückgeben; angeforderte Menge separat benennen. Alle Nutzer des Helfers auf die korrigierte Bedeutung prüfen. Nur tatsächlich gebuchte Menge für spätere Rückgabe merken.

### F05 – wichtig: Wiederherstellen bei knappem Lager vermehrt Material

**Datei/Zeilen:** index.html:1921–1932, 11473–11478.

**Was passiert:** Nach Wiederherstellen und erneutem Löschen kann mehr Material vorhanden sein als vorher.

**Auslösen/Rechnung:** Gelöschte Fütterung trägt Abzug 15 kg; inzwischen sind nur 5 kg im Lager. Wiederherstellen setzt Bestand auf 0, lässt den gemerkten Abzug aber 15 kg. Erneutes Löschen gibt 15 zurück: **15 statt 5 kg**. Beleg RESTORE-short.

**Lösung:** Wiederherstellung bei fehlendem Material mit konkreter Fehlmenge ablehnen oder nur tatsächlich abgebuchten Anteil als Gegenbuchung speichern. Fachliche Entscheidung sichtbar machen; nicht still auf 0 begrenzen und vollen Abzug merken.

### F06 – wichtig: Mehrere Restore-Abzüge desselben Postens überschreiben sich

**Datei/Zeilen:** index.html:1924–1930.

**Was passiert:** Beim Wiederherstellen wird bei mehrfach referenziertem Materialposten nur der letzte Abzug wirksam.

**Auslösen/Rechnung:** Lager 30 Stück, Papierkorb-Datensatz mit `verbrauchAbzug:[{inventarId:'s',menge:10},{inventarId:'s',menge:5}]` importieren und wiederherstellen. Beide Reads sehen 30; eingereiht werden 20 und danach 25. Erwartet **15**, gemessen **25**. Beleg RESTORE-repeat. Keine Behauptung, dass jede normal erzeugte Buchung solche Duplikate enthält; eine importierte Datei reicht als Datenquelle, Wiederherstellen erfordert einen Nutzerklick.

**Lösung:** Vorher nach inventarId summieren oder pro ID ein fortgeschriebenes Objekt verwenden. Die gemeinsame Transaktion selbst arbeitet korrekt; falsch sind ihre vorberechneten Werte.

### F07 – wichtig: Fehlerpositionen verschwinden weiterhin aus dem Marktkorb

**Datei/Zeilen:** index.html:8537, 8615–8619; tests/tests.js:7613–7618.

**Was passiert:** Die Meldung behauptet, die Position bleibe im Korb, tatsächlich ist sie nach dem Neuzeichnen weg.

**Auslösen:** Vier Gläser im Korb; während die Bestätigung offen ist, verkauft ein anderes Fenster drei von den vier verfügbaren Gläsern. Kassieren scheitert am Bestand 1. `kassieren` speichert `{a:4}`, `render` entfernt den Eintrag wegen 4 > 1. Q8-render gemessen: `{}` statt `{a:4}`.

**Lösung:** Ungültige Korbzeilen sichtbar mit Fehlmenge erhalten und Menge korrigierbar machen. Der bestehende Test ersetzt renderRoute und übersieht den zweiten Schritt; echter Render muss Teil des Tests werden.

### F08 – wichtig: Zusammenführen ist einschließlich Bestandsabgleich nicht unteilbar

**Datei/Zeilen:** index.html:12853–12854, 12868–12881, 12701–12717.

**Was passiert:** Nach einer fehlgeschlagenen Bestandskorrektur bleibt der neue Verkauf mit einem zu hohen Lagerbestand gespeichert.

**Auslösen/Rechnung:** 10 Gläser lokal, Sicherung bringt Verkauf von 3. Schreibfehler beim Abgleich erzwingen. Gemessen: Verkauf vorhanden, Lager **10 statt 7**. Der Import ist bereits committet; mehrere Abfüllungen könnten unterschiedlich weit korrigiert sein. Beleg MERGE-abort.

**Lösung:** Merge-Entscheidung und nötige Bestandskorrekturen in denselben fachlichen Transaktionsvorgang aufnehmen. Fehler beim Zusammenführen auch im UI abfangen; dort fehlt aktuell das try/catch des Ersetzen-Wegs. Nur erneut versuchen ist keine garantierte automatische Wiederherstellung.

### F09 – wichtig: Bio-Migration wartet weiterhin nicht auf den Ziel-Commit

**Datei/Zeilen:** index.html:1853–1857, 1989, 15573–15604.

**Was passiert:** Ein abgebrochener Schreibvorgang kann das eigene Zertifikat verlieren, obwohl „Ziel zuerst“ programmiert ist.

**Auslösen:** Eigener Zertifikatseintrag in bioeintraege; Migration aktivieren. Im Test wird die Settings-Transaktion für `imkerei` im Request-Erfolgsereignis mit `tx.abort()` abgebrochen. `DB.put` hat sein Promise schon am Request-Erfolg erfüllt, daher läuft die Quellenlöschung weiter. Nach erneutem S.load gemessen: **Zielnummer fehlt und Quelle fehlt**. Beleg BIO-commit. Das ist ein gezielt injizierter Transaktionsabbruch, kein behaupteter typischer Alltagsablauf.

**Lösung:** `DB.put` erst bei tx.oncomplete erfüllen und bei tx.onabort/onerror ablehnen; für Zielübernahme plus Quellenlöschung dieselbe Mehrspeichertransaktion verwenden. S.data erst nach Commit aktualisieren oder beim Fehler zurücksetzen. Die bereits geprüfte Unterbrechung *nach erfolgreich abgeschlossenem Ziel-Commit* ist dagegen repariert.

### F10 – wichtig: Verkauf und Storno bleiben mehrere Einzelbuchungen

**Datei/Zeilen:** index.html:6450–6452, 6459–6461 und 9084–9087.

**Was passiert:** Ein Fehler kann Lager, Verkaufsbeleg und Kassenbuch auseinanderlaufen lassen.

**Auslösen/Rechnung:** Verkauf von 2 aus 10, gezielter Fehler beim anschließenden Kassenbuch-Put. Gemessen: **8 Gläser, kein Verkaufsbeleg**, statt vollständig gebuchtem Verkauf oder unverändertem Bestand. Beleg D1. Die umgekehrten Einzelpfade beim Verkaufs- und Rechnungsstorno sind statisch bestätigt, nicht separat mit einem realen Speicherausfall ausgeführt.

**Lösung:** Je Vorgang alle Änderungen samt Papierkorb in eine gemeinsame Transaktion, Prüfung der aktuellen Ausgangsdaten in derselben Transaktion. Nach Fehler muss das UI die Position erneut anbieten können, ohne nochmals abzuziehen.

### F11 – wichtig: Zahl als Text verändert die Umsatzsteuer

**Datei/Zeilen:** index.html:8916–8919, 8934–8935; Import 12769–12774.

**Was passiert:** Ein importierter Satz `"7"` statt `7` ergibt einen falschen Steuerbetrag.

**Auslösen/Rechnung:** Fremde Sicherung mit Regelbesteuerung, einer Position zu 107 €, menge 1, steuersatz `"7"`. Erwartet 107×7/107 = **7 €**; gemessen 107×7/1007 = **0,743793… €**. `100 + satz` hängt den String an. Derselbe Typfehler ist beim Pauschalsatz möglich. Beleg MONEY-string.

**Lösung:** Endliche Zahlen beim Import und am Recheneingang erzwingen; unplausible Werte ausdrücklich ablehnen. Eine präparierte Datei plus anschließende Anzeige/PDF-Erstellung reicht; keine HTML-Ausführung nötig.

### F12 – wichtig: Netto-Gesamtsumme lässt 0-%-Positionen aus

**Datei/Zeilen:** index.html:8918–8925 und 13893–13899.

**Was passiert:** Die Rechnung nennt eine zu kleine Netto-Gesamtsumme bei gemischten Steuersätzen einschließlich 0 %.

**Auslösen/Rechnung:** Regelbesteuerung, 107 € zu 7 % plus freie Position 50 € zu 0 %. Brutto 157 €, Steuer 7 €, netto **150 €**. Gemessen nettoJeSatz-Summe **100 €**, genau diese wird im PDF als „Nettoentgelt gesamt“ ausgegeben. Beleg MONEY-zero.

**Lösung:** 0-%-Entgelt ebenfalls gruppieren; Netto gesamt muss Summe aller Entgelte sein. Eine eventuelle steuerliche Befreiungsbegründung ist davon gesondert zu behandeln. Zur ursprünglichen J1-Anforderung siehe [§ 14 Abs. 4 UStG](https://www.gesetze-im-internet.de/ustg_1980/__14.html).

### F13 – wichtig: Pauschalierung ignoriert die neue Pfand-Steuereinstellung

**Datei/Zeilen:** index.html:8912, 8927–8935, 8966.

**Was passiert:** Ein ausdrücklich gespeicherter Pfandsteuersatz wirkt bei §24-Rechnungen nicht.

**Auslösen/Rechnung:** Pauschalsatz 7,8 %, pfandSteuersatz 7,8 %, zehn Positionseinheiten à 10,78 € und 1,078 € Pfand je Einheit. Gewünschte Rechnung: (107,80+10,78)×7,8/107,8 = **8,58 €**. Gemessen **7,80 €**; Pfand wird im Pauschalzweig ausgelassen. Beleg MONEY-pfand24. Hier wird die ignorierte Einstellung beanstandet, nicht die rechtliche Wahl des Satzes bewertet.

**Lösung:** Die gewählte Pfandbehandlung auch dort berücksichtigen oder nicht unterstützte Kombinationen klar ablehnen. Hint bei Rechnungspositionen (9110) sagt außerdem weiterhin pauschal „außerhalb … Umsatzsteuer“, obwohl Regelbesteuerung jetzt anderes erlaubt.

### F14 – wichtig, ausdrücklich als Designentscheidung dokumentiert: ID-Ersatz trennt Beziehungen

**Datei/Zeilen:** index.html:12749, 12771–12774; docs/adr/0004, Abschnitt Folgen.

**Was passiert:** Ungültige Import-IDs erhalten zufällige neue IDs, während abhängige Datensätze die alten Kennungen behalten.

**Auslösen:** Stand `id:'stand:1'`, Volk mit `standId:'stand:1'` zweimal zusammenführen. Gemessen zwei Stände mit verschiedenen UUIDs und Volk mit unverändertem, nicht auflösbarem `stand:1`. N7 reproduziert dies. Von der App regulär erzeugte UUIDs sind nicht betroffen.

**Einordnung:** ADR-0004 nimmt den Verlust bewusst in Kauf. Deshalb keine Behauptung eines ungewollten neuen Fehlers; für die verlangte formale Abnahme des alten N7 lautet der Status „nicht behoben / bewusst akzeptiert“. Wiederholungsduplikate sind ebenfalls real.

**Lösungsvorschlag:** Fehlerhafte Kennungen mit konkretem Hinweis ablehnen oder eine konsistente ID-Abbildung über alle Beziehungen erstellen. Eine ungültige Kennung muss nicht ungeprüft im HTML bleiben, um Beziehungen zu erhalten.

### F15 – wichtig: Gelöschtes Zahlungsbild bleibt beim Merge erhalten

**Datei/Zeilen:** index.html:12761–12764.

**Was passiert:** Eine neuere Sicherung kann ein bewusst entferntes Rechnungs-QR-Bild nicht entfernen.

**Auslösen:** Lokal gültiges rechnungQr speichern; neueres Backup enthält `{key:'rechnungQr',value:null,lastModified:'2099-01-01T00:00:00.000Z'}`. Zusammenführen: altes Bild bleibt. N8 gemessen. Gleiches gilt für logo.

**Lösung:** null als gültige Löschmarke separat zulassen; ungültige nichtleere Bildadressen weiterhin ablehnen. Kein Sicherheitsfehler allein durch eine Bilddatei behauptet.

### F16 – wichtig: Bio-Etikett kann weiter ohne EU-Logo ausgegeben werden

**Datei/Zeilen:** index.html:13757–13773, 13801–13810.

**Was passiert:** Die als Bio gekennzeichnete Etikettenvorlage kann ohne das erforderliche EU-Bio-Logo entstehen.

**Auslösen:** Eigener deutscher vorverpackter Bio-Honig, `imkerei.bio='ja'`, Kontrollstellencode gesetzt, bioLogos leer; Etiketten-PDF erzeugen und als einzige Verpackungskennzeichnung verwenden. Die Logo-Schleife läuft nullmal; der Text „EU-Bio“ ersetzt das Logo nicht. Statisch nachgeprüft, kein PDF-Pixeltest für diesen Randfall.

**Warum/Lösung:** Für diesen Fall verlangt Art. 32 Abs. 1 Buchst. b der [VO (EU) 2018/848](https://eur-lex.europa.eu/eli/reg/2018/848/oj/deu) das Logo; siehe auch [EU-Kommission](https://agriculture.ec.europa.eu/farming/organic-farming/organic-logo_de). Gültiges Logo bereitstellen oder fehlende Ergänzung klar vor Druck benennen. Wenn die Verpackung es schon auf einem separaten Etikett trägt, ist das Fehlen auf diesem zusätzlichen Etikett allein **kein** belegter Rechtsverstoß. Herkunftszeile und übliches Logo-Seitenverhältnis sind inzwischen korrigiert.

### F17 – wichtig: Service-Worker-Installation prüft die App-Hülle nicht

**Datei/Zeilen:** service-worker.js:14–22 gegenüber 76–83.

**Was passiert:** Bei einer neuen Worker-Installation kann eine Wartungsseite weiterhin die Offline-App ersetzen.

**Auslösen:** Bereits installierte App; neues Worker-Skript ausliefern, während `/` und `/index.html` eine Wartungsseite mit HTTP 200 liefern und die anderen Shell-Dateien erreichbar bleiben. `addAll(SHELL)` akzeptiert die Antworten ohne Inhaltsprüfung; Aktivierung entfernt den alten Cache.

**Lösung:** Auch beim Installieren die App-Hülle vor Aktivierung prüfen; bei ungültigem HTML Installation abbrechen und alten Worker/Cache behalten. Die neue Inhaltsprüfung im normalen Fetch-Pfad ist richtig und wird nicht als wirkungslos bezeichnet. Der netzlose Erststart ohne jemals gespeicherte Dateien bleibt erwartetes Verhalten.

**Browsernachweis:** `browser-v164-results.json`, B5/B6: Wartungsantwort im normalen Betrieb wird nicht gecacht, Offline-App startet. B8: erneute Worker-Installation mit absichtlich geänderter Cache-Version und Wartungsantwort für beide App-Adressen übernimmt die Wartungsseite; danach existiert nur noch der neue, falsche Cache. Die Änderung wurde allein durch den isolierten Testserver ausgeliefert, nicht an der App-Datei vorgenommen.

### F18 – wichtig: Neue Schreibfunktion umgeht Änderungsmarke für Sicherungen

**Datei/Zeilen:** index.html:1879–1904, 9199; 13080–13081; 12965–12972.

**Was passiert:** Nach Festschreiben einer Rechnung kann die konfigurierte Sicherung/Warnung beim Schließen ausbleiben.

**Auslösen:** Entwurf erstellen, extern sichern (`_changedSinceBackup=false`), danach festschreiben. Gemessen Flag weiterhin **false**. Die neue Funktion schreibt direkt; nur DB.put für Nicht-Settings setzt das Flag. Das anschließende S.set für den Nummernkreis zählt ausdrücklich nicht. Beleg BACKUP-flag.

**Lösung:** Erfolgreiche Mutationen zentral als Änderung melden, auch bei schreibeAlles, Löschen und Bulk-Vorgängen. Erst nach Commit setzen. Erfolgreiche Sicherung darf nur den wirklich gesicherten Änderungsstand zurücksetzen.

### F19 – kosmetisch: Synchroner Transaktionsfehler erzeugt zweite unbehandelte Ablehnung

**Datei/Zeilen:** index.html:1885–1889, 1903.

**Was passiert:** Trotz gefangenem Speicherfehler erscheint noch eine unbehandelte Fehlermeldung aus demselben Vorgang.

**Auslösen:** schreibeAlles mit gültigem Kontakt-Put, danach Settings-Put ohne key. Der zweite Put wirft DataError, catch bricht ab und wirft; das bereits erzeugte fertig-Promise wird separat abgelehnt und nie übernommen. TX-sync misst DataError plus unhandledrejection. **Die Daten sind korrekt zurückgerollt.**

**Lösung:** Im synchronen Fehlerpfad auch den Transaktionsabschluss samt Ablehnung konsumieren und genau einen Fehler an den Aufrufer zurückgeben.

## 5. Aufräumen und Testqualität

Belegte Pflegeprobleme statt Architekturkritik:

- Fütterung hat zwei Speicherwege mit unterschiedlicher Materialwirkung (F03). Rechnung/Verkauf/Storno haben unterschiedliche Transaktionsgarantien (F02/F10).
- Die neue Funktion umgeht einen vorhandenen DB.put-Hook (F18). Neue gemeinsame Hilfsfunktionen brauchen die bisherigen Nebenwirkungen ebenfalls.
- Mehrere Sicherheitsregressionen in tests/tests.js:7687–7720 bilden einen Ausdruck in künstlichem HTML nach, statt den echten View aufzurufen. So können Helfertests grün bleiben, während andere Ausgaben desselben Felds offen bleiben. Die Zusatztests verwenden echte Views.
- B63-6 mit unbekanntem Store scheitert vor dem ersten Request; B63-9 ersetzt die komplette Schreibfunktion durch einen sofortigen Fehler. Beide sind nützlich, belegen aber allein keinen mittendrin ausgelösten Rollback. TX-sync/TX-async ergänzen das.
- Q8 blendet renderRoute aus und übersieht dadurch seinen eigenen Folgefehler (F07).
- Wiederholte Einträge im Object.assign(window, …)-Block (z. B. rechnungSummen/kontaktForm) sind redundant, haben aber identische Werte. Kein funktionaler Fehler daraus abgeleitet.
- **Keine tote Funktion formal nachgewiesen.** „Im Coverage-Lauf nie aufgerufen“ bedeutet nicht „im Produkt unbenutzt“. Eine Funktionslöschung allein nach dieser Liste wäre falsch.

Abdeckungslandkarte (mitgelieferte v1.64: 701/991 benannte Funktionen aufgerufen, 70,7 %; keine Zeilenabdeckung): defs (13195) ist trotz Ausgabecharakter relevant wegen fremder Tabellenwerte; Wanderungsform (6151) schreibt mehrere zusammenhängende Daten; Behandlungsform/sammelForm (5343/5412) buchen Material plus Einträge; posForm (9092) beeinflusst Mengen und Geld. Diese sind riskant. renderFaq (14819) ist überwiegend Anzeige statischer Inhalte und geringere Priorität. tabBestand (8472) und Königin-detail (4587) sind überwiegend Anzeige, bleiben wegen fremder Text-/Zahlendaten Sicherheitsflächen. Größe allein ist kein Fehler.

## 6. Was die Gegenproben ausdrücklich bestätigen

- Die fünf gemeldeten v1.63-HTML-Angriffsstellen bestehen mit den ursprünglichen Payloads nicht mehr (N1–N5 bestanden).
- Ein vor dem Import ungültiger Anhang lässt den ursprünglichen Blob stehen (N6).
- Die gemeinsame Transaktion rollt bei synchronem Fehler und tatsächlichem Abort zurück (TX-sync/TX-async).
- Chargenmigration findet nach unterbrochenem Commit dieselbe Abfüllung wieder, ohne Duplikat (MIGRATE-retry).
- Normaler Rechnungsbestandstest und späterer veralteter Festschreibungsaufruf werden abgelehnt (Q3/Q4); die offene Bestätigung ist der abweichende Fall.
- Merge-Normalfall: 10−2−3 = 5 Gläser (Q10). Passende Materialkette: 10+20−15, anschließende Rückgabe wieder 10 und 20 (P6).
- Regelbesteuerung mit echten Zahlentypen: 107 €−10 % = 96,30 €, darin 6,30 € USt und 90 € netto; Skonto 2 % = 1,926 €, Zahlbetrag 94,374 € vor Centdarstellung (P1). Kleinunternehmer: 107 € ohne Steuerausweis (P2). Explizite Pauschalierung 7,8 %: 107,80 € enthalten 7,80 € Steuer (P3). Keine Aussage zur rechtlichen Anwendbarkeit dieses Satzes im Einzelfall.
- Futtermodell: 25 kg Zucker ×1,2 = 30 kg theoretisch; ×0,85 = 25,5 kg gespeichert; Umkehr wieder 25 kg (P4).
- Normaler Verkauf 3 aus 10 und Storno liefern 7 und wieder 10 (P5). Fehlerabbrüche sind der getrennte Befund F10.
- CSV/Excel-Formelschutz für die beschriebenen Angriffe besteht (P7/P8). QR-Text, Downloadnamen und reine PDF-Textübergabe wurden nicht als Browser-Codeausführung fehlklassifiziert. Minifizierte Fremdbibliotheken sind nicht vollständig auditiert.

## Priorisierte Arbeitsliste für die Reparatur

1. F01: alle belegten HTML-Ausgaben schließen, Import/Render-Nachweise erhalten.
2. F09: Request-Erfolg und Transaktions-Commit sauber trennen. Danach fachliche Transaktionen mit Reads/Prüfungen für F02, F08 und F10; bestehende DB.put-Aufrufer auf neue Commit-Semantik prüfen.
3. F03–F07: Mengeninvarianten für Bearbeiten, Löschen, Wiederherstellen und Marktkorb herstellen; diese müssen vor Wischgesten/Rückgängig stimmen.
4. F11–F13: Geldtypen und Netto/Pfand korrigieren. F15/F18: Import-Löschmarken und Sicherungsmarke korrigieren.
5. F17: Installationspfad absichern. F16: Bio-Druckvoraussetzungen klären. F14 bewusst entscheiden, nicht als schon gelöst verbuchen. F19 bereinigen.
6. Danach erst grafischer Umbau in separaten Commits: klare Hauptbereiche, große Bedienflächen, Wischen als Zusatz zu sichtbaren Aktionen, Papierkorb/Rückgängig statt endgültigem Wisch-Löschen. Festgeschriebene Rechnungen behalten ausdrücklichen Stornoweg.

Die Prüfungen sind abgeschlossen im Sinn des beschriebenen Reviewumfangs; die **Anwendung ist damit noch nicht repariert oder freigegeben**. Die vorhandenen 412 Tests ersetzen die neu gefundenen Gegenbeispiele nicht.

## Gesamttabelle der offenen Punkte

| Schweregrad | ID | Punkt | Datei:Zeile |
|---|---|---|---|
| kritisch | F01 | Codeausführung aus importierten Feldern, neun bewiesene Wege | index.html:4187, 5210, 5300, 6330, 7548, 7768, 8273, 9025, 9034 |
| wichtig | F02 | Doppelte Festschreibung / alter Editor überschreibt Status | index.html:9150, 9050 |
| wichtig | F03 | Fütterungsänderung im Volk ohne Materialkorrektur | index.html:4379 |
| wichtig | F04 | Abfüllkorrektur merkt nicht vorhandenes Material | index.html:8442, 11419 |
| wichtig | F05 | Restore bei knappem Lager erzeugt spätere Überrückgabe | index.html:1928 |
| wichtig | F06 | Restore überschreibt wiederholte Postenabzüge | index.html:1925–1930 |
| wichtig | F07 | Rendern entfernt gerade erhaltene Fehlpositionen | index.html:8537 |
| wichtig | F08 | Merge-Abgleich außerhalb der Transaktion | index.html:12854 |
| wichtig | F09 | Bio-Zielschreiben meldet Erfolg vor Commit | index.html:1856, 15579 |
| wichtig | F10 | Verkauf/Storno als Einzelbuchungen | index.html:6450, 9084 |
| wichtig | F11 | Text-Steuersatz verfälscht Rechnung | index.html:8919 |
| wichtig | F12 | Netto-Gesamtsumme ohne 0-%-Positionen | index.html:8918, 13898 |
| wichtig | F13 | §24 ignoriert gewählten Pfandsteuersatz | index.html:8933–8935 |
| wichtig | F14 | Ungültige IDs: Verbindungen weg, Duplikate; laut ADR bewusst | index.html:12773 |
| wichtig | F15 | Neuere Löschmarke für Bild verworfen | index.html:12763 |
| wichtig | F16 | Bio-Etikett ohne EU-Logo weiterhin möglich | index.html:13758 |
| wichtig | F17 | Installation cached Wartungsseite | service-worker.js:15 |
| wichtig | F18 | Neue Schreibfunktion umgeht Sicherungsmarke | index.html:13081, 9199 |
| kosmetisch | F19 | Zusätzliche unbehandelte Promise-Ablehnung | index.html:1903 |
