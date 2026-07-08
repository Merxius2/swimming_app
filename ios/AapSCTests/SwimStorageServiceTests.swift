import XCTest
@testable import AapSC

final class SwimStorageServiceTests: XCTestCase {
    private var suiteName: String!
    private var defaults: UserDefaults!

    override func setUp() {
        super.setUp()
        suiteName = "AapSCTests.\(UUID().uuidString)"
        defaults = UserDefaults(suiteName: suiteName)!
        SwimStorageService.defaults = defaults
        SwimStorageService.clear()
    }

    override func tearDown() {
        SwimStorageService.clear()
        defaults.removePersistentDomain(forName: suiteName)
        SwimStorageService.defaults = .standard
        super.tearDown()
    }

    func testLoadsRerollCreditsAndNormalizedMonthlyRerollState() throws {
        let json = """
        {
          "sessions": [],
          "profile": {"name":"","sex":"male","age":30,"aiApiKey":""},
          "totalCoins": 0,
          "coinsSpent": 0,
          "spentCoinClaims": [],
          "challengeRerollCredits": 2,
          "bonusWheelSpinCredits": 0,
          "storeUnlocks": [],
          "monthlyChallengeRerolls": {
            "2025-06": {"overrides": {"0": "kcal"}, "freeUsed": true}
          }
        }
        """
        defaults.set(Data(json.utf8), forKey: SwimStorageService.storageKey)
        let data = SwimStorageService.load()
        XCTAssertEqual(data.challengeRerollCredits, 2)
        XCTAssertEqual(data.monthlyChallengeRerolls["2025-06"], MonthRerollEntry(overrides: ["0": "kcal"], freeUses: 1))
    }

    func testMigratesLegacySingleRerollObjectsOnLoad() throws {
        let json = """
        {
          "sessions": [],
          "profile": {"name":"","sex":"male","age":30,"aiApiKey":""},
          "totalCoins": 0,
          "coinsSpent": 0,
          "spentCoinClaims": [],
          "monthlyChallengeRerolls": {
            "2025-06": {"tierIndex": 1, "type": "distance"}
          }
        }
        """
        defaults.set(Data(json.utf8), forKey: SwimStorageService.storageKey)
        let data = SwimStorageService.load()
        XCTAssertEqual(data.monthlyChallengeRerolls["2025-06"], MonthRerollEntry(overrides: ["1": "distance"], freeUses: 1))
    }

    func testMigratesLegacyBonusSpinUnlockIntoCreditsOnLoad() throws {
        let json = """
        {
          "sessions": [],
          "profile": {"name":"","sex":"male","age":30,"aiApiKey":""},
          "totalCoins": 0,
          "coinsSpent": 0,
          "spentCoinClaims": [],
          "storeUnlocks": ["wheel:bonus-spin", "badge:golden-coins"]
        }
        """
        defaults.set(Data(json.utf8), forKey: SwimStorageService.storageKey)
        let data = SwimStorageService.load()
        XCTAssertEqual(data.bonusWheelSpinCredits, 1)
        XCTAssertEqual(data.storeUnlocks, ["badge:golden-coins"])
    }

    func testRoundTripsRerollFieldsThroughSaveAndLoad() {
        var payload = SwimData.empty
        payload.totalCoins = 500
        payload.monthlyChallengeRerolls = [
            "2025-07": MonthRerollEntry(overrides: ["2": "streak"], freeUses: 0)
        ]
        payload.challengeRerollCredits = 3
        payload.bonusWheelSpinCredits = 2

        SwimStorageService.save(payload)
        let loaded = SwimStorageService.load()

        XCTAssertEqual(loaded.challengeRerollCredits, 3)
        XCTAssertEqual(loaded.bonusWheelSpinCredits, 2)
        XCTAssertEqual(loaded.monthlyChallengeRerolls, payload.monthlyChallengeRerolls)
    }
}
