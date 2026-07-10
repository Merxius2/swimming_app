import UIKit

enum AppIconService {
    static func assetName(for storeItemId: String?) -> String? {
        guard let image = storeImageName(for: storeItemId) else { return nil }
        return "StoreIcon-\(image)"
    }

    static func alternateIconName(for storeItemId: String?) -> String? {
        switch storeItemId {
        case "icon:gold-medal": return "GoldMedal"
        case "icon:neon-lane": return "NeonLane"
        case "icon:trophy-splash": return "TrophySplash"
        case "icon:platinum-star": return "PlatinumStar"
        default: return nil
        }
    }

    static func storeImageName(for storeItemId: String?) -> String? {
        switch storeItemId {
        case "icon:gold-medal": return "gold-medal"
        case "icon:neon-lane": return "neon-lane"
        case "icon:trophy-splash": return "trophy-splash"
        case "icon:platinum-star": return "platinum-star"
        default: return nil
        }
    }

    static func apply(activeAppIcon: String?, storeUnlocks: [String]) {
        guard UIApplication.shared.supportsAlternateIcons else { return }

        let ownedId = activeAppIcon.flatMap { id in
            SwimCoinStore.isStoreItemOwned(id, storeUnlocks: storeUnlocks) ? id : nil
        }
        let targetName = alternateIconName(for: ownedId)

        guard UIApplication.shared.alternateIconName != targetName else { return }

        UIApplication.shared.setAlternateIconName(targetName) { error in
            if let error {
                NSLog("App icon switch failed: \(error.localizedDescription)")
                if targetName != nil {
                    UIApplication.shared.setAlternateIconName(nil) { resetError in
                        if let resetError {
                            NSLog("App icon reset failed: \(resetError.localizedDescription)")
                        }
                    }
                }
            }
        }
    }
}
