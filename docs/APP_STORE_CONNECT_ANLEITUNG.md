# App Store Connect – Schritt für Schritt (sobald das Entwicklerkonto aktiv ist)

Stand 20.10.2026. Für Julian zum Abhaken. Alles, was Claude allein kann, ist mit **(Claude)** markiert.
Die Texte zum Einfügen stehen in `docs/APP_STORE_TEXTE.md`, die Bilder in `store-bilder/iphone/` und `store-bilder/ipad/`.
Apple benennt Menüpunkte gelegentlich um – steht etwas anders da, das Bildschirmfoto an Claude schicken.

**Grundregeln:** Bank- und Steuerdaten, Passwörter und Ausweise gibst **nur du** ein. Claude klickt nichts ab, was Geld kostet, Verträge annimmt oder etwas veröffentlicht, ohne dein ausdrückliches Ja.

---

## 0 · Woran du merkst, dass es losgehen kann

- Mail von Apple „Welcome to the Apple Developer Program“ (oder auf Deutsch).
- Auf **developer.apple.com/account** steht bei „Mitgliedschaft“ ein Ablaufdatum in einem Jahr.
- Dort steht auch die **Team-ID** (10 Zeichen). Die brauchst du gleich für Schritt 1.

## 1 · Xcode auf das bezahlte Team umstellen **(Claude)**

1. Sag Claude: „Konto ist aktiv“ (Team-ID dazu – die ist nicht geheim).
2. Claude trägt die Team-ID im Projekt ein (`DEVELOPMENT_TEAM` in `native/ios/App/App.xcodeproj/project.pbxproj`, heute noch `Z3V494U7BB` = freies Team) und prüft den Gerätebau.
3. In Xcode: Projekt neu laden („Revert“), oben dein iPhone wählen, ▶. → App startet wie gewohnt. Ab jetzt läuft sie **ein Jahr** statt 7 Tage.

> Falls Xcode meldet, die Bundle-ID `de.imkerbuch.app` sei schon vergeben: Bildschirmfoto an Claude. Grund wäre das alte freie Team, das die ID schon benutzt hat.

## 2 · Verträge, Steuer, Bank (nur du, einmalig)

Auf **appstoreconnect.apple.com** anmelden → **Geschäftlich** (engl. „Business“).

1. **Vertrag für kostenpflichtige Apps** („Paid Apps Agreement“) → Bedingungen lesen → annehmen. → Status „Aktiv“ erst, wenn 2 und 3 erledigt sind.
2. **Bankkonto** hinzufügen (IBAN – nur du tippst sie ein). → Apple zahlt einmal im Monat aus.
3. **Steuerformulare**: Apple stellt Fragen (Person, Land Deutschland). Für Nicht-US-Personen ist das das US-Formular **W-8BEN** – Apple füllt es aus deinen Antworten. → Danach Status „Aktiv“.
4. **EU-Händlerangaben (DSA)**: Frage „Bist du Händler?“ → **Ja** (du verkaufst die Vollversion). Adresse, Telefon und E-Mail eingeben – **diese drei werden im App Store öffentlich angezeigt**. Apple schickt Bestätigungscodes an Telefon und E-Mail. Ohne diese Angaben wird die App in der EU nicht angeboten.

## 3 · Die App anlegen

**Apps** → „+“ → **Neue App**

| Feld | Eintrag |
|---|---|
| Plattform | iOS |
| Name | `ImkerBuch – Stockkarte & Honig` |
| Primäre Sprache | Deutsch |
| Bundle-ID | `de.imkerbuch.app` (erscheint in der Liste, sobald Schritt 1 gebaut wurde; sonst unter developer.apple.com → Identifiers anlegen) |
| SKU | `imkerbuch-ios` (nur intern, frei wählbar) |
| Benutzerzugriff | Vollständiger Zugriff |

→ Die App erscheint als „1.0 Bereit zur Einreichung“.

## 4 · Die zwei Käufe anlegen

In der App → **Monetarisierung** → **In-App-Käufe** → „+“. Jeweils Typ **Nicht verbrauchbar**. Die Produkt-IDs müssen **genau** so lauten, sonst findet die App sie nicht.

| Produkt-ID | Referenzname | Preis | Anzeigename (Deutsch) | Beschreibung (Deutsch) |
|---|---|---|---|---|
| `de.imkerbuch.app.testphase30` | 30-day Trial | **0,00 €** (kostenlos) | 30-Tage-Testphase | 30 Tage alle Funktionen kostenlos – keine automatische Abbuchung. |
| `de.imkerbuch.app.vollversion` | Vollversion | **14,99 €** | ImkerBuch Vollversion | Alle Funktionen dauerhaft – Einmalkauf, kein Abo. |

Bei beiden:

