import SwiftUI

struct MedalCardView: View {
    let medal: EvaluatedMedal
    var shimmerPlus: Bool = false

    var body: some View {
        Card {
            HStack(alignment: .top, spacing: 12) {
                MedalIconView(tier: medal.tier, earned: medal.earned, size: 48)

                VStack(alignment: .leading, spacing: 6) {
                    HStack(alignment: .top) {
                        Text(SwimMedalCopy.title(for: medal.id))
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(medal.earned ? .primary : .secondary)
                        Spacer(minLength: 8)
                        if SwimCoins.medalTierCoins(medal.tier) > 0 {
                            CoinBadge(
                                count: SwimCoins.medalTierCoins(medal.tier),
                                golden: false
                            )
                            .opacity(medal.earned ? 1 : 0.6)
                        }
                    }

                    Text(SwimMedalCopy.description(for: medal.id))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)

                    if let progress = medal.progress, !medal.earned {
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text(progressSummary(progress))
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                                    .lineLimit(1)
                                Spacer()
                                Text("\(progress.percent)%")
                                    .font(.caption2.weight(.semibold))
                                    .foregroundStyle(Color("BrandBlue"))
                            }
                            ProgressView(value: Double(progress.percent), total: 100)
                                .tint(Color("BrandBlue"))
                        }
                    }

                    if medal.earned, let earnedAt = medal.earnedAt {
                        Text("Earned on \(SwimFormatters.formatDateLong(earnedAt))")
                            .font(.caption2.weight(.medium))
                            .foregroundStyle(Color("BrandBlue"))
                    }

                    if medal.earned, !medal.periods.isEmpty {
                        Text(SwimMedalCopy.formatPeriods(medal.periods))
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .overlay(alignment: .topLeading) {
                if medal.earned {
                    Text("Earned")
                        .font(.caption2.weight(.bold))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(tierColor(medal.tier).opacity(0.2), in: Capsule())
                        .foregroundStyle(tierColor(medal.tier))
                }
            }
        }
        .overlay {
            if medal.earned && shimmerPlus {
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(tierColor(medal.tier).opacity(0.35), lineWidth: 1)
            }
        }
        .opacity(medal.earned ? 1 : 0.92)
    }

    private func progressSummary(_ progress: MedalProgress) -> String {
        let current = formatProgressValue(progress.kind, progress.current)
        let target = formatProgressValue(progress.kind, progress.target)
        return "\(current) / \(target)"
    }

    private func formatProgressValue(_ kind: String, _ value: Int?) -> String {
        guard let value else { return "—" }
        switch kind {
        case "distance":
            return SwimFormatters.formatDistance(value)
        case "duration":
            return SwimFormatters.formatDuration(value)
        case "kcal":
            return "\(value) kcal"
        case "pace":
            return SwimFormatters.formatPace(value)
        default:
            return String(value)
        }
    }

    private func tierColor(_ tier: String) -> Color {
        switch tier {
        case "gold": return .yellow
        case "silver": return .gray
        default: return .orange
        }
    }
}

struct MedalIconView: View {
    let tier: String
    let earned: Bool
    var size: CGFloat = 40

    var body: some View {
        ZStack {
            Circle()
                .fill(
                    earned
                        ? LinearGradient(colors: tierGradient, startPoint: .topLeading, endPoint: .bottomTrailing)
                        : LinearGradient(colors: [Color(.systemGray4), Color(.systemGray5)], startPoint: .top, endPoint: .bottom)
                )
                .frame(width: size, height: size)
            Image(systemName: "medal.fill")
                .font(.system(size: size * 0.45))
                .foregroundStyle(earned ? .white : Color(.systemGray))
        }
    }

    private var tierGradient: [Color] {
        switch tier {
        case "gold": return [.yellow, .orange]
        case "silver": return [.gray, Color(white: 0.85)]
        default: return [Color(red: 0.75, green: 0.45, blue: 0.15), .orange]
        }
    }
}

struct MonthlyMedalTileView: View {
    let state: MonthlyChallengeState
    var compact: Bool = false
    var size: CGFloat = 40

