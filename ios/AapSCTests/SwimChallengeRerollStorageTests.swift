import XCTest
@testable import AapSC

final class SwimChallengeRerollStorageTests: XCTestCase {
    private let monthKey = "2025-06"

    func testUsesFreeMonthlyRerollWithoutSpendingCredits() {
        let result = SwimMonthlyChallenges.applyMonthlyChallengeReroll(
            data: TestFixtures.baseData(),
            monthKey: monthKey,
            tierIndex: 0,
            mascotId: "flip"
        )
        XCTAssertNotNil(result)
        XCTAssertEqual(result?.challengeRerollCredits, 0)
        XCTAssertEqual(result?.monthlyChallengeRerolls[monthKey]?.freeUses, 1)
        XCTAssertNotNil(result?.monthlyChallengeRerolls[monthKey]?.overrides["0"])
    }

    func testSpendsOneCreditForSecondRerollInSameMonth() {
        var afterFree = SwimMonthlyChallenges.applyMonthlyChallengeReroll(
            data: TestFixtures.baseData(),
            monthKey: monthKey,
            tierIndex: 0,
            mascotId: "flip"
        )!
        afterFree.challengeRerollCredits = 1
        let result = SwimMonthlyChallenges.applyMonthlyChallengeReroll(
            data: afterFree,
            monthKey: monthKey,
            tierIndex: 1,
            mascotId: "flip"
        )
        XCTAssertNotNil(result)
        XCTAssertEqual(result?.challengeRerollCredits, 0)
        XCTAssertEqual(result?.monthlyChallengeRerolls[monthKey]?.freeUses, 1)
        XCTAssertNotNil(result?.monthlyChallengeRerolls[monthKey]?.overrides["1"])
    }

    func testBlocksPaidRerollWhenNoCreditsRemain() {
        let afterFree = SwimMonthlyChallenges.applyMonthlyChallengeReroll(
            data: TestFixtures.baseData(),
            monthKey: monthKey,
            tierIndex: 0,
            mascotId: "flip"
        )!
        let result = SwimMonthlyChallenges.applyMonthlyChallengeReroll(
            data: afterFree,
            monthKey: monthKey,
            tierIndex: 1,
            mascotId: "flip"
        )
        XCTAssertNil(result)
    }

    func testGivesFinsSwimmersTwoFreeRerollsPerMonth() {
        var data = TestFixtures.baseData()
        data.profile.mascotId = "fins"
        data.sessions = [TestFixtures.makeSession(date: "2025-05-01", paceSecPer100m: 95)]

        let first = SwimMonthlyChallenges.applyMonthlyChallengeReroll(data: data, monthKey: monthKey, tierIndex: 0, mascotId: "fins")
        XCTAssertNotNil(first)
        XCTAssertEqual(first?.monthlyChallengeRerolls[monthKey]?.freeUses, 1)

        let second = SwimMonthlyChallenges.applyMonthlyChallengeReroll(data: first!, monthKey: monthKey, tierIndex: 1, mascotId: "fins")
        XCTAssertNotNil(second)
        XCTAssertEqual(second?.challengeRerollCredits, 0)
        XCTAssertEqual(second?.monthlyChallengeRerolls[monthKey]?.freeUses, 2)

        let third = SwimMonthlyChallenges.applyMonthlyChallengeReroll(data: second!, monthKey: monthKey, tierIndex: 2, mascotId: "fins")
        XCTAssertNil(third)
    }

    func testGrantsRerollCreditWhenPurchasingStoreConsumable() {
        let result = SwimCoinStore.applyConsumableStorePurchase(
            data: TestFixtures.baseData(),
            itemId: SwimCoinStore.challengeRerollStoreItemId
        )
        XCTAssertNotNil(result)
        XCTAssertEqual(result?.challengeRerollCredits, 1)
        XCTAssertEqual(result?.totalCoins, 500)
        XCTAssertEqual(result?.coinsSpent, 500)
    }

    func testGrantsBonusSpinCreditWhenPurchasingWheelConsumable() {
        let result = SwimCoinStore.applyConsumableStorePurchase(
            data: TestFixtures.baseData(),
            itemId: SwimCoinStore.bonusWheelSpinStoreItemId
        )
        XCTAssertNotNil(result)
        XCTAssertEqual(result?.bonusWheelSpinCredits, 1)
        XCTAssertEqual(result?.totalCoins, 650)
        XCTAssertEqual(result?.coinsSpent, 350)
    }

    func testRejectsConsumablePurchaseWhenCoinsAreInsufficient() {
        var poor = TestFixtures.baseData(totalCoins: 100)
        let before = poor
        let result = SwimCoinStore.applyConsumableStorePurchase(
            data: poor,
            itemId: SwimCoinStore.challengeRerollStoreItemId
        )
        XCTAssertNil(result)
        XCTAssertEqual(poor, before)
    }
}
