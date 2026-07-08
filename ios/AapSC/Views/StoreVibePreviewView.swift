import SwiftUI

enum StoreVibePreviewStyle {
    case neonLagoon
    case sunsetLap
    case bubbleTrail
    case auroraLap
    case deepCurrent

    init?(preview: String) {
        switch preview {
        case "ambient-neon": self = .neonLagoon
        case "ambient-sunset": self = .sunsetLap
        case "ambient-bubbles": self = .bubbleTrail
        case "ambient-aurora": self = .auroraLap
        case "ambient-deep": self = .deepCurrent
        default: return nil
        }
    }

    var ambientId: String {
        switch self {
        case .neonLagoon: return "ambient:neon-lagoon"
        case .sunsetLap: return "ambient:sunset-lap"
        case .bubbleTrail: return "ambient:bubble-trail"
        case .auroraLap: return "ambient:aurora-lap"
        case .deepCurrent: return "ambient:deep-current"
        }
    }
}

struct StoreVibePreviewView: View {
    let style: StoreVibePreviewStyle

    var body: some View {
        if let preset = StoreAmbients.preset(for: style.ambientId) {
            AmbientPresetRenderer(preset: preset, isPreview: true)
        }
    }
}
