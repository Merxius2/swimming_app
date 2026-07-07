import SwiftUI
import Charts

struct RecordsSectionView: View {
    let records: PersonalRecords?

    var body: some View {
        if let records {
            let entries = buildEntries(records)
            if !entries.isEmpty {
                Card {
                    VStack(alignment: .leading, spacing: 12) {
                        Label("Personal records", systemImage: "trophy.fill")
                            .font(.headline)
                            .foregroundStyle(.orange)

                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                            ForEach(entries, id: \.title) { entry in
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(entry.title)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    Text(entry.value)
                                        .font(.headline)
                                        .foregroundStyle(entry.color)
                                    Text(SwimFormatters.formatDateShort(entry.date))
                                        .font(.caption2)
                                        .foregroundStyle(.secondary)
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(10)
                                .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 10))
                            }
                        }
                    }
                }
            }
        }
    }

    private struct RecordEntry {
        let title: String
        let value: String
        let date: String
        let color: Color
    }

    private func buildEntries(_ records: PersonalRecords) -> [RecordEntry] {
        var entries: [RecordEntry] = []
        if let record = records.longestDistance {
            entries.append(RecordEntry(title: "Longest distance", value: SwimFormatters.formatDistance(Int(record.value)), date: record.date, color: .blue))
        }
        if let record = records.fastestPace {
            entries.append(RecordEntry(title: "Fastest pace", value: SwimFormatters.formatPace(Int(record.value)), date: record.date, color: .teal))
        }
        if let record = records.mostActiveCalories {
            entries.append(RecordEntry(title: "Most active kcal", value: "\(Int(record.value)) kcal", date: record.date, color: .red))
        }
        if let record = records.mostTotalCalories {
            entries.append(RecordEntry(title: "Most total kcal", value: "\(Int(record.value)) kcal", date: record.date, color: .orange))
        }
        if let record = records.mostLaps {
            entries.append(RecordEntry(title: "Most laps", value: "\(Int(record.value))", date: record.date, color: .purple))
        }
        if let record = records.longestDuration {
            entries.append(RecordEntry(title: "Longest duration", value: SwimFormatters.formatDuration(Int(record.value)), date: record.date, color: .yellow))
        }
        if let record = records.highestHeartRate {
            entries.append(RecordEntry(title: "Highest heart rate", value: "\(Int(record.value)) bpm", date: record.date, color: .pink))
        }
        return entries
    }
}

struct SessionFeedbackCard: View {
    let feedback: SessionFeedbackSummary

    var body: some View {
        Card {
            VStack(alignment: .leading, spacing: 12) {
                Text("Session feedback")
                    .font(.headline)

                Text(feedback.coachMessage)
                    .font(.subheadline)

                if !feedback.insights.isEmpty {
                    ForEach(feedback.insights, id: \.self) { insight in
                        Label(insight, systemImage: "lightbulb")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                if !feedback.badges.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack {
                            ForEach(feedback.badges, id: \.self) { badge in
                                Text(badge)
                                    .font(.caption.bold())
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 6)
                                    .background(Color("BrandBlue").opacity(0.12), in: Capsule())
                            }
                        }
                    }
                }

                Text(feedback.motivation)
                    .font(.subheadline.italic())
                    .foregroundStyle(Color("BrandBlue"))

                Text("Level: \(SwimBenchmarks.levelLabel(feedback.benchmarkLevel))")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
            }
        }
    }
}

struct MonthlyChallengesCardView: View {
    @EnvironmentObject private var viewModel: SwimViewModel

    var body: some View {
        let monthKey = SwimMonthlyChallenges.getMonthKey()
        let intensity = MascotConstants.gameplay(viewModel.mascotId).challengeIntensity
        let state = SwimMonthlyChallenges.evaluateMonthlyChallenges(
            sessions: viewModel.sessions,
            monthKey: monthKey,
            rerolls: viewModel.monthlyChallengeRerolls,
            intensity: intensity
        )

        Card {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Monthly challenges")
                            .font(.headline)
                        Text(monthLabel(monthKey))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    if let tier = state.tier {
                        Text(tier.capitalized)
                            .font(.caption.bold())
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(tierColor(tier).opacity(0.2), in: Capsule())
                    }
                }

                ForEach(state.challenges) { challenge in
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Text(challengeTitle(challenge))
                                .font(.subheadline)
                            Spacer()
                            Text("\(challenge.current)/\(challenge.target)")
                                .font(.caption.bold())
                        }
                        ProgressView(value: Double(min(challenge.current, challenge.target)), total: Double(max(challenge.target, 1)))
                            .tint(challenge.completed ? .green : Color("BrandBlue"))
                    }
                }

                Text("\(state.completedCount)/3 complete")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private func monthLabel(_ monthKey: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        guard let date = formatter.date(from: "\(monthKey)-01") else { return monthKey }
        formatter.dateFormat = "MMMM yyyy"
        return formatter.string(from: date)
    }

    private func tierColor(_ tier: String) -> Color {
        switch tier {
        case "gold": return .yellow
        case "silver": return .gray
        default: return .orange
        }
    }

    private func challengeTitle(_ challenge: MonthlyChallenge) -> String {
        switch challenge.type {
        case "sessions": return "Log \(challenge.target) sessions"
        case "distance": return "Swim \(SwimFormatters.formatDistance(challenge.target))"
        case "kcal": return "Burn \(challenge.target) active kcal"
        case "streak": return "\(challenge.target)-day streak"
        case "active_weeks": return "\(challenge.target) active weeks"
        default: return challenge.type.capitalized
        }
    }
}

