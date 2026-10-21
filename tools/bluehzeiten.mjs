/* Aufruf: node tools/bluehzeiten.mjs            (holt die Daten neu und schreibt sie in index.html)
           node tools/bluehzeiten.mjs --nur-zeigen (rechnet nur, schreibt nichts)

   Blühbeginn der Trachtpflanzen je Beobachtungsstelle aus den freien Daten des Deutschen Wetterdienstes
   (Phänologie, Jahresmelder: opendata.dwd.de/climate_environment/CDC/observations_germany/phenology).
   Je Stelle der Median der letzten 10 abgeschlossenen Jahre (mindestens 3 Jahre gemeldet, nur Werte mit
   Qualitätsbyte 0–3). Ergebnis: kompakte Tabelle `BLUEHZEITEN` zwischen den Markierungen in index.html –
   die App rechnet daraus für jeden Stand offline aus, wann dort im Schnitt was blüht (v2.83, Julian 21.10.2026:
   „standortbezogen suchen“). Der DWD-Server erlaubt keine Abrufe aus Web-Apps (kein CORS) – darum hier vorab.
   Lizenz: Datenbasis Deutscher Wetterdienst (CC BY 4.0) – Quellenangabe steht in der App. */
import fs from 'node:fs';

const BASIS = 'https://opendata.dwd.de/climate_environment/CDC';
const PHAENO = `${BASIS}/observations_germany/phenology/annual_reporters`;
const JETZT = new Date().getFullYear();
const BIS = JETZT - 1, VON = BIS - 9;             // 10 abgeschlossene Jahre
const QB_OK = new Set(['0', '1', '2', '3']);       // 5 zweifelhaft, 7 ungültig, 8 falsch → weg

/* Welche DWD-Reihe gehört zu welcher Trachtpflanze? kat/datei = Ordner und Dateiname-Teil, objekt/phase = IDs
   (Phase 5 = Blüte Beginn, 7 = Blüte Ende – siehe PH_Beschreibung_Phasendefinition_*.txt). */
const REIHEN = {
  salweide: { kat: 'wild', datei: 'Wildwachsende_Pflanze_Sal-Weide', objekt: 124, phase: 5 },
  loewenzahn: { kat: 'wild', datei: 'Wildwachsende_Pflanze_Loewenzahn', objekt: 120, phase: 5 },
  schlehe: { kat: 'wild', datei: 'Wildwachsende_Pflanze_Schlehe', phase: 5 },
  weissdorn: { kat: 'wild', datei: 'Wildwachsende_Pflanze_Zweigriffliger_Weissdorn', phase: 5 },
  ahorn: { kat: 'wild', datei: 'Wildwachsende_Pflanze_Spitz-Ahorn', phase: 5 },
  rosskastanie: { kat: 'wild', datei: 'Wildwachsende_Pflanze_Rosskastanie', objekt: 122, phase: 5 },
  robinie: { kat: 'wild', datei: 'Wildwachsende_Pflanze_Robinie', objekt: 121, phase: 5 },
  sommerlinde: { kat: 'wild', datei: 'Wildwachsende_Pflanze_Sommer-Linde', objekt: 130, phase: 5 },
  heide: { kat: 'wild', datei: 'Wildwachsende_Pflanze_Heidekraut', objekt: 114, phase: 5 },
  raps: { kat: 'crops', datei: 'Landwirtschaft_Kulturpflanze_Winterraps', objekt: 205, phase: 5 },
  sonnenblume: { kat: 'crops', datei: 'Landwirtschaft_Kulturpflanze_Sonnenblume', objekt: 209, phase: 5 },
  // Winter-Linde und „Apfel“ (310) meldet der DWD seit 2016 nicht mehr; die Sorten „frühe Reife“ haben die meisten Stellen
  kirsche: { kat: 'fruit', datei: 'Obst_Suesskirsche_fruehe_Reife', objekt: 331, phase: 5 },
  kirscheEnde: { kat: 'fruit', datei: 'Obst_Suesskirsche_fruehe_Reife', objekt: 331, phase: 7 },
  apfel: { kat: 'fruit', datei: 'Obst_Apfel_fruehe_Reife', objekt: 311, phase: 5 },
  apfelEnde: { kat: 'fruit', datei: 'Obst_Apfel_fruehe_Reife', objekt: 311, phase: 7 },
};

const latin1 = new TextDecoder('latin1');
async function hole(url) {
  for (let v = 1; v <= 3; v++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return latin1.decode(await r.arrayBuffer());
    } catch (e) { if (v === 3) throw new Error(`${url}: ${e.message}`); await new Promise((r) => setTimeout(r, 2000 * v)); }
  }
}
async function dateien(ordner) {
  const html = await hole(ordner);
  return [...html.matchAll(/href="([^"]+\.txt)"/g)].map((m) => m[1]);
}
const zeilen = (text) => text.split(/\r?\n/).slice(1).map((z) => z.split(';').map((x) => x.trim())).filter((z) => z.length > 7 && /^\d+$/.test(z[0]));

