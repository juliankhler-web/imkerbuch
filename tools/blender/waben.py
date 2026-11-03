# ImkerBuch: drei Waben aus dem Logo als 3D-Körper.
# Aufruf: Blender -b -P waben.py -- <modus> <ausgabe> [optionen]
#   modus "probe":  wenige Standbilder (Winkel aus --winkel) zum Ansehen
#   modus "anim":   alle Bilder der Drehung (transparenter Hintergrund)
#   modus "symbol": ein Standbild mit Hintergrundfarbe für das App-Symbol
# So entstanden Startanimation und App-Symbol (03.11.2026, Blender 5.2.3):
#   LICHT="haupt=1500 aufhell=280 kantenlicht=1100 umgebung=0.12 lack=0.12 rauh=0.31 hell=#FAC548 dunkel=#E28800"
#   Blender -b --factory-startup -P waben.py -- anim <ordner> px=600 samples=64 bilder=66 $LICHT
#   Blender -b --factory-startup -P waben.py -- probe <ordner> px=1024 samples=160 winkel=0 $LICHT   (App-Symbol)
# Drehung: 66 Bilder über 2,2 s mit cubic-bezier(.55,0,.35,1), danach 1,8 s Ruhe = 4 s je Runde.
import bpy, bmesh, math, sys, os

argv = sys.argv[sys.argv.index("--") + 1:]
modus, ausgabe = argv[0], argv[1]
opt = {a.split("=")[0]: a.split("=")[1] for a in argv[2:] if "=" in a}
GROESSE = int(opt.get("px", "512"))
SAMPLES = int(opt.get("samples", "128"))
os.makedirs(ausgabe, exist_ok=True)

def lin(h):
    """sRGB-Hex -> lineare Farbe (Blender rechnet linear)."""
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c] + [1.0]

# ---------- Szene leeren ----------
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

# ---------- Waben: Mittelpunkte wie im Logo (viewBox 64, Radius 11) ----------
R, TIEFE = 1.1, float(opt.get("tiefe", "0.5"))
MITTEN = [((20.4 - 32) / 10, (32.05 - 21.8) / 10), ((43.6 - 32) / 10, (32.05 - 21.8) / 10), (0.0, (32.05 - 42.3) / 10)]

mat = bpy.data.materials.new("Honig"); mat.use_nodes = True
nt = mat.node_tree; n = nt.nodes; l = nt.links
bsdf = n["Principled BSDF"]
bsdf.inputs["Roughness"].default_value = float(opt.get("rauh", "0.30"))
bsdf.inputs["Coat Weight"].default_value = float(opt.get("lack", "0.35"))
bsdf.inputs["Coat Roughness"].default_value = 0.12
tc = n.new("ShaderNodeTexCoord"); sep = n.new("ShaderNodeSeparateXYZ")
mx = n.new("ShaderNodeMath"); mx.operation = "MULTIPLY_ADD"; mx.inputs[1].default_value = 0.26; mx.inputs[2].default_value = 0.5
mz = n.new("ShaderNodeMath"); mz.operation = "MULTIPLY_ADD"; mz.inputs[1].default_value = -0.23
ramp = n.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].color = lin(opt.get("hell", "#F7C64F"))
ramp.color_ramp.elements[1].color = lin(opt.get("dunkel", "#DC8A07"))
l.new(tc.outputs["Object"], sep.inputs[0])
l.new(sep.outputs["X"], mx.inputs[0]); l.new(sep.outputs["Z"], mz.inputs[0]); l.new(mx.outputs[0], mz.inputs[2])
l.new(mz.outputs[0], ramp.inputs[0]); l.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])

