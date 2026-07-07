import SwiftUI

struct SecretSettingsSheet: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Text("Tap the app icon 3× in Settings to unlock this menu.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Section("Cheats") {
                    Toggle("Unlock all medals", isOn: cheatBinding(\.allMedalsUnlocked))
                    Toggle("Preview monthly medals", isOn: cheatBinding(\.previewMonthlyMedals))
                    Toggle("Unlock all themes", isOn: cheatBinding(\.allThemesUnlocked))
                }
            }
            .navigationTitle("Secret Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }

    private func cheatBinding(_ keyPath: WritableKeyPath<SwimCheats, Bool>) -> Binding<Bool> {
        Binding(
            get: { viewModel.cheats[keyPath: keyPath] },
            set: { newValue in
                viewModel.updateCheats { $0[keyPath: keyPath] = newValue }
            }
        )
    }
}
