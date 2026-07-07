import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0
    @State private var showUpload = false
    @State private var showSettings = false
    @State private var showCoins = false

    var body: some View {
        TabView(selection: $selectedTab) {
            ProgressScreen()
                .tabItem {
                    Label("Progress", systemImage: "chart.line.uptrend.xyaxis")
                }
                .tag(0)

            MedalsScreen()
                .tabItem {
                    Label("Medals", systemImage: "medal")
                }
                .tag(1)

            Color.clear
                .tabItem {
                    Label("Upload", systemImage: "plus.circle.fill")
                }
                .tag(2)

            BenchmarkScreen()
                .tabItem {
                    Label("Benchmark", systemImage: "gauge.with.dots.needle.67percent")
                }
                .tag(3)

            HistoryScreen()
                .tabItem {
                    Label("History", systemImage: "clock.arrow.circlepath")
                }
                .tag(4)
        }
        .onChange(of: selectedTab) { _, newValue in
            if newValue == 2 {
                showUpload = true
                selectedTab = 0
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
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .strokeBorder(Color.white.opacity(0.15), lineWidth: 1)
            )
    }
}

struct ScreenHeader: View {
    let title: String
    let subtitle: String?
    let systemImage: String

    init(_ title: String, subtitle: String? = nil, systemImage: String) {
        self.title = title
        self.subtitle = subtitle
        self.systemImage = systemImage
    }

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: systemImage)
                .font(.title2.weight(.semibold))
                .foregroundStyle(Color("BrandBlue"))
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
