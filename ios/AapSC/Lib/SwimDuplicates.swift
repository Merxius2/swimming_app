import Foundation

enum SwimDuplicates {
    static let paceToleranceSec = 5

    static func coreMetricsMatch(_ a: SwimSession, _ b: SwimSession) -> Bool {
        guard a.date == b.date else { return false }
        return coreMetricsMatch(date: a.date, metricsA: a.metrics, metricsB: b.metrics)
    }

    static func coreMetricsMatch(_ claim: SpentCoinClaim, _ candidate: SwimSession) -> Bool {
        guard claim.date == candidate.date else { return false }
        let claimMetrics = SwimMetrics(
            durationSec: claim.metrics.durationSec,
            distanceM: claim.metrics.distanceM,
            activeKcal: nil,
            totalKcal: nil,
            paceSecPer100m: claim.metrics.paceSecPer100m,
            avgHeartRate: nil,
            laps: nil,
            poolLengthM: 25,
            goalM: nil,
            location: "",
            timeRange: claim.metrics.timeRange,
            strokes: .empty
        )
        return coreMetricsMatch(date: claim.date, metricsA: claimMetrics, metricsB: candidate.metrics)
    }

    static func findDuplicateSession(
        _ sessions: [SwimSession],
        candidate: SwimSession,
        excludeId: String? = nil
    ) -> SwimSession? {
        guard !candidate.date.isEmpty, !sessions.isEmpty else { return nil }
        if let workoutUUID = candidate.healthKitWorkoutUUID,
           let match = sessions.first(where: { session in
               session.id != excludeId && session.healthKitWorkoutUUID == workoutUUID
           }) {
            return match
        }
        return sessions.first { session in
            session.id != excludeId && coreMetricsMatch(candidate, session)
        }
    }

    private static func coreMetricsMatch(date: String, metricsA: SwimMetrics, metricsB: SwimMetrics) -> Bool {
        guard metricsA.distanceM != nil, metricsB.distanceM != nil else { return false }
        guard metricsA.durationSec != nil, metricsB.durationSec != nil else { return false }
        guard metricsA.distanceM == metricsB.distanceM else { return false }
        guard metricsA.durationSec == metricsB.durationSec else { return false }

        if let paceA = metricsA.paceSecPer100m, let paceB = metricsB.paceSecPer100m {
            if abs(paceA - paceB) > paceToleranceSec { return false }
        }

        if !metricsA.timeRange.isEmpty, !metricsB.timeRange.isEmpty,
           metricsA.timeRange != metricsB.timeRange {
            return false
        }

        return true
    }
}
