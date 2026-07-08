import XCTest
@testable import AapSC

final class SwimCoinsTests: XCTestCase {
    func testRewardsLongerAndHarderSessions() {
        let short = SwimCoins.calculateSessionCoins(
            TestFixtures.session(date: "2025-06-01", metrics: TestFixtures.metrics(distanceM: 500, durationSec: 600, activeKcal: 100))
        )
        let long = SwimCoins.calculateSessionCoins(
            TestFixtures.session(date: "2025-06-02", metrics: TestFixtures.metrics(distanceM: 4000, durationSec: 3600, activeKcal: 700))
        )
        XCTAssertGreaterThan(long, short)
    }

    func testBonusesFasterPaceVsPriorAverage() {
        let prior = [TestFixtures.session(date: "2025-05-01", metrics: TestFixtures.metrics(paceSecPer100m: 140))]
        let faster = SwimCoins.calculateSessionCoins(
            TestFixtures.session(date: "2025-06-01", metrics: TestFixtures.metrics(paceSecPer100m: 120, distanceM: 2000)),
            priorSessions: prior
        )
        let slower = SwimCoins.calculateSessionCoins(
            TestFixtures.session(date: "2025-06-02", metrics: TestFixtures.metrics(paceSecPer100m: 150, distanceM: 2000)),
            priorSessions: prior
        )
        XCTAssertGreaterThan(faster, slower)
    }

    func testCombinesSessionMedalAndMonthlyCoinsOnUpload() {
        let session = TestFixtures.session(
            date: "2025-06-01",
            metrics: TestFixtures.metrics(distanceM: 3000, durationSec: 2400, activeKcal: 500)
        )
        let before: [SwimSession] = []
        let after = [session]
        let breakdown = SwimCoins.calculateUploadCoins(
            session: session,
            sessionsBefore: before,
            sessionsAfter: after,
            newMedals: [EvaluatedMedal(id: "ten_sessions", category: "milestone", tier: "bronze", season: nil, earned: true, earnedAt: nil, periods: [], progress: nil)],
            spentCoinClaims: []
        )
        XCTAssertEqual(breakdown.medalCoins, SwimCoins.medalTierCoins("bronze"))
        XCTAssertEqual(breakdown.total, breakdown.sessionCoins + breakdown.medalCoins + breakdown.monthlyCoins)
        XCTAssertFalse(breakdown.sessionLines.isEmpty)
        XCTAssertEqual(breakdown.bonusLines.count, 1)
    }

    func testAddsFinsBonusOnTopOfPaceImprovementWhenFinsIsCoach() {
        let prior = [TestFixtures.session(date: "2025-05-01", metrics: TestFixtures.metrics(paceSecPer100m: 140))]
        let improved = TestFixtures.session(date: "2025-06-01", metrics: TestFixtures.metrics(paceSecPer100m: 120, distanceM: 2000))
        let withFins = SwimCoins.calculateSessionCoinBreakdown(improved, priorSessions: prior, mascotId: "fins")
        let withFlip = SwimCoins.calculateSessionCoinBreakdown(improved, priorSessions: prior, mascotId: "flip")
        XCTAssertTrue(withFins.lines.contains { $0.type == "finsBonus" })
        XCTAssertFalse(withFlip.lines.contains { $0.type == "finsBonus" })
        XCTAssertGreaterThan(withFins.sessionCoins, withFlip.sessionCoins)

        let slower = SwimCoins.calculateSessionCoinBreakdown(
            TestFixtures.session(date: "2025-06-02", metrics: TestFixtures.metrics(paceSecPer100m: 150, distanceM: 2000)),
            priorSessions: prior,
            mascotId: "fins"
        )
        XCTAssertFalse(slower.lines.contains { $0.type == "finsBonus" })
    }

    func testHalvesSessionCoinsForFlipButNeverBelowFloor() {
        let swim = TestFixtures.session(date: "2025-06-01", metrics: TestFixtures.metrics(distanceM: 3000, durationSec: 2400, activeKcal: 500))
        let withFlip = SwimCoins.calculateSessionCoinBreakdown(swim, mascotId: "flip")
        let withFlo = SwimCoins.calculateSessionCoinBreakdown(swim, mascotId: "flo")
        XCTAssertLessThan(withFlip.sessionCoins, withFlo.sessionCoins)
        XCTAssertTrue(withFlip.lines.contains { $0.type == "coachShare" && $0.coins < 0 })
        XCTAssertGreaterThanOrEqual(withFlip.sessionCoins, 3)
        XCTAssertFalse(withFlo.lines.contains { $0.type == "coachShare" })
    }

