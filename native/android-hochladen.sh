#!/bin/bash
# Baut die unterschriebene Datei für Google Play (.aab).
# Aufruf: cd ~/ImkerApp/native && ./android-hochladen.sh
# Vorher: ./sync-app.sh (OHNE --testmodus). Das Passwort wird nur abgefragt und nicht gespeichert.
set -e
cd "$(dirname "$0")"
export JAVA_HOME=$(ls -d "$HOME"/Android/jdk-21*/Contents/Home | head -1)
export ANDROID_HOME="$HOME/Android/sdk"
SCHLUESSEL="${IMKERBUCH_UPLOAD_KEYSTORE:-$HOME/Android/schluessel/imkerbuch-upload.jks}"
[ -f "$SCHLUESSEL" ] || { echo "✗ Kein Upload-Schlüssel gefunden ($SCHLUESSEL). Erst ./android-schluessel-anlegen.sh ausführen."; exit 1; }
grep -q "^const TESTMODUS_APP = false;" android/app/src/main/assets/public/index.html || { echo "✗ Im App-Paket ist der Testmodus an – erst ./sync-app.sh OHNE --testmodus ausführen."; exit 1; }
if [ -z "$IMKERBUCH_UPLOAD_PASSWORT" ]; then read -r -s -p "Passwort des Upload-Schlüssels: " IMKERBUCH_UPLOAD_PASSWORT; echo; fi
export IMKERBUCH_UPLOAD_PASSWORT
(cd android && ./gradlew bundleRelease -q)
AAB=android/app/build/outputs/bundle/release/app-release.aab
"$JAVA_HOME/bin/jarsigner" -J-Duser.language=en -verify "$AAB" 2>&1 | grep -q "jar verified" || { echo "✗ Die Datei ist nicht unterschrieben – Passwort falsch?"; exit 1; }
VERSION=$(grep -o 'versionName "[^"]*"' android/app/build.gradle | cut -d'"' -f2)
CODE=$(grep -o 'versionCode [0-9]*' android/app/build.gradle | cut -d' ' -f2)
ZIEL="$HOME/Desktop/ImkerBuch-$VERSION-$CODE.aab"
cp "$AAB" "$ZIEL"
echo "✓ Fertig: $ZIEL (Version $VERSION, Bau-Nummer $CODE) – diese Datei in der Play Console hochladen."
