# Aap-SC — Native iOS App

Native **SwiftUI** swim coach app for iPhone and iPad.

Open and build in **Xcode** on macOS:

```bash
open ios/AapSC.xcodeproj
```

## Requirements

- macOS with **Xcode 15.4+**
- iOS **17.0+**
- Apple Developer account for physical devices

## Navigation

| Tab | Screen |
|-----|--------|
| Mini games | Wheel of Fortune, Coin Flip, Pace Pick, Lane Timer |
| Medals | Medal gallery and monthly history |
| **Progress (center FAB)** | Charts, challenges, records, coach feedback |
| Benchmark | Age-group pace comparison |
| History | Session list and detail |

Upload is available from **Settings → Upload swim session**. Coins/store opens from the top bar on main screens.

## What's included

| Feature | Status |
|---------|--------|
| Progress dashboard with Swift Charts + moving averages | ✅ |
| Chart interaction toggle (scroll-friendly by default) | ✅ |
| Upload Apple Fitness screenshots (Vision OCR) | ✅ |
| HealthKit swim import | ✅ |
| Mini games page | ✅ |
| Swim coin store (escalating bonus spin price) | ✅ |
| Wheel of Fortune | ✅ |
| Medals + monthly challenges | ✅ |
| Themes (incl. Olympic Pool) + dark mode | ✅ |
| i18n: en, nl, ru, tr | ✅ |
| JSON import/export (v9) | ✅ |
| AI coach (optional OpenAI key) | ✅ |

## Architecture

```
ios/AapSC/
├── AapSCApp.swift
├── ContentView.swift        # Tab shell + sheets
├── Models/
├── Services/
├── ViewModels/
├── Views/
├── Lib/                       # Business logic + ChartMovingAverage
└── Resources/
    ├── Assets.xcassets
    └── Localizations/         # en.json, nl.json, ru.json, tr.json
```

## Tests

```bash
xcodebuild test -project ios/AapSC.xcodeproj -scheme AapSC \
  -destination 'platform=iOS Simulator,name=iPhone 16'
```

## Signing

1. Select **AapSC** target → **Signing & Capabilities**
2. Set your **Team**
3. Adjust **Bundle Identifier** if needed (default `com.aapft.aapsc`)
