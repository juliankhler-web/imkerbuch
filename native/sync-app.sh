#!/bin/bash
# Übernimmt den aktuellen Stand der Web-App in die iOS- und Android-Projekte.
# Aufruf:  cd ~/ImkerApp/native && ./sync-app.sh            (Store-Version, ohne Beispieldaten)
#          cd ~/ImkerApp/native && ./sync-app.sh --testmodus (Test-Build mit Beispieldaten)
set -e
cd "$(dirname "$0")"

echo "→ Kopiere App-Dateien nach www/ …"
cp ../index.html ../service-worker.js ../manifest.json www/
cp ../icon-180.png ../icon-192.png ../icon-512.png www/
cp ../impressum.html ../datenschutz.html ../agb.html www/
mkdir -p www/libs && cp ../libs/*.js www/libs/   # PDF/Excel/QR offline
rm -rf www/assets/bini && mkdir -p www/assets/bini && cp ../assets/bini/* www/assets/bini/   # Assistent Imme (animierte WebP) – vorher leeren, sonst bleiben alte Bilder im App-Paket
mkdir -p www/assets/bienen && cp ../assets/bienen/* www/assets/bienen/   # Tagesbienen (24 Bilder) – ohne sie bleibt im Dashboard ein leeres Bild

# Testmodus (Beispieldaten) nur für Julians Test-Builds – Store-Builds ohne Schalter
if [ "$1" = "--testmodus" ]; then
  sed -i '' "s/^const TESTMODUS_APP = false;/const TESTMODUS_APP = true;/" www/index.html
  grep -q "^const TESTMODUS_APP = true;" www/index.html && echo "→ TESTMODUS an (Beispieldaten sichtbar) – nicht für den App Store!"
fi

echo "→ Übertrage in die iOS- und Android-Projekte …"
npx cap copy

VERSION=$(grep -o "APP_VERSION = '[^']*'" www/index.html | head -1 | cut -d"'" -f2)
echo "✓ Fertig – App-Stand v${VERSION} ist jetzt in ios/ und android/."
echo "  iOS bauen:     npx cap open ios      (Xcode)"
echo "  Android bauen: npx cap open android  (Android Studio)"
