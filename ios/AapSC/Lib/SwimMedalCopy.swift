import Foundation

enum SwimMedalCopy {
    static let categories = ["milestone", "distance", "weekly", "streak", "monthly", "seasonal", "special"]

    static func categoryLabel(_ category: String) -> String {
        switch category {
        case "milestone": return "Milestones"
        case "distance": return "Session records"
        case "weekly": return "Weekly goals"
        case "monthly": return "Monthly goals"
        case "seasonal": return "Seasonal challenges"
        case "streak": return "Streaks"
        case "special": return "Special achievements"
        default: return category.capitalized
        }
    }

    static func seasonLabel(_ season: String) -> String {
        switch season {
        case "summer": return "Summer"
        case "winter": return "Winter"
        case "spring": return "Spring"
        case "autumn": return "Autumn"
        default: return season.capitalized
        }
    }

    static func title(for medalId: String) -> String {
        items[medalId]?.title ?? medalId.replacingOccurrences(of: "_", with: " ").capitalized
    }

    static func description(for medalId: String) -> String {
        items[medalId]?.description ?? ""
    }

    static func progressScopeLabel(_ scope: String) -> String {
        switch scope {
        case "lifetime": return "All-time progress"
        case "best_session": return "Best single session"
        case "best_week": return "Best calendar week so far"
        case "current_month": return "Progress this month"
        case "best_month": return "Best month so far"
        case "current_season": return "Progress this season"
        case "best_season": return "Best season so far"
        default: return scope
        }
    }

    static func formatPeriods(_ periods: [String]) -> String {
        periods.map { period in
            if period.range(of: #"^\d{4}-\d{2}$"#, options: .regularExpression) != nil {
                let parts = period.split(separator: "-")
                guard parts.count == 2,
                      let year = Int(parts[0]),
                      let month = Int(parts[1]) else { return period }
                var components = DateComponents(year: year, month: month, day: 1)
                let formatter = DateFormatter()
                formatter.dateFormat = "MMM yyyy"
                if let date = Calendar.current.date(from: components) {
                    return formatter.string(from: date)
                }
                return period
            }
            let parts = period.split(separator: "-", maxSplits: 1).map(String.init)
            guard parts.count == 2 else { return period }
            return "\(seasonLabel(parts[0])) \(parts[1])"
        }.joined(separator: " · ")
    }

    private static let items: [String: (title: String, description: String)] = [
        "first_splash": ("First splash", "Log your first swim session."),
        "ten_sessions": ("Regular swimmer", "Complete 10 swim sessions."),
        "twenty_five_sessions": ("Pool regular", "Complete 25 swim sessions."),
        "ten_k_lifetime": ("10 km club", "Swim 10 km total across all sessions."),
        "fifty_k_lifetime": ("50 km club", "Swim 50 km total across all sessions."),
        "hundred_k_lifetime": ("Century swimmer", "Swim 100 km total across all sessions."),
        "two_k_session": ("2 km session", "Swim 2 km in a single session."),
        "two_five_k_session": ("2.5 km session", "Swim 2.5 km in a single session."),
        "three_k_session": ("3 km session", "Swim 3 km in a single session."),
        "sub_200_pace": ("Sub 2:00 pace", "Swim faster than 2:00 per 100m in any session."),
        "four_sessions_week": ("Four-a-week", "Log 4 sessions in a single calendar week."),
        "five_k_week": ("5 km week", "Swim 5 km in a single calendar week."),
        "eight_sessions_month": ("Monthly regular", "Log 8 sessions in one calendar month."),
        "ten_k_month": ("10 km month", "Swim 10 km in a single calendar month."),
        "twenty_k_month": ("20 km month", "Swim 20 km in a single calendar month."),
        "ten_k_cal_month": ("Calorie burner", "Burn 10,000 active calories in one month."),
        "season_summer": ("Summer swimmer", "Swim 15 km during a summer season (Jun–Aug)."),
        "season_winter": ("Winter warrior", "Swim 10 km during a winter season (Dec–Feb)."),
        "season_spring": ("Spring splash", "Swim 10 km during a spring season (Mar–May)."),
        "season_autumn": ("Autumn lanes", "Swim 10 km during an autumn season (Sep–Nov)."),
        "fifty_sessions": ("Half century club", "Complete 50 swim sessions."),
        "two_hundred_k": ("200 km legend", "Swim 200 km total across all sessions."),
        "lap_legend": ("Lap legend", "Log 1,000 laps across all sessions."),
        "calorie_collector": ("Calorie collector", "Burn 25,000 active calories in total."),
        "sub_210_pace": ("Sub 2:10 pace", "Swim faster than 2:10 per 100m in any session."),
        "marathon_session": ("Pool marathon", "Swim for 90 minutes or more in one session."),
        "century_laps": ("Century laps", "Complete 100 laps in a single session."),
        "furnace": ("Furnace", "Burn 800+ active calories in one session."),
        "pulse_racer": ("Pulse racer", "Average 155+ bpm for an entire session."),
        "goal_crusher": ("Goal crusher", "Meet or beat your distance goal in a session."),
        "frog_master": ("Frog master", "Swim 1 km breaststroke in a single session."),
        "hat_trick": ("Hat trick", "Swim 3 days in a row."),
        "week_warrior": ("Week warrior", "Swim 7 consecutive days."),
        "fortnight_flow": ("Fortnight flow", "Swim 14 consecutive days — pure dedication."),
        "early_bird": ("Early bird", "Start a swim before 7:00 AM."),
        "night_owl": ("Night owl", "Start a swim at 8:00 PM or later."),
        "comeback": ("Comeback kid", "Return to the pool after a 30+ day break."),
        "double_dip": ("Double dip", "Log two swims on the same day."),
        "holiday_splash": ("Holiday splash", "Swim between Dec 20 and Jan 5."),
        "january_jolt": ("January jolt", "Kick off the year with a swim in January."),
    ]
}
