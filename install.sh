#!/bin/bash
# ios-agent-skill installer
# Installs the skill for Claude Code, Antigravity, Codex, Cursor, Copilot, and all AI coding agents

set -e

SKILL_NAME="ios-agent-skill"
REPO_URL="https://github.com/Nagarjuna2997/ios-agent-skill.git"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Installing ${SKILL_NAME}...${NC}"
echo ""

# Detect installation target
INSTALL_DIR=""

# Check for Claude Code project directory
if [ -d ".claude" ]; then
    INSTALL_DIR="$(pwd)"
    echo -e "  Detected ${GREEN}Claude Code${NC} project"
fi

# Check for Codex skills directory
if [ -d "$HOME/.codex" ]; then
    CODEX_SKILLS_DIR="$HOME/.codex/skills"
    mkdir -p "$CODEX_SKILLS_DIR"
    INSTALL_DIR="$CODEX_SKILLS_DIR/$SKILL_NAME"
    echo -e "  Detected ${GREEN}Codex${NC} at: $CODEX_SKILLS_DIR"
fi

# Check for Antigravity
if [ -d "$HOME/.antigravity" ]; then
    AG_SKILLS_DIR="$HOME/.antigravity/skills"
    mkdir -p "$AG_SKILLS_DIR"
    INSTALL_DIR="$AG_SKILLS_DIR/$SKILL_NAME"
    echo -e "  Detected ${GREEN}Antigravity${NC} at: $AG_SKILLS_DIR"
fi

# Default: install in current directory
if [ -z "$INSTALL_DIR" ]; then
    INSTALL_DIR="$(pwd)/$SKILL_NAME"
fi

# Clone or update
if [ -d "$INSTALL_DIR/.git" ]; then
    echo ""
    echo "Updating existing installation..."
    cd "$INSTALL_DIR"
    git pull --ff-only
else
    echo ""
    echo "Cloning skill repository..."
    git clone "$REPO_URL" "$INSTALL_DIR"
fi

echo ""
echo -e "${GREEN}Installation complete!${NC}"
echo ""
echo "Skill installed at: $INSTALL_DIR"
echo ""
echo -e "${YELLOW}Supported platforms:${NC}"
echo "  Claude Code    → reads CLAUDE.md (auto-detected)"
echo "  Antigravity    → reads AGENTS.md (auto-detected)"
echo "  Codex          → reads SKILL.md (auto-detected)"
echo "  Cursor         → reads .cursorrules (auto-detected)"
echo "  GitHub Copilot → reads .github/copilot-instructions.md (auto-detected)"
echo "  Windsurf       → reads CLAUDE.md or .cursorrules (auto-detected)"
echo "  Cline/Roo Code → reads CLAUDE.md (auto-detected)"
echo ""
echo "To use in any project, copy the matching file to your project root:"
echo "  cp $INSTALL_DIR/CLAUDE.md /your/project/"
echo "  cp $INSTALL_DIR/AGENTS.md /your/project/"
echo "  cp $INSTALL_DIR/.cursorrules /your/project/"
echo ""
echo "95+ files | 48,000+ lines | All Apple platforms & frameworks"
