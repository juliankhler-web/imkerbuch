# Prüfung Praxis-Umbau 08.11.2026 (64460ec..00dd71e)

4 Prüfer + je 1 Gegenprüfer (nur lesen), Modell Opus 5.5 / Aufwand High (Julian umgestellt). 19 bestätigte Meldungen, Doppelte: P6=P14, P7=P13, P8=P16, P11≈P15, P9≈P17 (also ~14 Fehler). Status: Reparatur gestartet.

P1 [mittel] (pro-volk) Halbe Dosis bei Mitteln in „Stück“ ergibt falschen Lager-Abzug und eine falsche Fehlmengen-Meldung
  STELLE: materialAbzugPlan Z. 11305 (Rundung `einheit === 'Stück' ? Math.round(vorher - n)`), aufgerufen aus behandlungenJeVolkAnlegen Z. 11543
  ABLAUF: Bestand 10 Stück (das Inventar-Formular rundet stueckzahl in Z. 24395 auf ganze Zahlen), Mengen je Volk 1/1/0,5, Summe 2,5. Gerechnet: p.stueckzahl = Math.round(7,5) = 8, wirklich = 2, offen = 0,5, also gefehlt = 0,5. verbrauchMelden (Z. 24540ff) zeigt in Rot „0,5 Stück fehlten im Bestand“, obwohl 8 da sind. Mit node bestätigt: 10 − 2,5 → 8 / 2 / 0,5. Weil .5 immer aufgerundet wird, fehlen bei jeder halben Summe 0,5 Stück zu wenig, und die Meldung ist falsch. Das ist mit dem Plan nicht gewollt: Z. 30 nennt ausdrücklich „Ableger halbe Dosis“.

