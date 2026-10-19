#!/bin/bash
# Übernimmt den aktuellen Stand der Web-App in die iOS- und Android-Projekte.
# Aufruf:  cd ~/ImkerApp/native && ./sync-app.sh            (Store-Version, ohne Beispieldaten)
#          cd ~/ImkerApp/native && ./sync-app.sh --testmodus (Test-Build mit Beispieldaten)
set -e
cd "$(dirname "$0")"

echo "→ Kopiere App-Dateien nach www/ …"
cp ../index.html ../service-worker.js ../manifest.json www/
cp ../icon-180.png ../icon-192.png ../icon-512.png www/
cp ../impressum.html ../datenschutz.html ../agb.html ../support.html www/
mkdir -p www/libs && cp ../libs/*.js www/libs/   # PDF/Excel/QR offline
rm -rf www/assets/bini && mkdir -p www/assets/bini && cp ../assets/bini/* www/assets/bini/   # Assistent Imme (animierte WebP) – vorher leeren, sonst bleiben alte Bilder im App-Paket
mkdir -p www/assets/bienen && cp ../assets/bienen/* www/assets/bienen/   # Tagesbienen (24 Bilder) – ohne sie bleibt im Dashboard ein leeres Bild

# Schutzregel (Content-Security-Policy) NUR für die App: Sie darf sich ausschließlich mit
# Wetterdienst, Adresssuche und Geodiensten verbinden, lädt keinen Code aus dem Internet und
# bettet nur eigene Seiten ein. Selbst wenn je Schadtext durchrutschte, könnte er nichts nach außen senden.
# Neue Internet-Dienste in index.html → hier bei connect-src ergänzen (sonst blockiert die App sie).
CSP="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' data: blob:; font-src 'self' data:; worker-src 'self' blob:; frame-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; connect-src 'self' data: blob: https://api.brightsky.dev https://nominatim.openstreetmap.org https://overpass-api.de https://overpass.kumi.systems https://overpass.private.coffee https://sgx.geodatenzentrum.de https://geoservice.rlp.de"
sed -i '' "s|^<meta charset=\"UTF-8\">|<meta charset=\"UTF-8\">\\
<meta http-equiv=\"Content-Security-Policy\" content=\"${CSP}\">|" www/index.html
grep -q 'http-equiv="Content-Security-Policy"' www/index.html && echo "→ Schutzregel (CSP) gesetzt" || { echo "✗ Schutzregel fehlt"; exit 1; }

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
