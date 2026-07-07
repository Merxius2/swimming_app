import Foundation

struct MascotGameplay: Equatable {
    var challengeIntensity: Double
    var coinMultiplier: Double
    var minSessionCoins: Int?
    var sessionPenalty: Bool
    var requiredMonthlyTier: String?
    var monthlyPenaltyCoins: Int
    var freeMonthlyRerolls: Int
    var positiveOnly: Bool
    var doubleImprovementBonus: Bool
}

struct MascotDefinition: Equatable {
    var id: String
    var coachedLevel: String
    var aiPersonality: String
    var gameplay: MascotGameplay
}

enum MascotConstants {
    static let ids = ["flip", "flo", "fins"]

    static let flip = MascotDefinition(
        id: "flip",
        coachedLevel: "beginner",
        aiPersonality: "encouraging and approachable — celebrates effort, keeps things light, always positive, never criticises",
        gameplay: MascotGameplay(
            challengeIntensity: 0.75,
            coinMultiplier: 0.5,
            minSessionCoins: 3,
            sessionPenalty: false,
            requiredMonthlyTier: nil,
            monthlyPenaltyCoins: 0,
            freeMonthlyRerolls: 1,
            positiveOnly: true,
            doubleImprovementBonus: false
        )
    )

    static let flo = MascotDefinition(
        id: "flo",
        coachedLevel: "intermediate",
        aiPersonality: "friendly and motivating — warm and enthusiastic, cheers milestones, but honestly points out when statistics decline",
        gameplay: MascotGameplay(
            challengeIntensity: 1,
            coinMultiplier: 1,
            minSessionCoins: 5,
            sessionPenalty: false,
            requiredMonthlyTier: "silver",
            monthlyPenaltyCoins: 40,
            freeMonthlyRerolls: 1,
            positiveOnly: false,
            doubleImprovementBonus: false
        )
    )

    static let fins = MascotDefinition(
        id: "fins",
        coachedLevel: "advanced",
        aiPersonality: "focused and challenging — a demanding performance coach who is direct, critical but fair, always pushes for measurable improvement and calls out slacking",
        gameplay: MascotGameplay(
            challengeIntensity: 1.25,
            coinMultiplier: 1,
            minSessionCoins: nil,
            sessionPenalty: true,
            requiredMonthlyTier: "gold",
            monthlyPenaltyCoins: 75,
            freeMonthlyRerolls: 2,
            positiveOnly: false,
            doubleImprovementBonus: true
        )
    )

    static func mascot(_ id: String?) -> MascotDefinition {
        switch id {
        case "flo": return flo
        case "fins": return fins
        default: return flip
        }
    }

    static func gameplay(_ id: String?) -> MascotGameplay {
        mascot(id).gameplay
    }

    static func coachedLevel(_ id: String?) -> String {
        mascot(id).coachedLevel
    }
}
