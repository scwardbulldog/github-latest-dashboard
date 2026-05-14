---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-05-13'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd-org-stats.md'
  - '_bmad-output/planning-artifacts/ux-design-specification-org-stats.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/project-context.md'
  - 'docs/architecture.md'
  - 'docs/contributing.md'
project_name: 'GitHub Org Activity Dashboard Page'
user_name: 'Shane'
date: '2026-05-13'
featureScope: 'org-stats carousel page (MVP — Phase 1)'
---

# Architecture Decision Document — GitHub Org Activity Dashboard Page

_This document defines the complete architecture for the Org Stats feature: a new carousel page for the existing GitHub Latest Dashboard kiosk. All decisions are scoped to the MVP Phase 1 widgets: Pipeline Heatmap, Org Heartbeat Numbers, Commit Leaderboard, and PR Merge Celebration Ticker._

---

## Project Context Analysis

### Feature Scope

This is a **brownfield feature extension** on the existing `github-latest-dashboard` Vite/Vanilla JS project. The core platform (Vite, ES modules, GitHub Primer design tokens, CarouselController, api-client, config-loader) is already deployed and fully operational. This architecture document governs only the new org stats carousel page.

**Existing architecture document:** `_bmad-output/planning-artifacts/architecture.md` covers the base platform decisions (Vite, multi-file source structure, ES module patterns, deployment workflow, Pi 3B constraints). This document inherits all of those decisions without repeating them and addresses only the delta: what is new or different for org stats.

### Requirements Overview

**Functional Requirements (MVP — Phase 1):**

| FR | Category | Description |
|----|----------|-------------|
| FR1 | CI/CD | Fetch GitHub Actions run status per repo; display as color-coded heatmap grid |
| FR2 | CI/CD | Spatial consistency — same repo always in same cell across refresh cycles |
| FR3 | CI/CD | Show pipeline run count + failure count for trailing 7 days |
| FR4 | CI/CD | Visually distinguish no-CI repos from passing/failing repos |
| FR5 | Commits | Display total 7-day commit count as headline number |
| FR6 | Commits | Display top-10 contributors by commit count with avatar, name, count |
| FR10 | PRs | Display 7-day PRs opened + PRs merged as headline numbers |
| FR11 | PRs | Live ticker of PRs merged in trailing 24 hours (repo, title, author) |
| FR12 | PRs | Poll for new merged PRs at ≤2 minute intervals |
| FR17 | Auth | Authenticate with GitHub REST API using PAT from runtime config |
| FR18 | Cache | 5-minute TTL cache per data type; serve stale on fetch failure |
| FR19 | Cache | Display stale data indicator when live fetch fails |
| FR20 | Perf | Complete full ~100-repo fetch within 5-minute window; stay under 5,000 req/hr |
| FR21 | Kiosk | Register as carousel page slot in existing 30-second rotation |
| FR22 | Kiosk | All widgets in single 1920×1080 viewport; no scroll |
| FR23 | Kiosk | 5-minute background data refresh; no carousel disruption |

**Non-Functional Requirements (NFRs):**

- **NFR-PERF:** Full render within 3 seconds of carousel rotation on Raspberry Pi 3B
- **NFR-MEM:** No memory growth over 24-hour continuous run; all timers have cleanup
- **NFR-COMPAT:** ES2020 only; `-webkit-` prefixes for all new CSS features; no CSS features beyond Chromium 84 support
- **NFR-RATE:** Total GitHub API calls across all 5-minute cycles ≤ 5,000 req/hr
- **NFR-DEGRADE:** If GitHub API is unreachable, stale cached data displays with age indicator; no blank state
- **NFR-SEC:** PAT stored in gitignored file; read-only scopes; never in source code or committed files
- **NFR-ANIM:** Ticker CSS animation maintains ≥30fps on Pi 3B; no JS RAF-driven cell animations

### Architectural Implications of Requirements

**FR1/FR2 → Alphabetical sort is mandatory architecture.** Repos must be fetched once and sorted by name before assigning grid positions. Sort must be deterministic and stable across all refresh cycles.

**FR12 → Two-tier refresh cadence is required.** The PR ticker needs ≤2-minute polling, but the full data refresh (heatmap + commits + all-PR stats) runs every 5 minutes. These are separate timers.

**FR20 → Rate limiting demands request budgeting.** With ~100 repos × 3 endpoints = ~300-400 requests per full cycle × 12 cycles/hour = 3,600-4,800 req/hr. This leaves minimal headroom. A request budget strategy is non-negotiable architecture, not an optimization.

**NFR-PERF → Incremental rendering is required.** The page must show skeleton placeholders immediately on activation, then populate widgets as data arrives (not wait for all ~300 API calls to complete before rendering anything).

**NFR-SEC → Secrets file architecture is required.** The PAT cannot live in the committed `config.json`. A separate gitignored `secrets.json` file is introduced.

### Scale Assessment

- **Project complexity:** Medium-high (multi-source API aggregation, rate limiting, complex data aggregation across ~100 repos)
- **Primary domain:** Frontend kiosk display with heavy async data fetching
- **New architectural components:** 3 (OrgStatsController, org-stats-api module within OrgStatsController, pr-ticker timer)
- **New source files:** 2 (`src/js/org-stats.js`, `src/css/org-stats.css`)
- **Modified files:** 4 (`src/index.html`, `src/js/main.js`, `public/config.json`, `.gitignore`)
- **New config files:** 2 (`public/secrets.json` [gitignored], `public/secrets.json.example` [committed])

### Cross-Cutting Concerns

