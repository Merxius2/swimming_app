import SwiftUI
import PhotosUI

struct UploadScreen: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var showCoinSheet = false
    @State private var showMedalSheet = false
    @State private var showDuplicateConfirm = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    ScreenHeader(
                        "Upload",
                        subtitle: "Import a screenshot from Apple Fitness",
                        systemImage: "square.and.arrow.up"
                    )

                    Card {
                        VStack(spacing: 16) {
                            PhotosPicker(selection: $viewModel.selectedPhotoItem, matching: .images) {
                                Label("Choose screenshot", systemImage: "photo.on.rectangle.angled")
                                    .frame(maxWidth: .infinity)
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(Color("BrandBlue"))

                            if viewModel.isProcessingOCR {
                                ProgressView("Reading screenshot…")
                            }

                            if let error = viewModel.ocrErrorMessage {
                                Text(error)
                                    .foregroundStyle(.red)
                                    .font(.footnote)
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
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Upload")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { handleSave() }
                        .disabled(!canSave)
                }
            }
            .onChange(of: viewModel.selectedPhotoItem) { _, _ in
                Task { await viewModel.processSelectedPhoto() }
            }
            .confirmationDialog(
                "Duplicate workout?",
                isPresented: $showDuplicateConfirm,
                titleVisibility: .visible
            ) {
                Button("Save anyway") { handleSave(ignoreDuplicate: true) }
                Button("Cancel", role: .cancel) {
                    viewModel.duplicateSession = nil
                }
            } message: {
                if let duplicate = viewModel.duplicateSession {
                    Text("A session on \(SwimFormatters.formatDateLong(duplicate.date)) with the same metrics already exists.")
                }
            }
            .sheet(isPresented: $showCoinSheet, onDismiss: finishUploadFlow) {
                if let result = viewModel.lastUploadCoinResult {
                    CoinEarnedSheet(result: result)
                }
            }
            .sheet(isPresented: $showMedalSheet, onDismiss: presentCoinSheetIfNeeded) {
                MedalCelebrationSheet(medals: viewModel.lastNewMedals)
            }
        }
    }

    private var canSave: Bool {
        !viewModel.uploadDraft.distance.isEmpty || !viewModel.uploadDraft.duration.isEmpty
    }

    private func handleSave(ignoreDuplicate: Bool = false) {
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

        if !viewModel.lastNewMedals.isEmpty {
            showMedalSheet = true
        } else {
            presentCoinSheetIfNeeded()
        }
    }

    private func presentCoinSheetIfNeeded() {
        if let result = viewModel.lastUploadCoinResult, result.total != 0 || !result.alreadyClaimed {
            showCoinSheet = true
        } else {
            finishUploadFlow()
        }
    }

    private func finishUploadFlow() {
        viewModel.clearUploadDraft()
        dismiss()
    }

    private func parseSummary(_ parsed: ParsedScreenshotResult) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("OCR confidence")
                    .font(.subheadline.weight(.semibold))
                Spacer()
                Text("\(parsed.confidence)%")
                    .font(.subheadline.bold())
            }

            if !parsed.isSwimWorkout {
                Label("This may not be a swim workout.", systemImage: "exclamationmark.triangle.fill")
                    .foregroundStyle(.orange)
                    .font(.footnote)
            }

            if !parsed.warnings.isEmpty {
                Text(parsed.warnings.joined(separator: ", "))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var manualEntryForm: some View {
        Card {
            VStack(spacing: 12) {
                Text("Review & edit")
                    .font(.headline)
                    .frame(maxWidth: .infinity, alignment: .leading)

                formField("Date (YYYY-MM-DD)", text: $viewModel.uploadDraft.date)
                formField("Duration", text: $viewModel.uploadDraft.duration)
                formField("Distance (m)", text: $viewModel.uploadDraft.distance)
                formField("Pace", text: $viewModel.uploadDraft.pace)
                formField("Active kcal", text: $viewModel.uploadDraft.activeKcal)
                formField("Avg heart rate", text: $viewModel.uploadDraft.avgHeartRate)
                formField("Laps", text: $viewModel.uploadDraft.laps)
                formField("Pool length (m)", text: $viewModel.uploadDraft.poolLength)
            }
        }
    }

    private func formField(_ title: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
            TextField(title, text: text)
                .textFieldStyle(.roundedBorder)
        }
    }
}
