#!/usr/bin/env python3
"""Fail when guide samples recommend deprecated SwiftUI/UIKit APIs.

Agents copy Swift fences from these guides verbatim, so a sample that uses a
deprecated API teaches the deprecated API. Guides may still show deprecated
forms on purpose (labelled anti-patterns, legacy or older-OS sections); a
fence is exempt when it or the few lines introducing it say so, and a single
line is exempt when it is marked as wrong or deprecated.

    python3 scripts/check-deprecated-apis.py
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SCANNED = ["docs", "patterns", "checklists", "templates", "SKILL.md"]

DEPRECATED = {
    r"\bNavigationView\b": "NavigationStack or NavigationSplitView",
    r"\.foregroundColor\(": ".foregroundStyle(_:)",
    r"\bUIScreen\.main\b": "the view's traitCollection or @Environment(\\.displayScale)",
    r"\bUIApplication\.shared\.windows\b": "the connected UIWindowScene's windows",
    r"\.autocapitalization\(": ".textInputAutocapitalization(_:)",
    r"\.edgesIgnoringSafeArea\(": ".ignoresSafeArea(_:edges:)",
    r"\.navigationBarTitle\(": ".navigationTitle(_:)",
    r"\.accentColor\(": ".tint(_:)",
    r"\.onChange\(of:[^)]*\)\s*\{\s*\w+\s+in\b": "the two-parameter onChange closure (iOS 17+)",
    r"(?<![A-Za-z])PreviewProvider\b": "the #Preview macro",
}
# Words that label a fence or line as an intentional counter-example.
LABEL = re.compile(
    r"WRONG|BAD|anti-?pattern|deprecated|legacy|avoid|don't|do not|"
    r"before iOS 1[3-7]|iOS 1[3-6]\b|iOS 1[3-6][ -]|pre-iOS|older OS|instead of",
    re.IGNORECASE,
)
FENCE = re.compile(r"^\s*(`{3,})\s*([A-Za-z0-9_+-]*)")


def files():
    for entry in SCANNED:
        path = ROOT / entry
        if path.is_file():
            yield path
        else:
            yield from sorted(path.rglob("*.md"))


def scan(path):
    problems = []
    lines = path.read_text(encoding="utf-8").splitlines()
    index = 0
    while index < len(lines):
        match = FENCE.match(lines[index])
        if not match:
            index += 1
            continue
        language = match.group(2).lower()
        start = index
        index += 1
        while index < len(lines) and not FENCE.match(lines[index]):
            index += 1
        body = lines[start + 1:index]
        index += 1
        if language not in {"swift", ""}:
            continue
        introduction = "\n".join(lines[max(0, start - 4):start])
        if LABEL.search(introduction) or any(LABEL.search(line) for line in body[:3]):
            continue
        for offset, line in enumerate(body, start + 2):
            if LABEL.search(line) or line.lstrip().startswith("//"):
                continue  # labelled, or prose in a comment explaining the API
            previous = body[offset - start - 3].strip() if offset - start - 3 >= 0 else ""
            if previous.startswith("//") and LABEL.search(previous):
                continue  # e.g. "// React to value changes (iOS 14-16 syntax)"
            for pattern, replacement in DEPRECATED.items():
                if re.search(pattern, line):
                    problems.append(
                        f"{path.relative_to(ROOT)}:{offset}: deprecated API; use {replacement}\n    {line.strip()}"
                    )
    return problems


def main() -> int:
    problems = [problem for path in files() for problem in scan(path)]
    if problems:
        print("Guide samples use deprecated APIs (label intentional counter-examples as WRONG/deprecated/legacy):")
        print("\n".join(problems))
        return 1
    print("OK - no unlabelled deprecated SwiftUI/UIKit APIs in guide samples")
    return 0


if __name__ == "__main__":
    sys.exit(main())
