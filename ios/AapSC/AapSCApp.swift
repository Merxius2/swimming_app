import SwiftUI

@main
struct AapSCApp: App {
    @StateObject private var viewModel = SwimViewModel()
    @StateObject private var preferences = UserPreferencesService()

    var body: some Scene {
        WindowGroup {
            ZStack {
                AmbientBackgroundView(
                    themeCode: preferences.themeCode,
                    activeAmbient: viewModel.profile.activeAmbient,
                    storeUnlocks: viewModel.storeUnlocks
                )
                ContentView()
            }
            .environmentObject(viewModel)
            .environmentObject(preferences)
            .environment(\.t, preferences.translations)
            .environment(\.themeColors, preferences.themeColors)
            .tint(preferences.themeColors.displayPrimary)
            .preferredColorScheme(preferences.colorScheme)
            .themedBodyFont()
            .onAppear {
                AppIconService.apply(
                    activeAppIcon: viewModel.profile.activeAppIcon,
                    storeUnlocks: viewModel.storeUnlocks
                )
            }
        }
    }
}
