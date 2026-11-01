# Prüfung vor der Einreichung

## Stand 01.11.2026 abends, App v3.13 (Store-Fassung aus `native/www`)

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 828 von 828 grün |
| `tools/gesamtpruefung.mjs` | 160 Seiten, 0 Auffälligkeiten |
| `tools/angriffstest.mjs` | 32 Seiten, 0 Auffälligkeiten |
| `tools/pdf-pruefung.mjs` | 1 PDF mit Hinweis wie zuvor |
| `tools/touren-pruefung.mjs`, auch `TIPPEN=1` | keine Befunde |
| `tools/start-pruefung.mjs` (neu) | keine Befunde: Datenbank scheitert oder hängt, Hauptteil defekt, Umstellung scheitert, Einstellungen nicht lesbar, Update von niedrigster Datenbank-Stufe aus v1.61 bis v1.64 |
| Update ohne Löschen, iPhone-Simulator | v3.12 → v3.13 mit 300 Völkern und 50 Ständen: alles da |
| Update ohne Löschen, Android-Emulator | v3.12 → v3.13: alle Zählungen gleich, Foto Byte für Byte gleich |
| Sicherung, iPhone-Simulator | 21,8 MB, 120 Fotos, gültig, Abbruch im Teilen-Menü löscht die Kopie |
| Sicherung und Einspielen, Android-Emulator | 1000 Fotos, 546 MB: in 40 s gesichert, in 20 s eingespielt, alle 1001 Dateien zurück |
| Android 10 mit WebView 91 | Hinweisseite „Bitte einmal aktualisieren“ erscheint |
| Android mit Drei-Tasten-Leiste | Formular bis „Speichern“ sichtbar. Tastatur im Emulator nicht geprüft |

Nicht geprüft: iOS 16 (Simulator-Stand fehlt), Android 7 bis 15 mit aktueller WebView, Speicher wirklich voll auf einem Gerät. Das steht in `docs/GERAETETEST.md` G7 bis G9, K5a, K5b.

## Stand 01.11.2026, App v3.12 (Store-Fassung aus `native/www`)

Vor dem Hochladen mit der Fassung 1.00 noch einmal laufen lassen.

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 815 von 815 grün |
| `tools/gesamtpruefung.mjs` gegen `native/www` | 160 Seiten, 0 Auffälligkeiten |
| `tools/angriffstest.mjs` | 32 Seiten, 0 Auffälligkeiten |
| `tools/pdf-pruefung.mjs` | 69 PDFs. 1 Hinweis: Chargenübersicht mit Massendaten, Tabellenzeile bis 42 mm hoch, bleibt lesbar, kein Fehler |
| `tools/touren-pruefung.mjs` | 180 Sprechblasen in 30 Führungen, keine Befunde |
| `TIPPEN=1 tools/touren-pruefung.mjs` | keine Befunde |
| iPhone-Archiv (Release, ohne Hochladen) | erfolgreich, Signatur funktioniert |
| Android-App im Emulator | Einwilligung, Sicherung mit Papierkorb-Foto, Herkunft und Mengen geprüft |
| `tools/release-100.mjs --probe` | läuft, Umstellung noch nicht ausgeführt |

Der Befund „Kurz umschauen, Schritt 2“ war ein Fehlalarm des Werkzeugs: Im Test fehlt der Kopfleiste der Abstand zur Kamera, den sie am Gerät hat. Im iPhone-Simulator steht die Kopfleiste unter der Kamera.

## Unabhängige Prüfung (Workflow 01.11.2026)

62 bestätigte oder plausible Funde zu Apple, Google, neuem Code, Texten, Bildern und Bau. Eine zweite Prüfung mit 31 Funden fand unter anderem, dass ein Foto im Papierkorb die Sicherung beschädigen konnte. Die wichtigen Funde sind behoben (Commit d0919f1).

Noch offen:
- Echter Kauftest und Gerätetest mit der Fassung 1.00 (`docs/GERAETETEST.md`), macht Julian.
- Umstellung auf 1.00: direkt vor dem Hochladen.
- Google: Live-Diktat auf echtem Android-Gerät prüfen, Datensicherheit und die übrigen Punkte in `docs/PLAY_STORE.md`.
- Bewusst offen: AGB-Nummern weichen zwischen iPhone und Website ab (ab § 12), „Was ist neu?“ hat keinen Plattformfilter, Bild 2 ist eine Kachelwand statt App-Ansicht und steht deshalb bei Apple am Ende.
- Fragen an Anwalt und Steuerberater: „nicht verknüpft“ bei den Datenschutzangaben, Gleichwertigkeit des Schutzes bei den Diensten, Zeile 10 im W-8BEN.
