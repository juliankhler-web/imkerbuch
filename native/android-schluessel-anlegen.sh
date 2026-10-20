#!/bin/bash
# EINMALIG: legt den Upload-Schlüssel für Google Play an.
# Aufruf: cd ~/ImkerApp/native && ./android-schluessel-anlegen.sh
# Das Programm fragt dich nach einem Passwort (zweimal). Es wird NIRGENDS gespeichert –
# trag es in deinen Passwort-Manager ein. Ohne Schlüssel + Passwort keine Updates (dann nur über den Google-Support).
set -e
ZIEL="$HOME/Android/schluessel/imkerbuch-upload.jks"
JAVA_HOME=$(ls -d "$HOME"/Android/jdk-21*/Contents/Home | head -1)
if [ -f "$ZIEL" ]; then echo "✗ Es gibt schon einen Schlüssel: $ZIEL – nicht überschreiben!"; exit 1; fi
mkdir -p "$(dirname "$ZIEL")" && chmod 700 "$(dirname "$ZIEL")"
echo "→ Lege den Upload-Schlüssel an. Gleich kommt zweimal die Frage nach einem Passwort (mind. 6 Zeichen)."
"$JAVA_HOME/bin/keytool" -genkeypair -keystore "$ZIEL" -storetype PKCS12 -alias upload -keyalg RSA -keysize 4096 -validity 10000 \
  -dname "CN=Julian Koehler, O=ImkerBuch, L=Dachau, C=DE"
chmod 600 "$ZIEL"
echo "✓ Schlüssel angelegt: $ZIEL"
echo "  WICHTIG: Diese Datei sicher aufbewahren (z. B. Kopie auf einem USB-Stick im Schrank) und das Passwort im Passwort-Manager notieren."
