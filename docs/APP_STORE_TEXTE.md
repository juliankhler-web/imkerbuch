# App Store – Texte und Angaben (Entwurf zum Einfügen)

Stand 2026-10-18. Alles hier ist zum Kopieren in App Store Connect gedacht. Julian prüft und gibt frei.

## App-Informationen

- **Name (max. 30):** `ImkerBuch` (Julian 20.10.2026: „der Name wird nur ImkerBuch“; vorher Entwurf „ImkerBuch – Stockkarte & Honig“)
- **Untertitel (max. 30):** `Bienenvölker offline verwalten`
- **Kategorie:** Produktivität (Haupt), Lifestyle (Neben)
- **Bundle-ID:** `de.imkerbuch.app`
- **Altersfreigabe:** Fragebogen überall „Nein“ → voraussichtlich 4+
- **Länder:** Deutschland, Österreich, Schweiz
- **Support-URL:** `https://juliankhler-web.github.io/imkerbuch/support.html`
- **Datenschutz-URL:** `https://juliankhler-web.github.io/imkerbuch/datenschutz.html`
- **Marketing-URL (optional):** `https://juliankhler-web.github.io/imkerbuch/landing.html`
- **Copyright:** `2026 Julian Köhler`

## Stichwörter (max. 100 Zeichen, Komma ohne Leerzeichen)

`Imker,Imkerei,Stockkarte,Honig,Bienen,Varroa,Bestandsbuch,Bienenvolk,Königin,Kassenbuch,Bio` (91 Zeichen; „Stockkarte“ und „Honig“ aufgenommen, weil sie nicht mehr im Namen stehen)

## Werbetext (max. 170, jederzeit änderbar)

Das digitale Stockbuch für Imker: Durchsicht am Stand auch mit Handschuhen, Bestandsbuch als PDF, Kassenbuch und Honigverkauf – offline, ohne Konto, ohne Abo.

(Zur 1.0 kein „Neu:“-Text – der passt erst zu Updates.)

## Beschreibung

ImkerBuch ist das digitale Stockbuch für Imkerinnen und Imker – komplett auf Deutsch, offline und ohne Konto. Deine Daten bleiben auf deinem Gerät.

DURCHSICHT AM STAND
• Eine Frage pro Bildschirm, große Knöpfe – auch mit Handschuhen
• Stockkarte mit Volksstärke, Brut, Sanftmut, Futter, Weiselzellen
• Sprachnotizen direkt am Bienenstand

VÖLKER, KÖNIGINNEN, STÄNDE
• Alle Völker mit Verlauf, Königinnen mit Stammbaum und Bewertung
• Bienenstände mit Wetter und Kartenlink
• Behandlungen mit Wartezeiten, Fütterung mit Futter-Rechner

HONIG UND GESCHÄFT
• Ernte, Chargen, Abfüllung und Bestand
• Kassenbuch, Rechnungen, Abnehmer
• Bestandsbuch und Meldungen als PDF

FÜR BIO-IMKEREIEN
• Bio-Unterlagen, Hygieneplan, Umgebungsprüfung der Stände

DEINE STARTSEITE, DEIN AUFBAU
• Kacheln und Schnellzugriffe selbst zusammenstellen – für den Hobby-Stand genauso wie für den Imkereibetrieb

IMME, DEIN ASSISTENT
• Beantwortet Fragen zur App und zeigt dir Schritt für Schritt, wie es geht – auch ohne Internet

DEINE DATEN GEHÖREN DIR
• Kein Konto, keine Werbung, kein Tracking
• Sicherung per Teilen-Menü in iCloud Drive, Google Drive oder per Mail

30 Tage alle Funktionen kostenlos testen. Danach läuft ImkerBuch kostenlos als Light weiter (bis 2 Völker, Durchsicht, Stockkarte, Varroa, Königinnen) – oder du holst dir einmalig die Vollversion: kein Abo, keine automatische Abbuchung. Alles, was du eingetragen hast, bleibt sichtbar und sicherbar.

Fragen oder Wünsche? Schreib mir direkt aus der App über „Hilfe & Kontakt“.

## In-App-Käufe (anlegen in App Store Connect)

| Produkt-ID | Typ | Referenzname | Anzeigename (de) | Preis |
|---|---|---|---|---|
| `de.imkerbuch.app.testphase30` | Nicht verbrauchbar | 30-day Trial | 30-Tage-Testphase | 0,00 € |
| `de.imkerbuch.app.vollversion` | Nicht verbrauchbar | Vollversion | ImkerBuch Vollversion | 14,99 € (Einführung), später 24,99 € |

Beschreibung Testphase: „30 Tage alle Funktionen gratis – keine Abbuchung.“ (Apple erlaubt nur 55 Zeichen)
Beschreibung Vollversion: „Alle Funktionen dauerhaft – Einmalkauf, kein Abo.“
Familienfreigabe: aus. Prüfungs-Screenshot: Kauf-Fenster der App.

## Hinweise für Apples Prüfer (App Review Information → Notes)

ImkerBuch is an offline record-keeping app for beekeepers. No account or login is required; all data is stored locally on the device.

- On first launch a short welcome form appears (all fields optional, "Überspringen" possible); right after it the purchase screen opens: tap "30 Tage kostenlos starten" to start the free 30-day trial (a free non-consumable IAP, as described in guideline 3.1.1). The full version is the non-consumable "de.imkerbuch.app.vollversion".
- "Käufe wiederherstellen" (Restore Purchases) and "Code einlösen" (offer codes) are on the purchase screen and under Einstellungen → "ImkerBuch Vollversion".
- After the 30-day trial the app keeps working for free as "ImkerBuch Light": up to 2 active colonies with inspections, hive card, varroa and queens. Business features (cash book, invoices, sales, treatments/medicine log, feeding, harvest, tasks, photos/voice notes, organic records, trips, time tracking) require the full version; they stay visible and all existing data stays readable and can be backed up/exported at any time.
- To try the app quickly, create a stand ("Bienenstände" → "+ Neuer Stand") and a colony ("Völker" → "+ Volk"), or follow the built-in tour by the assistant "Imme".
- Permissions are only requested when used: camera (photos), microphone (voice notes), location (stand position), notifications (task reminders, local only).
- Support and privacy pages are reachable in the app under Einstellungen → Rechtliches and "Hilfe & Kontakt".

## App-Datenschutz („Datenschutz-Nährwerttabelle“)

- **Erfasst ihr Daten von dieser App?** → **Nein, wir erfassen keine Daten.**
  Begründung: Alle Inhalte bleiben auf dem Gerät. Wetter-, Karten- und Geodienste bekommen nur Koordinaten/Suchbegriffe ohne Personenbezug und speichern nichts für uns; Kauf läuft über Apple. Support-Mails schickt der Nutzer selbst aktiv (zählt nicht als Erfassung durch die App).
- **Tracking:** Nein.

## Exportkonformität

`ITSAppUsesNonExemptEncryption = NO` ist in der App gesetzt (nur Standard-HTTPS) – keine Rückfrage beim Hochladen.