    func testDocksCoinsWithFinsWhenSwimmingBelowAveragePace() {
        let prior = [TestFixtures.session(date: "2025-05-01", metrics: TestFixtures.metrics(paceSecPer100m: 120))]
        let slowSwim = TestFixtures.session(date: "2025-06-01", metrics: TestFixtures.metrics(paceSecPer100m: 180, distanceM: 1000))
        let withFins = SwimCoins.calculateSessionCoinBreakdown(slowSwim, priorSessions: prior, mascotId: "fins")
        let withFlo = SwimCoins.calculateSessionCoinBreakdown(slowSwim, priorSessions: prior, mascotId: "flo")
        let withFlip = SwimCoins.calculateSessionCoinBreakdown(slowSwim, priorSessions: prior, mascotId: "flip")
        XCTAssertTrue(withFins.lines.contains { $0.type == "finsPenalty" && $0.coins < 0 })
        XCTAssertLessThan(withFins.sessionCoins, withFlo.sessionCoins)
        XCTAssertFalse(withFlo.lines.contains { $0.type == "finsPenalty" })
        XCTAssertGreaterThanOrEqual(withFlip.sessionCoins, 3)
    }

    func testChargesMonthlyShortfallPenaltyPerCoachRequirement() {
        let sessions = [TestFixtures.session(date: "2025-05-15", metrics: TestFixtures.metrics(distanceM: 500))]
        let floPenalty = SwimMonthlyChallenges.getMonthlyShortfallPenalty(
            sessions: sessions,
            uploadMonthKey: "2025-06",
            mascotId: "flo",
            rerolls: [:],
            settledMonths: [:]
        )
        XCTAssertNotNil(floPenalty)
        XCTAssertEqual(floPenalty?.monthKey, "2025-05")
        XCTAssertEqual(floPenalty?.requiredTier, "silver")
        XCTAssertGreaterThan(floPenalty?.coins ?? 0, 0)

        XCTAssertNil(SwimMonthlyChallenges.getMonthlyShortfallPenalty(
            sessions: sessions,
            uploadMonthKey: "2025-06",
            mascotId: "flip",
            rerolls: [:],
            settledMonths: [:]
        ))

        XCTAssertNil(SwimMonthlyChallenges.getMonthlyShortfallPenalty(
            sessions: sessions,
            uploadMonthKey: "2025-06",
            mascotId: "flo",
            rerolls: [:],
            settledMonths: ["2025-05": MonthlySettlement(coins: 40, mascotId: "flo", appliedAt: "2025-06-01")]
        ))

        XCTAssertNil(SwimMonthlyChallenges.getMonthlyShortfallPenalty(
            sessions: [],
            uploadMonthKey: "2025-06",
            mascotId: "fins",
            rerolls: [:],
            settledMonths: [:]
        ))

        let finsPenalty = SwimMonthlyChallenges.getMonthlyShortfallPenalty(
            sessions: sessions,
            uploadMonthKey: "2025-06",
            mascotId: "fins",
            rerolls: [:],
            settledMonths: [:]
        )
        XCTAssertNotNil(finsPenalty)
        XCTAssertEqual(finsPenalty?.requiredTier, "gold")
        XCTAssertGreaterThan(finsPenalty?.coins ?? 0, floPenalty?.coins ?? 0)
    }

    func testReturnsSessionLineItemsThatExplainReward() {
        let breakdown = SwimCoins.calculateSessionCoinBreakdown(
            TestFixtures.session(date: "2025-06-01", metrics: TestFixtures.metrics(distanceM: 3000, durationSec: 3600, activeKcal: 500, paceSecPer100m: 120)),
            priorSessions: [TestFixtures.session(date: "2025-05-01", metrics: TestFixtures.metrics(paceSecPer100m: 140))]
        )
        let lineSum = breakdown.lines.reduce(0) { $0 + $1.coins }
        XCTAssertEqual(breakdown.sessionCoins, lineSum)
        XCTAssertTrue(breakdown.lines.contains { $0.type == "longDistance3k" })
        XCTAssertTrue(breakdown.lines.contains { $0.type == "paceImprovement" })
    }

