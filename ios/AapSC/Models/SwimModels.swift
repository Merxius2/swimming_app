import Foundation

struct StrokeDistances: Codable, Equatable {
    var mixedM: Int?
    var breaststrokeM: Int?
    var freestyleM: Int?
    var backstrokeM: Int?
    var butterflyM: Int?

    static let empty = StrokeDistances(
        mixedM: nil,
        breaststrokeM: nil,
        freestyleM: nil,
        backstrokeM: nil,
        butterflyM: nil
    )
}

struct SwimMetrics: Codable, Equatable {
    var durationSec: Int?
    var distanceM: Int?
    var activeKcal: Int?
    var totalKcal: Int?
    var paceSecPer100m: Int?
    var avgHeartRate: Int?
    var laps: Int?
    var poolLengthM: Int
    var goalM: Int?
    var location: String
    var timeRange: String
    var strokes: StrokeDistances

    static let empty = SwimMetrics(
        durationSec: nil,
        distanceM: nil,
        activeKcal: nil,
        totalKcal: nil,
        paceSecPer100m: nil,
        avgHeartRate: nil,
        laps: nil,
        poolLengthM: 25,
        goalM: nil,
        location: "",
        timeRange: "",
        strokes: .empty
    )
}

struct SwimSession: Codable, Identifiable, Equatable {
    var id: String
    var createdAt: String?
    var date: String
    var metrics: SwimMetrics
    var excludeFromStats: Bool
    var coinsEarned: Int?
    var coinBonus: Int?

    init(
        id: String = UUID().uuidString,
        createdAt: String? = nil,
        date: String,
        metrics: SwimMetrics,
        excludeFromStats: Bool = false,
        coinsEarned: Int? = nil,
        coinBonus: Int? = nil
    ) {
        self.id = id
        self.createdAt = createdAt
        self.date = date
        self.metrics = metrics
        self.excludeFromStats = excludeFromStats
        self.coinsEarned = coinsEarned
        self.coinBonus = coinBonus
    }

    enum CodingKeys: String, CodingKey {
        case id, createdAt, date, metrics, excludeFromStats, coinsEarned, coinBonus, sessionCoins
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        createdAt = try container.decodeIfPresent(String.self, forKey: .createdAt)
        date = try container.decode(String.self, forKey: .date)
        metrics = try container.decode(SwimMetrics.self, forKey: .metrics)
        excludeFromStats = try container.decodeIfPresent(Bool.self, forKey: .excludeFromStats) ?? false
        coinsEarned = try container.decodeIfPresent(Int.self, forKey: .coinsEarned)
            ?? container.decodeIfPresent(Int.self, forKey: .sessionCoins)
        coinBonus = try container.decodeIfPresent(Int.self, forKey: .coinBonus)
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encodeIfPresent(createdAt, forKey: .createdAt)
        try container.encode(date, forKey: .date)
        try container.encode(metrics, forKey: .metrics)
        try container.encode(excludeFromStats, forKey: .excludeFromStats)
        try container.encodeIfPresent(coinsEarned, forKey: .coinsEarned)
        try container.encodeIfPresent(coinBonus, forKey: .coinBonus)
    }
}

struct CoinLineItem: Equatable {
    var type: String
    var coins: Int
    var medalId: String?
    var tier: String?
    var fromTier: String?
    var toTier: String?
    var distanceM: Int?
    var durationSec: Int?
    var kcal: Int?
    var avgPaceSec: Double?
    var paceSec: Int?
}

struct UploadCoinResult: Equatable {
    var sessionCoins: Int
    var medalCoins: Int
    var monthlyCoins: Int
    var total: Int
    var sessionLines: [CoinLineItem]
    var bonusLines: [CoinLineItem]
    var alreadyClaimed: Bool
}

struct ClaimMetrics: Codable, Equatable {
    var distanceM: Int?
    var durationSec: Int?
    var paceSecPer100m: Int?
    var timeRange: String
}

struct SpentCoinClaim: Codable, Equatable {
    var date: String
    var metrics: ClaimMetrics
}

struct MonthlySettlement: Codable, Equatable {
    var coins: Int
    var mascotId: String?
    var appliedAt: String
}

struct MonthRerollEntry: Codable, Equatable {
    var overrides: [String: String]
    var freeUses: Int

    static let empty = MonthRerollEntry(overrides: [:], freeUses: 0)
}

struct SwimProfile: Codable, Equatable {
    var name: String
    var sex: String
    var age: Int
    var mascotId: String?
    var mascotSwitchMonthKey: String?
    var aiApiKey: String
    var activeAmbient: String?
    var activeAppIcon: String?

    static let `default` = SwimProfile(
        name: "",
        sex: "male",
        age: 30,
        mascotId: nil,
        mascotSwitchMonthKey: nil,
        aiApiKey: "",
        activeAmbient: nil,
        activeAppIcon: nil
    )
}

struct WheelSpins: Codable, Equatable {
    var dayKey: String
    var count: Int
}

