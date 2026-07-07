import Foundation

enum SwimCoinClaims {
    static func sessionTotalCoins(_ session: SwimSession) -> Int {
        (session.coinsEarned ?? 0) + (session.coinBonus ?? 0)
    }

    static func createCoinClaim(_ session: SwimSession) -> SpentCoinClaim {
        SpentCoinClaim(
            date: session.date,
            metrics: ClaimMetrics(
                distanceM: session.metrics.distanceM,
                durationSec: session.metrics.durationSec,
                paceSecPer100m: session.metrics.paceSecPer100m,
                timeRange: session.metrics.timeRange
            )
        )
    }

    static func findSpentCoinClaim(_ claims: [SpentCoinClaim], candidate: SwimSession) -> SpentCoinClaim? {
        guard !claims.isEmpty else { return nil }
        return claims.first { SwimDuplicates.coreMetricsMatch($0, candidate) }
    }
}
