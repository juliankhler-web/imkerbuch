# Ultra-Test (/code-review ultra) – 05.11.2026

Lauf: kostenloser Ultra-Test 1 von 3, auf einem schlanken Prüf-Projekt `~/ImkerBuch-Pruefung` (nur Code: index.html, tests, service-worker.js, PROJEKT.md, tools/test-run.mjs, die beiden Prüf-Dokus), Zweig `fehler-reparatur-2026-11-04` gegen `main` (v3.23). Grund: Das echte Repo ist mit Bildern/Videos „too large“ für den Ultra-Test, ein PR hätte Hochladen auf das öffentliche GitHub bedeutet. Umfang: 6 Dateien, +4479 / −436.

## Funde (normal)

U1. **Belegfotos im Kassenbuch werden nach 30 Tagen gelöscht** (index.html um 3606–3613, Stellen 3613, 22555, 22830, 23048): Bearbeiten eines Zugangs/Abgangs ersetzt die Kassenbuch-Buchung (lagerKasseAuftraege: alte in den Papierkorb, neue mit neuer id). Anhänge (parentTyp 'kassenbuch') bleiben an der alten id; das neue Aufräumen beim endgültigen Löschen (verwaisteAnhaenge über purgeTrash) löscht sie dann. Vorher blieben sie wenigstens in der Datenbank. Fix: Anhänge auf die neue Buchung umhängen (gleiche Transaktion) oder die Buchungs-id behalten.

U2. **Zweiter Karton springt bei Gläsern mit „Twist-Off“/„TO“ im Namen nicht ein** (materialAbzugPlan um 11194–11195, Stellen 11249, 11254, 23653): Start bekommt die vom Aufrufer vorgegebene Rolle, Ersatz-Kandidaten die aus dem Namen geratene (materialArt(p)). „Twist-Off-Glas 500 g“ passt auf DECKEL_WOERTER → Rolle 'deckel' ≠ '' → Karton B wird nie genommen, „30 Stück fehlten“, Bestand bleibt zu hoch. Gleiches für Deckel/Etiketten ohne Schlüsselwort im Namen. Fix: Kandidaten mit derselben Rolle wie der Start vergleichen.

U3. **abfuellungAendern gibt die Rolle (Deckel/Etikett) nicht weiter** (um 11320–11342): Beim Erhöhen der Anzahl rät materialAbzugPlan die Rolle aus dem Namen; ganzeStueckeVerteilen rundet Deckel und Gläser gemeinsam. Fix: Rolle beim Anlegen in jedem verbrauchAbzug-Eintrag speichern und beim Ändern an materialAbzugPlan/materialArt übergeben.

U4. **Rechnungs-Schnappschuss-Migration überschreibt beim Zusammenführen ein Storno vom anderen Gerät** (migriereRechnungSchnappschuss um 19031): schreibt ohne keepStamp → lastModified = jetzt → applyMerge behält die migrierte Kopie statt des neueren Stornos. Fix: keepStamp: true wie die anderen Daten-Migrationen.

## Vorschläge (nit)

N1. Freie Chargenmenge (mengeKg − abgefüllt − Verlust − Verarbeitung) ist an vier Stellen von Hand gerechnet (papierkorbWiederherstellenPruefen um 13281, lohnHonigPruefen, pruefeAbfuellMenge, ernteSpeichern) → ein Helfer chargeFreiKgIn(d, chargeId, ohneAbfId).
N2. Rabattfaktor einer Rechnung (warenwert − rechnungRabatt)/warenwert doppelt (honigVerkaufPosten um 21815, Kassenbuch-Aufschlüsselung um 18833) → rechnungRabattFaktor(r).
N3. papierkorbAnhangZahl liest bei jedem „Endgültig löschen“ alle Anhänge und Eltern-Bereiche, auch wenn der Eintrag keine Anhänge haben kann → dieselbe Abkürzung wie papierkorbEndgueltig (nur, wenn ein Store in ANHANG_BEREICHE betroffen ist).

## Zusätzlich offen aus der Gegenprüfung des Stand-Umbaus (Commit 0e49f03)