    var body: some View {
        VStack(spacing: 6) {
            MonthlyMedalIconView(tier: state.tier, size: size, muted: state.tier == nil)

            if compact {
                Text(SwimMonthlyChallengeFormatters.monthShortLabel(state.monthKey))
                    .font(.caption2.weight(.medium))

                if state.isPreview {
                    Text("Preview")
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(.orange)
                }

                if let tier = state.tier {
                    Text(SwimMonthlyChallengeFormatters.tierLabel(tier))
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(Color("BrandBlue"))
                    CoinBadge(count: SwimCoins.monthlyTierCoins(tier), golden: false)
                } else if state.challenges.contains(where: { $0.current > 0 }) {
                    Text("In progress")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                } else {
                    Text("—")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding(compact ? 8 : 0)
        .background(compact ? Color(.secondarySystemBackground) : Color.clear, in: RoundedRectangle(cornerRadius: 12))
    }
}

struct MonthlyMedalIconView: View {
    let tier: String?
    var size: CGFloat = 40
    var muted: Bool = false

    var body: some View {
        ZStack {
            Circle()
                .fill(background)
                .frame(width: size, height: size)
                .overlay(
                    Circle()
                        .strokeBorder(Color.white.opacity(0.25), lineWidth: 1)
                )
            Image(systemName: "seal.fill")
                .font(.system(size: size * 0.42))
                .foregroundStyle(foreground)
        }
    }

    private var background: some ShapeStyle {
        if muted || tier == nil {
            return AnyShapeStyle(Color(.systemGray5))
        }
        switch tier {
        case "gold":
            return AnyShapeStyle(LinearGradient(colors: [.yellow, .orange], startPoint: .topLeading, endPoint: .bottomTrailing))
        case "silver":
            return AnyShapeStyle(LinearGradient(colors: [.gray, Color(white: 0.85)], startPoint: .topLeading, endPoint: .bottomTrailing))
        default:
            return AnyShapeStyle(LinearGradient(colors: [Color(red: 0.75, green: 0.45, blue: 0.15), .orange], startPoint: .topLeading, endPoint: .bottomTrailing))
        }
    }

    private var foreground: Color {
        muted || tier == nil ? Color(.systemGray) : .white
    }
}

struct MonthlyChallengeHistoryView: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @State private var selectedYear: Int = Calendar.current.component(.year, from: Date())

    var body: some View {
        let intensity = MascotConstants.gameplay(viewModel.mascotId).challengeIntensity
        let history = SwimMonthlyChallenges.getMonthlyChallengeHistory(
            sessions: viewModel.sessions,
            previewMonthlyMedals: viewModel.cheats.previewMonthlyMedals,
            monthlyChallengeRerolls: viewModel.monthlyChallengeRerolls,
            intensity: intensity
        )

        if !history.isEmpty {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Monthly medals")
                            .font(.caption.bold())
                            .foregroundStyle(.secondary)
                            .textCase(.uppercase)
                        Text("Months where you earned a monthly medal.")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                        if viewModel.cheats.previewMonthlyMedals {
                            Text("Preview cheat active — sample medals shown.")
                                .font(.caption2.weight(.medium))
                                .foregroundStyle(.orange)
                        }
                    }
                    Spacer()
                    if years(from: history).count > 1 {
                        Picker("Year", selection: $selectedYear) {
                            ForEach(years(from: history), id: \.self) { year in
                                Text(String(year)).tag(year)
                            }
                        }
                        .pickerStyle(.menu)
                    } else if let year = years(from: history).first {
                        Text(String(year))
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.secondary)
                    }
                }

                let activeYear = years(from: history).contains(selectedYear)
                    ? selectedYear
                    : (years(from: history).first ?? selectedYear)
                let months = history
                    .filter { $0.monthKey.hasPrefix("\(activeYear)-") }
                    .sorted { $0.monthKey > $1.monthKey }

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                    ForEach(months, id: \.monthKey) { entry in
                        MonthlyMedalTileView(state: entry, compact: true, size: 36)
                    }
                }
            }
        }
    }

    private func years(from history: [MonthlyChallengeState]) -> [Int] {
        Array(Set(history.compactMap { Int($0.monthKey.prefix(4)) })).sorted(by: >)
    }
}
