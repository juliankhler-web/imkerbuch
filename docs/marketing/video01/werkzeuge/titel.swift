// Titel-Einblendung für die Kurzclips: transparentes PNG in Videogröße mit einer Creme-Karte und dem Titel.
// Aufruf: swift titel.swift "Titeltext (| = Umbruch)" ausgabe.png [breite=1080] [hoehe=1920] [oben_anteil=0.20]
// Stil wie die Endkarte: SF Pro Rounded, Dunkelbraun auf Creme, Rand in Honig. Lange Titel werden umbrochen.

import AppKit
import CoreGraphics
import CoreText
import ImageIO
import UniformTypeIdentifiers

let a = CommandLine.arguments
guard a.count >= 3 else { print("Aufruf: swift titel.swift \"Titel\" ausgabe.png [breite] [hoehe] [oben_anteil]"); exit(2) }
let text = a[1]
let ausgabe = URL(fileURLWithPath: a[2])
let W = a.count > 3 ? CGFloat(Double(a[3]) ?? 1080) : 1080
let H = a.count > 4 ? CGFloat(Double(a[4]) ?? 1920) : 1920
let obenAnteil = a.count > 5 ? CGFloat(Double(a[5]) ?? 0.20) : 0.20

func farbe(_ hex: UInt32, _ al: CGFloat = 1) -> CGColor {
    CGColor(srgbRed: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255,
            blue: CGFloat(hex & 0xFF) / 255, alpha: al)
}
let creme = farbe(0xFFF6E5, 0.96)
let honig = farbe(0xE8A33D)
let braun = farbe(0x4A3318)
let braunMittel = farbe(0x7A5A33)

func schrift(_ g: CGFloat, _ w: NSFont.Weight) -> CTFont {
    let basis = NSFont.systemFont(ofSize: g, weight: w)
    if let r = basis.fontDescriptor.withDesign(.rounded), let f = NSFont(descriptor: r, size: g) { return f as CTFont }
    return basis as CTFont
}
func linie(_ t: String, _ f: CTFont, _ c: CGColor) -> (CTLine, CGFloat, CGFloat, CGFloat) {
    let attr: [NSAttributedString.Key: Any] = [
        NSAttributedString.Key(kCTFontAttributeName as String): f,
        NSAttributedString.Key(kCTForegroundColorAttributeName as String): c]
    let l = CTLineCreateWithAttributedString(NSAttributedString(string: t, attributes: attr))
    var asc: CGFloat = 0, des: CGFloat = 0, lead: CGFloat = 0
    let w = CGFloat(CTLineGetTypographicBounds(l, &asc, &des, &lead))
    return (l, w, asc, des)
}

let s = min(W, H) / 1080                     // Skala bezogen auf 1080 px
let maxBreite = W * 0.80
// Schriftgröße so wählen, dass jede mit "|" gesetzte Zeile möglichst in eine Zeile passt (92 bis 64 px)
var groesse = 92 * s
let breitesteZeile = text.split(separator: "|").map { linie($0.trimmingCharacters(in: .whitespaces), schrift(groesse, .heavy), braun).1 }.max() ?? 0
if breitesteZeile > maxBreite { groesse = max(64 * s, groesse * maxBreite / breitesteZeile) }
let font = schrift(groesse, .heavy)
// Zeilen umbrechen (wortweise)
// "|" im Text erzwingt einen Zeilenumbruch
var zeilen: [String] = []
for teil in text.split(separator: "|").map({ $0.trimmingCharacters(in: .whitespaces) }) {
    var aktuell = ""
    for wort in teil.split(separator: " ").map(String.init) {
        let probe = aktuell.isEmpty ? wort : aktuell + " " + wort
        if linie(probe, font, braun).1 > maxBreite && !aktuell.isEmpty { zeilen.append(aktuell); aktuell = wort }
        else { aktuell = probe }
    }
    if !aktuell.isEmpty { zeilen.append(aktuell) }
}
let gesetzt = zeilen.map { linie($0, font, braun) }
let zeilenAbstand = groesse * 1.12
let kopf = linie("ImkerBuch", schrift(40 * s, .bold), braunMittel)
let innen = 46 * s
let textBreite = max(gesetzt.map { $0.1 }.max() ?? 0, kopf.1)
let kartenB = textBreite + 2 * innen
let kartenH = innen + kopf.2 + kopf.3 + 18 * s + CGFloat(gesetzt.count) * zeilenAbstand + innen * 0.8
let kx = (W - kartenB) / 2
let kyOben = H * obenAnteil
let karte = CGRect(x: kx, y: H - kyOben - kartenH, width: kartenB, height: kartenH)

let srgb = CGColorSpace(name: CGColorSpace.sRGB)!
let ctx = CGContext(data: nil, width: Int(W), height: Int(H), bitsPerComponent: 8, bytesPerRow: 0, space: srgb,
                    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.setShouldAntialias(true)
let radius = 34 * s
ctx.saveGState()
ctx.setShadow(offset: CGSize(width: 0, height: -10 * s), blur: 40 * s, color: farbe(0x4A3318, 0.30))
ctx.addPath(CGPath(roundedRect: karte, cornerWidth: radius, cornerHeight: radius, transform: nil))
ctx.setFillColor(creme); ctx.fillPath()
ctx.restoreGState()
ctx.addPath(CGPath(roundedRect: karte.insetBy(dx: 3 * s, dy: 3 * s), cornerWidth: radius - 3 * s, cornerHeight: radius - 3 * s, transform: nil))
ctx.setStrokeColor(honig); ctx.setLineWidth(6 * s); ctx.strokePath()

var y = karte.maxY - innen
// kleine Kopfzeile "ImkerBuch" mit Honig-Strich
ctx.textPosition = CGPoint(x: (W - kopf.1) / 2, y: y - kopf.2)
CTLineDraw(kopf.0, ctx)
y -= kopf.2 + kopf.3 + 18 * s
for g in gesetzt {
    ctx.textPosition = CGPoint(x: (W - g.1) / 2, y: y - g.2)
    CTLineDraw(g.0, ctx)
    y -= zeilenAbstand
}
let d = CGImageDestinationCreateWithURL(ausgabe as CFURL, UTType.png.identifier as CFString, 1, nil)!
CGImageDestinationAddImage(d, ctx.makeImage()!, nil)
CGImageDestinationFinalize(d)
print("Titel -> \(ausgabe.path) (\(zeilen.count) Zeile(n))")
