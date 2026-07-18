import SwiftUI

struct MiniGamesScreen: View {
    @EnvironmentObject private var preferences: UserPreferencesService

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    ScreenHeader(
                        preferences.t("miniGames.title"),
                        subtitle: preferences.t("miniGames.subtitle"),
                        pageKey: "mini-games",
                        systemImage: "gamecontroller.fill"
                    )

                    WheelOfFortuneView()
                    PacePickGameView()
                    CoinFlipGameView()
                    LaneTimerGameView()
                }
                .padding()
            }
            .navigationTitle(preferences.t("miniGames.title"))
            .navigationBarTitleDisplayMode(.inline)
            .swimTopBarActions()
            .themedNavigationBar()
        }
        .themedPageBackground()
    }
}

struct CoinFlipGameView: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @EnvironmentObject private var preferences: UserPreferencesService

    private let bets = [5, 25, 50]
    private let winChance = 0.47

    @State private var bet = 5
    @State private var choice = "heads"
    @State private var flipping = false
    @State private var resultMessage: String?

    var body: some View {
        Card {
            VStack(alignment: .leading, spacing: 16) {
                Label(preferences.t("miniGames.coinFlip.title"), systemImage: "bitcoinsign.circle")
                    .themeFont(.headline, weight: .semibold)
                Text(preferences.t("miniGames.coinFlip.desc"))
                    .themeFont(.caption)
                    .foregroundStyle(.secondary)

                HStack(spacing: 8) {
                    ForEach(bets, id: \.self) { amount in
                        Button {
                            bet = amount
                        } label: {
                            Text("\(amount)")
                                .themeFont(.caption, weight: .semibold)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .background(bet == amount ? Color("BrandBlue") : Color.secondary.opacity(0.12))
                                .foregroundStyle(bet == amount ? Color.white : Color.primary)
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                        }
                        .buttonStyle(.plain)
                    }
                }

                HStack(spacing: 12) {
                    choiceButton("heads", titleKey: "miniGames.coinFlip.heads")
                    choiceButton("tails", titleKey: "miniGames.coinFlip.tails")
                }

                HStack {
                    CoinBadge(count: bet, golden: false)
                    Spacer()
                    Button(flipping ? preferences.t("miniGames.coinFlip.flipping") : preferences.t("miniGames.coinFlip.play")) {
                        play()
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Color("BrandBlue"))
                    .disabled(flipping || viewModel.totalCoins < bet)
                }

                if let resultMessage {
                    Text(resultMessage)
                        .themeFont(.caption, weight: .semibold)
                        .foregroundStyle(resultMessage.contains("+") ? .green : .secondary)
                }
            }
        }
    }

    private func choiceButton(_ side: String, titleKey: String) -> some View {
        Button {
            choice = side
        } label: {
            Text(preferences.t(titleKey))
                .themeFont(.caption, weight: .semibold)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(choice == side ? Color("BrandBlue").opacity(0.12) : Color.secondary.opacity(0.08))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(choice == side ? Color("BrandBlue") : Color.secondary.opacity(0.2), lineWidth: 1)
                )
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .buttonStyle(.plain)
    }

    private func play() {
        guard viewModel.totalCoins >= bet, !flipping else { return }
        flipping = true
        resultMessage = nil
        viewModel.adjustCoins(delta: -bet)

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.9) {
            let landed = Bool.random() ? "heads" : "tails"
            let won = landed == choice && Double.random(in: 0..<1) < winChance
            if won {
                viewModel.adjustCoins(delta: bet * 2)
                resultMessage = preferences.t("miniGames.coinFlip.won", params: ["amount": String(bet * 2)])
            } else {
                resultMessage = preferences.t("miniGames.coinFlip.lost")
            }
            flipping = false
        }
    }
}

