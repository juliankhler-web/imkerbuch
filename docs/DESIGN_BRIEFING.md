# Design-Briefing · Drucksachen Imkerei

## Worum es geht

Eine Imkerei braucht ein einheitliches Erscheinungsbild für alle Drucksachen.
Bisher ist jedes Stück für sich gewachsen und wirkt technisch statt gestaltet.
**Alles soll neu**, aus einer Hand, mit erkennbarer Handschrift.

Der Ton: handwerklich und ehrlich, nicht rustikal-verspielt und nicht
Konzern-glatt. Naturprodukt aus kleiner Hand, sauber präsentiert.

## Was gestaltet werden soll

| Stück | Format | Woraus es entsteht |
|---|---|---|
| **Honig-Etikett** | 90 × 54 mm, 10 Stück auf A4 (2 Spalten × 5 Zeilen) | aus Code erzeugt |
| **Rechnung** | A4 hoch, DIN 5008 Form B (Fensterkuvert) | aus Code erzeugt |
| **Visitenkarte** | 85 × 55 mm, Vorder- und Rückseite | freie Gestaltung |
| Übrige Unterlagen (Bestandsbuch, Chargenübersicht, Kassenbuch-Jahresbericht, Bio-Unterlagen, Fütterungsliste, Bestandsmeldung) | A4 hoch | aus Code erzeugt |

## Wichtig: zwei verschiedene Welten

**Die Visitenkarte ist frei.** Beliebige Schriften, Farben, Effekte, Veredelung.

**Alles andere entsteht aus Code** (Bibliothek jsPDF, direkt in der App). Daraus
folgen harte Grenzen, die der Entwurf einhalten muss:

- **Flächen, Linien, Text, Bilder** – ja. Verläufe, Schlagschatten, Transparenz,
  Freisteller, Textumfluss um Formen – **nein**.
- **Schriften**: eingebaut sind Helvetica und Times. Eine eigene Schrift ist
  möglich, muss aber als Datei eingebettet werden (bläht das Dokument auf) –
  bitte höchstens **eine** und nur, wenn sie den Unterschied macht.
- **Farben** im Druck: einfache Vollfarben, keine Sonderfarben.
- Alles muss sich in **Millimeter-Koordinaten** beschreiben lassen. Ein Raster
  mit klaren Zonen ist Gold wert; frei schwebende Collagen sind es nicht.

## Vorhandene Gestaltungsmittel

- **Logo**: Wabe (Sechseck) in Honiggold mit Initialen, wird vom Nutzer
  hochgeladen und kann sich ändern – der Entwurf darf sich nicht darauf
  verlassen, dass es genau so aussieht.
- **Farben aus der App** (sollten sich wiederfinden):
  Honiggold `#E8A013`, dunkles Gold `#A96F00`, tiefes Gold `#7A5000`,
  Anthrazit `#26262B`, Creme `#FAF6EF`, Linien `#ECE4D4`, Grün für Bio `#4C8A2E`.
- **Bio-Logos** (Bioland, EU-Bio) werden vom Nutzer hochgeladen, meist SVG,
  quadratisch. Sie brauchen einen festen Platz, dürfen aber auch fehlen.

## Pflichtangaben – nicht verhandelbar

**Etikett** (Honigverordnung, LMIV). Alle Angaben müssen aufs Etikett und eine
gesetzliche Mindest-Schriftgröße einhalten (x-Höhe mindestens 1,2 mm):

- Verkehrsbezeichnung („Sommerblütenhonig")
- Nettofüllmenge („500 g")
- Mindesthaltbarkeitsdatum
- Losnummer
- Ursprungsland
- Name und volle Anschrift des Imkers
- bei Bio: Code der Öko-Kontrollstelle („DE-ÖKO-006") und Verband
- optional: QR-Code zur Rückverfolgung

Das ist viel für 90 × 54 mm. Genau daran krankt der jetzige Entwurf: es wirkt
voll und gedrängt. Gesucht ist **Ordnung**, nicht Weglassen – klare Zonen,
Hierarchie, Luft an den richtigen Stellen. Vorschläge für ein größeres Format
oder ein rundes Deckel-Etikett sind willkommen.

**Rechnung** (§ 14 UStG, DIN 5008 Form B):

- Anschriftfeld an fester Position für das Fensterkuvert, darüber die kleine
  Rücksendezeile
- Falzmarken bei 105 mm und 210 mm, Lochmarke bei 148,5 mm
- Rechnungsnummer, Datum, Betriebsnummer
- Positionen mit Menge, Einzelpreis, Summe
- Gesamtbetrag, enthaltene Umsatzsteuer
- Steuerhinweis je nach Modell: Regelbesteuerung, Kleinunternehmer § 19 oder
  Pauschalierung § 24 – der Text steht fest und muss vollständig lesbar sein
- bei Bio: Öko-Kontrollstellen-Code und Verbandslogos
- Fußzeile mit Anschrift, Telefon, E-Mail

**Visitenkarte**: Name, Imkerei, Anschrift, Telefon, E-Mail, gern QR zur Website.

## Was am Bisherigen stört

- Wirkt **technisch erzeugt**, nicht gestaltet: alles gleich gewichtet, keine
  Hierarchie, überall dieselbe Grauabstufung.
- Das Etikett ist **gedrängt**; Pflichtangaben und Gestaltung kämpfen um Platz.
- Kein durchgehendes Erscheinungsbild: Etikett, Rechnung und Unterlagen sehen
  aus wie von drei verschiedenen Leuten.
- Die Amtsdokumente sind nüchterne Tabellen – dürfen sie bleiben, aber sie
  sollten wenigstens denselben Kopf und dieselbe Typografie tragen.

## Was ich mir wünsche

Ein **Baukasten**, kein Einzelstück: Kopfzone, Typo-Stufen, Farbeinsatz,
Linienstärken und Abstände so festgelegt, dass Etikett, Rechnung, Visitenkarte
und die sechs Amtsdokumente erkennbar zusammengehören.

Am liebsten je Stück **zwei bis drei Varianten** nebeneinander zum Vergleichen –
und bitte mit echten Beispieltexten, nicht mit Blindtext, damit man sieht, ob
die langen Pflichtangaben wirklich passen.
