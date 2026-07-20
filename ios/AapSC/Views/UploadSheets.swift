import SwiftUI

struct MedalCelebrationSheet: View {
    @EnvironmentObject private var preferences: UserPreferencesService
    let medals: [EvaluatedMedal]
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Image(systemName: "medal.fill")
                    .font(.system(size: 56))
                    .foregroundStyle(.yellow)

                Text(preferences.t("medals.celebration.titleMultiple"))
                    .themeFont(.title, weight: .bold)

                ForEach(medals) { medal in
                    HStack {
                        Text(medal.id.replacingOccurrences(of: "_", with: " ").capitalized)
                        Spacer()
                        Text(medal.tier.capitalized)
                            .themeFont(.caption, weight: .bold)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(.yellow.opacity(0.2), in: Capsule())
                    }
                    .padding(.horizontal)
                }

                Spacer()
            }
            .padding(.top, 32)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button(preferences.t("settings.confirm")) { dismiss() }
                }
            }
        }
        .presentationDetents([.medium])
    }
}

struct DuplicateSessionAlert: View {
    @EnvironmentObject private var preferences: UserPreferencesService
    let duplicate: SwimSession
    let onCancel: () -> Void
    let onSaveAnyway: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Text(preferences.t("upload.duplicateTitle"))
                .themeFont(.headline, weight: .semibold)
            Text(preferences.t("upload.duplicateMessage", params: [
                "date": SwimFormatters.formatDateLong(duplicate.date)
            ]))
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)
            HStack {
                Button(preferences.t("common.cancel"), action: onCancel)
                    .buttonStyle(.bordered)
                Button(preferences.t("upload.saveSession"), action: onSaveAnyway)
                    .buttonStyle(.borderedProminent)
            }
        }
        .padding()
    }
}

struct SearchingNewSessionsSheet: View {
    @EnvironmentObject private var preferences: UserPreferencesService

    var body: some View {
        VStack(spacing: 20) {
            ProgressView()
                .controlSize(.large)
            Text(preferences.t("launch.searchingNewSessions"))
                .themeFont(.headline, weight: .semibold)
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .presentationDetents([.medium])
        .interactiveDismissDisabled()
    }
}

struct SessionFeedbackSheet: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @EnvironmentObject private var preferences: UserPreferencesService
    let feedback: SessionFeedbackSummary
    var isLoading: Bool = false
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                SessionFeedbackCard(
                    feedback: feedback,
                    isLoading: isLoading
                )
                .padding()
            }
            .navigationTitle(preferences.t("feedback.title"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button(preferences.t("settings.confirm")) { dismiss() }
                }
            }
        }
        .presentationDetents([.medium, .large])
    }
}
