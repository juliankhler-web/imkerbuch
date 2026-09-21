# Externe Prüfung September 2026 – Funde, Nachprüfung, Stand

Zwei Durchgänge einer externen statischen Codeprüfung (ChatGPT Codex) plus meine
Nachprüfung jedes einzelnen Fundes am Quelltext.

| | |
| --- | --- |
| Geprüfte Fassung | v1.61 (beide Durchgänge) |
| Aktueller Stand | **v1.62**, 393/393 Tests grün |
| Funde gesamt | **28** – 5 kritisch, 23 wichtig |
| Davon behoben | **6** (S1–S6, in v1.62) |
| Davon offen | **22** (Q1–Q12, R1–R5, J1–J5) |
| Fehlalarme | **0** |

**Alle 28 Funde habe ich am Code nachgeprüft. Keiner war ein Fehlalarm.** Die
Zeilennummern in diesem Dokument beziehen sich auf **v1.62** – der Prüfbericht
nannte die Zeilen von v1.61, die sich durch die Reparaturen verschoben haben.

## Zur Einordnung

Der Prüfer hat den Code **gelesen, nicht ausgeführt** (keine Browser-Umgebung).
Die Reproduktionen sind aus dem Code hergeleitet. Meine Nachprüfung hat jeweils
die benannte Codestelle bestätigt; ich habe **nicht** jeden Ablauf im Browser
nachgestellt. Wo ich eine Einschränkung sehe, steht sie beim Fund.

---

## Teil 1: Behoben in v1.62

Alles Sicherheitsfunde mit derselben Wurzel: **Die App glaubte einer
importierten Sicherungsdatei.** Begründung und Gegenmaßnahmen stehen in
[adr/0004](adr/0004-eine-fremde-sicherung-ist-nicht-vertrauenswuerdig.md).

| ID | Fund | Behoben durch |
| --- | --- | --- |
| S1 | Codeausführung schon in der Import-**Vorschau** – es genügte, die Datei auszuwählen | Nur bekannte Speicher werden namentlich genannt, fremde gezählt und übersprungen |
| S2 | Importierte **IDs** brachen aus `data-id="…"` aus | ID-Muster beim Import + alle 115 `data-*`-Einsetzungen entschärft |
| S3 | **Zahlenfelder** (`jahrgang`, `bestand`, `groesse`) wurden als HTML ausgegeben | `U.zahl()`, `U.fmtBytes()` gehärtet |
| S4 | **Einstellungen** (`logo`, `rechnungQr`, `bioLogos`) landeten direkt in `src` | `U.bildQuelle()` – nur `data:image/…` und `https` |
| S5 | **CSV-Export** machte aus Text eine Formel | `Xlsx.zelleSicher()` – führendes Hochkomma bei `= + - @` |
| S6 | **XLSX-Export** übernahm fremde Zellobjekte samt Formelfeld | Objekte werden zu Text |

Fünf Tests stellen diese Angriffe nach und prüfen zugleich, dass rechtmäßige
Daten unverändert durchkommen.

---

## Teil 2: Offen – Buchungen und Datenverlust

Nach meiner Einschätzung die dringendste Gruppe: Hier gehen **Daten oder
Bestände still falsch**, ohne dass jemand etwas merkt.

