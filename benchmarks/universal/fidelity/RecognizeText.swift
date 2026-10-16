import Foundation
import Vision
import AppKit
// Local-only OCR of the explicitly normalized screenshot. No network or app source.
let args = CommandLine.arguments
 guard args.count == 2, let image = NSImage(contentsOfFile: args[1]),
       let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    fputs("Usage: recognize-text IMAGE\n", stderr); exit(1)
}
let request = VNRecognizeTextRequest()
request.usesCPUOnly = true
request.revision = VNRecognizeTextRequestRevision3
request.recognitionLevel = .accurate
request.recognitionLanguages = ["en-US"]
request.usesLanguageCorrection = false
do { try VNImageRequestHandler(cgImage: cg).perform([request]) }
catch { fputs("Text recognition unavailable: \(error)\n", stderr); exit(2) }
let rows: [[String: Any]] = (request.results ?? []).compactMap { observation in
    guard let text = observation.topCandidates(1).first else { return nil }
    let box = observation.boundingBox
    return ["text": text.string, "confidence": text.confidence,
            "box": ["x": box.minX * Double(cg.width), "y": (1-box.maxY) * Double(cg.height),
                    "width": box.width * Double(cg.width), "height": box.height * Double(cg.height)]]
}.sorted { ($0["box"] as! [String: Double])["y"]! < ($1["box"] as! [String: Double])["y"]! }
let data = try JSONSerialization.data(withJSONObject: ["version": 1, "lines": rows], options: [.sortedKeys])
print(String(decoding: data, as: UTF8.self))
