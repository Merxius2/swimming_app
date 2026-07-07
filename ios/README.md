# Aap-SC — Native iOS App

This folder contains a **native SwiftUI iOS app** for Aap-SC (Swim Coach), ported from the Next.js web app in the repository root.

Open and build it in **Xcode** on macOS.

## Requirements

- macOS with **Xcode 15.4+**
- iOS **17.0+** (iPhone or iPad simulator/device)
- An Apple Developer account for running on a physical device

## Open in Xcode

1. Clone or pull branch `cursor/ios-xcode-port-eba9`
2. Open the project:

```bash
open ios/AapSC.xcodeproj
```

3. Select the **AapSC** scheme and an iPhone simulator (e.g. iPhone 16)
4. Press **⌘R** to build and run

## First-time setup in Xcode

1. Select the **AapSC** target → **Signing & Capabilities**
2. Set your **Team** (Apple ID / Developer account)
3. Optionally change **Bundle Identifier** from `com.aapft.aapsc` to your own reverse-DNS id
4. Add an app icon in `AapSC/Resources/Assets.xcassets/AppIcon.appiconset` (1024×1024 PNG)

## 1:1 port plan

| Phase | Scope | Status |
|-------|--------|--------|
| 1 | Data models, storage, ViewModel API | ✅ |
| 2 | Core lib (coins, medals, challenges, mascot, duplicates, records) | ✅ |
| 3 | Upload flow (duplicate check, settlement, coin/medal modals) | ✅ |
| 4 | Progress, History, Benchmark UI parity | ✅ |
| 5 | Coins page (wheel + store) | ✅ |
| 6 | Medals page + monthly challenges UI | ✅ |
| 7 | i18n, themes, dark mode, import/export, AI coach, polish | 🔜 Next |

## What's included

| Feature | Status |
|---------|--------|
| Progress dashboard with Swift Charts | ✅ |
| Upload Apple Fitness screenshots (Vision OCR) | ✅ |
| Screenshot parsing (Dutch/Apple Fitness text) | ✅ |
| Session history | ✅ |
| Age-group benchmarks | ✅ |
| Swim coins (session rewards) | ✅ |
| Wheel of Fortune + coin store | ✅ |
| Medals gallery + monthly challenge history | ✅ |
| Profile & settings | ✅ |
| Mascot UI assets | Partial |
| AI coach feedback | 🔜 Planned follow-up |
| Import/export web app data | 🔜 Planned follow-up |

## Architecture

```
ios/
├── AapSC.xcodeproj/     # Xcode project — open this
└── AapSC/
    ├── AapSCApp.swift           # App entry point
    ├── ContentView.swift        # Tab navigation
    ├── Models/                  # Codable data models (matches web JSON shape)
    ├── Services/                # UserDefaults storage + Vision OCR
    ├── ViewModels/              # SwimViewModel (@MainActor)
    ├── Views/                   # SwiftUI screens
    ├── Lib/                     # Ported business logic from lib/*.js
    └── Resources/               # Assets & colors
```

## Data storage

Swim data is stored locally in **UserDefaults** under the same key as the web app:

```
AUDIT_SWIM_DATA
```

The JSON schema mirrors the web app's `SwimData` structure so future import/export between platforms is straightforward.

## OCR

Screenshot import uses Apple's **Vision** framework (`VNRecognizeTextRequest`) instead of Tesseract.js. The parsing rules in `Lib/ScreenshotParser.swift` are ported from `lib/screenshotParser.js`.

## Relationship to the web app

- The **Next.js web app** remains in the repository root and is unchanged on `main`.
- This **iOS app** lives on branch `cursor/ios-xcode-port-eba9` under `ios/`.
- Shared business rules (benchmarks, formatters, screenshot parsing, coin math) are reimplemented in Swift under `ios/AapSC/Lib/`.

## Troubleshooting

**"Signing requires a development team"**  
Set your Team under Signing & Capabilities.

**Photo picker does nothing**  
Grant photo library access when prompted; check `NSPhotoLibraryUsageDescription` in `Info.plist`.

**Build fails on Charts**  
Ensure deployment target is iOS 17+ (Swift Charts requirement).

## Next steps (suggested)

1. Port `lib/swimMedals.js` and monthly challenges
2. Add mascot UI assets from the web app
3. Implement JSON import/export for cross-platform sync
4. Call OpenAI directly from the device for AI coach feedback (same as web client-side key flow)