    func testMigratesLegacySessionsWithCoinsEarned() {
        let migrated = SwimCoins.migrateSessionCoins([
            TestFixtures.session(date: "2025-06-01", metrics: TestFixtures.metrics(distanceM: 2500, durationSec: 1800, activeKcal: 400))
        ])
        XCTAssertGreaterThanOrEqual(migrated[0].coinsEarned ?? 0, 5)
    }

    func testBlocksCoinsWhenWorkoutWasPreviouslyClaimed() {
        let pending = TestFixtures.session(date: "2025-06-01", metrics: TestFixtures.metrics(distanceM: 3000, durationSec: 2400, activeKcal: 500))
        let claims = [
            SpentCoinClaim(
                date: pending.date,
                metrics: ClaimMetrics(
                    distanceM: pending.metrics.distanceM,
                    durationSec: pending.metrics.durationSec,
                    paceSecPer100m: nil,
                    timeRange: ""
                )
            )
        ]
        let breakdown = SwimCoins.calculateUploadCoins(
            session: pending,
            sessionsBefore: [],
            sessionsAfter: [pending],
            newMedals: [EvaluatedMedal(id: "ten_sessions", category: "milestone", tier: "bronze", season: nil, earned: true, earnedAt: nil, periods: [], progress: nil)],
            spentCoinClaims: claims
        )
        XCTAssertEqual(breakdown.total, 0)
        XCTAssertTrue(breakdown.alreadyClaimed)
    }

    func testSumSessionCoinsIncludesSessionAndMedalBonuses() {
        let total = SwimCoins.sumSessionCoins([
            TestFixtures.session(date: "a", metrics: .empty, coinsEarned: 20, coinBonus: 25),
            TestFixtures.session(date: "b", metrics: .empty, coinsEarned: 15, coinBonus: 60)
        ])
        XCTAssertEqual(
            total,
            SwimCoinClaims.sessionTotalCoins(TestFixtures.session(date: "a", metrics: .empty, coinsEarned: 20, coinBonus: 25))
                + SwimCoinClaims.sessionTotalCoins(TestFixtures.session(date: "b", metrics: .empty, coinsEarned: 15, coinBonus: 60))
        )
    }

    func testReconcileTotalCoinsRestoresWalletWhenStoredTotalWasTooLow() {
        let sessions = [TestFixtures.session(date: "a", metrics: .empty, coinsEarned: 20, coinBonus: 649)]
        XCTAssertEqual(SwimCoins.reconcileTotalCoins(sessions: sessions, storedTotal: 67), 669)
        XCTAssertEqual(SwimCoins.reconcileTotalCoins(sessions: sessions, storedTotal: 669), 669)
    }

    func testReconcileTotalCoinsPreservesStoreAndWheelSpendingAfterReload() {
        let sessions = [TestFixtures.session(date: "a", metrics: .empty, coinsEarned: 1000, coinBonus: 0)]
        XCTAssertEqual(SwimCoins.reconcileTotalCoins(sessions: sessions, storedTotal: 500, coinsSpent: 500), 500)
        XCTAssertEqual(SwimCoins.reconcileTotalCoins(sessions: sessions, storedTotal: 1000, coinsSpent: 500), 500)
    }

    func testMigrateCoinBonusesBackfillsMedalBonusesOnLegacySessions() {
        let sessions = SwimCoins.migrateCoinBonuses((1...10).map { index in
            TestFixtures.session(
                id: String(index),
                date: String(format: "2025-%02d-01", index),
                metrics: TestFixtures.metrics(distanceM: 1000, durationSec: 900),
                coinsEarned: 15
            )
        })
        let tenth = sessions.first { $0.id == "10" }
        XCTAssertGreaterThanOrEqual(tenth?.coinBonus ?? 0, SwimCoins.medalTierCoins("silver"))
        XCTAssertGreaterThan(SwimCoins.sumSessionCoins(sessions), 15 * 10)
    }
}