struct PacePickGameView: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @EnvironmentObject private var preferences: UserPreferencesService

    @State private var round: PacePickRound?
    @State private var pickedId: String?
    @State private var streak = 0
    @State private var lastReward = 0

    var body: some View {
        Card {
            VStack(alignment: .leading, spacing: 16) {
                Label(preferences.t("miniGames.pacePick.title"), systemImage: "target")
                    .themeFont(.headline, weight: .semibold)

                if viewModel.sessions.count < 2 {
                    Text(preferences.t("miniGames.pacePick.needSessions"))
                        .themeFont(.caption)
                        .foregroundStyle(.secondary)
                } else {
                    Text(preferences.t("miniGames.pacePick.desc"))
                        .themeFont(.caption)
                        .foregroundStyle(.secondary)

                    if let round {
                        HStack(spacing: 12) {
                            paceCard(round.left, fasterId: round.fasterId)
                            paceCard(round.right, fasterId: round.fasterId)
                        }
                    }

                    HStack {
                        Text(preferences.t("miniGames.pacePick.streak", params: ["count": String(streak)]))
                            .themeFont(.caption2)
                            .foregroundStyle(.secondary)
                        Spacer()
                        if pickedId != nil {
                            if lastReward > 0 {
                                CoinBadge(count: lastReward, golden: false)
                            }
                            Button(preferences.t("miniGames.pacePick.next")) {
                                startRound()
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(Color("BrandBlue"))
                        } else {
                            Text(preferences.t("miniGames.pacePick.free"))
                                .themeFont(.caption2)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
        }
        .onAppear { startRound() }
    }

    private func paceCard(_ session: SwimSession, fasterId: String) -> some View {
        let isPicked = pickedId == session.id
        let isWinner = pickedId != nil && session.id == fasterId
        let isLoser = isPicked && session.id != fasterId

        return Button {
            guard pickedId == nil else { return }
            pickedId = session.id
            let correct = session.id == fasterId
            let reward = correct ? min(25, 8 + streak * 3) : 0
            if reward > 0 { viewModel.adjustCoins(delta: reward) }
            lastReward = reward
            streak = correct ? streak + 1 : 0
        } label: {
            VStack(alignment: .leading, spacing: 8) {
                Text(SwimFormatters.formatDateShort(session.date))
                    .themeFont(.caption2, weight: .bold)
                    .foregroundStyle(.secondary)
                Text(SwimFormatters.formatDistance(session.metrics.distanceM))
                    .themeFont(.caption)
                    .foregroundStyle(.secondary)
                Text(SwimFormatters.formatPace(session.metrics.paceSecPer100m))
                    .themeFont(.title3, weight: .bold)
                    .foregroundStyle(Color.teal)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding()
            .background(
                isWinner ? Color.green.opacity(0.12) :
                    isLoser ? Color.red.opacity(0.12) :
                    Color.secondary.opacity(0.08)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(
                        isWinner ? Color.green :
                            isLoser ? Color.red :
                            Color.secondary.opacity(0.2),
                        lineWidth: 1
                    )
            )
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .buttonStyle(.plain)
        .disabled(pickedId != nil)
    }

    private func startRound() {
        round = PacePickRound.make(from: viewModel.sessions)
        pickedId = nil
        lastReward = 0
    }
}

private struct PacePickRound {
    let left: SwimSession
    let right: SwimSession
    let fasterId: String

    static func make(from sessions: [SwimSession]) -> PacePickRound? {
        let eligible = sessions.filter { ($0.metrics.paceSecPer100m ?? 0) > 0 }
        guard eligible.count >= 2 else { return nil }
        let shuffled = eligible.shuffled()
        let left = shuffled[0]
        let right = shuffled[1]
        let fasterId = (left.metrics.paceSecPer100m ?? Int.max) <= (right.metrics.paceSecPer100m ?? Int.max)
            ? left.id : right.id
        return PacePickRound(left: left, right: right, fasterId: fasterId)
    }
}

struct LaneTimerGameView: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @EnvironmentObject private var preferences: UserPreferencesService

    private let entryCost = 5

    @State private var phase = "idle"
    @State private var message = ""
    @State private var reward = 0
    @State private var goStartedAt: Date?

    var body: some View {
        Card {
            VStack(alignment: .leading, spacing: 16) {
                Label(preferences.t("miniGames.laneTimer.title"), systemImage: "timer")
                    .themeFont(.headline, weight: .semibold)
                Text(preferences.t("miniGames.laneTimer.desc"))
                    .themeFont(.caption)
                    .foregroundStyle(.secondary)

                Button(action: handleTap) {
                    Text(message.isEmpty ? preferences.t("miniGames.laneTimer.tap") : message)
                        .themeFont(.subheadline, weight: .bold)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 120)
                        .background(laneColor)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .buttonStyle(.plain)

                HStack {
                    CoinBadge(count: entryCost, golden: false)
                    Spacer()
                    if phase == "idle" || phase == "done" {
                        Button(phase == "done" ? preferences.t("miniGames.laneTimer.again") : preferences.t("miniGames.laneTimer.start", params: ["cost": String(entryCost)])) {
                            if phase == "done" {
                                reset()
                            } else {
                                startRound()
                            }
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color("BrandBlue"))
                        .disabled(viewModel.totalCoins < entryCost && phase != "done")
                    } else {
                        Text(preferences.t("miniGames.laneTimer.listening"))
                            .themeFont(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }

                if phase == "done" {
                    Text(reward > 0
                         ? preferences.t("miniGames.laneTimer.won", params: ["amount": String(reward)])
                         : preferences.t("miniGames.laneTimer.noReward"))
                    .themeFont(.caption, weight: .semibold)
                    .foregroundStyle(reward > 0 ? .green : .secondary)
                }
            }
        }
    }

    private var laneColor: Color {
        switch phase {
        case "go": return .green
        case "waiting": return .orange
        default: return .blue.opacity(0.85)
        }
    }

    private func reset() {
        phase = "idle"
        message = ""
        reward = 0
        goStartedAt = nil
    }

    private func startRound() {
        guard viewModel.totalCoins >= entryCost else { return }
        viewModel.adjustCoins(delta: -entryCost)
        reward = 0
        phase = "waiting"
        message = preferences.t("miniGames.laneTimer.wait")
        let delay = Double.random(in: 1.2...4.0)
        DispatchQueue.main.asyncAfter(deadline: .now() + delay) {
            guard phase == "waiting" else { return }
            goStartedAt = Date()
            phase = "go"
            message = preferences.t("miniGames.laneTimer.go")
        }
    }

    private func handleTap() {
        if phase == "waiting" {
            phase = "idle"
            message = preferences.t("miniGames.laneTimer.early")
            return
        }
        guard phase == "go", let goStartedAt else { return }
        let reactionMs = Int(Date().timeIntervalSince(goStartedAt) * 1000)
        reward = rewardForReaction(reactionMs)
        if reward > 0 { viewModel.adjustCoins(delta: reward) }
        phase = "done"
        message = preferences.t("miniGames.laneTimer.result", params: ["ms": String(reactionMs)])
    }

    private func rewardForReaction(_ ms: Int) -> Int {
        if ms < 220 { return 30 }
        if ms < 320 { return 20 }
        if ms < 450 { return 12 }
        if ms < 650 { return 6 }
        return 0
    }
}
