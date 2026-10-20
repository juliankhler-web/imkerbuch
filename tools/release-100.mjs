/* Schalter für den Store-Start: stellt die App auf Version 1.00 um.

   Was er macht (erst DIREKT vor dem ersten Hochladen zu Apple/Google ausführen):
   1. Die bisherige Entwicklungs-Geschichte (CHANGELOG 0.x … 2.x) wandert nach
      docs/CHANGELOG-ENTWICKLUNG.md – nichts geht verloren.
   2. In index.html: APP_VERSION = '1.00' und „Was ist neu?“ bekommt genau einen
      Eintrag für Kunden („Willkommen bei ImkerBuch 1.0“).
   3. package.json → 1.0.0, Service-Worker-Cache +1.
   4. iOS: MARKETING_VERSION 1.0 und Build-Nummer 100; Android: versionName "1.0", versionCode 100
      (ab dann zählt native/sync-app.sh beides aus APP_VERSION weiter: 1.01 → 101 …).

   Aufruf:
     node tools/release-100.mjs --probe   → zeigt nur, was sich ändern würde (ändert nichts)
     node tools/release-100.mjs           → stellt um
   Danach: Tests (npm test), ./native/sync-app.sh (OHNE --testmodus), committen.
   Spätere Updates zählen normal weiter: 1.01, 1.02 … (Fehler), 1.10 … (Neues), 2.00 (z. B. Cloud).
*/
import { readFileSync, writeFileSync } from 'node:fs';

const WURZEL = new URL('..', import.meta.url).pathname;
const PROBE = process.argv.includes('--probe');
const lies = (p) => readFileSync(WURZEL + p, 'utf8');
const aenderungen = [];
const setze = (p, alt, neu) => { if (alt !== neu) { aenderungen.push(p); if (!PROBE) writeFileSync(WURZEL + p, neu); } };

const HEUTE = new Date().toISOString().slice(0, 10);
const WILLKOMMEN = `  { version: '1.00', datum: '${HEUTE}', punkte: [
    '<b>Willkommen bei ImkerBuch 1.0!</b> Dein digitales Stockbuch – komplett auf Deutsch, offline und ohne Konto. Deine Daten bleiben auf deinem Gerät.',
    '<b>Durchsicht am Stand</b> mit großen Knöpfen, Stockkarte, Varroa, Behandlungen, Fütterung, Königinnen, Ernte und Abfüllung, Kassenbuch und Rechnungen.',
    '<b>Imme</b>, dein Assistent, zeigt dir Schritt für Schritt, wie alles geht – frag einfach unten rechts.',
    'Fragen oder Ideen? Menü → <b>Hilfe & Kontakt</b>. Und denk ans regelmäßige <b>Sichern</b>.',
  ] },
`;

// 1 + 2: index.html
const html = lies('index.html');
const vMatch = html.match(/const APP_VERSION = '([^']+)';/);
if (!vMatch) throw new Error('APP_VERSION nicht gefunden');
if (vMatch[1] === '1.00') { console.log('Steht schon auf 1.00 – nichts zu tun.'); process.exit(0); }
const start = html.indexOf('const CHANGELOG = [\n');
const ende = html.indexOf('\n];', start);
if (start < 0 || ende < 0) throw new Error('CHANGELOG nicht gefunden');
const alteListe = html.slice(start + 'const CHANGELOG = [\n'.length, ende);
const neuHtml = html.slice(0, start) + 'const CHANGELOG = [\n' + WILLKOMMEN + html.slice(ende + 1);
const neuHtml2 = neuHtml.replace(vMatch[0], "const APP_VERSION = '1.00';");
setze('index.html', html, neuHtml2);
const archiv = `# ImkerBuch – Entwicklungs-Geschichte vor 1.0

Bis Version ${vMatch[1]} (Stand ${HEUTE}). Ab 1.00 zeigt die App Kunden nur noch die neuen Einträge.
Format: Auszug der früheren \`CHANGELOG\`-Liste aus \`index.html\`.

\`\`\`js
${alteListe}
\`\`\`
`;
if (!PROBE) writeFileSync(WURZEL + 'docs/CHANGELOG-ENTWICKLUNG.md', archiv);
aenderungen.push('docs/CHANGELOG-ENTWICKLUNG.md (neu, ' + (alteListe.match(/version: '/g) || []).length + ' Einträge)');

// 3: package.json + Service Worker
const pkg = lies('package.json');
setze('package.json', pkg, pkg.replace(/"version": "[^"]+"/, '"version": "1.0.0"'));
const sw = lies('service-worker.js');
setze('service-worker.js', sw, sw.replace(/imkerbuch-v(\d+)/, (_, n) => 'imkerbuch-v' + (Number(n) + 1)));

// 4: iOS + Android
const pbx = 'native/ios/App/App.xcodeproj/project.pbxproj';
const pb = lies(pbx);
setze(pbx, pb, pb.replace(/MARKETING_VERSION = [^;]+;/g, 'MARKETING_VERSION = 1.0;').replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, 'CURRENT_PROJECT_VERSION = 100;'));
const grd = 'native/android/app/build.gradle';
const gr = lies(grd);
setze(grd, gr, gr.replace(/versionCode \d+/, 'versionCode 100').replace(/versionName "[^"]+"/, 'versionName "1.0"'));

console.log((PROBE ? 'PROBE – würde ändern:\n  ' : 'Umgestellt auf 1.00:\n  ') + aenderungen.join('\n  '));
console.log(`\nAlte Version: ${vMatch[1]} → neu: 1.00. Danach: npm test · ./native/sync-app.sh · committen.`);
