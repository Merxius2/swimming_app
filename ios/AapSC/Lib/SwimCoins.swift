import Foundation

enum SwimCoins {
    private static let tierCoins: [String: Int] = ["bronze": 25, "silver": 60, "gold": 150]
    private static let monthlyTierCoins: [String: Int] = ["bronze": 30, "silver": 75, "gold": 180]

    static func medalTierCoins(_ tier: String) -> Int { tierCoins[tier] ?? 0 }

    static func monthlyTierCoins(_ tier: String?) -> Int {
        guard let tier else { return 0 }
        return monthlyTierCoins[tier] ?? 0
    }

    static func monthlyTierCoinDelta(fromTier: String?, toTier: String?) -> Int {
        monthlyTierCoins(toTier) - monthlyTierCoins(fromTier)
    }

    static func calculateSessionCoinBreakdown(
        _ session: SwimSession,
        priorSessions: [SwimSession] = [],
        mascotId: String? = nil
    ) -> (sessionCoins: Int, lines: [CoinLineItem]) {
        let gameplay = mascotId.map { MascotConstants.gameplay($0) }
        let metrics = session.metrics
        var lines: [CoinLineItem] = []
        var coins = 8
        lines.append(CoinLineItem(type: "base", coins: 8))

        let distance = metrics.distanceM ?? 0
        let duration = metrics.durationSec ?? 0
        let kcal = metrics.activeKcal ?? 0
        let pace = metrics.paceSecPer100m

        let distBonus = distance / 500
        if distBonus > 0 {
            coins += distBonus
            lines.append(CoinLineItem(type: "distance", coins: distBonus, distanceM: distance))
        }

        let durBonus = duration / 900
        if durBonus > 0 {
            coins += durBonus
            lines.append(CoinLineItem(type: "duration", coins: durBonus, durationSec: duration))
        }

        let kcalBonus = kcal / 100
        if kcalBonus > 0 {
            coins += kcalBonus
            lines.append(CoinLineItem(type: "kcal", coins: kcalBonus, kcal: kcal))
        }

        if distance >= 3000 {
            coins += 10
            lines.append(CoinLineItem(type: "longDistance3k", coins: 10))
        }
        if distance >= 5000 {
            coins += 15
            lines.append(CoinLineItem(type: "longDistance5k", coins: 15))
        }
        if duration >= 3600 {
            coins += 8
            lines.append(CoinLineItem(type: "longDuration", coins: 8))
        }

        let priorPaces = priorSessions.compactMap(\.metrics.paceSecPer100m).filter { $0 > 0 }
        if let pace, !priorPaces.isEmpty {
            let avgPace = Double(priorPaces.reduce(0, +)) / Double(priorPaces.count)
            if Double(pace) < avgPace {
                let improvement = min(20, Int((avgPace - Double(pace)) / 3))
                if improvement > 0 {
                    coins += improvement
                    lines.append(CoinLineItem(
                        type: "paceImprovement",
                        coins: improvement,
                        avgPaceSec: avgPace,
                        paceSec: pace
                    ))
                    if gameplay?.doubleImprovementBonus == true {
                        let finsBonus = max(5, improvement)
                        coins += finsBonus
                        lines.append(CoinLineItem(type: "finsBonus", coins: finsBonus))
                    }
                }
            } else if gameplay?.sessionPenalty == true, Double(pace) > avgPace {
                let slip = min(15, Int((Double(pace) - avgPace) / 4))
                if slip > 0 {
                    coins -= slip
                    lines.append(CoinLineItem(
                        type: "finsPenalty",
                        coins: -slip,
                        avgPaceSec: avgPace,
                        paceSec: pace
                    ))
                }
            }
        }

        if let gameplay, gameplay.coinMultiplier != 1, coins > 0 {
            let reduced = Int(ceil(Double(coins) * gameplay.coinMultiplier))
            if reduced != coins {
                lines.append(CoinLineItem(type: "coachShare", coins: reduced - coins))
                coins = reduced
            }
        }

        let minCoins = gameplay?.minSessionCoins ?? 5
        let sessionCoins = gameplay?.minSessionCoins != nil ? max(minCoins, coins) : coins
        return (sessionCoins, lines)
    }

