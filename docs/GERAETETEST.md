# ImkerBuch – Test auf dem echten iPhone

Stand: 23.10.2026, Version 2.93 (Teile A und E schon im iPhone-Simulator vorgeprüft, Funde behoben; A6b neu nach deinem Fund; neu: B9–B12 Trachtkalender und PDF-Sonderzeichen, D5 Sicherung mit Erinnerung, D6 Zwischenstände, E0 Überschrift, B7a–B7d Stammbaum/Ahnentafel, F4d–F4i Meldungen ans Amt inkl. Österreich/Schweiz, G6 Großbestand). Dauer: etwa 60–90 Minuten (gern auf zwei Tage verteilt).

**So meldest du Fehler:** Bildschirmfoto machen (Seitentaste + Lauter) und mir schicken, dazu ein Satz: *was du getan hast* und *was passiert ist*. Die Nummer des Schritts hilft mir (z. B. „B4 geht nicht“).

Hinter jedem Schritt steht, **was du sehen solltest**. Weicht etwas ab, ist das ein Fund.

---

## Vorbereitung (einmalig, 10 Minuten)

1. iPhone per Kabel an den Mac, entsperren, „Diesem Computer vertrauen“ → Vertrauen.
2. In Xcode oben in der Mitte dein iPhone wählen, dann **▶** drücken.
   - Fehlermeldung „Signing / Team“: links „App“ → Reiter „Signing & Capabilities“ → bei **Team** deine Apple-ID wählen.
   - „Entwicklermodus“: Einstellungen → Datenschutz & Sicherheit → Entwicklermodus einschalten, iPhone neu starten.
   - „Nicht vertrauenswürdiger Entwickler“: Einstellungen → Allgemein → VPN & Geräteverwaltung → deine Apple-ID → Vertrauen.
3. Falls ImkerBuch schon auf dem iPhone ist: vorher **löschen** (App-Symbol lange drücken → App entfernen). So testest du den echten ersten Start.

> Käufe in diesem Test sind **Testkäufe über Xcode** – es wird kein Geld abgebucht.

---

## A · Erster Start (wie ein neuer Kunde)

- [ ] **A1** App öffnen. → Startbild, dann „Willkommen bei ImkerBuch“.
- [ ] **A2** Namen und Imkerei eintragen **oder** „Überspringen“ tippen. → Beides funktioniert.
- [ ] **A3** Das Kauf-Fenster erscheint. → Preise werden angezeigt, Knopf „30 Tage kostenlos starten“.
- [ ] **A3b** Die Meldung „Los geht’s!“ steht **oben**, nicht auf den Knöpfen.
- [ ] **A4** „30 Tage kostenlos starten“ tippen. → Apple-Kauffenster (mit Hinweis „Xcode“), bestätigen. Danach ist das Fenster weg.
- [ ] **A5** Imme fragt: „Bist du neu hier?“ → „Ja, zeig es mir“.
- [ ] **A6** Kapitel 1 „Kurz umschauen“: 5 Hinweise (Startseite, Regler-Knopf oben, Schnellzugriffe unten, „Mehr“, Imme). → Sprechblase **ohne gelben Rahmen**, **über die ganze Breite**, im hellen Modus **dunkel**, im dunklen Modus **hell** (hebt sich klar von den Kacheln ab), nichts davon verschwindet unter Uhrzeit oder Kamera-Aussparung (das ✕ oben rechts ist zu sehen), „Weiter“ geht jeweils zum nächsten Hinweis. Der Honig-Rahmen um das Ziel ist **rundum vollständig** (auch um die Volk-Zeile in „Erste Durchsicht“).
- [ ] **A6b** Einführung noch einmal starten (Imme antippen → „Einführung starten“) und diesmal bei jedem Hinweis **das hervorgehobene Ziel selbst antippen** statt „Weiter“ (Kachel, Regler-Knopf, untere Leiste, „Mehr“). → Imme geht jedes Mal zum nächsten Hinweis, die App bleibt auf der Startseite, es öffnet sich kein Fenster. **Nie** eine Meldung mit „#“ wie „#dash-cfg“. Nach der Einführung öffnen Kachel und Regler-Knopf wieder ganz normal.
- [ ] **A7** Imme führt weiter: Stand anlegen, Volk anlegen, erste Durchsicht. Folge ihr einfach. → Jeder Schritt zeigt auf den richtigen Knopf.

