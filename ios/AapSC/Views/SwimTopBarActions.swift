import SwiftUI

struct SwimTopBarActionsModifier: ViewModifier {
    @EnvironmentObject private var viewModel: SwimViewModel
    @EnvironmentObject private var preferences: UserPreferencesService
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.openSettings) private var openSettings
    @Environment(\.openCoins) private var openCoins

    private var profile: ThemeVisualProfile {
        ThemeVisualProfiles.profile(code: preferences.themeCode, isDark: colorScheme == .dark)
    }

    func body(content: Content) -> some View {
        content.toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                ThemedTopBarPill(
                    style: profile.topBar,
                    coins: viewModel.totalCoins,
                    openCoins: openCoins,
                    openSettings: openSettings
                )
            }
        }
    }
}

struct ThemedTopBarPill: View {
    let style: ThemeTopBarStyle
    let coins: Int
    let openCoins: () -> Void
    let openSettings: () -> Void

    var body: some View {
        HStack(spacing: 0) {
            Button(action: openCoins) {
                CoinBadge(count: coins)
                    .foregroundStyle(style.coinsColor)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
            }
            .buttonStyle(.plain)

            Rectangle()
                .fill(style.dividerColor)
                .frame(width: 1, height: 20)

            Button(action: openSettings) {
                Image(systemName: "gearshape")
                    .font(.body.weight(.semibold))
                    .foregroundStyle(style.settingsColor)
                    .frame(width: 40, height: 32)
            }
            .buttonStyle(.plain)
        }
        .background(pillBackground, in: Capsule())
        .overlay(
            Capsule()
                .strokeBorder(style.borderColor, lineWidth: style.borderWidth)
        )
        .shadow(color: style.shadowColor, radius: 8, x: 0, y: 2)
    }

    @ViewBuilder
    private var pillBackground: some ShapeStyle {
        if let gradient = style.backgroundGradient, gradient.count >= 2 {
            LinearGradient(colors: gradient, startPoint: .leading, endPoint: .trailing)
        } else {
            style.background
        }
    }
}

struct ThemedNavigationModifier: ViewModifier {
    @EnvironmentObject private var preferences: UserPreferencesService
    @Environment(\.colorScheme) private var colorScheme

    private var profile: ThemeVisualProfile {
        ThemeVisualProfiles.profile(
            code: preferences.themeCode,
            isDark: colorScheme == .dark
        )
    }

    @ViewBuilder
    func body(content: Content) -> some View {
        let nav = profile.navBar
        let theme = preferences.themeColors

        if let gradient = nav.gradient {
            content
                .toolbarBackground(
                    LinearGradient(
                        colors: gradient,
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    for: .navigationBar
                )
                .toolbarBackground(.visible, for: .navigationBar)
                .toolbarColorScheme(nav.lightContent ? .dark : nil, for: .navigationBar)
                .tint(nav.tint)
        } else if let solid = nav.solidColor {
            content
                .toolbarBackground(solid, for: .navigationBar)
                .toolbarBackground(.visible, for: .navigationBar)
                .toolbarColorScheme(nav.lightContent ? .dark : nil, for: .navigationBar)
                .tint(nav.tint)
        } else if nav.usesThemeGradient {
            content
                .toolbarBackground(
                    LinearGradient(
                        colors: [
                            theme.primary.opacity(0.14),
                            theme.secondary.opacity(0.08),
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    for: .navigationBar
                )
                .toolbarBackground(.visible, for: .navigationBar)
                .tint(profile.displayPrimary)
        } else {
            content
                .toolbarBackground(.visible, for: .navigationBar)
                .tint(profile.displayPrimary)
        }
    }
}

extension View {
    func swimTopBarActions() -> some View {
        modifier(SwimTopBarActionsModifier())
    }

    func themedNavigationBar() -> some View {
        modifier(ThemedNavigationModifier())
    }
}
