import SwiftUI

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

                    profileCard
                    benchmarkCard
                    latestSessionCard
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Benchmark")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private var profileCard: some View {
        Card {
            VStack(alignment: .leading, spacing: 8) {
                Text("Your profile")
                    .font(.headline)
                Text("Age group: \(SwimBenchmarks.ageGroup(for: viewModel.profile.age))")
                Text("Sex: \(viewModel.profile.sex.capitalized)")
            }
        }
    }

    private var benchmarkCard: some View {
        let benchmark = SwimBenchmarks.benchmark(for: viewModel.profile.sex, age: viewModel.profile.age)
        return Card {
            VStack(alignment: .leading, spacing: 10) {
                Text("Recreational 100m pace targets")
                    .font(.headline)
                benchmarkRow("Advanced", pace: benchmark.advanced)
                benchmarkRow("Intermediate / median", pace: benchmark.intermediate)
                benchmarkRow("Beginner", pace: benchmark.beginner)
            }
        }
    }

    private var latestSessionCard: some View {
        let latest = SwimAnalysis.sortedSessions(viewModel.sessions).last
        let benchmark = SwimBenchmarks.benchmark(for: viewModel.profile.sex, age: viewModel.profile.age)
        let pace = latest?.metrics.paceSecPer100m
        let level = SwimBenchmarks.swimLevel(paceSecPer100m: pace, benchmark: benchmark)
        let percentile = SwimBenchmarks.computePacePercentile(paceSecPer100m: pace, benchmark: benchmark)

        return Card {
            VStack(alignment: .leading, spacing: 8) {
                Text("Latest swim")
                    .font(.headline)
                if let latest, let pace {
                    Text(SwimFormatters.formatDateLong(latest.date))
                        .foregroundStyle(.secondary)
                    Text("Pace: \(SwimFormatters.formatPace(pace))")
                    Text("Level: \(SwimBenchmarks.levelLabel(level))")
                    if let percentile {
                        Text("Estimated percentile: \(percentile)%")
                            .foregroundStyle(.secondary)
                    }
                } else {
                    Text("Upload a swim to compare against benchmarks.")
                        .foregroundStyle(.secondary)
                }
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
}
