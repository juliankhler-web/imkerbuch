// Abschlusskarte (Szene 9) für Erklärvideo Folge 1 – zeichnet zwei PNGs:
//   endkarte-16x9.png (1920x1080) und endkarte-9x16.png (1080x1920)
// Aufruf:  swift docs/marketing/video01/werkzeuge/endkarte.swift [Ausgabeordner]
// Ohne Angabe landet alles in docs/marketing/video01/ (Ordner über werkzeuge/).
// Store-Zeile: Standard „Bald im App Store und bei Google Play“; nach dem Store-Start mit
//   STORE_ZEILE="Im App Store und bei Google Play" swift endkarte.swift
// Keine offiziellen Store-Abzeichen (Lizenz) – an ihrer Stelle bleibt freier Platz.

import AppKit
import CoreGraphics
import CoreText
import ImageIO
import UniformTypeIdentifiers

// ---------- Pfade ----------
let skriptURL = URL(fileURLWithPath: CommandLine.arguments[0]).standardizedFileURL
let werkzeugOrdner = skriptURL.deletingLastPathComponent()
let videoOrdner = werkzeugOrdner.deletingLastPathComponent()           // docs/marketing/video01
let repo = videoOrdner.deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
let ausgabe = CommandLine.arguments.count > 1 ? URL(fileURLWithPath: CommandLine.arguments[1]) : videoOrdner
let iconURL = repo.appendingPathComponent("native/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png")

// ---------- Farben ----------
func farbe(_ hex: UInt32, _ a: CGFloat = 1) -> CGColor {
    CGColor(srgbRed: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255,
            blue: CGFloat(hex & 0xFF) / 255, alpha: a)
}
let creme = farbe(0xFFF6E5)
let cremeDunkler = farbe(0xFBE6C0)
let honig = farbe(0xE8A33D)
let honigHell = farbe(0xF3C677)
let wiese = farbe(0x7BA05B)
let wieseHell = farbe(0x9DBD7C)
let braun = farbe(0x4A3318)
let braunMittel = farbe(0x7A5A33)

// ---------- Schrift ----------
func schrift(_ groesse: CGFloat, _ gewicht: NSFont.Weight) -> CTFont {
    let basis = NSFont.systemFont(ofSize: groesse, weight: gewicht)
    if let rund = basis.fontDescriptor.withDesign(.rounded), let f = NSFont(descriptor: rund, size: groesse) {
        return f as CTFont
    }
    return (NSFont(name: "HelveticaNeue-Bold", size: groesse) ?? basis) as CTFont
}

struct Zeile {
    let line: CTLine
    let breite: CGFloat
    let ascent: CGFloat
    let descent: CGFloat
}
func zeile(_ text: String, _ font: CTFont, _ color: CGColor, kern: CGFloat = 0) -> Zeile {
    let attr: [NSAttributedString.Key: Any] = [
        NSAttributedString.Key(kCTFontAttributeName as String): font,
        NSAttributedString.Key(kCTForegroundColorAttributeName as String): color,
        NSAttributedString.Key(kCTKernAttributeName as String): kern,
    ]
    let line = CTLineCreateWithAttributedString(NSAttributedString(string: text, attributes: attr))
    var a: CGFloat = 0, d: CGFloat = 0, l: CGFloat = 0
    let w = CGFloat(CTLineGetTypographicBounds(line, &a, &d, &l))
    return Zeile(line: line, breite: w, ascent: a, descent: d)
}
/// Zeichnet die Zeile; `oben` = Abstand der Oberkante (Ascent) vom oberen Bildrand.
func zeichne(_ z: Zeile, in ctx: CGContext, hoehe: CGFloat, x: CGFloat, oben: CGFloat) {
    ctx.textPosition = CGPoint(x: x, y: hoehe - oben - z.ascent)
    CTLineDraw(z.line, ctx)
}

