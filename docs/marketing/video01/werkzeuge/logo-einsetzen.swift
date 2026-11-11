// logo-einsetzen.swift – setzt den echten ImkerBuch-Startbildschirm (App-Symbol + Schriftzug)
// auf leere Handy-Bildschirme in den Illustrationen von Erklärvideo Folge 1.
//
// Aufruf (einzeln):
//   swift logo-einsetzen.swift <bild.png> <ausgabe.png> x1,y1,x2,y2,x3,y3,x4,y4 [--icon pfad] [--radius px] [--untertitel ja|nein]
//   Ecken in Bildpunkten, Ursprung oben links, im Uhrzeigersinn ab oben links
//   (oben links, oben rechts, unten rechts, unten links). Gemeint ist das Rechteck,
//   das die geraden Bildschirmkanten bilden (ohne Rundung, Notch gehört dazu).
//
// Aufruf (alle Bilder aus einer JSON-Datei, z. B. docs/marketing/bilder/v2/logo-ecken.json):
//   swift logo-einsetzen.swift --alle <logo-ecken.json>
//
// Was passiert:
//  1. Der Bildschirminhalt wird flach und 4-fach überabgetastet gezeichnet: cremefarbener
//     Grund #FFF6E5, echtes App-Symbol als abgerundetes Quadrat (45 % der Breite),
//     „ImkerBuch“ in #4A3420 (SF Pro Rounded Bold, sonst Helvetica Neue Bold),
//     Honiglinie und – wenn der Bildschirm groß genug ist – „Dein digitales Stockbuch“.
//  2. CIPerspectiveTransform legt ihn auf das Viereck, Lanczos verkleinert sauber.
//  3. Ersetzt werden nur Pixel, die im Original hell und fast farblos (= leerer Bildschirm)
//     sind. Notch, Rahmen, Finger, Zettel usw. bleiben dadurch automatisch davor.
//  4. Die Helligkeitsverläufe des Originalbildschirms (Glühen, Schatten) werden
//     übernommen, dazu ein sehr dezenter Glanz – so wirkt es nicht aufgeklebt.
import Foundation
import AppKit
import CoreGraphics
import CoreImage
import CoreText
import ImageIO
import UniformTypeIdentifiers

struct Auftrag {
    var quelle: String
    var ziel: String
    var ecken: [CGPoint]          // oben links, oben rechts, unten rechts, unten links (Bildkoordinaten, y nach unten)
    var radius: Double? = nil     // Eckradius in Bildpunkten (Bildschirmmaß); nil = 9 % der Breite
    var untertitel: Bool? = nil   // nil = automatisch (ab 200 px Bildschirmbreite)
}

func fehler(_ s: String) -> Never { FileHandle.standardError.write((s + "\n").data(using: .utf8)!); exit(1) }

let srgb = CGColorSpace(name: CGColorSpace.sRGB)!

func ladeBild(_ pfad: String) -> CGImage {
    guard let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: pfad) as CFURL, nil),
          let img = CGImageSourceCreateImageAtIndex(src, 0, nil) else { fehler("Bild nicht lesbar: \(pfad)") }
    return img
}

func speichere(_ img: CGImage, _ pfad: String) {
    guard let d = CGImageDestinationCreateWithURL(URL(fileURLWithPath: pfad) as CFURL, UTType.png.identifier as CFString, 1, nil) else { fehler("Kann nicht schreiben: \(pfad)") }
    CGImageDestinationAddImage(d, img, nil)
    if !CGImageDestinationFinalize(d) { fehler("Schreiben fehlgeschlagen: \(pfad)") }
}

