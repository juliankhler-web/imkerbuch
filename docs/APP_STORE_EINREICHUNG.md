# App Store – Einreichung (Checkliste)

Stand 2026-10-18 · Quelle: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/),
[DSA-Händlerangaben](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-compliance-information)

Legende: ✅ vorhanden · ⚠️ fehlt/zu tun · ❓ Entscheidung von Julian

## 1. Konto und Recht

- ⚠️ **Apple Developer Program** (99 €/Jahr). Julians Team ist bisher das kostenlose – damit kann man nicht einreichen.
  - 20.10.2026: Anmeldung läuft (als **Einzelperson**, über die App „Apple Developer“). Als Ausweis bietet Apple nur den **Führerschein** an. Der Name im Apple-Account muss **genau** wie im Führerschein stehen (beide Vornamen, Nachname mit „ö“) – vorher stand dort „julian Koehler“. Bei Einzelpersonen erscheint dieser Name später als **Verkäufer** im App Store.
  - 20.10.2026, 09:46: Ausweis-Prüfung in der App gescheitert („Unable to Verify Your Identity … Please contact support“) → Weg über den Apple-Developer-Support (developer.apple.com/contact → Mitgliedschaft und Account → Programm-Anmeldung).
  - Apple fragt bei der Anmeldung nach der **USt-IdNr.** Es gibt noch keine: Die Steuernummer fürs Gewerbe steht noch aus, danach beim BZSt beantragen. Laut Kasse (99 €, Apple-Webshop) ist das Feld **freiwillig**, also leer lassen. **Stand 20.10.2026, 10 Uhr: Kauf vorerst zurückgestellt (Julian).** Erst das bezahlte Konto ermöglicht TestFlight, App-Store-Connect-Produkte, Sandbox-Käufe und das Einreichen. Gerätetest per Xcode geht auch ohne. Als Kleinunternehmer würde eine angegebene USt-IdNr. die Umkehr der Steuerschuld (§ 13b UStG) auslösen; ohne sie berechnet Apple die Steuer selbst. Im Zweifel Steuerberater fragen.
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
- Android: dieselbe Erweiterung, **ohne** exakten Wecker (`isExactNotification: false`, Berechtigung entfernt) – Erinnerungen dürfen ein paar Minuten später kommen.

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
- **Fertiger Schalter (2026-10-19):** `node tools/release-100.mjs --probe` zeigt nur an; `node tools/release-100.mjs` stellt um (Version, Willkommens-Eintrag, alte Geschichte → `docs/CHANGELOG-ENTWICKLUNG.md`, `package.json`, Service-Worker-Cache). Danach `npm test`, `./native/sync-app.sh` (OHNE `--testmodus`), committen. An einer Kopie geprüft: läuft, Ergebnis ist gültig, zweiter Aufruf ändert nichts. iOS/Android stehen schon auf 1.0 / Build 1.

## 14. Später (nach 1.00)

- **Etiketten-Gestalter** (Einstellungen → Etiketten): Logo, Farben, Vorlagen, Live-Vorschau, Etikettenbögen (Herma/Avery/rund/eigene Maße), Vorder-/Deckel-/Gewährstreifen-Etikett. Pflichtangaben-Prüfung ist schon gebaut (v. a. 4-mm-Füllmenge). Bis dahin bleibt der Etikettendruck nur im Testmodus.

## 15. Bau-Liste für 1.00 (Julian 2026-10-18: „lege mit allen los“) – Stand

