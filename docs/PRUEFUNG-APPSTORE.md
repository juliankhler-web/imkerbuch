# Prüfung vor der Einreichung

## Stand 01.11.2026, App v3.12 (Store-Fassung aus `native/www`)

Vor dem Hochladen mit der Fassung 1.00 noch einmal laufen lassen.

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 812 von 812 grün |
| `tools/gesamtpruefung.mjs` gegen `native/www` | 160 Seiten, 0 Auffälligkeiten |
| `tools/angriffstest.mjs` | 32 Seiten, 0 Auffälligkeiten |
| `tools/pdf-pruefung.mjs` | 69 PDFs. 1 Hinweis: Chargenübersicht mit Massendaten, Tabellenzeile bis 42 mm hoch, bleibt lesbar, kein Fehler |
| `tools/touren-pruefung.mjs` | 180 Sprechblasen in 30 Führungen, keine Befunde |
| `TIPPEN=1 tools/touren-pruefung.mjs` | vor der Werkzeug-Korrektur nur der Fehlalarm bei „Kurz umschauen“, nach der Korrektur nicht wiederholt |
| `tools/release-100.mjs --probe` | läuft, Umstellung noch nicht ausgeführt |

Der Befund „Kurz umschauen, Schritt 2“ war ein Fehlalarm des Werkzeugs: Im Test fehlt der Kopfleiste der Abstand zur Kamera, den sie am Gerät hat. Im iPhone-Simulator steht die Kopfleiste unter der Kamera.

## Unabhängige Prüfung (Workflow 01.11.2026)

62 bestätigte oder plausible Funde zu Apple, Google, neuem Code, Texten, Bildern und Bau.

Noch offen:
- Echter Kauftest und Gerätetest mit der Fassung 1.00 (`docs/GERAETETEST.md`), macht Julian.
- Umstellung auf 1.00: direkt vor dem Hochladen.
- Google: Live-Diktat auf echtem Android-Gerät prüfen, Datensicherheit und die übrigen Punkte in `docs/PLAY_STORE.md`.
- Papierkorb: Ein zurückgeholtes Foto der Beilage eines entfernten Mittels ist nicht erreichbar (gering).
- Fragen an Anwalt und Steuerberater: „nicht verknüpft“ bei den Datenschutzangaben, Gleichwertigkeit des Schutzes bei den Diensten, Zeile 10 im W-8BEN.