| ID | Zeile v1.62 | Fund | Meine Nachprüfung |
| --- | ---: | --- | --- |
| **Q6** | 12249 | **Ersetzender Import löscht Anhänge, bevor die Datei vollständig geprüft ist.** Der interne Snapshot enthält keine Anhang-Dateien und kann sie nicht zurückbringen. | **Bestätigt.** `DB.clear(store)` läuft je Speicher vor `bulkPut`; `snapshotInternal` ruft `buildData(false)` – ohne Blobs. Einziger Fund dieser Gruppe mit **endgültigem** Datenverlust. |
| **Q1** | 4276 | Fütterung löschen gibt den Zucker **nur im zentralen Dialog** zurück, nicht im Volk-Dialog. | **Bestätigt.** Volk-Weg nutzt `papierkorbDelete`, der zentrale zusätzlich `verbrauchZurueckbuchen`. |
| **Q2** | 1833 | **Papierkorb-Wiederherstellung** bucht den Bestand nicht gegen – erneutes Löschen gibt ein zweites Mal zurück. | **Bestätigt.** `trashRestore` schreibt nur den Datensatz zurück. |
| **Q3** | 8936 | Rechnung prüft den Bestand **je Position statt summiert** – zwei Positionen à 6 aus 10 Gläsern gehen durch. | **Bestätigt.** Schleife prüft jede Position einzeln. |
| **Q4** | 8931 | Ein **zweites Fenster** kann denselben Entwurf erneut festschreiben – doppelte Kassenbuchung, überschriebene Nummer. | **Bestätigt.** Die Sperre prüft das übergebene Objekt, nicht den aktuellen Datenbankstand. |
| **R1** | 11189 | Die **Abzugskette ignoriert die Gebindegröße** – beim Abfüllen von 500-g-Gläsern können 250-g-Gläser verbraucht werden. | **Bestätigt.** Die Kette vergleicht Typ, Einheit und Kategorie, nicht `gebindeG`. |
| **R2** | 8257 | **Abfüllkorrektur** merkt sich einen Verbrauch, der mangels Bestand nie gebucht wurde – beim Löschen entstehen Gläser aus dem Nichts. | **Bestätigt.** Der Rückgabewert des Abzugshelfers wird ignoriert. |
| **R3** | 8231 | **Abfüllung bearbeiten** prüft die Chargenmenge nicht – 40 × 500 g aus einer 10-kg-Charge sind möglich. | **Bestätigt.** Die Prüfung existiert nur im Anlegeweg. |
| **Q10** | 12530 | **Zusammenführen** erhält beide Verkäufe, übernimmt aber nur einen Bestandsstand – Verkäufe und Bestand laufen auseinander. | **Bestätigt.** Folgt aus „je Datensatz gewinnt der jüngere". Eine echte Lösung bräuchte Buchungen statt Zustände; erkennbar und meldbar ist es aber. |
| **Q5** | 15043 | Eine **abgebrochene Datenwanderung** kann Verkäufen die Zuordnung nehmen (`map` nur im Arbeitsspeicher). | **Bestätigt.** Betrifft nur Installationen, die diese alte Wanderung noch vor sich haben. |
| **Q8** | 8382 | **Marktverkauf**: Scheitert eine Position, wird trotzdem der ganze Warenkorb geleert. | **Bestätigt.** |
| **Q9** | 1944 | **Änderungsschutz** geht verloren, sobald man die Rückfrage einmal abbricht. | **Bestätigt** – und subtil: Nicht der Abbruch löscht die Marke, sondern das Schließen des Bestätigungsfensters selbst (gemeinsames `FormGuard.dirty`). |
| **Q7** | 12577 | **Fehlgeschlagene Ordner-Sicherung** meldet Erfolg und verschiebt den nächsten Versuch um das volle Intervall. | **Bestätigt.** `letzteExterneSicherung` bleibt korrekt stehen – die Erinnerung greift also; falsch sind Meldung und Wiederholungstermin. |

---

## Teil 3: Offen – falsche Zahlen in Auswertung und Export

| ID | Zeile v1.62 | Fund | Meine Nachprüfung |
| --- | ---: | --- | --- |
| **R4** | 10011 | **Erlösprognose ignoriert den Rechnungsrabatt** – 50 % Rabatt ergibt den doppelten €/kg. | **Bestätigt.** `menge × einzelpreis` ohne `rabattWert`. |
| **Q12** | 12856 | **Excel-Export** rechnet Varroa immer als „Milben/Tag", auch bei der Auswaschmethode. | **Bestätigt.** Der Export umgeht `varroaMetrik()`, das die Methode unterscheidet. |
| **Q11** | 12944 | **Bildzwischenspeicher** kann zwei Logos verwechseln – der Schlüssel nutzt nur Länge und die ersten 64 Zeichen. | **Bestätigt.** Bei SVG-Logos ist der Anfang oft identisch. |
| **R5** | 11961 | **Mein Hilfetext zur Futterstatistik widerspricht der Rechnung.** | **Bestätigt – und es ist der Text, nicht die Rechnung.** Bei „3:2" gilt die eingetragene Menge bewusst als Zuckermenge; Futterteig rechnet mit 0,92. Mein Text behauptet 7,5 kg bzw. 10 kg. |

