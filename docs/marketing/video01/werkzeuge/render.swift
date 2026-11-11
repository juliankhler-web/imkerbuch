// ImkerBuch Video-Renderer: Zeitplan (JSON) -> H.264-MP4 mit AAC-Ton.
// Nur Apple-Bordmittel (AVFoundation, CoreImage auf Metal, CoreGraphics). Keine Fremdpakete.
//
// Aufruf (empfohlen, schnell):
//   swiftc -O docs/marketing/video01/werkzeuge/render.swift -o /private/tmp/claude-501/video01-tmp/render
//   /private/tmp/claude-501/video01-tmp/render zeitplan.json [ausgabe.mp4]
// oder direkt (langsamer Start):  swift docs/marketing/video01/werkzeuge/render.swift zeitplan.json
//
// Relative Pfade im JSON gelten relativ zum Ordner der JSON-Datei. Beispiel: beispiel-zeitplan.json
//
// Zeitplan (alle Zeiten in Sekunden):
// {
//   "breite": 1920, "hoehe": 1080,        // 1080x1920 für Hochkant-Clips
//   "fps": 30,                            // optional
//   "ausgabe": "folge1-16x9.mp4",         // optional, 2. Aufrufparameter hat Vorrang
//   "ton": "sprecher.wav",                // optional, beginnt bei t=0 (wav/m4a/mp3)
//   "ton_lautstaerke": 1.0,               // optional
//   "musik": "musik.m4a", "musik_lautstaerke": 0.12,   // optional, wird wiederholt, am Ende ausgeblendet
//   "nachlauf": 1.0,                      // Länge = max(Tonende, letztes Clipende) + nachlauf
//   "einblenden": 0.0, "abblenden": 0.0,  // optional, aus/in Hintergrundfarbe
//   "hintergrund": "#FFF6E5",             // Farbe für Lücken und Video-Hintergrund ohne Bild
//   "bitrate_mbit": 12,                   // optional
//   "clips": [
//     { "typ": "bild", "datei": "szene1.png", "start": 0, "dauer": 6,
//       "zoom_start": 1.0, "zoom_ende": 1.08, "pan_x": 0.03, "pan_y": 0, "fokus_x": 0.5, "fokus_y": 0.5,
//       "ueberblendung": 0.4 },
//     { "typ": "video", "datei": "durchsicht.mp4", "start": 32, "dauer": 12, "video_start": 0,
//       "hintergrund_bild": "szene4.png", "rahmen": true, "video_hoehe": 0.86 },
//     { "typ": "karte", "datei": "../endkarte-16x9.png", "dauer": 8 }
//   ]
// }
// Clips: fehlt "start", beginnt der Clip direkt nach dem vorigen. "ueberblendung" gilt für den Übergang
// in den NÄCHSTEN Clip und liegt mittig auf der Grenze. Der letzte Clip bleibt bis zum Videoende stehen.
// "tempo" (nur video): Abspielgeschwindigkeit, z. B. 1.4 = schneller; das Quellvideo läuft ab "video_start".
// "einblendungen": [{ "datei": "titel.png", "start": 0, "dauer": 2.2, "ein": 0.3, "aus": 0.4 }] – PNG mit
// Transparenz in Videogröße, liegt über allen Clips (z. B. Titel der Kurzclips).
// "fokus_x"/"fokus_y" wählen bei 9:16 den Bildausschnitt (0 = links/oben, 1 = rechts/unten).
// "video": Hochkant-Aufnahme; bei 16:9 mittig im Handyrahmen vor weichgezeichnetem "hintergrund_bild"
// (oder Creme), bei 9:16 volle Höhe ohne Rahmen. Ist das Quellvideo kürzer, bleibt das letzte Bild stehen.
// "video" mit "fuellen": true (und "rahmen": false): das Video füllt das ganze Bild (deckend, Rand wird
// abgeschnitten), z. B. ein KI-animierter 16:9-Clip anstelle eines Standbilds:
//     { "typ": "video", "datei": "clips/szene1.mp4", "start": 0, "dauer": 3, "fuellen": true, "rahmen": false,
//       "zoom_start": 1.0, "zoom_ende": 1.05, "fokus_x": 0.5, "fokus_y": 0.4 }
// Ken Burns (zoom_start/zoom_ende/fokus_x/fokus_y/pan_x/pan_y) wirkt bei "video" auf den Inhalt des
// Bildschirms (mit Rahmen: innerhalb des Handys; mit "fuellen": auf das ganze Bild). Standard: kein Zoom.

import AVFoundation
import CoreImage
import CoreImage.CIFilterBuiltins
import CoreGraphics
import Foundation
import ImageIO
import Metal

// MARK: - Zeitplan-Format

