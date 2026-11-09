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

Offen gelassen (vom Prüfer nur im Code gesehen, kein App-Fehler): Varroa-Zählungen mit fremden Methodennamen aus Importen rechnen als Milben/Tag.

## 4. Ultra-Test (dritter, letzter kostenloser)

Julian hat `/ultrareview --max-findings all` im großen Projektordner gestartet → „Repo is too large. Push a PR …“. Der Lauf muss aus dem kleinen Prüf-Projekt `~/ImkerBuch-Pruefung` kommen (Zweig `fehler-reparatur-2026-11-04` gegen `main` = v3.23; Stand dort: Commit 47e71e2 vom 09.11., **vor** den Reparaturen aus Abschnitt 3 – vor dem Start noch einmal nachziehen). Ablauf: Sitzung in den kleinen Ordner umstellen (oder dort eine neue Sitzung öffnen), `/code-review ultra --max-findings all` eintippen, danach zurück.
