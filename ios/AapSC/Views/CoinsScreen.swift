import SwiftUI

struct CoinsScreen: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    ScreenHeader(
                        "Wheel of Fortune",
                        subtitle: "Spend coins for a spin — win swim coins, free spins, or nothing.",
                        systemImage: "bitcoinsign.circle.fill"
                    )

                    WheelOfFortuneView()
                    SwimCoinStoreView()
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Coins")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

struct WheelOfFortuneView: View {
    @EnvironmentObject private var viewModel: SwimViewModel

    @State private var bet = 1
    @State private var rotation: Double = 0
    @State private var spinning = false
    @State private var freeSpins = 0
    @State private var result: SpinResult?
    @State private var pendingOutcome: PendingSpin?
    @State private var spinLayout: SwimWheel.WheelLayout?

    private let spinDuration = 4.2

    private var layout: SwimWheel.WheelLayout {
        SwimWheel.buildWheelLayout(bet: bet)
    }

    private var displayLayout: SwimWheel.WheelLayout {
        spinning && spinLayout != nil ? spinLayout! : layout
    }

    private var dailySpinLimit: Int {
        SwimCoinStore.getDailyPaidSpinLimit(viewModel.bonusWheelSpinCredits)
    }

    private var paidSpinsRemaining: Int {
        SwimWheelSpins.getPaidSpinsRemaining(
            viewModel.wheelSpins,
            dailyLimit: dailySpinLimit
        )
    }

    private var canSpin: Bool {
        SwimWheelSpins.canStartWheelSpin(
            totalCoins: viewModel.totalCoins,
            bet: bet,
            freeSpins: freeSpins,
            wheelSpins: viewModel.wheelSpins,
            dailyLimit: dailySpinLimit
        )
    }

    private var atDailyLimit: Bool {
        freeSpins == 0 && paidSpinsRemaining == 0
    }

    private var goldenBadge: Bool {
        SwimCoinStore.hasGoldenCoinBadge(viewModel.storeUnlocks)
    }

