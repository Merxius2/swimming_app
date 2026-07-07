import Foundation

enum SwimCoinStore {
    static let freeThemeCodes = ["liquid-os"]
    static let challengeRerollStoreItemId = "boost:challenge-reroll"
    static let bonusWheelSpinStoreItemId = "wheel:bonus-spin"
    static let storeCategories = ["themes", "icons", "vibes", "flair", "boosts"]

    struct StoreItem: Identifiable, Equatable {
        let id: String
        let category: String
        let price: Int
        let preview: String
        let themeCode: String?
        let consumable: Bool
        let name: String
        let description: String
    }

    struct PurchaseUpdate {
        let storeUnlocks: [String]
        let totalCoins: Int
        let coinsSpent: Int
    }

    static let catalog: [StoreItem] = [
        StoreItem(id: "theme:gen-z", category: "themes", price: 500, preview: "theme", themeCode: "gen-z", consumable: false, name: "Gen-Z", description: "Bold flat colors and sharp contrast."),
        StoreItem(id: "theme:classic", category: "themes", price: 500, preview: "theme", themeCode: "classic", consumable: false, name: "Classic Playstation", description: "Retro flat panels inspired by console UIs."),
        StoreItem(id: "theme:olympic-pool", category: "themes", price: 500, preview: "theme", themeCode: "olympic-pool", consumable: false, name: "Olympic Pool", description: "Competition tiles, lane blue, and touchpad gold."),
        StoreItem(id: "theme:midnight-lane", category: "themes", price: 500, preview: "theme", themeCode: "midnight-lane", consumable: false, name: "Midnight Lane", description: "Late-night laps under bioluminescent pool lights."),
        StoreItem(id: "theme:retro-wave", category: "themes", price: 450, preview: "theme", themeCode: "retro-wave", consumable: false, name: "Retro Wave", description: "Synthwave neon on a midnight pool deck."),
        StoreItem(id: "theme:tropical-open", category: "themes", price: 400, preview: "theme", themeCode: "tropical-open", consumable: false, name: "Tropical Open Water", description: "Turquoise lagoon warmth with coral sunset accents."),
        StoreItem(id: "theme:gold-luxe", category: "themes", price: 1000, preview: "theme", themeCode: "gold-luxe", consumable: false, name: "Gold Luxe", description: "Champagne canvas with trophy-gold accents — the podium tier."),
        StoreItem(id: "theme:platinum-elite", category: "themes", price: 2000, preview: "theme", themeCode: "platinum-elite", consumable: false, name: "Platinum Elite", description: "Cool silver panels with icy prestige — the ultimate lap."),
        StoreItem(id: "icon:gold-medal", category: "icons", price: 400, preview: "icon-gold-medal", themeCode: nil, consumable: false, name: "Gold Medalist", description: "Full app icon set — home screen, favicon, and in-app badge."),
        StoreItem(id: "icon:neon-lane", category: "icons", price: 350, preview: "icon-neon-lane", themeCode: nil, consumable: false, name: "Neon Lane", description: "Synth lane lines across every app icon size."),
        StoreItem(id: "icon:trophy-splash", category: "icons", price: 450, preview: "icon-trophy-splash", themeCode: nil, consumable: false, name: "Trophy Splash", description: "Victory splash icon set for the whole app."),
        StoreItem(id: "icon:platinum-star", category: "icons", price: 550, preview: "icon-platinum-star", themeCode: nil, consumable: false, name: "Platinum Star", description: "Silver star crest icon set for home screen and tabs."),
        StoreItem(id: "ambient:neon-lagoon", category: "vibes", price: 250, preview: "ambient-neon", themeCode: nil, consumable: false, name: "Neon Lagoon", description: "Electric cyan and magenta lights with a slowly shifting gradient."),
        StoreItem(id: "ambient:sunset-lap", category: "vibes", price: 250, preview: "ambient-sunset", themeCode: nil, consumable: false, name: "Sunset Lap", description: "Golden-hour warmth that drifts like a late-evening lap."),
        StoreItem(id: "ambient:bubble-trail", category: "vibes", price: 175, preview: "ambient-bubbles", themeCode: nil, consumable: false, name: "Bubble Trail", description: "Rising lane bubbles float over your swim screens."),
        StoreItem(id: "ambient:aurora-lap", category: "vibes", price: 275, preview: "ambient-aurora", themeCode: nil, consumable: false, name: "Aurora Lap", description: "Northern-lights greens and violets sweep across the pool."),
        StoreItem(id: "ambient:deep-current", category: "vibes", price: 300, preview: "ambient-deep", themeCode: nil, consumable: false, name: "Deep Current", description: "Dark ocean blues flow like an underwater lane."),
        StoreItem(id: "badge:golden-coins", category: "flair", price: 150, preview: "golden-coins", themeCode: nil, consumable: false, name: "Golden Coins", description: "Your coin balance gleams like a trophy case."),
        StoreItem(id: "celebration:confetti-cannon", category: "flair", price: 200, preview: "confetti", themeCode: nil, consumable: false, name: "Confetti Cannon", description: "Epic confetti bursts when you earn medals."),
        StoreItem(id: "flair:medal-shimmer", category: "flair", price: 225, preview: "medal-shimmer", themeCode: nil, consumable: false, name: "Medal Shimmer+", description: "Earned medals pulse with extra shine on the shelf."),
        StoreItem(id: challengeRerollStoreItemId, category: "boosts", price: 500, preview: "challenge-reroll", themeCode: nil, consumable: true, name: "Challenge Reroll", description: "Swap one monthly challenge for another type. Use it on the Progress page."),
        StoreItem(id: bonusWheelSpinStoreItemId, category: "boosts", price: 350, preview: "bonus-spin", themeCode: nil, consumable: true, name: "Bonus Wheel Spin", description: "Permanently add one extra paid wheel spin every day. Buy again to stack more."),
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
        totalCoins: Int
    ) -> Bool {
        guard catalogIds.contains(id), let item = getStoreItem(id) else { return false }
        if item.consumable { return totalCoins >= item.price }
        if isStoreItemOwned(id, storeUnlocks: storeUnlocks) { return false }
        return totalCoins >= item.price
    }

    static func purchaseConsumableStoreItemUpdate(
        id: String,
        totalCoins: Int,
        coinsSpent: Int = 0
    ) -> (totalCoins: Int, coinsSpent: Int)? {
        guard let item = getStoreItem(id), item.consumable, totalCoins >= item.price else {
            return nil
        }
        return (
            totalCoins: max(0, totalCoins - item.price),
            coinsSpent: max(0, coinsSpent + item.price)
        )
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
                coinsSpent: data.coinsSpent
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
