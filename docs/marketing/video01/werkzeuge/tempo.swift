// tempo.swift <ein.mp4> <aus.mp4> <ziel_sekunden> <max_faktor>
import AVFoundation
let a = CommandLine.arguments
let src = AVURLAsset(url: URL(fileURLWithPath: a[1]))
let ziel = Double(a[3])!, maxF = Double(a[4])!
let dur = try await src.load(.duration).seconds
let f = min(dur / ziel, maxF)
let nutz = min(dur, ziel * f)   // Teil der Quelle, der verwendet wird
let comp = AVMutableComposition()
let vt = try await src.loadTracks(withMediaType: .video)[0]
let ct = comp.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid)!
let r = CMTimeRange(start: .zero, duration: CMTime(seconds: nutz, preferredTimescale: 600))
try ct.insertTimeRange(r, of: vt, at: .zero)
ct.preferredTransform = try await vt.load(.preferredTransform)
ct.scaleTimeRange(r, toDuration: CMTime(seconds: nutz / f, preferredTimescale: 600))
try? FileManager.default.removeItem(atPath: a[2])
let ex = AVAssetExportSession(asset: comp, presetName: AVAssetExportPresetHighestQuality)!
try await ex.export(to: URL(fileURLWithPath: a[2]), as: .mp4)
print(a[1].split(separator: "/").last!, "Faktor", String(format: "%.2f", f), "→", String(format: "%.1f s", nutz / f))
