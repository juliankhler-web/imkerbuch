# ADR-0004: Eine importierte Sicherung ist nicht vertrauenswürdig

- **Status:** Angenommen
- **Datum:** 2026-09-21
- **Betrifft:** Backup-Import, alle Anzeigen, Tabellen-Export

## Kontext

Die App hat keinen Server ([ADR-0001](0001-alles-bleibt-auf-dem-geraet.md)).
Daten wandern deshalb als **Sicherungsdatei** zwischen Geräten — und die kann
ebenso gut von jemand anderem kommen: aus einem Imkerforum, per E-Mail, vom
Vereinskollegen. Die App führt sie über „Zusammenführen" mit dem eigenen
Bestand zusammen.

Bis v1.61 wurde dieser Datei geglaubt. Eine externe Nachprüfung (Codex,
21.09.2026) hat daraus sechs belegte Angriffe abgeleitet, vier davon kritisch:

- Ein **erfundener Speichername** in der Datei landete ungeprüft im
  Vorschau-Dialog. Es genügte, die Datei **auszuwählen** — „Zusammenführen"
  musste nicht einmal bestätigt werden.
- Eine **ID** wie `x"><img …>` brach aus `data-id="…"` aus, sobald man die
  betreffende Liste öffnete. Dass Namen entschärft wurden, half nicht.
- Ein **Zahlenfeld** (`jahrgang`, `bestand`, `groesse`), das Text enthielt,
  wurde unverändert angezeigt.
- Eine **Einstellung** (`logo`, `rechnungQr`, `bioLogos`) landete direkt in
  einem `src`-Attribut; mit `logoImHeader` sogar bei jedem Start.

## Entscheidung

**Jede eingelesene Sicherung wird geprüft, bevor etwas davon verwendet wird** —
und die Anzeige verlässt sich zusätzlich nicht darauf.

Beim Einlesen (`Backup._saeubereZeile`):

- Nur **bekannte Speicher** werden namentlich angezeigt; fremde werden gezählt
  und übersprungen.
- Eine **ID** muss `^[A-Za-z0-9_-]{1,64}$` erfüllen, sonst bekommt der Datensatz
  eine neue. Er geht nicht verloren — er kommt als neuer an.
- **Bildwerte** (`logo`, `rechnungQr`, `imkerei.bioLogos`) müssen ein
  eingebettetes Bild oder `https` sein (`U.bildQuelle`), sonst fallen sie weg.

In der Anzeige:

- Jede Einsetzung in einem `data-*`-Attribut ist entschärft (115 Stellen).
- Zahlenfelder laufen über `U.zahl()`, Größenangaben über das gehärtete
  `U.fmtBytes()`.
- `src`-Attribute aus Einstellungen laufen über `U.bildQuelle()`.

Im Tabellen-Export (`Xlsx.zelleSicher`):

- Ein Text, der mit `= + - @` beginnt, bekommt ein führendes Hochkomma —
  sonst liest die Tabellenkalkulation ihn als **Formel**.
- Ein **Objekt** aus der Datei wird zu Text, sonst übernimmt die Bibliothek es
  als Zellobjekt samt Formelfeld.

## Begründung

Die Prüfung beim Einlesen ist die Wurzel: Stromabwärts verlässt sich jede
Anzeige darauf, dass eine ID eine ID und eine Zahl eine Zahl ist. Die
Entschärfung in der Anzeige ist die zweite Ebene — sie hält, auch wenn später
jemand einen neuen Weg in die Datenbank baut, der an der Prüfung vorbeiführt.

**Nicht entschieden wurde eine vollständige Schemaprüfung.** Sie würde jedes
Feld jedes Speichers beschreiben und müsste bei jeder Änderung mitgepflegt
werden. Der Nutzen liegt bei den vier Stellen oben, die Pflegelast bei allen.

## Verworfene Alternativen

- **Import ganz verbieten** — nimmt der App ihren einzigen Weg zwischen Geräten.
- **Alles beim Einlesen von HTML befreien** — verfälscht rechtmäßige Eingaben:
  „Gewicht < 20 kg" ist eine gültige Notiz.
- **Nur in der Anzeige entschärfen** — hätte die Vorschau nicht gerettet, die
  schon vor jeder Bestätigung zeichnet.

## Folgen

**Gut:** Eine fremde Datei kann keinen Code mehr ausführen. Der Nutzer erfährt,
dass unbekannte Bereiche übersprungen wurden.

**Preis:** Ein Datensatz mit unbrauchbarer ID verliert seine Verknüpfungen —
er kommt als neuer Eintrag an. Das ist gewollt: Die Alternative wäre, die
unbrauchbare ID zu behalten.

**Zu beachten bei künftigen Änderungen:** Wer eine neue Anzeige baut, setzt
nichts ungeprüft in ein Attribut. Wer einen neuen Weg in die Datenbank baut,
führt ihn über `_saeubereZeile` — oder begründet, warum nicht.

## Wie wir merken, dass es trägt

Fünf Tests stellen genau diese Angriffe nach (`S1` bis `S5/S6` in
`tests/tests.js`) und prüfen zugleich, dass rechtmäßige Daten unverändert
durchkommen: gültige IDs bleiben, ein echtes Logo bleibt, normaler Text bleibt.
