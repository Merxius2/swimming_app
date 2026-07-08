import SwiftUI

struct CustomTabBar: View {
    @EnvironmentObject private var preferences: UserPreferencesService
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
                    unselectedColor: profile.tabBar.unselectedColor,
                    usesThemeFont: profile.tabBar.usesThemeFont,
                    themeCode: preferences.themeCode,
                    fadesUnselected: profile.tabBar.fadesUnselectedLabels
                ) {
                    selectedTab = 0
                }

                CustomTabButton(
                    title: medalsTitle,
                    icon: "checkmark.seal.fill",
                    isActive: selectedTab == 1,
                    selectedColor: profile.tabBar.selectedColor,
                    unselectedColor: profile.tabBar.unselectedColor,
                    usesThemeFont: profile.tabBar.usesThemeFont,
                    themeCode: preferences.themeCode,
                    fadesUnselected: profile.tabBar.fadesUnselectedLabels
                ) {
                    selectedTab = 1
                }

                VStack(spacing: 6) {
                    Spacer()
                        .frame(height: 40)
                    Text(uploadTitle)
                        .themeFont(.caption2, weight: .medium)
                        .tracking(profile.tabBar.usesThemeFont ? ThemeTypography.headingTracking(for: preferences.themeCode) : 0)
                        .foregroundStyle(profile.tabBar.unselectedColor)
                }
                .frame(maxWidth: .infinity)

                CustomTabButton(
                    title: benchmarkTitle,
                    icon: "waveform.path.ecg",
                    isActive: selectedTab == 3,
                    selectedColor: profile.tabBar.selectedColor,
                    unselectedColor: profile.tabBar.unselectedColor,
                    usesThemeFont: profile.tabBar.usesThemeFont,
                    themeCode: preferences.themeCode,
                    fadesUnselected: profile.tabBar.fadesUnselectedLabels
                ) {
                    selectedTab = 3
                }

                CustomTabButton(
                    title: historyTitle,
                    icon: "clock.arrow.circlepath",
                    isActive: selectedTab == 4,
                    selectedColor: profile.tabBar.selectedColor,
                    unselectedColor: profile.tabBar.unselectedColor,
                    usesThemeFont: profile.tabBar.usesThemeFont,
                    themeCode: preferences.themeCode,
                    fadesUnselected: profile.tabBar.fadesUnselectedLabels
                ) {
                    selectedTab = 4
                }
            }
            .padding(.horizontal, 10)
            .padding(.bottom, 25)
            .frame(height: Self.barHeight)
            .background {
                barBackground
                    .overlay {
                        if let border = profile.tabBar.borderColor {
                            tabBarShape
                                .strokeBorder(border, lineWidth: 1)
                        }
                    }
                    .clipShape(tabBarShape)
            }

            if let stripe = profile.tabBar.accentStripe,
               profile.tabBar.accentStripePosition == .bottom {
                stripe
                    .frame(height: stripeHeight)
                    .frame(maxWidth: .infinity)
            }
        }
        .modifier(ClassicTabBarShadow(enabled: profile.tabBar.usesRaisedShadow))
    }

    private var stripeHeight: CGFloat {
        profile.tabBar.accentStripePosition == .bottom ? 3 : 4
    }

    private var tabBarShape: UnevenRoundedRectangle {
        UnevenRoundedRectangle(
            topLeadingRadius: profile.tabBar.topCornerRadius,
            topTrailingRadius: profile.tabBar.topCornerRadius
        )
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

private struct ClassicTabBarShadow: ViewModifier {
    let enabled: Bool

    func body(content: Content) -> some View {
        if enabled {
            content
                .shadow(color: Color.black.opacity(0.08), radius: 1, x: 0, y: -1)
                .shadow(color: Color.black.opacity(0.14), radius: 0, x: 0, y: -2)
        } else {
            content
        }
    }
}

struct CustomTabButton: View {
    let title: String
    let icon: String
    let isActive: Bool
    let selectedColor: Color
    let unselectedColor: Color
    let usesThemeFont: Bool
    let themeCode: String
    let fadesUnselected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                Text(title)
                    .themeFont(.caption2, weight: isActive ? .bold : .medium)
                    .tracking(usesThemeFont ? ThemeTypography.headingTracking(for: themeCode) : 0)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            }
            .foregroundStyle(labelColor)
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.plain)
    }

    private var labelColor: Color {
        if isActive {
            return selectedColor
        }
        return fadesUnselected ? unselectedColor.opacity(0.7) : unselectedColor
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
                    .background {
                        Circle().fill(fabFill)
                    }
                    .overlay(
                        Circle()
                            .strokeBorder(style.borderColor, lineWidth: style.borderWidth)
                    )
                    .modifier(ClassicFABShadow(style: style))

                if let bottomAccent = style.bottomAccent {
                    bottomAccent
                        .frame(width: 34, height: style.borderWidth)
                        .clipShape(Capsule())
                        .offset(y: -2)
                }
            }
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Upload")
    }

    private var fabFill: AnyShapeStyle {
        if let gradient = style.gradient, gradient.count >= 2 {
            AnyShapeStyle(
                LinearGradient(
                    colors: gradient,
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
        } else if let solid = style.solid {
            AnyShapeStyle(solid)
        } else {
            AnyShapeStyle(Color.yellow)
        }
    }
}

private struct ClassicFABShadow: ViewModifier {
    let style: ThemeUploadFABStyle

    func body(content: Content) -> some View {
        if style.usesRaisedShadow {
            content
                .shadow(color: Color.black.opacity(0.08), radius: 1, x: 0, y: 2)
                .shadow(color: Color.black.opacity(0.14), radius: 0, x: 0, y: 2)
        } else {
            content
                .shadow(color: style.shadowColor, radius: 10, x: 0, y: 4)
        }
    }
}
