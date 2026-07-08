import SwiftUI

struct CustomTabBar: View {
    @EnvironmentObject private var preferences: UserPreferencesService
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
                    .frame(height: stripeHeight)
                    .frame(maxWidth: .infinity)
            }

            HStack(alignment: .bottom, spacing: 0) {
                CustomTabButton(
                    title: progressTitle,
                    icon: profile.tabBar.progressIcon,
                    isActive: selectedTab == 0,
                    selectedColor: profile.tabBar.selectedColor,
                    unselectedColor: profile.tabBar.unselectedColor,
                    iconSize: profile.tabBar.iconSize,
                    labelFontSize: profile.tabBar.labelFontSize,
                    itemSpacing: profile.tabBar.itemSpacing,
                    usesThemeFont: profile.tabBar.usesThemeFont,
                    themeCode: preferences.themeCode,
                    fadesUnselected: profile.tabBar.fadesUnselectedLabels
                ) {
                    selectedTab = 0
                }

                CustomTabButton(
                    title: medalsTitle,
                    icon: profile.tabBar.medalsIcon,
                    isActive: selectedTab == 1,
                    selectedColor: profile.tabBar.selectedColor,
                    unselectedColor: profile.tabBar.unselectedColor,
                    iconSize: profile.tabBar.iconSize,
                    labelFontSize: profile.tabBar.labelFontSize,
                    itemSpacing: profile.tabBar.itemSpacing,
                    usesThemeFont: profile.tabBar.usesThemeFont,
                    themeCode: preferences.themeCode,
                    fadesUnselected: profile.tabBar.fadesUnselectedLabels
                ) {
                    selectedTab = 1
                }

                VStack(spacing: profile.tabBar.itemSpacing) {
                    Spacer()
                        .frame(height: centerIconSlotHeight)
                    uploadLabel
                }
                .frame(maxWidth: .infinity)

                CustomTabButton(
                    title: benchmarkTitle,
                    icon: profile.tabBar.benchmarkIcon,
                    isActive: selectedTab == 3,
                    selectedColor: profile.tabBar.selectedColor,
                    unselectedColor: profile.tabBar.unselectedColor,
                    iconSize: profile.tabBar.iconSize,
                    labelFontSize: profile.tabBar.labelFontSize,
                    itemSpacing: profile.tabBar.itemSpacing,
                    usesThemeFont: profile.tabBar.usesThemeFont,
                    themeCode: preferences.themeCode,
                    fadesUnselected: profile.tabBar.fadesUnselectedLabels
                ) {
                    selectedTab = 3
                }

                CustomTabButton(
                    title: historyTitle,
                    icon: profile.tabBar.historyIcon,
                    isActive: selectedTab == 4,
                    selectedColor: profile.tabBar.selectedColor,
                    unselectedColor: profile.tabBar.unselectedColor,
                    iconSize: profile.tabBar.iconSize,
                    labelFontSize: profile.tabBar.labelFontSize,
                    itemSpacing: profile.tabBar.itemSpacing,
                    usesThemeFont: profile.tabBar.usesThemeFont,
                    themeCode: preferences.themeCode,
                    fadesUnselected: profile.tabBar.fadesUnselectedLabels
                ) {
                    selectedTab = 4
                }
            }
            .padding(.horizontal, profile.tabBar.horizontalPadding)
            .padding(.bottom, profile.tabBar.bottomPadding)
            .frame(height: profile.tabBar.barContentHeight)
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
        .overlay(alignment: .top) {
            if profile.uploadFAB.usesOverlay, let onUpload {
                CustomUploadFAB(style: profile.uploadFAB, action: onUpload)
                    .offset(y: resolvedFabTopOffset)
            }
        }
        .modifier(ClassicTabBarShadow(enabled: profile.tabBar.usesRaisedShadow))
    }

    /// Matches the icon slot height used by the other tab buttons.
    private var centerIconSlotHeight: CGFloat {
        profile.tabBar.iconSize + profile.tabBar.itemSpacing
    }

    private var uploadLabelTopY: CGFloat {
        let labelHeight = profile.tabBar.labelFontSize ?? 11
        return profile.tabBar.barContentHeight - profile.tabBar.bottomPadding - labelHeight
    }

    private var resolvedFabTopOffset: CGFloat {
        let desired = fabTopOffset(for: profile.tabBar.fabSeatInset)
        guard profile.uploadFAB.usesOverlay else { return desired }

        let maxBottom = uploadLabelTopY - profile.tabBar.itemSpacing
        let maxInset = maxBottom - profile.uploadFAB.diameter / 2
        let clampedInset = min(profile.tabBar.fabSeatInset, maxInset)
        return fabTopOffset(for: clampedInset)
    }

    private func fabTopOffset(for seatInset: CGFloat) -> CGFloat {
        -(profile.uploadFAB.diameter / 2) + seatInset
    }

    @ViewBuilder
    private var uploadLabel: some View {
        let labelColor = uploadActive
            ? profile.tabBar.selectedColor
            : (profile.tabBar.uploadLabelColor ?? profile.tabBar.unselectedColor)
        let labelWeight: Font.Weight = uploadActive ? .bold : .medium

        Group {
            if let labelFontSize = profile.tabBar.labelFontSize {
                Text(uploadTitle)
                    .themeFont(size: labelFontSize, weight: labelWeight)
            } else {
                Text(uploadTitle)
                    .themeFont(.caption2, weight: labelWeight)
            }
        }
        .tracking(profile.tabBar.usesThemeFont ? ThemeTypography.headingTracking(for: preferences.themeCode) : 0)
        .lineLimit(1)
        .minimumScaleFactor(0.8)
        .foregroundStyle(labelColor)
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
    let iconSize: CGFloat
    let labelFontSize: CGFloat?
    let itemSpacing: CGFloat
    let usesThemeFont: Bool
    let themeCode: String
    let fadesUnselected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: itemSpacing) {
                Image(systemName: icon)
                    .font(.system(size: iconSize, weight: isActive ? .semibold : .regular))
                tabLabel
            }
            .foregroundStyle(labelColor)
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.plain)
    }

    @ViewBuilder
    private var tabLabel: some View {
        let weight: Font.Weight = isActive ? .bold : .medium
        if let labelFontSize {
            Text(title)
                .themeFont(size: labelFontSize, weight: weight)
                .tracking(usesThemeFont ? ThemeTypography.headingTracking(for: themeCode) : 0)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
        } else {
            Text(title)
                .themeFont(.caption2, weight: weight)
                .tracking(usesThemeFont ? ThemeTypography.headingTracking(for: themeCode) : 0)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
        }
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
                    .font(.system(size: style.iconSize, weight: .bold))
                    .foregroundStyle(style.iconColor)
                    .frame(width: style.diameter, height: style.diameter)
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
