import XCTest
@testable import AapSC

final class SwimCoinClaimsTests: XCTestCase {
    func testSumsSessionAndBonusCoins() {
        let swim = TestFixtures.session(
            date: "2025-06-01",
            metrics: .empty,
            coinsEarned: 20,
            coinBonus: 25
        )
        XCTAssertEqual(SwimCoinClaims.sessionTotalCoins(swim), 45)
    }

    func testMatchesDeletedSessionFingerprints() {
        let swim = TestFixtures.session(
            id: "1",
            date: "2025-06-03",
            metrics: TestFixtures.metrics(
                durationSec: 3267,
                distanceM: 2550,
                paceSecPer100m: 130,
                timeRange: "11:07-12:01"
            ),
            coinsEarned: 30
        )
        let claim = SwimCoinClaims.createCoinClaim(swim)
        let candidate = TestFixtures.session(
            id: "2",
            date: "2025-06-03",
            metrics: TestFixtures.metrics(durationSec: 3267, distanceM: 2550, paceSecPer100m: 133)
        )
        XCTAssertNotNil(SwimCoinClaims.findSpentCoinClaim([claim], candidate: candidate))
    }

    func testDoesNotMatchDifferentWorkouts() {
        let swim = TestFixtures.session(
            id: "1",
            date: "2025-06-03",
            metrics: TestFixtures.metrics(durationSec: 3267, distanceM: 2550)
        )
        let claim = SwimCoinClaims.createCoinClaim(swim)
        let candidate = TestFixtures.session(
            id: "2",
            date: "2025-06-03",
            metrics: TestFixtures.metrics(durationSec: 3267, distanceM: 2000)
        )
        XCTAssertNil(SwimCoinClaims.findSpentCoinClaim([claim], candidate: candidate))
    }
}
