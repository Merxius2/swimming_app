import Foundation

enum StorePageIcons {
    static let pageKeys = ["progress", "upload", "history", "benchmark", "medals", "coins", "settings"]

    static func slug(for iconSetId: String) -> String? {
        AppIconService.storeImageName(for: iconSetId)
    }

    static func assetName(iconSetId: String, pageKey: String) -> String? {
        guard let slug = slug(for: iconSetId), pageKeys.contains(pageKey) else { return nil }
        return "PageIcon-\(slug)-\(pageKey)"
    }

    static func resolve(activeAppIcon: String?, pageKey: String, storeUnlocks: [String]) -> String? {
        guard let activeAppIcon,
              SwimCoinStore.isStoreItemOwned(activeAppIcon, storeUnlocks: storeUnlocks) else {
            return nil
        }
        return assetName(iconSetId: activeAppIcon, pageKey: pageKey)
    }
}
