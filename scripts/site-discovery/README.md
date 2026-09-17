# Static site discovery build

Install with `npm ci --prefix scripts/site-discovery --ignore-scripts`, then run the existing Python site renderer before `node scripts/site-meta.mjs` and `node scripts/check-site-discovery.mjs`.

HTML metadata lives in `site/pages.json`. `node scripts/site-meta.mjs --update-map` seeds missing entries for review; ordinary builds reject unregistered HTML. Markdown under `site/` needs YAML `title` and `description`; `draft: true` excludes its generated HTML from public discovery. Assets and 404 pages are excluded. Do not hand-edit sitemap, robots, llms, Atom or generated map pages.

The build preserves article bodies, injects metadata, and adds a footer discovery navigation. Page dates come from Git history; existing source-backed guides also consider their source history, so source-only edits cannot publish stale modification dates. CI uses a full checkout. Newly created uncommitted pages use the current Git HEAD date until committed.

Verification tokens go in `site/verification.json`. The IndexNow key comes only from `INDEXNOW_KEY`; its public verification file is generated during the build. `node scripts/site-indexnow.mjs --dry-run` previews URLs without contacting an engine. Actual notifications run only after deployment and first verify the published key file. Missing key means no notification.

Run regression tests with `node --test scripts/site-discovery/discovery.test.mjs`. The weekly live checker fetches the sitemap and checks HTTP status and canonical URLs. Local JSON-LD checks validate required project schemas, not Google's acceptance or rich-result eligibility.

GitHub project Pages require `/ios-agent-skill/feed.xml`, not `/feed.xml`. Project-local robots.txt is provided, but crawler-wide robots policy must be hosted at `https://nagarjuna2997.github.io/robots.txt` in the account-level Pages site. Search Console and Bing sitemap submission work independently of that root-file setup. No code here can guarantee indexing, traffic, or AI citations.
