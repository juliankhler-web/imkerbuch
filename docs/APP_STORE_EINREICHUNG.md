# App Store – Einreichung (Checkliste)

Stand 2026-10-18 · Quelle: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/),
[DSA-Händlerangaben](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-compliance-information)

Legende: ✅ vorhanden · ⚠️ fehlt/zu tun · ❓ Entscheidung von Julian

## 1. Konto und Recht

- ⚠️ **Apple Developer Program** (99 €/Jahr). Julians Team ist bisher das kostenlose – damit kann man nicht einreichen.
- ⚠️ **EU-Händlerangaben (DSA)**: Wer Geld verlangt, ist „Händler“. Apple zeigt dann **Adresse, Telefon und E-Mail öffentlich** im App Store (EU). Ohne Angabe keine Verbreitung in der EU.
- ❓ Gewerbe anmelden, Steuer (Kleinunternehmer?), Bankkonto und Steuerformulare in App Store Connect. Apple führt die Umsatzsteuer selbst ab.
- ❓ Name „ImkerBuch“: Marke (DPMA) und Name im App Store frei?

## 2. Datenschutz (Regel 5.1)

- ⚠️ Link zur Datenschutzerklärung **in App Store Connect und in der App** (5.1.1 i). Seite gibt es (`datenschutz.html`), muss alle Dienste nennen:
  Open-Meteo (Wetter, Standort), geoservice.rlp.de / BKG / OpenStreetMap / Nominatim / Overpass (Karten, Standort),
  Hugging Face (Download Sprachmodell Whisper), Kehrle-Pedigree, CDN-Bibliotheken, Wolf-Waagen (falls Waage-Anbindung).
- ⚠️ **App-Datenschutz-Angaben** („Nährwerttabelle“) in App Store Connect ausfüllen. Ohne Cloud: wir selbst erfassen nichts.
- ⚠️ **Privacy Manifest** (`PrivacyInfo.xcprivacy`) fehlt im App-Ziel → anlegen (benutzte Schnittstellen, z. B. UserDefaults, Dateizeitstempel).
- ⚠️ **Standort-Hinweistext** `NSLocationWhenInUseUsageDescription` fehlt in `Info.plist`, obwohl die App den Standort nutzt.
- ✅ Kamera- und Mikrofon-Hinweistexte vorhanden.
- ⚠️ Verschlüsselung: `ITSAppUsesNonExemptEncryption = NO` in `Info.plist` (nur HTTPS) – spart die Exportfrage bei jedem Upload.
- ⚠️ „Alle meine Daten löschen“ gut sichtbar in den Einstellungen.
- Sobald es Konten gibt (Cloud): **Konto löschen in der App** Pflicht (5.1.1 v), Daten wirklich löschen, Datenexport.

## 3. Kaufen (Regel 3.1)

- Digitale Freischaltung **nur über Apples In-App-Kauf** (kein PayPal, kein Link nach außen).
- 30 Tage gratis bei Einmalkauf erlaubt: entweder kostenloser Artikel „30-Tage-Testphase“ oder Datum des ersten Downloads.
  Vor dem Start klar anzeigen: Dauer, was danach gesperrt ist, Preis (3.1.1).
- ⚠️ Knopf **„Käufe wiederherstellen“** Pflicht.
- Abo (Cloud): vor dem Kauf Leistung, Preis, Laufzeit, automatische Verlängerung, Kündigung zeigen; Links zu Nutzungsbedingungen und Datenschutz (3.1.2).
  Abo muss auf allen Geräten des Nutzers gelten. Kauf auf Android/Web darf auf iPhone gelten, wenn es auch als In-App-Kauf angeboten wird (3.1.3 b).
- Login für die Cloud mit eigener E-Mail/Passwort → „Mit Apple anmelden“ nicht Pflicht. Mit Google-Login → gleichwertige Alternative Pflicht (4.8).

## 4. Inhalt und Prüfung

- ⚠️ **Keine „Beta“, „Test“, „Demo“-Funktionen** in der Store-Version (2.2). Unfertiges (Zucht) ausblenden oder als „Kommt bald“ ohne Funktion zeigen.
- 4.2 „mehr als eine verpackte Website“: ImkerBuch ist offline, mit Kamera, Mikrofon, PDF – gut; trotzdem in den Prüfer-Notizen erklären.
- Prüfer-Notiz: „Offline-App, kein Konto nötig; Beispieldaten über den Startassistenten.“ Mit Cloud: **Demo-Konto** mitgeben, Server muss laufen.
- Altersfreigabe-Fragebogen ausfüllen (voraussichtlich ab 4).
- Hinweis bei Varroa-Behandlung: keine tierärztliche Beratung.
- ⚠️ App läuft auch auf dem **iPad** (`TARGETED_DEVICE_FAMILY = 1,2`) → iPad-Bildschirmfotos nötig und iPad wird mitgeprüft. Sonst nur iPhone einstellen.