struct Clip: Decodable {
    var typ: String                 // "bild" | "video" | "karte"
    var datei: String
    var start: Double?              // Sekunden; fehlt -> direkt nach dem vorigen Clip
    var dauer: Double
    var ueberblendung: Double?      // Überblendung in den NÄCHSTEN Clip (s), Standard 0.4
    // Ken Burns (bild/karte)
    var zoom_start: Double?         // Standard bild 1.00, karte 1.00
    var zoom_ende: Double?          // Standard bild 1.08, karte 1.02
    var pan_x: Double?              // Verschiebung über die Dauer, Anteil der Bildbreite (z.B. 0.03 = nach rechts)
    var pan_y: Double?              // dto. senkrecht (positiv = nach unten)
    var fokus_x: Double?            // 0..1, Mittelpunkt des Ausschnitts (wichtig für 9:16), Standard 0.5
    var fokus_y: Double?            // 0..1 (0 = oben), Standard 0.5
    // video
    var video_start: Double?        // ab welcher Sekunde im Quellvideo, Standard 0
    var hintergrund_bild: String?   // Illustration, die weichgezeichnet hinter das Handy kommt
    var rahmen: Bool?               // Handyrahmen zeichnen (Standard: true bei 16:9, false bei 9:16)
    var video_hoehe: Double?        // Anteil der Bildhöhe für den Bildschirm (Standard 0.86 bei 16:9, 1.0 bei 9:16)
    var tempo: Double?              // Abspielgeschwindigkeit des Quellvideos (Standard 1.0; 1.3 = 30 % schneller)
    var fuellen: Bool?              // Video füllt das ganze Bild (deckend), ohne Rahmen und Hintergrund
}

/// Einblendung über allem (z. B. Titel): PNG in Videogröße mit Transparenz, weich ein- und ausgeblendet.
struct Einblendung: Decodable {
    var datei: String
    var start: Double
    var dauer: Double
    var ein: Double?                // Einblendzeit (Standard 0.3 s)
    var aus: Double?                // Ausblendzeit (Standard 0.4 s)
}

struct Zeitplan: Decodable {
    var breite: Int
    var hoehe: Int
    var fps: Int?                   // Standard 30
    var ausgabe: String?
    var ton: String?                // Sprecher-Datei (wav/m4a/mp3), beginnt bei t=0
    var ton_lautstaerke: Double?    // Standard 1.0
    var musik: String?              // optional, wird wiederholt und am Ende ausgeblendet
    var musik_lautstaerke: Double?  // Standard 0.12
    var nachlauf: Double?           // Sekunden nach dem Ende (Standard 1.0)
    var einblenden: Double?         // Einblenden aus Hintergrundfarbe am Anfang (Standard 0)
    var abblenden: Double?          // Abblenden in Hintergrundfarbe am Ende (Standard 0)
    var hintergrund: String?        // Hex, Standard "#FFF6E5"
    var bitrate_mbit: Double?       // Standard 12 (1080p)
    var clips: [Clip]
    var einblendungen: [Einblendung]?   // optional, über allen Clips
}

// MARK: - Hilfen

func fehler(_ s: String) -> Never {
    FileHandle.standardError.write(("FEHLER: " + s + "\n").data(using: .utf8)!)
    exit(1)
}

func hexFarbe(_ hex: String) -> CIColor {
    var s = hex.trimmingCharacters(in: .whitespaces)
    if s.hasPrefix("#") { s.removeFirst() }
    guard s.count == 6, let v = UInt32(s, radix: 16) else { fehler("Farbe ungültig: \(hex)") }
    return CIColor(red: CGFloat((v >> 16) & 0xFF) / 255, green: CGFloat((v >> 8) & 0xFF) / 255,
                   blue: CGFloat(v & 0xFF) / 255, alpha: 1, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)!
}

func glatt(_ x: Double) -> Double {             // sanftes Ein-/Auslaufen
    let t = min(max(x, 0), 1)
    return t * t * (3 - 2 * t)
}

let args = CommandLine.arguments
guard args.count >= 2 else {
    print("Aufruf: render zeitplan.json [ausgabe.mp4]")
    exit(2)
}
let jsonURL = URL(fileURLWithPath: args[1]).standardizedFileURL
let basis = jsonURL.deletingLastPathComponent()
func pfad(_ p: String) -> URL {
    let e = (p as NSString).expandingTildeInPath
    return e.hasPrefix("/") ? URL(fileURLWithPath: e) : basis.appendingPathComponent(e).standardizedFileURL
}

let plan: Zeitplan
do { plan = try JSONDecoder().decode(Zeitplan.self, from: Data(contentsOf: jsonURL)) }
catch { fehler("Zeitplan nicht lesbar: \(error)") }

