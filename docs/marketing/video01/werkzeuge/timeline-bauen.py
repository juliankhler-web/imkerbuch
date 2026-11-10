#!/usr/bin/env python3
"""Baut die Zeitpläne (JSON) für Folge 1 und die drei Kurzclips aus einer Satz-Zeitliste.

Aufruf (aus beliebigem Ordner):
    python3 -I docs/marketing/video01/werkzeuge/timeline-bauen.py \
        --saetze /pfad/saetze.json --ton /pfad/sprecher.wav [--rendern]

saetze.json: Liste [{"nr": 1, "satz": "...", "dauer": 0.65, "pause": 0.55}, ...] in Sprechreihenfolge.
  Satz i beginnt im Ton bei der Summe von (dauer + pause) aller vorigen Sätze.
  Optional je Satz "start" (Sekunden im Ton) - dann zählt dieser Wert.
--ton: die ganze Sprecherdatei (WAV; MP3/M4A wird mit afconvert umgewandelt).

Schreibt nach docs/marketing/video01/:
    timeline-16x9.json, timeline-kurz1.json, timeline-kurz2.json, timeline-kurz3.json
    ton/sprecher-16x9.wav (ganzer Ton, auf -1 dBFS gebracht), ton/kurz1.wav ... kurz3.wav (geschnitten)
Mit --rendern werden danach alle vier Videos gerendert (render.swift wird bei Bedarf übersetzt).

Neue Stimme (z. B. ElevenLabs): nur saetze.json und Tondatei austauschen und das Skript neu laufen lassen.
Die Szenen, Bildausschnitte und Abschnitte der Bildschirmaufnahmen stehen unten in SZENEN und KURZ.
Nur Python-Standardbibliothek (wave, json, struct, array).
"""
import argparse
import array
import json
import math
import os
import struct
import subprocess
import sys
import wave

HIER = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.dirname(HIER)                      # docs/marketing/video01
TMP = "/private/tmp/claude-501/video01-tmp"

VORLAUF = 0.15        # Szene beginnt so viel vor ihrem ersten Satz
ENDE_HALTEN = 2.5     # Endkarte steht so lange nach dem letzten Wort
UEBER_SZENE = 0.45    # Überblendung zwischen Szenen
UEBER_ABSCHNITT = 0.3 # Überblendung zwischen Abschnitten derselben Aufnahme

