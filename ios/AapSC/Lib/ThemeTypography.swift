import SwiftUI
import UIKit

enum ThemeTypography {
    static func usesOxanium(for themeCode: String) -> Bool {
        themeCode == "retro-wave" || themeCode == "classic"
    }

    static func headingTracking(for themeCode: String) -> CGFloat {
        switch themeCode {
        case "retro-wave": return 0.04 * 16
        case "classic": return 0.06 * 16
        default: return 0
        }
    }

    static func usesUppercaseHeadings(for themeCode: String) -> Bool {
        themeCode == "classic"
    }

    static func font(for themeCode: String, textStyle: Font.TextStyle, weight: Font.Weight = .regular) -> Font {
        guard usesOxanium(for: themeCode) else {
            return .system(textStyle, design: .default).weight(weight)
        }
        let size = uiFontSize(for: textStyle)
        let name = postScriptName(for: weight)
        return .custom(name, size: size)
    }

    static func uiFont(for themeCode: String, textStyle: UIFont.TextStyle, weight: UIFont.Weight = .regular) -> UIFont {
        let size = UIFont.preferredFont(forTextStyle: textStyle).pointSize
        guard usesOxanium(for: themeCode), let custom = UIFont(name: uiPostScriptName(for: weight), size: size) else {
            return UIFont.systemFont(ofSize: size, weight: weight)
        }
        return custom
    }

    private static func uiFontSize(for textStyle: Font.TextStyle) -> CGFloat {
        let style: UIFont.TextStyle
        switch textStyle {
        case .largeTitle: style = .largeTitle
        case .title: style = .title1
        case .title2: style = .title2
        case .title3: style = .title3
        case .headline: style = .headline
        case .subheadline: style = .subheadline
        case .body: style = .body
        case .callout: style = .callout
        case .footnote: style = .footnote
        case .caption: style = .caption1
        case .caption2: style = .caption2
        @unknown default: style = .body
        }
        return UIFont.preferredFont(forTextStyle: style).pointSize
    }

    private static func postScriptName(for weight: Font.Weight) -> String {
        switch weight {
        case .bold, .heavy, .black: return "OxaniumExtraLight-Bold"
        case .semibold: return "OxaniumExtraLight-SemiBold"
        case .medium: return "OxaniumExtraLight-Medium"
        default: return "OxaniumExtraLight-Regular"
        }
    }

    private static func uiPostScriptName(for weight: UIFont.Weight) -> String {
        switch weight {
        case .bold, .heavy, .black: return "OxaniumExtraLight-Bold"
        case .semibold: return "OxaniumExtraLight-SemiBold"
        case .medium: return "OxaniumExtraLight-Medium"
        default: return "OxaniumExtraLight-Regular"
        }
    }
}

struct ThemedFontModifier: ViewModifier {
    @EnvironmentObject private var preferences: UserPreferencesService

    func body(content: Content) -> some View {
        if ThemeTypography.usesOxanium(for: preferences.themeCode) {
            content.font(ThemeTypography.font(for: preferences.themeCode, textStyle: .body))
        } else {
            content
        }
    }
}

extension View {
    func themedBodyFont() -> some View {
        modifier(ThemedFontModifier())
    }
}
