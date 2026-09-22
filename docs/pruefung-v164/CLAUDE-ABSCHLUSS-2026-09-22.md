# Aktuelle Übergabe an Claude: ImkerBuch-Reparaturzweig

Diese Datei zuerst lesen. Sie fasst den aktuellen Stand zusammen; ältere Berichte sind historische Nachweise, keine aktuelle Liste noch offener Reparaturen. Stand: 22.09.2026, weiterhin unveröffentlichte Weiterentwicklung auf Basis v1.64. Originaldesign beibehalten.

## Ergebnis und Einstieg

**471/471 reguläre Tests, 48/48 ursprüngliche Gegenproben und 3/3 neue Gegenproben bestanden.** Die drei neu nachgewiesenen Fehler F20–F22 sind inzwischen ebenfalls korrigiert. Alle Datenarbeiten fanden in isolierten Testdatenbanken mit künstlichen Beispielen statt. Keine Nutzerdatenbank, kein Push, keine Veröffentlichung, kein Merge auf main.

Arbeitszweig: `codex/v164-sicherheitskorrekturen`. Basis `46e2923`; Zwischenstände `e4ce35e`, `8fab802`, `50a8670`, `22c51cb`, `0052df0`. Die Folgekorrektur ist der folgende Commit dieses Zweigs. Den finalen Stand mit `git log -1` bestimmen. Der ursprüngliche Benutzer-Checkout `/Users/juliankoehler/ImkerApp` bleibt unverändert.

## Status sämtlicher gruppierter Funde

| Schwere | IDs | Aktueller Status |
| --- | --- | --- |
| kritisch | F01 | Nachgewiesene HTML-Einschleusungen geschlossen; echte Import-/Ansichtstests |
| wichtig | F02 | Festschreiben und Nummernvergabe atomar; veraltete Entwürfe abweisen |
| wichtig | F03 | Beide Fütterungseditoren korrigieren Material gemeinsam mit dem Datensatz |
| wichtig | F04 | Gemerkter Abzug entspricht tatsächlichem Verbrauch; Abfüllkorrektur inzwischen ebenfalls atomar |
| wichtig | F05, F06 | Restore bei Materialmangel vollständig abweisen; wiederholte Material-IDs summieren |
| wichtig | F07 | Fehlpositionen bleiben im Marktkorb |
| wichtig | F08 | Merge und Bestandsabgleich in derselben Lese-/Schreibtransaktion |
| wichtig | F09 | Bio-Migration einschließlich Quellenlöschung und Abschlussflag atomar |
| wichtig | F10 | Verkauf und Stornos atomar und gegen doppelte Ausführung abgesichert |
| wichtig | F11, F12, F13 | Korrigierte Steuerberechnung für Entwürfe/neue Belege; historische Belege bewusst unverändert |
| wichtig | F14 | Ungültige ID stoppt gesamte Sicherung vor Schreibbeginn; ADR nachgeführt |
| wichtig | F15 | Ausdrücklich gelöschte Bilder bleiben beim Merge gelöscht |
| wichtig | F16 | Ohne druckbares Bio-Logo ausdrückliche Zusatzetikett-Bestätigung oder Abbruch; keine automatische Rechts-/Bildinhaltsprüfung |
| wichtig | F17 | Installation verweigert Wartungs-HTML; bisherige Offline-App bleibt nutzbar |
| wichtig | F18 | Erfolgreiche fachliche Buchungen setzen Sicherungsstand; F21 ergänzt dauerhafte Speicherung und Export-Rennen |
| wichtig | F20 | Verkauf aus Papierkorb mit Einnahme und Bestandsabzug gemeinsam wiederherstellen |
| wichtig | F21 | Konkreten Dateistand bestätigen, spätere Änderungen ungesichert lassen; Stand dauerhaft gespeichert |
| wichtig | F22 | Parallele Abfüllungen teilen sich aktuelle Kapazitätsprüfung; Material und Abfüllungen gemeinsam buchen |
| kosmetisch | F19 | Kein zweiter unbehandelter Fehler beim synchron gescheiterten Transaktionsauftrag |

Die ursprüngliche Forderung „34 Funde“ und die elf Reparaturen wurden zeilenweise im [historischen Prüfbericht](PRUEFBERICHT-v1.64.md) abgeglichen. Dort steht auch die Abweichung der ID-Zählung. Nicht noch einmal aus der Zahl 34 eine neue erfundene Befundliste ableiten. Diese Tabelle aktualisiert die daraus gruppierten Fehler und die drei Anschlussfunde.

## Folgekorrekturen im Einzelnen

### F20: Verkauf wiederherstellen