let W = plan.breite, H = plan.hoehe
guard W > 0, H > 0, W % 2 == 0, H % 2 == 0 else { fehler("breite/hoehe müssen gerade Zahlen > 0 sein") }
let fps = plan.fps ?? 30
let hochkant = H > W
let ausgabeURL: URL = args.count >= 3 ? URL(fileURLWithPath: args[2]) : pfad(plan.ausgabe ?? "ausgabe.mp4")
let hgFarbe = hexFarbe(plan.hintergrund ?? "#FFF6E5")
let ausgabeRect = CGRect(x: 0, y: 0, width: W, height: H)
let srgb = CGColorSpace(name: CGColorSpace.sRGB)!

guard let device = MTLCreateSystemDefaultDevice() else { fehler("Kein Metal-Gerät") }
let ci = CIContext(mtlDevice: device, options: [.workingColorSpace: srgb, .outputColorSpace: srgb, .cacheIntermediates: true])

// MARK: - Zeiten der Clips berechnen

struct Fenster { var a: Double; var b: Double }   // sichtbarer Bereich inkl. Überblendungen
var starts: [Double] = []
var t0 = 0.0
for c in plan.clips {
    let s = c.start ?? t0
    starts.append(s)
    t0 = s + c.dauer
}
guard !plan.clips.isEmpty else { fehler("keine Clips") }

func ladeAsset(_ url: URL) async -> (AVURLAsset, Double) {
    let a = AVURLAsset(url: url)
    do {
        let d = try await a.load(.duration)
        return (a, d.seconds)
    } catch { fehler("Kann nicht laden: \(url.path) (\(error))") }
}

// Tonlänge
var tonEnde = 0.0
var tonAsset: AVURLAsset? = nil
if let t = plan.ton {
    let u = pfad(t)
    guard FileManager.default.fileExists(atPath: u.path) else { fehler("Ton fehlt: \(u.path)") }
    let (a, d) = await ladeAsset(u)
    tonAsset = a; tonEnde = d
}
let clipEnde = zip(starts, plan.clips).map { $0 + $1.dauer }.max() ?? 0
let gesamt = max(tonEnde, clipEnde) + (plan.nachlauf ?? 1.0)
let frameAnzahl = Int((gesamt * Double(fps)).rounded(.up))

// Fenster je Clip: Überblendung zentriert auf die Grenze zum Nachfolger
var fenster: [Fenster] = []
var ueber: [Double] = []         // Überblendlänge zum Nachfolger
for i in plan.clips.indices {
    let c = plan.clips[i]
    let uIn = i > 0 ? (plan.clips[i - 1].ueberblendung ?? 0.4) : 0
    let uOut = i < plan.clips.count - 1 ? (c.ueberblendung ?? 0.4) : 0
    ueber.append(uOut)
    let a = i == 0 ? 0 : starts[i] - uIn / 2
    var b = starts[i] + c.dauer + uOut / 2
    if i == plan.clips.count - 1 { b = gesamt }   // letzter Clip steht bis zum Schluss
    fenster.append(Fenster(a: a, b: b))
}

// MARK: - Bildquellen

func ladeCIImage(_ url: URL) -> CIImage {
    guard FileManager.default.fileExists(atPath: url.path) else { fehler("Datei fehlt: \(url.path)") }
    guard let src = CGImageSourceCreateWithURL(url as CFURL, nil),
          let cg = CGImageSourceCreateImageAtIndex(src, 0, nil) else { fehler("Bild nicht lesbar: \(url.path)") }
    return CIImage(cgImage: cg)
}

/// Hochwertig skaliert (Lanczos) und einmal gerendert, damit pro Bild nur noch leicht verkleinert wird.
func vorskaliert(_ img: CIImage, faktor: Double) -> CIImage {
    let f = CIFilter.lanczosScaleTransform()
    f.inputImage = img
    f.scale = Float(faktor)
    f.aspectRatio = 1
    let out = f.outputImage!.cropped(to: CGRect(x: 0, y: 0, width: (img.extent.width * faktor).rounded(.down),
                                                height: (img.extent.height * faktor).rounded(.down)))
    guard let cg = ci.createCGImage(out, from: out.extent, format: .RGBA8, colorSpace: srgb) else {
        fehler("Skalieren fehlgeschlagen")
    }
    return CIImage(cgImage: cg)
}

