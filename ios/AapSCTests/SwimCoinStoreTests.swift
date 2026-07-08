import XCTest
@testable import AapSC

final class SwimCoinStoreTests: XCTestCase {
    func testLiquidOsIsAlwaysUnlocked() {
        XCTAssertTrue(SwimCoinStore.isThemeUnlocked("liquid-os", storeUnlocks: []))
    }

    func testStoreThemesRequirePurchaseViaStoreUnlockIds() {
        XCTAssertFalse(SwimCoinStore.isThemeUnlocked("gen-z", storeUnlocks: []))
        XCTAssertTrue(SwimCoinStore.isThemeUnlocked("gen-z", storeUnlocks: ["theme:gen-z"]))
    }

    func testMigratesBareThemeCodesInStoreUnlocks() {
        XCTAssertEqual(
            SwimCoinStore.normalizeStoreUnlocks(["gen-z", "classic"]),
            ["theme:gen-z", "theme:classic"]
        )
        XCTAssertTrue(SwimCoinStore.isThemeUnlocked("gen-z", storeUnlocks: ["gen-z"]))
    }

    func testMigratesLegacyPurchasedThemeCodes() {
        XCTAssertEqual(
            SwimCoinStore.normalizeStoreUnlocks([], legacyPurchasedThemes: ["gen-z", "classic"]),
            ["theme:gen-z", "theme:classic"]
        )
    }

    func testCanPurchaseWhenEnoughCoinsAndNotOwned() {
        XCTAssertTrue(SwimCoinStore.canPurchaseStoreItem("theme:classic", storeUnlocks: [], totalCoins: 500))
        XCTAssertFalse(SwimCoinStore.canPurchaseStoreItem("theme:classic", storeUnlocks: ["theme:classic"], totalCoins: 500))
        XCTAssertFalse(SwimCoinStore.canPurchaseStoreItem("badge:golden-coins", storeUnlocks: [], totalCoins: 149))
    }

    func testPurchaseDeductsItemPriceAndRecordsUnlock() {
        let result = SwimCoinStore.purchaseStoreItemUpdate(id: "badge:golden-coins", storeUnlocks: [], totalCoins: 200)!
        XCTAssertEqual(result.storeUnlocks, ["badge:golden-coins"])
        XCTAssertEqual(result.totalCoins, 50)
        XCTAssertEqual(result.coinsSpent, 150)
    }

    func testBonusSpinRaisesDailyLimitPerPurchase() {
        XCTAssertEqual(SwimCoinStore.getDailyPaidSpinLimit(0), 3)
        XCTAssertEqual(SwimCoinStore.getDailyPaidSpinLimit(1), 4)
        XCTAssertEqual(SwimCoinStore.getDailyPaidSpinLimit(3), 6)
    }

    func testLegacyBonusSpinUnlockMigratesToOneCredit() {
        XCTAssertEqual(SwimCoinStore.normalizeBonusWheelSpinCredits(0, storeUnlocks: ["wheel:bonus-spin"]), 1)
        XCTAssertEqual(
            SwimCoinStore.stripBonusSpinUnlock(["wheel:bonus-spin", "badge:golden-coins"]),
            ["badge:golden-coins"]
        )
    }

    func testFlairHelpersReflectOwnership() {
        let unlocks = ["badge:golden-coins", "celebration:confetti-cannon"]
        XCTAssertTrue(SwimCoinStore.hasGoldenCoinBadge(unlocks))
        XCTAssertTrue(SwimCoinStore.hasConfettiCannon(unlocks))
        XCTAssertFalse(SwimCoinStore.isStoreItemOwned("ambient:neon-lagoon", storeUnlocks: unlocks))
    }

    func testAllThemesUnlockedCheatBypassesStorePurchase() {
        XCTAssertTrue(SwimCoinStore.isThemeUnlocked("retro-wave", storeUnlocks: [], allThemesUnlocked: true))
        XCTAssertTrue(SwimCoinStore.isThemeUnlocked("gen-z", storeUnlocks: [], allThemesUnlocked: true))
        let unlocked = SwimCoinStore.getUnlockedThemes(
            AppThemes.all.filter { ["liquid-os", "gen-z", "classic"].contains($0.code) },
            storeUnlocks: [],
            allThemesUnlocked: true
        ).map(\.code)
        XCTAssertEqual(unlocked, ["liquid-os", "gen-z", "classic"])
    }

