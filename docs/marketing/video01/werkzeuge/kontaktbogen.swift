// Kontaktbogen: zieht Einzelbilder aus einem Video (einzeln als JPG) und legt sie mit Zeitstempel auf ein Blatt.
// Aufruf: kontaktbogen video.mp4 ordner [abstand_s=1] [spalten=6] [bildbreite=320] [von_s] [bis_s]
// Ergebnis: ordner/bild-XXX.Xs.jpg (Einzelbilder) und ordner/kontaktbogen.jpg

import AVFoundation
import CoreGraphics
import CoreText
import Foundation
import ImageIO
import UniformTypeIdentifiers

let a = CommandLine.arguments
guard a.count >= 3 else { print("Aufruf: kontaktbogen video.mp4 ordner [abstand] [spalten] [breite] [von] [bis]"); exit(2) }
let url = URL(fileURLWithPath: a[1])
let ordner = URL(fileURLWithPath: a[2])
let abstand = a.count > 3 ? Double(a[3]) ?? 1 : 1
let spalten = a.count > 4 ? Int(a[4]) ?? 6 : 6
let tb = a.count > 5 ? Double(a[5]) ?? 320 : 320
try? FileManager.default.createDirectory(at: ordner, withIntermediateDirectories: true)

let asset = AVURLAsset(url: url)
let dauer = try await asset.load(.duration).seconds
let von = a.count > 6 ? Double(a[6]) ?? 0 : 0
let bis = a.count > 7 ? min(Double(a[7]) ?? dauer, dauer) : dauer
let gen = AVAssetImageGenerator(asset: asset)
gen.appliesPreferredTrackTransform = true
gen.requestedTimeToleranceBefore = .zero
gen.requestedTimeToleranceAfter = .zero

var zeiten: [Double] = []
var t = von
while t < bis - 0.01 { zeiten.append(t); t += abstand }
if bis >= dauer - 0.01 { zeiten.append(max(0, dauer - 0.04)) }

let srgb = CGColorSpace(name: CGColorSpace.sRGB)!
func speichere(_ img: CGImage, _ u: URL, _ q: Double = 0.85) {
    let d = CGImageDestinationCreateWithURL(u as CFURL, UTType.jpeg.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(d, img, [kCGImageDestinationLossyCompressionQuality: q] as CFDictionary)
    CGImageDestinationFinalize(d)
}

var bilder: [(Double, CGImage)] = []
for z in zeiten {
    do {
        let (img, _) = try await gen.image(at: CMTime(seconds: z, preferredTimescale: 600))
        bilder.append((z, img))
        speichere(img, ordner.appendingPathComponent(String(format: "bild-%05.1fs.jpg", z)))
    } catch { print(String(format: "  %.2f s: kein Bild (%@)", z, "\(error)")) }
}
guard let erstes = bilder.first?.1 else { print("keine Bilder"); exit(1) }
let th = tb * Double(erstes.height) / Double(erstes.width)
let zeilen = (bilder.count + spalten - 1) / spalten
let rand = 6.0, label = 22.0
let bw = Double(spalten) * (tb + rand) + rand
let bh = Double(zeilen) * (th + label + rand) + rand
let ctx = CGContext(data: nil, width: Int(bw), height: Int(bh), bitsPerComponent: 8, bytesPerRow: 0, space: srgb,
                    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.setFillColor(CGColor(gray: 0.15, alpha: 1)); ctx.fill(CGRect(x: 0, y: 0, width: bw, height: bh))
let font = CTFontCreateWithName("Menlo-Bold" as CFString, 15, nil)
for (i, (z, img)) in bilder.enumerated() {
    let c = i % spalten, r = i / spalten
    let x = rand + Double(c) * (tb + rand)
    let yTop = bh - rand - Double(r) * (th + label + rand)
    ctx.interpolationQuality = .high
    ctx.draw(img, in: CGRect(x: x, y: yTop - label - th, width: tb, height: th))
    let s = NSAttributedString(string: String(format: "%.1f s", z), attributes: [
        kCTFontAttributeName as NSAttributedString.Key: font,
        kCTForegroundColorAttributeName as NSAttributedString.Key: CGColor(gray: 1, alpha: 1)])
    let line = CTLineCreateWithAttributedString(s)
    ctx.textPosition = CGPoint(x: x + 2, y: yTop - label + 5)
    CTLineDraw(line, ctx)
}
speichere(ctx.makeImage()!, ordner.appendingPathComponent("kontaktbogen.jpg"), 0.8)
print(String(format: "%d Bilder, Länge %.3f s -> %@", bilder.count, dauer, ordner.appendingPathComponent("kontaktbogen.jpg").path))
