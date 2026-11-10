// Prüft ein fertiges Video: Spuren, Länge, Größe, Ton – und speichert Einzelbilder zum Ansehen.
// Aufruf: swift docs/marketing/video01/werkzeuge/pruefen.swift video.mp4 ausgabeordner 0.5 1.9 5.0 ...
// (Zeiten in Sekunden; ohne Zeiten: Anfang, Mitte, Ende)

import AVFoundation
import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

let a = CommandLine.arguments
guard a.count >= 3 else { print("Aufruf: pruefen video.mp4 ordner [zeit ...]"); exit(2) }
let url = URL(fileURLWithPath: a[1])
let ordner = URL(fileURLWithPath: a[2])
try? FileManager.default.createDirectory(at: ordner, withIntermediateDirectories: true)

let asset = AVURLAsset(url: url)
let dauer = try await asset.load(.duration).seconds
print(String(format: "Länge: %.3f s", dauer))
for t in try await asset.load(.tracks) {
    let typ = t.mediaType.rawValue
    let r = try await t.load(.timeRange)
    if t.mediaType == .video {
        let g = try await t.load(.naturalSize)
        let f = try await t.load(.nominalFrameRate)
        let tr = try await t.load(.preferredTransform)
        print(String(format: "Spur %@: %.0fx%.0f, %.2f fps, %.3f–%.3f s, Drehung %@", typ, g.width, g.height, f,
                     r.start.seconds, r.end.seconds, tr.isIdentity ? "keine" : "\(tr)"))
    } else {
        let fd = try await t.load(.formatDescriptions)
        var info = ""
        if let d = fd.first, let asbd = CMAudioFormatDescriptionGetStreamBasicDescription(d)?.pointee {
            info = String(format: "%.0f Hz, %d Kanäle", asbd.mSampleRate, asbd.mChannelsPerFrame)
        }
        print(String(format: "Spur %@: %@, %.3f–%.3f s", typ, info, r.start.seconds, r.end.seconds))
    }
}

var zeiten = a.dropFirst(3).compactMap { Double($0) }
if zeiten.isEmpty { zeiten = [0, dauer / 2, max(0, dauer - 0.05)] }
let gen = AVAssetImageGenerator(asset: asset)
gen.requestedTimeToleranceBefore = .zero
gen.requestedTimeToleranceAfter = .zero
gen.appliesPreferredTrackTransform = true
for (i, t) in zeiten.enumerated() {
    let (cg, ist) = try await gen.image(at: CMTime(seconds: t, preferredTimescale: 600))
    // mittlere Helligkeit als Schnelltest gegen schwarze Bilder
    let w = 64, h = 36
    let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
                        space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
    let p = ctx.data!.assumingMemoryBound(to: UInt8.self)
    var summe = 0
    for k in 0..<(w * h) { summe += Int(p[k * 4]) + Int(p[k * 4 + 1]) + Int(p[k * 4 + 2]) }
    let hell = Double(summe) / Double(w * h * 3)
    let ziel = ordner.appendingPathComponent(String(format: "bild-%02d-%.2fs.png", i + 1, t))
    let dest = CGImageDestinationCreateWithURL(ziel as CFURL, UTType.png.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(dest, cg, nil)
    CGImageDestinationFinalize(dest)
    print(String(format: "Bild bei %.3f s (tatsächlich %.3f s): %dx%d, mittlere Helligkeit %.0f/255 -> %@",
                 t, ist.seconds, cg.width, cg.height, hell, ziel.path))
}
