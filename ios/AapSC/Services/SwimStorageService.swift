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

    private static func migrate(_ data: SwimData) -> SwimData {
        var next = data
        let sessions = SwimCoins.migrateSessionCoins(next.sessions)
        next.sessions = sessions.sorted { $0.date < $1.date }
        next.totalCoins = SwimCoins.reconcileTotalCoins(
            sessions: next.sessions,
            storedTotal: next.totalCoins,
            coinsSpent: next.coinsSpent
        )
        next.monthlyChallengeRerolls = SwimMonthlyChallenges.normalizeMonthlyChallengeRerolls(
            next.monthlyChallengeRerolls
        )
        return next
    }
}