- **Familienfreigabe**: aus.
- **Verfügbarkeit**: Deutschland, Österreich, Schweiz.
- **Prüfungsinformationen → Bildschirmfoto**: das Kauf-Fenster der App (liegt bereit: `store-bilder/pruefung-kauffenster.png`).
- **Prüfungshinweis**: „Freischaltung der Vollversion bzw. kostenlose 30-Tage-Testphase. Erreichbar beim ersten Start und unter Einstellungen → ImkerBuch Vollversion.“

→ Status danach „Fehlende Metadaten“ bis alles da ist, dann „Bereit zur Einreichung“. **Wichtig:** Die ersten Käufe werden **zusammen mit der App-Version 1.0** eingereicht (Schritt 8).

## 5 · Store-Eintrag ausfüllen

In der App → Version **1.0**:

1. **Bildschirmfotos**: iPhone 6,9″ → die Bilder aus `store-bilder/iphone/` (die dunklen `…-dunkel.png`); iPad 13″ → `store-bilder/ipad/`.
2. **Werbetext, Beschreibung, Stichwörter, Support-URL, Marketing-URL**: aus `docs/APP_STORE_TEXTE.md` kopieren.
3. **App-Informationen** (links): Untertitel, Kategorie Produktivität / Lifestyle, Datenschutz-URL, Altersfreigabe-Fragebogen (überall „Nein“).
4. **App-Datenschutz**: „Nein, wir erfassen keine Daten“ (Begründung in `APP_STORE_TEXTE.md`).
5. **Preis und Verfügbarkeit**: App **kostenlos** (verdient wird über den Kauf in der App), Länder DE/AT/CH.
6. **Informationen für die App-Prüfung**: Kontakt (Name, Telefon, E-Mail), „Anmeldung erforderlich“ **aus**, Notizen aus `APP_STORE_TEXTE.md` („Hinweise für Apples Prüfer“).

## 6 · Hochladen **(Claude bereitet vor, du sagst Ja)**

1. **(Claude)** Version auf **1.00** stellen: `node tools/release-100.mjs` (erst jetzt, direkt vor dem Hochladen), Tests laufen lassen, Store-Bau erzeugen: `cd native && ./sync-app.sh` (**ohne** `--testmodus`).
2. **(Claude)** Vorher empfohlen: eine gründliche Gesamtprüfung mit `/code-review ultra` (startest du selbst, kostet extra).
3. In Xcode oben als Ziel **„Any iOS Device (arm64)“** wählen → Menü **Product → Archive**. → Nach 1–3 Minuten öffnet sich der „Organizer“ mit dem Archiv.
4. **Distribute App** → **App Store Connect** → **Upload** → Weiter mit den Vorschlägen. → „Upload Successful“.
5. Nach 5–30 Minuten erscheint der Build in App Store Connect unter **TestFlight** (Mail „has completed processing“).

## 7 · Testen vor dem Einreichen

1. **Sandbox-Testkonto**: App Store Connect → **Benutzer und Zugriff** → **Sandbox** → Testkonto anlegen (eine E-Mail-Adresse, die noch **kein** Apple-Account ist, z. B. `juliankhler+sandbox1@googlemail.com`; das Passwort wählst du selbst).
2. Auf dem iPhone: **Einstellungen → Entwickler → Sandbox-Apple-Account** → mit dem Testkonto anmelden.
3. **TestFlight**: App „TestFlight“ aus dem App Store laden; dich selbst unter TestFlight → **Interne Tests** hinzufügen. → Einladung per Mail, App über TestFlight installieren.
4. Dort testen: Testphase starten, Vollversion kaufen, „Käufe wiederherstellen“, „Code einlösen“. → Es wird **nichts abgebucht** (Sandbox).
5. Deine Tester: unter **Externe Tests** hinzufügen (E-Mail genügt). Der erste externe Build braucht eine kurze Beta-Prüfung durch Apple (meist 1 Tag).

## 8 · Einreichen

1. Version 1.0 → **Build** auswählen (der hochgeladene).
2. Abschnitt **In-App-Käufe und Abonnements** → beide Käufe auswählen. *(Ohne diesen Schritt prüft Apple die Käufe nicht mit – häufigster Ablehnungsgrund bei der ersten Version.)*
3. **Zur Prüfung hinzufügen** → **Zur Prüfung einreichen**.
4. Prüfung dauert meist 1–2 Tage. Kommt eine Rückfrage oder Ablehnung: Text an Claude schicken.
5. Nach der Freigabe: **Veröffentlichen** (sofort oder manuell).

## 9 · Danach

- **Angebotscodes** (Gratis-Zugänge, Abschnitt 17 in `APP_STORE_EINREICHUNG.md`): In-App-Käufe → Vollversion → **Angebotscodes** → Code anlegen (z. B. `IMKERVEREIN26`).
- **Repo privat machen** und Web-Version auf die Vorstellungsseite umstellen (Abschnitte 25/26).
- **Preis** später auf 24,99 € (Preisplan im Kauf „Vollversion“, Datum vorab einstellbar).
