import Foundation

enum SwimWheelSpins {
    static let dailyPaidSpinLimit = 3

    static func getWheelSpinDayKey(date: Date = Date()) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withFullDate]
        return String(formatter.string(from: date).prefix(10))
    }

    static func normalizeWheelSpins(_ wheelSpins: WheelSpins?, today: String = getWheelSpinDayKey()) -> WheelSpins {
        guard let wheelSpins, wheelSpins.date == today else {
            return WheelSpins(date: today, paidCount: 0)
        }
        return WheelSpins(date: today, paidCount: max(0, wheelSpins.paidCount))
    }

    static func getPaidSpinsUsedToday(
        _ wheelSpins: WheelSpins?,
        today: String = getWheelSpinDayKey()
    ) -> Int {
        normalizeWheelSpins(wheelSpins, today: today).paidCount
    }

    static func getPaidSpinsRemaining(
        _ wheelSpins: WheelSpins?,
        today: String = getWheelSpinDayKey(),
        dailyLimit: Int = dailyPaidSpinLimit
    ) -> Int {
        let used = getPaidSpinsUsedToday(wheelSpins, today: today)
        return max(0, dailyLimit - used)
    }

    static func canUsePaidSpin(
        _ wheelSpins: WheelSpins?,
        today: String = getWheelSpinDayKey(),
        dailyLimit: Int = dailyPaidSpinLimit
    ) -> Bool {
        getPaidSpinsRemaining(wheelSpins, today: today, dailyLimit: dailyLimit) > 0
    }

    static func recordPaidSpin(
        _ wheelSpins: WheelSpins?,
        today: String = getWheelSpinDayKey()
    ) -> WheelSpins {
        let normalized = normalizeWheelSpins(wheelSpins, today: today)
        return WheelSpins(date: normalized.date, paidCount: normalized.paidCount + 1)
    }

    static func canStartWheelSpin(
        totalCoins: Int,
        bet: Int,
        freeSpins: Int,
        wheelSpins: WheelSpins?,
        today: String = getWheelSpinDayKey(),
        dailyLimit: Int = dailyPaidSpinLimit
    ) -> Bool {
        if freeSpins > 0 { return true }
        if !canUsePaidSpin(wheelSpins, today: today, dailyLimit: dailyLimit) { return false }
        return totalCoins >= bet
    }
}
