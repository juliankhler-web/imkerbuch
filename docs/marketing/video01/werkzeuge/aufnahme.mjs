/* Bildschirmaufnahmen für Erklärvideo Folge 1 („Warum ein ImkerBuch?“), Szenen 5, 6 und 7.
   – eigenes kopfloses Chrome, App wie in der Store-App, TEST-Datenbank mit Beispieldaten (nie echte Daten)
   – Aufnahme als Bildschirmfotos in voller Auflösung, 1320 × 2868 px (440 × 956 pt, 3-fach), Seite dabei in Zeitlupe
   – danach baut zusammenbauen.swift daraus ein H.264-Video mit 30 Bildern/s (ohne Ton)
   Aufruf (lokaler Server auf Port 8931 muss laufen):
     node aufnahme.mjs 5|6|7        → docs/marketing/video01/aufnahmen/szene<N>.mp4
   Hinweis: Mittel und Wartezeit in Szene 6 sind Vorführwerte (siehe WARTEZEIT unten). */
import { readFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { chromeStarten, appOeffnen, schlaf, TMP, GERAET } from './cdp.mjs';

const SZENE = process.argv[2];
const HIER = new URL('.', import.meta.url).pathname;
const ZIEL = new URL('../aufnahmen/', import.meta.url).pathname;
const BILDER = `${TMP}/bilder-szene${SZENE}`;
const MITTEL = 'Oxalsäure 3,5 % (Träufeln)', MENGE = '30', WARTEZEIT = '14';   // Vorführwerte Szene 6

/* Helfer in der Seite: Element suchen, weich scrollen, Seiten-Blende, Imme-Knopf aus */
const HILFE = readFileSync(HIER + 'pdf-vorschau.js', 'utf8') + `
  (() => { const st = document.createElement('style'); st.textContent = '#bini-fab{display:none!important}'; document.head.appendChild(st); })();
  window.__v = {
    finde(sel, re) {
      const r = re ? new RegExp(re) : null;
      return [...document.querySelectorAll(sel)].filter((e) => { const b = e.getBoundingClientRect(); return b.width && b.height && (!r || r.test(e.textContent.replace(/\\s+/g, ' ').trim())); }).pop() || null;
    },
    scroller(el) { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p).overflowY; if ((o === 'auto' || o === 'scroll') && p.scrollHeight > p.clientHeight + 2) return p; } return null; },
    async gleiten(el, anteil = 0.5, ms = 650) {
      const sc = this.scroller(el), b = el.getBoundingClientRect();
      const oben = sc ? sc.getBoundingClientRect().top : 0, hoehe = sc ? sc.clientHeight : innerHeight;
      const start = sc ? sc.scrollTop : scrollY;
      const max = sc ? sc.scrollHeight - sc.clientHeight : document.documentElement.scrollHeight - innerHeight;
      const ziel = Math.max(0, Math.min(max, start + (b.top + b.height / 2) - oben - hoehe * anteil));
      if (Math.abs(ziel - start) < 4) return;
      const t0 = performance.now(), ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      await new Promise((fertig) => { const f = (now) => { const t = Math.min(1, (now - t0) / ms), y = start + (ziel - start) * ease(t);
        if (sc) sc.scrollTop = y; else scrollTo(0, y); t < 1 ? requestAnimationFrame(f) : fertig(); }; requestAnimationFrame(f); });
    },
    sichtbar(el) { const b = el.getBoundingClientRect(); return b.top > ${GERAET.oben + 50} && b.bottom < innerHeight - 100; },
    async blende(hash, zu = null, danach = null) {
      // kurze Überblendung über einen deckenden Schleier in der Seitenfarbe (die Statusleiste bleibt stehen)
      const v = document.createElement('div');
      v.style.cssText = 'position:fixed;inset:0;z-index:2147483000;pointer-events:none;opacity:0;transition:opacity .14s;background:' + [document.body, document.documentElement].map((e) => getComputedStyle(e).backgroundColor).concat('rgb(250,246,240)').find((c) => !/rgba\(0, 0, 0, 0\)|transparent/.test(c));
      document.body.appendChild(v); await new Promise((r) => requestAnimationFrame(r)); v.style.opacity = '1';
      await new Promise((r) => setTimeout(r, 150));
      document.querySelectorAll('#__pdfblatt, #modal-root .modal-back').forEach((e) => e.remove());
      location.hash = hash; await new Promise((r) => setTimeout(r, 220));
      scrollTo(0, 0); if (zu) { const z = document.querySelector(zu); if (z) await this.gleiten(z, 0.5, 1); }
      if (danach) danach();
      v.style.transition = 'opacity .24s'; v.style.opacity = '0'; await new Promise((r) => setTimeout(r, 260)); v.remove();
    },
  };
`;

const cdp = await appOeffnen(await chromeStarten(9361));
const js = (code) => cdp.js(code);

/* Gemeinsame Vorbereitung: erfundene Imkerei vollständig, Aufgaben passend zur Jahreszeit, Marktpreise */
await js(`const i = S.get('imkerei'); Object.assign(i, { bundesland: 'HE', tierhalter: 'Anna Beispiel' }); await S.set('imkerei', i);
  const alle = await DB.getAll('aufgaben'); for (const x of alle) await DB.del('aufgaben', x.id);
  const tag = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  // Lager so, dass keine Ablauf-/Nachkauf-Hinweise die Aufgabenliste füllen (sie lenken in Szene 6 vom Wartezeit-Hinweis ab)
  for (const x of await DB.getAll('inventar')) { if (x.ablauf) x.ablauf = tag(540); if (x.mindestbestand && x.stueckzahl < x.mindestbestand) x.stueckzahl = x.mindestbestand + 3; await DB.put('inventar', x); }
  for (const [titel, n] of [['Varroa-Kontrolle alle Völker', 2], ['Futterkontrolle Heimstand', 5], ['Honig abfüllen – Linde', 20]])
    await DB.put('aufgaben', { id: crypto.randomUUID(), titel, faellig: tag(n), erledigt: false });
  const abf = await DB.getAll('abfuellungen'), p = {};
  for (const a of abf) p[a.id] = a.gebindeG === 250 ? 4.5 : (a.anzahl === 88 ? 6.5 : 7.5);
  await S.set('marktpreise', p); return 1;`);

async function neuLaden(hash) {
  await js(`location.hash = '${hash}'; setTimeout(() => location.reload(), 30); return 1;`).catch(() => {});
  await schlaf(800);
  for (let i = 0; i < 200; i++) { try { if (await js('return !!window.appReady')) break; } catch (e) {} await schlaf(150); }
  await js(HILFE + '; return 1;');
  await schlaf(6000);   // Start-Hinweise und Nachladen abwarten …
  await js(`document.querySelectorAll('.toast').forEach((t) => t.remove()); scrollTo(0, 0); return 1;`);   // … und wegnehmen
  const f = await js('return window.__fehler.splice(0)');
  if (f.length) console.warn('Fehler in der Seite:', f);
}

/* Tippen wie mit dem Finger: Punkt zeigen, echter Klick an der Stelle */
async function tippe(sel, re = null, { nachher = 900, anteil = 0.5 } = {}) {
  const pos = await js(`const el = __v.finde(${JSON.stringify(sel)}, ${JSON.stringify(re)}); if (!el) return null;
    if (!__v.sichtbar(el)) { await __v.gleiten(el, ${anteil}); await new Promise((r) => setTimeout(r, 250)); }
    const b = el.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 };`);
  if (!pos) throw new Error(`Nicht gefunden: ${sel} ${re || ''}`);
  await js(`__tippen(${pos.x}, ${pos.y}); window.__geklickt = null; window.__tippZiel = __v.finde(${JSON.stringify(sel)}, ${JSON.stringify(re)});
    document.addEventListener('click', (e) => { window.__geklickt = e.target; }, { capture: true, once: true }); return 1;`);
  await warte(110);
  await eingabe(async () => {
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pos.x, y: pos.y });
    await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
    await schlaf(40);
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 2 });   // kein Hover-Rest am Knopf
  });
  // Hat der Klick das Ziel getroffen? (Zeichnet die Seite genau dazwischen neu, landet er daneben) – sonst direkt auslösen
  const ok = await js(`const z = window.__tippZiel, g = window.__geklickt; if (z && g && (z === g || z.contains(g))) return true;
    const neu = __v.finde(${JSON.stringify(sel)}, ${JSON.stringify(re)}); if (neu) { neu.click(); return 'nachgeholt (' + (g ? 'daneben: ' + g.tagName : 'kein Klick') + ')'; } return g ? 'daneben: ' + g.outerHTML.slice(0, 60) : 'kein Klick';`);
  if (ok !== true) console.warn('Tippen', sel, re, '→', ok);
  await warte(nachher);
}
async function schreibe(text, ms = 45) { for (const z of text) { await eingabe(() => cdp.send('Input.insertText', { text: z })); await warte(ms); } }
async function gleite(sel, re, anteil = 0.5, ms = 650) { await js(`const el = __v.finde(${JSON.stringify(sel)}, ${JSON.stringify(re)}); if (el) await __v.gleiten(el, ${anteil}, ${ms}); return 1;`); }