final class StandbildQuelle {
    let basis: CIImage       // vorskaliert auf "deckend * zoomMax"
    let zs: Double, ze: Double, zmax: Double
    let fx: Double, fy: Double, px: Double, py: Double
    init(url: URL, clip: Clip, istKarte: Bool) {
        let roh = ladeCIImage(url)
        zs = clip.zoom_start ?? 1.0
        ze = clip.zoom_ende ?? (istKarte ? 1.02 : 1.08)
        zmax = max(zs, ze, 1.0)
        let deckend = max(Double(W) / roh.extent.width, Double(H) / roh.extent.height)
        basis = vorskaliert(roh, faktor: deckend * zmax)
        fx = clip.fokus_x ?? 0.5; fy = clip.fokus_y ?? 0.5
        px = clip.pan_x ?? 0; py = clip.pan_y ?? 0
    }
    func bild(_ p: Double) -> CIImage {
        let e = glatt(p)
        let z = zs + (ze - zs) * e
        let k = z / zmax
        let bw = basis.extent.width * k, bh = basis.extent.height * k
        // Mittelpunkt des Ausschnitts (y nach oben in CoreImage)
        var cx = (fx + px * (e - 0.5)) * bw
        var cy = (1 - (fy + py * (e - 0.5))) * bh
        let hw = Double(W) / 2, hh = Double(H) / 2
        cx = min(max(cx, hw), bw - hw)
        cy = min(max(cy, hh), bh - hh)
        return basis.transformed(by: CGAffineTransform(scaleX: k, y: k))
            .transformed(by: CGAffineTransform(translationX: hw - cx, y: hh - cy))
            .cropped(to: ausgabeRect)
    }
}

/// Liest ein Video Bild für Bild nach vorne (nie rückwärts) und hält das letzte Bild.
final class VideoQuelle {
    let reader: AVAssetReader
    let output: AVAssetReaderTrackOutput
    let orient: CGImagePropertyOrientation
    let offset: Double
    let tempo: Double
    var aktuell: CIImage? = nil
    var aktuellPuffer: CMSampleBuffer? = nil
    var naechster: CMSampleBuffer? = nil
    var fertig = false
    let hintergrund: CIImage
    let maske: CIImage
    let rahmenBild: CIImage?
    let schirm: CGRect
    var groesse: CGSize = .zero
    let fuellen: Bool
    let zs: Double, ze: Double, fx: Double, fy: Double, px: Double, py: Double

