#!/bin/bash
# Übernimmt den aktuellen Stand der Web-App in die iOS- und Android-Projekte.
# Aufruf:  cd ~/ImkerApp/native && ./sync-app.sh            (Store-Version, ohne Beispieldaten)
#          cd ~/ImkerApp/native && ./sync-app.sh --testmodus (Test-Build mit Beispieldaten)
set -e
cd "$(dirname "$0")"

echo "→ Kopiere App-Dateien nach www/ …"
cp ../index.html ../service-worker.js ../manifest.json www/
cp ../icon-180.png ../icon-192.png ../icon-512.png www/
cp ../impressum.html ../datenschutz.html ../agb.html ../support.html ../webview-veraltet.html www/   # webview-veraltet: Hinweis bei zu altem Android-WebView (capacitor.config.json)
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

# Store-Versionsnummern aus APP_VERSION ableiten (erst nach dem Umstieg auf 1.00 – erkennbar an
# docs/CHANGELOG-ENTWICKLUNG.md, das tools/release-100.mjs anlegt). Google und Apple verlangen bei
# JEDEM Hochladen eine höhere Bau-Nummer: 1.00 → 100, 1.01 → 101, 1.10 → 110, 2.00 → 200.
# Sichtbare Version: 1.00 → „1.0“, 1.01 → „1.0.1“, 1.10 → „1.1“ (so legt man sie auch in App Store Connect an).
# Vor 1.00 bleibt alles unverändert – Entwicklungsstände (2.x) dürfen NIE hochgeladen werden,
# sonst wäre die Bau-Nummer zu hoch für 1.00.
if [ -f ../docs/CHANGELOG-ENTWICKLUNG.md ]; then
  node -e '
    const fs = require("fs");
    const v = (fs.readFileSync("www/index.html", "utf8").match(/const APP_VERSION = .([0-9]+)\.([0-9]{2})./) || []);
    if (!v[1]) { console.error("✗ APP_VERSION nicht im Format X.YY"); process.exit(1); }
    const haupt = +v[1], neben = v[2], code = haupt * 100 + +neben;
    const sichtbar = haupt + "." + neben[0] + (neben[1] !== "0" ? "." + neben[1] : "");
    const g = "android/app/build.gradle", p = "ios/App/App.xcodeproj/project.pbxproj";
    fs.writeFileSync(g, fs.readFileSync(g, "utf8").replace(/versionCode \d+/, "versionCode " + code).replace(/versionName "[^"]*"/, "versionName \"" + sichtbar + "\""));
    fs.writeFileSync(p, fs.readFileSync(p, "utf8").replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, "CURRENT_PROJECT_VERSION = " + code + ";").replace(/MARKETING_VERSION = [^;]+;/g, "MARKETING_VERSION = " + sichtbar + ";"));
    console.log("→ Store-Version " + sichtbar + " (Bau-Nummer " + code + ") für iOS und Android gesetzt");
  ' || exit 1
fi

echo "→ Übertrage in die iOS- und Android-Projekte …"
npx cap copy

VERSION=$(grep -o "APP_VERSION = '[^']*'" www/index.html | head -1 | cut -d"'" -f2)
echo "✓ Fertig – App-Stand v${VERSION} ist jetzt in ios/ und android/."
echo "  iOS bauen:     npx cap open ios      (Xcode)"
echo "  Android bauen: npx cap open android  (Android Studio)"
