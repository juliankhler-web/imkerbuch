import AVFoundation
let args = CommandLine.arguments
let text = try! String(contentsOfFile: args[1], encoding: .utf8)
let ausgabe = URL(fileURLWithPath: args[2])
let voiceId = args[3]
let absaetze = text.components(separatedBy: "\n").map { $0.replacingOccurrences(of: #"\[\[slnc \d+\]\]"#, with: "", options: .regularExpression).trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
let synth = AVSpeechSynthesizer()
var datei: AVAudioFile? = nil
let fertig = DispatchSemaphore(value: 0)
func sprich(_ i: Int) {
  if i >= absaetze.count { fertig.signal(); return }
  let u = AVSpeechUtterance(string: absaetze[i])
  u.voice = AVSpeechSynthesisVoice(identifier: voiceId)
  u.rate = 0.47
  var stille = false
  synth.write(u) { buf in
    guard let pcm = buf as? AVAudioPCMBuffer else { return }
    if pcm.frameLength == 0 {
      if !stille, let f = datei, let pause = AVAudioPCMBuffer(pcmFormat: f.processingFormat, frameCapacity: AVAudioFrameCount(f.processingFormat.sampleRate * 0.7)) {
        pause.frameLength = pause.frameCapacity; try? f.write(from: pause); stille = true
      }
      DispatchQueue.main.async { sprich(i + 1) }
      return
    }
    if datei == nil { datei = try! AVAudioFile(forWriting: ausgabe, settings: pcm.format.settings, commonFormat: pcm.format.commonFormat, interleaved: pcm.format.isInterleaved) }
    try! datei!.write(from: pcm)
  }
}
DispatchQueue.main.async { sprich(0) }
DispatchQueue.global().async { fertig.wait(); datei = nil; exit(0) }
dispatchMain()