/* Aufnahme: Bildschirmfotos in voller Auflösung, so schnell es geht (ca. 16 je Sekunde). Damit es flüssig wird,
   läuft die Seite während der Aufnahme LANGSAM-mal langsamer (Uhr, Zeitgeber, Animationen); die Zeitstempel werden
   wieder auf Echtzeit umgerechnet – so entstehen rund 60 Bilder je Video-Sekunde. */
const LANGSAM = 4;
let F = 1, laeuft = false, schleife = null;
/* Während ein Bildschirmfoto entsteht, trifft ein Klick die falsche Stelle – Eingaben warten deshalb, bis das Foto fertig ist */
let fotoLaeuft = null, sperre = null;
async function eingabe(fn) {
  let frei; sperre = new Promise((r) => { frei = r; });
  if (fotoLaeuft) await fotoLaeuft;
  try { return await fn(); } finally { sperre = null; frei(); }
}
function warte(ms) { return schlaf(ms * F); }
async function aufnahmeStart() {
  rmSync(BILDER, { recursive: true, force: true }); mkdirSync(BILDER, { recursive: true });
  await cdp.send('Animation.enable').catch(() => {});
  await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 / LANGSAM });
  await js(`__zeitFaktor(${1 / LANGSAM}); return 1;`);
  F = LANGSAM; laeuft = true;
  const t0 = Date.now(), liste = [];
  schleife = (async () => {
    while (laeuft) {
      if (sperre) await sperre;
      const a = Date.now();
      fotoLaeuft = cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92, optimizeForSpeed: true });
      const b = await fotoLaeuft; fotoLaeuft = null;
      const t = ((a + Date.now()) / 2 - t0) / 1000 / LANGSAM;
      const name = `b${String(liste.length).padStart(5, '0')}.jpg`;
      writeFileSync(`${BILDER}/${name}`, Buffer.from(b.data, 'base64'));
      liste.push(`${name} ${Math.max(0, t).toFixed(4)}`);
    }
    return { liste, ende: (Date.now() - t0) / 1000 / LANGSAM };
  })();
  await warte(60);
}
async function aufnahmeEnde() {
  laeuft = false;
  const { liste, ende } = await schleife;
  F = 1;
  await js(`__zeitFaktor(1); return 1;`);
  await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 });
  writeFileSync(`${BILDER}/zeiten.txt`, liste.join('\n') + `\nENDE ${ende.toFixed(4)}\n`);
  console.log(`${liste.length} Bilder für ${ende.toFixed(2)} s Video (${(liste.length / ende).toFixed(1)} je Video-Sekunde)`);
}

