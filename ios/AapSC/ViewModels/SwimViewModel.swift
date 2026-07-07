import Foundation
import SwiftUI
import PhotosUI

@MainActor
final class SwimViewModel: ObservableObject {
    @Published private(set) var data: SwimData = .empty
    @Published private(set) var cheats: SwimCheats = .empty
    @Published private(set) var isLoading = true
    @Published var selectedPhotoItem: PhotosPickerItem?
    @Published var isProcessingOCR = false
    @Published var ocrErrorMessage: String?
    @Published var parsedResult: ParsedScreenshotResult?
    @Published var uploadDraft = UploadDraft.empty
    @Published var lastUploadCoinResult: UploadCoinResult?
    @Published var lastNewMedals: [EvaluatedMedal] = []
    @Published var duplicateSession: SwimSession?
    @Published var lastUploadFeedback: SessionFeedbackSummary?
    @Published var isEnhancingUploadFeedback = false

    private var saveTask: Task<Void, Never>?

    var sessions: [SwimSession] { data.sessions }
    var profile: SwimProfile { data.profile }
    var totalCoins: Int { data.totalCoins }
    var coinsSpent: Int { data.coinsSpent }
    var spentCoinClaims: [SpentCoinClaim] { data.spentCoinClaims }
    var storeUnlocks: [String] { data.storeUnlocks }
    var monthlyChallengeRerolls: [String: MonthRerollEntry] { data.monthlyChallengeRerolls }
    var challengeRerollCredits: Int { data.challengeRerollCredits }
    var bonusWheelSpinCredits: Int { data.bonusWheelSpinCredits }
    var monthlySettlements: [String: MonthlySettlement] { data.monthlySettlements }
    var wheelSpins: WheelSpins? { data.wheelSpins }

    var mascotId: String {
        MascotUnlock.resolveMascotId(
            profile: profile,
            sessions: sessions,
            monthlyChallengeRerolls: monthlyChallengeRerolls
        )
    }

    var evaluatedMedals: [EvaluatedMedal] {
        SwimMedals.evaluateAllMedals(
            sessions,
            allMedalsUnlocked: cheats.allMedalsUnlocked
        )
    }

    init() {
        load()
    }

    func load() {
        data = SwimStorageService.load()
        cheats = SwimCheatsService.load()
        isLoading = false
    }

    func updateProfile(_ updates: (inout SwimProfile) -> Void) {
        var profile = data.profile
        updates(&profile)
        data.profile = SwimCoinStore.sanitizeProfileCosmetics(
            profile,
            storeUnlocks: data.storeUnlocks
        )
        persist(immediate: true)
    }

    func switchMascot(_ nextMascotId: String) -> Bool {
        let current = mascotId
        let result = MascotUnlock.canSwitchMascot(
            profile: profile,
            sessions: sessions,
            nextMascotId: nextMascotId,
            currentMascotId: current
        )
        guard result.allowed else { return false }
        let monthKey = SwimMonthlyChallenges.getMonthKey()
        updateProfile { profile in
            profile.mascotId = nextMascotId
            if nextMascotId != current {
                profile.mascotSwitchMonthKey = monthKey
            }
        }
        return true
    }

    func addSession(
        date: String,
        metrics: SwimMetrics,
        coinsEarned: Int,
        coinBonus: Int = 0
    ) -> SwimSession {
        let entry = SwimSession(
            id: SwimStorageService.createSessionId(),
            createdAt: ISO8601DateFormatter().string(from: Date()),
            date: date,
            metrics: metrics,
            coinsEarned: coinsEarned,
            coinBonus: coinBonus
        )
        data.sessions.append(entry)
        data.sessions.sort { $0.date < $1.date }
        data.totalCoins = max(0, data.totalCoins + coinsEarned + coinBonus)
        persist()
        return entry
    }

    func applyMonthlySettlement(monthKey: String, coins: Int, mascotId: String?) {
        guard !monthKey.isEmpty, data.monthlySettlements[monthKey] == nil else { return }
        let deduction = min(max(0, coins), data.totalCoins)
        data.totalCoins = max(0, data.totalCoins - deduction)
        data.coinsSpent += deduction
        data.monthlySettlements[monthKey] = MonthlySettlement(
            coins: deduction,
            mascotId: mascotId,
            appliedAt: ISO8601DateFormatter().string(from: Date())
        )
        persist(immediate: true)
    }