- [x] Riesenpfeil bei unbewerteter Königin
- [x] Zucht in der Store-Version ausgeblendet (Testmodus: nutzbar)
- [x] Sicherungs-Hinweis nur auf dem Dashboard · Willkommen „Überspringen“ · Knöpfe gleich groß · Etikett + Beispieldaten nur Testmodus
- [x] Hilfe & Kontakt (E-Mail juliankhler@googlemail.com, Version/Gerät vorausgefüllt) – Adresse in `SUPPORT_MAIL`; offen: eigene Support-Adresse (siehe 16)
- [x] Erinnerungen Aufgaben/Kalender als lokale Mitteilungen (Abschnitt 11) – v2.55, im Simulator geprüft; Android: Erlaubnis exakte Uhrzeit noch prüfen
- [x] Imme-Einführung für Neulinge (Abschnitt 10) – `Einfuehrung`, Angebot nach Willkommen, Chip bei Imme, „Einführung wiederholen“ in Einstellungen → Rechtliches
- [x] Sichern über das Teilen-Menü (iCloud Drive, Google Drive, Mail, AirDrop) – im Simulator geprüft; automatische Sicherung in der App ausgeblendet
- [x] Bewertungs-Nachfrage (`Bewertung`)
- [x] Kauf im Code: 30-Tage-Testphase (0-€-Kauf), Vollversion, Wiederherstellen, Code einlösen, Nur-Lesen nach Ablauf; `ImkerBuch.storekit` für Xcode-Test. **Offen (zusammen):** Produkte in App Store Connect anlegen, Sandbox-Test
- [x] Apple-Angaben: Standort-/Sprach-Text, Privacy Manifest, Verschlüsselungs-Schlüssel, Datenschutzerklärung (alle Dienste, Apple, Kontakt), `support.html`, Rechtstexte in der App als Fenster; Store-Texte in `docs/APP_STORE_TEXTE.md`
- [ ] Danach: Gesamtprüfung als App (Abschnitt 7) → Store-Bilder und Video (Abschnitt 8) → Version 1.00 (Abschnitt 13)

## 16. Eigene Support-Adresse, die Claude mitlesen kann (Julian 2026-10-18)

- Wunsch: Support-Anfragen sollen teils von Claude beantwortet werden.
- Weg: Julian legt selbst eine eigene Adresse an (z. B. neues Gmail-Konto für ImkerBuch, später `support@<eigene-domain>`). Claude darf keine Konten anlegen und keine Passwörter eingeben.
- Danach entweder (a) die Adresse als Gmail-Verbindung in Claude freigeben oder (b) im neuen Konto Weiterleitung an Julians Gmail + Label „ImkerBuch Support“.
- Claude liest, sortiert und schreibt **Entwürfe**; senden nur nach Julians Ja (je Mail) bzw. Julian sendet selbst.
- Dann `SUPPORT_MAIL` in `index.html` und Impressum/Support-Seite umstellen.
- **Stand 2026-10-18:** Neues Gmail-Konto ging nicht (Telefonnummer schon vergeben). Übergangslösung: **juliankhler+imkerbuch@googlemail.com** (landet im normalen Gmail) – in der App eingetragen; Gmail-Etikett „ImkerBuch Support“ von Claude angelegt. Gmail-Filter (to: …+imkerbuch → Etikett „ImkerBuch Support“) von Claude über die Chrome-Erweiterung angelegt und geprüft. Claude findet die Mails auch ohne Filter über `to:juliankhler+imkerbuch@googlemail.com`. Vor dem Release: eigene Domain mit support@… (IONOS/Strato).

## 17. Gratis-Zugänge (Coupons) – Julian 2026-10-18

- Wunsch: kostenlose Zugänge, die Julian vergeben kann.
- Weg: **Apple-Angebotscodes (Offer Codes)** für den Einmalkauf „Vollversion“ – seit Ende 2025 auch für Einmalkäufe; gratis oder rabattiert, Einmal-Codes oder ein eigener Code (z. B. `IMKERVEREIN26`). Einlösen im App Store oder direkt in der App (StoreKit-Einlösefenster, Knopf „Code einlösen“ beim Kauf).
- **Eigene Freischalt-Codes außerhalb von Apple sind verboten** (Regel 3.1.1: keine eigenen Lizenzschlüssel/QR-Codes zum Freischalten).
- Apples alte IAP-Promo-Codes gibt es seit 26.03.2026 nicht mehr; Promo-Codes für den App-Download weiter möglich (bei Gratis-Download nutzlos).

## 18. Großer Sicherheitstest am Ende (Julian 2026-10-18)

- Wenn alles gebaut ist: gründliche Sicherheitsprüfung. Mindestens: eingeschleuster Text/HTML in allen Eingabefeldern und beim Import (Sicherung, CSV/Excel, PDF), manipulierte Sicherungsdateien, externe Dienste und Bibliotheken (nur lokal gebündelt, feste Versionen), Content-Security-Policy, Mail-/Link-Aufrufe, Kauf-Freischaltung nicht per Speicher-Trick umgehbar, Datenschutz (nichts verlässt ungefragt das Gerät), iOS-Einstellungen (ATS, Berechtigungen).
- ⚠️ **Code-Schutz / Web-Version:** Das GitHub-Repo `juliankhler-web/imkerbuch` ist **öffentlich** und die volle App läuft kostenlos auf GitHub Pages. Für eine Kauf-App heißt das: jeder kann den Code lesen und die Web-Version gratis nutzen. Vor dem Release entscheiden: Repo privat machen (GitHub Pages aus privatem Repo braucht GitHub Pro) und/oder Web-Version durch reine Landingpage ersetzen.

