# -*- coding: utf-8 -*-
"""Schneidet die 24 Tagesbienen aus Julians Blatt und stellt sie frei.

Drei Dinge, die jeweils einzeln nötig waren – bei Bedarf hier nachlesen statt neu
herleiten:

1. Hintergrund: JEDES Pixel in Blattfarbe ist Saatpunkt, nicht nur der Rand –
   sonst bleiben eingeschlossene Flächen stehen (Spalt zwischen Biene und
   Laptop, Innenflächen der Brillengläser).
2. Rand: ein Mischpixel aus Blattfarbe und Motiv ist weder das eine noch das
   andere. Echte Motivfarbe F aus dem Nachbarn weiter innen holen und
   p = a·F + (1-a)·BG nach a lösen. Zwei Ringe, weil die Kantenglättung des
   Blattes 2 px breit ist. Ohne das bleibt ein grauer Saum an den Konturen.
3. Helle Konturlinien: die Bilder sind für cremefarbenen Grund gezeichnet und
   haben hell gezeichnete Kanten (deutlich am Laptop). Auf dunklem Grund sind
   das leuchtende Haare. Zwei Merkmale trennen sie von echten hellen Dingen,
   BEIDE sind nötig – einzeln richten sie Schaden an:
     · DICKE: eine Linie ist nach 1–2 Pixeln vorbei, ein Flügel bleibt innen hell.
     · FARBIGKEIT: die Linie ist grau. Nur nach Dicke zu gehen fraß die
       Sonnenstrahlen und die Kanten des gelben Körpers weg (ausprobiert).
"""
from PIL import Image
from collections import deque
import os, pathlib

# Julians Blatt mit 24 Bienen (6 Spalten × 4 Reihen, 1536×1024). Pfad anpassen,
# falls die Datei verschoben wird.
QUELLE = '/Users/juliankoehler/Downloads/5D36E776-F282-4D32-8633-C4D01AC919A4.PNG'
ZIEL = str(pathlib.Path(__file__).resolve().parent.parent / 'assets' / 'bienen')
BAENDER = [(44, 216), (314, 480), (572, 726), (810, 968)]   # gemessene Bildbänder je Reihe
BG = (252, 246, 237)
T_HART, T_DRIN = 16, 110      # Blattfarbe / sicher Motiv
NAH = 5                        # so nah darf ein Fleck an der Biene kleben und zählt dazu (zZZ)
RINGE = 2                      # Ringe der Randberechnung
LINIE_HELL = 150               # ab dieser Helligkeit kommt ein Randpixel als heller Strich in Frage
LINIE_DICK = 2                 # so dünn darf die helle Stelle höchstens sein, um als Strich zu gelten
LINIE_INNEN = 165              # bis zu dieser Helligkeit zählt ein Pixel noch als "hell" beim Messen der Dicke
LINIE_TIEFE = 3                # so viele Ringe werden geprüft
LINIE_SATT = 0.13              # nur GRAUE Striche dämpfen – Sonne und Körper sind farbig und bleiben

def abst(p):
    return abs(p[0]-BG[0]) + abs(p[1]-BG[1]) + abs(p[2]-BG[2])

def lum(p):
    return (p[0] + p[1] + p[2]) / 3

def sattheit(p):
    """Farbigkeit 0..1. Eine gezeichnete Kantenlinie ist grau (nahe 0), die
    Sonnenstrahlen und der Bienenkörper sind kräftig gelb."""
    hoch, tief = max(p), min(p)
    return 0.0 if hoch == 0 else (hoch - tief) / hoch