1. **Rate Limit Budget:** Every design decision about API calls must be measured against the 5,000 req/hr budget
2. **Pi 3B Memory:** The ~100-repo dataset must be cached efficiently; no redundant data structures
3. **Timer Coordination:** Two new timers (5-min data refresh, 2-min ticker refresh) must register cleanup methods and not interfere with the existing carousel and item highlight timers
4. **Staleness UX:** All four widgets must have a consistent stale-state visual treatment
5. **Alphabetical Spatial Stability:** The sort that produces spatial consistency must run once (on repo list fetch) and be reused for all subsequent widget renders — not re-sorted independently

---

## Architecture Foundation

### Inherited Platform Decisions (No Changes)

All base platform decisions from `architecture.md` are inherited unchanged:

- **Build system:** Vite, `npm run build` → root `index.html` artifact
- **Module system:** ES modules, `.js` extensions mandatory in imports
- **Language:** Vanilla JavaScript ES2020, no TypeScript, no frameworks
- **CSS:** Pure CSS, GitHub Primer design tokens only, no hardcoded values
- **Deployment:** Git-based, Pi pulls from main branch, Python http.server
- **Component pattern:** Class-based with `start()`/`stop()` lifecycle and cleanup
- **Callback pattern:** Direct properties (`this.onPageChange = null`) not EventEmitter
- **Timer pattern:** `setInterval`/`setTimeout` with null-guard cleanup in `stop()`

### Brownfield Extension Strategy

The org stats page extends the existing system at three integration points:

```
1. config.json    → Add org name, orgstats page registration, per-page intervals
2. secrets.json   → New file (gitignored) holding the GitHub PAT
3. src/index.html → Add .carousel-page[data-page="orgstats"] HTML structure
4. src/js/main.js → Import OrgStatsController, wire to CarouselController lifecycle
```

No existing files require architectural redesign. All changes are additive.

---

## Core Architectural Decisions

### Decision 1: Module Boundary — Single `org-stats.js` vs. Split Files

**Options considered:**
- **A: Single `org-stats.js`** — data fetching + widget rendering in one module (PRD recommendation)
- **B: Split `org-stats-api.js` + `org-stats.js`** — separation of data and view concerns
- **C: Extend `api-client.js`** — add org-stats fetch functions to existing API client

**Decision: Option A — Single `src/js/org-stats.js`**

**Rationale:**
- The PRD explicitly specifies one file
- Org-stats API logic is tightly coupled to org-stats rendering (data shape drives widget structure)
- Adding ~300-repo aggregation logic to `api-client.js` would make it a monolith (api-client.js already handles 6 data sources for different concerns)
- Internal class structure provides sufficient separation: private `_fetch*` methods for data, `_render*` methods for display
- Single file = single import in main.js = minimal integration surface

**Internal module structure:**
```javascript
// src/js/org-stats.js
export class OrgStatsController {
  // === Public lifecycle ===
  constructor(config) { ... }
  async init() { ... }         // Called once on first page activation
  async refresh() { ... }      // Called every 5 minutes
  startTickerPolling() { ... } // Starts 2-min PR ticker refresh
  stopTickerPolling() { ... }
  destroy() { ... }            // Full cleanup (called when page removed)
  
  // === Private data layer ===
  async _fetchOrgRepos() { ... }
  async _fetchPipelineStatuses(repos) { ... }
  async _fetchCommitContributors(repos) { ... }
  async _fetchMergedPRs(repos) { ... }
  _requestWithPAT(url) { ... } // Shared fetch wrapper with auth + retry
  _rateLimit(batch, delayMs) { ... } // Batch request throttle helper
  
  // === Private render layer ===
  _renderHeartbeat(data) { ... }
  _renderHeatmap(repos) { ... }
  _renderLeaderboard(contributors) { ... }
  _renderTicker(mergedPRs) { ... }
  _renderSkeletons() { ... }   // Initial loading state
  _renderStaleIndicator(widgetEl, ageMs) { ... }
  
  // === State ===
  _cache = { repos: null, pipeline: null, commits: null, prs: null, timestamps: {} }
  _sortedRepos = null          // Alphabetically sorted repo list (computed once)
  _tickerTimer = null
  _refreshTimer = null
}
```

### Decision 2: PAT Security Architecture

**Options considered:**
- **A: PAT in `config.json`, gitignore `config.json`** (PRD literal interpretation)
- **B: PAT in `secrets.json` (gitignored), keep `config.json` committed** (additive, non-breaking)

**Decision: Option B — Separate `public/secrets.json`**

**Rationale:**
- `config.json` is currently committed and contains no sensitive data. Gitignoring it would remove all existing user-configurable settings from version control — a breaking change to the existing workflow.
- A separate `secrets.json` (gitignored) maintains the principle of least privilege without disrupting existing committers.
- Follows the established principle: committed files are safe to share; sensitive credentials live in gitignored files.
- The existing `config-loader.js` is already designed to be extended.

**Implementation:**
```
public/secrets.json          ← GITIGNORED — contains actual PAT
public/secrets.json.example  ← COMMITTED — template with placeholder
```

```json
// public/secrets.json.example
{
  "_comment": "Copy to secrets.json and fill in your PAT. This file is safe to commit. secrets.json is NOT.",
  "githubPat": "ghp_YOUR_PAT_HERE"
}
```

The `config-loader.js` gets a new `loadSecrets()` function that fetches `secrets.json` and merges into the config object. If `secrets.json` is missing, the org stats page renders a configuration error state rather than crashing.

### Decision 3: GitHub API Request Budget Strategy

**Constraint:** ~100 repos × multiple endpoints, 5-minute refresh cycle, 5,000 req/hr PAT limit.

**Request budget analysis (per 5-min cycle):**

