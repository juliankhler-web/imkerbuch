// Baut aus den Einzelbildern einer Aufnahme (JPEG + zeiten.txt) ein H.264-Video mit festen 30 Bildern/s.
// Fehlende Zeitpunkte werden mit dem jeweils letzten Bild gefüllt (Chrome liefert nur bei Änderungen ein neues Bild).
// Aufruf: swift zusammenbauen.swift <bilderordner> <ziel.mp4>
// zeiten.txt: je Zeile "<dateiname> <sekunden>" (Sekunden ab Aufnahmebeginn); letzte Zeile "ENDE <sekunden>".
import AVFoundation
import CoreGraphics
import Foundation
import ImageIO

let args = CommandLine.arguments
guard args.count == 3 else { print("Aufruf: swift zusammenbauen.swift <bilderordner> <ziel.mp4>"); exit(1) }
let ordner = URL(fileURLWithPath: args[1]), ziel = URL(fileURLWithPath: args[2])
let fps: Int32 = 30

var bilder: [(String, Double)] = []
var ende = 0.0
for zeile in try String(contentsOf: ordner.appendingPathComponent("zeiten.txt"), encoding: .utf8).split(separator: "\n") {
  let t = zeile.split(separator: " ")
  guard t.count == 2, let s = Double(t[1]) else { continue }
  if t[0] == "ENDE" { ende = s } else { bilder.append((String(t[0]), s)) }
}
guard !bilder.isEmpty else { print("keine Bilder"); exit(1) }
bilder.sort { $0.1 < $1.1 }

func laden(_ name: String) -> CGImage {
  let src = CGImageSourceCreateWithURL(ordner.appendingPathComponent(name) as CFURL, nil)!
  return CGImageSourceCreateImageAtIndex(src, 0, nil)!
}
let erstes = laden(bilder[0].0)
let breite = erstes.width & ~1, hoehe = erstes.height & ~1

try? FileManager.default.removeItem(at: ziel)
let writer = try AVAssetWriter(outputURL: ziel, fileType: .mp4)
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: breite, AVVideoHeightKey: hoehe,
  AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 16_000_000, AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
                                    AVVideoMaxKeyFrameIntervalKey: 30, AVVideoExpectedSourceFrameRateKey: 30],
  AVVideoColorPropertiesKey: [AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2, AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2, AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2],
])
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA, kCVPixelBufferWidthKey as String: breite, kCVPixelBufferHeightKey as String: hoehe,
])
writer.add(input)
writer.startWriting()
writer.startSession(atSourceTime: .zero)

let farbraum = CGColorSpace(name: CGColorSpace.sRGB)!
func puffer(_ bild: CGImage) -> CVPixelBuffer {
  var pb: CVPixelBuffer?
  CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &pb)
  let p = pb!
  CVPixelBufferLockBaseAddress(p, [])
  let ctx = CGContext(data: CVPixelBufferGetBaseAddress(p), width: breite, height: hoehe, bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(p),
                      space: farbraum, bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)!
  ctx.interpolationQuality = .high
  ctx.draw(bild, in: CGRect(x: 0, y: 0, width: breite, height: hoehe))
  CVPixelBufferUnlockBaseAddress(p, [])
  return p
}

let dauer = max(ende, bilder.last!.1)
let anzahl = Int((dauer * Double(fps)).rounded())
var idx = 0, geladen = -1
var aktuell: CVPixelBuffer? = nil
for i in 0..<anzahl {
  let t = Double(i) / Double(fps)
  while idx + 1 < bilder.count && bilder[idx + 1].1 <= t + 0.0001 { idx += 1 }
  if idx != geladen { aktuell = autoreleasepool { puffer(laden(bilder[idx].0)) }; geladen = idx }
  while !input.isReadyForMoreMediaData { Thread.sleep(forTimeInterval: 0.005) }
  adaptor.append(aktuell!, withPresentationTime: CMTime(value: CMTimeValue(i), timescale: fps))
}
input.markAsFinished()
let fertig = DispatchSemaphore(value: 0)
writer.finishWriting { fertig.signal() }
fertig.wait()
if writer.status != .completed { print("Fehler:", writer.error as Any); exit(1) }
print("OK \(ziel.path) \(breite)x\(hoehe) \(anzahl) Bilder = \(String(format: "%.2f", Double(anzahl) / Double(fps))) s")