// ---------- Formen ----------
func sechseck(_ mx: CGFloat, _ my: CGFloat, _ r: CGFloat) -> CGPath {
    let p = CGMutablePath()
    for i in 0..<6 {
        let w = CGFloat(i) * .pi / 3 + .pi / 6
        let pt = CGPoint(x: mx + r * cos(w), y: my + r * sin(w))
        if i == 0 { p.move(to: pt) } else { p.addLine(to: pt) }
    }
    p.closeSubpath()
    return p
}

func ladeIcon() -> CGImage {
    guard let src = CGImageSourceCreateWithURL(iconURL as CFURL, nil),
          let img = CGImageSourceCreateImageAtIndex(src, 0, nil) else {
        fatalError("App-Icon nicht gefunden: \(iconURL.path)")
    }
    return img
}

/// Wiese unten: zwei sanfte Hügelwellen (flach), y in Bildkoordinaten von unten.
func wieseZeichnen(_ ctx: CGContext, breite W: CGFloat, hoehe: CGFloat, skala s: CGFloat) {
    func huegel(_ grund: CGFloat, _ amp: CGFloat, _ phase: CGFloat, _ wellen: CGFloat, _ c: CGColor) {
        let p = CGMutablePath()
        p.move(to: CGPoint(x: 0, y: 0))
        let schritte = 120
        for i in 0...schritte {
            let x = W * CGFloat(i) / CGFloat(schritte)
            let y = grund + amp * sin(phase + wellen * 2 * .pi * x / W)
            p.addLine(to: CGPoint(x: x, y: y))
        }
        p.addLine(to: CGPoint(x: W, y: 0))
        p.closeSubpath()
        ctx.addPath(p); ctx.setFillColor(c); ctx.fillPath()
    }
    huegel(hoehe * 0.78, 14 * s, 0.6, 1.3, wieseHell)
    huegel(hoehe * 0.5, 12 * s, 2.4, 1.0, wiese)
}

/// Blüten (flach) auf der Wiese
func blume(_ ctx: CGContext, _ x: CGFloat, _ y: CGFloat, _ r: CGFloat, _ c: CGColor) {
    ctx.setFillColor(c)
    for i in 0..<5 {
        let w = CGFloat(i) * 2 * .pi / 5
        ctx.fillEllipse(in: CGRect(x: x + r * 0.62 * cos(w) - r * 0.45, y: y + r * 0.62 * sin(w) - r * 0.45,
                                   width: r * 0.9, height: r * 0.9))
    }
    ctx.setFillColor(honig)
    ctx.fillEllipse(in: CGRect(x: x - r * 0.38, y: y - r * 0.38, width: r * 0.76, height: r * 0.76))
}

func speichere(_ img: CGImage, _ url: URL) {
    guard let dest = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil) else {
        fatalError("Kann nicht schreiben: \(url.path)")
    }
    CGImageDestinationAddImage(dest, img, nil)
    CGImageDestinationFinalize(dest)
    print("geschrieben: \(url.path)")
}

