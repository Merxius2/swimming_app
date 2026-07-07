import SwiftUI

struct CoinBadge: View {
    enum Size {
        case sm
        case md

        var iconSize: CGFloat {
            switch self {
            case .sm: return 13
            case .md: return 15
            }
        }

        var font: Font {
            switch self {
            case .sm: return .caption2.weight(.semibold)
            case .md: return .caption.weight(.semibold)
            }
        }
    }

    let count: Int
    var size: Size = .md
    var golden: Bool = false

    @EnvironmentObject private var viewModel: SwimViewModel

    private var isGolden: Bool {
        golden || SwimCoinStore.hasGoldenCoinBadge(viewModel.storeUnlocks)
    }

    var body: some View {
        HStack(spacing: 4) {
            CoinsIcon(size: size.iconSize, golden: isGolden)
            Text(count.formatted())
                .font(size.font)
                .monospacedDigit()
        }
        .foregroundStyle(foregroundColor)
        .shadow(color: shadowColor, radius: isGolden ? 4 : 0, y: isGolden ? 0 : 0)
    }

    private var foregroundColor: Color {
        if isGolden {
            return Color(red: 0.851, green: 0.467, blue: 0.024)
        }
        return Color(red: 0.851, green: 0.467, blue: 0.024)
    }

    private var shadowColor: Color {
        isGolden ? Color(red: 0.984, green: 0.749, blue: 0.141).opacity(0.55) : .clear
    }
}

private struct CoinsIcon: View {
    let size: CGFloat
    var golden: Bool = false

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            Circle()
                .strokeBorder(lineWidth: max(1.2, size * 0.12))
                .frame(width: size * 0.62, height: size * 0.62)
                .offset(x: size * 0.34, y: -size * 0.02)
            Circle()
                .strokeBorder(lineWidth: max(1.2, size * 0.12))
                .frame(width: size * 0.62, height: size * 0.62)
                .offset(y: size * 0.08)
        }
        .frame(width: size, height: size)
        .foregroundStyle(golden ? Color(red: 0.961, green: 0.620, blue: 0.043) : Color(red: 0.851, green: 0.467, blue: 0.024))
    }
}
