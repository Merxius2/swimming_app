import SwiftUI

struct MedalsScreen: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @Environment(\.openCoins) private var openCoins

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
                        let stats = SwimMedals.getMedalStats(viewModel.evaluatedMedals)
                        VStack(alignment: .leading, spacing: 12) {
                            Text("\(stats.earned) / \(stats.total) medals earned")
                                .font(.headline)

                            ForEach(viewModel.evaluatedMedals.filter(\.earned).prefix(12)) { medal in
                                HStack {
                                    Image(systemName: "medal.fill")
                                        .foregroundStyle(medalColor(medal.tier))
                                    Text(medal.id.replacingOccurrences(of: "_", with: " ").capitalized)
                                    Spacer()
                                    Text(medal.tier.capitalized)
                                        .font(.caption.weight(.semibold))
                                        .foregroundStyle(.secondary)
                                }
                            }

                            if stats.earned > 12 {
                                Text("+ \(stats.earned - 12) more")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
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
                    Button(action: openCoins) {
                        CoinBadge(
                            count: viewModel.totalCoins,
                            golden: SwimCoinStore.hasGoldenCoinBadge(viewModel.storeUnlocks)
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private func medalColor(_ tier: String) -> Color {
        switch tier {
        case "gold": return .yellow
        case "silver": return .gray
        default: return .orange
        }
    }
}
