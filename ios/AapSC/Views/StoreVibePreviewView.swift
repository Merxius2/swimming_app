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
}

struct StoreVibePreviewView: View {
    let style: StoreVibePreviewStyle

    var body: some View {
        Group {
            switch style {
            case .bubbleTrail:
                StoreBubbleTrailPreview()
            case .neonLagoon:
                StoreDriftingGradientPreview(colors: [
                    Color(hex: "#020617"), Color(hex: "#0C1445"), Color(hex: "#1A0533"),
                    Color(hex: "#7C3AED"), Color(hex: "#00E5FF"), Color(hex: "#FF00AA"),
                ])
            case .sunsetLap:
                StoreDriftingGradientPreview(colors: [
                    Color(hex: "#431407"), Color(hex: "#9A3412"), Color(hex: "#FB923C"),
                    Color(hex: "#F472B6"), Color(hex: "#FBBF24"), Color(hex: "#7C2D12"),
                ])
            case .auroraLap:
                StoreDriftingGradientPreview(colors: [
                    Color(hex: "#042F2E"), Color(hex: "#134E4A"), Color(hex: "#312E81"),
                    Color(hex: "#4338CA"), Color(hex: "#0E7490"),
                ])
            case .deepCurrent:
                StoreDriftingGradientPreview(colors: [
                    Color(hex: "#020617"), Color(hex: "#0C4A6E"), Color(hex: "#0369A1"),
                    Color(hex: "#164E63"), Color(hex: "#0EA5E9"),
                ])
            }
        }
    }
}

private struct StoreDriftingGradientPreview: View {
    let colors: [Color]

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var phase = false

    var body: some View {
        GeometryReader { geo in
            LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing)
                .frame(width: geo.size.width * 2, height: geo.size.height * 1.5)
                .offset(
                    x: phase ? -geo.size.width * 0.5 : 0,
                    y: phase ? -geo.size.height * 0.25 : 0
                )
        }
        .clipped()
        .onAppear {
            guard !reduceMotion else { return }
            withAnimation(.easeInOut(duration: 5).repeatForever(autoreverses: true)) {
                phase = true
            }
        }
    }
}

private struct StoreBubbleTrailPreview: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(hex: "#38BDF8"), Color(hex: "#0E7490")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            StorePreviewBubble(size: 14, xRatio: 0.18, yRatio: 0.80, duration: 3.0, delay: 0)
            StorePreviewBubble(size: 10, xRatio: 0.52, yRatio: 0.65, duration: 4.0, delay: 0.6)
            StorePreviewBubble(size: 16, xRatio: 0.78, yRatio: 0.85, duration: 3.5, delay: 1.2)
        }
    }
}

private struct StorePreviewBubble: View {
    let size: CGFloat
    let xRatio: CGFloat
    let yRatio: CGFloat
    let duration: Double
    let delay: Double

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var offsetY: CGFloat = 0

    var body: some View {
        GeometryReader { geo in
            Circle()
                .fill(Color.white.opacity(0.55))
                .overlay(
                    Circle()
                        .stroke(Color.white.opacity(0.7), lineWidth: 1)
                )
                .frame(width: size, height: size)
                .position(
                    x: geo.size.width * xRatio,
                    y: geo.size.height * yRatio + offsetY
                )
                .onAppear {
                    guard !reduceMotion else { return }
                    withAnimation(
                        .easeInOut(duration: duration)
                        .repeatForever(autoreverses: true)
                        .delay(delay)
                    ) {
                        offsetY = -8
                    }
                }
        }
    }
}

private extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r = Double((int >> 16) & 0xFF) / 255
        let g = Double((int >> 8) & 0xFF) / 255
        let b = Double(int & 0xFF) / 255
        self.init(red: r, green: g, blue: b)
    }
}
