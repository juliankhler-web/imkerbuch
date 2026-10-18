# Google Play – Vorbereitung (Entwurf zum Einfügen)

Stand 2026-10-18. Gegenstück zu `APP_STORE_EINREICHUNG.md` / `APP_STORE_TEXTE.md`. Julian prüft und gibt frei.

## Technik (im Projekt erledigt)

- Paket `de.imkerbuch.app`, `targetSdk 36` (Pflicht seit 31.08.2026), `minSdk 24`, `versionCode 1` / `versionName "1.0"` (je Upload `versionCode` +1).
- Berechtigungen im Manifest: Internet, Kamera, Mikrofon, Standort (alle erst bei Benutzung gefragt), Mitteilungen (Erweiterung). **Kein „exakter Wecker“** (`SCHEDULE_EXACT_ALARM` entfernt – sonst Begründungspflicht bei Google). Kamera/Mikrofon/GPS als „nicht erforderlich“, damit Tablets ohne Kamera die App sehen.
- Kauf: Google Play Billing über dieselbe Erweiterung wie iOS. Produkt `de.imkerbuch.app.vollversion` (Einmalkauf). Käufe werden automatisch bestätigt (sonst erstattet Google nach 3 Tagen).
- **Testphase:** Google kennt keinen 0-€-Einmalkauf → 30 Tage ab Start auf dem Gerät (`testStartGeraet`, gerätebezogen). Neuinstallation startet neu – bewusst in Kauf genommen.
- **Gutscheine:** Play-Promo-Codes für Einmalkäufe = Einzel-Codes (je Code einmal). Sammel-Codes nur für Abos. Einlösen im Play Store (`play.google.com/redeem`), danach in der App „Käufe wiederherstellen“.
- Datei-Ausgaben, Sicherung, Rechtstexte, Erinnerungen: wie iOS (Teilen-Menü, Fenster in der App, lokale Mitteilungen).

## Offen – gemeinsam mit Julian

1. **Werkzeuge:** Auf dem Mac fehlen Java und Android Studio (großer Download, ~3–5 GB). Ohne sie kein Android-Bau und kein Test im Android-Emulator.
2. **Google-Play-Entwicklerkonto** (einmalig 25 $), Identitätsprüfung, Händlerangaben (Adresse, Telefon werden öffentlich, wie bei Apple), Zahlungsprofil + Bank + Steuer.
3. **App-Signatur:** „Play App Signing“ aktivieren; Upload-Schlüssel erzeugen und **sicher aufbewahren** (Verlust = keine Updates mehr ohne Google-Support).
4. **Geschlossener Test:** 12 Tester, **14 Tage am Stück** (Julians Imker). Erst danach Freigabe für alle.
5. Kaufprodukt `de.imkerbuch.app.vollversion` in der Play Console anlegen (14,99 € Einführung, später 24,99 €), Länder DE/AT/CH.
6. Android-Test: Fotos, Sprachnotiz, Standort, Erinnerungen, Teilen-Menü (PDF/Sicherung), Kauf/Wiederherstellen, Zurück-Taste, Tablet.

## Store-Eintrag

- **App-Name (max. 30):** `ImkerBuch – Stockkarte & Honig`
- **Kurzbeschreibung (max. 80):** `Digitales Stockbuch: Völker, Durchsicht, Varroa, Honig – offline, ohne Konto.`
- **Vollständige Beschreibung:** wie `APP_STORE_TEXTE.md` → „Beschreibung“ (Play erlaubt bis 4000 Zeichen).
- **Kategorie:** Produktivität · **Tags:** Landwirtschaft, Notizen, Organisation
- **Kontakt:** juliankhler+imkerbuch@googlemail.com · Website: `https://juliankhler-web.github.io/imkerbuch/landing.html`
- **Datenschutz-URL:** `https://juliankhler-web.github.io/imkerbuch/datenschutz.html`
- **Grafiken:** App-Symbol 512×512, Vorzeige-Grafik 1024×500 (vorhanden, siehe Store-Assets), Handy-Bilder (2–8, Galaxy-Rahmen), 7″- und 10″-Tablet-Bilder.

## Datensicherheit („Data safety“-Formular)

- **Erfasst oder teilt die App Daten?** Ja, in geringem Umfang:
  - **Standort (ungefähr und genau):** Koordinaten eines Bienenstands gehen an Wetter- und Geodienste (Deutscher Wetterdienst/Bright Sky, OpenStreetMap, amtliche Geodienste), wenn Wetter oder Bio-Umgebungsprüfung genutzt werden. Zweck: **App-Funktionen**. **Flüchtig verarbeitet** (nicht gespeichert, keine Zuordnung zur Person). Nicht für Werbung, nicht verkauft.
  - Alles andere (Völker, Fotos, Audio, Buchungen, Kontakte) bleibt **nur auf dem Gerät** → nicht „erfasst“.
- **Verschlüsselung bei der Übertragung:** Ja (HTTPS).
- **Löschung:** Nutzer können alle Daten in der App löschen (Einstellungen → Sicherung & Datensicherheit → „Alle Daten löschen“). Es gibt keine Konten.
- **Käufe:** werden von Google Play verarbeitet (nicht von uns erfasst).

## Inhaltsbewertung und Zielgruppe

- Fragebogen IARC: keine Gewalt, kein Glücksspiel, keine Nutzerinhalte für andere → voraussichtlich USK 0 / PEGI 3.
- Zielgruppe: **18+** (Imker, Geschäftsfunktionen) – nicht „für Kinder“ (sonst strenge Familien-Regeln).
- Werbung: **Nein**. Behörden-/Gesundheits-App: Nein.
