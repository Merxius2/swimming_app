import SwiftUI

struct CoinsScreen: View {
    @EnvironmentObject private var preferences: UserPreferencesService
    @Environment(\.dismiss) private var dismiss
    @Environment(\.themeColors) private var themeColors

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    ScreenHeader(
                        preferences.t("coins.store.title"),
                        subtitle: preferences.t("coins.store.subtitle"),
                        pageKey: "coins",
                        systemImage: "bag.fill"
                    )

                    SwimCoinStoreView(embedded: true)
                }
                .padding()
            }
            .navigationTitle(preferences.t("coins.label"))
            .navigationBarTitleDisplayMode(.inline)
            .themedNavigationBar()
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(preferences.t("coins.close")) { dismiss() }
                }
            }
        }
        .themedPageBackground()
    }
}

struct WheelOfFortuneView: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @EnvironmentObject private var preferences: UserPreferencesService
    @Environment(\.themeColors) private var themeColors

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
                        Label(
                            preferences.t("coins.wheel.freeSpinReady", params: ["count": String(freeSpins)]),
                            systemImage: "sparkles"
                        )
                            .themeFont(.caption, weight: .semibold)
                            .foregroundStyle(Color(red: 0.482, green: 0.357, blue: 1.0))
                    }
                    Text(preferences.t("coins.wheel.paidSpinsRemaining", params: [
                        "remaining": String(paidSpinsRemaining),
                        "limit": String(dailySpinLimit)
                    ]))
                        .themeFont(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            ZStack {
                Circle()
                    .fill(Color(.systemGray6))
                    .frame(width: 280, height: 280)
                    .shadow(color: .black.opacity(0.15), radius: 12, y: 6)

                WheelDiscView(layout: displayLayout, rotation: rotation, bet: bet)
                    .frame(width: 260, height: 260)

                Image(systemName: "arrowtriangle.down.fill")
                    .themeFont(.title3, weight: .semibold)
                    .foregroundStyle(themeColors.primary)
                    .offset(y: -150)
            }
            .padding(.vertical, 8)

            Text(preferences.t("coins.wheel.pickBet"))
                .themeFont(.subheadline)
                .foregroundStyle(.secondary)

            HStack(spacing: 10) {
                ForEach(SwimWheel.wheelBets, id: \.self) { amount in
                    let active = bet == amount
                    let disabled = spinning || (freeSpins == 0 && (viewModel.totalCoins < amount || atDailyLimit))
                    Button {
                        bet = amount
                    } label: {
                        Text("\(amount)")
                            .themeFont(.subheadline, weight: .semibold)
                            .frame(minWidth: 56)
                            .padding(.vertical, 10)
                            .background(
                                active ? themeColors.primary : Color(.secondarySystemBackground),
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
                    .themeFont(.headline, weight: .semibold)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(themeColors.primary, in: RoundedRectangle(cornerRadius: 14))
                    .foregroundStyle(.white)
            }
            .disabled(spinning || !canSpin)

            if !canSpin && !spinning && atDailyLimit {
                Text(preferences.t("coins.wheel.dailyLimitReached"))
                    .themeFont(.caption)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            } else if !canSpin && !spinning && viewModel.totalCoins < bet {
                Text(preferences.t("coins.wheel.notEnough"))
                    .themeFont(.caption)
                    .foregroundStyle(.secondary)
            }

            if let result {
                Card {
                    VStack(spacing: 6) {
                        Text(preferences.t("coins.wheel.resultTitle"))
                            .themeFont(.subheadline, weight: .semibold)
                        Text(resultMessage(result))
                            .themeFont(.body)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
        }
    }

    private var spinButtonTitle: String {
        if spinning { return preferences.t("coins.wheel.spinning") }
        if freeSpins > 0 {
            return preferences.t("coins.wheel.spinFree", params: ["count": String(freeSpins)])
        }
        return preferences.t("coins.wheel.spin", params: ["bet": String(bet)])
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
            return preferences.t("coins.wheel.wonCoins", params: [
                "amount": String(result.resolved.coinsDelta)
            ])
        case "free_spin":
            let granted = result.resolved.freeSpinsGranted ?? 1
            if granted > 1 {
                return preferences.t("coins.wheel.wonFreeSpinMulti", params: [
                    "count": String(granted)
                ])
            }
            return preferences.t("coins.wheel.wonFreeSpin")
        case "nothing":
            return preferences.t("coins.wheel.wonNothing", params: [
                "amount": String(result.resolved.amountLost ?? bet)
            ])
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
    let bet: Int

    private let diameter: CGFloat = 260

    var body: some View {
        ZStack {
            Circle()
                .fill(Color(red: 0.094, green: 0.094, blue: 0.106))

            ForEach(layout.segments) { segment in
                WheelSegmentWedgeView(segment: segment)
            }

            WheelLabelsCanvas(layout: layout, bet: bet, diameter: diameter)

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
        .frame(width: diameter, height: diameter)
        .rotationEffect(.degrees(rotation))
    }
}

private struct WheelLabelsCanvas: View {
    @EnvironmentObject private var preferences: UserPreferencesService

    let layout: SwimWheel.WheelLayout
    let bet: Int
    let diameter: CGFloat

    var body: some View {
        Canvas { context, size in
            for segment in layout.segments where SwimWheel.segmentShouldShowLabel(segment) {
                drawLabel(context: &context, size: size, segment: segment)
            }
        }
        .frame(width: diameter, height: diameter)
        .allowsHitTesting(false)
    }

    private func drawLabel(
        context: inout GraphicsContext,
        size: CGSize,
        segment: SwimWheel.LayoutSegment
    ) {
        let label = SwimWheel.segmentDisplayLabel(
            segment,
            bet: bet,
            t: preferences.translations
        )
        guard !label.isEmpty else { return }

        let fontSize = SwimWheel.segmentFontSize(segment)
        let font = Font.system(size: fontSize, weight: .bold)
        let color = segment.shiny
            ? Color(red: 0.471, green: 0.208, blue: 0.059)
            : Color.white

        if SwimWheel.segmentUsesRadialLabel(segment) {
            drawRadialLabel(
                context: &context,
                label: label,
                font: font,
                color: color,
                segment: segment,
                size: size
            )
        } else {
            drawArcLabel(
                context: &context,
                label: label,
                font: font,
                color: color,
                segment: segment,
                size: size
            )
        }
    }

    private func drawRadialLabel(
        context: inout GraphicsContext,
        label: String,
        font: Font,
        color: Color,
        segment: SwimWheel.LayoutSegment,
        size: CGSize
    ) {
        let position = SwimWheel.segmentTextPosition(diameter: size.width, segment: segment)
        let resolved = context.resolve(
            Text(label)
                .font(font)
                .foregroundStyle(color)
        )
        var ctx = context
        ctx.translateBy(x: position.x, y: position.y)
        ctx.rotate(by: Angle(degrees: position.rotate))
        ctx.draw(resolved, at: .zero, anchor: .center)
    }

    private func drawArcLabel(
        context: inout GraphicsContext,
        label: String,
        font: Font,
        color: Color,
        segment: SwimWheel.LayoutSegment,
        size: CGSize
    ) {
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let radius = size.width * SwimWheel.labelArcRadiusRatio
        let chars = Array(label)
        guard !chars.isEmpty else { return }

        for (index, char) in chars.enumerated() {
            let progress = (Double(index) + 0.5) / Double(chars.count)
            let deg = segment.startDeg + segment.sweepDeg * progress
            let rad = (deg - 90) * Double.pi / 180
            let point = CGPoint(
                x: center.x + radius * CGFloat(cos(rad)),
                y: center.y + radius * CGFloat(sin(rad))
            )
            var rotation = deg + 90
            if deg > 90 && deg < 270 {
                rotation += 180
            }

            var ctx = context
            ctx.translateBy(x: point.x, y: point.y)
            ctx.rotate(by: Angle(degrees: rotation))
            let resolved = context.resolve(
                Text(String(char))
                    .font(font)
                    .foregroundStyle(color)
            )
            ctx.draw(resolved, at: .zero, anchor: .center)
        }
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

    private var segmentFill: AnyShapeStyle {
        if segment.shiny {
            AnyShapeStyle(
                LinearGradient(
                    colors: [
                        Color(red: 1.0, green: 0.957, blue: 0.722),
                        Color(red: 1.0, green: 0.843, blue: 0.0),
                        Color(red: 0.722, green: 0.525, blue: 0.043),
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
        } else {
            AnyShapeStyle(segment.color)
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

struct SwimCoinStoreView: View {
    @EnvironmentObject private var viewModel: SwimViewModel
    @EnvironmentObject private var preferences: UserPreferencesService
    var embedded = false

    private var allThemesUnlocked: Bool {
        viewModel.cheats.allThemesUnlocked
    }

    var body: some View {
        VStack(spacing: 24) {
            if !embedded {
                Divider()
                    .padding(.top, 8)

                VStack(spacing: 8) {
                    Label(preferences.t("coins.store.title"), systemImage: "bag.fill")
                        .themeFont(.title3, weight: .bold)
                        .foregroundStyle(Color("BrandBlue"))
                    Text(preferences.t("coins.store.subtitle"))
                        .themeFont(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
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
            Label(
                SwimCoinStore.categoryLabel(category, t: preferences.translations),
                systemImage: SwimCoinStore.categoryIcon(category)
            )
                .themeFont(.caption, weight: .bold)
                .foregroundStyle(.secondary)
                .textCase(.uppercase)

            if category == "vibes" {
                Text(preferences.t("coins.store.vibesIosNote"))
                    .themeFont(.caption2)
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
        let price = isConsumable
            ? SwimCoinStore.getConsumableItemPrice(id: item.id, bonusWheelSpinCredits: viewModel.bonusWheelSpinCredits)
            : item.price
        let canBuy = isConsumable
            ? viewModel.totalCoins >= price
            : SwimCoinStore.canPurchaseStoreItem(
                item.id,
                storeUnlocks: viewModel.storeUnlocks,
                totalCoins: viewModel.totalCoins,
                bonusWheelSpinCredits: viewModel.bonusWheelSpinCredits
            )
        let shortfall = max(0, price - viewModel.totalCoins)
        let ownedCount = consumableOwnedCount(item)

        Card {
            VStack(alignment: .leading, spacing: 12) {
                StoreItemPreviewView(item: item, bonusWheelSpinCredits: viewModel.bonusWheelSpinCredits)

                Text(SwimCoinStore.localizedName(item, t: preferences.translations))
                    .themeFont(.subheadline, weight: .semibold)
                Text(SwimCoinStore.localizedDescription(item, t: preferences.translations))
                    .themeFont(.caption)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)

                if isConsumable && ownedCount > 0 {
                    Text(
                        item.id == SwimCoinStore.bonusWheelSpinStoreItemId
                            ? preferences.t("coins.store.bonusSpinOwned", params: ["count": String(ownedCount)])
                            : preferences.t("coins.store.ownedCount", params: ["count": String(ownedCount)])
                    )
                    .themeFont(.caption2, weight: .medium)
                    .foregroundStyle(Color("BrandBlue"))
                }

                HStack {
                    if owned {
                        Text(preferences.t("coins.store.owned"))
                            .themeFont(.subheadline, weight: .semibold)
                            .foregroundStyle(.green)
                    } else {
                        CoinBadge(count: price, golden: false)
                    }

                    Spacer()

                    if !owned {
                        Button {
                            guard viewModel.purchaseStoreItem(item.id) else { return }
                            if let themeCode = item.themeCode {
                                preferences.setTheme(themeCode)
                            }
                        } label: {
                            Text(
                                canBuy
                                    ? (isConsumable
                                        ? preferences.t("coins.store.buyConsumable")
                                        : preferences.t("coins.store.buy"))
                                    : preferences.t("coins.store.notEnough", params: ["amount": String(shortfall)])
                            )
                                .themeFont(.caption, weight: .semibold)
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
        if let vibeStyle = StoreVibePreviewStyle(preview: item.preview) {
            StoreVibePreviewView(style: vibeStyle)
        } else {
            switch item.preview {
            case "theme":
                if let themeCode = item.themeCode {
                    ThemePreviewBar(theme: AppThemes.theme(for: themeCode), height: 80)
                } else {
                    ThemePreviewBar(theme: AppThemes.theme(for: AppThemes.defaultCode), height: 80)
                }
            case "golden-coins":
                CoinBadge(count: 1337, golden: true)
            case "confetti":
                HStack {
                    Text("🎊").themeFont(.title2, weight: .bold)
                    Text("✨").themeFont(.title3, weight: .semibold)
                    Text("🎉").themeFont(.title2, weight: .bold)
                }
            case "medal-shimmer":
                Image(systemName: "medal.fill")
                    .font(.system(size: 36))
                    .foregroundStyle(.orange)
            case "bonus-spin":
                VStack(spacing: 4) {
                    Text("\(SwimCoinStore.getDailyPaidSpinLimit(bonusWheelSpinCredits))/day")
                        .themeFont(.title2, weight: .black)
                        .foregroundStyle(Color("BrandBlue"))
                    Text("paid spins")
                        .themeFont(.caption2, weight: .semibold)
                        .foregroundStyle(.secondary)
                        .textCase(.uppercase)
                }
            case "challenge-reroll":
                VStack(spacing: 6) {
                    Image(systemName: "shuffle")
                        .themeFont(.title, weight: .bold)
                        .foregroundStyle(Color("BrandBlue"))
                    Text("monthly challenge")
                        .themeFont(.caption2, weight: .semibold)
                        .foregroundStyle(.secondary)
                        .textCase(.uppercase)
                }
            case "icon-gold-medal":
                StoreIconPreview(id: "icon:gold-medal", size: 56)
            case "icon-neon-lane":
                StoreIconPreview(id: "icon:neon-lane", size: 56)
            case "icon-trophy-splash":
                StoreIconPreview(id: "icon:trophy-splash", size: 56)
            case "icon-platinum-star":
                StoreIconPreview(id: "icon:platinum-star", size: 56)
            default:
                Image(systemName: "bitcoinsign.circle.fill")
                    .themeFont(.title, weight: .bold)
                    .foregroundStyle(.orange)
            }
        }
    }

    private var previewBackground: some ShapeStyle {
        if StoreVibePreviewStyle(preview: item.preview) != nil {
            return AnyShapeStyle(Color.clear)
        }
        switch item.preview {
        case "golden-coins":
            return AnyShapeStyle(LinearGradient(colors: [Color(red: 1.0, green: 0.98, blue: 0.9), .yellow.opacity(0.3)], startPoint: .topLeading, endPoint: .bottomTrailing))
        case "confetti":
            return AnyShapeStyle(LinearGradient(colors: [.purple.opacity(0.15), .pink.opacity(0.15)], startPoint: .topLeading, endPoint: .bottomTrailing))
        case "medal-shimmer":
            return AnyShapeStyle(LinearGradient(colors: [.orange.opacity(0.2), .yellow.opacity(0.15)], startPoint: .topLeading, endPoint: .bottomTrailing))
        case "bonus-spin", "challenge-reroll":
            return AnyShapeStyle(Color("BrandBlue").opacity(0.1))
        case "theme":
            return AnyShapeStyle(Color.clear)
        default:
            return AnyShapeStyle(Color(.secondarySystemBackground))
        }
    }

    private func iconPreview(colors: [Color]) -> some View {
        Circle()
            .fill(LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing))
            .frame(width: 56, height: 56)
            .overlay(
                Image(systemName: "figure.pool.swim")
                    .themeFont(.title2, weight: .bold)
                    .foregroundStyle(.white)
            )
    }
}
