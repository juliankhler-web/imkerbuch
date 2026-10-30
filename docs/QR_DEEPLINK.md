# QR-Aufkleber am Volk: Scannen öffnet die App

Stand 30.10.2026, v3.03. Eingebaut, aber **erst nutzbar, wenn imkerbuch.app online ist**.

## So funktioniert es

1. Die Store-App druckt `https://imkerbuch.app/v/<kennung>` auf den Aufkleber.
2. iPhone und Android fragen die Website, ob diese Adresse zur App gehört. Dafür liegen zwei Dateien auf der Website.
3. Wenn ja, öffnet das Handy beim Scannen die App (`VolkLink` in `index.html`) in der Durchsicht am Stand.
4. Wer die App nicht hat, sieht die Hinweisseite `website-neu/v/index.html` (Aussehen und Text von Julian am 30.10.2026 freigegeben: „Passt so“).

Die Web-Version druckt weiter ihre eigene Adresse. Im Aufkleber steht nur eine zufällige Kennung, kein Name und keine Adresse.

## Dateien

| Datei | Zweck |
|---|---|
| `native/ios/App/App/App.entitlements` | iPhone: App gehört zu imkerbuch.app |
| `native/android/app/src/main/AndroidManifest.xml` | Android: App gehört zu imkerbuch.app, Pfad `/v/` |
| `website-neu/.well-known/apple-app-site-association` | Bestätigung für Apple (Team-ID Z3V494U7BB) |
| `website-neu/.well-known/assetlinks.json` | Bestätigung für Google. **Fingerabdruck fehlt noch** |
| `website-neu/.htaccess` | Leitet `/v/<kennung>` auf die Hinweisseite, setzt die Dateiart für Apple |
| `website-neu/v/index.html` | Hinweisseite |

## Was Julian tun muss, in dieser Reihenfolge

1. **imkerbuch.app kaufen.** Vorher keine Aufkleber im größeren Stil drucken: Sie hängen dauerhaft an dieser Adresse.
2. **Website hochladen.** Achtung: `.htaccess` und `.well-known` sind auf dem Mac versteckte Ordner bzw. Dateien und müssen mit hoch.
3. **Prüfen.** Beide Adressen müssen im Browser den Inhalt der Datei zeigen, ohne Umleitung:
   - `https://imkerbuch.app/.well-known/apple-app-site-association`
   - `https://imkerbuch.app/.well-known/assetlinks.json`
4. **Apple.** Beim nächsten Bauen in Xcode unter „Signing & Capabilities“ schauen, ob „Associated Domains“ mit `applinks:imkerbuch.app` ohne Fehlermeldung dasteht. Die automatische Signatur sollte das selbst bei Apple eintragen.
5. **Google.** In der Play Console unter „App-Signatur“ den SHA-256-Fingerabdruck kopieren und Claude geben. Er kommt in `assetlinks.json`. Das geht erst, wenn das Google-Konto steht.
6. **Am echten Handy testen:**
   - App vom Handy löschen und neu aufspielen, denn Apple liest die Website-Datei beim Installieren. Das kann bis zu einem Tag dauern.
   - Aufkleber neu drucken und mit der Kamera scannen: App zu, App im Hintergrund, App offen.
   - Handy ohne das Volk: Es erscheint „Dieses Volk gibt es auf diesem Gerät nicht (mehr).“
   - Handy ohne App: Es erscheint die Hinweisseite.

## Noch nicht geprüft

- Das Öffnen über die Kamera. Ohne Domain lässt es sich weder im Simulator noch am Handy testen.
- Android-Bau: Auf dem Mac liegt derzeit kein Android-SDK.
- Ob Hetzner Webhosting S die `.htaccess`-Regeln so annimmt. Schritt 3 zeigt es.
- Die App-Store-Links auf der Hinweisseite funktionieren erst nach der Freigabe in den Stores.