    init(url: URL, clip: Clip) async {
        fuellen = clip.fuellen ?? false
        zs = clip.zoom_start ?? 1.0; ze = clip.zoom_ende ?? zs
        fx = clip.fokus_x ?? 0.5; fy = clip.fokus_y ?? 0.5
        px = clip.pan_x ?? 0; py = clip.pan_y ?? 0
        guard FileManager.default.fileExists(atPath: url.path) else { fehler("Video fehlt: \(url.path)") }
        let asset = AVURLAsset(url: url)
        guard let track = try? await asset.loadTracks(withMediaType: .video).first else { fehler("Keine Videospur: \(url.path)") }
        let natur = (try? await track.load(.naturalSize)) ?? CGSize(width: 1080, height: 1920)
        let tr = (try? await track.load(.preferredTransform)) ?? .identity
        let winkel = atan2(tr.b, tr.a) * 180 / .pi
        switch Int(winkel.rounded()) {
        case 90: orient = .right
        case -90: orient = .left
        case 180, -180: orient = .down
        default: orient = .up
        }
        let gedreht = (orient == .left || orient == .right)
        let qw = gedreht ? natur.height : natur.width
        let qh = gedreht ? natur.width : natur.height
        offset = clip.video_start ?? 0
        tempo = max(0.05, clip.tempo ?? 1.0)
        do { reader = try AVAssetReader(asset: asset) } catch { fehler("Video nicht lesbar: \(error)") }
        output = AVAssetReaderTrackOutput(track: track, outputSettings: [
            kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
            kCVPixelBufferIOSurfacePropertiesKey as String: [:] as [String: Any],
        ])
        output.alwaysCopiesSampleData = false
        reader.add(output)
        if offset > 0 {
            reader.timeRange = CMTimeRange(start: CMTime(seconds: offset, preferredTimescale: 600), duration: .positiveInfinity)
        }
        reader.startReading()

        // Bildschirmgröße und Position
        let rahmen = fuellen ? false : (clip.rahmen ?? !hochkant)
        let anteil = clip.video_hoehe ?? (hochkant ? 1.0 : 0.86)
        var sh = Double(H) * anteil
        var sw = sh * Double(qw / qh)
        if sw > Double(W) * 0.96 && !hochkant { sw = Double(W) * 0.96; sh = sw * Double(qh / qw) }
        let sr = fuellen ? ausgabeRect
            : CGRect(x: (Double(W) - sw) / 2, y: (Double(H) - sh) / 2, width: sw, height: sh).integral
        schirm = sr

        // Hintergrund: Illustration weichgezeichnet + Creme-Schleier, sonst ruhiges Creme
        if fuellen {
            hintergrund = CIImage(color: hgFarbe).cropped(to: ausgabeRect)
        } else if let hb = clip.hintergrund_bild {
            let roh = ladeCIImage(pfad(hb))
            let deck = max(Double(W) / roh.extent.width, Double(H) / roh.extent.height) * 1.1
            let gross = roh.transformed(by: CGAffineTransform(scaleX: deck, y: deck))
            let mitte = gross.transformed(by: CGAffineTransform(translationX: (Double(W) - gross.extent.width) / 2,
                                                                y: (Double(H) - gross.extent.height) / 2))
            let blur = mitte.clampedToExtent().applyingGaussianBlur(sigma: Double(min(W, H)) / 40).cropped(to: ausgabeRect)
            let schleier = CIImage(color: CIColor(red: 1, green: 0.965, blue: 0.898, alpha: 0.55)).cropped(to: ausgabeRect)
            let komb = schleier.composited(over: blur)
            let cg = ci.createCGImage(komb, from: ausgabeRect, format: .RGBA8, colorSpace: srgb)!
            hintergrund = CIImage(cgImage: cg)
        } else {
            hintergrund = CIImage(color: hgFarbe).cropped(to: ausgabeRect)
        }

        // Maske (abgerundeter Bildschirm) und Rahmen per CoreGraphics
        let radius = rahmen ? sr.width * 0.085 : 0
        func zeichne(_ f: (CGContext) -> Void) -> CIImage {
            let ctx = CGContext(data: nil, width: W, height: H, bitsPerComponent: 8, bytesPerRow: 0, space: srgb,
                                bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
            ctx.setShouldAntialias(true)
            f(ctx)
            return CIImage(cgImage: ctx.makeImage()!)
        }
        maske = zeichne { ctx in
            ctx.setFillColor(CGColor(gray: 1, alpha: 1))
            ctx.addPath(CGPath(roundedRect: sr, cornerWidth: radius, cornerHeight: radius, transform: nil))
            ctx.fillPath()
        }
        if rahmen {
            let rand = sr.width * 0.035
            let aussen = sr.insetBy(dx: -rand, dy: -rand)
            let ra = radius + rand
            rahmenBild = zeichne { ctx in
                // Schatten + Gehäuse (dunkles Warmbraun), innen ausgespart
                ctx.saveGState()
                ctx.setShadow(offset: CGSize(width: 0, height: -Double(H) * 0.012), blur: Double(H) * 0.04,
                              color: CGColor(srgbRed: 0.29, green: 0.2, blue: 0.09, alpha: 0.35))
                ctx.addPath(CGPath(roundedRect: aussen, cornerWidth: ra, cornerHeight: ra, transform: nil))
                ctx.setFillColor(CGColor(srgbRed: 0.17, green: 0.13, blue: 0.09, alpha: 1))
                ctx.fillPath()
                ctx.restoreGState()
                // feine helle Kante
                ctx.addPath(CGPath(roundedRect: aussen.insetBy(dx: 1.5, dy: 1.5), cornerWidth: ra - 1.5, cornerHeight: ra - 1.5, transform: nil))
                ctx.setStrokeColor(CGColor(srgbRed: 0.42, green: 0.34, blue: 0.25, alpha: 1))
                ctx.setLineWidth(3)
                ctx.strokePath()
                // Bildschirmfläche ausstanzen
                ctx.setBlendMode(.clear)
                ctx.addPath(CGPath(roundedRect: sr, cornerWidth: radius, cornerHeight: radius, transform: nil))
                ctx.fillPath()
            }
        } else {
            rahmenBild = nil
        }
    }

    private func liesNaechsten() -> CMSampleBuffer? {
        if fertig { return nil }
        while reader.status == .reading {
            if let sb = output.copyNextSampleBuffer() {
                if CMSampleBufferGetImageBuffer(sb) != nil { return sb }
            } else { break }
        }
        fertig = true
        return nil
    }

    /// Bild zur Zeit `t` relativ zum Clipstart (Sekunden); `p` = Fortschritt 0..1 im sichtbaren Fenster (Ken Burns).
    func bild(_ t: Double, _ p: Double) -> CIImage {
        let ziel = max(0, t) * tempo + offset
        if aktuellPuffer == nil { aktuellPuffer = liesNaechsten() }
        if naechster == nil { naechster = liesNaechsten() }
        while let n = naechster, CMSampleBufferGetPresentationTimeStamp(n).seconds <= ziel + 0.0001 {
            aktuellPuffer = n
            naechster = liesNaechsten()
        }
        var inhalt: CIImage
        if let sb = aktuellPuffer, let pb = CMSampleBufferGetImageBuffer(sb) {
            inhalt = CIImage(cvPixelBuffer: pb).oriented(orient)
            inhalt = inhalt.transformed(by: CGAffineTransform(translationX: -inhalt.extent.minX, y: -inhalt.extent.minY))
            aktuell = inhalt
        } else if let a = aktuell {
            inhalt = a
        } else {
            return hintergrund
        }
        // Bildschirm deckend in `schirm` einpassen (Lanczos nicht nötig: einmalige Verkleinerung, linear reicht),
        // dazu optional Ken Burns (Zoom/Fokus/Schwenk) auf den Inhalt
        let e = glatt(p)
        let z = max(zs + (ze - zs) * e, 1.0)
        let s = max(schirm.width / inhalt.extent.width, schirm.height / inhalt.extent.height) * z
        var g = inhalt.transformed(by: CGAffineTransform(scaleX: s, y: s))
        let gw = g.extent.width, gh = g.extent.height
        var cx = (fx + px * (e - 0.5)) * gw                 // Fokuspunkt im skalierten Inhalt
        var cy = (1 - (fy + py * (e - 0.5))) * gh           // (CoreImage: y nach oben)
        cx = min(max(cx, schirm.width / 2), gw - schirm.width / 2)
        cy = min(max(cy, schirm.height / 2), gh - schirm.height / 2)
        g = g.transformed(by: CGAffineTransform(translationX: schirm.midX - cx - g.extent.minX,
                                                y: schirm.midY - cy - g.extent.minY))
        if fuellen { return g.cropped(to: ausgabeRect) }
        let leer = CIImage(color: CIColor(red: 0, green: 0, blue: 0, alpha: 0)).cropped(to: ausgabeRect)
        let maskiert = g.applyingFilter("CIBlendWithMask", parameters: [
            kCIInputBackgroundImageKey: leer, kCIInputMaskImageKey: maske,
        ])
        var bild = maskiert.composited(over: hintergrund)
        if let r = rahmenBild { bild = r.composited(over: bild) }
        return bild.cropped(to: ausgabeRect)
    }
}

enum Quelle {
    case stand(StandbildQuelle)
    case video(VideoQuelle)
}

// Quellen werden erst geladen, wenn sie gebraucht werden, und danach freigegeben.
var quellen: [Int: Quelle] = [:]
func quelle(_ i: Int) async -> Quelle {
    if let q = quellen[i] { return q }
    let c = plan.clips[i]
    let q: Quelle
    switch c.typ {
    case "bild": q = .stand(StandbildQuelle(url: pfad(c.datei), clip: c, istKarte: false))
    case "karte": q = .stand(StandbildQuelle(url: pfad(c.datei), clip: c, istKarte: true))
    case "video": q = .video(await VideoQuelle(url: pfad(c.datei), clip: c))
    default: fehler("Unbekannter Clip-Typ: \(c.typ)")
    }
    quellen[i] = q
    return q
}

func clipBild(_ i: Int, _ t: Double) async -> CIImage {
    let q = await quelle(i)
    switch q {
    case .stand(let s):
        let f = fenster[i]
        return s.bild((t - f.a) / max(f.b - f.a, 0.001))
    case .video(let v):
        let f = fenster[i]
        return v.bild(t - starts[i], (t - f.a) / max(f.b - f.a, 0.001))
    }
}

var einblendCache: [Int: CIImage] = [:]
func einblendBild(_ k: Int, _ e: Einblendung) -> CIImage {
    if let c = einblendCache[k] { return c }
    let roh = ladeCIImage(pfad(e.datei))
    // auf Videogröße bringen (falls das PNG anders groß ist), mittig
    let s = min(Double(W) / roh.extent.width, Double(H) / roh.extent.height)
    var b = roh.transformed(by: CGAffineTransform(scaleX: s, y: s))
    b = b.transformed(by: CGAffineTransform(translationX: (Double(W) - b.extent.width) / 2 - b.extent.minX,
                                            y: (Double(H) - b.extent.height) / 2 - b.extent.minY))
    einblendCache[k] = b
    return b
}

func frame(_ t: Double) async -> CIImage {
    let hg = CIImage(color: hgFarbe).cropped(to: ausgabeRect)
    let aktiv = plan.clips.indices.filter { fenster[$0].a <= t && t < fenster[$0].b }
    var bild = hg
    // Clips in Reihenfolge übereinander; der spätere wird über die Überblendung eingeblendet
    for i in aktiv {
        let b = await clipBild(i, t)
        var alpha = 1.0
        if i > 0 {
            let u = plan.clips[i - 1].ueberblendung ?? 0.4
            if u > 0 && aktiv.contains(i - 1) { alpha = min(max((t - fenster[i].a) / u, 0), 1) }
        }
        if alpha >= 1 {
            bild = b
        } else {
            let f = CIFilter.dissolveTransition()
            f.inputImage = bild
            f.targetImage = b
            f.time = Float(glatt(alpha))
            bild = f.outputImage!.cropped(to: ausgabeRect)
        }
    }
    // Einblendungen (Titel usw.)
    for (k, e) in (plan.einblendungen ?? []).enumerated() where e.start <= t && t < e.start + e.dauer {
        let img = einblendBild(k, e)
        let ein = e.ein ?? 0.3, aus = e.aus ?? 0.4
        var al = 1.0
        if ein > 0 { al = min(al, (t - e.start) / ein) }
        if aus > 0 { al = min(al, (e.start + e.dauer - t) / aus) }
        al = glatt(min(max(al, 0), 1))
        let geblendet = al >= 1 ? img : img.applyingFilter("CIColorMatrix", parameters: [
            "inputAVector": CIVector(x: 0, y: 0, z: 0, w: CGFloat(al))])
        bild = geblendet.composited(over: bild).cropped(to: ausgabeRect)
    }
    // Ein-/Abblenden aus/in Hintergrundfarbe
    let ein = plan.einblenden ?? 0, ab = plan.abblenden ?? 0
    var deck = 1.0
    if ein > 0 && t < ein { deck = t / ein }
    if ab > 0 && t > gesamt - ab { deck = min(deck, (gesamt - t) / ab) }
    if deck < 1 {
        let f = CIFilter.dissolveTransition()
        f.inputImage = hg; f.targetImage = bild; f.time = Float(glatt(deck))
        bild = f.outputImage!.cropped(to: ausgabeRect)
    }
    // nicht mehr benötigte Quellen freigeben
    for k in quellen.keys where fenster[k].b < t - 0.5 { quellen[k] = nil }
    return bild
}

// MARK: - Ton vorbereiten (Sprecher + optionale Musik)

func tonLeser() async -> (AVAssetReader, AVAssetReaderAudioMixOutput)? {
    let comp = AVMutableComposition()
    var params: [AVMutableAudioMixInputParameters] = []
    let ende = CMTime(seconds: gesamt, preferredTimescale: 48000)
    if let a = tonAsset, let src = try? await a.loadTracks(withMediaType: .audio).first,
       let spur = comp.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid) {
        let d = try! await a.load(.duration)
        let dauer = CMTimeMinimum(d, ende)
        try? spur.insertTimeRange(CMTimeRange(start: .zero, duration: dauer), of: src, at: .zero)
        let p = AVMutableAudioMixInputParameters(track: spur)
        p.setVolume(Float(plan.ton_lautstaerke ?? 1.0), at: .zero)
        params.append(p)
    }
    if let m = plan.musik {
        let u = pfad(m)
        guard FileManager.default.fileExists(atPath: u.path) else { fehler("Musik fehlt: \(u.path)") }
        let (ma, md) = await ladeAsset(u)
        if let src = try? await ma.loadTracks(withMediaType: .audio).first, md > 0.1,
           let spur = comp.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid) {
            var pos = 0.0
            while pos < gesamt {
                let stueck = min(md, gesamt - pos)
                try? spur.insertTimeRange(CMTimeRange(start: .zero, duration: CMTime(seconds: stueck, preferredTimescale: 48000)),
                                          of: src, at: CMTime(seconds: pos, preferredTimescale: 48000))
                pos += stueck
            }
            let v = Float(plan.musik_lautstaerke ?? 0.12)
            let p = AVMutableAudioMixInputParameters(track: spur)
            p.setVolume(v, at: .zero)
            let aus = min(3.0, gesamt / 4)
            p.setVolumeRamp(fromStartVolume: v, toEndVolume: 0,
                            timeRange: CMTimeRange(start: CMTime(seconds: gesamt - aus, preferredTimescale: 600),
                                                   duration: CMTime(seconds: aus, preferredTimescale: 600)))
            params.append(p)
        }
    }
    let spuren = comp.tracks(withMediaType: .audio)
    if spuren.isEmpty { return nil }
    guard let reader = try? AVAssetReader(asset: comp) else { fehler("Ton nicht lesbar") }
    let out = AVAssetReaderAudioMixOutput(audioTracks: spuren, audioSettings: [
        AVFormatIDKey: kAudioFormatLinearPCM,
        AVSampleRateKey: 48000,
        AVNumberOfChannelsKey: 2,
        AVLinearPCMBitDepthKey: 16,
        AVLinearPCMIsFloatKey: false,
        AVLinearPCMIsBigEndianKey: false,
        AVLinearPCMIsNonInterleaved: false,
    ])
    let mix = AVMutableAudioMix()
    mix.inputParameters = params
    out.audioMix = mix
    reader.add(out)
    reader.timeRange = CMTimeRange(start: .zero, duration: ende)
    return (reader, out)
}