/* ---------------- Szenen ---------------- */
async function szene5() {
  // Durchsicht am Stand: eine Frage pro Bildschirm, große Knöpfe, dann zum nächsten Volk
  const stand = await js(`return (await DB.getAll('staende')).find((s) => s.name === 'Heimstand Obstwiese').id`);
  await neuLaden('#/stand/' + stand);
  await js(`const b = __v.finde('#main button', 'Durchsicht am Stand'); await __v.gleiten(b, 0.62, 10); return 1;`);
  await warte(400);
  await aufnahmeStart();
  await warte(900);
  await tippe('#main button', 'Durchsicht am Stand', { nachher: 1000 });
  for (const w of ['^4stark', '^4gut', '^4ruhig', '^ausreichend', '^Nein']) await tippe('#main .sd-opt', w, { nachher: 1000 });
  await warte(500);   // „Fertig – passt das?“ in Ruhe zeigen
  await tippe('#main [data-sd-speichern]', null, { nachher: 1700 });   // → nächstes Volk, Hinweis „Gespeichert“
  await aufnahmeEnde();
}

async function szene6() {
  // Behandlung für den ganzen Stand → Wartezeit als Aufgabe → Unterlagen → Bestandsbuch als PDF
  await neuLaden('#/behandlungen');
  await aufnahmeStart();
  await warte(600);
  await tippe('#main #add', null, { nachher: 600 });
  await tippe('#modal-root #f-standId', null, { nachher: 200 });
  await js(`const s = document.querySelector('#f-standId'); s.value = [...s.options].find((o) => o.text === 'Heimstand Obstwiese').value; s.dispatchEvent(new Event('input', { bubbles: true })); s.dispatchEvent(new Event('change', { bubbles: true })); return 1;`);
  await warte(500);
  await tippe('#modal-root #f-mittel', null, { nachher: 120 });
  await schreibe(MITTEL, 20);
  await warte(200);
  await tippe('#modal-root #f-menge', null, { nachher: 100 });
  await schreibe(MENGE, 80);
  await warte(200);
  await gleite('#modal-root label', 'Wartezeit', 0.72, 650);   // Völker (angehakt) und Wartezeit zeigen
  await warte(300);
  await tippe('#modal-root #f-wartezeitTage', null, { nachher: 100, anteil: 0.72 });
  await schreibe(WARTEZEIT, 80);
  await warte(400);
  await tippe('#modal-root .modal button', '^Speichern$', { nachher: 800 });
  await tippe('#bottomnav [data-route="aufgaben"]', null, { nachher: 1400 });   // Wartezeit-Erinnerung steht in den Aufgaben
  // Unterlagen (in der App unter „Mehr“) – hier als kurzer Schnitt
  await js(`__pdfAbfangen(); Views.meldungen._kat = 'amt'; Views.meldungen._jahr = null; await __v.blende('#/meldungen'); return 1;`);
  await gleite('[data-ul="bestandsbuch"]', null, 0.55, 600);
  await warte(250);
  await tippe('[data-ul="bestandsbuch"] button', '^PDF$', { nachher: 0 });
  await js(`await __pdfZeigen(2.2); return 1;`);
  await warte(900);
  await js(`const c = document.querySelector('#__pdfblatt .seite'); c.style.transformOrigin = '22% 12%'; c.style.transform = 'scale(1.9)'; return 1;`);   // langsam bis zur Spalte „Wartezeit“ heranzoomen
  await warte(2000);
  await aufnahmeEnde();
}

