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
    @Environment(\.scenePhase) private var scenePhase

    @State private var showLaunchSessionFlow = false
    @State private var launchFlowPhase: LaunchFlowPhase = .searching
    @State private var launchFeedback: SessionFeedbackSummary?
    @State private var isEnhancingLaunchFeedback = false

    private var appIsDark: Bool {
        preferences.isDarkModeActive(systemColorScheme: systemColorScheme)
    }

    private var animationsPaused: Bool {
        scenePhase != .active
    }

    private var ambientBackgroundVisible: Bool {
        AmbientBackgroundState.isVisible(activeAmbient: viewModel.profile.activeAmbient)
    }

    var body: some View {
        ZStack {
            ContentView()
            AmbientOverlayView(activeAmbient: viewModel.profile.activeAmbient)
                .id(viewModel.profile.activeAmbient ?? "none")
            AmbientBubbleOverlayView(activeAmbient: viewModel.profile.activeAmbient)
        }
        .environment(\.t, preferences.translations)
        .environment(\.themeColors, preferences.themeColors)
        .environment(\.appIsDark, appIsDark)
        .environment(\.ambientBackgroundVisible, ambientBackgroundVisible)
        .environment(\.appAnimationsPaused, animationsPaused)
        .environment(\.themeTypographyCode, preferences.themeCode)
        .tint(preferences.themeColors.displayPrimary)
        .preferredColorScheme(preferences.colorScheme)
        .themedBodyFont()
        .sheet(isPresented: $showLaunchSessionFlow) {
            switch launchFlowPhase {
            case .searching:
                SearchingNewSessionsSheet()
                    .environmentObject(preferences)
                    .preferredColorScheme(preferences.colorScheme)
            case .feedback:
                if let launchFeedback {
                    SessionFeedbackSheet(
                        feedback: launchFeedback,
                        isLoading: isEnhancingLaunchFeedback
                    )
                    .environmentObject(viewModel)
                    .environmentObject(preferences)
                    .preferredColorScheme(preferences.colorScheme)
                }
            }
        }
        .task(priority: .utility) {
            try? await Task.sleep(for: .milliseconds(300))
            await performLaunchSessionSearchIfNeeded()
            await viewModel.refreshLaunchNotifications()
        }
        .onAppear {
            ThemeTypography.applyUIKitAppearance(themeCode: preferences.themeCode)
        }
        .onChange(of: preferences.themeCode) { _, themeCode in
            ThemeTypography.applyUIKitAppearance(themeCode: themeCode)
        }
    }

    @MainActor
    private func performLaunchSessionSearchIfNeeded() async {
        guard viewModel.shouldPerformLaunchSessionSearch() else { return }

        launchFlowPhase = .searching
        showLaunchSessionFlow = true
        guard let importedSession = await viewModel.performLaunchSessionSearch() else {
            showLaunchSessionFlow = false
            return
        }

        var feedback = viewModel.buildSessionFeedback(
            for: importedSession,
            t: preferences.translations
        )
        launchFeedback = feedback
        launchFlowPhase = .feedback

        guard !viewModel.profile.aiApiKey.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            return
        }

        isEnhancingLaunchFeedback = true
        defer { isEnhancingLaunchFeedback = false }

        if let enhanced = await viewModel.enhanceSessionFeedback(feedback, for: importedSession) {
            feedback = enhanced
            if launchFlowPhase == .feedback {
                launchFeedback = feedback
            }
        }
    }
}

private enum LaunchFlowPhase {
    case searching
    case feedback
}