## 19. Behörden und Apple-Konto (Julian 2026-10-18, Plan aus ChatGPT übernommen)

- Gewerbe angemeldet, **Beginn der Tätigkeit 19.10.2026** → Frist ELSTER-Fragebogen **19.11.2026** (Kalender „Familie & Fristen“, Second Brain). Als Nächstes: ELSTER-Fragebogen zur steuerlichen Erfassung (Pflicht **innerhalb 1 Monat** nach Beginn der Tätigkeit), USt-IdNr. mitbeantragen.
- Parallel: **Apple-Entwicklerkonto (99 €/Jahr) jetzt beantragen** – die Prüfung durch Apple kann Tage dauern; erst danach Verträge, Bank, Steuerformular (W-8BEN), Kaufprodukte, Sandbox-Test.
- Abweichungen vom ChatGPT-Plan: Preis 14,99 € (später 24,99 €), nicht 9,99 €; Familienfreigabe vorerst nicht.

## 20. Abschluss-Prüfung durch zweiten Agenten (Julian 2026-10-18)

- Wenn iOS komplett vorbereitet ist („wirklich an alles denken“): einen **neuen, unabhängigen Agenten** alles gegen Apples Regeln und diese Checkliste nachprüfen lassen, Funde beheben.
- Danach dasselbe für den **Google Play Store** (eigene Checkliste: Data-Safety-Formular, Zielgruppe, Kontolöschung-Regel, 12 Tester × 14 Tage, Play Billing für Kauf/Codes, App-Bundle, Zielplattform-API).

## 21. Ergebnis Prüf-Agent iOS (2026-10-18) – Stand

Behoben in v2.57: Privacy Manifest (FileTimestamp C617.1), `NSPhotoLibraryAddUsageDescription`, arm64, iOS 16 (Angebotscodes), alle Datei-Ausgaben übers Teilen-Menü, kein nachgeladener Code in der App (OCR/Whisper aus), app-taugliche Imme-Antworten, Preise nur aus dem Store, Kaufstand gerätebezogen, Kauf-Fenster nach dem Willkommen, „Alle Daten löschen“, Papierkorb-Aufräumen nach Ablauf, Vorname freiwillig, Zucht-Erwähnungen, Datenschutz ergänzt, Store-Texte. Simulator: Erst-Start Willkommen → Kauf-Fenster → Imme geprüft.

**Offen – gemeinsam mit Julian:**

- Version **1.00** + Kunden-CHANGELOG direkt vor dem Upload (Abschnitt 13).
- Kaufprodukte in App Store Connect anlegen und **mit Version 1.0 zusammen einreichen**; Sandbox-Test (auch Testphase-Neuinstallation, Wiederherstellen, Code einlösen).
- **iPad:** gründlich testen + iPad-Bilder ODER nur iPhone (`TARGETED_DEVICE_FAMILY = 1`). Entscheidung Julian.
- ~~Open-Meteo~~ → erledigt: Deutscher Wetterdienst (v2.58).
- Support-/Datenschutz-Seiten müssen dauerhaft online bleiben, auch wenn die Web-Version/das Repo geändert wird (Abschnitt 18).
- AGB § 4 (Kleinunternehmer-Satz) je nach ELSTER-Entscheidung anpassen.
- Bei der Gesamtprüfung auf dem iPhone ansehen: doppelte Erlaubnis-Abfrage (Standort/Mikrofon), Mail-Link auf der Support-Seite im Fenster, Startzeit der App.

## 22. Entscheidungen + Recherche (Julian 2026-10-18, Abend)

- **iPad: JA.** App bleibt iPhone + iPad (`TARGETED_DEVICE_FAMILY = 1,2`) → iPad gründlich testen (hoch/quer, Kauf-Fenster, Einführung, Teilen-Menü) und iPad-Bilder 13″ für den Store.
- **Wetter:** Open-Meteo gratis nur nicht-kommerziell („Apps mit Abo oder Werbung“ = kommerziell; Kauf-App sehr wahrscheinlich auch) → ersetzen. Optionen:
  - **Apple WeatherKit:** 500.000 Abrufe/Monat im Entwicklerkonto inklusive, aber nur iOS direkt; Android/Web bräuchten einen eigenen Server (Schlüssel darf nicht in die App).
  - **Bright Sky (Daten vom Deutschen Wetterdienst):** kostenlos, ohne Schlüssel, „free-to-use for all purposes“; es gelten die DWD-Nutzungsbedingungen (Quellenangabe „Deutscher Wetterdienst“). Funktioniert in iOS, Android und Web gleich. **Umgesetzt v2.58** (Julian: „stell auf den deutschen Wetterdienst um“) – DE/CH über Messstationen, AT (z. B. Wien) über DWD-Vorhersage geprüft.
  - „Vom Handy abgreifen“: Das Handy selbst stellt Apps keine Wetterdaten bereit (außer WeatherKit auf iOS).
