import SwiftUI

struct StorePageIconView: View {
    let pageKey: String
    let systemImage: String
    var size: CGFloat = 22
    var color: Color = Color("BrandBlue")

    @EnvironmentObject private var viewModel: SwimViewModel

    var body: some View {
        if let asset = StorePageIcons.resolve(
            activeAppIcon: viewModel.profile.activeAppIcon,
            pageKey: pageKey,
            storeUnlocks: viewModel.storeUnlocks
        ) {
            Image(asset)
                .resizable()
                .scaledToFit()
                .frame(width: size, height: size)
        } else {
            Image(systemName: systemImage)
                .font(.system(size: size * 0.9, weight: .semibold))
                .foregroundStyle(color)
                .frame(width: size, height: size)
        }
    }
}
