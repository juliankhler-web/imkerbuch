# ImkerBuch – Test auf dem echten iPhone

Stand: 20.10.2026, Version 2.72. Dauer: etwa 60–90 Minuten (gern auf zwei Tage verteilt).

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
- [ ] **A4** „30 Tage kostenlos starten“ tippen. → Apple-Kauffenster (mit Hinweis „Xcode“), bestätigen. Danach ist das Fenster weg.
- [ ] **A5** Imme fragt: „Bist du neu hier?“ → „Ja, zeig es mir“.
- [ ] **A6** Kapitel 1 „Kurz umschauen“: 5 Hinweise (Startseite, Regler-Knopf oben, Schnellzugriffe unten, „Mehr“, Imme). → Sprechblase **ohne gelben Rahmen**, **über die ganze Breite**, „Weiter“ geht jeweils zum nächsten Hinweis.
- [ ] **A7** Imme führt weiter: Stand anlegen, Volk anlegen, erste Durchsicht. Folge ihr einfach. → Jeder Schritt zeigt auf den richtigen Knopf.

## B · Grundfunktionen

- [ ] **B1 Standort:** Bienenstände → „+ Neuer Stand“ → „Aktuellen Standort übernehmen“. → Es kommt **genau eine** Frage nach dem Standort, danach stehen Zahlen in Breiten-/Längengrad.
- [ ] **B2 Volk:** Völker → „+ Neues Volk“ → speichern. → Volk erscheint in der Liste.
- [ ] **B3 Durchsicht:** Volk öffnen → „+ Durchsicht“ → ausfüllen, speichern. → Eintrag steht in der Stockkarte.
- [ ] **B4 Durchsicht am Stand:** Volk → „Durchsicht am Stand“. → Eine Frage pro Bildschirm, große Knöpfe; probier es mal mit **Handschuhen**. Am Ende „Speichern“.
- [ ] **B5 Sprachnotiz:** In der Durchsicht am Stand „Sprachnotiz“ (oder Volk → „Notizen & Anhänge“ → „Aufnehmen“). → **Eine** Frage nach dem Mikrofon. Aufnahme läuft (roter Punkt), Stoppen, abspielen.
- [ ] **B6 Foto:** Volk → „Notizen & Anhänge“ → „+ Foto“. → **Eine** Frage nach der Kamera, Kamera öffnet sich, Foto erscheint als Bild.
- [ ] **B7 Königin:** Königinnen → „+“ → Generation z. B. „F1“ eintragen. → Wird in der Königin angezeigt.
- [ ] **B8 Varroa:** Volk → Reiter „Varroa“ → Zählung eintragen. → Ampel und Kurve erscheinen.

## C · Betrieb (das „Geld“-Paket)

- [ ] **C1 Behandlung + Bestandsbuch:** Behandlungen → „+ Behandlung“ → speichern → „Bestandsbuch (PDF)“. → **Teilen-Menü** öffnet sich, „In Dateien sichern“ funktioniert, PDF sieht ordentlich aus (kein „Volk Volk“).
- [ ] **C2 Fütterung in Litern:** Fütterung → „+ Fütterung“ → Futterart „Futtersirup (z. B. Apiinvert)“. → Feld heißt **„Menge je Volk (Liter)“**. 10 eintragen → darunter „10 L = 13,6 kg Sirup · 10 kg Zucker kommen beim Volk an“.
- [ ] **C3 Fütterung je Volk:** Fütterung → „Je Volk“. → Liste mit Zucker/Liter je Volk; beim Volk selbst stehen oben die Summen.
- [ ] **C4 Ernte direkt abfüllen:** Ernte und Abfüllung → Ernte erfassen → Reiter „Abfüllung“ → „+“ → bei „Woraus abfüllen?“ die **Ernte** wählen → Anzahl Gläser → Speichern. → Frage „Keine Charge angelegt – direkt abfüllen?“ → Ja → Gläser stehen im Bestand.
- [ ] **C5 Verkauf ohne Bestand + Rabatt:** Reiter „Verkauf“ → „+“ → „Anderer Honig – noch nicht im Bestand“, 30 Gläser à 6 €, Rabatt 10 %. → Unten live „Gesamt: 162,00 €“; beim Speichern Frage „Kein Bestand – trotzdem buchen?“.
- [ ] **C6 Auswertung:** Kassenbuch → „Auswertung“ → Jahr wechseln (Seite springt **nicht** nach oben) → Kategorie „Honigverkauf“ antippen → welcher Honig an wen; auf einen Abnehmer tippen → Abnehmer öffnet sich. Ernteprognose ganz unten aufklappen.
- [ ] **C7 Rechnung:** Rechnungen → „Neue Rechnung“ → Kunde, Position → „PDF“. → Teilen-Menü mit sauberer Rechnung.
- [ ] **C8 Material:** Weitere Produkte oder Verbrauchsmaterial → Verkauf/Abgang ohne vorhandene Position. → Frage „Jetzt anlegen?“ statt Fehlermeldung.

