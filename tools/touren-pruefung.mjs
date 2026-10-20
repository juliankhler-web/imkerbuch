/* Aufruf: PLAYWRIGHT_MODULE=<…>/playwright/index.mjs node tools/touren-pruefung.mjs   (Vorschau-Server auf Port 8931; ALT=1 = Gegenprobe mit der alten Platzierung vor v2.73) */
// Prüft jede Imme-Führung im iPhone-Format (WebKit) mit nachgebildeter Kamera-Aussparung (59 px oben, 34 px unten):
// Steht jede Sprechblase im sichtbaren Bereich (unter der Aussparung, über der unteren Leiste) und verdeckt sie ihr Ziel nicht?
const pw = await import(process.env.PLAYWRIGHT_MODULE);
const { webkit, devices } = pw.default || pw;
const BASIS = process.env.BASIS || 'http://localhost:8931/index.html?testmodus=1';
const b = await webkit.launch();
const ctx = await b.newContext({ ...devices['iPhone 15 Pro'] });
const p = await ctx.newPage();
const fehlerJs = [];
p.on('pageerror', (e) => fehlerJs.push(e.message));
await p.goto(BASIS);
await p.waitForTimeout(2500);
await p.evaluate(async () => {
  document.querySelectorAll('.modal-back').forEach((m) => m.remove());
  await S.set('wizardDone', true, { auto: true });
  await S.set('einfuehrung', { erledigt: true, schritt: 0, abgelehnt: true }, { auto: true });
  await Demo.reset();
  Assistent.sicherRand = () => ({ oben: 59, rechts: 0, unten: 34, links: 0 });
});
if (process.env.ALT) await p.evaluate(() => { Assistent.tipSetzen = (el, tip) => { const r = el.getBoundingClientRect(); const oben = r.top > 190; tip.style.left = (innerWidth <= 700 ? 12 : Math.max(8, Math.min(innerWidth - tip.offsetWidth - 8, r.left + r.width / 2 - tip.offsetWidth / 2))) + 'px'; tip.style.top = (oben ? Math.max(8, r.top - tip.offsetHeight - 12) : Math.min(innerHeight - tip.offsetHeight - 90, r.bottom + 12)) + 'px'; }; });
await p.waitForTimeout(800);
const touren = await p.evaluate(() => APP_WISSEN.filter((e) => e.tour).map((e) => e.id));
const extra = await p.evaluate(() => Einfuehrung.KAPITEL[0].eintrag ? ['__umschauen'] : []);
const befunde = [];
let geprueft = 0;
for (const id of [...extra, ...touren]) {
  await p.evaluate(async (id) => {
    Assistent.beendeTour(true);
    document.querySelectorAll('.modal-back').forEach((m) => m.remove());
    location.hash = '#/dashboard'; await new Promise((r) => setTimeout(r, 300));
    const e = id === '__umschauen' ? Object.assign({}, Einfuehrung.KAPITEL[0].eintrag, { titel: 'Kurz umschauen' }) : APP_WISSEN.find((x) => x.id === id);
    Assistent.starteTour(e);
  }, id);
  for (let schritt = 0; schritt < 14; schritt++) {
    // auf Sprechblase warten (Platzierung läuft nach 380 und 900 ms)
    let da = false;
    for (let i = 0; i < 30 && !da; i++) { await p.waitForTimeout(200); da = await p.evaluate(() => !!document.querySelector('.bini-tip') && !!Assistent.tour); }
    if (!da) break;
    await p.waitForTimeout(1100);
    const m = await p.evaluate(() => {
      const tip = document.querySelector('.bini-tip'), ziel = document.querySelector('.bini-ziel');
      const t = tip.getBoundingClientRect(), z = ziel ? ziel.getBoundingClientRect() : null;
      const T = Assistent.tour; const st = T && T.e.tour[T.i];
      const typ = st ? Object.keys(st).find((k) => ['knopf', 'reiter', 'feld', 'speichern', 'abschluss', 'abschnitt'].includes(k)) : '?';
      const bn = document.getElementById('bottomnav'); const leiste = bn && getComputedStyle(bn).display !== 'none' ? bn.getBoundingClientRect().top : innerHeight;
      const ueber = z ? Math.max(0, Math.min(t.bottom, z.bottom) - Math.max(t.top, z.top)) * (Math.min(t.right, z.right) > Math.max(t.left, z.left) ? 1 : 0) : 0;
      return { typ, i: T ? T.i : -1, t: { top: t.top, bottom: t.bottom, left: t.left, right: t.right, h: t.height }, z: z && { top: z.top, bottom: z.bottom, h: z.height }, H: innerHeight, W: innerWidth, leiste, ueber, scrollH: tip.scrollHeight, clientH: tip.clientHeight,
        // Honig-Rahmen außen, obwohl ein Behälter ihn abschneidet? (dann blieben nur die Ecken sichtbar)
        rahmenWeg: !!ziel && getComputedStyle(ziel).outlineOffset !== '-3px' && Assistent.rahmenGeschnitten(ziel) };
    });
    geprueft++;
    const probleme = [];
    if (m.t.top < 59 + 8 - 0.5) probleme.push(`oben unter der Aussparung (top ${Math.round(m.t.top)})`);
    if (m.t.bottom > m.H - 34 + 0.5) probleme.push(`unten aus dem Bild (bottom ${Math.round(m.t.bottom)} von ${m.H})`);
    if (m.t.left < 0 || m.t.right > m.W) probleme.push('seitlich aus dem Bild');
    if (m.z) {
      const frei = Math.max(m.z.top - 12 - 67, (Math.min(m.leiste, m.H - 34) - 8) - (m.z.bottom + 12));
      if (m.ueber > 1 && frei >= m.t.h) probleme.push(`verdeckt ihr Ziel um ${Math.round(m.ueber)} px, obwohl Platz wäre`);
      if (m.z.bottom < 59 || m.z.top > m.H) probleme.push('Ziel nicht im Bild');
    }
    if (m.scrollH > m.clientH + 1) probleme.push('Sprechblase muss scrollen');
    if (m.rahmenWeg) probleme.push('Honig-Rahmen wird abgeschnitten (nur Ecken sichtbar)');
    if (probleme.length) befunde.push(`${id} · Schritt ${m.i + 1} (${m.typ}): ${probleme.join('; ')}`);
    // weiter: „Weiter“ falls da, sonst Ziel antippen; bei Speichern/Abschluss Ende
    if (m.typ === 'speichern' || m.typ === 'abschluss') break;
    const ok = await p.evaluate(() => {
      const wb = document.querySelector('.bini-tip [data-weiter]');
      if (wb) { wb.click(); return 'weiter'; }
      const z = document.querySelector('.bini-ziel'); if (z) { z.click(); return 'ziel'; }
      return null;
    });
    if (!ok) break;
    await p.waitForTimeout(700);
  }
}
console.log(`Geprüfte Sprechblasen: ${geprueft} in ${extra.length + touren.length} Führungen`);
console.log(befunde.length ? 'BEFUNDE:\n' + befunde.join('\n') : 'Keine Befunde.');
if (fehlerJs.length) console.log('JS-Fehler:\n' + [...new Set(fehlerJs)].join('\n'));
await b.close();
