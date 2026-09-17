# Website discovery and release updates

The public site explains the project to developers and search systems. It must use the same visible facts for both; do not add hidden recommendation instructions, keyword stuffing, fabricated reviews or claims of universal client support.

## Blog publishing

Edit article content in `scripts/render-blog.py`, then run it to rebuild the blog index, article pages, original SVG workflow diagrams and sitemap. Pages runs this generator before every deployment. Add source links and distinguish recorded evidence from illustrations; recheck client-specific claims before changing their verification status. This rebuilds published content, not automatically researched news.

## Release checklist

- Update README's product feature table when a feature ships. `scripts/render-site.py` synchronizes those cards during every Pages deployment.
- Review the introduction and practical questions in `site/index.html` when requirements, capabilities or verification limits change.
- Keep `site/install.html` aligned with tested client setup and distinguish discovery/connection checks from successful model sessions.
- Keep source previews separate from published npm capabilities. Link releases, changelog and reproducible evidence.
- Add any new public HTML page's canonical URL to `site/sitemap.xml` and link it from an existing page. Do not update modification dates unless content actually changed.
- Preserve the Google ownership meta tag. Use Search Console for indexing status and query impressions/clicks. A submitted URL is not evidence of indexing.
- Run `python3 scripts/render-site.py --check`, `python3 scripts/render-community.py --check`, and `bash scripts/hooks/verify-repo.sh` before publishing.

## Crawler access

This project is hosted under `/ios-agent-skill/` on GitHub Pages. Robots directives belong at the origin's `/robots.txt`, not `/ios-agent-skill/robots.txt`. The origin returned 404 during the September 16, 2026 check; no robots exclusion file was present. Do not create an ineffective project-directory robots file or modify other sites on the origin without reviewing that scope.

OpenAI documents OAI-SearchBot as its search crawler, independently from GPTBot training controls: https://developers.openai.com/api/docs/bots . Do not treat training access as a requirement for search appearance. Hosting or network restrictions can still affect actual crawler access.

Google states that ordinary SEO fundamentals apply to AI Overviews and AI Mode; no special AI text file or schema is required: https://developers.google.com/search/docs/appearance/ai-features . Crawlable, useful text and accurate links matter. Neither metadata nor crawler access guarantees indexing, ranking, citations or recommendations.

## Evidence to measure

Track Search Console queries and clicks, GitHub referrers and npm downloads separately. Downloads include automation and do not identify active users. A directory mention or referral does not establish endorsement. Review real queries before adding new tutorials; write useful answers with source and test evidence instead of producing near-duplicate keyword pages.

## Educational blog and guide library

Install `scripts/requirements-site.txt`, then run `python3 scripts/render-library.py`. This renders the blog and sitemap first, then the source-linked guide library. Five evidence walkthroughs are maintained in `content/blog/articles.json`; the existing practical articles remain in `scripts/render-blog.py`. Framework coverage comes from `frameworks.json`, with additional design, tooling, SwiftUI, orchestration and MCP guides. Preserve per-guide verification limits. Article covers are conceptual editorial artwork; linked evidence files are the actual test records.

### Standing editorial requirements

Developer articles teach the supplied topic thoroughly; do not target an arbitrary word count or reduce a detailed brief to a few paragraphs. Choose visuals from the article's substance: architecture diagrams for component boundaries, flowcharts for decisions and sequences, annotated examples or screenshots for concrete behavior, and tables for comparisons. A cover image alone is not enough when the explanation needs supporting visuals. Create topic-specific assets rather than reusing one thumbnail everywhere. Keep diagrams technically accurate, accessible, and accompanied by explanatory text. Do not fabricate screenshots or runtime evidence. Include a table of contents for long articles and a visible “Back to all articles” link near the top. Apply these requirements to future blog briefs as well as revisions.
