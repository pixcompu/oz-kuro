// Lift Oz out of a photo with Vision's subject detection, darken the exposure a little,
// crop to him and save a transparent PNG.
//
//   swift lift.swift <photo> <out.png> [--point X,Y] [--ev -0.4] [--max 900] [--keep-background]
//
// --point            a pixel on Oz (from the photo's top-left) when the photo has several subjects;
//                    without it, the largest subject is used
// --ev               exposure change, in stops (negative = darker)
// --max              longest side of the result, in pixels
// --keep-background  no cut-out: just turn the photo upright and scale it (for regular album photos)
//
// Reads anything macOS can (JPEG, HEIC, PNG…). The PNG written carries no camera metadata; the day the
// photo was taken is printed as "taken: YYYY-MM-DD" when the camera recorded it.
import CoreImage
import Foundation
import Vision

var positional: [String] = [], point: (Double, Double)? = nil, ev = -0.4, maxSide = 900.0, keepBackground = false
var rest = Array(CommandLine.arguments.dropFirst())
while !rest.isEmpty {
    let arg = rest.removeFirst()
    switch arg {
    case "--point":
        let xy = rest.removeFirst().split(separator: ",").map { Double($0)! }
        point = (xy[0], xy[1])
    case "--ev": ev = Double(rest.removeFirst())!
    case "--max": maxSide = Double(rest.removeFirst())!
    case "--keep-background": keepBackground = true
    default: positional.append(arg)
    }
}
guard positional.count == 2 else {
    FileHandle.standardError.write("usage: swift lift.swift <photo> <out.png> [--point X,Y] [--ev -0.4] [--max 900]\n".data(using: .utf8)!)
    exit(2)
}
let input = URL(fileURLWithPath: positional[0]), output = URL(fileURLWithPath: positional[1])

guard let original = CIImage(contentsOf: input, options: [.applyOrientationProperty: true]) else { fatalError("cannot read \(input.path)") }
let W = original.extent.width, H = original.extent.height
let srgb = CGColorSpace(name: CGColorSpace.sRGB)!
if let exif = original.properties["{Exif}"] as? [String: Any], let taken = exif["DateTimeOriginal"] as? String, taken.count >= 10 {
    print("taken: " + taken.prefix(10).replacingOccurrences(of: ":", with: "-"))   // "2026:08:07 14:03:11" -> 2026-08-07
}

if keepBackground {
    let scale = min(1, maxSide / max(W, H))
    let scaled = original.applyingFilter("CILanczosScaleTransform", parameters: [kCIInputScaleKey: scale, kCIInputAspectRatioKey: 1])
    let size = CGRect(x: 0, y: 0, width: (W * scale).rounded(.down), height: (H * scale).rounded(.down))
    try CIContext().writePNGRepresentation(of: scaled.cropped(to: size), to: output, format: .RGBA8, colorSpace: srgb)
    print("saved \(output.path) (\(Int(size.width))x\(Int(size.height)), upright, background kept)")
    exit(0)
}

let handler = VNImageRequestHandler(ciImage: original)
let request = VNGenerateForegroundInstanceMaskRequest()
try handler.perform([request])
guard let obs = request.results?.first else { fatalError("no subject found in the photo") }

// Pick the subject: the one under --point, or else the largest.
let labels = obs.instanceMask
CVPixelBufferLockBaseAddress(labels, .readOnly)
let lw = CVPixelBufferGetWidth(labels), lh = CVPixelBufferGetHeight(labels), stride = CVPixelBufferGetBytesPerRow(labels)
let base = CVPixelBufferGetBaseAddress(labels)!.assumingMemoryBound(to: UInt8.self)
var counts = [Int: Int]()
for y in 0..<lh { for x in 0..<lw { counts[Int(base[y * stride + x]), default: 0] += 1 } }
let label: Int
if let (px, py) = point {
    label = Int(base[Int(py / H * Double(lh)) * stride + Int(px / W * Double(lw))])
} else {
    label = counts.filter { $0.key != 0 }.max { $0.value < $1.value }?.key ?? 0
}
CVPixelBufferUnlockBaseAddress(labels, .readOnly)
print("subjects found: \(obs.allInstances.count), using #\(label)")
guard label != 0 else { fatalError("--point is on the background") }

let maskBuffer = try obs.generateScaledMaskForImage(forInstances: IndexSet(integer: label), from: handler)
let mask = CIImage(cvPixelBuffer: maskBuffer)

// Darken, then keep only the subject.
let dark = original.applyingFilter("CIExposureAdjust", parameters: [kCIInputEVKey: ev])
let lifted = dark.applyingFilter("CIBlendWithMask", parameters: [kCIInputBackgroundImageKey: CIImage.empty(), kCIInputMaskImageKey: mask])

// Crop to the subject (+ a small margin) and scale down to --max.
CVPixelBufferLockBaseAddress(maskBuffer, .readOnly)
let mw = CVPixelBufferGetWidth(maskBuffer), mh = CVPixelBufferGetHeight(maskBuffer), mstride = CVPixelBufferGetBytesPerRow(maskBuffer) / 4
let mbase = CVPixelBufferGetBaseAddress(maskBuffer)!.assumingMemoryBound(to: Float32.self)
var minX = mw, minY = mh, maxX = 0, maxY = 0
for y in 0..<mh { for x in 0..<mw where mbase[y * mstride + x] > 0.5 { minX = min(minX, x); maxX = max(maxX, x); minY = min(minY, y); maxY = max(maxY, y) } }
CVPixelBufferUnlockBaseAddress(maskBuffer, .readOnly)
if minX == 0 || minY == 0 || maxX == mw - 1 || maxY == mh - 1 { print("note: Oz touches the photo's edge, so the sticker will have a straight cut there") }
let margin = 8.0
let box = CGRect(x: max(0, Double(minX) - margin), y: max(0, H - Double(maxY) - 1 - margin),   // Core Image's origin is bottom-left
                 width: min(W, Double(maxX - minX + 1) + 2 * margin), height: min(H, Double(maxY - minY + 1) + 2 * margin))
let cropped = lifted.cropped(to: box).transformed(by: CGAffineTransform(translationX: -box.minX, y: -box.minY))
let scale = min(1, maxSide / max(box.width, box.height))
let final = cropped.applyingFilter("CILanczosScaleTransform", parameters: [kCIInputScaleKey: scale, kCIInputAspectRatioKey: 1])
let size = CGRect(x: 0, y: 0, width: (box.width * scale).rounded(.down), height: (box.height * scale).rounded(.down))
try CIContext().writePNGRepresentation(of: final.cropped(to: size), to: output, format: .RGBA8, colorSpace: srgb)
print("saved \(output.path) (\(Int(size.width))x\(Int(size.height)))")
