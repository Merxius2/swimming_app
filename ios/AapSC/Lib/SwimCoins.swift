import Foundation

enum SwimCoins {
    static func calculateSessionCoins(_ session: SwimSession, priorSessions: [SwimSession]) -> Int {
        let metrics = session.metrics
        var coins = 8

        if let distance = metrics.distanceM {
            coins += distance / 500
        }
        if let duration = metrics.durationSec {
            coins += duration / 900
        }
        if let kcal = metrics.activeKcal {
            coins += kcal / 100
        }
        if (metrics.distanceM ?? 0) >= 3000 { coins += 10 }
        if (metrics.distanceM ?? 0) >= 5000 { coins += 15 }
        if (metrics.durationSec ?? 0) >= 3600 { coins += 8 }

        let priorPaces = priorSessions.compactMap(\.metrics.paceSecPer100m).filter { $0 > 0 }
        if let pace = metrics.paceSecPer100m, !priorPaces.isEmpty {
            let avgPace = priorPaces.reduce(0, +) / priorPaces.count
            if pace < avgPace {
                coins += min(20, (avgPace - pace) / 3)
            }
        }

        return coins
    }

    static func reconcileTotalCoins(sessions: [SwimSession], storedTotal: Int, coinsSpent: Int) -> Int {
        let earned = sessions.compactMap(\.sessionCoins).reduce(0, +)
        if earned > 0 {
            return max(0, earned - coinsSpent)
        }
        return max(0, storedTotal)
    }
}
