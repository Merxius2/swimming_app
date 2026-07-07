import SwiftUI
import Charts

struct ProgressScreen: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @Environment(\.openSettings) private var openSettings

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    ScreenHeader("Progress", subtitle: "Charts and trends over time", systemImage: "chart.line.uptrend.xyaxis")

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
                                    profile: viewModel.profile
                                )
                            )
                        }
                        paceChart
                        distanceChart
                        caloriesChart
                        heartRateChart
                        volumeChart
                        StrokeDonutChart(slices: SwimAnalysis.strokeChartData(viewModel.sessions.last))
                    }
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Progress")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    HStack(spacing: 12) {
                        CoinBadge(count: viewModel.totalCoins)
                        Button(action: openSettings) {
                            Image(systemName: "gearshape")
                        }
                    }
                }
            }
        }
    }

    private var emptyState: some View {
        Card {
            VStack(spacing: 12) {
                Image(systemName: "figure.pool.swim")
                    .font(.system(size: 44))
                    .foregroundStyle(Color("BrandBlue"))
                Text("No swims yet")
                    .font(.title3.bold())
                Text(SwimAnalysis.buildProgressOverviewMessage(profile: viewModel.profile, sessions: []))
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 24)
        }
    }

    private var overviewCard: some View {
        Card {
            VStack(alignment: .leading, spacing: 8) {
                Text("OVERVIEW")
                    .font(.caption.bold())
                    .foregroundStyle(.secondary)
                Text(SwimAnalysis.buildProgressOverviewMessage(
                    profile: viewModel.profile,
                    sessions: viewModel.sessions,
                    monthlyChallengeRerolls: viewModel.monthlyChallengeRerolls
                ))
            }
        }
    }

    private var latestSessionCard: some View {
        let latest = viewModel.sessions.last!
        let m = latest.metrics
        return Card {
            VStack(alignment: .leading, spacing: 12) {
                Text("Latest session")
                    .font(.headline)
                Text(SwimFormatters.formatDateShort(latest.date))
                    .font(.caption)
                    .foregroundStyle(.secondary)
                HStack {
                    metricBlock("Distance", value: SwimFormatters.formatDistance(m.distanceM), color: .blue)
                    metricBlock("Duration", value: SwimFormatters.formatDuration(m.durationSec), color: .orange)
                    metricBlock("Pace", value: SwimFormatters.formatPace(m.paceSecPer100m), color: .teal)
                    metricBlock("HR", value: m.avgHeartRate.map { "\($0) bpm" } ?? "—", color: .pink)
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
                    Text("All-time stats")
                        .font(.headline)
                    if excluded > 0 {
                        Text("Based on \(combined.sessionCount) of \(viewModel.sessions.count) sessions")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        statTile("Sessions", value: "\(combined.sessionCount)")
                        statTile("Distance", value: SwimFormatters.formatDistance(combined.totalDistanceM))
                        statTile("Time", value: SwimFormatters.formatDuration(combined.totalDurationSec))
                        statTile("Avg pace", value: SwimFormatters.formatPace(combined.avgPaceSecPer100m))
                        statTile("Best pace", value: SwimFormatters.formatPace(combined.bestPaceSecPer100m))
                        statTile("Calories", value: "\(combined.totalActiveKcal) kcal")
                        statTile("Laps", value: "\(combined.totalLaps)")
                        statTile("Avg HR", value: combined.avgHeartRate.map { "\($0) bpm" } ?? "—")
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
                Text("Pace trend")
                    .font(.headline)
                if points.isEmpty {
                    Text("Add swims with pace data to see this chart.").foregroundStyle(.secondary)
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
        chartBar(title: "Distance per session", keyPath: \.distanceM, color: .blue)
    }

    private var caloriesChart: some View {
        Card {
            VStack(alignment: .leading, spacing: 12) {
                Text("Calories")
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
                Text("Heart rate")
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
                Text("Weekly volume")
                    .font(.headline)
                if weekly.isEmpty {
                    Text("No distance data yet.").foregroundStyle(.secondary)
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

struct CoinBadge: View {
    let count: Int

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "bitcoinsign.circle.fill")
            Text("\(count)")
                .fontWeight(.semibold)
        }
        .font(.caption)
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(Color("BrandBlue").opacity(0.12), in: Capsule())
    }
}