## D · Erinnerungen

- [ ] **D1** Aufgaben → „+ Neue Aufgabe“, fällig **heute**, Uhrzeit in **3 Minuten**. → Beim ersten Mal Frage „An Aufgaben erinnern?“ → Ja → Apple fragt nach Mitteilungen → Erlauben.
- [ ] **D2** App schließen (nach oben wischen), iPhone sperren, 3 Minuten warten. → **Mitteilung** von ImkerBuch erscheint.

## E · Einrichten nach eigenem Geschmack

- [ ] **E1** Startseite → Regler-Knopf oben rechts → Kacheln aus-/einschalten, Reihenfolge ziehen. → Startseite ändert sich sofort.
- [ ] **E2** Unten „Mehr“ → Kachel ca. ½ Sekunde gedrückt halten und nach unten in die Leiste ziehen. → Sie ersetzt dort einen Eintrag.

## F · Hilfe, Recht, Sicherung

- [ ] **F1** Menü → „Hilfe & Kontakt“ → „Fehler melden“. → **Mail-App** öffnet sich mit fertiger Nachricht an juliankhler+imkerbuch@googlemail.com (nicht absenden).
- [ ] **F2** Einstellungen → Rechtliches → Datenschutz / Impressum / Support öffnen. → Öffnet sich **in der App**, Schließen-Knopf führt zurück; auf der Support-Seite den Mail-Link antippen → Mail-App.
- [ ] **F3** Einstellungen → Sicherung → „Sicherung speichern“ → „In Dateien sichern“. → Datei liegt in der Dateien-App.
- [ ] **F4** „Backup importieren“ → dieselbe Datei wählen → **„Zusammenführen“**. → Meldung, nichts doppelt.

## G · Belastungsprobe

- [ ] **G1 Offline:** Flugmodus an → App benutzen, Durchsicht speichern. → Alles geht; Wetter zeigt „nicht abrufbar“. Flugmodus wieder aus.
- [ ] **G2 Hintergrund:** App offen lassen, zu anderen Apps wechseln, **mindestens 15 Minuten** warten (gern länger), zurück zu ImkerBuch → etwas speichern. → Klappt ohne Fehlermeldung. *(Hier hat Safari früher die Datenbank-Verbindung gekappt – neu abgesichert in 2.71.)*
- [ ] **G3 Neustart:** App ganz schließen und neu öffnen. → Alle Daten sind da.
- [ ] **G4 Dunkel:** Kontrollzentrum → Dunkelmodus. → App wird dunkel, alles lesbar.
- [ ] **G5 Quer:** iPhone drehen. → Nichts ragt über den Rand.

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

---

**Fertig?** Schick mir alle Funde gesammelt – ich behebe sie, danach kommen die Store-Bilder mit der endgültigen Version und das Hochladen.
