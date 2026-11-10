#!/usr/bin/env python3
"""Findet Sprechabschnitte und Pausen in einer Sprecher-WAV-Datei.

Aufruf:
    python3 -I docs/marketing/video01/werkzeuge/zeiten.py sprecher.wav [--schwelle 35] [--pause 0.3] [--frame 0.02]

Gibt eine JSON-Liste aus: [{"start": 0.21, "ende": 1.62}, ...]  (Sekunden)

Verfahren: Lautstärke (RMS) in 20-ms-Stücken; leiser als (lautestes Stück - 35 dB) gilt als still.
Eine Pause zählt erst ab 0,3 s Stille - kürzere Lücken (zwischen Wörtern) bleiben im Abschnitt.

MP3 von ElevenLabs vorher umwandeln (macOS-Bordmittel):
    afconvert -f WAVE -d LEI16@24000 eingang.mp3 ausgang.wav
Nur Python-Standardbibliothek.
"""
import argparse
import array
import json
import math
import struct
import sys
import wave


def lies_riff(pfad):
    """Eigener WAV-Leser für Formate, die das wave-Modul ablehnt
    (afconvert schreibt WAVE_FORMAT_EXTENSIBLE = 65534; auch 32-bit-Float)."""
    with open(pfad, "rb") as f:
        daten = f.read()
    if daten[0:4] not in (b"RIFF", b"RF64") or daten[8:12] != b"WAVE":
        sys.exit("Keine WAV-Datei: %s" % pfad)
    pos = 12
    fmt = None
    roh = None
    while pos + 8 <= len(daten):
        cid = daten[pos:pos + 4]
        groesse = struct.unpack("<I", daten[pos + 4:pos + 8])[0]
        inhalt = daten[pos + 8:pos + 8 + groesse]
        if cid == b"fmt ":
            fmt = inhalt
        elif cid == b"data":
            roh = inhalt
        pos += 8 + groesse + (groesse & 1)
    if fmt is None or roh is None:
        sys.exit("WAV ohne fmt/data: %s" % pfad)
    tag, kanaele, rate = struct.unpack("<HHI", fmt[0:8])
    bits = struct.unpack("<H", fmt[14:16])[0]
    if tag == 0xFFFE and len(fmt) >= 26:
        tag = struct.unpack("<H", fmt[24:26])[0]      # Unterformat aus der GUID
    return tag, kanaele, rate, bits // 8, roh


def lies_wav(pfad):
    tag = 1
    try:
        with wave.open(pfad, "rb") as w:
            kanaele = w.getnchannels()
            breite = w.getsampwidth()
            rate = w.getframerate()
            roh = w.readframes(w.getnframes())
    except (wave.Error, EOFError):
        tag, kanaele, rate, breite, roh = lies_riff(pfad)
    if tag == 3:                                         # 32/64-bit Float
        werte = array.array("f" if breite == 4 else "d")
        werte.frombytes(roh[:len(roh) - len(roh) % breite])
        if sys.byteorder == "big":
            werte.byteswap()
        return werte, kanaele, rate, 1.0
    if tag != 1:
        sys.exit("Nicht unterstütztes WAV-Format %d (bitte PCM: afconvert -f WAVE -d LEI16@24000 ...)" % tag)
    roh = roh[:len(roh) - len(roh) % breite]
    if breite == 2:
        werte = array.array("h")
        werte.frombytes(roh)
        voll = 32768.0
    elif breite == 4:
        werte = array.array("i")
        werte.frombytes(roh)
        voll = 2147483648.0
    elif breite == 1:
        werte = array.array("h", [(b - 128) << 8 for b in roh])
        voll = 32768.0
    elif breite == 3:
        werte = array.array("i", [
            int.from_bytes(roh[i:i + 3], "little", signed=True) for i in range(0, len(roh), 3)
        ])
        voll = 8388608.0
    else:
        sys.exit("Nicht unterstützte Bittiefe: %d Byte" % breite)
    if sys.byteorder == "big" and breite in (2, 4):
        werte.byteswap()
    return werte, kanaele, rate, voll


def abschnitte(pfad, schwelle_db=35.0, min_pause=0.3, frame_s=0.02, min_abschnitt=0.05):
    werte, kanaele, rate, voll = lies_wav(pfad)
    n_frames = len(werte) // kanaele
    pro = max(1, int(round(rate * frame_s)))
    db = []
    for start in range(0, n_frames, pro):
        ende = min(start + pro, n_frames)
        summe = 0.0
        for i in range(start * kanaele, ende * kanaele):
            v = werte[i] / voll
            summe += v * v
        rms = math.sqrt(summe / max(1, (ende - start) * kanaele))
        db.append(20 * math.log10(rms) if rms > 1e-9 else -180.0)
    if not db:
        return [], 0.0
    grenze = max(db) - schwelle_db
    laut = [d > grenze for d in db]
    dauer = n_frames / rate

    segs = []
    i = 0
    while i < len(laut):
        if laut[i]:
            j = i
            while j < len(laut) and laut[j]:
                j += 1
            segs.append([i, j])          # Frames [i, j)
            i = j
        else:
            i += 1
    # Lücken < min_pause zusammenfassen
    min_luecke = int(round(min_pause / frame_s))
    zusammen = []
    for s in segs:
        if zusammen and s[0] - zusammen[-1][1] < min_luecke:
            zusammen[-1][1] = s[1]
        else:
            zusammen.append(list(s))
    min_f = int(round(min_abschnitt / frame_s))
    ergebnis = []
    for a, b in zusammen:
        if b - a < min_f:
            continue                     # Knackser, kein Sprechen
        ergebnis.append({"start": round(a * pro / rate, 3), "ende": round(min(b * pro / rate, dauer), 3)})
    return ergebnis, dauer


def main():
    p = argparse.ArgumentParser(description="Sprechabschnitte in WAV finden")
    p.add_argument("wav")
    p.add_argument("--schwelle", type=float, default=35.0, help="dB unter dem lautesten Stück (Standard 35)")
    p.add_argument("--pause", type=float, default=0.3, help="kürzeste Pause in s (Standard 0.3)")
    p.add_argument("--frame", type=float, default=0.02, help="Stücklänge in s (Standard 0.02)")
    p.add_argument("--info", action="store_true", help="zusätzlich Gesamtlänge und Pausen auf stderr")
    a = p.parse_args()
    segs, dauer = abschnitte(a.wav, a.schwelle, a.pause, a.frame)
    print(json.dumps(segs, indent=1))
    if a.info:
        sys.stderr.write("Länge %.3f s, %d Abschnitte\n" % (dauer, len(segs)))
        for k in range(1, len(segs)):
            sys.stderr.write("  Pause %d: %.3f-%.3f s (%.2f s)\n" % (
                k, segs[k - 1]["ende"], segs[k]["start"], segs[k]["start"] - segs[k - 1]["ende"]))


if __name__ == "__main__":
    main()