| Call type | Count | Notes |
|-----------|-------|-------|
| `GET /orgs/{org}/repos` | 1–2 | Paginated at 100/page; 1 call for ≤100 repos |
| `GET /repos/{owner}/{repo}/actions/runs?per_page=1` | ~100 | Latest run only; `per_page=1` is critical |
| `GET /repos/{owner}/{repo}/stats/contributors` | ~100 | Weekly stats; GitHub caches these |
| `GET /repos/{owner}/{repo}/pulls?state=closed&per_page=10` | ~100 | Last 10 closed PRs for 7d window |
| **Total per cycle** | **~302** | |
| **Cycles per hour** | **12** | Every 5 minutes |
| **Total per hour** | **~3,624** | **72.5% of 5,000 budget** |

**Headroom: ~1,376 req/hr.** This is sufficient but not lavish. Key rate-limiting rules:

1. **`per_page=1` on workflow runs.** Only the most recent run is needed per repo. Never paginate workflow runs.
2. **Skip repos with no recent activity.** If `stats/contributors` returns empty for a repo, mark it `no-ci` and skip the `actions/runs` call for it on subsequent cycles.
3. **Batch requests in groups of 10 with 100ms delay between batches.** Prevents burst that could trigger GitHub's secondary rate limiter (concurrent request limit).
4. **Contributor stats API caching note:** GitHub computes `stats/contributors` asynchronously. If the endpoint returns `202 Accepted`, wait 3 seconds and retry once. If still 202, use cached data from previous cycle.
5. **Repo list cached for 30 minutes** (not 5 minutes). Org repo lists change rarely; caching longer reduces 1–2 calls per refresh cycle.

**Implementation as a batch helper:**
```javascript
async _batchRequests(items, requestFn, batchSize = 10, delayMs = 100) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(requestFn));
    results.push(...batchResults);
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  return results;
}
```

### Decision 4: Two-Tier Refresh Cadence

**Problem:** FR12 requires PR ticker updates at ≤2 minutes, but FR23 requires full data refresh at 5 minutes. Full refresh (~300 API calls) cannot run every 2 minutes.

**Decision: Two independent timers**

| Timer | Interval | Scope | API calls |
|-------|----------|-------|-----------|
| Full data refresh | 5 minutes | All four widgets | ~300 calls |
| Ticker-only refresh | 2 minutes | PR ticker only | ~100 calls (pulls for recent merges) |

The ticker-only refresh fetches only `GET /repos/{owner}/{repo}/pulls?state=closed&per_page=5&sort=updated` using the sorted repo list cached from the last full refresh. It does NOT re-fetch repos, contributors, or pipeline statuses.

**Impact on request budget:** Ticker runs 3× per 5-min cycle (at 0min, 2min, 4min), each consuming ~100 calls = 300 additional calls per cycle → 3,600 additional per hour. Combined budget: 3,624 + 3,600 = **7,224/hour** — exceeds limit.

**Mitigation:** The ticker-only refresh uses the cached repo list but only queries the 30 repos with most recent commit activity (ordered by `pushed_at` from the org repos call). This reduces ticker-only calls from ~100 to ~30 per cycle: 30 × 30 = 900 additional calls/hour. **Total: ~4,524/hour (90.5% of budget).** Acceptable.

**Timer cleanup:** Both timers must be nulled in `destroy()`. Example:
```javascript
destroy() {
  if (this._refreshTimer) { clearInterval(this._refreshTimer); this._refreshTimer = null; }
  if (this._tickerTimer) { clearInterval(this._tickerTimer); this._tickerTimer = null; }
}
```

### Decision 5: Incremental Rendering (Skeleton-First)

**Decision:** On page activation, render skeleton placeholders immediately (synchronously), then populate each widget as its data becomes available (asynchronously).

**Render sequence:**
```
carousel page becomes active
  → (sync)  _renderSkeletons()       — all 4 widgets show loading state
  → (async) _fetchOrgRepos()         — repo list arrives first (1 API call)
  → (async) Promise.allSettled([     — 3 parallel batch fetches launch together
      _fetchPipelineStatuses(),
      _fetchCommitContributors(),
      _fetchMergedPRs()
    ])
  → as each resolves:
      pipeline data → _renderHeatmap()       — heatmap populates
      contributor data → _renderLeaderboard() — leaderboard populates
      PR data → _renderHeartbeat() + _renderTicker() — both depend on PR data
```

This means the heatmap could render before the leaderboard if pipeline calls resolve faster. Each widget is independently populated — no widget blocks another.

**Skeleton state CSS:**
```css
.widget-skeleton {
  background: linear-gradient(
    90deg,
    var(--color-canvas-subtle) 25%,
    var(--color-border-default) 50%,
    var(--color-canvas-subtle) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

/* IMPORTANT: Skip animation if prefers-reduced-motion or Pi performance budget */
@media (prefers-reduced-motion: reduce) {
  .widget-skeleton { animation: none; }
}
```

**Pi 3B performance note:** If skeleton shimmer animation causes frame drops, remove the animation and use a static muted color. The skeleton's purpose is layout stability, not visual delight.

### Decision 6: PR Ticker CSS Animation Architecture

**Decision:** Pure CSS `@keyframes` horizontal translate. Content rendered as a double-length track for seamless looping.

**Why CSS over JS RAF loop:** Pi 3B GPU handles CSS transforms natively. A JS RAF loop that updates `element.style.transform` on every frame adds CPU overhead for JavaScript execution on top of GPU composition — strictly worse.

**Infinite loop trick:**
```html
<div class="pr-ticker-bar">
  <div class="pr-ticker-track" id="pr-ticker-track">
    <!-- Items rendered twice: original set + duplicate set -->
    <!-- Track width = 200% of visible area -->
    <!-- Animation: translateX(0) → translateX(-50%) -->
    <!-- At -50%, we're back to the start of the duplicate set = seamless -->
  </div>
</div>
```

