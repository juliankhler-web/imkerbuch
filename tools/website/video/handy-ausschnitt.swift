// Baut aus der Querformat-Schleife den Hochformat-Ausschnitt fürs Handy: Biene und Bienenstock unten, Himmel oben für den Text.
// Der Himmel steht im Quellvideo still; oben wird er aus dem ersten Bild verlängert, deshalb bleibt die Schleife nahtlos.
// Aufruf: handy-ausschnitt QUELLE.mp4 AUS.mp4
import AVFoundation
import CoreImage
let a = CommandLine.arguments
let env = ProcessInfo.processInfo.environment
func ev(_ k: String, _ d: Double) -> Double { Double(env[k] ?? "") ?? d }
let W = 540, H = 960
let X0 = ev("X0", 20), BREITE = ev("BREITE", 820)
let asset = AVURLAsset(url: URL(fileURLWithPath: a[1]))
let spur = asset.tracks(withMediaType: .video)[0]
let reader = try! AVAssetReader(asset: asset)
let aus = AVAssetReaderTrackOutput(track: spur, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
reader.add(aus); reader.startReading()
try? FileManager.default.removeItem(atPath: a[2])
let writer = try! AVAssetWriter(outputURL: URL(fileURLWithPath: a[2]), fileType: .mp4)
let eingabe = AVAssetWriterInput(mediaType: .video, outputSettings: [AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: W, AVVideoHeightKey: H,
  AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: Int(ev("BITRATE", 2_600_000)), AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel]])
let adapter = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: eingabe, sourcePixelBufferAttributes: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA, kCVPixelBufferWidthKey as String: W, kCVPixelBufferHeightKey as String: H])
writer.add(eingabe); writer.startWriting(); writer.startSession(atSourceTime: .zero)
let ctx = CIContext(options: [.workingColorSpace: CGColorSpaceCreateDeviceRGB()])
let s = CGFloat(Double(W) / BREITE)
var himmel: CIImage? = nil
var n = 0
while let puffer = aus.copyNextSampleBuffer() {
  guard let bild = CMSampleBufferGetImageBuffer(puffer) else { continue }
  let zeit = CMSampleBufferGetPresentationTimeStamp(puffer)
  let roh = CIImage(cvPixelBuffer: bild)
  let qh = roh.extent.height
  // CoreImage zählt von unten: das Video kommt unten ins Bild, der Himmel darüber
  let klein = roh.transformed(by: CGAffineTransform(translationX: -CGFloat(X0), y: 0).scaledBy(x: s, y: s).concatenating(.identity))
    .transformed(by: .identity)
  let vh = ((qh - 8) * s).rounded(.down)   // die oberste Videozeile ist dunkler und wäre sonst als Linie im Himmel zu sehen
  if himmel == nil {
    let oben = klein.cropped(to: CGRect(x: 0, y: vh - 150 * s, width: CGFloat(W), height: 150 * s))
    // gespiegelt an die Oberkante, dann in ein ruhiges Tiefblau auslaufen
    let spiegel = oben.transformed(by: CGAffineTransform(scaleX: 1, y: -1).translatedBy(x: 0, y: -2 * vh))
    let weich = spiegel.clampedToExtent().applyingGaussianBlur(sigma: 28).cropped(to: CGRect(x: 0, y: vh, width: CGFloat(W), height: CGFloat(H)))
    let farbe = CIColor(red: 0.075, green: 0.30, blue: 0.68)
    let grund = CIImage(color: farbe).cropped(to: CGRect(x: 0, y: 0, width: W, height: H * 2))
    let auslauf = CIFilter(name: "CILinearGradient", parameters: ["inputPoint0": CIVector(x: 0, y: vh + 40), "inputColor0": CIColor(red: 1, green: 1, blue: 1, alpha: 1), "inputPoint1": CIVector(x: 0, y: vh + 240), "inputColor1": CIColor(red: 1, green: 1, blue: 1, alpha: 0)])!.outputImage!
    let maske = CIFilter(name: "CILinearGradient", parameters: ["inputPoint0": CIVector(x: 0, y: vh + 40), "inputColor0": CIColor(red: 1, green: 1, blue: 1), "inputPoint1": CIVector(x: 0, y: vh + 240), "inputColor1": CIColor(red: 0, green: 0, blue: 0)])!.outputImage!
    _ = auslauf
    let scharf = spiegel.applyingFilter("CIBlendWithMask", parameters: [kCIInputBackgroundImageKey: weich, kCIInputMaskImageKey: CIFilter(name: "CILinearGradient", parameters: ["inputPoint0": CIVector(x: 0, y: vh), "inputColor0": CIColor(red: 1, green: 1, blue: 1), "inputPoint1": CIVector(x: 0, y: vh + 70), "inputColor1": CIColor(red: 0, green: 0, blue: 0)])!.outputImage!])
    himmel = scharf.applyingFilter("CIBlendWithMask", parameters: [kCIInputBackgroundImageKey: grund, kCIInputMaskImageKey: maske]).cropped(to: CGRect(x: 0, y: vh, width: CGFloat(W), height: CGFloat(H) - vh))
    himmel = ctx.createCGImage(himmel!, from: himmel!.extent).map { CIImage(cgImage: $0).transformed(by: CGAffineTransform(translationX: 0, y: vh)) }
  }
  let ganz = klein.cropped(to: CGRect(x: 0, y: 0, width: W, height: Int(vh) + 1)).composited(over: himmel!).cropped(to: CGRect(x: 0, y: 0, width: W, height: H))
  while !eingabe.isReadyForMoreMediaData { usleep(2000) }
  var pb: CVPixelBuffer?
  CVPixelBufferPoolCreatePixelBuffer(nil, adapter.pixelBufferPool!, &pb)
  ctx.render(ganz, to: pb!)
  adapter.append(pb!, withPresentationTime: zeit)
  n += 1
}
eingabe.markAsFinished()
let fertig = DispatchSemaphore(value: 0)
writer.finishWriting { fertig.signal() }
fertig.wait()
print("Bilder", n, "Status", writer.status.rawValue, writer.error as Any)
