import XCTest
@testable import AapSC

final class SwimWheelTests: XCTestCase {
    func testNothingCombinedShareIsAtLeast50PercentAndShrinksSlightlyOnHighBets() {
        XCTAssertEqual(SwimWheel.nothingCombinedShare(bet: 100), SwimWheel.minNothingShare, accuracy: 0.0001)
        XCTAssertGreaterThan(SwimWheel.nothingCombinedShare(bet: 1), SwimWheel.nothingCombinedShare(bet: 100))
        XCTAssertGreaterThanOrEqual(SwimWheel.nothingCombinedShare(bet: 1), SwimWheel.minNothingShare)
    }

    func testBuildWheelLayoutGivesNothingAtLeastHalfTheWheel() {
        for bet in [1, 10, 100] {
            let layout = SwimWheel.buildWheelLayout(bet: bet)
            let nothingSweep = SwimWheel.combinedNothingSweepDeg(layout)
            XCTAssertGreaterThanOrEqual(nothingSweep, 180 - 0.01, "bet \(bet): nothing sweep \(nothingSweep)")
            let total = layout.segments.reduce(0.0) { $0 + $1.sweepDeg }
            XCTAssertLessThan(abs(total - 360), 0.01)
        }
    }

    func testBuildWheelLayoutMakes5xSmallestWinSliceAndAlwaysLabelable() {
        let layout = SwimWheel.buildWheelLayout(bet: 100)
        let coins5 = layout.segments.first { $0.id == "coins-5" }
        let coins2 = layout.segments.first { $0.id == "coins-2" }
        XCTAssertLessThan(coins5?.sweepDeg ?? 0, coins2?.sweepDeg ?? 0)
        XCTAssertLessThan(coins5?.sweepDeg ?? 0, 15)
        XCTAssertTrue(SwimWheel.segmentShouldShowLabel(coins5!))
        XCTAssertTrue(SwimWheel.segmentUsesRadialLabel(coins5!))
    }

    func testPickRandomSegmentIndexStaysInRange() {
        let layout = SwimWheel.buildWheelLayout(bet: 10)
        for _ in 0..<50 {
            let idx = SwimWheel.pickRandomSegmentIndex(layout)
            XCTAssertGreaterThanOrEqual(idx, 0)
            XCTAssertLessThan(idx, SwimWheel.segmentDefs.count)
        }
    }

    func testGetSpinRotationIncreasesMonotonically() {
        let layout = SwimWheel.buildWheelLayout(bet: 10)
        let r1 = SwimWheel.getSpinRotation(segmentIndex: 0, layout: layout, currentRotation: 0)
        let r2 = SwimWheel.getSpinRotation(segmentIndex: 3, layout: layout, currentRotation: r1)
        XCTAssertGreaterThan(r2, r1)
    }

    func testResolveWheelOutcomeCoinsPaysBetTimesMultiplier() {
        let seg = SwimWheel.segmentDefs.first { $0.id == "coins-3" }
        let layout = SwimWheel.buildWheelLayout(bet: 10)
        let layoutSeg = layout.segments.first { $0.id == "coins-3" }
        let outcome = SwimWheel.resolveWheelOutcome(segment: layoutSeg, bet: 10)
        XCTAssertEqual(outcome.type, "coins")
        XCTAssertEqual(outcome.multiplier, 3)
        XCTAssertEqual(outcome.coinsDelta, 30)
        XCTAssertNotNil(seg)
    }

    func testResolveWheelOutcomeFreeSpinRefundsBetAndGrantsSpins() {
        let layout = SwimWheel.buildWheelLayout(bet: 100)
        let seg = layout.segments.first { $0.id == "free" }
        XCTAssertEqual(SwimWheel.resolveWheelOutcome(segment: seg, bet: 100).coinsDelta, 100)
        XCTAssertEqual(SwimWheel.resolveWheelOutcome(segment: seg, bet: 100).freeSpinsGranted, 1)
        XCTAssertEqual(SwimWheel.resolveWheelOutcome(segment: seg, bet: 100, usedFreeSpin: true).coinsDelta, 0)
    }

    func testResolveWheelOutcome2xFreeSpinGrantsTwoSpins() {
        let layout = SwimWheel.buildWheelLayout(bet: 10)
        let seg = layout.segments.first { $0.id == "free-2" }
        let outcome = SwimWheel.resolveWheelOutcome(segment: seg, bet: 10)
        XCTAssertEqual(outcome.coinsDelta, 20)
        XCTAssertEqual(outcome.freeSpinsGranted, 2)
    }

    func testResolveWheelOutcomeNothingLosesBet() {
        let layout = SwimWheel.buildWheelLayout(bet: 10)
        let seg = layout.segments.first { $0.id == "nothing-1" }
        let outcome = SwimWheel.resolveWheelOutcome(segment: seg, bet: 10)
        XCTAssertEqual(outcome.type, "nothing")
        XCTAssertEqual(outcome.coinsDelta, 0)
        XCTAssertEqual(outcome.amountLost, 10)
    }

    func testCanAffordSpinRespectsBalanceAndFreeSpins() {
        XCTAssertFalse(SwimWheel.canAffordSpin(totalCoins: 5, bet: 10, freeSpins: 0))
        XCTAssertTrue(SwimWheel.canAffordSpin(totalCoins: 10, bet: 10, freeSpins: 0))
        XCTAssertTrue(SwimWheel.canAffordSpin(totalCoins: 0, bet: 100, freeSpins: 1))
    }
}
