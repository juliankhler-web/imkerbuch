# App-Symbol: 3D-Waben auf Hintergrund setzen (1024er), Vorschau mit runden Ecken
import sys, os
from PIL import Image, ImageDraw

b = sys.argv[1]
ziel = f"{b}/symbol"
GRUENDE = {"creme": (255, 248, 234), "dunkel": (28, 27, 24)}
ANTEIL = 0.74  # Breite des Renderbildes im Symbol (Logo selbst ~80 % davon = ~59 %)


def symbol(render, grund, groesse=1024):
    s = Image.new("RGBA", (groesse, groesse), grund + (255,))
    r = Image.open(render).convert("RGBA")
    w = int(groesse * ANTEIL)
    r = r.resize((w, w), Image.LANCZOS)
    s.alpha_composite(r, ((groesse - w) // 2, (groesse - w) // 2))
    return s


def rund(im, radius=0.2237):
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, im.size[0] - 1, im.size[1] - 1], radius=int(im.size[0] * radius), fill=255)
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.paste(im, (0, 0), m)
    return out


blatt = Image.new("RGB", (4 * 330 + 30, 330 + 120), (236, 236, 236))
x = 30
for name, grund in GRUENDE.items():
    for winkel in ("000", "018"):
        s = symbol(f"{ziel}/probe-{winkel}.png", grund)
        s.convert("RGB").save(f"{ziel}/symbol-{name}-{winkel}.png")
        gross = rund(s.resize((300, 300), Image.LANCZOS))
        blatt.paste(gross, (x, 20), gross)
        klein = rund(s.resize((60, 60), Image.LANCZOS))
        blatt.paste(klein, (x + 120, 345), klein)
        x += 330
blatt.save(f"{ziel}/symbol-blatt.png")
print("fertig")