## B · Grundfunktionen

- [ ] **B1 Standort:** Bienenstände → „+ Neuer Stand“ → „Aktuellen Standort übernehmen“. → Es kommt **genau eine** Frage nach dem Standort, danach stehen Zahlen in Breiten-/Längengrad.
- [ ] **B2 Volk:** Völker → „+ Neues Volk“ → speichern. → Volk erscheint in der Liste.
- [ ] **B2b Suche:** Völker → oben in die Suche mehrere Buchstaben zügig tippen. → Die Tastatur bleibt offen, nur die Liste darunter ändert sich. Gleich bei Abnehmer & Lieferanten und Verbrauchsmaterial.
- [ ] **B2c Funktion:** Völker → unter der Suche einen Knopf wie „Ableger“ antippen (bei vielen Funktionen seitlich wischen). → Nur diese Völker, die Zahl im Knopf stimmt; zusätzlich etwas in die Suche tippen → beides gilt zusammen. „Alle“ zeigt wieder alle.
- [ ] **B3 Durchsicht:** Volk öffnen → „+ Durchsicht“ → ausfüllen, speichern. → Eintrag steht in der Stockkarte.
- [ ] **B4 Durchsicht am Stand:** Volk → „Durchsicht am Stand“. → Eine Frage pro Bildschirm, große Knöpfe; probier es mal mit **Handschuhen**. Am Ende „Speichern“.
- [ ] **B5 Sprachnotiz:** In der Durchsicht am Stand „Sprachnotiz“ (oder Volk → „Notizen & Anhänge“ → „Aufnehmen“). → **Eine** Frage nach dem Mikrofon. Aufnahme läuft (roter Punkt), Stoppen, abspielen.
- [ ] **B6 Foto:** Volk → „Notizen & Anhänge“ → „+ Foto“. → **Eine** Frage nach der Kamera, Kamera öffnet sich, Foto erscheint als Bild.
- [ ] **A0 Kein Tester-Code in der App (neu 2.93):** Die App aus Xcode/Android Studio bzw. aus dem Store startet ohne Frage nach einem Tester-Code – die Sperre gilt nur für die Web-Version im Browser.
- [ ] **B7 Königin:** Königinnen → „+“ → Generation z. B. „F1“ eintragen. → Wird in der Königin angezeigt.
- [ ] **B7a Königin-Formular (neu):** Eine Königin bearbeiten. → Die Felder heißen „Herkunft / Linie“, „Woher stammt die Königin?“ (Vorschläge: Eigene Nachzucht, Zukauf Züchter, Schwarm, Nachschaffung – **kein** „Belegstelle“ mehr) und „Anpaarung“. Bei „Anpaarung: Belegstelle“ gibt es darunter die Belegstelle **und** das Feld „Vatervolk (4a)“.
- [ ] **B7b Ahnentafel (Beispieldaten):** Königinnen → die jüngste Carnica-Königin öffnen → Reiter „Stammbaum“. → Oben gelber Hinweis „Gemeinsame Vorfahren … auf Mutter- und Vaterseite“. Knopf „Ahnentafel (beide Seiten)“ → Tafel mit Spalten Königin · Eltern · Großeltern, die gemeinsame Ahnin ist farbig; Regler „Generationen“ ändert die Spalten; am Handy seitlich wischbar. „Mutterlinie“ zeigt wieder die bisherige Liste.
- [ ] **B7c Pedigree-Vorschlag:** Eine Königin mit Mutter und Anpaarung bearbeiten → unten „Als Text übernehmen“ → speichern. → Übersicht zeigt die Zeile in der Form „… = .26 - … ins …“; der Stammbaum zeigt danach dieselben Vorfahren wie vorher (nichts geht verloren).
- [ ] **B7d Stockkarte (PDF):** Bei der Königin aus B7b „Stockkarte (PDF)“. → Unten „Abstammung beider Seiten (bis 3 Generationen)“ mit Tabelle; oben „Gemeinsame Vorfahren“.
- [ ] **B8 Varroa:** Volk → Reiter „Varroa“ → Zählung eintragen. → Ampel und Kurve erscheinen.
- [ ] **B9 Trachtkalender:** Menü → Trachten → „+ Neue Tracht“ → Pflanze „Raps“ wählen, deinen Stand anhaken. → Beginn und Ende stehen von selbst drin, darunter: „Bei „Dein Stand“ beginnt Raps im Schnitt um den …“ mit der Zahl der Beobachtungsstellen des Wetterdienstes. „Jedes Jahr wiederkehrend“ ist an. Bei „Erinnern“ „7 Tage vor Blühbeginn“ wählen, speichern. → Meldung „Erinnerung am …“, oben ein Jahreskalender mit Balken. Dieselbe Pflanze an einem zweiten Stand eintragen → im Kalender bleibt **eine** Zeile „Raps 2“; antippen klappt beide Stände auf.
- [ ] **B10 Tracht auf Startseite und am Stand:** Startseite → Kachel „Tracht“ (erscheint, sobald eine Tracht eingetragen ist): zeigt, was blüht bzw. „Nächste Tracht …“. Stand öffnen → Abschnitt „Was hier blüht“ mit derselben Tracht.
- [ ] **B12 Sonderzeichen im PDF:** Im Kassenbuch eine Ausgabe mit der Beschreibung „Gläser für Jörg ≤ 500 g → Markt „Süd“ ✓“ anlegen → Unterlagen → Kassenbuch-PDF. → Im PDF steht die Zeile lesbar („<=“, „->“, „ok“), Umlaute, € und „“ richtig, kein Zeichensalat; „19 %“ in der Spalte USt steht in **einer** Zeile. Der Dateiname beim Sichern hat keine Umlaute (z. B. „kassenbuch-2026.pdf“).
- [ ] **B11 Ernte mit Tracht:** Ernte → „+ Ernte“ → Volk am Raps-Stand und ein Datum kurz nach der Rapsblüte wählen. → Feld „Tracht“ steht von selbst auf „Raps“, die Honigsorte auch. Statistiken → Honig → Knopf „Tracht“ → Ertrag je Tracht.

