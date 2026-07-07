import SwiftUI

struct MascotCoachView: View {
    @EnvironmentObject private var preferences: UserPreferencesService
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    @Environment(\.verticalSizeClass) private var verticalSizeClass

    let mascotId: String
    let message: String
    var mood: String = "happy"
    var level: String? = nil
    var bubbleTone: MascotBubbleTone = .default
    var coachName: String? = nil
    var showLevelBadge: Bool = true
    var showStage: Bool = true
    var size: CGFloat = 220
    var animated: Bool = true

    private var resolvedLevel: String {
        level ?? MascotConstants.coachedLevel(mascotId)
    }

    private var resolvedCoachName: String {
        coachName ?? MascotConstants.displayName(mascotId, t: preferences.translations)
    }

    private var stackedLayout: Bool {
        horizontalSizeClass == .compact || verticalSizeClass == .compact
    }

    var body: some View {
        let content = coachContent

        Group {
            if showStage {
                MascotStageView(mascotId: mascotId) {
                    content
                }
            } else {
                content
            }
        }
        .frame(maxWidth: .infinity)
    }

    private var coachContent: some View {
        Group {
            if stackedLayout {
                VStack(alignment: .center, spacing: 16) {
                    headerRow
                    MascotSpeechBubbleView(
                        message: message,
                        tone: bubbleTone,
                        mascotId: mascotId,
                        tail: .bottom
                    )
                    .frame(maxWidth: .infinity)
                    mascotColumn
                }
                .frame(maxWidth: .infinity)
            } else {
                HStack(alignment: .bottom, spacing: 20) {
                    mascotColumn
                    VStack(alignment: .leading, spacing: 10) {
                        headerRow
                        MascotSpeechBubbleView(
                            message: message,
                            tone: bubbleTone,
                            mascotId: mascotId,
                            tail: .left
                        )
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.bottom, 24)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }

    private var headerRow: some View {
        HStack(spacing: 10) {
            Text(resolvedCoachName.uppercased())
                .font(.caption.weight(.bold))
                .tracking(1.2)
                .foregroundStyle(MascotPresentation.coachNameColor(mascotId: mascotId, colorScheme: colorScheme))

            if showLevelBadge {
                MascotLevelBadgeView(level: resolvedLevel)
            }
        }
        .frame(maxWidth: .infinity, alignment: stackedLayout ? .center : .leading)
    }

    private var mascotColumn: some View {
        VStack(spacing: 0) {
            MascotCharacterView(
                mascotId: mascotId,
                mood: mood,
                size: size,
                animated: animated
            )
            mascotShadow
        }
    }

    private var mascotShadow: some View {
        Ellipse()
            .fill(
                RadialGradient(
                    colors: [Color.black.opacity(0.18), .clear],
                    center: .center,
                    startRadius: 0,
                    endRadius: size * 0.35
                )
            )
            .frame(width: size * 0.7, height: size * 0.12)
            .offset(y: -4)
    }
}
