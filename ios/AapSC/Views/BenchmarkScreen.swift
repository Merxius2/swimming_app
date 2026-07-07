import SwiftUI
import Charts

struct BenchmarkScreen: View {
    @EnvironmentObject private var viewModel: SwimViewModel

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    ScreenHeader(
                        "Benchmark",
                        subtitle: "Compare pace with your age group",
                        systemImage: "gauge.with.dots.needle.67percent"
                    )

                    if viewModel.profile.sex.isEmpty || viewModel.profile.age <= 0 {
                        profileRequiredCard
                    } else {
                        let statsSessions = SwimAnalysis.statsSessions(viewModel.sessions)
                        let latest = statsSessions.last
                        let pace = latest?.metrics.paceSecPer100m
                        let benchmark = SwimBenchmarks.benchmark(for: viewModel.profile.sex, age: viewModel.profile.age)

                        profileCard(benchmark: benchmark)

                        if pace == nil {
                            Card {
                                Text("Upload a session to compare your pace.")
                                    .foregroundStyle(.secondary)
                                    .frame(maxWidth: .infinity)
                            }
                        } else {
                            BenchmarkBadgeRankingView(
                                label: "Your pace (\(SwimBenchmarks.ageGroup(for: viewModel.profile.age)))",
                                percentile: SwimBenchmarks.computePacePercentile(paceSecPer100m: pace, benchmark: benchmark),
                                vsMedian: SwimBenchmarks.paceVsMedian(paceSecPer100m: pace, benchmark: benchmark)
                            )

                            Card {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Swim level")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    Text(SwimBenchmarks.levelLabel(
                                        SwimBenchmarks.swimLevel(paceSecPer100m: pace, benchmark: benchmark)
                                    ))
                                    .font(.title.bold())
                                    Text(SwimFormatters.formatPace(pace))
                                        .font(.title3)
                                        .foregroundStyle(.teal)
                                }
                            }

                            benchmarkChart(pace: pace!)
                        }

                        Text("Benchmarks reflect recreational 25m pool swimmers, not competitive long-course standards.")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Benchmark")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private var profileRequiredCard: some View {
        Card {
            VStack(spacing: 12) {
                Text("Set your sex and age in Settings to compare against benchmarks.")
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 8)
        }
    }

    private func profileCard(benchmark: BenchmarkTier) -> some View {
        Card {
            VStack(alignment: .leading, spacing: 8) {
                Text("Your profile")
                    .font(.headline)
                Text("Age group: \(SwimBenchmarks.ageGroup(for: viewModel.profile.age))")
                Text("Sex: \(viewModel.profile.sex.capitalized)")
                Divider()
                benchmarkRow("Advanced", pace: benchmark.advanced)
                benchmarkRow("Intermediate / median", pace: benchmark.intermediate)
                benchmarkRow("Beginner", pace: benchmark.beginner)
            }
        }
    }

    private func benchmarkChart(pace: Int) -> some View {
        let data = SwimBenchmarks.benchmarkChartData(
            paceSecPer100m: pace,
            sex: viewModel.profile.sex,
            age: viewModel.profile.age
        )
        return Card {
            VStack(alignment: .leading, spacing: 12) {
                Text("Pace comparison")
                    .font(.headline)
                Chart(data) { item in
                    BarMark(
                        x: .value("Pace", item.value),
                        y: .value("Category", item.name)
                    )
                    .foregroundStyle(barColor(item.colorName))
                }
                .frame(height: 260)
            }
        }
    }

    private func benchmarkRow(_ title: String, pace: Int) -> some View {
        HStack {
            Text(title)
            Spacer()
            Text(SwimFormatters.formatPace(pace))
                .fontWeight(.semibold)
        }
        .font(.subheadline)
    }

    private func barColor(_ name: String) -> Color {
        switch name {
        case "green": return .green
        case "blue": return .blue
        case "purple": return .purple
        case "orange": return .orange
        case "red": return .red
        default: return Color("BrandBlue")
        }
    }
}
