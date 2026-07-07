import SwiftUI

struct AmbientBackgroundView: View {
    let ambientId: String?

    var body: some View {
        if let ambientId, let preset = ambientPreset(for: ambientId) {
            ZStack {
                LinearGradient(
                    colors: preset.gradient,
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()

                ForEach(Array(preset.blobs.enumerated()), id: \.offset) { _, blob in
                    Circle()
                        .fill(blob.color.opacity(blob.opacity))
                        .frame(width: blob.size, height: blob.size)
                        .offset(x: blob.x, y: blob.y)
                        .blur(radius: 40)
                }

                if preset.bubbles {
                    ForEach(0..<6, id: \.self) { index in
                        Circle()
                            .stroke(Color.white.opacity(0.25), lineWidth: 1.5)
                            .frame(width: CGFloat(12 + index * 6))
                            .offset(x: CGFloat(index * 28 - 70), y: CGFloat(120 - index * 18))
                    }
                }
            }
            .allowsHitTesting(false)
        }
    }

    private struct AmbientPreset {
        let gradient: [Color]
        let blobs: [(color: Color, opacity: Double, size: CGFloat, x: CGFloat, y: CGFloat)]
        let bubbles: Bool
    }

    private func ambientPreset(for id: String) -> AmbientPreset? {
        switch id {
        case "ambient:neon-lagoon":
            return AmbientPreset(
                gradient: [Color(red: 0.01, green: 0.03, blue: 0.09), Color(red: 0.49, green: 0.23, blue: 0.93), Color(red: 0.0, green: 0.90, blue: 1.0)],
                blobs: [
                    (.cyan, 0.35, 220, -80, -120),
                    (.pink, 0.28, 180, 120, -60),
                    (.purple, 0.25, 240, 40, 180),
                ],
                bubbles: false
            )
        case "ambient:sunset-lap":
            return AmbientPreset(
                gradient: [Color(red: 0.26, green: 0.08, blue: 0.03), .orange, .pink],
                blobs: [
                    (.orange, 0.35, 240, -70, -100),
                    (.pink, 0.28, 200, 100, 40),
                    (.yellow, 0.22, 220, -20, 160),
                ],
                bubbles: false
            )
        case "ambient:bubble-trail":
            return AmbientPreset(
                gradient: [.cyan, Color(red: 0.0, green: 0.45, blue: 0.65)],
                blobs: [
                    (.white, 0.18, 180, -40, -80),
                    (.white, 0.15, 160, 80, 120),
                ],
                bubbles: true
            )
        case "ambient:aurora-lap":
            return AmbientPreset(
                gradient: [Color(red: 0.02, green: 0.18, blue: 0.18), .teal, .indigo],
                blobs: [
                    (.green, 0.25, 210, -90, -90),
                    (.indigo, 0.28, 190, 110, 20),
                    (.cyan, 0.22, 230, 20, 170),
                ],
                bubbles: false
            )
        case "ambient:deep-current":
            return AmbientPreset(
                gradient: [.black, Color(red: 0.0, green: 0.29, blue: 0.44), .cyan],
                blobs: [
                    (.cyan, 0.25, 220, -80, -80),
                    (.blue, 0.30, 200, 100, 60),
                    (Color(red: 0.09, green: 0.31, blue: 0.39), 0.35, 250, 0, 180),
                ],
                bubbles: false
            )
        default:
            return nil
        }
    }
}

struct MascotCoachView: View {
    let mascotId: String
    let message: String
    var mood: String = "happy"

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            ZStack {
                Circle()
                    .fill(mascotColor.opacity(0.18))
                    .frame(width: 56, height: 56)
                Text(mascotEmoji)
                    .font(.system(size: 30))
            }

            VStack(alignment: .leading, spacing: 6) {
                Text(MascotConstants.displayName(mascotId))
                    .font(.caption.weight(.bold))
                    .foregroundStyle(mascotColor)
                Text(message)
                    .font(.subheadline)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer(minLength: 0)
        }
    }

    private var mascotEmoji: String {
        switch mascotId {
        case "flo": return "🐵"
        case "fins": return "🦈"
        default: return "🐒"
        }
    }

    private var mascotColor: Color {
        switch mascotId {
        case "flo": return .orange
        case "fins": return .teal
        default: return Color("BrandBlue")
        }
    }
}
