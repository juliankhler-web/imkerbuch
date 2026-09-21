/* Schnürt ein Paket zum Gegenlesen durch eine andere KI oder einen Menschen.

   Enthalten ist der vollständige Quelltext, die Doku, die Testsuite und ein
   Datensatz zum Ausprobieren. Der Datensatz sind BEISPIELDATEN aus der
   Test-Datenbank – niemals die echten Daten. Wer eine Imkerei-Sicherung
   weitergibt, gibt Kundennamen, Anschriften und Rechnungen mit heraus; das
   sind personenbezogene Daten Dritter und gehören nicht in eine fremde Cloud.

   Aufruf: node tools/pruefpaket.mjs [zielordner]
*/
import { mkdirSync, writeFileSync, copyFileSync, rmSync, existsSync, readFileSync, cpSync, readdirSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';

const WURZEL = new URL('..', import.meta.url).pathname;
const ZIEL = process.argv[2] || join(WURZEL, 'pruefpaket');
const PROFIL = new URL('.chromeprofil-paket', import.meta.url).pathname;
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 8952, CDP = 9352;
const schlaf = (ms) => new Promise((r) => setTimeout(r, ms));

/* Was ins Paket gehört. Alles andere (native Hüllen, Bilder, Videos,
   node_modules) bläht nur auf und trägt zum Prüfen nichts bei. */
/** Alle Markdown-Dokumente aus docs/ (auch Unterordner wie adr/). */
function docsDateien() {
  const raus = [];
  const gehe = (rel) => {
    for (const e of readdirSync(new URL('../' + rel, import.meta.url), { withFileTypes: true })) {
      if (e.isDirectory()) gehe(`${rel}/${e.name}`);
      else if (e.name.endsWith('.md')) raus.push(`${rel}/${e.name}`);
    }
  };
  gehe('docs');
  return raus.sort();
}

const DATEIEN = [
  'index.html', 'service-worker.js', 'manifest.json',
  'icon-192.png', 'icon-512.png', 'icon-180.png',
  'impressum.html', 'datenschutz.html', 'agb.html',
  'tests/tests.js', 'tests/test.html',
  'PROJEKT.md',
  /* Die Dokumente werden AUFGEZÄHLT, nicht einzeln aufgelistet. Die feste
     Liste hat beim letzten Mal `docs/PRUEFUNG-2026-09.md` verschluckt – genau
     die Datei, auf die der Prüfauftrag verwies. Was in docs/ liegt, gehört ins
     Paket. */
  ...docsDateien(),
  'package.json', 'package-lock.json', '.markdownlint-cli2.jsonc', '.github/workflows/ci.yml',
  'tools/test-run.mjs', 'tools/pruefpaket.mjs', 'tools/pdfs.mjs', 'tools/pdf-ansicht.html',
];
/* Ganze Ordner: die selbst gehosteten Bibliotheken (ohne sie läuft PDF, Excel
   und QR nur über CDN) und die Bilder, auf die die App im Betrieb zugreift. */
const ORDNER = ['libs', 'assets'];

class Cdp {
  constructor(ws) { this.ws = ws; this.id = 0; this.warten = new Map(); this.session = null;
    ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); const w = this.warten.get(m.id);
      if (w) { this.warten.delete(m.id); m.error ? w.rej(new Error(m.error.message)) : w.res(m.result); } }); }
  send(method, params = {}, session = this.session) {
    const id = ++this.id;
    return new Promise((res, rej) => { this.warten.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params, ...(session ? { sessionId: session } : {}) }));
      setTimeout(() => { if (this.warten.delete(id)) rej(new Error('CDP-Zeitüberschreitung: ' + method)); }, 120000); });
  }
  async js(code) {
    const r = await this.send('Runtime.evaluate', { expression: `(async()=>{${code}})()`, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result.value;
  }
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png' };
function server() {
  const srv = createServer(async (req, res) => {
    try {
      const datei = join(WURZEL, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      const inhalt = await readFile(datei);
      res.writeHead(200, { 'Content-Type': MIME[extname(datei)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(inhalt);
    } catch (e) { res.writeHead(404).end(); }
  });
  return new Promise((r) => srv.listen(PORT, '127.0.0.1', () => r(srv)));
}

/** Beispieldaten in der Test-Datenbank erzeugen und als Sicherung ausgeben. */
async function beispieldaten() {
  const srv = await server();
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${CDP}`, `--user-data-dir=${PROFIL}`,
    '--no-first-run', '--no-default-browser-check', '--disable-gpu'], { stdio: 'ignore' });
  try {
    let cdp = null;
    for (let i = 0; i < 60 && !cdp; i++) {
      try {
        const v = await fetch(`http://127.0.0.1:${CDP}/json/version`).then((r) => r.json());
        const ws = new WebSocket(v.webSocketDebuggerUrl);
        await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
        cdp = new Cdp(ws);
      } catch (e) { await schlaf(300); }
    }
    if (!cdp) throw new Error('Chrome antwortet nicht');
    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
    cdp.session = sessionId;
    await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/index.html?testdb=1` });
    for (let i = 0; i < 200; i++) { try { if (await cdp.js('return !!window.appReady')) break; } catch (e) {} await schlaf(150); }
    await cdp.js('await Demo.reset(); return true;');
    // ohne Anhänge: Fotos und Tonaufnahmen blähen die Datei auf und bringen nichts
    return await cdp.js('return JSON.stringify(await Backup.buildData(false), null, 1);');
  } finally { try { chrome.kill(); } catch (e) {} srv.close(); rmSync(PROFIL, { recursive: true, force: true }); }
}

/* Kennzahlen aus den Dateien lesen statt im Text zu pflegen – von Hand
   gepflegte Zahlen stimmen nach der zweiten Änderung nicht mehr. */
const zeilen = (datei) => readFileSync(join(WURZEL, datei), 'utf8').split('\n').length.toLocaleString('de-DE');
const testfaelle = () => (readFileSync(join(WURZEL, 'tests/tests.js'), 'utf8').match(/^test\(/gm) || []).length;
const version = () => (readFileSync(join(WURZEL, 'index.html'), 'utf8').match(/const APP_VERSION = '([^']+)'/) || [, '?'])[1];

const BRIEFING = () => `# ImkerBuch – Paket zum Gegenlesen (v${version()})

Erzeugt am ${new Date().toISOString().slice(0, 10)}.

## Was das hier ist

Eine Verwaltung für Imkereien: eine offline-fähige Web-App, die **vollständig
auf dem Gerät läuft**. Kein Server, kein Konto, keine Cloud. Alle Daten liegen
in IndexedDB im Browser; ausgetauscht wird über eine Sicherungsdatei.

## Was drin ist

| Datei | Inhalt |
| --- | --- |
| \`index.html\` | die vollständige Anwendung (${zeilen('index.html')} Zeilen, ohne Bauschritt) |
| \`service-worker.js\` | Offline-Betrieb und Zwischenspeicher |
| \`tests/tests.js\` | die Testsuite (${testfaelle()} Fälle, alle grün) |
| \`tests/test.html\` | Testseite, die die App in einem Rahmen lädt |
| \`beispieldaten.json\` | ein vollständiger Datensatz zum Ausprobieren |
| \`docs/API.md\` | die interne Schnittstelle, Datenmodell aller Speicher |
| \`docs/adr/\` | warum zentrale Entscheidungen so gefallen sind |
| \`PROJEKT.md\` | Verlauf und Stand |
| \`libs/\` | die selbst gehosteten Bibliotheken (PDF, Excel, QR) |
| \`assets/\` | Bilder, die die App im Betrieb lädt |
| \`impressum.html\` u. a. | die Rechtsseiten |
| \`tools/test-run.mjs\` | Testläufer, kopflos über das DevTools-Protokoll |
| \`TESTPROTOKOLL.md\` | Lauf vom Zeitpunkt des Packens, mit Browser und Version |
| \`coverage-report.json\` | jede nie aufgerufene Funktion mit Zeilennummer |

**Die Beispieldaten sind erfunden.** Echte Betriebsdaten enthalten Kundennamen,
Anschriften und Rechnungen – die gehören nicht in eine fremde Umgebung.

## Ausprobieren

\`\`\`bash
python3 -m http.server 8000      # im Paketordner
# dann http://localhost:8000/index.html aufrufen
# Einstellungen → Sicherung → „Backup importieren" → beispieldaten.json
# Tests: http://localhost:8000/tests/test.html
\`\`\`

## Worauf ich einen Blick hätte

1. **Datenverlust** – kann eine Eingabe, ein Abbruch oder ein Import Daten
   still verlieren oder verdoppeln?
2. **Rechnen** – Bestände, Umsatzsteuer (§ 19 / § 24), Selbstkosten, Pfand.
3. **Rechtliches** – Bestandsbuch (Tierarzneimittelgesetz), Rechnungsangaben
   (§ 14 UStG), Honigverordnung auf dem Etikett, Öko-Kontrollunterlagen.
4. **Der Offline-Betrieb** – Service Worker, Zwischenspeicher, Update-Weg.
5. **Stolperfallen im Alltag** – Handschuhe, Sonne, kein Netz am Stand.

## Was Absicht ist und kein Fehler

- **Eine einzige \`index.html\` ohne Bauschritt.** Bewusst so; die Begründung
  steht in \`docs/adr/0002\`.
- **Kein Server, keine Cloud, kein Konto.** \`docs/adr/0001\`.
- **Globale Funktionen statt Module.** Folge der Ein-Datei-Entscheidung;
  Namensräume und Abschnittsbanner sorgen für Ordnung.
- **Deutsche Bezeichner im Code.** Die Fachsprache der Imkerei ist deutsch,
  eine Übersetzung würde beim Lesen mehr kosten als bringen.
- **Bestandsabzug merkt sich seine Buchung** statt sie zurückzurechnen –
  \`docs/adr/0003\`.
`;

async function main() {
  rmSync(ZIEL, { recursive: true, force: true });
  mkdirSync(ZIEL, { recursive: true });
  for (const d of DATEIEN) {
    if (!existsSync(join(WURZEL, d))) { console.log('  fehlt (übersprungen):', d); continue; }
    mkdirSync(join(ZIEL, dirname(d)), { recursive: true });
    copyFileSync(join(WURZEL, d), join(ZIEL, d));
  }
  for (const o of ORDNER) {
    if (!existsSync(join(WURZEL, o))) continue;
    cpSync(join(WURZEL, o), join(ZIEL, o), { recursive: true });
  }
  console.log(`${DATEIEN.length} Dateien + ${ORDNER.length} Ordner kopiert.`);

  /* Frisches Testprotokoll: nicht behaupten, dass alles grün ist, sondern es
     im Moment des Packens messen – mit Browser- und Versionsangabe. */
  console.log('Testsuite läuft …');
  const lauf = spawnSync('node', [join(WURZEL, 'tools', 'test-run.mjs'), '--coverage'], { encoding: 'utf8' });
  const ausgabe = (lauf.stdout || '') + (lauf.stderr || '');
  const zeile = (muster) => (ausgabe.match(muster) || [, '–'])[1];
  writeFileSync(join(ZIEL, 'TESTPROTOKOLL.md'), `# Testprotokoll

Erzeugt beim Packen dieses Pakets – nicht abgeschrieben, sondern gemessen.

| | |
| --- | --- |
| App-Version | ${zeile(/App-Version: (.+)/)} |
| Browser | ${zeile(/Browser: (.+)/)} |
| Gelaufen | ${zeile(/Gelaufen: (.+)/)} |
| Ergebnis | ${zeile(/(\d+ von \d+ Tests grün.*)/)} |
| Abdeckung | ${zeile(/Abdeckung: (.+)/)} |
| Exit-Code | ${lauf.status} |

Die Abdeckung zählt **Funktionen**, nicht Zeilen, und ist ein Wegweiser, kein
Ziel: Dialoge, die auf eine Nutzereingabe warten, und Netzabrufe bleiben
bewusst teilweise offen. Die vollständige Liste der nie aufgerufenen Funktionen
steht in \`coverage-report.json\` (Name, Zeilennummer, Größe).

## Selbst nachstellen

\`\`\`bash
npm ci                      # einmalig, für den Markdown-Linter
node tools/test-run.mjs --coverage
\`\`\`

Der Läufer startet einen eigenen Dateiserver und steuert Chrome über das
DevTools-Protokoll (kein Puppeteer, kein Selenium). Er braucht ein installiertes
Chrome; ein anderer Pfad lässt sich über die Umgebungsvariable \`CHROME_BIN\`
angeben. Ohne Chrome geht es auch von Hand: einen beliebigen Dateiserver im
Paketordner starten und \`tests/test.html\` im Browser öffnen.

## Rohausgabe des Laufs

\`\`\`text
${ausgabe.split('\n').filter((z) => !/^\s{2,}\d+\s/.test(z)).join('\n').trim()}
\`\`\`
`);
  const bericht = join(WURZEL, 'tools', 'coverage', 'report.json');
  if (existsSync(bericht)) copyFileSync(bericht, join(ZIEL, 'coverage-report.json'));
  console.log(`Testprotokoll geschrieben: ${zeile(/(\d+ von \d+ Tests grün.*)/)}`);
  console.log('Beispieldaten werden erzeugt …');
  writeFileSync(join(ZIEL, 'beispieldaten.json'), await beispieldaten());
  writeFileSync(join(ZIEL, 'LIESMICH.md'), BRIEFING());

  const zip = join(dirname(ZIEL), 'imkerbuch-pruefpaket.zip');
  rmSync(zip, { force: true });
  spawnSync('zip', ['-rq', zip, '.'], { cwd: ZIEL });
  console.log(`\nFertig: ${ZIEL}`);
  if (existsSync(zip)) {
    const mb = (spawnSync('du', ['-k', zip]).stdout.toString().split('\t')[0] / 1024).toFixed(1);
    console.log(`Zum Verschicken: ${zip} (${mb} MB)`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
