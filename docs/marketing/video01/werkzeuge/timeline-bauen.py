#!/usr/bin/env python3
"""Baut die Zeitpläne (JSON) für Folge 1 und die drei Kurzclips aus einer Satz-Zeitliste.

Aufruf (aus beliebigem Ordner):
    python3 -I docs/marketing/video01/werkzeuge/timeline-bauen.py \
        --saetze /pfad/saetze.json --ton /pfad/sprecher.wav [--rendern] [--nur 16x9,kurz2]

saetze.json: Liste [{"nr": 1, "satz": "...", "dauer": 0.65, "pause": 0.55}, ...] in Sprechreihenfolge.
  Satz i beginnt im Ton bei der Summe von (dauer + pause) aller vorigen Sätze.
  Optional je Satz "start" (Sekunden im Ton) - dann zählt dieser Wert.
--ton: die ganze Sprecherdatei (WAV; MP3/M4A wird mit afconvert umgewandelt).

Schreibt nach docs/marketing/video01/:
    timeline-16x9.json (Folge 1, 12 Mbit), timeline-16x9-klein.json (dieselbe Folge, 3,2 Mbit fürs Handy),
    timeline-kurz1.json ... timeline-kurz3.json, timeline-bericht.json (alle Schnittzeiten)
    ton/sprecher-16x9.wav (ganzer Ton, auf -1 dBFS gebracht), ton/kurz1.wav ... kurz3.wav (geschnitten)
Mit --rendern werden danach die Videos gerendert (render.swift wird bei Bedarf übersetzt).

Neue Stimme: nur saetze.json und Tondatei austauschen und das Skript neu laufen lassen. ACHTUNG: Schnitte
auf einzelne Wörter ("versatz", siehe unten) sind für die Felix-Aufnahme vom 10.11.2026 gemessen und müssen
bei neuem Ton (z. B. neuer Satz 9) angepasst werden – das Skript warnt, wenn ein Schnitt nicht passt.

Szenen (SZENEN):
  Bild-Szene: "bilder": [{"datei": ..., "q": {...}, "h": {...}, "anker": 4, "versatz": 2.1}, ...]
    Mehrere Einstellungen nacheinander, 0,35 s Überblendung dazwischen. Einstellung k beginnt zur Zeit
    (Start von Satz "anker") + "versatz" (Sekunden; ohne "versatz": 0,15 s vor dem Satz). Ohne "anker" wird
    die Zeit gleichmäßig verteilt. "q"/"h": Ken Burns für 16:9 / 9:16 (zoom_start, zoom_ende, fokus_x,
    fokus_y, pan_x, pan_y); fehlen sie, wechseln sich sanftes Hinein- und Herauszoomen ab.
    Statt "datei" geht auch "video": ein 16:9-Clip (z. B. KI-animiert), der das Bild füllt (render.swift:
    "fuellen": true); optional "video_start", "tempo". So lassen sich Standbilder 1:1 gegen Clips tauschen.
  Video-Szene (Bildschirmaufnahme): "abschnitte": [{"von", "bis", "anker", "versatz", "gewicht", "q", "h"}]
    Abschnitte der Aufnahme in Sekunden. "anker"/"versatz" wie oben; zwischen Ankern wird die Zeit nach Länge
    (mal "gewicht") verteilt, das Tempo ergibt sich daraus. "q"/"h": Zusatzwerte für den Clip (z. B. "fuellen",
    Zoom). Die Abschnitte meiden die kurzen weißen/halb aufgebauten Übergangsbilder der Aufnahmen; auch in
    Überblendungen wird nie über "bis" hinaus gelesen und nie vor "von".
  Karte: Endkarte.
Kurzclips (KURZ): Blöcke aus Szene + Sätzen; der Ton wird lückenlos neu zusammengesetzt, die Bilder folgen
  denselben Ankern wie im Hauptschnitt.
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

# Hintergrundmusik (Julian 11.11.2026, Pixabay-Stück atlasaudio-background-music-610019), ~16-20 dB unter der Stimme
MUSIK = "ton/musik.wav"
MUSIK_LAUT = 0.07

VORLAUF = 0.15        # Szene beginnt so viel vor ihrem ersten Satz
ENDE_HALTEN = 2.5     # Endkarte steht so lange nach dem letzten Wort
UEBER_SZENE = 0.45    # Überblendung zwischen Szenen
UEBER_ABSCHNITT = 0.3 # Überblendung zwischen Abschnitten derselben Aufnahme
UEBER_BILD = 0.35     # Überblendung zwischen Einstellungen derselben Bild-Szene
MIN_EINSTELLUNG = 0.8 # kürzeste Einstellung (s)

B = "../bilder/v2/"   # neue, einheitliche Bilder (Anna), relativ zu docs/marketing/video01

# ---------------------------------------------------------------------------
# Szenen
# Wort-Zeiten (Felix): Satz 2 "und weißt" ~3.04 s; Satz 3 "und am Ende" ~10.06; Satz 4 "Behandlungen" 15.42,
# "Meldungen" 17.25, "und woher" ~18.4; Satz 5 "ImkerBuch" ~23.1; Satz 9 "und macht dir" 38.56,
# "fürs Amt als PDF" ~40.0; Satz 10 "bis zum Glas" 42.59, "Chargen" 43.83, "Etiketten" 44.55,
# "Verkauf" 45.45, "Kassenbuch" 46.01 (gemessen an Pausen/Lautstärke der Aufnahme).
# ---------------------------------------------------------------------------
SZENEN = {
    1: {"saetze": [1, 2], "typ": "bild", "bilder": [
        {"datei": B + "s1-weit.png",
         "q": {"zoom_start": 1.0, "zoom_ende": 1.07, "fokus_x": 0.52, "fokus_y": 0.38},
         "h": {"zoom_start": 1.0, "zoom_ende": 1.05, "fokus_x": 0.52, "fokus_y": 0.4}},
        {"datei": B + "s1-nah.png", "anker": 2, "versatz": 1.70,          # "... – und weißt nicht mehr"
         "q": {"zoom_start": 1.08, "zoom_ende": 1.0, "fokus_x": 0.56, "fokus_y": 0.5},
         "h": {"zoom_start": 1.06, "zoom_ende": 1.0, "fokus_x": 0.56, "fokus_y": 0.5}}]},
    2: {"saetze": [3], "typ": "bild", "bilder": [
        {"datei": B + "s2-weit.png",
         "q": {"zoom_start": 1.02, "zoom_ende": 1.08, "fokus_x": 0.48, "fokus_y": 0.42, "pan_x": 0.03},
         "h": {"zoom_start": 1.0, "zoom_ende": 1.05, "fokus_x": 0.48, "fokus_y": 0.45}},
        {"datei": B + "s2-nah.png", "anker": 3, "versatz": 2.88,          # "und am Ende des Jahres ..."
         "q": {"zoom_start": 1.08, "zoom_ende": 1.02, "fokus_x": 0.6, "fokus_y": 0.55, "pan_x": -0.03},
         "h": {"zoom_start": 1.05, "zoom_ende": 1.0, "fokus_x": 0.62, "fokus_y": 0.5}}]},
    3: {"saetze": [4], "typ": "bild", "bilder": [
        {"datei": B + "s3-weit.png",
         "q": {"zoom_start": 1.0, "zoom_ende": 1.06, "fokus_x": 0.5, "fokus_y": 0.5},
         "h": {"zoom_start": 1.0, "zoom_ende": 1.04, "fokus_x": 0.5, "fokus_y": 0.6}},
        {"datei": B + "s3-mittel.png", "anker": 4, "versatz": 2.12,       # "Behandlungen mit Wartezeiten"
         "q": {"zoom_start": 1.0, "zoom_ende": 1.08, "fokus_x": 0.5, "fokus_y": 0.5},
         "h": {"zoom_start": 1.0, "zoom_ende": 1.0, "fokus_x": 0.47, "fokus_y": 0.5, "pan_x": 0.14}},
        {"datei": B + "s3-amt.png", "anker": 4, "versatz": 3.92,          # "Meldungen ans Amt"
         "q": {"zoom_start": 1.08, "zoom_ende": 1.0, "fokus_x": 0.5, "fokus_y": 0.45},
         "h": {"zoom_start": 1.05, "zoom_ende": 1.0, "fokus_x": 0.5, "fokus_y": 0.5}},
        {"datei": B + "s3-glas.png", "anker": 4, "versatz": 5.15,         # "und woher der Honig ..."
         "q": {"zoom_start": 1.0, "zoom_ende": 1.07, "fokus_x": 0.5, "fokus_y": 0.45},
         "h": {"zoom_start": 1.0, "zoom_ende": 1.06, "fokus_x": 0.5, "fokus_y": 0.5}}]},
    4: {"saetze": [5], "typ": "bild", "bilder": [
        {"datei": B + "s4-weit-logo.png",
         "q": {"zoom_start": 1.0, "zoom_ende": 1.06, "fokus_x": 0.505, "fokus_y": 0.55},
         "h": {"zoom_start": 1.0, "zoom_ende": 1.04, "fokus_x": 0.505, "fokus_y": 0.5}},
        {"datei": B + "s4-nah-logo.png", "anker": 5, "versatz": 1.36,     # "... ImkerBuch."
         "q": {"zoom_start": 1.03, "zoom_ende": 1.09, "fokus_x": 0.505, "fokus_y": 0.5},
         "h": {"zoom_start": 1.0, "zoom_ende": 1.05, "fokus_x": 0.505, "fokus_y": 0.5}}]},
    5: {"saetze": [6, 7], "typ": "video", "datei": "aufnahmen/szene5.mp4",
        "hintergrund_bild": B + "s1-weit.png",
        # Jede neue Frage blendet in der Aufnahme aus fast Weiß ein (1.13, 2.47, 3.60, 4.73, 5.87, 7.00, 8.43 s):
        # diese Stellen werden übersprungen, stattdessen weiche Überblendung von Frage zu Frage.
        "abschnitte": [{"von": 0.75, "bis": 1.12, "gewicht": 1.3},  # Bienenstand: "Durchsicht am Stand"
                       {"von": 1.30, "bis": 2.45},                  # Volksstärke
                       {"von": 2.70, "bis": 3.58},                  # Brutbild
                       {"von": 3.87, "bis": 4.71},                  # Sanftmut
                       {"von": 5.00, "bis": 5.85},                  # Futter
                       {"von": 6.13, "bis": 6.98},                  # Weiselzellen
                       {"von": 7.27, "bis": 8.41},                  # Fertig - passt das? Speichern
                       {"von": 8.70, "bis": 10.10, "anker": 7}]},   # "Volk für Volk." - nächstes Volk
    # Aufnahme vom 11.11.2026 (Oxalsäure, 0 Tage). Weiße/halb aufgebaute Bilder: 0.83-1.07 (Blatt fährt hoch,
    # kein Weiß), 6.17-6.43, 8.03-8.27, 9.63-10.20, 11.37-11.75 (PDF fährt hoch, kein Weiß).
    6: {"saetze": [8, 9], "typ": "video", "datei": "aufnahmen/szene6.mp4",
        "hintergrund_bild": B + "s3-weit.png",
        "abschnitte": [{"von": 1.25, "bis": 6.10},                 # Behandlung für den ganzen Stand
                       {"von": 6.45, "bis": 7.10, "gewicht": 1.5},  # "Behandlung für 6 Völker dokumentiert"
                       {"von": 8.27, "bis": 9.57, "anker": 9, "versatz": 0.0},   # anstehende Aufgaben
                       {"von": 10.22, "bis": 11.90, "anker": 9, "versatz": 3.40},  # "… Unterlagen fürs Amt als PDF"
                       {"von": 13.90, "bis": 14.20, "anker": 9, "versatz": 5.45, "standbild": True,   # "– zum Beispiel das Bestandsbuch"
                        # PDF groß: links lesbar (Datum, Volk, Oxalsäure, 30 ml, 0 Tage)
                        "q": {"fuellen": True, "rahmen": False, "zoom_start": 1.0, "zoom_ende": 1.03,
                              "fokus_x": 0.5, "fokus_y": 0.312},
                        "h": {"fuellen": True, "rahmen": False, "zoom_start": 1.0, "zoom_ende": 1.1,
                              "fokus_x": 0.4, "fokus_y": 0.3}}]},
    # Aufnahme vom 11.11.2026. Weiße/halb aufgebaute Bilder: 1.03-1.27, 2.10-2.37, 2.97-3.45, 6.83-7.23,
    # 7.77-7.93, 8.30-8.47, 8.83-9.00 (Aufblitzen beim Antippen), 10.53-10.67, 11.23-11.80.
    7: {"saetze": [10], "typ": "video", "datei": "aufnahmen/szene7.mp4",
        "hintergrund_bild": B + "s3-glas.png",
        "abschnitte": [{"von": 0.0, "bis": 0.98},                                  # Ernte
                       {"von": 2.37, "bis": 2.93, "anker": 10, "versatz": 0.73, "standbild": True},  # Abfüllung ("bis zum Glas"), ruhiges Bild
                       {"von": 1.27, "bis": 2.05, "anker": 10, "versatz": 1.88},   # Chargen
                       {"von": 5.60, "bis": 6.78, "anker": 10, "versatz": 2.57},   # Etiketten-PDF
                       {"von": 9.02, "bis": 9.48, "anker": 10, "versatz": 3.42},   # Marktverkauf: 3 Gläser, Kassieren
                       {"von": 11.80, "bis": 14.13, "anker": 10, "versatz": 3.96}]},  # Kassenbuch
    8: {"saetze": [11, 12], "typ": "bild", "bilder": [
        {"datei": B + "s8-weit-logo.png",
         "q": {"zoom_start": 1.08, "zoom_ende": 1.0, "fokus_x": 0.45, "fokus_y": 0.45},
         "h": {"zoom_start": 1.04, "zoom_ende": 1.0, "fokus_x": 0.46, "fokus_y": 0.5}},
        {"datei": B + "s8-nah.png", "anker": 12,                        # "Deine Einträge bleiben auf deinem Gerät."
         "q": {"zoom_start": 1.0, "zoom_ende": 1.06, "fokus_x": 0.5, "fokus_y": 0.45},
         "h": {"zoom_start": 1.0, "zoom_ende": 1.05, "fokus_x": 0.48, "fokus_y": 0.5}}]},
    9: {"saetze": [13, 14], "typ": "karte", "q_datei": "endkarte-16x9.png", "h_datei": "endkarte-9x16.png"},
}

# Kurzclips (hochkant). Je Block: Szene, Sätze; optional "abschnitte" (statt der Szenen-Abschnitte),
# "sprech_start" (erster Satz so viele Sekunden nach Blockbeginn), "halten" (Endkarte nach dem letzten Wort).
KURZ = {
    "kurz1": {"titel": "titel/kurz1-titel.png", "titel_text": "Nie wieder|nasse Stockkarten", "titel_oben": 0.55,
              "ausgabe": "kurz1-stockkarten-9x16.mp4",
              "bloecke": [{"szene": 1, "saetze": [1, 2]},
                          {"szene": 2, "saetze": [3]},
                          {"szene": 5, "saetze": [6, 7]},
                          {"szene": 9, "saetze": [14]}]},
    # Titel weiter unten: im ersten Bild ist Annas Gesicht in der Bildmitte, darunter nur der Imkeranzug
    "kurz2": {"titel": "titel/kurz2-titel.png", "titel_text": "Behandlung?|In Sekunden notiert.", "titel_oben": 0.68,
              "ausgabe": "kurz2-behandlung-9x16.mp4",
              "bloecke": [{"szene": 3, "saetze": [4]},
                          {"szene": 6, "saetze": [8, 9]},
                          {"szene": 9, "saetze": [13, 14]}]},
    "kurz3": {"titel": "titel/kurz3-titel.png", "titel_text": "Vom Stand bis|zum Honigglas", "titel_oben": 0.55,
              "ausgabe": "kurz3-honigglas-9x16.mp4",
              "bloecke": [{"szene": 7, "saetze": [10]},
                          {"szene": 9, "saetze": [14]}]},
}
TITEL_DAUER = 2.3
BITRATE_16X9 = 12
BITRATE_KLEIN = 3.2   # Handy-Kopie (< 28 MB)
BITRATE_KURZ = 7      # Kurzclips (< 28 MB)


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
        subprocess.run([prog, cfg["titel_text"], ziel, "1080", "1920", str(cfg.get("titel_oben", 0.55))],
                       check=True, stdout=subprocess.DEVNULL)


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


def ankerzeit(eintrag, T):
    """Zeit, zu der eine Einstellung/ein Abschnitt beginnen soll (oder None)."""
    n = eintrag.get("anker")
    if not n or n not in T:
        return None
    return T[n] + eintrag.get("versatz", -VORLAUF)


def basis_plan(breite, hoehe, ausgabe, ton, bitrate):
    return {"breite": breite, "hoehe": hoehe, "fps": 30, "ausgabe": ausgabe, "ton": ton,
            "ton_lautstaerke": 1.0, "nachlauf": 0.0, "einblenden": 0.4, "abblenden": 0.6,
            "hintergrund": "#FFF6E5", "bitrate_mbit": bitrate, "clips": [],
            "musik": MUSIK, "musik_lautstaerke": MUSIK_LAUT}


def bild_clips(sz, hoch, a, b, T, warnungen, name):
    """Bild-Szene mit einer oder mehreren Einstellungen (Standbild oder füllender 16:9-Clip)."""
    bilder = SZENEN[sz]["bilder"]
    n = len(bilder)
    # Schnittzeiten: angeheftete Einstellungen nach Anker, die übrigen gleichmäßig dazwischen
    zeiten = [a] + [ankerzeit(x, T) for x in bilder[1:]] + [b]
    k = 1
    while k < n:
        if zeiten[k] is None:
            j = k
            while zeiten[j] is None:
                j += 1
            for m in range(k, j):
                zeiten[m] = zeiten[k - 1] + (zeiten[j] - zeiten[k - 1]) * (m - k + 1) / (j - k + 1)
            k = j
        k += 1
    for k in range(1, n):
        alt = zeiten[k]
        zeiten[k] = min(max(zeiten[k], zeiten[k - 1] + MIN_EINSTELLUNG), b - MIN_EINSTELLUNG * (n - k))
        if abs(zeiten[k] - alt) > 0.01:
            warnungen.append("%s Szene %d Einstellung %d: Schnitt von %.2f auf %.2f verschoben (zu kurz)"
                             % (name, sz, k + 1, alt, zeiten[k]))
    clips = []
    for k, x in enumerate(bilder):
        start, dauer = zeiten[k], zeiten[k + 1] - zeiten[k]
        u = UEBER_BILD if k < n - 1 else UEBER_SZENE
        werte = x.get("h" if hoch else "q")
        if werte is None:   # sanft abwechselnd hinein/heraus zoomen
            werte = {"zoom_start": 1.0, "zoom_ende": 1.06} if k % 2 == 0 else {"zoom_start": 1.06, "zoom_ende": 1.0}
        if "video" in x:
            c = {"typ": "video", "datei": x["video"], "fuellen": True, "rahmen": False,
                 "video_start": x.get("video_start", 0.0), "tempo": x.get("tempo", 1.0)}
        else:
            c = {"typ": "bild", "datei": x["datei"]}
        c.update({"start": r3(start), "dauer": r3(dauer), "ueberblendung": u})
        c.update(werte)
        clips.append(c)
    return clips


def karte_clip(hoch, start, dauer):
    return {"typ": "karte", "datei": SZENEN[9]["h_datei" if hoch else "q_datei"], "start": r3(start),
            "dauer": r3(dauer), "zoom_start": 1.0, "zoom_ende": 1.02}


def video_clips(sz, hoch, a, b, T, warnungen, name, abschnitte=None):
    """Bildschirmaufnahme: Abschnitte nach Ankern und Länge auf [a, b] verteilen."""
    s = SZENEN[sz]
    ab = abschnitte or s["abschnitte"]
    punkte = [(0, a)]
    for k, x in enumerate(ab):
        z = ankerzeit(x, T) if k > 0 else None
        if z is not None:
            punkte.append((k, min(max(z, punkte[-1][1] + 0.5), b - 0.5)))
    punkte.append((len(ab), b))
    starts, dauern = [], []
    for (k0, t0), (k1, t1) in zip(punkte, punkte[1:]):
        laengen = [ab[k]["bis"] - ab[k]["von"] for k in range(k0, k1)]
        gewichtet = [ab[k].get("gewicht", 1.0) * laengen[k - k0] for k in range(k0, k1)]
        faktor = (t1 - t0) / sum(gewichtet)
        t = t0
        for k in range(k0, k1):
            d = gewichtet[k - k0] * faktor
            starts.append(t); dauern.append(d)
            t += d
    clips = []
    for k, x in enumerate(ab):
        u = UEBER_ABSCHNITT if k < len(ab) - 1 else UEBER_SZENE
        # Während der Überblendung läuft der Abschnitt noch u/2 weiter: Tempo so wählen, dass auch dann
        # nie über "bis" hinaus gelesen wird (dahinter liegen oft weiße Übergangsbilder der Aufnahme).
        tempo = (x["bis"] - x["von"]) / (dauern[k] + u / 2)
        c = {"typ": "video", "datei": s["datei"], "start": r3(starts[k]), "dauer": r3(dauern[k]),
             "video_start": x["von"], "tempo": round(tempo, 4), "ueberblendung": u,
             "hintergrund_bild": s["hintergrund_bild"]}
        c.update(x.get("h" if hoch else "q", {}))
        if not x.get("standbild") and (tempo > 1.45 or tempo < 0.45):
            warnungen.append("%s Szene %d Abschnitt %d: Tempo %.2f (ungewöhnlich)" % (name, sz, k + 1, tempo))
        clips.append(c)
    return clips


def szene_clips(sz, hoch, a, b, T, warnungen, name, abschnitte=None):
    typ = SZENEN[sz]["typ"]
    if typ == "bild":
        return bild_clips(sz, hoch, a, b, T, warnungen, name)
    if typ == "karte":
        return [karte_clip(hoch, a, b - a)]
    return video_clips(sz, hoch, a, b, T, warnungen, name, abschnitte)


def schnitte(clips):
    return [r3(c["start"]) for c in clips]


# ---------------------------------------------------------------------------
# Hauptschnitt 16:9
# ---------------------------------------------------------------------------
def baue_hauptschnitt(satz, ton_ende, warnungen):
    reihe = sorted(SZENEN)
    T = {n: satz[n]["start"] for n in satz}
    sz_start = {}
    for sz in reihe:
        erster = SZENEN[sz]["saetze"][0]
        sz_start[sz] = 0.0 if sz == reihe[0] else satz[erster]["start"] - VORLAUF
    ende = ton_ende + ENDE_HALTEN
    plan = basis_plan(1920, 1080, "folge1-felix-16x9.mp4", "ton/sprecher-16x9.wav", BITRATE_16X9)
    uebersicht = []
    for i, sz in enumerate(reihe):
        a = sz_start[sz]
        b = sz_start[reihe[i + 1]] if i + 1 < len(reihe) else ende
        cl = szene_clips(sz, False, a, b, T, warnungen, "16:9")
        plan["clips"] += cl
        uebersicht.append({"szene": sz, "start": r3(a), "ende": r3(b), "dauer": r3(b - a), "schnitte": schnitte(cl),
                           "tempi": [c["tempo"] for c in cl if c["typ"] == "video" and not c.get("fuellen")]})
    return plan, uebersicht


# ---------------------------------------------------------------------------
# Kurzclips 9:16 (Ton wird neu zusammengesetzt)
# ---------------------------------------------------------------------------
def baue_kurz(name, cfg, satz, warnungen):
    plan = basis_plan(1080, 1920, cfg["ausgabe"], "ton/%s.wav" % name, BITRATE_KURZ)
    plan["einblenden"] = 0.0        # Titel und Bild sofort sichtbar (Kurzclips werden schnell weggewischt)
    plan["einblendungen"] = [{"datei": cfg["titel"], "start": 0.0, "dauer": TITEL_DAUER, "ein": 0.0, "aus": 0.4}]
    platz = []          # (satznr, zielzeit)
    t = 0.0
    uebersicht = []
    for bi, bl in enumerate(cfg["bloecke"]):
        sz = bl["szene"]
        typ = SZENEN[sz]["typ"]
        a = t
        z = a + bl.get("sprech_start", 0.3 if bi == 0 else VORLAUF)
        T = {}
        nrn = bl["saetze"]
        for j, n in enumerate(nrn):
            platz.append((n, z)); T[n] = z
            z += satz[n]["dauer"] + (satz[n]["pause"] if j < len(nrn) - 1 else 0)
        if typ == "karte":
            b = z + bl.get("halten", ENDE_HALTEN)
        else:
            b = z + max(satz[nrn[-1]]["pause"], 0.5)
        cl = szene_clips(sz, True, a, b, T, warnungen, name, bl.get("abschnitte"))
        plan["clips"] += cl
        uebersicht.append({"szene": sz, "start": r3(a), "ende": r3(b), "dauer": r3(b - a), "schnitte": schnitte(cl),
                           "tempi": [c["tempo"] for c in cl if c["typ"] == "video" and not c.get("fuellen")]})
        t = b
    return plan, platz, t, uebersicht


# ---------------------------------------------------------------------------
def main():
    p = argparse.ArgumentParser(description="Zeitpläne für Folge 1 und Kurzclips bauen")
    p.add_argument("--saetze", required=True, help="Satz-Zeitliste (JSON)")
    p.add_argument("--ton", required=True, help="ganze Sprecherdatei (WAV, MP3 oder M4A)")
    p.add_argument("--rendern", action="store_true", help="danach die Videos rendern")
    p.add_argument("--nur", help="nur diese Zeitpläne rendern, z. B. 16x9,16x9-klein,kurz2")
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

    # Hauptschnitt (+ kleine Kopie fürs Handy)
    schreibe_wav(os.path.join(VIDEO, "ton", "sprecher-16x9.wav"), werte, rate, faktor)
    plan, ueb = baue_hauptschnitt(satz, ton_ende, warnungen)
    klein = dict(plan, ausgabe="folge1-felix-16x9-klein.mp4", bitrate_mbit=BITRATE_KLEIN)
    plaene = {"16x9": plan, "16x9-klein": klein}
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

    for name, pl in plaene.items():
        with open(os.path.join(VIDEO, "timeline-%s.json" % name), "w", encoding="utf-8") as f:
            json.dump(pl, f, ensure_ascii=False, indent=1)
    with open(os.path.join(VIDEO, "timeline-bericht.json"), "w", encoding="utf-8") as f:
        json.dump(berichte, f, ensure_ascii=False, indent=1)

    for name, b in berichte.items():
        print("%-6s %6.2f s" % (name, b["laenge"]))
        for s in b["szenen"]:
            print("   Szene %d %6.2f-%6.2f  Schnitte %s  Tempo %s" % (
                s["szene"], s["start"], s["ende"], " ".join("%.2f" % x for x in s["schnitte"]),
                " ".join("%.2f" % x for x in s["tempi"])))
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