## 5. Store-Eintrag

- Name (30 Zeichen), Untertitel (30), Beschreibung, Stichwörter (100), Kategorie (Produktivität / Lifestyle).
- Bildschirmfotos iPhone 6,9″ (1320 × 2868), ggf. iPad 13″.
- ⚠️ **Support-URL** (Pflicht, 1.5) und **Datenschutz-URL** (Pflicht). Website = vorhandene GitHub-Pages-Seiten reichen; eigene Domain optional.
- Kontakt in der App: Bereich „Hilfe & Kontakt“ mit E-Mail an juliankhler@googlemail.com, App-Version und Gerät vorausgefüllt.

## 6. Datenverlust vermeiden

- Daten liegen nur auf dem Gerät: App löschen = Daten weg. Beim ersten Start und in der Sicherung deutlich sagen; Sicherung erinnern (vorhanden).

## 7. Vor dem Einreichen: Gesamtprüfung (Julian-Wunsch)

- Jede Funktion einmal **als App im iOS-Simulator und auf Julians iPhone** durchgehen: jeder Bereich, jedes Formular, jede PDF, Fotos, Sprachnotiz, Standort, Sicherung/Import, Kauf/Testphase/Wiederherstellen.
- Je Bereich: leer, mit Beispieldaten, hell/dunkel, hochkant/quer, kleines und großes iPhone.
- Ergebnis als Protokoll (Bereich · geprüft · Fehler · behoben) in `docs/PRUEFUNG-APPSTORE.md`.

## 8. Store-Präsentation (hochwertig)

- **Bildschirmfotos:** 6–8 Stück, echte App-Bilder mit Beispieldaten, im Gerät-Rahmen, kurze Überschrift je Bild, einheitliche Honig-Farbwelt, hell und eines dunkel.
  Reihenfolge nach Nutzen: Start · Durchsicht am Stand · Volk · Ernte/Abfüllung · Kassenbuch · PDF/Bestandsbuch · Offline/Datenschutz.
- **Vorschau-Video:** 15–30 Sekunden, nur echte Aufnahmen aus der App (Apple-Regel), ohne Ton verständlich, 886 × 1920 bzw. 1080 × 1920.
- Vorhandenes nutzen: `website-assets/`, `website-video/`, Store-Grafiken für Google Play.

## 9. Cloud-Sicherung (Julians Vorgabe 2026-10-18)

- Im Bereich **„Sichern“** zwei Wege: **Cloud-Sicherung aktivieren** (0,99 €/Monat, öffnet Apples Kauf-Fenster) oder **nur auf diesem Gerät** (selbst sichern, kostenlos).
- Cloud aktiv ⇒ **jede kleinste Änderung** geht automatisch hoch: Einträge, Einstellungen, Fotos, Sprachnotizen, Anhänge, auch Löschen.
  Wenige Sekunden nach der Änderung; ohne Netz in einer Warteschlange, die beim nächsten Netz von selbst hochgeht. Anzeige „Alles gesichert · vor x Sekunden“.
- Mehrere Geräte: Abgleich je Feld mit Zeitstempel (die App führt schon heute je Feld `lastModified`/`felder` fürs Zusammenführen von Sicherungen – darauf aufbauen).
- Anmeldung mit E-Mail und Passwort; „Konto und Cloud-Daten löschen“ in der App (Apple-Pflicht); Abo kündigen ⇒ Daten bleiben lokal, Cloud-Kopie nach Frist gelöscht.
- Server in Deutschland, Daten verschlüsselt, Vertrag zur Auftragsverarbeitung, Datenschutzerklärung erweitern.

## 10. Einführung für Neulinge durch Imme (Julians Vorgabe 2026-10-18)

- Nach dem Willkommen-Fenster (auch nach „Überspringen“) fragt Imme: „Bist du neu? Ich zeig dir in 2 Minuten das Wichtigste.“ – Ja / Später / Kenne ich schon.
- 5 Schritte, Imme zeigt auf den echten Knopf und der Nutzer tippt selbst (vorhandene Imme-Touren nutzen):
  1 Stand anlegen · 2 Volk anlegen · 3 erste Durchsicht · 4 untere Leiste und „Mehr“ · 5 Sichern.
- Abbrechen jederzeit; „Einführung wiederholen“ bei Imme und in den Einstellungen.
