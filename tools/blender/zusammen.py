# Einzelbilder -> animierte WebP (transparent) + Vorschau-GIFs auf dunklem/hellem Grund
# Ergebnis für die App (03.11.2026): python3 zusammen.py <bilder> <ziel> 480 60  -> assets/start/ (484 KB)
import sys, glob, os
from PIL import Image

quelle, ziel = sys.argv[1], sys.argv[2]
px = int(sys.argv[3]) if len(sys.argv) > 3 else 480
qual = int(sys.argv[4]) if len(sys.argv) > 4 else 60
os.makedirs(ziel, exist_ok=True)
bilder = [Image.open(f).convert("RGBA").resize((px, px), Image.LANCZOS) for f in sorted(glob.glob(f"{quelle}/bild-*.png"))]
n = len(bilder)
# 2,2 s Drehung gleichmäßig auf n Bilder verteilen (ganze ms), danach 1,8 s Ruhe = 4 s je Runde
grenzen = [round(2200 * k / n) for k in range(n + 1)]
dauer = [grenzen[k + 1] - grenzen[k] for k in range(n)]
folge = bilder + [bilder[0]]
dauer = dauer + [1800]
assert sum(dauer) == 4000, sum(dauer)
webp = f"{ziel}/start-waben.webp"
folge[0].save(webp, save_all=True, append_images=folge[1:], duration=dauer, loop=0,
              quality=qual, method=6, alpha_quality=70)
bilder[0].save(f"{ziel}/start-waben-ruhe.webp", quality=85, method=6, alpha_quality=90)
print("WebP", px, "px, Qualität", qual, ":", os.path.getsize(webp) // 1024, "KB,", n + 1, "Bilder,", sum(dauer), "ms")
# Vorschau-GIFs
for name, grund in [("dunkel", (22, 21, 15)), ("hell", (247, 241, 230))]:
    gif = []
    for b in folge:
        k = Image.new("RGBA", b.size, grund + (255,)); k.alpha_composite(b)
        gif.append(k.convert("RGB").resize((300, 300), Image.LANCZOS).quantize(colors=200, method=Image.Quantize.MEDIANCUT))
    gif[0].save(f"{ziel}/vorschau-{name}.gif", save_all=True, append_images=gif[1:], duration=dauer, loop=0, disposal=1)
print("GIFs fertig")
