# Steuerformular und Geschäftliches bei Apple und Google (Stand 01.11.2026)

Recherche mit Gegenprüfung, keine Steuerberatung. **Hier stehen bewusst keine echten Nummern.**

## W-8BEN (US-Steuerformular)

- **Apple verlangt es von allen Entwicklern,** auch ohne Verkauf in den USA (Hilfeseite „All developers must complete a US tax form“). Der Vertrag selbst nennt die Pflicht nur bei Vertrieb in den USA, entscheidend ist also die Hilfeseite.
- **Google:** Vertrag Abschnitt 3.6 verlangt ein gültiges W-8 oder W-9.
- **Zeile 1:** bürgerlicher Name des Inhabers. Einzelunternehmer gelten als Einzelperson, also W-8BEN und nicht W-8BEN-E (Einordnung als Einzelperson ist Schlussfolgerung, von der IRS gestützt).
- **Zeile 5 (US-Steuernummer):** leer.
- **Zeile 6a (Foreign TIN):** die persönliche steuerliche Identifikationsnummer (IdNr, 11 Stellen). OECD-Papier zu Deutschland und Apples Tabelle (Einzelperson 11 Stellen) stützen das. **Nicht** die Steuernummer, nicht USt-IdNr., nicht Wirtschafts-IdNr. Eine Anleitung von Apple oder Google speziell für deutsche Einzelunternehmer gibt es nicht. Die neue Steuernummer und der ausstehende Gewerbe-Bescheid werden dafür nicht gebraucht.
- **Zeile 9:** Germany.
- **Zeile 9:** Haken setzen (ansässig in Deutschland im Sinne des Abkommens).
- **Zeile 10 (Stand 01.11.2026, entschieden):** Artikel `7(1)`, Satz `0`, Auswahl „Income from the sale of applications“ (Apple bietet genau das im Formular an). Begründung im Feld: `Business profits of a German resident, not attributable to a permanent establishment in the United States.` Belege: Abkommen USA-Deutschland Art. 7 Abs. 1 (Gewinne nur im Wohnsitzstaat, außer bei Betriebsstätte in den USA), IRS-Anleitung zu Zeile 10 (bei solchen Gewinnen auszufüllen), Apple Finance im Entwicklerforum („sales/commission“, nicht „royalty“). Apples altes Merkblatt sagt, Zeile 10 sei normalerweise nicht nötig, das gilt aber für den Normalfall, nicht für Art. 7. Keine Steuerberatung, Frage an den Steuerberater bleibt.
- **Zweites Formular:** „U.S. Certificate of Foreign Status of Beneficial Owner“ (Apple-Form, intern 1042). Erklärt: wirtschaftlich Berechtigter, keine Angestellten und keine Geräte oder Anlagen in den USA. Feld „Title“: `Owner`, Haken, absenden.
- **Warten:** Beide Formulare zeigen den Namen gesperrt als „Kohler“ und sind nach dem Absenden in App Store Connect nicht mehr änderbar. Deshalb erst absenden, wenn Apple den Namen im Fall 103015763944 korrigiert hat.
- **Unterschrift:** nur der Inhaber selbst, „under penalties of perjury“. Datum im Format MM-DD-YYYY. Gilt bis Ende des dritten Folgejahres, also 31.12.2029.
- **Absenden:** Bei Apple danach oft nicht mehr änderbar. Zeigt die Maske W-9 oder W-8BEN-E statt W-8BEN, nicht absenden, sondern Apple fragen.

## USt-IdNr. und Wirtschafts-IdNr.

- **Für die Veröffentlichung nach den gelesenen Quellen nicht nötig.** Apple nennt die Nummer nur bei alternativen Zahlungswegen, externen Käufen und alternativem Vertrieb. Endgültig zeigt das erst die Maske im Konto. Bei Google gibt es eine unklare Stelle zum Format der Nummer im Zahlungsprofil, nur die Anmeldemaske klärt das.
- **USt-IdNr.:** gibt es nur auf Antrag beim BZSt. Ob sie im Fragebogen vom 19.10. angekreuzt wurde, ist nicht vermerkt (Mein ELSTER → Meine Formulare).
- **Wirtschafts-IdNr.:** kommt automatisch, für Kleinunternehmer seit November 2024, ohne USt-IdNr. per ELSTER-Postfach. Datum offen.
- **§ 13b UStG hängt nicht an der USt-IdNr.** Die Notiz „die Nummer löst § 13b aus“ ist zu einfach. Trotzdem: Die Nummer nicht ohne Rücksprache bei Anbietern eintragen, sonst rechnen sie meist ohne Steuer ab und die Steuer ist selbst anzumelden.
- **Provision der Stores:** Herleitung aus dem Kommissionsmodell (§ 3 Abs. 11, 11a UStG, EuGH C-101/24, BFH V R 46/25): keine eigene eingekaufte Leistung, also vermutlich keine § 13b-Steuer. Amtlich nicht bestätigt, Frage an den Steuerberater.
- **Impressum:** Nummer erst eintragen, wenn sie existiert (§ 5 Abs. 1 Nr. 6 DDG). Die Steuernummer gehört nicht hinein.