## C · Betrieb (das „Geld“-Paket)

- [ ] **C1 Behandlung + Bestandsbuch:** Behandlungen → „+ Behandlung“ → speichern → „Bestandsbuch (PDF)“. → **Teilen-Menü** öffnet sich, „In Dateien sichern“ funktioniert, PDF sieht ordentlich aus (kein „Volk Volk“).
- [ ] **C2 Fütterung in Litern:** Fütterung → „+ Fütterung“ → Futterart „Futtersirup (z. B. Apiinvert)“. → Feld heißt **„Menge je Volk (Liter)“**. 10 eintragen → darunter „10 L = 13,6 kg Sirup · 10 kg Zucker kommen beim Volk an“.
- [ ] **C3 Fütterung je Volk:** Fütterung → „Je Volk“. → Liste mit Zucker/Liter je Volk; beim Volk selbst stehen oben die Summen.
- [ ] **C4 Ernte direkt abfüllen:** Ernte und Abfüllung → Ernte erfassen → Reiter „Abfüllung“ → „+“ → bei „Woraus abfüllen?“ die **Ernte** wählen → Anzahl Gläser → Speichern. → Frage „Keine Charge angelegt – direkt abfüllen?“ → Ja → Gläser stehen im Bestand.
- [ ] **C5 Verkauf ohne Bestand + Rabatt:** Reiter „Verkauf“ → „+“ → „Anderer Honig – noch nicht im Bestand“, 30 Gläser à 6 €, Rabatt 10 %. → Unten live „Gesamt: 162,00 €“; beim Speichern Frage „Kein Bestand – trotzdem buchen?“.
- [ ] **C6 Auswertung:** Kassenbuch → „Auswertung“ → Jahr wechseln (Seite springt **nicht** nach oben) → Kategorie „Honigverkauf“ antippen → welcher Honig an wen; auf einen Abnehmer tippen → Abnehmer öffnet sich. Ernteprognose ganz unten aufklappen.
- [ ] **C7 Rechnung:** Rechnungen → „Neue Rechnung“ → Kunde, Position → „PDF“. → Teilen-Menü mit sauberer Rechnung; unten steht nur „Seite 1 von 1“, kein „Erstellt mit ImkerBuch“.
- [ ] **C8 Material:** Weitere Produkte oder Verbrauchsmaterial → Verkauf/Abgang ohne vorhandene Position. → Frage „Jetzt anlegen?“ statt Fehlermeldung.

