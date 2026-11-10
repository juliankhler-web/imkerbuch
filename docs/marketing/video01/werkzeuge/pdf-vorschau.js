/* Läuft in der App-Seite: Fängt das PDF ab, das die App erzeugt (statt Teilen-Fenster), und zeigt
   Seite 1 als Vorschau-Blatt, wie es auf dem iPhone in der Vorschau erscheint (Fenster gleitet von unten herein).
   Der Inhalt ist das echte PDF der App – nur die Anzeige ist nachgestellt. */
window.__pdfAbfangen = () => {
  window.__pdfDaten = null;
  Pdf.ausgeben = async (doc, name) => { window.__pdfDaten = { buf: doc.output('arraybuffer'), name: window.dateiname(name, 'imkerbuch.pdf') }; };
};
window.__pdfZeigen = async (zoom = 1) => {
  for (let i = 0; i < 100 && !window.__pdfDaten; i++) await new Promise((r) => setTimeout(r, 50));
  const { buf, name } = window.__pdfDaten;
  await U.loadScript(...CDN.pdfjs);
  const pdf = await pdfjsLib.getDocument({ data: buf, isEvalSupported: false }).promise;
  const seite = await pdf.getPage(1);
  const breite = 440 - 24;   // pt
  const vp1 = seite.getViewport({ scale: 1 });
  const massstab = (breite / vp1.width) * 3 * zoom;
  const vp = seite.getViewport({ scale: massstab });
  const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
  await seite.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
  const hb = document.createElement('div');
  hb.id = '__pdfblatt';
  hb.innerHTML = `<style>
    #__pdfblatt{position:fixed;inset:0;z-index:2147483600;background:rgba(0,0,0,0);transition:background .35s}
    #__pdfblatt.an{background:rgba(0,0,0,.35)}
    #__pdfblatt .bl{position:absolute;left:0;right:0;bottom:0;top:62px;background:#f2f2f7;border-radius:14px 14px 0 0;transform:translateY(100%);transition:transform .42s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;overflow:hidden}
    #__pdfblatt.an .bl{transform:none}
    #__pdfblatt .kopf{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px;font:600 17px -apple-system,system-ui,sans-serif;color:#000}
    #__pdfblatt .kopf .f{color:#007aff;font-weight:600} #__pdfblatt .kopf .t{font-size:15px;max-width:250px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center}
    #__pdfblatt .kopf .s{color:#007aff;width:44px;text-align:right}
    #__pdfblatt .flaeche{flex:1;overflow:hidden;padding:8px 12px;display:flex;justify-content:center;align-items:flex-start}
    #__pdfblatt .seite{box-shadow:0 2px 10px rgba(0,0,0,.18);background:#fff;transform-origin:0 0;transition:transform 1.6s ease-in-out}
  </style><div class="bl"><div class="kopf"><span class="f">Fertig</span><span class="t"></span><span class="s"><svg width="20" height="24" viewBox="0 0 20 24" fill="none" stroke="#007aff" stroke-width="2"><path d="M10 15V2M5 7l5-5 5 5M3 11v11h14V11"/></svg></span></div><div class="flaeche"></div></div>`;
  hb.querySelector('.t').textContent = name;
  c.className = 'seite'; c.style.width = breite + 'px'; c.style.height = (breite * vp.height / vp.width) + 'px';   // zoom = schärfer für das Heranzoomen
  hb.querySelector('.flaeche').appendChild(c);
  document.body.appendChild(hb);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  hb.classList.add('an');
  return { w: breite, h: breite * vp.height / vp.width };
};
window.__pdfZu = () => { const hb = document.querySelector('#__pdfblatt'); if (!hb) return; hb.classList.remove('an'); setTimeout(() => hb.remove(), 450); };