// Stationen: ID → [Breite, Länge]
const stationen = new Map();
for (const z of zeilen(await hole(`${BASIS}/help/PH_Beschreibung_Phaenologie_Stationen_Jahresmelder.txt`))) {
  const lat = parseFloat(z[2]), lng = parseFloat(z[3]);
  if (Number.isFinite(lat) && Number.isFinite(lng)) stationen.set(String(+z[0]), [Math.round(lat * 1000) / 1000, Math.round(lng * 1000) / 1000]);
}
console.log(`Stationen: ${stationen.size}`);

const dateiCache = new Map();
async function reihe(r) {
  const schluessel = `${r.kat}/${r.datei}`;
  if (!dateiCache.has(schluessel)) {
    const akt = (await dateien(`${PHAENO}/${r.kat}/recent/`)).find((d) => d === `PH_Jahresmelder_${r.datei}_akt.txt`);
    // genau diese Reihe: „Suesskirsche_1929_2024_hist“, nicht „Suesskirsche_fruehe_Reife_…“
    const hist = (await dateien(`${PHAENO}/${r.kat}/historical/`)).filter((d) => new RegExp(`^PH_Jahresmelder_${r.datei}_\\d{4}_\\d{4}_hist\\.txt$`).test(d))
      .sort((a, b) => +a.match(/_(\d{4})_hist/)[1] - +b.match(/_(\d{4})_hist/)[1]).pop();
    if (!akt || !hist) throw new Error(`Datei fehlt für ${r.datei} (akt: ${akt}, hist: ${hist})`);
    const texte = [await hole(`${PHAENO}/${r.kat}/historical/${hist}`), await hole(`${PHAENO}/${r.kat}/recent/${akt}`)];
    dateiCache.set(schluessel, texte.flatMap(zeilen));
  }
  // je Station und Jahr nur ein Wert (aktuelle Datei überschreibt die historische)
  const jeStation = new Map();
  for (const z of dateiCache.get(schluessel)) {
    const [st, jahr, , objekt, phase, , qb, jultag] = z;
    if (+phase !== r.phase || (r.objekt && +objekt !== r.objekt) || !QB_OK.has(qb)) continue;
    if (+jahr < VON || +jahr > BIS || !(+jultag > 0 && +jultag < 367)) continue;
    const id = String(+st);
    if (!stationen.has(id)) continue;
    if (!jeStation.has(id)) jeStation.set(id, new Map());
    jeStation.get(id).set(+jahr, +jultag);
  }
  const median = (a) => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); };
  const werte = new Map();
  for (const [id, jahre] of jeStation) if (jahre.size >= 3) werte.set(id, median(jahre.values()));
  return { werte, deutschland: werte.size ? median(werte.values()) : null };
}

const ergebnis = {};
for (const [k, r] of Object.entries(REIHEN)) {
  ergebnis[k] = await reihe(r);
  console.log(`${k.padEnd(13)} ${String(ergebnis[k].werte.size).padStart(4)} Stellen · Deutschland-Median Tag ${ergebnis[k].deutschland}`);
}

// Nur Stationen behalten, die irgendwo einen Wert haben; Werte als Zahlenfolge je Pflanze (0 = kein Wert)
const genutzt = [...stationen.keys()].filter((id) => Object.values(ergebnis).some((e) => e.werte.has(id)));
const daten = {
  quelle: 'Deutscher Wetterdienst, Phänologie (Jahresmelder), CC BY 4.0',
  jahre: `${VON}–${BIS}`,
  orte: genutzt.map((id) => stationen.get(id).join(',')).join(';'),
  reihen: Object.fromEntries(Object.entries(ergebnis).map(([k, e]) => [k, { de: e.deutschland, tage: genutzt.map((id) => e.werte.get(id) || 0).join(',').replace(/(^|,)0(?=,|$)/g, '$1') }])),
};
const js = `const BLUEHZEITEN = ${JSON.stringify(daten)};`;
console.log(`Genutzte Stellen: ${genutzt.length} · Größe: ${Math.round(js.length / 1024)} KB`);

if (!process.argv.includes('--nur-zeigen')) {
  const pfad = new URL('../index.html', import.meta.url);
  const html = fs.readFileSync(pfad, 'utf8');
  const re = /(\/\* BLUEHZEITEN-ANFANG[^\n]*\n)[\s\S]*?(\n\/\* BLUEHZEITEN-ENDE \*\/)/;
  if (!re.test(html)) throw new Error('Markierungen BLUEHZEITEN-ANFANG/-ENDE fehlen in index.html');
  fs.writeFileSync(pfad, html.replace(re, `$1${js}$2`));
  console.log('→ in index.html eingetragen');
}
