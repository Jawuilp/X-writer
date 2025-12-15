# X Writer

VS Code extension to post tweets to Twitter/X directly from your editor.

## Features

- 🔐 **BYOK (Bring Your Own Keys)**: Your credentials, your total control.
- ✍️ **Fast Posting**: Post tweets without leaving VS Code.
- 🎯 **Smart Context**: Select code → Right Click → Automatic Tweet.
- 🛡️ **Limit Protection**: Automatic counter (17 tweets/day).
- 📊 **Real-time Counter**: Visualize characters while you type.
- 🔗 **Direct Links**: Open your published tweets with one click.
- 💙 **Activity Bar**: Custom icon in the sidebar.
- 🚀 **Modern Interface**: Custom view with quick actions.
- 🌍 **Internationalization**: Support for English and Spanish.

## Installation & Development

1. Clone this repository.
2. Run `pnpm install` to install dependencies.
3. Press F5 to open a VS Code development window.

### Building the Extension

This project uses `esbuild` for bundling.

- **Development Watch Mode**: `npm run watch`
- **Build for Production**: `npm run compile`
- **Package Extension (.vsix)**: `pnpm run package`

## Configuration

### Get Twitter Credentials

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard).
2. Create an app (or use an existing one).
3. Generate your API Keys and Access Tokens.
4. You will need:
   - API Key
   - API Secret
   - Access Token
   - Access Secret

### Setup in VS Code

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
2. Search for: `X Writer: Setup Credentials`.
3. Choose an option:
   - **Import from file** (Recommended): Select a `.env` or `.txt` file with your keys (`API_KEY=...`).
   - **Enter manually**: Copy and paste your 4 keys one by one.

> **Note:** Make sure to regenerate your *Access Tokens* after changing the App Permissions to "Read and Write" in the developer portal.

### Donations
If you like the extension, you can support me by buying me a coffee ☕:
`X Writer: Donate / Support` or visit [my Ko-fi](https://ko-fi.com/jawuilp).

## Usage

### Post a Tweet

**Method 1: From Activity Bar**
1. Click on the X Writer icon in the left sidebar 🐦.
2. Click on "✍️ Post Tweet".
3. Write your message (real-time counter: X/280).
4. Done! You will see a "View on X" button to open it in the browser.

**Method 2: With Smart Context**
1. Select code or text in the editor.
2. `Ctrl+Shift+P` → `X Writer: Post Tweet`.
3. The selected text will pre-fill automatically.
4. Edit and publish.

**Method 3: From Commands**
1. Open the Command Palette (`Ctrl+Shift+P`).
2. Search for: `X Writer: Post Tweet`.
3. Write your message.
4. Done!

### Tweet Limit

⚠️ Respecting the X Free API limits:
- **17 tweets per day** (automatic counter).
- The limit resets every 24 hours.
- You will see remaining tweets on every post.

### Delete Credentials

1. Open the Command Palette.
2. Search for: `X Writer: Reset Credentials`.

## Security

Credentials are stored securely using VS Code's `SecretStorage` API, which utilizes the operating system's credential system (Keychain on macOS, Credential Manager on Windows, Secret Service on Linux).

## Help & About

- Click on the "❓ Help & About" icon in the sidebar to see commands and developer info.
- **Change Language**: Settings > X Writer > Language.

## License

MIT
