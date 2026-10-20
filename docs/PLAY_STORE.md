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
- **20.10.2026:** D-U-N-S kostenlos über Apples D-U-N-S-Suche beantragt (developer.apple.com/enroll/duns-lookup → leitet an D&B weiter). Name dort: „ImkerBuch Julian Konstantin Koehler“ (Formular nimmt kein „ö“), Reichenberger Str. 15, 85221 Dachau. Dauer laut Berichten bis ~30 Tage. Telefon und Sicherheitscode gibt Julian selbst ein.
- Plan: Nummer da → Play-Konto als **Organisation** (Name exakt wie bei D&B). Abgelehnt → privates Konto + 12 Imker als Tester.

## Offen – gemeinsam mit Julian

1. **Werkzeuge:** Auf dem Mac fehlen Java und Android Studio (großer Download, ~3–5 GB). Ohne sie kein Android-Bau und kein Test im Android-Emulator.
2. **Google-Play-Entwicklerkonto** (einmalig 25 $), Identitätsprüfung, Händlerangaben (Adresse, Telefon werden öffentlich, wie bei Apple), Zahlungsprofil + Bank + Steuer.
3. **App-Signatur:** „Play App Signing“ aktivieren; Upload-Schlüssel erzeugen und **sicher aufbewahren** (Verlust = keine Updates mehr ohne Google-Support).
4. **Geschlossener Test:** 12 Tester, **14 Tage am Stück** (Julians Imker). Erst danach Freigabe für alle.
5. Kaufprodukt `de.imkerbuch.app.vollversion` in der Play Console anlegen (14,99 € Einführung, später 24,99 €), Länder DE/AT/CH.
6. Android-Test: Fotos, Sprachnotiz, Standort, Erinnerungen, Teilen-Menü (PDF/Sicherung), Kauf/Wiederherstellen, Zurück-Taste, Tablet.

## Store-Eintrag

- **App-Name (max. 30):** `ImkerBuch` (wie im App Store, Julian 20.10.2026)
- **Kurzbeschreibung (max. 80):** `Digitales Stockbuch: Völker, Durchsicht, Varroa, Honig – offline, ohne Konto.`
- **Vollständige Beschreibung:** wie `APP_STORE_TEXTE.md` → „Beschreibung“, aber im Abschnitt „Deine Daten gehören dir“: „Sicherung per Teilen-Menü in Google Drive, „Dateien“ oder per Mail“ (kein iCloud/AirDrop). Testphase-Satz: „30 Tage kostenlos testen (ab dem ersten Start auf dem Gerät) …“.
- **Kategorie:** Produktivität · **Tags:** Landwirtschaft, Notizen, Organisation
- **Kontakt:** juliankhler+imkerbuch@googlemail.com · Website: `https://juliankhler-web.github.io/imkerbuch/landing.html`
- **Datenschutz-URL:** `https://juliankhler-web.github.io/imkerbuch/datenschutz.html`
- **Grafiken:** App-Symbol 512×512, Vorzeige-Grafik 1024×500 (alte helle Fassung in `Fotos Playstore/Play Store Upload/` – dunkle neu machen), **Handy-Bilder: `store-bilder/play/01–07-dunkel.png` (1080×1920 = 9:16, Android-Handy mit Kamera-Loch)** – erzeugt mit `node tools/store-bilder.mjs --play` aus denselben Bühnen wie die Apple-Bilder (Google erlaubt höchstens 2:1, die Apple-Bilder 1320×2868 sind zu lang). 7″-/10″-Tablet-Bilder optional.

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
