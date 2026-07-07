import SwiftUI

struct SwimTopBarActionsModifier: ViewModifier {
    @EnvironmentObject private var viewModel: SwimViewModel
    @Environment(\.openSettings) private var openSettings
    @Environment(\.openCoins) private var openCoins

    func body(content: Content) -> some View {
        content.toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                HStack(spacing: 10) {
                    Button(action: openCoins) {
                        CoinBadge(count: viewModel.totalCoins)
                    }
                    .buttonStyle(.plain)

                    Button(action: openSettings) {
                        Image(systemName: "gearshape")
                    }
                }
            }
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
