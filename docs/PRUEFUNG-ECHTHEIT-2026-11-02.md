# Echtheits-Prüfung der Store-App (02.11.2026)

Auslöser: Ein Tester meldete, dass „Sicherung senden“ in der Web-Fassung nie klappte. Die Tests hatten das echte Teilen nie ausgelöst. Deshalb wurden alle Wege der Store-App daraufhin durchsucht, ob sie am Gerät wirklich tun, was sie versprechen.

Ablauf: 7 Prüfer fanden 103 Punkte (`pruefung-echtheit/befunde.json`). 6 Prüfer prüften die 61 schwersten gegen (`pruefung-echtheit/urteile.json`): 35 im Code bestätigt, 26 nur am Gerät zu klären. Das Feld `n` zeigt in die Liste der Funde.

## vor Einreichung beheben (18)

| Nr. | Urteil | Stand | Was zu tun war |
|---|---|---|---|
| 0 | bestaetigt | behoben in 3.18 | Auf Android activityType auswerten und leer als Abbruch behandeln, danach ehrlich 'an Drive übergeben' melden und erst nach einer Rückfrage ('Liegt die Datei dort?') markExternal aufrufen. |
| 1 | nur am Geraet klaerbar | behoben in 3.18 | In abgleichen nach getPurchases für jeden Kauf mit purchaseState '1' und isAcknowledged===false nacheinander await P.acknowledgePurchase({purchaseToken}) aufrufen, denn diese Plugin-Methode schließt erst nach der Antwort (:1497-1516). |
| 2 | bestaetigt | behoben in 3.18 | In dateiTeilen das Ergebnis von Share.share prüfen: Auf Android gilt leerer activityType als Abbruch, das behebt den Home- und Sperr-Weg mit wenigen Zeilen, den Abbruch im Ziel aber nur zusammen mit der Rückfrage aus n0. |
| 3 | nur am Geraet klaerbar | behoben in 3.18 | Wie bei n=1: fehlende Bestätigungen in abgleichen über P.acknowledgePurchase nachholen und abwarten. |
| 4 | bestaetigt | behoben in 3.18 | Behebung wie n0 und n2, dazu ein Testfall, der activityType leer und gefüllt durch nativTeilen schickt. |
| 10 | nur am Geraet klaerbar | behoben in 3.18 | Beim gemeldeten Abbruch die Datei nicht sofort löschen, sondern dem vorhandenen tempAufraeumen beim nächsten Sichern oder Start überlassen, und Test und Protokoll anpassen. |
| 11 | bestaetigt | behoben in 3.18 | Jede Ausgabe in einen eigenen Unterordner des Caches schreiben (oder Timer je Pfad abbrechen) und wie bei der Sicherung erst beim nächsten Start aufräumen, statt nach 60 s zu löschen. |
| 16 | nur am Geraet klaerbar | behoben in 3.18 | In kaufen eine Sperre gegen Doppelaufruf einbauen, die auch einen laufenden Abgleich abwartet, den Knopf währenddessen deaktivieren und nach einer Zeitgrenze wieder freigeben. |
| 23 | nur am Geraet klaerbar | behoben in 3.18 | Auf Android die Filterung öffnen, indem accept um */* ergänzt wird (nur auf Android, iPhone unverändert lassen); importFile prüft den Inhalt ohnehin selbst. |
| 24 | nur am Geraet klaerbar | Code zeigt Hinweis (3.19). Stumm oder nicht: am echten Gerät prüfen, B5 | B5 um Flugmodus und Anhören von Anfang bis Ende ergänzen; bleibt die Aufnahme stumm, das Live-Diktat in der App abschalten. |
| 25 | bestaetigt | behoben in 3.18 | In Importer.start XLSX.read mit der Option dateNF:'yyyy-mm-dd' aufrufen (im Lauf bestätigt: liefert 2024-03-15 und 2024-04-03) und in parseDate Monat 1-12 und Tag 1-31 prüfen, sonst null. |
| 26 | nur am Geraet klaerbar | behoben in 3.18 | Im Manifest <queries><intent><action android:name="android.media.action.IMAGE_CAPTURE"/></intent></queries> ergänzen und B6 im Emulator prüfen. |
| 28 | nur am Geraet klaerbar | behoben in 3.18 | Wie n23: */* auf Android in accept aufnehmen. |
| 29 | bestaetigt | behoben in 3.18 | Beim Verschwinden des Elements (hashchange und Modal schließen) die Aufnahme wie in aufnahmeBeenden stoppen und speichern. |
| 31 | bestaetigt | erst nach dem ersten Hochladen bei Google möglich | Nach dem ersten AAB-Upload und vor der Produktionsfreigabe den SHA-256 aus der Play-App-Signatur eintragen, die Datei in hochladen-vorbereiten.mjs mitkopieren und hochladen. |
| 34 | nur am Geraet klaerbar | behoben in 3.18 | dataURLToBlob absichern: Regex-Treffer prüfen, leeres b64 als leeren Blob behandeln; dazu ein Roundtrip-Test mit leerem Blob, oder zuerst der 2-Minuten-Test im iPhone-Simulator. |
| 39 | nur am Geraet klaerbar | behoben in 3.18 | Wie n23: */* auf Android in accept aufnehmen. |
| 70 | bestaetigt | behoben in 3.18 | Im backButton-Handler: Steht #wz-body im Fenster, den Knopf #wz-back klicken, falls vorhanden, sonst nichts tun; also nie m.remove() beim Assistenten. |

## bald nach Start (34)

| Nr. | Urteil | Stand | Was zu tun war |
|---|---|---|---|
| 6 | bestaetigt | behoben in 3.19 | In unbehandelterFehler auch bei anderen Fehlern einen allgemeinen Hinweis mit Fehlertext zeigen, gedrosselt wie bisher, und reine Hintergrundfehler vorher abfangen. |
| 7 | bestaetigt | behoben in 3.19 | nachImport in den drei Wegen in ein eigenes try/catch legen, das den Fehler protokolliert und die folgenden Schritte samt Meldung trotzdem ausführt. |
| 8 | bestaetigt | behoben in 3.18 | Im catch /pending/i prüfen und dann den vorhandenen Text 'Der Kauf wird noch bestätigt' zeigen. |
| 12 | nur am Geraet klaerbar | behoben in 3.19 | Einen gemerkten Vollkauf erst zurücknehmen, wenn die Liste über mehrere Tage leer bleibt, und bis dahin einen Hinweis auf das Store-Konto zeigen. |
| 13 | bestaetigt | behoben in 3.18 | abgleichen merkt sich das Scheitern der Abfrage, und wiederherstellen zeigt dann 'konnte gerade nicht geprüft werden' statt 'Kein Kauf'. |
| 14 | bestaetigt | behoben in 3.18 | Wie bei n=8: Ablehnung mit 'pending' erkennen und 'Der Kauf wird noch bestätigt' zeigen. |
| 15 | bestaetigt | Teil behoben in 3.19 (Fenster sagt „Internet nötig“). Offline-Testphase: Entscheidung Julian | Ohne Netz eine vorläufige lokale Testphase erlauben, die beim nächsten erfolgreichen Abgleich durch den Store-Stand ersetzt wird, oder zumindest im Fenster klar 'Internet nötig' sagen. |
| 17 | bestaetigt | behoben in 3.19 | Die Meldung wie bei n=8 korrigieren und zusätzlich auf Android beim Zurückkehren in die App abgleichen, solange _ausstehend gesetzt ist. |
| 22 | nur am Geraet klaerbar | behoben in 3.18 | Die Änderung aus n=11 (kein 60-s-Löschen, Aufräumen beim nächsten Start) nimmt das Risiko mit, ohne dass die Frage am Gerät geklärt sein muss. |
| 27 | bestaetigt | behoben in 3.20, am Emulator geprüft | Bei Android und verweigerter Erlaubnis capture weglassen oder beim sofortigen Abbruch einen Hinweis auf die Einstellungen zeigen. |
| 30 | nur am Geraet klaerbar | behoben in 3.19 | Am Gerät prüfen; dann Track-Ende und Sichtbarkeit abfangen und die Aufnahme sauber beenden, dazu das Display während der Aufnahme wach halten. |
| 32 | bestaetigt | behoben in 3.19 | In planen() zuerst die Liste aus der Datenbank berechnen und erst unmittelbar vor schedule die alten Mitteilungen löschen, möglichst nur die, die nicht mehr in der Liste stehen. |
| 33 | bestaetigt | behoben in 3.20, auf iPhone und Android nach hartem Beenden geprüft | Durchsicht-Entwurf samt Ton laufend in die Datenbank schreiben und beim nächsten Start anbieten. |
| 35 | bestaetigt | behoben in 3.19 | Im catch SyntaxError und Lesefehler trennen und für beide die verständliche Meldung 'unvollständig oder nicht lesbar, bitte Datei noch einmal auf dieses Gerät laden' zeigen. |
| 36 | nur am Geraet klaerbar | behoben in 3.19 | Zusammen mit n=12 lösen: bei leerer Liste nach gemerktem Vollkauf verzögert zurückstufen und auf das Store-Konto hinweisen. |
| 38 | nur am Geraet klaerbar | behoben in 3.18 | Mit der Behebung aus n10 erledigt sich der Hauptteil; zusätzlich /cancel/i nur auf den Fehler von Share.share anwenden, nicht auf das Schreiben der Datei. |
| 41 | bestaetigt | behoben in 3.19 | In stopRec try/catch und eine Größenprüfung ergänzen, bei Fehler oder leerer Aufnahme eine ehrliche Meldung zeigen statt gespeichert. |
| 43 | bestaetigt | behoben in 3.19 | In Pdf.ausgeben doc.output in ein try ziehen und im Fehlerfall den Toast 'PDF fehlgeschlagen' zeigen, damit es für alle Aufrufer ohne deren await gilt. |
| 44 | bestaetigt | behoben in 3.19 | In 5516 ein .catch ergänzen, das wie U.download 'Datei konnte nicht geöffnet werden' als Toast zeigt. |
| 46 | nur am Geraet klaerbar | offen, am Gerät zu klären | Nach der Probe am Gerät die Android-Texte auf 'über Drive, Dateien oder eine Drucker-App drucken' ändern; ein eigener Druckweg kann später folgen. |
| 47 | nur am Geraet klaerbar | behoben in 3.18 | Den Parameter text in index.html:23680 streichen, title reicht als Betreff. |
| 49 | bestaetigt | behoben in 3.19 | e.code und e.message in der Meldung kurz mitgeben und BILLING_UNAVAILABLE als 'Google-Play-Konto prüfen' übersetzen, dabei auch die vertauschte Meldung berücksichtigen. |
| 52 | bestaetigt | behoben in 3.19 | Die Völker-Grenze schon beim Start der Durchsicht prüfen (Views.durchsicht.starten bzw. erstes render) und das Kauf-Fenster dort zeigen, statt erst am Ende. |
| 59 | bestaetigt | behoben in 3.19 | Beide Handler in try/catch mit UI.toast legen und bei der Sprachnotiz im Fehlerfall neu zeichnen, möglichst mit Angebot, erneut zu speichern. |
| 61 | bestaetigt | behoben in 3.19 | Mit der Behebung aus n35 erledigt. |
| 62 | bestaetigt | behoben in 3.20, auf iPhone und Android geprüft | Einen zweiten Knopf „Aus Galerie“ ohne capture ergänzen, der über denselben Verkleinerungs-Weg als Foto speichert. |
| 64 | nur am Geraet klaerbar | offen, am Gerät zu klären | Mit „Aktivitäten nicht behalten“ prüfen; dauerhaft nur mit nativem Kamera-Plugin und Wiederherstellung über appRestoredResult lösbar. |
| 66 | bestaetigt | behoben in 3.19 | In rec.onerror die Anzeige auf „Aufnahme läuft, kein Live-Text ohne Netz“ umstellen. |
| 67 | bestaetigt | behoben in 3.19 | In stopRec bei leerem Blob nicht speichern und „Aufnahme war leer“ melden. |
| 73 | nur am Geraet klaerbar | offen, am Gerät zu klären | Erst im Simulator testen; nur falls es scheitert, in scene(_:willConnectTo:) window?.rootViewController?.loadViewIfNeeded() aufrufen oder connectionOptions.notificationResponse selbst weiterreichen, und dann erneut testen. |
| 74 | nur am Geraet klaerbar | offen, am Gerät zu klären | Reale Probe mit einem Xiaomi- oder Samsung-Gerät; je nach Ergebnis einen Hilfetext zu Akku-Einstellungen und Autostart ergänzen und die Zusage im Text leicht einschränken. |
| 76 | bestaetigt | behoben in 3.19 | Am Ende von Backup.nachImport: Ist features.benachrichtigungen an und die Erlaubnis noch nicht erteilt, einmal fragen und Notif.anfordern() aufrufen. |
| 77 | nur am Geraet klaerbar | offen, am Gerät zu klären | Einmal im iPhone-Simulator mit Store-Build prüfen und nach dem Erzeugen einen Toast zeigen, wenn die Liste 'nicht' Einträge enthält, zum Beispiel 'N Unterlagen nicht angehängt'. |
| 78 | nur am Geraet klaerbar | geprüft 3.19: Android 16 bei 200 % Schrift ohne seitliches Überlaufen, bedienbar; „Voll“-Schilder überdecken dann die Leisten-Symbole | Zuerst den Emulator-Test bei maximaler Schrift machen; bricht das Layout, den Text-Zoom in MainActivity begrenzen oder die betroffenen Leisten umbrechen lassen, und eine eigene Schriftgrößen-Einstellung für iPhone nach dem Start planen. |

## kann warten (7)

| Nr. | Urteil | Stand | Was zu tun war |
|---|---|---|---|
| 21 | bestaetigt | behoben in 3.19 | Keine eigene Änderung nötig; wird mit der Behebung von 32 erledigt, die Prüfung läuft über D0, D2 und K6. |
| 40 | bestaetigt | offen, nur Wortwahl, kann warten | U.download in der App das Promise zurückgeben lassen und die Erfolgsmeldung dort weglassen, oder den Text zu 'Excel-Datei bereit' ändern. |
| 42 | bestaetigt | behoben in 3.19 | Den Inhalt von img.onload in try/catch setzen und im Fehlerfall rej aufrufen. |
| 45 | nur am Geraet klaerbar | offen, am Gerät zu klären | nativDateiTeilen wie die Sicherung schreiben: writeFile plus appendFile in Base64-Stücken, deren Rohgröße durch 3 teilbar ist. |
| 57 | nur am Geraet klaerbar | Schritt steht in docs/GERAETETEST.md | K1 um Zurück bei offenem Scanner, Imme-Führung und laufender Aufnahme ergänzen und einmal im Emulator mit aktueller Fassung durchgehen; kein Code nötig. |
| 63 | nur am Geraet klaerbar | offen, am Gerät zu klären | Am Gerät prüfen; im Fehlerfall die Meldung um den Hinweis auf JPEG ergänzen, im Scanner „Foto nicht lesbar“ getrennt von „kein Code“ melden. |
| 69 | nur am Geraet klaerbar | offen, am Gerät zu klären | Einmal Android-Sicherung auf dem iPhone abspielen; im Fehlerfall audio.onerror mit Hinweis und richtige Dateiendung nach mime ergänzen. |

## kein Fehler (2)

| Nr. | Urteil | Stand | Was zu tun war |
|---|---|---|---|
| 5 | bestaetigt | Schritt steht in docs/GERAETETEST.md | In GERAETETEST den Schritt ergänzen: iPhone, App löschen, neu installieren, Käufe wiederherstellen, und die Testphase darf nicht neu beginnen. |
| 54 | bestaetigt | Schritt steht in docs/GERAETETEST.md | B6 um Kamera verweigern und mehrere Fotos in Folge ergänzen. |

## Die übrigen 42 Funde

Nicht gegengeprüft, weil leichter eingestuft (alle Nummern, die oben fehlen, in `pruefung-echtheit/befunde.json`).

Behoben in 3.19: 48 (Android meldet später bezahlten Kauf), 50 (Kauf-Fenster hängt ohne Netz), 60 (CSV-Umlaute), 71 und 72 (Standort), 85 (Foto-Endung), 86 und 87 (Kauf von außen sichtbar), 88 (erster Preis), 89 (Archiv-Sperre im iOS-Projekt), 92 (Sprachnotiz ohne Datei), 93 (Kamerafotos bleiben liegen), 94 (Start-Link nach Neuladen), 96 (Erlaubnis nach Rückkehr).

Bewusst nicht geändert: 81 (Schreiben auf den Datenträger erzwingen, kann lange Schreibreihen auf schwachen Handys stark bremsen, nur bei Stromausfall oder Systemabsturz relevant), 80 (andere Fehler beim Zwischenstand nur im Protokoll, per Test so festgelegt).

Noch offen, nur am Gerät oder nur Wortwahl: 37, 65, 68, 75, 79, 82, 83, 84, 90, 91, 95, 97, 98, 99, 100, 101, 102. 102 ist in 3.20 behoben (Sicherung im Willkommen-Fenster einspielen, auf iPhone und Android geprüft). Die Punkte 18, 19, 20, 51, 53, 55, 56, 58 beschreiben Lücken der Tests. Dafür gibt es seit 3.18 und 3.19 die Geräteläufe unten und mehr Kauf-Tests.

## Unabhängige Durchsichten von 3.19

Zwei Runden nur lesender Prüfer mit Gegenprobe. Echte Funde und behoben: iOS-Testphase ging bei anderem Konto verloren (alter Fehler, hart gesperrt statt Light), Programmcode im Kauf-Fenster für Light-Nutzer (Fehler aus 3.18, nie veröffentlicht), Uhr vorstellen gab ewige Testphase, Doppeltipp startete zwei Aufnahmen, Meldung bei gesperrtem Telefon war beim Zurückkommen weg, Sprachnotiz ging bei Speicherfehler verloren, falsche Meldung nach Kauf ohne Abgleich, „Erneut laden“ zwei Fenster, Fehlalarm beim Rechnungskreis.

Bewusst gelassen: Android-Rückerstattung behält die Vollversion bis zu 7 Tage (Google nennt keine Rückerstattung, die Liste ist nur leer). Der Filter für „of null“-Fehler meldet solche Fehler nur im Protokoll. Geteiltes Bild auf Android mit gleicher Breite und aktivem Feld kann als Tastatur gelten. Ein Hinweis zum Live-Text geht beim Neuzeichnen verloren.

## Unabhängige Durchsicht von 3.20

Echte Funde und behoben: alter Entwurf speicherte heutige Befunde still mit altem Datum (fragt jetzt beim Öffnen), „Überspringen“ war während des Einspielens bedienbar (Warteanzeige), Kamera-Hinweis lag hinter dem Scanner, gespeicherte Völker waren nach Neustart wieder offen, Entwurf und Stockkarte wurden getrennt geschrieben (jetzt ein Schreibvorgang), Entwurf von Völkern im Papierkorb ging verloren (bleibt 30 Tage), leere Sicherung schloss das Willkommen-Fenster, durchsichtige Bilder wurden schwarz, Testlauf: `--nur` meldete fälschlich Abbruch.

## Geräte

| Gerät | Fassung | Ergebnis |
|---|---|---|
| Android 13, 14, 15, 16 | 3.18 | Liste, Formular mit Tastatur, Kamera, Sicherung, Rückfrage, PDF bestanden; Fehler erste Tastatur gefunden |
| Android 7 bis 12 | 3.18 | vorinstallierte WebView unter 108: Hinweisseite. Nach WebView-Update ungeprüft |
| iOS 26.2, 27 | 3.18 | Liste, Formular, Imme, Kamera, Sicherung, Abbruch, Einspielen bis Auswahl, PDF bestanden |
| iOS 16 bis 18 | - | ohne Anmeldung nicht ladbar. Nur Code-Durchsicht: keine Sprachmittel gefunden, die iOS 16 fehlen |
| Android 16 | 3.19 | erste Tastatur richtig, Aufnahme beim Sperren gesichert, Kamerareste weg, Light-Fenster ohne Programmcode, Schrift 130 und 200 % |
| Android 13 | 3.19 Endstand | startet, Fassung 3.19 |
| iOS 27 | 3.19 | Aufnahme beim Verlassen gesichert, Meldung beim Zurückkommen, Endstand startet |
| Android 16 | 3.20 | Sicherung im Willkommen-Fenster, Aus Galerie, Entwurf nach hartem Beenden samt Ton, Rückfrage bei altem Entwurf, Kamera verboten und Gegenprobe mit erlaubter Kamera |
| iOS 27 | 3.20 | Sicherung im Willkommen-Fenster, Aus Galerie, Entwurf nach hartem Beenden samt Ton und Text. Endstand startet. Rückfrage bei altem Entwurf nur am Emulator gelaufen |
| Archiv iOS | 3.19 | mit Testmodus Abbruch, ohne Testmodus erfolgreich |
