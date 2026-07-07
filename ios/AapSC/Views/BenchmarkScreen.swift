import SwiftUI
import Charts

struct BenchmarkScreen: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @EnvironmentObject private var preferences: UserPreferencesService

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    ScreenHeader(
                        preferences.t("benchmark.title"),
                        subtitle: preferences.t("benchmark.subtitle"),
                        systemImage: "gauge.with.dots.needle.67percent"
                    )

                    if viewModel.profile.sex.isEmpty || viewModel.profile.age <= 0 {
                        profileRequiredCard
                    } else {
                        let statsSessions = SwimAnalysis.statsSessions(viewModel.sessions)
                        let latest = statsSessions.last
                        let pace = latest?.metrics.paceSecPer100m
                        let benchmark = SwimBenchmarks.benchmark(for: viewModel.profile.sex, age: viewModel.profile.age)
                        let ageGroup = SwimBenchmarks.ageGroup(for: viewModel.profile.age)

                        profileCard(benchmark: benchmark, ageGroup: ageGroup)

                        if pace == nil {
                            Card {
                                Text("Upload a session to compare your pace.")
                                    .foregroundStyle(.secondary)
                                    .frame(maxWidth: .infinity)
                            }
                        } else {
                            BenchmarkBadgeRankingView(
                                label: "\(preferences.t("benchmark.yourPace")) (\(ageGroup))",
                                percentile: SwimBenchmarks.computePacePercentile(paceSecPer100m: pace, benchmark: benchmark),
                                vsMedian: SwimBenchmarks.paceVsMedian(paceSecPer100m: pace, benchmark: benchmark)
                            )

                            Card {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text(preferences.t("benchmark.level"))
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    Text(SwimBenchmarks.levelLabel(
                                        SwimBenchmarks.swimLevel(paceSecPer100m: pace, benchmark: benchmark),
                                        t: preferences.translations
                                    ))
                                    .font(.title.bold())
                                    Text(SwimFormatters.formatPace(pace))
                                        .font(.title3)
                                        .foregroundStyle(.teal)
                                }
                            }

                            benchmarkChart(pace: pace!)
                        }

                        Text(preferences.t("benchmark.methodology"))
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle(preferences.t("benchmark.title"))
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private var profileRequiredCard: some View {
        Card {
            VStack(spacing: 12) {
                Text(preferences.t("benchmark.profileRequired"))
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 8)
        }
    }

    private func profileCard(benchmark: BenchmarkTier, ageGroup: String) -> some View {
        let sexLabel = viewModel.profile.sex == "female"
            ? preferences.t("settings.sexFemale")
            : preferences.t("settings.sexMale")
        return Card {
            VStack(alignment: .leading, spacing: 8) {
                Text(preferences.t("settings.profileTitle"))
                    .font(.headline)
                Text("\(preferences.t("settings.age")): \(ageGroup)")
                Text("\(preferences.t("settings.sex")): \(sexLabel)")
                Divider()
                benchmarkRow(preferences.t("benchmark.levels.advanced"), pace: benchmark.advanced)
                benchmarkRow("\(preferences.t("benchmark.levels.intermediate")) / \(preferences.t("benchmark.median"))", pace: benchmark.intermediate)
                benchmarkRow(preferences.t("benchmark.levels.beginner"), pace: benchmark.beginner)
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
                Text(preferences.t("benchmark.chartTitle"))
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
