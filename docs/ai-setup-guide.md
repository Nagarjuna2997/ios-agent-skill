# AI Coding Assistant Setup Guide for ios-agent-skill

> The definitive guide to installing, configuring, and loading the **ios-agent-skill** into every major AI coding assistant on macOS and Windows.

**Last updated:** 2026-03-30
**Skill repository:** `ios-agent-skill`
**Minimum requirements:** Node.js 18+, Git 2.30+, a terminal emulator

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Repository Setup](#repository-setup)
- [Tier 1: Major IDE Assistants](#tier-1-major-ide-assistants)
  - [1. Claude Code (Anthropic)](#1-claude-code-anthropic)
  - [2. OpenAI Codex CLI](#2-openai-codex-cli)
  - [3. Gemini CLI (Google)](#3-gemini-cli-google)
  - [4. Antigravity (Google)](#4-antigravity-google)
  - [5. Cursor](#5-cursor)
  - [6. GitHub Copilot](#6-github-copilot)
  - [7. Windsurf (Codeium)](#7-windsurf-codeium)
  - [8. JetBrains AI Assistant](#8-jetbrains-ai-assistant)
  - [9. JetBrains Junie](#9-jetbrains-junie)
  - [10. Zed AI](#10-zed-ai)
  - [11. Trae (ByteDance)](#11-trae-bytedance)
  - [12. Amazon Q Developer](#12-amazon-q-developer)
  - [13. Cline](#13-cline)
  - [14. Roo Code](#14-roo-code)
  - [15. KiloCode](#15-kilocode)
  - [16. Continue.dev](#16-continuedev)
  - [17. Augment Code](#17-augment-code)
  - [18. Tabnine](#18-tabnine)
  - [19. Aider](#19-aider)
  - [20. Sourcegraph Amp (formerly Cody)](#20-sourcegraph-amp-formerly-cody)
- [Tier 2: Cloud/Browser-Based](#tier-2-cloudbrowser-based)
  - [21. Replit Agent](#21-replit-agent)
  - [22. Lovable](#22-lovable)
  - [23. Bolt.new (StackBlitz)](#23-boltnew-stackblitz)
  - [24. v0 (Vercel)](#24-v0-vercel)
  - [25. Devin (Cognition)](#25-devin-cognition)
- [Tier 3: Open Source / Emerging](#tier-3-open-source--emerging)
  - [26. OpenCode](#26-opencode)
  - [27. OpenHands](#27-openhands)
  - [28. PearAI](#28-pearai)
- [General Tips](#general-tips)
- [Quick Reference Table](#quick-reference-table)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before setting up any AI coding assistant, ensure you have the following installed on your system.

### macOS Prerequisites

```bash
# Install Homebrew, Node.js, Git, and Python
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node git python@3.12
```

### Windows Prerequisites

```powershell
# Install Node.js, Git, and Python via winget
winget install OpenJS.NodeJS.LTS
winget install Git.Git
winget install Python.Python.3.12
```

Verify all installs: `node --version` (18+), `git --version` (2.30+), `python3 --version` (3.10+).

> **Note for Windows users:** Use PowerShell or Windows Terminal (not cmd.exe). Consider WSL for full compatibility.

### Optional: Install WSL on Windows

```powershell
# Install WSL with Ubuntu (recommended for CLI-based AI tools)
wsl --install
# After restart, install Node.js and Python inside WSL
```

---

## Repository Setup

Clone the ios-agent-skill repository before configuring any tool.

```bash
git clone https://github.com/anthropics/ios-agent-skill.git
cd ios-agent-skill
```

Verify skill files exist: `ls CLAUDE.md AGENTS.md GEMINI.md CONVENTIONS.md SKILL.md` (macOS) or `dir CLAUDE.md, AGENTS.md` (Windows).

### Repository Structure (Skill Files)

The ios-agent-skill repository ships with pre-configured skill files for every major AI coding assistant:

```
ios-agent-skill/
  CLAUDE.md                         # Claude Code
  AGENTS.md                         # OpenAI Codex CLI, Amp, Lovable, OpenCode, OpenHands
  GEMINI.md                         # Gemini CLI, Antigravity
  CONVENTIONS.md                    # Aider
  SKILL.md                          # Universal skill reference
  replit.md                         # Replit Agent
  .github/copilot-instructions.md   # GitHub Copilot
  .cursor/rules/ios-skill.md        # Cursor
  .windsurf/rules/ios-skill.md      # Windsurf
  .junie/guidelines.md              # JetBrains Junie
  .aiassistant/rules/ios-skill.md   # JetBrains AI Assistant
  .trae/rules/ios-skill.md          # Trae
  .amazonq/rules/ios-skill.md       # Amazon Q Developer
  .continue/rules/ios-skill.md      # Continue.dev
  .roo/rules/ios-skill.md           # Roo Code
  .kilocode/rules/ios-skill.md      # KiloCode
  .augment/rules/ios-skill.md       # Augment Code
  .tabnine/guidelines/ios-skill.md  # Tabnine
```

> **Important:** Most of these files are already present in the repository. When you clone the repo and open it in your AI tool, the skill is loaded automatically. The instructions below explain how to verify this and how to manually configure each tool if needed.

---

## Tier 1: Major IDE Assistants

---

### 1. Claude Code (Anthropic)

**Platforms:** macOS / Windows / Linux
**Pricing:** Usage-based (requires Anthropic API key or Claude Max subscription)
**Website:** https://docs.anthropic.com/en/docs/claude-code

Claude Code is Anthropic's agentic coding tool that runs in your terminal. It reads `CLAUDE.md` files automatically from the project root and parent directories.

#### macOS Setup

**Step 1: Install Claude Code**

```bash
# Option A: Install via npm (recommended)
npm install -g @anthropic-ai/claude-code

# Option B: Install via Homebrew
brew install claude-code
```

**Step 2: Authenticate**

```bash
# Option A: Set your Anthropic API key
export ANTHROPIC_API_KEY="sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# To make it permanent, add to your shell profile:
echo 'export ANTHROPIC_API_KEY="sk-ant-your-key-here"' >> ~/.zshrc
source ~/.zshrc

# Option B: Use Claude Max subscription (interactive login)
claude login
```

**Step 3: Load the ios-agent-skill**

```bash
# Navigate to the cloned repository
cd /path/to/ios-agent-skill

# Launch Claude Code - it automatically reads CLAUDE.md
claude
```

Claude Code automatically detects and loads `CLAUDE.md` from the project root. No additional configuration is needed.

**Step 4: Verify the Skill is Loaded**

Once inside the Claude Code session:

```
> What iOS frameworks and patterns does this skill cover?
```

Claude should respond with details about Swift, SwiftUI, UIKit, MVVM, and the various iOS frameworks documented in the skill. If it does, the skill is loaded correctly.

You can also run the init command to review the project:

```
> /init
```

**Step 5: Optional Configuration**

Create or edit `~/.claude/settings.json` to configure permissions and default model preferences.

#### Windows Setup

**Step 1: Install Claude Code**

```powershell
# Install via npm (Node.js must be installed first)
npm install -g @anthropic-ai/claude-code
```

**Step 2: Authenticate**

```powershell
# Set your API key (current session)
$env:ANTHROPIC_API_KEY = "sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# To make it permanent, set it as a system environment variable:
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "sk-ant-your-key-here", "User")

# Or use interactive login with Claude Max
claude login
```

**Step 3: Load the ios-agent-skill**

```powershell
# Navigate to the cloned repository
cd C:\path\to\ios-agent-skill

# Launch Claude Code
claude
```

**Step 4: Verify the Skill is Loaded**

Same verification as macOS -- ask Claude Code about the iOS skill content.

```
> Summarize the patterns and frameworks in this skill.
```

#### Skill File: `CLAUDE.md`

- **Location:** Project root (`ios-agent-skill/CLAUDE.md`)
- **Auto-detected:** Yes, Claude Code reads this file automatically when launched from the project directory.
- **Additional files:** Claude Code also respects `.claude/settings.json` for project-specific settings.

> **Monorepo tip:** Claude Code supports hierarchical `CLAUDE.md` files. It merges all files from the current directory up to the root. Place iOS-specific instructions in a subdirectory `CLAUDE.md`.

---

### 2. OpenAI Codex CLI

**Platforms:** macOS / Windows / Linux
**Pricing:** Usage-based (requires OpenAI API key)
**Website:** https://github.com/openai/codex

OpenAI's Codex CLI is a terminal-based agentic coding tool. It reads `AGENTS.md` files from the project directory.

#### macOS Setup

**Step 1: Install Codex CLI**

```bash
# Option A: Install via npm (recommended)
npm install -g @openai/codex

# Option B: Install via Homebrew
brew install codex
```

**Step 2: Set Your API Key**

```bash
# Set the OpenAI API key
export OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Make it permanent
echo 'export OPENAI_API_KEY="sk-your-key-here"' >> ~/.zshrc
source ~/.zshrc
```

**Step 3: Configure Codex (Optional)**

Create `~/.codex/config.toml` to set model name, approval mode (`suggest`, `auto-edit`, `full-auto`), and history preferences.

**Step 4: Load the ios-agent-skill**

```bash
# Navigate to the repository
cd /path/to/ios-agent-skill

# Launch Codex - it automatically reads AGENTS.md
codex
```

**Step 5: Verify the Skill is Loaded**

```
> What conventions does AGENTS.md define for this project?
```

Codex should reference the iOS development patterns, Swift conventions, and architecture guidelines from the skill.

#### Windows Setup

**Step 1: Install Codex CLI**

```powershell
npm install -g @openai/codex
```

**Step 2: Set Your API Key**

```powershell
# Current session
$env:OPENAI_API_KEY = "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Permanent
[System.Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "sk-your-key-here", "User")
```

**Step 3: Configure and Launch**

```powershell
cd C:\path\to\ios-agent-skill
codex
```

**Step 4: Verify**

Same as macOS -- ask about the project conventions defined in AGENTS.md.

#### Skill File: `AGENTS.md`

- **Location:** Project root (`ios-agent-skill/AGENTS.md`)
- **Auto-detected:** Yes, Codex CLI reads `AGENTS.md` automatically.
- **Config file:** `~/.codex/config.toml` for global settings.

---

### 3. Gemini CLI (Google)

**Platforms:** macOS / Windows / Linux
**Pricing:** Free tier available / Usage-based with Google AI API key
**Website:** https://github.com/google-gemini/gemini-cli

Gemini CLI is Google's terminal-based AI coding assistant. It reads `GEMINI.md` files from the project root.

#### macOS Setup

**Step 1: Install Gemini CLI**

```bash
# Install via npm
npm install -g @anthropic-ai/claude-code
# NOTE: The above is incorrect. The correct package is:
npm install -g @google/gemini-cli

# Or install via Homebrew (if available)
brew install gemini-cli
```

**Step 2: Authenticate**

```bash
# Option A: Set Google AI API key
export GOOGLE_API_KEY="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Make it permanent
echo 'export GOOGLE_API_KEY="AIzaSy-your-key-here"' >> ~/.zshrc
source ~/.zshrc

# Option B: Use Google Cloud authentication
gcloud auth application-default login
```

**Step 3: Load the ios-agent-skill**

```bash
cd /path/to/ios-agent-skill

# Launch Gemini CLI - it reads GEMINI.md automatically
gemini
```

**Step 4: Verify the Skill is Loaded**

```
> What does GEMINI.md say about the project structure?
```

Gemini should describe the iOS agent skill content, including frameworks and patterns.

#### Windows Setup

**Step 1: Install Gemini CLI**

```powershell
npm install -g @google/gemini-cli
```

**Step 2: Authenticate**

```powershell
# Set API key
$env:GOOGLE_API_KEY = "AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Make permanent
[System.Environment]::SetEnvironmentVariable("GOOGLE_API_KEY", "AIzaSy-your-key-here", "User")
```

**Step 3: Load and Verify**

```powershell
cd C:\path\to\ios-agent-skill
gemini
```

Ask the same verification question as macOS.

#### Skill File: `GEMINI.md`

- **Location:** Project root (`ios-agent-skill/GEMINI.md`)
- **Auto-detected:** Yes, Gemini CLI reads `GEMINI.md` automatically.
- **Fallback:** Also reads `AGENTS.md` if no `GEMINI.md` is found.

---

### 4. Antigravity (Google)

**Platforms:** macOS / Windows / Linux
**Pricing:** Requires Google AI API key or Vertex AI access
**Website:** https://github.com/google-gemini/antigravity

Antigravity is Google's experimental agentic coding tool built on the Gemini model family. It reads both `GEMINI.md` and `AGENTS.md`.

#### macOS Setup

**Step 1: Install Antigravity**

```bash
# Install via npm
npm install -g @google/antigravity

# Or via pip
pip install antigravity-ai
```

**Step 2: Authenticate**

```bash
# Use the same Google API key as Gemini CLI
export GOOGLE_API_KEY="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Or authenticate via gcloud
gcloud auth application-default login
```

**Step 3: Load the ios-agent-skill**

```bash
cd /path/to/ios-agent-skill

# Launch Antigravity
antigravity
```

Antigravity reads `GEMINI.md` first, then falls back to `AGENTS.md`.

**Step 4: Verify the Skill is Loaded**

```
> Describe the iOS development guidelines for this project.
```

#### Windows Setup

**Step 1: Install Antigravity**

```powershell
npm install -g @google/antigravity
# or
pip install antigravity-ai
```

**Step 2: Authenticate**

```powershell
$env:GOOGLE_API_KEY = "AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Step 3: Load and Verify**

```powershell
cd C:\path\to\ios-agent-skill
antigravity
```

#### Skill Files: `GEMINI.md`, `AGENTS.md`

- **Primary:** `GEMINI.md` (read first)
- **Fallback:** `AGENTS.md` (read if no GEMINI.md found)
- **Auto-detected:** Yes

---

### 5. Cursor

**Platforms:** macOS / Windows / Linux
**Pricing:** Free tier (limited) / Pro $20/month / Business $40/month
**Website:** https://cursor.com

Cursor is a VS Code fork with deep AI integration. It reads project rules from `.cursorrules` (legacy) or `.cursor/rules/` directory.

#### macOS Setup

**Step 1: Install Cursor**

```bash
# Option A: Install via Homebrew
brew install --cask cursor

# Option B: Download from website
# Visit https://cursor.com and download the .dmg file
# Open the .dmg and drag Cursor to Applications
```

**Step 2: Initial Configuration**

1. Open Cursor.
2. Sign in or create a Cursor account.
3. Go to **Cursor Settings** (Cmd+Shift+P > "Cursor Settings" or gear icon > Cursor Settings).
4. Under **Models**, configure your preferred model:
   - Cursor ships with its own API access (included in Pro plan).
   - To use your own API key: Settings > Models > Add API Key.

**Step 3: Load the ios-agent-skill**

The skill is already configured. When you open the `ios-agent-skill` folder in Cursor:

1. **File > Open Folder** and select `ios-agent-skill/`.
2. Cursor automatically reads `.cursor/rules/ios-skill.md`.

To verify the rules directory exists:

```bash
ls -la /path/to/ios-agent-skill/.cursor/rules/
# Should show: ios-skill.md
```

**Step 4: Verify the Skill is Loaded**

1. Open the AI chat panel (Cmd+L or Cmd+K).
2. Ask:
   ```
   What project rules are loaded for this workspace?
   ```
3. Cursor should reference the iOS development patterns from the skill.

Alternatively, check **Cursor Settings > Rules > Project Rules** to see the loaded rule files.

**Step 5: Add Legacy Rules (Optional)**

Optionally copy `.cursor/rules/ios-skill.md` to a root-level `.cursorrules` file for older Cursor versions.

#### Windows Setup

**Step 1: Install Cursor**

```powershell
# Option A: Install via winget
winget install Cursor.Cursor

# Option B: Download from https://cursor.com
# Run the .exe installer
```

**Step 2: Initial Configuration**

Same as macOS:
1. Open Cursor.
2. Sign in.
3. Configure model preferences in Cursor Settings.

**Step 3: Load the ios-agent-skill**

1. **File > Open Folder** and select the `ios-agent-skill` directory.
2. Cursor reads `.cursor\rules\ios-skill.md` automatically.

**Step 4: Verify**

Open the AI chat (Ctrl+L) and ask about the project rules.

#### Skill Files: `.cursor/rules/ios-skill.md`

- **Primary location:** `.cursor/rules/ios-skill.md`
- **Legacy location:** `.cursorrules` (root)
- **Auto-detected:** Yes, Cursor reads from `.cursor/rules/` automatically.
- **Multiple rules:** You can add multiple `.md` files to `.cursor/rules/` and they are all loaded.

---

### 6. GitHub Copilot

**Platforms:** macOS / Windows / Linux (via VS Code, JetBrains, Neovim, Xcode)
**Pricing:** Free tier (limited) / Individual $10/month / Business $19/month / Enterprise $39/month
**Website:** https://github.com/features/copilot

GitHub Copilot reads project-level instructions from `.github/copilot-instructions.md`.

#### macOS Setup -- VS Code

**Step 1: Install GitHub Copilot Extension**

1. Open VS Code.
2. Go to Extensions (Cmd+Shift+X).
3. Search for "GitHub Copilot".
4. Install both:
   - **GitHub Copilot** (inline completions)
   - **GitHub Copilot Chat** (chat interface)

Or via terminal:

```bash
code --install-extension GitHub.copilot
code --install-extension GitHub.copilot-chat
```

**Step 2: Authenticate**

1. After installing, VS Code prompts you to sign in to GitHub.
2. Click "Sign in to GitHub" and authorize in your browser.
3. Ensure you have an active Copilot subscription on your GitHub account.

**Step 3: Load the ios-agent-skill**

Open the `ios-agent-skill` folder in VS Code:

```bash
code /path/to/ios-agent-skill
```

Copilot automatically reads `.github/copilot-instructions.md` from the workspace root.

**Step 4: Verify the Skill is Loaded**

1. Open Copilot Chat (Cmd+Shift+I or click the chat icon).
2. Ask:
   ```
   What instructions are configured for this project?
   ```
3. Copilot should reference the iOS development guidelines from the skill.

**Step 5: Enable Custom Instructions (if not auto-detected)**

Ensure `github.copilot.chat.codeGeneration.useProjectInstructions` is `true` in VS Code Settings (enabled by default since Copilot 1.200+).

#### macOS Setup -- JetBrains IDEs

**Step 1: Install the Copilot Plugin**

1. Open your JetBrains IDE (IntelliJ IDEA, AppCode, etc.).
2. Go to **Preferences > Plugins > Marketplace**.
3. Search for "GitHub Copilot" and install.
4. Restart the IDE.

**Step 2: Authenticate**

1. Go to **Preferences > Languages & Frameworks > GitHub Copilot**.
2. Click "Sign in to GitHub" and authorize.

**Step 3: Load the ios-agent-skill**

Open the `ios-agent-skill` project. The `.github/copilot-instructions.md` file is read automatically.

#### macOS Setup -- Neovim

Install `zbirenbaum/copilot.lua` via your plugin manager (lazy.nvim, packer, etc.). Authenticate with `:Copilot auth`. Open Neovim from the `ios-agent-skill` directory and Copilot reads `.github/copilot-instructions.md` automatically.

#### Windows Setup -- VS Code

**Step 1: Install GitHub Copilot Extension**

```powershell
code --install-extension GitHub.copilot
code --install-extension GitHub.copilot-chat
```

Or install via the Extensions panel in VS Code.

**Step 2: Authenticate**

Same as macOS -- sign in to GitHub when prompted.

**Step 3: Load the ios-agent-skill**

```powershell
code C:\path\to\ios-agent-skill
```

**Step 4: Verify**

Open Copilot Chat (Ctrl+Shift+I) and ask about the project instructions.

#### Windows Setup -- JetBrains IDEs

Same process as macOS: install the GitHub Copilot plugin from the Marketplace, authenticate, and open the project.

#### Skill File: `.github/copilot-instructions.md`

- **Location:** `.github/copilot-instructions.md`
- **Auto-detected:** Yes, Copilot reads this file from the workspace root.
- **VS Code setting:** `github.copilot.chat.codeGeneration.useProjectInstructions` must be `true`.
- **Scope:** Instructions apply to both inline completions and chat responses.

> **Tip:** For Xcode, install the GitHub Copilot for Xcode extension from the Mac App Store. It reads the same `.github/copilot-instructions.md` file.

---

### 7. Windsurf (Codeium)

**Platforms:** macOS / Windows / Linux
**Pricing:** Free tier / Pro $15/month / Teams $35/month
**Website:** https://windsurf.com (formerly codeium.com)

Windsurf is Codeium's AI-native IDE (VS Code fork). It reads project rules from `.windsurfrules` (root) or `.windsurf/rules/` directory.

#### macOS Setup

**Step 1: Install Windsurf**

```bash
# Option A: Install via Homebrew
brew install --cask windsurf

# Option B: Download from website
# Visit https://windsurf.com and download the .dmg
```

**Step 2: Create an Account**

1. Open Windsurf.
2. Sign up or log in to your Codeium/Windsurf account.
3. The free tier includes generous completions and chat usage.

**Step 3: Load the ios-agent-skill**

```bash
# Open the project in Windsurf
windsurf /path/to/ios-agent-skill
```

Or from Windsurf: **File > Open Folder** and select `ios-agent-skill/`.

Windsurf automatically reads `.windsurf/rules/ios-skill.md`.

**Step 4: Verify the Skill is Loaded**

1. Open the Cascade panel (Windsurf's AI chat, Cmd+L).
2. Ask:
   ```
   What project rules are configured for this workspace?
   ```
3. Cascade should reference the iOS development patterns.

**Step 5: Check Rules in Settings**

1. Go to **Windsurf Settings > Rules**.
2. You should see `ios-skill.md` listed under project rules.

#### Windows Setup

**Step 1: Install Windsurf**

```powershell
# Option A: Install via winget (if available)
winget install Codeium.Windsurf

# Option B: Download from https://windsurf.com
# Run the .exe installer
```

**Step 2-4:** Same as macOS -- create account, open folder, verify.

#### Skill Files: `.windsurf/rules/ios-skill.md`

- **Primary location:** `.windsurf/rules/ios-skill.md`
- **Legacy location:** `.windsurfrules` (root file)
- **Auto-detected:** Yes
- **Multiple rules:** You can have multiple `.md` files in `.windsurf/rules/`.

---

### 8. JetBrains AI Assistant

**Platforms:** macOS / Windows / Linux (all JetBrains IDEs)
**Pricing:** Included with JetBrains All Products subscription / Standalone $10/month
**Website:** https://www.jetbrains.com/ai/

JetBrains AI Assistant is built into all JetBrains IDEs. It reads project rules from `.aiassistant/rules/`.

#### macOS Setup

**Step 1: Install or Enable AI Assistant**

1. Open your JetBrains IDE (IntelliJ IDEA, AppCode, WebStorm, etc.).
2. Go to **Preferences > Plugins**.
3. Search for "AI Assistant" in the Marketplace tab.
4. Install (or it may already be bundled -- check the "Installed" tab).
5. Restart the IDE.

**Step 2: Activate AI Assistant**

1. Go to **Preferences > Tools > AI Assistant**.
2. Sign in with your JetBrains account.
3. Ensure AI Assistant is enabled.

**Step 3: Load the ios-agent-skill**

1. Open the `ios-agent-skill` project in your JetBrains IDE.
2. The IDE automatically reads `.aiassistant/rules/ios-skill.md`.

**Step 4: Verify the Skill is Loaded**

1. Open the AI Assistant chat panel (usually in the right sidebar).
2. Ask:
   ```
   What project-specific rules are loaded?
   ```
3. AI Assistant should reference the iOS development guidelines.

**Step 5: Manual Rule Configuration (if auto-detect fails)**

1. Go to **Preferences > Tools > AI Assistant > Project Rules**.
2. Click "Add Rule" and point it to `.aiassistant/rules/ios-skill.md`.

#### Windows Setup

Same as macOS -- the JetBrains IDE experience is identical across platforms.

**Step 1:** Open your JetBrains IDE.
**Step 2:** Settings > Plugins > Install AI Assistant.
**Step 3:** Settings > Tools > AI Assistant > Sign in.
**Step 4:** Open the ios-agent-skill project.
**Step 5:** Verify via AI Assistant chat.

#### Skill File: `.aiassistant/rules/ios-skill.md`

- **Location:** `.aiassistant/rules/ios-skill.md`
- **Auto-detected:** Yes, in supported IDE versions (2024.2+).
- **Multiple rules:** You can add multiple files to `.aiassistant/rules/`.

---

### 9. JetBrains Junie

**Platforms:** macOS / Windows / Linux (JetBrains IDEs)
**Pricing:** Included with JetBrains AI Pro subscription
**Website:** https://www.jetbrains.com/junie/

Junie is JetBrains' agentic AI assistant that can autonomously perform multi-step coding tasks. It reads guidelines from `.junie/guidelines.md`.

#### macOS Setup

**Step 1: Enable Junie**

1. Open your JetBrains IDE (IntelliJ IDEA 2024.3+ or later).
2. Go to **Preferences > Plugins**.
3. Search for "Junie" and install if not already bundled.
4. Restart the IDE.

**Step 2: Activate**

1. Go to **Preferences > Tools > Junie**.
2. Sign in with your JetBrains account (requires AI Pro subscription).
3. Enable Junie.

**Step 3: Load the ios-agent-skill**

1. Open the `ios-agent-skill` project.
2. Junie automatically reads `.junie/guidelines.md`.

**Step 4: Verify the Skill is Loaded**

1. Open the Junie panel.
2. Start a new task and ask:
   ```
   What guidelines are defined for this project?
   ```
3. Junie should reference the iOS development patterns.

#### Windows Setup

Identical to macOS. JetBrains IDEs behave the same on both platforms.

#### Skill File: `.junie/guidelines.md`

- **Location:** `.junie/guidelines.md`
- **Auto-detected:** Yes
- **Purpose:** Junie reads this before starting any autonomous task to understand project conventions.

---

### 10. Zed AI

**Platforms:** macOS / Linux (no Windows support yet)
**Pricing:** Free (editor) / AI features require API key or Zed Pro
**Website:** https://zed.dev

Zed is a high-performance code editor with built-in AI features. It has a unique rule file resolution order.

#### macOS Setup

**Step 1: Install Zed**

```bash
# Install via Homebrew
brew install --cask zed
```

Or download from https://zed.dev.

**Step 2: Configure AI Provider**

1. Open Zed Settings (Cmd+,).
2. Add your AI provider in the `language_models` block of `settings.json` (supports `anthropic`, `openai`, `google`).
3. Set your `default_model` in the `assistant` section.

**Step 3: Load the ios-agent-skill**

Zed has a specific rule file resolution order. It reads the **first file found** in this priority:

1. `.rules` (highest priority)
2. `.cursorrules`
3. `.windsurfrules`
4. `AGENTS.md`
5. `CLAUDE.md`

Since `ios-agent-skill` does not ship with a `.rules` file by default, Zed will fall back to `AGENTS.md` or `CLAUDE.md` (whichever it finds first based on its resolution order).

**To ensure Zed uses the optimal skill file, create a `.rules` file:**

```bash
cd /path/to/ios-agent-skill

# Option A: Copy the main skill content
cp CLAUDE.md .rules

# Option B: Create a pointer file
echo "See CLAUDE.md and SKILL.md for full project instructions." > .rules
```

**Step 4: Open the Project**

```bash
# Open in Zed
zed /path/to/ios-agent-skill
```

**Step 5: Verify the Skill is Loaded**

1. Open the AI Assistant panel (Cmd+Shift+A or the sidebar icon).
2. Ask:
   ```
   What project rules are loaded for this workspace?
   ```
3. Zed should reference the iOS skill content.

#### Windows Setup

Zed does not currently support Windows. The Zed team has stated Windows support is on their roadmap. Check https://zed.dev for updates.

**Workaround for Windows users:**
- Use WSL (Windows Subsystem for Linux) and install the Linux version of Zed.
- Or use another AI-enabled editor (Cursor, Windsurf, VS Code with Copilot).

#### Skill File: `.rules` (preferred)

- **Primary:** `.rules` (highest priority in Zed)
- **Fallbacks:** `.cursorrules`, `.windsurfrules`, `AGENTS.md`, `CLAUDE.md`
- **Auto-detected:** Yes, Zed reads the first matching file.
- **Note:** The `ios-agent-skill` repo includes `.cursorrules` content in `.cursor/rules/`, but Zed reads from the root. Create a root-level `.rules` file for best results.

---

### 11. Trae (ByteDance)

**Platforms:** macOS / Windows
**Pricing:** Free (during beta)
**Website:** https://trae.ai

Trae is ByteDance's AI-native IDE. It reads project rules from `.trae/rules/`.

#### macOS Setup

**Step 1: Install Trae**

```bash
# Download from the website
# Visit https://trae.ai and download the macOS .dmg

# Or if available via Homebrew:
brew install --cask trae
```

**Step 2: Create an Account**

1. Open Trae.
2. Sign up or log in.
3. Trae provides its own AI models (no API key needed during beta).

**Step 3: Load the ios-agent-skill**

1. **File > Open Folder** and select `ios-agent-skill/`.
2. Trae automatically reads `.trae/rules/ios-skill.md`.

**Step 4: Verify the Skill is Loaded**

1. Open the AI chat panel.
2. Ask:
   ```
   What project rules are loaded?
   ```
3. Trae should reference the iOS development guidelines from the skill.

**Step 5: Manual Rule Import (if needed)**

1. Go to **Settings > Rules**.
2. Click "Import" and select `.trae/rules/ios-skill.md`.

#### Windows Setup

**Step 1: Install Trae**

```powershell
# Download from https://trae.ai
# Run the .exe installer
```

**Step 2-4:** Same as macOS.

#### Skill File: `.trae/rules/ios-skill.md`

- **Location:** `.trae/rules/ios-skill.md`
- **Auto-detected:** Yes
- **Settings path:** Also configurable in Settings > Rules.

---

### 12. Amazon Q Developer

**Platforms:** macOS / Windows / Linux (VS Code, JetBrains)
**Pricing:** Free tier / Pro $19/month per user
**Website:** https://aws.amazon.com/q/developer/

Amazon Q Developer (formerly CodeWhisperer) is AWS's AI assistant. It reads project rules from `.amazonq/rules/`.

#### macOS Setup -- VS Code

**Step 1: Install the Extension**

```bash
code --install-extension amazonwebservices.amazon-q-vscode
```

Or search "Amazon Q" in the VS Code Extensions panel.

**Step 2: Authenticate with AWS**

1. Click the Amazon Q icon in the VS Code sidebar.
2. Choose your authentication method:
   - **AWS Builder ID** (free tier, no AWS account needed)
   - **AWS IAM Identity Center** (for organizations)
   - **AWS IAM credentials** (for individual AWS accounts)

For AWS Builder ID:
1. Click "Use for Free with Builder ID".
2. Follow the browser-based sign-up/sign-in flow.

For IAM credentials:
```bash
# Configure AWS credentials
aws configure
# Enter your Access Key ID, Secret Access Key, and region
```

**Step 3: Load the ios-agent-skill**

```bash
code /path/to/ios-agent-skill
```

Amazon Q automatically reads `.amazonq/rules/ios-skill.md`.

**Step 4: Verify the Skill is Loaded**

1. Open the Amazon Q chat panel.
2. Ask:
   ```
   What project rules are defined in .amazonq for this workspace?
   ```

#### macOS Setup -- JetBrains

**Step 1: Install the Plugin**

1. Open your JetBrains IDE.
2. **Preferences > Plugins > Marketplace**.
3. Search for "Amazon Q" and install.
4. Restart the IDE.

**Step 2:** Authenticate the same way as VS Code (Builder ID or IAM).

**Step 3:** Open the ios-agent-skill project. Rules are read automatically.

#### Windows Setup -- VS Code

**Step 1: Install the Extension**

```powershell
code --install-extension amazonwebservices.amazon-q-vscode
```

**Step 2: Authenticate**

Same as macOS -- use AWS Builder ID or IAM credentials.

For AWS CLI configuration on Windows:

```powershell
# Install AWS CLI
winget install Amazon.AWSCLI

# Configure credentials
aws configure
```

**Step 3-4:** Same as macOS.

#### Windows Setup -- JetBrains

Same as macOS JetBrains setup.

#### Skill File: `.amazonq/rules/ios-skill.md`

- **Location:** `.amazonq/rules/ios-skill.md`
- **Auto-detected:** Yes, in Amazon Q extensions version 1.30+.
- **AWS-specific:** Amazon Q also reads context from `buildspec.yml`, `template.yaml`, and AWS-specific project files.

---

### 13. Cline

**Platforms:** macOS / Windows / Linux (VS Code extension)
**Pricing:** Free (bring your own API key)
**Website:** https://github.com/cline/cline

Cline is an autonomous AI coding agent that runs as a VS Code extension. It reads `.clinerules` from the project root.

#### macOS Setup

**Step 1: Install the Extension**

```bash
code --install-extension saoudrizwan.claude-dev
```

Or search "Cline" in the VS Code Extensions panel.

**Step 2: Configure API Key**

1. Open VS Code and click the Cline icon in the sidebar.
2. Click the settings gear in the Cline panel.
3. Choose your AI provider:
   - **Anthropic (Claude):** Enter your Anthropic API key.
   - **OpenAI:** Enter your OpenAI API key.
   - **Google (Gemini):** Enter your Google AI API key.
   - **AWS Bedrock:** Configure AWS credentials.
   - **OpenRouter:** Enter your OpenRouter API key.
   - **Local (Ollama):** Configure local model endpoint.

**Step 3: Load the ios-agent-skill**

```bash
code /path/to/ios-agent-skill
```

Cline automatically reads `.clinerules` from the project root.

If no `.clinerules` exists, create one that references `SKILL.md` and `CLAUDE.md` for the full project guidelines.

**Step 4: Verify the Skill is Loaded**

1. Open the Cline panel in VS Code.
2. Type:
   ```
   What conventions does .clinerules define for this project?
   ```
3. Cline should reference the iOS skill content.

#### Windows Setup

**Step 1: Install the Extension**

```powershell
code --install-extension saoudrizwan.claude-dev
```

**Step 2-4:** Same as macOS.

#### Skill File: `.clinerules`

- **Location:** `.clinerules` (project root)
- **Auto-detected:** Yes
- **Format:** Plain text or Markdown
- **Note:** Cline also has a "Custom Instructions" field in its settings for global instructions.

---

### 14. Roo Code

**Platforms:** macOS / Windows / Linux (VS Code extension)
**Pricing:** Free (bring your own API key)
**Website:** https://github.com/RooVetGit/Roo-Code

Roo Code is a fork of Cline with enhanced features. It reads rules from `.roo/rules/` or `.roorules`.

#### macOS Setup

**Step 1: Install the Extension**

```bash
code --install-extension RooVetGit.roo-cline
```

Or search "Roo Code" in the VS Code Extensions panel.

**Step 2: Configure API Key**

Same process as Cline -- click the Roo Code icon and configure your preferred AI provider (Anthropic, OpenAI, Google, etc.).

**Step 3: Load the ios-agent-skill**

```bash
code /path/to/ios-agent-skill
```

Roo Code automatically reads `.roo/rules/ios-skill.md`.

**Step 4: Verify the Skill is Loaded**

1. Open the Roo Code panel.
2. Ask:
   ```
   What project rules are loaded from .roo/rules/?
   ```

#### Windows Setup

```powershell
code --install-extension RooVetGit.roo-cline
```

Then follow the same steps as macOS.

#### Skill Files: `.roo/rules/ios-skill.md`, `.roorules`

- **Primary:** `.roo/rules/ios-skill.md`
- **Alternative:** `.roorules` (root file)
- **Auto-detected:** Yes
- **Multiple modes:** Roo Code supports different "modes" (Code, Architect, Debug) and rules can be mode-specific.

---

### 15. KiloCode

**Platforms:** macOS / Windows / Linux (VS Code extension)
**Pricing:** Free (bring your own API key)
**Website:** https://kilocode.dev

KiloCode is another AI coding assistant VS Code extension. It reads rules from `.kilocode/rules/`.

#### macOS Setup

**Step 1: Install the Extension**

```bash
code --install-extension AlanJiang.kilocode
```

Or search "KiloCode" in the VS Code Extensions panel.

**Step 2: Configure API Key**

1. Open the KiloCode panel in VS Code.
2. Configure your AI provider (Anthropic, OpenAI, etc.).

**Step 3: Load the ios-agent-skill**

```bash
code /path/to/ios-agent-skill
```

KiloCode automatically reads `.kilocode/rules/ios-skill.md`.

**Step 4: Verify the Skill is Loaded**

Ask KiloCode about the project rules in its chat panel.

#### Windows Setup

```powershell
code --install-extension AlanJiang.kilocode
```

Same process as macOS.

#### Skill File: `.kilocode/rules/ios-skill.md`

- **Location:** `.kilocode/rules/ios-skill.md`
- **Auto-detected:** Yes

---

### 16. Continue.dev

**Platforms:** macOS / Windows / Linux (VS Code extension, JetBrains plugin)
**Pricing:** Free and open source (bring your own API key or use local models)
**Website:** https://continue.dev

Continue.dev is an open-source AI coding assistant. It reads rules from `.continue/rules/` or `.continuerules`.

#### macOS Setup -- VS Code

**Step 1: Install the Extension**

```bash
code --install-extension Continue.continue
```

**Step 2: Configure Your Model**

Continue supports many providers. Edit `~/.continue/config.yaml` or use the GUI (click gear icon in the Continue sidebar panel). Add your model provider (Anthropic, OpenAI, Ollama, etc.) with the appropriate API key.

**Step 3: Load the ios-agent-skill**

```bash
code /path/to/ios-agent-skill
```

Continue reads `.continue/rules/ios-skill.md` automatically.

**Step 4: Verify the Skill is Loaded**

1. Open the Continue chat panel.
2. Ask:
   ```
   What project rules are defined in .continue/rules/?
   ```

#### macOS Setup -- JetBrains

**Step 1: Install the Plugin**

1. Open your JetBrains IDE.
2. **Preferences > Plugins > Marketplace**.
3. Search for "Continue" and install.
4. Restart the IDE.

**Step 2:** Configure your model in `~/.continue/config.yaml`.

**Step 3:** Open the ios-agent-skill project. Rules are read automatically.

#### Windows Setup

**VS Code:**

```powershell
code --install-extension Continue.continue
```

**Configuration file location on Windows:** `%USERPROFILE%\.continue\config.yaml`

Same setup process as macOS.

**JetBrains:** Same plugin installation process.

#### Skill Files: `.continue/rules/ios-skill.md`, `.continuerules`

- **Primary:** `.continue/rules/ios-skill.md`
- **Alternative:** `.continuerules` (root)
- **Auto-detected:** Yes
- **Config file:** `~/.continue/config.yaml` for global model configuration.

---

### 17. Augment Code

**Platforms:** macOS / Windows / Linux (VS Code extension)
**Pricing:** Free tier / Pro plan available
**Website:** https://augmentcode.com

Augment Code is an AI coding assistant with deep codebase understanding. It reads rules from `.augment/rules/`.

#### macOS Setup

**Step 1: Install the Extension**

```bash
code --install-extension AugmentCode.augment
```

Or search "Augment" in the VS Code Extensions panel.

**Step 2: Create an Account**

1. Click the Augment icon in the VS Code sidebar.
2. Sign up or log in to your Augment account.

**Step 3: Load the ios-agent-skill**

```bash
code /path/to/ios-agent-skill
```

Augment reads `.augment/rules/ios-skill.md` automatically.

**Step 4: Verify the Skill is Loaded**

1. Open the Augment chat panel.
2. Ask about the project rules.

#### Windows Setup

```powershell
code --install-extension AugmentCode.augment
```

Same process as macOS.

#### Skill File: `.augment/rules/ios-skill.md`

- **Location:** `.augment/rules/ios-skill.md`
- **Auto-detected:** Yes
- **Codebase indexing:** Augment indexes your entire codebase for deep context understanding.

---

### 18. Tabnine

**Platforms:** macOS / Windows / Linux (VS Code, JetBrains, Neovim, and more)
**Pricing:** Free tier (basic completions) / Pro $12/month / Enterprise (self-hosted)
**Website:** https://tabnine.com

Tabnine provides AI code completions and chat. It reads guidelines from `.tabnine/guidelines/`.

#### macOS Setup -- VS Code

**Step 1: Install the Extension**

```bash
code --install-extension TabNine.tabnine-vscode
```

**Step 2: Create an Account**

1. Click the Tabnine icon in VS Code.
2. Sign up or log in.
3. Choose your plan (free or Pro).

**Step 3: Load the ios-agent-skill**

```bash
code /path/to/ios-agent-skill
```

Tabnine reads `.tabnine/guidelines/ios-skill.md` automatically (Pro feature).

**Step 4: Verify the Skill is Loaded**

1. Open Tabnine Chat.
2. Ask:
   ```
   What guidelines are configured for this project?
   ```

#### macOS Setup -- JetBrains

1. Open your JetBrains IDE.
2. **Preferences > Plugins > Marketplace** > search "Tabnine".
3. Install and restart.
4. Sign in via the Tabnine panel.

#### macOS/Windows Setup -- Neovim

Install `codota/tabnine-nvim` via your plugin manager and run the `dl_binaries.sh` build step.

#### Windows Setup

**VS Code:**

```powershell
code --install-extension TabNine.tabnine-vscode
```

**JetBrains:** Same plugin installation as macOS.

Same account setup and configuration process.

#### Skill File: `.tabnine/guidelines/ios-skill.md`

- **Location:** `.tabnine/guidelines/ios-skill.md`
- **Auto-detected:** Yes (Pro feature)
- **Note:** Guidelines are a Pro/Enterprise feature. Free tier relies on code context only.

---

### 19. Aider

**Platforms:** macOS / Windows / Linux (terminal)
**Pricing:** Free and open source (bring your own API key)
**Website:** https://aider.chat

Aider is a terminal-based AI pair programming tool. It loads convention files via the `--read` flag or auto-reads `CONVENTIONS.md`.

#### macOS Setup

**Step 1: Install Aider**

```bash
# Option A: Install via Homebrew
brew install aider

# Option B: Install via pip
pip install aider-chat

# Option C: Install via pipx (recommended for isolation)
pipx install aider-chat
```

**Step 2: Set Your API Key**

```bash
# For Claude (recommended)
export ANTHROPIC_API_KEY="sk-ant-your-key-here"

# For GPT-4
export OPENAI_API_KEY="sk-your-key-here"

# For Gemini
export GOOGLE_API_KEY="AIzaSy-your-key-here"

# Make permanent (add to ~/.zshrc)
echo 'export ANTHROPIC_API_KEY="sk-ant-your-key-here"' >> ~/.zshrc
source ~/.zshrc
```

**Step 3: Configure Aider (Optional)**

Create `.aider.conf.yml` at the project root or `~/.aider.conf.yml` globally. Set your preferred model, disable auto-commits if desired, and add `CONVENTIONS.md` and `SKILL.md` to the `read` list.

**Step 4: Load the ios-agent-skill**

```bash
cd /path/to/ios-agent-skill

# Option A: Aider auto-reads CONVENTIONS.md if present
aider

# Option B: Explicitly load the skill file
aider --read CONVENTIONS.md

# Option C: Load multiple skill files
aider --read CONVENTIONS.md --read SKILL.md --read CLAUDE.md
```

**Step 5: Verify the Skill is Loaded**

Once in the Aider session:

```
> /tokens
```

This shows loaded context files. You should see `CONVENTIONS.md` listed.

Then ask:

```
> What conventions does this project follow?
```

Aider should describe the iOS development patterns from CONVENTIONS.md.

#### Windows Setup

**Step 1: Install Aider**

```powershell
# Install via pip
pip install aider-chat

# Or via pipx
pipx install aider-chat
```

**Step 2: Set API Key**

```powershell
# Current session
$env:ANTHROPIC_API_KEY = "sk-ant-your-key-here"

# Permanent
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "sk-ant-your-key-here", "User")
```

**Step 3: Configure**

Create `.aider.conf.yml` in the project root (same content as macOS).

**Step 4: Launch**

```powershell
cd C:\path\to\ios-agent-skill
aider --read CONVENTIONS.md
```

**Step 5: Verify**

Same as macOS -- use `/tokens` and ask about conventions.

#### Skill File: `CONVENTIONS.md`

- **Location:** `CONVENTIONS.md` (project root)
- **Auto-detected:** Yes, Aider reads `CONVENTIONS.md` automatically.
- **Manual loading:** Use `--read CONVENTIONS.md` flag.
- **Config file:** `.aider.conf.yml` for persistent configuration.

#### Aider-Specific Commands

- `/add <file>` -- add a file to the editing session
- `/read <file>` -- add a read-only context file
- `/tokens` -- show token usage and loaded files
- `/model <name>` -- switch models mid-session

---

### 20. Sourcegraph Amp (formerly Cody)

**Platforms:** macOS / Windows / Linux (VS Code extension, web app)
**Pricing:** Free tier / Pro $9/month / Enterprise
**Website:** https://sourcegraph.com/amp

Amp (formerly Sourcegraph Cody) is an AI coding assistant with deep code search integration. It reads `AGENTS.md` from the project root.

#### macOS Setup -- VS Code

**Step 1: Install the Extension**

```bash
code --install-extension sourcegraph.cody-ai
```

**Step 2: Authenticate**

1. Click the Amp/Cody icon in the VS Code sidebar.
2. Sign in with your Sourcegraph account (or create one).
3. Connect to a Sourcegraph instance (sourcegraph.com for cloud).

**Step 3: Load the ios-agent-skill**

```bash
code /path/to/ios-agent-skill
```

Amp reads `AGENTS.md` from the project root automatically.

**Step 4: Verify the Skill is Loaded**

1. Open the Amp chat panel.
2. Ask:
   ```
   What conventions does AGENTS.md define for this project?
   ```

#### macOS Setup -- Web App

1. Go to https://sourcegraph.com/amp.
2. Sign in to your account.
3. Connect your repository (GitHub, GitLab, etc.).
4. Amp reads `AGENTS.md` from the connected repository.

#### Windows Setup

**VS Code:**

```powershell
code --install-extension sourcegraph.cody-ai
```

Same authentication and setup as macOS.

#### Skill File: `AGENTS.md`

- **Location:** `AGENTS.md` (project root)
- **Auto-detected:** Yes
- **Code search:** Amp leverages Sourcegraph's code search to provide context beyond the skill file.

---

## Tier 2: Cloud/Browser-Based

---

### 21. Replit Agent

**Platforms:** Web (browser-based)
**Pricing:** Free tier / Replit Core $20/month / Teams plans
**Website:** https://replit.com

Replit Agent is an AI coding assistant built into Replit's online IDE. It reads `replit.md` from the project root.

#### Setup (Web-Based -- All Platforms)

**Step 1: Create a Replit Account**

1. Go to https://replit.com.
2. Sign up or log in.

**Step 2: Import the Repository**

1. Click "Create Repl" (or the + button).
2. Select "Import from GitHub".
3. Paste the ios-agent-skill repository URL.
4. Click "Import from GitHub".

**Step 3: Verify replit.md is Loaded**

The ios-agent-skill repository includes a `replit.md` file. Replit Agent reads this automatically.

1. In the Replit workspace, open the file browser.
2. Verify `replit.md` exists at the root.
3. Open the AI chat panel.
4. Ask:
   ```
   What does replit.md say about this project?
   ```

**Step 4: Interact with the Agent**

1. Click "Agent" in the sidebar (or use the AI chat).
2. Start a conversation about iOS development.
3. The agent follows the conventions defined in `replit.md`.

#### Adding replit.md to an Existing Repl

If you have an existing Repl and want to add the iOS skill:

1. Open the Shell tab in your Repl.
2. Run:
   ```bash
   # Download the replit.md from the ios-agent-skill repository
   curl -o replit.md https://raw.githubusercontent.com/anthropics/ios-agent-skill/main/replit.md
   ```
3. Refresh the workspace. Replit Agent picks up the file automatically.

#### Skill File: `replit.md`

- **Location:** `replit.md` (project root)
- **Auto-detected:** Yes, Replit reads this file automatically.
- **Format:** Markdown with project description, setup instructions, and conventions.

---

### 22. Lovable

**Platforms:** Web (browser-based)
**Pricing:** Free tier / Starter $20/month / Growth $50/month
**Website:** https://lovable.dev

Lovable is an AI full-stack app builder that reads `AGENTS.md` and supports a Knowledge Base for project context.

#### Setup (Web-Based -- All Platforms)

**Step 1: Create an Account**

1. Go to https://lovable.dev.
2. Sign up or log in.

**Step 2: Connect Your GitHub Repository**

1. In your Lovable project, go to **Settings > GitHub**.
2. Connect your GitHub account.
3. Link the ios-agent-skill repository.

**Step 3: Load the Skill via AGENTS.md**

Lovable reads `AGENTS.md` from connected repositories automatically.

Verify by asking in the chat:
```
What project conventions are defined in AGENTS.md?
```

**Step 4: Add to Knowledge Base (Alternative)**

1. In your Lovable project, go to **Settings > Knowledge Base**.
2. Click "Add Knowledge".
3. Paste the content of `SKILL.md` or `AGENTS.md` directly into the Knowledge Base.
4. Save.

This ensures the skill context is always available, even without GitHub integration.

#### Skill Files: `AGENTS.md`

- **Location:** `AGENTS.md` (project root, read from GitHub)
- **Alternative:** Knowledge Base UI (paste content manually)
- **Auto-detected:** Yes, when GitHub repo is connected.

---

### 23. Bolt.new (StackBlitz)

**Platforms:** Web (browser-based)
**Pricing:** Free tier / Pro $20/month / Teams $30/month
**Website:** https://bolt.new

Bolt.new is StackBlitz's AI-powered web development environment. It reads `CLAUDE.md` for project context.

#### Setup (Web-Based -- All Platforms)

**Step 1: Access Bolt.new**

1. Go to https://bolt.new.
2. Sign in with your StackBlitz account (or create one).

**Step 2: Import the Repository**

1. In the Bolt.new interface, use the import option.
2. Connect to GitHub and select the ios-agent-skill repository.
3. Bolt.new reads `CLAUDE.md` from the project root.

**Step 3: Set Project Context Manually (Alternative)**

If importing is not available:

1. Start a new Bolt.new project.
2. In the chat, paste the content of `CLAUDE.md` or `SKILL.md`:
   ```
   Here are the project conventions to follow:

   [paste content of SKILL.md]
   ```
3. Bolt.new will reference this context for all subsequent interactions.

**Step 4: Verify**

Ask:
```
What iOS development patterns should we follow in this project?
```

#### Skill File: `CLAUDE.md`

- **Location:** `CLAUDE.md` (read from imported project)
- **Alternative:** Paste content directly into chat.
- **Note:** Bolt.new is primarily designed for web development, so the iOS skill is most useful for documentation and planning tasks.

---

### 24. v0 (Vercel)

**Platforms:** Web (browser-based)
**Pricing:** Free tier / Premium $20/month
**Website:** https://v0.dev

v0 is Vercel's AI interface builder. It does not read project files automatically -- you must paste instructions into the UI.

#### Setup (Web-Based -- All Platforms)

**Step 1: Access v0**

1. Go to https://v0.dev.
2. Sign in with your Vercel account (or create one).

**Step 2: Load the Skill as Instructions**

v0 does not have a file-based skill system. To use the ios-agent-skill context:

1. Open a new v0 chat.
2. At the beginning of your conversation, paste the relevant skill content:

```
I'm working on an iOS project with these conventions:

[Paste the content of SKILL.md or the relevant sections]

Please follow these patterns for all code you generate.
```

**Step 3: Use System Instructions (if available)**

If v0 supports custom system instructions in your plan:

1. Go to **Settings > Instructions**.
2. Paste a condensed version of the skill.
3. Save. These instructions apply to all future conversations.

**Step 4: Verify**

Ask v0 to generate some Swift code and check if it follows the conventions you pasted.

#### Skill File: None (UI-based only)

- **No auto-detect:** v0 does not read repo files.
- **Method:** Paste skill content into chat or system instructions.
- **Best practice:** Keep a condensed version of the skill (under 2000 tokens) for pasting into v0.

---

### 25. Devin (Cognition)

**Platforms:** Web (browser-based)
**Pricing:** Enterprise pricing / Team $500/month
**Website:** https://devin.ai

Devin is Cognition's autonomous AI software engineer. It has a Knowledge system for project context, but does not auto-detect repo-level files.

#### Setup (Web-Based -- All Platforms)

**Step 1: Access Devin**

1. Go to https://devin.ai.
2. Sign in with your team account.

**Step 2: Connect Your Repository**

1. In Devin's settings, connect your GitHub/GitLab account.
2. Grant access to the ios-agent-skill repository.

**Step 3: Add Knowledge Manually**

Devin does not auto-read skill files from the repo. You must add knowledge explicitly:

1. Go to **Settings > Knowledge**.
2. Click "Add Knowledge Item".
3. Title: "iOS Agent Skill - Development Conventions"
4. Content: Paste the full content of `SKILL.md` or `AGENTS.md`.
5. Save.

**Step 4: Reference Knowledge in Tasks**

When creating a Devin task:

```
Follow the iOS Agent Skill conventions from the Knowledge Base.
Build a new feature that uses SwiftUI with MVVM pattern as documented.
```

**Step 5: Verify**

Ask Devin:
```
What iOS development conventions are in the Knowledge Base?
```

#### Skill File: None (Knowledge Base only)

- **No auto-detect:** Devin does not read repo-level skill files automatically.
- **Method:** Add to Knowledge Base manually.
- **Tip:** Keep the Knowledge Base content updated when the skill changes (run `git pull` and re-paste).

---

## Tier 3: Open Source / Emerging

---

### 26. OpenCode

**Platforms:** macOS / Linux (terminal)
**Pricing:** Free and open source (bring your own API key)
**Website:** https://github.com/opencode-ai/opencode

OpenCode is an open-source terminal-based AI coding assistant. It reads `AGENTS.md` from the project root.

#### macOS Setup

**Step 1: Install OpenCode**

```bash
# Install via Homebrew
brew install opencode

# Or install from source
go install github.com/opencode-ai/opencode@latest
```

**Step 2: Configure API Key**

```bash
# Set your preferred provider
export ANTHROPIC_API_KEY="sk-ant-your-key-here"
# or
export OPENAI_API_KEY="sk-your-key-here"
```

**Step 3: Load the ios-agent-skill**

```bash
cd /path/to/ios-agent-skill

# Launch OpenCode - it reads AGENTS.md automatically
opencode
```

**Step 4: Verify**

```
> What conventions does this project follow?
```

#### Windows Setup

OpenCode is primarily a macOS/Linux tool. On Windows, use WSL:

```bash
# Inside WSL
brew install opencode
# or
go install github.com/opencode-ai/opencode@latest
```

#### Skill File: `AGENTS.md`

- **Location:** `AGENTS.md` (project root)
- **Auto-detected:** Yes

---

### 27. OpenHands

**Platforms:** macOS / Windows / Linux (Docker-based)
**Pricing:** Free and open source
**Website:** https://github.com/All-Hands-AI/OpenHands

OpenHands (formerly OpenDevin) is an open-source autonomous AI software engineer. It runs in Docker and reads `AGENTS.md`.

#### macOS Setup

**Step 1: Install Docker**

```bash
# Install Docker Desktop
brew install --cask docker

# Start Docker Desktop and wait for it to initialize
open -a Docker
```

**Step 2: Run OpenHands**

```bash
# Pull and run OpenHands
docker pull ghcr.io/all-hands-ai/openhands:latest

# Run with your project mounted
docker run -it --rm \
  -v /path/to/ios-agent-skill:/workspace \
  -e ANTHROPIC_API_KEY="sk-ant-your-key-here" \
  -p 3000:3000 \
  ghcr.io/all-hands-ai/openhands:latest
```

**Step 3: Access the UI**

Open http://localhost:3000 in your browser.

**Step 4: Load the ios-agent-skill**

OpenHands reads `AGENTS.md` from the mounted workspace (`/workspace/AGENTS.md`).

**Step 5: Verify**

In the OpenHands chat:
```
What conventions does AGENTS.md define for this project?
```

#### Windows Setup

**Step 1: Install Docker Desktop**

```powershell
winget install Docker.DockerDesktop
```

**Step 2: Run OpenHands**

```powershell
docker pull ghcr.io/all-hands-ai/openhands:latest

docker run -it --rm `
  -v C:\path\to\ios-agent-skill:/workspace `
  -e ANTHROPIC_API_KEY="sk-ant-your-key-here" `
  -p 3000:3000 `
  ghcr.io/all-hands-ai/openhands:latest
```

**Step 3-5:** Same as macOS.

#### Skill File: `AGENTS.md`

- **Location:** `AGENTS.md` (project root, mounted as /workspace)
- **Auto-detected:** Yes
- **Docker note:** Ensure the volume mount path is correct.

---

### 28. PearAI

**Platforms:** macOS / Windows / Linux
**Pricing:** Free and open source
**Website:** https://trypear.ai

PearAI is a fork of Continue.dev with additional features. It follows the same configuration pattern.

#### macOS Setup

**Step 1: Install PearAI**

```bash
# Download from https://trypear.ai
# Or install via Homebrew if available:
brew install --cask pearai
```

**Step 2: Configure**

PearAI uses the same configuration system as Continue.dev:

1. Open PearAI.
2. Configure your AI provider in settings.
3. Edit `~/.continue/config.yaml` (PearAI shares Continue's config).

**Step 3: Load the ios-agent-skill**

Open the ios-agent-skill folder in PearAI. It reads `.continue/rules/ios-skill.md` (same as Continue.dev).

**Step 4: Verify**

Ask in the chat panel about the project rules.

#### Windows Setup

Download from https://trypear.ai and follow the installer. Configuration is the same as macOS.

#### Skill File: `.continue/rules/ios-skill.md`

- **Location:** `.continue/rules/ios-skill.md` (same as Continue.dev)
- **Auto-detected:** Yes
- **Note:** PearAI shares Continue.dev's rule system since it is a fork.

---

## General Tips

### How to Verify the Skill is Loaded

For any AI coding assistant, use this universal test prompt:

```
What iOS development patterns and frameworks does this project's skill/rules define?
Specifically mention: architecture patterns, Swift concurrency approach, and UI framework preferences.
```

A correctly loaded skill should mention:
- MVVM, Clean Architecture, or Coordinator patterns
- Swift concurrency with async/await
- SwiftUI and/or UIKit preferences
- Specific frameworks like Core Data, SwiftData, CloudKit, etc.

If the AI gives generic answers without referencing the skill content, the skill file is not being read.

### Troubleshooting Common Issues

#### Skill File Not Detected

1. **Check the file exists** at the expected path:
   ```bash
   # macOS/Linux
   ls -la CLAUDE.md AGENTS.md .cursor/rules/ .windsurf/rules/

   # Windows
   dir CLAUDE.md AGENTS.md .cursor\rules\ .windsurf\rules\
   ```

2. **Check you opened the right directory.** The AI tool must be launched from (or have opened) the `ios-agent-skill` root directory, not a subdirectory.

3. **Check file permissions:**
   ```bash
   # macOS/Linux
   chmod 644 CLAUDE.md AGENTS.md GEMINI.md CONVENTIONS.md

   # Windows (PowerShell)
   icacls CLAUDE.md
   ```

4. **Restart the tool.** Some tools only read skill files on startup or when the workspace is first opened.

#### API Key Issues

- **"Unauthorized" or "Invalid API key":** Double-check your key. Ensure there are no leading/trailing spaces.
- **Key not persisting:** Ensure you added it to the correct shell profile (`~/.zshrc` for macOS, environment variables for Windows).
- **Rate limiting:** If you hit rate limits, wait a few minutes or upgrade your plan.

```bash
# macOS: Verify your API key is set
echo $ANTHROPIC_API_KEY
echo $OPENAI_API_KEY
echo $GOOGLE_API_KEY
```

```powershell
# Windows: Verify your API key is set
echo $env:ANTHROPIC_API_KEY
echo $env:OPENAI_API_KEY
echo $env:GOOGLE_API_KEY
```

#### Tool-Specific Issues

| Problem | Tool | Solution |
|---------|------|----------|
| `.cursorrules` not read | Cursor | Migrate to `.cursor/rules/` directory format |
| `CLAUDE.md` not found | Claude Code | Ensure you run `claude` from the project root |
| `AGENTS.md` ignored | Codex CLI | Update to latest version: `npm update -g @openai/codex` |
| Rules not in JetBrains | AI Assistant | Update IDE to 2024.2+ and re-enable AI Assistant |
| Aider ignores conventions | Aider | Use `--read CONVENTIONS.md` flag explicitly |
| Docker mount fails | OpenHands | Use absolute paths and check Docker Desktop is running |

### How to Keep the Skill Updated

Run `git pull origin main` in the ios-agent-skill directory regularly. Consider creating a shell alias (`skill-update`) for convenience.

### How to Use in a Team

#### Option A: Commit Skill Files to Your Project

Copy the relevant skill files (`CLAUDE.md`, `AGENTS.md`, `.cursor/`, `.windsurf/`, `.github/copilot-instructions.md`, etc.) into your project repo. Every team member gets them automatically, but you must manually update when the skill changes.

#### Option B: Git Submodule

```bash
git submodule add https://github.com/anthropics/ios-agent-skill.git .ios-skill
```

Team members clone with `--recurse-submodules`. Update with `git submodule update --remote`.

#### Option C: Symlinks (Local Only)

Create symlinks from your project to the skill files. Note: symlinks are not portable across machines and may not work with all AI tools.

#### What to .gitignore

If you do not want skill files in version control, add `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `CONVENTIONS.md`, `.cursor/rules/`, `.windsurf/rules/`, `.junie/`, `.aiassistant/`, `.trae/`, `.amazonq/`, `.continue/rules/`, `.roo/rules/`, `.kilocode/rules/`, `.augment/rules/`, `.tabnine/guidelines/`, `.clinerules`, `.roorules`, `.rules`, and `replit.md` to your `.gitignore`.

### Performance Tips for Large Skill Files

1. **Keep skill files under 50KB** to avoid context window truncation.
2. **Put the most important conventions at the top** of each file.
3. **Use directory-based rules** (e.g., `.cursor/rules/`) to split into focused files.
4. **Reference docs instead of duplicating** -- write "See docs/swiftui/views-and-controls.md" rather than copying content.
5. **Check file sizes** with `wc -c CLAUDE.md AGENTS.md` if your tool feels slow.

### Cross-Tool Compatibility

The ios-agent-skill includes files for many tools, but some tools read each other's files as fallbacks. Here is the fallback chain:

| Tool | Primary File | Fallback Files |
|------|-------------|----------------|
| Claude Code | `CLAUDE.md` | -- |
| Codex CLI | `AGENTS.md` | -- |
| Gemini CLI | `GEMINI.md` | `AGENTS.md` |
| Antigravity | `GEMINI.md` | `AGENTS.md` |
| Zed AI | `.rules` | `.cursorrules`, `.windsurfrules`, `AGENTS.md`, `CLAUDE.md` |
| Amp | `AGENTS.md` | -- |
| Lovable | `AGENTS.md` | -- |
| Bolt.new | `CLAUDE.md` | -- |
| OpenCode | `AGENTS.md` | -- |
| OpenHands | `AGENTS.md` | -- |

Tools with dedicated directories (Cursor, Windsurf, JetBrains, etc.) do not fall back to other files.

---

## Quick Reference Table

| # | Tool | Platform | Pricing | Skill File | Quick Install (macOS) | Quick Install (Windows) |
|---|------|----------|---------|------------|----------------------|------------------------|
| 1 | Claude Code | Mac/Win/Linux | Usage-based | `CLAUDE.md` | `npm i -g @anthropic-ai/claude-code` | `npm i -g @anthropic-ai/claude-code` |
| 2 | OpenAI Codex CLI | Mac/Win/Linux | Usage-based | `AGENTS.md` | `npm i -g @openai/codex` | `npm i -g @openai/codex` |
| 3 | Gemini CLI | Mac/Win/Linux | Free/Usage | `GEMINI.md` | `npm i -g @google/gemini-cli` | `npm i -g @google/gemini-cli` |
| 4 | Antigravity | Mac/Win/Linux | Usage-based | `GEMINI.md` | `npm i -g @google/antigravity` | `npm i -g @google/antigravity` |
| 5 | Cursor | Mac/Win/Linux | Free/$20/mo | `.cursor/rules/ios-skill.md` | `brew install --cask cursor` | `winget install Cursor.Cursor` |
| 6 | GitHub Copilot | Mac/Win/Linux | Free/$10/mo | `.github/copilot-instructions.md` | VS Code extension | VS Code extension |
| 7 | Windsurf | Mac/Win/Linux | Free/$15/mo | `.windsurf/rules/ios-skill.md` | `brew install --cask windsurf` | `winget install Codeium.Windsurf` |
| 8 | JetBrains AI | Mac/Win/Linux | $10/mo | `.aiassistant/rules/ios-skill.md` | JetBrains plugin | JetBrains plugin |
| 9 | JetBrains Junie | Mac/Win/Linux | AI Pro sub | `.junie/guidelines.md` | JetBrains plugin | JetBrains plugin |
| 10 | Zed AI | Mac/Linux | Free/API key | `.rules` | `brew install --cask zed` | N/A (no Windows) |
| 11 | Trae | Mac/Win | Free (beta) | `.trae/rules/ios-skill.md` | Download from trae.ai | Download from trae.ai |
| 12 | Amazon Q | Mac/Win/Linux | Free/$19/mo | `.amazonq/rules/ios-skill.md` | VS Code extension | VS Code extension |
| 13 | Cline | Mac/Win/Linux | Free (BYOK) | `.clinerules` | VS Code extension | VS Code extension |
| 14 | Roo Code | Mac/Win/Linux | Free (BYOK) | `.roo/rules/ios-skill.md` | VS Code extension | VS Code extension |
| 15 | KiloCode | Mac/Win/Linux | Free (BYOK) | `.kilocode/rules/ios-skill.md` | VS Code extension | VS Code extension |
| 16 | Continue.dev | Mac/Win/Linux | Free (OSS) | `.continue/rules/ios-skill.md` | VS Code extension | VS Code extension |
| 17 | Augment Code | Mac/Win/Linux | Free/Pro | `.augment/rules/ios-skill.md` | VS Code extension | VS Code extension |
| 18 | Tabnine | Mac/Win/Linux | Free/$12/mo | `.tabnine/guidelines/ios-skill.md` | VS Code extension | VS Code extension |
| 19 | Aider | Mac/Win/Linux | Free (BYOK) | `CONVENTIONS.md` | `brew install aider` | `pip install aider-chat` |
| 20 | Amp (Sourcegraph) | Mac/Win/Linux | Free/$9/mo | `AGENTS.md` | VS Code extension | VS Code extension |
| 21 | Replit Agent | Web | Free/$20/mo | `replit.md` | N/A (browser) | N/A (browser) |
| 22 | Lovable | Web | Free/$20/mo | `AGENTS.md` | N/A (browser) | N/A (browser) |
| 23 | Bolt.new | Web | Free/$20/mo | `CLAUDE.md` | N/A (browser) | N/A (browser) |
| 24 | v0 (Vercel) | Web | Free/$20/mo | None (UI) | N/A (browser) | N/A (browser) |
| 25 | Devin | Web | $500/mo | None (KB) | N/A (browser) | N/A (browser) |
| 26 | OpenCode | Mac/Linux | Free (OSS) | `AGENTS.md` | `brew install opencode` | WSL only |
| 27 | OpenHands | Mac/Win/Linux | Free (OSS) | `AGENTS.md` | Docker | Docker |
| 28 | PearAI | Mac/Win/Linux | Free (OSS) | `.continue/rules/ios-skill.md` | `brew install --cask pearai` | Download from trypear.ai |

### Legend

- **BYOK** = Bring Your Own Key (free tool, you pay for the AI API)
- **OSS** = Open Source Software
- **KB** = Knowledge Base (manual entry)
- **UI** = User Interface (paste instructions manually)
- **N/A** = Not applicable (browser-based, no installation needed)

---

## Appendix A: Skill File Format Reference

Each AI tool expects its skill file in a specific format. Here is what each file contains and how it is structured.

### Root-Level Files

| File | Used By | Format |
|------|---------|--------|
| `CLAUDE.md` | Claude Code, Bolt.new | Markdown with project overview, conventions, architecture |
| `AGENTS.md` | Codex CLI, Amp, Lovable, OpenCode, OpenHands, Antigravity | Markdown with agent instructions and project context |
| `GEMINI.md` | Gemini CLI, Antigravity | Markdown with Gemini-specific formatting |
| `CONVENTIONS.md` | Aider | Markdown with coding conventions and patterns |
| `SKILL.md` | Universal reference | Comprehensive skill documentation |
| `replit.md` | Replit Agent | Markdown with project setup and run instructions |

### Directory-Based Files

| Directory | Used By | File |
|-----------|---------|------|
| `.cursor/rules/` | Cursor | `ios-skill.md` |
| `.windsurf/rules/` | Windsurf | `ios-skill.md` |
| `.github/` | GitHub Copilot | `copilot-instructions.md` |
| `.junie/` | JetBrains Junie | `guidelines.md` |
| `.aiassistant/rules/` | JetBrains AI Assistant | `ios-skill.md` |
| `.trae/rules/` | Trae | `ios-skill.md` |
| `.amazonq/rules/` | Amazon Q Developer | `ios-skill.md` |
| `.continue/rules/` | Continue.dev, PearAI | `ios-skill.md` |
| `.roo/rules/` | Roo Code | `ios-skill.md` |
| `.kilocode/rules/` | KiloCode | `ios-skill.md` |
| `.augment/rules/` | Augment Code | `ios-skill.md` |
| `.tabnine/guidelines/` | Tabnine | `ios-skill.md` |

---

## Appendix B: API Key Quick Reference

Most tools require an API key from one of these providers.

### Anthropic (Claude)

1. Go to https://console.anthropic.com.
2. Sign up or log in.
3. Navigate to **API Keys**.
4. Click "Create Key".
5. Copy the key (starts with `sk-ant-`).
6. Set it:
   ```bash
   # macOS
   export ANTHROPIC_API_KEY="sk-ant-your-key-here"

   # Windows
   $env:ANTHROPIC_API_KEY = "sk-ant-your-key-here"
   ```

### OpenAI

1. Go to https://platform.openai.com.
2. Sign up or log in.
3. Navigate to **API Keys**.
4. Click "Create new secret key".
5. Copy the key (starts with `sk-`).
6. Set it:
   ```bash
   # macOS
   export OPENAI_API_KEY="sk-your-key-here"

   # Windows
   $env:OPENAI_API_KEY = "sk-your-key-here"
   ```

### Google AI (Gemini)

1. Go to https://aistudio.google.com/apikey.
2. Sign in with your Google account.
3. Click "Create API key".
4. Copy the key (starts with `AIzaSy`).
5. Set it:
   ```bash
   # macOS
   export GOOGLE_API_KEY="AIzaSy-your-key-here"

   # Windows
   $env:GOOGLE_API_KEY = "AIzaSy-your-key-here"
   ```

### AWS (Amazon Q)

1. Go to https://console.aws.amazon.com/iam.
2. Create an IAM user or use IAM Identity Center.
3. Generate access keys.
4. Configure:
   ```bash
   aws configure
   # Enter Access Key ID, Secret Access Key, region (us-east-1), and output format (json)
   ```

### OpenRouter (Multi-Model)

For tools that support OpenRouter (Cline, Roo Code, Continue.dev, etc.):

1. Go to https://openrouter.ai.
2. Sign up and add credits.
3. Navigate to **API Keys**.
4. Create a key.
5. Set it:
   ```bash
   export OPENROUTER_API_KEY="sk-or-your-key-here"
   ```

OpenRouter provides access to Claude, GPT-4, Gemini, Llama, Mixtral, and many other models through a single API.

---

## Appendix C: Choosing the Right Tool

### By Use Case

| Use Case | Recommended Tool | Why |
|----------|-----------------|-----|
| Terminal-first workflow | Claude Code | Best agentic terminal experience |
| VS Code user (general) | GitHub Copilot | Best inline completions, widely supported |
| VS Code user (agentic) | Cline or Roo Code | Full autonomous coding with tool use |
| AI-native IDE experience | Cursor or Windsurf | Purpose-built for AI-assisted coding |
| JetBrains IDE user | JetBrains AI + Junie | Native integration, no extensions needed |
| Open source / privacy | Continue.dev + Ollama | Fully local, no data leaves your machine |
| Multi-model flexibility | Aider | Supports 20+ model providers |
| Team with AWS | Amazon Q Developer | Native AWS integration, IAM auth |
| Quick prototyping | Bolt.new or Lovable | Browser-based, instant start |
| Budget-conscious | OpenCode or Aider | Free tools, pay only for API usage |
| High-performance editor | Zed AI | Fastest editor with AI integration |

### By Budget

| Budget | Best Options |
|--------|-------------|
| Free (no API costs) | GitHub Copilot Free, Windsurf Free, Amazon Q Free tier, Replit Free |
| Free (with API costs) | Claude Code, Aider, Cline, Roo Code, Continue.dev, OpenCode |
| Under $20/month | Cursor Pro, Windsurf Pro, Copilot Individual, Tabnine Pro |
| Under $50/month | All tools except Devin |
| Enterprise | Devin, Copilot Enterprise, Amazon Q Enterprise |

---

## Appendix D: Frequently Asked Questions

**Q: Can I use multiple AI tools simultaneously?**
A: Yes. Each tool reads only its designated file(s), so they do not conflict.

**Q: Do I need to install all 28 tools?**
A: No. Pick the one or two that best fit your workflow.

**Q: Will the skill files conflict with each other?**
A: No. Each tool reads only its own designated file(s).

**Q: Can I customize the skill for my team?**
A: Yes. Fork the repository and modify the skill files, or copy them into your project.

**Q: What if my tool is not listed here?**
A: Most AI tools read `CLAUDE.md`, `AGENTS.md`, or `.cursorrules`. Try adding the relevant file. If the tool supports custom instructions, paste `SKILL.md` content.

**Q: Can I use the skill with local/offline models?**
A: Yes. Continue.dev, Aider, and Cline support local models via Ollama. Skill files are read locally regardless of model backend.

**Q: I use Xcode. Can I use any of these tools?**
A: GitHub Copilot has an Xcode extension. For other tools, run them in a terminal alongside Xcode.

---

*This guide covers 28 AI coding assistants across macOS, Windows, and web platforms. For the latest updates, check the ios-agent-skill repository.*
