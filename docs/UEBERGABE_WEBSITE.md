# Übergabe neue Website imkerbuch.app (Hauptchat → ImkerBuch2)

Stand 2026-10-30. Geschrieben im Chat „Unterlagen – Hauptchat“, der dafür eigentlich nicht da ist. **Ab jetzt läuft alles zur Website, zur Cloud und zur App im Chat ImkerBuch2.** Die Entscheidungen im Wortlaut stehen in `docs/APP_STORE_EINREICHUNG.md` § 30 (neue Punkte ganz unten).

## Zuerst prüfen

1. **Light-Lücken sind erledigt:** App 3.05 ist committet (857bae9), die Sitzung ist beendet und archiviert. Vorher trotzdem `git status` und `git log --oneline -5` ansehen. Der Faktencheck der Website galt für 3.04, 3.05 ist noch nicht gegengeprüft (Marktverkauf, Wetter, Warnungen in der Tipp-Kachel, Kamera-Text in datenschutz.html).
2. **Hat Julian bei Hetzner bestellt?** Beim Schreiben unbekannt, er hatte die Anleitung bekommen. Fragen.
3. **Hat App-Version sich geändert?** Der Faktencheck galt für 3.04. Bei jeder neueren Version: Regel unten.

## Stand der Website

- **Seite:** `website-neu/index.html` (CSS und JS in der Datei). Von Julian inhaltlich freigegeben, Video freigegeben („super so“), Funktionen bleiben vollständig („cool, für jeden zu sehen, was die App bietet“).
- **Anmelde-Mockup ohne Funktion:** `website-neu/anmelden-entwurf.html` (`#a`, `#b`, `#c`), von Julian freigegeben. Bleibt unveröffentlicht, bis die Cloud läuft.
- **Nichts von `website-neu/` ist committet.** Empfehlung: nur `index.html`, `anmelden-entwurf.html`, `entwurf-datenschutz-website.html`, die `*-flug-*`-Videos, `media/app-bilder/` und das Logo committen; `vorschau/` (67 MB) und `varianten/` (23 MB) in die `.gitignore`. Das Repo ist öffentlich. Julian pusht selbst, Push nicht anbieten.
- **Vorschau öffnen:** `open -a "Google Chrome" ~/ImkerApp/website-neu/index.html`. Entwickler-Schalter: `#y=900`, `#y=ende`, `?anmelden=1`. Neuestes Gesamtbild: `website-neu/vorschau/mockup-uebersicht-v4.png`.
- **Geprüft nur in Chrome** (ohne Fenster, Handy nachgestellt). **Nicht geprüft: Safari, echtes iPhone, echtes Android.** Julian wurde angeboten, die Seite im WLAN vom Mac aus aufs iPhone zu holen; Antwort steht aus.

### Inhalt und Aufbau

Start mit Bienen-Video in Karte (verschwommener Video-Hintergrund, Vorlage „Bloom“) → Über ImkerBuch mit Zahlen → Band Steffen Pfau → Funktionen (Version B: 10 Themen als Reiter, frisches App-Bild, volle Liste, „Über 130 Funktionen“, heute 134) → Häufige Fragen (Slider mit Pfeilen, 7 Fragen) → Video „Vom Bienenstand bis zum Honigglas.“ → Preis → Kontakt/Fußzeile.

### Feste Entscheidungen von Julian

- **Texte:** „Deine ganze Imkerei. In einer App.“ – kein „digitales Stockbuch“ als Kernaussage („zu klein gedacht“).
- **Logo und Schrift wie in der App,** keine Serifenschrift.
- **Knopf mit rundem Pfeil-Kreis = volle Kapsel** (per Screenshot gezeigt). Alle anderen abgerundete Rechtecke, 12 px. In der App bleibt es bei „keine Pillenform“.
- **Keine Nummern** wie „(01–06)“, keine Bezeichnung „Bienenjahr“. „Thema 01 von 10“ und der Fragen-Zähler bleiben.
- **Keine erfundenen Zahlen oder Stimmen.** Bei Steffen kein Zitat.
- **Steffen Pfau** (Kollege FW6, Imkerei PFAU-Honig, Utting am Ammersee, Naturland-Bio): „war maßgeblich an der Entwicklung von ImkerBuch beteiligt“, Link pfauhonig.de, sein Logo von seiner Seite (`media/partner/pfau-honig-logo-braun.png`). Er ist laut Julian einverstanden. Das Naturland-Siegel nicht verwenden.
- **Knöpfe heißen „Bald im App Store & bei Google Play“ / „Bald erhältlich“,** weil die App noch nicht im Store ist und die Web-Version per Tester-Code gesperrt. Beim Store-Start echte Links eintragen.
- **Cloud-Frage in den FAQ:** freigegebener Wortlaut („… in Planung – einen Termin gibt es noch nicht.“). In App-Store- und Play-Texten die Cloud NICHT erwähnen.
- **Nicht versprechen:** dass die normale Handy-Kamera die App über den QR-Aufkleber öffnet (ungetestet, siehe `docs/QR_DEEPLINK.md`).

