# API-Referenz ImkerBuch

Diese Datei beschreibt die **interne Schnittstelle** von `index.html` (v1.48) – also alles,
was ein Modul einem anderen anbietet. Eine Netzwerk-API gibt es nicht: Die App läuft
vollständig lokal, alle Daten liegen in IndexedDB auf dem Gerät.

Verwandte Dokumente: [ARCHITEKTUR.md](ARCHITEKTUR.md) (Aufbau und Warum),
[TESTFAELLE.md](TESTFAELLE.md) (Fallstricke), [FEATURES.md](FEATURES.md) (Funktionsumfang),
[adr/](adr/) (warum etwas so entschieden wurde).

**Regel für alle Änderungen:** `APP_VERSION` hochzählen, `CHANGELOG`-Eintrag ergänzen,
`CACHE` in `service-worker.js` hochzählen, Tests laufen lassen.

---

## Inhalt

1. [Aufbau und Sichtbarkeit](#1-aufbau-und-sichtbarkeit)
2. [Datenhaltung: `DB`](#2-datenhaltung-db)
3. [Datenmodell der Stores](#3-datenmodell-der-stores)
4. [Einstellungen: `S`](#4-einstellungen-s)
5. [Werkzeuge: `U`](#5-werkzeuge-u)
6. [Oberfläche: `UI`](#6-oberfläche-ui)
7. [Routing und Views](#7-routing-und-views)
8. [Sicherung: `Backup`](#8-sicherung-backup)
9. [Ausgabe: `Pdf`, `Xlsx`](#9-ausgabe-pdf-xlsx)
10. [Auswertung: `Reporting` und Prognose](#10-auswertung-reporting-und-prognose)
11. [Bestand und Verbrauch](#11-bestand-und-verbrauch)
12. [Honig: Ernte, Charge, Abfüllung, Verkauf](#12-honig-ernte-charge-abfüllung-verkauf)
13. [Fütterung und Zuckerrechnung](#13-fütterung-und-zuckerrechnung)
14. [Zucht und Königinnen](#14-zucht-und-königinnen)
15. [Rechnungen und Steuer](#15-rechnungen-und-steuer)
16. [Bio und Landbedeckung](#16-bio-und-landbedeckung)
17. [Anhänge, Sprache, Import](#17-anhänge-sprache-import)
18. [Benachrichtigungen: `Notif`](#18-benachrichtigungen-notif)
19. [Externe Dienste](#19-externe-dienste)
20. [Service Worker](#20-service-worker)
21. [Konstanten](#21-konstanten)
22. [Testen und Prüfen](#22-testen-und-prüfen)

---

## 1. Aufbau und Sichtbarkeit

Die App ist **eine einzige Datei**. Modularität entsteht durch Namensräume, nicht durch
ES-Module. Zwei Sichtbarkeitsregeln, die man kennen muss:

- **`function foo() {}` auf oberster Ebene ist automatisch global** – kein Export nötig.
- **`const X = {…}` ist es nicht.** Solche Namen müssen im `Object.assign(window, {…})`-Block
  am Dateiende stehen, sonst sieht die Testsuite sie nicht (`w.X` ist dann `undefined`).

Namensräume (Zeilennummern Stand v1.48):

| Namensraum | Zweck |
| --- | --- |
| `U` | Formatieren, Rechnen, Dateien, Skript-Nachladen |
| `DB` | IndexedDB-Zugriff, Papierkorb |
| `S` | Einstellungen (persistiert im Store `settings`) |
| `UI` | Toast, Modal, Formular, Diagramme, Reiter |
| `Views` | 28 Seiten, je mit `render(main, param)` |
| `Backup` | Export, Import, Snapshots, Auto-Sicherung, Erinnerung |
| `Pdf` / `Xlsx` | Alle Dokumente und die Excel-Mappe |
| `Reporting` | Auswertungen über mehrere Stores |
| `Notif` | Browser-Erinnerungen und ICS-Export |
| `Anhang`, `Sprachnotiz`, `Ocr`, `Voice` | Fotos, Dokumente, Diktat, Texterkennung |
| `Importer`, `PdfImport` | CSV/Excel-Import, PDF-Erkennung |
| `Wetter` | Open-Meteo-Abruf |
| `ISchule` | Imkerschule (Lernstand) |
| `Demo`, `Wizard`, `Splash` | Beispieldaten, Erst-Einrichtung, Startbildschirm |

---

## 2. Datenhaltung: `DB`

IndexedDB-Wrapper. `DB.NAME` ist `imkerbuch`, im Testbetrieb (`?testdb`) `imkerbuch-test`.
Aktuelle Schema-Version: **`DB.VER = 10`**.

```js
await DB.open()                          // Verbindung (idempotent)
await DB.get(store, id)                  // ein Datensatz
await DB.getAll(store)                   // alle Datensätze
await DB.count(store)
await DB.put(store, obj, keepStamp=false) // legt an oder aktualisiert, gibt obj zurück
await DB.bulkPut(store, objs, keepStamp=true)
await DB.del(store, id)                  // endgültig
await DB.clear(store)
await DB.softDel(store, id)              // → Papierkorb (30 Tage)
await DB.trashRestore(trashId)
await DB.purgeTrash()                    // löscht Papierkorb-Einträge > 30 Tage
```

**`put` vergibt automatisch** `id` (UUID) sowie `createdAt` und `lastModified` (ISO).
`keepStamp: true` lässt die Zeitstempel unangetastet – nötig beim Import und beim
Wiederherstellen, sonst gewinnt beim Zusammenführen immer der zuletzt importierte Stand.

**`DB.STORES`** listet alle 31 Stores. **`DB.DATA_STORES`** ist dieselbe Liste ohne
`snapshots` und steuert Export, Import und Snapshot – ein neuer Store wird also
automatisch mitgesichert, sobald er in `STORES` steht.

`STORE_LABELS` übersetzt Store-Namen in deutsche Bezeichnungen (Papierkorb, Import-Bericht).

Hilfsfunktion: `await idMap(store)` liefert eine `Map` von `id` → Datensatz.

### Migrationen

Beim Start laufen datengetriebene Migrationen (kein Schema-Upgrade, sondern Umschreiben
vorhandener Datensätze), jede mit eigener Flag-Einstellung gegen Doppelläufe:

`migriereRaehmchenmass()` · `migriereChargenAbfuellung()` · `migriereInventarTyp()` · `migriereBelegstellen()`

---

## 3. Datenmodell der Stores

Alle Datumsfelder sind ISO-Strings (`YYYY-MM-DD`), Zeitstempel voll-ISO. Jeder Datensatz
trägt zusätzlich `id`, `createdAt`, `lastModified`.

| Store | Felder |
| --- | --- |
| `staende` | `name`, `lat`, `lng`, `notizen`, `kmEntfernung` |
| `voelker` | `name`, `standId`, `koeniginId`, `funktion`, `beutentyp`, `beutenkennung`, `status` (`aktiv`/…), `historie[{datum,text}]`, `notizen` |
| `stockkarten` | `volkId`, `datum`, `volksstaerke`, `brutbild`, `sanftmut`, `futter`, `weiselzellen`, `notiz` (+ frei definierte Zusatzfelder aus `S.stockkartenFelder`) |
| `fuetterungen` | `volkId`, `datum`, `futterart`, `mengeKg`, `winterfutter`, `zuckerKg`, `verbrauchAbzug[]` |
| `gewichte` | `volkId`, `datum`, `gewichtKg` |
| `varroa` | `volkId`, `datum`, `methode`, `milben`, `tageZaehl`, `probeBienen` |
| `koeniginnen` | `kennung`, `jahrgang`, `herkunft`, `linie`, `status`, `mutterId`, `anpaarung`, `belegstelleId`, `vatervolkId`, `bewertung{}`, `serieId`, `historie[{volkId,von,bis}]`, `notiz` |
| `zuchtserien` | `name`, `startdatum`, `anzahl`, `termine[]`, `zuchtmutterId`, `anpaarung`, `belegstelleId`, `vatervolkId`, `angenommen`, `geschluepft`, `begattet`, `notiz` |
| `belegstellen` | `name`, `rasse`, `drohnenlinie`, `ort`, `lat`, `lng`, `betreiber`, `leiterName`, `leiterAdresse`, `notiz` |
| `behandlungen` | `zielTyp` (`volk`/`stand`), `zielId`, `datum`, `mittel`, `menge`, `einheit`, `anwendungsart`, `wartezeitTage`, `notiz`, `verbrauchAbzug[]` |
| `trachten` | `bezeichnung`, `pflanze`, `von`, `bis`, `region`, `standIds[]` |
| `wanderungen` | `vonStandId`, `nachStandId`, `volkIds[]`, `datum`, `grund`, `trachtId`, `notiz` (Altdaten: `vonOrt`/`nachOrt`) |
| `ernten` | `zielTyp`, `zielId`, `datum`, `produktart`, `sorte`, `mengeKg`, `wassergehalt`, `schleuderung`, `trachtId`, `notiz` |
| `chargen` | `losnummer`, `ernteIds[]`, `mengeKg` (Lagerbestand ohne Ernte), `sorte`, `wassergehalt`, `mhd`, `etikettNotiz` |
| `abfuellungen` | `chargeId`, `datum`, `gebindeG`, `anzahl`, `bestand`, `verbrauchAbzug[]` |
| `verkaeufe` | `datum`, `abfuellungId`, `anzahl`, `preisJeGlas`, `betrag`, `kontaktId`, `notiz`, `kassenbuchId` |
| `fahrten` | `datum`, `standId`, `freiZiel`, `zweck`, `km`, `notiz` |
| `kontakte` | `typ` (`kunde`/`lieferant`), `name`, `strasse`, `plz`, `ort`, `email`, `telefon`, `notiz` |
| `kassenbuch` | `datum`, `typ` (`einnahme`/`ausgabe`), `kategorie`, `betrag`, `steuersatz`, `kontaktId`, `beschreibung`, `rechnungId` |
| `rechnungen` | `nummer` (null = Entwurf), `datum`, `kundeId`, `steuerart`, `pauschalsatz`, `status` (`entwurf`/`festgeschrieben`), `qrAufDruck`, `positionen[{text,abfuellungId,menge,einzelpreis,pfand,steuersatz}]`, `rabattWert`, `skonto` |
| `inventar` | `typ` (`inventar`/`verbrauch`), `bezeichnung`, `kategorie`, `stueckzahl`, `einheit`, `packEinheit`, `inhaltMenge`, `preis`, `gebindeG`, `pfand`, `pfandSeit`, `ablauf`, `mindestbestand`, `standId`, `volkId`, `anschaffung`, `notiz` |
| `materialzugaenge` | `inventarId`, `bezeichnung`, `typ`, `kategorie`, `einheit`, `datum`, `art`, `menge`, `preis`, `kontaktId`, `belegNr`, `bestandVorher`, `bestandNachher`, `kassenbuchId`, `notiz` |
| `materialabgaenge` | wie oben, zusätzlich `art` (`Verkauf`/`Verlust`/…), `kaeufer` |
| `pfandbewegungen` | `inventarId`, `bezeichnung`, `datum`, `anzahl`, `kontaktId`, `bestandVorher`, `bestandNachher`, `notiz` |
| `aufgaben` | `titel`, `faellig`, `erledigt`, `quelle`, `refId`, `volkId`, `standId`, `zeitMinuten`, `kategorie`, `notiz` |
| `bioeintraege` | `bereich`, `datum`, `titel`, `frist`, `text`, … |
| `anhaenge` | `parentTyp`, `parentId`, `art` (`foto`/`dokument`/`audio`), `name`, `mime`, `groesse`, `datum`, `dokumentTyp`, `blob`, `transkript` |
| `snapshots` | `datum`, `grund`, `daten` (JSON-String), `groesse` |
| `papierkorb` | `store`, `daten`, `geloeschtAm` |
| `settings` | `key`, `value` (Primärschlüssel ist `key`, nicht `id`) |

---

## 4. Einstellungen: `S`

```js
await S.load()        // beim Start: liest alle Einstellungen in den Speicher
S.get(key)            // gespeicherter Wert, sonst tiefe Kopie des Standardwerts
await S.set(key, value)
```

`S.get` liefert bei fehlendem Wert einen `structuredClone` des Standards – ein zurückgegebenes
Objekt kann also gefahrlos verändert und mit `S.set` zurückgeschrieben werden.

Wichtige Schlüssel:

| Schlüssel | Inhalt |
| --- | --- |
| `profil`, `imkerei` | Name, Anschrift, Betriebsnummer, BG, TSK, Bio-Angaben, `bioLogos[]` |
| `steuer` | `art`: `regel` \| `klein` (§ 19) \| `pauschal24` (§ 24), `pauschalsatz`, `saetze[]` |
| `rechnungskreis` | `{ prefix, next }` – fortlaufende Rechnungsnummer |
| `features` | `ocr`, `whisper`, `wetter`, `autoBackup{aktiv,intervall}`, `backupBeimSchliessen`, `benachrichtigungen` |
| `letzteExterneSicherung`, `letzteAutoSicherung` | Zeitstempel der Sicherungen |
| `backupErinnerung` | `false` blendet den Erinnerungs-Banner dauerhaft aus |
| `persistHintDismissed` | Hinweis auf abgelehnten Dauerspeicher weggeklickt |
| `dashboardWidgets`, `bottomNav` | Zusammenstellung von Startseite und unterer Leiste |
| `stockkartenFelder`, `stockkartenVorlagen` | eigene Durchsicht-Felder und -Vorlagen |
| `honigsorten`, `dokumentTypen`, `taetigkeiten` | pflegbare Vorschlagslisten |
| `kmPauschale`, `strompreis` u. a. | Rechengrundlagen |
| `imkerschule` | `{ level, done{}, onboarded }` |
| `bioBetrieb`, `belegstellenVerzeichnis`, `fahrtvorlagen` | Modul-Einstellungen |

---

## 5. Werkzeuge: `U`

```js
U.uuid()  U.esc(s)  U.todayIso()  U.nowIso()
U.fmtDate(iso)  U.fmtDateTime(iso)  U.fmtNum(n, dec)  U.fmtEur(n)  U.fmtBytes(n)
U.parseNum(s)                    // versteht deutsches Format: "1.234,50" → 1234.5
U.addDays(iso, n)  U.daysBetween(a, b)
U.sortBy(arr, fn, desc)  U.groupBy(arr, fn)  U.sum(arr, fn)  U.debounce(fn, ms)
U.download(blob, name)  U.blobToDataURL(blob)  U.dataURLToBlob(durl)
U.resizeImage(file, maxPx=1600, quality=0.8)
U.loadScript(...urls)            // erste erreichbare Quelle gewinnt (lokal vor CDN)
U.mapsLinks(lat, lng)
```

Zwei Fallen, die die Tests absichern:

- `U.fmtNum` **schneidet nachlaufende Nullen ab**: `U.fmtNum(100, 2)` ergibt `"100"`, nicht `"100,00"`.
- `U.fmtDate` und `U.addDays` rechnen **auf Strings**, nicht über `new Date` – sonst
  verschieben Zeitzonen und Sommerzeit das Datum um einen Tag.

---

## 6. Oberfläche: `UI`

```js
UI.toast(msg, type='ok'|'err')
UI.modal({ title, body, footer, wide, onClose, guardDirty })
await UI.confirm({ title, text, confirmText, danger, requirePhrase })
UI.tabs(tabs, activeId, onChange)
UI.chart({ type:'bars'|'line', labels, series:[{name,values,color}], height, unit })
UI.pie({ posten, einheit, fmt })
const m = UI.formModal({ title, fields, values, onSave, onDelete, saveText, wide })
```

`formModal` gibt ein Objekt mit `el` (Wurzelelement) und `close(force)` zurück; `onSave(werte)`
bekommt die eingesammelten Werte und schließt bei Erfolg selbst.

### Feldtypen

`text` · `number` · `date` · `textarea` · `select` · `check` · `rating` · `multicheck` · `suggest` · `static`

Zusätzliche Feld-Eigenschaften: `key`, `label`, `required`, `default`, `hint`,
`placeholder`, `options` (Array oder Funktion), `keepOrder`, `halb` (halbe Breite),
`showIf(f)` (bedingte Anzeige).

**Zwei Regeln, an denen sich die Tests festhalten:**

1. **Bedingte `halb`-Felder nur paarweise** mit identischem `showIf`, abgeschlossen von einem
   unbedingten Trennfeld (`_trenn…`). Versteckte Felder tragen `.hidden`
   (`display:none !important`) und belegen keine Zelle im zweispaltigen Raster – ein
   einzelnes bedingtes Halbfeld verschiebt sonst die ganze Spalte.
2. **`collect()` überspringt versteckte Felder**: deren Wert wird unverändert übernommen,
   `required` greift dort also nicht.

Weitere Bausteine: `pageHead(title, sub, actions, neben)`, `emptyState(icon, text, btnHtml)`,
`icon(name)`, `iconBunt(name)`, `iconKachel(name)`, `optionenSortiert(opts, string, keepOrder)`,
`bindAdd(fn, root)`, `FormGuard.dirty` (ungespeicherte Änderungen).

---

## 7. Routing und Views

Hash-Routing ohne Bibliothek:

```js
currentRoute()          // → { route, param }   aus "#/volk/<id>"
navTo(route)
await renderRoute()     // tauscht #main gegen einen Klon (löst alte Listener) und rendert
```

Ein View ist ein Objekt mit `title` (String oder Funktion) und `async render(main, param)`.
28 Views: `dashboard`, `staende`, `stand`, `voelker`, `volk`, `koeniginnen`, `zucht`,
`behandlungen`, `fuetterung`, `trachten`, `wanderungen`, `bio`, `honig`, `markt`,
`kassenbuch`, `rechnungen`, `rechnung`, `inventar`, `material`, `aufgaben`, `zeiten`,
`rechner`, `papierkorb`, `meldungen`, `reporting`, `fahrten`, `imkerschule`, `einstellungen`.

`ROUTE_PARENT` bildet Detail-Routen auf ihren Navigationspunkt ab
(`stand → staende`, `volk → voelker`, `rechnung → rechnungen`, `serie → zucht`).

**Wichtig:** `renderRoute()` nie direkt nach dem Setzen von `location.hash` aufrufen – der
`hashchange`-Listener rendert bereits, zwei überlappende Renderläufe verdrahten Handler quer.

### Dashboard-Kacheln

`DASH_WIDGETS[name] = { label, ic, ziel, async html() }`. Jede Kachel liefert fertiges HTML.
`dashBlock(entry)`, `dashAlleEintraege()`, `dashLabel`, `dashIcon`, `dashCfgListe` bedienen
die Zusammenstellung. Jedes Icon einer Kachel muss auch in `ICONS_BUNT` existieren – dafür
gibt es einen eigenen Test.

---

## 8. Sicherung: `Backup`

```js
await Backup.buildData(mitAnhaengen=true)   // { app, formatVersion, exportiert, stores{} }
await Backup.buildBlob()
await Backup.exportDownload()               // „Speichern unter“, sonst Download
await Backup.share()                        // Web Share API, sonst Download + mailto
await Backup.importFile(file)               // fragt Ersetzen oder Zusammenführen
await Backup.applyReplace(data, { blobsBehalten })
await Backup.applyMerge(data)               // jüngeres lastModified gewinnt, keine Dubletten
await Backup.snapshotInternal(grund)        // rollierend 10, ohne Anhang-Blobs
await Backup.restoreSnapshot(id)
```

### Erinnerung und Anzeige

```js
Backup.reminderInfo()      // { tage, stufe: 'ok'|'gelb'(ab 7 T)|'rot'(ab 14 T) }
Backup.updateBanners()     // zeichnet #banners neu
Backup.updateStand()       // zieht die Anzeigen auf den Seiten nach
await Backup.markExternal()// merkt die Sicherung + beides oben
await Backup.erinnerungAus()
backupBadgeHtml()          // gemeinsame Badge für Dashboard und Einstellungen
```

`updateStand()` füllt drei Marker, die eine Seite setzen kann:
`data-backup-stand` (Datum), `data-backup-badge` (farbige Marke), `data-backup-hinweis` (Merksatz).
**Wer eine neue Anzeige des Sicherungsstands baut, setzt einen dieser Marker** – sonst bleibt
sie nach dem Sichern auf dem alten Wert stehen.

### Automatische Sicherung

```js
Backup.naechsteSicherung()   // ISO-Termin oder null
await Backup.runAuto(quelle)
Backup.initAuto()            // Timer + visibilitychange + beforeunload
backupRingHtml() / backupRestText(ms)   // Countdown-Ring in den Einstellungen
```

---

## 9. Ausgabe: `Pdf`, `Xlsx`

`Pdf` baut auf jsPDF + AutoTable (lokal in `libs/`, CDN als Rückfall).

```js
await Pdf.newDoc(titel, untertitel)   // → { doc, y }
Pdf.table(doc, { head, body, startY, widths, margin })
Pdf.finish(doc, dateiname)
await Pdf.bildFuerPdf(quelle, maxPx=512)   // legt jedes Bild auf Weiß, gibt JPEG zurück
await Pdf.logoDataUrl()
```

**`bildFuerPdf` ist Pflicht für jedes Bild.** jsPDF stellt Transparenz **schwarz** dar und kann
kein SVG – die Funktion zeichnet auf weißen Grund und liefert JPEG (mit Cache). Ohne sie
erscheint ein PNG-Logo mit Alphakanal als schwarzer Kasten.

Fertige Dokumente: `bestandsbuch`, `wanderbuch`, `zuchtbuch(serieId)`, `chargenuebersicht`,
`verkaeufe(jahr)`, `inventar(jahr, art, typ, titel)`, `materialAbgaenge(jahr, typ, titel)`,
`honigEtikett(a, c, opts)`, `rechnung(id)`, `bestandsmeldung`, `tierseuchenkasse`,
`bioUnterlagen`, `fuetterungsliste(jahr)`, `fahrtenbuch(jahr)`, `kassenbuchJahr(jahr)`,
`report(typ)` (`voelker` \| `ertrag` \| `behandlungen`), `komplett()`.

Etiketten-Raster: 90 × 54 mm, 2 × 5 auf A4, Ränder 12/14 mm, Abstände 6/3,6 mm.

`Xlsx.exportAll()` schreibt eine Mappe mit 22 Blättern (Stände, Völker, Stockkarten,
Königinnen, Zucht, Behandlungen, Wanderungen, Trachten, Ernten, Chargen, Abfüllungen,
Verkäufe, Fahrten, Kassenbuch, Kontakte, Rechnungen, Inventar, Aufgaben, Fütterungen,
Gewichte, Varroa, Wetter); `Xlsx.exportModule(store, fmt)` einzelne Bereiche als xlsx oder csv.

---

## 10. Auswertung: `Reporting` und Prognose

```js
await Reporting.voelkerEntwicklung()   // { labels, values } – aktive Völker je Jahresende
await Reporting.ertrag(gruppe)         // 'volk' | 'stand' | 'sorte' | 'jahr'
await Reporting.behandlungsUebersicht()
Reporting.fahrtStatistik(fahrten)
Reporting.zeiten(aufgaben)
await Reporting.finanzen()
```

### Ernteprognose

```js
await ernteprognoseBasis()
// → { jahr, voelker, jeVolk, jeVolkMin, jeVolkMax, quelle, historie[],
//     geerntet, erloesJeKg, kgVerkauft, preisQuelle, erloesJahr }
ernteprognoseRechnen(box, ep)   // zeichnet die Kacheln aus den [data-ep]-Feldern
```

Rechenweg: **kg je Volk** ist das Mittel der letzten drei abgeschlossenen Jahre, die Spanne
das schwächste und beste davon. Die Völkerzahl eines Jahres wird zum **30. Juni** aus der
Völker-Historie bestimmt – ein Volk **ohne** Ernte zählt mit, sonst schönt der Schnitt sich
selbst. Der **Erlös je kg** kommt aus `verkaeufe` und aus **festgeschriebenen** Rechnungs-
positionen mit `abfuellungId` (nur dort ist das Gewicht bekannt); beide Quellen überschneiden
sich nicht, weil eine Rechnung keinen Verkauf anlegt. Ohne eigene Historie greift
`ERTRAG_FAUSTZAHL` (38,4 kg, DEBIMO 2010–2024).

Die Karte steht im **Kassenbuch → Auswertung**, dazu gibt es die Dashboard-Kachel `prognose`.

### Selbstkosten

```js
selbstkostenGlas(e)   // → { glaeser, kgJeGlas, posten[], zwischen, wagnis, summe, jeKg }
SELBSTKOSTEN_VORGABE  // Modellwerte der LWG Veitshöchheim
```

Die Fixkosten des Modells hängen an 35 kg je Volk. Mit einem schwachen eigenen Jahr
gerechnet ergäben sich absurde Kilopreise – deshalb belegt die Prognose ihr Kostenfeld mit
dem Modellwert vor, nicht mit dem eigenen Ertrag.

---

## 11. Bestand und Verbrauch

Zwei Arten von Positionen im Store `inventar`, unterschieden über `inventarTyp(i)`:
langlebiges **Inventar** (`INVENTAR_KATEGORIEN`) und **Verbrauchsmaterial**
(`MATERIAL_KATEGORIEN`: Behandlungsmittel, Futter, Gläser/Deckel, Eimer/Hobbock,
Etiketten, Mittelwände, Sonstiges).

```js
await verbrauchAbziehen(inventarId, menge, { pruefen })
await verbrauchAbziehenKette(inventarId, menge, { pruefen })
// → { abzug:[{inventarId,bezeichnung,menge,einheit}], abgezogen, gefehlt, einheit }
await verbrauchZurueckbuchen(abzug, { pruefen })
await verbrauchZugang(inventarId, menge, { pruefen })
abzugAnteil(buchung, n)      // Sammelabzug proportional auf n Datensätze verteilen
```

**Die Kette ist der Normalfall.** Reicht eine Position nicht, greift der Abzug auf die
nächste Position **derselben Art** über (gleicher `inventarTyp`, gleiche Einheit, gleiche
Kategorie), älteste zuerst. Wer abzieht, **merkt sich das Ergebnis als `verbrauchAbzug`
am Datensatz** – nur so kann Löschen zurückgeben und Bearbeiten die Differenz buchen.
Muster beim Bearbeiten: erst zurückgeben, dann neu buchen.

Bewusste Ausnahme: der **Materialabgang** zieht aus genau der gewählten Position ab. Dort
ist die Position Teil des Belegs, `bestandVorher/nachher` hängen daran – eine Kette würde
den Nachweis verfälschen.

Weiter: `materialZugangForm(cfg, vorPositionId, rec)` (ein Formular für „Neue Position“
**und** „Zugang/Einkauf“), `materialAbgangForm`, `pfandRuecknahmeForm`, `lagerBewertung`,
`kasseKategorieFuer(materialKategorie)` (Kopplung ins Kassenbuch),
`preisJeEinheit`, `inPackungen`, `packungText`, `einheitVorschlag`.

---

## 12. Honig: Ernte, Charge, Abfüllung, Verkauf

Kette: **Ernte → Charge (Los) → Abfüllung (Gebinde) → Verkauf/Rechnung**.

```js
chargeRestKg(charge, abfAlle)      // noch nicht abgefüllte kg
chargeAbgefuelltKg(chargeId, abfAlle)
chargeSorten(charge, erntenMap)    // eigene Sorte zuerst, dann die der Ernten
chargeWassergehalt(charge, erntenMap)  // eigener Wert, sonst Mittel der Ernten
honigName(charge, erntenMap)
gebindeLabel(g)  gebindeGrammAus(eingabe)
await verkaufErfassen({ abfuellungId, anzahl, preisJeGlas, kontaktId, datum, notiz })
await verkaufStornieren(verkaufId)
await laborErgebnisUebernehmen(ernteIds, sorte, wassergehalt)
await pruefeMhd()                  // Warnung vor ablaufenden Chargen
```

`verkaufErfassen` prüft den Bestand, mindert die Abfüllung, bucht die Einnahme im
Kassenbuch und legt den Verkauf an. `verkaufStornieren` macht alle drei Schritte rückgängig.
Eine **Rechnung** mindert den Bestand beim Festschreiben direkt und legt **keinen** Verkauf an.

Eine Charge ohne Ernten ist **Lagerbestand vergangener Jahre**: dort tragen `sorte` und
`wassergehalt` an der Charge selbst die Angaben, die sonst aus den Ernten stammen.

---

## 13. Fütterung und Zuckerrechnung

```js
sirupDichte(anteilProzent)         // Nachschlagewerte für Zuckerlösungen
sirupAnsetzen(zuckerKg, wasserL)   // nicht volumenaddierend
wasserFuerVerhaeltnis(zuckerKg, verhaeltnis)   // "3:2 dick" | "1:1 dünn"
futterAusZucker(zuckerKg, minderung=FUTTER_MINDERUNG)   // ×1,2 − 15 %
zuckerFuerFutter(futterKg, minderung)
zuckerAusFuetterung(f)  zuckerAnteilAusFutterart(futterart)
sirupLiterAusFuetterung(f)  literAusZucker(kg, verhaeltnis)
await fuetterungFuerVoelker(volkIds, daten, sammle=null)
await behandlungFuerVoelker(volkIds, daten, sammle=null)
fuetterungsPlanAufgaben(plan, volkIds, alleVoelker)
```

Die Sammelfunktionen legen je Volk einen Datensatz an; über `sammle` (Array) gibt man die
erzeugten Datensätze heraus, um anschließend den Verbrauch anteilig zuzuordnen.

---

## 14. Zucht und Königinnen

```js
zuchtTermine(startdatum)     // Zuchtkalender ab Umlarvtag (Verdeckelung Tag 5)
syncZuchtAufgaben(serie)
await erzeugeToechter(serie, n, jahrgang)
naechsteKennung(jahrgang)    // fortlaufend je Züchterkürzel und Jahr
kennungParse(text)  kennungJahr(j)
koeniginStammbaumHtml(q, qm, tiefe=5, offen)   // beidseitig, bricht Zyklen ab
await setBewertung(queenId, bewertung, datum)
await umweiseln(volkId, queenId, datum)
await koeniginHistorieSync(q)
zuchtNote(b)  queenColor(jahrgang)  zuchtdbQuelle(herkunft)
```

`ZUCHTDB_QUELLEN` verlinkt Pedigree-Register je Rasse. **Es wird nichts ausgelesen oder
übernommen** – nur verlinkt (Datenbankherstellerrecht, EuGH C-304/07).

---

## 15. Rechnungen und Steuer

```js
rechnungSteuerart(r)   // 'regel' | 'klein' | 'pauschal24' (mit Altdaten-Fallback)
rechnungHinweis(r)     // Pflichttext unter dem Betrag
rechnungRabatt(r, waren)
rechnungSummen(r)      // Warenwert, Rabatt, Pfand, USt, Brutto, Skonto-Hinweis
```

Regeln, die in den Tests festgeschrieben sind: **Pfand ist kein Erlös** – er bleibt außerhalb
von Rabatt und Umsatzsteuer. **Skonto wird ausgewiesen, aber nicht abgezogen.** Die
Umsatzsteuer folgt dem Rabatt.

---

## 16. Bio und Landbedeckung

```js
bioAnteile(stand)  bioSummen(anteile)  bioFristStatus(datum)
bioZertText(imk)                 // Kontrollstellen-Code + Verbände fürs Etikett
await landbedeckungErmitteln(lat, lon, radiusM, melde)
```

`landbedeckungErmitteln` ist die **Rückfallkette**: amtlicher Rechendienst
(geoservice.rlp.de, feine Klassen) → BKG/CLC5-WFS → OpenStreetMap/Overpass. Jede Ebene
meldet ihre Quelle mit, damit in der Auswertung steht, woher die Zahlen stammen.
Umkreis-Vorgabe: 3,5 km.

---

## 17. Anhänge, Sprache, Import

```js
await Anhang.list(parentTyp, parentId, arten)
Anhang.section({ parentTyp, parentId, arten, onNotiz, titel })
Sprachnotiz.section({ parentTyp, parentId, onText })
await Ocr.run(blob, onProgress)
await Voice.whisper(blob, onProgress)   // lokal, kein Server
Voice.startLive()                       // Web Speech, wenn verfügbar
await Importer.start(entityKey, file, zone)   // CSV/Excel mit Spalten-Zuordnung
await PdfImport.read(file, outEl)
PdfImport.parse(text)                   // erkennt Behandlung/Ernte an Datum + Stichwort
```

Anhänge hängen über `parentTyp` + `parentId` an jedem Datensatz. Import-Entitäten:
`staende`, `voelker`, `koeniginnen`, `stockkarten`, `behandlungen`, `ernten`, `kontakte`,
`kassenbuch` – jede mit Zielfeldern, Spalten-Aliassen und `build()`.

---

## 18. Benachrichtigungen: `Notif`

```js
Notif.unterstuetzt()  Notif.status()  await Notif.anfordern()
await Notif.zeigen(titel, body, tag, ziel)
Notif.faellige(aufgaben, heute)     // überfällig + heute, ohne erledigte
await Notif.check(erzwingen=false)
Notif.icsFuerAufgaben(aufgaben)     // Kalenderdatei mit Alarm
Notif.badge(n)  Notif.init()
```

Der Klick auf eine Erinnerung wird im Service Worker behandelt (`notificationclick`) und
springt über `data.ziel` in den passenden Bereich.

---

## 19. Externe Dienste

Alles Folgende ist **optional**; ohne Netz funktioniert die App vollständig weiter.

| Dienst | Adresse | Wofür |
| --- | --- | --- |
| Open-Meteo | `api.open-meteo.com` | Wetter am Stand |
| Nominatim | `nominatim.openstreetmap.org` | Adresssuche |
| Overpass | `overpass-api.de` (+2 Spiegel) | Landbedeckung (Rückfall) |
| BKG CLC5 | `sgx.geodatenzentrum.de` | Landbedeckung (Rückfall) |
| GeoService RLP | `geoservice.rlp.de` | amtliche Landbedeckung (erste Wahl) |
| Hugging Face | `huggingface.co` | Whisper-Modell für das Diktat |

Diese Hosts stehen in `BYPASS_HOSTS` des Service Workers und werden **nie** zwischengespeichert.

Bibliotheken (jsPDF, AutoTable, pdf.js, QRCode, SheetJS) liegen unter `libs/` und werden nur
im Notfall vom CDN geholt – `CDN` listet je Bibliothek die Reihenfolge, `U.loadScript` nimmt
die erste erreichbare Quelle.

---

## 20. Service Worker

`service-worker.js`, Cache-Name `imkerbuch-v160`.

| Anfrage | Strategie |
| --- | --- |
| HTML-Seite | **network-first** – online immer die neueste Fassung, offline aus dem Cache |
| übrige App-Dateien | stale-while-revalidate |
| CDN-Bibliotheken | cache-first (Versionen sind unveränderlich) |
| `BYPASS_HOSTS` | network-only |
| `?testdb`, `/tests/`, `?update`, `service-worker.js` | gehen ganz am Cache vorbei |

Bei jeder Veröffentlichung muss `CACHE` hochgezählt werden, sonst behalten Geräte die alten
Nebendateien. Im Testbetrieb lädt sich die App nicht selbst neu (`TEST_MODE`).

---

## 21. Konstanten

| Name | Bedeutung |
| --- | --- |
| `APP_VERSION`, `CHANGELOG` | Version und Änderungsliste (Grundlage des Update-Fensters) |
| `TEST_MODE` | `true` bei `?testdb` – eigene Datenbank, kein Selbstneuladen |
| `INVENTAR_KATEGORIEN`, `MATERIAL_KATEGORIEN`, `VERBRAUCH_KATEGORIEN` | Einteilung der Positionen |
| `BESTAND_EINHEITEN`, `VERBRAUCH_EINHEITEN`, `GEBINDE_PRESETS` | Einheiten und Gebindegrößen |
| `KASSEN_KATEGORIEN`, `MATERIAL_ZU_KASSE` | Kassenbuch-Kategorien und deren Zuordnung |
| `STEUERARTEN`, `ZAHLUNGSZIEL_VORGABE` | Rechnungswesen |
| `VARROA_SCHWELLEN`, `VARROA_METHODEN` | saisonale Befallsgrenzen |
| `ZUCHT_KALENDER`, `QUEEN_COLORS` | Zuchttermine, internationale Jahresfarben |
| `BIENENPRODUKTE`, `MHD_WARN_TAGE` | Produktarten, Vorwarnzeit fürs MHD |
| `FUTTER_FAKTOR`, `FUTTER_MINDERUNG` | Umrechnung Zucker → eingelagertes Futter |
| `ERTRAG_FAUSTZAHL`, `SELBSTKOSTEN_VORGABE` | Grundlagen der Prognose und Kalkulation |
| `KM_PAUSCHALE` | Kilometersatz fürs Fahrtenbuch |
| `BIO_KLASSEN`, `BIO_UMKREIS_VORGABE`, `LB_QUELLEN` | Bio-Auswertung und Datenquellen |
| `LERN_KAPITEL`, `FAQ_THEMEN`, `FAQ_SYNONYME` | Imkerschule |
| `TAGESBIENEN` | 24 Stundenbilder im Kopf der Startseite |
| `ICONS`, `ICONS_BUNT`, `ICON_TON` | monochrome und bunte Symbole samt Kachelton |

---

## 22. Testen und Prüfen

```bash
npm test              # Testsuite kopflos in Chrome, Exit-Code 1 bei Rot
npm run test:coverage # zusätzlich Abdeckung → tools/coverage/report.json
npm run lint:md       # Markdown prüfen
npm run lint:md:fix   # behebbare Formatfehler beheben
npm run check         # beides zusammen (dasselbe wie die CI)
```

`tools/test-run.mjs` startet einen kleinen Dateiserver, öffnet `tests/test.html`
in einem kopflosen Chrome (DevTools-Protokoll, kein Puppeteer) und wartet auf
`window.testErgebnis`. Im Browser geht es weiterhin von Hand: Testseite unter
`tests/test.html` öffnen.

Die Testsuite läuft gegen dieselbe `index.html`, die ausgeliefert wird — geladen in
einem versteckten Rahmen mit `?testdb`, also gegen die getrennte Datenbank
`imkerbuch-test`. Ein Testfall bekommt dieses Fenster als `w` übergeben:

```js
test('Name des Falls', async (w) => {
  assertEq(w.U.parseNum('1.234,50'), 1234.5, 'deutsches Format');
});
```

Helfer: `test`, `assert`, `assertEq` (tiefer Vergleich), `nah` (Zahlen mit Toleranz).

**Abdeckung:** Der Bericht nennt jede benannte Funktion, die nie aufgerufen wurde,
samt Zeilennummer. Er misst Funktionen, nicht Zeilen, und ist als Wegweiser gedacht,
nicht als Zielgröße: Dialoge, die auf eine Nutzereingabe warten, und Funktionen, die
ein Netz brauchen (Landbedeckung, Adresssuche, Update-Prüfung), bleiben bewusst offen.

Die CI (`.github/workflows/ci.yml`) fährt bei jedem Push dieselben Befehle und prüft
zusätzlich, dass `APP_VERSION`, der `CHANGELOG`-Eintrag und die Version in
`package.json` zusammenpassen.
