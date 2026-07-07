import SwiftUI

struct CustomTabBar: View {
    @Binding var selectedTab: Int
    let profile: ThemeVisualProfile
    let progressTitle: String
    let medalsTitle: String
    let uploadTitle: String
    let benchmarkTitle: String
    let historyTitle: String

    static let barHeight: CGFloat = 90
    static let fabOffset: CGFloat = 45

    var body: some View {
        VStack(spacing: 0) {
            if let stripe = profile.tabBar.accentStripe,
               profile.tabBar.accentStripePosition == .top {
                stripe
                    .frame(height: stripeHeight)
                    .frame(maxWidth: .infinity)
            }

            HStack(alignment: .bottom, spacing: 0) {
                CustomTabButton(
                    title: progressTitle,
                    icon: "chart.bar.fill",
                    isActive: selectedTab == 0,
                    selectedColor: profile.tabBar.selectedColor,
                    unselectedColor: profile.tabBar.unselectedColor
                ) {
                    selectedTab = 0
                }

                CustomTabButton(
                    title: medalsTitle,
                    icon: "checkmark.seal.fill",
                    isActive: selectedTab == 1,
                    selectedColor: profile.tabBar.selectedColor,
                    unselectedColor: profile.tabBar.unselectedColor
                ) {
                    selectedTab = 1
                }

                VStack(spacing: 6) {
                    Spacer()
                        .frame(height: 40)
                    Text(uploadTitle)
                        .font(.caption2.weight(.medium))
                        .foregroundStyle(profile.tabBar.unselectedColor)
                }
                .frame(maxWidth: .infinity)

                CustomTabButton(
                    title: benchmarkTitle,
                    icon: "waveform.path.ecg",
                    isActive: selectedTab == 3,
                    selectedColor: profile.tabBar.selectedColor,
                    unselectedColor: profile.tabBar.unselectedColor
                ) {
                    selectedTab = 3
                }

                CustomTabButton(
                    title: historyTitle,
                    icon: "clock.arrow.circlepath",
                    isActive: selectedTab == 4,
                    selectedColor: profile.tabBar.selectedColor,
                    unselectedColor: profile.tabBar.unselectedColor
                ) {
                    selectedTab = 4
                }
            }
            .padding(.horizontal, 10)
            .padding(.bottom, 25)
            .frame(height: Self.barHeight)
            .background(barBackground)

            if let stripe = profile.tabBar.accentStripe,
               profile.tabBar.accentStripePosition == .bottom {
                stripe
                    .frame(height: stripeHeight)
                    .frame(maxWidth: .infinity)
            }
        }
    }

    private var stripeHeight: CGFloat {
        profile.tabBar.accentStripePosition == .bottom ? 3 : 4
    }

    @ViewBuilder
    private var barBackground: some View {
        if let gradient = profile.tabBar.backgroundGradient, gradient.count >= 2 {
            LinearGradient(
                colors: gradient,
                startPoint: .leading,
                endPoint: .trailing
            )
        } else if profile.tabBar.background == .clear {
            Rectangle()
                .fill(.ultraThinMaterial)
        } else {
            profile.tabBar.background
        }
    }
}

struct CustomTabButton: View {
    let title: String
    let icon: String
    let isActive: Bool
    let selectedColor: Color
    let unselectedColor: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                Text(title)
                    .font(.caption2.weight(isActive ? .bold : .medium))
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            }
            .foregroundStyle(isActive ? selectedColor : unselectedColor.opacity(0.7))
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.plain)
    }
}

struct CustomUploadFAB: View {
    let style: ThemeUploadFABStyle
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            ZStack(alignment: .bottom) {
                Image(systemName: "square.and.arrow.up")
                    .font(.system(size: 26, weight: .bold))
                    .foregroundStyle(style.iconColor)
                    .frame(width: 65, height: 65)
                    .background(fabBackground, in: Circle())
                    .overlay(
                        Circle()
                            .strokeBorder(style.borderColor, lineWidth: 2)
                    )
                    .shadow(color: style.shadowColor, radius: 10, x: 0, y: 4)

                if let bottomAccent = style.bottomAccent {
                    bottomAccent
                        .frame(width: 34, height: 3)
                        .clipShape(Capsule())
                        .offset(y: -2)
                }
            }
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Upload")
    }

    @ViewBuilder
    private var fabBackground: some View {
        if let gradient = style.gradient, gradient.count >= 2 {
            LinearGradient(colors: gradient, startPoint: .topLeading, endPoint: .bottomTrailing)
        } else if let solid = style.solid {
            solid
        } else {
            Color.yellow
        }
    }
}
