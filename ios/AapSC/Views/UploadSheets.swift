import SwiftUI

struct CoinEarnedSheet: View {
    @EnvironmentObject private var preferences: UserPreferencesService
    let result: UploadCoinResult
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                Section(preferences.t("coins.sessionSection")) {
                    ForEach(result.sessionLines, id: \.type) { line in
                        coinRow(line)
                    }
                }

                if !result.bonusLines.isEmpty {
                    Section(preferences.t("coins.bonusSection")) {
                        ForEach(result.bonusLines, id: \.type) { line in
                            coinRow(line)
                        }
                    }
                }

                Section {
                    HStack {
                        Text(preferences.t("coins.earnedTitle"))
                            .themeFont(.headline, weight: .semibold)
                        Spacer()
                        Text("+\(result.total)")
                            .themeFont(.title3, weight: .bold)
                            .foregroundStyle(Color("BrandBlue"))
                    }
                }
            }
            .navigationTitle(preferences.t("coins.popupTitle"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button(preferences.t("coins.continue")) { dismiss() }
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    private func coinRow(_ line: CoinLineItem) -> some View {
        HStack {
            Text(label(for: line))
            Spacer()
            Text(line.coins >= 0 ? "+\(line.coins)" : "\(line.coins)")
                .fontWeight(.semibold)
                .foregroundStyle(line.coins >= 0 ? Color("BrandBlue") : .red)
        }
    }

    private func label(for line: CoinLineItem) -> String {
        switch line.type {
        case "base": return preferences.t("coins.lineBase")
        case "distance": return preferences.t("coins.lineDistance")
        case "duration": return preferences.t("coins.lineDuration")
        case "kcal": return preferences.t("coins.lineKcal")
        case "paceImprovement": return preferences.t("coins.linePaceImprovement")
        case "finsBonus": return preferences.t("coins.lineFinsBonus")
        case "finsPenalty": return preferences.t("coins.lineFinsPenalty")
        case "coachShare": return preferences.t("coins.lineCoachShare")
        case "medal": return preferences.t("coins.lineMedal", params: [
            "tier": line.medalId ?? "",
            "title": line.medalId?.replacingOccurrences(of: "_", with: " ") ?? "earned"
        ])
        case "monthly": return preferences.t("coins.lineMonthly")
        default: return line.type.capitalized
        }
    }
}

struct MedalCelebrationSheet: View {
    @EnvironmentObject private var preferences: UserPreferencesService
    let medals: [EvaluatedMedal]
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Image(systemName: "medal.fill")
                    .font(.system(size: 56))
                    .foregroundStyle(.yellow)

                Text(preferences.t("medals.celebration.titleMultiple"))
                    .themeFont(.title, weight: .bold)

                ForEach(medals) { medal in
                    HStack {
                        Text(medal.id.replacingOccurrences(of: "_", with: " ").capitalized)
                        Spacer()
                        Text(medal.tier.capitalized)
                            .themeFont(.caption, weight: .bold)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(.yellow.opacity(0.2), in: Capsule())
                    }
                    .padding(.horizontal)
                }

                Spacer()
            }
            .padding(.top, 32)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button(preferences.t("coins.continue")) { dismiss() }
                }
            }
        }
        .presentationDetents([.medium])
    }
}

struct DuplicateSessionAlert: View {
    @EnvironmentObject private var preferences: UserPreferencesService
    let duplicate: SwimSession
    let onCancel: () -> Void
    let onSaveAnyway: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Text(preferences.t("upload.duplicateTitle"))
                .themeFont(.headline, weight: .semibold)
            Text(preferences.t("upload.duplicateMessage", params: [
                "date": SwimFormatters.formatDateLong(duplicate.date)
            ]))
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)
            HStack {
                Button(preferences.t("common.cancel"), action: onCancel)
                    .buttonStyle(.bordered)
                Button(preferences.t("upload.saveSession"), action: onSaveAnyway)
                    .buttonStyle(.borderedProminent)
            }
        }
        .padding()
    }
}
