import Foundation

enum SwimCoinStore {
    static let freeThemeCodes = ["liquid-os"]
    static let challengeRerollStoreItemId = "boost:challenge-reroll"
    static let bonusWheelSpinStoreItemId = "wheel:bonus-spin"
    static let bonusSpinBasePrice = 350
    static let bonusSpinPriceIncrement = 150
    static let storeCategories = ["themes", "icons", "vibes", "flair", "boosts"]

    struct StoreItem: Identifiable, Equatable {
        let id: String
        let category: String
        let price: Int
        let preview: String
        let themeCode: String?
        let consumable: Bool
        let nameKey: String
        let descKey: String
    }

    struct PurchaseUpdate {
        let storeUnlocks: [String]
        let totalCoins: Int
        let coinsSpent: Int
    }

    static let catalog: [StoreItem] = [
        StoreItem(id: "theme:gen-z", category: "themes", price: 500, preview: "theme", themeCode: "gen-z", consumable: false, nameKey: "coins.store.items.genZ.name", descKey: "coins.store.items.genZ.desc"),
        StoreItem(id: "theme:classic", category: "themes", price: 500, preview: "theme", themeCode: "classic", consumable: false, nameKey: "coins.store.items.classic.name", descKey: "coins.store.items.classic.desc"),
        StoreItem(id: "theme:olympic-pool", category: "themes", price: 500, preview: "theme", themeCode: "olympic-pool", consumable: false, nameKey: "coins.store.items.olympicPool.name", descKey: "coins.store.items.olympicPool.desc"),
        StoreItem(id: "theme:midnight-lane", category: "themes", price: 500, preview: "theme", themeCode: "midnight-lane", consumable: false, nameKey: "coins.store.items.midnightLane.name", descKey: "coins.store.items.midnightLane.desc"),
        StoreItem(id: "theme:retro-wave", category: "themes", price: 450, preview: "theme", themeCode: "retro-wave", consumable: false, nameKey: "coins.store.items.retroWave.name", descKey: "coins.store.items.retroWave.desc"),
        StoreItem(id: "theme:tropical-open", category: "themes", price: 400, preview: "theme", themeCode: "tropical-open", consumable: false, nameKey: "coins.store.items.tropicalOpen.name", descKey: "coins.store.items.tropicalOpen.desc"),
        StoreItem(id: "theme:gold-luxe", category: "themes", price: 1000, preview: "theme", themeCode: "gold-luxe", consumable: false, nameKey: "coins.store.items.goldLuxe.name", descKey: "coins.store.items.goldLuxe.desc"),
        StoreItem(id: "theme:platinum-elite", category: "themes", price: 2000, preview: "theme", themeCode: "platinum-elite", consumable: false, nameKey: "coins.store.items.platinumElite.name", descKey: "coins.store.items.platinumElite.desc"),
        StoreItem(id: "icon:gold-medal", category: "icons", price: 400, preview: "icon-gold-medal", themeCode: nil, consumable: false, nameKey: "coins.store.items.goldMedalIcon.name", descKey: "coins.store.items.goldMedalIcon.desc"),
        StoreItem(id: "icon:neon-lane", category: "icons", price: 350, preview: "icon-neon-lane", themeCode: nil, consumable: false, nameKey: "coins.store.items.neonLaneIcon.name", descKey: "coins.store.items.neonLaneIcon.desc"),
        StoreItem(id: "icon:trophy-splash", category: "icons", price: 450, preview: "icon-trophy-splash", themeCode: nil, consumable: false, nameKey: "coins.store.items.trophySplashIcon.name", descKey: "coins.store.items.trophySplashIcon.desc"),
        StoreItem(id: "icon:platinum-star", category: "icons", price: 550, preview: "icon-platinum-star", themeCode: nil, consumable: false, nameKey: "coins.store.items.platinumStarIcon.name", descKey: "coins.store.items.platinumStarIcon.desc"),
        StoreItem(id: "ambient:neon-lagoon", category: "vibes", price: 250, preview: "ambient-neon", themeCode: nil, consumable: false, nameKey: "coins.store.items.neonLagoon.name", descKey: "coins.store.items.neonLagoon.desc"),
        StoreItem(id: "ambient:sunset-lap", category: "vibes", price: 250, preview: "ambient-sunset", themeCode: nil, consumable: false, nameKey: "coins.store.items.sunsetLap.name", descKey: "coins.store.items.sunsetLap.desc"),
        StoreItem(id: "ambient:bubble-trail", category: "vibes", price: 175, preview: "ambient-bubbles", themeCode: nil, consumable: false, nameKey: "coins.store.items.bubbleTrail.name", descKey: "coins.store.items.bubbleTrail.desc"),
        StoreItem(id: "ambient:aurora-lap", category: "vibes", price: 275, preview: "ambient-aurora", themeCode: nil, consumable: false, nameKey: "coins.store.items.auroraLap.name", descKey: "coins.store.items.auroraLap.desc"),
        StoreItem(id: "ambient:deep-current", category: "vibes", price: 300, preview: "ambient-deep", themeCode: nil, consumable: false, nameKey: "coins.store.items.deepCurrent.name", descKey: "coins.store.items.deepCurrent.desc"),
        StoreItem(id: "badge:golden-coins", category: "flair", price: 150, preview: "golden-coins", themeCode: nil, consumable: false, nameKey: "coins.store.items.goldenCoins.name", descKey: "coins.store.items.goldenCoins.desc"),
        StoreItem(id: "celebration:confetti-cannon", category: "flair", price: 200, preview: "confetti", themeCode: nil, consumable: false, nameKey: "coins.store.items.confettiCannon.name", descKey: "coins.store.items.confettiCannon.desc"),
        StoreItem(id: "flair:medal-shimmer", category: "flair", price: 225, preview: "medal-shimmer", themeCode: nil, consumable: false, nameKey: "coins.store.items.medalShimmer.name", descKey: "coins.store.items.medalShimmer.desc"),
        StoreItem(id: challengeRerollStoreItemId, category: "boosts", price: 500, preview: "challenge-reroll", themeCode: nil, consumable: true, nameKey: "coins.store.items.challengeReroll.name", descKey: "coins.store.items.challengeReroll.desc"),
        StoreItem(id: bonusWheelSpinStoreItemId, category: "boosts", price: 350, preview: "bonus-spin", themeCode: nil, consumable: true, nameKey: "coins.store.items.bonusSpin.name", descKey: "coins.store.items.bonusSpin.desc"),
    ]

