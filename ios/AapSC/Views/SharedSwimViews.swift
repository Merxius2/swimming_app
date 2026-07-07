import SwiftUI
import Charts

struct RecordsSectionView: View {
    @EnvironmentObject private var preferences: UserPreferencesService
    let records: PersonalRecords?

    var body: some View {
        if let records {
            let entries = buildEntries(records)
            if !entries.isEmpty {
                Card {
                    VStack(alignment: .leading, spacing: 12) {
                        Label(preferences.t("records.title"), systemImage: "trophy.fill")
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
            entries.append(RecordEntry(title: preferences.t("records.longestDistance"), value: SwimFormatters.formatDistance(Int(record.value)), date: record.date, color: .blue))
        }
        if let record = records.fastestPace {
            entries.append(RecordEntry(title: preferences.t("records.fastestPace"), value: SwimFormatters.formatPace(Int(record.value)), date: record.date, color: .teal))
        }
        if let record = records.mostActiveCalories {
            entries.append(RecordEntry(title: preferences.t("records.mostCalories"), value: "\(Int(record.value)) " + preferences.t("common.kcal"), date: record.date, color: .red))
        }
        if let record = records.mostTotalCalories {
            entries.append(RecordEntry(title: preferences.t("records.mostTotalCalories"), value: "\(Int(record.value)) " + preferences.t("common.kcal"), date: record.date, color: .orange))
        }
        if let record = records.mostLaps {
            entries.append(RecordEntry(title: preferences.t("records.mostLaps"), value: "\(Int(record.value))", date: record.date, color: .purple))
        }
        if let record = records.longestDuration {
            entries.append(RecordEntry(title: preferences.t("records.longestDuration"), value: SwimFormatters.formatDuration(Int(record.value)), date: record.date, color: .yellow))
        }
        if let record = records.highestHeartRate {
            entries.append(RecordEntry(title: preferences.t("records.highestHeartRate"), value: "\(Int(record.value)) " + preferences.t("common.bpm"), date: record.date, color: .pink))
        }
        return entries
    }
}

struct SessionFeedbackCard: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @EnvironmentObject private var preferences: UserPreferencesService
    let feedback: SessionFeedbackSummary
    var isLoading: Bool = false

    var body: some View {
        Card {
            VStack(alignment: .leading, spacing: 12) {
                if isLoading {
                    HStack(spacing: 8) {
                        ProgressView()
                        Text(preferences.t("feedback.aiLoading"))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                MascotCoachView(
                    mascotId: viewModel.mascotId,
                    message: feedback.coachMessage
                )

                if feedback.aiEnhanced {
                    Label("AI", systemImage: "sparkles")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.purple)
                }

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

                Text(preferences.t("feedback.benchmarkLevel", params: [
                    "level": SwimBenchmarks.levelLabel(feedback.benchmarkLevel, t: preferences.translations)
                ]))
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
            }
        }
    }
}

struct MonthlyChallengesCardView: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @EnvironmentObject private var preferences: UserPreferencesService
    @Environment(\.openCoins) private var openCoins

    private let tierSteps = ["bronze", "silver", "gold"]

    var body: some View {
        let monthKey = SwimMonthlyChallenges.getMonthKey()
        let gameplay = MascotConstants.gameplay(viewModel.mascotId)
        let state = SwimMonthlyChallenges.evaluateMonthlyChallenges(
            sessions: viewModel.sessions,
            monthKey: monthKey,
            rerolls: viewModel.monthlyChallengeRerolls,
            intensity: gameplay.challengeIntensity
        )
        let currentTierIndex = state.tier.flatMap { tierSteps.firstIndex(of: $0) } ?? -1
        let nextTier = currentTierIndex >= 0 && currentTierIndex < tierSteps.count - 1
            ? tierSteps[currentTierIndex + 1]
            : nil
        let nextUpgradeCoins = nextTier.map {
            SwimCoins.monthlyTierCoinDelta(fromTier: state.tier, toTier: $0)
        } ?? 0
        let rerollAvailable = SwimMonthlyChallenges.hasRerollAvailability(
            monthKey: monthKey,
            rerolls: viewModel.monthlyChallengeRerolls,
            credits: viewModel.challengeRerollCredits,
            freeLimit: gameplay.freeMonthlyRerolls
        )

        Card {
            VStack(alignment: .leading, spacing: 14) {
                HStack(alignment: .top, spacing: 14) {
                    VStack(spacing: 8) {
                        MonthlyMedalIconView(tier: state.tier, size: 64, muted: state.tier == nil)
                        if let tier = state.tier {
                            Text(SwimMonthlyChallengeFormatters.tierLabel(tier, t: preferences.translations))
                                .font(.caption2.weight(.semibold))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(tierColor(tier).opacity(0.2), in: Capsule())
                            CoinBadge(count: SwimCoins.monthlyTierCoins(tier), golden: false)
                        }
                        HStack(spacing: 6) {
                            ForEach(Array(tierSteps.enumerated()), id: \.offset) { index, tier in
                                Circle()
                                    .fill(index <= currentTierIndex ? tierColor(tier) : Color(.systemGray4))
                                    .frame(width: 8, height: 8)
                            }
                        }
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        Text(preferences.t("monthlyChallenges.title"))
                            .font(.headline)
                        Text(SwimMonthlyChallengeFormatters.monthLabel(monthKey, locale: preferences.locale))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Text(preferences.t("monthlyChallenges.subtitle"))
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }

                ForEach(Array(state.challenges.enumerated()), id: \.element.id) { index, challenge in
                    challengeRow(
                        challenge: challenge,
                        index: index,
                        monthKey: monthKey,
                        gameplay: gameplay
                    )
                }

                if viewModel.challengeRerollCredits > 0 {
                    Text(preferences.t("monthlyChallenges.rerollCredits", params: [
                        "count": String(viewModel.challengeRerollCredits)
                    ]))
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }

                if !rerollAvailable {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(preferences.t("monthlyChallenges.rerollUsed"))
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                        Button(preferences.t("monthlyChallenges.rerollBuyHint")) {
                            openCoins()
                        }
                        .font(.caption2)
                        .foregroundStyle(Color("BrandBlue"))
                    }
                }

                Divider()

                Text(preferences.t("coins.monthlyRewards"))
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(.secondary)
                    .textCase(.uppercase)

                HStack(spacing: 8) {
                    ForEach(Array(tierSteps.enumerated()), id: \.offset) { index, tier in
                        let earned = currentTierIndex >= index
                        let isCurrent = state.tier == tier
                        VStack(spacing: 4) {
                            Text(SwimMonthlyChallengeFormatters.tierLabel(tier, t: preferences.translations))
                                .font(.caption2.weight(.medium))
                            CoinBadge(count: SwimCoins.monthlyTierCoins(tier), golden: false)
                        }
                        .padding(.horizontal, 8)
                        .padding(.vertical, 6)
                        .background(
                            isCurrent
                                ? Color("BrandBlue").opacity(0.12)
                                : earned
                                    ? Color.green.opacity(0.12)
                                    : Color(.secondarySystemBackground),
                            in: RoundedRectangle(cornerRadius: 8)
                        )
                    }
                }

                if let nextTier, nextUpgradeCoins > 0 {
                    Text(preferences.t("coins.monthlyNextUpgrade", params: [
                        "tier": SwimMonthlyChallengeFormatters.tierLabel(nextTier, t: preferences.translations),
                        "amount": String(nextUpgradeCoins)
                    ]))
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }

                Text(preferences.t("monthlyChallenges.tierHint"))
                    .font(.caption2)
                    .foregroundStyle(.secondary)

                if let requiredTier = gameplay.requiredMonthlyTier, gameplay.monthlyPenaltyCoins > 0 {
                    Text(preferences.t("monthlyChallenges.coachRequirement", params: [
                        "name": MascotConstants.displayName(viewModel.mascotId, t: preferences.translations),
                        "tier": SwimMonthlyChallengeFormatters.tierLabel(requiredTier, t: preferences.translations),
                        "amount": String(gameplay.monthlyPenaltyCoins)
                    ]))
                        .font(.caption2)
                        .foregroundStyle(.red.opacity(0.85))
                }
            }
        }
    }

    @ViewBuilder
    private func challengeRow(
        challenge: MonthlyChallenge,
        index: Int,
        monthKey: String,
        gameplay: MascotGameplay
    ) -> some View {
        let pct = challenge.target > 0
            ? min(100, Int(round(Double(challenge.current) / Double(challenge.target) * 100)))
            : 0
        let showReroll = SwimMonthlyChallenges.canRerollMonthlyChallenge(
            sessions: viewModel.sessions,
            monthKey: monthKey,
            tierIndex: index,
            rerolls: viewModel.monthlyChallengeRerolls,
            credits: viewModel.challengeRerollCredits,
            intensity: gameplay.challengeIntensity,
            freeLimit: gameplay.freeMonthlyRerolls
        )

        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(SwimMonthlyChallengeFormatters.challengeTypeLabel(challenge.type, t: preferences.translations))
                    .font(.subheadline.weight(.medium))
                Spacer()
                if showReroll {
                    Button {
                        viewModel.rerollMonthlyChallenge(monthKey: monthKey, tierIndex: index)
                    } label: {
                        Label(preferences.t("monthlyChallenges.reroll"), systemImage: "shuffle")
                            .font(.caption2.weight(.medium))
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.mini)
                }
                if challenge.completed {
                    Text(preferences.t("monthlyChallenges.done"))
                        .font(.caption2.weight(.bold))
                        .foregroundStyle(.green)
                        .textCase(.uppercase)
                }
            }

            Text(SwimMonthlyChallengeFormatters.formatChallengeTarget(challenge.type, challenge.target, t: preferences.translations))
                .font(.caption)
                .foregroundStyle(.secondary)

            HStack {
                Text("\(SwimMonthlyChallengeFormatters.formatChallengeValue(challenge.type, challenge.current, t: preferences.translations)) / \(SwimMonthlyChallengeFormatters.formatChallengeValue(challenge.type, challenge.target, t: preferences.translations))")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Spacer()
                Text("\(pct)%")
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(Color("BrandBlue"))
            }

            ProgressView(value: Double(min(challenge.current, challenge.target)), total: Double(max(challenge.target, 1)))
                .tint(challenge.completed ? .green : Color("BrandBlue"))
        }
        .padding(10)
        .background(
            challenge.completed ? Color.green.opacity(0.08) : Color(.secondarySystemBackground),
            in: RoundedRectangle(cornerRadius: 10)
        )
    }

    private func tierColor(_ tier: String) -> Color {
        switch tier {
        case "gold": return .yellow
        case "silver": return .gray
        default: return .orange
        }
    }
}

struct StrokeDonutChart: View {
    @EnvironmentObject private var preferences: UserPreferencesService
    let slices: [StrokeChartSlice]

    var body: some View {
        let total = slices.map(\.value).reduce(0, +)
        Card {
            VStack(alignment: .leading, spacing: 12) {
                Text(preferences.t("progress.strokeMix"))
                    .font(.headline)

                if slices.isEmpty || total == 0 {
                    Text(preferences.t("progress.subtitle"))
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
    @EnvironmentObject private var preferences: UserPreferencesService
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
                    Text(vsMedian == "above"
                        ? preferences.t("benchmark.badges.aboveMedian")
                        : preferences.t("benchmark.badges.belowMedian"))
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
    @EnvironmentObject private var preferences: UserPreferencesService
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
                    Text(preferences.t("history.calendarTitle"))
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
        formatter.locale = preferences.locale
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