## D · Erinnerungen

- [ ] **D0** Eine Aufgabe für **heute in 3 Minuten** mit Uhrzeit anlegen, App schließen. → Pünktlich kommt „Jetzt: …“ (vorher kam bei „1 Stunde vorher“ gar nichts, wenn die Stunde schon vorbei war). Android: kann bis zu einige Minuten später kommen.

- [ ] **D1** Aufgaben → „+ Neue Aufgabe“, fällig **heute**, Uhrzeit in **3 Minuten**. → Beim ersten Mal Frage „An Aufgaben erinnern?“ → Ja → Apple fragt nach Mitteilungen → Erlauben.
- [ ] **D2** App schließen (nach oben wischen), iPhone sperren, 3 Minuten warten. → **Mitteilung** von ImkerBuch erscheint.

- [ ] **D6 Zwischenstände:** Einen Eintrag ändern (z. B. eine Notiz am Volk), 1 Minute warten oder die App kurz verlassen. Einstellungen → Sicherung & Datensicherheit → „Zwischenstände“. → Oben steht „Heute, …“ mit „Nach deinen Änderungen“, ältere unter „Ältere Zwischenstände (…)“ zum Aufklappen. Ohne Änderung entsteht keiner.
- [ ] **D5 Sicherung speichern + Erinnerung:** Einstellungen → „Sicherung speichern“ → „In Dateien sichern“ → iCloud Drive → Sichern. → Danach fragt die App einmal „An die nächste Sicherung erinnern?“ → „Ja, erinnern“. In den Einstellungen steht beim Schalter „Per Mitteilung an die Sicherung erinnern“: „Nächste: …, 19 Uhr“ (14 Tage später). Auf einem zweiten Gerät oder nach Neuinstallation: „Backup importieren“ → Datei aus iCloud Drive wählen → „Alles übernehmen“ → alles ist wieder da, danach „Käufe wiederherstellen“.

## E · Einrichten nach eigenem Geschmack

- [ ] **E0 Überschrift:** Ein paar Bereiche öffnen (Völker, Trachten, Abnehmer & Lieferanten). → Oben steht „ImkerBuch › Völker“ (Bereich fett), darunter **keine** zweite große Überschrift, sondern gleich die Zahl und die Knöpfe. Bei langen Namen bleibt nur das Logo vor dem Namen, der Name ist ganz lesbar. Auf der Startseite steht oben nur „ImkerBuch“.
- [ ] **E1** Startseite → Regler-Knopf oben rechts → Kacheln aus-/einschalten, Reihenfolge ziehen. → Startseite ändert sich sofort.
- [ ] **E1b** Auf der Startseite eine Kachel ca. ½ Sekunde gedrückt halten. → Sie hebt sich mit Honig-Rand an, das iPhone vibriert kurz. Nach unten ziehen (bis an den unteren Rand – die Seite rollt mit) und loslassen. → Gestrichelte Lücke zeigte den Platz, danach „Reihenfolge gespeichert“, es öffnet sich **kein** Bereich. Kurz antippen öffnet den Bereich weiter wie gewohnt; normales Wischen blättert nur.
- [ ] **E1c** Doppelt auf die Startseite tippen und mit zwei Fingern auseinanderziehen. → Nichts wird vergrößert.
- [ ] **E2** Unten „Mehr“ → Kachel ca. ½ Sekunde gedrückt halten und nach unten in die Leiste ziehen. → Sie ersetzt dort einen Eintrag.