    private static let catalogIds = Set(catalog.map(\.id))
    private static let legacyThemeIds = Dictionary(
        uniqueKeysWithValues: catalog.compactMap { item -> (String, String)? in
            guard let themeCode = item.themeCode else { return nil }
            return (themeCode, item.id)
        }
    )

    static func getStoreItem(_ id: String) -> StoreItem? {
        catalog.first { $0.id == id }
    }

    static func getBonusSpinPrice(_ bonusWheelSpinCredits: Int) -> Int {
        max(0, bonusWheelSpinCredits) * bonusSpinPriceIncrement + bonusSpinBasePrice
    }

    static func getConsumableItemPrice(id: String, bonusWheelSpinCredits: Int = 0) -> Int {
        guard let item = getStoreItem(id) else { return 0 }
        if id == bonusWheelSpinStoreItemId {
            return getBonusSpinPrice(bonusWheelSpinCredits)
        }
        return item.price
    }

    static func sumStorePurchasePrices(_ storeUnlocks: [String]) -> Int {
        normalizeStoreUnlocks(storeUnlocks).reduce(0) { sum, id in
            sum + (getStoreItem(id)?.price ?? 0)
        }
    }

    static func migrateCoinsSpent(_ raw: Int?, storeUnlocks: [String]) -> Int {
        if let raw { return max(0, raw) }
        return sumStorePurchasePrices(storeUnlocks)
    }