// ---------- Karte zeichnen ----------
func karte(breite W: CGFloat, hoehe H: CGFloat, hochkant: Bool) -> CGImage {
    let cs = CGColorSpace(name: CGColorSpace.sRGB)!
    let ctx = CGContext(data: nil, width: Int(W), height: Int(H), bitsPerComponent: 8, bytesPerRow: 0,
                        space: cs, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    ctx.interpolationQuality = .high
    ctx.setShouldAntialias(true)
    let s = min(W, H) / 1080 * (hochkant ? 1.0 : 1.0)   // Grundskala (1080 kurze Seite = 1)

    // Hintergrund: Creme-Verlauf (oben heller)
    let verlauf = CGGradient(colorsSpace: cs, colors: [creme, cremeDunkler] as CFArray, locations: [0, 1])!
    ctx.drawLinearGradient(verlauf, start: CGPoint(x: 0, y: H), end: CGPoint(x: 0, y: 0), options: [])

    // Deko-Waben in den Ecken (sehr zart)
    let waben: [(CGFloat, CGFloat, CGFloat, CGColor)] = hochkant ? [
        (0.08, 0.95, 70, honigHell), (0.20, 0.985, 46, honig), (0.93, 0.90, 58, honigHell),
        (0.84, 0.965, 34, wieseHell), (0.05, 0.80, 30, wieseHell),
    ] : [
        (0.045, 0.90, 70, honigHell), (0.11, 0.985, 44, honig), (0.965, 0.82, 60, honigHell),
        (0.915, 0.955, 34, wieseHell), (0.025, 0.70, 28, wieseHell),
    ]
    for (fx, fy, r, c) in waben {
        ctx.addPath(sechseck(W * fx, H * fy, r * s))
        ctx.setFillColor(c.copy(alpha: 0.35)!)
        ctx.fillPath()
    }

    // Wiese unten
    let wieseHoehe = (hochkant ? 230 : 120) * s
    wieseZeichnen(ctx, breite: W, hoehe: wieseHoehe, skala: s)
    let bluetenFarben = [farbe(0xFFFFFF), farbe(0xF6D9A0), farbe(0xFFFFFF), farbe(0xF3C677)]
    let bluetenX: [CGFloat] = hochkant ? [0.09, 0.27, 0.55, 0.78, 0.92] : [0.05, 0.17, 0.31, 0.69, 0.83, 0.95]
    for (i, fx) in bluetenX.enumerated() {
        let y = wieseHoehe * (0.25 + 0.12 * CGFloat(i % 3))
        blume(ctx, W * fx, y, (i % 2 == 0 ? 15 : 11) * s, bluetenFarben[i % bluetenFarben.count])
    }

    // ---- Inhalt ----
    let icon = ladeIcon()
    let titelZ = zeile("ImkerBuch", schrift((hochkant ? 150 : 168) * s, .bold), braun, kern: -1.5 * s)
    let unterZ = zeile("Dein digitales Stockbuch", schrift((hochkant ? 60 : 62) * s, .medium), braunMittel)
    let storeZ = zeile(ProcessInfo.processInfo.environment["STORE_ZEILE"] ?? "Bald im App Store und bei Google Play", schrift((hochkant ? 46 : 44) * s, .semibold), braun)
    let pillZ = zeile("30 Tage alles kostenlos testen", schrift((hochkant ? 52 : 50) * s, .bold), braun)

    let pillPadX = 46 * s, pillPadY = 26 * s
    let pillW = pillZ.breite + 2 * pillPadX
    let pillH = pillZ.ascent + pillZ.descent + 2 * pillPadY
    let radius = 12 * 2.2 * s                    // 12px-Stil, hochskaliert
    let badgeRaum = (hochkant ? 120 : 110) * s   // freier Platz für spätere Store-Abzeichen

    func zeichneIcon(x: CGFloat, oben: CGFloat, groesse g: CGFloat) {
        let rect = CGRect(x: x, y: H - oben - g, width: g, height: g)
        let pfad = CGPath(roundedRect: rect, cornerWidth: g * 0.2237, cornerHeight: g * 0.2237, transform: nil)
        // Schatten
        ctx.saveGState()
        ctx.setShadow(offset: CGSize(width: 0, height: -14 * s), blur: 40 * s, color: farbe(0x7A5A33, 0.28))
        ctx.addPath(pfad); ctx.setFillColor(creme); ctx.fillPath()
        ctx.restoreGState()
        // Bild mit runden Ecken
        ctx.saveGState()
        ctx.addPath(pfad); ctx.clip()
        ctx.draw(icon, in: rect)
        ctx.restoreGState()
        // feiner Rand
        ctx.addPath(pfad); ctx.setStrokeColor(farbe(0xE2C79A, 0.9)); ctx.setLineWidth(2 * s); ctx.strokePath()
    }

    func zeichnePill(x: CGFloat, oben: CGFloat) {
        let rect = CGRect(x: x, y: H - oben - pillH, width: pillW, height: pillH)
        let pfad = CGPath(roundedRect: rect, cornerWidth: radius, cornerHeight: radius, transform: nil)
        ctx.saveGState()
        ctx.setShadow(offset: CGSize(width: 0, height: -8 * s), blur: 22 * s, color: farbe(0xB0731C, 0.30))
        ctx.addPath(pfad); ctx.setFillColor(honig); ctx.fillPath()
        ctx.restoreGState()
        zeichne(pillZ, in: ctx, hoehe: H, x: x + pillPadX, oben: oben + pillPadY)
    }

    if hochkant {
        // Senkrecht gestapelt, mittig
        let iconG = 360 * s
        let abstand1 = 70 * s, abstand2 = 18 * s, abstand3 = 90 * s, abstand4 = 24 * s, abstand5 = 40 * s
        let titelH = titelZ.ascent + titelZ.descent
        let unterH = unterZ.ascent + unterZ.descent
        let storeH = storeZ.ascent + storeZ.descent
        let gesamt = iconG + abstand1 + titelH + abstand2 + unterH + abstand3 + storeH + abstand4 + badgeRaum + abstand5 + pillH
        let verfuegbar = H - wieseHoehe
        var y = (verfuegbar - gesamt) / 2 - 20 * s
        zeichneIcon(x: (W - iconG) / 2, oben: y, groesse: iconG); y += iconG + abstand1
        zeichne(titelZ, in: ctx, hoehe: H, x: (W - titelZ.breite) / 2, oben: y); y += titelH + abstand2
        zeichne(unterZ, in: ctx, hoehe: H, x: (W - unterZ.breite) / 2, oben: y); y += unterH + abstand3
        zeichne(storeZ, in: ctx, hoehe: H, x: (W - storeZ.breite) / 2, oben: y); y += storeH + abstand4
        y += badgeRaum + abstand5                        // hier kommen später die Abzeichen hin
        zeichnePill(x: (W - pillW) / 2, oben: y)
    } else {
        // Zwei Spalten: links Icon, rechts Text (linksbündig)
        let iconG = 400 * s
        let spalt = 90 * s
        let textBreite = max(titelZ.breite, unterZ.breite, storeZ.breite, pillW)
        let blockBreite = iconG + spalt + textBreite
        let x0 = (W - blockBreite) / 2
        let tx = x0 + iconG + spalt
        let abstand2 = 10 * s, abstand3 = 60 * s, abstand4 = 18 * s, abstand5 = 30 * s
        let titelH = titelZ.ascent + titelZ.descent
        let unterH = unterZ.ascent + unterZ.descent
        let storeH = storeZ.ascent + storeZ.descent
        let textH = titelH + abstand2 + unterH + abstand3 + storeH + abstand4 + badgeRaum + abstand5 + pillH
        let verfuegbar = H - wieseHoehe
        let mitte = verfuegbar / 2 - 10 * s
        zeichneIcon(x: x0, oben: mitte - iconG / 2, groesse: iconG)
        var y = mitte - textH / 2
        zeichne(titelZ, in: ctx, hoehe: H, x: tx - 6 * s, oben: y); y += titelH + abstand2
        zeichne(unterZ, in: ctx, hoehe: H, x: tx, oben: y); y += unterH + abstand3
        zeichne(storeZ, in: ctx, hoehe: H, x: tx, oben: y); y += storeH + abstand4
        y += badgeRaum + abstand5
        zeichnePill(x: tx, oben: y)
    }
    return ctx.makeImage()!
}

try? FileManager.default.createDirectory(at: ausgabe, withIntermediateDirectories: true)
speichere(karte(breite: 1920, hoehe: 1080, hochkant: false), ausgabe.appendingPathComponent("endkarte-16x9.png"))
speichere(karte(breite: 1080, hoehe: 1920, hochkant: true), ausgabe.appendingPathComponent("endkarte-9x16.png"))
