# Changelog

All notable changes to X Writer will be documented in this file.

---

## [0.0.3] — 2025-06-19

### ✨ Added
- **Preview Panel for Code-to-Image**: Before publishing, you now see a beautiful preview panel showing:
  - The generated code image exactly as it will appear on X
  - An editable text field with real-time character counter (warning at 260, danger at 280)
  - Signature preview (shows if signature is enabled and what it will look like)
  - Language badge showing detected code language
  - Keyboard shortcuts: `Ctrl+Enter` to publish, `Escape` to cancel
- Full i18n support for the preview panel (English + Spanish)

### 🔧 Changed
- The `Post Code Image` flow now has two steps: **Preview → Confirm → Publish** instead of the previous "fire and forget" approach
- Closing the preview panel cancels the publication (no accidental tweets)

### 📝 Documentation
- README updated with preview panel instructions
- QA Guide updated with 7 new test cases for the preview panel

---

## [0.0.2] — 2025-06-18

### Added
- Code-to-Image: share selected code as a syntax-highlighted PNG
- Smart Threads: auto-split long text into threaded tweets (1/X, 2/X...)
- Configurable signature (custom text, toggle on/off)
- Activity Bar icon with Quick Actions view
- Full internationalization (English / Spanish)
- Auto Thread toggle in Settings
- Import credentials from .env/.txt files

### Changed
- Improved credential management with SecretStorage
- Better rate limit handling for threads

---

## [0.0.1] — 2025-06-17

### Added
- Initial MVP release
- Post tweets via Command Palette
- Smart context (pre-fill from editor selection)
- Credential setup (manual entry)
- Daily rate limit counter (17 tweets/day)
- Donation prompt system