    static func getStoreItemsByCategory(_ category: String) -> [StoreItem] {
        catalog.filter { $0.category == category }
    }

    static func normalizeStoreUnlocks(
        _ raw: [String]?,
        legacyPurchasedThemes: [String] = []
    ) -> [String] {
        var ids = Set<String>()

        if let raw {
            for entry in raw {
                if catalogIds.contains(entry) {
                    ids.insert(entry)
                    continue
                }
                if let mapped = legacyThemeIds[entry] {
                    ids.insert(mapped)
                }
            }
        }

        for code in legacyPurchasedThemes {
            if let mapped = legacyThemeIds[code] {
                ids.insert(mapped)
            }
        }

        return catalog.map(\.id).filter { ids.contains($0) }
    }

    static func isStoreItemOwned(_ id: String, storeUnlocks: [String]) -> Bool {
        normalizeStoreUnlocks(storeUnlocks).contains(id)
    }

    static func isThemeUnlocked(
        _ themeCode: String,
        storeUnlocks: [String],
        allThemesUnlocked: Bool = false
    ) -> Bool {
        if allThemesUnlocked || freeThemeCodes.contains(themeCode) { return true }
        return isStoreItemOwned("theme:\(themeCode)", storeUnlocks: storeUnlocks)
    }

    static func isConsumableStoreItem(_ id: String) -> Bool {
        getStoreItem(id)?.consumable ?? false
    }

    static func canPurchaseStoreItem(
        _ id: String,
        storeUnlocks: [String],
        totalCoins: Int,
        bonusWheelSpinCredits: Int = 0
    ) -> Bool {
        guard catalogIds.contains(id), let item = getStoreItem(id) else { return false }
        if item.consumable {
            return totalCoins >= getConsumableItemPrice(id: id, bonusWheelSpinCredits: bonusWheelSpinCredits)
        }
        if isStoreItemOwned(id, storeUnlocks: storeUnlocks) { return false }
        return totalCoins >= item.price
    }

    static func purchaseConsumableStoreItemUpdate(
        id: String,
        totalCoins: Int,
        coinsSpent: Int = 0,
        bonusWheelSpinCredits: Int = 0
    ) -> (totalCoins: Int, coinsSpent: Int)? {
        let price = getConsumableItemPrice(id: id, bonusWheelSpinCredits: bonusWheelSpinCredits)
        guard let item = getStoreItem(id), item.consumable, totalCoins >= price else {
            return nil
        }
        return (
            totalCoins: max(0, totalCoins - price),
            coinsSpent: max(0, coinsSpent + price)
        )
    }

    static func canPurchaseTheme(_ themeCode: String, storeUnlocks: [String], totalCoins: Int) -> Bool {
        canPurchaseStoreItem("theme:\(themeCode)", storeUnlocks: storeUnlocks, totalCoins: totalCoins)
    }

    static func getUnlockedThemes(
        _ themes: [AppThemeDefinition],
        storeUnlocks: [String],
        allThemesUnlocked: Bool = false
    ) -> [AppThemeDefinition] {
        themes.filter { isThemeUnlocked($0.code, storeUnlocks: storeUnlocks, allThemesUnlocked: allThemesUnlocked) }
    }

    static func purchaseStoreItemUpdate(
        id: String,
        storeUnlocks: [String],
        totalCoins: Int,
        coinsSpent: Int = 0
    ) -> PurchaseUpdate? {
        guard canPurchaseStoreItem(id, storeUnlocks: storeUnlocks, totalCoins: totalCoins) else {
            return nil
        }
        return PurchaseUpdate(
            storeUnlocks: normalizeStoreUnlocks(storeUnlocks) + [id],
            totalCoins: max(0, totalCoins - (getStoreItem(id)?.price ?? 0)),
            coinsSpent: max(0, coinsSpent + (getStoreItem(id)?.price ?? 0))
        )
    }

