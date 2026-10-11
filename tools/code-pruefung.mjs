/* Prüft den Programmcode der App auf Fehler, die erst beim Ausführen
   auffallen würden – vor allem Namen, die nirgends definiert sind.

   Warum: In v1.67 wurde im Königinnen-Formular eine Tabelle („qm“) benutzt,
   die nur in einer anderen Funktion existierte. JavaScript meldet so etwas
   erst, wenn genau diese Zeile läuft – hier nur beim Bearbeiten einer
   BESTEHENDEN Königin. Kein Test öffnete diesen Weg, also blieb es monatelang
   unentdeckt. Diese Prüfung liest den ganzen Code und findet solche Stellen,
   egal ob ein Test sie je erreicht.

   Aufruf:  node tools/code-pruefung.mjs     (läuft auch automatisch vor den Tests)
   Braucht: npm install (eslint + globals als devDependencies)
*/
import { readFile } from 'node:fs/promises';

const WURZEL = new URL('..', import.meta.url).pathname;

export async function codePruefung({ leise = false } = {}) {
  let ESLint, globals;
  try {
    ({ ESLint } = await import('eslint'));
    globals = (await import('globals')).default;
  } catch (e) {
    if (!leise) console.log('→ Code-Prüfung übersprungen (eslint fehlt – einmal „npm install“ ausführen)');
    return { uebersprungen: true, fehler: 0 };
  }
  const html = await readFile(WURZEL + 'index.html', 'utf8');
  /* Alle <script>-Blöcke laufen im selben globalen Bereich: zusammen prüfen.
     Leerzeilen davor halten die Zeilennummern gleich mit index.html. */
  let code = '';
  for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    const zeile = html.slice(0, m.index + '<script>'.length).split('\n').length - 1;
    code += '\n'.repeat(Math.max(0, zeile - code.split('\n').length + 1)) + m[1];
  }
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: {
      languageOptions: {
        ecmaVersion: 2024, sourceType: 'script',
        globals: { ...globals.browser, jspdf: 'readonly', XLSX: 'readonly', pdfjsLib: 'readonly', QRCode: 'readonly', Tesseract: 'readonly', JsBarcode: 'readonly' },
      },
      rules: {
        'no-undef': 'error',            // Name nirgends definiert (der Königinnen-Fehler)
        'no-dupe-keys': 'error',        // Schlüssel doppelt im selben Objekt – der erste geht still verloren
        'no-redeclare': 'error',
        'no-const-assign': 'error',
        'no-unreachable': 'error',
        'no-self-assign': 'error',
        'no-dupe-args': 'error',
        'no-func-assign': 'error',
      },
    },
  });
  const [ergebnis] = await eslint.lintText(code, { filePath: 'index.html.js' });
  const fehler = ergebnis.messages.filter((m) => m.severity === 2);
  if (!leise) {
    if (!fehler.length) console.log('✅ Code-Prüfung: keine undefinierten Namen oder doppelten Schlüssel');
    for (const f of fehler) console.log(`❌ index.html Zeile ${f.line}: ${f.message} (${f.ruleId})`);
  }
  return { uebersprungen: false, fehler: fehler.length, meldungen: fehler };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { fehler } = await codePruefung();
  process.exit(fehler ? 1 : 0);
}
