# QR-Aufkleber am Volk

Stand 30.10.2026, v3.04.

## Hauptweg: Scanner in der App (funktioniert ohne Internet und ohne Website)

Julian, 30.10.2026: „soll grundsätzlich immer ohne Internet funktionieren, auch beim ersten Mal“.

1. Auf der Startseite (Kachel „Durchsicht am Stand“) oder bei Völker auf „Aufkleber scannen“ tippen.
2. `VolkScanner` in `index.html` liest das Kamerabild mit `libs/jsQR.js`. Alles läuft auf dem Handy.
3. Passt der Code, öffnet sich die Durchsicht am Stand für dieses Volk. Andere Codes ergeben eine Meldung, der Scanner bleibt offen.
4. Geht das Live-Bild nicht oder liest es 20 Sekunden lang nichts, erscheint „Foto vom Aufkleber machen“.

## Zusatz für später: Handy-Kamera (braucht die Website)

Der Aufkleber trägt `https://imkerbuch.app/v/<kennung>`. Die Website spielt für den Scanner keine Rolle, er liest nur die Kennung. Sobald imkerbuch.app online ist, kann zusätzlich die normale Handy-Kamera die App öffnen (`VolkLink`). Wer die App nicht hat, sieht dann die Hinweisseite `website-neu/v/index.html` (Aussehen und Text von Julian am 30.10.2026 freigegeben: „Passt so“).

Die Web-Version druckt ihre eigene Adresse. Im Aufkleber steht nur eine zufällige Kennung, kein Name und keine Anschrift.

| Datei | Zweck |
|---|---|
| `native/ios/App/App/App.entitlements` | iPhone: App gehört zu imkerbuch.app |
| `native/android/app/src/main/AndroidManifest.xml` | Android: App gehört zu imkerbuch.app, Pfad `/v/` |
| `website-neu/.well-known/apple-app-site-association` | Bestätigung für Apple (Team-ID Z3V494U7BB) |
| `website-neu/.well-known/assetlinks.json` | Bestätigung für Google. **Fingerabdruck fehlt noch** |
| `website-neu/.htaccess` | Leitet `/v/<kennung>` auf die Hinweisseite, setzt die Dateiart für Apple |
| `website-neu/v/index.html` | Hinweisseite |

Schritte, falls der Zusatz genutzt werden soll:

1. imkerbuch.app kaufen und die Website hochladen. `.htaccess` und `.well-known` sind auf dem Mac versteckt und müssen mit hoch.
2. Beide Adressen im Browser prüfen, sie müssen den Dateiinhalt ohne Umleitung zeigen:
   - `https://imkerbuch.app/.well-known/apple-app-site-association`
   - `https://imkerbuch.app/.well-known/assetlinks.json`
3. In Xcode unter „Signing & Capabilities“ schauen, ob „Associated Domains“ mit `applinks:imkerbuch.app` ohne Fehlermeldung dasteht.
4. In der Play Console unter „App-Signatur“ den SHA-256-Fingerabdruck kopieren und in `assetlinks.json` eintragen.
5. App vom Handy löschen, neu aufspielen und scannen. Apple liest die Website-Datei beim Installieren, das kann bis zu einem Tag dauern.

## Noch nicht geprüft

- **Scanner am echten iPhone:** das Scannen eines gedruckten Aufklebers, bei Sonne und auf laminiertem Papier (`docs/GERAETETEST.md`, K8). Im Simulator läuft das Live-Bild in der App, das Erkennen ist mit künstlichem Kamerabild im Test geprüft.
- **Android:** Auf dem Mac liegt derzeit kein Android-SDK, der Scanner ist dort weder gebaut noch getestet.
- **Handy-Kamera-Weg:** Ohne Domain lässt er sich nicht testen. Auch ob die Hetzner-Einstellungen in `.htaccess` greifen, zeigt erst Schritt 2.