waben = []
for i, (x, z) in enumerate(MITTEN):
    me = bpy.data.meshes.new(f"Wabe{i}"); bm = bmesh.new()
    vorn = [bm.verts.new((R * math.cos(math.radians(90 + 60 * k)), -TIEFE / 2, R * math.sin(math.radians(90 + 60 * k)))) for k in range(6)]
    hinten = [bm.verts.new((v.co.x, TIEFE / 2, v.co.z)) for v in vorn]
    bm.faces.new(list(reversed(vorn))); bm.faces.new(hinten)
    for k in range(6):
        bm.faces.new([vorn[k], vorn[(k + 1) % 6], hinten[(k + 1) % 6], hinten[k]])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(f"Wabe{i}", me); sc.collection.objects.link(ob)
    ob.location = (x, 0, z); ob.data.materials.append(mat)
    bev = ob.modifiers.new("Kante", "BEVEL"); bev.width = float(opt.get("kante", "0.085")); bev.segments = 8
    bev.limit_method = "ANGLE"; bev.harden_normals = True
    for p in me.polygons: p.use_smooth = True
    waben.append(ob)

# ---------- Kamera ----------
cam = bpy.data.objects.new("Kamera", bpy.data.cameras.new("Kamera")); sc.collection.objects.link(cam)
cam.data.lens = 100; cam.location = (0, -float(opt.get("abstand", "15")), 0); cam.rotation_euler = (math.radians(90), 0, 0)
sc.camera = cam

# ---------- Licht ----------
def licht(name, loc, energie, groesse):
    li = bpy.data.lights.new(name, "AREA"); li.energy = energie; li.size = groesse
    ob = bpy.data.objects.new(name, li); sc.collection.objects.link(ob); ob.location = loc
    ob.rotation_euler = (0, 0, 0)
    d = ob.location.normalized() * -1
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
licht("Haupt", (-5, -9, 7), float(opt.get("haupt", "2600")), 6)
licht("Aufhell", (7, -7, -2), float(opt.get("aufhell", "700")), 6)
licht("Kante", (1, 8, 6), float(opt.get("kantenlicht", "2200")), 4)
welt = bpy.data.worlds.new("Welt"); sc.world = welt; welt.use_nodes = True
welt.node_tree.nodes["Background"].inputs[0].default_value = (0.9, 0.85, 0.75, 1)
welt.node_tree.nodes["Background"].inputs[1].default_value = float(opt.get("umgebung", "0.35"))

# ---------- Rendern ----------
sc.render.engine = "CYCLES"
try:
    pr = bpy.context.preferences.addons["cycles"].preferences
    pr.compute_device_type = "METAL"; pr.get_devices()
    for d in pr.devices: d.use = True
    sc.cycles.device = "GPU"
except Exception as e:
    print("GPU nicht verfügbar:", e)
sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True
sc.render.resolution_x = sc.render.resolution_y = GROESSE; sc.render.resolution_percentage = 100
sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGBA"
sc.render.film_transparent = modus != "symbol"
if modus == "symbol":
    sc.render.film_transparent = True  # Hintergrund setzt das Python-Skript danach, so bleibt die Farbe exakt

def bezier(t, x1=.55, y1=0, x2=.35, y2=1):
    """CSS cubic-bezier: zu Zeitanteil t den Fortschritt liefern."""
    def bx(s): return 3 * (1 - s) ** 2 * s * x1 + 3 * (1 - s) * s ** 2 * x2 + s ** 3
    def by(s): return 3 * (1 - s) ** 2 * s * y1 + 3 * (1 - s) * s ** 2 * y2 + s ** 3
    lo, hi = 0.0, 1.0
    for _ in range(60):
        mid = (lo + hi) / 2
        if bx(mid) < t: lo = mid
        else: hi = mid
    return by((lo + hi) / 2)

def bild(winkel, datei):
    for ob in waben: ob.rotation_euler = (0, 0, math.radians(winkel))
    sc.render.filepath = datei
    bpy.ops.render.render(write_still=True)

if modus == "probe":
    for w in [float(x) for x in opt.get("winkel", "0,35,70,90").split(",")]:
        bild(w, os.path.join(ausgabe, f"probe-{int(w):03d}.png"))
elif modus == "anim":
    n_bilder = int(opt.get("bilder", "66"))
    for k in range(n_bilder):
        bild(360 * bezier(k / n_bilder), os.path.join(ausgabe, f"bild-{k:03d}.png"))
elif modus == "symbol":
    bild(float(opt.get("winkel", "0")), os.path.join(ausgabe, "symbol.png"))
print("FERTIG", modus)