---

## Teil 4: Offen – Pflichtangaben und Recht

Hier ist Vorsicht geboten: Das sind Aussagen über Recht, nicht über Code.
Die **Codestellen** habe ich bestätigt; ob die rechtliche Folgerung im Einzelfall
trägt, gehört vor eine Änderung geklärt – bei J2 ausdrücklich mit dem
Steuerberater.

| ID | Zeile v1.62 | Fund | Meine Nachprüfung |
| --- | ---: | --- | --- |
| **J1** | 13500 | **Rechnung ohne Steuernummer/USt-IdNr., ohne Lieferzeitpunkt, ohne Nettoentgelt je Steuersatz** (§ 14 Abs. 4 UStG). | **Bestätigt.** Ein Feld für die Steuernummer existiert überhaupt nicht; ausgewiesen wird „im Gesamtbetrag enthaltene USt" statt Netto + Steuer. Betrifft regelbesteuerte Nutzer. |
| **J5** | 13388 | **Bio-Etikett** ohne EU-Logo und ohne Herkunftsangabe; hochgeladene Logos werden auf 8 × 8 mm quadratisch verzerrt. | **Bestätigt.** Gezeichnet wird nur, was hochgeladen wurde; das EU-Logo schreibt Anhang V der Öko-Verordnung im Seitenverhältnis 1 : 1,5 vor. |
| **J3** | 6171 | **Etikett übernimmt den Sortennamen als Bezeichnung** – „Raps" statt „Rapshonig". | **Bestätigt.** Vorbelegt wird die Etikett-Notiz, sonst die Sorte, sonst „Honig". |
| **J4** | 13067 | **Bestandsbuch-PDF** macht aus „0 Tage Wartezeit" denselben Strich wie aus einer fehlenden Angabe. | **Bestätigt.** Wahrheitswertprüfung statt Prüfung auf „nicht gesetzt". In der Datenbank bleibt die Null erhalten. |
| **J2** | 8707 | **Pfand pauschal ohne Umsatzsteuer.** Bei mitberechneter Warenumschließung gehört es nach UStAE 10.1 Abs. 8 im Regelfall zum Entgelt. | **Codestelle bestätigt** – die App behandelt jeden Pfandfall gleich. **Die steuerliche Bewertung gehört vor jeder Änderung zum Steuerberater**; es gibt abweichende Abrechnungsverfahren. |

---

## Was der Prüfer ausdrücklich als sauber bezeichnet hat

Toasts, Dialogüberschriften und Formularbeschriftungen entschärfen Text. Der
CSV/Excel-**Import** entschärft Dateinamen, Spaltenköpfe und Vorschauwerte und
erzeugt neue IDs. QR-Inhalte gehen als Text an den Erzeuger. Download-Namen
brechen nicht aus. Der PDF-Import entschärft den erkannten Text. Nachgerechnet
und stimmig: Umsatzsteuer in allen drei Modellen, Skonto, Sirup-Dichte,
Futterumrechnung, Selbstkosten, die Honigmengen-Kette im normalen Ablauf und die
Abzugskette bei **gleichartigen** Posten.

## Grenzen dieser Prüfung

Kein Browserlauf, keine Prüfung der minifizierten Bibliotheken, keine Aussage
über Fehlerfreiheit der rund 15.000 Zeilen. Tierseuchenkassen- und
Veterinäramtsmeldungen wurden im zweiten Durchgang nicht erneut betrachtet.
Die Abdeckungslandkarte des Prüfers nennt die größten ungetesteten Funktionen
als **Prüfpriorität**, nicht als zusätzliche Fehler.

## Reihenfolge, die ich vorschlage

1. **Q6** – als einziger Fund endgültiger Datenverlust.
2. **Q1, Q2, R1, R2, R3** – Bestände laufen still falsch.
3. **Q3, Q4** – doppelte Buchungen und Rechnungsnummern.
4. **R4, Q12, Q11, R5** – falsche Zahlen in Auswertung und Export.
5. **J1, J3, J4, J5** – Pflichtangaben; **J2** erst nach Rücksprache.
6. **Q5, Q7, Q8, Q9, Q10** – seltener oder gut erkennbar.
