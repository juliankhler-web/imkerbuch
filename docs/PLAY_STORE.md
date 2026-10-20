# Google Play – Vorbereitung (Entwurf zum Einfügen)

Stand 2026-10-20. Gegenstück zu `APP_STORE_EINREICHUNG.md` / `APP_STORE_TEXTE.md`. Julian prüft und gibt frei.

## Technik (im Projekt erledigt)

- Paket `de.imkerbuch.app`, `targetSdk 36` (Pflicht seit 31.08.2026), `minSdk 24`, `versionCode 1` / `versionName "1.0"` (je Upload `versionCode` +1).
- Berechtigungen im Manifest: Internet, Kamera, Mikrofon, Standort (alle erst bei Benutzung gefragt), Mitteilungen (Erweiterung). **Kein „exakter Wecker“** (`SCHEDULE_EXACT_ALARM` entfernt – sonst Begründungspflicht bei Google). Kamera/Mikrofon/GPS als „nicht erforderlich“, damit Tablets ohne Kamera die App sehen.
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
   - **Mindest-WebView 98** (`capacitor.config.json`): ältere „Android System WebView“ → Hinweisseite `webview-veraltet.html` mit Link zum Play Store.
4. **Geschlossener Test:** 12 Tester, **14 Tage am Stück** (Julians Imker). Erst danach Freigabe für alle.
5. Kaufprodukt `de.imkerbuch.app.vollversion` in der Play Console anlegen (14,99 € Einführung, später 24,99 €), Länder DE/AT/CH.
6. Android-Test: Fotos, Sprachnotiz, Standort, Erinnerungen, Teilen-Menü (PDF/Sicherung), Kauf/Wiederherstellen, Zurück-Taste, Tablet.

## Store-Eintrag

- **App-Name (max. 30):** `ImkerBuch` (wie im App Store, Julian 20.10.2026)
- **Kurzbeschreibung (max. 80, 77 Zeichen):** `Digitales Stockbuch: Völker, Durchsicht, Varroa, Honig – offline, ohne Konto.`
- **Vollständige Beschreibung (1711 von 4000 Zeichen) – zum Einfügen:**

```text
ImkerBuch ist das digitale Stockbuch für Imkerinnen und Imker – komplett auf Deutsch, offline und ohne Konto. Deine Daten bleiben auf deinem Handy.

DURCHSICHT AM STAND
• Eine Frage pro Bildschirm, große Knöpfe – auch mit Handschuhen
• Stockkarte mit Volksstärke, Brut, Sanftmut, Futter, Weiselzellen
• Sprachnotizen direkt am Bienenstand

VÖLKER, KÖNIGINNEN, STÄNDE
• Alle Völker mit Verlauf, Königinnen mit Stammbaum, Generation und Bewertung
• Bienenstände mit Wetter und Kartenlink
• Behandlungen mit Wartezeiten, Fütterung mit Futter-Rechner (auch Sirup in Litern)

HONIG UND GESCHÄFT
• Ernte, Chargen, Abfüllung und Bestand – Etiketten-QR als PDF
• Kassenbuch, Rechnungen, Abnehmer, Verkauf mit Rabatt
• Bestandsbuch und Meldungen als PDF

FÜR BIO-IMKEREIEN
• Bio-Unterlagen, Hygieneplan, Umgebungsprüfung der Stände

DEINE STARTSEITE, DEIN AUFBAU
• Kacheln und Schnellzugriffe selbst zusammenstellen – für den Hobby-Stand genauso wie für den Imkereibetrieb

IMME, DEIN ASSISTENT
• Beantwortet Fragen zur App und zeigt dir Schritt für Schritt, wie es geht – auch ohne Internet

DEINE DATEN GEHÖREN DIR
• Kein Konto, keine Werbung, kein Tracking
• Sicherung über das Teilen-Menü in Google Drive, „Dateien“ oder per Mail
• Keine automatische Übertragung in fremde Clouds

30 Tage alle Funktionen kostenlos testen – die Testphase beginnt beim ersten Start auf deinem Gerät. Danach läuft ImkerBuch kostenlos als Light weiter (bis 2 Völker, Durchsicht, Stockkarte, Varroa, Königinnen) – oder du holst dir einmalig die Vollversion: kein Abo, keine automatische Abbuchung. Alles, was du eingetragen hast, bleibt sichtbar und sicherbar.

Fragen oder Wünsche? Schreib mir direkt aus der App über „Hilfe & Kontakt“.
```

