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

## 11. Erinnerungen / Mitteilungen für Aufgaben und Kalender (Julians Vorgabe 2026-10-18)

- Heute: Hinweise laufen über den Service Worker und nur, wenn die App geöffnet wird. In der iOS-App (WebView) gibt es keinen Service Worker ⇒ dort kommen **keine** Mitteilungen.
- Lösung: **lokale Mitteilungen** über `@capacitor/local-notifications` – das Gerät plant sie selbst, kommen auch bei geschlossener App. Kein Server, kein Push-Zertifikat nötig.
- Einstellungen: an/aus · Aufgaben am Fälligkeitstag um (7:00) · Termine vorher (1 h) · Ende Wartezeit Behandlung · Ruhezeit · Probe-Mitteilung.
- Tippen auf die Mitteilung öffnet die Aufgabe/den Termin. Neu planen bei jeder Änderung; iOS erlaubt max. 64 geplante ⇒ immer die nächsten 64.
- Apple: Erlaubnis erst fragen, wenn sinnvoll (erste Aufgabe mit Erinnerung oder Imme-Einführung), App funktioniert auch ohne (5.1.2); keine Werbung per Mitteilung (4.5.4).
- Android: dieselbe Erweiterung, zusätzlich Erlaubnis für exakte Uhrzeit.

## 12. Julians Entscheidungen (2026-10-18)

- **Preis:** 1 Monat kostenlos, dann Einmalkauf **14,99 € (Einführungspreis)**, später **24,99 €**. Familienfreigabe vorerst nicht.
- **Cloud-Abo** 0,99 €/Monat kommt in einer späteren Version, zusammen mit der **Waage** (Codex-Entwurf liegt im Zweig `codex/waage-entwurf`).
- **Zucht:** in der Store-Version „Kommt bald“.
- **Honig-Etikettendruck:** vorerst ganz raus (nur im Testmodus sichtbar); auch kein Haftungshinweis dazu.
- **Beispieldaten:** nur im Testmodus (Web `?testmodus=1`, App `./native/sync-app.sh --testmodus`).
- **Länder:** zuerst nur Deutschland, Österreich, Schweiz.
- **Bewertungs-Nachfrage:** ja (Apple-Fenster, max. 3×/Jahr). Hilfe/Erklärvideos erst bei Bedarf.
- **Testphase:** läuft bereits durch Julian mit Imkern; TestFlight optional.
- **Impressum:** Julians echte Adresse. Widerruf regelt Apple.
- **Sicherung in iCloud/Google Drive** (eigene Datei des Nutzers, ohne Server): ja, für Version 1.
- **Updates:** Fehler sammeln und gebündelt als Update herausgeben.

## 13. Versionsnummer zum Start: 1.00 (Julian 2026-10-18)

- Beim Release: `APP_VERSION = '1.00'`, `package.json` `1.0.0`, iOS `MARKETING_VERSION = 1.0` (Build-Nummer `CURRENT_PROJECT_VERSION` bei jedem Upload +1), Android `versionName "1.0"` (`versionCode` +1 je Upload).
- `CHANGELOG` für Kunden neu beginnen: ein Eintrag 1.00 („Willkommen“) statt der Entwicklungs-Geschichte; die alte Liste bleibt in Git und `PROJEKT.md`.
- Geprüft: Die App vergleicht Versionen nur auf Gleichheit (Update-Hinweis, „Was ist neu?“) – der Sprung 2.54 → 1.00 bricht nichts; Testgeräte sehen einmal den 1.00-Eintrag. Sicherungsdateien hängen nicht an der Versionsnummer.
- Danach: 1.01, 1.02 … für Fehlerbehebungen, 1.10 für neue Funktionen, 2.00 z. B. mit Cloud.

## 14. Später (nach 1.00)

- **Etiketten-Gestalter** (Einstellungen → Etiketten): Logo, Farben, Vorlagen, Live-Vorschau, Etikettenbögen (Herma/Avery/rund/eigene Maße), Vorder-/Deckel-/Gewährstreifen-Etikett. Pflichtangaben-Prüfung ist schon gebaut (v. a. 4-mm-Füllmenge). Bis dahin bleibt der Etikettendruck nur im Testmodus.

## 15. Bau-Liste für 1.00 (Julian 2026-10-18: „lege mit allen los“) – Stand

- [x] Riesenpfeil bei unbewerteter Königin
- [x] Zucht in der Store-Version ausgeblendet (Testmodus: nutzbar)
- [x] Sicherungs-Hinweis nur auf dem Dashboard · Willkommen „Überspringen“ · Knöpfe gleich groß · Etikett + Beispieldaten nur Testmodus
- [x] Hilfe & Kontakt (E-Mail juliankhler@googlemail.com, Version/Gerät vorausgefüllt) – Adresse in `SUPPORT_MAIL`; offen: eigene Support-Adresse (siehe 16)
- [ ] Erinnerungen Aufgaben/Kalender als lokale Mitteilungen (Abschnitt 11)
- [ ] Imme-Einführung für Neulinge (Abschnitt 10)
- [ ] Sichern-Fenster mit iCloud/Google-Drive-Datei (Abschnitt 9)
- [ ] Bewertungs-Nachfrage
- [ ] Kauf: 30 Tage Test, Einmalkauf, Käufe wiederherstellen (Abschnitt 3)
- [ ] Apple-Angaben: Standort-Text, Privacy Manifest, Verschlüsselungs-Schlüssel, Datenschutzerklärung, Support-Seite (Abschnitt 2/5)
- [ ] Danach: Gesamtprüfung als App (Abschnitt 7) → Store-Bilder und Video (Abschnitt 8) → Version 1.00 (Abschnitt 13)

## 16. Eigene Support-Adresse, die Claude mitlesen kann (Julian 2026-10-18)

- Wunsch: Support-Anfragen sollen teils von Claude beantwortet werden.
- Weg: Julian legt selbst eine eigene Adresse an (z. B. neues Gmail-Konto für ImkerBuch, später `support@<eigene-domain>`). Claude darf keine Konten anlegen und keine Passwörter eingeben.
- Danach entweder (a) die Adresse als Gmail-Verbindung in Claude freigeben oder (b) im neuen Konto Weiterleitung an Julians Gmail + Label „ImkerBuch Support“.
- Claude liest, sortiert und schreibt **Entwürfe**; senden nur nach Julians Ja (je Mail) bzw. Julian sendet selbst.
- Dann `SUPPORT_MAIL` in `index.html` und Impressum/Support-Seite umstellen.
