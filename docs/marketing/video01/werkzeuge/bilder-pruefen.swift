// Zieht Einzelbilder aus einem Video (zur Kontrolle) und nennt Dauer, Größe und Bildrate.
// Aufruf: swift bilder-pruefen.swift <video.mp4> <zielordner> <sekunden> [<sekunden> …]
import AVFoundation
import Foundation
import ImageIO
import UniformTypeIdentifiers

let a = CommandLine.arguments
let url = URL(fileURLWithPath: a[1]), ziel = a[2]
let asset = AVURLAsset(url: url)
let sem = DispatchSemaphore(value: 0)
Task {
  let dauer = try await asset.load(.duration)
  let spur = try await asset.loadTracks(withMediaType: .video).first!
  let groesse = try await spur.load(.naturalSize), fps = try await spur.load(.nominalFrameRate)
  let n = try await asset.loadTracks(withMediaType: .audio).count
  print(String(format: "Dauer %.3f s · %.0f×%.0f · %.2f Bilder/s · Tonspuren: %d", dauer.seconds, groesse.width, groesse.height, fps, n))
  let gen = AVAssetImageGenerator(asset: asset)
  gen.requestedTimeToleranceBefore = .zero; gen.requestedTimeToleranceAfter = .zero
  gen.maximumSize = CGSize(width: 660, height: 1434)
  for s in a.dropFirst(3) {
    let t = CMTime(seconds: Double(s)!, preferredTimescale: 600)
    let (bild, _) = try await gen.image(at: t)
    let pfad = "\(ziel)/\(url.deletingPathExtension().lastPathComponent)-\(s)s.png"
    let d = CGImageDestinationCreateWithURL(URL(fileURLWithPath: pfad) as CFURL, UTType.png.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(d, bild, nil); CGImageDestinationFinalize(d)
    print(pfad)
  }
  sem.signal()
}
sem.wait()
