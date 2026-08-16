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
#
# Two rules, both learned the hard way:
#
# 1. These are `elif`, not four sequential `if`s. As separate ifs the LAST
#    match won, so a stray ~/.codex silently overrode a correctly detected
#    Claude Code project and the skill landed somewhere the agent never reads.
#
# 2. INSTALL_DIR is NEVER the user's project root. It used to be `$(pwd)` when
#    a .claude directory was present, and the clone-or-update branch below then
#    ran `git pull --ff-only` INSIDE THE USER'S OWN REPOSITORY against an
#    unrelated remote — or, on the clone path, aborted the script under `set -e`
#    because the directory was not empty. Both outcomes are wrong and one of
#    them touches work that is not ours.
INSTALL_DIR=""

if [ -d ".claude" ]; then
    INSTALL_DIR="$(pwd)/.claude/skills/$SKILL_NAME"
    echo -e "  Detected ${GREEN}Claude Code${NC} project"
elif [ -d "$HOME/.codex" ]; then
    INSTALL_DIR="$HOME/.codex/skills/$SKILL_NAME"
    echo -e "  Detected ${GREEN}Codex${NC}"
elif [ -d "$HOME/.antigravity" ]; then
    INSTALL_DIR="$HOME/.antigravity/skills/$SKILL_NAME"
    echo -e "  Detected ${GREEN}Antigravity${NC}"
else
    INSTALL_DIR="$(pwd)/$SKILL_NAME"
    echo -e "  No agent directory detected — installing into the current directory"
fi

mkdir -p "$(dirname "$INSTALL_DIR")"

# Refuse to touch anything that is not our own checkout.
#
# The guard is the remote URL, not the presence of .git: a directory can be a
# git repository and still be someone else's work, which is exactly the case
# this used to get wrong.
if [ -e "$INSTALL_DIR" ]; then
    if [ -d "$INSTALL_DIR/.git" ]; then
        EXISTING_REMOTE="$(git -C "$INSTALL_DIR" remote get-url origin 2>/dev/null || echo "")"
        if [ "$EXISTING_REMOTE" = "$REPO_URL" ]; then
            echo ""
            echo "Updating existing installation..."
            git -C "$INSTALL_DIR" pull --ff-only
        else
            echo ""
            echo -e "${YELLOW}Refusing to touch $INSTALL_DIR${NC}"
            echo "It is a git repository, but its origin is:"
            echo "  ${EXISTING_REMOTE:-<none>}"
            echo "Expected: $REPO_URL"
            echo ""
            echo "Move it aside, or install elsewhere:"
            echo "  git clone $REPO_URL /path/of/your/choosing"
            exit 1
        fi
    elif [ -n "$(ls -A "$INSTALL_DIR" 2>/dev/null)" ]; then
        echo ""
        echo -e "${YELLOW}Refusing to overwrite $INSTALL_DIR${NC}"
        echo "The directory already exists and is not empty."
        exit 1
    else
        echo ""
        echo "Cloning skill repository..."
        git clone "$REPO_URL" "$INSTALL_DIR"
    fi
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