    static func calculateSessionCoins(_ session: SwimSession, priorSessions: [SwimSession] = [], mascotId: String? = nil) -> Int {
        calculateSessionCoinBreakdown(session, priorSessions: priorSessions, mascotId: mascotId).sessionCoins
    }

    static func calculateUploadCoins(
        session: SwimSession,
        sessionsBefore: [SwimSession],
        sessionsAfter: [SwimSession],
        newMedals: [EvaluatedMedal],
        spentCoinClaims: [SpentCoinClaim],
        mascotId: String? = nil,
        monthKey: String = SwimMonthlyChallenges.getMonthKey(),
        rerolls: [String: MonthRerollEntry] = [:],
        intensity: Double = 1
    ) -> UploadCoinResult {
        if SwimCoinClaims.findSpentCoinClaim(spentCoinClaims, candidate: session) != nil {
            return UploadCoinResult(
                sessionCoins: 0, medalCoins: 0, monthlyCoins: 0, total: 0,
                sessionLines: [], bonusLines: [], alreadyClaimed: true
            )
        }

        let breakdown = calculateSessionCoinBreakdown(session, priorSessions: sessionsBefore, mascotId: mascotId)
        var bonusLines: [CoinLineItem] = []
        var medalCoins = 0

        for medal in newMedals {
            let amount = medalTierCoins(medal.tier)
            medalCoins += amount
            bonusLines.append(CoinLineItem(type: "medal", coins: amount, medalId: medal.id, tier: medal.tier))
        }

        var monthlyCoins = 0
        if let upgrade = SwimMonthlyChallenges.getMonthlyTierUpgrade(
            sessionsBefore: sessionsBefore,
            sessionsAfter: sessionsAfter,
            monthKey: monthKey,
            rerolls: rerolls,
            intensity: intensity
        ) {
            monthlyCoins = monthlyTierCoinDelta(fromTier: upgrade.fromTier, toTier: upgrade.tier)
            if monthlyCoins > 0 {
                bonusLines.append(CoinLineItem(
                    type: "monthly",
                    coins: monthlyCoins,
                    fromTier: upgrade.fromTier,
                    toTier: upgrade.tier
                ))
            }
        }

        return UploadCoinResult(
            sessionCoins: breakdown.sessionCoins,
            medalCoins: medalCoins,
            monthlyCoins: monthlyCoins,
            total: breakdown.sessionCoins + medalCoins + monthlyCoins,
            sessionLines: breakdown.lines,
            bonusLines: bonusLines,
            alreadyClaimed: false
        )
    }

    static func sumSessionCoins(_ sessions: [SwimSession]) -> Int {
        sessions.reduce(0) { $0 + SwimCoinClaims.sessionTotalCoins($1) }
    }

    static func migrateSessionCoins(_ sessions: [SwimSession]) -> [SwimSession] {
        let sorted = sessions.sorted { $0.date < $1.date }
        var prior: [SwimSession] = []
        return sorted.map { session in
            var next = session
            if next.coinsEarned == nil {
                next.coinsEarned = calculateSessionCoins(next, priorSessions: prior)
            }
            prior.append(next)
            return next
        }
    }

    static func reconcileTotalCoins(sessions: [SwimSession], storedTotal: Int, coinsSpent: Int = 0) -> Int {
        let fromSessions = sumSessionCoins(sessions)
        var stored = storedTotal
        let spent = max(0, coinsSpent)
        let sessionBalance = max(0, fromSessions - spent)

        if spent > 0, stored >= fromSessions, stored > sessionBalance {
            stored = sessionBalance
        }

        let earned = max(fromSessions, stored + spent)
        return max(0, earned - spent)
    }
}
