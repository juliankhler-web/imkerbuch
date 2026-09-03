# ADR-0002: Die App ist eine einzige Datei

- **Status:** Angenommen
- **Datum:** 2026-09-03 (nachträglich dokumentiert, Entscheidung von Projektbeginn)
- **Betrifft:** Aufbau des Quelltextes, Auslieferung

## Kontext

Die App wird von einer Person gepflegt, per GitHub Pages veröffentlicht und
zusätzlich als Capacitor-Hülle in die App-Stores gebracht. Ein Bauschritt
(Bundler, Transpiler, Paketverwaltung im Auslieferungspfad) wäre eine
Fehlerquelle, die niemand betreut.

## Entscheidung

Der gesamte Anwendungscode steht in **einer** `index.html` (rund 14 000 Zeilen),
ohne ES-Module, ohne Bauschritt. Bibliotheken liegen als fertige Dateien in `libs/`.

## Begründung

Hochladen heißt kopieren. Es gibt keinen Zustand zwischen Quelltext und dem, was
im Browser läuft — was man liest, ist was ausgeliefert wird. Das macht Fehlersuche
im Betrieb und das Nachvollziehen alter Stände einfach.

## Verworfene Alternativen

- **ES-Module mit Bundler** — saubere Trennung, aber ein Werkzeugkasten, der
  gepflegt und bei jeder Node-Aktualisierung nachgezogen werden will.
- **Mehrere Skriptdateien ohne Bundler** — spart den Bauschritt, bringt aber
  Ladereihenfolge und Zwischenspeicherung als neue Fehlerquellen ins Spiel.

## Folgen

**Gut:** Keine Werkzeugkette, kein Bauschritt, kein Versionsdrift zwischen
Quelltext und Auslieferung. Die Testsuite lädt dieselbe Datei, die der Nutzer bekommt.

**Schlecht / Preis:** Die Datei ist groß, Suchen ersetzt Navigieren. Modularität
muss von Hand durchgehalten werden: Namensräume plus Abschnittsbanner.

**Zu beachten bei künftigen Änderungen:**

- `function foo() {}` auf oberster Ebene ist **automatisch global**.
- `const X = {…}` ist es **nicht** — es muss in den `Object.assign(window, {…})`-Block
  am Dateiende, sonst ist es in den Tests `undefined`.
- Bei jeder Veröffentlichung: `APP_VERSION`, `CHANGELOG` und der Cache-Name im
  Service Worker müssen mit. Bleibt der Cache-Name stehen, behalten Geräte alte
  Nebendateien.

## Wie wir merken, dass es trägt

Ein Test prüft, dass Version und Changelog zusammenpassen. Die Testsuite läuft gegen
die echte Datei im Browser — nicht gegen eine gebaute Fassung.
