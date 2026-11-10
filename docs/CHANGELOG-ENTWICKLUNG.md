# ImkerBuch – Entwicklungs-Geschichte vor 1.0

Bis Version 3.25 (Stand 2026-11-10). Ab 1.00 zeigt die App Kunden nur noch die neuen Einträge.
Format: Auszug der früheren `CHANGELOG`-Liste aus `index.html`.

```js
  { version: '3.25', datum: '2026-11-08', punkte: [
    '<b>Neuer Bereich „Lager“:</b> Produkte, Verbrauchsmaterial sowie Geräte & Inventar an einem Ort, mit Reiter „Alle“ und Suche. Artikel bekommen auf Wunsch einen Verkaufspreis und einen Steuersatz und lassen sich direkt verkaufen.',
    '<b>Neuer Bereich „Finanzen“:</b> Kassenbuch, Rechnungen sowie Abnehmer & Lieferanten zusammen, mit „Neue Rechnung“ für Honig, Produkte und Lager.',
    '<b>Verkauf und Rechnung verbunden:</b> Nach jedem Verkauf „Rechnung dazu erstellen“ – ohne doppelte Buchung, und auch später noch über den Knopf am Verkauf. Gibt es zum Verkauf schon eine Rechnung, fragt die App beim Zurücknehmen einmal: Rechnung stornieren und Verkauf zurücknehmen?',
    '<b>Ganzer Stand pro Volk:</b> Bei Behandlung und Ernte am ganzen Stand gibst du die Menge je Volk ein; alle Völker sind vorausgewählt, einzelne abwählbar oder mit eigener Menge (z. B. Ableger halbe Dosis). Jedes Volk bekommt seinen Eintrag.',
    '<b>Leistung pro Volk:</b> Statistik → Honig zeigt eine Rangliste je Volk mit Jahr, Schnitt und „Exportieren“; auf der Seite jedes Volks steht „Honig pro Jahr“ mit Platz.',
    '<b>Kleinigkeiten:</b> Kacheln im Menü verschieben rollt jetzt mit; Export vom Stand oder Volk zeigt nur passende Bereiche.',
    '<b>Zurück im Browser:</b> In der Web-Version schließt die Zurück-Taste (oder Zurück-Wischen) jetzt zuerst das offene Fenster, den Aufkleber-Scanner oder die Hilfe-Tour – die Seite dahinter bleibt stehen. Vorher blieb das Fenster offen, und die Seite dahinter ging zurück.',
    '<b>Viele Daten:</b> Mit 50 Ständen, 325 Völkern und 225 Lager-Positionen geprüft. Neu: Suche beim Verkaufen im Lager und bei Lager-Positionen der Rechnung (die angetippte Position ist gleich gewählt), Suche und Jahr in der Rechnungsliste, „Alle“/„Keine“ und Zähler bei der Ernte am ganzen Stand. Nummern sortieren richtig (Nr. 2 vor Nr. 16), große Beträge passen in ihre Kachel.',
    '<b>Behoben:</b> Ein Stand aus dem Papierkorb bringt seine Völker mit; Rechnungspositionen behalten ihren Steuersatz, auch wenn die Besteuerung später auf „Regel“ wechselt; Ø Alter der Königinnen für frühere Jahre; Zähler bei der Behandlung am Stand; Bestandsbuch-PDF ohne getrennte Spaltenköpfe; Export vom Stand zeigt nur dessen Völker; Unterlagen ohne Jahr in der Zukunft; lange Mittel-Namen in der Statistik.',
  ] },
  { version: '3.24', datum: '2026-11-05', punkte: [
    '<b>Große Fehlerprüfung:</b> Alle Rechnungen mit Honigmengen und alle übrigen Bereiche wurden durchgesehen, jeder Fund unabhängig gegengeprüft und behoben.',
    '<b>Stornieren tut nie mehr „nichts“:</b> Klappt etwas nicht, sagt die App jetzt immer, warum und was zu tun ist. Liegt die Abfüllung eines Verkaufs im Papierkorb, kommt eine klare Meldung; ist sie endgültig gelöscht, lässt sich der Verkauf trotzdem stornieren.',
    '<b>Kein doppelt gezählter Honig:</b> Eine Abfüllung, aus der schon verkauft wurde, lässt sich nicht mehr löschen. Wiederherstellen aus dem Papierkorb prüft, ob der Honig der Charge noch reicht. Ändert sich eine Ernte, passt sich die Charge an.',
    '<b>Charge mit Abfüllungen löschen:</b> geht weiter, aber eine zweite Rückfrage erklärt die Folgen und empfiehlt, die Charge zu behalten.',
    '<b>Berichte stimmen:</b> Jahresbericht und Statistik zählen Rechnungen und Rabatte mit, Wabenhonig zählt als Honig, Pollen und Propolis nicht. Vorjahresvergleich bis zum selben Tag, Ernten beim Stand, an dem geerntet wurde.',
    '<b>Material und Pfand:</b> Bestände stimmen jetzt auch beim Ändern, Löschen und Wiederherstellen; Deckel und Etiketten werden nicht mehr verwechselt; das Kassenbuch bucht den bezahlten Packungspreis.',
    '<b>Behandlungen und Bestandsbuch:</b> Bearbeiten bucht nur den Unterschied, die Wartezeit-Erinnerung zieht mit. Wird ein Stand gelöscht, steht in Bestandsbuch, Wanderbuch und allen Listen weiter sein Name mit dem Zusatz „(gelöscht)“.',
    '<b>Rechnungen:</b> Eine ausgestellte Rechnung behält Kunde und Absender, auch wenn sich der Kontakt später ändert. Ihre Kassenbuch-Buchung lässt sich nicht mehr einzeln löschen – dafür gibt es das Storno.',
    '<b>Wanderungen und Sicherung:</b> Eine alte Wanderung zu bearbeiten verschiebt kein Volk mehr. Die automatische Sicherung meldet, wenn kein Ordner gewählt ist.',
  ] },
  { version: '3.23', datum: '2026-11-04', punkte: [
    '<b>Langsamer Start:</b> Dauert das Laden länger, bleibt der Startbildschirm stehen und die Waben drehen weiter. Nach 8 Sekunden steht dort „Einen Moment noch – deine Daten werden geladen …“.',
  ] },
  { version: '3.22', datum: '2026-11-03', punkte: [
    '<b>Ein Logo für alles:</b> Kopfzeile, Willkommen-Fenster, Einführung, Rechtsseiten und alle PDFs zeigen jetzt dieselben 3D-Waben wie das App-Symbol. Ein eigenes Logo aus den Einstellungen bleibt in den PDFs wie bisher.',
  ] },
  { version: '3.21', datum: '2026-11-03', punkte: [
    '<b>Neuer Start:</b> Beim Öffnen drehen sich die drei Waben aus dem Logo in 3D.',
    '<b>Neues App-Symbol:</b> die drei Waben aus dem Logo, ebenfalls in 3D.',
  ] },
  { version: '3.20', datum: '2026-11-02', punkte: [
    '<b>Neues Handy:</b> Im Willkommen-Fenster lässt sich gleich eine Sicherung einspielen.',
    '<b>Foto aus der Galerie:</b> Neben „+ Foto“ gibt es die Kachel „Aus Galerie“.',
    '<b>Durchsicht am Stand:</b> Angefangene Antworten und Sprachnotizen bleiben erhalten, auch wenn die App geschlossen wird. Beim nächsten Start kannst du weitermachen oder sie verwerfen. Liegt der Beginn an einem anderen Tag, fragt die App, ob du neu beginnen willst.',
    '<b>Android:</b> Ist die Kamera verboten, sagt die App, wo man sie erlaubt.',
  ] },
  { version: '3.19', datum: '2026-11-02', punkte: [
    '<b>Klare Meldungen:</b> Wenn nach einem Tipp etwas schiefgeht, sagt die App das jetzt, auch beim Speichern von Dokumenten und Sprachnotizen, beim Öffnen von Dateien und beim Erstellen von PDFs. Eine leere Aufnahme wird nicht mehr als gespeichert gemeldet.',
    '<b>Sicherung einspielen:</b> Eine unvollständige Datei wird verständlich gemeldet. Geht danach ein Aufräum-Schritt schief, kommt die Meldung trotzdem und die Seite wird neu gezeichnet.',
    '<b>Erinnerungen:</b> Beim Neu-Planen bleiben die alten Mitteilungen stehen, bis die neue Liste fertig berechnet ist. Kommt eine Sicherung mit eingeschalteten Erinnerungen auf ein neues Gerät, fragt die App nach der Erlaubnis.',
    '<b>Kauf:</b> Findet der Store einen bezahlten Kauf gerade nicht (zum Beispiel anderes Konto angemeldet), bleibt die Vollversion 7 Tage erhalten und die App sagt, was zu prüfen ist. Auf Android wird ein später bezahlter Kauf beim Zurückkehren erkannt.',
    '<b>Durchsicht am Stand:</b> Das Kauf-Fenster kommt schon beim Start, falls am Ende nicht gespeichert werden könnte, nicht erst nach allen Antworten.',
    '<b>Sprachnotiz ohne Netz:</b> Die Anzeige sagt, dass die Aufnahme läuft und es gerade keinen Live-Text gibt.',
    '<b>CSV-Dateien:</b> Umlaute aus Dateien von Handy-Apps kommen beim Übernehmen richtig an.',
    '<b>Standort:</b> Die Meldungen nennen den richtigen Grund. Ist die Angabe nur ungefähr, sagt die App das, statt sie als genau zu übernehmen.',
    '<b>Kauf-Fenster:</b> Es geht auch ohne Netz schnell auf. Ein eingelöster Code schaltet frei und schließt das Fenster von selbst.',
    '<b>Sprachnotiz:</b> Das Display bleibt während der Aufnahme an. Sperrt das Telefon doch, endet die Aufnahme sauber, und die App sagt es beim Zurückkommen. Scheitert das Speichern, kannst du es wiederholen.',
    '<b>Speicher:</b> Auf Android bleiben Kamerafotos nicht mehr zusätzlich in voller Größe liegen.',
  ] },
  { version: '3.18', datum: '2026-11-02', punkte: [
    '<b>Sicherung auf Android:</b> Android meldet nicht zuverlässig, ob das Speichern geklappt hat. Die App fragt deshalb nach, bevor sie die Sicherung als erledigt zählt, und die Datei bleibt liegen, bis das Hochladen Zeit hatte.',
    '<b>Sicherung einspielen auf Android:</b> Jede Datei lässt sich auswählen, die App prüft den Inhalt selbst.',
    '<b>Excel einlesen:</b> Datumsspalten kommen richtig an, ein unmögliches Datum wird nicht mehr übernommen.',
    '<b>PDF und Excel teilen:</b> Zweimal hintereinander teilen löscht die Datei nicht mehr, während das Menü offen ist.',
    '<b>Kauf:</b> Die App holt fehlende Kaufbestätigungen bei Google nach, verhindert doppeltes Kaufen, nennt ausstehende Zahlungen richtig und sagt nicht mehr „kein Kauf gefunden“, wenn nur das Netz fehlte.',
    '<b>Sprachnotiz:</b> Verlässt du beim Aufnehmen die Seite, wird die Aufnahme gespeichert.',
    '<b>Android:</b> Die Zurück-Taste schließt den Einrichtungs-Assistenten nicht mehr, und „+ Foto“ öffnet die Kamera zuverlässig.',
  ] },
  { version: '3.17', datum: '2026-11-02', punkte: [
    '<b>Tastatur auf allen Seiten:</b> Suchen, Rechner, Notizen, Rechnungen, Einstellungen und der Chat mit Imme machen ihr Platz. Treffer und Ergebnisse stehen darüber, die untere Leiste ist solange ausgeblendet, Meldungen erscheinen oben.',
    'Auch der Einrichtungs-Assistent zeigt „Weiter“ über der Tastatur, und Imme setzt ihre Sprechblase darüber.',
  ] },
  { version: '3.16', datum: '2026-11-02', punkte: [
    '<b>iPhone:</b> Bei offener Tastatur steht „Speichern“ jetzt direkt darüber. Das Fenster macht Platz, das Feld, in dem du tippst, bleibt sichtbar.',
  ] },
  { version: '3.15', datum: '2026-11-02', punkte: [
    '<b>Sicherung senden im Browser:</b> Chrome und ähnliche Browser lehnten das Teilen immer ab, die App meldete nur „Teilen abgebrochen“. Die Sicherung lässt sich jetzt teilen. Sie heißt dabei „….json.txt“ und lässt sich genauso wieder einspielen.',
    'Dauert das Vorbereiten länger, fragt die App noch einmal nach: „Jetzt teilen“ oder „Herunterladen“. Du kommst immer an deine Datei.',
    '<b>Speicher voll:</b> Auch Fotos und einzelne Seiten melden das nun verständlich statt mit englischem Fehlertext.',
  ] },
  { version: '3.14', datum: '2026-11-02', punkte: [
    '<b>Bio-Unterlagen:</b> Das PDF behauptete immer, die Flächenanteile kämen vom GeoBox-Viewer, auch wenn eine andere Quelle geantwortet hatte. Jetzt verweist es auf die Quelle, die je Stand eingetragen ist.',
    '<b>Quellen:</b> Das Landbedeckungsmodell des Bundesamtes für Kartographie und Geodäsie ist nun mit Lizenz genannt.',
    '<b>Varroa:</b> Imme erklärt kurz, warum Imker in Bayern den Befall laut Landesamt nicht melden müssen.',
  ] },
  { version: '3.13', datum: '2026-11-01', punkte: [
    '<b>Start:</b> Startet die App einmal nicht, erscheint eine Hilfeseite mit „Neu versuchen“ und, wenn möglich, „Sicherung speichern“. Einzelne Fehler beim Start halten die App nicht mehr an.',
    '<b>Sicherung:</b> Sie kommt mit deutlich mehr Fotos zurecht und meldet klar, wenn etwas schiefgeht. Die Datei bleibt liegen, bis das Hochladen in die Cloud Zeit hatte.',
    '<b>Speicher voll:</b> Die App sagt das nun verständlich, auch wenn keine Zwischenstände mehr entstehen.',
    '<b>Varroa:</b> Imme nennt die jährliche Behandlungspflicht und die Ausnahme von der Meldepflicht in Bayern. Die Ampel sagt bei wenig Milben „gering“ statt „unkritisch“.',
    '<b>Honig-Etikett:</b> Das Ursprungsland richtet sich nach dem Land deiner Imkerei.',
    '<b>Quellen:</b> Wetterdienst, Geodaten und Blühdaten sind mit Lizenz genannt.',
  ] },
  { version: '3.12', datum: '2026-11-01', punkte: [
    '<b>Bestandsbuch:</b> Eine leere Wartezeit bleibt „nicht erfasst“. Bisher wurde daraus „0 Tage“. Nur eine eingetragene 0 heißt „keine Wartezeit“.',
    '<b>Adresssuche und Bio-Umgebungsprüfung:</b> Die App fragt vor dem ersten Senden und nennt, wohin die Daten gehen. Ändern kannst du das unter Einstellungen → Funktionen.',
    '<b>Meine Mittel und Mengenrechner:</b> Beim Zusammenführen einer Sicherung gehen keine Mittel mehr verloren. Der Rechner rundet sauber und verlangt bei „Anzahl Völker“ eine ganze Zahl.',
    '<b>Sicherung:</b> Fotos im Papierkorb bleiben in der Sicherung erhalten. Ein Eintrag ohne Datei aus einer älteren Sicherung stoppt sie nicht mehr.',
    '<b>Bio:</b> Die Warnung zur Wartezeit prüft alle Behandlungen vor der Ernte, und das Etikett erkennt mehr Schreibweisen der Herkunft. Mengen werden genau angezeigt.',
    '<b>Kleinere Korrekturen:</b> Holst du das Foto einer Beilage aus dem Papierkorb, kommt das entfernte Mittel mit zurück. Das Kauf-Fenster nennt vor dem Teststart, was danach wegfällt. Neue Koordinaten holen das Wetter gleich neu. Das Bio-Etikett erkennt auch „60 Deutschland, 40 Österreich“.',
  ] },
  { version: '3.11', datum: '2026-11-01', punkte: [
    '<b>Meine Mittel:</b> Lege deine Mittel einmal mit den Werten aus der Packungsbeilage an, auf Wunsch mit Foto der Beilage. Danach rechnet der Mengenrechner mit einem Tipp, und „Als Behandlung eintragen“ füllt das Bestandsbuch vor.',
  ] },
  { version: '3.10', datum: '2026-11-01', punkte: [
    '<b>Honig-Etikett:</b> Länder mit Anteil erkennt die App jetzt auch als „60,5 %“ oder „Deutschland: 60 %“. Bei „Abbrechen“ bleibt das Formular offen.',
    '<b>Mengenrechner:</b> Rechnet nur noch mit einer einzelnen Zahl, ohne Einheit und ohne Bereich.',
    '<b>Wetter:</b> Die Kachel zeigt neue Werte sofort. Korrigierst du Koordinaten, versucht es die App gleich wieder.',
    '<b>Einlesen aus anderer App:</b> Fehlt die Wartezeit, steht im Bestandsbuch nicht mehr „0 Tage“, sondern dass sie nicht erfasst ist.',
  ] },
  { version: '3.09', datum: '2026-10-30', punkte: [
    '<b>Wetter:</b> Die Startseite ruft nur noch ab, wenn „Wetter von selbst abrufen“ an ist. Klappt ein Abruf nicht, versucht es die App erst nach 30 Minuten wieder.',
    '<b>Imme:</b> Antworten zu Datenschutz, Schwarm, Steuer, Nachbarrecht und Pfand sind richtiggestellt. Bei der Behandlung zeigt die Führung jetzt das Feld Wartezeit.',
    '<b>Honig-Etikett:</b> Mehrere Ursprungsländer mit Prozentangabe erkennt die App jetzt richtig. Passt die Angabe nicht aufs Etikett, fragt sie vorher.',
    '<b>Mengenrechner:</b> Steht in der Beilage ein Bereich wie 7–8, bittet die App um einen einzelnen Wert.',
    'Links auf den Rechtsseiten öffnen sich jetzt auch in der App richtig.',
  ] },
  { version: '3.08', datum: '2026-10-30', punkte: [
    '<b>Wetter ist ab Werk aus.</b> Die App fragt dich einmal, wenn du zum ersten Mal Koordinaten an einem Stand speicherst. Ein- und ausschalten kannst du es jederzeit unter Einstellungen → Funktionen. Die Koordinaten gehen nur noch gerundet an den Wetterdienst.',
    '<b>Mengenrechner statt fester Mengen:</b> Du trägst den Wert aus deiner Packungsbeilage ein, die App rechnet ihn auf deine Völker hoch. Die Rechner zum Selbstmischen sind vorerst entfallen.',
    '<b>Bestandsbuch:</b> Neue freiwillige Felder für Lieferant, Behandlung bis, behandelnde Person, Tierarzt und Kaufbeleg, auch im PDF. Alte Einträge bleiben, wie sie sind.',
    '<b>Hinweise:</b> Klarere Hinweise bei Kassenbuch, Fahrten, Etikett, Ämter-Unterlagen und bei Imme. Vor dem Kauf steht jetzt deutlich, dass die Nutzungsbedingungen gelten.',
    '<b>Quellen und Lizenzen:</b> Unter Einstellungen → Rechtliches gibt es die Liste der mitgelieferten Bestandteile. Bei Adresssuche und Landbedeckung stehen die Quellen dabei.',
    'Text aus Fotos und eingescannten PDFs liest die App nicht. Einlesen geht mit PDFs, die echten Text enthalten.',
  ] },
  { version: '3.07', datum: '2026-10-30', punkte: [
    '<b>Sammel-Varroazählung:</b> Bei Auswaschen und Puderzucker fragt die App jetzt nach den Bienen in der Probe. Vorher zählte die rohe Milbenzahl als Wert je 100 Bienen, die Ampel warnte dadurch zu streng.',
    '<b>Varroa-Kurve:</b> Sie zeigt nur noch Zählungen mit derselben Messart. Andere Methoden stehen weiter in der Tabelle.',
    '<b>Light-Version:</b> Imker-Rechner, Honig-Etikett, Stornos, das Wiederherstellen von Vollversions-Einträgen aus dem Papierkorb und einige Ein-Tipp-Wege in Bio und Hygiene gehören zur Vollversion und öffnen jetzt das Kauf-Fenster. Was schon eingetragen ist, bleibt sichtbar und lässt sich ausdrucken.',
    'Behoben: In Light ließ sich ein Volk auf manchen Reitern nicht bearbeiten, und bei mehr als 2 Völkern ließen sich die Imkereidaten nicht speichern.',
    'Behoben: Der Komplettausdruck bot „Zucht“ an, obwohl es den Bereich noch nicht gibt. Aufgaben zu niedrigem Bestand tragen jetzt das Schild „Bestand“ statt „MHD“.',
  ] },
  { version: '3.06', datum: '2026-10-30', punkte: [
    '<b>Honig-Etiketten</b> gibt es jetzt unter Unterlagen ▸ Honig & Verkauf: Abfüllung wählen, ausfüllen, PDF erzeugen. Imme erklärt dir den Weg, wenn du sie nach dem Etikett fragst.',
    'Der <b>QR-Code bei der Charge</b> und auf dem Honig-Etikett ist entfallen. Der QR-Aufkleber fürs Volk bleibt unverändert.',
  ] },
  { version: '3.05', datum: '2026-10-30', punkte: [
    '<b>Tipp-Kachel:</b> Bei hohem Varroa-Befall oder fehlender Auffütterung zeigt die Kachel „Saisonaler Tipp“ jetzt zuerst die Warnung. Sonst kommt wie bisher der Tipp zum Monat.',
    '<b>Light-Version:</b> Marktverkauf und Wetter von Hand eintragen gehören zur Vollversion. Sie ließen sich bisher trotzdem nutzen. Jetzt erscheint auch dort das Kauf-Fenster. Was schon eingetragen ist, bleibt sichtbar.',
  ] },
  { version: '3.04', datum: '2026-10-30', punkte: [
    '<b>Aufkleber scannen:</b> Auf der Startseite und bei den Völkern gibt es den neuen Knopf „Aufkleber scannen“. Halte die Kamera auf den QR-Aufkleber an der Beute, und die Durchsicht am Stand für dieses Volk öffnet sich von selbst. Das geht auch ganz ohne Internet.',
  ] },
  { version: '3.03', datum: '2026-10-30', punkte: [
    'Vorbereitung für die QR-Aufkleber am Volk: Sie tragen in der App jetzt eine feste Adresse.',
  ] },
  { version: '3.02', datum: '2026-10-30', punkte: [
    '<b>Light-Version:</b> Fütterung, Trachten, Behandlungen und Ernten gehören zur Vollversion. Über die Sammel-Erfassung in der Völkerliste, die Stand-Seite und die Übernahme aus einem PDF ließen sie sich bisher trotzdem speichern. Jetzt erscheint auch dort der Hinweis auf die Vollversion. Ansehen und PDF-Lesen bleiben frei, an der Vollversion ändert sich nichts.',
  ] },
  { version: '3.01', datum: '2026-10-27', punkte: [
    '<b>„Anpassen“ verständlicher:</b> Bei „Zeit buchen“ und „Häufige Fahrten“ ist jetzt angehakt, was gerade in der Liste steht. Abhaken blendet aus, anhaken holt dazu, ohne etwas zu verdrängen – vorher ersetzte eine neue Auswahl die ganze Liste, und alles andere verschwand. Nach dem Speichern steht genau das Angehakte in der Liste; es rückt nichts ungefragt nach. Im nächsten Monat kommen dessen Vorschläge wieder von selbst. „Zurücksetzen“ macht die Liste wieder automatisch.',
    '<b>Vorschläge gekennzeichnet:</b> Typische Arbeiten des Monats, die du nie eingetragen hast, tragen in „Zeit buchen“ das Schild „Vorschlag“. In „Neue Aufgabe“ stehen sie in einer eigenen Zeile „Vorschläge für …“, getrennt von dem, was du oft machst.',
    '<b>Eigene Schnellzugriffe und eigene Fahrten</b> erscheinen immer von selbst in der Liste und verdrängen nichts. Schnellzugriffe mit Zusatz im Namen, z. B. „Fütterung: Stand Wald“ und „Fütterung: Stand Berg“, bleiben auch nach dem Buchen eigene Zeilen.',
  ] },
  { version: '3.00', datum: '2026-10-26', punkte: [
    '<b>Honig: Verlust und Eigenverbrauch buchen.</b> Zerbrochene, verschenkte oder selbst gegessene Gläser und den Rest im Eimer buchst du jetzt wie beim Inventar unter „Eigenverbrauch / Verlust“ – im Kassenbuch über „An- und Verkauf buchen“ oder im Reiter „Bestand“ mit „Verlust“. Gründe: Abfüllverlust, Bruch, Eigenverbrauch, Verschenkt, An Bienen verfüttert, Verdorben.',
    '<b>Verlust beim Abfüllen:</b> Im Formular „Abfüllen“ siehst du, was danach noch in der Charge bleibt, und buchst den Rest mit einem Tipp als Verlust. Die Charge ist dann wirklich leer und erinnert nicht mehr ans Haltbarkeitsdatum.',
    '<b>Alles bleibt nachvollziehbar:</b> Charge, Bestand, Abfüllungen, Chargenübersicht-PDF und Excel zeigen die Verluste; im Kassenbuch steht je Abgang eine Zeile mit 0,00 €. Zerbrochene Gläser zählen nicht mehr als „verkauft“ und nicht als Pfandglas beim Kunden.',
    '<b>Genauer:</b> Gebuchte Verluste und lose abgegebener Honig können nicht mehr ein zweites Mal abgefüllt werden; bei der Lohnverarbeitung lässt sich nicht mehr Honig abgeben, als im Eimer ist. Ältere Abfüllungen bleiben trotzdem immer änderbar (MHD, Bestand, Losnummer). Eine Abfüllung mit gebuchten Verlusten löschst du erst, nachdem du die Verluste gelöscht hast.',
  ] },
  { version: '2.99', datum: '2026-10-26', punkte: [
    '<b>Zeit buchen mit einem Tipp:</b> Arbeiten, die du oft machst, stehen auf der Startseite in „Zeit buchen“ – und genauso in der Zeiterfassung unter „Häufige Arbeiten“. „+ Zeit“ antippen: Deine übliche Dauer ist schon gewählt, „Zeit buchen“ trägt sie für heute ein (mit „Rückgängig“). Hast du noch wenig erfasst, schlägt die App typische Arbeiten des Monats vor. Über „Anpassen“ wählst du selbst aus und legst eigene Schnellzugriffe an.',
    '<b>Neue Aufgabe – „Häufig“:</b> Oben stehen dieselben Arbeiten. Ein Tipp füllt Aufgabe, Tätigkeitsbereich und Arbeitsschritte aus – du wählst nur noch das Datum.',
    '<b>Anstehende Aufgaben auf der Startseite:</b> direkt abhaken (die App fragt dann nach der Dauer und trägt deine übliche Zeit schon ein), mit Volk und Stand darunter und „+ Neue Aufgabe“.',
    '<b>Häufige Fahrten überall gleich:</b> Startseite und Fahrtenbuch zeigen dieselbe Liste – deine häufigsten Stände und eigenen Fahrten, mit „Fahrt buchen“ und „Anpassen“.',
    '<b>Zeit nachtragen:</b> „Was hast du gemacht?“ bietet typische und eigene Arbeiten zur Auswahl an; bei bekannten Arbeiten steht die übliche Dauer schon da.',
    '<b>Light-Version:</b> Aufgaben abhaken gehört jetzt zur Vollversion – wie neue Aufgaben, Zeit buchen und Fahrt buchen. Ein Tipp aufs Kästchen öffnet das Kauf-Fenster.',
    '<b>Zuverlässiger:</b> Ein Doppeltipp auf „Fahrt buchen“ oder eine Reinigungs-Kurzwahl bucht nicht mehr doppelt; nach jeder Ein-Tipp-Fahrt gibt es „Rückgängig“. In der Light-Version buchten „Fahrt buchen“ und die Reinigungs-Kurzwahlen trotz Vollversions-Sperre – behoben.',
    '<b>Behoben: „Rückgängig“ ließ sich nicht antippen.</b> Der Tipp landete auf dem Knopf darunter (z. B. ein zweites „Fahrt buchen“). Das betraf auch die Reinigungen. Jetzt reagiert „Rückgängig“ zuverlässig.',
    '<b>Fahrtenbuch:</b> Hattest du für die Startseite eigene Fahrten ausgewählt, stehen deine eigenen Fahrten jetzt mit in dieser Auswahl – so siehst du sie weiter im Fahrtenbuch. Neue eigene Fahrten kommen automatisch dazu.',
  ] },
  { version: '2.98', datum: '2026-10-25', punkte: [
    '<b>Aufgaben: Der Tätigkeitsbereich rät vorsichtiger.</b> Namen und Alltagswörter („Frau Müller anrufen“, „Messe besuchen“) lösen keinen Vorschlag mehr aus – vorher landete so etwas bei Behandlung oder Ernte. Wörter, die bei dir ein Kontakt, ein Volk oder ein Stand heißt, zählen nicht mit. Lieber kein Vorschlag als ein falscher.',
    '<b>Arbeitsschritte:</b> „Futter prüfen“ wird Futterkontrolle, „Futter geben“ oder „nachfüllen“ wird Füttern (nicht mehr „Futter ansetzen“). Neuer Schritt „Völker vereinigen“; „Reinigungsflug“ zählt zur Durchsicht. Ohne gewählten Bereich wird kein Schritt vorab angehakt.',
    '<b>Verkauf:</b> Ist oben „ohne Datum“ gewählt, druckt „Liste (PDF)“ jetzt genau diese Verkäufe.',
  ] },
  { version: '2.97', datum: '2026-10-25', punkte: [
    '<b>Anzeige nach § 1a ohne „eingewintert“:</b> Das Blatt fürs Veterinäramt nennt jetzt nur noch, was § 1a verlangt – Zahl und Standort der Völker. Die Zeile „Eingewintert … am 1. Oktober“ hatte einen Tester und sein Amt verwirrt: Sie war keine Vorgabe eines Amtes, sondern eine Festlegung der App. Eingewinterte Völker stehen weiter auf dem Blatt für die Tierseuchenkasse, wo Thüringen und Sachsen-Anhalt sie abfragen.',
    '<b>Kleiner Schönheitsfehler:</b> In Statistiken → Honig passten die fünf Knöpfe „Volk · Stand · Sorte · Tracht · Jahr“ auf dem kleinsten iPhone nicht ganz in die Zeile.',
  ] },
  { version: '2.96', datum: '2026-10-24', punkte: [
    '<b>Typische Aufgaben zur Auswahl:</b> Bei „Neue Aufgabe“ kannst du jetzt aus fast 90 typischen Aufgaben übers Bienenjahr wählen – von Futterkontrolle über Ameisensäure-Behandlung bis Völkerbestand melden. Deine eigenen Aufgaben von früher stehen mit drin. Frei eintippen geht weiterhin.',
    '<b>Tätigkeitsbereich füllt sich selbst:</b> Unten im Abschnitt „Für die Zeiterfassung“ steht jetzt „Tätigkeitsbereich“ statt „Tätigkeit“ – und er passt sich der Aufgabe an (Futterkontrolle → Fütterung). Wählst du selbst etwas anderes, bleibt deine Wahl. Auch „Zeit nachtragen“ und die Dauer-Abfrage beim Abhaken schlagen den Bereich so vor.',
  ] },
  { version: '2.95', datum: '2026-10-23', punkte: [
    '<b>Bestand viel kürzer:</b> Unter Ernte und Abfüllung → „Bestand“ steht jetzt <b>eine Zeile je Charge</b> – Losnummer, Sorte, Gebinde im Regal und was noch im Eimer ist. Antippen klappt die Gebinde mit „Verkauf“ und „Jetzt abfüllen“ auf. Ausverkaufte Chargen liegen zugeklappt ganz unten.',
    '<b>Nach Sorte und Gebinde:</b> Oben im Bestand zeigt eine aufklappbare Übersicht auf einen Blick, wie viele Gläser je Sorte und Größe da sind (z. B. „Raps · 500 g · 15“). Dazu lässt sich die Liste nach Nummer, Gebinden oder Rest im Eimer sortieren.',
  ] },
  { version: '2.94', datum: '2026-10-23', punkte: [
    '<b>Jahr und Sortierung wie bei „Charge“:</b> Ernte, Sorte, Abfüllung und Verkauf haben oben jetzt „Jahr: Alle · 2026 · 2025 …“ und eine Sortierung (z. B. Ernte nach Menge oder Sorte, Verkauf nach Betrag oder Abnehmer). Die Summe oben zeigt das gewählte Jahr, und „Liste (PDF)“ bei Verkauf druckt genau dieses Jahr.',
    '<b>Jahr im Volk:</b> Stockkarte, Fütterung, Varroa und Gewicht lassen sich auf ein Jahr eingrenzen – die Wahl bleibt beim Wechsel zum nächsten Volk. Geht eine Kurve über mehrere Jahre, steht die Jahreszahl jetzt mit dran (z. B. „12.05.25“).',
    '<b>Sortierung bei Material:</b> Verbrauchsmaterial, Inventar und Weitere Produkte lassen sich nach Name, Wert, „Knapp zuerst“, Mindesthaltbarkeit oder „Neueste“ ordnen.',
  ] },
  { version: '2.93', datum: '2026-10-23', punkte: [
    '<b>Web-Version nur für Tester:</b> Wer die Web-App in einem Browser zum ersten Mal öffnet, braucht jetzt einen Tester-Code. Wer sie schon eingerichtet hat, merkt davon nichts – deine Daten bleiben, wie sie sind. Die Apps für iPhone und Android sind nicht betroffen.',
  ] },
  { version: '2.92', datum: '2026-10-23', punkte: [
    '<b>Stammbaum mit beiden Seiten:</b> Im Reiter „Stammbaum“ einer Königin gibt es jetzt die „Ahnentafel (beide Seiten)“ – auch die Vorfahren des Vatervolks (4a) erscheinen, bis zu vier Generationen, am Handy seitlich wischbar. Kommt dieselbe Ahnin mehrfach vor (z. B. auf Mutter- und Vaterseite), weist ein Hinweis darauf hin und sie ist farbig markiert.',
    '<b>Klarere Felder bei der Königin:</b> „Woher stammt die Königin?“ (eigene Nachzucht, Zukauf, Schwarm, Nachschaffung) und „Anpaarung“ (Standbegattung, Belegstelle, Besamung) – „Belegstelle“ steht nicht mehr in zwei Feldern. Das Vatervolk (4a) kannst du jetzt auch bei einer Belegstelle angeben.',
    '<b>Pedigree-Zeile:</b> ImkerBuch schreibt sie jetzt in der Schreibweise des Kehrle-Registers (z. B. „B110(JK) = .26 - B112(JK) ins B312(KK)“) und liest auch Zeilen aus dem Register, von Züchtern und ältere eigene Einträge vollständig – mit Jahren, Belegstellen und Besamung. Steht eine Kennung aus der Zeile auch als Königin in ImkerBuch, wird sie verknüpft.',
    '<b>Stockkarte (PDF):</b> mit Abstammung beider Seiten über drei Generationen und dem Hinweis auf gemeinsame Vorfahren.',
    '<b>Königinnen importieren:</b> Excel/CSV übernimmt jetzt auch Kennung, Generation, Status, Mutter, Anpaarung, Vaterseite, Belegstelle und Pedigree und verknüpft sie automatisch. Eine Königin mit gleicher Kennung wird nicht doppelt angelegt.',
  ] },
  { version: '2.91', datum: '2026-10-23', punkte: [
    '<b>Anmeldung beim Veterinäramt (§ 1a):</b> Unter Unterlagen ▸ Ämter & Pflicht gibt es die „Anzeige nach § 1a“ – mit Tierhalter, Kästchen für Beginn, Änderung oder Aufgabe und je Stand Lage und Koordinaten. Beim Stand trägst du dafür Anschrift, Gemarkung und Flurnummer ein; fehlt eine brauchbare Lage, sagt das PDF Bescheid.',
    '<b>Tierseuchenkasse je Bundesland:</b> Wähle in den Imkereidaten dein Bundesland – dann stimmen Stichtag, Frist und was gemeldet wird (z. B. Thüringen: eingewinterte Völker, Bayern: keine Meldung). Die Völker stehen in der Tabelle an dem Stand, an dem sie am Stichtag waren.',
    '<b>Wanderschild:</b> Beim Stand gibt es das Schild nach § 5a mit Name, Anschrift und Völkerzahl zum Ausdrucken.',
    '<b>Österreich und Schweiz:</b> Als Land wählbar. Dann druckt ImkerBuch die Registrierung fürs VIS bzw. für den Kanton, die Völkermeldung zum 30. April und 31. Oktober (Österreich) bzw. die Zahlen für die Bestandeskontrolle (Schweiz) und ein Standschild mit VIS- bzw. Standnummer.',
    '<b>Stand-Wechsel in der Historie:</b> Wechselt ein Volk im Formular den Stand oder wird sein Stand gelöscht, steht das mit Datum in seiner Historie.',
    'Lerntexte zu Anmeldung, Tierseuchenkasse, Varroa-Meldepflicht (seit März 2026) und Gesundheitszeugnis korrigiert und ergänzt.',
    'Import aus Excel/CSV: Spalten werden besser vorgeschlagen – keine Spalte doppelt, „Gemarkung“ greift nicht mehr nach „Name“.',
    'Behoben: Beim Speichern eines Volks stand manchmal fälschlich „Königin geändert“ in der Historie; ein aufgelöstes Volk zählte nach dem Bearbeiten wieder mit.',
  ] },
  { version: '2.90', datum: '2026-10-23', punkte: [
    '<b>Öko-Unterlagen: Landbedeckung übersichtlicher:</b> Je Stand eine kompakte Tabelle, größte Fläche zuerst, Anteile einheitlich mit einer Stelle („20,0 %“), Flächen mit 0 % weggelassen. Die Summenzeilen (Tracht, Bebauung, Sonstiges, Summe) sind fett hinterlegt und ergeben zusammen genau die Summe. Eine Stand-Tabelle reißt nicht mehr über die Seitengrenze.',
    '<b>Hygieneplan:</b> Der Hinweis auf ältere Einträge im Archiv steht jetzt oben unter der Überschrift – vorher stand er manchmal allein auf einer letzten Seite.',
  ] },
  { version: '2.89', datum: '2026-10-22', punkte: [
    '<b>Völker nach Funktion filtern:</b> Unter der Suche stehen jetzt Knöpfe wie „Wirtschaftsvolk“, „Ableger“ oder „Pflegevolk Königin“ – nur die Funktionen, die du wirklich hast, jeweils mit Anzahl. Sie wirken zusammen mit der Suche und dem Stand, z. B. alle Ableger mit „Anna“ im Namen. Die Sammel-Erfassung nimmt genau diese Auswahl.',
    '<b>Trachtkalender übersichtlich:</b> Blüht dieselbe Pflanze an mehreren Ständen, steht sie nur noch einmal da – mit der Zahl der Stände. Antippen klappt die einzelnen Stände mit ihren eigenen Blütezeiten auf. Auch die Startseiten-Kachel „Tracht“ nennt jede Pflanze nur noch einmal.',
    'Behoben: In Safari im privaten Fenster schlug das Merken des Zwischenstands fehl – und damit auch „Beispieldaten laden“.',
  ] },
  { version: '2.88', datum: '2026-10-21', punkte: [
    '<b>Suchen ohne Tastatur-Flackern:</b> Beim Tippen in die Suche bei Völkern, Abnehmern & Lieferanten, Verbrauchsmaterial/Produkten/Inventar und in der Imkerschule („Frag ein Thema“) ging die Tastatur nach jedem Buchstaben zu und wieder auf. Jetzt bleibt sie offen, nur die Treffer darunter wechseln.',
  ] },
  { version: '2.87', datum: '2026-10-21', punkte: [
    '<b>Rechnungen ohne „Erstellt mit ImkerBuch“:</b> Auf Rechnungen an deine Kunden steht unten nur noch die Seitenzahl. Der Hinweis nannte den Tag, an dem das PDF erstellt wurde – nicht das Rechnungsdatum – und konnte Kunden verwirren. Listen und Berichte für dich behalten ihn.',
  ] },
  { version: '2.86', datum: '2026-10-21', punkte: [
    '<b>PDFs auch bei großen Imkereien sauber:</b> Getestet mit 50 Ständen, 325 Völkern und rund 45.000 Einträgen – alle 57 PDFs. Spalten werden nicht mehr auf Buchstabenbreite gedrückt, Wörter nicht mehr mitten getrennt, sehr breite Tabellen (Königinnen) kommen in Teilen, Tabellenköpfe stehen nie allein unten auf einer Seite. Mehrere PDFs sind dadurch deutlich kürzer (Hygiene & Bio: 109 → 10 Seiten).',
    '<b>Honig-Etiketten:</b> Die unterste Etikettenreihe ragte über die Blattkante, und die Fußzeile stand darin. Jetzt liegen alle 10 Etiketten mittig mit Rand auf dem Blatt, ohne Fußzeile.',
    '<b>Kleinere Korrekturen in PDFs:</b> Beträge in Listen mit zwei Stellen („405,50“), Chargenübersicht fasst Ernten je Sorte zusammen, Anpaarung in der Zucht-Liste im Klartext, „Vorjahr 6 %“ statt „6 Prozentpunkte“, „Milben/Tag“ im Behandlungs-Report.',
    '<b>Schneller bei vielen Ständen:</b> Das Wetter beim Start liest die gespeicherten Werte nur einmal; Zwischenstände werden gepackt gespeichert (am iPhone gemessen: 13,1 MB → 2,2 MB).',
  ] },
  { version: '2.85', datum: '2026-10-21', punkte: [
    '<b>Zwischenstände statt „Snapshots“:</b> Nach jeder Änderung merkt sich die App deinen Stand – die letzten 10, ältere werden überschrieben. Unter Einstellungen → Sicherung & Datensicherheit steht der neueste, die älteren klappst du auf. „Zurückholen“ hilft, wenn du aus Versehen viel gelöscht oder eine falsche Sicherung eingespielt hast. Sie liegen nur auf diesem Gerät und ersetzen keine Sicherung.',
  ] },
  { version: '2.84', datum: '2026-10-21', punkte: [
    '<b>Erinnerung an die Sicherung per Mitteilung:</b> Ist deine letzte Sicherung 14 Tage her, meldet sich ImkerBuch um 19 Uhr – auch wenn die App geschlossen ist, danach wöchentlich. Antippen führt direkt zu „Sicherung speichern“ (iCloud Drive bzw. Google Drive). Ein- und ausschalten unter Einstellungen → Sicherung & Datensicherheit.',
  ] },
  { version: '2.83', datum: '2026-10-21', punkte: [
    '<b>Trachtkalender:</b> Trag ein, was an deinen Ständen blüht – die Blütezeit für genau deinen Stand rechnet die App aus Beobachtungen des Deutschen Wetterdienstes in der Nähe aus, auch ohne Internet. „Jedes Jahr“ wiederholt sie, oben zeigt ein Jahreskalender alle Trachten.',
    'Neue Startseiten-Kachel „Tracht“: was gerade blüht und was in den nächsten zwei Wochen kommt – mit „Als Aufgabe“ zum Vorbereiten. Am Stand steht „Was hier blüht“, und auf Wunsch erinnert dich eine Aufgabe rechtzeitig vor Blühbeginn.',
    'Ernte mit Tracht: Die App schlägt die passende Tracht vor, die Statistik zeigt den Ertrag je Tracht mit Ø je Volk und Vorjahr.',
    'Mehr Platz: Der Name des Bereichs steht nur noch oben in der Leiste („ImkerBuch › Völker“), darunter gleich Zahlen und Knöpfe.',
    'PDFs: Ein einziges Sonderzeichen wie ≤, →, ✓ oder ein Emoji machte bisher die ganze Zeile unleserlich – jetzt wird es lesbar ersetzt, Umlaute, € und „“ bleiben. Dateinamen lassen sich überall speichern (ä → ae usw.).',
  ] },
  { version: '2.82', datum: '2026-10-21', punkte: [
    '<b>Imme führt sicherer:</b> In „Kurz umschauen“ geht ein Tipp auf das gezeigte Ziel einfach zum nächsten Hinweis – keine Seite und kein Fenster springt mehr dazwischen (gefunden auf deinem iPhone). Landest du in einer Führung trotzdem auf einer anderen Seite, holt Imme dich zurück. Innere Knopf-Namen wie „#dash-cfg“ zeigt sie nie mehr; findet sie einen Schritt nicht, pausiert die Einführung und lässt sich bei Imme fortsetzen.',
    '„Weiter“ bei „Öffne den Reiter …“ öffnet den Reiter gleich mit. „Honig verkaufen“, „Honig abfüllen“ und „Hygieneplan und Reinigungen“ zeigen wieder auf die richtigen Felder. In der Marktkasse wartet Imme, bis du den Preis fürs erste Glas festgelegt hast, statt vorher „Geschafft!“ zu sagen.',
  ] },
  { version: '2.81', datum: '2026-10-20', punkte: [
    '<b>Statistiken mit Aussage:</b> Oben ein Jahr für alle Reiter. Jeder Bereich beginnt mit „Auf einen Blick“ – die wichtigsten Zahlen mit Vergleich zum Vorjahr (im laufenden Jahr bis zum selben Kalendertag) – und „Auffällig“ mit konkreten Hinweisen, die direkt zum Volk führen: z. B. stärkste und schwächste Völker, Ernten über 18 % Wassergehalt, Königinnen im dritten Jahr, Völker ohne Herbstfütterung, hoher Varroa-Befall, Völker ohne Behandlung oder Kontrolle, gestiegene Kosten.',
    'Neue Kennzahlen: Winterverluste, Ø Alter der Königinnen, Ø Ertrag je Volk, Honig je kg Zucker, Erlös je kg Honig, Kosten je Volk, größter Kostenblock, Arbeitsstunden je Volk, Honig je Arbeitsstunde.',
    'Neue Reiter „Gesundheit“ (Behandlungen und Varroa) und „Arbeit“ (Arbeitszeit je Tätigkeit, Fahrten). Die Statistik-PDFs enthalten „Auf einen Blick“ und „Auffällig“; neu sind die PDFs für Fütterung und Arbeit (auch unter „Unterlagen“).',
  ] },
  { version: '2.80', datum: '2026-10-20', punkte: [
    '<b>Android: Erinnerungen minutengenau.</b> Beim Einschalten der Erinnerungen fragt die App nach der Android-Erlaubnis „Wecker & Erinnerungen“ – damit kommt jede Erinnerung genau zur eingestellten Zeit (vorher durfte Android bis zu einer Stunde später zustellen). Status und Knopf „Minutengenau einschalten“ unter Einstellungen → Funktionen → Erinnerungen. Auf dem iPhone war es schon immer pünktlich.',
  ] },
  { version: '2.79', datum: '2026-10-20', punkte: [
    '<b>Neu: „Unterlagen“</b> (vorher „Meldungen & Export“) – alles, was die App ausdrucken oder herausgeben kann, an einer Stelle: Meldungen fürs Amt, Bestandsbuch, Bio-Unterlagen, Volksakte, Fütterungsliste, Wanderbuch, Chargen, Verkäufe, Rechnungen, Kassenbuch, Fahrtenbuch, Inventar, Statistiken, Jahresbericht, Komplettausdruck und Datensicherung. Oben das Jahr (gilt für alles darunter) und eine Suche, darunter die Kategorien als Reiter.',
    'Jahr-Auswahl jetzt auch für Bestandsbuch, Wanderbuch, Chargenübersicht und die Statistik-PDFs.',
    '<b>Erinnerungen:</b> Ist „1 Stunde vorher“ schon vorbei, erinnert die App jetzt zur Uhrzeit der Aufgabe – vorher kam dann gar keine Mitteilung. Sind Erinnerungen ausgeschaltet oder vom Telefon nicht erlaubt, sagt die App das beim Speichern einer Aufgabe mit Datum.',
  ] },
  { version: '2.78', datum: '2026-10-20', punkte: [
    '<b>Wetter am Stand:</b> Ist der Wetter-Abruf eingeschaltet, holt die App beim Start (und beim Öffnen eines Standes) das aktuelle Wetter aller Stände mit Koordinaten – höchstens alle 30 Minuten, nur mit Internet. Ein- und ausschalten kannst du das unter Einstellungen → Funktionen.',
    'Die Wetter-Karte zeigt oben nur das aktuelle Wetter (Temperatur, Wind, Regen, Uhrzeit), darunter den Verlauf als Grafik (30 Tage, dieses Jahr oder alles). Pro Tag wird nur noch ein Wert gespeichert – die Liste wächst nicht mehr endlos; aufgeklappt stehen die letzten 5 Werte, alle übrigen über „Alle Werte exportieren“.',
    '<b>Export je Bereich mit Volk und Jahr:</b> Unter „Export“ wählst du Bereich, ein einzelnes Volk (oder einen Stand) und das Jahr. Beim Volk entsteht die komplette <b>Volksakte</b> – Stammdaten, Königin, Durchsichten, Behandlungen, Fütterungen, Varroa, Gewichte, Ernten, Wanderungen, Aufgaben, Verlauf und Anhänge –, jeder Teil auch einzeln als PDF oder CSV, alles zusammen als PDF oder Excel.',
    '<b>Excel und CSV sauber für deutsches Excel:</b> Datum als TT.MM.JJJJ, Kommazahlen mit Komma, Umlaute korrekt, Spaltenbreite nach Inhalt und Filterknöpfe in der Kopfzeile. Vorher stand in der CSV das Datum amerikanisch und die Kommazahl mit Punkt.',
    'Komplettausdruck: Auch der Excel-Knopf nimmt jetzt das gewählte Jahr und die gewählten Bereiche.',
  ] },
  { version: '2.77', datum: '2026-10-20', punkte: [
    'Nach „Alle Daten löschen“ beginnt die App wieder auf der Startseite mit der Begrüßung – vorher stand man danach erneut in den Einstellungen.',
    'Kein ungewolltes Vergrößern mehr: Doppeltippen zoomt nirgends hinein; in der App lässt sich die Ansicht gar nicht mehr verzoomen.',
    'Imme zeigt mit einem vollständigen Honig-Rahmen auf ihr Ziel – bei Listenzeilen (z. B. Volk in „Erste Durchsicht“) waren vorher nur die Ecken zu sehen.',
  ] },
  { version: '2.76', datum: '2026-10-20', punkte: [
    '<b>Startseite selbst sortieren:</b> Eine Kachel etwa eine halbe Sekunde gedrückt halten – sie hebt sich an und das Handy vibriert kurz. Jetzt an den neuen Platz ziehen; die anderen Kacheln rutschen zur Seite, die gestrichelte Lücke zeigt, wo sie landet. Loslassen – fertig, die Reihenfolge ist gespeichert. Am oberen oder unteren Rand rollt die Seite mit. Kurzes Antippen öffnet wie bisher den Bereich.',
    '<b>Imme besser zu sehen:</b> Ihre Sprechblase ist jetzt im hellen Modus dunkel und im dunklen Modus hell – so hebt sie sich immer klar von den Kacheln ab.',
    'Kauf in der App: Ist der Store gerade nicht erreichbar, steht dort eine verständliche Meldung statt eines englischen Fehlertexts.',
    'Auch beim Verschieben in der unteren Leiste und unter „Alle Bereiche“ vibriert jetzt das iPhone kurz.',
  ] },
  { version: '2.75', datum: '2026-10-20', punkte: [
    'Mengenrechner: Hinweis, dass maßgeblich die Gebrauchsinformation des Tierarzneimittels und dein Tierarzt bzw. Bienengesundheitsdienst sind.',
    'Ältere Handys: Kopf- und Fußleiste behalten ihre Farbe auch dort, wo der Browser-Baustein durchscheinende Farben noch nicht kennt.',
    'Android: Ist der Browser-Baustein des Handys zu alt, erklärt die App, wie man ihn im Play Store aktualisiert – statt leer zu bleiben.',
  ] },
  { version: '2.74', datum: '2026-10-20', punkte: [
    'In der App (iPhone und Android): „Etikett drucken“ beim Volk und „Etiketten-QR“ bei der Charge erzeugen jetzt einen PDF-Bogen mit den Etiketten – über das Teilen-Menü druckst oder speicherst du ihn. Vorher tat der Knopf in der App nichts.',
  ] },
  { version: '2.73', datum: '2026-10-20', punkte: [
    'Einführung auf dem iPhone: Immes Sprechblase rutscht nicht mehr unter Uhrzeit und Kamera-Aussparung – die erste Zeile und das ✕ sind immer zu sehen. Passt sie über dem gezeigten Knopf nicht ganz hin, steht sie darunter.',
    'Auf dem Handy bleibt nach dem Antippen kein oranger Rand mehr an Kacheln, Listen und Knöpfen hängen.',
    'Das Schild „Hilfe beenden“ unten rechts ragt nicht mehr aus dem Bild, und die Markierung an der unteren Leiste wird nicht mehr abgeschnitten.',
    'Meldungen wie „Los geht’s!“ erscheinen oben, solange ein Fenster offen ist – vorher lagen sie beim ersten Start auf dem Knopf „30 Tage kostenlos starten“.',
  ] },
  { version: '2.72', datum: '2026-10-20', punkte: [
    'Light: Das Schild „Voll“ steht jetzt an jedem Bereich der Vollversion (vorher nur am letzten).',
    'Nur im Test-Build: Lizenz-Vorschau (Testphase / Light / Vollversion) in den Einstellungen.',
  ] },
  { version: '2.71', datum: '2026-10-20', punkte: [
    'Stabiler auf dem iPhone: Schließt das System die Datenbank im Hintergrund, verbindet sich ImkerBuch beim nächsten Tippen selbst neu – vorher konnte Speichern bis zum Neustart fehlschlagen.',
  ] },
  { version: '2.70', datum: '2026-10-20', punkte: [
    'Imme erklärt jetzt auch die kostenlose Light-Version (Frag sie z. B. „Was ist kostenlos?“).',
  ] },
  { version: '2.69', datum: '2026-10-20', punkte: [
    'Immes Hinweise sehen ruhiger aus: ohne gelben Rahmen und auf dem Handy über die ganze Breite.',
  ] },
  { version: '2.68', datum: '2026-10-20', punkte: [
    'Beim ersten Start zeigt Imme kurz, wo was ist: Startseite, wie du sie selbst zusammenstellst, deine Schnellzugriffe unten und „Mehr“ mit allen Bereichen.',
  ] },
  { version: '2.67', datum: '2026-10-20', punkte: [
    '<b>ImkerBuch Light:</b> Nach den 30 Testtagen sperrt die App nicht mehr – sie läuft kostenlos weiter mit bis zu 2 Völkern, Durchsicht, Stockkarte, Varroa und Königinnen. Alles andere gibt es mit der Vollversion; deine Daten bleiben sichtbar.',
  ] },
  { version: '2.66', datum: '2026-10-20', punkte: [
    'Zeiterfassung: Das Auffächern der Bereiche bleibt nicht mehr hängen, wenn das iPhone die Animation drosselt (z. B. Energiesparmodus).',
    'Bestandsbuch-PDF: kein doppeltes „Volk Volk Anna“ mehr.',
  ] },
  { version: '2.65', datum: '2026-10-20', punkte: [
    'Verbrauchsmaterial und weitere Produkte: Gibt es noch keine Position, führt die App jetzt direkt zum Anlegen – statt mit einer Fehlermeldung abzubrechen.',
  ] },
  { version: '2.64', datum: '2026-10-19', punkte: [
    'Fertigsirup (z. B. Apiinvert): Die Menge wird jetzt in <b>Litern</b> eingetragen – das Liter-Feld steht an der Stelle von kg. Darunter steht sofort, was das wiegt und wie viel Zucker beim Volk ankommt (1 L = 1 kg Zucker laut Hersteller). „Davon reiner Zucker“ füllt sich selbst.',
  ] },
  { version: '2.63', datum: '2026-10-19', punkte: [
    '<b>Fütterung je Volk:</b> Im Bereich Fütterung zeigt „Je Volk“, was jedes Volk im Jahr bekommen hat (Zucker, Liter, Anzahl Gaben). Beim Volk selbst stehen die Summen jetzt oben.',
    '<b>Fertigsirup in Litern:</b> Bei Apiinvert und Co. einfach Liter eintragen – die App rechnet das Gewicht (1 L ≈ 1,36 kg) und den Futterwert (1 L = 1 kg Zucker, Herstellerangabe) selbst.',
    '<b>Auswertung im Kassenbuch:</b> Kategorien antippen zeigt die Buchungen dahinter; bei Honigverkauf welcher Honig wie oft an wen ging – mit Sprung zum Abnehmer. Die Ernteprognose steht unten zum Aufklappen. Beim Jahreswechsel springt keine Seite mehr nach oben.',
    '<b>Verkauf ohne Bestand:</b> Nach Rückfrage trotzdem buchen – auch für Honig, der noch nicht erfasst ist. Neu: <b>Rabatt</b> beim schnellen Verkauf (in % oder €).',
    '<b>Abfüllen direkt aus der Ernte:</b> Ohne vorher eine Charge anzulegen – die App legt sie mit Losnummer selbst an. Bei Königinnen kann man jetzt die <b>Generation</b> angeben.',
  ] },
  { version: '2.62', datum: '2026-10-19', punkte: [
    'Startet das Mikrofon für eine Sprachnotiz nicht, steht jetzt auf Deutsch da, warum – und wo man es einschaltet.',
  ] },
  { version: '2.61', datum: '2026-10-19', punkte: [
    'In der App fragt das Handy nur noch <b>einmal</b> nach dem Standort (vorher kam eine zweite Frage „localhost möchte …“).',
    'Mehr Sicherheit: Die App verbindet sich nur noch mit Wetterdienst, Adresssuche und Geodiensten; geöffnete PDFs können keinen Code ausführen; die App-Hülle ist auf dem neuesten, abgesicherten Stand.',
    'Sehr lange Namen (z. B. Beute, Produktart) ragen nicht mehr über den Bildschirmrand. Kein hängenbleibender Unterstrich mehr nach dem Antippen.',
  ] },
  { version: '2.60', datum: '2026-10-19', punkte: [
    'Behoben: In der App konnte der Start hängen bleiben, wenn die Testphase noch nicht gestartet oder schon vorbei war.',
  ] },
  { version: '2.59', datum: '2026-10-18', punkte: [
    'Android: Die <b>Zurück-Taste</b> schließt zuerst offene Fenster und geht dann eine Seite zurück.',
    'Android: Erinnerungen mit eigenem Waben-Symbol; Käufe und Gutscheine werden zuverlässig bestätigt.',
    'Kleinere Text-Korrekturen für iPhone und Android.',
  ] },
  { version: '2.58', datum: '2026-10-18', punkte: [
    'Das <b>Wetter</b> kommt jetzt vom <b>Deutschen Wetterdienst</b> – von der nächsten Messstation, und wo keine in der Nähe ist (z. B. in Österreich), aus seiner Vorhersage. Die Quelle steht dabei.',
    'Neu eingerichtet: In der ersten Woche erinnert die App noch nicht ans Sichern.',
  ] },
  { version: '2.57', datum: '2026-10-18', punkte: [
    'In der App gehen jetzt <b>alle Dateien</b> – PDFs, Excel, CSV und Kalender – über das Teilen-Menü raus (Dateien, iCloud Drive, Mail, Drucken …).',
    'Neu in den Einstellungen: <b>Alle Daten löschen</b> – zum Beispiel vor dem Verkauf des Geräts.',
    'Im Willkommen-Fenster ist jetzt <b>nichts mehr Pflicht</b>, auch der Vorname nicht.',
    'Imme antwortet in der App passend zur App (Installieren, Updates, Preis, Mehrere Geräte).',
  ] },
  { version: '2.56', datum: '2026-10-18', punkte: [
    '<b>Imme zeigt Neulingen das Wichtigste:</b> eine Einführung in 5 kurzen Schritten (Stand, Volk, erste Durchsicht, wo du alles findest, Sicherung). Startbar bei Imme und in den Einstellungen.',
    'In der App speicherst du deine Sicherung jetzt über das <b>Teilen-Menü</b> – direkt in iCloud Drive, Google Drive, per Mail oder AirDrop.',
    'Neue <b>Support-Seite</b> mit den häufigsten Fragen (Sicherung, neues Handy, Käufe wiederherstellen).',
    'Behoben: Imme konnte bei der Hilfe „Datensicherung“ den zugeklappten Bereich nicht öffnen.',
  ] },
  { version: '2.55', datum: '2026-10-18', punkte: [
    '<b>Erinnerungen in der App:</b> ImkerBuch erinnert dich jetzt per Mitteilung an fällige Aufgaben – auch wenn die App geschlossen ist. Aufgaben können eine <b>Uhrzeit</b> bekommen; einstellbar unter Einstellungen → Funktionen → Erinnerungen (Uhrzeit am Fälligkeitstag, wie lange vorher).',
    'Neu: <b>Hilfe & Kontakt</b> im Menü – Fehler melden, Frage stellen oder Idee vorschlagen per E-Mail. App-Version und Gerät stehen schon drin, deine Imkerei-Daten nicht.',
    'Im Willkommen-Fenster kannst du nach Name und Imkerei <b>überspringen</b>.',
    'Die Erinnerung an die Sicherung steht nur noch auf der <b>Startseite</b>.',
    'Behoben: Bei einer noch nicht bewerteten Königin war ein <b>riesiger Pfeil</b> zu sehen.',
    'Behoben: Die Knöpfe über Verbrauchsmaterial, Inventar und Weitere Produkte sind jetzt <b>gleich groß</b>.',
    'Die App startet jetzt auch, wenn vorher eine neuere Test-Fassung auf dem Gerät lief.',
    '<b>Zucht</b> und der <b>Etikettendruck</b> sind vorerst ausgeblendet und kommen mit einem späteren Update zurück – deine Zucht-Daten bleiben erhalten.',
  ] },
  { version: '2.54', datum: '2026-10-12', punkte: [
    'Behoben: Nach „Mehr“ und einem Bereich, der nicht in der unteren Leiste steht, war das „Mehr“-Symbol nur halb zu sehen. Der abgetauchte Kreis lag unsichtbar darüber – jetzt liegt er hinter den Symbolen und verdeckt keins mehr, auch nicht während des Wechsels.',
  ] },
  { version: '2.53', datum: '2026-10-12', punkte: [
    'Untere Leiste spürbar flotter: der Wechsel zwischen Bereichen dauert rund 0,4 statt 0,6 Sekunden.',
    '„Mehr“ reagiert sofort: Der Kreis bläht sich nach etwa einer Zehntelsekunde auf, nach rund einer Drittelsekunde steht „Alle Bereiche“. Das Menü wird erst gebaut, wenn die Bewegung schon läuft – so hält nichts mehr ihren Start auf. Schließen geht ebenfalls schneller.',
  ] },
  { version: '2.52', datum: '2026-10-11', punkte: [
    '„Mehr“ ohne Ruckeln: „Alle Bereiche“ wird schon beim Antippen vorbereitet, und der Kreis bläht sich auf, während er auftaucht – eine durchgehende Bewegung. Die Seite dunkelt dabei leicht ab, damit man den Kreis wachsen sieht.',
    '„Alle Bereiche“: Kacheln als weiße Karten auf der Seitenfarbe – klar zu erkennen.',
    'Größerer Kreis in der unteren Leiste, und die Leiste hebt sich mit einer feinen Kante und einem weichen Schatten deutlicher vom Hintergrund ab.',
  ] },
  { version: '2.51', datum: '2026-10-11', punkte: [
    'Untere Leiste flüssiger: Mulde und Kreis werden nur noch verschoben und skaliert – das übernimmt die Grafikkarte, die Bewegung bleibt auch flüssig, während die neue Seite aufgebaut wird.',
    'Schmalere Leiste: weniger Höhe, weniger Abstand zum unteren Rand.',
    '„Mehr“: Der Kreis bläht sich zu „Alle Bereiche“ auf und fällt beim Schließen wieder in sich zusammen. Imme tritt dabei kurz zur Seite.',
    'iPhone-App: startet jetzt auch unter iOS 27 (Apple verlangt dort den neuen Szenen-Start – ohne ihn ging die App sofort wieder zu).',
  ] },
  { version: '2.50', datum: '2026-10-11', punkte: [
    'Königinnen neu: Jede Königin ist jetzt eine eigene Seite wie das Volk – oben das Wichtigste mit Bearbeiten, Bewerten und Stockkarte, darunter die Reiter Übersicht, Stammbaum, Bewertung, Verlauf und Dateien. Bearbeiten öffnet ein Formular über der Seite, danach bist du wieder bei der Königin.',
    'Stammbaum: Der Regler reicht genau so weit, wie Generationen erfasst sind. Zähler und Balken zeigen sofort, wie viele Vorfahren bekannt sind, neue Generationen gleiten sichtbar herein. Jede Ahnin trägt, woher die Angabe kommt („in ImkerBuch“, „aus der Pedigree-Zeile“, „nicht erfasst“) – antippen öffnet sie oder trägt nach.',
    'Oben im Stammbaum steht, woher die Daten kommen, mit Link zum Kehrle-Register bzw. zu BeeBreed. Die Bewertung zeigt jedes Merkmal als Balken.',
    'Behoben: Die Leiste zeigte nach dem Neuladen auf Seiten außerhalb der Leiste (z. B. einer Königin) eine Mulde am linken Rand.',
  ] },
  { version: '2.49', datum: '2026-10-11', punkte: [
    'Neue untere Leiste im Hochformat: randlos bis an den Geräterand, der gewählte Bereich sitzt als weißer Kreis in einer Mulde. Beim Wechsel taucht der Kreis ab, die Mulde fließt als Welle zum neuen Bereich und der Kreis steigt dort wieder auf.',
    '„Mehr“ öffnet „Alle Bereiche“ jetzt aus dem Kreis heraus – und schließt sich wieder in ihn hinein. Quer bleibt die Leiste wie bisher.',
  ] },
  { version: '2.48', datum: '2026-10-11', punkte: [
    'Reiter jetzt überall, wo es sinnvoll ist: Völker (Stände und Archiv), Königinnen (Aktiv / Archiv), Fütterung, Behandlungen, Wanderungen, Fahrten und Zeiterfassung (je Jahr), Abnehmer & Lieferanten, Statistiken, Aufgaben (Liste / Kalender), Meldungen & Export sowie Inventar, Verbrauchsmaterial und Weitere Produkte (Bestand / Zugänge / Abgänge).',
    'Bio → Hygiene hat dieselben Reiter wie der Hygiene-Bereich – als Unterreiter unter der Bio-Leiste, statt der seitlich scrollenden Knopfreihe.',
    'Startseite: Der Widgets-Knopf steht oben neben Hell/Dunkel, die eigene Zeile unter der Begrüßung fällt weg.',
    'Imme öffnet den passenden Reiter, wenn ein gesuchter Knopf gerade in einem anderen liegt. Behoben: Ein Kontakt öffnete sich nach einer Suche doppelt.',
  ] },
  { version: '2.47', datum: '2026-10-11', punkte: [
    'Angeheftete Reiter jetzt überall, wo es Reiter gibt: Volk (Stockkarte, Fütterung …), Bio, Ernte und Abfüllung und Kassenbuch. Die Leiste bleibt beim Scrollen oben stehen, du kannst jederzeit umschalten – wer weiter unten umschaltet, landet direkt am Anfang des neuen Reiters.',
    'Die Reiter verteilen sich selbst auf gleich volle Zeilen und füllen jede Zeile bis zum Rand, auch auf Tablet und PC. Quer passt meist alles in eine Reihe, die Kopfzeile scrollt dann mit weg.',
    'Kürzere Reiter-Namen: Bio „Betrieb“, „Vorsorge“, „Partner“, „Förderung“; Kassenbuch „Geschäftskosten“.',
    'Behoben: „Eigenes hochladen“ im Hygieneplan öffnet wieder den Reiter „Dateien“. Sprünge innerhalb einer Seite landen nicht mehr hinter der Kopfzeile.',
  ] },
  { version: '2.46', datum: '2026-10-11', punkte: [
    'Hygiene: Die Reiter füllen jede Zeile sauber bis zum Rand, die Schrift steht mittig. Quer und am PC stehen sie in zwei gleich langen Reihen zu je fünf gleich breiten Reitern.',
  ] },
  { version: '2.45', datum: '2026-10-11', punkte: [
    'Hygiene: Die Reiter stehen jetzt untereinander, wenn der Platz nicht reicht, statt seitlich zu scrollen – alle auf einen Blick (Handy hochkant drei Zeilen, quer zwei). Kürzere Namen: „Ernte“, „Abfüllung“, „Maßnahmen“.',
  ] },
  { version: '2.44', datum: '2026-10-11', punkte: [
    'Hygiene mit echten Reitern: Hygieneplan, Reinigungen, Verarbeitung, Honiglager, Schädlinge, Waage, Maßnahmen, Grenzwerte und Dateien stehen nicht mehr alle untereinander – jeder Reiter zeigt nur seinen Teil. Die Reiterleiste bleibt beim Scrollen oben stehen, der gewählte Reiter bleibt gemerkt.',
    'Handy quer: Die Kopfzeile scrollt mit weg, nur die schmale Reiterleiste bleibt oben – so bleibt mehr Platz für die Einträge.',
    'Neue Sicherheitsprüfung beim Entwickeln: Der ganze Programmcode wird vor jedem Test auf Fehler wie den beim Bearbeiten von Königinnen untersucht.',
  ] },
  { version: '2.43', datum: '2026-10-11', punkte: [
    'Neu: Wischen in Listen. Eine Zeile nach links wischen zeigt „Bearbeiten“ und „Löschen“ – in Ständen, Völkern (dort „Auflösen“), Durchsichten, Königinnen, Zucht, Behandlungen, Fütterung, Trachten, Wanderungen, Kontakten, Bio, Ernte, Chargen, Abfüllungen, Kassenbuch, Inventar, Zeiten, Aufgaben und Fahrten. Löschen fragt wie gewohnt nach und legt in den Papierkorb.',
    'Neu auf der Startseite: Widget „Durchsicht am Stand“. Je Stand ein Start-Knopf, der am längsten nicht durchgesehene Stand steht oben. Hast du einen Durchgang unterbrochen, geht es mit „Weiter bei …“ genau dort weiter.',
    'Die Schnell-Durchsicht heißt jetzt überall „Durchsicht am Stand“.',
    'Behoben: Eine bestehende Königin ließ sich nicht bearbeiten – das Formular öffnete sich nicht.',
    'Behoben: Im Fahrten-Widget reagierte „Fahrt buchen“ ab dem sechsten Stand nicht.',
  ] },
  { version: '2.42', datum: '2026-10-09', punkte: [
    'Neu: Durchsicht am Stand – auch mit Handschuhen bedienbar. Eine Frage pro Bildschirm (Volksstärke, Brutbild, Sanftmut, Futter, Weiselzellen), große Knöpfe, nach dem Tippen geht es von selbst weiter. Die Antwort der letzten Durchsicht ist markiert.',
    'Am Ende: Zusammenfassung, Sprachnotiz per großem Knopf und „Speichern · nächstes Volk ›“ – so gehst du alle Völker eines Standes der Reihe nach durch. Mit ‹ › wechselst du jederzeit das Volk, angefangene Antworten bleiben erhalten.',
    'Starten: am Stand „Durchsicht am Stand“, im Volk ebenfalls „Durchsicht am Stand“ oder per QR-Aufkleber an der Beute – neu gedruckte Aufkleber öffnen sie direkt.',
    'Eigene Zusatzfelder der Stockkarte (Bewertung 1–5, Ja/Nein) werden bei der Durchsicht am Stand mit abgefragt.',
  ] },
  { version: '2.41', datum: '2026-10-08', punkte: [
    'Sicherung auf ein neues Gerät: Liegt dort nur, was die Einrichtung angelegt hat (z. B. „Heimstand“, „Volk 1“) oder nur die Beispieldaten, bietet das Import-Fenster „Alles übernehmen“ an. Die Sicherung wird 1:1 übernommen – nichts doppelt, keine Beispiel-Völker zwischen den echten Daten, nur eine Rückfrage.',
    'Auf Geräten mit eigenen Daten bleibt das Fenster wie bisher (Zusammenführen / Ersetzen).',
    '„Beispieldaten laden“ löscht die internen Sicherungskopien nicht mehr und legt vorher selbst eine an.',
    'Nach dem Einspielen erscheint ein eigenes Logo sofort oben in der Kopfzeile, nicht erst nach einem Neustart.',
  ] },
  { version: '2.40', datum: '2026-10-08', punkte: [
    'Sicherung auf ein anderes Gerät (z. B. Handy → PC): Bio- und Imkerei-Angaben kommen jetzt vollständig an. Vorher gewann beim „Zusammenführen“ die Ersteinrichtung des neuen Geräts (Bio: nein, leere Anschrift), weil sie jünger war. Jetzt wird jedes Feld einzeln verglichen, und was die App selbst eingetragen hat, zählt nie als neuer.',
    'Schon betroffen? Die Sicherung einfach noch einmal einspielen und „Zusammenführen“ wählen – die fehlenden Angaben werden ergänzt, nichts wird doppelt.',
    'Der gewählte Backup-Ordner und die Sicherungstermine bleiben auf ihrem Gerät. Vorher kam der Ordner kaputt mit und die automatische Sicherung auf dem anderen Gerät schlug fehl.',
    'Geänderte Bio-Texte (Betriebsbeschreibung, Vorsorgekonzept) und Imkerei-Angaben zählen jetzt als ungesicherte Änderung – die Sicherung beim Schließen und der Sicherungshinweis greifen auch dafür.',
    'Sicherungen aus einer älteren App-Fassung werden nach dem Einspielen sofort umgestellt (z. B. alte Bio-Lieferanten → Kontakte), auch beim Zusammenführen.',
  ] },
  { version: '2.39', datum: '2026-10-08', punkte: [
    'Bereiche in die Schnellleiste ziehen: Das Fenster „Alle Bereiche“ wird dabei nicht mehr durchsichtig. Nur die Schnellleiste unten kommt nach vorn und ist gestrichelt markiert.',
  ] },
  { version: '2.38', datum: '2026-10-08', punkte: [
    'Mehrere Arbeitsschritte in einem Eintrag: „Gläser abgefüllt & etikettiert“ zählt jetzt für „Abfüllen“ UND „Etiketten kleben“ – die Zeit wird gleichmäßig aufgeteilt. Erkannt wird an „und“, „&“, Komma oder „/“; mehrere Wörter für eine Tätigkeit („Fütterung prüfen“) bleiben ein Schritt.',
    'Beim Erfassen sind die Arbeitsschritte jetzt Knöpfe zum Antippen – mehrere möglich, plus „eigener“. Die App zeigt, wie die Zeit geteilt wird.',
    'Im aufgeklappten Diagramm steht bei geteilten Einträgen „geteilt mit …“ und der Anteil (z. B. „48 min von 1,6 h“).',
  ] },
  { version: '2.37', datum: '2026-10-08', punkte: [
    'Zeiterfassung zum Aufklappen: Tippe im Kreisdiagramm (oder in der Liste darunter) auf einen Bereich – er fächert sich in seine Arbeitsschritte auf, z. B. „Abfüllen & Etikettieren“ → Etiketten kleben, Abfüllen, Gläser spülen … Ein Tipp auf einen Schritt zeigt die Einträge dazu, „‹ Alle Bereiche“ faltet zurück.',
    'Neues Feld „Arbeitsschritt“ beim Erfassen einer Zeit (auch beim Abhaken von Aufgaben): mit Vorauswahl je Tätigkeit und aus deinem Text vorbelegt („Etiketten geklebt“ → Etiketten kleben). Eigene Schritte merkt sich die App; anpassen unter Einstellungen → Arbeitsschritte je Tätigkeit.',
    'Bisherige Einträge ordnet die App automatisch über den Text zu – wie der Assistent Imme versteht sie Wortformen, Synonyme und Tippfehler. Solche Schritte sind mit „aus Text erkannt“ markiert.',
    'Behoben: Imme erklärte bei der Zeiterfassung eine Stoppuhr, die es nicht gibt.',
  ] },
  { version: '2.36', datum: '2026-10-06', punkte: [
    'Einheitliche Optik: Die letzten runden „Pillen“-Formen sind weg – die Umschalt-Leiste in der Auswertung (Volk/Stand/Sorte/Jahr), die Meldungen unten („Gespeichert“) und das Schild „Hilfe beenden“ haben jetzt dieselben abgerundeten Ecken wie die Knöpfe. Auch auf der Webseite.',
  ] },
  { version: '2.35', datum: '2026-10-06', punkte: [
    'Komplettausdruck mit Auswahl: Vorher wählst du das Jahr (oder „Alle Jahre“) und welche Bereiche hinein sollen. Die App schätzt Einträge und Seiten und rät bei sehr großen Mengen zum Excel-Export. Stammdaten (Stände, Völker, Königinnen, Kontakte, Inventar) kommen immer vollständig mit.',
    'Neu im Komplettausdruck: Fütterungen und Abfüllungen.',
    'Behoben: Im Komplettausdruck stand jedes Datum einen Tag zu früh (z. B. 05.10. statt 06.10.).',
  ] },
  { version: '2.34', datum: '2026-10-06', punkte: [
    'PDFs sind jetzt bis zu 16-mal kleiner (komprimiert) – z. B. ein Bestandsbuch mit 115 Seiten 0,5 statt 7,7 MB. Inhalt und Aussehen bleiben gleich; lässt sich viel leichter mailen.',
    'iPhone: Imme schwebte beim Hochscrollen kurz über Kopfleiste und Uhrzeit (Geräte mit Dynamic Island). Sie springt jetzt rechtzeitig nach unten.',
    'Imme ist nach dem Scrollen schneller wieder voll sichtbar.',
    'Assistent: Beim Öffnen bleiben Überschrift und Regler sichtbar (die Seite sprang sonst nach unten).',
  ] },
  { version: '2.33', datum: '2026-10-06', punkte: [
    'Schneller bei großen Imkereien: Lange Listen (Völker, Königinnen, Behandlungen, Fütterung, Aufgaben, Kassenbuch, Inventar mit Zugängen/Abgängen, Ernten, Verkäufe, Kontakte, Fahrten, Auswertung …) zeigen zuerst 100 Einträge, darunter „Weitere anzeigen“ und „Alle anzeigen“. Summen rechnen weiter mit allem.',
    'Völker: neues Suchfeld (Name, Beute, Stand, Königin – mehrere Wörter möglich). Ab 8 Ständen wählst du den Stand aus einer Liste statt aus vielen Knöpfen.',
    'Imme ist unten etwas kleiner und wird beim Scrollen durchsichtig – so verdeckt sie keine Beträge mehr.',
    'Marktverkauf: „Kassieren“ ist jetzt ein großer Knopf über die volle Breite und zeigt die Summe.',
  ] },
  { version: '2.32', datum: '2026-10-06', punkte: [
    'Der Regler „Imme ist aktiv“ ist eingeschaltet jetzt honig-orange (wie der Senden-Knopf), ausgeschaltet grau.',
    'Behoben: Ganz unten verdeckte Imme den letzten Eintrag einer Liste. Die Seiten lassen jetzt unten Platz für sie.',
    'Behoben: „1.200“ ohne Komma wurde als 1,20 gelesen. Ein Punkt vor drei Ziffern gilt jetzt als Tausender-Punkt (1.200 = 1200); „12,50“ und „1.5“ funktionieren wie bisher.',
    'Behoben: Im Honiglager kam bei Werten mit Komma (z. B. „16,5“ °C) keine Maßnahme-Empfehlung.',
    'Marktverkauf: Wie viele Gläser noch übrig sind, steht jetzt vorne und wird auf dem Handy nicht mehr abgeschnitten.',
    'Schneller bei großen Datenmengen: Kontaktliste und Lagerwert-Berechnung (Inventar/Verbrauchsmaterial) rechnen nicht mehr jede Position gegen alle Buchungen.',
  ] },
  { version: '2.31', datum: '2026-10-06', punkte: [
    'Aufgeräumt: Die Kachel „Saisonaler Tipp“ im Dashboard führt jetzt direkt in den passenden Bereich (z. B. „Zu den Völkern“, „Zur Fütterung“, bei hohem Varroa-Befall direkt zum Volk) statt in die pausierte Imkerschule.',
  ] },
  { version: '2.30', datum: '2026-10-06', punkte: [
    'Imme lässt sich ausschalten: unter „Assistent“ mit dem Schieberegler „Imme ist aktiv“ – oder schreib ihr einfach „ich brauche dich nicht mehr“. Ausgeschaltet schläft sie oben im Dashboard (gedimmt, „z Z“), springt nicht herunter und winkt nicht. Ein Tipp auf sie führt zum Regler zurück.',
    'Imme geht mit der Tageszeit: morgens mit Kaffee, mittags mit Strohhut, nachmittags mit Honigglas und abends mit Schlafmütze und müden Augen.',
    'Ruhiger: Die Flügel flattern nur noch kurz beim Winken, und Imme blinzelt ab und zu.',
  ] },
  { version: '2.29', datum: '2026-10-05', punkte: [
    'Der Knopf oben rechts schaltet jetzt durch alle drei Darstellungen: System (folgt dem Handy), Hell und Dunkel. Das Symbol zeigt, was gerade gilt. Dieselbe Auswahl gibt es weiter unter Einstellungen.',
  ] },
  { version: '2.28', datum: '2026-10-05', punkte: [
    'Der Drucker-Knopf oben ist entfernt (er druckte nur die Bildschirmansicht und funktionierte nicht zuverlässig). Drucken geht weiter über die PDF-Knöpfe in den Bereichen.',
  ] },
  { version: '2.27', datum: '2026-10-05', punkte: [
    'Dunkelmodus: Kacheln und Linien etwas heller, die graue Schrift besser lesbar – mehr Kontrast zum Hintergrund.',
  ] },
  { version: '2.26', datum: '2026-10-05', punkte: [
    'In der Gesamtübersicht (Inventar, Verbrauchsmaterial, Weitere Produkte) kannst du jetzt eine Zeile antippen, zum Beispiel „Beuten“: Die Liste zeigt dann nur diese Art und springt direkt dorthin. Nochmal antippen hebt den Filter auf. Neu: Filter „ohne Kategorie“.',
    'In der Auswertung führt ein Tipp auf ein Volk oder einen Stand (Honigertrag, Futter je Volk) direkt zum Volk bzw. Stand.',
  ] },
  { version: '2.25', datum: '2026-10-05', punkte: [
    'Behoben: Wenn du auf dem iPhone ganz unten warst und weiter hochgezogen hast (das federnde „Gummiband“), schwebte Imme mit in die Luft. Sie sitzt unten jetzt fest an der Leiste und bleibt dort, egal wie du scrollst.',
  ] },
  { version: '2.24', datum: '2026-10-05', punkte: [
    'Imme setzt sich unten nicht mehr hin – sie steht auf der Leiste und verdeckt dadurch weniger vom Menü.',
  ] },
  { version: '2.23', datum: '2026-10-05', punkte: [
    '<b>Imme versteht dich jetzt viel lockerer:</b> Sie erkennt Wortformen und Verwandte („verkaufen“, „abgeben“, „verkauft“), zerlegt lange Wörter („Honigverkauf“), verzeiht Tippfehler („Rechnugn“) und versteht ganze Sätze („Ich hab gestern Honig geschleudert, wo schreibe ich das hin?“). Getestet mit über 800 Alltagsfragen.',
    'Rund <b>40 neue Antworten</b> in allen Bereichen: Volk auflösen oder vereinigen, Ableger, Schwarm, Umweiseln, Gewicht, QR-Code, Charge, Verkauf stornieren, Rechnung festschreiben und senden, Skonto, Auswertung, Fahrtenbuch-PDF, Kalender-Export, Bio-Partner, Hygiene-Checkliste, Logo, Import, Bearbeiten und Löschen sowie allgemeine Fragen (offline, Datenschutz, mehrere Geräte, installieren, Preis, Update, Hilfe).',
    'Wenn Imme unsicher ist, nennt sie bis zu drei passende Möglichkeiten zum Antippen statt „nichts gefunden“. Fragen aus der Imker-Praxis („Woran erkenne ich …?“) beantwortet sie zuerst mit dem Fachwissen.',
  ] },
  { version: '2.22', datum: '2026-10-04', punkte: [
    'Imme erklärt jetzt auch <b>die Felder</b> beim Einkauf, Verkauf, Eigenverbrauch und Verlust von Material (Position, Grund, Datum, Menge, Preis, Lieferant/Kunde). Felder, die es in der gewählten Maske nicht gibt, überspringt sie.',
    'Zwei neue Antworten: <b>Umsatzsteuer und Pauschalierung</b> und <b>Varroa zählen und bewerten</b>.',
  ] },
  { version: '2.21', datum: '2026-10-04', punkte: [
    '<b>Imme führt jetzt auch durch</b> die Durchsicht (Volk wählen, „Durchsicht“, Felder), die Datensicherung, den Export (Excel, PDF) und den Marktverkauf.',
    'Imme schaut jetzt <b>dich an</b> statt in die Ecke: Der Körper dreht sich zum Bildschirm hin, der Kopf blickt zu dir.',
    'Behoben: Ein Schritt der Führung konnte doppelt zählen und dadurch einen Hinweis überspringen.',
  ] },
  { version: '2.20', datum: '2026-10-04', punkte: [
    '<b>Weißer Streifen oben auf dem iPhone behoben:</b> Die App reicht jetzt bis ganz nach oben unter die Statusleiste, und die Uhr-/Akku-Schrift passt sich dem hellen oder dunklen Design an. (Gilt für die iPhone- und Android-App, nicht für den Browser.)',
    '<b>Imme führt jetzt durch fast alle Eingaben:</b> zusätzlich Ernte, Charge, Abfüllung, Honigverkauf, Rechnung, Fahrt, Zuchtserie, Tracht, Zeiterfassung, Reinigung sowie An- und Verkauf von Material. In jedem Schritt beendet das <b>✕ im Hinweis</b> (oder ein Tipp auf Imme, oder die Esc-Taste) die Hilfe.',
  ] },
  { version: '2.19', datum: '2026-10-04', punkte: [
    'Imme winkt nur noch ein paar Mal (zweimal bis dreimal) und steht dann ruhig da, statt dauernd zu winken. Im Chat hebt sie den Arm nur kurz, wenn sie dir antwortet.',
    'Imme begrüßt dich mit „Hallo, ich bin Imme, dein persönlicher Assistent“ – im Chat und am Anfang jeder Schritt-für-Schritt-Hilfe.',
  ] },
  { version: '2.18', datum: '2026-10-04', punkte: [
    '<b>Imme begleitet dich Schritt für Schritt:</b> Bei den häufigsten Aufgaben (Volk, Stand, Behandlung, Fütterung, Kontakt, Königin, Aufgabe, Wanderung) markiert sie erst den Knopf, öffnet dann – sobald du ihn antippst – die Eingabemaske und zeigt dir Feld für Feld, was einzutragen ist. Zum Schluss markiert sie „Speichern“.',
    'Mit einem <b>Tipp auf Imme</b> beendest du die Hilfe jederzeit; während der Hilfe steht dort „Hilfe beenden“. Schließt du die Maske, endet die Hilfe von selbst.',
  ] },
  { version: '2.17', datum: '2026-10-04', punkte: [
    '<b>Imme springt:</b> Scrollst du weg, hüpft sie in einem Bogen nach unten rechts und landet auf der Schnellzugriff-Leiste; beim Hochscrollen springt sie zurück neben deinen Namen.',
    'Unten steht Imme auf der Leiste. Sie steht jetzt davor statt dahinter und ist nicht mehr von der Leiste verdeckt.',
    'Sauber freigestellt: kein heller Bodenschatten und kein Schlagschatten mehr, die Flügel sind auf hellem und dunklem Grund gut sichtbar. Neu gerendert: Ruhe, Sitzen, Winken, Zeigen, Nachdenken, Freuen.',
  ] },
  { version: '2.16', datum: '2026-10-04', punkte: [
    '<b>Der Assistent heißt jetzt „Imme“</b> – das alte deutsche Wort für Biene (daraus ist auch „Imker“ entstanden: Imme + Kar, der Bienenkorb). Wer fragt „Warum heißt du Imme?“, bekommt die Erklärung.',
  ] },
  { version: '2.15', datum: '2026-10-04', punkte: [
    '<b>Imme im Dashboard-Kopf:</b> Neben deinem Namen winkt jetzt Imme statt der Tagesbiene. Scrollst du weg, rutscht und hüpft sie nach unten rechts und bleibt dort als Knopf für den Assistenten. Scrollst du wieder nach oben, fliegt sie zurück an ihren Platz.',
    'Die fünf Bewegungen von Imme (Ruhe, Winken, Zeigen, Nachdenken, Freuen) sind in der fertigen Qualität eingebaut.',
  ] },
  { version: '2.14', datum: '2026-10-04', punkte: [
    '<b>Neu: Assistent „Imme“.</b> Frag in eigenen Worten, wie etwas in der App geht („Wie buche ich einen Honigverkauf?“). Imme antwortet kurz mit den Schritten, und mit <b>„Zeig’s mir“</b> öffnet die App den Bereich und markiert den passenden Knopf. Dazu kommen die Antworten der Imker-Praxis. Alles läuft lokal auf dem Gerät, ohne Internet.',
    'Imme sitzt als runder Knopf unten rechts auf jeder Seite und hat im Menü den Platz der Imkerschule. Die Imkerschule ist ausgeblendet (nicht gelöscht) und ihr Lerntipp-Widget ist nicht mehr Standard.',
  ] },
  { version: '2.13', datum: '2026-10-03', punkte: [
    '<b>Lieferant oder Bio-Partner:</b> Im Kontakt gibt es jetzt die Auswahl „Bio-Partner? Ja / Nein“. Nur bei „Ja“ erscheinen die Öko-Angaben, das Kennzeichen „Bio“, der Hinweis „keine Kontrollnummer“ und der Eintrag in den Öko-Unterlagen. Ein normaler Lieferant (z. B. für Gläser) bleibt dadurch frei von Bio-Pflichten.',
    '<b>Aus „Alle Bereiche“ in die untere Leiste:</b> Kachel gedrückt halten und auf die Leiste ziehen – sie ersetzt dort den Eintrag, auf den du sie fallen lässt (auf „Mehr“ gezogen: hängt sich an, wenn noch Platz ist).',
    'Ältere Kontakte: Wer schon Öko-Angaben hatte, gilt weiter als Bio-Partner; alle anderen sind „Nein“. Ändern geht jederzeit über „Bearbeiten“.',
  ] },
  { version: '2.12', datum: '2026-10-03', punkte: [
    '<b>Verschieben per Gedrückthalten:</b> Im Menü „Mehr“ lässt sich jede Kachel ~0,4 Sekunden gedrückt halten und an eine andere Stelle ziehen. Das Gleiche geht in der unteren Leiste – auch „Start“ darf überall stehen. Die Reihenfolge wird gemerkt; unter den Kacheln gibt es „Reihenfolge zurücksetzen“.',
  ] },
  { version: '2.11', datum: '2026-10-03', punkte: [
    '<b>Menü „Alle Bereiche“ im Hochformat:</b> Alle Kacheln sind jetzt gleich hoch, die Symbole sitzen in jeder Reihe auf einer Linie – auch wenn eine Beschriftung zwei Zeilen braucht („Abnehmer & Lieferanten“).',
    'Die Spaltenzahl passt sich der Bildschirmbreite an (große iPhones wie das Pro Max, kleine iPhones, iPad) statt fest 3 oder 4 zu zeigen.',
  ] },
  { version: '2.10', datum: '2026-10-03', punkte: [
    '<b>Gesamtprüfung:</b> Alle 43 Seiten und Reiter, rund 280 Knöpfe, alle PDFs und der Excel-Export wurden durchgegangen – im Browser (Handy- und Tabletbreite) und in der iPhone-App.',
    'Behoben: In der <b>iPhone- und Android-App</b> fehlte das Tagesbiene-Bild im Dashboard (leeres Bild mit Fragezeichen) – die 24 Bilder werden jetzt mit eingepackt, und die Web-App legt sie für den Offline-Betrieb vorab ab.',
    'Behoben: Steht ein Kennzeichen („MHD“, „Zucht“, „immer“ …) in einem langen Listentitel, wurde es abgeschnitten – jetzt bricht der Titel um.',
    'Neu im <b>Excel-Export</b>: Einkäufe & Zugänge, Verkäufe & Abgänge, Pfand sowie Hygiene & Bio als eigene Tabellenblätter.',
    'Das Menü zeigt „Abnehmer & Lieferanten“ jetzt mit vollem Namen statt „Kontakte“.',
  ] },
  { version: '2.09', datum: '2026-10-03', punkte: [
    '<b>Neuer Bereich „Abnehmer & Lieferanten“</b> im Menü (unter Rechnungen): alle Kontakte an einem Ort – Kunden, Lieferanten, beides und Öko-Partner – mit Filter, Suche und Bio-Kennzeichnung. Tippst du einen Kontakt an, siehst du, <b>wo er überall vorkommt</b>: Buchungen im Kassenbuch (mit Summen und Sprung dorthin), Einkäufe, Verkäufe, Rechnungen, Pfand und seine Zertifikate. Dieselbe Liste steht im Kassenbuch (Reiter „Kunden & Lieferanten“) und bei Bio; ein Kontakt, den du irgendwo anlegst, ist überall da.',
    '<b>Hygiene ist jetzt ein eigener Bereich</b> im Menü – wer nichts mit Bio zu tun hat, findet ihn so. Der Reiter „Hygiene“ unter Bio zeigt dasselbe und verweist auf den eigenen Bereich.',
    'Im Kassenbuch lässt sich nach einem <b>Kontakt</b> filtern (über den Link im Kontakt).',
    'Behoben: In den Kurzwahl-Kacheln der Reinigungen passte die Schrift nicht in die Kachel; lange Namen werden jetzt umgebrochen.',
  ] },
  { version: '2.08', datum: '2026-10-03', punkte: [
    'Behoben: Kontakte, die als <b>„beides“</b> (Kunde und Lieferant) angelegt waren – etwa Partner aus dem Bio-Bereich –, fehlten in den Auswahllisten von Einkauf, Verkauf, Lohnverarbeitung und Pfand-Rücknahme. Jetzt erscheint ein Kontakt <b>überall</b>, egal wo und als was er angelegt wurde. Beim Honig-Verkauf und bei der Rechnung stehen Kunden und „beides“ zur Wahl.',
  ] },
  { version: '2.07', datum: '2026-10-03', punkte: [
    'Das Springen zum Fehlenden gilt jetzt auch für die <b>Rechnung</b> (fehlender Kunde oder fehlende Positionen: die App scrollt dorthin und lässt die Stelle kurz aufleuchten) und für die <b>Abfüllung</b> (keine oder falsche Gebindeangabe, Bestand größer als die abgefüllte Anzahl).',
  ] },
  { version: '2.06', datum: '2026-10-03', punkte: [
    '<b>Fehlt etwas, springt das Formular dorthin:</b> Beim Speichern scrollt es zum ersten fehlenden Pflichtfeld, markiert es rot und setzt den Cursor hinein. Das gilt auch, wenn die App erst beim Speichern merkt, dass etwas fehlt (z. B. keine Position gewählt, keine Menge, kein Volk). Die rote Markierung verschwindet, sobald du das Feld ausfüllst.',
    'Die Nummern „1. 2. 3. 4.“ sind jetzt auch in den übrigen Sammel-Formularen weg (Bewertungsrunde, Umweiseln, Laborergebnis).',
  ] },
  { version: '2.05', datum: '2026-10-03', punkte: [
    '<b>Löschen fragt nach – in beide Richtungen:</b> Löschst du im <b>Kassenbuch</b> eine Buchung, die zu einem Zugang, Verkauf, einer Honig-Abfüllung oder Pfand-Rücknahme gehört, fragt die App, ob der Eintrag im Bereich (Verbrauchsmaterial, Inventar, Weitere Produkte, Honig, Pfand) <b>auch gelöscht</b> werden soll – dann gehen Bestand und bei der Lohnverarbeitung auch der Honig der Charge zurück. Löschst du umgekehrt <b>im Bereich</b>, fragt sie, ob die Buchung im Kassenbuch mitgelöscht wird. „Nur hier löschen“ lässt die andere Seite stehen.',
    'Ein Honig-Verkauf, der ohne seine Einnahme storniert wurde, lässt sich aus dem Papierkorb wieder herstellen.',
  ] },
  { version: '2.04', datum: '2026-10-03', punkte: [
    'Behoben: Wird bei „Weitere Produkte“ eine <b>Position gelöscht</b>, die für eine Lohnverarbeitung gebucht war, kommt der lose abgegebene Honig jetzt wieder zur Charge zurück (und ist wieder abgegeben, wenn du die Position aus dem Papierkorb holst). Beim Löschen des Zugangs selbst funktionierte das schon.',
  ] },
  { version: '2.03', datum: '2026-10-03', punkte: [
    'Weitere Masken angeglichen: <b>Pfand-Rücknahme</b> und <b>Abfüllung bearbeiten</b> haben Datum und Anzahl nebeneinander (Datum heißt jetzt auch dort „Datum“), und bei <b>Stand</b> und <b>Volk</b> heißt das Feld wie überall „Notiz“.',
  ] },
  { version: '2.02', datum: '2026-10-03', punkte: [
    '<b>Neuer Bereich „Weitere Produkte“</b> (Menü „Ernte & Geschäft“) für alles außer Honig, das du verkaufst oder zukaufst: Honigessig, Met, Honiglikör, Kerzen, Propolis, Pollen, Gelée Royale und mehr. Er funktioniert wie Verbrauchsmaterial und Inventar: Positionen mit Bestand, Einkauf, Verkauf, Eigenverbrauch / Verlust – gebucht über „An- und Verkauf buchen“ im Kassenbuch, das den neuen Bereich auch als Filter kennt.',
    '<b>Lohnverarbeitung:</b> Gibst du Honig lose an einen Verarbeiter und bekommst z. B. Essig zurück, wählst du beim Einkauf die Art „Lohnverarbeitung“: Der Bestand steigt, die Kosten gehen als Ausgabe „Lohnverarbeitung“ ins Kassenbuch, und der abgegebene Honig wird bei der Charge vermerkt („zur Verarbeitung abgegeben“) und zählt dort nicht mehr als offen.',
  ] },
  { version: '2.01', datum: '2026-10-03', punkte: [
    'Weitere Masken angeglichen: <b>Wanderung</b> ohne Nummerierung und mit „Datum“, <b>Fahrt</b> mit Datum und Kilometern nebeneinander (Ziel zuerst) und „Speichern“ statt „Fahrt buchen“, <b>Gewicht</b> mit Datum und Gewicht nebeneinander.',
  ] },
  { version: '2.00', datum: '2026-10-03', punkte: [
    '<b>Behandlung, Fütterung und Ernte haben dieselbe Struktur wie die Buchungsmasken:</b> erst <b>wer/wo</b> (Volk, Stand, bei Sammel-Erfassung Stand, Funktion und Völker), dann <b>was</b> (Mittel, Futterart, Produkt und Sorte), dann <b>Datum und Menge nebeneinander</b>, danach die Einzelheiten, der Abzug vom Verbrauchsmaterial, Erinnerung bzw. Wartezeit und zuletzt die Notiz.',
    'Das Datum heißt überall einfach „Datum“ (früher „Datum der Anwendung“, „Erntedatum“). Die Nummern „1. 2. 3. 4.“ in den Sammel-Formularen sind weg, weil die übrigen Felder auch nicht nummeriert waren. Beim Sirup steht jetzt „Rechnet mit der Menge (kg) zusammen“, weil die Menge über dem Sirup steht.',
  ] },
  { version: '1.99', datum: '2026-10-03', punkte: [
    '<b>Alle Buchungsmasken haben jetzt dieselbe Struktur</b> – Verbrauchsmaterial, Inventar, Honig-Verkauf und die reine Geldbuchung: erst <b>was</b> (Position, Abfüllung bzw. Art), dann <b>Grund bzw. Art</b>, <b>Datum und Menge nebeneinander</b>, dann <b>Preis</b>, <b>Kunde oder Lieferant</b>, <b>Beleg</b> und <b>Notiz</b>. Verbrauchsmaterial und Inventar nutzen ohnehin dasselbe Formular.',
    'Einheitliche Überschriften: „Einkauf · Verbrauchsmaterial“, „Verkauf · Inventar“, „Eigenverbrauch / Verlust · Verbrauchsmaterial“, „Verkauf · Honig“, „Einkauf · Honig“ und „Einkauf · Sonstiges (nur Geld)“. Der Honig-Verkauf speichert wie alle anderen mit „Speichern“.',
  ] },
  { version: '1.98', datum: '2026-10-03', punkte: [
    '<b>An- und Verkauf läuft zentral über das Kassenbuch:</b> Dort gibt es einen Knopf <b>„An- und Verkauf buchen – Eigenverbrauch / Verlust“</b>. Erst wählst du Einkauf, Verkauf oder Eigenverbrauch / Verlust, dann den Bereich (Verbrauchsmaterial, Inventar, Honig oder „Sonstiges“ als reine Geldbuchung). Danach öffnet sich das bekannte Formular, das Bestand und Kassenbuch zusammen bucht. Der alte Knopf „+ Buchung“ ist darin aufgegangen.',
    'Im Kassenbuch filterst du die Buchungen nach <b>Bereich</b> (Verbrauchsmaterial, Inventar, Honig, Pfand, Sonstiges); die Summen passen sich an, und jede Buchung zeigt ihren Bereich. <b>Eigenverbrauch, Verlust und Verschenktes</b> stehen als Zeilen mit 0,00 € in der Liste (antippen zum Ändern) und zählen nicht in die Summen.',
    'Im Verbrauchsmaterial und im Inventar gibt es oben nur noch <b>einen Link</b> ins Kassenbuch (Bereich schon gewählt); die Buchungsknöpfe in den Listen sind weg, die Verläufe bleiben zum Ansehen und Ändern. Honig-Einkauf wird als Ausgabe „Honig-Zukauf“ gebucht (ohne Lagerbestand). Die Honig-Verkäufe haben einen Link ins Kassenbuch.',
  ] },
  { version: '1.97', datum: '2026-10-01', punkte: [
    '<b>Archiv:</b> Im Hygiene-Reiter zeigen die Listen (Reinigungen, Honigverarbeitung Ernte und Abfüllung, Honiglager, Schädlinge, Waage, Maßnahmen) nur noch die <b>letzten 2 Jahre</b>. Ältere Einträge stehen unter „Archiv“ am Ende der jeweiligen Karte – aufklappbar, weiter änderbar und als PDF druckbar. Es wird nichts gelöscht. Noch offene Maßnahmen und Schädlingsfälle bleiben in der Liste, egal wie alt.',
    'Das Hygiene-PDF und die Öko-Unterlagen enthalten nur die letzten 2 Jahre und weisen auf das Archiv hin.',
  ] },
  { version: '1.96', datum: '2026-10-01', punkte: [
    'In App und PDF steht bei den Checklisten nicht mehr „4 von 8 geprüft“, sondern <b>was geprüft wurde</b> (z. B. „Geprüft: Siebe, Honigschleuder, Lagerbehälter“). Nicht Relevantes wirkt damit nicht wie etwas Fehlendes.',
    'Ernte-Checkliste: neu <b>Entdeckelungsmaschine</b> und <b>Klärbehälter</b> (jeweils gereinigt, trocken, ohne Anhaftungen, Abrieb ausgeschlossen bzw. lebensmittelgeeignet).',
  ] },
  { version: '1.95', datum: '2026-10-01', punkte: [
    '<b>Eigene Kontrollpunkte:</b> In der Checkliste Honigverarbeitung – Ernte und in der Checkliste Abfüllung kannst du unter der Liste einen eigenen Punkt eintragen („Hinzufügen“). Er steht dann in allen künftigen Checklisten, ist gleich angehakt und lässt sich mit dem ✕ wieder entfernen. Im PDF steht, was du zusätzlich geprüft hast.',
  ] },
  { version: '1.94', datum: '2026-10-01', punkte: [
    'Die Abfüll-Checkliste hat jetzt auch <b>„Melitherm: gereinigt, trocken, ohne Anhaftungen, Abrieb ausgeschlossen“</b>. Bei Abfüllanlage, Rührstab und Abfüllbehälter steht „Abrieb ausgeschlossen“ ebenfalls dabei.',
  ] },
  { version: '1.93', datum: '2026-10-01', punkte: [
    '<b>Honigverarbeitung – Ernte</b> und <b>Honigverarbeitung – Abfüllung</b> arbeiten jetzt mit der <b>Charge</b>: Du wählst die Charge, und die App holt sich alles aus ihr. Bei der Ernte-Checkliste sind das Schleuderdatum, Wassergehalt, Los-Nr. und die letzte Behandlung der Völker (mit Warnung bei laufender Wartezeit); bei der Abfüll-Checkliste schaut sie nach, <b>wann die Charge abgefüllt wurde</b>, und übernimmt Datum, Gläser, Los-Nr., Mindesthaltbarkeit und Wassergehalt.',
    'Chargen ohne Checkliste werden oben als Kacheln angeboten; bei der Abfüllung nur die, die schon abgefüllt wurden.',
  ] },
  { version: '1.92', datum: '2026-10-01', punkte: [
    'In der Abfüll-Checkliste gibt es jetzt auch <b>„Abfüllanlage: gereinigt, trocken, ohne Anhaftungen“</b>. Rührstab, Abfüllbehälter, Gläser, Deckel und Deckeleinlagen gehören nur zur Abfüllung, nicht zur Ernte.',
    '<b>Alles verbunden:</b> Wählst du eine Ernte, übernimmt die App Schleuderdatum, Wassergehalt, Los-Nr. und die <b>letzte Behandlung dieses Volkes bzw. Standes</b> aus dem Bestandsbuch – und warnt, wenn die Wartezeit zur Ernte noch lief. Dazu zeigt sie Herkunft und die zugehörigen Abfüllungen. Bei einer Abfüllung kommen Datum, Los, Mindesthaltbarkeit, Wassergehalt und die zugehörigen Ernten dazu. Die zuletzt eingetragene Person wird vorgeschlagen.',
  ] },
  { version: '1.91', datum: '2026-10-01', punkte: [
    '<b>Ernte und Abfüllung getrennt:</b> Die Checkliste <b>Honigverarbeitung</b> gehört jetzt zur <b>Ernte</b> (Schleudern: Raum, Entdeckelungsgeschirr, Schleuder, Siebe, Lagerbehälter, Wassergehalt). Das <b>Abfüllen</b> hat eine eigene Checkliste je <b>Abfüllung</b> (Abfüllanlage, Melitherm, Rührstab, Abfüllbehälter, Gläser, Deckel, Wärmeschrank, Rückstellprobe, MHD). Beide füllen sich aus den Daten der App, und Ernten bzw. Abfüllungen ohne Checkliste werden angeboten. Bereits angelegte Einträge bleiben erhalten.',
  ] },
  { version: '1.90', datum: '2026-10-01', punkte: [
    'Behoben: In der Honigverarbeitung wurden nur die vier neuesten Chargen ohne Checkliste angeboten. Jetzt stehen <b>alle</b> da, mit der Anzahl darüber.',
  ] },
  { version: '1.89', datum: '2026-10-01', punkte: [
    '<b>Honigverarbeitung mit deinen Abfüllungen verknüpft:</b> Du wählst die Charge, und die App füllt Los-Nr., Schleuderdatum, Wassergehalt, Abfülldatum und Mindesthaltbarkeit aus. Die abgefüllten Gläser stehen dabei und im PDF. Chargen ohne Checkliste werden oben angeboten – ein Tipp legt sie vorbefüllt an.',
    '<b>Überall Vorschläge im Hygiene-Reiter:</b> Hygieneplan („Vorschläge übernehmen“ mit Mittel und Häufigkeit), Kurzwahlen („Vorschläge“), Reinigung (Mittel wird zum gewählten Bereich ergänzt), Honiglager (Werte der letzten Messung, Maßnahme bei Überschreitung), Schädlinge (Ort, Maßnahme je Schädling, Nachkontrolle in 14 Tagen) und Maßnahmenplan (Vorschläge aus deinen Auffälligkeiten).',
    'Behoben: Im Formular „Kontrolle Honiglager“ saßen die Felder Temperatur und Luftfeuchte nicht auf einer Höhe – die Beschriftungen sind kürzer. Das gilt auch für Waage und Verarbeitung.',
    'Der Hinweis auf eine bestimmte Vorlage ist entfernt.',
  ] },
  { version: '1.88', datum: '2026-10-01', punkte: [
    'Neue Karte <b>„Gefahren und Grenzwerte“</b> im Hygiene-Reiter: was schiefgehen kann (Wassergehalt, Luftfeuchte, Temperatur, Glassplitter …), wo die Grenze liegt, wie du prüfst und was du dann tust. Die Zahlen folgen deinen Sollwerten.',
    'In der Checkliste <b>Honigverarbeitung</b> wählst du die Los-Nummer jetzt aus deinen Chargen.',
  ] },
  { version: '1.87', datum: '2026-10-01', punkte: [
    'Der Grenzwert für den <b>Wassergehalt</b> steht jetzt standardmäßig auf <b>18 %</b> (D.I.B.-Qualität; gesetzlich sind 20 % erlaubt). Du kannst ihn unter „Kontrolle Honiglager → Sollwerte“ jederzeit ändern.',
  ] },
  { version: '1.86', datum: '2026-10-01', punkte: [
    '<b>Reinigungen mit Kurzwahlen:</b> Unter Bio → Hygiene → „Durchgeführte Reinigungen“ legst du deine häufigsten Reinigungen als Kurzwahl an (wie die häufigen Fahrten im Fahrtenbuch). Ein Tipp bucht sie für heute – mit „Rückgängig“. Am schnellsten: „Aus Hygieneplan“ übernimmt alle Zeilen deines Plans.',
    '<b>Checkliste abhaken:</b> Wie auf deinem Papier – Haken setzen, einmal buchen. Die Liste kommt aus dem Hygieneplan, gruppiert nach „nach der Arbeit“, „vor der Abfüllung“ und „bei Bedarf“, mit Datum, Name und Art (Unterhalts- oder Grundreinigung).',
    '<b>Neue Eigenkontrollen</b>: <b>Honigverarbeitung</b> (Checkliste je Charge mit Wassergehalt, Wärmeschrank, Rückstellprobe), <b>Kontrolle Honiglager</b> (Temperatur und Luftfeuchtigkeit mit Sollwerten und Wochenhinweis), <b>Schädlingsüberwachung</b> (auch „kein Befund“ mit einem Tipp, Nachkontrolle mit Erinnerung), <b>Prüfmittelüberwachung Waage</b> (Abweichung höchstens 0,2 g) und <b>Maßnahmenplan</b>.',
    'Alles steht im Hygiene-PDF und in den Öko-Unterlagen. Der Hygiene-Assistent kennt jetzt 17 statt 9 Bereiche, darunter Fußböden, Wände, Arbeitsflächen, Waschbecken, Kleingeräte (85 °C), Rührgerät und die Schädlingsvorbeugung im Lager.',
    'Oben im Hygiene-Reiter springt eine Leiste direkt zu jedem Bereich.',
  ] },
  { version: '1.85', datum: '2026-09-29', punkte: [
    '<b>Eigene Bereiche:</b> Im Vorsorgekonzept („Eigener Bereich“) und in der Betriebsbeschreibung („Eigener Abschnitt“) kannst du jetzt selbst Punkte ergänzen – wie „+ Eintrag“ bei der Hygiene. Name vergeben, Text schreiben; umbenennen und löschen geht jederzeit. Sie stehen in der Liste, im PDF und werden beim Einlesen an ihrer Überschrift erkannt.',
    '<b>Sauberer Seitenumbruch</b> in den PDFs von Vorsorgekonzept, Betriebsbeschreibung und Öko-Unterlagen: Ein kurzes Kapitel bleibt ganz zusammen, bei einem langen stehen Überschrift und mindestens zwei Zeilen zusammen, und nach einem Umbruch bleibt nie eine einzelne Zeile übrig.',
    '<b>Unterlagen ans PDF anhängen:</b> Beim Erstellen der PDF fragt die App, ob hochgeladene Dateien hinten angehängt werden sollen (PDF-Seiten und Fotos). Word-Dateien lassen sich nicht einbetten und werden am Ende genannt. Gilt für Vorsorgekonzept, Betriebsbeschreibung, Hygieneplan und die Öko-Unterlagen.',
    'Die Felder zum Hinzufügen heißen jetzt <b>„+ Foto“ und „+ Dokument“</b> und sind honigfarben hervorgehoben.',
    'Neuer Dokumententyp <b>„Zertifikat“</b> (in bestehende Listen einmalig eingefügt).',
  ] },
  { version: '1.84', datum: '2026-09-29', punkte: [
    'Beim Einlesen einer Unterlage ist das <b>Häkchen „übernehmen“ jetzt groß</b> und lässt sich viel leichter antippen.',
  ] },
  { version: '1.83', datum: '2026-09-29', punkte: [
    'Neu bei <b>Bio → Betriebsbeschreibung</b>: ein <b>Assistent</b> wie beim Vorsorgekonzept. Für jeden der 13 Abschnitte stellt er ein bis drei Fragen und schlägt einen Text vor – aus deinen Antworten und den Daten der App (Standorte, Fütterung, Behandlungen, Hygieneplan, Zertifikat …). Übernehmen, ändern oder überspringen; alles bleibt später änderbar und löschbar.',
    'Die Betriebsbeschreibung lässt sich jetzt <b>als PDF ausdrucken</b>, eine <b>eigene Unterlage einlesen</b> (PDF oder Foto: die App ordnet die Abschnitte zu und fragt vor dem Übernehmen) und die Fassung von Verband oder Kontrollstelle <b>hochladen</b>. Vorsorgekonzept, Betriebsbeschreibung und Hygiene haben jetzt dieselben Knöpfe in derselben Reihenfolge: Assistent starten · Einlesen · Als PDF · Eigenes hochladen.',
    '<b>Herkunft sichtbar:</b> Was aus einer eigenen Unterlage übernommen wurde, trägt in der Liste die Marke „aus deiner Unterlage“. Öffnest du den Bereich und der Text passt doch nicht, übernimmst du mit einem Tipp den <b>Vorschlag der App</b> – und kommst mit „Text aus meiner Unterlage“ jederzeit wieder zurück. Gilt für Betriebsbeschreibung und Vorsorgekonzept.',
  ] },
  { version: '1.82', datum: '2026-09-29', punkte: [
    '<b>PDFs aufgeräumt:</b> Bei langen Firmen- oder Standortnamen überlagerten sich Texte – im Kopf jeder PDF (Name über der Adresse), auf dem <b>Honig-Etikett</b> (Name, Bezeichnung, Füllmenge und Adresse liefen ineinander), bei der <b>Rechnung</b> (Absender lief aus dem Blatt, Fußzeile lag über „Erstellt mit ImkerBuch“) und bei <b>Bestandsmeldung/Tierseuchenkasse</b> (Angaben liefen über den rechten Rand). Jetzt werden lange Namen kleiner gesetzt, umgebrochen oder mit „…“ gekürzt, und alles darunter rückt nach.',
    'Bei den <b>Unterlagen zur Öko-Kontrolle</b> stand eine Überschrift manchmal allein am Seitenende, die Tabelle darunter auf der nächsten Seite – jetzt bleibt sie beim Text. Außerdem fehlten Umlaute („Völker“, „Fläche“, „für“).',
    'Tabellen: Die Überschrift einer rechtsbündigen Spalte (Menge, Preis, Summe …) steht jetzt auch rechts über den Zahlen. Die Rechnung hat keine leere Spalte mehr, wenn keine Umsatzsteuer ausgewiesen wird.',
    'Beim Einlesen eines Konzepts war der Hinweis „Dieser Bereich hat schon einen Text“ mit einem riesigen Ausrufezeichen versehen – jetzt normal groß.',
  ] },
  { version: '1.81', datum: '2026-09-29', punkte: [
    'Neu bei <b>Bio → Vorsorgekonzept</b>: <b>Konzept einlesen</b>. Wer sein Vorsorgekonzept schon als PDF oder Foto hat, lädt es hoch – die Datei wird gespeichert, die App liest den Text, erkennt die Abschnitte und ordnet sie den Bereichen zu (Standorte, Fütterung, Varroa, Reinigung …). Du siehst jeden Abschnitt vorher, kannst die Zuordnung und den Text ändern und hakst ab, was übernommen werden soll. Unsichere Zuordnungen sind hervorgehoben und nicht vorausgewählt; ein Bereich mit eigenem Text wird nie ungefragt überschrieben (ersetzen oder unten anhängen).',
    'Bei <b>Bio → Hygiene</b> gibt es jetzt eine Kachel <b>Zertifikate und Nachweise hochladen</b>: PDF oder Foto einfach ablegen und jederzeit wieder öffnen – ohne Auslesen, genau wie beim Vorsorgekonzept.',
    'Word-Dateien werden weiter nur aufbewahrt, nicht gelesen – dafür als PDF speichern und dieses einlesen.',
    'Beim Einlesen (Vorsorgekonzept <b>und</b> Hygieneplan) läuft jetzt derselbe Ablauf: ein <b>Ladekreis</b>, der sich füllt, dann die Frage „Erkannt – in die App übernehmen?“ mit allem Erkannten zum Prüfen und Abhaken.',
  ] },
  { version: '1.80', datum: '2026-09-29', punkte: [
    'Beim Hochladen des eigenen Vorsorgekonzepts steht jetzt klar dabei: Die Datei wird nur <b>aufbewahrt</b> und lässt sich wieder öffnen – die App liest sie nicht aus und trägt nichts in die Bereiche ein.',
  ] },
  { version: '1.79', datum: '2026-09-29', punkte: [
    'Bei <b>Bio → Vorsorgekonzept</b> lässt sich jetzt ein <b>eigenes, schon fertiges Konzept hochladen</b> (PDF, Word, Foto): eigene Kachel „Eigenes Vorsorgekonzept hochladen“ unter der Bereichsliste, dazu ein Knopf „Eigenes hochladen“ oben, der direkt dorthin springt.',
  ] },
  { version: '1.78', datum: '2026-09-25', punkte: [
    'Noch mehr runde Reste vom Button-Umbau gefunden und angeglichen: die kleinen <b>Marken</b> („vorbei“, „geplant“, Jahres-Summen …) und die schwebende <b>Navigation unten</b> – inklusive etwas größerer Schrift dort, damit sie zur neuen Form passt.',
    'Bei <b>Behandlungen</b> waren „Bestandsbuch (PDF)“ und „+ Behandlung“ unterschiedlich groß – behoben, und gleich an allen anderen Stellen der App geprüft, wo ein schmaler und ein normal-großer Knopf nebeneinanderstehen (Völker, Königinnen, Fütterung, Wanderungen, Aufgaben, Fahrtenbuch, Kassenbuch, Material).',
  ] },
  { version: '1.77', datum: '2026-09-25', punkte: [
    'Nachbesserung zu den eckigeren Buttons: die <b>Filter-Chips</b> (z. B. „Alle aktiven" bei Völker) und die <b>Reiter oben</b> waren dabei vergessen worden und noch voll rund – jetzt passen sie zur neuen Form. Die schwebende Navigation unten bleibt weiterhin rund.',
    'Zwei Stellen gefunden, an denen Kacheln ohne Abstand aneinanderstießen: bei <b>Bio → Hygiene</b> und in der <b>Volk-Ansicht</b> (Durchsichten/Historie). Beide jetzt mit sauberem Abstand.',
  ] },
  { version: '1.76', datum: '2026-09-25', punkte: [
    'Alle <b>Buttons</b> haben jetzt eckigere, leicht abgerundete Ecken statt der vollen Pillenform – wie die Kacheln im Hintergrund. Die schwebende Navigationsleiste unten und die Filter-Chips bleiben bewusst rund, das ist eine eigene Form dafür.',
  ] },
  { version: '1.75', datum: '2026-09-25', punkte: [
    'Der Reiter bei <b>Bio</b> heißt jetzt <b>Vorsorgekonzept</b> statt „Vorsorge" – deutlicher, worum es geht.',
    'Neu bei <b>Hygiene</b>: ein <b>Assistent</b>, wie beim Vorsorgekonzept. Er schlägt neun typische Bereiche vor (Schleuderraum, Beuten, Abfüllkessel, Gebinde, Werkzeug, Arbeitskleidung, Lager, Transport …) mit Mittel, Häufigkeit und der passenden Fundstelle in der Öko-Verordnung – übernehmen, ändern oder überspringen. Ein Bereich, den es schon im Plan gibt, wird beim erneuten Durchlauf aktualisiert statt verdoppelt.',
    'Der <b>Hygieneplan lässt sich jetzt als PDF ausdrucken</b> – mit dem Plan und den bisher durchgeführten Reinigungen, für die jährliche Kontrolle.',
  ] },
  { version: '1.74', datum: '2026-09-25', punkte: [
    'Neu bei <b>Bio</b>: Reiter <b>Vorsorge</b> – das nach <b>Art. 28 der EU-Öko-Verordnung (VO (EU) 2018/848)</b> vorgeschriebene Vorsorgekonzept. 16 Bereiche, abgeleitet aus den Produktionsvorschriften für Bienen (Standorte, Wachs, Fütterung, Varroa, Ernte, Zukauf, Umstellung …), jeweils mit der genauen Fundstelle.',
    'Ein <b>Assistent</b> führt auf Wunsch durch die Bereiche: Fragen beantworten, die App schlägt einen Text vor – übernehmen, ändern, <b>überspringen</b> oder als <b>„betrifft mich nicht"</b> markieren. Wer lieber selbst schreibt, tippt einen Bereich in der Liste an und trägt seinen eigenen Text ein. Jeder Bereich ist jederzeit <b>änderbar oder löschbar</b>.',
    'Die Vorschläge nutzen, was die App ohnehin weiß: erfasste Verschmutzungsquellen an den Standorten, Mittel aus dem Bestandsbuch, Futterarten, Wanderungen, den Kontrollstellen-Code. Bei einem im Bestandsbuch erfassten Varroamittel, dessen Wirkstoff nicht zu den für Bio zugelassenen gehört, erscheint ein Hinweis.',
    'Das Konzept lässt sich als <b>PDF ausdrucken</b> – mit Betrieb, Kontrollstelle, allen ausgefüllten Bereichen samt Rechtsgrundlage und Unterschriftszeile, genau richtig für die jährliche Kontrolle.',
    'Neu: In der <b>Betriebsbeschreibung</b> lassen sich die <b>Formulare von Verband und Kontrollstelle</b> hochladen (PDF, Word, Excel, OpenOffice …) und direkt in der App zum Ausfüllen öffnen. Da sich diese Formulare ändern können, wählst du sie selbst aus, statt dass die App feste Vorlagen mitbringt. Das Unterlagen-PDF listet, welche Formulare hinterlegt sind.',
    'Anhänge (Dokumente, Formulare) öffnen sich auf dem Handy jetzt zuverlässig über das Teilen-Menü – zum Bearbeiten in Word, Acrobat oder der Dateien-App, statt nur heruntergeladen zu werden.',
  ] },
  { version: '1.73', datum: '2026-09-24', punkte: [
    'Behoben: Im Reiter <b>Sorte</b> ließen sich Sorten und Laborergebnisse nicht bearbeiten. Der Grund: Die Schleuderungs-Nummer ist beim Erfassen einer Ernte freiwillig – und eine Ernte <b>ohne Nummer</b> tauchte in „Laborergebnis eintragen" bei keiner Auswahl auf. Jetzt gibt es dort zusätzlich <b>„ohne Nummer"</b> und <b>„alle Ernten"</b>, jeweils mit der Anzahl.',
    'Neu: Jede Sorte in der Tabelle lässt sich <b>antippen</b>. Dort kannst du den <b>Namen ändern</b> (gilt für alle Ernten und Chargen dieser Sorte und auch für deine Sortenliste), den <b>Wassergehalt je Eintrag</b> korrigieren oder die Sorte ganz <b>entfernen</b> – die Ernten bleiben dabei erhalten und warten wieder auf ihr Laborergebnis.',
    'Ein unplausibler Wassergehalt (außerhalb 10–30 %) wird abgelehnt, bevor etwas gespeichert wird; das Fenster bleibt zum Korrigieren offen.',
  ] },
  { version: '1.72', datum: '2026-09-23', punkte: [
    'Behoben (nur auf dem iPhone sichtbar): <b>Datumsfelder ragten rechts aus dem Bild</b> – der Rahmen fehlte dort, und das Datum stand mittig statt links. Betraf alle Datumsfelder, z. B. „Fällig am" bei Aufgaben und das Bewertungsdatum. Gefunden beim Durchklicken auf einem echten iPhone-Simulator; am Rechner fiel es nie auf, weil dort mehr Platz ist.',
  ] },
  { version: '1.71', datum: '2026-09-23', punkte: [
    '<b>Große Prüfrunde.</b> Eine externe Nachprüfung hat 30 Punkte gefunden – alle sind behoben. Am Aussehen und an deinen Daten ändert sich nichts; die Liste ist lang, weil gründlich gesucht wurde.',
    '<b>Zwei Fenster gleichzeitig</b> können sich nicht mehr in die Quere kommen: Eine Rechnung ließ sich doppelt festschreiben (Bestand wurde zweimal abgezogen, Einnahme zweimal gebucht), zwei Abfüll-Fenster konnten mehr Honig abfüllen, als die Charge hergibt, zwei Bewertungen derselben Königin überschrieben sich gegenseitig, und zweimal „Bewertungs-Runde" legte für dasselbe Volk zwei Königinnen an. Alles vier behoben.',
    '<b>Bestände stimmen wieder.</b> Eine Fütterung im Volk zu ändern korrigierte das Zuckerlager nicht. Eine Abfüll-Korrektur merkte sich mehr Material, als tatsächlich abging – beim Löschen kamen Gläser aus dem Nichts zurück. Wiederherstellen aus dem Papierkorb konnte bei knappem Lager Material vermehren. Gescheiterte Positionen verschwanden trotz gegenteiliger Meldung aus dem Marktkorb.',
    '<b>Rechnungen:</b> Ein importierter Steuersatz als Text („7" statt 7) ergab einen falschen Steuerbetrag. Positionen mit 0 % fehlten in der Netto-Gesamtsumme. Die Pfand-Steuereinstellung wirkte bei der Pauschalierung nach § 24 nicht. <b>Wichtig:</b> Bereits festgeschriebene Rechnungen werden <b>nicht</b> nachträglich umgerechnet – sie behalten ihre Berechnung. Nur neue Belege rechnen nach der korrigierten Regel.',
    '<b>Sicherungen sind ehrlicher.</b> Änderungen, die während des Sicherns entstanden, galten fälschlich als gesichert. Nach dem Festschreiben einer Rechnung blieb die Warnung „noch nicht gesichert" aus. Beides korrigiert; der Stand wird jetzt dauerhaft mitgeführt und auch über mehrere offene Fenster hinweg.',
    '<b>Import einer fremden Sicherung:</b> Ungültige Kennungen werden jetzt mit klarer Meldung abgelehnt, statt still durch Zufallskennungen ersetzt zu werden – dabei gingen vorher Verknüpfungen verloren. Ein bewusst gelöschtes Logo oder Zahlungs-Bild lässt sich über eine neuere Sicherung wieder entfernen.',
    '<b>Offline-Speicher:</b> Bei einer neuen Installation prüft die App jetzt auch, ob wirklich das ImkerBuch geliefert wurde. Eine Wartungsseite des Servers konnte die gespeicherte App sonst ersetzen – und offline erschien dauerhaft sie statt der App.',
    '<b>Bewertung:</b> Die vollständige Maske ergänzt die Noten des Tages, statt sie zu ersetzen. Alte Bewertungen (Skala 1–4) bleiben als eigene, <b>gekennzeichnete</b> Spalte stehen – in der Liste, im Export und auf der Stockkarte. Mittelwerte verschiedener Skalen werden nicht mehr vermischt.',
    '<b>Hygieneplan einlesen:</b> Tabellen mit kurzen Zellen wurden falsch zusammengezogen – behoben. Doppelt auf „Einträge anlegen" tippen legt nichts mehr doppelt an. Wird der Plan gekürzt (mehr als 60 Zeilen oder mehr als fünf PDF-Seiten), steht das jetzt sichtbar dabei.',
    'Für sehr große Foto- und PDF-Dateien gibt es jetzt klare Grenzen mit verständlicher Meldung, statt dass die App ins Stocken gerät.',
  ] },
  { version: '1.70', datum: '2026-09-22', punkte: [
    'Sicherheit: Eine importierte Sicherungsdatei konnte bei bestimmten Feldern (Steuersatz, Zahlungsziel, Volk-Status, Wartezeit, Los- und Zuchtangaben, Bio-Standort, Gebinde-/Verkaufsmenge) HTML/Code einschleusen, das beim Öffnen der jeweiligen Ansicht ausgeführt wurde. Diese Felder werden jetzt beim Anzeigen konsequent entschärft.',
  ] },
  { version: '1.69', datum: '2026-09-22', punkte: [
    'Kleinigkeit: Bei <b>Bewertungs-Runde</b> und <b>Sammel-Umweiseln</b> heißt der Knopf nach der Völkerauswahl jetzt <b>Weiter</b> statt „Speichern" – dort wird ja noch nichts gespeichert, es folgt erst der zweite Schritt.',
  ] },
  { version: '1.68', datum: '2026-09-22', punkte: [
    'Behoben: Die <b>Bewertungs-Runde</b> zeigte nur Völker, denen bereits eine Königin zugeordnet war – hattest du deine Königinnen nicht einzeln erfasst, stand dort gar nichts. Jetzt stehen <b>alle aktiven Völker</b> zur Wahl. Wählst du eines ohne erfasste Königin, legt die App dafür eine an und ordnet sie zu; den Jahrgang fragt sie einmal ab, statt ihn zu raten.',
    'Behoben: Im Bewertungs-Fenster lag das Feld <b>Temperatur</b> verschoben neben dem Datum, und auf dem Handy waren die Auswahlmenüs zu schmal („– nicht bewerte…“). Solche Paare stehen jetzt nur noch nebeneinander, solange wirklich Platz ist – auf dem Handy untereinander und voll lesbar.',
  ] },
  { version: '1.67', datum: '2026-09-22', punkte: [
    'Die <b>Königinnen-Bewertung folgt jetzt der Stockkarte der GdeB</b> (Gemeinschaft der europäischen Buckfast-Imker): 15 Merkmale in fünf Gruppen – Vitalität, Verhalten, Ertrag, Wabenbau, Varroa – auf der <b>Skala 1 bis 6</b> (1 = sehr schlecht · 3 = schlechter Schnitt · 4 = guter Schnitt · 6 = Optimum). Angezeigt wird der Mittelwert und, ob die <b>10 von 13 Kernmerkmalen</b> für ein Zuchtvolk erreicht sind.',
    'Eine Bewertung ist jetzt ein <b>datierter Eintrag</b> – wie eine Spalte auf der Papierkarte. Über das Jahr entstehen mehrere, der Verlauf bleibt stehen und ist in der Königin einzeln anzutippen.',
    'So viel wie möglich kommt <b>von selbst</b>: <b>Wetter und Temperatur</b> aus deinen Wettereinträgen zum Bewertungstag, der <b>Ertrag je Tracht</b> aus den Ernten des Volkes und die <b>letzte Varroa-Messung</b> stehen als Hinweis direkt neben der passenden Note.',
    'Neu: das <b>Pedigree der Königin</b> wird automatisch aus dem Stammbaum gebildet – in der Schreibweise der Stockkarte, über so viele Generationen wie bekannt. Du kannst es jederzeit überschreiben; erfunden wird nichts, fehlt die Mutter, endet die Kette.',
    'Neu: die <b>Stockkarte als PDF</b> (Königin öffnen → Stockkarte). Merkmale als Zeilen, Bewertungstermine als Spalten – wie das Original, mit Kastennummer, Standort, Zeichenfarbe und Pedigree im Kopf.',
    'Die <b>Bewertungs-Runde</b> am Stand fragt die sechs Merkmale ab, die man vor dem Volk wirklich beurteilen kann. Ertrag und Varroa trägst du später nach – beides landet im selben datierten Eintrag.',
    'Frühere Bewertungen (Skala 1–4) bleiben erhalten und werden weiter angezeigt. Sie werden <b>nicht umgerechnet</b> – die alten Zahlen standen auf einer anderen Skala, jede Umrechnung wäre erfunden. Sie sind entsprechend gekennzeichnet.',
  ] },
  { version: '1.66', datum: '2026-09-22', punkte: [
    'Neu unter <b>Bio → Hygiene</b>: <b>Plan einlesen</b>. Wer seinen Hygieneplan schon auf Papier oder als PDF hat, fotografiert ihn ab oder lädt die Datei hoch – die App liest ihn und schlägt die Einträge vor. Du siehst jede erkannte Zeile vorher in einer Tabelle, kannst sie ändern und hakst ab, was angelegt werden soll. <b>Ungeprüft wird nichts gespeichert.</b>',
    'Zeilen, bei denen die Erkennung unsicher war, sind gelb hervorgehoben und nicht vorausgewählt – so fällt nichts Falsches unbemerkt in den Plan.',
    'Ein PDF aus einem Schreibprogramm wird direkt gelesen, ganz ohne Texterkennung – das ist genauer. Nur ein eingescanntes PDF geht durch die Texterkennung.',
    'Auf Wunsch wandert der erkannte Text zusätzlich in die Betriebsbeschreibung (Abschnitt „Reinigung und Desinfektion“).',
    'Handschrift wird weiterhin nicht zuverlässig gelesen – dafür ist die Erkennung nicht gemacht.',
  ] },
  { version: '1.65', datum: '2026-09-22', punkte: [
    'Der Abschnitt <b>Standortwahl und Umfeld</b> in der Betriebsbeschreibung ist jetzt <b>gegliedert statt ein Fließtext</b>: ein Block je Stand, jede Angabe auf einer eigenen Zeile – Umkreis, Trachtanteil, Bebauung, Sonstiges, die größten Flächen und das Erhebungsdatum. Neu dabei: die <b>Verschmutzungsquellen im Umkreis</b> (danach fragt die Kontrolle), eine Mittelwert-Zeile über alle erhobenen Stände und der Hinweis, welche Stände noch offen sind.',
    'Außerdem bleiben <b>Zeilenumbrüche in allen Abschnitten</b> der Betriebsbeschreibung jetzt erhalten. Bisher wurde alles, was du dort eingetippt hast, in der Übersicht zu einem einzigen Absatz zusammengezogen.',
  ] },
  { version: '1.64', datum: '2026-09-21', punkte: [
    'Sicherheit: Fünf weitere Wege geschlossen, auf denen eine <b>präparierte fremde Sicherung</b> Code in die App bringen konnte – über eine Bildadresse, die nur vorne richtig aussah, über einen erfundenen Feldtyp bei den eigenen Stockkarten-Feldern, über Zuchtzahlen, über Standort-Koordinaten im Kartenlink und über einen erfundenen Speichernamen im Papierkorb. Gefunden hat das eine externe Nachprüfung.',
    'Wichtige Vorgänge sind jetzt <b>unteilbar</b>: Beim <b>Festschreiben einer Rechnung</b> gehen Bestand, Kassenbuch-Buchung und Rechnung gemeinsam in die Datenbank – bricht etwas ab, wird nichts gebucht (vorher konnten Gläser fehlen, ohne dass es eine Rechnung dazu gab). Dasselbe gilt für <b>Import und Zusammenführen</b> einer Sicherung sowie für das <b>Wiederherstellen aus dem Papierkorb</b>.',
    'Die einmaligen <b>Datenwanderungen</b> überstehen einen Abbruch: Eine alte Charge bekommt auch nach mehreren Anläufen nur EINE Abfüllung, und bei der Bio-Zusammenführung wird das eigene Öko-Zertifikat gesichert, bevor der alte Eintrag gelöscht wird.',
    'Der <b>Offline-Speicher</b> übernimmt nur noch eine echte App-Seite. Eine Wartungs- oder Anmeldeseite des Servers konnte die App im Cache überschreiben – offline erschien dann dauerhaft sie statt des Imkerbuchs.',
  ] },
  { version: '1.63', datum: '2026-09-21', punkte: [
    'Rechnungen berücksichtigen jetzt die <b>Angaben aus § 14 UStG</b>: Es gibt ein eigenes Feld für das <b>Liefer-/Leistungsdatum</b>, <b>Steuernummer bzw. USt-IdNr.</b> stehen im Kopf, und bei Regelbesteuerung wird das <b>Entgelt je Steuersatz</b> ausgewiesen – nicht mehr nur die enthaltene Steuer. Die beiden Steuernummern trägst du unter Einstellungen → Imkereidaten ein.',
    'Neu einstellbar: <b>Umsatzsteuer auf Pfand</b> (Einstellungen → Steuer & Rechnungen). Voreingestellt bleibt es wie bisher ohne Steuer. Welche Behandlung für deinen Betrieb richtig ist, klärt der Steuerberater – die App entscheidet das nicht mehr stillschweigend für dich.',
    'Das <b>Honig-Etikett</b> schlägt jetzt eine echte Bezeichnung vor („Rapshonig" statt „Raps") und nennt bei Bio die vorgeschriebene <b>Herkunft der Zutaten</b> („EU-Landwirtschaft"). Hochgeladene Bio-Logos werden nicht mehr ins Quadrat gestaucht, sondern in ihrem echten Seitenverhältnis gedruckt.',
    'Im <b>Bestandsbuch</b> ist eine erfasste Wartezeit von <b>0 Tagen</b> jetzt als „0 Tage" zu lesen. Vorher sah sie aus wie eine fehlende Angabe – bei einer Kontrolle ein Unterschied.',
    'Am <b>Marktstand</b> bleiben Positionen, die sich nicht buchen ließen, im Warenkorb stehen, statt mit ihm gelöscht zu werden. Du siehst sofort, was noch offen ist.',
    'Eine <b>fehlgeschlagene Sicherung in den Ordner</b> meldet sich als Fehler, statt Erfolg zu melden – und der nächste Versuch kommt bald, nicht erst ein ganzes Intervall später.',
    'Der <b>Änderungsschutz</b> greift wieder zuverlässig: Wer die Rückfrage „Änderungen verwerfen?" einmal abbricht, wird beim nächsten Schließen erneut gefragt.',
    'Kleinigkeit am Rechnungs-PDF: Absenderzeile, Bio-Logos und die Fußzeile lagen unten übereinander – jetzt steht jedes für sich.',
    'Beim <b>Zusammenführen</b> zweier Sicherungen werden die Bestände der Abfüllungen nachgerechnet, damit Verkäufe von zwei Geräten nicht doppelt im Regal stehen. Eine <b>abgebrochene Datenwanderung</b> kann Verkäufen außerdem nicht mehr die Zuordnung nehmen.',
  ] },
  { version: '1.62', datum: '2026-09-21', punkte: [
    'Sicherheit: Eine <b>importierte Sicherung</b> wird jetzt geprüft, bevor etwas daraus verwendet wird. Eine präparierte Datei konnte bisher Code in der App ausführen – teils schon beim bloßen <b>Auswählen der Datei</b>, bevor man „Zusammenführen" überhaupt bestätigt hatte. Betroffen waren erfundene Bereichsnamen, Kennungen, Zahlenfelder und eingeschleuste Bildadressen (Logo, Zahlungs-QR, Bio-Logos).',
    'Zusätzlich hält jetzt auch die Anzeige selbst dagegen: alle 115 Stellen, an denen eine Kennung in ein HTML-Attribut geht, sind entschärft; Zahlenfelder werden als Zahl behandelt; Bildadressen müssen ein echtes Bild oder https sein.',
    'Der <b>Tabellen-Export</b> schleust keine Formeln mehr ein: Ein Text, der mit = + - @ beginnt, bleibt in Excel und LibreOffice Text statt zur Formel zu werden.',
    'Gefunden hat das eine externe Nachprüfung des Quelltextes. Rechtmäßige Daten bleiben unverändert – gültige Kennungen, echte Logos und normaler Text laufen durch wie bisher.',
  ] },
  { version: '1.61', datum: '2026-09-21', punkte: [
    'Sicherheit: <b>Bestätigungsfenster</b> („Wirklich löschen?") zeigten Namen bisher ungeprüft an. Ein Name aus einer <b>importierten fremden Sicherung</b> konnte darüber Code im Browser ausführen. Solche Texte werden jetzt als Text angezeigt, nicht als Anweisung.',
    'Aufgeräumt: Der <b>QR-Druckbogen</b> war zweimal im Code – einmal fürs Volk, einmal für die Charge. Jetzt gibt es eine Funktion für beides; Größe und Spalten sind Einstellungen.',
  ] },
  { version: '1.60', datum: '2026-09-20', punkte: [
    'In der <b>Betriebsbeschreibung</b> gibt es beim Abschnitt „Standortwahl und Umfeld" jetzt den Knopf <b>Zahlen aus den Standorten übernehmen</b>. Er schreibt Umkreis, Trachtanteil, bebauten Anteil und die größten Flächen je Standort als Text hinein – erhoben im Reiter „Standorte", samt Datum und Quelle. Dein eigener Text bleibt dabei stehen, die Zahlen hängen sich an.',
  ] },
  { version: '1.59', datum: '2026-09-20', punkte: [
    'Neu in den Statistiken: <b>Futter je Volk</b>. Verglichen wird der <b>Zucker</b>, nicht das Gebindegewicht – bei Sirup mit Mischverhältnis ist die eingetragene Menge schon der Zucker, Futterteig zählt zu 92 %, Fertigsirup zu 73 %. Mit Diagramm, Winterfutter-Anteil und der Abweichung jedes Volks vom Durchschnitt.',
    'Die <b>Völkerentwicklung</b> zeigt jetzt den Verlauf <b>innerhalb eines Jahres</b> – Stand an jedem Monatsende statt nur ein Punkt je Jahr. Über die Jahres-Knöpfe wechselst du das Jahr; „Alle Jahre" zeigt weiterhin die große Linie.',
    'Neu: der <b>Jahresbericht als PDF</b> – Kennzahlen, Ernte je Monat als Diagramm, Völkerverlauf, Ernte je Sorte, alle Chargen mit Abfüllungen und Beständen, Verkauf je Gebinde und Futter je Volk. Der Knopf steht oben in den Statistiken.',
  ] },
  { version: '1.58', datum: '2026-09-20', punkte: [
    'Neu: <b>Chargen von Hand anordnen.</b> Im Reiter Charge auf <b>Anordnen</b> tippen, die Zeilen am Griff ⠿ an die gewünschte Stelle ziehen, <b>Fertig</b> – das war es. Die Reihenfolge wird sofort gespeichert, überlebt das Neuladen und steht danach als Sortierung <b>Eigene</b> zur Wahl.',
    'Der <b>QR-Code einer Charge</b> entsteht am Ende eines langen Fensters. Die Ansicht springt jetzt dorthin, sobald er fertig ist – vorher sah es aus, als würde keiner erzeugt.',
  ] },
  { version: '1.57', datum: '2026-09-20', punkte: [
    'Der <b>Jahresfilter bei den Chargen</b> steht jetzt immer über der Liste – genau wie bei Inventar und Fütterung, mit „Alle" vorn und als Vorgabe. Vorher blieb er verborgen, solange es nur ein Jahr gab.',
    'Neu: Die <b>Sortierung ist wählbar</b> – nach <b>Nummer</b>, <b>Datum</b> oder <b>Menge</b>. Jede Imkerei nummeriert anders; eine feste Reihenfolge passt deshalb nie allen. Sortiert wird innerhalb der laufenden Chargen und innerhalb des Archivs.',
  ] },
  { version: '1.56', datum: '2026-09-20', punkte: [
    'Bei <b>Inventar und Verbrauchsmaterial</b> sind die drei Kacheln über der Tabelle weggefallen – sie wiederholten nur, was direkt darunter steht. Die Zeile <b>Gesamt</b> zählt nicht mehr jede Einheit einzeln auf; bei vielen Positionen wurde daraus eine Textwand. Sie nennt jetzt Anzahl und Wert, die Einheiten stehen je Art in ihrer Zeile.',
  ] },
  { version: '1.55', datum: '2026-09-20', punkte: [
    'Die <b>Chargenübersicht</b> trennt jetzt zwischen laufend und erledigt: Eine Charge, die <b>vollständig abgefüllt und ausverkauft</b> ist, rutscht unter einen Trennstrich in den Bereich <b>Archiv</b>. Gelöscht wird nichts – die Rückverfolgbarkeit endet nicht mit dem letzten Glas.',
    'Neu: ein <b>Jahresfilter</b> über der Liste (2026, 2025 …) samt <b>Alle</b>. Vorbelegt ist das jüngste Jahr, in dem es Chargen gibt.',
    'Jede Zeile nennt jetzt das <b>Anlegedatum</b> und sagt, woran man ist: „nicht abgefüllt", „12 zum Verkauf" oder „ausverkauft".',
  ] },
  { version: '1.54', datum: '2026-09-20', punkte: [
    'Behoben: Trägst du <b>Sorte und Laborwert nachträglich an einer Charge</b> ein, tauchten sie im Reiter „Sorte" nicht auf – die Tabelle las ausschließlich die Ernten. Jetzt stehen Chargen mit eigener Sorte dort mit drin, und zwar ohne doppelt zu zählen: von einer Charge zählt nur die Menge, die nicht schon aus einer Ernte stammt. Chargen aus Lagerbestand ohne Sorte werden eigens gemeldet – ohne sie stünde auf dem Etikett nur „Honig".',
    'Die <b>Gesamtübersicht beim Verbrauchsmaterial</b> zeigt jetzt die echten Einheiten: „50 kg · 12 Streifen · 200 Stück" statt einer Gesamtzahl „Stück", die Zucker und Streifen in einen Topf warf. Gilt ebenso für Behandlungsmittel und Futter, für die Liste, die PDF-Übersicht und die Excel-Mappe.',
    'Bei der <b>Abfüllung stehen Chargennummer und Losnummer nebeneinander</b>, wenn du ein eigenes Los führst – rechtlich zählt das Los, für deine Rückverfolgung die Charge. Auf dem Etikett steht die Chargennummer dann neben dem L.',
    'Der Reiter heißt schlicht <b>Chargen</b>; der erklärende Absatz darunter ist weg.',
  ] },
  { version: '1.53', datum: '2026-09-20', punkte: [
    'Das Feld heißt jetzt <b>Chargennummer</b> – so schreibt es der Duden, in einem Wort. Im Lebensmittelrecht heißt dieselbe Angabe „Los"; auf dem Etikett steht sie deshalb weiterhin mit vorangestelltem <b>L</b>.',
    'Die <b>Chargennummer steht jetzt in einer eigenen, fetten Zeile</b> auf dem Etikett. Vorher hing sie hinten an der MHD-Zeile und ging dort unter. Im <b>QR-Code</b> steht sie nun an erster Stelle, zusammen mit Bezeichnung, MHD und Füllmenge.',
    'Das <b>Mindesthaltbarkeitsdatum wird beim Abfüllen eingetragen</b>, nicht mehr beim Anlegen der Charge: Im Eimer ist Honig praktisch unbegrenzt haltbar, die Frist läuft ab dem Glas. Zwei Abfüllungen derselben Charge dürfen dadurch verschiedene Daten tragen. Vorgeschlagen werden zwei Jahre ab Abfülldatum.',
    'Neu: Beim Abfüllen kannst du eine <b>eigene Losnummer</b> eintragen – für alle, die je Abfülltag ein Los führen. Leer gelassen gilt weiter die Chargennummer.',
    'Neu: Das <b>Anlegedatum einer Charge</b> ist eintragbar. Bei vorhandenen Chargen trägt die App es aus der jüngsten enthaltenen Ernte nach.',
    'Abgefüllte Gläser stehen jetzt als <b>„zum Verkauf"</b> statt „im Bestand" – man sieht der Zahl an, dass die Ware abgefüllt ist und auf Kundschaft wartet.',
  ] },
  { version: '1.52', datum: '2026-09-05', punkte: [
    'Behoben: In „Was ist neu?" standen die Auszeichnungen als roher Text mitten im Satz (<b> und </b>). Hervorhebungen werden jetzt <b>fett dargestellt</b>, wie es gemeint war.',
  ] },
  { version: '1.51', datum: '2026-09-03', punkte: [
    'Stabilität: Wechselst du den Bereich, während eine Seite noch lädt, <b>steigt der alte Aufbau jetzt still aus</b>. Vorher konnte er die schon geöffnete Seite nach oben reißen oder eine Fehlermeldung zeigen, die zu einer längst verlassenen Seite gehörte.',
  ] },
  { version: '1.50', datum: '2026-09-03', punkte: [
    'Behoben: Beim <b>Eintragen einer Behandlung</b> stand unter „Mittel vom Verbrauchsmaterial abziehen" nur der Zucker zur Auswahl. Positionen aus älteren Fassungen und aus Importen hatten intern kein Typ-Kennzeichen und waren dadurch unsichtbar – sie standen in der Liste, aber nicht in der Auswahl. Jetzt greift dieselbe Einteilung wie in der Liste, und ein Behandlungsmittel ist immer wählbar, egal in welcher Einheit es geführt wird.',
    'Die <b>Einheiten</b> stimmen: Es gibt jetzt <b>Streifen, Beutel, Tafel und Packung</b> als Verbrauchseinheit. ApiLife Var, Thymovar und Bayvarol werden beim Anlegen von selbst als „Streifen" vorgeschlagen, Apiguard als „Beutel", Futterteig als „kg". Positionen ohne Einheit bekommen sie automatisch nachgetragen – vorher behauptete die Liste bei allem „Stück".',
    'In der Liste steht jetzt eindeutig, was gemeint ist: <b>„6 Packung × 2 Streifen = 12 Streifen"</b> statt „12 Stück".',
    'Die <b>Öko-Partner</b> sind keine zweite Liste mehr. „Abnehmer und Lieferanten" arbeitet direkt mit deinen Kontakten – derselbe Lieferant, den du im Wareneingang auswählst, trägt jetzt die Öko-Kontrollnummer und die Gültigkeit seines Zertifikats. Du trägst ihn nur noch einmal ein. Vorhandene Einträge werden automatisch zusammengeführt.',
    'Der Reiter <b>Zertifikate</b> ist weggefallen. Die Zertifikate der Lieferanten hängen jetzt <b>beim jeweiligen Partner</b> – mit Kontrollnummer, Gültigkeitsdatum, Link zur Bescheinigung und der Möglichkeit, das PDF direkt anzuhängen. Ein Knopf führt in die EU-Datenbank der Öko-Bescheinigungen. Das <b>eigene</b> Zertifikat hat jetzt seinen Platz in der Betriebsbeschreibung.',
  ] },
  { version: '1.49', datum: '2026-09-03', punkte: [
    'Behoben: Der <b>Offline-Speicher</b> konnte die App mit einer anderen Seite überschreiben. Wer die Landingpage oder das Impressum aufrief, bekam ohne Netz genau diese Seite statt des Imkerbuchs zu sehen. Jede Seite liegt jetzt unter ihrer eigenen Adresse im Speicher.',
    'Behoben: Eine <b>Rechnungsnummer</b> konnte doppelt vergeben werden – etwa nach einem zurückgespielten Backup oder wenn der Zähler von Hand zurückgesetzt wurde. Die Nummer wird jetzt aus dem tatsächlichen Bestand abgeleitet, und eine bereits festgeschriebene Rechnung lässt sich nicht ein zweites Mal festschreiben. Eine doppelte Nummer wäre ein Buchführungsfehler (§ 14 UStG).',
    'Behoben: <b>Bestandsmeldung</b> und <b>Tierseuchenkasse</b> widersprachen sich selbst. Oben stand die Zahl aller Völker, in der Tabelle nur die einem Stand zugeordneten – ein Volk ohne Standort fehlte, ein leerer Standort zählte mit. Beide Papiere haben jetzt eine Summenzeile, führen Völker ohne Standort eigens auf und erwähnen leere Standorte im Hinweis.',
    'Behoben: Die <b>Tierseuchenkasse</b> nannte den Stichtag 1. Januar, zählte aber die Völker von heute. Jetzt wird der Bestand zum Stichtag aus der Völker-Historie gerechnet, die heutige Zahl steht zum Vergleich daneben – mit dem Hinweis, dass der Stichtag je nach Bundesland abweicht.',
    'Behoben: Die <b>Preise beim Marktverkauf</b> waren nach einem Neuladen weg. Sie werden jetzt gespeichert.',
    'Beim <b>Zusammenführen einer Sicherung</b> steht jetzt, was genau übernommen wurde – aufgeschlüsselt nach Bereichen statt nur einer Gesamtzahl.',
  ] },
  { version: '1.48', datum: '2026-09-02', punkte: [
    'Die <b>Ernteprognose</b> steht jetzt im <b>Kassenbuch unter „Auswertung"</b> statt im Rechner – dort sucht man sie, wenn es ums Geld geht. Sie bringt ein eigenes Feld für die Selbstkosten je kg mit, vorbelegt mit deiner Völkerzahl und deinem Ertrag.',
  ] },
  { version: '1.47', datum: '2026-09-02', punkte: [
    'Behoben: Nach einer Sicherung stand in den Einstellungen und im Dashboard weiter der <b>alte Stand</b> („noch nie“ oder das alte Datum). Beide Anzeigen ziehen jetzt sofort nach.',
    'Der <b>Erinnerungs-Hinweis</b> oben lässt sich mit dem ✕ <b>dauerhaft ausblenden</b> – auch der rote. Zurückholen kannst du ihn in den Einstellungen unter „Sicherung“.',
    'Neu: <b>Ernteprognose</b> im Rechner und als Dashboard-Feld. Sie schätzt aus deinen eigenen Vorjahren, wie viel Honig dieses Jahr zusammenkommt und was er einbringt – mit Spanne, mit dem Erlös je kg aus deinen echten Verkäufen und, wenn du die Selbstkosten ausgefüllt hast, mit dem, was am Ende übrig bleibt.',
  ] },
  { version: '1.46', datum: '2026-09-01', punkte: [
    'Behoben: Auf dem <b>Honig-Etikett</b> lagen die Bio-Logos über der Anschrift und dem Öko-Code. Sie stehen jetzt <b>oben rechts</b> neben dem Namen der Imkerei – dort, wo man sie erwartet, und dort ist Platz.',
  ] },
  { version: '1.45', datum: '2026-09-01', punkte: [
    'Dieselbe Logik jetzt auch beim <b>Abfüllen</b>: Löschst du eine Abfüllung, kommen <b>Gläser, Deckel und Etiketten zurück in den Bestand</b>. Vorher blieben sie verbraucht.',
    'Korrigierst du die <b>Anzahl</b> einer Abfüllung, rechnet die App mit: von 50 auf 30 gestellt heißt 20 Gläser zurück im Lager. Bisher stand dort der Hinweis, dass du das von Hand nachziehen musst.',
    'Auch beim Abfüllen greift der Abzug jetzt auf die <b>nächste Position derselben Art</b> über – zwei Kartons derselben Glasgröße werden nacheinander leer statt „Bestand reicht nicht" zu melden.',
  ] },
  { version: '1.44', datum: '2026-09-01', punkte: [
    'Behoben: <b>Löschst du eine Fütterung, kommt der Zucker zurück in den Bestand.</b> Bisher blieb er für immer „verbraucht". Dasselbe gilt jetzt für Behandlungen und für das <b>Bearbeiten</b> – vorher zog jedes Speichern ein weiteres Mal ab.',
    'Behoben: Der Abzug <b>geht automatisch auf die nächste Position derselben Art über</b>. Hast du Zucker von 2025 und von 2026 und fütterst 50 kg, nimmt die App 25 kg aus dem einen und 25 kg aus dem anderen – vorher meldete sie „25 kg fehlten", obwohl in Summe genug da war. Abgebaut wird das Älteste zuerst; gewechselt wird nur innerhalb derselben Kategorie und Einheit.',
    'Behoben: Ein <b>eigenes Logo</b> mit durchsichtigem Hintergrund erschien auf der Rechnung als schwarzes Feld. Bilder werden jetzt vor dem Einbetten auf Weiß gelegt.',
    'Behoben: Die hinterlegten <b>Bio-Logos</b> (Bioland, EU-Bio …) standen auf der Rechnung gar nicht. Sie erscheinen jetzt unten links, zusammen mit dem <b>Code der Öko-Kontrollstelle</b> – eine Pflichtangabe bei Bio-Ware. Auch SVG-Logos funktionieren jetzt, vorher wurden sie stillschweigend übersprungen.',
  ] },
  { version: '1.43', datum: '2026-08-09', punkte: [
    'Eine Charge kann jetzt <b>selbst eine Honigsorte und einen Laborwert</b> tragen. Das brauchst du für Honig aus dem <b>Lagerbestand vergangener Jahre</b>: dort gibt es keine Ernte, aus der die App die Sorte ableiten könnte – bisher stand auf dem Etikett nur „Honig".',
    'Im Charge-Formular findest du dafür unter der Menge den Abschnitt <b>„Sorte und Labor"</b> mit Honigsorte, Wassergehalt und Datum des Laborbefunds.',
    'Sind Ernten verknüpft, bleibt alles wie bisher: die Sorte kommt von dort. Trägst du an der Charge trotzdem etwas ein, gewinnt deine Angabe – praktisch, wenn mehrere Ernten zu einem Verschnitt werden.',
    'Sorte und Wassergehalt stehen jetzt in der <b>Chargen-Übersicht</b>, im <b>Detailfenster</b>, im <b>QR-Code</b>, auf dem <b>Etikett</b>, im Marktverkauf, im Chargen-PDF und im Excel-Export.',
    'Fehlt bei einer Charge ohne Ernte die Sorte, sagt die App es beim Speichern und zeigt im Detailfenster einen Hinweis – blockiert aber nicht, weil das Laborergebnis oft später kommt.',
  ] },
  { version: '1.42', datum: '2026-08-07', punkte: [
    '<b>Ein Formular statt zwei.</b> „Neue Position" ist als eigener Knopf verschwunden – es gibt nur noch <b>Zugang / Einkauf</b>. Oben steht die Frage „Was kommt ins Lager?", und der erste Eintrag der Auswahl ist <b>„+ Neue Position anlegen"</b>. Dann klappt der ganze Steckbrief auf: Bezeichnung, Kategorie, Packungs-Rechner, Gebindegröße, Pfand, MHD, Mindestbestand, Zuordnung.',
    'Eine <b>vorhandene</b> Position gewählt? Dann bleibt das Formular kurz: Datum, Menge, Preis, Lieferant, Beleg. Alles andere ist ja bekannt.',
    'Die <b>Stammdaten</b> einer Position änderst du weiter, indem du ihre <b>Zeile in der Liste antippst</b> – dieses Formular beschreibt nur noch, was die Position ist, und bucht keinen Einkauf mehr.',
    'Nebenbei behoben: das <b>doppelte Datum</b> (Kaufdatum und Zugang für denselben Tag) ist weg, und Felder, die sich ein- und ausblenden, nehmen die ganze Breite – dadurch verrutscht nichts mehr.',
    'Auch neue Positionen bekommen ihren Bestand jetzt über eine <b>echte Zugangs-Buchung</b> („vorher 0, nachher 100") statt still gesetzt zu werden. Damit stimmt der Lagerwert vom ersten Tag an.',
  ] },
  { version: '1.41', datum: '2026-08-07', punkte: [
    'Der <b>Lagerwert rechnet jetzt mit den echten Einkaufspreisen</b>. Kaufst du zwischendrin teurer nach, bleibt der alte Bestand zu seinem alten Preis bewertet: 175 kg zu 1,64 € plus 25 kg zu 1,80 € sind <b>332 €</b> – nicht 360 €, wie es mit einem einzigen Preis herauskäme. In der Liste steht dann „Ø 1,66 €".',
    'Verbraucht wird immer das Älteste zuerst, im Lager liegen also die jüngsten Einkäufe – so rechnet die App auch.',
    '<b>Ein Schritt statt zwei</b>: Beim Anlegen einer Position steht unten „Als Einkauf ins Kassenbuch buchen" – und darunter klappen Kaufdatum, Beleg und Lieferant auf. Kein zweites Formular mehr. „Zugang / Einkauf" ist für spätere Nachkäufe.',
    'Im Zugangs-Formular steht die <b>Art des Zugangs</b> jetzt oben über die ganze Breite, statt neben dem Datum eingeklemmt – dort sah es verrutscht aus, sobald sich Felder ein- und ausblendeten.',
  ] },
  { version: '1.40', datum: '2026-08-07', punkte: [
    'Neu: <b>Zugang / Einkauf</b> beim Verbrauchsmaterial und Inventar – das Gegenstück zum Abgang. Der Bestand steigt, und ein <b>Einkauf wird als Ausgabe im Kassenbuch gebucht</b>, in der passenden Kategorie (Futter, Gläser/Etiketten, Beuten/Rähmchen …). Vorher fehlte das ausgegebene Geld im Kassenbuch.',
    'Damit ist auch das <b>Nachkaufen</b> gelöst: Menge und neuer Preis eintragen – die App bucht, erhöht den Bestand und übernimmt den neuen Preis für den Lagerwert.',
    'Beim <b>Anlegen</b> einer neuen Position fragt die App, ob der Einkauf gleich mitgebucht werden soll (Häkchen, vorbelegt).',
    'Nicht jeder Zugang kostet Geld: <b>Eigenproduktion, Geschenk und Korrektur</b> erhöhen nur den Bestand und werden nicht gebucht.',
    'Zugänge lassen sich wie Abgänge <b>ändern und zurücknehmen</b> – Bestand und Kassenbuch gehen mit.',
    'Behoben: In Formularen wurden Zahlen mit <b>Komma</b> („0,50") bei Ein-/Ausblende-Regeln nicht erkannt. Dadurch verschwand zum Beispiel „Pfand erhoben seit", sobald ein Pfand mit Komma eingetragen war.',
  ] },
  { version: '1.39', datum: '2026-08-07', punkte: [
    'Abgänge lassen sich jetzt <b>ändern und zurücknehmen</b> – Zeile in der Liste antippen. Gibt ein Kunde die Ware zurück, kommt die Menge wieder auf den Bestand und die Einnahme wird aus dem Kassenbuch genommen. Vorher war ein Abgang für immer gebucht.',
    'Zurückgelegt wird genau die Menge, die damals wirklich abgezogen wurde – reichte der Bestand nicht, war es weniger als gebucht.',
    'Beim <b>Verkauf an wen</b> kannst du jetzt direkt einen <b>neuen Kunden anlegen</b>, ohne den Vorgang abzubrechen. Der neue Kunde ist sofort ausgewählt. Genauso bei der Pfand-Rücknahme.',
    'Auch eine <b>Pfand-Rücknahme</b> lässt sich zurücknehmen, falls sie falsch gebucht war.',
  ] },
  { version: '1.38', datum: '2026-08-07', punkte: [
    'Die Tagesbienen sind fertig ausgearbeitet: hell gezeichnete Kantenlinien, die im Dunkelmodus als Haare aufblitzten, sind gedämpft – Sonnenstrahlen, Flügel, Tasse und Kissen bleiben unangetastet. Auf hellem und dunklem Grund geprüft, alle 24.',
  ] },
  { version: '1.37', datum: '2026-08-07', punkte: [
    'Das Pfand steckt jetzt hinter einem Häkchen <b>„Mehrweg mit Pfand"</b> – wie beim Mindesthaltbarkeitsdatum. Ohne Haken bleibt das Formular kurz, denn die meisten Gebinde sind Einweg.',
    'Die Tagesbienen sind noch einmal freigestellt: zwischen Biene und Laptop und in den Brillengläsern blieben eingeschlossene Reste des hellen Hintergrunds stehen, die im Dunkelmodus durchschimmerten. Auch die Konturen sind jetzt sauber gerechnet statt hart abgeschnitten.',
  ] },
  { version: '1.36', datum: '2026-08-07', punkte: [
    'Neu: <b>Pfand für Mehrweg-Gebinde</b> – für alle, die Gläser oder Eimer zurücknehmen. Trag am Gebinde „Pfand je Gebinde" ein, dann zeigt die App unter Verbrauchsmaterial <b>wie viele beim Kunden sind</b> und <b>wieviel Pfand offen ist</b>.',
    '<b>Rücknahme buchen</b>: Anzahl und von wem – der Bestand steigt wieder, und das Pfand wird als Ausgabe im Kassenbuch gebucht, ohne Umsatzsteuer. Denn Pfand ist eine Schuld, kein Erlös.',
    'Beim Anlegen einer Rechnungsposition wird das Pfand aus dem Gebinde <b>vorgeschlagen</b> – man muss es nicht zweimal wissen.',
    'Wer <b>kein</b> Pfand nimmt, sieht davon nichts: das Pfandfeld leer lassen genügt, es gibt keinen Schalter zu suchen.',
    'Die Tagesbienen sind neu freigestellt – im <b>Dunkelmodus</b> schimmerte vorher ein heller Rand durch.',
  ] },
  { version: '1.35', datum: '2026-08-07', punkte: [
    'Neu im Dashboard: die <b>Tagesbiene</b> neben der Begrüßung – für jede Stunde ein eigenes Bild, von „Mitternacht" bis „Schlafenszeit". Bleibt die App offen, wechselt es beim Stundenwechsel von selbst.',
    'Der Widgets-Knopf hat sein Symbol verloren und das Bienen-Emoji ist aus dem Titel raus – die echte Biene daneben genügt.',
    'Verbrauchsmaterial kennt jetzt <b>zwei Einheiten</b> – die, in der du zählst, und die, in der verbraucht wird. Beispiel Zucker: Bestand <b>7 Sack</b>, Inhalt je Sack <b>25 kg</b>, Preis je Sack <b>41 €</b> → die App rechnet <b>175 kg im Lager</b> und <b>1,64 € je kg</b>.',
    'Genauso bei Gläsern: 2 Karton × 30 Gläser = 60 Gläser, und aus dem Kartonpreis wird der Preis je Glas. Alles rechnet auf das einzelne Produkt herunter.',
    'Abgezogen wird immer in der <b>inneren</b> Einheit: Fütterung nimmt Kilo, Abfüllen nimmt Gläser. Nach 30 kg Fütterung stehen 145 kg da – angezeigt als „5,8 Sack × 25 kg".',
    'Kaufst du nicht in Packungen, lässt du die zweite Zeile leer – dann ist es wie vorher.',
  ] },
  { version: '1.34', datum: '2026-08-06', punkte: [
    'Verbrauchsmaterial neu geordnet – <b>in der Reihenfolge, in der man einkauft</b>. Man kauft Säcke, nicht Kilos: unter dem Bestand stehen jetzt „Packungen" und „Inhalt je Packung" und rechnen ihn aus. 2 × 25 kg ergibt 50 kg.',
    '<b>Zahl und Einheit stehen nebeneinander</b>, nicht mehr untereinander – ebenso Packungen/Inhalt, Packungspreis/Stückpreis, Mindestbestand/Zugang und die Zuordnungen.',
    'Darunter steht die Rechnung im Klartext: „2 × 25 kg = 50 kg Bestand · 41,00 € je Packung = 1,64 € je kg · Warenwert 82,00 €".',
    'Beim <b>Bearbeiten</b> wird der Bestand nie überschrieben – nach Verbrauch stehen dort 12 kg, und die Zeile sagt „Einkauf 50 kg · im Bestand jetzt 12 kg". Wer Bestand oder Preis selbst eintippt, behält seine Zahl.',
  ] },
  { version: '1.33', datum: '2026-08-06', punkte: [
    'Neu beim Verbrauchsmaterial: <b>Kilopreis ausrechnen lassen</b>. Trage ein, was eine Packung enthält und was sie kostet – 25 kg für 41 € –, und die App setzt den Preis je kg (1,64 €). Gilt für jede Einheit, auch Kanister Sirup oder Karton Gläser. Packungsangaben bleiben gespeichert, damit du sie später ändern kannst.',
    'Die Beschriftungen folgen jetzt der Einheit: „Preis je kg", „Bestand (kg)", „Eine Packung enthält (kg)" – statt überall „Stück".',
    'Neue Kategorie <b>Eimer/Hobbock</b> – die fehlte.',
    'Das <b>Mindesthaltbarkeitsdatum</b> ist jetzt eine Frage: erst „Hat ein MHD" anhaken, dann erscheint das Datumsfeld. Gläser, Deckel und Eimer haben keins und fragen auch nicht mehr danach.',
    'Behoben: den <b>Vorschlagsfeldern fehlte der Pfeil</b> zum Aufklappen (Einheit, Kategorie, Bezeichnung …) – man konnte nicht erkennen, dass es dort etwas zur Auswahl gibt. Ursache war eine überschriebene Stilregel.',
  ] },
  { version: '1.32', datum: '2026-08-06', punkte: [
    'Bio → Standorte rechnet jetzt um die <b>Koordinaten des Bienenstands</b> – die sind da, wo keine Adresse ist. Sie stehen oben im Formular, aus dem Stand übernommen, und lassen sich überschreiben.',
    'Neu daneben: <b>„Aktuellen Standort übernehmen"</b> – am Stand selbst der kürzeste Weg zu genauen Koordinaten.',
    'Die Adresse ist nur noch der Umweg: „Adresse suchen" füllt die Koordinatenfelder, damit du siehst, wo die App gelandet ist, bevor gerechnet wird. Sind keine Koordinaten da, sucht „Amtlich berechnen" die Adresse selbst.',
    'Hat der Stand noch keine Koordinaten, bekommt er sie beim Speichern mit – dann stimmen auch Wetter und Kartenlink. Vorhandene Koordinaten werden nicht angetastet.',
  ] },
  { version: '1.31', datum: '2026-08-06', punkte: [
    'Verbrauchsmaterial hat jetzt ein Feld <b>Gebindegröße</b>. Damit sagst du beim Anlegen, für welche Größe eine Position gilt („500 g", „1 kg", eigene Größen wie „30 g" gehen auch) – vorher hat die App das aus dem Namen geraten. Deckel und Etiketten, die für mehrere Größen passen, lässt du leer.',
    'Beim Abfüllen steht jetzt <b>oben, was im Lager liegt</b> – jede Position mit Bestand, leere rot. Vorher sah man den Bestand erst, wenn man eine Auswahlliste aufklappte.',
    'Ist noch <b>gar kein</b> Verbrauchsmaterial mit der Einheit „Stück" angelegt, verschwand der ganze Abschnitt lautlos. Jetzt erklärt er sich und hat einen Knopf <b>„Gläser jetzt anlegen"</b> – die neue Position erscheint sofort in den Auswahllisten, ohne das Abfüllen abzubrechen.',
    'Reicht der Bestand nicht, steht das vor dem Speichern da: „… fehlen, der Bestand geht auf 0". Ins Minus läuft nichts, und die Fehlmenge wird nach dem Buchen noch einmal gemeldet.',
  ] },
  { version: '1.30', datum: '2026-08-06', punkte: [
    'Bio → Standorte rechnet jetzt über <b>denselben amtlichen Dienst wie der GeoBox-Viewer Bienen</b> – die Auswertung, die deine Kontrollstelle kennt. Feine Aufschlüsselung statt Sammelbegriffen: Laubwälder, Nadelwälder, Mischwälder, Obst-und Beerenobstbestände, Weinbauflächen, Wiesen und Weiden … Dauer: wenige Sekunden.',
    'Die Prozente rechnet die App aus den mitgelieferten Quadratmetern selbst – auf <b>0,1 %</b> genau. Der Viewer selbst rundet auf ganze Prozent (Summe 99 %).',
    'Neu: <b>zwei automatische Rückfall-Ebenen.</b> Ist der Dienst offline, nimmt die App CORINE Land Cover des Bundesamtes für Kartographie und Geodäsie; schweigt auch das, OpenStreetMap. Welche Quelle geantwortet hat – und was zuvor nicht erreichbar war – steht danach im Feld „Quelle der Zahlen" und damit in den Unterlagen.',
    'Die Klassennamen sind wörtlich die amtlichen (aus dem Dienst abgefragt, nicht selbst formuliert), deshalb passen alle Quellen zeilenweise zusammen und lassen sich über die Jahre vergleichen.',
  ] },
  { version: '1.29', datum: '2026-08-06', punkte: [
    'Neu bei Bio → Standorte: <b>amtliche Landbedeckung auf Knopfdruck</b>. Die App holt CORINE Land Cover 5 ha vom Bundesamt für Kartographie und Geodäsie (offen lizenziert, dl-de/by-2-0) und rechnet die Anteile im Umkreis selbst aus – <b>lückenlos</b>, im Test 100,0 % des Kreises statt „ein Viertel nicht erfasst" wie bei OpenStreetMap.',
    'Beide Quellen bleiben wählbar: „Amtlich berechnen" kann dir als Unterlage dienen; ob sie reicht, entscheidet deine Kontrollstelle. „Schnell (OpenStreetMap)" ist feiner und aktueller, aber lückenhaft. Die Quelle wird mitgeschrieben und steht in den Bio-Unterlagen.',
    'Gerechnet wird nicht abgetastet, sondern jede amtliche Fläche exakt mit dem Kreis verschnitten. Gegen ein unabhängiges Punktraster geprüft: Abweichung höchstens 0,5 Prozentpunkte.',
    'Grenzen stehen offen dabei: Datenstand 2018, kleinste erfasste Fläche 5 ha, nur Deutschland – und die Abfrage lädt rund 1 MB und braucht etwa eine halbe Minute.',
    'Neu beim <b>Abfüllen</b>: Gläser, Deckel und Etiketten gehen vom Verbrauchsmaterial ab. Je Gebindegröße eine eigene Auswahl (mit Vorschlag aus dem Namen), Deckel und Etiketten über alle Größen zusammen. Vorher siehst du zeilenweise, was abgeht und was übrig bleibt.',
  ] },
  { version: '1.28', datum: '2026-08-06', punkte: [
    'Neu: <b>Abgang / Verkauf</b> bei Inventar und Verbrauchsmaterial. Damit buchst du Bestand raus – verkauft, selbst verbraucht, kaputt, verschenkt oder als Korrektur. Vorher siehst du, was der Bestand danach ist.',
    'Ein Verkauf wird zusätzlich als Einnahme im Kassenbuch gebucht (Kategorie „Materialverkauf") – mit Käufer und Belegnummer im Text. Damit fehlt der Erlös am Jahresende nicht.',
    'Jeder Abgang bleibt erhalten: unter der Positionsliste stehen alle Abgänge des Jahres mit Datum, Menge, Grund, Preis und Erlös, samt Summe. Als PDF gibt es die Jahresübersicht „Abgänge" mit einer Auswertung nach Grund.',
    'Im Datensatz stehen Bestand vorher und nachher – so bleibt nachvollziehbar, was der Abgang mit dem Lager gemacht hat, auch wenn die Position später bearbeitet wird.',
    'Bei Verbrauchsmaterial heißt „Kaufdatum" jetzt <b>Zugang</b>, und das Ablaufdatum ist ausdrücklich als optional gekennzeichnet – ohne Datum erinnert die App auch nicht.',
  ] },
  { version: '1.27', datum: '2026-08-06', punkte: [
    'Verbrauchsmaterial hat jetzt eine <b>Einheit</b> – Mittelwände und Zucker in kg, Sirup in Litern, Säuren in ml, Gläser in Stück. Sie wird aus der Bezeichnung vorgeschlagen und ist überschreibbar; nur bei „Stück" wird auf ganze Zahlen gerundet. Die Beschriftung des Bestandsfeldes nennt die Einheit mit.',
    'Beim Erfassen einer <b>Fütterung</b> (mit und ohne Rechner) kannst du die passende Position aus dem Verbrauchsmaterial wählen – beim Speichern wird abgezogen. Positionen in kg ziehen bei Zuckerwasser den reinen Zucker ab, bei Futterteig und Fertigsirup das Gewicht; Positionen in Litern den angesetzten Sirup – jeweils mal der Zahl der gefütterten Völker. Ein Hinweis zeigt vorher, was abgezogen wird und was übrig bleibt.',
    'Dasselbe bei der <b>Behandlung</b>, einzeln und als Sammel-Erfassung: Menge je Volk × Anzahl der Völker wird vom gewählten Mittel abgezogen.',
    'Reicht der Bestand nicht, geht er auf null und die App sagt dir, wie viel gefehlt hat – statt stillschweigend ins Minus zu laufen. Fällt der Bestand unter den Mindestbestand, greift die vorhandene Erinnerung.',
    'Der GeoBox-Viewer stand mit einer Adresse in der App, die auf eine Fehlerseite führte. Jetzt stehen beide bekannten Adressen dort, mit dem klaren Hinweis, dass das Portal oft nicht erreichbar ist – die automatische Berechnung braucht es nicht.',
  ] },
  { version: '1.26', datum: '2026-08-06', punkte: [
    'Neuer Reiter <b>Bio</b> mit zwei Bereichen für die Öko-Kontrolle.',
    '<b>Betriebsbeschreibung</b>: zwölf Abschnitte von „Betrieb und Verantwortliche" über Wachs, Fütterung und Tiergesundheit bis zu den Aufzeichnungen. Jeder Abschnitt hat einen Hinweis, was dort typischerweise hineingehört; oben siehst du, wie viele schon ausgefüllt sind.',
    '<b>Standorte</b>: je Bienenstand die Landbedeckung im Umkreis. Die Anteile rechnet der GeoBox-Viewer aus (Punkt setzen, Umkreis einstellen, rechnen lassen) – die Prozente trägst du hier ein, mit Datum und Quelle. Die Zeilen sind frei benennbar und erweiterbar, weil die Bezeichnungen im Viewer abweichen können.',
    'Dazu ein Tortendiagramm und drei Kacheln: Tracht/Vegetation, Bebauung/Verkehr/Industrie und Sonstiges. Die Summe wird geprüft und meldet sich, wenn sie nicht 100 % ergibt.',
    'Der Umkreis ist frei einstellbar mit Schnellwahl 1,5 / 3 / 3,5 / 5 km – vorbelegt sind 3,5 km.',
    'Verschmutzungsquellen im Umkreis (Autobahn, Industrie, Deponie, Müllverbrennung, Klärwerk, Flughafen, konventionelle Sonderkultur) lassen sich anhaken, dazu ein Feld für Abstände und Anmerkungen.',
    'Vier weitere Bereiche im Reiter Bio: <b>Hygiene</b> (Hygieneplan und die durchgeführten Reinigungen als Einzelnachweise), <b>Abnehmer & Lieferanten</b> (mit Öko-Kontrollnummer des Partners und Ablauf des Zertifikats), <b>Zertifikate und Begleitpapiere</b> (Art, Aussteller, Nummer, gültig bis und wo das Original liegt) und <b>Förderverfahren</b> (Programm, Stelle, Aktenzeichen, Stand, Frist, Betrag).',
    'Läuft ein Zertifikat ab oder rückt eine Frist näher, steht das als farbige Marke direkt am Eintrag – rot, wenn das Datum vorbei ist.',
    'Ist ein Server überlastet, probiert die App die nächsten – bei OpenStreetMap kommt das vor. Die Abfrage holt nur die Flächenarten, die auch gebraucht werden; das macht sie um ein Vielfaches schneller.',
    'Neu: die Landbedeckung lässt sich <b>automatisch berechnen</b>. Du tippst die Adresse des Standes ein, die App holt die Koordinaten und rechnet die Flächenanteile im Umkreis aus OpenStreetMap aus – der GeoBox-Viewer deckt nur Rheinland-Pfalz ab und hilft außerhalb nicht. Steht beim Stand eine Koordinate, geht es auch direkt darüber.',
    'Damit nichts geschönt wird: der Teil, für den OpenStreetMap keine Angabe hat, erscheint als eigene Zeile „Nicht in OpenStreetMap erfasst". OpenStreetMap ist keine amtliche Quelle – verlangt die Kontrollstelle eine amtliche Zahl, bleibt der Weg über das Geoportal, und alle Zeilen sind überschreibbar.',
    'Die Umstellung auf Bio lässt sich jetzt direkt im Reiter Bio schalten – zusammen mit Kontrollstelle und Verband. Gespeichert wird weiterhin in den Imkereidaten, du musst also nicht mehr in die Einstellungen wechseln.',
    'Neue PDF „Unterlagen zur Öko-Kontrolle": Betriebsbeschreibung, je Standort die Flächentabelle samt Summen, Verschmutzungsquellen und Anmerkungen – und die vier Listen als Tabellen.',
  ] },
  { version: '1.25', datum: '2026-08-01', punkte: [
    'Im Reiter „Fütterung“ stehen jetzt zwei Wege nebeneinander: „+ Fütterung“ wie bisher (alles selbst eintragen) und neu „+ Fütterung mit Futter-Rechner“.',
    'Beim Weg über den Rechner wandern Datum, Futterart mit Mischverhältnis und die Menge je Volk direkt ins Formular „Fütterung erfassen“ – du musst nichts abschreiben.',
    'Die Völker-Auswahl zählt dann gegen die Zahl aus dem Rechner: „0 von 6 ausgewählt“. Hakst du mehr Völker an, wird die Zahl rot und ein Knopf bietet an, den Rechner auf die neue Völkerzahl anzupassen – deine übrigen Eingaben bleiben dabei erhalten.',
    'Unten gibt es zwei Arten zu speichern: nur „Speichern“ oder „Speichern + in Aufgaben“. Letzteres legt für <b>jede</b> Fütterung eine Aufgabe an – auch für die erste, die kommt gleich als erledigt hinein und steht damit in der Historie. Die weiteren bekommen ihren Termin aus dem Abstand, mit Menge je Volk und den gewählten Völkern.',
    'Der frühere Knopf „Plan als Aufgaben“ im Rechner ist damit entfallen; das macht jetzt das Speichern.',
    'Das Formular heißt beim Rechner-Weg „Fütterung aus Futter-Rechner erfassen“ und hat ein eigenes Feld „Sirup je Volk (Liter)“ – ändere die Liter, und die Zuckermenge darunter rechnet mit (und umgekehrt). „Winterfutter“ und die Erinnerung sind dort ausgeblendet: 3:2 dick gilt als Winterfutter, 1:1 dünn als Reizfutter, und die Folgetermine macht „Speichern + in Aufgaben“.',
    'Im Formular steht links „‹ Zurück zum Rechner“: du änderst kurz einen Wert und kommst zurück, ohne abzubrechen. Stand, Funktion und die schon gesetzten Häkchen bleiben dabei erhalten.',
  ] },
  { version: '1.17', datum: '2026-08-01', punkte: [
    'Rechnungspositionen haben jetzt ein Feld „Pfand je Gebinde“ – für Glas, Eimer oder Kiste. Der Pfand steht als eigene Spalte in der Rechnung und wird in der Summe getrennt ausgewiesen.',
    'Neu: Rabatt und Skonto, bewusst getrennt. <b>Rabatt</b> (Prozent oder Betrag, mit Grund wie „Großkunde“) mindert die Rechnung sofort und damit auch die Umsatzsteuer. <b>Skonto</b> wird nicht abgezogen, sondern als Zahlungsbedingung ausgewiesen („bei Zahlung bis … 2 %“) – es wirkt erst, wenn wirklich früh gezahlt wird.',
    'Dazu ein Zahlungsziel in Tagen; das Fälligkeitsdatum steht in der Rechnung und in der PDF. Der Pfand bleibt außerhalb von Rabatt und Skonto; seine Umsatzsteuer folgt dem gewählten Pfandsteuersatz.',
    'Kunden lassen sich jetzt dort anlegen, wo man sie braucht: in der Rechnung direkt neben der Kundenauswahl und ebenso beim Verkauf. Der neue Kunde ist sofort gesetzt – der Umweg über Kassenbuch → Kunden & Lieferanten fällt weg.',
    'Die erste Fütterung darf eine eigene Menge haben, und zwar in <b>Litern Sirup</b> – so wie du es einfüllst. Die App rechnet daraus, wie viel Futter das ergibt, und verteilt den Rest gleichmäßig auf die weiteren Termine. Lässt du das Feld leer, sind alle Gaben gleich groß.',
    'Im Reiter „Fütterung" zeigten „Futter" und „Zucker verbraucht" dieselbe Zahl. Jetzt stehen dort drei verschiedene Größen: <b>Zucker</b> (kg), <b>Sirup angesetzt</b> (Liter) und der Zucker in den Winterfutter-Gaben. In der Liste steht unter den Kilogramm die Litermenge.',
    'Beim Volk stand in der Fütterungs-Tabelle zweimal dieselbe Zahl („Menge" und „Zucker"), weil die Menge bei Zuckerwasser schon der reine Zucker ist. Die Zuckerspalte erscheint jetzt nur noch, wenn sie etwas Neues sagt – etwa bei Futterteig oder Fertigsirup. Dafür steht dort neu die Spalte „Sirup (L)": wie viel Liter tatsächlich ins Volk gelaufen sind, samt Summe darunter.',
    'Liter Sirup lassen sich jetzt in <b>jedem</b> Fütterungs-Formular eintragen – beim Volk, beim Bearbeiten eines Eintrags, bei der Sammel-Fütterung und in der Sammel-Erfassung. Liter und Kilogramm rechnen in beide Richtungen mit; wechselst du die Futterart auf 1:1 oder 3:2, wird neu gerechnet. Bei Futterteig oder Fertigsirup ist das Liter-Feld ausgegraut, dort gibt es keine Ansatzmenge.',
    'Behoben: „Nach Updates suchen" konnte im Fehlerfall die zwischengespeicherte Seite lesen und meldete dann „du hast bereits die neueste Version", obwohl auf dem Server schon eine neuere lag. Die Prüfung umgeht den Zwischenspeicher jetzt vollständig und nennt in der Meldung auch die Version, die auf dem Server liegt.',
    'Eine Charge lässt sich jetzt auch aus vorhandenem Lagerbestand anlegen – für Honig, der schon im Eimer stand, bevor du die App benutzt hast, und dem keine Ernte zuzuordnen ist. Bei „Neue Charge“ wählst du dazu oben „Aus vorhandenem Lagerbestand“ und trägst die Menge ein; hast du noch keine Ernte erfasst, ist das gleich vorbelegt.',
    'Beides ist kombinierbar: mit „Beides zusammen“ hakst du Ernten an <b>und</b> gibst eine Lagermenge dazu – die Gesamtmenge addiert sich von selbst.',
    'Zum Lagerbestand gehört ein Feld „Woher stammt dieser Lagerbestand?“. Ohne erfasste Ernte ist das der einzige Herkunftsnachweis, deshalb erinnert die Charge daran, wenn es leer bleibt. In der Rückverfolgung erscheint der Lagerbestand als eigene Zeile.',
    'Das Mischverhältnis steht jetzt von Anfang an auf 1:1 dünn.',
    'Der Futter-Rechner zeigt unter den Kacheln jetzt eine Tabelle „Was an jedem Termin zu tun ist“: je Termin steht dort, wie viel Zucker du abwiegen und wie viel Wasser du dazugeben musst, damit es für alle Völker reicht, und wie viel Liter je Volk hineingehen – plus eine Zeile für alle Gaben zusammen. Du musst nichts mehr selbst umrechnen; die Mengen zum Abwiegen stehen größer und in Honigfarbe, damit sie ins Auge fallen.',
    'Der Futter-Rechner kennt jetzt Anzahl der Fütterungen, Abstand in Tagen und den Beginn. Die wichtigste Zahl steht als eigene Kachel: <b>Liter Sirup je Volk und Fütterung</b> – dazu, wie viel du je Termin für alle Völker ansetzen musst, und die Termine im Klartext.',
    'Neuer Knopf „Plan als Aufgaben“: legt für jeden Termin eine Aufgabe an – mit Menge je Volk im Titel und der Ansatzmenge in der Notiz.',
    '„Als Fütterung übernehmen“ übernimmt jetzt eine einzelne Gabe (nicht die Gesamtmenge) und setzt den Abstand gleich als Wiedervorlage.',
  ] },
  { version: '1.16', datum: '2026-08-01', punkte: [
    'Im Kalender lässt sich jetzt jeder Tag antippen: ein freier Tag öffnet gleich das Formular mit diesem Datum, ein belegter zeigt erst, was ansteht – mit „Neue Aufgabe“ darunter.',
    'Erledigte Aufgaben stehen jetzt auch im Kalender: der Tag bekommt einen grünen Punkt, und in der Tagesübersicht steht der Eintrag ausgegraut mit grünem Vermerk „erledigt“ – nicht mehr durchgestrichen, damit der Titel lesbar bleibt. So findest du die erste, gerade erfasste Fütterung dort wieder.',
    'Ist ein Termin vorbei und die Aufgabe nicht erledigt, ist der Punkt im Kalender rot und in der Tagesübersicht steht rot „überfällig“ daneben.',
    'Die Aufgaben in dieser Tagesübersicht kannst du direkt antippen, um sie zu bearbeiten; Volk und aktueller Stand stehen auch dort. Daneben sitzt ein Papierkorb-Symbol: damit löschst du eine Aufgabe sofort, ohne sie erst zu öffnen.',
    'Hängt eine Aufgabe am ganzen Stand, steht in der Liste jetzt auch die Völkerzahl dabei – z. B. „Heimstand Obstwiese · 7 Völker“. Sie wird bei jeder Anzeige neu gezählt.',
    'Auch bei Aufgaben, die schon vorher entstanden sind, steht Volk und Stand jetzt dabei – Behandlungs-Aufgaben werden dafür einmalig ans Volk gehängt. Selbst angelegte Aufgaben ohne Volk bleiben ohne Zeile, bis du sie öffnest und einen Stand oder ein Volk wählst.',
    'Beim Anlegen einer Aufgabe steht die Völkerzahl wieder dabei: wählst du kein einzelnes Volk, siehst du, für wie viele Völker am gewählten Stand die Aufgabe gilt – der Funktions-Filter zählt mit.',
  ] },
  { version: '1.15', datum: '2026-08-01', punkte: [
    'Beim Anlegen einer Aufgabe wählst du jetzt Bienenstand und Volk aus – einzeln anklickbar und mit Filter: erst Stand, wahlweise noch die Funktion (z. B. nur Wirtschaftsvölker), dann das Volk. Wählst du ein Volk, springt der Stand-Filter von selbst mit.',
    'Damit greift die Nachführung auch bei Aufgaben, die du selbst anlegst: wanderst du das Volk später woanders hin, zeigt die Aufgabe sofort den neuen Stand – und oben erscheint einmal der Hinweis dazu.',
    'Eine Aufgabe darf auch nur an einem Stand hängen, ohne einzelnes Volk – dann steht in der Aufgabe der Stand.',
    'Bei den Imkereidaten gibt es ein Feld für die Mitgliedsnummer der Berufsgenossenschaft (SVLFG). Sie erscheint in „Profil & Imkerei“.',
  ] },
  { version: '1.14', datum: '2026-08-01', punkte: [
    'Berichtigt: Die Zuckermenge deiner bisherigen Fütterungen wurde falsch gerechnet. Bei „Menge (kg)“ trägt man den reinen Zucker ein (nicht Liter Sirup) – die App hatte davon noch 60 % abgezogen. Jetzt zählt die Menge voll als Zucker, und in PDF und Kachel stehen wieder deine echten Werte. Kein Eintrag musste dafür geändert werden.',
    'Aus zwei Futter-Rechnern ist einer geworden, und der steht dort, wo gefüttert wird: im Reiter „Fütterung“. Im Rechner ist die Gruppe „Fütterung“ dafür entfallen.',
    'Die Reihenfolge folgt jetzt dem Gedanken: eingelagertes Futter je Volk, Verhältnis, Anzahl Völker – heraus kommt, wie viel Zucker du kaufen musst (auch in Säcken), wie viel Wasser dazukommt und wie viel Liter Sirup das wird, je Volk und gesamt.',
    '„Als Fütterung übernehmen“ schreibt jetzt den reinen Zucker je Volk ins Mengenfeld – passend dazu, wie das Feld benutzt wird.',
  ] },
  { version: '1.13', datum: '2026-08-01', punkte: [
    'Die alte „Honigpreis-Kalkulation“ ist entfallen – sie hat dieselbe Frage beantwortet wie die neue Vollkostenrechnung, nur ungenauer. Die Karte heißt jetzt „Honigpreis: Selbstkosten je Glas“ und rechnet den Gewinnanspruch über das Unternehmenswagnis gleich mit.',
    'Beim Mischverhältnis steht jetzt überall nur „3:2 dick“ und „1:1 dünn“ – ohne weitere Erklärung dahinter.',
  ] },
  { version: '1.12', datum: '2026-08-01', punkte: [
    'Neu im Rechner: „Selbstkosten je Glas“ – eine ausführliche Vollkostenrechnung. Du gibst Betrieb, Ertrag, Gebinde, Futter, Arbeitszeit, Anlagen, Räume, Gemeinkosten und Vertrieb ein und siehst, was ein Glas mindestens kosten muss – aufgeschlüsselt nach Kostenart und zusätzlich je kg Honig.',
    'Dazu ein Vergleich der drei Vertriebswege: Direktvermarktung, Wiederverkäufer und Großhandel. Beim Großhandel fallen Gebinde, Vertrieb und die Arbeitszeit fürs Abfüllen weg.',
    'Alle Vorbelegungen sind überschreibbar und stammen aus dem Kalkulationsmodell der LWG Veitshöchheim (Mindestlohn 2026, Lohnnebenkosten DESTATIS, Miete IW, Ertrag und Verluste DEBIMO).',
    'Aufgaben hängen jetzt am Volk, nicht an einer alten Notiz: wandert ein Volk auf einen anderen Stand, zeigt die Aufgabe sofort den neuen Stand. Dasselbe gilt, wenn du ein Volk umbenennst.',
    'Der Hinweis hat jetzt einen Knopf „Aufgabe öffnen“: nach einer Wanderung willst du meist Termin oder Notiz anfassen, und den Weg über die Liste sparst du damit. Wer den Knopf benutzt, hat den Hinweis gesehen – er verschwindet dabei.',
    'Wenn sich dadurch etwas ändert, erscheint oben bei den Aufgaben ein Hinweis – genau einmal. Klickst du ihn weg, kommt er nicht wieder; erst eine neue Änderung ergibt einen neuen Hinweis.',
  ] },
  { version: '1.11', datum: '2026-07-25', punkte: [
    'Neu im Rechner: „Winterfutter planen“ rechnet von deinem Bedarf zurück. Du gibst Völkerzahl, Futter je Volk und Mischverhältnis ein und bekommst, wie viel Zucker du kaufen musst (auch in Säcken à 25 kg), wie viel Wasser dazu kommt und wie viel Liter Sirup daraus werden.',
    '„Zucker → Sirup & Futter“ rechnet die andere Richtung: Du gibst die Zuckermenge ein und siehst, wie viel theoretisch und wie viel tatsächlich im Stock eingelagert wird – und darunter für 3:2 und 1:1, wie viel Wasser dazu kommt und wie viele Liter Sirup das ergibt.',
    'Die Minderung beim Eindicken kannst du selbst einstellen (Vorbelegung 15 %, üblich sind 10–20 %) – das Volk verbraucht für diese Arbeit selbst Futter.',
    'Die Liter werden jetzt richtig gerechnet: Zuckerlösung ist nicht volumenaddierend. 100 kg Zucker und 100 L Wasser ergeben keine 200 Liter, sondern rund 163.',
    'Berichtigt: In den FAQ stand, 1 Liter Sirup 3:2 ergebe rund 1 kg eingelagertes Futter. Richtig sind rund 0,8 kg – für 15 kg Winterfutter braucht man also etwa 19 Liter Sirup, nicht 12–15.',
    'Der Futter-Rechner steckt jetzt auch direkt im Reiter „Fütterung“ – gleich neben „+ Fütterung“. Ein Griff auf „Als Fütterung übernehmen“, und Menge und Zuckermenge stehen schon im Formular.',
    'Neues Feld „Davon Zucker (kg)“ bei jeder Fütterung. Damit steht in der Jahres-Liste (PDF) und im Excel-Export, wie viel Zucker du wirklich verbraucht hast – mit Summe unten. Lässt du das Feld leer, rechnet die Liste den Zucker aus der Futterart und kennzeichnet den Wert mit ≈.',
    'Der Rechner „Volksstärke schätzen“ ist entfallen.',
  ] },
  { version: '1.10', datum: '2026-07-25', punkte: [
    'Im Zuckersirup-Rechner steht beim Mischverhältnis jetzt nur noch „3:2“ und „1:1“ – die Erklärung dahinter ist weg.',
  ] },
  { version: '1.09', datum: '2026-07-25', punkte: [
    'Das Suchfeld bei Inventar und Verbrauchsmaterial ist jetzt immer da. Vorher erschien es erst ab neun Positionen – dadurch war die Suche bei kleineren Listen unsichtbar.',
    'Positionen mit einem Hinweis („abgelaufen“, „MHD …“, „Bestand niedrig“) zeigen jetzt Hinweis UND Kategorie – vorher war die Zeile nach dem Hinweis abgeschnitten.',
  ] },
  { version: '1.08', datum: '2026-07-25', punkte: [
    'Inventar und Verbrauchsmaterial zeigen ihre Positionen jetzt als kompakte Liste statt als Tabelle oder gestapelte Kärtchen – eine Zeile je Position, wie du es von Völkern und Königinnen kennst: Bezeichnung, darunter Kategorie, Stückzahl mit Einzelpreis und Zuordnung, rechts der Gesamtwert. Ein Tipp auf die Zeile öffnet das Bearbeiten-Fenster.',
    'Damit passen etwa viermal so viele Positionen auf den Bildschirm wie vorher.',
    'Neu: ein Suchfeld über der Liste (ab neun Positionen). Es sucht in Bezeichnung, Kategorie, Notiz und Zuordnung. Mehrere Wörter werden verknüpft – „rähmchen zander“ findet nur, was beides enthält. Darunter steht, wie viele Positionen von wie vielen gerade angezeigt werden.',
  ] },
  { version: '1.07', datum: '2026-07-25', punkte: [
    'Statistiken kann man jetzt ablesen: Fahre mit dem Finger über ein Diagramm, dann folgt eine Linie und oben steht der Wert an dieser Stelle – bei Einnahmen und Ausgaben gleichzeitig beide. Gilt für alle Statistiken: Völkerentwicklung, Honigertrag, Varroa, Gewicht, Wetter, Fahrten und Kassenbuch.',
    'Tabellen musste man auf dem Handy seitlich wegschieben, um die letzten Spalten zu sehen. Jetzt wird auf schmalen Bildschirmen aus jeder Zeile ein Kärtchen: oben die Bezeichnung, darunter je Spalte Beschriftung und Wert. Du scrollst nur noch nach unten.',
    'Das betrifft alle Tabellen der App – Inventar, Verbrauchsmaterial, Fütterung, Varroa, Gewicht, Wetter, Honigsorten, Bestand, Kassenbuch, Rechnungspositionen und die Statistik-Tabellen. Auf Tablet und Rechner bleibt die Tabelle eine Tabelle.',
  ] },
  { version: '1.06', datum: '2026-07-25', punkte: [
    'Die Reiter oben rutschen jetzt in eine zweite Zeile, wenn sie nicht in eine passen. Bisher lagen die letzten außerhalb des Bildes und man musste sie mit dem Finger heranziehen – bei „Ernte und Abfüllung“ war das „Bestand“, beim Volk „Notizen & Anhänge“, im Kassenbuch die „Auswertung“.',
    'Gilt für alle Reiter in der App auf einmal. Auf breiten Bildschirmen bleibt alles wie vorher in einer Zeile.',
    'Dasselbe bei den Knöpfen oben in der Kopfzeile: Bei den Königinnen stand „Neue Königin“ rechts außerhalb des Bildes, beim Verbrauchsmaterial „Neue Position“. Beide brechen jetzt in die nächste Zeile um. Geprüft ist das auf jedem Bildschirm der App.',
  ] },
  { version: '1.05', datum: '2026-07-25', punkte: [
    'Die Kachel hinter dem Symbol trägt jetzt dessen Farbe: grün bei Aufgaben, Kassenbuch, Meldungen und Sicherung, blau bei Wanderungen, Fahrtenbuch, Statistiken und Wetter, violett bei Behandlungen und Trachten, rot beim Papierkorb, grau bei Rechner, Einstellungen und „Mehr“. Alles rund um die Bienen bleibt honigfarben.',
    'Zu sehen unter „Alle Bereiche“ und beim Anpassen von Dashboard und Schnellzugriff. In der unteren Leiste bleibt die Kachel des aktiven Eintrags absichtlich honigfarben – sonst würde beim Tippen die Farbe mitwandern.',
  ] },
  { version: '1.04', datum: '2026-07-25', punkte: [
    'Jeder Bereich hat jetzt sein eigenes farbiges Symbol – eigens für ImkerBuch gezeichnet: Biene, Beute, Krone, Weiselzellen am Zuchtrahmen, Honigglas, Futtereimer, Wabenrähmchen und so weiter. Du erkennst einen Bereich damit an Form und Farbe, statt die Beschriftung lesen zu müssen.',
    'Die farbigen Symbole stehen genau dort, wo du suchst: in der Seitenleiste, in der unteren Leiste, unter „Alle Bereiche“ und beim Anpassen von Dashboard und Schnellzugriff. Innerhalb eines Bereichs bleiben die Symbole schlicht – sonst würden Knöpfe und Warnhinweise in der Farbe untergehen.',
    'Fahrtenbuch und Verbrauchsmaterial hatten bisher dasselbe Symbol wie Wanderungen bzw. Behandlungen. Beide haben jetzt ein eigenes: ein Auto für das Fahrtenbuch, ein Rähmchen mit Mittelwand für das Material.',
    'Die Symbole schalten im Dunkelmodus automatisch mit und werden beim Ausdruck sauber schwarzweiß.',
  ] },
  { version: '1.03', datum: '2026-07-25', punkte: [
    'Aufs Dashboard kommt jetzt nur, was echten Inhalt zeigt – keine leeren Symbol-Kacheln mehr.',
    'Neue Info-Kacheln zum Hinzufügen: Königinnen (Anzahl + Ø Zuchtnote), Zucht (nächste Termine), Kassenbuch (Einnahmen/Ausgaben/Saldo), Niedrige Bestände und Rechnungen (Entwürfe + Jahresumsatz).',
  ] },
  { version: '1.02', datum: '2026-07-25', punkte: [
    'Dashboard komplett anpassbar: Über „Widgets“ öffnest du eine Liste im Screenshot-Stil – rotes − nimmt eine Kachel weg, grünes + fügt sie hinzu, mit dem Griff ⁝⁝ verschiebst du sie per Finger.',
    'Schnellzugriff selbst bestimmen: Im selben Fenster (Tab „Schnellzugriff“) wählst du, welche bis zu vier Bereiche unten in der Leiste stehen. „Start“ bleibt fest der erste.',
    '„Alle Bereiche“ hat jetzt größere, klar gefärbte Icons – Bereiche sind schneller zu finden.',
    'Querformat: Die Kacheln stehen in einer Reihe jetzt gleich hoch statt unterschiedlich groß.',
  ] },
  { version: '1.01', datum: '2026-07-24', punkte: [
    'Belegstelle neu aufgebaut: Zuerst die Herkunft (Buckfast, Carnica, Elgon, Ligustica, Mellifera, Landbiene/Mix), danach Name und aktuelle Drohnenlinie – die Vorschläge richten sich nach der gewählten Herkunft.',
    'Unter der Herkunft steht jetzt, welche Stammbaum-Quelle es dafür überhaupt gibt: eigenes Datenpaket möglich (Buckfast/Elgon), nur Verlinkung zu BeeBreed (Carnica/Ligustica/Mellifera) oder gar kein Register (Landbiene/Mix).',
    'Den Namen der Belegstelle kannst du frei eintippen oder aus einer Liste übernehmen; bei Übernahme aus dem Verzeichnis füllt die App Ort, Betreiber, Leiter und Koordinaten mit – aber nur leere Felder, deine Eingaben bleiben.',
  ] },
  { version: '1.00', datum: '2026-07-24', punkte: [
    'Zuchtbuch-Kennungen werden jetzt erkannt: sowohl BeeBreed-Codes (z. B. DE-2-123-45-2024) als auch die Buckfast-Pedigree-Schreibweise (z. B. B66(TR) oder B22.2.07(KK)1dr) – inklusive mehrgenerationiger Abstammungszeilen.',
    'Beispieldaten enthalten jetzt eine Buckfast-Linie über 9 Generationen mit echten Pedigree-Kennungen – damit lässt sich der Stammbaum bis zum Anschlag ausprobieren.',
  ] },
  { version: '0.99', datum: '2026-07-22', punkte: [
    'Zucht-Stammbaum neu dargestellt: Die Mutterlinie läuft jetzt als durchgehende Liste, jedes Drohnenvolk hängt als Zweig daran und lässt sich mit „+“ aufklappen – so bleibt der Stammbaum auch über viele Generationen lesbar.',
    'Neuer Regler „Generationen“ (2 bis 9): Du bestimmst selbst, wie weit zurück angezeigt wird. Darunter steht, wie weit deine Mutterlinie tatsächlich reicht.',
  ] },
  { version: '0.98', datum: '2026-07-22', punkte: [
    'Beispieldaten enthalten jetzt drei Belegstellen (Norderney, Baltrum, Gehlberg) mit Leiter und teils Koordinaten – so lässt sich die Belegstellen-Auswahl in der Zucht besser ausprobieren.',
  ] },
  { version: '0.97', datum: '2026-07-22', punkte: [
    'Königin-Übersicht: Die Detailkarte verwendet jetzt dieselben Begriffe wie das Bearbeiten (Herkunft / Linie, Anpaarung, Drohnenlinie). Bei einer Belegstellen-Königin steht die Belegstelle klar in einer eigenen Zeile – nicht mehr doppelt und nicht mehr fälschlich als Vatervolk.',
  ] },
  { version: '0.96', datum: '2026-07-22', punkte: [
    'Königin-Formular ist jetzt breiter – lange Einträge wie Belegstelle oder Vatervolk unter „Drohnenlinie“ werden komplett angezeigt und nicht mehr abgeschnitten.',
  ] },
  { version: '0.95', datum: '2026-07-22', punkte: [
    'Belegstelle: Das Feld „Aktuelle Drohnenlinie / Rasse“ heißt jetzt „Herkunft“; darunter gibt es ein eigenes Feld „Aktuelle Drohnenlinie“ zum freien Eintragen.',
    'Belegstelle: Bei den Koordinaten wird kein übergroßes Standort-Symbol mehr angezeigt – nur noch die Links zu Google Maps und OpenStreetMap.',
  ] },
  { version: '0.94', datum: '2026-07-22', punkte: [
    'Ernte und Abfüllung: Die Reiter stehen jetzt in der natürlichen Reihenfolge – Ernte, Sorte, Charge, Abfüllung, Verkauf, Bestand – und sind einheitlich in der Einzahl benannt.',
  ] },
  { version: '0.93', datum: '2026-07-22', punkte: [
    'Königin-Formular: klarere Begriffe. „Rasse / Linie“ heißt jetzt „Herkunft / Linie“, das bisherige „Herkunft“ heißt „Anpaarung“, und die frühere „Anpaarung (Vaterseite)“ heißt „Drohnenlinie“. Die Königin-Detailansicht verwendet dieselben Begriffe.',
  ] },
  { version: '0.92', datum: '2026-07-22', punkte: [
    'Neuer Bereich „Belegstellen“ in den Einstellungen: Belegstellen mit Drohnenlinie, Ort, Betreiber und Belegstellenleiter (Name und Anschrift) anlegen und verwalten.',
    'Belegstelle mit Koordinaten: Standort übernehmen oder Breiten-/Längengrad eintragen – dann öffnet ein Tipp die Belegstelle direkt in Google Maps oder OpenStreetMap.',
    'In der Zucht (Königin und Zuchtserie) wählst du die Belegstelle jetzt aus dieser Liste aus – und kannst dort mit einem Tipp direkt eine neue anlegen, ohne in die Einstellungen zu wechseln.',
    'Zeit nachtragen: eine neue Tätigkeit lässt sich jetzt direkt im Formular anlegen – kein Umweg mehr über die Einstellungen.',
    'Ernte erfassen und Laborergebnis: eine neue Honigsorte kannst du ebenfalls gleich vor Ort anlegen; sie wird in die Sorten-Liste übernommen.',
  ] },
  { version: '0.91', datum: '2026-07-22', punkte: [
    'Startbildschirm neu aufgeteilt: Logo und „ImkerBuch“ stehen jetzt oben am Rand, die Waben-Animation läuft mittig im Bild.',
    'Die Waben sind deutlich größer, und eine Runde dauert jetzt 2 statt 1 Sekunde – man sieht sie beim Start einmal ganz durchlaufen.',
    'Der Hinweis „Neue Version wird geladen“ steht nur noch beim Aktualisieren unten am Rand; beim normalen Öffnen bleibt der Startbildschirm ruhig.',
  ] },
  { version: '0.90', datum: '2026-07-22', punkte: [
    'Neuer Startbildschirm: Beim Öffnen der App läuft jetzt eine Waben-Animation, bis alles geladen ist.',
    'Auch beim Aktualisieren: Holt sich die App eine neue Version, erscheint der Startbildschirm mit dem Hinweis „Neue Version wird geladen“ – vorher wirkte das Neuladen wie ein Aussetzer.',
    'Die App startet außerdem sofort im richtigen Design – im Dunkelmodus blitzt beim Öffnen nichts mehr hell auf.',
  ] },
  { version: '0.89', datum: '2026-07-22', punkte: [
    'Automatische Sicherung: Beim Aktivieren wird sofort eine erste Sicherung erstellt – danach läuft der Timer ab diesem Zeitpunkt.',
    'Neuer Countdown-Ring in den Einstellungen: Er zeigt, wie viel Zeit bis zur nächsten Sicherung bleibt, mit Datum und Uhrzeit der nächsten sowie der letzten Sicherung. Ist sie fällig, wird der Ring rot.',
    'Nach jeder automatischen Sicherung gibt es eine Bestätigung – und eine Push-Benachrichtigung (wenn Benachrichtigungen aktiviert sind) mit Zeitpunkt und dem nächsten Termin.',
  ] },
  { version: '0.88', datum: '2026-07-13', punkte: [
    'Dashboard-Kachel „Fahrten“ aufgeräumt: Der erklärende Hinweistext unter den Einträgen ist entfallen – die Kachel ist damit kompakter.',
  ] },
  { version: '0.87', datum: '2026-07-13', punkte: [
    'Dashboard-Kachel „Fahrten“ ist jetzt anpassbar: Über „Anpassen“ wählst du selbst, welche Schnellzugriffe erscheinen – Bienenstände UND deine eigenen Fahrt-Vorlagen (z. B. „Heimstand → Lindenallee“ oder „Imkerbedarf“). Hinzufügen und entfernen jederzeit; ohne Auswahl bleibt es bei den 5 meistbesuchten Ständen.',
    'Fachbegriff korrigiert: Die Königin, deren Drohnen die Anpaarung stellen, heißt „Drohnenmutter“ (4a-Volk) – nicht „Vater-Königin“.',
  ] },
  { version: '0.86', datum: '2026-07-13', punkte: [
    'Vatervolk besser auffindbar: Bei „Anpaarung“ steht jetzt der Hinweis, dass das Feld für das Vatervolk (Drohnenlinie) erst nach Wahl von „Standbegattung“ oder „Künstliche Besamung“ erscheint – gilt für Königin und Zuchtserie.',
  ] },
  { version: '0.85', datum: '2026-07-13', punkte: [
    'Volk-Ansicht: Oben neben „aktiv“ steht jetzt auch die Beutenkennung als eigene Kachel (z. B. „Beute Z-07“) – zusammen mit der Königin samt Kennung.',
  ] },
  { version: '0.84', datum: '2026-07-13', punkte: [
    'Zuchtserie: Auch bei „Zuchtmutter (2a)“ und „Vatervolk / Drohnenlinie (4a)“ kannst du die Königin jetzt direkt neu anlegen – sie wird sofort ausgewählt, deine Eingaben bleiben erhalten.',
  ] },
  { version: '0.83', datum: '2026-07-13', punkte: [
    'Die Kennung der Königin wird jetzt überall mit angezeigt – in der Königin-Auswahl beim Volk, in der Völkerliste, in der Volk-Ansicht, im Volk-Verlauf und im Excel-Export. So lassen sich Königinnen eindeutig auseinanderhalten.',
  ] },
  { version: '0.82', datum: '2026-07-13', punkte: [
    'Königin bearbeiten: Bei „Mutter (2a)“ und „Vatervolk / Drohnenlinie (4a)“ kannst du die Königin jetzt direkt neu anlegen – mit Kennung, Jahrgang, Linie usw. Sie wird sofort ausgewählt, deine bisherigen Eingaben bleiben erhalten.',
  ] },
  { version: '0.81', datum: '2026-07-13', punkte: [
    'Inventar und Verbrauchsmaterial: Du kannst jetzt eigene Kategorien anlegen – einfach im Kategorie-Feld eintippen statt nur auswählen. Die neue Kategorie steht danach automatisch als Vorschlag und als Filter zur Verfügung (getrennt je Bereich).',
  ] },
  { version: '0.80', datum: '2026-07-13', punkte: [
    'Kassenbuch: Neuer Reiter „Allgemeine Geschäftskosten“ neben „Kunden & Lieferanten“ – zeigt alle Buchungen dieser Kategorie mit Jahres-Summe, und „Buchung“ legt sie direkt richtig kategorisiert an.',
  ] },
  { version: '0.79', datum: '2026-07-13', punkte: [
    'Volk anlegen/bearbeiten: Direkt beim Feld „Königin“ gibt es jetzt „Neue Königin anlegen“ – du legst die Königin ohne Umweg an, sie wird sofort ausgewählt und deine Eingaben im Volk-Formular bleiben erhalten.',
  ] },
  { version: '0.78', datum: '2026-07-13', punkte: [
    'Königinnen: Die Zuordnungshistorie lässt sich jetzt selbst bearbeiten – Einträge antippen zum Ändern, neue über „Zuordnung hinzufügen“, Löschen inklusive. Der offene Eintrag (ohne „Bis“) bestimmt, in welchem Volk die Königin sitzt; die Volk-Zuordnung wird automatisch mitgeführt.',
  ] },
  { version: '0.77', datum: '2026-07-13', punkte: [
    'Fahrtenbuch: Häufige Fahrten als Vorlagen – z. B. zwischen zwei Bienenständen oder oft gefahrene Strecken (Einkauf, Verein …). Einmal anlegen, dann im Fahrtenbuch antippen und die Fahrt ist in einem Tipp gebucht.',
    'Beim Erfassen einer Fahrt kannst du sie direkt „als häufige Fahrt merken", dann steht sie künftig als Vorauswahl bereit. Vorlagen verwalten (anlegen/bearbeiten/löschen) über den Button „Verwalten".',
  ] },
  { version: '0.76', datum: '2026-07-13', punkte: [
    'Profil/Imkereidaten: „Meldepflicht Tierseuchenkasse (TSK)?“ als Ja/Nein – bei „Ja“ trägst du die TSK-/Melde-Nummer ein, die dann auf der Tierseuchenkassen-Meldung erscheint.',
  ] },
  { version: '0.75', datum: '2026-07-13', punkte: [
    'PDFs öffnen jetzt zuverlässig (auch in Firefox): Statt eines stillen Downloads wird die PDF im neuen Tab geöffnet (dort ansehen, speichern oder drucken); am Handy/in der App erscheint das System-Menü zum Öffnen/Teilen/Sichern.',
    'Komplettausdruck (Gesamt-Export) ist jetzt im Querformat – dadurch sind breite Tabellen wie die Königinnen (18 Spalten) sauber lesbar.',
  ] },
  { version: '0.74', datum: '2026-07-13', punkte: [
    'Profil/Imkereidaten: „Registriernummer“ heißt jetzt „Landwirtschaftliche Betriebsnummer“, die TSK-Nummer ist entfallen.',
    'Neu: Bio-Imkerei (Ja/Nein). Bei „Ja“ wählst du deine Öko-Kontrollstelle (amtliche DE-ÖKO-Liste) und – falls vorhanden – einen oder mehrere Verbände (Demeter, Bioland, Naturland …); ohne Verband gilt automatisch EU-Bio.',
    'Bio aufs Etikett: Der Kontrollstellen-Code und EU-Bio/Verband werden aufs Honig-Etikett gedruckt. Offizielle Verbands-/Bio-Logos kannst du als Bild hochladen (Einstellungen → Bio-Logos) – sie erscheinen dann mit auf dem Etikett.',
  ] },
  { version: '0.73', datum: '2026-07-13', punkte: [
    'Inventar und Material sind jetzt zwei getrennte Bereiche: „Inventar“ (langlebige Gebrauchsgüter wie Beuten, Zargen, Geräte) und „Verbrauchsmaterial“ (Behandlungsmittel, Futter, Gläser, Etiketten …). Beide mit Jahr-/Art-Filter, Gesamtübersicht und eigenem PDF. Bestehende Einträge werden automatisch richtig zugeordnet.',
  ] },
  { version: '0.72', datum: '2026-07-13', punkte: [
    'Der Bereich „Honig & Verkauf“ heißt jetzt „Ernte und Abfüllung“.',
    'Inventar erweitert: Filter nach Jahr und nach Art, eine Gesamtübersicht (Kennzahlen + Aufstellung je Art) und ein PDF-Export „Inventar (PDF)“.',
  ] },
  { version: '0.71', datum: '2026-07-13', punkte: [
    'Neu: Verkäufe als druckfertige PDF-Übersicht (Datum, Produkt, Los, Anzahl, Preis, Betrag, Käufer + Summenzeile) – Button „Liste (PDF)“ im Tab Verkäufe.',
    'PDFs überarbeitet: Titel und Untertitel brechen jetzt sauber um (nichts läuft mehr über den Rand), Tabellen haben feine Gitterlinien und sauberen Zeilenumbruch. Die Chargenübersicht ist übersichtlicher (Charge fett, Abfüllungen eingerückt, feste Spaltenbreiten).',
  ] },
  { version: '0.70', datum: '2026-07-13', punkte: [
    'Der Bereich „Honig & Chargen“ heißt jetzt „Honig & Verkauf“ – so ist auf einen Blick klar, dass hier alles vom Ernten über Chargen und Abfüllung bis zum Bestand und Verkauf zusammenläuft.',
  ] },
  { version: '0.69', datum: '2026-07-13', punkte: [
    'Einheitlich „Gebinde“ statt „Gläser“: Ein 20-kg-Gebinde ist ein Eimer, kein Glas. Im Bestand steht jetzt beim Gebinde die Größe (z. B. 20 kg) und daneben nur noch die reine Anzahl – ohne „Gläser“. Gilt auch für Abfüllung, Verkauf und Marktverkauf.',
  ] },
  { version: '0.68', datum: '2026-07-13', punkte: [
    'Keine doppelten Chargen mehr: Eine Ernte, die bereits einer Charge zugeordnet ist, wird beim Anlegen weiterer Chargen ausgegraut und ist nicht mehr wählbar (mit Hinweis „schon in Los …“).',
  ] },
  { version: '0.67', datum: '2026-07-13', punkte: [
    'Charge anlegen: Die Gesamtmenge musst du nicht mehr selbst eintragen – sie wird automatisch aus den angehakten Ernten summiert (bei Bedarf überschreibbar, z. B. für Schleuderverluste).',
  ] },
  { version: '0.66', datum: '2026-07-13', punkte: [
    'Verkauf ist jetzt klar auf die Abfüllung bezogen: Du wählst „Welche Abfüllung (Gebinde)?“ (z. B. 500 g · Lindenblütenhonig) und die Anzahl Gebinde – ohne Umweg über die Charge.',
    'Bestand ist jetzt nach Charge gruppiert: je Los siehst du Gesamtmenge, abgefüllte Menge und noch freie kg sowie pro Gebinde die Gläser im Bestand mit kg – alle Zahlen verrechnen sich automatisch miteinander.',
  ] },
  { version: '0.65', datum: '2026-07-13', punkte: [
    'Charge und Abfüllung sind jetzt getrennt: Eine Charge ist ein Los mit Gesamtmenge (kg) – ohne Glasgröße, Abfülldatum oder Verkaufspreis. Das Abfüllen läuft im neuen Tab „Abfüllung“.',
    'Neuer Tab „Abfüllung“: Charge wählen, in Gebinde abfüllen (20 kg, 500 g, 250 g, 50 g … oder eigene Größe), auch mehrere Gebinde auf einmal. Die Menge wird automatisch von der freien Restmenge der Charge abgezogen – zu viel geht nicht.',
    'Verkauf, Marktverkauf und Rechnungen beziehen sich jetzt auf die einzelnen Abfüllungen (Gebinde), der Bestand wird dort geführt. Bestehende Chargen werden beim Update automatisch und verlustfrei ins neue Modell übernommen.',
  ] },
  { version: '0.64', datum: '2026-07-13', punkte: [
    'Alle Auswahl-Menüs (Dropdowns) sind jetzt alphabetisch sortiert – Stände, Völker, Königinnen, Kunden, Sorten, Tätigkeiten, Mittel, Beutentypen usw. lassen sich viel schneller finden. Die Sortierung ist zahlen-bewusst (7 kommt vor 19) und deutsch (Umlaute korrekt), Platzhalter wie „Alle Stände“ bleiben oben. Bewusst geordnete Skalen (z. B. die Bewertung 4→1) behalten ihre Reihenfolge.',
  ] },
  { version: '0.63', datum: '2026-07-13', punkte: [
    'Behandlung jetzt als Sammel-Erfassung – genau wie bei der Fütterung: Stand wählen, optional nach Funktion filtern (z. B. nur Wirtschaftsvölker), Völker anhaken, Mittel/Menge/Wartezeit eintragen. Für jedes Volk entsteht automatisch ein eigener Bestandsbuch-Eintrag (TAMG), und bei Wartezeit wird eine Erinnerung zum Ende angelegt.',
  ] },
  { version: '0.62', datum: '2026-07-13', punkte: [
    'Zucht: Zwei neue Sammel-Abläufe bei den Königinnen – wie bei der Fütterung erst Stand/Funktion filtern, dann viele Völker auf einmal bearbeiten.',
    '„Bewertungs-Runde": Bewerte einen ganzen (Prüf-)Stand am selben Tag – Volk für Volk Sanftmut, Wabensitz, Schwarmträgheit, Entwicklung und Honig, ohne jede Königin einzeln zu öffnen.',
    '„Umweiseln": Ordne mehreren Völkern in einem Schritt neue Königinnen zu (z. B. frisch erzeugte Töchter). Die bisherige Königin wird automatisch auf „umgeweiselt" gesetzt, Historie inklusive.',
  ] },
  { version: '0.61', datum: '2026-07-12', punkte: [
    'Zucht rundum überarbeitet (fachlich recherchiert): Der Zuchtkalender ist jetzt korrekt – mit Verdeckelung an Tag 5, Annahme an Tag 1 und Legekontrolle als Deadline. Königinnen bekommen eine automatische Zuchtbuch-Kennung, eine Vaterseite (Anpaarung: Standbegattung/Belegstelle/Besamung mit Vatervolk) und eine Bewertung (Sanftmut, Wabensitz, Schwarmträgheit, Entwicklung, Honig) mit Zuchtnote.',
    'Der Stammbaum zeigt jetzt beide Seiten – Mutter- UND Vaterlinie – und die Töchter.',
    'Neu: Aus einer Zuchtserie lassen sich mit einem Klick alle Töchter-Königinnen anlegen; sie erben Mutter, Anpaarung, Linie, Jahrgang und bekommen fortlaufende Kennungen. Serien führen jetzt Zuchtmutter, geplante Anpaarung und Verlaufszahlen (angenommen/geschlüpft/begattet).',
  ] },
  { version: '0.60', datum: '2026-07-12', punkte: [
    'Neuer Bereich „Fütterung": Füttere viele Völker auf einmal – Stand wählen, optional nach Funktion filtern (z. B. nur Wirtschaftsvölker), Völker anhaken, fertig. Jede Fütterung landet automatisch in der Stockkarte jedes Volks, im Excel-Export und in der neuen Jahres-PDF-Liste.',
  ] },
  { version: '0.59', datum: '2026-07-11', punkte: [
    'Frisches Design: Knöpfe und Filter in moderner Pillenform mit sanftem Druck-Effekt, Kacheln randlos mit weichen Ecken und warmem Schatten, die Navigation unten schwebt jetzt als abgerundete Leiste – wie man es von aktuellen Apps kennt.',
    'Dark Mode wurde entsprechend mitangepasst.',
  ] },
  { version: '0.58', datum: '2026-07-11', punkte: [
    'Wirklich 100 % lokal: Die Bausteine für PDF-Export, Excel und QR-Codes liegen jetzt in der App selbst statt im Internet – alles funktioniert damit komplett offline, und im Normalbetrieb ruft die App keine Fremd-Server mehr auf.',
    'Vorbereitung für die App-Store-Versionen (iPhone/Android): irreführende Browser-Hinweise erscheinen in der nativen App nicht mehr.',
  ] },
  { version: '0.57', datum: '2026-07-11', punkte: [
    'Großer Qualitäts-Check der ganzen App: 10 Fehler behoben – u. a. zwei Absturzursachen in der kommenden iPhone-App (Kamera/Mikrofon), zwei Sicherheitslücken bei Adressfeldern, Speicherlecks bei Foto-Vorschauen und Sprachnotizen.',
    'Ertrags-Statistik als PDF zeigt jetzt korrekt die Auswertung „je Sorte" (vorher stand dort doppelt „je Volk").',
    'Bearbeiten alter Einträge ändert nichts mehr ungefragt: Ernten behalten ihr Produkt (z. B. Wachs), Kassenbuch-Buchungen ihre Kategorie.',
  ] },
  { version: '0.56', datum: '2026-07-10', punkte: [
    'Einstellungen aufgeräumt: Die Bereiche sind jetzt aufklappbare Kacheln – tippe eine Überschrift an, um sie zu öffnen oder zu schließen. So bleibt die Seite übersichtlich.',
    'Kilometerpauschale fürs Fahrtenbuch ist jetzt einstellbar (Einstellungen → Steuer & Rechnungen), Standard bleibt 0,30 €/km.',
  ] },
  { version: '0.55', datum: '2026-07-10', punkte: [
    'Neuer Bereich „Fahrtenbuch": alle Fahrten auf einen Blick, jede lässt sich antippen und bearbeiten. Neben den Fahrten zu den Ständen kannst du jetzt auch eigene Fahrten anlegen – Einkauf, Schulung, Besorgung, Imkerverein und mehr.',
    '„Reporting" heißt jetzt „Statistiken".',
  ] },
  { version: '0.54', datum: '2026-07-10', punkte: [
    'Auswahl-Felder (Funktion im Betrieb, Beutentyp, Honigsorte, Grund der Wanderung …) funktionieren jetzt zuverlässig auf iPhone und Android – vorher zeigte das Dropdown dort teils keine Vorschläge.',
    'Kassenbuch: neue Ausgaben-Kategorie „Allgemeine Geschäftskosten".',
  ] },
  { version: '0.53', datum: '2026-07-10', punkte: [
    'Automatische Updates verbessert: Die App lädt sich jetzt von selbst einmal neu, sobald eine neue Version bereitliegt – kein Neuinstallieren und kein manuelles Nachladen mehr nötig.',
    'Neuer Knopf „Nach Updates suchen" unter Einstellungen → Version: fragt direkt beim Server nach und holt die neueste Version, falls die App mal am alten Stand hängt.',
  ] },
  { version: '0.52', datum: '2026-07-10', punkte: [
    'Updates kommen jetzt automatisch: Sobald du online bist, lädt die App beim Öffnen immer die neueste Version – kein Cache-Ärger mehr.',
    'Imker-Rechner: 14 Rechner zum Ausklappen (Honigpreis, Mengenrechner, Zuckersirup, Winterfutter, Wachs, Kerzen u. v. m.).',
    'Völker: neues Feld „Funktion im Betrieb" (Wirtschaftsvolk, Ableger, Pflegevolk …) und eine viel größere Beutentyp-Auswahl. Das alte „Rähmchenmaß" geht darin auf.',
    'Wanderung neu gedacht: Du wählst Ausgangs-Stand → Völker → Ziel-Stand, und die Völker werden automatisch umgezogen. Neues Feld „Grund der Wanderung" (Linde, Waldtracht, Belegstelle …).',
    'Honig: Ernten bekommen Schleuderung (1–3) und Wassergehalt. Neuer Tab „Sorten" mit Labor-Workflow – Laborergebnis einmal eintragen, es landet auf allen Ernten der Schleuderung. Honigsorten pflegst du in den Einstellungen.',
    'Zeiterfassung: alte Einträge lassen sich jetzt nachträglich bearbeiten und löschen.',
    'Dashboard: „Fahrt zum Stand" zeigt die 5 meistbesuchten Stände, ausklappbar auf alle.',
    'Backup: Auf dem Computer (Chrome) kannst du den Speicherort jetzt selbst wählen statt immer „Downloads".',
  ] },
  { version: '0.51', datum: '2026-07-07', punkte: [
    'Imkerschule Phase 2: Beim ersten Besuch bestimmst du dein Erfahrungslevel über zwei kurze Fragen – Anfänger, Fortgeschritten oder Erfahren. Fortgeschrittene und Erfahrene können Basis-Lektionen überspringen.',
    '„Frag ein Thema": Neue Rubrik in der Imkerschule – 10 durchsuchbare Themenkacheln (Schwarm, Varroa, Königin …) mit häufigen Fragen und Antworten. Volltextsuche mit Synonymen (z. B. „weisellos" findet „keine Königin").',
    'Saisonale Lernempfehlungen: Auf dem Dashboard und in der Imkerschule erscheinen jetzt passende Tipps je nach Monat und Zustand deiner Völker (Varroa-Ampel, Fütterung …).',
  ] },
  { version: '0.50', datum: '2026-07-07', punkte: [
    'NEU: „Imkerschule" – ein geführter Lernpfad für Einsteiger. Schritt für Schritt vom ersten Interesse bis zum ersten eigenen Volk, in kurzen Lektionen mit Merksätzen und Erfolgen. Das Besondere: Jede Lektion mündet direkt in eine echte Aktion in der App (z. B. legst du in Lektion 6 dein erstes Volk gleich an) – so füllt sich dein Imkerbuch, während du lernst. Wähle dein Level (Anfänger), dein Fortschritt wird gespeichert. Erste Kapitel sind da, weitere folgen. Zu finden im Menü unter „Lernen → Imkerschule".',
  ] },
  { version: '0.49', datum: '2026-07-07', punkte: [
    'Rechtliches: Einstellungen → „Rechtliches" verlinkt jetzt Impressum, Datenschutzerklärung und AGB/Widerruf – Grundlage für die Veröffentlichung im Play Store. Die Seiten funktionieren auch offline.',
  ] },
  { version: '0.48', datum: '2026-07-07', punkte: [
    'Frisches ImkerBuch-Markenzeichen: Header und Seitenleiste zeigen jetzt das neue Waben-Logo – passend zu den kommenden Play-Store-Grafiken. Wer ein eigenes Logo hochgeladen und „auch im App-Header anzeigen" aktiviert hat, behält selbstverständlich sein eigenes; PDFs bleiben ebenfalls unverändert.',
  ] },
  { version: '0.47', datum: '2026-07-06', punkte: [
    'Neu unter Einstellungen → „Beispieldaten laden": füllt die App auf Wunsch mit umfangreichen Demo-Daten (15 Völker über 3 Stände, Königinnen mit Stammbaum, Stockkarten, Varroa, Behandlungen, Trachten, Wanderungen, Ernten mehrerer Jahre, Chargen, Verkäufe, Kassenbuch, Rechnungen, Inventar, Fahrten, Zeiterfassung, Reporting) – ideal zum Ausprobieren. Ersetzt vorhandene Daten (mit Rückfrage).',
  ] },
  { version: '0.46', datum: '2026-07-05', punkte: [
    'Rechnungs-PDF neu im Geschäftsbrief-Format nach DIN 5008: Logo größer oben rechts, kein Absenderblock mehr am oberen Rand, Empfängeranschrift sitzt im genormten Anschriftfeld (passt ins Fenster von Briefumschlägen), Infoblock mit Rechnungsnr./Datum rechts, Falz- und Lochmarken zum Falten, und die Absenderangaben stehen jetzt dezent in der Fußzeile.',
  ] },
  { version: '0.45', datum: '2026-07-05', punkte: [
    'Rechnungen können jetzt drei Besteuerungsarten: Regelbesteuerung, Kleinunternehmer (§ 19 UStG) und – neu – Pauschalierung für land- und forstwirtschaftliche Betriebe (§ 24 UStG). Bei § 24 erscheint der korrekte Hinweis „Anwendung der Durchschnittssatzbesteuerung nach Art. 295 ff. MwStSystRL und § 24 UStG. Der Rechnungsbetrag enthält eine pauschalierende Umsatzsteuer von 7,8 %." Der Durchschnittssatz ist unter Einstellungen → Steuer & Rechnungen einstellbar.',
  ] },
  { version: '0.44', datum: '2026-07-05', punkte: [
    'Neues Dashboard-Widget „Zeiterfassung": Stunden dieses Jahres und die Top-Tätigkeiten direkt auf der Startseite, ein Tipp führt zur vollen Auswertung.',
    'Rechnungen: Du kannst jetzt einen eigenen QR-Code hochladen (Einstellungen → Steuer & Rechnungen), z. B. deinen Bezahl-/PayPal- oder Überweisungs-Code. Kreuzt du bei der Rechnung „QR-Code auf die Rechnung drucken" an, erscheint dein Bild auf dem PDF.',
  ] },
  { version: '0.43', datum: '2026-07-05', punkte: [
    'Neues Dashboard-Widget „Fahrt zum Stand": bucht mit einem Tipp die Fahrt zu einem Bienenstand (heutiges Datum + Hin- & Rückweg) direkt ins Fahrtenbuch – Pauschale und PDF für die Steuer inklusive. Ständen ohne hinterlegte Entfernung wird beim Tippen das Formular geöffnet, um die km einzutragen.',
  ] },
  { version: '0.42', datum: '2026-07-05', punkte: [
    'Zuverlässigkeit gehärtet: Der Ungespeichert-Schutz bleibt jetzt scharf, falls ein Speichern fehlschlägt (kein stiller Verlust von Eingaben). Datums- und Speicher-Verhalten sind zusätzlich mit automatischen Tests abgesichert – genau die Fehler (Datum verschiebt sich, „speichert nicht"), an denen viele andere Imker-Apps scheitern.',
  ] },
  { version: '0.41', datum: '2026-07-04', punkte: [
    'Layout-Korrektur: Auf schmalen Handy-Breiten (z. B. iPhone) wurde die Seitenüberschrift („Völker“ usw.) von den Buttons daneben überdeckt/abgeschnitten. Titel und Aktionen rutschen jetzt sauber untereinander – gilt für alle Seiten',
  ] },
  { version: '0.40', datum: '2026-07-04', punkte: [
    'Mehr Auswahl-Menüs statt Freitext: Beim Ausfüllen schlägt die App jetzt auch bei Futter (Stockkarte), Einheit (Behandlung), Von/Nach-Ort (Wanderung), Inventar-Bezeichnung, Tracht-Region, Kassenbuch-Beschreibung und Kontakt-Ort passende Werte vor – eigene Eingaben werden gemerkt und stehen beim nächsten Mal zur Auswahl',
    'Neue Inventar-Kategorien „Behandlungsmittel“ und „Futter“ – passend zur Betriebsmittel-Überwachung',
  ] },
  { version: '0.39', datum: '2026-07-04', punkte: [
    'Honig-Etiketten drucken: aus jeder Charge ein druckfertiger Etikettenbogen mit den üblichen Pflichtangaben (Bezeichnung, Füllmenge, MHD, Los, Name+Anschrift, Ursprungsland) – optional mit QR-Code (Honig → Charge → Etikett)',
    'Stockkarten-Vorlagen: eine Durchsicht als Vorlage speichern und per Schnell-Button vorbefüllt öffnen (z. B. „Ableger“) – weniger Tippen am Stand',
    'Königinnen-Zucht-Stammbaum: Muttertier hinterlegen und die Abstammung über Generationen samt Töchtern sehen',
  ] },
  { version: '0.38', datum: '2026-07-04', punkte: [
    'Neuer Bereich „Rechner“: Honigpreis-Kalkulation, Wassergehalt-Bewertung, Zuckersirup-Mischung (3:2/1:1) und Winterfutter-Bedarf – rechnen direkt auf dem Gerät',
    'Betriebsmittel-Warnung: Inventar-Positionen können jetzt Ablaufdatum und Mindestbestand haben; die App erinnert automatisch, wenn z. B. Varroa-Mittel ablaufen oder der Vorrat knapp wird (Badge in der Inventarliste + Aufgabe)',
    'Varroa-Kontrolle erweitert: neben Milben/Tag (Bodenschieber) jetzt auch Befall je 100 Bienen (Auswaschen/Puderzucker) mit eigener Ampel – im selben Verlaufsdiagramm',
  ] },
  { version: '0.37', datum: '2026-07-04', punkte: [
    'Umstieg leicht gemacht: Daten aus einer anderen Imker-App übernehmen! Unter „Meldungen & Export → Aus anderer App importieren“ eine CSV- oder Excel-Datei (Export aus BeeManager, iBeekeeper, BeeInTouch o. a.) hochladen, Spalten zuordnen (die App rät sie meist selbst) und Stände, Völker, Durchsichten, Behandlungen, Ernten, Kontakte oder Kassenbuch werden angelegt – kein Neu-Eintippen.',
  ] },
  { version: '0.36', datum: '2026-07-04', punkte: [
    'Großer Hochformat-Feinschliff (mehrere Ansichten geprüft): behoben wurden seitliches Verrutschen im Aufgaben-Kalender und Dashboard, überlaufende Zahlen in Kennzahl-Kacheln, zu enge Marktverkauf-Kacheln, gequetschte Seitenköpfe mit vielen Knöpfen sowie zerrissener Banner-Text – die App sitzt jetzt auf schmalen Displays sauber.',
  ] },
  { version: '0.35', datum: '2026-07-04', punkte: [
    'Darstellung im Hochformat korrigiert: in schmalen Listen lief langer Text (z. B. „… Volk Anna · Raps 2026-01“) über den Kartenrand – wird jetzt sauber mit „…“ abgekürzt; Kartenüberschriften brechen bei wenig Platz ordentlich um',
  ] },
  { version: '0.34', datum: '2026-07-04', punkte: [
    'Marktverkauf: großer Kassen-Bildschirm für den Wochenmarkt (Honig → Verkäufe → Marktverkauf) – Gläser antippen, Wechselgeld-Rechner, ein Tipp bucht alles (Bestand runter + Kassenbuch)',
    'MHD-Wächter: die App erinnert automatisch, wenn das Mindesthaltbarkeitsdatum einer Charge näher rückt oder überschritten ist',
    'Eigene Stockkarten-Felder: in den Einstellungen zusätzliche Durchsicht-Felder anlegen (z. B. „Baurahmen“, „Drohnenbrut“) – erscheinen dann in jeder Durchsicht',
    'Weitere Bienenprodukte: Ernte nicht nur für Honig, sondern auch Wachs, Pollen, Propolis, Met u. a. erfassen',
  ] },
  { version: '0.33', datum: '2026-07-04', punkte: [
    'QR-Code je Volk: Etikett drucken, ans Beutendach kleben – Kamera scannen öffnet direkt die Stockkarte dieses Volks (Volk → QR-Code)',
    'Varroa-Kontrolle: Milbenfall zählen (Bodenschieber, Puderzucker, Auswaschen), Milben/Tag mit Verlaufsdiagramm und Ampel gegen saisonale Schwellenwerte (Volk → Varroa)',
    'Sammel-Erfassung: eine Durchsicht oder Fütterung mit einem Formular für mehrere Völker gleichzeitig anlegen (Völker-Liste → Sammel-Erfassung)',
  ] },
  { version: '0.32', datum: '2026-07-04', punkte: [
    'Dashboard-Kacheln sind jetzt klickbar: Tipp auf „Völker“, „Aufgaben“ & Co. springt direkt in den passenden Bereich',
    'Fahrtenbuch für die Steuer: je Stand die Entfernung von zu Hause hinterlegen, Fahrten mit einem Tipp erfassen (km vorbelegt)',
    'Kilometer-Übersicht unter Reporting → Fahrten: Summen je Jahr und je Stand, inkl. Pauschalen-Rechnung und Fahrtenbuch als PDF',
  ] },
  { version: '0.31', datum: '2026-07-04', punkte: [
    'Verkäufe mit Lagerlogik: „Verkauf erfassen“ zieht die Gläser automatisch vom Chargen-Bestand ab und bucht die Einnahme im Kassenbuch (Honig → Verkäufe, inkl. Stornieren)',
    'Zeiterfassung: beim Abhaken einer Aufgabe fragt die App kurz Dauer und Tätigkeit ab – Zeiten lassen sich auch nachtragen',
    'Neuer Bereich „Zeiterfassung“ mit Tortendiagramm: wie viele Stunden stecken in welcher Tätigkeit, nach Jahren filterbar',
    'Eingabehilfen: Vorschlagslisten bei Rasse, Beutentyp, Futterart, Behandlungsmittel, Honig-Sorte u. v. m. – eigene Einträge werden mitgelernt',
    'Zuverlässigere PDF-/Excel-/QR-Erzeugung: mehrere Ausweichquellen für Bibliotheken und Vorladen im Hintergrund für die Offline-Nutzung',
  ] },
  { version: '0.30', datum: '2026-07-03', punkte: [
    'Erst-Release: 15 Module von Bienenständen über Stockkarte, Behandlungen und Honigverwaltung bis Kassenbuch, Rechnungen und Reporting',
    'Backup-System: Sicherung senden, Zusammenführen über Geräte hinweg, interne Snapshots, automatische Sicherung, Erinnerungs-Banner',
    'Erinnerungen bei fälligen Aufgaben + Kalender-Export (.ics)',
    'PDF-Dokumente, Excel-Export, Sprachnotizen, offline nutzbar als installierbare App',
  ] },
```
