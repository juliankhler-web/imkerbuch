# Prompts für die Scroll-Website (Bilder aus ChatGPT → Animation in Higgsfield)

Idee: Eine Honigbiene von hinten, wir fliegen mit ihr über ein Blumenfeld. Links und
rechts schweben Smartphones mit der App. Beim Scrollen fliegt sie weiter, die nächsten
Handys tauchen auf. Fotorealistisch, Hochglanz.

## Vorgehen (Reihenfolge wichtig)

1. **Schritt 0 zuerst** — den Steckbrief der Biene erzeugen. Das ist dein Referenzbild.
2. Dann **Bild 1**. Wenn es sitzt: in ChatGPT hochladen und bei allen weiteren Bildern
   dazuschreiben: *„Same bee, same lighting and lens as the reference image."*
   Ohne diesen Schritt hat jedes Bild eine andere Biene und die Animation wirkt zerhackt.
3. Jedes Bild **zweimal** erzeugen: `--ar 16:9` für den Rechner, `--ar 9:16` fürs Handy.
   (Bei ChatGPT/DALL·E stattdessen schreiben: „wide cinematic 16:9" bzw. „vertical 9:16".)
4. Die Handy-Bildschirme bleiben **schwarz/spiegelnd**. Screenshots legst du danach drauf.
   Jeder Prompt unten ist **vollständig** – einfach ganzen Block kopieren, nichts einsetzen.
5. In Higgsfield jedes Bild mit einer langsamen Vorwärtsbewegung animieren
   (2–4 Sekunden, Kamera folgt der Biene). Die Bewegungsrichtung ist in jedem Prompt
   schon angelegt, damit die Schnitte ineinanderlaufen.

---

## Stil- und Vermeiden-Baustein (steckt unten schon in jedem Prompt)

```text
STYLE: Photorealistic macro nature photography, shot on a full-frame camera with a
100mm macro lens at f/2.8. Golden-hour sunlight from the upper left, warm honey-amber
tones, soft haze, gentle lens bloom. Extremely shallow depth of field: the bee is
tack-sharp, the background melts into creamy bokeh. Fine dust and pollen motes float
in the light. Ultra high detail, clean, glossy, premium advertising quality, no grain,
no text, no watermark, no logo.
COLOR PALETTE: honey amber, warm gold, deep forest green, soft cream, near-black glass.
```

## VERMEIDEN — in jedes Bild anhängen

```text
AVOID: cartoon, illustration, 3D render look, plastic surfaces, cute anthropomorphic
bee, bee with a face or human eyes, oversized fuzzy bumblebee, wrong insect anatomy
(bees have 6 legs and 4 wings), extra limbs, visible user interface or icons on the
phone screens, any text, letters, numbers or logos anywhere in the image, cluttered
composition, harsh midday light, cold blue tones, HDR over-processing.
```

---

## SCHRITT 0 — Steckbrief der Biene (Referenzbild)

```text
A character reference sheet of ONE single honeybee (Apis mellifera), photorealistic
macro photography. Three views of the same bee side by side on a plain soft cream
background: rear three-quarter view, direct view from behind, side view.

THE BEE (keep these traits identical in every later image): a female worker honeybee,
body about 13 mm long. Densely fuzzy golden-brown thorax with fine pale hairs. Abdomen
with warm amber and dark chocolate-brown bands, slightly glossy. Four translucent,
faintly iridescent wings with visible fine venation. Six slender dark legs; the two
hind legs carry full, bright golden-yellow pollen baskets — packed, rounded, clearly
visible from behind. Two dark compound eyes, short antennae.

STYLE: Photorealistic macro nature photography, shot on a full-frame camera with a
100mm macro lens at f/2.8. Golden-hour sunlight from the upper left, warm honey-amber
tones, soft haze, gentle lens bloom. Extremely shallow depth of field: the bee is
tack-sharp, the background melts into creamy bokeh. Fine dust and pollen motes float
in the light. Ultra high detail, clean, glossy, premium advertising quality, no grain,
no text, no watermark, no logo. Colour palette: honey amber, warm gold, deep forest
green, soft cream, near-black glass.

AVOID: cartoon, illustration, 3D render look, plastic surfaces, cute anthropomorphic
bee, bee with a face or human eyes, oversized fuzzy bumblebee, wrong insect anatomy
(bees have 6 legs and 4 wings), extra limbs, visible user interface or icons on the
phone screens, any text, letters, numbers or logos anywhere in the image, cluttered
composition, harsh midday light, cold blue tones, HDR over-processing.
```

---

## BILD 1 — Start: Abflug über dem Blumenfeld (Hero)

