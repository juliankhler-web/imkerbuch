# Google Play – Vorbereitung (Entwurf zum Einfügen)

Stand 2026-11-01 (v3.12). Gegenstück zu `APP_STORE_EINREICHUNG.md` / `APP_STORE_TEXTE.md`. Julian prüft und gibt frei.

## Technik (im Projekt erledigt)

- Paket `de.imkerbuch.app`, `targetSdk 36` (Pflicht seit 31.08.2026), `minSdk 24`, `versionCode 1` / `versionName "1.0"` (je Upload `versionCode` +1).
- Berechtigungen im Manifest: Internet, Kamera, Mikrofon, Standort (alle erst bei Benutzung gefragt), Mitteilungen (Erweiterung), Vibration (`VIBRATE`, ab v2.76 für das kurze Spür-Signal beim Verschieben; normale Berechtigung ohne Rückfrage, keine Angabe im Datenschutz-Formular nötig). **Wecker & Erinnerungen** (`SCHEDULE_EXACT_ALARM`, ab v2.80): für minutengenaue Erinnerungen (Julians Vorgabe). Der Nutzer schaltet sie selbst ein (Android 14+ ab Werk aus); die App fragt beim Einschalten der Erinnerungen danach, ohne Erlaubnis plant sie ungefähr. **Nicht** `USE_EXACT_ALARM` – laut Google-Richtlinie nur für Wecker-/Timer- und Kalender-Apps (Quelle: support.google.com/googleplay/android-developer/answer/13161072). Ob Google für `SCHEDULE_EXACT_ALARM` ein Formular verlangt, steht dort nicht ausdrücklich – beim Hochladen in der Play Console prüfen. Kamera/Mikrofon/GPS als „nicht erforderlich“, damit Tablets ohne Kamera die App sehen.
- Kauf: Google Play Billing über dieselbe Erweiterung wie iOS. Produkt `de.imkerbuch.app.vollversion` (Einmalkauf). Käufe werden automatisch bestätigt (sonst erstattet Google nach 3 Tagen).
- **Light (seit v2.67):** nach den 30 Tagen kostenlos weiter mit 2 Völkern + Grundfunktionen (siehe `APP_STORE_EINREICHUNG.md` §27); in der Play-Beschreibung den Testphase-Satz entsprechend: „30 Tage alles testen, danach kostenlos als Light weiter – oder einmalig die Vollversion“.
- **Testphase:** Google kennt keinen 0-€-Einmalkauf → 30 Tage ab Start auf dem Gerät (`testStartGeraet`, gerätebezogen). Neuinstallation startet neu – bewusst in Kauf genommen.
- **Gutscheine:** Play-Promo-Codes für Einmalkäufe = Einzel-Codes (je Code einmal). Sammel-Codes nur für Abos. Einlösen im Play Store (`play.google.com/redeem`), danach in der App „Käufe wiederherstellen“.
- Datei-Ausgaben, Sicherung, Rechtstexte, Erinnerungen: wie iOS (Teilen-Menü, Fenster in der App, lokale Mitteilungen).

## Kontotyp: privat oder Organisation (Julian 2026-10-20)