async function szene7() {
  // Ernte → Charge → Abfüllung → Etikett → Marktverkauf → Kassenbuch
  await js(`Views.honig._tab = 'ernten'; return 1;`);
  await neuLaden('#/honig');
  await aufnahmeStart();
  await warte(800);
  await tippe('#main #tabbar button', '^Charge$', { nachher: 950 });
  await tippe('#main #tabbar button', '^Abfüllung$', { nachher: 850 });
  // Etikett: in der App unter Unterlagen → Honig & Verkauf → Honig-Etiketten (kurzer Schnitt)
  await js(`Views.meldungen._kat = 'honig'; __pdfAbfangen();
    await __v.blende('#/meldungen', '[data-ul="honig-etikett"]', () => { const s = document.querySelector('[data-ul="honig-etikett"] select');
      s.value = [...s.options].find((o) => /2026-02 · 500 g/.test(o.text)).value; s.dispatchEvent(new Event('change', { bubbles: true })); }); return 1;`);
  await warte(350);
  await tippe('[data-ul="honig-etikett"] button', '^Öffnen$', { nachher: 850 });
  await tippe('#modal-root .modal button', 'Etiketten-PDF', { nachher: 0 });
  await js(`await __pdfZeigen(); return 1;`);
  await warte(1250);
  // Marktverkauf (kurzer Schnitt): Gläser antippen, kassieren
  await js(`Views.markt._korb = {}; await __v.blende('#/markt'); return 1;`);
  await warte(350);
  await tippe('#main .markt-tile', 'Linde 500 g', { nachher: 380 });
  await tippe('#main .markt-tile', 'Linde 500 g', { nachher: 380 });
  await tippe('#main .markt-tile', 'Raps 500 g', { nachher: 550 });
  await tippe('#main #kassieren', null, { nachher: 650 });
  await tippe('#modal-root .modal button', 'Kassieren', { nachher: 700 });
  // Kassenbuch (kurzer Schnitt): die Einnahme ist schon gebucht
  await js(`await __v.blende('#/kassenbuch'); return 1;`);
  await warte(300);
  await js(`await __v.gleiten(document.querySelector('#main .row'), 0.42, 700); return 1;`);   // erste Buchungen = der Marktverkauf
  await warte(1300);
  await aufnahmeEnde();
}

try {
  await { 5: szene5, 6: szene6, 7: szene7 }[SZENE]();
  const f = await js('return window.__fehler.splice(0)');
  if (f.length) console.warn('Fehler in der Seite:', f);
  await cdp.send('Page.captureScreenshot', { format: 'png' }).then((b) => writeFileSync(`${TMP}/ende-szene${SZENE}.png`, Buffer.from(b.data, 'base64')));
} catch (e) {
  console.error(e);
  await cdp.send('Page.captureScreenshot', { format: 'png' }).then((b) => writeFileSync(`${TMP}/fehler-szene${SZENE}.png`, Buffer.from(b.data, 'base64'))).catch(() => {});
  process.exit(1);
}
mkdirSync(ZIEL, { recursive: true });
const r = spawnSync('swift', [HIER + 'zusammenbauen.swift', BILDER, `${ZIEL}szene${SZENE}.mp4`], { stdio: 'inherit' });
process.exit(r.status || 0);
