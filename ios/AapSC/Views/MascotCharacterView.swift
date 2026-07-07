import SwiftUI

struct MascotCharacterView: View {
    let mascotId: String
    var mood: String = "happy"
    var animated: Bool = true
    var size: CGFloat = 56

    @State private var blinking = false

    var body: some View {
        let disappointed = mood == "disappointed" && MascotConstants.disappointedOpenImageName(mascotId) != nil
        let openName = disappointed
            ? MascotConstants.disappointedOpenImageName(mascotId)!
            : MascotConstants.openImageName(mascotId)
        let closedName = disappointed
            ? (MascotConstants.disappointedClosedImageName(mascotId) ?? MascotConstants.closedImageName(mascotId))
            : MascotConstants.closedImageName(mascotId)
        let width = size * MascotConstants.aspectRatio(mascotId)

        ZStack {
            Image(openName)
                .resizable()
                .scaledToFit()
                .opacity(blinking ? 0 : 1)
            Image(closedName)
                .resizable()
                .scaledToFit()
                .opacity(blinking ? 1 : 0)
        }
        .frame(width: width, height: size)
        .onAppear { scheduleBlinkingIfNeeded() }
        .onChange(of: mascotId) { _, _ in
            blinking = false
            scheduleBlinkingIfNeeded()
        }
        .onChange(of: mood) { _, _ in
            blinking = false
            scheduleBlinkingIfNeeded()
        }
    }

    private func scheduleBlinkingIfNeeded() {
        guard animated else { return }
        scheduleNextBlink(after: 2.6 + Double.random(in: 0...2.6))
    }

    private func scheduleNextBlink(after delay: TimeInterval) {
        guard animated else { return }
        DispatchQueue.main.asyncAfter(deadline: .now() + delay) {
            guard animated else { return }
            blinking = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                blinking = false
                if Double.random(in: 0...1) < 0.25 {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.14) {
                        blinking = true
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.13) {
                            blinking = false
                            scheduleNextBlink(after: 2.6 + Double.random(in: 0...2.6))
                        }
                    }
                } else {
                    scheduleNextBlink(after: 2.6 + Double.random(in: 0...2.6))
                }
            }
        }
    }
}
