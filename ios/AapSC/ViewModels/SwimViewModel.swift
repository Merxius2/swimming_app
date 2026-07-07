import Foundation
import SwiftUI
import PhotosUI

@MainActor
final class SwimViewModel: ObservableObject {
    @Published private(set) var data: SwimData = .empty
    @Published private(set) var isLoading = true
    @Published var selectedPhotoItem: PhotosPickerItem?
    @Published var isProcessingOCR = false
    @Published var ocrErrorMessage: String?
    @Published var parsedResult: ParsedScreenshotResult?
    @Published var uploadDraft = UploadDraft.empty

    var sessions: [SwimSession] { data.sessions }
    var profile: SwimProfile { data.profile }
    var totalCoins: Int { data.totalCoins }

    init() {
        load()
    }

    func load() {
        data = SwimStorageService.load()
        isLoading = false
    }

    func updateProfile(_ updates: (inout SwimProfile) -> Void) {
        var profile = data.profile
        updates(&profile)
        data.profile = profile
        persist()
    }

    func addSession(from metrics: SwimMetrics, date: String) {
        let prior = data.sessions
        let session = SwimSession(date: date, metrics: metrics)
        let coins = SwimCoins.calculateSessionCoins(session, priorSessions: prior)
        var saved = session
        saved.sessionCoins = coins

        data.sessions.append(saved)
        data.totalCoins += coins
        persist()
    }

    func deleteSession(id: String) {
        guard let index = data.sessions.firstIndex(where: { $0.id == id }) else { return }
        let removed = data.sessions.remove(at: index)
        if let coins = removed.sessionCoins {
            data.totalCoins = max(0, data.totalCoins - coins)
        }
        persist()
    }

    func resetAllData() {
        SwimStorageService.clear()
        data = .empty
    }

    func processSelectedPhoto() async {
        guard let selectedPhotoItem else { return }
        isProcessingOCR = true
        ocrErrorMessage = nil
        defer { isProcessingOCR = false }

        do {
            guard let data = try await selectedPhotoItem.loadTransferable(type: Data.self),
                  let image = UIImage(data: data) else {
                ocrErrorMessage = "Could not load the selected photo."
                return
            }

            let result = try await OCRService.parseSwimScreenshot(from: image)
            parsedResult = result
            uploadDraft = UploadDraft.from(parsed: result.fields)
        } catch {
            ocrErrorMessage = error.localizedDescription
        }
    }

    func saveUploadDraft() {
        let metrics = uploadDraft.toMetrics()
        let date = uploadDraft.date.isEmpty
            ? ISO8601DateFormatter().string(from: Date()).prefix(10).description
            : uploadDraft.date
        addSession(from: metrics, date: date)
        uploadDraft = .empty
        parsedResult = nil
        selectedPhotoItem = nil
    }

    private func persist() {
        SwimStorageService.save(data)
    }
}

struct UploadDraft: Equatable {
    var date: String
    var duration: String
    var distance: String
    var pace: String
    var activeKcal: String
    var totalKcal: String
    var avgHeartRate: String
    var laps: String
    var poolLength: String
    var goal: String
    var location: String
    var timeRange: String

    static let empty = UploadDraft(
        date: "",
        duration: "",
        distance: "",
        pace: "",
        activeKcal: "",
        totalKcal: "",
        avgHeartRate: "",
        laps: "",
        poolLength: "25",
        goal: "",
        location: "",
        timeRange: ""
    )

    static func from(parsed fields: ParsedScreenshotFields) -> UploadDraft {
        UploadDraft(
            date: fields.date ?? "",
            duration: SwimFormatters.formatDuration(fields.durationSec),
            distance: fields.distanceM.map(String.init) ?? "",
            pace: fields.paceSecPer100m.map { SwimFormatters.formatPace($0).replacingOccurrences(of: "/100m", with: "") } ?? "",
            activeKcal: fields.activeKcal.map(String.init) ?? "",
            totalKcal: fields.totalKcal.map(String.init) ?? "",
            avgHeartRate: fields.avgHeartRate.map(String.init) ?? "",
            laps: fields.laps.map(String.init) ?? "",
            poolLength: String(fields.poolLengthM),
            goal: fields.goalM.map(String.init) ?? "",
            location: fields.location,
            timeRange: fields.timeRange
        )
    }

    func toMetrics() -> SwimMetrics {
        SwimMetrics(
            durationSec: SwimFormatters.parseDurationSec(duration),
            distanceM: SwimFormatters.parseDistanceM(distance),
            activeKcal: Int(activeKcal),
            totalKcal: Int(totalKcal),
            paceSecPer100m: SwimFormatters.parsePaceSecPer100m(pace),
            avgHeartRate: Int(avgHeartRate),
            laps: Int(laps),
            poolLengthM: Int(poolLength) ?? 25,
            goalM: SwimFormatters.parseDistanceM(goal),
            location: location,
            timeRange: timeRange,
            strokes: .empty
        )
    }
}

private extension Optional where Wrapped == Int {
    init?(_ string: String) {
        guard !string.isEmpty, let value = Int(string) else {
            self = nil
            return
        }
        self = value
    }
}