```text
Rear three-quarter view of a single honeybee in flight, seen from BEHIND and slightly
above, as if the camera is flying right behind her. She fills the lower third of the
frame, flying away from the camera into the scene. Her wings are caught in soft motion
blur, her golden pollen baskets are clearly visible from behind.

Below and ahead of her stretches an endless summer meadow in full bloom: wild
cornflowers, red poppies, white daisies and yellow rapeseed, blurring into a soft
carpet of colour towards the horizon. Far in the hazy distance, small and out of focus,
stand two pale wooden beehives at the edge of a treeline. Wide open sky, warm and
bright, with room above the bee for the camera to move into.

The bee travels from the lower left towards the upper right. Nothing crosses the frame
edges. Composition leaves generous empty space on the left and right — phones will be
placed there later.

STYLE: Photorealistic macro nature photography, shot on a full-frame camera with a
100mm macro lens at f/2.8. Golden-hour sunlight from the upper left, warm honey-amber
tones, soft haze, gentle lens bloom. Extremely shallow depth of field: the bee is
tack-sharp, the background melts into creamy bokeh. Fine dust and pollen motes float
in the light. Ultra high detail, clean, glossy, premium advertising quality, no grain,
no text, no watermark, no logo. Colour palette: honey amber, warm gold, deep forest
green, soft cream, near-black glass.

AVOID: cartoon, illustration, 3D render look, plastic surfaces, cute anthropomorphic
bee, bee with a face or human eyes, oversized fuzzy bumblebee, wrong insect anatomy
(bees have 6 legs and 4 wings), extra limbs, visible user interface or icons on the
phone screens, any text, letters, numbers or logos anywhere in the image, cluttered
composition, harsh midday light, cold blue tones, HDR over-processing.
```

## BILD 2 — Erstes Handy links

```text
Same honeybee, same lighting and lens as the reference image. Rear three-quarter view
from behind, the bee continues her flight from the lower left towards the upper right,
now in the centre-right of the frame.

On the LEFT side of the frame, a modern frameless smartphone floats upright between the
flowers like a smooth monolith, tilted very slightly towards the camera. It is large in
relation to the bee — roughly ten times her body length — and this scale is intentional.
Its screen is switched OFF: pure black glass, mirror-like, catching a soft warm
reflection of the sky and a hint of the meadow. Slim brushed-aluminium edges with a thin
golden rim of sunlight. It is sharp enough to read as a real object but a touch softer
than the bee.

Around its base, poppies and cornflowers lean into the frame. A few pollen motes drift
between the bee and the phone.

STYLE: Photorealistic macro nature photography, shot on a full-frame camera with a
100mm macro lens at f/2.8. Golden-hour sunlight from the upper left, warm honey-amber
tones, soft haze, gentle lens bloom. Extremely shallow depth of field: the bee is
tack-sharp, the background melts into creamy bokeh. Fine dust and pollen motes float
in the light. Ultra high detail, clean, glossy, premium advertising quality, no grain,
no text, no watermark, no logo. Colour palette: honey amber, warm gold, deep forest
green, soft cream, near-black glass.

AVOID: cartoon, illustration, 3D render look, plastic surfaces, cute anthropomorphic
bee, bee with a face or human eyes, oversized fuzzy bumblebee, wrong insect anatomy
(bees have 6 legs and 4 wings), extra limbs, visible user interface or icons on the
phone screens, any text, letters, numbers or logos anywhere in the image, cluttered
composition, harsh midday light, cold blue tones, HDR over-processing.
```

## BILD 3 — Zweites Handy rechts, tiefer über den Blüten

```text
Same honeybee, same lighting and lens as the reference image. Rear view from behind,
now lower — she skims just above the flower heads, close enough that the blossoms bend
in her downwash. Camera low, almost at flower height, looking along her flight path.

On the RIGHT side of the frame, a second frameless smartphone floats upright among tall
grasses, angled slightly away. Screen OFF: black mirror glass reflecting warm gold and
green. A single bright specular highlight runs down its edge.

The left half of the frame stays open: soft, out-of-focus blossoms and light. The bee
still travels towards the upper right.

STYLE: Photorealistic macro nature photography, shot on a full-frame camera with a
100mm macro lens at f/2.8. Golden-hour sunlight from the upper left, warm honey-amber
tones, soft haze, gentle lens bloom. Extremely shallow depth of field: the bee is
tack-sharp, the background melts into creamy bokeh. Fine dust and pollen motes float
in the light. Ultra high detail, clean, glossy, premium advertising quality, no grain,
no text, no watermark, no logo. Colour palette: honey amber, warm gold, deep forest
green, soft cream, near-black glass.

AVOID: cartoon, illustration, 3D render look, plastic surfaces, cute anthropomorphic
bee, bee with a face or human eyes, oversized fuzzy bumblebee, wrong insect anatomy
(bees have 6 legs and 4 wings), extra limbs, visible user interface or icons on the
phone screens, any text, letters, numbers or logos anywhere in the image, cluttered
composition, harsh midday light, cold blue tones, HDR over-processing.
```

