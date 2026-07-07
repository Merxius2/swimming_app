import SwiftUI
import UIKit

enum OlympicPoolColors {
    static let white = Color(red: 0.973, green: 0.98, blue: 0.988)
    static let lane = Color(red: 0.0, green: 0.4, blue: 0.8)
    static let laneDeep = Color(red: 0.0, green: 0.298, blue: 0.6)
    static let gold = Color(red: 0.961, green: 0.773, blue: 0.094)
    static let border = Color(red: 0.0, green: 0.4, blue: 0.8, opacity: 0.18)
    static let night = Color(red: 0.043, green: 0.086, blue: 0.157)
    static let nightPanel = Color(red: 0.082, green: 0.133, blue: 0.22)
}

struct OlympicPoolPageBackground: View {
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        let base = colorScheme == .dark ? OlympicPoolColors.night : OlympicPoolColors.white
        let grid = colorScheme == .dark
            ? Color(red: 0.0, green: 0.4, blue: 0.8, opacity: 0.12)
            : Color(red: 0.0, green: 0.4, blue: 0.8, opacity: 0.04)

        Canvas { context, size in
            context.fill(Path(CGRect(origin: .zero, size: size)), with: .color(base))

            let spacing: CGFloat = 24
            var x: CGFloat = 0
            while x <= size.width {
                var path = Path()
                path.move(to: CGPoint(x: x, y: 0))
                path.addLine(to: CGPoint(x: x, y: size.height))
                context.stroke(path, with: .color(grid), lineWidth: 1)
                x += spacing
            }

            var y: CGFloat = 0
            while y <= size.height {
                var path = Path()
                path.move(to: CGPoint(x: 0, y: y))
                path.addLine(to: CGPoint(x: size.width, y: y))
                context.stroke(path, with: .color(grid), lineWidth: 1)
                y += spacing
            }
        }
        .ignoresSafeArea()
    }
}

struct ThemedPageBackgroundModifier: ViewModifier {
    @EnvironmentObject private var preferences: UserPreferencesService

    func body(content: Content) -> some View {
        if preferences.themeCode == "olympic-pool" {
            content.background {
                OlympicPoolPageBackground()
            }
        } else {
            content.background(Color(.systemGroupedBackground))
        }
    }
}

struct ThemedCardModifier: ViewModifier {
    @EnvironmentObject private var preferences: UserPreferencesService
    @Environment(\.colorScheme) private var colorScheme

    func body(content: Content) -> some View {
        if preferences.themeCode == "olympic-pool" {
            let fill = colorScheme == .dark ? OlympicPoolColors.nightPanel : Color.white
            let border = colorScheme == .dark
                ? Color(red: 0.0, green: 0.4, blue: 0.8, opacity: 0.35)
                : OlympicPoolColors.border

            content
                .background(fill, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .strokeBorder(border, lineWidth: 2)
                )
                .shadow(color: OlympicPoolColors.laneDeep.opacity(0.25), radius: 0, y: 2)
                .shadow(color: .black.opacity(colorScheme == .dark ? 0.35 : 0.08), radius: 12, y: 8)
        } else {
            content
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .strokeBorder(Color.white.opacity(0.15), lineWidth: 1)
                )
        }
    }
}

struct OlympicPoolTabBarConfigurator: UIViewControllerRepresentable {
    let isDark: Bool

    func makeUIViewController(context: Context) -> UIViewController {
        UIViewController()
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(
            red: 0.0,
            green: isDark ? 0.298 : 0.4,
            blue: isDark ? 0.6 : 0.8,
            alpha: 1
        )
        appearance.shadowColor = UIColor(OlympicPoolColors.gold)
        appearance.shadowImage = UIImage()

        let normal = appearance.stackedLayoutAppearance.normal
        normal.iconColor = UIColor(white: 1.0, alpha: 0.88)
        normal.titleTextAttributes = [
            .foregroundColor: UIColor(white: 1.0, alpha: 0.88),
            .font: UIFont.systemFont(ofSize: 10, weight: .medium),
        ]

        let selected = appearance.stackedLayoutAppearance.selected
        selected.iconColor = UIColor(OlympicPoolColors.gold)
        selected.titleTextAttributes = [
            .foregroundColor: UIColor(OlympicPoolColors.gold),
            .font: UIFont.systemFont(ofSize: 10, weight: .bold),
        ]

        UITabBar.appearance().standardAppearance = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance
        UITabBar.appearance().tintColor = UIColor(OlympicPoolColors.gold)
        UITabBar.appearance().unselectedItemTintColor = UIColor(white: 1.0, alpha: 0.88)
    }
}

struct DefaultTabBarConfigurator: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        UIViewController()
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
        let appearance = UITabBarAppearance()
        appearance.configureWithDefaultBackground()
        UITabBar.appearance().standardAppearance = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance
        UITabBar.appearance().tintColor = nil
        UITabBar.appearance().unselectedItemTintColor = nil
    }
}

struct OlympicPoolUploadFAB: View {
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: "arrow.up")
                .font(.system(size: 22, weight: .bold))
                .foregroundStyle(OlympicPoolColors.laneDeep)
                .frame(width: 58, height: 58)
                .background(OlympicPoolColors.gold, in: Circle())
                .overlay(
                    Circle()
                        .strokeBorder(Color.white.opacity(0.9), lineWidth: 2)
                )
                .shadow(color: OlympicPoolColors.gold.opacity(0.45), radius: 10, y: 4)
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Upload")
    }
}

extension View {
    func themedPageBackground() -> some View {
        modifier(ThemedPageBackgroundModifier())
    }

    func themedCard() -> some View {
        modifier(ThemedCardModifier())
    }
}

extension AppThemeDefinition {
    var displayPrimary: Color {
        code == "olympic-pool" ? OlympicPoolColors.lane : primary
    }

    var displayAccent: Color {
        code == "olympic-pool" ? OlympicPoolColors.gold : accent
    }
}
