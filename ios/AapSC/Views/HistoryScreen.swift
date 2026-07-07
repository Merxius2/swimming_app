import SwiftUI

struct HistoryScreen: View {
    @EnvironmentObject private var viewModel: SwimViewModel

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.sessions.isEmpty {
                    ContentUnavailableView(
                        "No history yet",
                        systemImage: "clock.arrow.circlepath",
                        description: Text("Saved swims will appear here.")
                    )
                } else {
                    List {
                        ForEach(SwimAnalysis.sortedSessions(viewModel.sessions).reversed()) { session in
                            HistoryRow(session: session)
                        }
                        .onDelete(perform: deleteSessions)
                    }
                    .listStyle(.insetGrouped)
                }
            }
            .navigationTitle("History")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private func deleteSessions(at offsets: IndexSet) {
        let sorted = SwimAnalysis.sortedSessions(viewModel.sessions).reversed()
        for index in offsets {
            let session = Array(sorted)[index]
            viewModel.deleteSession(id: session.id)
        }
    }
}

private struct HistoryRow: View {
    let session: SwimSession

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(SwimFormatters.formatDateLong(session.date))
                    .font(.headline)
                Spacer()
                if let coins = session.coinsEarned {
                    Text("+\(coins + (session.coinBonus ?? 0))")
                        .font(.caption.bold())
                        .foregroundStyle(Color("BrandBlue"))
                }
            }
            HStack {
                label("Distance", value: SwimFormatters.formatDistance(session.metrics.distanceM))
                label("Duration", value: SwimFormatters.formatDuration(session.metrics.durationSec))
                label("Pace", value: SwimFormatters.formatPace(session.metrics.paceSecPer100m))
            }
            .font(.caption)
        }
        .padding(.vertical, 4)
    }

    private func label(_ title: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title.uppercased())
                .foregroundStyle(.secondary)
            Text(value)
                .fontWeight(.semibold)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
