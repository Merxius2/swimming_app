import Foundation
import SwiftUI

struct AppThemeDefinition: Identifiable, Equatable {
    var id: String { code }
    let code: String
    let nameKey: String
    let primary: Color
    let secondary: Color
    let accent: Color
}

enum AppThemes {
    static let defaultCode = "liquid-os"

    static let all: [AppThemeDefinition] = [
        AppThemeDefinition(code: "liquid-os", nameKey: "settings.themes.liquidOs.name", primary: Color(red: 0.231, green: 0.357, blue: 1.0), secondary: Color(red: 0.482, green: 0.357, blue: 1.0), accent: Color(red: 0.910, green: 0.353, blue: 0.549)),
        AppThemeDefinition(code: "gen-z", nameKey: "settings.themes.genZ.name", primary: Color(red: 0.384, green: 0.0, blue: 0.933), secondary: Color(red: 0.831, green: 1.0, blue: 0.0), accent: Color(red: 1.0, green: 0.412, blue: 0.706)),
        AppThemeDefinition(code: "classic", nameKey: "settings.themes.classic.name", primary: Color(red: 0.875, green: 0.0, blue: 0.141), secondary: Color(red: 0.953, green: 0.686, blue: 0.0), accent: Color(red: 0.0, green: 0.561, blue: 0.839)),
        AppThemeDefinition(code: "olympic-pool", nameKey: "settings.themes.olympicPool.name", primary: Color(red: 0.973, green: 0.980, blue: 0.988), secondary: Color(red: 0.0, green: 0.4, blue: 0.8), accent: Color(red: 0.961, green: 0.773, blue: 0.094)),
        AppThemeDefinition(code: "midnight-lane", nameKey: "settings.themes.midnightLane.name", primary: Color(red: 0.027, green: 0.043, blue: 0.078), secondary: Color(red: 0.133, green: 0.827, blue: 0.933), accent: Color(red: 0.031, green: 0.569, blue: 0.698)),
        AppThemeDefinition(code: "retro-wave", nameKey: "settings.themes.retroWave.name", primary: Color(red: 1.0, green: 0.431, blue: 0.780), secondary: Color(red: 0.616, green: 0.306, blue: 0.867), accent: Color(red: 0.361, green: 0.882, blue: 0.902)),
        AppThemeDefinition(code: "tropical-open", nameKey: "settings.themes.tropicalOpen.name", primary: Color(red: 0.220, green: 0.741, blue: 0.973), secondary: Color(red: 0.051, green: 0.580, blue: 0.533), accent: Color(red: 0.984, green: 0.443, blue: 0.522)),
        AppThemeDefinition(code: "gold-luxe", nameKey: "settings.themes.goldLuxe.name", primary: Color(red: 1.0, green: 0.973, blue: 0.906), secondary: Color(red: 0.961, green: 0.835, blue: 0.396), accent: Color(red: 0.706, green: 0.325, blue: 0.035)),
        AppThemeDefinition(code: "platinum-elite", nameKey: "settings.themes.platinumElite.name", primary: Color(red: 0.973, green: 0.980, blue: 0.988), secondary: Color(red: 0.796, green: 0.835, blue: 0.882), accent: Color(red: 0.392, green: 0.455, blue: 0.545)),
    ]

    static func theme(for code: String) -> AppThemeDefinition {
        all.first { $0.code == code } ?? all[0]
    }
}

private struct ThemeColorsKey: EnvironmentKey {
    static let defaultValue = AppThemes.theme(for: AppThemes.defaultCode)
}

extension EnvironmentValues {
    var themeColors: AppThemeDefinition {
        get { self[ThemeColorsKey.self] }
        set { self[ThemeColorsKey.self] = newValue }
    }
}