## F · Hilfe, Recht, Sicherung

- [ ] **F1** Menü → „Hilfe & Kontakt“ → „Fehler melden“. → **Mail-App** öffnet sich mit fertiger Nachricht an juliankhler+imkerbuch@googlemail.com (nicht absenden).
- [ ] **F2** Einstellungen → Rechtliches → Datenschutz / Impressum / Support öffnen. → Öffnet sich **in der App**, Schließen-Knopf führt zurück; auf der Support-Seite den Mail-Link antippen → Mail-App.
- [ ] **F3** Einstellungen → Sicherung → „Sicherung speichern“ → „In Dateien sichern“. → Datei liegt in der Dateien-App.
- [ ] **F4** „Backup importieren“ → dieselbe Datei wählen → **„Zusammenführen“**. → Meldung, nichts doppelt.
- [ ] **F3b** Menü → Statistiken → Jahr oben antippen, Reiter durchgehen. → Jeder Reiter beginnt mit „Auf einen Blick“ (Zahl + grüner/roter Pfeil zum Vorjahr) und „Auffällig“; ein Hinweis antippen öffnet das Volk bzw. den Bereich. Prüf eine Zahl gegen deine eigenen Einträge (z. B. Honig geerntet).
- [ ] **F4a** Menü → **Unterlagen**. → Oben Jahr und Suche, darunter 6 Reiter. Im Suchfeld „buch“ tippen → Bestandsbuch, Wanderbuch, Kassenbuch, Fahrtenbuch erscheinen mit ihrer Kategorie. Ein paar PDFs öffnen (z. B. Bestandsbuch, Fahrtenbuch). → Jedes nennt das gewählte Jahr.
- [ ] **F4b** Unterlagen → Reiter „Völker“ → „Volksakte“, ein Volk wählen, „Öffnen“. → Liste der Teile mit Anzahl; „Alles als PDF“ öffnet die Volksakte; bei „Durchsichten“ „CSV“ → Datei in Excel/Numbers öffnen: Datum als TT.MM.JJJJ, Kommazahlen mit Komma, Umlaute richtig.
- [ ] **F4c** Einen Stand mit Koordinaten öffnen. → Wetter steht ohne Antippen da (Uhrzeit von heute), darunter die Grafik; „Letzte Werte“ aufklappen → höchstens 5 Zeilen.
- [ ] **F4d Anzeige nach § 1a:** Einstellungen → Imkereidaten → „Tierhalter (Vor- und Nachname)“, „Bundesland / Land“ und Registriernummer eintragen. Einen Stand → Bearbeiten → „Anschrift oder PLZ und Ort“, „Gemarkung“, „Flurnummer“. Dann Unterlagen → „Anzeige nach § 1a (Veterinäramt)“ → PDF. → Titel „Anzeige der Bienenhaltung … § 1a Bienenseuchen-Verordnung“, Tierhalter, Kästchen „Beginn / Änderung / Aufgabe“, Tabelle mit Lage, Koordinaten, Völker heute und eingewintert; Summen stimmen mit den Zahlen oben überein; unten Ort/Datum/Unterschrift.
- [ ] **F4e Tierseuchenkasse:** In den Imkereidaten das Bundesland wechseln (z. B. Bayern, dann Thüringen). → Direkt darunter steht, was dort gilt („In Bayern werden Bienen nicht … gemeldet“ bzw. „Stichtag 03.01., Meldung innerhalb von 14 Tagen“). Unterlagen → „Meldung an die Tierseuchenkasse“ → bei Thüringen ist die Zeile „Eingewintert“ fett mit „(zu melden)“.
- [ ] **F4f Wanderschild:** Einen Stand öffnen → „Wanderschild“. → PDF im Querformat mit Name, Anschrift, Telefon und „Bienenvölker an diesem Stand: …“ in großer Schrift, ohne „Erstellt mit ImkerBuch“. Auch unter Unterlagen → „Wanderschild (§ 5a)“ mit Standauswahl.
- [ ] **F4g Stand-Wechsel:** Ein Volk öffnen → Bearbeiten → anderen Stand wählen → Speichern. → In der Historie des Volks steht „Stand gewechselt: „A“ → „B““ (und **kein** „Königin geändert“, wenn du die Königin nicht geändert hast).
- [ ] **F4h Österreich und Schweiz:** Einstellungen → Imkereidaten → „Bundesland / Land“ auf **Österreich**. → Darunter ein Hinweis zum VIS; das Feld „TSK-/Melde-Nummer“ verschwindet. Unterlagen → „Registrierung im VIS (Standorte)“ (ohne Spalte „eingewintert“), „Völkermeldung VIS (30.4. / 31.10.)“ mit passender Frist; beim Stand heißt der Knopf „Standschild“ und das PDF zeigt groß „VIS-Nr. …“. Dann **Schweiz** wählen → beim Stand → Bearbeiten erscheint „Standnummer vom Kanton“ (z. B. ZH-77 eintragen); „Registrierung der Bienenstände (Kanton)“ listet auch Stände ohne Völker; „Bestandeskontrolle – Völkerzahlen“ zeigt „eingewintert 01.11.“ und „ausgewintert 01.04.“; das Standschild zeigt „Stand-Nr. ZH-77“. **Zum Schluss dein richtiges Bundesland wieder einstellen.**
- [ ] **F4i Lage reicht nicht:** Bei einem Stand mit Völkern nur „PLZ Ort“ eintragen (ohne Hausnummer, Flurnummer und Koordinaten). → In der „Anzeige nach § 1a“ steht unten: „… weder eine Anschrift mit Hausnummer noch Flurnummer oder Koordinaten …“. Mit Hausnummer (z. B. „Am Anger 3, 85221 Dachau“) verschwindet der Hinweis.
- [ ] **F5** (Ganz am Ende, löscht alles!) Einstellungen → „Alle Daten löschen“ → `LÖSCHEN` eintippen → „Endgültig löschen“. → App lädt neu und steht auf der **Startseite** mit „Willkommen bei ImkerBuch“ (nicht in den Einstellungen); die Testphase bzw. der Kauf bleibt erhalten.