// MARK: - Schreiben

try? FileManager.default.removeItem(at: ausgabeURL)
try? FileManager.default.createDirectory(at: ausgabeURL.deletingLastPathComponent(), withIntermediateDirectories: true)
let writer: AVAssetWriter
do { writer = try AVAssetWriter(outputURL: ausgabeURL, fileType: .mp4) } catch { fehler("Ausgabe nicht anlegbar: \(error)") }
writer.shouldOptimizeForNetworkUse = true

let bitrate = Int((plan.bitrate_mbit ?? 12) * 1_000_000)
let vIn = AVAssetWriterInput(mediaType: .video, outputSettings: [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: W,
    AVVideoHeightKey: H,
    AVVideoColorPropertiesKey: [
        AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2,
        AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2,
        AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2,
    ],
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: bitrate,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
        AVVideoMaxKeyFrameIntervalKey: fps * 2,
        AVVideoExpectedSourceFrameRateKey: fps,
        AVVideoAllowFrameReorderingKey: true,
    ],
])
vIn.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: vIn, sourcePixelBufferAttributes: [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
    kCVPixelBufferWidthKey as String: W,
    kCVPixelBufferHeightKey as String: H,
    kCVPixelBufferMetalCompatibilityKey as String: true,
    kCVPixelBufferIOSurfacePropertiesKey as String: [:] as [String: Any],
])
writer.add(vIn)

