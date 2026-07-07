import Foundation

enum SwimAnalysis {
    static func statsSessions(_ sessions: [SwimSession]) -> [SwimSession] {
        sessions.filter { !$0.excludeFromStats }
    }

    static func sortedSessions(_ sessions: [SwimSession]) -> [SwimSession] {
        sessions.sorted { $0.date < $1.date }
    }

    static func combinedStats(_ sessions: [SwimSession]) -> CombinedStats? {
        let stats = statsSessions(sessions)
        guard !stats.isEmpty else { return nil }

        let metrics = stats.map(\.metrics)
        let totalDistance = metrics.compactMap(\.distanceM).reduce(0, +)
        let totalDuration = metrics.compactMap(\.durationSec).reduce(0, +)
        let totalActiveKcal = metrics.compactMap(\.activeKcal).reduce(0, +)
        let totalLaps = metrics.compactMap(\.laps).reduce(0, +)
        let paces = metrics.compactMap(\.paceSecPer100m).filter { $0 > 0 }
        let heartRates = metrics.compactMap(\.avgHeartRate).filter { $0 > 0 }

        let sorted = sortedSessions(stats)
        return CombinedStats(
            sessionCount: stats.count,
            totalDistanceM: totalDistance,
            totalDurationSec: totalDuration,
            totalActiveKcal: totalActiveKcal,
            totalLaps: totalLaps,
            avgPaceSecPer100m: average(paces.map(Double.init)).map { Int($0.rounded()) },
            avgHeartRate: average(heartRates.map(Double.init)).map { Int($0.rounded()) },
            bestPaceSecPer100m: paces.min(),
            longestDistanceM: metrics.compactMap(\.distanceM).max(),
            firstDate: sorted.first?.date,
            lastDate: sorted.last?.date
        )
    }

    static func chartSessions(_ sessions: [SwimSession]) -> [ChartSessionPoint] {
        sortedSessions(statsSessions(sessions)).map { session in
            ChartSessionPoint(
                id: session.id,
                date: session.date,
                dateLabel: SwimFormatters.formatDateShort(session.date),
                paceSecPer100m: session.metrics.paceSecPer100m,
                distanceM: session.metrics.distanceM,
                activeKcal: session.metrics.activeKcal,
                totalKcal: session.metrics.totalKcal,
                avgHeartRate: session.metrics.avgHeartRate
            )
        }
    }

    static func weeklyVolumeData(_ sessions: [SwimSession]) -> [WeeklyVolumePoint] {
        var buckets: [String: (label: String, distance: Int)] = [:]
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let labelFormatter = DateFormatter()
        labelFormatter.dateFormat = "d MMM"

        for session in statsSessions(sessions) {
            guard let date = dateFormatter.date(from: session.date),
                  let distance = session.metrics.distanceM else { continue }
            let calendar = Calendar.current
            var components = calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: date)
            components.weekday = 2
            let weekStart = calendar.date(from: components) ?? date
            let key = dateFormatter.string(from: weekStart)
            let label = labelFormatter.string(from: weekStart)
            let existing = buckets[key]?.distance ?? 0
            buckets[key] = (label, existing + distance)
        }