    func testPremiumThemesHaveTieredPricing() {
        XCTAssertEqual(SwimCoinStore.getStoreItem("theme:gold-luxe")?.price, 1000)
        XCTAssertEqual(SwimCoinStore.getStoreItem("theme:platinum-elite")?.price, 2000)
        XCTAssertFalse(SwimCoinStore.canPurchaseStoreItem("theme:gold-luxe", storeUnlocks: [], totalCoins: 999))
        XCTAssertFalse(SwimCoinStore.canPurchaseStoreItem("theme:platinum-elite", storeUnlocks: [], totalCoins: 1999))
    }

    func testAppIconStoreItemsRequirePurchase() {
        XCTAssertFalse(SwimCoinStore.isStoreItemOwned("icon:gold-medal", storeUnlocks: []))
        XCTAssertTrue(SwimCoinStore.isStoreItemOwned("icon:gold-medal", storeUnlocks: ["icon:gold-medal"]))
    }

    func testDeprecatedThemeHelpersStillWork() {
        XCTAssertTrue(SwimCoinStore.canPurchaseTheme("classic", storeUnlocks: [], totalCoins: 500))
        let result = SwimCoinStore.purchaseStoreItemUpdate(id: "theme:gen-z", storeUnlocks: [], totalCoins: 600)!
        XCTAssertEqual(result.totalCoins, 100)
        XCTAssertEqual(result.storeUnlocks, ["theme:gen-z"])
    }

    func testBoostsCategoryListsChallengeRerollAndBonusSpin() {
        let boosts = SwimCoinStore.getStoreItemsByCategory("boosts")
        XCTAssertEqual(boosts.count, 2)
        XCTAssertEqual(boosts[0].id, SwimCoinStore.challengeRerollStoreItemId)
        XCTAssertEqual(boosts[1].id, SwimCoinStore.bonusWheelSpinStoreItemId)
    }

    func testConsumableBonusWheelSpinCanBePurchasedRepeatedly() {
        XCTAssertTrue(SwimCoinStore.isConsumableStoreItem(SwimCoinStore.bonusWheelSpinStoreItemId))
        XCTAssertTrue(SwimCoinStore.canPurchaseStoreItem(SwimCoinStore.bonusWheelSpinStoreItemId, storeUnlocks: [], totalCoins: 350))
        XCTAssertFalse(SwimCoinStore.canPurchaseStoreItem(SwimCoinStore.bonusWheelSpinStoreItemId, storeUnlocks: [], totalCoins: 349))

        let first = SwimCoinStore.purchaseConsumableStoreItemUpdate(
            id: SwimCoinStore.bonusWheelSpinStoreItemId,
            totalCoins: 1000,
            coinsSpent: 0
        )!
        XCTAssertEqual(first.totalCoins, 650)
        XCTAssertEqual(first.coinsSpent, 350)

        let second = SwimCoinStore.purchaseConsumableStoreItemUpdate(
            id: SwimCoinStore.bonusWheelSpinStoreItemId,
            totalCoins: 650,
            coinsSpent: 350
        )!
        XCTAssertEqual(second.totalCoins, 300)
        XCTAssertEqual(second.coinsSpent, 700)
    }

    func testConsumableChallengeRerollCanBePurchasedRepeatedly() {
        XCTAssertTrue(SwimCoinStore.isConsumableStoreItem(SwimCoinStore.challengeRerollStoreItemId))
        XCTAssertTrue(SwimCoinStore.canPurchaseStoreItem(SwimCoinStore.challengeRerollStoreItemId, storeUnlocks: [], totalCoins: 500))
        XCTAssertFalse(SwimCoinStore.canPurchaseStoreItem(SwimCoinStore.challengeRerollStoreItemId, storeUnlocks: [], totalCoins: 499))

        let first = SwimCoinStore.purchaseConsumableStoreItemUpdate(
            id: SwimCoinStore.challengeRerollStoreItemId,
            totalCoins: 1200,
            coinsSpent: 0
        )!
        XCTAssertEqual(first.totalCoins, 700)
        XCTAssertEqual(first.coinsSpent, 500)

        let second = SwimCoinStore.purchaseConsumableStoreItemUpdate(
            id: SwimCoinStore.challengeRerollStoreItemId,
            totalCoins: 700,
            coinsSpent: 500
        )!
        XCTAssertEqual(second.totalCoins, 200)
        XCTAssertEqual(second.coinsSpent, 1000)
    }
}