- **Kategorie:** Produktivität · **Tags:** Landwirtschaft, Notizen, Organisation
- **Kaufprodukt:** `de.imkerbuch.app.vollversion` (Einmalkauf, „Verwaltetes Produkt“), Name „ImkerBuch Vollversion“, Beschreibung „Alle Funktionen dauerhaft – Einmalkauf, kein Abo.“, 14,99 € (DE/AT), Schweiz 14,00 CHF wie bei Apple. Kein Testphase-Produkt (Google kennt keinen 0-€-Kauf; Testphase läuft auf dem Gerät).
- **Länder:** Deutschland, Österreich, Schweiz.
- **Kontakt:** juliankhler+imkerbuch@googlemail.com · Website: `https://juliankhler-web.github.io/imkerbuch/landing.html`
- **Datenschutz-URL:** `https://juliankhler-web.github.io/imkerbuch/datenschutz.html`
- **Grafiken:** App-Symbol 512×512, Vorzeige-Grafik 1024×500: **`store-bilder/play/titelgrafik.png`** (dunkel, Android-Handy; `node tools/store-bilder.mjs --play-titel`), **Handy-Bilder: `store-bilder/play/01–07-dunkel.png` (1080×1920 = 9:16, Android-Handy mit Kamera-Loch)** – erzeugt mit `node tools/store-bilder.mjs --play` aus denselben Bühnen wie die Apple-Bilder (Google erlaubt höchstens 2:1, die Apple-Bilder 1320×2868 sind zu lang). 7″-/10″-Tablet-Bilder optional.

## Datensicherheit („Data safety“-Formular)

- **Erfasst oder teilt die App Daten?** Ja, in geringem Umfang:
  - **Standort (ungefähr und genau):** Koordinaten eines Bienenstands gehen an Wetter- und Geodienste (Deutscher Wetterdienst/Bright Sky, OpenStreetMap, amtliche Geodienste), wenn Wetter oder Bio-Umgebungsprüfung genutzt werden. Zweck: **App-Funktionen**. **Flüchtig verarbeitet** (nicht gespeichert, keine Zuordnung zur Person). Nicht für Werbung, nicht verkauft. Vorsichtshalber auch als **„geteilt“ (mit Wetter-/Kartendiensten, für App-Funktionen)** angeben – das Startseiten-Wetter wird automatisch geladen.
  - Adresssuche: Suchbegriff an OpenStreetMap (vom Nutzer ausgelöst).
  - Alles andere (Völker, Fotos, Audio, Buchungen, Kontakte) bleibt **nur auf dem Gerät** → nicht „erfasst“.
- **Verschlüsselung bei der Übertragung:** Ja (HTTPS).
- **Automatische Android-Sicherung:** ausgeschaltet (`allowBackup=false`, `data_extraction_rules.xml`) – die App-Datenbank geht nicht in Googles Gerätesicherung.
- **Löschung:** Nutzer können alle Daten in der App löschen (Einstellungen → Sicherung & Datensicherheit → „Alle Daten löschen“). Es gibt keine Konten.
- **Käufe:** werden von Google Play verarbeitet (nicht von uns erfasst).

## Inhaltsbewertung und Zielgruppe

- Fragebogen IARC: keine Gewalt, kein Glücksspiel, keine Nutzerinhalte für andere → voraussichtlich USK 0 / PEGI 3.
- Zielgruppe: **18+** (Imker, Geschäftsfunktionen) – nicht „für Kinder“ (sonst strenge Familien-Regeln).
- Werbung: **Nein**. Behörden-/Gesundheits-App: Nein.