## G · Belastungsprobe

- [ ] **G1 Offline:** Flugmodus an → App benutzen, Durchsicht speichern. → Alles geht; Wetter zeigt „nicht abrufbar“. Flugmodus wieder aus.
- [ ] **G2 Hintergrund:** App offen lassen, zu anderen Apps wechseln, **mindestens 15 Minuten** warten (gern länger), zurück zu ImkerBuch → etwas speichern. → Klappt ohne Fehlermeldung. *(Hier hat Safari früher die Datenbank-Verbindung gekappt – neu abgesichert in 2.71.)*
- [ ] **G3 Neustart:** App ganz schließen und neu öffnen. → Alle Daten sind da.
- [ ] **G4 Dunkel:** Kontrollzentrum → Dunkelmodus. → App wird dunkel, alles lesbar.
- [ ] **G5 Quer:** iPhone drehen. → Nichts ragt über den Rand.
- [ ] **G6 Großbestand (nur auf einem Testgerät!):** Erst eine eigene Sicherung machen. Dann Einstellungen → „Backup importieren“ → in iCloud Drive den Ordner „ImkerBuch-Test“ → Datei `imkerbuch-backup-grossbestand.json` (50 Stände, 325 Völker, erfundene Daten). → Einspielen dauert wenige Sekunden; Völkerliste, Statistik und Stand-Seiten öffnen ohne Warten. Unterlagen → einige PDFs erzeugen (Bestandsbuch, Königinnen, Hygieneplan, Komplettausdruck, Honig-Etiketten). → Keine Buchstaben untereinander, keine Wörter mitten getrennt, kein Tabellenkopf allein unten, Etiketten ganz auf dem Blatt. Danach die eigene Sicherung wieder einspielen. *(Am Mac geprüft mit `tools/pdf-pruefung.mjs`: alle 57 PDFs.)*

