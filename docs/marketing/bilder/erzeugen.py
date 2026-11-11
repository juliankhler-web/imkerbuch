# Bilder für die Erklärvideos über die Draw-Things-Schnittstelle (Port 7860) erzeugen.
# Aufruf: python3 -I erzeugen.py <prompts.json> <zielordner> [nur_datei.png ...]
# controls und loras bleiben IMMER leer (Julians eigenes Projekt in Draw Things nicht anfassen).
#
# Ein Bild-Eintrag in "bilder" ist entweder ein Text (wie in prompts-v2.json) oder ein Objekt:
#   {"prompt": "...", "seed": 203, "vorlage": "anna-vorlage.png", "datei": "s2-weit.png"}
#   - "vorlage": Bild aus dem Zielordner, das als Vorlage mitgeschickt wird (img2img, strength 1.0).
#     So bleibt Annas Gesicht in allen Bildern gleich. Der Prompt beginnt dann mit cfg["vorlage_satz"].
#   - "seed": eigener Seed für dieses Bild (sonst cfg["seed"]).
#   - "datei": Name der Ausgabedatei, falls der Schlüssel ein anderer ist (z. B. für Varianten).
import json, sys, base64, urllib.request, os, time
cfg = json.load(open(sys.argv[1], encoding='utf-8')); ziel = sys.argv[2]; nur = set(sys.argv[3:])
os.makedirs(ziel, exist_ok=True)
for schluessel, eintrag in cfg['bilder'].items():
    if nur and schluessel not in nur: continue
    if isinstance(eintrag, str): eintrag = {'prompt': eintrag}
    inhalt = eintrag['prompt']; datei = eintrag.get('datei', schluessel)
    vorlage = eintrag.get('vorlage')
    if vorlage:
        prompt = cfg.get('vorlage_satz', '') + inhalt + ' ' + cfg['stil']
    else:
        figur = cfg['anna'] + ', ' if inhalt.startswith('ANNA ') else ''
        prompt = figur + inhalt.replace('ANNA ', '', 1) + ' ' + cfg['stil']
    req = {'prompt': prompt, 'negative_prompt': cfg.get('negativ', ''), 'model': cfg['modell'],
           'width': cfg['breite'], 'height': cfg['hoehe'], 'steps': cfg['steps'], 'guidance_scale': cfg['guidance'],
           'seed': eintrag.get('seed', cfg['seed']), 'controls': [], 'loras': [], 'batch_count': 1, 'batch_size': 1}
    weg = 'txt2img'
    if vorlage:
        req['init_images'] = [base64.b64encode(open(os.path.join(ziel, vorlage), 'rb').read()).decode()]
        req['strength'] = eintrag.get('strength', 1.0)
        weg = 'img2img'
    t = time.time()
    r = urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:7860/sdapi/v1/' + weg, json.dumps(req).encode(),
        {'Content-Type': 'application/json'}), timeout=900)
    bild = json.loads(r.read())['images'][0]
    open(os.path.join(ziel, datei), 'wb').write(base64.b64decode(bild))
    print(f'{datei} ({weg}, Seed {req["seed"]}) fertig in {time.time()-t:.0f} s', flush=True)