- **Google Play (Recherche):**
  - Neue Apps müssen **Android 16 / API 36** als Ziel haben (seit 31.08.2026) – ImkerBuch hat `targetSdk 36` ✅.
  - **Neue private Entwicklerkonten:** geschlossener Test mit **12 Testern über 14 Tage am Stück** vor der Freigabe (Google prüft auch, ob sie die App wirklich nutzen). Julians Imker-Testgruppe dafür nutzen.
  - **Kein 0-€-Einmalkauf** wie bei Apple → Testphase auf Android anders lösen (z. B. ab erstem Start auf dem Gerät; Neuinstallation setzt zurück – vertretbar) oder Vollversion direkt + Gutscheine.
  - **Gutscheine:** Play-Promo-Codes gehen auch für Einmalkäufe – aber nur Einmal-Codes (je Code einmal); eigene Sammel-Codes wie `IMKERVEREIN26` gibt es bei Google **nur für Abos**.
  - ⚠️ Android-Manifest hat bisher nur INTERNET – **Kamera, Mikrofon und Standort fehlen** (sonst gehen Fotos/Sprachnotizen/Standort in der Android-App nicht).

## 23. Stand 2026-10-19 – was ich allein fertig habe, was wir zusammen machen

**Fertig (v2.60, 643 Tests grün, iOS im Simulator geprüft):** alle Punkte aus Abschnitt 15, beide Prüf-Agenten (iOS + Play) abgearbeitet, Wetter auf DWD, Android-Code vorbereitet (`docs/PLAY_STORE.md`). Beim Startzeit-Test einen schweren Fehler gefunden und behoben (Schreibsperre blockierte den Start).

**Zusammen mit Julian:**

1. Apple-Entwicklerkonto (99 €/Jahr) + Verträge, Bank, Steuerformular, Händlerangaben (Telefonnummer).
2. Kaufprodukte + Angebotscodes in App Store Connect anlegen, Sandbox-Test, Version **1.00** setzen, Store-Texte einfügen.
3. Gesamtprüfung auf deinem iPhone **und iPad** (jede Funktion), dann Store-Bilder (iPhone 6,9″, iPad 13″) und Video.
4. Android: Java + Android Studio installieren (großer Download), Android-Test im Emulator/auf einem Handy, Google-Play-Konto (25 $), 12 Tester × 14 Tage, Kaufprodukt + Codes, Bilder.
5. Entscheidungen: Web-Version/öffentliches GitHub (Seiten müssen online bleiben), AGB § 4 nach ELSTER, ELSTER-Fragebogen bis 19.11.2026.

## 24. Stand 2026-10-19 (v2.61) – Gesamtprüfung, Sicherheitstest, Schalter 1.00

- **Gesamtprüfung (automatisch, `tools/gesamtpruefung.mjs`):** iPhone klein/groß/dunkel, iPad hoch/quer – jede Seite, jeder Reiter, jedes „Neu“-Formular: keine Fehlermeldungen, nichts ragt über den Rand, keine Riesen-Symbole, kein „undefined/NaN“. Das Werkzeug prüft sich selbst (eingebaute Probe-Fehler müssen gefunden werden) und leert vorher den Offline-Speicher.
- **Im iOS-Simulator geprüft:** Start mit Schutzregel, Hilfe & Kontakt, Standort-Frage (war doppelt → behoben, jetzt eine Frage). Der Simulator hat **keine Mail-App** → Mail-Knöpfe (Hilfe & Kontakt + Support-Seite im App-Fenster) auf Julians iPhone prüfen.
- **Sicherheitstest:** Bericht `docs/SICHERHEITSPRUEFUNG.md` – keine offene Lücke; Capacitor-Lücke + pdf.js-Lücke behoben, Schutzregel (CSP) im App-Build neu. Nach 1.00: jsPDF aktualisieren.
- **Schalter 1.00:** `tools/release-100.mjs` (Abschnitt 13), erst direkt vor dem Hochladen.
- Fürs Gerät (Punkt 3 oben) zusätzlich: Mail-Knöpfe, Standort-Frage nur einmal, Mikrofon-Frage nur einmal (Sprachnotiz), iPad quer/hoch.

