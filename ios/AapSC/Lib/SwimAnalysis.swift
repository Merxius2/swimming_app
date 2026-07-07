import Foundation

enum SwimAnalysis {
    static func statsSessions(_ sessions: [SwimSession]) -> [SwimSession] {
        sessions.filter { !$0.excludeFromStats }
    }

    static func sortedSessions(_ sessions: [SwimSession]) -> [SwimSession] {
        sessions.sorted { $0.date < $1.date }
    }

    static func combinedStats(_ sessions: [SwimSession]) -> CombinedStats {
        let stats = statsSessions(sessions)
        let totalDistance = stats.compactMap(\.metrics.distanceM).reduce(0, +)
        let totalDuration = stats.compactMap(\.metrics.durationSec).reduce(0, +)
        let paces = stats.compactMap(\.metrics.paceSecPer100m).filter { $0 > 0 }
        let avgPace = paces.isEmpty ? nil : Int(Double(paces.reduce(0, +)) / Double(paces.count))
        let bestPace = paces.min()
        return CombinedStats(
            sessionCount: stats.count,
            totalDistanceM: totalDistance,
            totalDurationSec: totalDuration,
            avgPaceSecPer100m: avgPace,
            bestPaceSecPer100m: bestPace
        )
    }

    static func chartSessions(_ sessions: [SwimSession]) -> [ChartSessionPoint] {
        statsSessions(sessions).map { session in
            ChartSessionPoint(
                id: session.id,
                date: session.date,
                dateLabel: SwimFormatters.formatDateShort(session.date),
                paceSecPer100m: session.metrics.paceSecPer100m,
                distanceM: session.metrics.distanceM
            )
        }
    }

    static func weeklyVolumeData(_ sessions: [SwimSession]) -> [WeeklyVolumePoint] {
        var buckets: [String: Int] = [:]
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"

        for session in statsSessions(sessions) {
            guard let date = formatter.date(from: session.date),
                  let distance = session.metrics.distanceM else { continue }
            let calendar = Calendar.current
            let week = calendar.dateInterval(of: .weekOfYear, for: date)?.start ?? date
            let weekFormatter = DateFormatter()
            weekFormatter.dateFormat = "d MMM"
            let label = weekFormatter.string(from: week)
            buckets[label, default: 0] += distance
        }

        return buckets.keys.sorted().map { key in
            WeeklyVolumePoint(weekLabel: key, distanceM: buckets[key] ?? 0)
        }
    }

    static func buildProgressOverviewMessage(profile: SwimProfile, sessions: [SwimSession]) -> String {
        let combined = combinedStats(sessions)
        let name = profile.name.trimmingCharacters(in: .whitespacesAndNewlines)
        let greeting = name.isEmpty ? "Nice work" : "Nice work, \(name)"
        if combined.sessionCount == 0 {
            return "\(greeting)! Upload your first swim to start tracking progress."
        }
        let distance = SwimFormatters.formatDistance(combined.totalDistanceM)
        let pace = SwimFormatters.formatPace(combined.avgPaceSecPer100m)
        return "\(greeting)! You've logged \(combined.sessionCount) swims totaling \(distance) at an average pace of \(pace)."
    }
}