## Offene Punkte

- **Google und die Schweiz:** Laut Google ist bei Käufen aus der Schweiz der Entwickler selbst für die Steuer zuständig. Vor dem Start in der Schweiz über Google mit dem Steuerberater klären. Apple läuft in DE, AT und CH über Apple Distribution International als Kommissionär.
- **Google, privat oder Organisation:** „Sole proprietor“ kommt nicht vor. Als Firmendokument nennt Google für Deutschland Handelsregisterauszug, Trade License oder USt-Registrierung, also vermutlich die Gewerbeanzeige. Offen.
- **Grenze § 19 UStG:** zählt nur steuerbare Umsätze; Frage an den Steuerberater, wenn der Umsatz wächst.

## Reihenfolge bei Apple

1. Kontoinhaber nimmt die neue Developer-Program-Vereinbarung im Account an.
2. Händlerstatus: Status, Kontaktdaten, Code an E-Mail und Telefon, Nachweis (aktuelles Dokument mit Name und Adresse, vermutlich Gewerbeanzeige; ob sie reicht, zeigt die Prüfung), Selbstbestätigung.
3. Vertrag „Paid Apps“ unterschreiben (nicht rückgängig zu machen, nur Kontoinhaber).
4. Steuerformular, dann Bankkonto (Konto auf den eigenen Namen, genau so geschrieben; Privatkonto nicht verboten).
5. Status „Active“, erst dann Sandbox-Kauf.

Stand 01.11.2026:

- Erledigt: Developer-Program-Vereinbarung angenommen, App-Datenschutz veröffentlicht (Genauer Standort, nicht verknüpft, nur App-Funktion), Vertrag für kostenlose Apps aktiv (bis 20.10.2027).
- Händlerstatus: eingereicht, Status „In Prüfung“.
- Inhaltsrechte: „Ja, Inhalte Dritter mit den nötigen Rechten“ (Julian 01.11.2026). Apples Prüfliste meldet damit nur noch den fehlenden Build, aber erst nach aktivem Vertrag einreichen (ohne ihn keine Käufe in der Prüfung).
- Ziel laut Julian: Einreichen Montag oder Dienstag (02./03.11.2026), hängt an der Namenskorrektur.
- Vertrag „Paid Apps“: zugestimmt, gültig bis 20.10.2027, Status „Benutzerinfos ausstehend“ (es fehlen Steuerformular und Bankkonto).
- Offen: Steuerfragebogen. Frage 1 „in den USA steuerlich ansässig?“ = Nein. Nach „Weiter“ erscheint in der von Claude gesteuerten Ansicht nichts, Julian öffnet ihn selbst.
- **Reihenfolge (Julian 02.11.2026):** erst die Namensänderung, danach Steuerformular und Bankkonto. Der Antrag für das Small Business Program ist schon am 02.11.2026 abgeschickt, Antwort per E-Mail offen.
- Falsch angezeigt: Name „Kohler“ und Adresse „Strae“. Korrekturbitte am 01.11.2026 an den Apple Developer Support geschickt, Fallnummer 103015763944, Antwort kommt per E-Mail.

## Preis zum 01.01.2027

- **Apple:** im Voraus planbar unter In-App-Käufe → Vollversion → Price Schedule → Custom Price Change. Apples Liste hat für die Schweiz keine 14,99 und keine 24,99 CHF, nur 14,95 und 24,95 CHF. Julian wollte denselben Betrag wie in Euro, deshalb der nächste Preis: 14,95 CHF (bei Apple am 01.11.2026 eingestellt), ab 01.01.2027 24,95 CHF. **Bei Apple am 01.11.2026 für den 01.01.2027 eingeplant:** Deutschland und Österreich 24,99 €, Schweiz 24,95 CHF.
- **Google:** keine Planung für den normalen Preis gefunden, also am 01.01.2027 von Hand ändern, einige Stunden Vorlauf einplanen.

Der Apple-Name „30-Tage-Testphase“: Richtlinie 3.1.1 nennt das Muster „XX-day Trial“, Referenzname ist schon so. Vor dem Einreichen prüfen.