```css
@keyframes ticker-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.pr-ticker-track {
  display: flex;
  white-space: nowrap;
  animation: ticker-scroll var(--ticker-duration, 60s) linear infinite;
  will-change: transform;
}
```

The animation duration is calculated dynamically in JS based on item count:
```javascript
_startTickerAnimation(items) {
  const track = document.getElementById('pr-ticker-track');
  // ~80px/sec scroll speed, content width drives duration
  const contentWidth = track.scrollWidth / 2; // half of doubled content
  const durationSec = Math.max(20, contentWidth / 80);
  track.style.setProperty('--ticker-duration', `${durationSec}s`);
}
```

**On data refresh:** When new PR data arrives, the ticker DOM is rebuilt and animation restarts. To avoid jarring restart, use a `paused` → content swap → `running` sequence:
```javascript
track.style.animationPlayState = 'paused';
// update DOM
track.style.animation = 'none'; // clear animation state
requestAnimationFrame(() => {
  track.style.animation = ''; // re-apply from CSS
});
```

### Decision 7: Avatar Loading Strategy

**Decision:** Synchronous SVG fallback + lazy progressive enhancement.

**Rationale:** Avatars fetched from `github.com` are external network calls. On Pi 3B, sequential avatar loads would add seconds to initial render. The leaderboard must be usable before avatars arrive.

**Implementation:**
```javascript
function createAvatarElement(login, avatarUrl) {
  // 1. Create wrapper — always renders immediately
  const wrapper = document.createElement('div');
  wrapper.className = 'leaderboard-avatar';
  wrapper.setAttribute('aria-label', login);
  
  // 2. SVG initials fallback — synchronous, no network
  const initials = login.slice(0, 2).toUpperCase();
  wrapper.innerHTML = `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="var(--color-border-strong)"/>
    <text x="20" y="25" text-anchor="middle" fill="var(--color-fg-muted)" 
          font-size="14" font-family="var(--fontStack-monospace)">${initials}</text>
  </svg>`;
  
  // 3. Real avatar — loads asynchronously
  const img = new Image();
  img.onload = () => { wrapper.innerHTML = ''; wrapper.appendChild(img); };
  img.onerror = () => { /* SVG fallback stays */ };
  img.src = avatarUrl;
  img.alt = login;
  img.loading = 'lazy';
  
  return wrapper;
}
```

**GitHub avatar URL pattern:** `https://avatars.githubusercontent.com/u/{userId}?v=4&s=80` (80px serves 2× on retina if ever needed; 40px display size).

### Decision 8: Spatial Heatmap Sort

**Decision:** Alphabetical ascending sort on `repo.full_name` (e.g., `org/repo-name`). Sort is computed once when the repo list is fetched, stored in `_sortedRepos`, and reused for all subsequent heatmap renders.

**Rationale:** Alphabetical by full repo name clusters namespace siblings naturally (all `org/payments-*` repos will be adjacent), which directly satisfies the "incident spatial triage" journey. No other sort is needed for MVP.

```javascript
async _fetchOrgRepos() {
  // ... fetch all pages of org repos ...
  const repos = await this._paginateOrgRepos();
  this._sortedRepos = repos.sort((a, b) => a.full_name.localeCompare(b.full_name));
  return this._sortedRepos;
}
```

**Stability requirement:** `Array.prototype.sort()` is stable in V8/Chromium 84. No custom stability shim needed.

### Decision 9: Stale Data Architecture

**Decision:** Per-widget stale state, consistent with the existing persistent-alert pattern.

When a live fetch fails:
1. Return cached data (if available)
2. Inject a `(stale · Xm ago)` label in `--color-attention-fg` into the widget header
3. If no cached data exists, show an error state: widget header + centered error message inside widget
4. **Never show a blank widget.** A blank widget is worse than stale data.

**Stale age threshold:** Data is considered stale after 1.5× its TTL (7.5 minutes for 5-min TTL). At stale threshold, add visual indicator. At 3× TTL (15 minutes), change indicator to `--color-danger-fg` to signal significantly stale data.

---

## Implementation Patterns & Consistency Rules

### File and Class Naming

| Artifact | Name | Pattern |
|----------|------|---------|
| Source file | `src/js/org-stats.js` | kebab-case .js |
| Source CSS | `src/css/org-stats.css` | kebab-case .css |
| Main class | `OrgStatsController` | PascalCase class |
| Export | `export class OrgStatsController` | Named export |
| Import in main.js | `import { OrgStatsController } from './org-stats.js'` | Named import with .js |
| HTML page id | `data-page="orgstats"` | lowercase no-dash (matches existing pages: "blog", "changelog", "status") |
| HTML widget ids | `id="org-heartbeat"`, `id="pipeline-heatmap"`, `id="commit-leaderboard"`, `id="pr-ticker"` | kebab-case |

### CSS Class Naming Convention

All new CSS classes use **BEM-influenced namespacing** to prevent collisions with existing classes:

```
.org-heartbeat-bar          // Widget container
.org-heartbeat-bar__stat    // Heartbeat stat cell
.org-heartbeat-bar__label   // Stat label
.org-heartbeat-bar__value   // Stat value

.pipeline-heatmap-widget    // Widget container
.heatmap-grid               // Grid container
.heatmap-cell               // Base cell
.heatmap-cell--passing      // State modifier
.heatmap-cell--failing      // State modifier
.heatmap-cell--running      // State modifier
.heatmap-cell--no-ci        // State modifier
.heatmap-header             // Widget title row
.heatmap-legend             // Legend row

.leaderboard-widget         // Widget container
.leaderboard-row            // Per-contributor row
.leaderboard-rank           // Rank number
.leaderboard-avatar         // Avatar circle wrapper
.leaderboard-name           // Contributor name
.leaderboard-bar-wrap       // Bar container
.leaderboard-bar            // Proportional bar fill
.leaderboard-count          // Commit count number

.pr-ticker-bar              // Full-width outer container
.pr-ticker-track            // Scrolling inner track (animates)
.pr-ticker-item             // Single merged PR item
.pr-ticker-item__author     // Author span
.pr-ticker-item__title      // PR title span
.pr-ticker-item__repo       // Repo name span
.pr-ticker-separator        // · separator between items

.widget-skeleton            // Skeleton loading state (shared utility)
.widget-stale-badge         // Stale data indicator (shared utility)
```

