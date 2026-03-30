#!/bin/bash
# ios-agent-skill installer
# Installs the skill for Claude Code, Codex, and other AI coding agents

set -e

SKILL_NAME="ios-agent-skill"
REPO_URL="https://github.com/Nagarjuna2997/ios-agent-skill.git"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Installing ${SKILL_NAME}...${NC}"

# Detect installation target
INSTALL_DIR=""

# Check for Claude Code project directory
if [ -d ".claude" ]; then
    INSTALL_DIR="$(pwd)"
    echo "Detected Claude Code project at: $INSTALL_DIR"
fi

# Check for Codex skills directory
CODEX_SKILLS_DIR="$HOME/.codex/skills"
if [ -d "$HOME/.codex" ]; then
    mkdir -p "$CODEX_SKILLS_DIR"
    INSTALL_DIR="$CODEX_SKILLS_DIR/$SKILL_NAME"
    echo "Detected Codex at: $CODEX_SKILLS_DIR"
fi

# Default: install in current directory
if [ -z "$INSTALL_DIR" ]; then
    INSTALL_DIR="$(pwd)/$SKILL_NAME"
fi

# Clone or update
if [ -d "$INSTALL_DIR/.git" ]; then
    echo "Updating existing installation..."
    cd "$INSTALL_DIR"
    git pull --ff-only
else
    echo "Cloning skill repository..."
    git clone "$REPO_URL" "$INSTALL_DIR"
fi

# Copy SKILL.md to CLAUDE.md if in a project (for Claude Code compatibility)
if [ -f "$INSTALL_DIR/SKILL.md" ] && [ ! -f "CLAUDE.md" ]; then
    cp "$INSTALL_DIR/SKILL.md" "CLAUDE.md" 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}Installation complete!${NC}"
echo ""
echo "Skill installed at: $INSTALL_DIR"
echo ""
echo "Usage:"
echo "  Claude Code:  cd $INSTALL_DIR && claude"
echo "  Codex:        The skill is auto-registered via SKILL.md"
echo "  Any project:  Copy CLAUDE.md or SKILL.md to your project root"
echo ""
echo "Files: 93+ docs, templates, patterns, and checklists"
echo "Covers: Swift, SwiftUI, UIKit, 30+ Apple frameworks, all platforms"
