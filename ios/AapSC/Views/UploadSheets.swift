import SwiftUI

struct CoinEarnedSheet: View {
    let result: UploadCoinResult
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                Section("Session rewards") {
                    ForEach(result.sessionLines, id: \.type) { line in
                        coinRow(line)
                    }
                    if result.sessionLines.isEmpty {
                        Text("No session coins this time.")
                            .foregroundStyle(.secondary)
                    }
                }

                if !result.bonusLines.isEmpty {
                    Section("Medal & challenge bonuses") {
                        ForEach(result.bonusLines, id: \.type) { line in
                            coinRow(line)
                        }
                    }
                }

                Section {
                    HStack {
                        Text("Total earned")
                            .font(.headline)
                        Spacer()
                        Text("+\(result.total)")
                            .font(.title3.bold())
                            .foregroundStyle(Color("BrandBlue"))
                    }
                }
            }
            .navigationTitle("Coins earned!")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Continue") { dismiss() }
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
        case "base": return "Session logged"
        case "distance": return "Distance bonus"
        case "duration": return "Duration bonus"
        case "kcal": return "Calorie bonus"
        case "paceImprovement": return "Pace improvement"
        case "finsBonus": return "Fins improvement bonus"
        case "finsPenalty": return "Fins penalty"
        case "coachShare": return "Coach share adjustment"
        case "medal": return "Medal: \(line.medalId?.replacingOccurrences(of: "_", with: " ") ?? "earned")"
        case "monthly": return "Monthly challenge upgrade"
        default: return line.type.capitalized
        }
    }
}

struct MedalCelebrationSheet: View {
    let medals: [EvaluatedMedal]
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Image(systemName: "medal.fill")
                    .font(.system(size: 56))
                    .foregroundStyle(.yellow)

                Text("New medals!")
                    .font(.title.bold())

                ForEach(medals) { medal in
                    HStack {
                        Text(medal.id.replacingOccurrences(of: "_", with: " ").capitalized)
                        Spacer()
                        Text(medal.tier.capitalized)
                            .font(.caption.bold())
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
                    Button("Continue") { dismiss() }
                }
            }
        }
        .presentationDetents([.medium])
    }
}

struct DuplicateSessionAlert: View {
    let duplicate: SwimSession
    let onCancel: () -> Void
    let onSaveAnyway: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Text("Duplicate workout?")
                .font(.headline)
            Text("A session on \(SwimFormatters.formatDateLong(duplicate.date)) with the same distance and duration already exists.")
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)
            HStack {
                Button("Cancel", action: onCancel)
                    .buttonStyle(.bordered)
                Button("Save anyway", action: onSaveAnyway)
                    .buttonStyle(.borderedProminent)
            }
        }
        .padding()
    }
}