## H · Kaufen

- [ ] **H1** Einstellungen → „ImkerBuch Vollversion“ → „Vollversion kaufen“. → Testkauf, danach „Vollversion freigeschaltet ✓“.
- [ ] **H2** „Käufe wiederherstellen“. → Meldung, Status bleibt „Vollversion“.
- [ ] **H3** „Code einlösen“. → Apple-Fenster für Codes erscheint (nicht einlösen).

## I · Light-Version ansehen (Test-Build)

Für diesen Teil brauchst du den **Test-Build** (mit Beispieldaten und Vorschau-Schalter). Sag mir Bescheid, dann stelle ich ihn bereit, oder im Terminal: `cd ~/ImkerApp/native && ./sync-app.sh --testmodus`, danach in Xcode ▶.

- [ ] **I1** Einstellungen → „Lizenz-Vorschau“ → „Light (nach 30 Tagen)“. → Beim Start bzw. auf der Startseite Hinweis „Du nutzt ImkerBuch Light“.
- [ ] **I2** Menü und untere Leiste: gesperrte Bereiche tragen das Schild **„Voll“**.
- [ ] **I3** Kassenbuch öffnen → Hinweis-Leiste oben, Buchungen sichtbar; „Neue Buchung“ → speichern → **Kauf-Fenster** statt Speichern.
- [ ] **I4** Mit mehr als 2 Völkern: Durchsicht speichern → Hinweis „Light gilt für bis zu 2 Völker“. „+ Neues Volk“ → Kauf-Fenster.
- [ ] **I5** „Weiter mit Light“ im Kauf-Fenster schließt es. Vorschau am Ende wieder auf „Aus“ stellen.

## J · iPad (falls vorhanden)

- [ ] **J1** Wie Vorbereitung, nur mit dem iPad. Hoch- und Querformat: Seitenleiste links, nichts abgeschnitten, Durchsicht am Stand gut bedienbar.

## K · Android-Handy (für Tester mit Android)

Installation über den geschlossenen Test im Play Store (Link kommt von Julian). Dann wie A–H, zusätzlich:

- [ ] **K1 Zurück-Taste/-Wischen:** offenes Fenster schließt sich (bei Eingaben erst „Änderungen verwerfen?“), sonst eine Seite zurück; auf der Startseite wird die App nur verkleinert. → Nie ungewollt Daten weg.
- [ ] **K2 Testphase:** „30 Tage kostenlos starten“ → Meldung „Testphase läuft – noch 30 Tage“ (bei Google läuft sie ab dem Start auf dem Gerät).
- [ ] **K3 Kauf:** „Vollversion kaufen“ → Google-Play-Kauffenster (Testkauf über die Testerliste, kein Geld). Danach „Vollversion freigeschaltet ✓“.
- [ ] **K4 Code einlösen:** öffnet den Play Store zum Einlösen; danach in der App „Käufe wiederherstellen“.
- [ ] **K5 Teilen:** Bestandsbuch-PDF und Sicherung → Android-Teilen-Menü (Drive, Dateien, Mail).
- [ ] **K6 Mitteilungen:** erste Aufgaben-Erinnerung → Android fragt nach Mitteilungen → Erlauben; danach erklärt die App „Minutengenau erinnern?“ → „Einstellung öffnen“ → bei ImkerBuch „Wecker und Erinnerungen“ einschalten → Zurück. Einstellungen → Funktionen zeigt „Minutengenau: an“. Aufgabe in 3 Minuten → Erinnerung kommt auf die Minute.
- [ ] **K7 Etiketten:** Volk → QR-Code → „Etiketten als PDF“ → Teilen-Menü mit dem Etikettenbogen.

---

**Fertig?** Schick mir alle Funde gesammelt – ich behebe sie, danach kommen die Store-Bilder mit der endgültigen Version und das Hochladen.