    var body: some View {
        VStack(spacing: 20) {
            HStack {
                CoinBadge(
                    count: viewModel.totalCoins,
                    golden: goldenBadge
                )
                Spacer()
                VStack(alignment: .trailing, spacing: 6) {
                    if freeSpins > 0 {
                        Label("\(freeSpins) free spin(s) ready", systemImage: "sparkles")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Color(red: 0.482, green: 0.357, blue: 1.0))
                    }
                    Text("\(paidSpinsRemaining)/\(dailySpinLimit) paid spins left today")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            ZStack {
                Circle()
                    .fill(Color(.systemGray6))
                    .frame(width: 280, height: 280)
                    .shadow(color: .black.opacity(0.15), radius: 12, y: 6)

                WheelDiscView(layout: displayLayout, rotation: rotation)
                    .frame(width: 260, height: 260)

                Image(systemName: "arrowtriangle.down.fill")
                    .font(.title3)
                    .foregroundStyle(Color("BrandBlue"))
                    .offset(y: -150)
            }
            .padding(.vertical, 8)

            Text("Choose your bet")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            HStack(spacing: 10) {
                ForEach(SwimWheel.wheelBets, id: \.self) { amount in
                    let active = bet == amount
                    let disabled = spinning || (freeSpins == 0 && (viewModel.totalCoins < amount || atDailyLimit))
                    Button {
                        bet = amount
                    } label: {
                        Text("\(amount)")
                            .font(.subheadline.weight(.semibold))
                            .frame(minWidth: 56)
                            .padding(.vertical, 10)
                            .background(
                                active ? Color("BrandBlue") : Color(.secondarySystemBackground),
                                in: RoundedRectangle(cornerRadius: 10)
                            )
                            .foregroundStyle(active ? .white : .primary)
                    }
                    .disabled(disabled)
                    .opacity(disabled && !active ? 0.45 : 1)
                }
            }

            Button(action: spin) {
                Text(spinButtonTitle)
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color("BrandBlue"), in: RoundedRectangle(cornerRadius: 14))
                    .foregroundStyle(.white)
            }
            .disabled(spinning || !canSpin)

            if !canSpin && !spinning && atDailyLimit {
                Text("No paid spins left today — free spins still work. Come back tomorrow!")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            } else if !canSpin && !spinning && viewModel.totalCoins < bet {
                Text("Not enough coins for this bet.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            if let result {
                Card {
                    VStack(spacing: 6) {
                        Text("You landed on")
                            .font(.subheadline.weight(.semibold))
                        Text(resultMessage(result))
                            .font(.body)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
        }
    }

    private var spinButtonTitle: String {
        if spinning { return "Spinning…" }
        if freeSpins > 0 { return "Free spin (\(freeSpins) left)" }
        return "Spin for \(bet) coins"
    }

    private func spin() {
        guard !spinning, canSpin else { return }

        let activeLayout = SwimWheel.buildWheelLayout(bet: bet)
        spinLayout = activeLayout

        let usedFreeSpin = freeSpins > 0
        if usedFreeSpin {
            freeSpins -= 1
        } else {
            viewModel.adjustCoins(delta: -bet)
            viewModel.recordWheelPaidSpin()
        }

        let segmentIndex = SwimWheel.pickRandomSegmentIndex(activeLayout)
        let segment = activeLayout.segments[segmentIndex]
        let nextRotation = SwimWheel.getSpinRotation(
            segmentIndex: segmentIndex,
            layout: activeLayout,
            currentRotation: rotation
        )

        pendingOutcome = PendingSpin(segment: segment, usedFreeSpin: usedFreeSpin)
        result = nil
        spinning = true

        withAnimation(.timingCurve(0.17, 0.67, 0.12, 0.99, duration: spinDuration)) {
            rotation = nextRotation
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + spinDuration) {
            handleSpinEnd()
        }
    }

    private func handleSpinEnd() {
        guard let pending = pendingOutcome else { return }
        pendingOutcome = nil
        spinLayout = nil

        let resolved = SwimWheel.resolveWheelOutcome(
            segment: pending.segment,
            bet: bet,
            usedFreeSpin: pending.usedFreeSpin
        )

        if resolved.coinsDelta > 0 {
            viewModel.adjustCoins(delta: resolved.coinsDelta)
        }
        if let granted = resolved.freeSpinsGranted {
            freeSpins += granted
        }

        result = SpinResult(segment: pending.segment, resolved: resolved)
        spinning = false
    }

    private func resultMessage(_ result: SpinResult) -> String {
        switch result.resolved.type {
        case "coins":
            return "+\(result.resolved.coinsDelta) coins!"
        case "free_spin":
            if (result.resolved.freeSpinsGranted ?? 1) > 1 {
                return "\(result.resolved.freeSpinsGranted ?? 1) free spins — spin again without paying!"
            }
            return "Free spin — spin again without paying!"
        case "nothing":
            return "Lost \(result.resolved.amountLost ?? bet) coins — better luck next spin!"
        default:
            return "Try again!"
        }
    }

    private struct PendingSpin {
        let segment: SwimWheel.LayoutSegment
        let usedFreeSpin: Bool
    }

    private struct SpinResult {
        let segment: SwimWheel.LayoutSegment
        let resolved: SwimWheel.WheelOutcome
    }
}

private struct WheelDiscView: View {
    let layout: SwimWheel.WheelLayout
    let rotation: Double

    var body: some View {
        ZStack {
            Circle()
                .fill(Color(red: 0.094, green: 0.094, blue: 0.106))

            ForEach(layout.segments) { segment in
                WheelSegmentWedgeView(segment: segment)
            }

            ForEach(layout.segments.filter(SwimWheel.segmentShouldShowLabel)) { segment in
                WheelSegmentLabel(segment: segment)
            }

            Circle()
                .fill(Color(.systemBackground))
                .frame(width: 36, height: 36)
                .overlay(
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [Color(red: 1.0, green: 0.843, blue: 0.0), Color(red: 0.961, green: 0.620, blue: 0.043)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .frame(width: 20, height: 20)
                )
        }
        .rotationEffect(.degrees(rotation))
    }
}

private struct WheelSegmentWedgeView: View {
    let segment: SwimWheel.LayoutSegment

    var body: some View {
        WheelSegmentWedgeShape(segment: segment)
            .fill(segmentFill)
            .overlay(
                WheelSegmentWedgeShape(segment: segment)
                    .stroke(Color.white.opacity(0.15), lineWidth: 1)
            )
    }

    @ViewBuilder
    private var segmentFill: some ShapeStyle {
        if segment.shiny {
            LinearGradient(
                colors: [
                    Color(red: 1.0, green: 0.957, blue: 0.722),
                    Color(red: 1.0, green: 0.843, blue: 0.0),
                    Color(red: 0.722, green: 0.525, blue: 0.043),
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        } else {
            segment.color
        }
    }
}

private struct WheelSegmentWedgeShape: Shape {
    let segment: SwimWheel.LayoutSegment

    func path(in rect: CGRect) -> Path {
        var path = Path()
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let radius = min(rect.width, rect.height) / 2
        let start = Angle(degrees: segment.startDeg - 90)
        let end = Angle(degrees: segment.startDeg + segment.sweepDeg - 90)
        path.move(to: center)
        path.addArc(center: center, radius: radius, startAngle: start, endAngle: end, clockwise: false)
        path.closeSubpath()
        return path
    }
}

private struct WheelSegmentLabel: View {
    let segment: SwimWheel.LayoutSegment

    var body: some View {
        let centerDeg = segment.startDeg + segment.sweepDeg / 2
        let radians = (centerDeg - 90) * .pi / 180
        let radius = 95.0
        let x = 130 + radius * cos(radians)
        let y = 130 + radius * sin(radians)

        Text(SwimWheel.segmentLabel(segment))
            .font(.system(size: SwimWheel.segmentFontSize(segment), weight: .bold))
            .foregroundStyle(segment.shiny ? Color(red: 0.471, green: 0.208, blue: 0.059) : .white)
            .position(x: x, y: y)
            .rotationEffect(.degrees(centerDeg))
    }
}

struct SwimCoinStoreView: View {
    @EnvironmentObject private var viewModel: SwimViewModel

    private var allThemesUnlocked: Bool {
        viewModel.cheats.allThemesUnlocked
    }

    var body: some View {
        VStack(spacing: 24) {
            Divider()
                .padding(.top, 8)

            VStack(spacing: 8) {
                Label("Swim Coin Store", systemImage: "bag.fill")
                    .font(.title3.bold())
                    .foregroundStyle(Color("BrandBlue"))
                Text("Spend swim coins on themes, app icons, background vibes, flair, and boosts.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }

            ForEach(SwimCoinStore.storeCategories, id: \.self) { category in
                storeCategorySection(category)
            }
        }
    }

    @ViewBuilder
    private func storeCategorySection(_ category: String) -> some View {
        let items = SwimCoinStore.getStoreItemsByCategory(category)

        VStack(alignment: .leading, spacing: 12) {
            Label(SwimCoinStore.categoryLabel(category), systemImage: SwimCoinStore.categoryIcon(category))
                .font(.caption.bold())
                .foregroundStyle(.secondary)
                .textCase(.uppercase)

            if category == "vibes" {
                Text("On iPhone and iPad, vibe animations may not play when Reduce Motion is enabled in Settings → Accessibility → Motion.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(items) { item in
                    storeItemCard(item)
                }
            }
        }
    }

    @ViewBuilder
    private func storeItemCard(_ item: SwimCoinStore.StoreItem) -> some View {
        let isConsumable = item.consumable
        let owned = !isConsumable && (
            item.themeCode.map { SwimCoinStore.isThemeUnlocked($0, storeUnlocks: viewModel.storeUnlocks, allThemesUnlocked: allThemesUnlocked) } ??
            SwimCoinStore.isStoreItemOwned(item.id, storeUnlocks: viewModel.storeUnlocks)
        )
        let canBuy = isConsumable
            ? viewModel.totalCoins >= item.price
            : SwimCoinStore.canPurchaseStoreItem(item.id, storeUnlocks: viewModel.storeUnlocks, totalCoins: viewModel.totalCoins)
        let shortfall = max(0, item.price - viewModel.totalCoins)
        let ownedCount = consumableOwnedCount(item)

        Card {
            VStack(alignment: .leading, spacing: 12) {
                StoreItemPreviewView(item: item, bonusWheelSpinCredits: viewModel.bonusWheelSpinCredits)

                Text(item.name)
                    .font(.subheadline.weight(.semibold))
                Text(item.description)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)

                if isConsumable && ownedCount > 0 {
                    Text(
                        item.id == SwimCoinStore.bonusWheelSpinStoreItemId
                            ? "+\(ownedCount) extra paid spin(s) per day"
                            : "You have \(ownedCount) ready to use"
                    )
                    .font(.caption2.weight(.medium))
                    .foregroundStyle(Color("BrandBlue"))
                }

                HStack {
                    if owned {
                        Text("Owned")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.green)
                    } else {
                        CoinBadge(count: item.price, golden: false)
                    }

                    Spacer()

                    if !owned {
                        Button {
                            viewModel.purchaseStoreItem(item.id)
                        } label: {
                            Text(canBuy ? (isConsumable ? "Buy" : "Unlock") : "Need \(shortfall) more")
                                .font(.caption.weight(.semibold))
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .background(Color("BrandBlue"), in: RoundedRectangle(cornerRadius: 8))
                                .foregroundStyle(.white)
                        }
                        .disabled(viewModel.isLoading || !canBuy)
                        .opacity(canBuy ? 1 : 0.55)
                    }
                }
            }
        }
    }

    private func consumableOwnedCount(_ item: SwimCoinStore.StoreItem) -> Int {
        switch item.id {
        case SwimCoinStore.challengeRerollStoreItemId:
            return viewModel.challengeRerollCredits
        case SwimCoinStore.bonusWheelSpinStoreItemId:
            return viewModel.bonusWheelSpinCredits
        default:
            return 0
        }
    }
}

private struct StoreItemPreviewView: View {
    let item: SwimCoinStore.StoreItem
    let bonusWheelSpinCredits: Int

    var body: some View {
        RoundedRectangle(cornerRadius: 10)
            .fill(previewBackground)
            .frame(height: 80)
            .overlay(previewContent)
            .clipShape(RoundedRectangle(cornerRadius: 10))
    }

    @ViewBuilder
    private var previewContent: some View {
        switch item.preview {
        case "theme":
            HStack(spacing: 0) {
                themeSwatch(Color(red: 0.2, green: 0.6, blue: 0.95))
                themeSwatch(Color(red: 0.95, green: 0.4, blue: 0.5))
                themeSwatch(Color(red: 0.3, green: 0.85, blue: 0.7))
                themeSwatch(Color(red: 0.95, green: 0.75, blue: 0.2))
            }
        case "ambient-neon":
            LinearGradient(
                colors: [.black, Color(red: 0.05, green: 0.08, blue: 0.27), .purple, .cyan, .pink],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        case "ambient-sunset":
            LinearGradient(
                colors: [Color(red: 0.26, green: 0.08, blue: 0.03), .orange, .pink, .yellow],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        case "ambient-bubbles":
            LinearGradient(colors: [.cyan, Color(red: 0.0, green: 0.45, blue: 0.65)], startPoint: .top, endPoint: .bottom)
                .overlay(Image(systemName: "bubble.left.and.bubble.right.fill").font(.title).foregroundStyle(.white.opacity(0.5)))
        case "ambient-aurora":
            LinearGradient(colors: [Color(red: 0.02, green: 0.18, blue: 0.18), .teal, .indigo, .cyan], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "ambient-deep":
            LinearGradient(colors: [.black, Color(red: 0.0, green: 0.29, blue: 0.44), .cyan], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "golden-coins":
            CoinBadge(count: 1337, golden: true)
        case "confetti":
            HStack {
                Text("🎊").font(.title2)
                Text("✨").font(.title3)
                Text("🎉").font(.title2)
            }
        case "medal-shimmer":
            Image(systemName: "medal.fill")
                .font(.system(size: 36))
                .foregroundStyle(.orange)
        case "bonus-spin":
            VStack(spacing: 4) {
                Text("\(SwimCoinStore.getDailyPaidSpinLimit(bonusWheelSpinCredits))/day")
                    .font(.title2.weight(.black))
                    .foregroundStyle(Color("BrandBlue"))
                Text("paid spins")
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(.secondary)
                    .textCase(.uppercase)
            }
        case "challenge-reroll":
            VStack(spacing: 6) {
                Image(systemName: "shuffle")
                    .font(.title)
                    .foregroundStyle(Color("BrandBlue"))
                Text("monthly challenge")
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(.secondary)
                    .textCase(.uppercase)
            }
        case "icon-gold-medal":
            iconPreview(colors: [.yellow, .orange])
        case "icon-neon-lane":
            iconPreview(colors: [.purple, .cyan])
        case "icon-trophy-splash":
            iconPreview(colors: [.blue, .teal])
        case "icon-platinum-star":
            iconPreview(colors: [.gray, .white])
        default:
            Image(systemName: "bitcoinsign.circle.fill")
                .font(.title)
                .foregroundStyle(.orange)
        }
    }

    private var previewBackground: some ShapeStyle {
        switch item.preview {
        case "golden-coins":
            return AnyShapeStyle(LinearGradient(colors: [Color(red: 1.0, green: 0.98, blue: 0.9), .yellow.opacity(0.3)], startPoint: .topLeading, endPoint: .bottomTrailing))
        case "confetti":
            return AnyShapeStyle(LinearGradient(colors: [.purple.opacity(0.15), .pink.opacity(0.15)], startPoint: .topLeading, endPoint: .bottomTrailing))
        case "medal-shimmer":
            return AnyShapeStyle(LinearGradient(colors: [.orange.opacity(0.2), .yellow.opacity(0.15)], startPoint: .topLeading, endPoint: .bottomTrailing))
        case "bonus-spin", "challenge-reroll":
            return AnyShapeStyle(Color("BrandBlue").opacity(0.1))
        default:
            return AnyShapeStyle(Color(.secondarySystemBackground))
        }
    }

    private func themeSwatch(_ color: Color) -> some View {
        Rectangle().fill(color)
    }

    private func iconPreview(colors: [Color]) -> some View {
        Circle()
            .fill(LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing))
            .frame(width: 56, height: 56)
            .overlay(
                Image(systemName: "figure.pool.swim")
                    .font(.title2)
                    .foregroundStyle(.white)
            )
    }
}