    static func normalizeBonusWheelSpinCredits(
        _ raw: Int?,
        storeUnlocks: [String]
    ) -> Int {
        var credits = max(0, raw ?? 0)
        if normalizeStoreUnlocks(storeUnlocks).contains(bonusWheelSpinStoreItemId) {
            credits += 1
        }
        return credits
    }

    static func stripBonusSpinUnlock(_ storeUnlocks: [String]) -> [String] {
        normalizeStoreUnlocks(storeUnlocks).filter { $0 != bonusWheelSpinStoreItemId }
    }

    static func getBonusPaidSpins(_ bonusWheelSpinCredits: Int) -> Int {
        max(0, bonusWheelSpinCredits)
    }

    static func getDailyPaidSpinLimit(_ bonusWheelSpinCredits: Int) -> Int {
        SwimWheelSpins.dailyPaidSpinLimit + getBonusPaidSpins(bonusWheelSpinCredits)
    }

    static func hasGoldenCoinBadge(_ storeUnlocks: [String]) -> Bool {
        isStoreItemOwned("badge:golden-coins", storeUnlocks: storeUnlocks)
    }

    static func hasConfettiCannon(_ storeUnlocks: [String]) -> Bool {
        isStoreItemOwned("celebration:confetti-cannon", storeUnlocks: storeUnlocks)
    }

    static func hasMedalShimmerPlus(_ storeUnlocks: [String]) -> Bool {
        isStoreItemOwned("flair:medal-shimmer", storeUnlocks: storeUnlocks)
    }

    static func sanitizeProfileCosmetics(
        _ profile: SwimProfile,
        storeUnlocks: [String]
    ) -> SwimProfile {
        var next = profile
        if let ambient = next.activeAmbient,
           !isStoreItemOwned(ambient, storeUnlocks: storeUnlocks) {
            next.activeAmbient = nil
        }
        if let icon = next.activeAppIcon,
           !isStoreItemOwned(icon, storeUnlocks: storeUnlocks) {
            next.activeAppIcon = nil
        }
        return next
    }

    static func applyConsumableStorePurchase(data: SwimData, itemId: String) -> SwimData? {
        guard isConsumableStoreItem(itemId),
              let update = purchaseConsumableStoreItemUpdate(
                id: itemId,
                totalCoins: data.totalCoins,
                coinsSpent: data.coinsSpent,
                bonusWheelSpinCredits: data.bonusWheelSpinCredits
              ) else {
            return nil
        }

        var next = data
        next.totalCoins = update.totalCoins
        next.coinsSpent = update.coinsSpent
        if itemId == challengeRerollStoreItemId {
            next.challengeRerollCredits += 1
        } else if itemId == bonusWheelSpinStoreItemId {
            next.bonusWheelSpinCredits += 1
        }
        return next
    }

    static func categoryLabel(_ category: String, t: TranslationService) -> String {
        t.t("coins.store.categories.\(category)")
    }

    static func localizedName(_ item: StoreItem, t: TranslationService) -> String {
        t.t(item.nameKey)
    }

    static func localizedDescription(_ item: StoreItem, t: TranslationService) -> String {
        t.t(item.descKey)
    }

    static func categoryLabel(_ category: String) -> String {
        switch category {
        case "themes": return "Themes"
        case "icons": return "App icons"
        case "vibes": return "Background vibes"
        case "flair": return "Flair"
        case "boosts": return "Boosts"
        default: return category.capitalized
        }
    }

    static func categoryIcon(_ category: String) -> String {
        switch category {
        case "themes": return "paintpalette.fill"
        case "icons": return "app.fill"
        case "vibes": return "sparkles"
        case "flair": return "party.popper.fill"
        case "boosts": return "bolt.fill"
        default: return "bag.fill"
        }
    }
}
