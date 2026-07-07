import Foundation
import SwiftUI

enum SwimWheel {
    static let wheelBets = [1, 10, 100]
    static let minNothingShare = 0.5
    static let nothingLowBetBonus = 0.05
    static let defaultWinWeight = 10.0
    static let nothingColor = Color(red: 0.443, green: 0.443, blue: 0.482)

    struct SegmentDef: Identifiable {
        let id: String
        let type: String
        let multiplier: Int?
        let color: Color
        let shiny: Bool
        let weight: Double?

        init(
            id: String,
            type: String,
            multiplier: Int? = nil,
            color: Color,
            shiny: Bool = false,
            weight: Double? = nil
        ) {
            self.id = id
            self.type = type
            self.multiplier = multiplier
            self.color = color
            self.shiny = shiny
            self.weight = weight
        }
    }

    struct LayoutSegment: Identifiable {
        let id: String
        let type: String
        let multiplier: Int?
        let color: Color
        let shiny: Bool
        let index: Int
        let weight: Double
        let startDeg: Double
        let sweepDeg: Double
    }

    struct WheelLayout {
        let segments: [LayoutSegment]
        let totalWeight: Double
    }

    struct WheelOutcome: Equatable {
        let type: String
        var multiplier: Int?
        var coinsDelta: Int
        var freeSpinsGranted: Int?
        var amountLost: Int?
    }

    static let segmentDefs: [SegmentDef] = [
        SegmentDef(id: "nothing-1", type: "nothing", color: nothingColor),
        SegmentDef(id: "coins-2", type: "coins", multiplier: 2, color: Color(red: 0.961, green: 0.620, blue: 0.043), weight: 14),
        SegmentDef(id: "nothing-2", type: "nothing", color: nothingColor),
        SegmentDef(id: "coins-3", type: "coins", multiplier: 3, color: Color(red: 0.984, green: 0.749, blue: 0.141), weight: 12),
        SegmentDef(id: "nothing-3", type: "nothing", color: nothingColor),
        SegmentDef(id: "free", type: "free_spin", multiplier: 1, color: Color(red: 0.482, green: 0.357, blue: 1.0), weight: 10),
        SegmentDef(id: "nothing-4", type: "nothing", color: nothingColor),
        SegmentDef(id: "free-2", type: "free_spin", multiplier: 2, color: Color(red: 0.388, green: 0.400, blue: 0.945), weight: 6),
        SegmentDef(id: "nothing-5", type: "nothing", color: nothingColor),
        SegmentDef(id: "coins-5", type: "coins", multiplier: 5, color: Color(red: 1.0, green: 0.843, blue: 0.0), shiny: true, weight: 2),
    ]

    private static let nothingCount = segmentDefs.filter { $0.type == "nothing" }.count

    static func segmentWinWeight(_ def: SegmentDef) -> Double {
        def.weight ?? defaultWinWeight
    }

    static func nothingCombinedShare(bet: Int) -> Double {
        let lowBetBonus = nothingLowBetBonus * max(0, 2 - log10(Double(bet)))
        return minNothingShare + lowBetBonus
    }

    static func buildWheelLayout(bet: Int) -> WheelLayout {
        let nothingShare = nothingCombinedShare(bet: bet)
        let winShare = 1 - nothingShare
        let nothingEach = nothingShare / Double(nothingCount)

        let winWeightTotal = segmentDefs
            .filter { $0.type != "nothing" }
            .reduce(0.0) { $0 + segmentWinWeight($1) }

        let weights = segmentDefs.map { def -> Double in
            if def.type == "nothing" { return nothingEach }
            return winShare * (segmentWinWeight(def) / winWeightTotal)
        }

        let totalWeight = weights.reduce(0, +)
        var cursor = 0.0

        let segments = zip(segmentDefs, weights).enumerated().map { index, pair in
            let (def, weight) = pair
            let sweepDeg = (weight / totalWeight) * 360
            let segment = LayoutSegment(
                id: def.id,
                type: def.type,
                multiplier: def.multiplier,
                color: def.color,
                shiny: def.shiny,
                index: index,
                weight: weight,
                startDeg: cursor,
                sweepDeg: sweepDeg
            )
            cursor += sweepDeg
            return segment
        }

        return WheelLayout(segments: segments, totalWeight: totalWeight)
    }