    func removeSession(id: String) {
        guard let session = data.sessions.first(where: { $0.id == id }) else { return }
        let coinsRemoved = SwimCoinClaims.sessionTotalCoins(session)
        if coinsRemoved > 0 {
            data.spentCoinClaims.append(SwimCoinClaims.createCoinClaim(session))
        }
        data.totalCoins = max(0, data.totalCoins - coinsRemoved)
        data.sessions.removeAll { $0.id == id }
        persist()
    }

    func updateSession(id: String, updates: (inout SwimSession) -> Void) {
        guard let index = data.sessions.firstIndex(where: { $0.id == id }) else { return }
        updates(&data.sessions[index])
        persist()
    }

    func replaceData(_ nextData: SwimData) {
        data = SwimStorageService.normalize(nextData)
        persist(immediate: true)
    }

    func clearAll() {
        data = .empty
        cheats = .empty
        SwimStorageService.clear()
        SwimCheatsService.clear()
    }

    func resetAllData() {
        clearAll()
    }

    func exportDataString() async throws -> String {
        try await SwimImportExport.generateExportString(from: data)
    }

    func importDataString(_ exportString: String) async throws {
        let imported = try await SwimImportExport.parseImportString(exportString)
        replaceData(imported)
    }

    func adjustCoins(delta: Int) {
        data.totalCoins = max(0, data.totalCoins + delta)
        if delta < 0 {
            data.coinsSpent += abs(delta)
            persist(immediate: true)
        } else {
            persist()
        }
    }

    func recordWheelPaidSpin() {
        let today = SwimWheelSpins.getWheelSpinDayKey()
        data.wheelSpins = SwimWheelSpins.recordPaidSpin(data.wheelSpins, today: today)
        persist(immediate: true)
    }

    @discardableResult
    func rerollMonthlyChallenge(monthKey: String, tierIndex: Int) -> Bool {
        guard let next = SwimMonthlyChallenges.applyMonthlyChallengeReroll(
            data: data,
            monthKey: monthKey,
            tierIndex: tierIndex,
            mascotId: mascotId
        ) else {
            return false
        }
        data = next
        persist(immediate: true)
        return true
    }

    @discardableResult
    func purchaseStoreItem(_ itemId: String) -> Bool {
        if SwimCoinStore.isConsumableStoreItem(itemId) {
            guard let next = SwimCoinStore.applyConsumableStorePurchase(data: data, itemId: itemId) else {
                return false
            }
            data = next
            persist(immediate: true)
            return true
        }

        guard let update = SwimCoinStore.purchaseStoreItemUpdate(
            id: itemId,
            storeUnlocks: data.storeUnlocks,
            totalCoins: data.totalCoins,
            coinsSpent: data.coinsSpent
        ) else {
            return false
        }

        data.storeUnlocks = update.storeUnlocks
        data.totalCoins = update.totalCoins
        data.coinsSpent = update.coinsSpent

        if itemId.hasPrefix("ambient:") {
            data.profile.activeAmbient = itemId
        } else if itemId.hasPrefix("icon:") {
            data.profile.activeAppIcon = itemId
        }

        data.profile = SwimCoinStore.sanitizeProfileCosmetics(
            data.profile,
            storeUnlocks: data.storeUnlocks
        )
        persist(immediate: true)
        return true
    }

    func updateCheats(_ updates: (inout SwimCheats) -> Void) {
        updates(&cheats)
        SwimCheatsService.save(cheats)
    }

