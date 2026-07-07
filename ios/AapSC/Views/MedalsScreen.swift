import SwiftUI

struct MedalsScreen: View {
    @EnvironmentObject private var viewModel: SwimViewModel

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    ScreenHeader(
                        "Medals",
                        subtitle: "Achievements from your swim journey",
                        systemImage: "medal"
                    )

                    Card {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Coming soon on iOS")
                                .font(.headline)
                            Text("The full medal system from the web app — distance milestones, streaks, seasonal badges, and monthly challenges — will be added in a follow-up release.")
                                .foregroundStyle(.secondary)

                            Divider()

                            Text("Current stats")
                                .font(.subheadline.weight(.semibold))
                            let combined = SwimAnalysis.combinedStats(viewModel.sessions)
                            statRow("Total swims", value: "\(combined.sessionCount)")
                            statRow("Total distance", value: SwimFormatters.formatDistance(combined.totalDistanceM))
                            statRow("Best pace", value: SwimFormatters.formatPace(combined.bestPaceSecPer100m))
                            statRow("Swim coins", value: "\(viewModel.totalCoins)")
                        }
                    }
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Medals")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    CoinBadge(count: viewModel.totalCoins)
                }
            }
        }
    }

    private func statRow(_ title: String, value: String) -> some View {
        HStack {
            Text(title)
            Spacer()
            Text(value)
                .fontWeight(.semibold)
        }
        .font(.subheadline)
    }
}