        return buckets.keys.sorted().map { key in
            WeeklyVolumePoint(weekLabel: buckets[key]!.label, distanceM: buckets[key]!.distance)
        }
    }

    static func strokeChartData(_ session: SwimSession?) -> [StrokeChartSlice] {
        guard let strokes = session?.metrics.strokes else { return [] }
        let labels: [(String, String, Int?)] = [
            ("mixedM", "Mixed", strokes.mixedM),
            ("breaststrokeM", "Breaststroke", strokes.breaststrokeM),
            ("freestyleM", "Freestyle", strokes.freestyleM),
            ("backstrokeM", "Backstroke", strokes.backstrokeM),
            ("butterflyM", "Butterfly", strokes.butterflyM)
        ]
        return labels.compactMap { id, label, value in
            guard let value, value > 0 else { return nil }
            return StrokeChartSlice(id: id, label: label, value: value)
        }
    }

    static func buildProgressOverviewMessage(
        profile: SwimProfile,
        sessions: [SwimSession],
        monthlyChallengeRerolls: [String: MonthRerollEntry] = [:]
    ) -> String {
        guard let combined = combinedStats(sessions) else {
            let name = profile.name.trimmingCharacters(in: .whitespacesAndNewlines)
            return name.isEmpty
                ? "Upload your first swim to start tracking progress."
                : "Hey \(name)! Upload your first swim to start tracking progress."
        }

        let name = profile.name.trimmingCharacters(in: .whitespacesAndNewlines)
        let greeting = name.isEmpty ? "Nice work" : "Nice work, \(name)"
        let monthKey = SwimMonthlyChallenges.getMonthKey()
        let mascotId = MascotUnlock.resolveMascotId(
            profile: profile,
            sessions: sessions,
            monthlyChallengeRerolls: monthlyChallengeRerolls
        )
        let intensity = MascotConstants.gameplay(mascotId).challengeIntensity
        let monthly = SwimMonthlyChallenges.evaluateMonthlyChallenges(
            sessions: sessions,
            monthKey: monthKey,
            rerolls: monthlyChallengeRerolls,
            intensity: intensity
        )

        var message = "\(greeting)! You've logged \(combined.sessionCount) swims totaling \(SwimFormatters.formatDistance(combined.totalDistanceM)) at an average pace of \(SwimFormatters.formatPace(combined.avgPaceSecPer100m))."
        if let tier = monthly.tier {
            message += " This month you're at \(tier) tier with \(monthly.completedCount)/3 challenges done."
        } else if let next = monthly.challenges.first(where: { !$0.completed }) {
            message += " Next up: \(challengeLabel(next)) (\(next.current)/\(next.target))."
        }
        return message
    }

    static func buildPersonalFeedback(
        session: SwimSession,
        allSessions: [SwimSession],
        profile: SwimProfile
    ) -> SessionFeedbackSummary {
        var insights: [String] = []
        var badges: [String] = []
        let metrics = session.metrics
        let stats = sortedSessions(statsSessions(allSessions))
        let previous = stats.last(where: { $0.id != session.id && $0.date < session.date }) ?? stats.dropLast().last

        if let prevPace = previous?.metrics.paceSecPer100m,
           let pace = metrics.paceSecPer100m {
            let delta = prevPace - pace
            if delta > 0 {
                insights.append("You swam \(Int(delta.rounded())) seconds faster per 100m than your previous session.")
            } else if delta < 0 {
                insights.append("Pace was \(Int(abs(delta).rounded())) seconds slower per 100m than last time.")
            }
        }

        if let goal = metrics.goalM, let distance = metrics.distanceM {
            if distance >= goal {
                insights.append("You beat your \(SwimFormatters.formatDistance(goal)) goal by \(SwimFormatters.formatDistance(distance - goal)).")
            } else {
                insights.append("You were \(SwimFormatters.formatDistance(goal - distance)) short of your goal.")
            }
        }

        if let records = SwimRecords.getPersonalRecords(allSessions) {
            if let pace = metrics.paceSecPer100m,
               let fastest = records.fastestPace,
               Int(fastest.value) == pace {
                badges.append("Personal best pace")
            }
            if let distance = metrics.distanceM,
               let longest = records.longestDistance,
               Double(distance) == longest.value {
                badges.append("Personal best distance")
            }
        }

        let benchmark = SwimBenchmarks.benchmark(for: profile.sex, age: profile.age)
        let level = SwimBenchmarks.swimLevel(paceSecPer100m: metrics.paceSecPer100m, benchmark: benchmark)

        let motivation: String
        if badges.contains("Personal best pace") {
            motivation = "That's a new pace record — brilliant swimming!"
        } else if insights.contains(where: { $0.contains("faster") }) {
            motivation = "Strong progress. Keep this momentum going."
        } else {
            motivation = "Every swim counts. Stay consistent and the numbers will follow."
        }

        let coachMessage = "Latest session: \(SwimFormatters.formatDistance(metrics.distanceM)) in \(SwimFormatters.formatDuration(metrics.durationSec)) at \(SwimFormatters.formatPace(metrics.paceSecPer100m))."

        return SessionFeedbackSummary(
            insights: insights,
            badges: badges,
            coachMessage: coachMessage,
            motivation: motivation,
            benchmarkLevel: level
        )
    }

    private static func average(_ values: [Double]) -> Double? {
        guard !values.isEmpty else { return nil }
        return values.reduce(0, +) / Double(values.count)
    }

    private static func challengeLabel(_ challenge: MonthlyChallenge) -> String {
        switch challenge.type {
        case "sessions": return "\(challenge.target) sessions"
        case "distance": return SwimFormatters.formatDistance(challenge.target)
        case "kcal": return "\(challenge.target) kcal"
        case "streak": return "\(challenge.target)-day streak"
        case "active_weeks": return "\(challenge.target) active weeks"
        default: return challenge.type
        }
    }
}
