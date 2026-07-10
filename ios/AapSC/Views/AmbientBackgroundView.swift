import SwiftUI

enum AmbientBackgroundState {
    static func isVisible(themeCode: String, activeAmbient: String?, storeUnlocks: [String]) -> Bool {
        if let activeAmbient,
           SwimCoinStore.isStoreItemOwned(activeAmbient, storeUnlocks: storeUnlocks),
           StoreAmbients.preset(for: activeAmbient) != nil {
            return true
        }
        return themeCode == "liquid-os"
    }
}

struct AmbientBackgroundView: View {
    let themeCode: String
    let activeAmbient: String?
    let storeUnlocks: [String]
    let isDark: Bool

    var body: some View {
        Group {
            if let preset = resolvedPreset {
                ZStack {
                    baseLayer(for: preset)
                    AmbientPresetRenderer(preset: preset)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .ignoresSafeArea()
        .allowsHitTesting(false)
    }

    @ViewBuilder
    private func baseLayer(for preset: AmbientPreset) -> some View {
        if preset.gradient != nil {
            Color.clear
        } else if themeCode == "liquid-os" {
            (isDark
                ? Color(red: 0.04, green: 0.04, blue: 0.05)
                : Color(red: 0.933, green: 0.945, blue: 0.965))
                .ignoresSafeArea()
        } else {
            Color.clear
        }
    }

    private var resolvedPreset: AmbientPreset? {
        if let activeAmbient,
           SwimCoinStore.isStoreItemOwned(activeAmbient, storeUnlocks: storeUnlocks),
           let owned = StoreAmbients.preset(for: activeAmbient) {
            return owned
        }
        if themeCode == "liquid-os" {
            return StoreAmbients.defaultLiquidOSPreset
        }
        return nil
    }
}

/// Renders a store ambient preset — used full-screen and in swim shop previews.
struct AmbientPresetRenderer: View {
    let preset: AmbientPreset
    var isPreview: Bool = false

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var driftPhase: CGFloat = 0

    var body: some View {
        GeometryReader { proxy in
            ZStack {
                if let gradient = renderedGradient {
                    AnimatedAmbientGradient(spec: gradient, reduceMotion: reduceMotion)
                }

                ForEach(Array(preset.blobs.enumerated()), id: \.offset) { index, blob in
                    blobView(blob, in: proxy.size, index: index)
                }

                if preset.bubbles && isPreview {
                    bubbleTrail(in: proxy.size)
                }
            }
        }
        .onAppear {
            guard preset.driftBlobs, !reduceMotion else { return }
            withAnimation(.easeInOut(duration: driftDuration).repeatForever(autoreverses: true)) {
                driftPhase = 1
            }
        }
    }

    private var renderedGradient: AmbientGradientSpec? {
        guard let gradient = preset.gradient else { return nil }
        guard isPreview else { return gradient }
        return AmbientGradientSpec(colors: gradient.colors, duration: 5, vertical: gradient.vertical)
    }

    private var driftDuration: Double { isPreview ? 10 : 28 }

    private var blobBlur: CGFloat { isPreview ? 22 : 80 }

    @ViewBuilder
    private func blobView(_ blob: AmbientBlob, in size: CGSize, index: Int) -> some View {
        let width = size.width * blob.widthRatio
        let height = size.height * blob.heightRatio
        let x = blob.xRatio.map { $0 * size.width } ?? (blob.rightRatio.map { size.width - $0 * size.width - width } ?? 0)
        let y = blob.yRatio.map { $0 * size.height } ?? (blob.bottomRatio.map { size.height - $0 * size.height - height } ?? 0)
        let drift = preset.driftBlobs && !reduceMotion
        let driftOffset = drift
            ? CGSize(
                width: sin(driftPhase * .pi * 2 + CGFloat(index)) * (isPreview ? 6 : 12),
                height: cos(driftPhase * .pi * 2 + CGFloat(index)) * (isPreview ? 5 : 10)
            )
            : .zero

        Circle()
            .fill(
                RadialGradient(
                    colors: [blob.color.opacity(blob.opacity), blob.color.opacity(0)],
                    center: .center,
                    startRadius: 0,
                    endRadius: max(width, height) * 0.5
                )
            )
            .frame(width: width, height: height)
            .offset(x: x + driftOffset.width, y: y + driftOffset.height)
            .blur(radius: blobBlur)
    }

    @ViewBuilder
    private func bubbleTrail(in size: CGSize) -> some View {
        let bubbles = isPreview
            ? Array(StoreAmbients.bubblePositions.prefix(6))
            : StoreAmbients.bubblePositions
        let sizeScale: CGFloat = isPreview ? 0.42 : 1
        let durationScale: Double = isPreview ? 0.45 : 1

        ForEach(bubbles.indices, id: \.self) { index in
            let bubble = bubbles[index]
            RisingBubble(
                size: bubble.size * sizeScale,
                leftRatio: bubble.leftRatio,
                containerSize: size,
                delay: bubble.delay * durationScale,
                duration: bubble.duration * durationScale,
                reduceMotion: reduceMotion
            )
        }
    }
}

struct AmbientBubbleOverlayView: View {
    let activeAmbient: String?
    let storeUnlocks: [String]

    var body: some View {
        GeometryReader { proxy in
            if let activeAmbient,
               SwimCoinStore.isStoreItemOwned(activeAmbient, storeUnlocks: storeUnlocks),
               let preset = StoreAmbients.preset(for: activeAmbient),
               preset.bubbles {
                ZStack {
                    ForEach(StoreAmbients.bubblePositions.indices, id: \.self) { index in
                        let bubble = StoreAmbients.bubblePositions[index]
                        RisingBubble(
                            size: bubble.size,
                            leftRatio: bubble.leftRatio,
                            containerSize: proxy.size,
                            delay: bubble.delay,
                            duration: bubble.duration
                        )
                    }
                }
            }
        }
        .ignoresSafeArea()
        .allowsHitTesting(false)
    }
}

private struct AnimatedAmbientGradient: View {
    let spec: AmbientGradientSpec
    let reduceMotion: Bool

    @State private var phase = false

    var body: some View {
        GeometryReader { geo in
            LinearGradient(
                colors: spec.colors,
                startPoint: spec.vertical ? .top : .leading,
                endPoint: spec.vertical ? .bottom : .trailing
            )
            .frame(
                width: spec.vertical ? geo.size.width : geo.size.width * 2,
                height: spec.vertical ? geo.size.height * 2.2 : geo.size.height * 2
            )
            .offset(
                x: spec.vertical ? 0 : (phase ? -geo.size.width * 0.5 : 0),
                y: spec.vertical ? (phase ? -geo.size.height * 1.2 : 0) : 0
            )
        }
        .clipped()
        .ignoresSafeArea()
        .onAppear {
            guard !reduceMotion else { return }
            withAnimation(.easeInOut(duration: spec.duration).repeatForever(autoreverses: true)) {
                phase = true
            }
        }
    }
}

private struct RisingBubble: View {
    let size: CGFloat
    let leftRatio: CGFloat
    let containerSize: CGSize
    let delay: Double
    let duration: Double
    var reduceMotion: Bool = false

    var body: some View {
        if reduceMotion {
            Circle()
                .stroke(Color.white.opacity(0.25), lineWidth: 1.5)
                .frame(width: size, height: size)
                .position(x: containerSize.width * leftRatio, y: containerSize.height * 0.5)
                .opacity(0.7)
        } else {
            TimelineView(.animation) { timeline in
                let elapsed = timeline.date.timeIntervalSinceReferenceDate
                let cycle = max(duration, 0.1)
                let shifted = elapsed - delay
                let progress = shifted < 0
                    ? 0.0
                    : (shifted.truncatingRemainder(dividingBy: cycle)) / cycle
                let y = containerSize.height * (0.85 - progress * 0.95)
                let fade = progress < 0.08
                    ? progress / 0.08
                    : max(0, 1 - (progress - 0.08) / 0.92)

                Circle()
                    .stroke(Color.white.opacity(0.25), lineWidth: 1.5)
                    .frame(width: size, height: size)
                    .position(x: containerSize.width * leftRatio, y: y)
                    .opacity(0.85 * fade)
            }
        }
    }
}

struct AmbientBlob {
    let color: Color
    let opacity: Double
    let widthRatio: CGFloat
    let heightRatio: CGFloat
    var xRatio: CGFloat?
    var yRatio: CGFloat?
    var rightRatio: CGFloat?
    var bottomRatio: CGFloat?
}

struct AmbientGradientSpec {
    let colors: [Color]
    let duration: Double
    let vertical: Bool
}

struct AmbientPreset {
    let gradient: AmbientGradientSpec?
    let blobs: [AmbientBlob]
    let driftBlobs: Bool
    let bubbles: Bool
}

enum StoreAmbients {
    static let defaultLiquidOSPreset = AmbientPreset(
        gradient: nil,
        blobs: [
            AmbientBlob(color: Color(hex: "#B8C4FF"), opacity: 0.85, widthRatio: 0.60, heightRatio: 0.60, xRatio: -0.08, yRatio: -0.10),
            AmbientBlob(color: Color(hex: "#FFC6BC"), opacity: 0.70, widthRatio: 0.50, heightRatio: 0.50, yRatio: 0.08, rightRatio: 0.10),
            AmbientBlob(color: Color(hex: "#C8F0DB"), opacity: 0.80, widthRatio: 0.70, heightRatio: 0.70, xRatio: 0.05, bottomRatio: 0.25),
            AmbientBlob(color: Color(hex: "#E4D6FF"), opacity: 0.70, widthRatio: 0.35, heightRatio: 0.35, rightRatio: 0.10, bottomRatio: 0.05),
        ],
        driftBlobs: false,
        bubbles: false
    )

    static let bubblePositions: [(leftRatio: CGFloat, size: CGFloat, delay: Double, duration: Double)] = [
        (0.06, 28, 0, 9), (0.14, 18, 2.4, 11), (0.24, 34, 0.8, 10.5), (0.33, 22, 3.6, 12),
        (0.42, 16, 1.2, 8.5), (0.51, 30, 4.2, 11.5), (0.60, 20, 0.3, 9.8), (0.69, 26, 2.8, 10.2),
        (0.78, 14, 5, 8), (0.87, 32, 1.6, 12.5), (0.93, 18, 3.2, 9.2), (0.48, 24, 6, 13),
    ]

    static func preset(for id: String) -> AmbientPreset? {
        switch id {
        case "ambient:neon-lagoon":
            return AmbientPreset(
                gradient: AmbientGradientSpec(
                    colors: [
                        Color(hex: "#020617"), Color(hex: "#0C1445"), Color(hex: "#1A0533"),
                        Color(hex: "#7C3AED"), Color(hex: "#00E5FF"), Color(hex: "#FF00AA"),
                        Color(hex: "#020617"),
                    ],
                    duration: 18,
                    vertical: false
                ),
                blobs: [
                    blob("#00E5FF", 0.55, 0.58, -0.12, -0.12),
                    blob("#FF00AA", 0.45, 0.48, nil, 0.05, right: 0.08),
                    blob("#7C3AED", 0.40, 0.62, 0.10, nil, bottom: 0.20),
                    blob("#22D3EE", 0.35, 0.30, nil, nil, right: 0.15, bottom: 0.10),
                ],
                driftBlobs: true,
                bubbles: false
            )
        case "ambient:sunset-lap":
            return AmbientPreset(
                gradient: AmbientGradientSpec(
                    colors: [
                        Color(hex: "#431407"), Color(hex: "#9A3412"), Color(hex: "#FB923C"),
                        Color(hex: "#F472B6"), Color(hex: "#FBBF24"), Color(hex: "#7C2D12"),
                        Color(hex: "#1C1917"),
                    ],
                    duration: 22,
                    vertical: false
                ),
                blobs: [
                    blob("#FB923C", 0.65, 0.65, -0.10, -0.15),
                    blob("#F472B6", 0.45, 0.50, nil, 0.10, right: 0.12),
                    blob("#FBBF24", 0.50, 0.55, 0.05, nil, bottom: 0.18),
                    blob("#EF4444", 0.35, 0.38, nil, nil, right: 0.08, bottom: 0.08),
                ],
                driftBlobs: true,
                bubbles: false
            )
        case "ambient:bubble-trail":
            return AmbientPreset(
                gradient: AmbientGradientSpec(
                    colors: [
                        Color(hex: "#0EA5E9"), Color(hex: "#0284C7"), Color(hex: "#0369A1"),
                        Color(hex: "#0C4A6E"), Color(hex: "#082F49"),
                    ],
                    duration: 16,
                    vertical: true
                ),
                blobs: [
                    blob("#BAE6FD", 0.45, 0.45, -0.05, -0.08),
                    blob("#A5F3FC", 0.40, 0.40, nil, nil, right: 0.05, bottom: 0.10),
                ],
                driftBlobs: false,
                bubbles: true
            )
        case "ambient:aurora-lap":
            return AmbientPreset(
                gradient: AmbientGradientSpec(
                    colors: [
                        Color(hex: "#042F2E"), Color(hex: "#134E4A"), Color(hex: "#065F46"),
                        Color(hex: "#312E81"), Color(hex: "#4338CA"), Color(hex: "#0E7490"),
                        Color(hex: "#042F2E"),
                    ],
                    duration: 20,
                    vertical: false
                ),
                blobs: [
                    blob("#34D399", 0.40, 0.55, -0.10, -0.12),
                    blob("#818CF8", 0.45, 0.48, nil, 0.08, right: 0.08),
                    blob("#22D3EE", 0.35, 0.60, 0.08, nil, bottom: 0.22),
                    blob("#A78BFA", 0.30, 0.32, nil, nil, right: 0.12, bottom: 0.12),
                ],
                driftBlobs: true,
                bubbles: false
            )
        case "ambient:deep-current":
            return AmbientPreset(
                gradient: AmbientGradientSpec(
                    colors: [
                        Color(hex: "#020617"), Color(hex: "#0C4A6E"), Color(hex: "#0369A1"),
                        Color(hex: "#164E63"), Color(hex: "#0EA5E9"), Color(hex: "#082F49"),
                        Color(hex: "#020617"),
                    ],
                    duration: 24,
                    vertical: false
                ),
                blobs: [
                    blob("#0EA5E9", 0.45, 0.58, -0.12, -0.10),
                    blob("#0369A1", 0.50, 0.52, nil, 0.12, right: 0.10),
                    blob("#164E63", 0.55, 0.64, 0.06, nil, bottom: 0.20),
                ],
                driftBlobs: true,
                bubbles: false
            )
        default:
            return nil
        }
    }

    private static func blob(
        _ hex: String,
        _ opacity: Double,
        _ width: CGFloat,
        _ x: CGFloat?,
        _ y: CGFloat?,
        right: CGFloat? = nil,
        bottom: CGFloat? = nil
    ) -> AmbientBlob {
        AmbientBlob(
            color: Color(hex: hex),
            opacity: opacity,
            widthRatio: width,
            heightRatio: width,
            xRatio: x,
            yRatio: y,
            rightRatio: right,
            bottomRatio: bottom
        )
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
