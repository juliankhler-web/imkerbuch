# ImkerBuch – native Apps (iOS & Android)

Capacitor-Hülle um die Web-App aus `~/ImkerApp`. Die Web-App bleibt die
Wahrheitsquelle – hier liegt nur die Verpackung für App Store & Play Store.

## Neuen Web-Stand übernehmen (nach jeder Änderung an index.html)

```bash
cd ~/ImkerApp/native
./sync-app.sh
```

Kopiert index.html, Service Worker, Manifest, Icons und Rechtsseiten nach
`www/` und überträgt sie in beide Plattform-Projekte.

## Bauen & auf dem Gerät testen

- **iOS:** `npx cap open ios` → Xcode öffnet sich → Gerät wählen → ▶
  (fürs eigene iPhone reicht das kostenlose Apple-Team; fürs TestFlight/App-Store
  braucht es die bezahlte Mitgliedschaft)
- **Android:** `npx cap open android` → Android Studio öffnet sich → ▶
  (Android Studio einmalig installieren; es bringt das SDK mit)

## Was schon erledigt ist

- App-ID `de.imkerbuch.app`, Name „ImkerBuch“
- App-Icons + Startbildschirme für beide Plattformen generiert
  (Quelle: `assets/icon.png` – bei Logo-Änderung `npx @capacitor/assets generate` erneut ausführen)
- iOS Info.plist: Kamera- und Mikrofon-Begründungen (Pflicht, sonst Absturz bei Foto/Sprachnotiz)
- iOS-Build im Simulator verifiziert (v0.57)

## Wissenswertes zur Hülle

- Die App läuft im Wrapper zu 100 % lokal (IndexedDB) – wie die PWA.
- Der Service Worker läuft im iOS-Wrapper nicht (WKWebView) – unnötig, da alles gebündelt ist.
- „Nach Updates suchen“ zeigt im Wrapper immer die gebündelte Version –
  Updates kommen hier über einen neuen App-Build (sync-app.sh + Store-Update).
- PDF/Excel/QR-Bibliotheken sind seit v0.58 gebündelt (`libs/`) –
  alles läuft komplett offline, ohne Fremd-Server. Nur die optionalen
  Features Texterkennung (OCR) und Sprach-Transkription laden bei
  Aktivierung weiterhin aus dem Netz (zu groß zum Bündeln).