/// RGBA8-Puffer, Zeile 0 = oberste Bildzeile
func puffer(_ img: CGImage, _ w: Int, _ h: Int) -> [UInt8] {
    var buf = [UInt8](repeating: 0, count: w * h * 4)
    let ctx = CGContext(data: &buf, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: srgb,
                        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    ctx.interpolationQuality = .high
    ctx.draw(img, in: CGRect(x: 0, y: 0, width: w, height: h))
    return buf
}

func farbe(_ hex: UInt32, _ a: CGFloat = 1) -> CGColor {
    CGColor(srgbRed: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255, blue: CGFloat(hex & 0xFF) / 255, alpha: a)
}

func schrift(_ groesse: CGFloat) -> CTFont {
    let basis = NSFont.systemFont(ofSize: groesse, weight: .bold)
    if let d = basis.fontDescriptor.withDesign(.rounded), let f = NSFont(descriptor: d, size: groesse) { return f as CTFont }
    return CTFontCreateWithName("HelveticaNeue-Bold" as CFString, groesse, nil)
}

func zeichneText(_ ctx: CGContext, _ text: String, _ font: CTFont, _ col: CGColor, mitteX: CGFloat, grundlinie: CGFloat, kerning: CGFloat = 0) {
    let attr = NSAttributedString(string: text, attributes: [
        NSAttributedString.Key(kCTFontAttributeName as String): font,
        NSAttributedString.Key(kCTForegroundColorAttributeName as String): col,
        NSAttributedString.Key(kCTKernAttributeName as String): kerning])
    let line = CTLineCreateWithAttributedString(attr)
    let breite = CTLineGetTypographicBounds(line, nil, nil, nil)
    ctx.textPosition = CGPoint(x: mitteX - CGFloat(breite) / 2, y: grundlinie)
    CTLineDraw(line, ctx)
}

/// Zeichnet den flachen Startbildschirm (W x H, Ursprung unten links).
func startbildschirm(W: Int, H: Int, icon: CGImage, radius: CGFloat, untertitel: Bool) -> CGImage {
    let w = CGFloat(W), h = CGFloat(H)
    let ctx = CGContext(data: nil, width: W, height: H, bitsPerComponent: 8, bytesPerRow: 0, space: srgb,
                        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    ctx.interpolationQuality = .high
    ctx.setShouldAntialias(true)
    // Grund: Creme mit ganz leichtem Verlauf (oben minimal heller)
    let grund = CGGradient(colorsSpace: srgb, colors: [farbe(0xFFF9EC), farbe(0xFFF6E5), farbe(0xFDF1DC)] as CFArray, locations: [0, 0.55, 1])!
    ctx.drawLinearGradient(grund, start: CGPoint(x: 0, y: h), end: CGPoint(x: 0, y: 0), options: [.drawsBeforeStartLocation, .drawsAfterEndLocation])

    // Maße
    let iconGr = w * 0.45
    let iconMitteY = h * 0.60                 // von unten gemessen -> 40 % von oben, obere Hälfte
    let iconRect = CGRect(x: (w - iconGr) / 2, y: iconMitteY - iconGr / 2, width: iconGr, height: iconGr)
    // warmer Lichthof hinter dem Symbol
    let hof = CGGradient(colorsSpace: srgb, colors: [farbe(0xF6B94A, 0.16), farbe(0xF6B94A, 0)] as CFArray, locations: [0, 1])!
    ctx.drawRadialGradient(hof, startCenter: CGPoint(x: w / 2, y: iconMitteY), startRadius: 0,
                           endCenter: CGPoint(x: w / 2, y: iconMitteY), endRadius: iconGr * 1.05, options: [])

    // Symbol: abgerundetes Quadrat mit weichem Schatten und feiner Kante
    let r = iconGr * 0.2237
    let pfad = CGPath(roundedRect: iconRect, cornerWidth: r, cornerHeight: r, transform: nil)
    ctx.saveGState()
    ctx.setShadow(offset: CGSize(width: 0, height: -iconGr * 0.035), blur: iconGr * 0.10, color: farbe(0x4A3420, 0.28))
    ctx.addPath(pfad); ctx.setFillColor(farbe(0xFFF6E8)); ctx.fillPath()
    ctx.restoreGState()
    ctx.saveGState()
    ctx.addPath(pfad); ctx.clip()
    ctx.draw(icon, in: iconRect)
    ctx.restoreGState()
    ctx.addPath(pfad); ctx.setStrokeColor(farbe(0x4A3420, 0.10)); ctx.setLineWidth(max(1, iconGr * 0.008)); ctx.strokePath()

    // Schriftzug
    let tg = w * 0.135
    let f = schrift(tg)
    let grundlinie = iconRect.minY - iconGr * 0.16 - CTFontGetAscent(f) * 0.95
    zeichneText(ctx, "ImkerBuch", f, farbe(0x4A3420), mitteX: w / 2, grundlinie: grundlinie, kerning: -tg * 0.01)

    // Honiglinie
    let lb = w * 0.20, lh = max(w * 0.014, 2)
    let ly = grundlinie - CTFontGetDescent(f) - w * 0.055
    let linie = CGRect(x: (w - lb) / 2, y: ly - lh / 2, width: lb, height: lh)
    let lg = CGGradient(colorsSpace: srgb, colors: [farbe(0xF2B544, 0), farbe(0xE9A23B, 0.95), farbe(0xF2B544, 0)] as CFArray, locations: [0, 0.5, 1])!
    ctx.saveGState()
    ctx.addPath(CGPath(roundedRect: linie, cornerWidth: lh / 2, cornerHeight: lh / 2, transform: nil)); ctx.clip()
    ctx.drawLinearGradient(lg, start: CGPoint(x: linie.minX, y: 0), end: CGPoint(x: linie.maxX, y: 0), options: [])
    ctx.restoreGState()

    if untertitel {
        let ug = w * 0.058
        let uf = schrift(ug)
        let uf2 = CTFontCreateCopyWithAttributes(uf, ug, nil, nil)
        zeichneText(ctx, "Dein digitales Stockbuch", uf2, farbe(0x4A3420, 0.62), mitteX: w / 2,
                    grundlinie: ly - lh / 2 - w * 0.045 - CTFontGetAscent(uf2))
    }

    // dezenter Glanz: diagonaler heller Streifen oben links
    ctx.saveGState()
    let glanz = CGGradient(colorsSpace: srgb, colors: [farbe(0xFFFFFF, 0.20), farbe(0xFFFFFF, 0.05), farbe(0xFFFFFF, 0)] as CFArray, locations: [0, 0.35, 0.6])!
    ctx.setBlendMode(.screen)
    ctx.drawLinearGradient(glanz, start: CGPoint(x: 0, y: h), end: CGPoint(x: w * 0.75, y: h * 0.45), options: [])
    ctx.restoreGState()
    // ganz leichte Abdunklung zum Rand (Bildschirm wirkt nicht wie ein Aufkleber)
    let rand = CGGradient(colorsSpace: srgb, colors: [farbe(0x6B4A20, 0), farbe(0x6B4A20, 0.035)] as CFArray, locations: [0.55, 1])!
    ctx.drawRadialGradient(rand, startCenter: CGPoint(x: w / 2, y: h / 2), startRadius: 0,
                           endCenter: CGPoint(x: w / 2, y: h / 2), endRadius: hypot(w, h) / 2, options: [])

    // abgerundete Bildschirmecken: außerhalb transparent
    let inhalt = ctx.makeImage()!
    let out = CGContext(data: nil, width: W, height: H, bitsPerComponent: 8, bytesPerRow: 0, space: srgb,
                        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    out.addPath(CGPath(roundedRect: CGRect(x: 0, y: 0, width: w, height: h), cornerWidth: radius, cornerHeight: radius, transform: nil))
    out.clip()
    out.draw(inhalt, in: CGRect(x: 0, y: 0, width: w, height: h))
    return out.makeImage()!
}

func dist(_ a: CGPoint, _ b: CGPoint) -> CGFloat { hypot(a.x - b.x, a.y - b.y) }

func smooth(_ e0: Double, _ e1: Double, _ x: Double) -> Double {
    let t = min(max((x - e0) / (e1 - e0), 0), 1); return t * t * (3 - 2 * t)
}

func bearbeite(_ a: Auftrag, iconPfad: String) {
    let original = ladeBild(a.quelle)
    let iw = original.width, ih = original.height
    var buf = puffer(original, iw, ih)
    let e = a.ecken
    precondition(e.count == 4)

    // Bildschirmmaße in Bildpunkten (Mittel der Gegenkanten)
    let sw = (dist(e[0], e[1]) + dist(e[3], e[2])) / 2
    let sh = (dist(e[0], e[3]) + dist(e[1], e[2])) / 2
    let k: CGFloat = 4                                   // Überabtastung
    let radius = CGFloat(a.radius ?? Double(sw * 0.09))
    let mitUntertitel = a.untertitel ?? (sw >= 200)
    let icon = ladeBild(iconPfad)
    let flach = startbildschirm(W: Int((sw * k).rounded()), H: Int((sh * k).rounded()), icon: icon, radius: radius * k, untertitel: mitUntertitel)

    // Arbeitsausschnitt (umschließendes Rechteck + Rand)
    let rand: CGFloat = 4
    let x0 = max(0, Int(floor(e.map { $0.x }.min()! - rand))), y0 = max(0, Int(floor(e.map { $0.y }.min()! - rand)))
    let x1 = min(iw, Int(ceil(e.map { $0.x }.max()! + rand))), y1 = min(ih, Int(ceil(e.map { $0.y }.max()! + rand)))
    let bw = x1 - x0, bh = y1 - y0
    func ci(_ p: CGPoint) -> CIVector { CIVector(x: (p.x - CGFloat(x0)) * k, y: (CGFloat(bh) - (p.y - CGFloat(y0))) * k) }

    let civ = CIContext(options: [.workingColorSpace: srgb, .outputColorSpace: srgb])
    func verzerren(_ bild: CGImage) -> [UInt8] {
        let pt = CIFilter(name: "CIPerspectiveTransform")!
        pt.setValue(CIImage(cgImage: bild), forKey: kCIInputImageKey)
        pt.setValue(ci(e[0]), forKey: "inputTopLeft")
        pt.setValue(ci(e[1]), forKey: "inputTopRight")
        pt.setValue(ci(e[2]), forKey: "inputBottomRight")
        pt.setValue(ci(e[3]), forKey: "inputBottomLeft")
        let gross = pt.outputImage!.cropped(to: CGRect(x: 0, y: 0, width: CGFloat(bw) * k, height: CGFloat(bh) * k))
        let leer = CIImage(color: CIColor(red: 0, green: 0, blue: 0, alpha: 0)).cropped(to: gross.extent)
        let lz = CIFilter(name: "CILanczosScaleTransform")!
        lz.setValue(gross.composited(over: leer), forKey: kCIInputImageKey)
        lz.setValue(1 / k, forKey: kCIInputScaleKey)
        lz.setValue(1.0, forKey: kCIInputAspectRatioKey)
        let klein = civ.createCGImage(lz.outputImage!, from: CGRect(x: 0, y: 0, width: bw, height: bh), format: .RGBA8, colorSpace: srgb)!
        return puffer(klein, bw, bh)
    }
    let neu = verzerren(flach)

    // Bezugsfarbe des leeren Originalbildschirms (Median je Farbkanal der klar leeren Pixel)
    func lum(_ i: Int) -> Double { 0.299 * Double(buf[i]) + 0.587 * Double(buf[i + 1]) + 0.114 * Double(buf[i + 2]) }
    func chroma(_ i: Int) -> Double { Double(max(buf[i], buf[i + 1], buf[i + 2])) - Double(min(buf[i], buf[i + 1], buf[i + 2])) }
    var kanal: [[Double]] = [[], [], []]
    for y in 0..<bh { for x in 0..<bw {
        let j = (y * bw + x) * 4
        if neu[j + 3] > 250 { let i = ((y + y0) * iw + (x + x0)) * 4
            if lum(i) > 235 && chroma(i) < 45 { for ch in 0..<3 { kanal[ch].append(Double(buf[i + ch])) } } }
    } }
    let bezug: [Double] = kanal.map { k in k.isEmpty ? 250 : k.sorted()[k.count / 2] }

    // Einsetzen: Ergebnis = Original x (neu / Bezugsfarbe).
    // Auf leerem Bildschirm ergibt das genau den neuen Inhalt samt dem Licht des Originals;
    // an weichgezeichneten Kanten (Bildschirm -> Rahmen/Notch) bleibt der Übergang dadurch sauber.
    // Farbige Dinge davor (Finger, Zettel) werden über die Farbsättigung geschützt.
    var ersetzt = 0, gesamt = 0
    for y in 0..<bh { for x in 0..<bw {
        let j = (y * bw + x) * 4
        let aNeu = Double(neu[j + 3]) / 255
        if aNeu <= 0 { continue }
        let i = ((y + y0) * iw + (x + x0)) * 4
        gesamt += 1
        let l = lum(i), c = chroma(i)
        let m = smooth(40, 120, l) * (1 - smooth(46, 64, c)) * aNeu
        if m <= 0 { continue }
        if m > 0.5 && l > 200 { ersetzt += 1 }
        for ch in 0..<3 {
            let n = Double(neu[j + ch]) / max(aNeu, 0.001)        // entmultiplizieren
            let o = Double(buf[i + ch])
            // hellere Stellen als die Bezugsfarbe (weiße Kantenlinie des Originals) nur abgeschwächt übernehmen
            let oo = o > bezug[ch] ? bezug[ch] + (o - bezug[ch]) * 0.3 : o
            let t = min(255, oo * n / bezug[ch])
            buf[i + ch] = UInt8(max(0, min(255, (o * (1 - m) + t * m).rounded())))
        }
    } }

    let ctx = CGContext(data: &buf, width: iw, height: ih, bitsPerComponent: 8, bytesPerRow: iw * 4, space: srgb,
                        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    speichere(ctx.makeImage()!, a.ziel)
    print(String(format: "%@ -> %@  Bildschirm %.0fx%.0f px, Untertitel %@, %d von %d Pixeln ersetzt",
                 (a.quelle as NSString).lastPathComponent, (a.ziel as NSString).lastPathComponent, sw, sh,
                 mitUntertitel ? "ja" : "nein", ersetzt, gesamt))
}

// ---------- Aufruf ----------
let args = Array(CommandLine.arguments.dropFirst())
let skriptOrdner = URL(fileURLWithPath: CommandLine.arguments[0]).deletingLastPathComponent()
let standardIcon = skriptOrdner.appendingPathComponent("../../../../native/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png").standardized.path

func punkte(_ s: String) -> [CGPoint] {
    let z = s.split(separator: ",").compactMap { Double($0.trimmingCharacters(in: .whitespaces)) }
    if z.count != 8 { fehler("Es braucht genau 8 Zahlen für die 4 Ecken.") }
    return stride(from: 0, to: 8, by: 2).map { CGPoint(x: z[$0], y: z[$0 + 1]) }
}

if args.first == "--alle" {
    guard args.count >= 2 else { fehler("--alle <logo-ecken.json>") }
    let jsonURL = URL(fileURLWithPath: args[1])
    let ordner = jsonURL.deletingLastPathComponent()
    guard let data = try? Data(contentsOf: jsonURL),
          let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
          let liste = obj["bilder"] as? [[String: Any]] else { fehler("JSON nicht lesbar: \(args[1])") }
    let iconPfad = (obj["icon"] as? String).map { ordner.appendingPathComponent($0).standardized.path } ?? standardIcon
    for b in liste {
        guard let q = b["quelle"] as? String, let z = b["ziel"] as? String, let ek = b["ecken"] as? [[Double]], ek.count == 4 else { continue }
        var a = Auftrag(quelle: ordner.appendingPathComponent(q).path, ziel: ordner.appendingPathComponent(z).path,
                        ecken: ek.map { CGPoint(x: $0[0], y: $0[1]) })
        a.radius = b["radius"] as? Double
        a.untertitel = b["untertitel"] as? Bool
        bearbeite(a, iconPfad: iconPfad)
    }
} else {
    guard args.count >= 3 else {
        fehler("Aufruf: logo-einsetzen.swift <bild.png> <ausgabe.png> x1,y1,x2,y2,x3,y3,x4,y4 [--icon pfad] [--radius px] [--untertitel ja|nein]\n   oder: logo-einsetzen.swift --alle <logo-ecken.json>")
    }
    var a = Auftrag(quelle: args[0], ziel: args[1], ecken: punkte(args[2]))
    var iconPfad = standardIcon
    var i = 3
    while i < args.count {
        switch args[i] {
        case "--icon": iconPfad = args[i + 1]; i += 2
        case "--radius": a.radius = Double(args[i + 1]); i += 2
        case "--untertitel": a.untertitel = (args[i + 1] == "ja"); i += 2
        default: fehler("Unbekannte Option: \(args[i])")
        }
    }
    if a.quelle == a.ziel { fehler("Ausgabe darf nicht das Original überschreiben.") }
    bearbeite(a, iconPfad: iconPfad)
}
