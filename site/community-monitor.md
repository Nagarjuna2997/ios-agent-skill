---
title: Daily community monitor
description: Operational reference for verifying community mentions and maintaining the project website.
---

# Daily community monitor

Operational instructions for the scheduled Codex task. Scheduling is in Codex, not the Pages workflow. The daily Pages job refreshes download counts; it does not search the web.

## Repository workflow

- Read `site/community-mentions.json` and the live `community.html` page first.
- Verified mentions are stored in that JSON. Generate the isolated HTML section in `site/community.html` with `python3 scripts/render-community.py`.
- Run `python3 scripts/render-community.py --check`, `python3 scripts/render-site.py --check`, `python3 -m unittest discover -s scripts/tests -p test_community.py` and `bash scripts/hooks/verify-repo.sh`.
- Keep verification dates stable on no-change days. Do not commit daily reports, timestamp-only updates or inaccessible-candidate churn. Record the run report in the scheduled task.
- Work from a clean current checkout; preserve unrelated work, never reset it. Commit only intended files. Push main to publish through GitHub Pages. Never publish npm or change package versions.
- Initial deferred baseline links: LibHunt, PickMCP, Product Hunt and npm web page could not be opened successfully. Retry later; inaccessible does not mean removed. Agentmods has a verified alternative canonical card; do not add its hooks/tag pages as duplicate coverage.
- Deduplicate language variants, mirrors on the same site and alternate canonical URLs using editorial judgment plus the renderer’s URL checks. Each standalone republication must be explicitly labelled a mirror.
- This initial run found skills.rest and Web Pulse beyond the supplied baseline. Reddit is maintainer-started with independent comments, not an independent endorsement.

## User-supplied monitoring specification

You are responsible for maintaining the public “Community & Mentions” section for this project:

GitHub:
https://github.com/Nagarjuna2997/ios-agent-skill

npm:
https://www.npmjs.com/package/ios-agent-mcp

Project names to monitor:

ios-agent-skill
ios-agent-mcp
iOS Agent Skill
iOS Agent MCP
Nagarjuna2997/ios-agent-skill

Run this workflow every day.

Your job is to search the public internet for new mentions of the project, verify them, compare them against the mentions already shown on the website, and update the website only when a genuinely new and useful mention is found.

Do not add duplicate links.

Do not rewrite the section every day if nothing has changed.

Do not manufacture work.

If everything already looks correct, leave the website unchanged.

SEARCH FOR MENTIONS ACROSS:

Google-indexed web pages

developer blogs

personal blogs

newsletters

Reddit

Hacker News

X/Twitter pages that are publicly indexed

LinkedIn pages that are publicly indexed

YouTube videos and descriptions

GitHub repositories

GitHub issues and discussions

MCP directories

Agent Skill directories

Claude Code directories

Codex directories

Swift/iOS developer communities

Product Hunt

DEV Community

Medium

Hashnode

npm-related pages

Apple/Swift ecosystem websites

AI coding-agent resource pages

comparison websites

curated developer-tool lists

software discovery websites

international or translated pages

Search both exact names and URLs.

Use queries based on:

"ios-agent-skill"

"ios-agent-mcp"

"Nagarjuna2997/ios-agent-skill"

"github.com/Nagarjuna2997/ios-agent-skill"

"npm ios-agent-mcp"

"iOS Agent MCP"

"iOS Agent Skill"

Also search combinations with:

Swift
SwiftUI
Xcode
Xcode 27
iOS
MCP
Claude Code
Codex
Cursor
Gemini CLI
coding agents
Apple development
AI coding

CLASSIFY EVERY RESULT

For each result determine whether it is:

INDEPENDENT COMMUNITY MENTION

Someone else discussed, recommended, reviewed, compared, commented on, linked to, or used the project.

This is the highest-value category.

DIRECTORY / INDEX

A third-party directory automatically or manually indexed the project.

This is useful for discovery but should not be described as an endorsement.

COMMUNITY DISCUSSION

A Reddit, Hacker News, GitHub, forum, or other discussion containing real comments about the project.

ARTICLE / BLOG

An independent article that discusses the project.

MY OWN CONTENT

Posts originally created by Nagarjuna Reddy / Nagarjuna2997.

These can be listed as project coverage but must not be presented as independent press.

MIRROR / REPUBLICATION

A site copying, syndicating, translating, or mirroring one of my own articles.

Do not describe this as independent praise.

OFFICIAL PROJECT PAGE

GitHub, npm, project website, Product Hunt listing, etc.

VERIFY BEFORE ADDING

Before adding a result:

Open the page.

Confirm that it genuinely mentions this exact project.

Confirm the URL still works.

Check whether it is already on the website.

Do not add search-result pages that only coincidentally contain similar words.

Do not confuse similarly named iOS MCP projects with this repository.

Do not add spam or scraped garbage pages unless they provide meaningful discovery value.

