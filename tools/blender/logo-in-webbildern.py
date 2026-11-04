#!/usr/bin/env python3
"""Setzt in die App-Bilder der Website (640 px breit) oben links das neue 3D-Logo statt des
alten flachen und schreibt sie nach website-neu/media/app-bilder und website-upload/media/app-bilder.
Quelle sind die Bilder, die ONLINE stehen (Sicherung website-live-sicherung-2026-11-04/), nicht
website-neu/varianten/: dort sind b-08 und b-10 älter als die veröffentlichte Fassung (gefunden 04.11.2026).
Julian 03.11.2026: „es muss alles einheitlich sein“.
Aufruf: cd ~/ImkerApp && python3 tools/blender/logo-in-webbildern.py [quellordner]"""
import glob, os, sys
from PIL import Image

WURZEL = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
QUELLE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(WURZEL, "website-live-sicherung-2026-11-04/media/app-bilder")
ZIELE = [os.path.join(WURZEL, "website-neu/media/app-bilder"), os.path.join(WURZEL, "website-upload/media/app-bilder")]
LOGO = Image.open(os.path.join(WURZEL, "assets/logo/imkerbuch-logo.png")).convert("RGBA")

# Das alte Logo war ein 26-px-SVG; bei 640 px Bildbreite liegt sein Kasten bei 30..72 / 29..71
# (bei der 780er Aufnahme 36..88 / 35..87). logoBild(26) zeigt das neue Logo im selben Kasten.
KASTEN = (30, 29, 72, 71)

for pfad in sorted(glob.glob(os.path.join(QUELLE, "*.webp"))):
    bild = Image.open(pfad).convert("RGBA")
    assert bild.size[0] == 640, (pfad, bild.size)
    grund = bild.getpixel((24, 50))  # Kopfzeilen-Hintergrund links neben dem Logo
    x0, y0, x1, y1 = KASTEN
    bild.paste(grund, (x0 - 2, y0 - 2, x1 + 2, y1 + 2))
    bild.alpha_composite(LOGO.resize((x1 - x0, y1 - y0), Image.LANCZOS), (x0, y0))
    klein = bild.convert("RGB")
    for ziel in ZIELE:
        klein.save(os.path.join(ziel, os.path.basename(pfad)), quality=80, method=6)
    print("✓", os.path.basename(pfad), klein.size)
