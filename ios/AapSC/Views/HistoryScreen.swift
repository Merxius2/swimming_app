import SwiftUI

struct HistoryScreen: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @State private var expandedId: String?
    @State private var deleteId: String?
    @State private var selectedDate: String?

    private var sorted: [SwimSession] {
        viewModel.sessions.sorted { $0.date > $1.date }
    }

    private var filtered: [SwimSession] {
        guard let selectedDate else { return sorted }
        return sorted.filter { $0.date == selectedDate }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 12) {
                    if !sorted.isEmpty {
                        SessionCalendarView(sessions: viewModel.sessions, selectedDate: $selectedDate)

                        if let selectedDate {
                            HStack {
                                Text("Showing \(SwimFormatters.formatDateLong(selectedDate))")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                Spacer()
                                Button("Clear filter") { self.selectedDate = nil }
                                    .font(.caption.weight(.semibold))
                            }
                            .padding(.horizontal, 4)
                        }
                    }

                    if sorted.isEmpty {
                        ContentUnavailableView(
                            "No history yet",
                            systemImage: "clock.arrow.circlepath",
                            description: Text("Saved swims will appear here.")
                        )
                        .padding(.top, 40)
                    } else if filtered.isEmpty {
                        Text("No sessions on this date.")
                            .foregroundStyle(.secondary)
                            .padding()
                    } else {
                        ForEach(filtered) { session in
                            HistorySessionCard(
                                session: session,
                                isExpanded: expandedId == session.id,
                                onToggle: {
                                    expandedId = expandedId == session.id ? nil : session.id
                                },
                                onToggleStats: { include in
                                    viewModel.updateSession(id: session.id) { $0.excludeFromStats = !include }
                                },
                                onDelete: { deleteId = session.id }
                            )
                        }
                    }
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("History")
            .navigationBarTitleDisplayMode(.inline)
            .confirmationDialog(
                "Delete this session?",
                isPresented: Binding(
                    get: { deleteId != nil },
                    set: { if !$0 { deleteId = nil } }
                ),
                titleVisibility: .visible
            ) {
                Button("Delete", role: .destructive) {
                    if let deleteId {
                        viewModel.removeSession(id: deleteId)
                        if expandedId == deleteId { expandedId = nil }
                    }
                    deleteId = nil
                }
                Button("Cancel", role: .cancel) { deleteId = nil }
            }
        }
    }
}

private struct HistorySessionCard: View {
    let session: SwimSession
    let isExpanded: Bool
    let onToggle: () -> Void
    let onToggleStats: (Bool) -> Void
    let onDelete: () -> Void

    var body: some View {
        Card {
            VStack(alignment: .leading, spacing: 12) {
                Button(action: onToggle) {
                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text(SwimFormatters.formatDateLong(session.date))
                                    .font(.headline)
                                if session.excludeFromStats {
                                    Text("Excluded")
                                        .font(.caption2.bold())
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(Color(.systemGray5), in: Capsule())
                                }
                            }
                            Text(summaryLine)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        let coins = SwimCoinClaims.sessionTotalCoins(session)
                        if coins > 0 {
                            Text("+\(coins)")
                                .font(.caption.bold())
                                .foregroundStyle(Color("BrandBlue"))
                        }
                        Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                            .foregroundStyle(.secondary)
                    }
                }
                .buttonStyle(.plain)

                if isExpanded {
                    Divider()
                    detailGrid
                    Toggle("Include in stats", isOn: Binding(
                        get: { !session.excludeFromStats },
                        set: onToggleStats
                    ))
                    Button(role: .destructive, action: onDelete) {
                        Label("Delete session", systemImage: "trash")
                    }
                    .font(.subheadline)
                }
            }
        }
        .opacity(session.excludeFromStats ? 0.85 : 1)
    }

    private var summaryLine: String {
        let m = session.metrics
        return "\(SwimFormatters.formatDistance(m.distanceM)) · \(SwimFormatters.formatPace(m.paceSecPer100m)) · \(SwimFormatters.formatDuration(m.durationSec))"
    }

    private var detailGrid: some View {
        let m = session.metrics
        return LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
            detailItem("Active kcal", value: m.activeKcal.map(String.init) ?? "—")
            detailItem("Total kcal", value: m.totalKcal.map(String.init) ?? "—")
            detailItem("Heart rate", value: m.avgHeartRate.map { "\($0) bpm" } ?? "—")
            detailItem("Laps", value: m.laps.map(String.init) ?? "—")
            detailItem("Location", value: m.location.isEmpty ? "—" : m.location)
            detailItem("Time", value: m.timeRange.isEmpty ? "—" : m.timeRange)
        }
        .font(.caption)
    }

    private func detailItem(_ title: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title)
                .foregroundStyle(.secondary)
            Text(value)
                .fontWeight(.semibold)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