Do not claim:

“endorsed by”
“recommended by”
“partnered with”
“officially supported by”
“featured by”

unless the source explicitly supports that statement.

Use safer wording such as:

“Mentioned on”

“Discussed on”

“Indexed on”

“Discovered on”

“Listed on”

“Community discussion”

“Featured, discussed, indexed, or discovered across”

WEBSITE SECTION

Maintain a section titled:

Community & Mentions

Keep this introduction:

“Seeing ios-agent-skill shared, indexed, discussed, and discovered across the developer community means a lot to me. Thank you to everyone who has checked out the project, shared feedback, starred the repository, or helped others discover it. I’m still improving it, and every bit of support genuinely motivates me to keep building.”

Then show the verified mentions as clean cards.

Each card should contain:

Site/platform name

Short category such as:

Community
Article
Directory
Developer Resource
Discussion
Launch
Package

One short factual description

Direct external link

Do not show exaggerated marketing language.

Prefer the strongest mentions first.

Suggested ordering:

1. Independent human/community mentions
2. Independent articles/blogs
3. Developer resource collections
4. Discussions
5. Curated directories
6. Automated directories
7. My own posts
8. Mirrors

CURRENT KNOWN LINKS

Use these as the starting baseline and do not duplicate them:

Kimi
https://www.kimi.ai/resources/software-skills-for-agents

LibHunt
https://www.libhunt.com/compare-appstore-doctor-vs-ios-agent-skill

SkillsMP
https://skillsmp.com/creators/nagarjuna2997/ios-agent-skill/skill

Awesome Skills
https://www.awesomeskills.dev/en/skill/nagarjuna2997-ios-agent-skill

Awesome MCP Servers
https://mcpservers.org/servers/nagarjuna2997/ios-agent-skill

PickMCP
https://pickmcp.com/servers/Nagarjuna2997/ios-agent-skill

Agentmods
https://agentmods.dev/hooks/nagarjuna2997/ios-agent-skill

SkillWorks
https://skillworks.thecompound.tech/claude-md-examples

Reddit / r/Xcode
https://www.reddit.com/r/Xcode/comments/1v8j94w/i_got_tired_of_ai_agents_writing_2019era_swiftui/

DEV Community
https://dev.to/nagarjuna_reddy_7ca85e003/im-building-an-mcp-toolbox-for-swift-xcode-and-ios-simulator-kp9

Product Hunt
https://www.producthunt.com/products/ios-agent-mcp

npm
https://www.npmjs.com/package/ios-agent-mcp

GitHub
https://github.com/Nagarjuna2997/ios-agent-skill

Do not assume this list is complete.

Search for new mentions every day.

THANK-YOU AREA

Keep this message near the bottom:

“Thank you for supporting ios-agent-skill.”

“This started as a side project because I wanted AI coding agents to work better with real iOS development workflows. Seeing developers discover it, read the documentation, give feedback, and share it keeps me motivated to make it better.”

Then add:

“Using ios-agent-skill in a real project? I’d love to hear about it.”

Keep buttons for:

View on GitHub

Share Feedback

Star the Project

DAILY BEHAVIOR

Every daily run should follow this process:

1. Read the existing website section first.

2. Extract all URLs already displayed.

3. Search broadly for new mentions.

4. Verify every candidate.

5. Deduplicate against existing links.

6. Add only genuinely new mentions.

7. Preserve all good existing links.

8. Fix broken links if necessary.

9. Do not remove a mention simply because it did not appear in today's search.

10. Do not modify unrelated parts of the website.

11. Do not redesign the page unless there is an actual layout problem.

12. Keep the section fast, responsive, accessible, and mobile friendly.

13. External links should open safely in a new tab where appropriate.

14. If the website repository has tests or linting, run them after changes.

15. If the build can be run, verify it before committing.

GIT WORKFLOW

If new verified mentions are found:

Update only the necessary website files.

Run available checks.

Commit with a clear message such as:

docs: add new community mentions

or

site: update ios-agent-skill mentions

Do not create meaningless daily commits when there are no changes.

If no new mention exists:

Do not change files.

Do not create a commit.

Report:

“No new verified mentions today. Website unchanged.”

DAILY REPORT

At the end of every run report:

New mentions found:
[number]

Added to website:
[number]

Independent human/community mentions:
[number]

Directory/index mentions:
[number]

Duplicates ignored:
[number]

Questionable/unverified results ignored:
[number]

Website changed:
YES / NO

Build/check status:
PASS / FAIL / NOT REQUIRED

For each new mention show:

Platform:
URL:
Type:
Why it matters:
Added to website: YES / NO

Most important rule:

The goal is not to make the project appear more popular than it is.

The goal is to honestly document the growing public footprint of ios-agent-skill and thank the people and communities helping others discover it.

If a link is already present and correct, leave it alone.

If nothing new happened, do nothing.

