# ImkerBuch – Was brauche ich zur Veröffentlichung? (Checkliste)

> Stand 2026-07-07. **Keine Rechts-/Steuerberatung** – Orientierung + To-dos. Den
> §24-Landwirt-plus-Gewerbe-Mix einmal von einem Steuerberater bestätigen lassen.

## 1. Gewerbe / Kleingewerbe
- Apps gegen Geld verkaufen = **gewerbliche Tätigkeit** → **Gewerbeanmeldung** beim
  örtlichen Gewerbeamt nötig (ca. 20–65 €). Das ist **getrennt** von der Imkerei
  (die läuft als Landwirtschaft/§24 – Software ist kein landwirtschaftlicher Betrieb).
- „Kleingewerbe" = kleines Einzelunternehmen ohne Handelsregister → einfache
  Einnahmen-Überschuss-Rechnung (EÜR), kein Kaufmann. Für den Anfang genau richtig.
- Nach der Anmeldung schickt das Finanzamt den **„Fragebogen zur steuerlichen
  Erfassung"** (über ELSTER auszufüllen) → daraus kommt ggf. die Steuernummer/USt-IdNr.
- **Gewerbesteuer:** erst ab **24.500 € Gewinn/Jahr** relevant (Freibetrag Einzelunternehmer).

## 2. Steuer (mit Steuerberater klären!)
- **Kleinunternehmerregelung (§19 UStG):** möglich, wenn Umsatz im Vorjahr ≤ **25.000 €**
  und im laufenden Jahr ≤ **100.000 €** (Grenzen seit 2025). Dann **keine USt** auf den
  App-Rechnungen, keine USt-Voranmeldung. Für den Start meist sinnvoll.
- **Achtung Mix:** Die Imkerei ist **§24-Pauschallandwirt**, das App-Geschäft ist ein
  **eigenes Gewerbe**. Wie §19 (App) neben §24 (Imkerei) sauber zusammengeht und ob die
  Umsätze für die §19-Grenze zusammengezählt werden → **unbedingt Steuerberater fragen**.
- App-Einnahmen kommen in die Steuererklärung als **gewerbliche Einkünfte** (Anlage G / EÜR).

## 3. Pflicht-Rechtstexte (erledigt als Vorlage ✅)
- **Impressum** (§5 DDG) → `impressum.html` ✅ – Platzhalter ausfüllen.
- **Datenschutzerklärung** (DSGVO + Google-Play-Pflicht) → `datenschutz.html` ✅ – Platzhalter ausfüllen.
- **Ladungsfähige Anschrift Pflicht:** Impressum braucht eine echte Adresse (kein Postfach).
  Als Solo-Entwickler i. d. R. die **Privatadresse** – die wird öffentlich (siehe Play/DSA unten).
- **Noch offen – Widerrufsrecht/AGB** für den kostenpflichtigen Kauf: Bei digitalen Inhalten
  verliert der Kunde das Widerrufsrecht, sobald er mit ausdrücklicher Zustimmung startet.
  Google wickelt Kauf/Erstattung ab (48-h-Auto-Refund), das deckt viel ab; eine kurze
  **Widerrufsbelehrung + einfache AGB** sind trotzdem empfehlenswert.

## 4. Name / Marke
- **„ImkerBuch"** vor Release im **DPMA-Register** (register.dpma.de) prüfen, ob geschützt
  → Kollision vermeiden. Eigene Markenanmeldung ist optional (nicht Pflicht, ~290 €).

## 5. Google Play Console
- **Entwicklerkonto:** einmalig **25 $**. Identitätsprüfung (Ausweis/Adresse) nötig.
- **⚠️ 12-Tester-Regel:** Neue **persönliche** Konten müssen die App zuerst **≥ 14 Tage
  mit mind. 12 Testern** im geschlossenen Test laufen lassen, bevor Produktion möglich ist.
  → früh 12 Tester organisieren (Imker-Kollegen, Verein, Familie).
- **DSA/Trader-Status:** Wer Geld verdient, muss als „Trader" **Name + Anschrift + Telefon +
  E-Mail** hinterlegen – diese **Händler-Kontaktdaten zeigt Google öffentlich** im Store.
- **Für bezahlte App:** „Payments profile" (Bank-/Steuerdaten) im Play-Console anlegen.
- **Data-Safety-Formular:** ausfüllen. Für ImkerBuch einfach: **keine Daten erhoben/geteilt**
  (alles lokal); Berechtigungen (Kamera/Mikro/Standort/Speicher) ehrlich angeben.
- **Content-Rating** (IARC-Fragebogen) + Zielgruppe/Altersfreigabe ausfüllen.
- **Datenschutz-URL** eintragen = die gehostete `datenschutz.html`.
- Store-Grafiken (Icon/Feature/Screenshots) ✅ liegen unter `Fotos Playstore/Play Store Upload/`.

## 6. Programme / Technik (App-Paket bauen)
- **Empfohlen: PWABuilder** (pwabuilder.com, kostenlos, Cloud) → PWA-URL eingeben →
  erzeugt ein **Android-App-Bundle (.aab)** als Trusted Web Activity (TWA). Kein lokales
  Android-Studio nötig.
- Alternative: **Bubblewrap** (Google-CLI) – braucht **JDK + Android SDK** lokal.
- **assetlinks.json:** Muss unter `https://<deine-domain>/.well-known/assetlinks.json`
  liegen und den **SHA-256-Fingerprint** deines Signaturschlüssels enthalten (verknüpft
  App ↔ Website, sonst zeigt die TWA eine Browser-Leiste). Auf GitHub Pages im Repo ablegen.
- **Signaturschlüssel (Keystore .jks):** PWABuilder erzeugt einen – **sicher aufbewahren**
  (Verlust = keine Updates mehr möglich). Besser zusätzlich **Play App Signing** aktivieren.
- Voraussetzung ist erfüllt: gehostete PWA (GitHub Pages) + `manifest.json` + Service Worker ✅.

## 7. Empfehlung: „100 % lokal"-Versprechen absichern
- Aktuell lädt die App Bibliotheken von **fremden CDNs** (jsdelivr, cdnjs, unpkg, sheetjs) –
  dabei geht die **IP der Nutzer** an diese Dienste (DSGVO-Thema, „Google-Fonts"-Urteile).
- Für ein sauberes Privacy-Versprechen die Libs **selbst hosten** (ins Repo legen statt CDN).
  Bonus: bessere Offline-Zuverlässigkeit. → als eigenes To-do eingeplant.

## Reihenfolge (Vorschlag)
1. Platzhalter in `impressum.html` + `datenschutz.html` ausfüllen → hochladen.
2. Gewerbe anmelden + Steuerberater-Termin (§19/§24-Frage).
3. Play-Entwicklerkonto (25 $) + 12-Tester-Test starten (läuft 14 Tage nebenher).
4. App mit PWABuilder bauen, assetlinks.json hosten, Keystore sichern.
5. Store-Eintrag: Grafiken, Data-Safety, Content-Rating, Datenschutz-URL, Preis.
6. Nach bestandenem Tester-Test → Produktion.
