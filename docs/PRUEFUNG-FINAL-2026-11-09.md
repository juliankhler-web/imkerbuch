# Finaltest vor dem Einreichen – 09.11.2026 (v3.25)

Julian: „mache dann einen gigantischen test“, Modell auf Fable 5.1 umgestellt. Ausgangslage: 1045/1045 Tests grün, Apple-Händlerstatus (DSA) am 09.11. bestätigt, Google ohne offene Aufgaben.

## 1. Automatische Prüfungen (alle durchgelaufen, Ausgabe im Sitzungs-Scratchpad `final/`)

| Prüfung | Umfang | Ergebnis |
|---|---|---|
| `node tools/test-run.mjs` | 1045 Tests | alle grün (vor den Reparaturen) |
| Gesamtprüfung (`tools/gesamtpruefung.mjs`, Store-Fassung, alle Gerätegrößen) | 224 Seiten | 0 Auffälligkeiten |
| Angriffstest (`tools/angriffstest.mjs`) | 28 Seiten | 0 Auffälligkeiten |
| PDF-Prüfung (`tools/pdf-pruefung.mjs`, Großbestand) | 69 PDFs | 1 Warnung: Chargenübersicht, Tabellenzeile bis 42 mm hoch – eine Charge mit 30 Ernten listet alle Ernten einzeln. Angesehen: lesbar, Seitenumbrüche richtig, **kein Fehler**. Später schöner: Ernten je Sorte zusammenfassen. |
| Großbestand (`MASSEN=1`, 50 Stände, 325 Völker, ~45.000 Einträge) | 224 Seiten | 0 Auffälligkeiten, langsamste Seite 512 ms (Reporting › Honig, wie zuletzt 517 ms) |

## 2. Agenten-Prüfung (Workflow `imkerbuch-finaltest`, Run wf_73d0520f-428)

