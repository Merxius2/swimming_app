import SwiftUI
import Charts

struct ProgressScreen: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @EnvironmentObject private var preferences: UserPreferencesService
    @Environment(\.openUpload) private var openUpload

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    ScreenHeader(
                        preferences.t("progress.title"),
                        subtitle: preferences.t("progress.subtitle"),
                        systemImage: "chart.line.uptrend.xyaxis"
                    )

                    if viewModel.sessions.isEmpty {
                        emptyState
                    } else {
                        overviewCard
                        MonthlyChallengesCardView()
                        latestSessionCard
                        allTimeStatsCard
                        RecordsSectionView(records: SwimRecords.getPersonalRecords(viewModel.sessions))
                        if let latest = viewModel.sessions.last {
                            SessionFeedbackCard(
                                feedback: SwimAnalysis.buildPersonalFeedback(
                                    session: latest,
                                    allSessions: viewModel.sessions,
                                    profile: viewModel.profile,
                                    t: preferences.translations,
                                    monthlyChallengeRerolls: viewModel.monthlyChallengeRerolls
                                ),
                                titleKey: "progress.sessionFeedbackTitle"
                            )
                        }
                        paceChart
                        distanceChart
                        caloriesChart
                        heartRateChart
                        volumeChart
                        StrokeDonutChart(slices: SwimAnalysis.strokeChartData(
                            viewModel.sessions.last,
                            t: preferences.translations
                        ))
                    }
                }
                .padding()
            }
            .themedPageBackground()
            .navigationTitle(preferences.t("progress.title"))
            .navigationBarTitleDisplayMode(.inline)
            .swimTopBarActions()
            .themedNavigationBar()
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Card {
                MascotCoachView(
                    mascotId: viewModel.mascotId,
                    message: emptyMascotMessage,
                    level: MascotConstants.coachedLevel(viewModel.mascotId),
                    coachName: MascotConstants.displayName(viewModel.mascotId, t: preferences.translations),
                    size: 200,
                    animated: true
                )
            }

            Card {
                VStack(spacing: 16) {
                    Image(systemName: "chart.line.uptrend.xyaxis")
                        .font(.system(size: 44))
                        .foregroundStyle(Color("BrandBlue"))
                    Text(preferences.t("progress.emptyTitle"))
                        .font(.title2.bold())
                    Text(preferences.t("progress.emptyDesc"))
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                    Button(action: openUpload) {
                        Text(preferences.t("progress.emptyCta"))
                            .font(.subheadline.weight(.semibold))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Color("BrandBlue"))
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
            }
        }
    }

    private var emptyMascotMessage: String {
        let template = preferences.t("progress.mascotEmpty")
        let name = viewModel.profile.name.trimmingCharacters(in: .whitespacesAndNewlines)
        let displayName = name.isEmpty ? preferences.t("settings.swimmerNamePlaceholder") : name
        return template.replacingOccurrences(of: "{name}", with: displayName)
    }

    private var overviewCard: some View {
        let overviewMessage = SwimAnalysis.buildProgressOverviewMessage(
            profile: viewModel.profile,
            sessions: viewModel.sessions,
            t: preferences.translations,
            monthlyChallengeRerolls: viewModel.monthlyChallengeRerolls
        )
        let overviewTone = MascotPresentation.resolveBubbleTone(message: overviewMessage)

        return Card {
            VStack(alignment: .leading, spacing: 12) {
                Text(preferences.t("progress.overviewTitle"))
                    .font(.caption.bold())
                    .foregroundStyle(.secondary)
                    .textCase(.uppercase)
                    .tracking(1.1)

                MascotCoachView(
                    mascotId: viewModel.mascotId,
                    message: overviewMessage,
                    level: MascotConstants.coachedLevel(viewModel.mascotId),
                    bubbleTone: overviewTone,
                    coachName: MascotConstants.displayName(viewModel.mascotId, t: preferences.translations),
                    size: 220,
                    animated: true
                )
            }
        }
    }

    private var latestSessionCard: some View {
        let latest = viewModel.sessions.last!
        let m = latest.metrics
        return Card {
            VStack(alignment: .leading, spacing: 12) {
                Text(preferences.t("progress.latestSession"))
                    .font(.headline)
                Text(SwimFormatters.formatDateShort(latest.date))
                    .font(.caption)
                    .foregroundStyle(.secondary)
                HStack {
                    metricBlock(preferences.t("upload.fields.distance"), value: SwimFormatters.formatDistance(m.distanceM), color: .blue)
                    metricBlock(preferences.t("upload.fields.duration"), value: SwimFormatters.formatDuration(m.durationSec), color: .orange)
                    metricBlock(preferences.t("upload.fields.pace"), value: SwimFormatters.formatPace(m.paceSecPer100m), color: .teal)
                    metricBlock(preferences.t("upload.fields.heartRate"), value: m.avgHeartRate.map { "\($0) " + preferences.t("common.bpm") } ?? "—", color: .pink)
                }
            }
        }
    }

    private var allTimeStatsCard: some View {
        guard let combined = SwimAnalysis.combinedStats(viewModel.sessions) else {
            return AnyView(EmptyView())
        }
        let excluded = viewModel.sessions.count - SwimAnalysis.statsSessions(viewModel.sessions).count
        return AnyView(
            Card {
                VStack(alignment: .leading, spacing: 12) {
                    Text(preferences.t("progress.allTimeStats"))
                        .font(.headline)
                    if excluded > 0 {
                        Text(preferences.t("progress.statsBasedOn", params: [
                            "count": String(combined.sessionCount),
                            "total": String(viewModel.sessions.count)
                        ]))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        statTile(preferences.t("progress.totalSessions"), value: "\(combined.sessionCount)")
                        statTile(preferences.t("progress.totalDistance"), value: SwimFormatters.formatDistance(combined.totalDistanceM))
                        statTile(preferences.t("progress.totalTime"), value: SwimFormatters.formatDuration(combined.totalDurationSec))
                        statTile(preferences.t("progress.avgPace"), value: SwimFormatters.formatPace(combined.avgPaceSecPer100m))
                        statTile(preferences.t("progress.bestPace"), value: SwimFormatters.formatPace(combined.bestPaceSecPer100m))
                        statTile(preferences.t("progress.totalCalories"), value: "\(combined.totalActiveKcal) " + preferences.t("common.kcal"))
                        statTile(preferences.t("progress.totalLaps"), value: "\(combined.totalLaps)")
                        statTile(preferences.t("progress.avgHeartRate"), value: combined.avgHeartRate.map { "\($0) " + preferences.t("common.bpm") } ?? "—")
                        coinsStatTile
                    }
                }
            }
        )
    }

    private var chartPoints: [ChartSessionPoint] {
        SwimAnalysis.chartSessions(viewModel.sessions)
    }

    private var paceChart: some View {
        let points = chartPoints.filter { $0.paceSecPer100m != nil }
        let domain = SwimFormatters.getPaceChartDomain(points.map(\.paceSecPer100m))
        return Card {
            VStack(alignment: .leading, spacing: 12) {
                Text(preferences.t("progress.paceChart"))
                    .font(.headline)
                if points.isEmpty {
                    Text(preferences.t("medals.progress.noPaceYet")).foregroundStyle(.secondary)
                } else {
                    Chart(points) { point in
                        LineMark(
                            x: .value("Date", point.dateLabel),
                            y: .value("Pace", point.paceSecPer100m ?? 0)
                        )
                        .foregroundStyle(.teal)
                        PointMark(
                            x: .value("Date", point.dateLabel),
                            y: .value("Pace", point.paceSecPer100m ?? 0)
                        )
                    }
                    .chartYScale(domain: domain ?? 90...180)
                    .chartYAxis { AxisMarks { _ in AxisGridLine(); AxisTick(); AxisValueLabel() } }
                    .frame(height: 220)
                }
            }
        }
    }

    private var distanceChart: some View {
        chartBar(title: preferences.t("progress.distanceChart"), keyPath: \.distanceM, color: .blue)
    }

    private var caloriesChart: some View {
        Card {
            VStack(alignment: .leading, spacing: 12) {
                Text(preferences.t("progress.caloriesChart"))
                    .font(.headline)
                Chart(chartPoints) { point in
                    AreaMark(
                        x: .value("Date", point.dateLabel),
                        y: .value("Active", point.activeKcal ?? 0)
                    )
                    .foregroundStyle(.red.opacity(0.25))
                    LineMark(
                        x: .value("Date", point.dateLabel),
                        y: .value("Active", point.activeKcal ?? 0)
                    )
                    .foregroundStyle(.red)
                }
                .frame(height: 200)
            }
        }
    }

    private var heartRateChart: some View {
        Card {
            VStack(alignment: .leading, spacing: 12) {
                Text(preferences.t("progress.heartRateChart"))
                    .font(.headline)
                Chart(chartPoints.filter { $0.avgHeartRate != nil }) { point in
                    LineMark(
                        x: .value("Date", point.dateLabel),
                        y: .value("BPM", point.avgHeartRate ?? 0)
                    )
                    .foregroundStyle(.orange)
                    PointMark(
                        x: .value("Date", point.dateLabel),
                        y: .value("BPM", point.avgHeartRate ?? 0)
                    )
                }
                .frame(height: 200)
            }
        }
    }

    private var volumeChart: some View {
        let weekly = SwimAnalysis.weeklyVolumeData(viewModel.sessions)
        return Card {
            VStack(alignment: .leading, spacing: 12) {
                Text(preferences.t("progress.weeklyVolume"))
                    .font(.headline)
                if weekly.isEmpty {
                    Text(preferences.t("progress.emptyDesc")).foregroundStyle(.secondary)
                } else {
                    Chart(weekly) { week in
                        BarMark(
                            x: .value("Week", week.weekLabel),
                            y: .value("Distance", week.distanceM)
                        )
                        .foregroundStyle(.purple.gradient)
                    }
                    .frame(height: 220)
                }
            }
        }
    }

    private func chartBar(title: String, keyPath: KeyPath<ChartSessionPoint, Int?>, color: Color) -> some View {
        Card {
            VStack(alignment: .leading, spacing: 12) {
                Text(title)
                    .font(.headline)
                Chart(chartPoints.filter { $0[keyPath: keyPath] != nil }) { point in
                    BarMark(
                        x: .value("Date", point.dateLabel),
                        y: .value("Value", point[keyPath: keyPath] ?? 0)
                    )
                    .foregroundStyle(color.gradient)
                }
                .frame(height: 200)
            }
        }
    }

    private var coinsStatTile: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(preferences.t("coins.label").uppercased())
                .font(.caption2.weight(.semibold))
                .foregroundStyle(.secondary)
            CoinBadge(
                count: viewModel.totalCoins,
                golden: SwimCoinStore.hasGoldenCoinBadge(viewModel.storeUnlocks)
            )
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func metricBlock(_ title: String, value: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title.uppercased())
                .font(.caption2)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.subheadline.bold())
                .foregroundStyle(color)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func statTile(_ title: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title.uppercased())
                .font(.caption2.weight(.semibold))
                .foregroundStyle(.secondary)
            Text(value)
                .font(.subheadline.bold())
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
