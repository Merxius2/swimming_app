import Foundation

enum SwimStorageService {
    static let storageKey = "AUDIT_SWIM_DATA"

    static func load() -> SwimData {
        guard let raw = UserDefaults.standard.data(forKey: storageKey) else {
            return .empty
        }
        do {
            let parsed = try JSONDecoder().decode(SwimData.self, from: raw)
            return migrate(parsed)
        } catch {
            return .empty
        }
    }

    static func save(_ data: SwimData) {
        do {
            let encoded = try JSONEncoder().encode(data)
            UserDefaults.standard.set(encoded, forKey: storageKey)
        } catch {
            print("Failed to save swim data: \(error)")
        }
    }

    static func clear() {
        UserDefaults.standard.removeObject(forKey: storageKey)
    }

    static func createSessionId() -> String {
        UUID().uuidString
    }

    static func normalize(_ data: SwimData) -> SwimData {
        migrate(data)
    }

    private static func migrate(_ data: SwimData) -> SwimData {
        var next = data
        let sessions = SwimCoins.migrateSessionCoins(next.sessions)
        next.sessions = sessions.sorted { $0.date < $1.date }

        let rawStoreUnlocks = SwimCoinStore.normalizeStoreUnlocks(next.storeUnlocks)
        next.bonusWheelSpinCredits = SwimCoinStore.normalizeBonusWheelSpinCredits(
            next.bonusWheelSpinCredits,
            storeUnlocks: rawStoreUnlocks
        )
        next.storeUnlocks = SwimCoinStore.stripBonusSpinUnlock(rawStoreUnlocks)
        next.coinsSpent = SwimCoinStore.migrateCoinsSpent(next.coinsSpent, storeUnlocks: next.storeUnlocks)
        next.totalCoins = SwimCoins.reconcileTotalCoins(
            sessions: next.sessions,
            storedTotal: next.totalCoins,
            coinsSpent: next.coinsSpent
        )
        next.wheelSpins = SwimWheelSpins.normalizeWheelSpins(next.wheelSpins)
        next.challengeRerollCredits = max(0, next.challengeRerollCredits)
        next.profile = SwimCoinStore.sanitizeProfileCosmetics(next.profile, storeUnlocks: next.storeUnlocks)
        next.monthlyChallengeRerolls = SwimMonthlyChallenges.normalizeMonthlyChallengeRerolls(
            next.monthlyChallengeRerolls
        )
        return next
    }
}
