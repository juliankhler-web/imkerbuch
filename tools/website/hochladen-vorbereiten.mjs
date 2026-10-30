/* node tools/website/hochladen-vorbereiten.mjs – legt im Ordner website-upload/ genau das ab, was auf den Server gehört.
   Die Vorschau in website-neu/ verweist mit ../ auf die Rechtsseiten und Icons, auf dem Server liegt alles im Wurzelordner.
   noindex bleibt in der Seite, bis Julian den Start freigibt. */
import { rmSync, mkdirSync, cpSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const WURZEL = new URL('../..', import.meta.url).pathname, Q = join(WURZEL, 'website-neu'), Z = join(WURZEL, 'website-upload');
rmSync(Z, { recursive: true, force: true }); mkdirSync(join(Z, 'media/partner'), { recursive: true });
const seite = readFileSync(join(Q, 'index.html'), 'utf8').replaceAll('"../', '"/');
if (seite.includes('../')) throw new Error('index.html enthält noch ../');
if (!seite.includes('noindex')) throw new Error('noindex fehlt: vor dem Start muss es drinbleiben');
writeFileSync(join(Z, 'index.html'), seite);
for (const d of ['.htaccess', 'v', 'media/app-bilder', 'media/hero-flug-1280.mp4', 'media/hero-flug-handy.mp4', 'media/hintergrund-flug.mp4', 'media/bienenjahr-flug-1280.mp4', 'media/bienenjahr-flug-handy.mp4', 'media/partner/pfau-honig-logo-braun.png']) cpSync(join(Q, d), join(Z, d), { recursive: true });
mkdirSync(join(Z, '.well-known'), { recursive: true });
cpSync(join(Q, '.well-known/apple-app-site-association'), join(Z, '.well-known/apple-app-site-association'));   // assetlinks.json erst mit dem echten Fingerabdruck aus der Play Console
for (const f of ['icon-180.png', 'icon-192.png']) cpSync(join(WURZEL, f), join(Z, f));
for (const f of ['impressum.html', 'datenschutz.html', 'agb.html', 'support.html']) {
  /* Die Rechtsseiten verweisen auf landing.html; die gibt es auf dem Server nicht, dort ist die Startseite index.html */
  const x = readFileSync(join(WURZEL, f), 'utf8').replaceAll('href="landing.html"', 'href="/"');
  writeFileSync(join(Z, f), x);
}
console.log('fertig:', Z);
