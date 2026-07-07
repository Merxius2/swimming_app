import Foundation

enum SwimStorageService {
    static let storageKey = "AUDIT_SWIM_DATA"

    static func load() -> SwimData {
        guard let data = UserDefaults.standard.data(forKey: storageKey) else {
            return .empty
        }
        do {
            let decoded = try JSONDecoder().decode(SwimData.self, from: data)
            return migrate(decoded)
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

    private static func migrate(_ data: SwimData) -> SwimData {
        var next = data
        next.totalCoins = SwimCoins.reconcileTotalCoins(
            sessions: next.sessions,
            storedTotal: next.totalCoins,
            coinsSpent: next.coinsSpent
        )
        return next
    }
}