## BILD 4 — Weite Aufnahme: mehrere Handys wie eine Allee

```text
Same honeybee, same lighting and lens as the reference image. Wider shot, camera further
back and higher. The bee is small but still sharp, seen from behind in the lower centre,
flying away from us down a shallow corridor.

FOUR frameless smartphones float upright in the meadow, two on the left and two on the
right, staggered in depth like a quiet avenue leading towards the horizon. The nearest
pair is larger and sharper; the far pair is smaller and softly out of focus. Every
screen is OFF — black mirror glass, each catching the golden sky at a slightly different
angle.

Between them the flower meadow glows in the low sun. Long soft shadows reach towards
the camera. Deep sense of distance and calm.

STYLE: Photorealistic macro nature photography, shot on a full-frame camera with a
100mm macro lens at f/2.8. Golden-hour sunlight from the upper left, warm honey-amber
tones, soft haze, gentle lens bloom. Extremely shallow depth of field: the bee is
tack-sharp, the background melts into creamy bokeh. Fine dust and pollen motes float
in the light. Ultra high detail, clean, glossy, premium advertising quality, no grain,
no text, no watermark, no logo. Colour palette: honey amber, warm gold, deep forest
green, soft cream, near-black glass.

AVOID: cartoon, illustration, 3D render look, plastic surfaces, cute anthropomorphic
bee, bee with a face or human eyes, oversized fuzzy bumblebee, wrong insect anatomy
(bees have 6 legs and 4 wings), extra limbs, visible user interface or icons on the
phone screens, any text, letters, numbers or logos anywhere in the image, cluttered
composition, harsh midday light, cold blue tones, HDR over-processing.
```

## BILD 5 — Aufstieg: die Landschaft im Umkreis

```text
Same honeybee, same lighting and lens as the reference image. The camera has risen with
her: we look from behind and above as she climbs, the meadow now far below. Beneath her
a patchwork landscape opens up — flowering fields, hedgerows, a small orchard, a strip
of mixed woodland, a narrow country lane — softly hazy in the warm afternoon light.

On the RIGHT, a single frameless smartphone floats large in the foreground, upright and
slightly tilted, screen OFF and mirror-black, reflecting the landscape and sky. It is
the sharpest object after the bee.

Airy, spacious, aerial feeling. The bee remains in the lower left third, flying towards
the upper right.

STYLE: Photorealistic macro nature photography, shot on a full-frame camera with a
100mm macro lens at f/2.8. Golden-hour sunlight from the upper left, warm honey-amber
tones, soft haze, gentle lens bloom. Extremely shallow depth of field: the bee is
tack-sharp, the background melts into creamy bokeh. Fine dust and pollen motes float
in the light. Ultra high detail, clean, glossy, premium advertising quality, no grain,
no text, no watermark, no logo. Colour palette: honey amber, warm gold, deep forest
green, soft cream, near-black glass.

AVOID: cartoon, illustration, 3D render look, plastic surfaces, cute anthropomorphic
bee, bee with a face or human eyes, oversized fuzzy bumblebee, wrong insect anatomy
(bees have 6 legs and 4 wings), extra limbs, visible user interface or icons on the
phone screens, any text, letters, numbers or logos anywhere in the image, cluttered
composition, harsh midday light, cold blue tones, HDR over-processing.
```

## BILD 6 — Finale: Rückflug zum Stand im Abendlicht

```text
Same honeybee, same lighting and lens as the reference image, but now in late evening
light: deep amber sun very low, long warm shadows, sky graduating from gold to soft
rose. Rear view from behind as she flies home, wings blurred, pollen baskets still full.

Ahead of her, no longer distant: two pale wooden beehives on a mown strip at the edge of
the meadow, warmly lit, gently out of focus. A few other bees are tiny specks of light
near the entrances.

On the LEFT, one frameless smartphone floats upright, screen OFF, black glass glowing
with the reflected sunset. Calm, satisfied, end-of-day mood. Generous empty sky in the
upper third for a headline.

STYLE: Photorealistic macro nature photography, shot on a full-frame camera with a
100mm macro lens at f/2.8. Golden-hour sunlight from the upper left, warm honey-amber
tones, soft haze, gentle lens bloom. Extremely shallow depth of field: the bee is
tack-sharp, the background melts into creamy bokeh. Fine dust and pollen motes float
in the light. Ultra high detail, clean, glossy, premium advertising quality, no grain,
no text, no watermark, no logo. Colour palette: honey amber, warm gold, deep forest
green, soft cream, near-black glass.

AVOID: cartoon, illustration, 3D render look, plastic surfaces, cute anthropomorphic
bee, bee with a face or human eyes, oversized fuzzy bumblebee, wrong insect anatomy
(bees have 6 legs and 4 wings), extra limbs, visible user interface or icons on the
phone screens, any text, letters, numbers or logos anywhere in the image, cluttered
composition, harsh midday light, cold blue tones, HDR over-processing.
```