struct StrokeDonutChart: View {
    let slices: [StrokeChartSlice]

    var body: some View {
        let total = slices.map(\.value).reduce(0, +)
        Card {
            VStack(alignment: .leading, spacing: 12) {
                Text("Stroke mix (latest session)")
                    .font(.headline)

                if slices.isEmpty || total == 0 {
                    Text("No stroke breakdown for the latest session.")
                        .foregroundStyle(.secondary)
                } else {
                    Chart(slices) { slice in
                        SectorMark(
                            angle: .value("Meters", slice.value),
                            innerRadius: .ratio(0.55),
                            angularInset: 1.5
                        )
                        .foregroundStyle(by: .value("Stroke", slice.label))
                    }
                    .frame(height: 220)

                    ForEach(slices) { slice in
                        HStack {
                            Text(slice.label)
                            Spacer()
                            Text(SwimFormatters.formatDistance(slice.value))
                                .fontWeight(.semibold)
                        }
                        .font(.caption)
                    }
                }
            }
        }
    }
}

struct BenchmarkBadgeRankingView: View {
    let label: String
    let percentile: Int
    let vsMedian: String

    var body: some View {
        Card {
            HStack {
                VStack(alignment: .leading, spacing: 6) {
                    Text(label)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Text("\(percentile)%")
                        .font(.system(size: 34, weight: .bold))
                    Text(vsMedian == "above" ? "Above median" : "Below median")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(vsMedian == "above" ? .green : .orange)
                }
                Spacer()
                ZStack {
                    Circle()
                        .fill(vsMedian == "above" ? Color.green : Color.orange)
                        .frame(width: 64, height: 64)
                    Text("\(percentile)%")
                        .font(.headline.bold())
                        .foregroundStyle(.white)
                }
            }
        }
    }
}

struct SessionCalendarView: View {
    let sessions: [SwimSession]
    @Binding var selectedDate: String?

    @State private var viewYear: Int
    @State private var viewMonth: Int

    init(sessions: [SwimSession], selectedDate: Binding<String?>) {
        self.sessions = sessions
        self._selectedDate = selectedDate
        let today = Date()
        let calendar = Calendar.current
        _viewYear = State(initialValue: calendar.component(.year, from: today))
        _viewMonth = State(initialValue: calendar.component(.month, from: today))
    }

    var body: some View {
        Card {
            VStack(spacing: 12) {
                HStack {
                    Text("Session calendar")
                        .font(.headline)
                    Spacer()
                    Button { shiftMonth(-1) } label: { Image(systemName: "chevron.left") }
                    Text(monthTitle)
                        .font(.subheadline.weight(.semibold))
                        .frame(minWidth: 120)
                    Button { shiftMonth(1) } label: { Image(systemName: "chevron.right") }
                }

                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 7), spacing: 6) {
                    ForEach(["M", "T", "W", "T", "F", "S", "S"], id: \.self) { day in
                        Text(day)
                            .font(.caption2.weight(.semibold))
                            .foregroundStyle(.secondary)
                    }

                    ForEach(cells.indices, id: \.self) { index in
                        if let cell = cells[index] {
                            Button {
                                selectedDate = selectedDate == cell.dateKey ? nil : cell.dateKey
                            } label: {
                                Text("\(cell.day)")
                                    .font(.caption.weight(.semibold))
                                    .frame(maxWidth: .infinity, minHeight: 32)
                                    .background(heatColor(cell.count), in: RoundedRectangle(cornerRadius: 6))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 6)
                                            .stroke(selectedDate == cell.dateKey ? Color("BrandBlue") : .clear, lineWidth: 2)
                                    )
                            }
                            .buttonStyle(.plain)
                        } else {
                            Color.clear.frame(minHeight: 32)
                        }
                    }
                }
            }
        }
    }

    private var monthTitle: String {
        var components = DateComponents(year: viewYear, month: viewMonth, day: 1)
        let date = Calendar.current.date(from: components) ?? Date()
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM yyyy"
        return formatter.string(from: date)
    }

    private var sessionsByDate: [String: Int] {
        sessions.reduce(into: [:]) { result, session in
            result[session.date, default: 0] += 1
        }
    }

    private var cells: [CalendarCell?] {
        var components = DateComponents(year: viewYear, month: viewMonth, day: 1)
        guard let firstDay = Calendar.current.date(from: components),
              let range = Calendar.current.range(of: .day, in: .month, for: firstDay) else { return [] }

        let weekday = (Calendar.current.component(.weekday, from: firstDay) + 5) % 7
        var result = Array(repeating: CalendarCell?.none, count: weekday)

        for day in range {
            let dateKey = String(format: "%04d-%02d-%02d", viewYear, viewMonth, day)
            result.append(CalendarCell(day: day, dateKey: dateKey, count: sessionsByDate[dateKey] ?? 0))
        }
        while result.count % 7 != 0 { result.append(nil) }
        return result
    }

    private func shiftMonth(_ delta: Int) {
        var components = DateComponents(year: viewYear, month: viewMonth + delta, day: 1)
        guard let date = Calendar.current.date(from: components) else { return }
        viewYear = Calendar.current.component(.year, from: date)
        viewMonth = Calendar.current.component(.month, from: date)
    }

    private func heatColor(_ count: Int) -> Color {
        switch count {
        case 0: return Color(.systemGray5)
        case 1: return Color("BrandBlue").opacity(0.25)
        case 2: return Color("BrandBlue").opacity(0.45)
        default: return Color("BrandBlue").opacity(0.7)
        }
    }

    private struct CalendarCell {
        let day: Int
        let dateKey: String
        let count: Int
    }
}