- Schweregrad: wichtig.
- Code: `index.html:1968` und `index.html:6722`.
- Vorher: 10 Gläser, Verkauf 2 × 5 Euro, Storno, Verkauf im Papierkorb wiederherstellen → Verkauf vorhanden, aber weiterhin 10 Gläser und keine Einnahme.
- Jetzt: gemeinsame Transaktion mit Verkauf, Kassenbuch, Abfüllung und Papierkorb → 8 Gläser und genau 10 Euro Einnahme. Auch der Einstieg über den archivierten Kassenbucheintrag führt denselben Vorgang aus.
- Fehlender Gegenbeleg, vorhandene Ziel-ID oder zu wenig Bestand führen zur vollständigen Ablehnung. Zwei gleichzeitige Klicks buchen nur einmal; ein erzwungener Abbruch lässt beide Papierkorbeinträge und den alten Bestand erhalten.
- Eigenständige Kassenbucheinträge behalten den normalen Restore-Weg.

### F21: Sicherung und zwischenzeitliche Änderungen

- Schweregrad: wichtig.
- Code: `index.html:1872`, `index.html:12816`, `index.html:12896`, `index.html:12902`, `index.html:13414`.
- Vorher: Datei aus Stand A erzeugen, während des Schreibens B speichern, Export abschließen → B fehlt in der Datei, Warnflag trotzdem gelöscht.
- Jetzt: Jede erfolgreiche Betriebsdaten-Transaktion schreibt gleichzeitig `_datenRevision` in `settings`. Die tatsächlich erzeugte Datei merkt ihren gelesenen Stand intern; nur dieser wird als `_gesicherteRevision` bestätigt. Spätere Änderungen bleiben ungesichert.
- Beide Metadaten werden nicht exportiert und aus fremden Sicherungen nicht übernommen. DB-Schema und Sicherungsformat bleiben gleich. Der Vergleich wird nach Neustart aus IndexedDB rekonstruiert, andere Fenster werden über BroadcastChannel und Fokuswechsel aktualisiert.
- `DB.put`, `bulkPut`, `del` und `clear` teilen sich nun `schreibeAlles`, warten auf Commit und aktualisieren denselben Sicherungsstand. Rückabwicklung lässt auch die Revision unverändert. Papierkorb-Restore nimmt ebenfalls teil.
- Download, Teilen, Ordnersicherung und automatischer Download reichen den konkreten Blob weiter. `markExternal()` ohne bekannten Blob kann keine Betriebsdaten als gesichert quittieren.
- Unveränderte fachliche Grenze: Reine Einstellungen und Snapshots zählen weiterhin nicht als Betriebsdatenänderung. Ein Browser-Download bestätigt die Übergabe an den Browser; er kann nicht beweisen, dass der Nutzer die Datei anschließend sicher aufbewahrt.

### F22: Abfüllen einschließlich Material und Korrektur

- Schweregrad: wichtig.
- Code: `index.html:5674`, `index.html:5697`, `index.html:5710`, `index.html:5739`; UI-Aufrufe `index.html:8610`, `index.html:8638`.
- Vorher: Charge 10 kg; zwei Formulare buchen je 15 × 500 g → zusammen 15 kg.
- Jetzt: Kapazität unter gemeinsamer Schreibsperre prüfen, alle Größen und Materialbuchungen zusammen speichern. Im Test gelingt nur eine Buchung, zusammen 7,5 kg.
- Korrekturformular prüft außerdem, ob seit dem Öffnen z. B. ein Verkauf die Abfüllung verändert hat; dann muss es erneut geöffnet werden. Das verhindert das Zurücküberschreiben eines aktuellen Verkaufsbestands.
- Materialplanung ist synchron und geteilt mit Fütterungsänderungen. Deckel/Etiketten werden als tatsächliche ganze Stücke auf die Abfüllungen verteilt; keine unabhängig gerundeten Bruchteile, die bei späterer Rückgabe mehr Material erzeugen könnten.
- Materialmangel beim neuen Abfüllen behält die bisherige Fachregel: vorhandenes Material verbrauchen, Fehlmenge anzeigen, nur tatsächlich verbrauchte Mengen merken. Fütterungsänderungen verlangen dagegen weiterhin ausreichendes Material; diese Regeln wurden nicht still gleichgesetzt.
- Abfüllungen mit fehlender historischer Charge bleiben verkleinerbar. Eine Vergrößerung verlangt die Charge. Der bestehende UI-Test für diese Altdaten besteht unverändert.

## Nachweise und Reproduktion

| Nachweis | Datei | Ergebnis |
| --- | --- | --- |
| Vollständige Suite, Chrome 153.0.8010.53, 22.09.2026 13:52:32 UTC | `folgekorrektur-tests.txt` | 471/471 |
| Ursprüngliche zusätzliche Gegenproben | `abschluss-regression-results.json` | 48/48, kein technischer Abbruch |
| Vorheriger Beleg der drei Anschlussfehler | `neufunde-results.json` | 3 rote fachliche Erwartungen, als Historie erhalten |
| Gegenproben nach Folgekorrektur | `neufunde-reparatur-results.json` | 3/3 |
| Ansichten, kleine Bildschirmbreite, Offline und Update | `update-reparatur-results.json` | Ergebnisse B1–B10 einzeln auswertbar |
| Vier historische Beispielpakete | `tests/fixtures/backup/herkunft.json` | v1.61, v1.62, v1.63, v1.64 mit unterschiedlichen SHA-256-Hashes |

