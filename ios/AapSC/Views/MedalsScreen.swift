import SwiftUI

struct MedalsScreen: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @EnvironmentObject private var preferences: UserPreferencesService
    @Environment(\.openCoins) private var openCoins

    private var shimmerPlus: Bool {
        SwimCoinStore.hasMedalShimmerPlus(viewModel.storeUnlocks)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    ScreenHeader(
                        preferences.t("medals.title"),
                        subtitle: preferences.t("medals.subtitle"),
                        systemImage: "medal"
                    )

                    statsCard

                    if viewModel.sessions.isEmpty {
                        emptyState
                    }

                    MonthlyChallengeHistoryView()

                    ForEach(SwimMedalCopy.categories, id: \.self) { category in
                        categorySection(category)
                    }
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle(preferences.t("medals.title"))
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

    private var statsCard: some View {
        let stats = SwimMedals.getMedalStats(viewModel.evaluatedMedals)
        return Card {
            HStack {
                VStack(alignment: .leading, spacing: 6) {
                    Text(preferences.t("medals.subtitle"))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    HStack(alignment: .firstTextBaseline, spacing: 4) {
                        Text("\(stats.earned)")
                            .font(.system(size: 34, weight: .bold))
                        Text("/ \(stats.total)")
                            .font(.title3)
                            .foregroundStyle(.secondary)
                    }
                }
                Spacer()
                Text(stats.earned > 0 ? "🏆" : "🎯")
                    .font(.system(size: 44))
            }

            Divider().padding(.vertical, 8)

            HStack {
                Text(preferences.t("coins.label"))
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Spacer()
                CoinBadge(
                    count: viewModel.totalCoins,
                    golden: SwimCoinStore.hasGoldenCoinBadge(viewModel.storeUnlocks)
                )
            }
        }
    }

    private var emptyState: some View {
        Card {
            VStack(spacing: 12) {
                Text(preferences.t("medals.empty"))
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                Text(preferences.t("progress.emptyDesc"))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity)
        }
    }

    @ViewBuilder
    private func categorySection(_ category: String) -> some View {
        let categoryMedals = viewModel.evaluatedMedals.filter { $0.category == category }
        if !categoryMedals.isEmpty {
            let earnedInCategory = categoryMedals.filter(\.earned).count

            VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(SwimMedalCopy.categoryLabel(category, t: preferences.translations))
                    .font(.caption.bold())
                    .foregroundStyle(.secondary)
                    .textCase(.uppercase)
                Spacer()
                Text("\(earnedInCategory)/\(categoryMedals.count)")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(categoryMedals) { medal in
                    MedalCardView(medal: medal, shimmerPlus: shimmerPlus)
                }
            }
        }
        }
    }
}
