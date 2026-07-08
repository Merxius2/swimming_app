import SwiftUI

struct StoreIconPreview: View {
    let id: String?
    var size: CGFloat = 40

    var body: some View {
        if let id, let asset = AppIconService.assetName(for: id) {
            Image(asset)
                .resizable()
                .scaledToFit()
                .frame(width: size, height: size)
                .clipShape(RoundedRectangle(cornerRadius: size * 0.22, style: .continuous))
        } else {
            Image(systemName: "app.fill")
                .font(.system(size: size * 0.7))
                .foregroundStyle(.secondary)
                .frame(width: size, height: size)
        }
    }
}
