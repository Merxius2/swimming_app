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

    func body(content: Content) -> some View {
        let theme = preferences.themeColors
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
            .tint(theme.primary)
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
