#!/usr/bin/env python3
"""Erzeugt aus dem Blender-Bild der 3D-Waben (tools/blender/waben-1024.png, transparent,
Ansicht von vorn) alle App-Symbole und die Startbilder von iPhone und Android.
Julian 03.11.2026: App-Symbol = die drei Waben aus dem Logo in 3D, heller Creme-Grund.
Aufruf: cd ~/ImkerApp && python3 tools/blender/app-symbol.py
Danach: ./native/sync-app.sh (kopiert icon-*.png in die App-Pakete)."""
import os
from PIL import Image, ImageDraw

HIER = os.path.dirname(os.path.abspath(__file__))
WURZEL = os.path.abspath(os.path.join(HIER, "..", ".."))
RES = os.path.join(WURZEL, "native/android/app/src/main/res")
IOS = os.path.join(WURZEL, "native/ios/App/App/Assets.xcassets")

CREME = (255, 248, 234)         # Grund des App-Symbols (wie das bisherige Symbol)
START_HELL = (250, 246, 239)    # = --bg hell in index.html, damit der Übergang zum Startbildschirm nahtlos ist
START_DUNKEL = (22, 22, 25)     # = --bg dunkel
ANTEIL = 0.74                   # Breite des Blender-Bildes im Symbol; die Waben selbst füllen davon ~80 % (~59 % des Symbols)

waben = Image.open(os.path.join(HIER, "waben-1024.png")).convert("RGBA")


def symbol(groesse, grund=CREME, anteil=ANTEIL):
    s = Image.new("RGBA", (groesse, groesse), grund + (255,) if grund else (0, 0, 0, 0))
    w = round(groesse * anteil)
    s.alpha_composite(waben.resize((w, w), Image.LANCZOS), ((groesse - w) // 2, (groesse - w) // 2))
    return s


def mit_maske(bild, alt_datei):
    """Form (abgerundetes Quadrat bzw. Kreis) vom bisherigen Android-Symbol übernehmen."""
    maske = Image.open(alt_datei).convert("RGBA").getchannel("A")
    bild.putalpha(maske)
    return bild


def speichern(bild, pfad, rgb=False):
    (bild.convert("RGB") if rgb else bild).save(pfad, optimize=True)
    print("  ", os.path.relpath(pfad, WURZEL), bild.size[0], "px")


print("Web/PWA und Google-Play-Symbol:")
for g in (512, 192, 180):
    speichern(symbol(g), os.path.join(WURZEL, f"icon-{g}.png"))

print("iPhone (App Store verlangt 1024 px ohne Transparenz):")
speichern(symbol(1024), os.path.join(IOS, "AppIcon.appiconset/AppIcon-512@2x.png"), rgb=True)

print("Android:")
for ordner, alt in {"mipmap-ldpi": 36, "mipmap-mdpi": 48, "mipmap-hdpi": 72, "mipmap-xhdpi": 96, "mipmap-xxhdpi": 144, "mipmap-xxxhdpi": 192}.items():
    d = os.path.join(RES, ordner)
    ebene = round(alt * 108 / 48)  # adaptive Ebenen sind 108 dp groß
    # Vordergrund transparent, Hintergrund Creme; die XML legt beide mit 16,7 % Rand an
    speichern(symbol(ebene, grund=None), os.path.join(d, "ic_launcher_foreground.png"))
    speichern(Image.new("RGBA", (ebene, ebene), CREME + (255,)), os.path.join(d, "ic_launcher_background.png"))
    speichern(mit_maske(symbol(alt), os.path.join(d, "ic_launcher.png")), os.path.join(d, "ic_launcher.png"))
    speichern(mit_maske(symbol(alt), os.path.join(d, "ic_launcher_round.png")), os.path.join(d, "ic_launcher_round.png"))


def startbild(breite, hoehe, grund, waben_px):
    s = Image.new("RGB", (breite, hoehe), grund)
    w = waben.resize((waben_px, waben_px), Image.LANCZOS)
    s.paste(w, ((breite - waben_px) // 2, (hoehe - waben_px) // 2), w)
    return s


print("Startbilder iPhone (2732er Fläche, auf dem Handy ~1260 px sichtbar breit → Waben wie im Startbildschirm 50 %):")
for datei in os.listdir(os.path.join(IOS, "Splash.imageset")):
    if datei.startswith("Default@") and datei.endswith(".png"):
        grund = START_DUNKEL if "-dark" in datei else START_HELL
        speichern(startbild(2732, 2732, grund, 630), os.path.join(IOS, "Splash.imageset", datei))

print("Startbilder Android (Waben = halbe Breite, höchstens 220 dp wie im Startbildschirm):")
DICHTE = {"ldpi": .75, "mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}
for ordner in sorted(os.listdir(RES)):
    pfad = os.path.join(RES, ordner, "splash.png")
    if not (ordner.startswith("drawable") and os.path.exists(pfad)):
        continue
    b, h = Image.open(pfad).size
    dichte = next((v for k, v in DICHTE.items() if ordner.endswith("-" + k) or f"-{k}" in ordner), 1)
    grund = START_DUNKEL if "night" in ordner else START_HELL
    speichern(startbild(b, h, grund, round(min(b / 2, 220 * dichte))), pfad)
print("fertig")