    func processSelectedPhoto() async {
        guard let selectedPhotoItem else { return }
        isProcessingOCR = true
        ocrErrorMessage = nil
        defer { isProcessingOCR = false }

        do {
            guard let photoData = try await selectedPhotoItem.loadTransferable(type: Data.self),
                  let image = UIImage(data: photoData) else {
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

    func saveUploadDraft(ignoreDuplicate: Bool = false) -> Bool {
        if !ignoreDuplicate {
            let metrics = uploadDraft.toMetrics()
            let candidate = SwimSession(date: uploadDraft.resolvedDate, metrics: metrics)
            if let duplicate = SwimDuplicates.findDuplicateSession(sessions, candidate: candidate) {
                duplicateSession = duplicate
                return false
            }
        }

        guard prepareUploadSave() else { return false }

        let metrics = uploadDraft.toMetrics()
        let date = uploadDraft.resolvedDate
        let coinResult = lastUploadCoinResult ?? UploadCoinResult(
            sessionCoins: 0, medalCoins: 0, monthlyCoins: 0, total: 0,
            sessionLines: [], bonusLines: [], alreadyClaimed: false
        )

        let saved = addSession(
            date: date,
            metrics: metrics,
            coinsEarned: coinResult.sessionCoins,
            coinBonus: coinResult.medalCoins + coinResult.monthlyCoins
        )

        lastUploadFeedback = SwimAnalysis.buildPersonalFeedback(
            session: saved,
            allSessions: sessions,
            profile: profile
        )
        isEnhancingUploadFeedback = !profile.aiApiKey.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        Task { await enhanceUploadFeedback(for: saved) }

        lastUploadCoinResult = coinResult
        // Keep lastNewMedals for celebration sheet; clear draft state separately via clearUploadDraft()
        parsedResult = nil
        selectedPhotoItem = nil
        duplicateSession = nil
        return true
    }

    func clearUploadDraft() {
        uploadDraft = .empty
        parsedResult = nil
        selectedPhotoItem = nil
        ocrErrorMessage = nil
        duplicateSession = nil
    }

    func clearUploadCelebrationState() {
        lastUploadCoinResult = nil
        lastNewMedals = []
        lastUploadFeedback = nil
        isEnhancingUploadFeedback = false
    }

    func validateThemeSelection(preferences: UserPreferencesService) {
        let unlocked = SwimCoinStore.isThemeUnlocked(
            preferences.themeCode,
            storeUnlocks: storeUnlocks,
            allThemesUnlocked: cheats.allThemesUnlocked
        ) || preferences.themeCode == AppThemes.defaultCode
        if !unlocked {
            preferences.setTheme(AppThemes.defaultCode)
        }
    }

    private func enhanceUploadFeedback(for session: SwimSession) async {
        defer { isEnhancingUploadFeedback = false }
        guard !profile.aiApiKey.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
              var feedback = lastUploadFeedback else { return }
        let language = currentLanguageCode()
        do {
            let ai = try await AiCoachService.fetchFeedback(
                apiKey: profile.aiApiKey,
                language: language,
                profile: profile,
                session: session,
                sessions: sessions,
                localFeedback: feedback,
                mascotId: mascotId
            )
            feedback.coachMessage = ai.coachMessage
            feedback.motivation = ai.motivation
            feedback.aiEnhanced = ai.aiEnhanced
            lastUploadFeedback = feedback
        } catch {
            // Keep local feedback when AI is unavailable.
        }
    }

    private func currentLanguageCode() -> String {
        if let data = UserDefaults.standard.data(forKey: UserPreferencesService.languageKey),
           let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let language = json["language"] as? String {
            return language
        }
        return TranslationService.defaultLanguage
    }

    private func prepareUploadSave() -> Bool {
        let metrics = uploadDraft.toMetrics()
        let date = uploadDraft.resolvedDate
        let candidate = SwimSession(date: date, metrics: metrics)
        let sessionsBefore = sessions
        let mascot = mascotId
        let intensity = MascotConstants.gameplay(mascot).challengeIntensity
        let monthKey = String(date.prefix(7))

        if let penalty = SwimMonthlyChallenges.getMonthlyShortfallPenalty(
            sessions: sessionsBefore,
            uploadMonthKey: monthKey,
            mascotId: mascot,
            rerolls: monthlyChallengeRerolls,
            settledMonths: monthlySettlements
        ) {
            applyMonthlySettlement(monthKey: penalty.monthKey, coins: penalty.coins, mascotId: penalty.mascotId)
        }

        let sessionsAfter = sessionsBefore + [candidate]
        let newMedals = SwimMedals.getNewlyEarnedMedals(
            sessionsBefore: sessionsBefore,
            sessionsAfter: sessionsAfter,
            allMedalsUnlocked: cheats.allMedalsUnlocked
        )
        let coinResult = SwimCoins.calculateUploadCoins(
            session: candidate,
            sessionsBefore: sessionsBefore,
            sessionsAfter: sessionsAfter,
            newMedals: newMedals,
            spentCoinClaims: spentCoinClaims,
            mascotId: mascot,
            monthKey: monthKey,
            rerolls: monthlyChallengeRerolls,
            intensity: intensity
        )

        lastUploadCoinResult = coinResult
        lastNewMedals = newMedals
        return true
    }

    private func persist(immediate: Bool = false) {
        if immediate {
            SwimStorageService.save(data)
            return
        }
        saveTask?.cancel()
        saveTask = Task {
            try? await Task.sleep(nanoseconds: 500_000_000)
            guard !Task.isCancelled else { return }
            SwimStorageService.save(data)
        }
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
        date: "", duration: "", distance: "", pace: "",
        activeKcal: "", totalKcal: "", avgHeartRate: "",
        laps: "", poolLength: "25", goal: "", location: "", timeRange: ""
    )

    var resolvedDate: String {
        if !date.isEmpty { return date }
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: Date())
    }

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
