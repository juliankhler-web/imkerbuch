#!/usr/bin/env python3
"""Setzt in die App-Bilder der Website (website-neu/varianten/app-bilder, 780 px breit,
2-fach aufgenommen) oben links das neue 3D-Logo statt des alten flachen und schreibt die
640-px-Fassungen nach website-neu/media/app-bilder und website-upload/media/app-bilder.
Die Originale in varianten/ bleiben unverändert. Julian 03.11.2026: „es muss alles einheitlich sein“.
Aufruf: cd ~/ImkerApp && python3 tools/blender/logo-in-webbildern.py"""
import glob, os
from PIL import Image

WURZEL = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
QUELLE = os.path.join(WURZEL, "website-neu/varianten/app-bilder")
ZIELE = [os.path.join(WURZEL, "website-neu/media/app-bilder"), os.path.join(WURZEL, "website-upload/media/app-bilder")]
LOGO = Image.open(os.path.join(WURZEL, "assets/logo/imkerbuch-logo.png")).convert("RGBA")

# Das alte Logo war ein 26-px-SVG (bei 2-fach = 52 px) mit Kasten 36..88 / 35..87;
# logoBild(26) zeigt das neue Logo im selben Kasten.
KASTEN = (36, 35, 88, 87)

for pfad in sorted(glob.glob(os.path.join(QUELLE, "*.webp"))):
    bild = Image.open(pfad).convert("RGBA")
    assert bild.size[0] == 780, (pfad, bild.size)
    grund = bild.getpixel((30, 61))  # Kopfzeilen-Hintergrund links neben dem Logo
    x0, y0, x1, y1 = KASTEN
    bild.paste(grund, (x0 - 2, y0 - 2, x1 + 2, y1 + 2))
    bild.alpha_composite(LOGO.resize((x1 - x0, y1 - y0), Image.LANCZOS), (x0, y0))
    klein = bild.convert("RGB").resize((640, round(640 * bild.size[1] / bild.size[0])), Image.LANCZOS)
    for ziel in ZIELE:
        klein.save(os.path.join(ziel, os.path.basename(pfad)), quality=80, method=6)
    print("✓", os.path.basename(pfad), klein.size)
