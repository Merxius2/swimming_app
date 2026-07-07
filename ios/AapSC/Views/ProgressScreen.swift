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
                        summaryCard
                        paceChart
                        volumeChart
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

    private var summaryCard: some View {
        let combined = SwimAnalysis.combinedStats(viewModel.sessions)
        return Card {
            VStack(alignment: .leading, spacing: 8) {
                Text(SwimAnalysis.buildProgressOverviewMessage(profile: viewModel.profile, sessions: viewModel.sessions))
                    .font(.body)
                HStack {
                    statBlock(title: "Sessions", value: "\(combined.sessionCount)")
                    statBlock(title: "Distance", value: SwimFormatters.formatDistance(combined.totalDistanceM))
                    statBlock(title: "Avg pace", value: SwimFormatters.formatPace(combined.avgPaceSecPer100m))
                }
            }
        }
    }

    private var paceChart: some View {
        let points = SwimAnalysis.chartSessions(viewModel.sessions).filter { $0.paceSecPer100m != nil }
        return Card {
            VStack(alignment: .leading, spacing: 12) {
                Text("Pace trend")
                    .font(.headline)
                if points.isEmpty {
                    Text("Add swims with pace data to see this chart.")
                        .foregroundStyle(.secondary)
                } else {
                    Chart(points) { point in
                        LineMark(
                            x: .value("Date", point.dateLabel),
                            y: .value("Pace", point.paceSecPer100m ?? 0)
                        )
                        .foregroundStyle(Color("BrandBlue"))
                        PointMark(
                            x: .value("Date", point.dateLabel),
                            y: .value("Pace", point.paceSecPer100m ?? 0)
                        )
                    }
                    .frame(height: 220)
                }
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
                    Text("No distance data yet.")
                        .foregroundStyle(.secondary)
                } else {
                    Chart(weekly) { week in
                        BarMark(
                            x: .value("Week", week.weekLabel),
                            y: .value("Distance", week.distanceM)
                        )
                        .foregroundStyle(Color("BrandBlue").gradient)
                    }
                    .frame(height: 220)
                }
            }
        }
    }

    private func statBlock(title: String, value: String) -> some View {
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
