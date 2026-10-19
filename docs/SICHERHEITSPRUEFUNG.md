# Sicherheitsprüfung ImkerBuch (Stand 2026-10-19, v2.61)

Großer Sicherheitstest vor dem Store-Start (Julians Vorgabe, Checkliste §18). Ergebnis: **keine offene Lücke in der App**. Gefundenes ist behoben; der Rest ist unten bewertet.

## Was geprüft wurde – und das Ergebnis

| Bereich | Wie geprüft | Ergebnis |
|---|---|---|
| Eingeschleuster Schadcode (HTML/JS) in Eingaben | `tools/angriffstest.mjs`: 496 Textfelder aller Bereiche + Imkerei-Angaben mit `<img onerror>`/`<svg onload>` gefüllt, Web-/URL-Felder mit `javascript:`-Links; dann jede Seite, jeder Reiter, jedes „Neu“-Formular und die ersten Zeilen geöffnet | ✅ 32 Seiten, **0× Code ausgeführt, 0 javascript:-Links**. Text wird überall nur als Text gezeigt |
| Manipulierte Sicherungsdatei | Code + Test: Kaufstand, Teststart, Bewertungs-Zähler werden beim Import verworfen (`S.GERAET`), fremde Bereiche übersprungen, Bild-Felder geprüft, Datum nur als Datum angezeigt | ✅ Freischalten per Datei unmöglich (Test „Sicherheit: Kauf …“) |
| Kauf umgehen | Test: erstatteter Kauf (Apple `revocationDate`) sperrt wieder; Android zählt nur `purchaseState 1`; offline bleibt der letzte Stand (kein Aussperren ohne Netz) | ✅ |
| PDF-Leser (pdf.js 3.11.174) | Bekannte Lücke CVE-2024-4367 (präpariertes PDF führt Code aus) | ✅ behoben: alle 4 Aufrufe mit `isEvalSupported: false` + Test; in der App blockt zusätzlich die Schutzregel jedes `eval` |
| App-Hülle (Capacitor) | `npm audit` | ⚠️→✅ **kritische Lücke** in Capacitor 8.4.1 (GHSA-rvm3-566m-v7fv: fremde Inhalte unter App-Herkunft ladbar) → auf **8.5.3** gehoben |
| Schutzregel (Content-Security-Policy) | Neu, **nur im App-Build** (`native/sync-app.sh`): Verbindungen nur zu Wetterdienst (Bright Sky), Nominatim, Overpass (3), BKG, Geoservice RLP; kein Nachladen von Code; keine fremden Einbettungen; keine Formular-Ziele | ✅ getestet: PDF, PDF-Leser (Worker), Excel, QR, Wetter, Adresssuche, Geodienste laufen – **0 Verstöße**; fremde Adresse (example.com) wird **blockiert**; Gesamtprüfung über 33 Seiten mit Regel: 0 Befunde; App startet im iOS-Simulator |
| Externe Bibliotheken | alle lokal in `libs/` gebündelt, in der App lädt nichts aus dem Internet (`U.loadScript` filtert http(s)) | ✅ SheetJS 0.20.3 (gepatcht). ⚠️ jsPDF 2.5.2: zwei bekannte Schwächen (CVE-2025-29907, CVE-2025-57810) – ein kaputtes Bild kann nur die PDF-Erzeugung einfrieren, kein Datenzugriff. **Update nach 1.00** (großer Versionssprung, PDF-Layout neu prüfen) |
| Geheimnisse im Code | Suche nach Schlüsseln/Tokens/Passwörtern | ✅ keine |
| Mail-/Kartenlinks | `mailto:` mit `encodeURIComponent`; Kartenlinks nur aus Zahlen gebaut; alle `_blank`-Links mit `noopener` | ✅ |
| Nachrichten zwischen Fenstern | nur ein BroadcastChannel (eigene Tabs) | ✅ |
| iOS-Einstellungen | kein `NSAllowsArbitraryLoads` (nur HTTPS), `ITSAppUsesNonExemptEncryption=false`, Datenschutz-Manifest, Berechtigungs-Texte | ✅ |
| Android | keine Geräte-Sicherung der Datenbank (`allowBackup=false` + Regeln), kein Klartext-Verkehr, kein „exakter Wecker“ | ✅ |
| Berechtigungs-Fragen | iOS-Simulator | ⚠️→✅ Standort wurde **doppelt** gefragt (Apple + „localhost möchte …“) → jetzt über die offizielle Standort-Erweiterung: **eine** Frage. Mikrofon: Hülle beantwortet die zweite Frage selbst |
| Datenschutz | Was verlässt das Gerät? | ✅ nur Koordinaten/Suchbegriffe an Wetter-/Kartendienste, Käufe über Apple/Google; keine eigenen Server, kein Tracking |

## Restrisiken (bewusst)

1. **Öffentliches GitHub-Repo / Web-Version** (Checkliste §18): Code ist lesbar, Web-Version kostenlos nutzbar. Entscheidung mit Julian offen.
2. **Android-Testphase** gerätebezogen (Neuinstallation = neue 30 Tage) – bewusst in Kauf genommen.
3. **Gerät gestohlen/entsperrt**: Daten liegen unverschlüsselt in der App-Datenbank (Schutz = Gerätesperre des Handys, wie bei den meisten Offline-Apps).
4. **Mac-Bauwerkzeug** (`@capacitor/cli` → `uuid` 7): 3 mittlere Hinweise, laufen nur beim Bauen auf dem Mac, nicht in der App.

## So wiederholen

```bash
npm test
node tools/angriffstest.mjs <ordner>
node tools/gesamtpruefung.mjs <ordner>
BASIS='http://localhost:8931/native/www/index.html?testdb=1' node tools/gesamtpruefung.mjs <ordner> --nur=iphone-gross
cd native && npm audit
```

(Vorschau-Server auf Port 8931 muss laufen; der App-Kopie-Lauf braucht vorher `./native/sync-app.sh`.)
