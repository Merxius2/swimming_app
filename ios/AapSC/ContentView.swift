import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @EnvironmentObject private var preferences: UserPreferencesService
    @Environment(\.appIsDark) private var appIsDark
    @State private var selectedTab = 0
    @State private var showUpload = false
    @State private var showSettings = false
    @State private var showCoins = false

    private var themeProfile: ThemeVisualProfile {
        ThemeVisualProfiles.profile(
            code: preferences.themeCode,
            isDark: appIsDark
        )
    }

    private var appearanceKey: String {
        "\(preferences.themeCode)-\(preferences.isAutoDarkMode)-\(preferences.isDarkMode)"
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            tabContent
                .id(appearanceKey)
                .safeAreaPadding(.bottom, themeProfile.tabBar.layoutHeight)

            CustomTabBar(
                selectedTab: $selectedTab,
                profile: themeProfile,
                uploadActive: showUpload,
                onUpload: { showUpload = true },
                progressTitle: preferences.t("navigation.progress"),
                medalsTitle: preferences.t("navigation.medals"),
                uploadTitle: preferences.t("navigation.upload"),
                benchmarkTitle: preferences.t("navigation.benchmark"),
                historyTitle: preferences.t("navigation.history")
            )
        }
        .ignoresSafeArea(.container, edges: .bottom)
        .sheet(isPresented: $showUpload) {
            UploadScreen()
                .preferredColorScheme(preferences.colorScheme)
        }
        .sheet(isPresented: $showSettings) {
            SettingsScreen()
                .preferredColorScheme(preferences.colorScheme)
        }
        .sheet(isPresented: $showCoins) {
            CoinsScreen()
                .preferredColorScheme(preferences.colorScheme)
        }
        .environment(\.openSettings, { showSettings = true })
        .environment(\.openCoins, { showCoins = true })
        .environment(\.openUpload, { showUpload = true })
        .onAppear {
            viewModel.validateThemeSelection(preferences: preferences)
        }
    }

    @ViewBuilder
    private var tabContent: some View {
        switch selectedTab {
        case 0:
            ProgressScreen()
        case 1:
            MedalsScreen()
        case 3:
            BenchmarkScreen()
        case 4:
            HistoryScreen()
        default:
            ProgressScreen()
        }
    }
}

private struct OpenSettingsKey: EnvironmentKey {
    static let defaultValue: () -> Void = {}
}

private struct OpenCoinsKey: EnvironmentKey {
    static let defaultValue: () -> Void = {}
}

private struct OpenUploadKey: EnvironmentKey {
    static let defaultValue: () -> Void = {}
}

extension EnvironmentValues {
    var openSettings: () -> Void {
        get { self[OpenSettingsKey.self] }
        set { self[OpenSettingsKey.self] = newValue }
    }

    var openCoins: () -> Void {
        get { self[OpenCoinsKey.self] }
        set { self[OpenCoinsKey.self] = newValue }
    }

    var openUpload: () -> Void {
        get { self[OpenUploadKey.self] }
        set { self[OpenUploadKey.self] = newValue }
    }
}

struct Card<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .themedCard()
    }
}

struct ScreenHeader: View {
    let title: String
    let subtitle: String?
    let systemImage: String
    @EnvironmentObject private var preferences: UserPreferencesService
    @Environment(\.appIsDark) private var appIsDark

    init(_ title: String, subtitle: String? = nil, systemImage: String) {
        self.title = title
        self.subtitle = subtitle
        self.systemImage = systemImage
    }

    private var profile: ThemeVisualProfile {
        ThemeVisualProfiles.profile(
            code: preferences.themeCode,
            isDark: appIsDark
        )
    }

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: systemImage)
                .themeFont(.title2, weight: .semibold)
                .foregroundStyle(profile.displayPrimary)
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .themeFont(.title2, weight: .bold)
                    .tracking(ThemeTypography.headingTracking(for: preferences.themeCode))
                    .textCase(ThemeTypography.usesUppercaseHeadings(for: preferences.themeCode) ? .uppercase : nil)
                if let subtitle {
                    Text(subtitle)
                        .themeFont(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }
            Spacer()
        }
    }
}