**Forbidden:** Naming any new class without an `org-`, `heatmap-`, `leaderboard-`, or `pr-ticker-` prefix (to prevent collision with existing global classes).

### API Response Handling Pattern

All GitHub API calls follow this pattern — **never deviate**:

```javascript
async _requestWithPAT(url) {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${this._pat}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'github-latest-dashboard/1.0',  // Required by GitHub API
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  
  if (response.status === 202) {
    // GitHub is computing stats asynchronously — return null (caller uses cache)
    return null;
  }
  if (response.status === 403) {
    const remaining = response.headers.get('x-ratelimit-remaining');
    if (remaining === '0') {
      const reset = response.headers.get('x-ratelimit-reset');
      console.warn(`[OrgStats] Rate limit hit. Resets at ${new Date(reset * 1000)}`);
      // Do NOT throw — return null so caller uses cache
      return null;
    }
  }
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${url}`);
  }
  
  return response.json();
}
```

**Critical rules:**
1. Always include `User-Agent` header — GitHub blocks requests without it
2. Always include `X-GitHub-Api-Version` header — future-proofs against API changes
3. Never throw on 202 or rate limit — return null and use cached data
4. Never retry on 403/rate limit — wait for next scheduled refresh cycle
5. Retry logic (3 attempts, 1s/2s/4s) applies to 5xx and network errors only

### Data Shape Contracts

All internal data structures have defined shapes. These shapes are the contract between `_fetch*` methods and `_render*` methods. Do not add fields beyond this contract without updating both sides.

**`_sortedRepos` (computed once from org repos fetch):**
```javascript
[{
  name: string,          // Short name: "my-repo"
  full_name: string,     // "org/my-repo"
  pushed_at: string,     // ISO timestamp of last push
  language: string|null  // Primary language
}]
```

**Pipeline status map (keyed by `full_name`):**
```javascript
{
  "org/my-repo": {
    status: 'passing' | 'failing' | 'running' | 'no-ci',
    conclusion: string|null,  // 'success', 'failure', 'cancelled', etc.
    runCount7d: number,        // Total runs in last 7 days
    failCount7d: number        // Failures in last 7 days
  }
}
```

**Contributors array (aggregated across all repos):**
```javascript
[{
  login: string,          // GitHub username
  avatarUrl: string,      // GitHub avatar URL
  totalCommits: number    // Commits across all repos in last 7 days
}]
// Sorted by totalCommits descending, top 10 only
```

**Merged PRs array (last 24 hours, up to 50 items):**
```javascript
[{
  title: string,          // PR title (truncated to 60 chars)
  author: string,         // Author login
  repoName: string,       // Short repo name (no org prefix)
  mergedAt: string,       // ISO timestamp
  minutesAgo: number      // Computed at render time
}]
// Sorted by mergedAt descending
```

**Heartbeat summary object:**
```javascript
{
  totalCommits: number,
  prsOpened: number,
  prsMerged: number,
  pipelineRuns: number,
  pipelineFailures: number,
  windowDays: 7
}
```

### Number Formatting Rules

All number formatting in org stats follows these rules (consistent with UX spec):

```javascript
// src/js/org-stats.js (internal helper)
function formatStatNumber(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function formatTimeAgo(isoTimestamp) {
  const diffMs = Date.now() - new Date(isoTimestamp).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
```

**Forbidden:** `Intl.NumberFormat` with locale-specific separators (`1,247`) — commas are too many characters at 48px display size. Always use `formatStatNumber()`.

### Timer Cleanup Pattern (Mandatory)

Every timer in `OrgStatsController` must follow the null-guard cleanup pattern from the base architecture:

```javascript
// Starting a timer
this._refreshTimer = setInterval(() => this.refresh(), 5 * 60 * 1000);

// Stopping (in destroy())
if (this._refreshTimer) {
  clearInterval(this._refreshTimer);
  this._refreshTimer = null;
}
```

**No exceptions.** A leaked interval timer that runs for 24+ hours will call GitHub API unnecessarily and may exhaust the PAT rate limit.

### Widget Render Contract

All `_render*` methods must:
1. Accept a single data argument (the typed data shape above)
2. Get their container via `document.getElementById('...')` (not stored as instance variable — avoids stale DOM references across page re-mounts)
3. Use `innerHTML` for initial render (faster for full widget population)
4. Use targeted DOM updates for ticker-only refresh (avoid full innerHTML rebuild that interrupts animation)
5. Never throw — wrap in try/catch and show error state

```javascript
_renderHeatmap(pipelineMap) {
  const container = document.getElementById('pipeline-heatmap');
  if (!container) return; // Page not in DOM yet — skip silently
  
  try {
    // ... render logic ...
  } catch (err) {
    console.error('[OrgStats] Heatmap render error:', err);
    container.innerHTML = `<div class="widget-error">Pipeline data unavailable</div>`;
  }
}
```

### CSS Design Token Discipline

All org-stats CSS uses only tokens already defined in `src/css/main.css`. New CSS files cannot introduce new custom property definitions.

**Page accent color:** `var(--color-danger-alt)` (#f85149 in dark theme) — confirmed to exist in `src/css/main.css` line 29. Use for: page header "ORG STATS" text color, widget header accent text.

**Status colors for heatmap cells — exact values:**
```css
/* passing */
.heatmap-cell--passing {
  background-color: rgba(45, 164, 78, 0.3);
  color: #3fb950;                              /* --color-success-emphasis tint */
  border: 1px solid rgba(45, 164, 78, 0.4);
}
/* failing */
.heatmap-cell--failing {
  background-color: rgba(207, 34, 46, 0.4);
  color: #f85149;                              /* --color-danger-alt */
  border: 1px solid rgba(207, 34, 46, 0.5);
}
/* running */
.heatmap-cell--running {
  background-color: rgba(191, 135, 0, 0.25);
  color: #d29922;                              /* --color-attention-muted tint */
  border: 1px solid rgba(191, 135, 0, 0.35);
}
/* no-ci */
.heatmap-cell--no-ci {
  background-color: rgba(48, 54, 61, 0.5);    /* --color-border-strong tinted */
  color: #7d8590;                              /* --color-fg-muted */
  border: 1px solid transparent;
}
```

**These exact RGBA values are mandated** — do not substitute with var() tokens for the cell background/border because the tinted transparency is intentional and not directly available as a token.

---

## Project Structure

### New Files

```
src/
├── js/
│   ├── org-stats.js          ← NEW: OrgStatsController class
│   │                            Data fetching + widget rendering
│   │                            ~600-800 LOC estimated
│   └── [existing files...]
└── css/
    ├── org-stats.css         ← NEW: Org stats page layout + widget styles
    │                            ~200-300 LOC estimated
    └── [existing files...]

public/
├── secrets.json              ← NEW: GITIGNORED — contains actual PAT
├── secrets.json.example      ← NEW: COMMITTED — template with placeholders
└── config.json               ← MODIFIED: Add orgstats page config
```

### Modified Files

**`public/config.json`** — Add org stats configuration:
```json
{
  "githubOrg": "your-org-name",

  "pages": ["vscode", "visualstudio", "blog", "changelog", "status", "anthropic", "orgstats"],

  "pageIntervals": {
    "default": 30000,
    "blog": 80000,
    "changelog": 80000,
    "vscode": 80000,
    "visualstudio": 80000,
    "anthropic": 80000,
    "orgstats": 30000
  },

  "itemIntervals": {
    "default": 5333,
    "orgstats": 0
  },

  "refreshIntervals": {
    "orgstats": 300000
  },

  "orgStats": {
    "lookbackDays": 7,
    "topContributorCount": 10,
    "tickerPollIntervalMs": 120000,
    "requestBatchSize": 10,
    "requestBatchDelayMs": 100,
    "activeRepoCountForTicker": 30
  }
}
```

**`public/secrets.json.example`** (new committed file):
```json
{
  "_comment": "Copy this file to secrets.json and add your GitHub PAT. DO NOT commit secrets.json.",
  "githubPat": "ghp_YOUR_PERSONAL_ACCESS_TOKEN_HERE"
}
```

**`.gitignore`** — Add entry:
```
public/secrets.json
```

**`src/index.html`** — Add new page section after existing carousel pages:
```html
<!-- Org Stats Page -->
<div class="carousel-page" data-page="orgstats">
  <div class="page-header">
    <h2 class="page-title" style="color: var(--color-danger-alt);">ORG STATS</h2>
  </div>
  <div class="org-heartbeat-bar" id="org-heartbeat">
    <!-- Populated by OrgStatsController._renderHeartbeat() -->
  </div>
  <div class="org-main-content">
    <div class="pipeline-heatmap-widget" id="pipeline-heatmap">
      <!-- Populated by OrgStatsController._renderHeatmap() -->
    </div>
    <div class="leaderboard-widget" id="commit-leaderboard">
      <!-- Populated by OrgStatsController._renderLeaderboard() -->
    </div>
  </div>
  <div class="pr-ticker-bar" id="pr-ticker">
    <!-- Populated by OrgStatsController._renderTicker() -->
  </div>
</div>
```

**`src/js/main.js`** — Add OrgStatsController integration:
```javascript
import { OrgStatsController } from './org-stats.js';

// In initializeWithConfig():
const orgStatsConfig = {
  pat: secrets.githubPat,
  org: config.githubOrg,
  lookbackDays: config.orgStats?.lookbackDays ?? 7,
  topContributorCount: config.orgStats?.topContributorCount ?? 10,
  tickerPollIntervalMs: config.orgStats?.tickerPollIntervalMs ?? 120000,
  requestBatchSize: config.orgStats?.requestBatchSize ?? 10,
  requestBatchDelayMs: config.orgStats?.requestBatchDelayMs ?? 100,
  activeRepoCountForTicker: config.orgStats?.activeRepoCountForTicker ?? 30
};
const orgStatsController = new OrgStatsController(orgStatsConfig);

// Wire to carousel page change events
carousel.onPageChange = (page) => {
  if (page === 'orgstats') {
    orgStatsController.init().catch(console.error); // No-op if already initialized
    orgStatsController.startTickerPolling();
  } else {
    orgStatsController.stopTickerPolling();
  }
  itemHighlighter.reset();
};

// Register for cleanup
window.addEventListener('beforeunload', () => orgStatsController.destroy());
```

### config-loader.js Extension

A new `loadSecrets()` function must be added to `config-loader.js`:

```javascript
// src/js/config-loader.js — new addition
export async function loadSecrets() {
  try {
    const response = await fetch('/secrets.json');
    if (!response.ok) return {}; // Missing secrets.json = no PAT = org stats disabled
    return response.json();
  } catch {
    return {}; // Network error = no PAT
  }
}
```

The `initializeWithConfig()` in main.js calls both `loadConfig()` and `loadSecrets()` in parallel:
```javascript
const [config, secrets] = await Promise.all([loadConfig(), loadSecrets()]);
```

**If `secrets.githubPat` is falsy:** `OrgStatsController` skips all API calls and renders a configuration error: "Org Stats requires a GitHub PAT. See `public/secrets.json.example`."

### CSS File Structure for `src/css/org-stats.css`

```css
/* === ORG STATS PAGE LAYOUT === */
/* .carousel-page[data-page="orgstats"] layout zones */
.carousel-page[data-page="orgstats"] { ... }
.org-main-content { ... }           /* flex row: heatmap 60% + leaderboard 40% */

/* === ORG HEARTBEAT BAR === */
.org-heartbeat-bar { ... }          /* full-width row, 96px height */
.org-heartbeat-bar__stat { ... }    /* each of 4 stat cells */
.org-heartbeat-bar__value { ... }   /* 48px number */
.org-heartbeat-bar__label { ... }   /* 12px muted uppercase label */
.org-heartbeat-bar__failures { ... }/* failure sub-count in danger-fg */

/* === PIPELINE HEATMAP === */
.pipeline-heatmap-widget { ... }    /* 60% width, full main-content height */
.heatmap-header { ... }
.heatmap-grid { ... }               /* CSS Grid auto-fill minmax(90px, 1fr) */
.heatmap-cell { ... }               /* base cell */
.heatmap-cell--passing { ... }
.heatmap-cell--failing { ... }
.heatmap-cell--running { ... }
.heatmap-cell--no-ci { ... }
.heatmap-legend { ... }

/* === COMMIT LEADERBOARD === */
.leaderboard-widget { ... }         /* 40% width */
.leaderboard-row { ... }
.leaderboard-rank { ... }
.leaderboard-avatar { ... }         /* 40px circle */
.leaderboard-name { ... }
.leaderboard-bar-wrap { ... }
.leaderboard-bar { ... }
.leaderboard-count { ... }

/* === PR TICKER === */
.pr-ticker-bar { ... }              /* full-width, 52px height */
.pr-ticker-track { ... }            /* animating inner track */
.pr-ticker-item { ... }
.pr-ticker-item__author { ... }     /* color-accent-fg */
.pr-ticker-item__title { ... }
.pr-ticker-item__repo { ... }       /* color-fg-muted */
.pr-ticker-separator { ... }

/* === SHARED WIDGET UTILITIES === */
.widget-skeleton { ... }
.widget-stale-badge { ... }
.widget-error { ... }

/* === WEBKIT PREFIXES (Chromium 84 compat) === */
/* All -webkit- prefixed versions of any new CSS features used above */
```

### Component Interaction Diagram

```
main.js
  ├── loadConfig()           → public/config.json
  ├── loadSecrets()          → public/secrets.json
  ├── CarouselController     → controls page rotation
  │   └── onPageChange       → callback to main.js
  └── OrgStatsController     → org stats lifecycle
      ├── _refreshTimer      → full 5-min data refresh
      ├── _tickerTimer       → 2-min PR ticker refresh
      ├── Widget: Heartbeat  → #org-heartbeat
      ├── Widget: Heatmap    → #pipeline-heatmap
      ├── Widget: Leaderboard→ #commit-leaderboard
      └── Widget: Ticker     → #pr-ticker

GitHub REST API (external)
  ← OrgStatsController._requestWithPAT()
  ← PAT from secrets.json (never in source)
  Endpoints used:
    GET /orgs/{org}/repos                           (repo list)
    GET /repos/{org}/{repo}/actions/runs?per_page=1 (pipeline status)
    GET /repos/{org}/{repo}/stats/contributors      (commit data)
    GET /repos/{org}/{repo}/pulls?state=closed      (PR merge data)
```

---

## Architecture Validation

### FR Coverage

| FR | Covered By | Status |
|----|-----------|--------|
| FR1 — pipeline fetch + heatmap display | `_fetchPipelineStatuses()` + `_renderHeatmap()` | ✅ |
| FR2 — spatial consistency | `_sortedRepos` computed once, reused every render | ✅ |
| FR3 — pipeline counts | `pipelineRuns` + `pipelineFailures` in heartbeat summary | ✅ |
| FR4 — no-CI state | `status: 'no-ci'` data state + `.heatmap-cell--no-ci` CSS | ✅ |
| FR5 — total commit count | Aggregated from `stats/contributors` across all repos | ✅ |
| FR6 — top-10 contributors with avatars | `_fetchCommitContributors()` + `_renderLeaderboard()` | ✅ |
| FR10 — PRs opened + merged headline | Derived from PR fetches, rendered in heartbeat bar | ✅ |
| FR11 — live ticker | `_renderTicker()` with CSS animation | ✅ |
| FR12 — ≤2-min ticker poll | `_tickerTimer` at 2-min interval | ✅ |
| FR17 — PAT auth | `secrets.json` + `_requestWithPAT()` | ✅ |
| FR18 — 5-min TTL cache | `_cache` object with timestamps | ✅ |
| FR19 — stale indicator | `.widget-stale-badge` with age display | ✅ |
| FR20 — rate limit compliance | Batch strategy ~4,524 req/hr (90.5% of 5,000 budget) | ✅ |
| FR21 — carousel page registration | `data-page="orgstats"` + config.json pages array | ✅ |
| FR22 — single viewport | 1920×1080 layout validated in UX spec | ✅ |
| FR23 — background refresh, no disruption | `_refreshTimer` independent of carousel | ✅ |

### NFR Coverage

| NFR | Coverage | Status |
|-----|----------|--------|
| NFR-PERF (3s render on Pi) | Skeleton-first + parallel batch fetching | ✅ |
| NFR-MEM (no leaks 24h) | `_refreshTimer`/`_tickerTimer` nulled in `destroy()` | ✅ |
| NFR-COMPAT (Chromium 84) | ES2020 only; -webkit- prefixes in CSS | ✅ |
| NFR-RATE (≤5,000 req/hr) | Budgeted at ~4,524 req/hr | ✅ |
| NFR-DEGRADE (no blank on API fail) | Stale cache fallback + stale badge | ✅ |
| NFR-SEC (PAT security) | `secrets.json` gitignored; read-only PAT scopes | ✅ |
| NFR-ANIM (≥30fps ticker on Pi) | CSS `@keyframes` translate (GPU-accelerated) | ✅ |

### Potential Risk Areas

**Risk 1: `stats/contributors` API latency (202 responses)**
The GitHub Contributors Stats endpoint is computed asynchronously and commonly returns 202 on first call. The architecture handles this: return null, retry once after 3 seconds, fall back to cache if still 202. Implementation must not spin-retry — one retry only per refresh cycle.

**Risk 2: Ticker animation on Pi 3B**
CSS `transform: translateX` is GPU-accelerated and generally safe on Pi 3B. However, if the ticker track is very long (50+ items × long strings), the composite layer may be large. Mitigate by: capping ticker at 20 most recent merges (not all 24h merges) and truncating PR titles to 60 characters.

**Risk 3: Large org repos list (>100 repos)**
If the org grows beyond 100 repos, the single-page `GET /orgs/{org}/repos?per_page=100` call won't return all repos. The `_fetchOrgRepos()` implementation must paginate (follow `Link` header `rel="next"`). The 30-minute repo list cache prevents this from being a rate limit concern.

**Risk 4: Rate limit exhaustion during incident**
During a real incident, many pipelines may be failing, causing re-fetches to happen more frequently if a manual refresh feature is ever added. For MVP (no manual refresh), the fixed 5-minute timer prevents this. Document: do not add manual refresh without re-evaluating the rate limit budget.

**Risk 5: PAT expiration**
GitHub PATs expire. When the PAT expires, all API calls will return 401. The `_requestWithPAT()` method should handle 401 by rendering a configuration error state (not a generic error): "GitHub PAT has expired. Update secrets.json."

### Implementation Readiness Checklist

- [x] All FRs have a corresponding architectural component
- [x] All NFRs have architectural mitigations
- [x] Rate limit budget calculated with headroom
- [x] Security requirement (PAT storage) fully specified
- [x] Timer cleanup pattern specified for all new timers
- [x] Data shape contracts defined for all widget→render boundaries
- [x] CSS class naming convention specified to prevent collisions
- [x] HTML structure specified for `src/index.html`
- [x] `main.js` integration pattern specified
- [x] `config-loader.js` extension specified
- [x] `config.json` diff specified (additive only)
- [x] `.gitignore` modification specified
- [x] Two-tier refresh cadence resolved

---

## Implementation Guidance for AI Agents

When implementing the org stats feature, follow these rules in addition to the project-context.md rules:

### ✅ DO

1. Create `src/js/org-stats.js` as a **single class `OrgStatsController`** with private `_` prefixed methods for data and render logic
2. Create `src/css/org-stats.css` and import it in `src/index.html` (as `<link>` or as Vite import in main.js — follow existing pattern)
3. Use `Promise.allSettled()` (not `Promise.all()`) for batch API calls — individual failures must not abort the whole widget set
4. Sort repos by `full_name` alphabetically **once** and reuse `_sortedRepos` across all renders
5. Calculate ticker animation duration dynamically based on content width
6. Render SVG initials avatars synchronously; load real avatars asynchronously with `img.onload`
7. Include `User-Agent` and `X-GitHub-Api-Version` headers on every GitHub API request
8. Handle 202 responses from `stats/contributors` gracefully (one retry, then use cache)
9. Add `public/secrets.json` to `.gitignore` before any other work
10. Cap merged PR ticker at 20 items maximum to keep animation track length manageable

### ❌ DO NOT

1. Edit `/index.html` (root) directly — edit `src/index.html` only, then run `npm run build`
2. Hardcode any color values — use CSS tokens from `src/css/main.css`
3. Use `Intl.NumberFormat` with locale separators for stat display numbers
4. Use `Promise.all()` for multi-repo API batches — one failure would abort all
5. Run ticker refresh at less than 2-minute intervals — rate limit budget has no room
6. Re-sort repos between heartbeat/heatmap/leaderboard renders — sort once in `_fetchOrgRepos()`
7. Store GitHub PAT in any source file, config.json, or committed file
8. Add `console.log()` debug statements without `[OrgStats]` prefix
9. Use `setInterval` for the ticker poll timer without registering its cleanup in `destroy()`
10. Render ticker using `innerHTML` rebuild while animation is running — pause animation first

---

## Completion Summary

The architecture for the GitHub Org Activity Dashboard Page (MVP Phase 1) is complete. The design achieves:

**Operational integrity:** Pipeline heatmap is the dominant visual signal. Alphabetical spatial stability makes the heatmap a learnable mental map over days. Rate limit budget at 90.5% of allowance provides room for normal variance.

**Social energy:** Commit leaderboard with progressive avatar loading is immediately recognizable. PR ticker uses proven CSS animation pattern for smooth, Pi-safe scrolling.

**Security discipline:** PAT stored in gitignored `secrets.json`, never in source. Read-only PAT scopes enforced by documentation.

**Zero disruption to existing dashboard:** All changes are additive. Existing pages, carousels, and API fetching for blog/changelog/status are unmodified.

**AI agent consistency:** Explicit data shape contracts, CSS class naming rules, and a single well-bounded module (`org-stats.js`) ensure multiple agents implementing different widgets will produce interoperable code.

**Next step:** Use `bmad-create-epics-and-stories` skill or `bmad-create-story` skill to break the org stats feature into implementable stories, using this architecture document as the technical specification.