def freistellen(rgb):
    w, h = rgb.size
    q = rgb.load()
    # --- 1) Hintergrund, auch eingeschlossen ---
    hg = bytearray(w*h); dq = deque()
    for x in range(w):
        for y in range(h):
            if abst(q[x, y]) <= T_HART:
                hg[x*h+y] = 1; dq.append((x, y))
    while dq:
        x, y = dq.popleft()
        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx, ny = x+dx, y+dy
            if 0 <= nx < w and 0 <= ny < h and not hg[nx*h+ny] and abst(q[nx, ny]) < T_DRIN:
                hg[nx*h+ny] = 1; dq.append((nx, ny))
    alpha = [[0 if hg[x*h+y] else 255 for y in range(h)] for x in range(w)]
    farbe = [[q[x, y] for y in range(h)] for x in range(w)]

    def innenRichtung(x, y):
        """Richtung nach innen und der Nachbar draußen – None, wenn kein Randpixel."""
        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx, ny = x+dx, y+dy
            if 0 <= nx < w and 0 <= ny < h and alpha[nx][ny] < 200:
                return dx, dy
        return None

    # --- 2) Rand richtig rechnen ---
    for _ in range(RINGE):
        neu = []
        for x in range(w):
            for y in range(h):
                if alpha[x][y] != 255: continue
                r = innenRichtung(x, y)
                if not r: continue
                dx, dy = r
                F = None
                for schritt in (2, 3, 1):
                    fx, fy = x - dx*schritt, y - dy*schritt
                    if 0 <= fx < w and 0 <= fy < h and alpha[fx][fy] == 255:
                        F = farbe[fx][fy]; break
                if F is None: continue
                teile = [(q[x, y][k] - BG[k]) / (F[k] - BG[k]) for k in range(3) if abs(F[k] - BG[k]) > 25]
                if teile: a = sum(teile) / len(teile)
                elif abst(F) > 20: a = abst(q[x, y]) / abst(F)
                else: continue
                neu.append((x, y, F, max(0.0, min(1.0, a))))
        for x, y, F, a in neu:
            farbe[x][y] = F; alpha[x][y] = int(round(a * 255))

    # --- 3) Helle Konturlinien dämpfen ---
    # Unterschied zu echten hellen Dingen ist die DICKE, nicht die Helligkeit:
    # ein Flügel ist auch zwei, fünf, zehn Pixel weiter innen hell, eine
    # gezeichnete Kantenlinie ist nach ein bis zwei Pixeln vorbei.
    gedaempft = 0
    for _ring in range(LINIE_TIEFE):
        kandidaten = []
        for x in range(w):
            for y in range(h):
                if alpha[x][y] < 200: continue
                r = innenRichtung(x, y)
                if not r: continue
                dx, dy = r
                if lum(farbe[x][y]) < LINIE_HELL: continue
                if sattheit(farbe[x][y]) > LINIE_SATT: continue      # farbig = gehört zum Motiv
                dicke = 0; dahinter = None
                for schritt in range(1, LINIE_DICK + 4):
                    fx, fy = x - dx*schritt, y - dy*schritt
                    if not (0 <= fx < w and 0 <= fy < h) or alpha[fx][fy] < 200: break
                    if lum(farbe[fx][fy]) >= LINIE_INNEN: dicke += 1
                    else: dahinter = farbe[fx][fy]; break
                if dicke > LINIE_DICK or dahinter is None: continue      # dickes helles Ding: bleibt
                mischung = tuple(int(round(0.4*farbe[x][y][k] + 0.6*dahinter[k])) for k in range(3))
                kandidaten.append((x, y, mischung, int(alpha[x][y] * 0.45)))
        for x, y, c, a in kandidaten:
            farbe[x][y] = c; alpha[x][y] = a
        gedaempft += len(kandidaten)

    out = Image.new('RGBA', (w, h)); o = out.load()
    for x in range(w):
        for y in range(h):
            o[x, y] = (*farbe[x][y], alpha[x][y]) if alpha[x][y] else (0, 0, 0, 0)
    return out, gedaempft

def flecken(bild):
    px = bild.load(); w, h = bild.size
    bes = bytearray(w*h); erg = []
    for sx in range(w):
        for sy in range(h):
            if bes[sx*h+sy] or px[sx, sy][3] < 40: continue
            dq = deque([(sx, sy)]); bes[sx*h+sy] = 1
            x0=x1=sx; y0=y1=sy; n=0
            while dq:
                x, y = dq.popleft(); n += 1
                x0, x1, y0, y1 = min(x0,x), max(x1,x), min(y0,y), max(y1,y)
                for dx, dy in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(-1,-1),(1,-1),(-1,1)):
                    nx, ny = x+dx, y+dy
                    if 0 <= nx < w and 0 <= ny < h and not bes[nx*h+ny] and px[nx, ny][3] >= 40:
                        bes[nx*h+ny] = 1; dq.append((nx, ny))
            erg.append({'n': n, 'box': (x0, y0, x1+1, y1+1)})
    return sorted(erg, key=lambda f: -f['n'])

def absBox(a, b):
    return max(max(0, max(a[0]-b[2], b[0]-a[2])), max(0, max(a[1]-b[3], b[1]-a[3])))

def main():
    im = Image.open(QUELLE).convert('RGB')
    zelle = im.size[0] // 6
    gesamt = 0; linien = 0
    for reihe, (oben, unten) in enumerate(BAENDER):
        for spalte in range(6):
            st = reihe*6 + spalte
            frei, n = freistellen(im.crop((spalte*zelle, oben-6, (spalte+1)*zelle, unten+6)))
            linien += n
            fl = flecken(frei)
            if not fl: continue
            haupt = fl[0]; box = list(haupt['box'])
            for f in fl[1:]:
                if absBox(haupt['box'], f['box']) <= NAH and f['n'] >= haupt['n']*0.004:
                    box = [min(box[0], f['box'][0]), min(box[1], f['box'][1]), max(box[2], f['box'][2]), max(box[3], f['box'][3])]
            eng = frei.crop(tuple(box))
            seite = max(eng.size) + 8
            quad = Image.new('RGBA', (seite, seite), (0, 0, 0, 0))
            quad.paste(eng, ((seite-eng.width)//2, (seite-eng.height)//2), eng)
            ziel = f'{ZIEL}/biene-{st:02d}.webp'
            quad.resize((216, 216), Image.LANCZOS).save(ziel, 'WEBP', quality=88, method=6, exact=True)
            gesamt += os.path.getsize(ziel)
    print(f'24 Bilder geschrieben, {gesamt/1024:.0f} KB · {linien} Pixel heller Konturlinien gedämpft')

if __name__ == '__main__':
    main()
