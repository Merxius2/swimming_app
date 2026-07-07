import Foundation

enum SwimMonthlyChallengeFormatters {
    static func challengeTypeLabel(_ type: String) -> String {
        switch type {
        case "sessions": return "Session count"
        case "distance": return "Total distance"
        case "kcal": return "Active calories"
        case "streak": return "Swim streak"
        case "active_weeks": return "Active weeks"
        default: return type.capitalized
        }
    }

    static func formatChallengeValue(_ type: String, _ value: Int?) -> String {
        guard let value else { return "—" }
        switch type {
        case "sessions", "streak", "active_weeks":
            return String(value)
        case "distance":
            return SwimFormatters.formatDistance(value)
        case "kcal":
            return "\(value) kcal"
        default:
            return String(value)
        }
    }

    static func formatChallengeTarget(_ type: String, _ target: Int) -> String {
        switch type {
        case "sessions":
            return "Swim \(target) sessions this month"
        case "distance":
            return "Swim \(SwimFormatters.formatDistance(target)) this month"
        case "kcal":
            return "Burn \(target) active kcal this month"
        case "streak":
            return "Swim \(target) days in a row"
        case "active_weeks":
            return "Swim in \(target) different weeks"
        default:
            return String(target)
        }
    }

    static func tierLabel(_ tier: String) -> String {
        switch tier {
        case "bronze": return "Bronze"
        case "silver": return "Silver"
        case "gold": return "Gold"
        default: return tier.capitalized
        }
    }

    static func monthLabel(_ monthKey: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        guard let date = formatter.date(from: "\(monthKey)-01") else { return monthKey }
        formatter.dateFormat = "MMMM yyyy"
        return formatter.string(from: date)
    }

    static func monthShortLabel(_ monthKey: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        guard let date = formatter.date(from: "\(monthKey)-01") else { return monthKey }
        formatter.dateFormat = "MMM"
        return formatter.string(from: date)
    }
}