# ---------------------------------------------------------------------------
# Szenen. Bild-Szenen: Ken-Burns-Werte für 16:9 ("q") und 9:16 ("h").
# Video-Szenen: Abschnitte der Aufnahme [von, bis] in Sekunden; "anker": Nummer des Satzes,
# mit dem dieser Abschnitt beginnen soll (sonst wird die Zeit nach Länge verteilt).
# "gewicht" > 1: Abschnitt bekommt anteilig mehr Zeit (läuft langsamer), z. B. für kurze Lese-Momente.
# Die Abschnitte meiden die kurzen weißen Übergangsbilder in den Aufnahmen.
# ---------------------------------------------------------------------------
SZENEN = {
    1: {"saetze": [1, 2], "typ": "bild", "datei": "../bilder/probe-szene1-flux-c.png",
        "q": {"zoom_start": 1.0, "zoom_ende": 1.08, "fokus_x": 0.42, "fokus_y": 0.45, "pan_x": 0.02},
        "h": {"zoom_start": 1.0, "zoom_ende": 1.05, "fokus_x": 0.36, "fokus_y": 0.35}},
    2: {"saetze": [3], "typ": "bild", "datei": "../bilder/szene2-zettelchaos.png",
        "q": {"zoom_start": 1.08, "zoom_ende": 1.0, "fokus_x": 0.5, "fokus_y": 0.55},
        "h": {"zoom_start": 1.05, "zoom_ende": 1.0, "fokus_x": 0.52, "fokus_y": 0.5}},
    3: {"saetze": [4], "typ": "bild", "datei": "../bilder/szene3-sorgen.png",
        "q": {"zoom_start": 1.0, "zoom_ende": 1.06, "fokus_x": 0.5, "fokus_y": 0.35},
        # hochkant: langsamer Schwenk von der linken Sprechblase (Wartezeit) zur rechten (Honigglas)
        # (kleiner Schwenk, damit Annas Gesicht im Bild bleibt)
        "h": {"zoom_start": 1.0, "zoom_ende": 1.0, "fokus_x": 0.51, "fokus_y": 0.5, "pan_x": 0.22}},
    4: {"saetze": [5], "typ": "bild", "datei": "../bilder/szene4-handy.png",
        "q": {"zoom_start": 1.0, "zoom_ende": 1.12, "fokus_x": 0.5, "fokus_y": 0.5},
        "h": {"zoom_start": 1.0, "zoom_ende": 1.08, "fokus_x": 0.5, "fokus_y": 0.5}},
    5: {"saetze": [6, 7], "typ": "video", "datei": "aufnahmen/szene5.mp4",
        "hintergrund_bild": "../bilder/probe-szene1-flux-c.png",
        "abschnitte": [{"von": 0.9, "bis": 10.1}]},
    6: {"saetze": [8, 9], "typ": "video", "datei": "aufnahmen/szene6.mp4",
        "hintergrund_bild": "../bilder/szene3-sorgen.png",
        "abschnitte": [{"von": 0.7, "bis": 6.27},                # Behandlung für den ganzen Stand
                       {"von": 8.5, "bis": 9.52, "anker": 9, "gewicht": 1.5},  # Aufgabe "Wartezeit endet"
                       {"von": 10.03, "bis": 14.13}]},            # Unterlagen -> Bestandsbuch-PDF
    7: {"saetze": [10], "typ": "video", "datei": "aufnahmen/szene7.mp4",
        "hintergrund_bild": "../bilder/szene4-handy.png",
        # weiße/halb aufgebaute Bilder in der Aufnahme: 2.93-3.40, 6.80-7.83, 10.50-10.70 s
        "abschnitte": [{"von": 0.9, "bis": 2.9},     # Ernte -> Charge -> Abfüllung
                       {"von": 3.9, "bis": 6.77},    # Honig-Etikett -> Etiketten-PDF
                       {"von": 7.87, "bis": 10.45},  # Marktverkauf, Kassieren
                       {"von": 12.3, "bis": 14.13}]},  # Kassenbuch
    8: {"saetze": [11, 12], "typ": "bild", "datei": "../bilder/szene8-privat.png",
        "q": {"zoom_start": 1.06, "zoom_ende": 1.0, "fokus_x": 0.55, "fokus_y": 0.45},
        "h": {"zoom_start": 1.05, "zoom_ende": 1.0, "fokus_x": 0.62, "fokus_y": 0.5}},
    9: {"saetze": [13, 14], "typ": "karte", "q_datei": "endkarte-16x9.png", "h_datei": "endkarte-9x16.png"},
}

# Kurzclips (hochkant). Je Block: Szene, Sätze, optional "tempo" (für Aufnahmen, Standard 1.0),
# "sprech_start" (erster Satz so viele Sekunden nach Blockbeginn), "abschnitte" (statt der Szenen-Abschnitte).
KURZ = {
    "kurz1": {"titel": "titel/kurz1-titel.png", "titel_text": "Nie wieder|nasse Stockkarten", "ausgabe": "kurz1-stockkarten-9x16.mp4",
              "bloecke": [{"szene": 1, "saetze": [1, 2]},
                          {"szene": 2, "saetze": [3]},
                          {"szene": 5, "saetze": [6, 7], "tempo": 1.0},
                          {"szene": 9, "saetze": [14]}]},
    "kurz2": {"titel": "titel/kurz2-titel.png", "titel_text": "Wartezeit vergessen?|Nicht mehr.", "ausgabe": "kurz2-wartezeit-9x16.mp4",
              "bloecke": [{"szene": 3, "saetze": [4]},
                          {"szene": 6, "saetze": [8, 9], "tempo": 1.0},
                          {"szene": 9, "saetze": [13, 14]}]},
    "kurz3": {"titel": "titel/kurz3-titel.png", "titel_text": "Vom Stand bis|zum Honigglas", "ausgabe": "kurz3-honigglas-9x16.mp4",
              "bloecke": [{"szene": 7, "saetze": [10], "tempo": 0.85, "sprech_start": 1.7,
                           "abschnitte": [{"von": 0.0, "bis": 2.9}, {"von": 3.9, "bis": 6.77},
                                          {"von": 7.87, "bis": 10.45}, {"von": 12.3, "bis": 14.13}]},
                          {"szene": 9, "saetze": [13, 14], "halten": 3.0}]},
}
TITEL_DAUER = 2.3
TITEL_OBEN = 0.55     # Oberkante der Titelkarte (Anteil der Bildhöhe): unter Annas Gesicht, über der Reels-Leiste