G1. Fahrt-Vorlagen zu einem gelöschten Stand: „Fahrt buchen“ legt still neue Fahrten dorthin an; Formular mit Vorlage wählt still das erste Ziel; vorlageForm zeigt „–“ statt „Name (gelöscht)“.
G2. Volk-Formular nutzt standOptionen nicht: zeigt „–“; bei aktivem Volk mit gelöschter Stand-id (z. B. nach „Duplizieren“ eines aufgelösten Volks) löscht schon Speichern der Notiz die Standzuordnung.
G3. Wanderung-Formular: standOptionen ohne Rückfalltext → beide Optionen „gelöschter Stand“, Liste zeigt „vonOrt (gelöscht)“.
G4. migriereGeloeschteStaende läuft nur beim Start, nicht nach Einspielen einer Sicherung.
G5. Wartezeit-Aufgaben-Titel speichert „(gelöscht)“ fest (doppelte Klammer, bleibt nach Wiederherstellen).
G6. Trachten lassen gelöschte Stände still weg; Speichern einer Tracht entfernt die Stand-id endgültig.
G7. Volksakte: Hinweis „Mit aufgeführt: Einträge für den ganzen Stand …“ fehlt beim gelöschten Stand.
G8. Zweites offenes Fenster/Tab: gemerkter Name erst nach Neuladen (nur Anzeige).

Status: **alle repariert** (05.11.2026), 955/955 Tests grün. U1 Belege ziehen auf die neue Buchung um (lagerKasseBuchen); U2/U3 Rolle für Start und Kandidaten gleich (materialNamensArt), Rolle im verbrauchAbzug gespeichert; U4 keepStamp; N1 chargeBelegtIn/chargeFreiKgIn; N2 rechnungRabattFaktor; N3 Abkürzung in papierkorbAnhangZahl; G1–G8 umgesetzt (G8: Name erscheint mit dem nächsten Neuzeichnen).
Offen zur Entscheidung: Wird ein Zugang so geändert, dass kein Betrag mehr anfällt (Einkauf → Geschenk), entsteht keine neue Buchung – die Belegfotos bleiben an der alten Buchung im Papierkorb und gehen nach 30 Tagen mit ihr (wie beim Löschen einer Buchung).
Nächster Schritt: zweiter Ultra-Test mit `/code-review ultra --max-findings all` (Julian: „so intensiv wie möglich“).

## Zweiter Ultra-Test (2 von 3, `--max-findings all`) – 05.11.2026

Umfang 7 Dateien, +5018/−460 (ganzer Weg v3.23 → heute). **Kein Fund der Schwere „normal“ mehr.** 7 × nit, 2 × pre_existing:

V1 (nit) applyMerge nutzt den Papierkorb als Grabstein: verwirft auch eine NEUERE Kopie aus der Sicherung (auf dem anderen Gerät nach dem Löschen geändert); Wiederherstellen schreibt dann die alte Kopie mit neuem Zeitstempel. → Ist die Kopie neuer als geloeschtAm, die Papierkorb-Daten durch die neuere Kopie ersetzen (weiter nicht still zurückholen).
V2 (nit) S.set('imkerei') verschluckt eine gescheiterte Schnappschuss-Migration und speichert die neuen Absender trotzdem → alte Rechnungen bekämen später den neuen Absender. → Fehler nicht verschlucken (wie beim Kontakt: Speichern abweisen).
V3 (nit) Alte Gruppen-Wartezeit-Erinnerungen ohne refIds: bei zwei mit gleichem Mittel und gleichem Fälligkeitstag schluckt die erste beim Bearbeiten beide Gruppen. → Nur umwandeln, wenn eindeutig.
V4 (nit) Grammatik „aus dem Entwürfen“ (abfuellungVerkaufSperre) → „aus den Entwürfen“.
V5 (pre_existing) abgangZurueckbuchen: Bearbeiten eines inzwischen (zweites Fenster) gelöschten Abgangs bucht den Bestand doppelt zurück. → Sperre wie bei zugangZurueckbuchen.
V6 (pre_existing) materialRolle: „Twist-Off-Glas“ ohne Größe gilt als Deckel und wird als Deckel abgezogen. → Gefäßwort vor Deckel-Wörtern (aber ausdrückliches „Deckel“ im Namen bleibt Deckel).
V7 (nit) migriereRechnungSchnappschuss findet bei Rechnungen mit endgültig gelöschtem Kontakt ewig Arbeit (leere Schreib-Transaktion bei jedem Start/Speichern). → Unrettbaren Empfänger markieren.
V8 (nit) positionLoeschText wird beim Öffnen jedes Positionsformulars schon gelesen (3 volle Bereiche). → Erst beim Tippen auf Löschen.
V9 (nit) „Liegt X im Papierkorb?“ an 6 Stellen von Hand → ein Helfer imPapierkorb(d, store, id).
