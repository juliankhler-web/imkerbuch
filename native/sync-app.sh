#!/bin/bash
# Übernimmt den aktuellen Stand der Web-App in die iOS- und Android-Projekte.
# Aufruf:  cd ~/ImkerApp/native && ./sync-app.sh
set -e
cd "$(dirname "$0")"

echo "→ Kopiere App-Dateien nach www/ …"
cp ../index.html ../service-worker.js ../manifest.json www/
cp ../icon-180.png ../icon-192.png ../icon-512.png www/
cp ../impressum.html ../datenschutz.html ../agb.html www/
mkdir -p www/libs && cp ../libs/*.js www/libs/   # PDF/Excel/QR offline

echo "→ Übertrage in die iOS- und Android-Projekte …"
npx cap copy

VERSION=$(grep -o "APP_VERSION = '[^']*'" www/index.html | head -1 | cut -d"'" -f2)
echo "✓ Fertig – App-Stand v${VERSION} ist jetzt in ios/ und android/."
echo "  iOS bauen:     npx cap open ios      (Xcode)"
echo "  Android bauen: npx cap open android  (Android Studio)"
