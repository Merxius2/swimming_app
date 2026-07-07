import SwiftUI

struct MascotStageView<Content: View>: View {
    let mascotId: String
    var compact: Bool = false
    @ViewBuilder let content: () -> Content

    var body: some View {
        ZStack {
            stageBackground
            stageOverlay
            stageBubbles
            content()
                .padding(compact ? 12 : 16)
        }
        .clipShape(RoundedRectangle(cornerRadius: compact ? 14 : 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: compact ? 14 : 18, style: .continuous)
                .strokeBorder(borderColor, lineWidth: 1)
        )
    }

    @ViewBuilder
    private var stageBackground: some View {
        switch mascotId {
        case "flo":
            LinearGradient(
                colors: [
                    Color(red: 0.82, green: 0.94, blue: 1.0),
                    Color(red: 0.55, green: 0.82, blue: 0.98),
                    Color(red: 0.20, green: 0.55, blue: 0.86),
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        case "fins":
            LinearGradient(
                colors: [
                    Color(red: 0.03, green: 0.09, blue: 0.16),
                    Color(red: 0.04, green: 0.24, blue: 0.34),
                    Color(red: 0.08, green: 0.45, blue: 0.52),
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        default:
            LinearGradient(
                colors: [
                    Color(red: 0.88, green: 0.98, blue: 0.94),
                    Color(red: 0.74, green: 0.93, blue: 0.86),
                    Color(red: 0.47, green: 0.78, blue: 0.66),
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }

    @ViewBuilder
    private var stageOverlay: some View {
        switch mascotId {
        case "flo":
            LinearGradient(
                colors: [.white.opacity(0.35), .clear, Color(red: 0.08, green: 0.35, blue: 0.58).opacity(0.18)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        case "fins":
            LinearGradient(
                colors: [Color.black.opacity(0.15), .clear, Color.cyan.opacity(0.12)],
                startPoint: .top,
                endPoint: .bottom
            )
        default:
            LinearGradient(
                colors: [.white.opacity(0.55), .white.opacity(0.15), Color(red: 0.02, green: 0.31, blue: 0.23).opacity(0.12)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }

    private var stageBubbles: some View {
        ZStack {
            Circle()
                .fill(.white.opacity(0.18))
                .frame(width: 18, height: 18)
                .offset(x: -80, y: -36)
            Circle()
                .fill(.white.opacity(0.12))
                .frame(width: 10, height: 10)
                .offset(x: 72, y: -18)
            Circle()
                .fill(.white.opacity(0.10))
                .frame(width: 14, height: 14)
                .offset(x: 64, y: 42)
        }
    }

    private var borderColor: Color {
        switch mascotId {
        case "flo": return Color.cyan.opacity(0.35)
        case "fins": return Color.teal.opacity(0.35)
        default: return Color.green.opacity(0.28)
        }
    }
}