    static func combinedNothingSweepDeg(_ layout: WheelLayout) -> Double {
        layout.segments
            .filter { $0.type == "nothing" }
            .reduce(0) { $0 + $1.sweepDeg }
    }

    static func pickRandomSegmentIndex(_ layout: WheelLayout) -> Int {
        let roll = Double.random(in: 0..<layout.totalWeight)
        var accumulated = 0.0

        for segment in layout.segments {
            accumulated += segment.weight
            if roll < accumulated { return segment.index }
        }

        return layout.segments.count - 1
    }

    static func getSpinRotation(
        segmentIndex: Int,
        layout: WheelLayout,
        currentRotation: Double = 0,
        extraSpins: Int = 5
    ) -> Double {
        guard let segment = layout.segments.first(where: { $0.index == segmentIndex }) else {
            return currentRotation
        }

        let segmentCenter = segment.startDeg + segment.sweepDeg / 2
        let targetMod = (360 - segmentCenter).truncatingRemainder(dividingBy: 360)
        let currentMod = ((currentRotation.truncatingRemainder(dividingBy: 360)) + 360)
            .truncatingRemainder(dividingBy: 360)
        var delta = targetMod - currentMod
        if delta <= 0 { delta += 360 }
        return currentRotation + Double(extraSpins) * 360 + delta
    }

    static func resolveWheelOutcome(
        segment: LayoutSegment?,
        bet: Int,
        usedFreeSpin: Bool = false
    ) -> WheelOutcome {
        guard let segment else {
            return WheelOutcome(type: "unknown", coinsDelta: 0)
        }

        switch segment.type {
        case "coins":
            let multiplier = segment.multiplier ?? 1
            return WheelOutcome(
                type: "coins",
                multiplier: multiplier,
                coinsDelta: bet * multiplier
            )
        case "free_spin":
            let count = segment.multiplier ?? 1
            return WheelOutcome(
                type: "free_spin",
                coinsDelta: usedFreeSpin ? 0 : bet * count,
                freeSpinsGranted: count
            )
        case "nothing":
            return WheelOutcome(type: "nothing", coinsDelta: 0, amountLost: bet)
        default:
            return WheelOutcome(type: "unknown", coinsDelta: 0)
        }
    }

    static func canAffordSpin(totalCoins: Int, bet: Int, freeSpins: Int) -> Bool {
        freeSpins > 0 || totalCoins >= bet
    }

    static func segmentShowsLabel(_ segment: LayoutSegment) -> Bool {
        segment.type != "nothing"
    }

    static func segmentUsesRadialLabel(_ segment: LayoutSegment) -> Bool {
        segment.shiny || segment.sweepDeg < 14
    }

    static func segmentShouldShowLabel(_ segment: LayoutSegment) -> Bool {
        guard segmentShowsLabel(segment) else { return false }
        if segment.shiny { return true }
        return segment.sweepDeg >= 10
    }

    static func segmentLabel(_ segment: LayoutSegment) -> String {
        switch segment.type {
        case "coins":
            return "\(segment.multiplier ?? 1)×"
        case "free_spin":
            if (segment.multiplier ?? 1) > 1 {
                return "\(segment.multiplier ?? 1)×"
            }
            return "Free"
        default:
            return ""
        }
    }

    static func segmentFontSize(_ segment: LayoutSegment) -> CGFloat {
        let sweepDeg = segment.sweepDeg
        var size: CGFloat = 11
        if sweepDeg >= 40 { size = 11 }
        else if sweepDeg >= 30 { size = 10 }
        else if sweepDeg >= 20 { size = 9 }
        else if sweepDeg >= 12 { size = 8 }
        else { size = 7 }

        if segment.shiny { size = max(size, 8) }
        if segment.type == "free_spin" {
            size = min(size, sweepDeg >= 22 ? 8 : 7)
        }
        return size
    }
}
