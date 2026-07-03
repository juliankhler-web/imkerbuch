#!/usr/bin/env python3
"""Erzeugt die ImkerBuch-App-Icons (drei Waben) als PNG: 512, 192, 180 px.
Nur Dev-Werkzeug – die App selbst braucht dieses Skript nicht."""
import math
from PIL import Image, ImageDraw

AMBER = (232, 160, 19, 255)       # Honig-Amber (gefüllte Wabe)
ANTHRAZIT = (42, 42, 48, 255)     # Outline-Waben
BG = (255, 248, 234, 255)         # warmes Creme (maskable-sicher)

SS = 4  # Supersampling


def hex_points(cx, cy, r):
    """Flat-Top-Hexagon: Eckpunkte im Uhrzeigersinn."""
    return [(cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)))
            for a in range(0, 360, 60)]


def draw_hex(d, cx, cy, r, width, color, filled):
    pts = hex_points(cx, cy, r)
    if filled:
        d.polygon(pts, fill=color)
    # Linienzug mit runden Ecken (joint) + Punkt je Ecke für "leicht abgerundet"
    d.line(pts + [pts[0]], fill=color, width=width, joint="curve")
    for (x, y) in pts:
        d.ellipse([x - width / 2, y - width / 2, x + width / 2, y + width / 2], fill=color)


def make_icon(size, fname):
    S = size * SS
    img = Image.new("RGBA", (S, S), BG)
    d = ImageDraw.Draw(img)

    r = S * 0.175            # Wabenradius
    gap_r = r * 0.86         # gezeichneter Radius (Lücke zwischen Waben)
    lw = max(int(S * 0.028), 2)

    # Honeycomb-Versatz (flat-top): rechts-unten (1.5r, √3/2·r), darunter (0, √3·r)
    ax, ay = 0.0, 0.0
    bx, by = 1.5 * r, math.sqrt(3) / 2 * r
    cx_, cy_ = 0.0, math.sqrt(3) * r

    # Cluster zentrieren
    minx, maxx = ax - r, bx + r
    miny, maxy = ay - math.sqrt(3) / 2 * r, cy_ + math.sqrt(3) / 2 * r
    ox = (S - (maxx - minx)) / 2 - minx
    oy = (S - (maxy - miny)) / 2 - miny

    draw_hex(d, ax + ox, ay + oy, gap_r, lw, AMBER, filled=True)       # gefüllte Wabe
    draw_hex(d, bx + ox, by + oy, gap_r, lw, ANTHRAZIT, filled=False)  # Outline
    draw_hex(d, cx_ + ox, cy_ + oy, gap_r, lw, ANTHRAZIT, filled=False)

    img = img.resize((size, size), Image.LANCZOS)
    img.save(fname)
    print(f"{fname}: {size}x{size}")


if __name__ == "__main__":
    make_icon(512, "icon-512.png")
    make_icon(192, "icon-192.png")
    make_icon(180, "icon-180.png")
