import XCTest
@testable import AapSC

final class SwimWheelSpinsTests: XCTestCase {
    private let today = "2026-06-13"
    private let yesterday = "2026-06-12"

    func testResetsPaidCountOnNewDay() {
        XCTAssertEqual(
            SwimWheelSpins.normalizeWheelSpins(WheelSpins(date: yesterday, paidCount: 3), today: today).paidCount,
            0
        )
        XCTAssertEqual(
            SwimWheelSpins.normalizeWheelSpins(WheelSpins(date: yesterday, paidCount: 3), today: today).date,
            today
        )
    }

    func testTracksUpToDailyPaidSpinLimit() {
        var state: WheelSpins? = nil
        for _ in 0..<SwimWheelSpins.dailyPaidSpinLimit {
            XCTAssertTrue(SwimWheelSpins.canUsePaidSpin(state, today: today))
            state = SwimWheelSpins.recordPaidSpin(state, today: today)
        }
        XCTAssertEqual(SwimWheelSpins.getPaidSpinsRemaining(state, today: today), 0)
        XCTAssertFalse(SwimWheelSpins.canUsePaidSpin(state, today: today))
    }

    func testCanStartWheelSpinAllowsFreeSpinsAfterPaidLimit() {
        let exhausted = WheelSpins(date: today, paidCount: SwimWheelSpins.dailyPaidSpinLimit)
        XCTAssertFalse(SwimWheelSpins.canStartWheelSpin(totalCoins: 0, bet: 10, freeSpins: 0, wheelSpins: exhausted, today: today))
        XCTAssertTrue(SwimWheelSpins.canStartWheelSpin(totalCoins: 0, bet: 10, freeSpins: 1, wheelSpins: exhausted, today: today))
    }

    func testCanStartWheelSpinRequiresCoinsForPaidSpins() {
        XCTAssertFalse(SwimWheelSpins.canStartWheelSpin(totalCoins: 5, bet: 10, freeSpins: 0, wheelSpins: nil, today: today))
        XCTAssertTrue(SwimWheelSpins.canStartWheelSpin(totalCoins: 10, bet: 10, freeSpins: 0, wheelSpins: nil, today: today))
    }
}