Der Browserlauf B10 bestätigt mit zwei echten Fenstern: Die Warnmarkierung erscheint nach der Änderung im zweiten Fenster und bleibt nach dem Neuladen des ersten erhalten. B1 öffnet 28 Ansichten ohne Ausnahme; B3–B9 belegen Installation und Offline-Rückfall.

Die Sicherungstests vergleichen jede importierte Zeile, ID und jeden Wert, anschließend Export → Ersetzen → Export; ein zweiter Merge bleibt stabil. Ein zusätzliches binäres Anhang-Beispiel bleibt bytegleich. Das sind die vier mitgelieferten Beispieldatensätze, nicht sämtliche Sicherungen aller Nutzer.

```sh
node tools/test-run.mjs
node tools/audit-v164.mjs
node tools/audit-v164.mjs --neufunde --port=8970
node tools/audit-v164-browser.mjs
```

Audit-Läufer: Exit 0 heißt abgeschlossener Lauf, nicht automatisch fachlich grün. JSON-Zähler und Einzelergebnisse prüfen. Profile und Testdatenbanken sind isoliert; keine Tests in einem echten Nutzerprofil starten.

## Was kein neuer Fehler ist

- Keine Module, Frameworks oder Bauschritte eingeführt. Globale Funktionen und deutsche Fachbegriffe bleiben bewusst.
- Zwei Rechnungs-Rechenfunktionen sind absichtlich vorhanden: historische Regel unverändert einfrieren, korrigierte Regel für neue Belege. Eine Zusammenlegung ohne Legacy-Vergleich wäre riskant.
- Fehlender Offline-Erststart ohne vorherige Installation ist kein Datenverlustfehler: ohne Netz gibt es die App-Dateien noch nicht auf diesem Gerät.
- Nicht aufgerufene Funktionen im alten Coverage-Bericht sind nicht automatisch tote Funktionen. Keine Löschung allein auf Basis dieser Liste.
- Gleiche Bezeichnung eines Materialpostens beweist keine doppelte Buchung; Buchungs-IDs und gemerkte Abzüge sind maßgeblich.

## Was vor einer Veröffentlichung noch fehlt

1. Eigene Release-Version und neuer Service-Worker-Cache-Name; anschließend genau diesen Übergang von der tatsächlich ausgelieferten Version mit vorhandenen Daten prüfen. Die hier getestete fehlerhafte Update-Installation benutzt nur einen künstlichen neuen Cache-Namen.
2. Repräsentative zusätzliche historische Sicherungen, besonders vor v1.61, und Browser-/Gerätetests außerhalb Chrome 153. Keine Zusage „alle alten Backups auf allen Geräten geprüft“.
3. Für neue Rechnungen kein ungeprüfter Rückweg in alte App-Versionen: alte Versionen kennen `berechnungVersion: 2` nicht. Historische steuerlich falsche Belege und bereits beschädigte Bestände werden nicht automatisch umgeschrieben.
4. Keine allgemeine rechtliche Zertifizierung aus dieser technischen Reparaturrunde ableiten. Bio-Zusatzetikett setzt vollständige übrige Verpackungsangaben voraus; hochgeladene Logos werden nicht inhaltlich erkannt. Der Stand der fachlichen/rechtlichen Altprüfung bleibt im ursprünglichen Bericht.
5. Nicht behaupten, jede mögliche Mehrfachbuchung in allen Formularen sei ausgeschlossen. Nachgewiesen sind die benannten und getesteten Wege. Die neuen Transaktionshelfer sind ein Muster für zukünftige weitere Fachvorgänge, keine automatische Absicherung ihrer Aufrufer außerhalb einer Transaktion.

## Für die Übernahme

Der Zweig ist lokal prüfbar und commitfähig vorbereitet. `main` und Produktivdaten unverändert lassen, bis die Release-Prüfung erfolgt ist. Kein automatischer Push/Deploy wurde ausgeführt. Bei einer späteren Übernahme die Codeänderungen zusammen mit ihren Tests und der API-/ADR-Dokumentation übernehmen; weder nur neue Helfer noch nur die geänderten Formularaufrufe kopieren.

Für eine weitere konzentrierte Prüfung reichen zunächst diese Datei, der Diff ab `0052df0`, `docs/API.md` und die genannten Test-/JSON-Dateien. Historische Berichte nur für die jeweilige Befund-ID nachschlagen. Dadurch bleiben die Nachweise vollständig, ohne den gesamten Gesprächsverlauf erneut lesen zu müssen.
