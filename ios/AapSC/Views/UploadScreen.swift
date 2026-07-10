import SwiftUI
import PhotosUI

struct UploadScreen: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @EnvironmentObject private var preferences: UserPreferencesService
    @Environment(\.t) private var t
    @Environment(\.dismiss) private var dismiss

    @State private var showCoinSheet = false
    @State private var showMedalSheet = false
    @State private var showDuplicateConfirm = false
    @State private var showDateModal = false
    @State private var pendingDate = Date()
    @State private var uploadSaved = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    if uploadSaved {
                        savedFeedbackView
                    } else {
                        editingView
                    }
                }
                .padding()
            }
            .navigationTitle(preferences.t("upload.title"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(preferences.t("coins.close")) { closeUpload() }
                }
                if !uploadSaved {
                    ToolbarItem(placement: .confirmationAction) {
                        Button(preferences.t("upload.saveSession")) { handleSave() }
                            .disabled(!canSave)
                    }
                }
            }
            .onChange(of: viewModel.selectedPhotoItem) { _, _ in
                Task { await viewModel.processSelectedPhoto() }
            }
            .onChange(of: viewModel.parsedResult?.missingDate) { _, missingDate in
                if missingDate == true, viewModel.uploadDraft.date.isEmpty {
                    pendingDate = Date()
                    showDateModal = true
                }
            }
            .confirmationDialog(
                preferences.t("upload.duplicateTitle"),
                isPresented: $showDuplicateConfirm,
                titleVisibility: .visible
            ) {
                Button(preferences.t("upload.saveSession")) { handleSave(ignoreDuplicate: true) }
                Button(preferences.t("common.cancel"), role: .cancel) {
                    viewModel.duplicateSession = nil
                }
            } message: {
                if let duplicate = viewModel.duplicateSession {
                    Text(
                        t.t(
                            "upload.duplicateMessage",
                            params: ["date": SwimFormatters.formatDateLong(duplicate.date)]
                        )
                    )
                }
            }
            .sheet(isPresented: $showCoinSheet, onDismiss: finishCelebrations) {
                if let result = viewModel.lastUploadCoinResult {
                    CoinEarnedSheet(result: result)
                }
            }
            .sheet(isPresented: $showMedalSheet, onDismiss: presentCoinSheetIfNeeded) {
                MedalCelebrationSheet(medals: viewModel.lastNewMedals)
            }
            .sheet(isPresented: $showDateModal) {
                dateRequiredSheet
            }
        }
        .themedPageBackground()
    }

    private var canSave: Bool {
        !viewModel.uploadDraft.distance.isEmpty || !viewModel.uploadDraft.duration.isEmpty
    }

    private var editingView: some View {
        Group {
            ScreenHeader(
                preferences.t("upload.title"),
                subtitle: preferences.t("upload.subtitle"),
                pageKey: "upload",
                systemImage: "square.and.arrow.up"
            )

            Card {
                VStack(spacing: 16) {
                    PhotosPicker(selection: $viewModel.selectedPhotoItem, matching: .images) {
                        Label(preferences.t("upload.dropzone"), systemImage: "photo.on.rectangle.angled")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Color("BrandBlue"))

                    if viewModel.isProcessingOCR {
                        ProgressView(preferences.t("upload.analyzing"))
                    }

                    if let error = viewModel.ocrErrorMessage {
                        Text(error)
                            .foregroundStyle(.red)
                            .themeFont(.footnote)
                    }

                    if let parsed = viewModel.parsedResult {
                        parseSummary(parsed)
                    }
                }
            }

            if viewModel.parsedResult != nil {
                manualEntryForm
            }
        }
    }

    private var savedFeedbackView: some View {
        Group {
            if let feedback = viewModel.lastUploadFeedback {
                SessionFeedbackCard(
                    feedback: feedback,
                    isLoading: viewModel.isEnhancingUploadFeedback
                )
            }

            Button {
                resetForAnotherUpload()
            } label: {
                Text(preferences.t("upload.uploadAnother"))
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .tint(Color("BrandBlue"))
        }
    }

    private var dateRequiredSheet: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 16) {
                Text(preferences.t("upload.dateRequiredDesc"))
                    .themeFont(.body)
                    .foregroundStyle(.secondary)

                DatePicker(
                    preferences.t("upload.fields.date"),
                    selection: $pendingDate,
                    displayedComponents: .date
                )
                .datePickerStyle(.graphical)

                Button {
                    viewModel.uploadDraft.date = Self.formatDateKey(pendingDate)
                    showDateModal = false
                } label: {
                    Text(preferences.t("upload.confirmDate"))
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(Color("BrandBlue"))
            }
            .padding()
            .navigationTitle(preferences.t("upload.dateRequired"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(preferences.t("common.cancel")) {
                        showDateModal = false
                    }
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    private func handleSave(ignoreDuplicate: Bool = false) {
        if viewModel.uploadDraft.date.isEmpty {
            pendingDate = Date()
            showDateModal = true
            return
        }

        if !ignoreDuplicate, viewModel.duplicateSession != nil {
            showDuplicateConfirm = true
            return
        }

        if !ignoreDuplicate {
            let metrics = viewModel.uploadDraft.toMetrics()
            let candidate = SwimSession(date: viewModel.uploadDraft.resolvedDate, metrics: metrics)
            if SwimDuplicates.findDuplicateSession(viewModel.sessions, candidate: candidate) != nil {
                viewModel.duplicateSession = candidate
                showDuplicateConfirm = true
                return
            }
        }

        guard viewModel.saveUploadDraft(ignoreDuplicate: ignoreDuplicate) else {
            if viewModel.duplicateSession != nil {
                showDuplicateConfirm = true
            }
            return
        }

        uploadSaved = true
        viewModel.clearUploadDraft()

        if !viewModel.lastNewMedals.isEmpty {
            showMedalSheet = true
        } else {
            presentCoinSheetIfNeeded()
        }
    }

    private func presentCoinSheetIfNeeded() {
        if let result = viewModel.lastUploadCoinResult, result.total != 0 || !result.alreadyClaimed {
            showCoinSheet = true
        }
    }

    private func finishCelebrations() {
        // Feedback view is already visible behind the sheets.
    }

    private func resetForAnotherUpload() {
        viewModel.clearUploadCelebrationState()
        uploadSaved = false
    }

    private func closeUpload() {
        viewModel.clearUploadCelebrationState()
        viewModel.clearUploadDraft()
        dismiss()
    }

    private func parseSummary(_ parsed: ParsedScreenshotResult) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(preferences.t("upload.confidence"))
                    .themeFont(.subheadline, weight: .semibold)
                Spacer()
                Text("\(parsed.confidence)%")
                    .themeFont(.subheadline, weight: .bold)
            }

            if !parsed.isSwimWorkout {
                Label(preferences.t("upload.notSwim.unknown"), systemImage: "exclamationmark.triangle.fill")
                    .foregroundStyle(.orange)
                    .themeFont(.footnote)
            }

            if !parsed.warnings.isEmpty {
                Text(parsed.warnings.joined(separator: ", "))
                    .themeFont(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var manualEntryForm: some View {
        Card {
            VStack(spacing: 12) {
                Text(preferences.t("upload.reviewTitle"))
                    .themeFont(.headline, weight: .semibold)
                    .frame(maxWidth: .infinity, alignment: .leading)

                Text(preferences.t("upload.reviewDesc"))
                    .themeFont(.caption)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)

                dateField
                formField(preferences.t("upload.fields.duration"), text: $viewModel.uploadDraft.duration)
                formField(preferences.t("upload.fields.distance"), text: $viewModel.uploadDraft.distance)
                formField(preferences.t("upload.fields.pace"), text: $viewModel.uploadDraft.pace)
                formField(preferences.t("upload.fields.activeKcal"), text: $viewModel.uploadDraft.activeKcal)
                formField(preferences.t("upload.fields.heartRate"), text: $viewModel.uploadDraft.avgHeartRate)
                formField(preferences.t("upload.fields.laps"), text: $viewModel.uploadDraft.laps)
                formField(preferences.t("upload.fields.poolLength"), text: $viewModel.uploadDraft.poolLength)
            }
        }
    }

    private var dateField: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(preferences.t("upload.fields.date"))
                .themeFont(.caption, weight: .semibold)
                .foregroundStyle(.secondary)
            DatePicker(
                "",
                selection: dateBinding,
                displayedComponents: .date
            )
            .labelsHidden()
            .datePickerStyle(.compact)
        }
    }

    private var dateBinding: Binding<Date> {
        Binding(
            get: { Self.parseDateKey(viewModel.uploadDraft.date) ?? Date() },
            set: { viewModel.uploadDraft.date = Self.formatDateKey($0) }
        )
    }

    private func formField(_ title: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .themeFont(.caption, weight: .semibold)
                .foregroundStyle(.secondary)
            TextField(title, text: text)
                .textFieldStyle(.roundedBorder)
        }
    }

    private static func parseDateKey(_ value: String) -> Date? {
        guard !value.isEmpty else { return nil }
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.locale = Locale(identifier: "en_US_POSIX")
        return formatter.date(from: value)
    }

    private static func formatDateKey(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.locale = Locale(identifier: "en_US_POSIX")
        return formatter.string(from: date)
    }
}