- **Testpflicht 12 Tester × 14 Tage gilt laut Google nur für private Konten**, die nach dem 13.11.2023 angelegt wurden ([Google-Hilfe](https://support.google.com/googleplay/android-developer/answer/14151465?hl=de)). Firmen wie Abacus.AI nutzen Organisationskonten.
- Organisationskonto braucht eine **D-U-N-S-Nummer** ([Google-Hilfe](https://support.google.com/googleplay/android-developer/answer/13628312?hl=de)). Dun & Bradstreet vergibt sie laut eigenem Datenblatt auch an **Einzelunternehmen**; ob Google ein Einzelunternehmen als Organisation annimmt, ist nicht belegt (keine Erfahrungsberichte gefunden).
- **20.10.2026:** D-U-N-S kostenlos über Apples D-U-N-S-Suche beantragt (developer.apple.com/enroll/duns-lookup → leitet an D&B weiter). Name dort: „ImkerBuch Julian Konstantin Koehler“ (Formular nimmt kein „ö“), Reichenberger Str. 15, 85221 Dachau. Dauer laut Berichten bis ~30 Tage. Telefon und Sicherheitscode hat Julian selbst eingegeben; Apple meldet „Your information is being processed“ – Bestätigungs-Mail von D&B folgt. Kalender „Familie & Fristen“ 19.11.2026: Nummer da?
- Plan: Nummer da → Play-Konto als **Organisation** (Name exakt wie bei D&B). Abgelehnt → privates Konto + 12 Imker als Tester.

## Offen – gemeinsam mit Julian

1. ✅ **Werkzeuge (20.10.2026):** ohne Homebrew/Android Studio in `~/Android/`: JDK 21 (Eclipse Temurin, Prüfsumme geprüft), Android-SDK (Plattform 36, Build-Tools 36/35, Platform-Tools), Emulator mit Pixel-8-Gerät „ImkerBuch_Pixel“ (Android 16, Google-Play-Image). Bauen: `cd native/android && JAVA_HOME=$(ls -d ~/Android/jdk-21*/Contents/Home) ANDROID_HOME=~/Android/sdk ./gradlew assembleDebug`. Emulator: `~/Android/sdk/emulator/emulator -avd ImkerBuch_Pixel -gpu swiftshader_indirect -no-audio` (Host-GPU zeichnet Artefakte; Mikrofon lässt den Emulator hängen). Seitenbilder sauber über die WebView-Fernsteuerung (`adb forward tcp:9333 localabstract:webview_devtools_remote_<pid>`).
   - Im Emulator geprüft (v2.73/2.74): Start + Waben-Startbild, Willkommen, Kauf-Fenster mit Google-Text, Testphase auf dem Gerät, Imme, Standort (eine Abfrage, Koordinaten kommen an), Mikrofon-Abfrage (eine), Zurück-Taste (Fenster → „Änderungen verwerfen?“ → Seite → Startseite → App verkleinern). Fund behoben: QR-Etiketten drucken ging in den Apps nicht → PDF.
2. **Google-Play-Entwicklerkonto** (einmalig 25 $), Identitätsprüfung, Händlerangaben (Adresse, Telefon werden öffentlich, wie bei Apple), Zahlungsprofil + Bank + Steuer.
3. **App-Signatur (vorbereitet 20.10.2026):** „Play App Signing“ aktivieren (Google verwahrt den eigentlichen App-Schlüssel). Den **Upload-Schlüssel legt Julian einmalig selbst an:**
   1. Terminal: `cd ~/ImkerApp/native && ./android-schluessel-anlegen.sh` → zweimal ein Passwort eingeben (wird nirgends gespeichert → in den Passwort-Manager).
   2. Die Datei `~/Android/schluessel/imkerbuch-upload.jks` zusätzlich sichern (z. B. USB-Stick im Schrank). Verlust = neuer Upload-Schlüssel nur über den Google-Support.
   3. Bauen für Google: `./sync-app.sh` (ohne `--testmodus`), dann `./android-hochladen.sh` → Passwort eingeben → Datei liegt auf dem Schreibtisch (`ImkerBuch-<Version>-<Bau-Nummer>.aab`) → in der Play Console hochladen.
   - Technik: `android/app/build.gradle` → `signingConfigs.release` liest Schlüsselpfad und Passwort nur aus Umgebungsvariablen; ohne sie entsteht eine unsignierte Datei, die das Skript ablehnt. Mit Wegwerf-Schlüssel getestet.
   - **Bau-Nummern:** nach 1.00 setzt `sync-app.sh` sie automatisch (1.00 → 100, 1.01 → 101 …). **Nie einen Entwicklungsstand (2.x) zu Google hochladen** – dessen Nummer wäre höher als die von 1.00.
   - **Mindest-WebView 108** (`capacitor.config.json`, bis v3.12: 98; ab 108 kennt sie die Fensterhöhe `dvh`, darunter wären lange Formulare abgeschnitten): ältere „Android System WebView“ → Hinweisseite `webview-veraltet.html` mit Link zum Play Store.
   - Geprüft 20.10.2026 im Emulator „ImkerBuch_Alt“ (Android 10, WebView 91): Hinweisseite erscheint statt leerer App, der Knopf öffnet den Play Store. Die App selbst auf Android 10 mit aktueller WebView ließe sich nur mit Google-Anmeldung im Emulator prüfen (nicht gemacht) – Android-Version ist für die App zweitrangig, entscheidend ist die WebView (≥ 98; auf Geräten mit Play Store aktualisiert sie sich selbst).
4. **Geschlossener Test:** 12 Tester, **14 Tage am Stück** (Julians Imker). Erst danach Freigabe für alle.
5. Kaufprodukt `de.imkerbuch.app.vollversion` in der Play Console anlegen (14,99 € bzw. 14,95 CHF bis 31.12.2026, ab 01.01.2027 24,99 € bzw. 24,95 CHF, gleich wie bei Apple, zum Start nur DE/AT; Preisänderung rechtzeitig einstellen), Länder DE/AT/CH.
6. Android-Test: Fotos, Sprachnotiz, Standort, Erinnerungen, Teilen-Menü (PDF/Sicherung), Kauf/Wiederherstellen, Zurück-Taste, Tablet.

## Store-Eintrag

- **App-Name (max. 30):** `ImkerBuch` (wie im App Store, Julian 20.10.2026)
- **Kurzbeschreibung (max. 80, 77 Zeichen):** `Digitales Stockbuch: Völker, Durchsicht, Varroa, Honig – offline, ohne Konto.`
- **Vollständige Beschreibung (2686 von 4000 Zeichen, Stand v2.83) – zum Einfügen:**

```text
ImkerBuch ist das digitale Stockbuch für Imkerinnen und Imker – komplett auf Deutsch, offline und ohne Konto. Deine Einträge bleiben auf deinem Handy.

DURCHSICHT AM STAND
• Eine Frage pro Bildschirm, große Knöpfe – auch mit Handschuhen
• Stockkarte mit Volksstärke, Brut, Sanftmut, Futter, Weiselzellen
• Sprachnotizen direkt am Bienenstand

VÖLKER, KÖNIGINNEN, STÄNDE
• Alle Völker mit Verlauf, Königinnen mit Stammbaum und Bewertung
• Bienenstände mit Wetter auf Wunsch (ab Werk aus) und Verlauf als Grafik
• Trachtkalender: was an deinen Ständen wann blüht – aus Beobachtungen des Deutschen Wetterdienstes in deiner Nähe, mit Erinnerung vor Blühbeginn und Ertrag je Tracht
• Behandlungen mit Wartezeiten, Varroa-Kontrollen mit Ampel, Fütterung mit Futter-Rechner (auch Sirup in Litern)

HONIG UND GESCHÄFT
• Ernte, Chargen, Abfüllung und Bestand – Honig-Etiketten als PDF
• Kassenbuch, Rechnungen, Abnehmer, Verkauf mit Rabatt
• Fahrtenbuch und Zeiterfassung

ALLE UNTERLAGEN AN EINEM ORT
• Bestandsbuch, Meldungen für Veterinäramt und Tierseuchenkasse, Kassenbuch-Jahresbericht, Fahrtenbuch, Fütterungsliste
• Volksakte: ein Volk komplett – jeder Teil auch einzeln
• Jahr wählen und als PDF, Excel oder CSV ausgeben – nach Themen sortiert und mit Suche

STATISTIK, DIE ETWAS SAGT
• Die wichtigsten Zahlen im Vergleich zum Vorjahr
• Auffälliges auf einen Blick: starke und schwache Völker, hoher Varroa-Befall, Völker ohne Winterfutter
• Winterverluste, Erlös je kg Honig, Kosten je Volk

ERINNERUNGEN
• Aufgaben mit Datum und Uhrzeit – die App erinnert dich auch, wenn sie geschlossen ist (minutengenau mit der Android-Erlaubnis „Wecker & Erinnerungen“)

FÜR BIO-IMKEREIEN
• Bio-Unterlagen, Hygieneplan, Umgebungsprüfung der Stände

DEINE STARTSEITE, DEIN AUFBAU
• Kacheln auswählen und per Gedrückthalten verschieben – für den Hobby-Stand genauso wie für den Imkereibetrieb

IMME, DEIN ASSISTENT
• Beantwortet Fragen zur App und zeigt dir Schritt für Schritt, wie es geht – auch ohne Internet

DEINE DATEN GEHÖREN DIR
• Kein Konto, keine Werbung, kein Tracking
• Sicherung über das Teilen-Menü in Google Drive, „Dateien“ oder per Mail
• Alle Daten jederzeit als Excel oder CSV – auch in der kostenlosen Light-Version
• Keine Sicherung in fremde Clouds ohne dein Zutun
• Bei Sprachnotizen wandelt das Betriebssystem Sprache je nach Gerät über den Dienst des Herstellers in Text um
• Wetter, Adresssuche und Bio-Umgebungsprüfung nutzen Internetdienste, aber erst nach deiner Zustimmung

30 Tage alle Funktionen kostenlos testen – die Testphase startest du selbst in der App, sie läuft dann auf diesem Gerät. Danach läuft ImkerBuch kostenlos als Light weiter (bis 2 Völker, Durchsicht, Stockkarte, Varroa, Königinnen) – oder du holst dir einmalig die Vollversion: kein Abo, keine automatische Abbuchung. Alles, was du eingetragen hast, bleibt sichtbar und sicherbar.

Fragen oder Wünsche? Schreib mir direkt aus der App über „Hilfe & Kontakt“.
```

- **Kategorie:** Effizienz (so heißt „Produktivität“ in der deutschen Play Console) · **Tags:** Effizienz, Notizbuch. „Landwirtschaft“, „Notizen“ und „Organisation“ gibt es in Googles fester Tag-Liste nicht (geprüft 02.11.2026).
- **Kaufprodukt:** `de.imkerbuch.app.vollversion` (Einmalkauf, „Verwaltetes Produkt“), Name „ImkerBuch Vollversion“, Beschreibung „Alle Funktionen dauerhaft – Einmalkauf, kein Abo.“, 14,99 € (DE/AT), Schweiz erst nach Klärung, dann 14,95 CHF bzw. ab 01.01.2027 24,95 CHF wie bei Apple; DE/AT ab 01.01.2027 24,99 €. Kein Testphase-Produkt (Google kennt keinen 0-€-Kauf; Testphase läuft auf dem Gerät).
- **Länder:** zum Start Deutschland und Österreich. Die Schweiz erst nach Klärung mit dem Steuerberater, weil Google die Schweizer Mehrwertsteuer dem Entwickler zuweist (Entscheidung 01.11.2026).
- **Kontakt:** support@imkerbuch.app · Website: `https://imkerbuch.app/`
- **Datenschutz-URL:** `https://imkerbuch.app/datenschutz.html`
- **Grafiken:** App-Symbol 512×512, Vorzeige-Grafik 1024×500: **`store-bilder/play/titelgrafik.png`** (dunkel, Android-Handy; `node tools/store-bilder.mjs --play-titel`), **Handy-Bilder: `store-bilder/play/01–07-dunkel.png` (1080×1920 = 9:16, Android-Handy mit Kamera-Loch)** – erzeugt mit `node tools/store-bilder.mjs --play` aus denselben Bühnen wie die Apple-Bilder (Google erlaubt höchstens 2:1, die Apple-Bilder 1320×2868 sind zu lang). 7″-/10″-Tablet-Bilder optional.

## Datensicherheit („Data safety“-Formular)

- **Erfasst oder teilt die App Daten?** Ja, in geringem Umfang:
  - **Standort (ungefähr und genau):** erfasst, Zweck App-Funktionen, nicht für Werbung, nicht verkauft. Nicht als flüchtig angeben, solange die Dienste das nicht schriftlich bestätigen. Weitergabe an Wetter-, Karten- und Geodienste (Deutscher Wetterdienst über Bright Sky, OpenStreetMap, amtliche Geodienste), wenn Wetter oder Bio-Umgebungsprüfung genutzt werden. Wetter ist ab Werk aus (ab v3.08) und läuft erst nach Zustimmung, dann auch beim App-Start.
  - Adresssuche: Suchbegriff an OpenStreetMap (vom Nutzer ausgelöst).
  - Alles andere (Völker, Fotos, Aufnahmen, Buchungen, Kontakte) bleibt auf dem Gerät → nicht „erfasst“. Ausnahme Live-Diktat, siehe unten.
- **Verschlüsselung bei der Übertragung:** Ja (HTTPS).
- **Automatische Android-Sicherung:** ausgeschaltet (`allowBackup=false`, `data_extraction_rules.xml`) – die App-Datenbank geht nicht in Googles Gerätesicherung.
- **Löschung:** Nutzer können alle Daten in der App löschen (Einstellungen → Sicherung & Datensicherheit → „Alle Daten löschen“). Löschen in der App wirkt nur auf dem Gerät. Es gibt keine Konten.
- **Käufe:** werden von Google Play verarbeitet (nicht von uns erfasst).

## Noch zu erledigen in der Play Console (Prüfung 01.11.2026)

- **Upload-Schlüssel:** am 01.11.2026 von Julian angelegt, liegt in `~/Android/schluessel/imkerbuch-upload.jks`. Passwort nur bei Julian. Zusätzlich auf USB-Stick sichern, Stand offen.
- **Live-Diktat auf Android:** Im Emulator (Android 16, 01.11.2026) gibt es die Sprach-Schnittstelle in der App (`webkitSpeechRecognition`). Sie kann über den Spracherkennungsdienst von Google laufen, die Datenschutzerklärung nennt das. Entscheidung: Im Datensicherheits-Formular vorsorglich angeben (Audio → Sprach- oder Tonaufnahmen, App-Funktion, optional) oder das Live-Diktat auf Android abschalten; auf einem echten Gerät prüfen. „Audio nur auf dem Gerät“ gilt nicht als belegt.
- **Datensicherheit:** erledigt am 02.11.2026, siehe Stand unten. Nach dem ersten echten Gerätetest prüfen, ob das Live-Diktat so bleibt.
- **Genauer Standort:** Begründung vorbereiten (Stand-Koordinaten für Stand und Bio-Umgebungsprüfung) oder prüfen, ob der ungefähre Standort reicht.
- **Formular Finanzfunktionen und Händlerstatus:** wahrheitsgemäß ausfüllen.
- **App-Links:** Nach dem ersten Upload den SHA-256-Wert aus „App-Signatur“ in `website-neu/.well-known/assetlinks.json` eintragen und hochladen.

## Inhaltsbewertung und Zielgruppe

- Fragebogen IARC: keine Gewalt, kein Glücksspiel, keine Nutzerinhalte für andere → voraussichtlich USK 0 / PEGI 3.
- Zielgruppe: **18+** (Imker, Geschäftsfunktionen) – nicht „für Kinder“ (sonst strenge Familien-Regeln).
- Werbung: **Nein**. Behörden-/Gesundheits-App: Nein.

## Organisationskonto mit D-U-N-S (Recherche 30.10.2026, offizielle Google-Hilfe)

- **Stand 01.11.2026:** Organisationskonto angelegt (Konto-ID 9169003963073023311, Entwicklername „ImkerBuch“, Inhaber juliankhler@googlemail.com, 25 $ bezahlt). Google zeigt D-U-N-S, Name und Adresse richtig mit ö an. Website über Search Console bestätigt (TXT-Eintrag bei Hetzner), support@imkerbuch.app bestätigt. Offen: Dokumente und Identität (Prüfung laut Google einige Tage), danach Telefon. Lehnt Google das Einzelunternehmen ab, privates Konto mit 12 Testern über 14 Tage.

- **Stand 02.11.2026:** Identität bestätigt (Mail 13:09 Uhr), beide Telefonnummern bestätigt, Konto fertig eingerichtet, „App erstellen“ ist frei. Die Entwickler-Telefonnummer ist öffentlich im Profil, eingetragen ist Julians Handynummer.
- **App angelegt 02.11.2026:** App-ID 4972557827786477343, `de.imkerbuch.app`, Deutsch, kostenlos, Play-App-Signatur akzeptiert.
- **Eintragungen 02.11.2026 (Entwurf, nichts eingereicht):** Store-Eintrag (Name, Kurztext, Beschreibung, Symbol, Titelgrafik, 7 Handy-Bilder in Apple-Reihenfolge), Datenschutz-Adresse, Anzeigen Nein, Werbe-ID Nein (kein AD_ID im Manifest), Behörde Nein, Finanzfunktionen keine, Gesundheit keine. Anmeldedaten: Ja mit englischer Prüfer-Anleitung (keine Anmeldung, Testphase per Knopf), weil die Vollversion Zahlung braucht; Haken „uneingeschränkter Zugriff“ setzt Julian. Offen laut diesem Stand: Altersfreigaben, Zielgruppe 18+, Datensicherheit, Kaufprodukt (die ersten drei am selben Tag erledigt, siehe unten). Die Bilder vor dem Einreichen gegen die Endfassung prüfen.
- **Eintragungen 02.11.2026, zweiter Durchgang (gespeichert, nichts eingereicht):**
  - Altersfreigabe gespeichert: USK 0, PEGI 3, ESRB Jedes Alter. Zielgruppe 18 Jahre und älter. Anmeldedaten von Julian bestätigt.
  - **Datensicherheit gespeichert.** Daten werden erhoben: Ja. Verschlüsselung: Ja. Keine Konten, keine Anmeldung mit fremden Konten. Erhoben, nicht geteilt, nicht sitzungsspezifisch, optional, Zweck „Funktionen der App“: ungefährer Standort, genauer Standort, Sprach- oder Tonaufnahmen (vorsorglich wegen Live-Diktat), Suchverlauf in der App (Adresssuche).
  - **„Geteilt“ bewusst nicht angekreuzt:** Google nimmt vom Nutzer ausgelöste Übertragungen und Weitergaben nach deutlicher Einwilligung aus (support.google.com/googleplay/android-developer/answer/10787469). Das passt nur, solange Wetter, Adresssuche, Bio-Prüfung und Diktat erst nach Zustimmung oder Tippen laufen.
  - **Löschfrage (optional) leer gelassen:** Wir speichern keine Nutzerdaten auf eigenen Servern, also gibt es nichts „bei uns“ anzufordern. Die Vorschau zeigt dazu nichts an.
  - **IP-Adresse:** bei Google kein eigener Datentyp, nur nach Verwendung anzugeben. Die App nutzt sie nicht, keine Extra-Angabe. **Bewertungs-Fenster:** Googles Hilfe zur Play-Core-Bibliothek nennt dazu keine Angabepflicht; nicht eingetragen.
  - App-Inhalte: alle Punkte abgeschlossen. Store-Einstellungen gespeichert: Kategorie Effizienz, Tags Effizienz und Notizbuch, support@imkerbuch.app, https://imkerbuch.app/, Telefon leer. Dashboard: 10 von 11 erledigt.
  - **Offen, Store-Eintrag (letzter Punkt der 11):** Schritt „Bewerten“ verlangt eine „Erklärung zu KI-Assets“ (answer/17262077). Die Titelgrafik und mehrere Handy-Bilder enthalten `store-bilder/imme-gross.png`, deren Herkunft nirgends steht (docs/PRUEFUNG-LUECKEN-2026-11-01.md, Abschnitt Startanimation und Tagesbienen). Julian muss sagen, ob Imme und die Tagesbienen mit KI gemacht sind. Deshalb noch nicht gespeichert. Die Kennzeichnung lässt sich laut Google später ändern.
  - **Offen, Geld:** Bank „Bestätigung steht aus“. Unter „Steuerinformationen für Vereinigte Staaten“ im Zahlungsprofil steht noch nichts (macht Julian). 15 %: Kontogruppe „ImkerBuch“ steht, die Bedingungen selbst waren nirgends zum Akzeptieren zu sehen, das Zahlungsprofil zeigt weiter den Hinweis. Später erneut schauen.
  - **Offen, Kaufprodukt:** Monetarisieren → „Jetzt loslegen“ führt nur zurück aufs Dashboard, Anlegen ging noch nicht. Nach dem ersten Upload erneut versuchen.
- **US-Steuerformular bei Google (begonnen 02.11.2026, noch nicht abgesendet):** Zahlungsprofil → Einstellungen → Steuerinformationen für Vereinigte Staaten. Natürliche Person, kein US-Bürger, W-8BEN (nicht W-8ECI). Name „Julian Konstantin Koehler“, Staatsangehörigkeit Deutschland. Die Steuer-ID (persönliche 11 Ziffern, nicht die neue Steuernummer) tippt nur Julian, das Unterzeichnen auch. DBA-Name „ImkerBuch“ eingetragen: Google nennt DBA einen Unternehmensnamen, der vom Namen des Inhabers abweicht, und „ImkerBuch“ steht als Geschäftsbezeichnung in der Gewerbeanzeige und bei D&B. Adresse „Reichenberger Strasse 15, 85221 Dachau“ (ohne ß wegen der IRS-Vorgabe), Postanschrift gleich. Steuerabkommen: Ja, Einwohner Deutschland.
  - **Google verlangt die Steuer-ID für das Steuerabkommen:** Ohne sie meldet Schritt 3 „Nicht-US-TIN oder US-TIN erforderlich“. Am 02.11. war das Feld beim ersten Durchlauf leer.
  - **Einkunftsart (Stand 02.11.):** „Dienstleistungen oder andere geschäftliche Einnahmen“, Artikel 7 Absatz 1, Satz 0 %. Google bot für diese Art nur diesen Artikel an, passend zu Apple. Normale App-Verkäufe ordnet Google in den gelesenen Seiten keiner Art ausdrücklich zu (support.google.com/paymentscenter/answer/10349995), das ist also Einordnung. Steuer-ID von Julian eingetragen, die Fehlermeldung ist weg.
  - **Schritt 4:** Tätigkeit für Google in den USA: Nein. Die Bestätigung darunter (alle Dienste, Arbeitskräfte und Mittel außerhalb der USA) setzt Julian selbst. Julian hat den Haken „ansässig, keine Niederlassung“ in Schritt 3 gesetzt.
  - **Schritt 5 Steuermeldung:** Google schlägt „Papierlos“ vor, Steuerbescheinigungen (1099, 1042-S) liegen dann mindestens 4 Jahre unter pay.google.com. Das ist eine Zustimmung, also entscheidet Julian. Mein Rat: Papierlos. Die Bescheinigungen dann jedes Jahr ins Second Brain legen.
  - **Erklärungen setzt Julian selbst:** Den Haken „ansässig in Deutschland, erfüllt das Abkommen, keine Niederlassung in den USA“ durfte ich nicht setzen (Sicherheitssperre „Consent Given For The User“). Gleiches gilt für das Unterzeichnen.
- **Händlerkonto 02.11.2026:** eingerichtet durch Julian (Computersoftware, support@imkerbuch.app, Kartenabrechnung IMKERBUCH, Website im Händlerprofil leer). Bankkonto eingetragen, Bestätigung steht aus. Offen: Kontogruppe und 15-%-Bedingungen unter „Verknüpfte Entwicklerkonten“, Steuerformular prüfen, App anlegen.
- **D-U-N-S 317388588** (vergeben 29.10.2026): „Julian Konstantin Köhler“, Trade Style „ImkerBuch“, Reichenberger Str. 15, 85221 Dachau – im Google-Zahlungsprofil **genau so** eintragen (Dokumente müssen „exactly“ passen; bei Fehlermeldung zuerst Schreibweise prüfen).
- **Ablauf:** Konto anlegen, 25 $ einmalig (Kredit-/Debitkarte, keine Prepaid) → Zahlungsprofil Organisation mit D-U-N-S → Ausweis (farbig, ungeschwärzt) + Gewerbeschein (Bestätigung der Gewerbeanzeige Stadt Dachau 20.10.2026) → **Website bestätigen (Pflicht seit 02/2024)** über Google Search Console, am besten mit demselben Google-Konto → Telefon (Code per SMS/Anruf) und E-Mails (Code per Mail) bestätigen.
- **Dauer:** Für neue Konten nennt Google keine Prüfdauer („a few days“ steht nur bei alten Konten); Zahlungsweg bis 5 Tage. Eine frische D-U-N-S einfach eingeben.
- **Testpflicht 12 Tester × 14 Tage:** laut Google nur für persönliche Konten (nach 13.11.2023) → gleich als Organisation anlegen (ob eine spätere Umwandlung die Pflicht aufhebt, ist nicht belegt).
- **Öffentlich im Store:** rechtlicher Name, Adresse, Entwickler-E-Mail, Entwickler-Telefon. Ab November 2026 zusätzlich Händlerstatus in der Play Console angeben (Einzelheiten noch offen).
- **Website:** Startseite ohne Anmeldung erreichbar, keine Social-Media-Seite; Kontakt-E-Mail „should“ zur Website-Domain passen (z. B. support@imkerbuch.app). Impressum (§ 5 DDG) ohnehin Pflicht.
- **Unsicher:** Ob Google ein nicht eingetragenes Einzelunternehmen als Organisation annimmt, steht nirgends – zeigt erst die Prüfung (oder Google-Support fragen). Keine Google-Seite verlangt eine USt-IdNr.