var aIn: AVAssetWriterInput? = nil
let ton = await tonLeser()
if ton != nil {
    let a = AVAssetWriterInput(mediaType: .audio, outputSettings: [
        AVFormatIDKey: kAudioFormatMPEG4AAC,
        AVSampleRateKey: 48000,
        AVNumberOfChannelsKey: 2,
        AVEncoderBitRateKey: 192_000,
    ])
    a.expectsMediaDataInRealTime = false
    writer.add(a)
    aIn = a
}

guard writer.startWriting() else { fehler("Schreiben startet nicht: \(String(describing: writer.error))") }
writer.startSession(atSourceTime: .zero)
if let r = ton?.0 { guard r.startReading() else { fehler("Ton-Lesen startet nicht: \(String(describing: r.error))") } }

print("Render \(W)x\(H) @\(fps) fps, \(String(format: "%.2f", gesamt)) s = \(frameAnzahl) Bilder, \(plan.clips.count) Clips, Ton: \(ton != nil ? "ja" : "nein")")
print("-> \(ausgabeURL.path)")
let startZeit = Date()
var n = 0
var videoFertig = false
var tonFertig = ton == nil
var letzteMeldung = -1

while !(videoFertig && tonFertig) {
    var gemacht = false
    if !videoFertig && vIn.isReadyForMoreMediaData {
        if n >= frameAnzahl {
            vIn.markAsFinished(); videoFertig = true
        } else {
            let t = Double(n) / Double(fps)
            let img = await frame(t)
            guard let pool = adaptor.pixelBufferPool else { fehler("Kein Pixelpuffer-Pool") }
            var pbOpt: CVPixelBuffer? = nil
            CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pbOpt)
            guard let pb = pbOpt else { fehler("Pixelpuffer fehlt") }
            ci.render(img, to: pb, bounds: ausgabeRect, colorSpace: srgb)
            if !adaptor.append(pb, withPresentationTime: CMTime(value: CMTimeValue(n), timescale: CMTimeScale(fps))) {
                fehler("Bild \(n) nicht geschrieben: \(String(describing: writer.error))")
            }
            n += 1
            let prozent = n * 100 / frameAnzahl
            if prozent / 5 != letzteMeldung / 5 {
                letzteMeldung = prozent
                let v = Date().timeIntervalSince(startZeit)
                print(String(format: "  %3d %%  (%d/%d Bilder, %.1f s vergangen)", prozent, n, frameAnzahl, v))
            }
        }
        gemacht = true
    }
    if !tonFertig, let a = aIn, let r = ton?.0, let out = ton?.1, a.isReadyForMoreMediaData {
        if r.status == .reading, let sb = out.copyNextSampleBuffer() {
            if !a.append(sb) { fehler("Ton nicht geschrieben: \(String(describing: writer.error))") }
        } else {
            if r.status == .failed { fehler("Ton-Lesefehler: \(String(describing: r.error))") }
            a.markAsFinished(); tonFertig = true
        }
        gemacht = true
    }
    if !gemacht { usleep(500) }
}

writer.endSession(atSourceTime: CMTime(value: CMTimeValue(frameAnzahl), timescale: CMTimeScale(fps)))
await writer.finishWriting()
if writer.status != .completed { fehler("Fertigstellen fehlgeschlagen: \(String(describing: writer.error))") }
print(String(format: "Fertig in %.1f s: %@", Date().timeIntervalSince(startZeit), ausgabeURL.path))