### Regel bei jeder App-Version vor dem Veröffentlichen

Jede Aussage, jedes Light-Schild, jeden Zähler gegen den Code der aktuellen `index.html` prüfen und die App-Bilder frisch erzeugen (Beispieldaten, Wegwerf-Profil, nie Julians echte Daten; Werkzeug `tools/website/pruefung/app.mjs`). `PLAY_STORE.md` und `FEATURES.md` sind veraltet. Die Light-Lücken-Sitzung kann Light-Schilder betreffen: Marktverkauf und Wetter von Hand (Seite sagt Vollversion), Jahresbericht und Meldungen (Seite sagt Light, wie die App). Der Text zur Tipp-Kachel sagt nur „ein Tipp zum Monat“; falls die App künftig Warnungen zeigt, anpassen.

### ⚠️ Link geheim

Bis zum Start nichts davon nach außen geben (siehe Erinnerung `imkerbuch-link-geheim`). `noindex` bleibt in der Seite und kommt erst beim Start raus.

## Hosting

- **Entschieden: Hetzner Webhosting S + imkerbuch.app, 51,36 €/Jahr** (1,90 €/Monat + 28,56 €/Jahr, Einrichtung am 30.10. 0 €, keine Mindestlaufzeit, Server Nürnberg). Julian kauft selbst, Konto und Passwort macht nur er. Details und Bestell-Hinweise: `docs/HETZNER_DETAILS.md`, Vergleich: `docs/HOSTING_EMPFEHLUNG.md` (Punkt 8 in HETZNER_DETAILS nennt, was davon überholt ist).
- **Bestätigungs-Mail** kommt von `emailverification.info`, sieht nach Betrug aus, muss geklickt werden (sonst nach 14 Tagen gesperrt, nach 90 gelöscht).
- **Reihenfolge nach dem Kauf:** Mail bestätigen → AVV unter `accounts.hetzner.com/account/dpa` → SSL (Let's Encrypt) in konsoleH, grüner Haken → HTTPS-Weiterleitung → hochladen per SFTP nach `public_html` (Julian gibt das Passwort selbst ein) → prüfen (www und ohne www, mp4-Schleife mit Range, Handy) → Search Console per TXT-Eintrag → Links in App Store Connect und Play Console umstellen → erst danach GitHub-Projekt privat schalten.
- **Google-Play-Konto als Organisation** erst nach der Website. D-U-N-S-Nummer 317388588 ist da (Name „Julian Konstantin Köhler“, Handelsname ImkerBuch). Name und Adresse im Zahlungsprofil exakt wie bei D&B. Der Eintrag muss die Website nennen.

### Vor dem Hochladen

- **Pfade umstellen:** Die Seite verweist mit `../` auf `impressum.html`, `datenschutz.html`, `agb.html`, `support.html`, Icons und (Anmelde-Mockup) die App. Auf dem Server liegt alles im Wurzelordner. `v/index.html` nutzt schon `/impressum.html`. Einheitlich machen und die Dateien mit hochladen.
- **Mit hochladen:** `index.html`, `.htaccess`, `stimme.php`, `dienste.json`, `.well-known/` (auf dem Mac versteckt), `v/index.html`, Rechtstexte, Icons, `media/hero-flug-1280.mp4`, `hero-flug-handy.mp4`, `hintergrund-flug.mp4`, `bienenjahr-flug-1280.mp4`, `bienenjahr-flug-handy.mp4`, `media/app-bilder/`, `media/partner/pfau-honig-logo-braun.png`.
- **Nicht hochladen** (Julian: weglassen, nicht löschen): alle anderen Videos in `media/`, `vorschau/`, `varianten/`, `anmelden-entwurf.html`, `entwurf-datenschutz-website.html`, `index-kompakt.html` falls vorhanden (verworfene Kompakt-Fassung, Julian wollte sie nicht).
- `noindex` entfernen, und erst dann, wenn Julian den Start freigibt.

### Recht (keine Rechtsberatung, Details `docs/HOSTING_EMPFEHLUNG.md` Punkt 4)

- **Datenschutz:** Fertiger Textbaustein in `website-neu/entwurf-datenschutz-website.html`. Gelb markiert ist, was noch fehlt. Laut `HETZNER_DETAILS.md`: Logs enthalten IP (von Hetzner gekürzt), Datum, Seite, Statuscode, Menge, Herkunft, Browser. Hetzner widerspricht sich bei der Speicherdauer (7 Tage / nicht automatisch gelöscht) → eigene Löschregel setzen, dann eintragen. Wegen der Gmail-Weiterleitung darf „keine Übermittlung außerhalb der EU“ nicht pauschal dastehen.
- **Kamera:** `datenschutz.html` nennt das Scannen der QR-Aufkleber noch nicht (Aufgabe liegt bei der Light-Lücken-Sitzung, prüfen ob erledigt).
- **Impressum:** Wirtschafts-Identifikationsnummer eintragen, sobald da. ELSTER am 30.10. geprüft: noch nichts da, auch keine Gewerbe-Steuernummer (kommt voraussichtlich per Brief, Kalender 30.11.).
- **Hinweis „Videos KI-generiert“** klein aufnehmen. Pflicht ist nicht belegt, aber vorsichtig.
- **Marke „ImkerBuch“** im DPMA-Register noch nicht geprüft. Vor dem Start erledigen.

## Video

Quelle `website-video/clips/alt-720p/hero-10s.mp4` (Higgsfield, 09.08.2026). Die fünf `*-flug-*`-Dateien laufen nur vorwärts: Landschaft steht, Wiese zieht auf den Betrachter zu, Biene freigestellt mit leichtem Schaukeln, 4,5 s. Bauprogramm `tools/website/video/fly.swift` (mit `masken.swift`, `himmel.swift`). Kleine Restfehler sind bekannt und von Julian akzeptiert: In der Wiese kurz ein durchscheinender Streifen, am Fühler für wenige Bilder ein winziger Rest, die Wiese wiederholt sich alle 4,5 s. Auf dem Handy-Hintergrund bewusst nur ein Farbverlauf.

## Cloud (später, noch nichts gebaut)

- **Entschieden:** eigenes Abo **1,99 €/Monat oder 19,99 €/Jahr** (Jahres-Abo hervorheben), nicht in der Vollversion. Recherche: `docs/CLOUD_ABO_PREIS.md`. Speichergrenze 5–10 GB noch festlegen.
- **Anmeldung per Link aus der E-Mail,** ohne Passwort, kein „Mit Apple/Google“. Beim Konto-Anlegen werden die Gerätedaten übernommen (mit Abfrage). Die Web-App arbeitet auch offline und gleicht später ab. „Ohne Konto weiter“ bleibt möglich.
- **Server:** Vergleich erst, wenn die Cloud gebaut wird (Julian). Hetzner nimmt laut Recherche seit 06/2026 kaum neue Cloud-Server an, Website bleibt trotzdem dort.
- **Website:** „Anmelden“ erst live, wenn die Cloud läuft (heute nur mit `?anmelden=1`). Dann auch die Aussagen „ohne Konto“ und „Deine Daten bleiben bei dir“ und die Datenschutzerklärung neu fassen.

## Julians Arbeitsweise bei diesem Thema

- Deutsch, kurz, ohne Fachsprache. Zu jeder Oberflächen-Idee zuerst ein Bild oder Mockup. Vorlagen genau so bauen.
- Größere Arbeiten nebenbei im Hintergrund laufen lassen, damit er andere Themen weiter besprechen kann.
- Unabhängige Gegenprüfung hat hier mehrfach echte Fehler gefunden (Wischen ging nicht, Video glitt zurück, falsche Aussagen). Beibehalten.
- Eine Chrome-Überschneidung tauchte erst bei Julians Fenstergröße auf (Viewport etwa 1351×671). Niedrige Fenster mitprüfen.

## Werkzeuge

Aus dem Arbeitsordner des Hauptchats gerettet, der vergänglich ist. Einzelne Skripte enthalten noch Pfade auf den alten Ordner (`scratchpad`, zum Beispiel Chrome-Profil): vor dem Start anpassen.

- `tools/website/pruefung/`: `shots.mjs` (Vorschaubilder, `#y=`-Schalter), `cdp.mjs`, `pruefen.mjs`, `endkontrolle.mjs` (externe Anfragen, Speicher, Konsole), `app.mjs` (App-Bilder), `bilder.mjs`, `mockup-shot.mjs`.
- `tools/website/video/`: siehe oben, dazu `flugcheck.swift`, `dreifach.swift`, `mess.swift`. Auf dem Mac gibt es kein ffmpeg.
- `.website-vorlage/` (nicht im Git, fremde Rechte): Einzelbilder aus dem Bloom-Video, plus Sicherung `index-vor-flug.html`.

## Beim Hauptchat bleibt

Belege und Steuer zu ImkerBuch (Hetzner-Rechnungen, AVV-Kopie nach `Familie/Gewerbe ImkerBuch/`, Betriebsausgaben), Fristen im Kalender, ELSTER-Post. Der Hauptchat wird nur dafür gebraucht.

## Bereich „Ideen“ mit Abstimmung (02.11.2026)

Vier Ideen mit Knopf „Das will ich“. `stimme.php` zählt je Idee, ohne IP-Adresse, Name oder Zeitpunkt. Neben dem Webordner darf PHP nicht schreiben. Deshalb liegen die Stimmen in `public_html/.imkerbuch-daten/stimmen.json`, von außen gesperrt (Abruf gibt 403), zu lesen über WebFTP. Öffentlich angezeigt werden sie nicht. `.htaccess` sperrt alle anderen PHP-Dateien. Auf dem Server geprüft: GET 400, fremde Herkunft 400, falsche Idee 400, Plus und Minus 200, andere PHP-Datei 403. WebFTP überschreibt beim Hochladen nicht, sondern legt „Name (1)“ an. Zum Ersetzen: Zip hochladen, „Entpacken“, Zip danach von Hand löschen.
