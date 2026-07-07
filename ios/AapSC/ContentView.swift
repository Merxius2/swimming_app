import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @EnvironmentObject private var preferences: UserPreferencesService
    @Environment(\.colorScheme) private var colorScheme
    @State private var selectedTab = 0
    @State private var showUpload = false
    @State private var showSettings = false
    @State private var showCoins = false

    private var isOlympicPool: Bool {
        preferences.themeCode == "olympic-pool"
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            TabView(selection: $selectedTab) {
                ProgressScreen()
                    .tabItem {
                        Label(preferences.t("navigation.progress"), systemImage: "chart.line.uptrend.xyaxis")
                    }
                    .tag(0)

                MedalsScreen()
                    .tabItem {
                        Label(preferences.t("navigation.medals"), systemImage: "medal")
                    }
                    .tag(1)

                Color.clear
                    .tabItem {
                        Label(preferences.t("navigation.upload"), systemImage: isOlympicPool ? "circle.fill" : "plus.circle.fill")
                    }
                    .tag(2)

                BenchmarkScreen()
                    .tabItem {
                        Label(preferences.t("navigation.benchmark"), systemImage: "gauge.with.dots.needle.67percent")
                    }
                    .tag(3)

                HistoryScreen()
                    .tabItem {
                        Label(preferences.t("navigation.history"), systemImage: "clock.arrow.circlepath")
                    }
                    .tag(4)
            }
            .background {
                if isOlympicPool {
                    OlympicPoolTabBarConfigurator(isDark: colorScheme == .dark)
                } else {
                    DefaultTabBarConfigurator()
                }
            }
            .onChange(of: selectedTab) { _, newValue in
                if newValue == 2 {
                    showUpload = true
                    selectedTab = 0
                }
            }

            if isOlympicPool {
                OlympicPoolUploadFAB {
                    showUpload = true
                }
                .offset(y: -18)

                Rectangle()
                    .fill(OlympicPoolColors.gold)
                    .frame(height: 4)
                    .frame(maxWidth: .infinity)
                    .offset(y: 28)
                    .allowsHitTesting(false)
            }
        }
        .sheet(isPresented: $showUpload) {
            UploadScreen()
        }
        .sheet(isPresented: $showSettings) {
            SettingsScreen()
        }
        .sheet(isPresented: $showCoins) {
            CoinsScreen()
        }
        .environment(\.openSettings, { showSettings = true })
        .environment(\.openCoins, { showCoins = true })
        .onAppear {
            viewModel.validateThemeSelection(preferences: preferences)
        }
    }
}

private struct OpenSettingsKey: EnvironmentKey {
    static let defaultValue: () -> Void = {}
}

private struct OpenCoinsKey: EnvironmentKey {
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
    @Environment(\.themeColors) private var themeColors

    init(_ title: String, subtitle: String? = nil, systemImage: String) {
        self.title = title
        self.subtitle = subtitle
        self.systemImage = systemImage
    }

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: systemImage)
                .font(.title2.weight(.semibold))
                .foregroundStyle(themeColors.displayPrimary)
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.title2.bold())
                if let subtitle {
                    Text(subtitle)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }
            Spacer()
        }
    }
}
