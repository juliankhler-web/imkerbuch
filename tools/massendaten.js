/* Großbestand für die Belastungsprobe (Julian 21.10.2026: „50 Stände, 300 Völker … Behandlungen usw. alles einmal
   voll, damit ich die PDFs genau testen kann“). Läuft IN der App (Browser-Seite), schreibt in die geöffnete Datenbank.
   Aufruf über tools/massendaten.mjs – erzeugt daraus eine normale Sicherungsdatei zum „Backup importieren“.
   Alle Angaben sind ERFUNDEN (Testbetrieb „Goldwabe“) – keine echten Personen, keine Bankdaten. Zufall mit festem
   Startwert: jeder Lauf ergibt denselben Bestand. Sonderzeichen und lange Texte stecken absichtlich drin. */
async function massendatenErzeugen({ staende: nStaende = 50, voelker: nVoelker = 300, fotos: nFotos = 120 } = {}) {
  const t0 = performance.now();
  let z = 20261021;
  const rnd = () => { z = (z + 0x6D2B79F5) | 0; let t = Math.imul(z ^ (z >>> 15), 1 | z); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const heute = U.todayIso(), Y = +heute.slice(0, 4);
  const ymd = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const tag = (y, m1, m2) => { const m = int(m1, m2); const d = ymd(y, m, int(1, 28)); return d > heute ? U.addDays(heute, -int(1, 20)) : d; };
  const jahre = [Y - 2, Y - 1, Y];
  const ops = [];
  const put = (store, obj) => { obj.id = obj.id || U.uuid(); ops.push({ store, obj }); return obj; };
  const flush = async () => { while (ops.length) await DB.schreibeAlles(ops.splice(0, 1500)); };
  const zaehl = {};
  const zu = (store, obj) => { zaehl[store] = (zaehl[store] || 0) + 1; return put(store, obj); };

  // ---------- Betrieb (erfundene Testangaben) ----------
  await S.set('imkerei', Object.assign({}, S.get('imkerei'), {
    name: 'Imkerei „Goldwabe“ Müller & Söhne – Testbetrieb', strasse: 'Lindenstraße 12a', plz: '85221', ort: 'Dachau-Süd',
    telefon: '08131 000000', email: 'test@goldwabe.invalid', registriernummer: '09 174 000 000 000', bgNummer: 'TEST-BG-0000',
    tskPflicht: 'ja', tskNummer: 'TEST-TSK-0000', bio: 'ja', bioKontrollstelle: 'DE-ÖKO-000 (Test)', bioVerbandJN: 'ja', bioVerband: ['Bioland'],
  }));
  await S.set('profil', Object.assign({}, S.get('profil'), { vorname: 'Jörg' }));

  /* Landbedeckung im Umkreis (Bio) für JEDEN Stand – wie sie die App speichert (stand.bio.anteile). Drei Arten wie im echten
     Betrieb: amtlich berechnet (feine europäische Klassen, lange Namen), eigene Erhebung (Grundklassen) und OpenStreetMap.
     Summe immer genau 100,0 %; dazu Verschmutzungsquellen, Erhebungsdatum, Umkreis und Notiz mit Sonderzeichen. */
  // nur Klassen, die es im Dachauer Land wirklich gibt (keine Reisfelder, Gletscher, Meere …)
  const NICHT_HIER = /Reis|Oliven|Hafen|Flugh|Deponie|Ständig bewässert|Wein|Hartlaub|Strände|Fels|spärlich|Brand|Gletscher|Salz|Salinen|Gezeiten|Lagunen|Mündung|Meere|Land- und forst/;
  const KLASSEN_AMTLICH = [...CLC_KLASSEN.values()].filter(([name]) => !NICHT_HIER.test(name));
  const landbedeckung = (i, lat, lon) => {
    const art = i % 10 < 7 ? 'amtlich' : i % 10 < 9 ? 'eigen' : 'osm';
    const vorrat = art === 'eigen' ? BIO_KLASSEN.map((k) => [k.name, k.art]) : KLASSEN_AMTLICH;
    const n = art === 'eigen' ? vorrat.length : int(6, 13);
    const gewaehlt = [...vorrat].sort(() => rnd() - 0.5).slice(0, n);
    const gew = gewaehlt.map(([, a]) => (a === 'tracht' ? 2 + rnd() * 10 : a === 'bebaut' ? 0.3 + rnd() * 3 : rnd() * 1.5));
    const summe = gew.reduce((x, y) => x + y, 0);
    const anteile = gewaehlt.map(([name, a], k) => ({ name, art: a, prozent: Math.round((gew[k] / summe) * 1000) / 10 }));
    const rest = Math.round((100 - anteile.reduce((x, y) => x + y.prozent, 0)) * 10) / 10;
    anteile.sort((x, y) => y.prozent - x.prozent)[0].prozent = Math.round((anteile[0].prozent + rest) * 10) / 10;   // genau 100,0 %
    return {
      umkreisM: i % 9 === 0 ? pick(BIO_UMKREIS_WAHL) : BIO_UMKREIS_VORGABE,
      erhebung: tag(pick(jahre.slice(-2)), 3, 9),
      quelle: art === 'amtlich' ? GBV_QUELLE_KURZ : art === 'osm' ? 'OpenStreetMap (Overpass), eigene Auswertung' : 'Eigene Erhebung – Begehung mit Kartenblatt 1 : 25.000',
      anteile,
      adresse: pick(DOERFER),
      lat, lon,
      quellen: [...BIO_QUELLEN].sort(() => rnd() - 0.5).slice(0, int(0, 3)),
      notiz: i % 6 === 0 ? 'Raps im Umkreis ≈ 12 ha (konventionell) – Abstand zum Stand > 3 km? Mit Landwirt „Huber“ abgesprochen.' : '',
    };
  };

  // ---------- Stände: 50, rund um Dachau/Oberbayern, ein paar weiter weg ----------
  const ORTE = ['Obstwiese', 'Rapsfeld', 'Lindenallee', 'Waldrand', 'Heidefläche', 'Klostergarten', 'Streuobst', 'Bahndamm', 'Moorweg', 'Sonnenhang', 'Kiesgrube', 'Auwald', 'Hofstelle', 'Weinberg', 'Kleingarten'];
  const DOERFER = ['Dachau', 'Karlsfeld', 'Bergkirchen', 'Röhrmoos', 'Hebertshausen', 'Haimhausen', 'Odelzhausen', 'Altomünster', 'Weichs', 'Markt Indersdorf', 'Schwabhausen', 'Erdweg', 'Petershausen', 'Vierkirchen', 'Fürstenfeldbruck', 'Freising', 'Moosach', 'Gröbenzell', 'Olching', 'Maisach'];
  const staende = [];
  for (let i = 0; i < nStaende; i++) {
    const weit = i >= nStaende - 4;   // vier Stände weit weg: Norddeutschland, Pfalz, Schwarzwald, Ostsee
    const [lat, lng] = weit ? [[53.55, 9.99], [49.35, 8.15], [47.99, 7.84], [54.32, 10.13]][i - (nStaende - 4)] : [48.0 + rnd() * 0.75, 10.95 + rnd() * 1.2];
    const name = i === 0 ? 'Heimstand „Am Bienenhaus“ – hinter der Scheune, Zugang über den Feldweg (Schlüssel beim Nachbarn)' : `${pick(ORTE)} ${pick(DOERFER)}${i % 7 === 0 ? ' Süd/Ost' : ''} ${String(i + 1).padStart(2, '0')}`;
    const la = Math.round(lat * 10000) / 10000, ln = Math.round(lng * 10000) / 10000;
    staende.push(zu('staende', { name, lat: la, lng: ln, kmEntfernung: weit ? int(200, 700) : int(2, 60),
      notizen: i % 5 === 0 ? 'Zufahrt nur bei trockenem Wetter – Schranke ≥ 2,5 m, Code 4711. Grundstück: Fam. Öztürk („Ährenhof“).' : '',
      bio: landbedeckung(i, la, ln) }));
  }

  // ---------- Belegstellen ----------
  const beleg = ['Belegstelle Norderney|Carnica|Carnica Sklenar', 'Belegstelle Baltrum|Buckfast|Buckfast B247', 'Belegstelle Gehlberg|Carnica|Carnica Troiseck', 'Belegstelle Kühtai (Österreich)|Carnica|Carnica Peschetz']
    .map((b) => { const [name, rasse, drohnenlinie] = b.split('|'); return zu('belegstellen', { name, rasse, drohnenlinie, ort: name.replace('Belegstelle ', ''), betreiber: 'Landesverband (Test)', leiterName: 'Erika Mustermann', leiterAdresse: '', notiz: '' }); });

  // ---------- Königinnen + Völker ----------
  const NAMEN = ['Anna', 'Berta', 'Käthe', 'Dörte', 'Elfriede', 'Frieda', 'Gisela', 'Hildegard', 'Inge', 'Jürgen', 'Klärchen', 'Lüdia', 'Margot', 'Nöle', 'Özlem', 'Petra', 'Quirina', 'Rosl', 'Sören', 'Theres', 'Ulla', 'Vroni', 'Wiltrud', 'Xenia', 'Yvonne', 'Zenzi'];
  const LINIEN = ['Carnica Linie T', 'Carnica Troiseck', 'Buckfast B7', 'Buckfast B247', 'Elgon', 'Landbiene'];
  const queens = [];
  const voelker = [];
  for (let i = 0; i < nVoelker + 25; i++) {
    const aktiv = i < nVoelker;
    const jg = int(Y - 3, Y);
    const mutter = queens.length > 10 && rnd() < 0.6 ? pick(queens.filter((q) => q.jahrgang < jg)) : null;
    const q = zu('koeniginnen', { kennung: `GW-${String(jg).slice(-2)}-${String(i + 1).padStart(3, '0')}`, jahrgang: jg, herkunft: pick(VORSCHLAEGE.herkunft), linie: pick(LINIEN),
      status: aktiv ? 'aktiv' : 'umgeweiselt', historie: [], notiz: i % 23 === 0 ? 'Sehr sanftmütig, wabenstet – Zuchtkandidatin (Note ≥ 3,5).' : '', mutterId: mutter ? mutter.id : null,
      anpaarung: pick(['belegstelle', 'standbegattung', 'besamung', '']), belegstelle: '', belegstelleId: null, vatervolkId: null, bewertung: {} });
    if (q.anpaarung === 'belegstelle') { const b = pick(beleg); q.belegstelle = b.name; q.belegstelleId = b.id; }
    if (rnd() < 0.6) {   // Bewertungen nach GdeB (1–3 Termine) – für Königinnen-Liste und Stockkarte
      q.bewertungen = Array.from({ length: int(1, 3) }, (_, k) => {
        const noten = {}; for (const g of GDEB_GRUPPEN) for (const m of g.merkmale) noten[m.key] = int(1, 6);
        return { datum: ymd(Math.min(Y, jg + k), int(5, 9), int(1, 28)), wetter: pick(['sonnig', 'bewölkt', 'windig, 14 °C']), temperatur: int(12, 28), noten, bemerkung: k === 0 ? 'Sanft, wabenstet – sehr gute Frühjahrsentwicklung („Top-Volk“).' : '' };
      }).filter((x) => x.datum <= heute);
      if (q.bewertungen.length) { q.bewertung = q.bewertungen[q.bewertungen.length - 1].noten; q.bewertetAm = q.bewertungen[q.bewertungen.length - 1].datum; }
    }
    queens.push(q);
    const st = staende[i % nStaende];
    const start = ymd(int(Y - 3, Y - 1), int(4, 7), int(1, 28));
    const bt = pick(['Zander', 'Zander', 'Zander', 'Deutsch Normalmaß (DNM)', 'Dadant US 12er', 'Langstroth', 'Mini Plus']);
    const v = zu('voelker', { name: `${pick(NAMEN)} ${String(i + 1).padStart(3, '0')}`, standId: st.id, koeniginId: q.id, beutentyp: bt,
      beutenkennung: `${bt[0]}-${String(i + 1).padStart(3, '0')}`, funktion: rnd() < 0.8 ? 'Wirtschaftsvolk' : pick(VORSCHLAEGE.volksfunktion),
      status: aktiv ? 'aktiv' : pick(['aufgeloest', 'vereinigt']), historie: [{ datum: start, text: 'Volk angelegt' }], notizen: i % 31 === 0 ? 'Neigt zum Schwärmen – Platz geben! (Hinweis vom Vorbesitzer: „ruhig, aber stechfreudig bei Gewitter“)' : '' });
    if (!aktiv) v.historie.push({ datum: tag(Y - 1, 1, 3), text: v.status === 'aufgeloest' ? 'Volk aufgelöst (Winterverlust)' : 'Volk vereinigt' });
    q.historie.push({ volkId: v.id, von: start, bis: aktiv ? null : v.historie[1].datum });
    voelker.push(v);
  }
  const aktive = voelker.filter((v) => v.status === 'aktiv');
  await flush();

  // ---------- Zuchtserien: je Jahr 8, mit Zuchtmutter, Anpaarung und Ergebnissen ----------
  for (let j = Y - 3; j <= Y; j++) for (let k = 0; k < 8; k++) {
    const start = ymd(j, int(5, 7), int(1, 28));
    if (start > heute) continue;
    const zm = pick(queens.filter((q) => q.jahrgang < j)) || queens[0];
    const b = rnd() < 0.5 ? pick(beleg) : null;
    const anzahl = int(12, 40), angenommen = int(Math.round(anzahl * 0.5), anzahl), geschluepft = int(Math.round(angenommen * 0.7), angenommen);
    zu('zuchtserien', { name: `Serie ${j}-${String.fromCharCode(65 + k)} „${pick(LINIEN)}“`, startdatum: start, anzahl, termine: zuchtTermine(start), linie: zm.linie, zuchtmutterId: zm.id,
      anpaarung: b ? 'belegstelle' : pick(['standbegattung', 'besamung']), belegstelle: b ? b.name : '', belegstelleId: b ? b.id : null, vatervolkId: null,
      angenommen, geschluepft, begattet: int(Math.round(geschluepft * 0.6), geschluepft), notiz: k % 3 === 0 ? 'Pflegevolk „Berta“ · Starter/Finisher – Zellen ≥ 24 h nach Umlarven kontrolliert.' : '' });
  }

  // ---------- Trachten (jedes Jahr, je Stand 1–3) ----------
  const TR = ['Raps', 'Linde', 'Robinie', 'Obstblüte', 'Löwenzahn', 'Salweide', 'Kirsche', 'Weißdorn', 'Rosskastanie', 'Heide', 'Sonnenblume', 'Phacelia', 'Wald/Honigtau', 'Edelkastanie', 'Brombeere'];
  const trachten = [];
  for (const st of staende) {
    for (let k = 0; k < int(1, 3); k++) {
      const p = pick(TR), zt = Bluehzeit.zeit(p, st.lat, st.lng, Y);
      trachten.push(zu('trachten', { bezeichnung: rnd() < 0.15 ? `${p} am ${st.name.split(' ')[0]}` : '', pflanze: p, von: zt.von, bis: zt.bis, jaehrlich: true,
        erinnernTage: rnd() < 0.2 ? 7 : 0, region: st.name.split(' ').slice(1, 2).join(''), standIds: [st.id], notiz: rnd() < 0.1 ? 'Ergiebig nur bei > 18 °C – Fläche ≈ 12 ha.' : '' }));
    }
  }

  // ---------- Je Volk und Jahr: Durchsichten, Varroa, Fütterung, Ernte ----------
  const NOTIZ = ['Alle Brutstadien, ruhig.', 'Honigraum füllt sich.', 'Sanft auf der Wabe.', 'Futter kontrolliert, 2 Futterwaben.', 'Weiselzellen gebrochen – Schwarmstimmung beobachten!', 'Drohnenrahmen geschnitten (≈ 80 % verdeckelt).', 'Königin gesehen, gezeichnet (blau).', ''];
  const ernten = [];
  for (const v of voelker) {
    const vonJ = +v.historie[0].datum.slice(0, 4);
    const bisJ = v.status === 'aktiv' ? Y : +v.historie[1].datum.slice(0, 4) - 1;
    for (const j of jahre) {
      if (j < vonJ || j > bisJ) continue;
      for (let k = 0; k < 12; k++) {
        const d = ymd(j, 4 + Math.floor(k / 2), k % 2 ? 18 : 4);
        if (d > heute || d < v.historie[0].datum) continue;
        zu('stockkarten', { volkId: v.id, datum: d, volksstaerke: int(2, 5), brutbild: int(2, 5), sanftmut: int(2, 5), futter: pick(VORSCHLAEGE.futter), weiselzellen: rnd() < 0.08, notiz: pick(NOTIZ) });
      }
      for (let k = 0; k < 5; k++) {
        const d = ymd(j, [3, 5, 7, 8, 10][k], int(2, 26));
        if (d > heute) continue;
        const m = pick(['Bodenschieber (natürlicher Fall)', 'Puderzuckermethode', 'Auswaschmethode (Alkohol)', 'Gemüll (Windel)']);
        zu('varroa', { volkId: v.id, datum: d, methode: m, milben: int(0, k >= 2 ? 45 : 12), tageZaehl: /Boden|Gemüll/.test(m) ? int(3, 7) : 0, probeBienen: /Puder|Auswasch/.test(m) ? 300 : 0 });
      }
      for (const [m, wf] of [[4, false], [8, true], [9, true], [9, true]]) {
        const d = ymd(j, m, int(1, 28)); if (d > heute) continue;
        const art = pick(VORSCHLAEGE.futterart);
        zu('fuetterungen', { volkId: v.id, datum: d, futterart: art, mengeKg: wf ? int(4, 10) : int(1, 3), winterfutter: wf, zuckerKg: /Zuckerwasser/.test(art) ? int(3, 8) : null });
      }
      if (v.funktion === 'Wirtschaftsvolk') for (const [m, sorte] of [[5, 'Frühtracht'], [7, 'Sommertracht']]) {
        const d = ymd(j, m + (rnd() < 0.5 ? 1 : 0), int(1, 28)); if (d > heute) continue;
        const st = staende.find((s) => s.id === v.standId);
        const tr = Tracht.vorschlagErnte(trachten.filter((t) => (t.standIds || []).includes(st.id)), d, st.id);
        const e = zu('ernten', { zielTyp: 'volk', zielId: v.id, schleuderung: m === 5 ? 1 : 2, datum: d, produktart: 'Honig', sorte: tr ? (Tracht.sorteZu(tr, S.get('honigsorten')) || sorte) : sorte,
          mengeKg: Math.round((5 + rnd() * 30) * 10) / 10, wassergehalt: Math.round((16 + rnd() * 3.2) * 10) / 10, trachtId: tr ? tr.id : null, notiz: '' });
        ernten.push(e);
      }
    }
  }
  // Gewichte (Stockwaage an 40 Völkern)
  for (const v of aktive.slice(0, 40)) for (let k = 0; k < 75; k++) zu('gewichte', { volkId: v.id, datum: U.addDays(heute, -k * 4), gewichtKg: Math.round((28 + rnd() * 30) * 10) / 10 });
  await flush();

  // ---------- Behandlungen (Bestandsbuch): Sommer je Volk, Winter je Stand, dazu Thymol ----------
  for (const j of jahre) {
    for (const v of voelker) {
      const d = ymd(j, 8, int(1, 20)); if (d > heute || d < v.historie[0].datum) continue;
      const mittel = pick(['Ameisensäure 60 % ad us. vet.', 'Ameisensäure 85 % ad us. vet.', 'FormicPro/MAQS', 'Thymol (Thymovar)']);
      zu('behandlungen', { zielTyp: 'volk', zielId: v.id, datum: d, mittel, menge: /Thymol/.test(mittel) ? 2 : int(150, 250), einheit: /Thymol/.test(mittel) ? 'Streifen' : 'ml',
        anwendungsart: /Thymol/.test(mittel) ? 'Streifen einhängen' : 'Verdunster (z. B. Nassenheider)', wartezeitTage: 0, notiz: `Ch.-B. ${int(10000, 99999)}/${j} – Bezug: Apotheke „Zum Löwen“` });
    }
    for (const st of staende) {
      const d = ymd(j, 12, int(15, 30)); if (d > heute) continue;
      zu('behandlungen', { zielTyp: 'stand', zielId: st.id, datum: d, mittel: pick(['Oxalsäure 3,5 % (Träufeln)', 'Oxalsäure (Verdampfen)', 'Oxybee']), menge: int(30, 50), einheit: 'ml',
        anwendungsart: pick(['Träufeln', 'Verdampfen/Sublimation']), wartezeitTage: 0, notiz: 'Brutfrei, ≈ 4 °C – Winterbehandlung' });
    }
  }
  await flush();

  // ---------- Kontakte ----------
  const kunden = [], lieferanten = [];
  const FIRMEN = ['Hofladen', 'Café', 'Bioladen', 'Metzgerei', 'Bäckerei', 'Reformhaus', 'Gasthof', 'Weingut', 'Feinkost', 'Dorfladen'];
  for (let i = 0; i < 150; i++) kunden.push(zu('kontakte', { typ: 'kunde', name: i % 3 ? `${pick(FIRMEN)} ${pick(['Müller', 'Schäfer', 'Özdemir', 'Brandstätter', 'Größl', 'Weiß & Söhne', 'Hübner'])} ${i + 1}` : `${pick(['Frau', 'Herr'])} ${pick(['Meyer', 'Köhler', 'Bäumler', 'Strauß'])} ${i + 1}`,
    strasse: `${pick(['Hauptstraße', 'Mühlweg', 'Am Anger', 'Schloßallee'])} ${int(1, 99)}`, plz: String(int(80000, 86999)), ort: pick(DOERFER), email: i % 4 ? `kunde${i + 1}@beispiel.invalid` : '', telefon: i % 3 ? `0151 000 ${String(i + 1).padStart(4, '0')}` : '', notiz: i % 10 === 0 ? 'Zahlt immer bar – nimmt 12 × 500 g/Monat.' : '' }));
  for (let i = 0; i < 30; i++) lieferanten.push(zu('kontakte', { typ: 'lieferant', name: `${pick(['Imkereibedarf', 'Glaswerk', 'Zuckerhandel', 'Holzbau', 'Druckerei'])} ${pick(['Nord', 'Süd', 'Bayern', 'Wabe & Co'])} ${i + 1}`,
    strasse: `Gewerbering ${i + 1}`, plz: String(int(80000, 86999)), ort: pick(DOERFER), email: `bestellung${i + 1}@lieferant.invalid`, telefon: `089 000 ${String(i + 1).padStart(4, '0')}`, notiz: '', ...(i < 8 ? { bio: 'ja', oekoWas: 'Bio-Zucker', oekoNummer: `DE-ÖKO-0${int(10, 99)}`, oekoGueltigBis: ymd(Y + 1, 6, 30) } : {}) }));

  // ---------- Chargen, Abfüllungen, Verkäufe (mit Kassenbuch) ----------
  const hoechstHeute = (d) => (d > heute ? heute : d);
  const abfuellungen = [];
  for (const j of jahre) {
    const jahrErnten = ernten.filter((e) => e.datum.startsWith(String(j)));
    for (let c = 0; c < 15 && jahrErnten.length; c++) {
      const teil = jahrErnten.splice(0, Math.max(1, Math.ceil(jahrErnten.length / (15 - c))));
      const kg = Math.round(teil.reduce((s, e) => s + e.mengeKg, 0) * 10) / 10;
      const datum = hoechstHeute(U.addDays(teil[teil.length - 1].datum, 7));
      const ch = zu('chargen', { losnummer: `${j}-${String(c + 1).padStart(2, '0')}`, datum, ernteIds: teil.map((e) => e.id), mengeKg: kg, etikettNotiz: `${teil[0].sorte} – ${['cremig gerührt', 'flüssig', 'fein kristallin'][c % 3]}` });
      for (const g of [500, 250, 500]) {
        const anzahl = int(40, 160);
        abfuellungen.push(zu('abfuellungen', { chargeId: ch.id, datum: hoechstHeute(U.addDays(datum, int(1, 10))), mhd: ymd(j + 2, 6, 30), gebindeG: g, anzahl, bestand: anzahl, _charge: ch }));
      }
    }
  }
  for (const a of abfuellungen) {
    let rest = a.bestand;
    while (rest > 0 && rnd() < 0.93) {
      const n = Math.min(rest, int(1, 24)), preis = a.gebindeG === 500 ? pick([6.5, 7, 7.5, 8]) : pick([4, 4.5, 5]);
      const datum = hoechstHeute(U.addDays(a.datum, int(1, 300)));   // EIN Zufallswert – vorher zwei, so landeten Verkäufe im Jahr 2027
      const k = rnd() < 0.7 ? pick(kunden) : null, betrag = Math.round(n * preis * 100) / 100;
      const kb = zu('kassenbuch', { datum, typ: 'einnahme', kategorie: 'Honigverkauf', betrag, steuersatz: 0, kontaktId: k ? k.id : null, beschreibung: `Verkauf: ${n} × ${gebindeLabel(a.gebindeG)} (Charge ${a._charge.losnummer})`, rechnungId: null });
      zu('verkaeufe', { datum, abfuellungId: a.id, anzahl: n, preisJeGlas: preis, betrag, kontaktId: k ? k.id : null, notiz: '', kassenbuchId: kb.id, ausBestand: n });
      rest -= n;
    }
    a.bestand = rest; delete a._charge;
  }
  await flush();

  // ---------- Kassenbuch: Ausgaben und sonstige Einnahmen ----------
  const KAT = [['ausgabe', 'Gläser/Etiketten', 19], ['ausgabe', 'Zucker/Futter', 7], ['ausgabe', 'Varroa-Behandlung', 19], ['ausgabe', 'Wachs/Mittelwände', 19], ['ausgabe', 'Standmiete', 0], ['ausgabe', 'Beuten & Material', 19], ['ausgabe', 'Fahrtkosten', 0], ['ausgabe', 'Versicherung/Beiträge', 0], ['einnahme', 'Bestäubungsprämie', 0], ['einnahme', 'Wachsverkauf', 0], ['einnahme', 'Völkerverkauf', 0]];
  for (const j of jahre) for (let i = 0; i < 400; i++) {
    const [typ, kategorie, steuersatz] = pick(KAT);
    zu('kassenbuch', { datum: tag(j, 1, 12), typ, kategorie, betrag: Math.round((5 + rnd() * (typ === 'einnahme' ? 400 : 600)) * 100) / 100, steuersatz, kontaktId: typ === 'ausgabe' && rnd() < 0.5 ? pick(lieferanten).id : null,
      beschreibung: pick(['300 Neutralgläser 500 g „DIB-Optik“', 'Futtersirup 3:2 – 28 kg Kanister', 'Mittelwände Zander (≈ 5 kg)', 'Standmiete Ährenhof', 'Beitrag Imkerverein Dachau e. V.', 'Ameisensäure 85 % ad us. vet. – 1 L', 'Bestäubung Obstplantage Öztürk', '']), rechnungId: null });
  }

  // ---------- Rechnungen ----------
  let nr = 0;
  for (const j of jahre) for (let i = 0; i < 70; i++) {
    const d = tag(j, 1, 12), k = pick(kunden);
    const pos = Array.from({ length: int(1, 5) }, () => { const g = pick([500, 250]); return { text: `${pick(['Rapshonig', 'Lindenblütenhonig', 'Waldhonig', 'Frühtracht cremig', 'Sommertracht „Goldwabe“'])} ${g} g`, menge: int(6, 48), einzelpreis: g === 500 ? 6.5 : 4, steuersatz: 0, abfuellungId: null }; });
    zu('rechnungen', { nummer: `RE-${String(++nr).padStart(4, '0')}`, datum: d, kundeId: k.id, steuerart: 'pauschal24', kleinunternehmer: false, pauschalsatz: 7.8, status: 'festgeschrieben', qrAufDruck: false, positionen: pos, zahlungszielTage: 14 });
  }
  await S.set('rechnungskreis', Object.assign({}, S.get('rechnungskreis'), { prefix: 'RE-', next: nr + 1 }));
  for (let i = 0; i < 4; i++) zu('rechnungen', { nummer: null, datum: U.addDays(heute, -i), kundeId: pick(kunden).id, steuerart: 'pauschal24', kleinunternehmer: false, pauschalsatz: 7.8, status: 'entwurf', qrAufDruck: false, positionen: [{ text: 'Lindenhonig 250 g', menge: 10, einzelpreis: 4.5, steuersatz: 0, abfuellungId: null }] });
  await flush();

  // ---------- Fahrten, Aufgaben, Wanderungen ----------
  for (const j of jahre) for (let i = 0; i < 400; i++) {
    const st = rnd() < 0.85 ? pick(staende) : null;
    zu('fahrten', { datum: tag(j, 3, 10), standId: st ? st.id : null, km: st ? st.kmEntfernung * 2 : int(10, 80), zweck: pick(VORSCHLAEGE.fahrtzweck), freiZiel: st ? '' : pick(['Imkerbedarf Müller', 'Imkerverein – Jahreshauptversammlung', 'Bieneninstitut Kirchhain (Schulung)']), notiz: '' });
  }
  const KAT_ZEIT = ['Durchsicht & Völkerpflege', 'Ernte & Schleudern', 'Abfüllen & Etikettieren', 'Behandlung', 'Wanderung & Transport', 'Verwaltung & Büro', 'Verkauf & Vermarktung', 'Fütterung'];
  for (const j of jahre) for (let i = 0; i < 650; i++) {
    const v = rnd() < 0.5 ? pick(aktive) : null;
    zu('aufgaben', { titel: pick(['Durchsicht Stand', 'Honigräume aufsetzen', 'Varroa-Kontrolle', 'Gläser etikettieren', 'Rechnung schreiben', 'Futter nachfüllen', 'Mittelwände einlöten', 'Wanderung vorbereiten']) + (v ? ` – ${v.name}` : ''),
      faellig: tag(j, 3, 11), erledigt: true, zeitMinuten: int(10, 240), kategorie: pick(KAT_ZEIT), quelle: 'manuell', refId: null, volkId: v ? v.id : null, notiz: '' });
  }
  for (let i = 0; i < 60; i++) zu('aufgaben', { titel: `Offen: ${pick(['Varroa-Kontrolle alle Völker', 'Winterfütterung prüfen', 'Beuten ausbessern', 'Etiketten bestellen', 'Wachs einschmelzen'])} ${i + 1}`,
    faellig: U.addDays(heute, int(1, 90)), uhrzeit: rnd() < 0.3 ? `${String(int(7, 19)).padStart(2, '0')}:${pick(['00', '15', '30', '45'])}` : '', erledigt: false, quelle: 'manuell', refId: null, notiz: '' });
  for (let i = 0; i < 120; i++) {
    const von = pick(staende), nach = pick(staende); if (von === nach) continue;
    const vs = aktive.filter((v) => v.standId === von.id).slice(0, int(1, 6));
    if (!vs.length) continue;
    zu('wanderungen', { vonStandId: von.id, nachStandId: nach.id, volkIds: vs.map((v) => v.id), vonOrt: von.name, nachOrt: nach.name, datum: tag(pick(jahre), 4, 7), grund: pick(['Raps', 'Linde', 'Robinie (Akazie)', 'Waldtracht', 'Belegstelle', 'Rückkehr zum Heimstand']), trachtId: null, notiz: '' });
  }
  await flush();

  // ---------- Inventar, Verbrauchsmaterial, weitere Produkte ----------
  for (let i = 0; i < 120; i++) zu('inventar', { bezeichnung: `${pick(['Zanderbeute komplett', 'Honigschleuder 4 Waben', 'Smoker', 'Abkehrbesen', 'Absperrgitter', 'Entdeckelungsgabel', 'Refraktometer'])} Nr. ${i + 1}`, kategorie: pick(INVENTAR_KATEGORIEN),
    anschaffung: tag(pick(jahre), 1, 12), preis: Math.round((5 + rnd() * 700) * 100) / 100, stueckzahl: int(1, 12), standId: rnd() < 0.3 ? pick(staende).id : null, volkId: null, notiz: '' });
  for (let i = 0; i < 80; i++) {
    const kat = pick(MATERIAL_KATEGORIEN);
    zu('inventar', { typ: 'verbrauch', bezeichnung: `${pick(['Ameisensäure 60 %', 'Oxalsäure Dihydrat', 'Futtersirup', 'Neutralglas 500 g', 'Deckel TO 82', 'Etiketten „Goldwabe“', 'Mittelwände Zander'])} (${i + 1})`, kategorie: kat,
      einheit: kat === 'Mittelwände' ? 'kg' : kat === 'Futter' ? 'kg' : 'Stück', stueckzahl: int(0, 400), mindestbestand: int(0, 50), preis: Math.round(rnd() * 30 * 100) / 100, standId: null, volkId: null, notiz: '' });
  }
  // Zugänge und Abgänge für die Material-Unterlagen
  const verbrauch = ops.filter((o) => o.store === 'inventar' && o.obj.typ === 'verbrauch').map((o) => o.obj);
  for (const pos of verbrauch) for (const j of jahre) {
    const menge = int(5, 100), vorher = int(0, 200);
    zu('materialzugaenge', { inventarId: pos.id, bezeichnung: pos.bezeichnung, typ: 'verbrauch', kategorie: pos.kategorie, einheit: pos.einheit, datum: tag(j, 1, 6), menge, art: 'Einkauf', preis: Math.round(rnd() * 3 * 100) / 100,
      kontaktId: pick(lieferanten).id, belegNr: `LS-${int(1000, 9999)}`, lohn: false, kostenGesamt: null, honigKg: 0, chargeId: null, bestandVorher: vorher, bestandNachher: vorher + menge, notiz: '', kassenbuchId: null });
    const ab = int(1, 40), art = pick(['Verbrauch', 'Verbrauch', 'Verkauf', 'Verlust']);
    zu('materialabgaenge', { inventarId: pos.id, bezeichnung: pos.bezeichnung, typ: 'verbrauch', einheit: pos.einheit, datum: tag(j, 6, 11), menge: ab, art, preis: art === 'Verkauf' ? Math.round(rnd() * 5 * 100) / 100 : 0,
      kontaktId: art === 'Verkauf' ? pick(kunden).id : null, kaeufer: '', belegNr: '', bestandVorher: vorher + 50, bestandNachher: vorher + 50 - ab, notiz: art === 'Verlust' ? 'Glasbruch beim Transport (≈ 3 %)' : '', kassenbuchId: null });
  }
  for (let i = 0; i < 25; i++) zu('inventar', { typ: 'produkt', bezeichnung: `${pick(PRODUKT_KATEGORIEN)} ${i + 1}`, kategorie: pick(PRODUKT_KATEGORIEN), einheit: 'Stück', stueckzahl: int(0, 60), preis: Math.round((3 + rnd() * 25) * 100) / 100, standId: null, volkId: null, notiz: '' });

  // ---------- Wetter: je Stand ein abgerufener Wert an ~300 Tagen ----------
  for (const st of staende) for (let k = 0; k < 300; k++) {
    const d = U.addDays(heute, -k * 3);
    zu('wetter', { standId: st.id, datum: d, tempC: Math.round((-5 + rnd() * 35) * 10) / 10, windKmh: int(0, 40), niederschlagMm: rnd() < 0.7 ? 0 : Math.round(rnd() * 20 * 10) / 10, bemerkung: '', quelle: 'Deutscher Wetterdienst' });
  }
  await flush();

  // ---------- Bio und Hygiene ----------
  const wert = (f, i) => {
    if (f.type === 'date') return tag(pick(jahre), 1, 12);
    if (f.type === 'number') return int(1, 30);
    if (f.type === 'check') return rnd() < 0.8;
    if (f.type === 'select') { const o = typeof f.options === 'function' ? [] : (f.options || []); return o.length ? (o[0].v ?? o[0]) : ''; }
    if (f.type === 'textarea') return i % 4 ? '' : 'Durchgeführt nach Plan; Abweichung: Temperatur ≥ 20 °C, Feuchte ≈ 58 %. Maßnahme: Lüften („Stoßlüften“).';
    return `${f.label.replace(/[?*]/g, '').slice(0, 24)} ${i + 1}`;
  };
  for (const [bereich, def] of Object.entries(BIO_BEREICHE)) {
    const n = bereich === 'hygieneplan' ? 0 : 40;
    for (let i = 0; i < n; i++) {
      const e = { bereich };
      for (const f of def.felder || []) if (f.key && f.type !== 'static') e[f.key] = wert(f, i);
      if (!e.datum) e.datum = tag(pick(jahre), 1, 12);
      zu('bioeintraege', e);
    }
  }
  for (const b of HYGIENE_ASSISTENT_BEREICHE) zu('bioeintraege', { bereich: 'hygieneplan', bereichName: b.bereichName, mittel: b.mittel, haeufigkeit: b.haeufigkeit, verantwortlich: 'Jörg Müller', notiz: '' });
  const vors = { bereiche: {}, geprueftAm: heute, erstelltAm: ymd(Y - 1, 2, 1) };
  for (const b of VORSORGE_BEREICHE) {
    const antworten = {}; for (const f of b.fragen || []) antworten[f.key] = f.default ?? '';
    vors.bereiche[b.key] = { status: 'ja', text: '', antworten };
  }
  // Text so, wie ihn der Assistent aus den Antworten vorschlägt – sonst bliebe das Vorsorgekonzept-PDF leer
  const vctx = await vorsorgeKontext(vors);
  for (const b of VORSORGE_BEREICHE) vors.bereiche[b.key].text = vorsorgeVorschlag(b, vors.bereiche[b.key].antworten, vctx).trim();
  await S.set('bioVorsorge', vors);
  const bb = {};
  for (const [key, def] of Object.entries(BB_ASSISTENT)) {
    const a = {}; for (const f of def.fragen || []) a[f.key] = f.default ?? '';
    try { bb[key] = def.text(a, { name: S.get('imkerei').name, ort: 'Dachau', voelker: aktive.length, staende: nStaende }); } catch (e) { bb[key] = `Abschnitt ${key}: Angaben für den Testbetrieb „Goldwabe“ – ${aktive.length} Völker an ${nStaende} Ständen.`; }
  }
  await S.set('bioBetrieb', bb);
  await flush();

  // ---------- Fotos (an Völkern und Ständen) ----------
  const c = document.createElement('canvas'); c.width = 960; c.height = 720;
  const g = c.getContext('2d');
  for (let i = 0; i < nFotos; i++) {
    const grad = g.createLinearGradient(0, 0, 960, 720); grad.addColorStop(0, `hsl(${int(30, 50)},80%,${int(40, 60)}%)`); grad.addColorStop(1, `hsl(${int(20, 60)},60%,${int(15, 35)}%)`);
    g.fillStyle = grad; g.fillRect(0, 0, 960, 720);
    for (let k = 0; k < 400; k++) { g.fillStyle = `rgba(${int(0, 255)},${int(150, 255)},0,0.25)`; g.beginPath(); g.arc(int(0, 960), int(0, 720), int(4, 30), 0, 7); g.fill(); }
    g.fillStyle = '#fff'; g.font = 'bold 48px sans-serif'; g.fillText(`Testfoto ${i + 1} – Wabe Nr. ${int(1, 10)}`, 40, 680);
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.82));
    const zuVolk = i % 6 !== 0, ziel = zuVolk ? pick(aktive) : pick(staende);
    zu('anhaenge', { parentTyp: zuVolk ? 'volk' : 'stand', parentId: ziel.id, art: 'foto', name: `foto-${i + 1}.jpg`, mime: 'image/jpeg', blob, groesse: blob.size, datum: tag(pick(jahre), 4, 9) + 'T10:00:00.000Z', dokumentTyp: '', text: i % 10 === 0 ? 'Brutbild lückenhaft – Königin prüfen!' : '' });
    if (ops.length >= 30) await flush();
  }
  await flush();
  return { zaehl, sekunden: Math.round((performance.now() - t0) / 100) / 10 };
}
