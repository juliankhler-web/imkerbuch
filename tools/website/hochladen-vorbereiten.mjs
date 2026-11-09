/* node tools/website/hochladen-vorbereiten.mjs – legt im Ordner website-upload/ genau das ab, was auf den Server gehört.
   Die Vorschau in website-neu/ verweist mit ../ auf die Rechtsseiten und Icons, auf dem Server liegt alles im Wurzelordner.
   Seit 08.11.2026 für Suchmaschinen freigegeben (Julian): Startseite und Rechtsseiten mit index,follow, nur Lizenzen und /v/ bleiben noindex. */
import { rmSync, mkdirSync, cpSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const WURZEL = new URL('../..', import.meta.url).pathname, Q = join(WURZEL, 'website-neu'), Z = join(WURZEL, 'website-upload');
rmSync(Z, { recursive: true, force: true }); mkdirSync(join(Z, 'media'), { recursive: true });
let seite = readFileSync(join(Q, 'index.html'), 'utf8').replaceAll('"../', '"/');
/* Arbeitsnotizen, Anmelde-Entwurf und Entwickler-Schalter gehören nicht auf den Server */
seite = seite.replace(/<!--[\s\S]*?-->\n?/g, '');
seite = seite.replace(/\s*<a [^>]*href="anmelden-entwurf\.html"[\s\S]*?<\/a>/g, '');
seite = seite.replace(/\s*\/\* -+ \?anmelden=1[\s\S]*?\n  \}\n/, '\n');
seite = seite.replace(/\s*\/\* -+ Entwickler-Schalter[\s\S]*?addEventListener\('load', gehe\);\n  \}\n/, '\n');
seite = seite.replace(/\/\*[^*]*(?:Entwurf|Bloom|Vorlage|Store-Start)[\s\S]*?\*\//g, '');
for (const w of ['anmelden-entwurf', 'ENTWURF', 'Bloom', 'Entwickler-Schalter', 'Store-Start', 'data-anmelden]']) if (seite.includes(w)) throw new Error('Noch in der Seite: ' + w);
if (seite.includes('../')) throw new Error('index.html enthält noch ../');
if (seite.includes('noindex')) throw new Error('Startseite hat noch noindex – seit 08.11.2026 freigegeben');
writeFileSync(join(Z, 'index.html'), seite);
for (const d of ['.htaccess', 'v', 'media/app-bilder', 'media/hero-flug-1280.mp4', 'media/hero-flug-handy.mp4', 'media/hintergrund-flug.mp4', 'media/bienenjahr-flug-1280.mp4', 'media/bienenjahr-flug-handy.mp4', 'media/partner']) cpSync(join(Q, d), join(Z, d), { recursive: true });
/* Das 3D-Logo (Kopf und Fuß) liegt im App-Ordner; die Vorschau holt es mit ../assets/logo, der Server unter /assets/logo.
   Das PFAU-Logo (website-neu/media/partner) wird seit 09.11.2026 im Abschnitt „Imkereien“ gezeigt (mit Zustimmung, als Werbung gekennzeichnet). */
cpSync(join(WURZEL, 'assets/logo'), join(Z, 'assets/logo'), { recursive: true });
mkdirSync(join(Z, '.well-known'), { recursive: true });
cpSync(join(Q, 'stimme.php'), join(Z, 'stimme.php'));   // Stimmenzähler für „Was als Nächstes kommt“
cpSync(join(Q, 'dienste.json'), join(Z, 'dienste.json'));
for (const f of ['robots.txt', 'sitemap.xml']) cpSync(join(Q, f), join(Z, f));   // für Google (08.11.2026)   // Fern-Schalter der Adresssuche (Nominatim-Regeln)
cpSync(join(Q, '.well-known/apple-app-site-association'), join(Z, '.well-known/apple-app-site-association'));   // assetlinks.json erst mit dem echten Fingerabdruck aus der Play Console
for (const f of ['icon-180.png', 'icon-192.png']) cpSync(join(WURZEL, f), join(Z, f));
for (const f of ['impressum.html', 'datenschutz.html', 'agb.html', 'support.html', 'lizenzen.html']) {
  /* Die Rechtsseiten verweisen auf landing.html; die gibt es auf dem Server nicht, dort ist die Startseite index.html */
  const x = readFileSync(join(WURZEL, f), 'utf8').replaceAll('href="landing.html"', 'href="/"').replace(/<!--[\s\S]*?-->\n?/g, '');
  if (f !== 'lizenzen.html' && x.includes('noindex')) throw new Error(f + ': noindex – seit 08.11.2026 sollen die Rechtsseiten in die Suche');
  writeFileSync(join(Z, f), x);
}
console.log('fertig:', Z);
