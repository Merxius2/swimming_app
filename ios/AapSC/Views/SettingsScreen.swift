import SwiftUI

struct SettingsScreen: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @EnvironmentObject private var preferences: UserPreferencesService
    @Environment(\.dismiss) private var dismiss
    @Environment(\.themeColors) private var themeColors

    @State private var showSecretSettings = false

    var body: some View {
        NavigationStack {
            Form {
                profileSection
                mascotSection
                languageSection
                themeSection
                darkModeSection
                cosmeticsSection
            }
            .navigationTitle(preferences.t("settings.title"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button(preferences.t("coins.close")) { dismiss() }
                }
            }
            .onTapGesture(count: 3) {
                showSecretSettings = true
            }
            .sheet(isPresented: $showSecretSettings) {
                SecretSettingsSheet()
            }
            .themedNavigationBar()
        }
        .themedPageBackground()
    }

    private var profileSection: some View {
        Section(preferences.t("settings.profileTitle")) {
            TextField(preferences.t("settings.swimmerNamePlaceholder"), text: binding(\.name))
            Picker(preferences.t("settings.sex"), selection: binding(\.sex)) {
                Text(preferences.t("settings.sexMale")).tag("male")
                Text(preferences.t("settings.sexFemale")).tag("female")
            }
            Stepper(value: ageBinding, in: 10...99) {
                Text(preferences.t("settings.age") + ": \(viewModel.profile.age)")
            }
        }
    }

    private var mascotSection: some View {
        Section {
            MascotSettingsSection()
                .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                .listRowBackground(Color.clear)
                .listRowSeparator(.hidden)
        }
    }

    private var languageSection: some View {
        Section(preferences.t("settings.language")) {
            Picker(preferences.t("settings.language"), selection: languageBinding) {
                ForEach(TranslationService.supportedLanguages, id: \.self) { code in
                    Text(preferences.translations.languageDisplayName(code)).tag(code)
                }
            }
        }
    }

    private var themeSection: some View {
        Section(preferences.t("settings.theme")) {
            ForEach(AppThemes.all) { theme in
                let unlocked = SwimCoinStore.isThemeUnlocked(
                    theme.code,
                    storeUnlocks: viewModel.storeUnlocks,
                    allThemesUnlocked: viewModel.cheats.allThemesUnlocked
                ) || theme.code == AppThemes.defaultCode
                Button {
                    guard unlocked else { return }
                    preferences.setTheme(theme.code)
                } label: {
                    HStack(spacing: 12) {
                        ThemePreviewBar(theme: theme, height: 28)
                            .frame(width: 72)
                        Text(preferences.t(theme.nameKey))
                        Spacer()
                        if preferences.themeCode == theme.code {
                            Image(systemName: "checkmark")
                                .foregroundStyle(themeColors.primary)
                        } else if !unlocked {
                            Image(systemName: "lock.fill")
                                .themeFont(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .disabled(!unlocked)
            }
        }
    }

    private var darkModeSection: some View {
        Section(preferences.t("settings.darkMode")) {
            Toggle(preferences.t("settings.autoDarkMode"), isOn: autoDarkBinding)
            if !preferences.isAutoDarkMode {
                Toggle(preferences.t("settings.darkMode"), isOn: darkModeBinding)
            }
        }
    }

    private var cosmeticsSection: some View {
        Section(preferences.t("settings.storeCosmeticsTitle")) {
            Picker(preferences.t("settings.activeAmbient"), selection: ambientBinding) {
                Text(preferences.t("settings.ambientDefault")).tag(Optional<String>.none)
                ForEach(ownedAmbients, id: \.self) { id in
                    Text(ambientLabel(id)).tag(Optional(id))
                }
            }

            Picker(preferences.t("settings.activeAppIcon"), selection: iconBinding) {
                Text(preferences.t("settings.iconDefault")).tag(Optional<String>.none)
                ForEach(ownedIcons, id: \.self) { id in
                    Label {
                        Text(iconLabel(id))
                    } icon: {
                        StoreIconPreview(id: id, size: 20)
                    }
                    .tag(Optional(id))
                }
            }
        }
    }

    private var languageBinding: Binding<String> {
        Binding(
            get: { preferences.language },
            set: { preferences.setLanguage($0) }
        )
    }

    private var autoDarkBinding: Binding<Bool> {
        Binding(
            get: { preferences.isAutoDarkMode },
            set: { preferences.setDarkMode(preferences.isDarkMode, auto: $0) }
        )
    }

    private var darkModeBinding: Binding<Bool> {
        Binding(
            get: { preferences.isDarkMode },
            set: { preferences.setDarkMode($0, auto: false) }
        )
    }

    private var ambientBinding: Binding<String?> {
        Binding(
            get: { viewModel.profile.activeAmbient },
            set: { newValue in
                viewModel.updateProfile { $0.activeAmbient = newValue }
            }
        )
    }

    private var iconBinding: Binding<String?> {
        Binding(
            get: { viewModel.profile.activeAppIcon },
            set: { newValue in
                viewModel.updateProfile { $0.activeAppIcon = newValue }
                AppIconService.apply(
                    activeAppIcon: newValue,
                    storeUnlocks: viewModel.storeUnlocks
                )
            }
        )
    }

    private var ownedAmbients: [String] {
        SwimCoinStore.catalog
            .filter { $0.id.hasPrefix("ambient:") }
            .map(\.id)
            .filter { SwimCoinStore.isStoreItemOwned($0, storeUnlocks: viewModel.storeUnlocks) }
    }

    private var ownedIcons: [String] {
        SwimCoinStore.catalog
            .filter { $0.id.hasPrefix("icon:") }
            .map(\.id)
            .filter { SwimCoinStore.isStoreItemOwned($0, storeUnlocks: viewModel.storeUnlocks) }
    }

    private func ambientLabel(_ id: String) -> String {
        guard let item = SwimCoinStore.getStoreItem(id) else { return id }
        return SwimCoinStore.localizedName(item, t: preferences.translations)
    }

    private func iconLabel(_ id: String) -> String {
        guard let item = SwimCoinStore.getStoreItem(id) else { return id }
        return SwimCoinStore.localizedName(item, t: preferences.translations)
    }

    private var ageBinding: Binding<Int> {
        Binding(
            get: { viewModel.profile.age },
            set: { newValue in
                viewModel.updateProfile { $0.age = newValue }
            }
        )
    }

    private func binding(_ keyPath: WritableKeyPath<SwimProfile, String>) -> Binding<String> {
        Binding(
            get: { viewModel.profile[keyPath: keyPath] },
            set: { newValue in
                viewModel.updateProfile { $0[keyPath: keyPath] = newValue }
            }
        )
    }
}
