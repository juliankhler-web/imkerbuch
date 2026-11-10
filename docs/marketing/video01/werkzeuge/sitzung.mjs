/* Hilfsmittel zum Ausprobieren: hält ein Chrome mit der App offen und nimmt Befehle über
   http://127.0.0.1:9352 an:  POST /js (Text = JavaScript)  ·  GET /bild?datei=/pfad.png
   Aufruf: node sitzung.mjs   (läuft, bis man es beendet) */
import { createServer } from 'node:http';
import { writeFileSync } from 'node:fs';
import { chromeStarten, appOeffnen } from './cdp.mjs';

const cdp = await appOeffnen(await chromeStarten(9351));
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/bild') {
      const b = await cdp.send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(url.searchParams.get('datei'), Buffer.from(b.data, 'base64'));
      return res.end('ok');
    }
    let code = ''; for await (const c of req) code += c;
    if (url.pathname === '/cdp') return res.end(JSON.stringify(await cdp.send(url.searchParams.get('m'), JSON.parse(code || '{}'))));
    const v = await cdp.js(code);
    res.end(JSON.stringify(v, null, 1) ?? 'undefined');
  } catch (e) { res.statusCode = 500; res.end(String(e.stack || e)); }
}).listen(9352, '127.0.0.1', () => console.log('BEREIT'));