struct SwimData: Codable, Equatable {
    var profile: SwimProfile
    var monthlySettlements: [String: MonthlySettlement]
    var totalCoins: Int
    var coinsSpent: Int
    var sessions: [SwimSession]
    var spentCoinClaims: [SpentCoinClaim]
    var wheelSpins: WheelSpins?
    var challengeRerollCredits: Int
    var bonusWheelSpinCredits: Int
    var storeUnlocks: [String]
    var monthlyChallengeRerolls: [String: MonthRerollEntry]

    static let empty = SwimData(
        profile: .default,
        monthlySettlements: [:],
        totalCoins: 0,
        coinsSpent: 0,
        sessions: [],
        spentCoinClaims: [],
        wheelSpins: nil,
        challengeRerollCredits: 0,
        bonusWheelSpinCredits: 0,
        storeUnlocks: [],
        monthlyChallengeRerolls: [:]
    )
}

struct SwimCheats: Codable, Equatable {
    var allMedalsUnlocked: Bool
    var previewMonthlyMedals: Bool
    var allThemesUnlocked: Bool

    static let empty = SwimCheats(
        allMedalsUnlocked: false,
        previewMonthlyMedals: false,
        allThemesUnlocked: false
    )
}

struct ParsedScreenshotFields: Equatable {
    var date: String?
    var durationSec: Int?
    var distanceM: Int?
    var activeKcal: Int?
    var totalKcal: Int?
    var paceSecPer100m: Int?
    var avgHeartRate: Int?
    var laps: Int?
    var poolLengthM: Int
    var goalM: Int?
    var location: String
    var timeRange: String
    var strokes: StrokeDistances
}

struct ParsedScreenshotResult: Equatable {
    var fields: ParsedScreenshotFields
    var confidence: Int
    var missingDate: Bool
    var warnings: [String]
    var isSwimWorkout: Bool
    var detectedSport: String?
}

struct WeeklyVolumePoint: Identifiable, Equatable {
    var id: String { weekLabel }
    var weekLabel: String
    var distanceM: Int
}

struct ChartSessionPoint: Identifiable, Equatable {
    var id: String
    var date: String
    var dateLabel: String
    var paceSecPer100m: Int?
    var distanceM: Int?
    var activeKcal: Int?
    var totalKcal: Int?
    var avgHeartRate: Int?
}

struct CombinedStats: Equatable {
    var sessionCount: Int
    var totalDistanceM: Int
    var totalDurationSec: Int
    var totalActiveKcal: Int
    var totalLaps: Int
    var avgPaceSecPer100m: Int?
    var avgHeartRate: Int?
    var bestPaceSecPer100m: Int?
    var longestDistanceM: Int?
    var firstDate: String?
    var lastDate: String?
}

struct StrokeChartSlice: Identifiable, Equatable {
    var id: String
    var label: String
    var value: Int
}

struct SessionFeedbackSummary: Equatable {
    var insights: [String]
    var badges: [String]
    var coachMessage: String
    var motivation: String
    var benchmarkLevel: SwimLevel
}

struct BenchmarkBarItem: Identifiable, Equatable {
    var id: String
    var name: String
    var value: Int
    var colorName: String
}

struct BenchmarkTier: Equatable {
    var beginner: Int
    var intermediate: Int
    var advanced: Int
    var median: Int
}

struct PersonalRecord: Equatable {
    var value: Double
    var sessionId: String
    var date: String
}

struct PersonalRecords: Equatable {
    var longestDistance: PersonalRecord?
    var fastestPace: PersonalRecord?
    var mostActiveCalories: PersonalRecord?
    var mostTotalCalories: PersonalRecord?
    var mostLaps: PersonalRecord?
    var longestDuration: PersonalRecord?
    var highestHeartRate: PersonalRecord?
}

struct MedalDefinition: Equatable, Identifiable {
    var id: String
    var category: String
    var tier: String
    var season: String?
}

struct EvaluatedMedal: Equatable, Identifiable {
    var id: String
    var category: String
    var tier: String
    var season: String?
    var earned: Bool
    var earnedAt: String?
    var periods: [String]
}

struct MonthlyChallenge: Equatable, Identifiable {
    var id: String
    var type: String
    var monthKey: String
    var target: Int
    var tierIndex: Int
    var current: Int
    var completed: Bool
}

struct MonthlyChallengeState: Equatable {
    var monthKey: String
    var challenges: [MonthlyChallenge]
    var completedCount: Int
    var tier: String?
    var earnedAt: String?
}

enum SwimLevel: String {
    case advanced
    case intermediate
    case beginner
    case developing
    case unknown
}

struct MascotSwitchResult: Equatable {
    var allowed: Bool
    var reason: String
}

struct MonthlyShortfallPenalty: Equatable {
    var monthKey: String
    var coins: Int
    var achievedTier: String?
    var requiredTier: String
    var mascotId: String
}
