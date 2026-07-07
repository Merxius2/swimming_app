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
    var date: String
    var metrics: SwimMetrics
    var excludeFromStats: Bool
    var sessionCoins: Int?
    var coinBonuses: [CoinBonusLine]?

    init(
        id: String = UUID().uuidString,
        date: String,
        metrics: SwimMetrics,
        excludeFromStats: Bool = false,
        sessionCoins: Int? = nil,
        coinBonuses: [CoinBonusLine]? = nil
    ) {
        self.id = id
        self.date = date
        self.metrics = metrics
        self.excludeFromStats = excludeFromStats
        self.sessionCoins = sessionCoins
        self.coinBonuses = coinBonuses
    }
}

struct CoinBonusLine: Codable, Equatable {
    var type: String
    var coins: Int
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

struct SwimData: Codable, Equatable {
    var profile: SwimProfile
    var monthlySettlements: [String: String]
    var totalCoins: Int
    var coinsSpent: Int
    var sessions: [SwimSession]
    var spentCoinClaims: [String]
    var wheelSpins: WheelSpins?
    var challengeRerollCredits: Int
    var bonusWheelSpinCredits: Int
    var storeUnlocks: [String]
    var monthlyChallengeRerolls: [String: Int]

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

struct WheelSpins: Codable, Equatable {
    var dayKey: String
    var count: Int
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
}

struct CombinedStats: Equatable {
    var sessionCount: Int
    var totalDistanceM: Int
    var totalDurationSec: Int
    var avgPaceSecPer100m: Int?
    var bestPaceSecPer100m: Int?
}

struct BenchmarkTier: Equatable {
    var beginner: Int
    var intermediate: Int
    var advanced: Int
    var median: Int
}

enum SwimLevel: String {
    case advanced
    case intermediate
    case beginner
    case developing
    case unknown
}