Plan: 14 Bereichsprüfer (lesen den Code ihres Bereichs vollständig und stellen Abläufe mit Playwright an der Store-Fassung nach), je ein Gegenprüfer, Lückenkritiker, bis zu 5 Nachprüfungen. **Nach 26 Minuten und 2,4 Mio. Agenten-Tokens war Julians 5-Stunden-Nutzungsgrenze erreicht** („You've hit your 5-hour limit“, Reset 21:10 Uhr): 2 Prüfer fertig, 15 Agenten abgebrochen. Lehre (Memory `nutzungsgrenze-agentenflotte`): große Flotten mit Fable sprengen das Fenster – künftig 3–4 Prüfer je Fenster oder Opus 5.5.

**Fertig:** Königinnen/Zucht/Varroa (6 Funde, ~60 Abläufe mit 10 Skripten, Großbestand mit 325 Königinnen geprüft, frühere Reparaturen halten) und Trachten/Wanderungen/Wetter/Dienste/Kontakte/Fahrten (8 Funde). Gegenprüfung der 14 Funde durch Claude direkt am Code (Fable 5.1): **alle 14 treffen zu**, 12 Fehler und 2 Hinweise.

**Noch nicht geprüft (12 Bereiche):** Stände/Völker/Durchsicht, Behandlungen/Fütterung/Bio, Honig/Ernte/Abfüllung, Finanzen, Lager, Aufgaben/Zeiten/Meldungen, Daten/Sicherung/Papierkorb/Migrationen, Statistik/Großbestand-Leistung, PDF/Imme/Imkerschule, Lizenz/Light/Start, Oberfläche/Tablet, Sicherheit/Texte. Skript zum Fortsetzen: `~/.claude/projects/-Users-juliankoehler-ImkerApp/82e55b3d-…/workflows/scripts/imkerbuch-finaltest-wf_73d0520f-428.js` (BEREICHE auf 3–4 je Lauf kürzen).

## 3. Funde und Reparatur (alle am 09.11.2026 abends repariert, Tests „Finaltest 09.11.2026 …“ in tests/tests.js)

Königinnen/Varroa:
- **K1 (mittel)** Volk-Formular: Eine Königin, die schon in einem anderen Volk sitzt, ließ sich wählen – danach führten zwei Völker dieselbe Königin, zwei offene Zuordnungen, der Verlauf ließ sich nicht mehr speichern, die Statistik zählte doppelt. *Fix:* `openVolkForm.onSave` löst sie wie `umweiseln()` aus dem anderen Volk (Historie „Königin … umgesetzt nach …“), schließt fremde offene Zuordnungen, Status aktiv; `koeniginOptions()` zeigt „· in „Volk X““.
- **K2 (niedrig)** Verlauf von Hand: Eine offene Zuordnung machte eine „umgeweiselte“ Königin nicht wieder aktiv; aufgelöste Völker waren wählbar. *Fix:* `koeniginHistorieSync` setzt Status aktiv, `historieForm` verlangt für nicht aktive Völker ein Bis-Datum.
- **K3 (niedrig)** Varroa: negative Milbenzahlen (und Tage/Bienen) wurden gespeichert und als „gering“ gewertet. *Fix:* Feldfehler „Bitte eine Zahl ab 0 eingeben.“ in Einzel- und Sammelformular.
- **K4 (niedrig)** Kennung: Der Vorschlag wurde doppelt vergeben (Shortcut „Neue Mutter anlegen“ aus offenem Formular), folgte dem Jahrgang nicht, Doppel ohne Hinweis. *Fix:* unveränderter Vorschlag rückt auf die nächste freie Nummer des eingetragenen Jahrgangs; getippte Doppelung → „Die Kennung „…“ ist schon vergeben.“
- **K5 (hinweis)** Varroa bearbeiten: nach Methodenwechsel stand Zähldauer „1“. *Fix:* nicht benötigtes Feld wird gelöscht statt mit 1/300 gefüllt.
- **K6 (hinweis)** Mutter/Drohnenmutter durfte jünger sein als die Königin. *Fix:* Feldfehler „… muss aus einem früheren Jahrgang stammen …“.

Trachten/Wanderungen/Fahrten/Wetter/Kontakte:
- **F1 (mittel)** Fahrtenbuch blieb auf einem leeren Jahr hängen (nach Löschen der letzten Fahrt eines Jahres): neue Fahrt unsichtbar, leeres PDF. *Fix:* gemerktes Jahr nur, wenn es Fahrten hat; Speichern einer Fahrt wechselt auf ihr Jahr.
- **F2 (niedrig)** Vorlage „Zwischen zwei Ständen“ war nur mit Neuwahl beider Stände änderbar. *Fix:* Stand-Kennungen werden in der Vorlage gespeichert und vorbelegt; alte Vorlagen behalten ihren Text.
- **F3 (niedrig)** Wanderung korrigieren (Ziel/Datum): Volk-Historie behielt den alten Eintrag bzw. das alte Datum. *Fix:* Einträge tragen `wanderungId`, `wanderungHistorieBerichtigen()` passt sie beim Bearbeiten an oder entfernt sie.
- **F4 (niedrig)** „Fahrt buchen“ direkt nach „Rückgängig“ wurde 1,5 s still verschluckt. *Fix:* Rückgängig löst die Doppeltipp-Sperre.
- **T1 (niedrig)** Tracht-Erinnerung griff nicht, wenn fürs Jahr schon eine „Als Aufgabe“-Aufgabe bestand; Toast nannte deren Datum. *Fix:* die offene Aufgabe wird zur Erinnerung mit dem gewählten Vorlauf.
- **W1 (niedrig)** Ohne Internet: „Wetterabruf fehlgeschlagen: Failed to fetch“, „Adresssuche fehlgeschlagen: Failed to fetch“. *Fix:* `netzFetch()` meldet „Keine Verbindung zum Wetterdienst / zur Adresssuche – bist du online?“.
- **X1 (hinweis)** Kontakt-Detail nannte „Verbrauchsmaterial, Inventar, Weitere Produkte“. *Fix:* „Produkte, Verbrauchsmaterial, Geräte & Inventar“.
- **X2 (hinweis)** Kontakt-Auswahl zeigte „(kunde)“, „(beides)“. *Fix:* `kontaktTypLabel()` → „Kunde / Abnehmer“ usw. an 7 Stellen.

**Bestätigung:** 1054/1054 Tests grün (9 neue). Die Nachstell-Skripte der beiden Prüfer liefen danach gegen die aktualisierte Store-Kopie: K1 (Königin nur noch in einem Volk, Auswahl zeigt „· in „Volk A““), K3 (negative Milben abgewiesen), K4 (Mutter aus dem Shortcut bekommt IB-24-001, keine Doppel), K5 (Zähldauer 7 nach Methodenwechsel), F1 (neue Fahrt sofort sichtbar, Seite springt aufs Jahr mit Fahrten), F2 (Vorlage speichert vonStandId/nachStandId, Ändern ohne Neuwahl), F4 (Tipp nach Rückgängig bucht), T1 (Erinnerung am 12.11. statt 16.11., erinnerung: true), W1 (deutscher Hinweis). Zwei Skript-Meldungen sind Folgen der Reparatur, keine Fehler: t1-fahrten zählt nach dem jetzt gelungenen Tipp eine Fahrt mehr; t9 bricht ab, weil die doppelte Kennung „K-1“ nicht mehr gespeichert wird (Formular bleibt offen). K2, K6, F3 sind durch die neuen Tests abgedeckt.

Offen gelassen (vom Prüfer nur im Code gesehen, kein App-Fehler): Varroa-Zählungen mit fremden Methodennamen aus Importen rechnen als Milben/Tag.

## 4. Ultra-Test (dritter, letzter kostenloser) – gestartet 09.11.2026 ca. 21:40

Julians erster Versuch `/ultrareview --max-findings all` im großen Projektordner: „Repo is too large“ (Bilder/Videos). Im Prüf-Projekt `~/ImkerBuch-Pruefung` (Stand 787c190 = mit allen Reparaturen aus Abschnitt 3) dann: „Diff is too large … 11 files, 10,242 lines changed (limits: 500 files, 8,000 lines)“ gegen `main` (v3.23). Lösung: Vergleichsbasis `basis-nach-ultra-2` = e8a1578 (Stand nach dem zweiten Ultra-Test; der Weg v3.23 → e8a1578 war schon zweimal geprüft). Dafür wurde im Prüf-Projekt `main` auf e8a1578 gesetzt (alter Ausgangsstand heißt dort `v3-23-ausgang`). Gestartet mit `/ultrareview basis-nach-ultra-2 --max-findings all`: „Free ultrareview 3 of 3 … fehler-reparatur-2026-11-04 → basis-nach-ultra-2, 9 files changed, 4268 insertions(+), 300 deletions(-)“. Geprüft wird damit der Lager/Finanzen-Umbau (v3.24 → v3.25), die Großbestand-Reparaturen, Tablet, Start links und die 14 Reparaturen aus Abschnitt 3. Ergebnis: siehe unten, sobald da.

**Ergebnis (ca. 22:05 Uhr): 10 Funde – 4 „normal“, 6 „nit“ (Kleinigkeiten). Alle am 09.11.2026 abends repariert; Tests „Ultra-Test 3 U1–U5“ in tests/tests.js.**

- **U1 (normal)** Die neuen Königinnen-Prüfungen (Kennung eindeutig, Eltern-Jahrgang) liefen auch beim Bearbeiten alter Königinnen, selbst wenn nichts daran geändert wurde: Altdaten mit doppelter Kennung oder gleichaltriger Mutter ließen sich gar nicht mehr speichern (nicht einmal eine Notiz). Außerdem war „gleiches Jahr“ gesperrt, obwohl eine Mai-Königin im Juli Töchter haben kann. *Fix:* Prüfung nur bei neuer oder geänderter Kennung bzw. Abstammung; verboten ist nur ein **späterer** Jahrgang der Eltern.
- **U10 (nit)** Die Eltern-Prüfung suchte die Mutter in der Liste vom Öffnen des Formulars; eine gerade per „Neue Mutter anlegen“ angelegte Königin fand sie nicht. *Fix:* Eltern frisch aus der Datenbank.
- **U2 (normal)** Die Völkerlisten der Stand-Ernte und Stand-Behandlung nahmen das Anlegedatum in der App als Beginn des Volks: Wer im November seine Völker anlegt und die Juli-Ernte nachträgt (oder per PDF-Übernahme), fand „kein Volk“ und konnte nichts speichern. *Fix:* Für diese Listen zählt nur das Ende eines Volks (vorher aufgelöst), nicht der Beginn; später angelegte Völker werden mit „in der App seit …“ angeboten und nicht vorgehakt. Die Stichtag-Rechnung der amtlichen Meldungen bleibt unverändert (`voelkerAmStichtag`, jetzt mit Helfern `volkBeginn`/`volkSchluss`).
- **U3 (normal)** Eine Stand-Ernte wird seit v3.25 als ein Eintrag je Volk gespeichert; Chargen-Formular und „Abfüllen“ zeigten dann 80 gleich aussehende Zeilen, „Direkt abfüllen“ hätte 80 automatische Chargen angelegt. *Fix:* Die Einträge einer Stand-Ernte tragen eine gemeinsame `ernteGruppe` (+ Stand). Charge und Abfüllen bieten sie als **einen** Posten an („15.07.2026 · Raps · 20 kg · 2 Völker (Stand)“), einzelne Ernten nennen ihr Volk; beim Bearbeiten einer Charge ist die Gruppe als ein Posten angehakt; eine teilweise verchargte Gruppe steht wieder einzeln.
- **U4 (normal)** Behandlung pro Volk mit halben Stück (3 × 0,5 → 2 Stück auf zwei Einträge, der dritte ohne eigenen Abzug): Beim Ändern eines Eintrags zählte das Mitglied ohne Abzug nicht zur Gruppe – das Lager bekam Stück zurück, die es nie gab; beim Ändern des Mitglieds ohne Abzug wurde nichts abgezogen. *Fix:* Mitglieder ohne eigenen Abzug gehören zur Gruppe; ein Mitglied ohne Abzug übernimmt die Lager-Position der Gruppe (nur bei Stück – bei ml/g bleibt der alte Weg, sonst buchte „Mittel wieder gewählt“ nichts nach, Test R2 #17); bleibt die Menge gleich, trägt die Gruppe aber weniger Stück als nötig, zieht die App die fehlenden nach.
- **U5 (nit)** Zweite Rechnung zu einem Lager-Verkauf nach Storno einer rabattierten Rechnung: Der Beleg hatte Rabatt 0, das Festschreiben setzte die Kassenbuch-Einnahme auf den vollen Betrag. *Fix:* Rabatt = Positionen − gebuchter Betrag.
- **U6 (nit)** Nach einem Lager-Verkauf wartete das Formular auf die MHD-Prüfung; ein Fehler darin hätte das Formular offen gehalten und zu einem Doppelverkauf verleitet. *Fix:* MHD-Prüfung weiter abwarten, aber ein Fehler darin wird nur protokolliert und hält das Formular nicht offen. (Erster Versuch „nebenbei laufen lassen“ ließ im Testlauf 9 andere Tests kippen: Die Prüfung schrieb noch in die Datenbank, während der nächste Test lief – zurückgebaut.)
- **U7 (nit)** Zweite Sortier-Logik in der Lager-Liste. *Fix:* `lagerNatuerlich()` überall.
- **U8 (nit)** `behandlungFuerVoelker` hatte keinen Aufrufer mehr (Weg ohne Lager-Abzug und Wartezeit), der Kommentar stand an der falschen Stelle. *Fix:* entfernt, Tests auf `behandlungenJeVolkAnlegen` umgestellt.
- **U9 (nit)** „Alle auswählen / Keine / n von m“ zweimal gebaut (Behandlung und Ernte). *Fix:* ein Helfer `volkAuswahlLeiste()`.

## 5. Restliche 12 Bereiche in Portionen (Opus 5.5) – Portion 1: Finanzen, Lager, Daten, Lizenz/Start

Workflow `imkerbuch-portion` (4 Prüfer + Gegenprüfer): 40 bestätigte Funde, sofort an Julian gemeldet.
Reparatur Bereich für Bereich (Workflow `imkerbuch-portion-reparieren`, Run wf_76c1cd9e-88c), danach unabhängige Durchsicht des Diffs.

- **Finanzen (11):** 10 behoben – negativer Preis/negative Menge sperrt den Bereich nicht mehr (Feldfehler, kaputte Altentwürfe zählen als 0 mit Hinweis), freie Position mit Kommamenge, Rechnungsdatum Pflicht, Kassenbuch springt aus leerem Jahr, Einnahme cent-genau (Abgangszeilen summieren genau), Kontakt als Lieferant bleibt sichtbar gewählt, Rechnungskreis geht beim schnellen Wechsel nicht verloren, USt-Satz in der Einnahme, Bereichsnamen „Produkte“/„Geräte & Inventar“, Beleg-Rechnung zu Barverkauf „Betrag dankend erhalten.“
  - **Offen (Entscheidung Julian):** Rechnung nur mit freien Positionen (z. B. Ableger) bucht als „Honigverkauf“. Vorschlag: Auswahlfeld „Kassenbuch-Kategorie“ im Entwurf (braucht Mockup) oder feste Regel.
  - Bewusst gelassen: Positionszeilen im Entwurf/PDF zeigen ihre eigene gerundete Summe (Rechenversion 2 der festgeschriebenen Rechnungen bleibt unverändert).
- **Lager (8):** alle behoben – keine Bruchteile bei Stück, „Bestand niedrig“ nur einmal und nicht sofort wieder, Liste bei Bestand 0, Einkauf von Produkten in richtiger Kategorie, Imme „Zeig es mir“ bei Pfand, Verkaufssuche ohne Treffer, alte Bereichsnamen.
- **Daten (12):** alle behoben – Zwischenstand zurückholen legt Fotos in den Papierkorb statt sie zu löschen und warnt vor späteren Fotos, Zusammenführen berücksichtigt Löschungen/Stornos vom anderen Gerät, Excel 2,125 kg, Listen-Einstellungen werden vereinigt, Bio-Partner nicht doppelt, zwei Fenster überschreiben Listen nicht, Sprachnotiz-Text in der Volksakte, Papierkorb nach Start, Migrationen behalten Zeitstempel, Texte, Kassenbuch-Übernahme „aus/Haus“.
- **Lizenz/Start (8):** alle behoben – „1 Tag“, „sind“ bei Mehrzahl, kein doppeltes Fenster nach Update, Pauschalsatz § 24 mit Feldfehler, Kauf-Fenster nach gescheitertem Teststart, ehrliche Meldung bei „Käufe wiederherstellen“, Lager in Light-Texten, Hinweis wenn die Vollversion nach 7 Tagen nicht mehr bestätigt ist.
- **Durchsicht fand 3 Nachbesserungen (selbst behoben, 10.11.2026):**
  1. Excel: Umschreiben nur noch bei englisch geschriebenen Kommazahlen – PLZ 01067, Telefon 089…, Prozent bleiben (Test D3b).
  2. Zusammenführen: auch dort gelöschte Lager-Abgänge/-Zugänge/Pfand korrigieren den Bestand (Test D2b).
  3. Test D7 prüft jetzt wirklich mit einem älteren, anderen Satz.
- **Ergebnis:** voller Lauf 1090 von 1090 Tests grün.

## 6. Portion 2: Honig, Behandlungen/Fütterung, Stände/Völker, Statistik (10.11.2026)

Prüfung (Workflow `imkerbuch-portion`, Run wf_0a2a9889-729): 43 bestätigte Funde, sofort an Julian gemeldet. Reparatur Bereich für Bereich (wf_8d709d7f-a98), danach vier Nachbesserungsrunden mit je unabhängiger Gegenprüfung (wf_21f774b5-90f, wf_af186c64-e6e, wf_31ab269a-56d, wf_1535462b-9c7).

- **Behandlungen/Fütterung (12):** alle behoben – Abzug springt nicht mehr auf anderes Mittel/Futter über (materialProdukt), Fertigsirup/Futterteig zieht Produktgewicht ab, Fütterung mit Fehlmenge änderbar, Fütterungsjahr, Stück-Gruppen (Löschen/Wiederherstellen/Ändern/Mittelwechsel/„–“ mit gemerkter Grenze abzugSoll), Öko-Angaben beim Zusammenführen, später angelegte Völker nicht vorgehakt, Bio-Umschalter-Fehler, Live-Hinweis in ganzen Stück, Futter-Rechner-Text, Tablet-Spalte.
- **Honig (12):** 9 behoben (Anzahl erhöhen, MHD-Erinnerung folgt, negativer Marktpreis/Mengen, doppelte Chargennummer, Datumsreihenfolge, Pollen/Propolis als eigenes Produkt inkl. Rechnung, 0-€-Verkauf, Rückfrage beim Schließen, Ernten unterscheidbar). **Offen (braucht Mockup/Julian):** Marktpreis ändern, einzelnes Glas aus dem Korb, Stand-Ernte gesammelt ändern/löschen (Hinweistext ist eingebaut).
- **Stände/Völker (12):** alle behoben (Filter nach Stand-Löschen, Zusatzfelder bleiben, natürliche Sortierung, Durchsicht endet, Stockkarte-Knopf, „Ohne Stand“ einmal, Volksakte nach Wanderung, Vereinigen mit Stand, Gewicht ≥ 0, Texte).
- **Statistik (7):** alle behoben (Stand heute, Honig-Kachel, Ziehen rollt mit, Jahre nach Zeit, Hinweistext, Beschriftungen, Daten nur einmal laden).
- **Prüftiefe Stück-Gruppen:** 504 Lösch-/Wiederherstell-Reihenfolgen, Zufallsfolgen über 28+ Startwerte, Vergleich mit dem alten Stand für Einzel-/ml-/kg-Behandlungen – keine Verstöße.
- **Rest aus Runde 4 (Runde 5 läuft):** „–“ und zurück auf dasselbe Mittel kostet einen Streifen zu viel; endgültig gelöschte Gruppen-Position; doppelte Nennung im Hinweis.
- **Ergebnis Zwischenstand:** voller Lauf 1142 von 1142 Tests grün.
- **Runde 5 (wf_c0a6e63e-879):** „–“ und zurück kehrt in die Gruppe zurück, gelöschte Gruppen-Position rechnet wie vorher, Rückgaben je Position zusammengefasst. Gegenprüfung: 1 Problem, niedrig (alle Völker einer Gruppe wählen „–“ und kehren zurück → jedes rundet einzeln auf; gleich wie Runde 4) – bewusst so gelassen. Voller Lauf 1145 von 1145 Tests grün.

## 7. Portion 3: PDF/Hilfe/Imme, Tablet, Sicherheit/Texte, Aufgaben/Zeiten + Julians Entwürfe (10.11.2026)

Prüfung (wf_8968bc64-a00): 35 bestätigte Funde (1 hoch), sofort an Julian gemeldet. Reparatur Bereich für Bereich, dann Bau der 4 freigegebenen Entwürfe, dann Durchsicht (wf_87c783b0-bee).

- **Sicherheit/Texte (6):** Hoch: präparierte Sicherung konnte Code ausführen – Zahlen-/Status-/Vorlagen-Felder werden beim Einlesen geprüft und bei der Anzeige maskiert. CSV-Bewertungen 1–5, U.parseNum streng („1.500 €“ = 1500, „3-4“/„Infinity“ abgewiesen), Light: Fahrten löschbar, alte Bereichsnamen. Prüferhinweis „breeding“ in docs/APP_STORE_TEXTE.md entfernt – **in App Store Connect beim Einreichen ebenso ändern.**
- **PDF/Hilfe/Imme (12):** alle behoben (Rechnungs-PDF bricht Summenblock auf Seite 2 um, Einführung/Imme „Zeig’s mir“, 3.25-Neuerungen, PDF-Übernahme Sorte, Tablet-Einführung, Texte, Demo-Daten).
- **Aufgaben/Zeiten (11):** alle behoben (Völkermeldung mit Hinweis bei späterem Beginn, Zeiterfassungsjahr, Tracht-Erinnerung bleibt verschoben, .ics mit Uhrzeit, Uhrzeit sichtbar, Zeitaufwand begrenzt, Wartezeit-Sammelerinnerung, Wassergehalt 18 %/Heide, Rechner-Grenzen, Propolis-Komma, Stand in Wartezeit-Erinnerung).
- **UI/Tablet (6):** 5 behoben (Menü „Mehr“ zurücksetzen, Verschieben, lange Namen, „Dashboard“, Tippflächen, „Voll“-Marke). **Offen (Julian):** Reiterhöhe 34/32 px bewusst so (Platz).
- **Entwürfe E1–E4 (Julian 10.11.2026 freigegeben):** Marktverkauf „−“ und „✎ Preis“, Stand-Ernte für alle ändern/löschen, Rechnung „Im Kassenbuch als“, Volk „besteht seit“. Damit erledigt: P1 Finanzen #9, P2 Honig #2b/#8/#9, P3 Aufgaben #1.
- **Durchsicht – 3 Nachbesserungen selbst behoben:** „12,–“ mit Gedankenstrich, Sammeländerung schlägt bei neuem Datum die Tracht neu vor, „besteht seit“ bei Altdaten ohne Beginn leer (Tests P3 D1–D3).
- **Ergebnis:** voller Lauf 1180 von 1180 Tests grün.