## 25. Web-Version (Julian 2026-10-19)

- **Zum Start 1.00:** Webseite = nur Vorstellungsseite + Links (App Store, Datenschutz, Impressum, Support). Die volle Web-App soll dann nicht mehr frei nutzbar sein (sonst gratis statt Kauf). Endgültiges Ja von Julian noch offen.
- **Später mit der Cloud (0,99 €/Monat):** Browser-Zugang mit **Konto**: in der App freiwillig anmelden (am einfachsten „Mit Apple anmelden“; wenn zusätzlich Google, dann Apple Pflicht), auf der Webseite mit demselben Konto anmelden → dieselben Daten. Server prüft Kauf/Cloud-Abo. Server DSGVO-konform in Deutschland. Apple erlaubt Web-Nutzung bereits gekaufter Inhalte (Regel 3.1.3(b), Multiplattform).
- Werbeversprechen „Kein Konto“ bleibt wahr: Konto ist freiwillig, nur für Cloud/Web. Store-Text dann „Konto nur, wenn du willst“.

## 26. GitHub (Julian 2026-10-19)

- Repo bleibt **öffentlich bis zum Start**; erst dann privat. Kein GitHub Pro jetzt (bei öffentlichen Repos bringt Pro praktisch nichts).
- Zum Start (kostenlos): App-Code-Repo privat, zweites kleines öffentliches Repo nur für Vorstellungsseite + Datenschutz/Impressum/AGB/Support (Pages kostenlos). URLs in den Store-Texten dann anpassen oder gleich halten. Pro (4 $/Monat) nur nötig, wenn Pages aus dem privaten Repo kommen soll.
- 2026-10-19: GitHub Pages auf **„GitHub Actions“** umgestellt (Julians Ja). `.github/workflows/pages.yml` veröffentlicht nur App + Webseite (11 MB statt 176 MB; keine iOS-/Android-Projekte, Videos, Store-Fotos mehr öffentlich). Neue Dateien, die die Webseite braucht, dort in die Kopierliste eintragen.

## 27. ImkerBuch Light (Julian 2026-10-20)

- 30 Tage **alles** offen (Testphase, „man soll sehen, wie gut es ist“). Danach **kein Sperren**, sondern dauerhaft kostenlos „Light“: bis **2 aktive Völker**, Stände, Durchsicht (auch am Stand), Stockkarte, Varroa, Königinnen, Imme/Imkerschule/Hilfe, Sicherung/Export.
- **Nur Vollversion (14,99 €, später 24,99 €):** Kassenbuch, Rechnungen, Verkauf, Chargen/Abfüllung/Lager, Abnehmer, weitere Produkte, **Behandlungen + Bestandsbuch, Meldungen, Fütterung + Futterrechner, Ernte, Aufgaben + Erinnerungen, Wetter, Fotos/Dokumente, Sprachnotizen** (Julians Entscheidung, Hinweis auf Bestandsbuch-Pflicht wurde gegeben), Bio, Hygiene, Fahrtenbuch, Zeiterfassung, Wanderungen, Trachten, Statistiken, Rechner, mehr als 2 Völker.
- „Muss richtig nerven“ (Julian), aber Apple-konform immer wegklickbar: „Voll“-Kennzeichen im Menü/„Alle Bereiche“/untere Leiste, Hinweis-Leiste auf jeder Vollversions-Seite und auf der Startseite, Kauf-Fenster bei jedem gesperrten Speichern, beim Start höchstens alle 3 Tage.
- Gesperrte Bereiche bleiben **lesbar** (Daten aus der Testphase sichtbar). Mehr als 2 aktive Völker: Ansehen ja, Neues erst bei ≤ 2 (Auflösen/Vereinigen bleibt erlaubt) oder mit Vollversion.
- Technik: `Lizenz.light()`, `NUR_VOLL`, `VOLK_TAB_VOLL`, `pruefeLight` (formModal + Durchsicht am Stand), `nurVoll()` an Einstiegen außerhalb gesperrter Seiten, `neuesVolkErlaubt()`, `lightErinnerung()`, `kennzeichnen()`. Store-Texte + Prüferhinweise angepasst.