def baue_titel():
    """Zeichnet die Titelbilder mit titel.swift (wird bei Bedarf übersetzt)."""
    prog = os.path.join(TMP, "titel")
    quelle = os.path.join(HIER, "titel.swift")
    if not os.path.exists(prog) or os.path.getmtime(prog) < os.path.getmtime(quelle):
        subprocess.run(["swiftc", "-O", quelle, "-o", prog], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for cfg in KURZ.values():
        ziel = os.path.join(VIDEO, cfg["titel"])
        os.makedirs(os.path.dirname(ziel), exist_ok=True)
        subprocess.run([prog, cfg["titel_text"], ziel, "1080", "1920", str(TITEL_OBEN)], check=True,
                       stdout=subprocess.DEVNULL)


# ---------------------------------------------------------------------------
# Ton lesen/schreiben
# ---------------------------------------------------------------------------
def lies_wav(pfad):
    """Gibt (Mono-Werte als float -1..1, Abtastrate) zurück. Liest PCM 16/24/32 und Float 32/64,
    auch WAVE_FORMAT_EXTENSIBLE (afconvert)."""
    with open(pfad, "rb") as f:
        d = f.read()
    if d[0:4] != b"RIFF" or d[8:12] != b"WAVE":
        sys.exit("Keine WAV-Datei: %s" % pfad)
    pos, fmt, roh = 12, None, None
    while pos + 8 <= len(d):
        cid = d[pos:pos + 4]
        n = struct.unpack("<I", d[pos + 4:pos + 8])[0]
        if cid == b"fmt ":
            fmt = d[pos + 8:pos + 8 + n]
        elif cid == b"data":
            roh = d[pos + 8:pos + 8 + n]
        pos += 8 + n + (n & 1)
    tag, kanaele, rate = struct.unpack("<HHI", fmt[0:8])
    bits = struct.unpack("<H", fmt[14:16])[0]
    if tag == 0xFFFE:
        tag = struct.unpack("<H", fmt[24:26])[0]
    b = bits // 8
    roh = roh[:len(roh) - len(roh) % (b * kanaele)]
    if tag == 3:
        w = array.array("f" if b == 4 else "d"); w.frombytes(roh); voll = 1.0
    elif tag == 1 and b == 2:
        w = array.array("h"); w.frombytes(roh); voll = 32768.0
    elif tag == 1 and b == 4:
        w = array.array("i"); w.frombytes(roh); voll = 2147483648.0
    elif tag == 1 and b == 3:
        w = array.array("i", [int.from_bytes(roh[i:i + 3], "little", signed=True) for i in range(0, len(roh), 3)])
        voll = 8388608.0
    else:
        sys.exit("WAV-Format nicht unterstützt (tag %d, %d bit)" % (tag, bits))
    if sys.byteorder == "big":
        w.byteswap()
    if kanaele == 1:
        mono = [v / voll for v in w]
    else:
        mono = [sum(w[i:i + kanaele]) / (kanaele * voll) for i in range(0, len(w), kanaele)]
    return mono, rate


def schreibe_wav(pfad, werte, rate, faktor):
    os.makedirs(os.path.dirname(pfad), exist_ok=True)
    a = array.array("h", [max(-32767, min(32767, int(round(v * faktor * 32767)))) for v in werte])
    if sys.byteorder == "big":
        a.byteswap()
    with wave.open(pfad, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(a.tobytes())


# ---------------------------------------------------------------------------
# Hilfen
# ---------------------------------------------------------------------------
def r3(x):
    return round(x, 3)


def bild_clip(sz, hoch, start, dauer):
    werte = SZENEN[sz]["h" if hoch else "q"]
    c = {"typ": "bild", "datei": SZENEN[sz]["datei"], "start": r3(start), "dauer": r3(dauer),
         "ueberblendung": UEBER_SZENE}
    c.update(werte)
    return c


def karte_clip(hoch, start, dauer):
    return {"typ": "karte", "datei": SZENEN[9]["h_datei" if hoch else "q_datei"], "start": r3(start),
            "dauer": r3(dauer), "zoom_start": 1.0, "zoom_ende": 1.02}


def video_clips(sz, hoch, starts, dauern, abschnitte, tempi, warnungen, name):
    s = SZENEN[sz]
    clips = []
    for k, ab in enumerate(abschnitte):
        u = UEBER_ABSCHNITT if k < len(abschnitte) - 1 else UEBER_SZENE
        # Während der Überblendung läuft der Abschnitt noch u/2 weiter: Tempo so wählen, dass auch dann
        # nie über "bis" hinaus gelesen wird (dahinter liegen oft weiße Übergangsbilder der Aufnahme).
        tempi[k] = (ab["bis"] - ab["von"]) / (dauern[k] + u / 2)
        c = {"typ": "video", "datei": s["datei"], "start": r3(starts[k]), "dauer": r3(dauern[k]),
             "video_start": ab["von"], "tempo": round(tempi[k], 4), "ueberblendung": u}
        if not hoch:
            c["hintergrund_bild"] = s["hintergrund_bild"]
        else:
            c["hintergrund_bild"] = s["hintergrund_bild"]   # weichgezeichnet in den schmalen Seitenstreifen
        if tempi[k] > 1.8 or tempi[k] < 0.6:
            warnungen.append("%s Szene %d Abschnitt %d: Tempo %.2f (ungewöhnlich)" % (name, sz, k + 1, tempi[k]))
        clips.append(c)
    return clips


def basis_plan(breite, hoehe, ausgabe, ton):
    return {"breite": breite, "hoehe": hoehe, "fps": 30, "ausgabe": ausgabe, "ton": ton,
            "ton_lautstaerke": 1.0, "nachlauf": 0.0, "einblenden": 0.4, "abblenden": 0.6,
            "hintergrund": "#FFF6E5", "bitrate_mbit": 12, "clips": []}


# ---------------------------------------------------------------------------
# Hauptschnitt 16:9
# ---------------------------------------------------------------------------
def baue_hauptschnitt(satz, ton_ende, warnungen):
    reihe = sorted(SZENEN)
    sz_start = {}
    for sz in reihe:
        erster = SZENEN[sz]["saetze"][0]
        sz_start[sz] = 0.0 if sz == reihe[0] else satz[erster]["start"] - VORLAUF
    ende = ton_ende + ENDE_HALTEN
    plan = basis_plan(1920, 1080, "folge1-rohschnitt-16x9.mp4", "ton/sprecher-16x9.wav")
    uebersicht = []
    for i, sz in enumerate(reihe):
        a = sz_start[sz]
        b = sz_start[reihe[i + 1]] if i + 1 < len(reihe) else ende
        s = SZENEN[sz]
        uebersicht.append({"szene": sz, "start": r3(a), "ende": r3(b), "dauer": r3(b - a)})
        if s["typ"] == "bild":
            plan["clips"].append(bild_clip(sz, False, a, b - a))
        elif s["typ"] == "karte":
            plan["clips"].append(karte_clip(False, a, b - a))
        else:
            ab = s["abschnitte"]
            # Ankerpunkte: Abschnitt k beginnt mit Satz "anker"
            punkte = [(0, a)]
            for k, x in enumerate(ab):
                if k > 0 and x.get("anker"):
                    punkte.append((k, min(max(satz[x["anker"]]["start"] - VORLAUF, a + 0.5), b - 0.5)))
            punkte.append((len(ab), b))
            starts, dauern, tempi = [], [], []
            for (k0, t0), (k1, t1) in zip(punkte, punkte[1:]):
                laengen = [ab[k]["bis"] - ab[k]["von"] for k in range(k0, k1)]
                gewichtet = [ab[k].get("gewicht", 1.0) * laengen[k - k0] for k in range(k0, k1)]
                faktor = (t1 - t0) / sum(gewichtet)
                t = t0
                for k in range(k0, k1):
                    d = gewichtet[k - k0] * faktor
                    starts.append(t); dauern.append(d); tempi.append(laengen[k - k0] / d)
                    t += d
            plan["clips"] += video_clips(sz, False, starts, dauern, ab, tempi, warnungen, "16:9")
    return plan, uebersicht


# ---------------------------------------------------------------------------
# Kurzclips 9:16 (Ton wird neu zusammengesetzt)
# ---------------------------------------------------------------------------
def baue_kurz(name, cfg, satz, warnungen):
    plan = basis_plan(1080, 1920, cfg["ausgabe"], "ton/%s.wav" % name)
    plan["einblenden"] = 0.0        # Titel und Bild sofort sichtbar (Kurzclips werden schnell weggewischt)
    plan["einblendungen"] = [{"datei": cfg["titel"], "start": 0.0, "dauer": TITEL_DAUER, "ein": 0.0, "aus": 0.4}]
    platz = []          # (satznr, zielzeit)
    t = 0.0
    uebersicht = []
    for bi, bl in enumerate(cfg["bloecke"]):
        sz = bl["szene"]
        s = SZENEN[sz]
        a = t
        vor = bl.get("sprech_start", 0.3 if bi == 0 else VORLAUF)
        nrn = bl["saetze"]
        if s["typ"] in ("bild", "karte"):
            z = a + vor
            for j, n in enumerate(nrn):
                platz.append((n, z))
                z += satz[n]["dauer"] + (satz[n]["pause"] if j < len(nrn) - 1 else 0)
            letzter = nrn[-1]
            if s["typ"] == "karte":
                b = z + bl.get("halten", ENDE_HALTEN)
            else:
                b = z + max(satz[letzter]["pause"], 0.5)
            if s["typ"] == "bild":
                plan["clips"].append(bild_clip(sz, True, a, b - a))
            else:
                plan["clips"].append(karte_clip(True, a, b - a))
        else:
            ab = bl.get("abschnitte", s["abschnitte"])
            tempo = bl.get("tempo", 1.0)
            dauern = [(x["bis"] - x["von"]) * x.get("gewicht", 1.0) / tempo for x in ab]
            starts = []
            z = a
            for d in dauern:
                starts.append(z); z += d
            # Sätze setzen: angeheftete Sätze beginnen frühestens mit ihrem Abschnitt
            anker = {x["anker"]: starts[k] for k, x in enumerate(ab) if x.get("anker")}
            zs = a + vor
            for j, n in enumerate(nrn):
                if n in anker:
                    zs = max(zs, anker[n] + VORLAUF)
                platz.append((n, zs))
                zs += satz[n]["dauer"] + satz[n]["pause"]
            sprech_ende = zs - satz[nrn[-1]]["pause"] + 0.5
            b = max(z, sprech_ende)
            tempi = [(x["bis"] - x["von"]) / d for x, d in zip(ab, dauern)]
            if b > z:                       # Sprache länger als Bild: letzten Abschnitt etwas langsamer
                letzt = len(ab) - 1
                neu = dauern[letzt] + (b - z)
                tempi[letzt] = (ab[letzt]["bis"] - ab[letzt]["von"]) / neu
                dauern[letzt] = neu
            plan["clips"] += video_clips(sz, True, starts, dauern, ab, tempi, warnungen, name)
        uebersicht.append({"szene": sz, "start": r3(a), "ende": r3(b), "dauer": r3(b - a)})
        t = b
    return plan, platz, t, uebersicht


# ---------------------------------------------------------------------------
def main():
    p = argparse.ArgumentParser(description="Zeitpläne für Folge 1 und Kurzclips bauen")
    p.add_argument("--saetze", required=True, help="Satz-Zeitliste (JSON)")
    p.add_argument("--ton", required=True, help="ganze Sprecherdatei (WAV, MP3 oder M4A)")
    p.add_argument("--rendern", action="store_true", help="danach alle Videos rendern")
    p.add_argument("--nur", help="nur diese Zeitpläne rendern, z. B. 16x9,kurz2")
    a = p.parse_args()

    os.makedirs(TMP, exist_ok=True)
    baue_titel()
    ton = a.ton
    if not ton.lower().endswith(".wav"):
        ziel = os.path.join(TMP, "sprecher-umgewandelt.wav")
        subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEF32", ton, ziel], check=True)
        ton = ziel
    werte, rate = lies_wav(ton)
    ton_laenge = len(werte) / rate

    liste = json.load(open(a.saetze, encoding="utf-8"))
    satz = {}
    t = 0.0
    for x in liste:
        st = x.get("start", t)
        satz[x["nr"]] = {"start": st, "dauer": x["dauer"], "pause": x.get("pause", 0.0), "text": x.get("satz", "")}
        t = st + x["dauer"] + x.get("pause", 0.0)
    fehlend = sorted({n for s in SZENEN.values() for n in s["saetze"]} - set(satz))
    if fehlend:
        sys.exit("Sätze fehlen in %s: %s" % (a.saetze, fehlend))
    letzter = max(satz, key=lambda n: satz[n]["start"])
    ton_ende = satz[letzter]["start"] + satz[letzter]["dauer"]
    if abs(ton_ende - ton_laenge) > 0.3:
        print("Hinweis: Satzliste endet bei %.2f s, Tondatei ist %.2f s lang." % (ton_ende, ton_laenge))
    ton_ende = min(ton_ende, ton_laenge)

    spitze = max(abs(v) for v in werte) or 1.0
    faktor = 0.891 / spitze           # -1 dBFS
    warnungen = []

    # Hauptschnitt
    schreibe_wav(os.path.join(VIDEO, "ton", "sprecher-16x9.wav"), werte, rate, faktor)
    plan, ueb = baue_hauptschnitt(satz, ton_ende, warnungen)
    plaene = {"16x9": plan}
    berichte = {"16x9": {"szenen": ueb, "laenge": r3(ton_ende + ENDE_HALTEN)}}

    # Kurzclips
    rand_vor, rand_nach = 0.04, 0.10
    for name, cfg in KURZ.items():
        kplan, platz, laenge, ueb = baue_kurz(name, cfg, satz, warnungen)
        aus = [0.0] * int(math.ceil(laenge * rate) + rate)
        for n, ziel in platz:
            q0 = max(0, int((satz[n]["start"] - rand_vor) * rate))
            q1 = min(len(werte), int((satz[n]["start"] + satz[n]["dauer"] + rand_nach) * rate))
            z0 = int((ziel - rand_vor) * rate)
            stueck = werte[q0:q1]
            blende = int(0.012 * rate)
            for i in range(len(stueck)):
                g = 1.0
                if i < blende:
                    g = i / blende
                elif i > len(stueck) - blende:
                    g = (len(stueck) - i) / blende
                j = z0 + i
                if 0 <= j < len(aus):
                    aus[j] += stueck[i] * g
        aus = aus[:int(laenge * rate)]
        schreibe_wav(os.path.join(VIDEO, "ton", name + ".wav"), aus, rate, faktor)
        plaene[name] = kplan
        berichte[name] = {"szenen": ueb, "laenge": r3(laenge),
                          "saetze": [{"nr": n, "start": r3(z)} for n, z in platz]}
        if not 20 <= laenge <= 30:
            warnungen.append("%s ist %.1f s lang (Ziel 20-30 s)" % (name, laenge))

    for name, pl in plaene.items():
        with open(os.path.join(VIDEO, "timeline-%s.json" % name), "w", encoding="utf-8") as f:
            json.dump(pl, f, ensure_ascii=False, indent=1)
    with open(os.path.join(VIDEO, "timeline-bericht.json"), "w", encoding="utf-8") as f:
        json.dump(berichte, f, ensure_ascii=False, indent=1)

    for name, b in berichte.items():
        print("%-6s %6.2f s  Szenen: %s" % (name, b["laenge"],
              ", ".join("%d@%.2f" % (s["szene"], s["start"]) for s in b["szenen"])))
    for w in warnungen:
        print("WARNUNG:", w)

    if a.rendern:
        render = os.path.join(TMP, "render")
        quelle = os.path.join(HIER, "render.swift")
        if not os.path.exists(render) or os.path.getmtime(render) < os.path.getmtime(quelle):
            subprocess.run(["swiftc", "-O", quelle, "-o", render], check=True,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        auswahl = a.nur.split(",") if a.nur else list(plaene)
        for name in auswahl:
            subprocess.run([render, os.path.join(VIDEO, "timeline-%s.json" % name)], check=True)


if __name__ == "__main__":
    main()
