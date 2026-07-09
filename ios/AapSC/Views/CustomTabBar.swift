import SwiftUI

/// Shared layout metrics for the bottom tab bar and upload FAB across all themes.
enum TabBarLayout {
    static let barContentHeight: CGFloat = 70
    static let bottomPadding: CGFloat = 10
    static let horizontalPadding: CGFloat = 8
    static let itemSpacing: CGFloat = 4
    static let iconSize: CGFloat = 20
    static let labelHeight: CGFloat = 11
    static let fabDiameter: CGFloat = 56
    static let fabIconSize: CGFloat = 26
    static let fabSeatInset: CGFloat = 12
    static let bottomStripeHeight: CGFloat = 3
    static let topStripeHeight: CGFloat = 4

    static let progressIcon = "chart.bar.fill"
    static let medalsIcon = "checkmark.seal.fill"
    static let benchmarkIcon = "waveform.path.ecg"
    static let historyIcon = "clock.arrow.circlepath"

    static func totalHeight(for tabBar: ThemeTabBarStyle) -> CGFloat {
        guard let _ = tabBar.accentStripe else { return barContentHeight }
        return barContentHeight + (tabBar.accentStripePosition == .bottom ? bottomStripeHeight : topStripeHeight)
    }
}

struct CustomTabBar: View {
    @EnvironmentObject private var preferences: UserPreferencesService
    @EnvironmentObject private var viewModel: SwimViewModel
    @Binding var selectedTab: Int
    let profile: ThemeVisualProfile
    let uploadActive: Bool
    let onUpload: (() -> Void)?
    let progressTitle: String
    let medalsTitle: String
    let uploadTitle: String
    let benchmarkTitle: String
    let historyTitle: String

    var body: some View {
        VStack(spacing: 0) {
            if let stripe = profile.tabBar.accentStripe,
               profile.tabBar.accentStripePosition == .top {
                stripe
                    .frame(height: TabBarLayout.topStripeHeight)
                    .frame(maxWidth: .infinity)
            }

            HStack(alignment: .bottom, spacing: 0) {
                CustomTabButton(
                    title: progressTitle,
                    pageKey: "progress",
                    icon: TabBarLayout.progressIcon,
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
                    pageKey: "medals",
                    icon: TabBarLayout.medalsIcon,
                    isActive: selectedTab == 1,
                    selectedColor: profile.tabBar.selectedColor,
                    unselectedColor: profile.tabBar.unselectedColor,
                    usesThemeFont: profile.tabBar.usesThemeFont,
                    themeCode: preferences.themeCode,
                    fadesUnselected: profile.tabBar.fadesUnselectedLabels
                ) {
                    selectedTab = 1
                }

                VStack(spacing: TabBarLayout.itemSpacing) {
                    Spacer()
                        .frame(height: centerIconSlotHeight)
                    uploadLabel
                }
                .frame(maxWidth: .infinity)

                CustomTabButton(
                    title: benchmarkTitle,
                    pageKey: "benchmark",
                    icon: TabBarLayout.benchmarkIcon,
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
                    pageKey: "history",
                    icon: TabBarLayout.historyIcon,
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
            .padding(.horizontal, TabBarLayout.horizontalPadding)
            .padding(.bottom, TabBarLayout.bottomPadding)
            .frame(height: TabBarLayout.barContentHeight)
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
                    .frame(height: TabBarLayout.bottomStripeHeight)
                    .frame(maxWidth: .infinity)
            }
        }
        .overlay(alignment: .top) {
            if profile.uploadFAB.usesOverlay, let onUpload {
                CustomUploadFAB(style: profile.uploadFAB, action: onUpload)
                    .offset(y: resolvedFabTopOffset)
            }
        }
        .modifier(ClassicTabBarShadow(enabled: profile.tabBar.usesRaisedShadow))
    }

    private var centerIconSlotHeight: CGFloat {
        TabBarLayout.iconSize + TabBarLayout.itemSpacing
    }

    private var uploadLabelTopY: CGFloat {
        TabBarLayout.barContentHeight - TabBarLayout.bottomPadding - TabBarLayout.labelHeight
    }

    private var resolvedFabTopOffset: CGFloat {
        let maxBottom = uploadLabelTopY - TabBarLayout.itemSpacing
        let maxInset = maxBottom - TabBarLayout.fabDiameter / 2
        let inset = min(TabBarLayout.fabSeatInset, maxInset)
        return -(TabBarLayout.fabDiameter / 2) + inset
    }

    @ViewBuilder
    private var uploadLabel: some View {
        let labelColor = uploadActive ? profile.tabBar.selectedColor : profile.tabBar.unselectedColor
        let labelWeight: Font.Weight = uploadActive ? .bold : .medium

        Text(uploadTitle)
            .themeFont(.caption2, weight: labelWeight)
            .tracking(profile.tabBar.usesThemeFont ? ThemeTypography.headingTracking(for: preferences.themeCode) : 0)
            .lineLimit(1)
            .minimumScaleFactor(0.8)
            .foregroundStyle(labelColor)
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
    let pageKey: String
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
            VStack(spacing: TabBarLayout.itemSpacing) {
                StorePageIconView(
                    pageKey: pageKey,
                    systemImage: icon,
                    size: TabBarLayout.iconSize,
                    color: labelColor
                )
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
    @EnvironmentObject private var viewModel: SwimViewModel

    var body: some View {
        Button(action: action) {
            ZStack(alignment: .bottom) {
                Group {
                    if StorePageIcons.resolve(
                        activeAppIcon: viewModel.profile.activeAppIcon,
                        pageKey: "upload",
                        storeUnlocks: viewModel.storeUnlocks
                    ) != nil {
                        StorePageIconView(
                            pageKey: "upload",
                            systemImage: "square.and.arrow.up",
                            size: TabBarLayout.fabIconSize,
                            color: style.iconColor
                        )
                    } else {
                        Image(systemName: "square.and.arrow.up")
                            .font(.system(size: TabBarLayout.fabIconSize, weight: .bold))
                            .foregroundStyle(style.iconColor)
                    }
                }
                .frame(width: TabBarLayout.fabDiameter, height: TabBarLayout.fabDiameter)
                    .background {
                        Circle().fill(fabFill)
                    }
                    .overlay {
                        Circle()
                            .strokeBorder(style.borderColor, lineWidth: style.borderWidth)
                    }
                    .overlay {
                        if style.usesBorderBottomAccent, let bottomAccent = style.bottomAccent {
                            Circle()
                                .stroke(bottomAccent, lineWidth: style.borderWidth)
                                .mask(alignment: .bottom) {
                                    Rectangle()
                                        .frame(height: style.borderWidth * 4)
                                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottom)
                                }
                        }
                    }
                    .modifier(ClassicFABShadow(style: style))

                if !style.usesBorderBottomAccent, let bottomAccent = style.bottomAccent {
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
