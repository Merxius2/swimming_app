import SwiftUI

struct SettingsScreen: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var showResetConfirm = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Profile") {
                    TextField("Name", text: binding(\.name))
                    Picker("Sex", selection: binding(\.sex)) {
                        Text("Male").tag("male")
                        Text("Female").tag("female")
                    }
                    Stepper(value: ageBinding, in: 10...99) {
                        Text("Age: \(viewModel.profile.age)")
                    }
                }

                Section("AI coach") {
                    SecureField("OpenAI API key", text: binding(\.aiApiKey))
                    Text("Your key stays on-device and is used for optional AI coach feedback.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Section("Data") {
                    LabeledContent("Sessions", value: "\(viewModel.sessions.count)")
                    LabeledContent("Swim coins", value: "\(viewModel.totalCoins)")
                    Button("Reset all data", role: .destructive) {
                        showResetConfirm = true
                    }
                }

                Section("About") {
                    LabeledContent("App", value: "Aap-SC")
                    LabeledContent("Platform", value: "Native iOS")
                    LabeledContent("Storage key", value: SwimStorageService.storageKey)
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
            .confirmationDialog(
                "Reset all swim data?",
                isPresented: $showResetConfirm,
                titleVisibility: .visible
            ) {
                Button("Reset everything", role: .destructive) {
                    viewModel.resetAllData()
                }
            } message: {
                Text("This removes all sessions, coins, and profile data from this device.")
            }
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
