import SwiftUI

@main
struct AapSCApp: App {
    @StateObject private var viewModel = SwimViewModel()
    @StateObject private var preferences = UserPreferencesService()

    var body: some Scene {
        WindowGroup {
            AppRootView()
                .environmentObject(viewModel)
                .environmentObject(preferences)
        }
    }
}

private struct AppRootView: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @EnvironmentObject private var preferences: UserPreferencesService
    @Environment(\.colorScheme) private var systemColorScheme

    private var appIsDark: Bool {
        preferences.isDarkModeActive(systemColorScheme: systemColorScheme)
    }

    private var ambientBackgroundVisible: Bool {
        AmbientBackgroundState.isVisible(
            themeCode: preferences.themeCode,
            activeAmbient: viewModel.profile.activeAmbient,
            storeUnlocks: viewModel.storeUnlocks
        )
    }

    var body: some View {
        ZStack {
            AmbientBackgroundView(
                themeCode: preferences.themeCode,
                activeAmbient: viewModel.profile.activeAmbient,
                storeUnlocks: viewModel.storeUnlocks,
                isDark: appIsDark
            )
            ContentView()
        }
        .environment(\.t, preferences.translations)
        .environment(\.themeColors, preferences.themeColors)
        .environment(\.appIsDark, appIsDark)
        .environment(\.ambientBackgroundVisible, ambientBackgroundVisible)
        .environment(\.themeTypographyCode, preferences.themeCode)
        .tint(preferences.themeColors.displayPrimary)
        .preferredColorScheme(preferences.colorScheme)
        .themedBodyFont()
        .onAppear {
            ThemeTypography.applyUIKitAppearance(themeCode: preferences.themeCode)
            AppIconService.apply(
                activeAppIcon: viewModel.profile.activeAppIcon,
                storeUnlocks: viewModel.storeUnlocks
            )
        }
        .onChange(of: preferences.themeCode) { _, themeCode in
            ThemeTypography.applyUIKitAppearance(themeCode: themeCode)
        }
    }
}
