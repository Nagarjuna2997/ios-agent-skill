#!/usr/bin/env bash
# Optional source-skill installer. MCP installation remains separate.
set -euo pipefail
REPO_URL='https://github.com/Nagarjuna2997/ios-agent-skill.git'
usage() {
  cat <<'HELP'
Usage: bash install.sh --client claude|codex|muse [--dir PATH]
       bash install.sh --client gemini|chatgpt

Claude and Muse default to the current project's .claude/skills/ios-agent-skill.
Codex defaults to ~/.codex/skills/ios-agent-skill.
Gemini and ChatGPT print their dedicated setup instructions without changing files.
The source installer does not configure MCP or install Xcode. For one MCP connection:
  npx -y ios-agent-mcp@latest
HELP
}
client=''; target=''
while (($#)); do
  case "$1" in
    --client|--dir)
      (($# >= 2)) || { usage >&2; exit 1; }
      if [[ "$1" == --client ]]; then client="$2"; else target="$2"; fi
      shift 2 ;;
    --help|-h) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage >&2; exit 1 ;;
  esac
done
case "$client" in
  claude|muse) target="${target:-$PWD/.claude/skills/ios-agent-skill}" ;;
  codex) target="${target:-$HOME/.codex/skills/ios-agent-skill}" ;;
  gemini|chatgpt)
    [[ -z "$target" ]] || { echo '--dir is only for source-skill installation.' >&2; exit 1; }
    if [[ "$client" == gemini ]]; then
      echo 'Run: gemini extensions install https://github.com/Nagarjuna2997/ios-agent-skill'
    else
      echo 'ChatGPT: use the skills package from GitHub Releases or configure an MCP connection.'
      echo 'This script cannot install a plugin into a browser account.'
    fi
    echo 'Guide: https://github.com/Nagarjuna2997/ios-agent-skill/blob/main/docs/mcp/installation.md'
    exit 0 ;;
  *) usage >&2; exit 1 ;;
esac
command -v git >/dev/null || { echo 'Git is required.' >&2; exit 1; }
[[ "$target" != -* ]] || target="$PWD/$target"
[[ ! -L "$target" ]] || { echo 'Refusing a symlink installation target.' >&2; exit 1; }
if [[ -e "$target" ]]; then
  [[ -d "$target/.git" ]] || { echo 'Refusing an existing directory that is not this skill checkout.' >&2; exit 1; }
  [[ "$(git -C "$target" remote get-url origin)" == "$REPO_URL" ]] || { echo 'Refusing a checkout with another origin.' >&2; exit 1; }
  [[ -z "$(git -C "$target" status --porcelain)" ]] || { echo 'Local changes found. Preserve or commit them before updating.' >&2; exit 1; }
  [[ "$(git -C "$target" branch --show-current)" == main ]] || { echo 'Refusing to update a branch other than main.' >&2; exit 1; }
  git -C "$target" pull --ff-only origin main
else
  mkdir -p "$(dirname "$target")"
  git clone --branch main --single-branch "$REPO_URL" "$target"
fi
printf '\nSource skill installed at: %s\n' "$target"
echo 'MCP is configured separately. Keep the bundled references with SKILL.md.'
echo 'For a new client, open a client-support issue and add a 👍 reaction to existing requests.'
