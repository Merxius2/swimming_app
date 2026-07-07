import SwiftUI

@main
struct AapSCApp: App {
    @StateObject private var viewModel = SwimViewModel()
    @StateObject private var preferences = UserPreferencesService()

    var body: some Scene {
        WindowGroup {
            ZStack {
                AmbientBackgroundView(ambientId: viewModel.profile.activeAmbient)
                ContentView()
            }
            .environmentObject(viewModel)
            .environmentObject(preferences)
            .environment(\.t, preferences.translations)
            .environment(\.themeColors, preferences.themeColors)
            .tint(preferences.themeColors.primary)
            .preferredColorScheme(preferences.colorScheme)
        }
    }
}
