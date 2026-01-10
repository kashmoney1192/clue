# Clue iOS App

This is an iOS wrapper app for the Clue detective game web application.

## Setup Instructions

### 1. Open the Project
1. Open `Clue.xcodeproj` in Xcode
2. Select your development team in the project settings

### 2. Configure the App

#### Required Settings in Xcode:

**General Tab:**
1. Select the "Clue" project in the navigator (left sidebar)
2. Select the "Clue" target
3. In the "General" tab:
   - **Bundle Identifier**: Set to `com.yourname.clue` (must be globally unique)
   - **Team**: Select your Apple Developer account
   - **Version**: Set to 1.0.0 (or your preferred version)
   - **Build Number**: Set to 1 (increment for each submission)

**Info Tab (Optional - Add later if needed):**

The app will work without these settings, but you can add them later:

1. Select the "Clue" target
2. Go to the "Info" tab
3. Add these properties by clicking the "+" button:

   **Camera Permission (Optional - only needed for QR scanning):**
   - Key: `Privacy - Camera Usage Description`
   - Value: `This app needs camera access to scan QR codes for the Clue game.`

   **Allow Web Content (Optional - may improve compatibility):**
   - Key: `App Transport Security Settings` (Dictionary)
   - Under it, add: `Allow Arbitrary Loads in Web Content` = `YES` (Boolean)

#### App Icons:
- You need to add app icons in `Assets.xcassets/AppIcon.appiconset`
- Required sizes:
  - 1024x1024 (App Store)
  - 180x180 (iPhone)
  - 120x120 (iPhone)
  - 167x167 (iPad Pro)
  - 152x152 (iPad)
  - And other required sizes

You can use a tool like [AppIcon.co](https://www.appicon.co) to generate all required sizes from a single image.

### 3. Testing
1. Select a simulator or your physical device
2. Press `Cmd+R` to build and run
3. The app should load the Clue game from the GitHub Pages URL

### 4. App Store Submission Checklist

#### Before Submitting:
- [ ] Add app icons (all required sizes)
- [ ] Add screenshots for App Store listing
- [ ] Test on multiple devices (iPhone, iPad)
- [ ] Test camera functionality for QR code scanning
- [ ] Verify the web app loads correctly
- [ ] Set proper version and build numbers
- [ ] Add privacy policy URL (required for App Store)
- [ ] Configure App Store Connect listing:
  - App name
  - Description
  - Keywords
  - Category (Games > Board)
  - Age rating

#### Privacy & Permissions:
The app can optionally use camera permission for QR code scanning. This can be added later in Xcode's Info tab if needed.

### 5. Building for Release
1. Select "Any iOS Device (arm64)" as the destination
2. Go to Product > Archive
3. Once archived, the Organizer window will open
4. Click "Distribute App"
5. Select "App Store Connect"
6. Follow the prompts to upload to App Store Connect

### 6. App Store Connect
1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app listing
3. Upload your build
4. Fill in all required metadata
5. Submit for review

## Technical Details

### Architecture:
- SwiftUI-based iOS app
- Uses WKWebView to load the web application
- URL: https://kashmoney1192.github.io/clue/

### Files:
- `ClueApp.swift`: App entry point
- `ContentView.swift`: Main view that displays the WebView
- `WebView.swift`: UIViewRepresentable wrapper for WKWebView

Note: App configuration and permissions are set in Xcode's project settings (Info tab), not in a separate Info.plist file.

## Support
For issues with the web app, update the GitHub Pages deployment.
For iOS app issues, check Xcode build logs.
