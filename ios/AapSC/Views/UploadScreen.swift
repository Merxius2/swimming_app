import SwiftUI
import PhotosUI

struct UploadScreen: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @Environment(\.dismiss) private var dismiss

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
                    Button("Save") {
                        viewModel.saveUploadDraft()
                        dismiss()
                    }
                    .disabled(!canSave)
                }
            }
            .onChange(of: viewModel.selectedPhotoItem) { _, _ in
                Task { await viewModel.processSelectedPhoto() }
            }
        }
    }

    private var canSave: Bool {
        !viewModel.uploadDraft.distance.isEmpty || !viewModel.uploadDraft.duration.isEmpty
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
