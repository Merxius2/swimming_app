import SwiftUI

struct SettingsScreen: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @EnvironmentObject private var preferences: UserPreferencesService
    @Environment(\.dismiss) private var dismiss
    @Environment(\.themeColors) private var themeColors

    @State private var showResetConfirm = false
    @State private var showImportConfirm = false
    @State private var showSecretSettings = false
    @State private var exportString = ""
    @State private var importString = ""
    @State private var importError: String?
    @State private var exportStatus: String?
    @State private var isExporting = false
    @State private var isImporting = false

    var body: some View {
        NavigationStack {
            Form {
                profileSection
                mascotSection
                aiSection
                languageSection
                themeSection
                darkModeSection
                cosmeticsSection
                importExportSection
                dataSection
                aboutSection
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
            .confirmationDialog(
                preferences.t("settings.importConfirm"),
                isPresented: $showImportConfirm,
                titleVisibility: .visible
            ) {
                Button(preferences.t("settings.importButton"), role: .destructive) {
                    Task { await performImport() }
                }
                Button(preferences.t("common.cancel"), role: .cancel) {}
            } message: {
                Text(preferences.t("settings.importConfirmDesc"))
            }
            .confirmationDialog(
                preferences.t("settings.confirm"),
                isPresented: $showResetConfirm,
                titleVisibility: .visible
            ) {
                Button(preferences.t("settings.clearButton"), role: .destructive) {
                    viewModel.resetAllData()
                }
                Button(preferences.t("common.cancel"), role: .cancel) {}
            } message: {
                Text(preferences.t("settings.confirmDesc"))
            }
            .sheet(isPresented: $showSecretSettings) {
                SecretSettingsSheet()
            }
        }
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
        Section(preferences.t("settings.mascotTitle")) {
            MascotCharacterView(mascotId: viewModel.mascotId, size: 120)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)

            ForEach(MascotConstants.ids, id: \.self) { mascotId in
                Button {
                    _ = viewModel.switchMascot(mascotId)
                } label: {
                    HStack {
                        Text(mascotDisplayName(mascotId))
                        Spacer()
                        if viewModel.mascotId == mascotId {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundStyle(themeColors.primary)
                        }
                    }
                }
            }
        }
    }

    private var aiSection: some View {
        Section(preferences.t("settings.aiTitle")) {
            SecureField(preferences.t("settings.aiPlaceholder"), text: binding(\.aiApiKey))
            Text(preferences.t("settings.aiDesc"))
                .font(.caption)
                .foregroundStyle(.secondary)
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
                    HStack {
                        HStack(spacing: 0) {
                            Circle().fill(theme.primary).frame(width: 14, height: 14)
                            Circle().fill(theme.secondary).frame(width: 14, height: 14)
                            Circle().fill(theme.accent).frame(width: 14, height: 14)
                        }
                        Text(preferences.t(theme.nameKey))
                        Spacer()
                        if preferences.themeCode == theme.code {
                            Image(systemName: "checkmark")
                                .foregroundStyle(themeColors.primary)
                        } else if !unlocked {
                            Image(systemName: "lock.fill")
                                .font(.caption)
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
                    Text(iconLabel(id)).tag(Optional(id))
                }
            }
        }
    }

    private var importExportSection: some View {
        Group {
            Section(preferences.t("settings.exportTitle")) {
            Button {
                Task { await performExport() }
            } label: {
                if isExporting {
                    ProgressView()
                } else {
                    Text(preferences.t("settings.exportButton"))
                }
            }

            if !exportString.isEmpty {
                TextEditor(text: $exportString)
                    .frame(minHeight: 80)
                Button(preferences.t("settings.copy")) {
                    UIPasteboard.general.string = exportString
                    exportStatus = preferences.t("settings.copied")
                }
            }

            if let exportStatus {
                Text(exportStatus)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }

        Section(preferences.t("settings.importTitle")) {
            TextEditor(text: $importString)
                .frame(minHeight: 80)

            Button(preferences.t("settings.importButton")) {
                showImportConfirm = true
            }
            .disabled(importString.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isImporting)

            if let importError {
                Text(importError)
                    .font(.caption)
                    .foregroundStyle(.red)
            }
        }
        }
    }

    private var dataSection: some View {
        Section(preferences.t("settings.resetData")) {
            LabeledContent(preferences.t("navigation.history"), value: "\(viewModel.sessions.count)")
            LabeledContent(preferences.t("coins.label"), value: "\(viewModel.totalCoins)")
            Button(preferences.t("settings.clearButton"), role: .destructive) {
                showResetConfirm = true
            }
        }
    }

    private var aboutSection: some View {
        Section("About") {
            LabeledContent("App", value: "Aap-SC")
            LabeledContent("Platform", value: "Native iOS")
            LabeledContent("Storage", value: SwimStorageService.storageKey)
        }
    }

    private func mascotDisplayName(_ id: String) -> String {
        switch id {
        case "flo": return preferences.t("settings.mascotFloName")
        case "fins": return preferences.t("settings.mascotFinsName")
        default: return preferences.t("settings.mascotFlipName")
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

    private func performExport() async {
        isExporting = true
        defer { isExporting = false }
        do {
            exportString = try await viewModel.exportDataString()
            exportStatus = nil
        } catch {
            exportStatus = error.localizedDescription
        }
    }

    private func performImport() async {
        isImporting = true
        importError = nil
        defer { isImporting = false }
        do {
            try await viewModel.importDataString(importString)
            importString = ""
        } catch {
            importError = error.localizedDescription
        }
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