P2 [niedrig] (pro-volk) Abgewählte Völker sind nach einem Wechsel der Funktion wieder angehakt
  STELLE: Views.behandlungen.sammelForm, vorauswahl Z. 11132–11138 (am #f-funktion angemeldet), zusammen mit verdrahteVolkFilter.filtern Z. 11948ff
  ABLAUF: Stand A wählen, dann A6 abwählen und die Funktion wechseln. Zuerst läuft filtern (versteckte Völker werden abgehakt). Danach hakt vorauswahl alle sichtbaren Völker wieder an, weil standSel.value gesetzt ist. Erwartet: A6 bleibt abgewählt. Tatsächlich ist A6 wieder angehakt und bekommt beim Speichern einen Eintrag und einen Lager-Abzug.

P3 [niedrig] (pro-volk) Altdaten ohne Bestandszahl blockieren jetzt das Speichern der Behandlung
  STELLE: behandlungenJeVolkAnlegen Z. 11543 → materialAbzugPlan Z. 11303 buchungsZahl(p.stueckzahl, 'Materialbestand') → buchungsZahl Z. 13287
  ABLAUF: Ein Behandlungsmittel im Lager mit stueckzahl undefined oder null (ältere Fassung oder Import; andere Stellen wie verbrauchBestand Z. 23012 und Z. 6154/20026 lassen das bewusst zu) wird gewählt. buchungsZahl wirft „Materialbestand: Bitte eine gültige Zahl eingeben.“, und die ganze Transaktion bricht ab: kein Bestandsbuch-Eintrag. Vor heute lief onSave über verbrauchBuchen/verbrauchAbziehenKette (in 64460ec nachgesehen): Ein fehlender Bestand galt als 0, gespeichert und gemeldet wurde trotzdem. Dasselbe passiert, wenn eine Ersatz-Position derselben Art (weitere, ohne Filter auf Bestand > 0) keine stueckzahl hat und der Start nicht reicht. Eine gelöschte Startposition wirft „Der ausgewählte Materialposten fehlt.“, die alte Kette gab dagegen null zurück.

P4 [niedrig] (pro-volk) Hinweis zum Lager-Abzug beschreibt die alte Rechnung
  STELLE: Views.behandlungen.sammelForm Z. 11103 (Hinweis in verbrauchFelder)
  ABLAUF: Der Text sagt „Abgezogen wird Menge je Volk × Anzahl der angehakten Völker.“. Er ist unverändert aus 64460ec übernommen (dort Z. 11047). Gebucht wird aber die Summe der einzelnen Mengen (Z. 11139 verdrahteVerbrauch-Summe, Z. 11541 summe). Beispiel 50/50/25 ml: Laut Text 150 ml, abgezogen werden 125 ml.

P5 [niedrig] (pro-volk) Neben den Formularen mit Völkerliste lassen sich noch Einträge „Ganzer Stand“ anlegen, die in der Leistung pro Volk fehlen
  STELLE: PdfImport.ernteQuickForm Z. ~30088–30102 (zielFelder mit „Ganzer Stand“, DB.put('ernten', { zielTyp: v.zielTyp … })); Views.behandlungen.form Z. 10980ff (zielFelder) aus der PDF-Übernahme Z. 30065
  ABLAUF: In der PDF-Übernahme eine Ernte übernehmen und „Ganzer Stand“ mit 40 kg wählen. Es entsteht ein Eintrag mit zielTyp 'stand'. Das neue Ernte-Formular (Z. 17771ff) teilt dagegen neue Stand-Ernten pro Volk auf (ernteJeVolkAnlegen). Die Statistik zählt nur zielTyp 'volk' (Plan Z. 47). Die 40 kg fehlen also in der Leistung je Volk, obwohl der neue Text (Diff: „Ernten trägst du pro Volk ein – auch über ‚Ganzer Stand‘ mit der Völkerliste“) etwas anderes sagt. Bei Behandlungen ist es genauso: Views.behandlungen.form legt für neue Einträge weiter einen Stand-Eintrag ohne Völkerliste an.

P6 [mittel] (lager-verkauf) Beim Festschreiben einer Beleg-Rechnung wird ein inzwischen geänderter Lager-Verkauf still auf den alten Betrag zurückgesetzt
  STELLE: Views.rechnung.festschreiben Z. 19872–19876 (verkaufAbweichung im Bestätigungstext), Z. 19932 belegVerkaufAnpassen; verkaufAbweichung Z. 20651–20655; belegVerkaufAnpassen Z. 20674–20705; abgangZurueckbuchen Z. 23811–23813 (prüft belegRechnungZu nur beim Löschen, nur festgeschriebene)
  ABLAUF: Lager-Verkauf 10 × 4 € = 40 € (KB 40 €). „Rechnung dazu erstellen“ legt einen Entwurf an, ausVerkauf.betrag = 40, Positionen sind gesperrt (posAenderbar = false). Danach wird der Abgang auf 5 Stück bearbeitet. Das geht, weil belegRechnungZu nur festgeschriebene Rechnungen findet und beim Bearbeiten gar nicht prüft. Ergebnis: Bestand −5, KB 20 €. Beim Festschreiben gibt verkaufAbweichung null zurück (40 gegen 40). Banner und Rückfrage sagen „Bestand und Kassenbuch ändern sich nicht noch einmal“. belegVerkaufAnpassen rechnet aber mit vorher = abgangErloes(vk) = 20 und neu = 40: Es setzt kb.betrag = 40 und vk.betragRechnung = 40. Erwartet: Warnung oder Sperre. Tatsächlich: 5 Stück abgebucht, 40 € Einnahme, Rechnung über 10 Stück, und die Rückfrage sagt das Gegenteil.

P7 [mittel] (lager-verkauf) betragRechnung bleibt beim Bearbeiten eines Lager-Abgangs stehen – Erlös und Kassenbuch sind danach falsch
  STELLE: materialAbgangForm onSave, Object.assign(rec || {}, {...}) Z. 23872–23882, danach abgangErloes Z. 23883 / 23161–23164; gesetzt in belegVerkaufAnpassen Z. 20702–20703; rechnungStornieren Z. 19520 lässt den Verkauf unverändert
  ABLAUF: Lager-Verkauf 10 × 4 € mit Beleg-Rechnung und 4 € Rabatt wird festgeschrieben: betragRechnung = 36, KB 36 €. Die Rechnung wird storniert (Z. 19520 ändert nur den Status). Danach wird der Abgang auf 8 × 4 € geändert. Object.assign überschreibt betragRechnung und geaendertDurchRechnung nicht. abgangErloes gibt deshalb wieder 36 € zurück, und lagerKasseBuchen bucht 36 € statt 32 €. Der Live-Hinweis im Formular zeigt 32 €. Bei Preis 0 werden trotzdem 36 € gebucht.

P8 [niedrig] (lager-verkauf) Bruchteile bei Stück-Ware in Rechnung verfälschen den Bestand (Storno erzeugt Bestand aus nichts)
  STELLE: Views.rechnung.posForm onSave Z. 19807 (Lager-Menge auf 3 Nachkommastellen gerundet, auch bei Stück); festschreiben Z. 19912ff. lagerBuchen(-menge) und Z. 19943 bestandVorher = verbrauchBestand(pos) + menge; rechnungStornieren Z. 19537–19539 lagerBuchen(+p.menge); lagerRunden (Math.round bei Stück); lagerVerkaufBuchen Z. 20509/20528
  ABLAUF: Stück-Position mit Bestand 10, Rechnung mit Lager-Menge 2,5, festschreiben: round(7,5) = 8, es gehen also nur 2 Stück ab. Die Abgangszeile zeigt „vorher 10,5 / nachher 8“. Storno: round(8 + 2,5) = 11. Erwartet 10, tatsächlich 11 (mit node nachgerechnet). Lager-Verkauf von 1,5 bei Bestand 10: round(8,5) = 9, gefehlt = 1,5 − 1 = 0,5, also eine falsche Meldung „fehlten“.

P9 [niedrig] (lager-verkauf) Abgangszeile aus einer Rechnung: Preis und Erlös ohne Rabatt – Abgangsliste, PDF und Export passen nicht zum Kassenbuch
  STELLE: Views.rechnung.festschreiben Z. 19938–19943 (preis = Summe(menge × einzelpreis) / menge); abgangErloes Z. 23161; Anzeige Z. 20122/20135, PDF Z. 29480–29488, Export Z. 27983
  ABLAUF: Rechnung mit Lager-Position 10 × 5 € und 10 % Rabatt (rabattWert auf Rechnungsebene), festschreiben: KB 45 €. Die Abgangszeile bekommt preis 5 €, abgangErloes = 50 €. Abgangsliste, Summe „Erlös“, PDF und Export zeigen 50 €, das Kassenbuch 45 €.

P10 [niedrig] (lager-verkauf) Verkaufspreis-Vorbelegung im Abgang-Formular löscht den alten Preis nicht
  STELLE: materialAbgangForm, vkSetzen Z. 23932–23937
  ABLAUF: Neuer Verkauf: Position A (VK 4,50 €) wählen, dann Position B ohne VK. Das Preisfeld behält 4,50 €. Beim Speichern wird B zu 4,50 € verkauft und ins Kassenbuch gebucht. In lagerVerkaufForm (Z. 20579) wird das Feld bei fehlendem VK dagegen geleert.

P11 [niedrig] (lager-verkauf) Lager-Verkauf mit festgeschriebener Beleg-Rechnung: Einnahme lässt sich „nur im Kassenbuch“ löschen – die Rechnung steht dann ohne Einnahme da
  STELLE: kassenbuchLoeschen Z. 18841–18856 (Sperre nur bei k.rechnungId); lagerVerkaufBuchen Z. 20521 und belegVerkaufAnpassen Z. 20696 legen die Einnahme mit rechnungId: null an; kassenbuchVerknuepft Z. 18826–18828
  ABLAUF: Lager-Verkauf 40 € mit festgeschriebener RE-0005. Im Kassenbuch wird die Einnahme gelöscht und „Nur im Kassenbuch löschen“ gewählt. Die Rechnungssperre greift nicht (rechnungId null), loescheMitMaterial verschiebt die Einnahme in den Papierkorb. RE-0005 bleibt ohne Einnahme festgeschrieben. Das Storno (Z. 19520) bucht bei ausVerkauf nichts. Der Zweig „Auch dort löschen“ ist dagegen gesperrt (abgangZurueckbuchen wirft belegRechnungFehler).

P12 [niedrig] (lager-verkauf) Imme „Zeig es mir“ im Lager kann den falschen Knopf („Verkaufen“) markieren
  STELLE: Views.lager.render Z. 20431–20444 (Kopf mit btn-primary „Verkaufen“ wird sofort in das live #main geschrieben, danach await renderInventarBereich mit mehreren DB-Abfragen); renderRoute Z. ~4693–4707 rendert direkt ins sichtbare main; Assistent.finde Z. 31350–31362 (Rückfall auf das erste .btn-primary), zeige Z. 31367
  ABLAUF: Imme-Eintrag „an-verkauf“ oder „material“ (route lager, param verbrauch, zeige „An- und Verkauf buchen“). Fällt eine Abfrage im 100-ms-Takt in die Zeit nach main.innerHTML und vor dem Ende von renderInventarBereich, findet finde() das Label nicht. Es nimmt dann das erste sichtbare .btn-primary, also „Verkaufen“. Imme markiert diesen Knopf mit dem Text „An- und Verkauf buchen tippen“.

P13 [hoch] (finanzen-rechnung) Lager-Verkauf bearbeiten: der von der Rechnung gesetzte Betrag (betragRechnung) bleibt hängen, das Kassenbuch bekommt einen falschen Betrag
  STELLE: materialAbgangForm → onSave, index.html Z. 23872–23885 (Object.assign(rec || {}, {...}) ohne betragRechnung/geaendertDurchRechnung); abgangErloes Z. 23161–23165; belegVerkaufAnpassen Z. 20702
  ABLAUF: Lager-Verkauf 2 × 5 € = 10 €, Beleg-Rechnung mit 1 € Rabatt festschreiben → am Abgang steht betragRechnung = 9. Danach den Abgang auf 5 Stück ändern. Erwartet: Erlös und Kassenbuch 25 €. Tatsächlich: abgangErloes(gespeichert) gibt 9 zurück, lagerKasseBuchen legt die neue Einnahme mit 9 € an, und die Abgangsliste und der Export zeigen 9 €.

P14 [mittel] (finanzen-rechnung) Festschreiben einer Beleg-Rechnung setzt die Kassenbuch-Einnahme still zurück, wenn der Lager-Verkauf nach dem Anlegen des Entwurfs geändert wurde
  STELLE: Views.rechnung.festschreiben Z. 19872–19876 (verkaufAbweichung Z. 20651, Grundlage ausVerkauf.betrag beim Anlegen) gegenüber belegVerkaufAnpassen Z. 20674–20681 (Grundlage ist der aktuelle Abgang über abgangErloes)
  ABLAUF: Abgang 2 × 5 € = 10 €, Rechnung dazu als Entwurf anlegen (ausVerkauf.betrag = 10). Danach den Abgang auf 3 × 5 € = 15 € ändern. Das ist erlaubt, weil belegRechnungZu nur festgeschriebene Rechnungen sieht. Kassenbuch steht auf 15 €. Dann den Entwurf festschreiben. Die Rückfrage vergleicht 10 mit 10 und sagt „Bestand und Kassenbuch ändern sich nicht noch einmal“. Tatsächlich setzt belegVerkaufAnpassen (vorher = 15, neu = 10) die Einnahme auf 10 € und betragRechnung = 10 an einen Abgang über 3 Stück.

P15 [mittel] (finanzen-rechnung) Die Kassenbuch-Einnahme zu einem Verkauf mit festgeschriebener Beleg-Rechnung ist nicht gesperrt: sie lässt sich ändern und „nur im Kassenbuch“ löschen
  STELLE: rechnungBuchungSperre Z. 19337–19338 (nur k.rechnungId); Views.kassenbuch.form Z. 19032–19036; kassenbuchLoeschen Z. 18841–18855, Zweig „Nur im Kassenbuch löschen“ → loescheMitMaterial; die Einnahmen aus Verkauf, Lager-Verkauf und belegVerkaufAnpassen (Z. 20690) haben rechnungId null
  ABLAUF: Honig- oder Lager-Verkauf 20 € mit festgeschriebener Beleg-Rechnung. Im Kassenbuch die Einnahme öffnen und auf 0 € ändern, oder löschen und „Nur im Kassenbuch löschen“ wählen. Erwartet: gesperrt wie bei Rechnungs-Buchungen. Tatsächlich geht beides ohne Sperre. Die Rechnung steht weiter über 20 €, im Kassenbuch steht 0 € bzw. nichts.

P16 [niedrig] (finanzen-rechnung) Rechnung mit Lager-Position in Bruchmenge bei einem Artikel in „Stück“: Festschreiben und Storno runden verschieden, der Bestand wächst aus dem Nichts
  STELLE: Views.rechnung.posForm Z. 19809 (Lager-Menge auf 3 Nachkommastellen, kein Ganzzahl-Zwang); festschreiben → lagerBuchen(-menge); rechnungStornieren → lagerBuchen(+menge) Z. 19543; lagerRunden Z. 23311 (Math.round bei „Stück“)
  ABLAUF: Artikel mit Einheit Stück, Bestand 10. Rechnungsposition aus dem Lager mit Menge 2,5 festschreiben: 10 − 2,5 = 7,5 → Math.round = 8. Stornieren: 8 + 2,5 = 10,5 → 11. Erwartet: wieder 10. Tatsächlich: 11. Die Rechnung berechnet 2,5 Stück, abgezogen wird nur 2. Die Abgangszeile speichert bestandVorher = 10,5.

P17 [niedrig] (finanzen-rechnung) Gemischte Rechnung und Rechnung mit Rabatt: Kassenbuch-Kategorie und Abgangsliste passen nicht zusammen
  STELLE: rechnungKategorie Z. 19491–19497; festschreiben, Abgangszeile mit preis = Summe/Menge ohne Rabatt (Z. 19934–19943); abgangErloes Z. 23161, Anzeige Z. 20135, Export Z. 27983
  ABLAUF: Reine Lager-Rechnung über 2 Kerzen à 5 € mit 10 % Rabatt festschreiben. Kassenbuch: 9 €. Abgangsliste und Export „Erlös (€)“: 10 €. Bei einer gemischten Rechnung (Honig und Kerzen) steht die ganze Einnahme unter „Honigverkauf“.

P18 [niedrig] (statistik-export-menue) Menü „Mehr“: Mitrollen ordnet Kacheln um, während der Finger über der unteren Leiste steht
  STELLE: index.html, langDruckSortieren → rollen() Z. 5072–5097 (v. a. Z. 5094), pointermove Z. 5142–5146, ende Z. 5155/5164; Aufruf openMoreSheet Z. 5193–5194
  ABLAUF: Handy (≤640 px): .modal ist ein Bottom-Sheet bis zum unteren Rand (Z. 703–704). Die Leiste wird beim Ziehen per body.lp-bar-hebt (z-index 150, Z. 915) über das Fenster (.modal-back z-index 100) gehoben, die Kacheln des .modal-body liegen also darunter. Kachel lang drücken und auf die Leiste ziehen: pointermove setzt st.zt und kehrt vor einordnen zurück (Z. 5144). Der Finger steht aber über navR.top - 70, denn unten = min(navR.top, boxR.bottom) (Z. 5087–5088), deshalb ist v > 0. Kann der Body weiterrollen, ruft rollen() in Z. 5094 einordnen(st.x, st.y) auf, ohne st.zt zu prüfen. einordnen (Rasterzweig, Z. 5051) trifft per getBoundingClientRect eine Kachel, die unter der Leiste liegt, und verschiebt den Platzhalter. Danach blockiert st.sperre weitere Tausche, solange der Finger stillsteht. Beim Loslassen läuft onZiel statt fertig (Z. 5164). Der Tausch bleibt im DOM, und der nächste Sortiervorgang im selben Fenster speichert ihn über fertig in menuOrder. Neu durch rollen: 'eltern' im Diff, vorher hatte das Menü kein Mitrollen und das Dashboard keine ziele.

P19 [niedrig] (statistik-export-menue) Menü „Mehr“ ohne Scrollbalken: Mitrollen scrollt die Seite hinter dem Fenster
  STELLE: index.html, langDruckSortieren → rollen() Z. 5077–5080 (Elternsuche) und Z. 5095 (window.scrollBy-Zweig)
  ABLAUF: Ist .modal-body nicht rollbar (scrollHeight ≤ clientHeight), findet die Schleife in Z. 5079 kein Element. html und body haben kein overflow-y auto/scroll (Z. 143–151), .modal-back nur position:fixed (Z. 675). Damit gilt st.rollBox = null. Zieht man eine Kachel in die obere Zone (oben = Unterkante der Topbar) oder die untere (Oberkante der Leiste), greift Z. 5095 mit window.scrollBy(0, v). UI.modal (Z. 3824–3859) sperrt das Scrollen der Seite nicht, also rollt die Seite hinter dem festen Fenster. Erwartet: Nichts rollt. Tatsächlich: Die Seite darunter steht nach dem Schließen woanders. einordnen läuft zusätzlich, ist aber harmlos, weil sich die Kacheln im festen Fenster nicht bewegen.

