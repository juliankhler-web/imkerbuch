# Übergabe Claude → Codex

Stand 2026-10-15 · **v2.54** · letzter Commit `7587c5d` · Arbeitskopie sauber · 625/625 Tests grün

## Das Projekt in 30 Sekunden

- **ImkerBuch** = Offline-Imkerei-App. Fast alles steckt in **einer Datei: `index.html`** (HTML + CSS + JS, PWA, Daten in IndexedDB).
- `native/` = Capacitor-Hülle für iOS und Android (gleiche Web-App drin).
- Projektverlauf: `PROJEKT.md` → Abschnitt **„Historie“** (aktuell, neueste oben). Der Kopf der Datei ist älter.
- Aufbau und Datenmodell: `docs/ARCHITEKTUR.md`.

## Julian (wichtig)

- Kein Informatiker. **Deutsch, kurz, ohne Fachsprache**; Schritte nummeriert, mit „was du dann siehst“.
- Bei Änderungen an der Oberfläche **vorher ein Bild/Mockup** zeigen.
- Schickt er eine Vorlage (Bild, Pin, Video): **genau so** bauen, nicht „ähnlich“. Vorlage Bild für Bild vergleichen.
- **Keine Pillenform**: Knöpfe, Chips, Schilder sind abgerundete Rechtecke (12 px, klein 7–9 px).
- **Gründlich**: Sonderfälle mitdenken (hoch/quer, hell/dunkel, Handy/Tablet, leere Daten).
- **Committen ja, aber er lädt selbst hoch** – Push nicht anbieten und nicht daran erinnern.
- Keine Zugangsdaten eingeben. Seine echten Daten (IndexedDB auf seinen Geräten) nie anfassen.

## So arbeitest du hier

1. Vorher `git status` und `git log --oneline -3`. Arbeite direkt in `~/ImkerApp` auf `main` (Claude arbeitet in der Zeit nicht parallel).
2. Zu jeder neuen Logik einen Test in `tests/tests.js`.
3. Tests: `npm test` (headless Chrome, davor ESLint auf undefinierte Namen). Nur einzelne: `node tools/test-run.mjs --nur=Textstück`.
4. **Jede Version** (sonst kommt beim Nutzer kein Update an):
   - `index.html`: `APP_VERSION` +0.01 und oben in `CHANGELOG` ein Eintrag in Julians Sprache (die App zeigt ihn als „Was ist neu?“).
   - `service-worker.js`: Cache-Name `imkerbuch-vNNN` +1 (gerade `v269`).
   - `package.json`: `version` (2.54 → `2.5.4`, 2.55 → `2.5.5`).
   - `PROJEKT.md` → Historie: neue Zeile oben (Datum, Version, was und warum).
5. `./native/sync-app.sh`, dann committen: `vX.YZ: kurz was`.
6. Wenn möglich auch **als App** im iOS-Simulator prüfen (`native/ios/App/App.xcodeproj`, Schema `App`) – Julian testet am echten iPhone, nicht im Browser.

## Zuletzt gebaut (v2.47–v2.54)

- **Reiter, die oben kleben** (Volk, Bio, Ernte, Abfüllung, Kassenbuch, Völker, Königinnen, Kontakte, Statistik, Aufgaben, Meldungen, Inventar): `UI.tabs`, `bereichsReiter`, `jahresReiter`, `teileReiter` (zeigt einen Teil der Seite, Rest bekommt `.teil-aus`), Helfer in `Reiter.*`.
- **Untere Leiste hochkant = `Mulde`** nach Julians Pinterest-Vorlage: randlos, ohne Beschriftung, tiefe Mulde, weißer Kreis wandert mit. **Nur `transform`/`opacity`** (Web Animations) – kein Pfad-Neuzeichnen und keine Filter, sonst ruckelt es am iPhone. „Mehr“ bläht den Kreis zu „Alle Bereiche“ auf (`.bn-ballon`, Blatt `.kreis-auf` → `.kreis-da`). **Quer bleibt die alte Leiste – gewollt.**
- **Königin** = eigene Seite `#/koenigin/<id>`; Stammbaum mit Regler (kein +/−), Herkunft jeder Angabe sichtbar.
- Widgets-Knopf in der Kopfzeile neben hell/dunkel (`#tb-aktionen`).
- iOS 27 braucht den `SceneDelegate` (`native/ios/App/App/AppDelegate.swift` + `Info.plist`) – nicht entfernen.

## Fallen

- Service Worker: nach Änderungen zweimal neu laden.
- Ein Browser im Hintergrund pausiert Animationen → Screenshots sind dann veraltet; Zustand lieber im DOM prüfen.
- `main` hat eine Einblende-Animation → Positionen mit `offsetTop` messen (`Reiter.oben`), nicht mit `getBoundingClientRect`.
- Selektoren auf `main` begrenzen – Fenster und Leiste nutzen dieselben Klassen.
- Einstellungen, die die App selbst schreibt, mit `{ auto: true }` speichern.
- `native/ios/App/App/public/` wird von `sync-app.sh` überschrieben – dort nichts ändern.

## Am Ende: Rückgabe an Claude (Pflicht)

Alles committen und im Hauptordner **`UEBERGABE-VON-CODEX.md`** anlegen (eine alte überschreiben). Kurz halten, nach dieser Vorlage:

```markdown
# Übergabe Codex → Claude (Datum, vX.YZ bis vX.YZ)

## Erledigt
- vX.YZ: was und warum (Julians Wunsch in seinen Worten)

## Geänderte Stellen
- Funktionen, CSS-Klassen, Dateien, neue Tests

## Stand
- Tests: N/N grün · als App geprüft: ja/nein
- Letzter Commit · Zweig · Arbeitskopie (Pfad, falls nicht ~/ImkerApp) · Uncommittetes: keins / was

## Offen oder angefangen

## Gefundene Fallen

## Neue Wünsche oder Regeln von Julian
```