---

## Danach: Bewegung in Higgsfield

Je Bild eine ruhige Bewegung, 2–4 Sekunden, damit die Übergänge beim Scrollen fließen:

| Bild | Bewegung |
|---|---|
| 1 | Kamera schiebt langsam vorwärts, leicht aufwärts; Flügel flattern |
| 2 | Kamera driftet nach rechts, das Handy links zieht vorbei |
| 3 | Kamera senkt sich, Blüten wiegen sich im Luftzug |
| 4 | langsamer Vorwärtsflug durch die Handy-Allee |
| 5 | Kamera steigt weiter, Landschaft zieht nach unten |
| 6 | Kamera bremst ab, Sonne flackert kurz im Glas |

Wichtig: **immer dieselbe Bewegungsrichtung** (vorwärts, leicht nach rechts oben).
Wechselt die Richtung, wirkt das Scrollen wie ein Ruck.

---

## Welcher Screenshot auf welches Handy

Alle Aufnahmen liegen in `website-assets/screenshots/`, je Ansicht einmal `dark-` und
einmal `light-`, 1290 × 2796 px (3-fach, randlos, ohne Namen, ohne Hinweis-Banner).

**Für das Video: dunkel.** Ein dunkler Bildschirm liest sich in einer sonnigen Szene wie
ein leuchtendes Display; ein heller wird zur weißen Fläche. Die honiggoldenen Akzente der
App treffen außerdem genau die Farben des Blumenfelds.

| Bild | Handy | Screenshot | Was es zeigt |
|---|---|---|---|
| 1 | – | – | nur Biene und Feld, der Einstieg |
| 2 | links | `dark-01-dashboard` | alles auf einen Blick |
| 3 | rechts | `dark-03-stockkarte` | das Herz: jedes Volk dokumentiert |
| 4 | 4 Stück | `dark-06-honig`, `dark-04-koeniginnen`, `dark-09-aufgaben`, `dark-07-kassenbuch` | die Allee: Honig, Königinnen, Aufgaben, Kassenbuch |
| 5 | rechts | `dark-11-bio` | Öko-Kontrolle mit amtlicher Landbedeckung |
| 6 | links | `dark-12-imkerschule` | die Imkerschule als Abschluss |

Das sind **8 Screenshots im Video** – mehr wird beim Scrollen zu hektisch.

## Nach dem Video: Überblendung und der Infoteil

Am Ende von Bild 6 blendet das Video in den Infoteil über. Damit die Überblendung nicht
hart schneidet: das letzte Bild endet im **Abendgold**, der Infoteil beginnt mit genau
dieser Farbe als Hintergrund und wird nach unten dunkler. Technisch ein Verlauf über die
letzte Videoszene (`opacity` von 1 auf 0 über eine Bildschirmhöhe Scrollweg), darunter
liegt schon der Infoteil.

Der Infoteil zeigt dann **alle Bereiche einzeln**, jeder mit seinem eigenen Bild – hell
oder dunkel, hier passt hell besser, weil darunter Text steht:

| # | Bereich | Screenshot |
|---|---|---|
| 1 | Völker & Stockkarten | `light-02-voelker` / `light-03-stockkarte` |
| 2 | Königinnen & Zucht | `light-04-koeniginnen` / `light-05-zucht` |
| 3 | Honig, Chargen & Abfüllung | `light-06-honig` |
| 4 | Kassenbuch | `light-07-kassenbuch` |
| 5 | Rechnungen (§ 24, § 19) | `light-08-rechnungen` |
| 6 | Aufgaben & Kalender | `light-09-aufgaben` |
| 7 | Material, Lager & Pfand | `light-10-material` |
| 8 | Öko-Kontrolle | `light-11-bio` |
| 9 | Imkerschule & FAQ | `light-12-imkerschule` |
| 10 | Fahrtenbuch | `light-13-fahrten` |
| 11 | Auswertungen & PDFs | `light-14-reporting` |
| 12 | Marktverkauf | `light-15-markt` |
| 13 | Rechner (Futter, Selbstkosten) | `light-16-rechner` |
| 14 | Übersicht / Widgets | `light-01-dashboard` |

Wie die Screenshots entstanden sind: `node shots.mjs <ordner>` steuert Chrome über das
DevTools-Protokoll, lädt die App mit `?testdb=1`, legt Beispieldaten an, leert den Namen
im Gruß, entfernt die Hinweis-Banner und fotografiert jede Route in beiden Themes.
Zum Nachziehen nach Änderungen an der App einfach erneut laufen lassen.
