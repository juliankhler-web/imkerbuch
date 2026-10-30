#!/bin/bash
# Lädt website-upload/ per SFTP nach public_html. Das Passwort tippt Julian selbst ein; es wird nirgends gespeichert.
set -e
cd "$(dirname "$0")/../.."
node tools/website/hochladen-vorbereiten.mjs
cd website-upload
LISTE=$(mktemp)
{
  echo "cd public_html"
  echo "-rm index.html"
  find . -type d ! -name . | sed 's|^\./||' | while read -r d; do echo "-mkdir \"$d\""; done
  find . -type f | sed 's|^\./||' | while read -r f; do echo "put \"$f\" \"$f\""; done
  echo "ls -la"
  echo "bye"
} > "$LISTE"
echo "Gleich fragt der Mac nach dem Passwort. Das steht in der konsoleH unter Einstellungen → Logindaten."
sftp -o PubkeyAuthentication=no -o PreferredAuthentications=password,keyboard-interactive ffr8zy@www810.your-server.de < "$LISTE"
rm -f "$LISTE"
echo "Fertig hochgeladen."
