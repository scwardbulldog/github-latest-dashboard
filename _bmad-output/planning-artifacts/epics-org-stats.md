---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - '_bmad-output/planning-artifacts/prd-org-stats.md'
  - '_bmad-output/planning-artifacts/architecture-org-stats.md'
  - '_bmad-output/planning-artifacts/ux-design-specification-org-stats.md'
project_name: 'github-latest-dashboard'
user_name: 'Shane'
date: '2026-05-13'
workflowType: 'epics-and-stories'
workflowStatus: 'complete'
featureScope: 'org-stats carousel page (MVP — Phase 1)'
requirementsExtracted: true
functionalRequirements: 17
nonFunctionalRequirements: 7
uxDesignRequirements: 8
epicsApproved: true
totalEpics: 3
storiesCompleted: true
totalStories: 11
storyCounts:
  epic1: 4
  epic2: 4
  epic3: 3
validationStatus: 'passed'
completedAt: '2026-05-13'
---

# github-latest-dashboard — Org Stats Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for the **Org Stats carousel page** feature of github-latest-dashboard, decomposing the requirements from the PRD, Architecture, and UX Design documents into implementable stories.

**Feature Context:** Brownfield extension — new carousel page slot in the existing deployed dashboard. All base platform infrastructure (Vite, CarouselController, api-client, design tokens, deployment pipeline) is already operational.

## Requirements Inventory

### Functional Requirements

FR1: The system can fetch the latest CI/CD run status (pass/fail/pending) for each repo from GitHub Actions and display it as a color-coded cell in a grid.
FR2: The system can display the heatmap grid with spatial consistency — each repo occupies the same cell position across refresh cycles.
FR3: The system can display pipeline counts (total runs, total failures) for the org over the trailing 7 days as numeric indicators.
FR4: The system can visually distinguish a repo with no CI pipeline configured from one with a passing or failing pipeline.
FR5: The system can display total commit count across all org repos for the trailing 7 days as a bold headline number.
FR6: The system can display the top-10 contributors by commit count for the trailing 7 days with avatar image, display name, and commit count.
FR10: The system can display total PRs opened and total PRs merged across all org repos for the trailing 7 days as numeric indicators.
FR11: The system can display a live ticker of PRs merged within the trailing 24 hours, showing repo name, PR title, and author name/avatar.
FR12: The system can poll for new merged PRs at a short interval (≤2 minutes) to keep the ticker near real-time.
FR17: The system can authenticate with the GitHub REST API using a PAT loaded from a runtime configuration file.
FR18: The system can cache each data type with a 5-minute TTL and serve cached data on subsequent renders within that window.
FR19: The system can display stale cached data with a visual staleness indicator when a live fetch fails, rather than showing a blank widget.
FR20: The system can complete the full data fetch cycle for ~100 repos within the 5-minute refresh window without hitting GitHub's authenticated rate limit (5,000 req/hr).
FR21: The org stats page renders as a registered carousel page slot within the existing 30-second rotation managed by the carousel component.
FR22: All active widgets display within a single 1920×1080 viewport without scrolling.
FR23: All widget data refreshes on a 5-minute background cycle without triggering a full page reload or carousel disruption.

### Non-Functional Requirements

NFR-PERF: All widgets must complete rendering within 3 seconds of data availability on Raspberry Pi 3B.
NFR-MEM: Memory usage must not grow over a 24-hour continuous run; all timers must have cleanup methods.
NFR-COMPAT: ES2020 only; -webkit- prefixes for all new CSS features; no features beyond Chromium 84 support.
NFR-RATE: Total GitHub API calls across all 5-minute cycles ≤ 5,000 req/hr.
NFR-DEGRADE: If GitHub API is unreachable, stale cached data displays with age indicator; no blank state.
NFR-SEC: PAT stored in gitignored file; read-only scopes; never in source code or committed files.
NFR-ANIM: Ticker CSS animation maintains ≥30fps on Pi 3B; no JS RAF-driven animations.

### Additional Requirements (Architecture)

AR1: Single `src/js/org-stats.js` module with OrgStatsController class — private `_fetch*` methods for data, `_render*` methods for display.
AR2: Separate `public/secrets.json` (gitignored) for PAT storage — `config.json` remains committed with non-sensitive config.
AR3: `loadSecrets()` function added to config-loader.js, called in parallel with `loadConfig()`.
AR4: Batch requests in groups of 10 with 100ms delay between batches to avoid GitHub secondary rate limiter.
AR5: Two-tier refresh cadence: 5-minute full data refresh + 2-minute ticker-only refresh (top 30 recently active repos).
AR6: Incremental rendering: skeleton placeholders first (synchronous), then widgets populate as data arrives (asynchronous).
AR7: Alphabetical sort on `repo.full_name` computed once, stored in `_sortedRepos`, reused for all renders.
AR8: Per-widget stale state: `(stale · Xm ago)` badge in `--color-attention-fg` on widget header when fetch fails.
AR9: Avatar loading: synchronous SVG initials fallback + lazy progressive enhancement with real avatar images.

### UX Design Requirements

UX-DR1: Org Heartbeat Numbers bar — 4 stat boxes in full-width 96px row (commits, PRs opened, PRs merged, pipelines run/failed). 48px stat numbers, 12px muted uppercase labels, vertical dividers.
UX-DR2: Pipeline Heatmap — CSS Grid `auto-fill minmax(90px, 1fr)`, 4px gap. Cell states: passing (green bg), failing (red bg), running (yellow bg), no-ci (gray bg). 10px monospace repo name labels. Legend row with 4 color dots.
UX-DR3: Commit Leaderboard — ranked rows with 40px avatar circles, 16px name, proportional green commit bar, 20px count number. Top 3 rank numbers in `--color-accent-fg`.
UX-DR4: PR Merge Celebration Ticker — full-width 52px bar, CSS @keyframes horizontal translateX for seamless loop. Item format: "🎉 {author} merged '{title}' → {repo} · {time_ago}". 16px text, elevated background.
UX-DR5: Widget skeleton loading states with shimmer animation (degrade to static on Pi). Smooth 200ms opacity transition to populated state.
UX-DR6: Page layout grid: heartbeat row (96px) + main content zone (712px: heatmap 60% / leaderboard 40%) + ticker bar (52px).
UX-DR7: Page accent color: `--color-danger-alt` (#f85149) for "ORG STATS" header text.
UX-DR8: All CSS classes use BEM-influenced namespacing with widget-prefixed names to prevent collisions.

### FR Coverage Map

FR1: Epic 2 — Pipeline heatmap fetch and render
FR2: Epic 2 — Alphabetical sort spatial stability
FR3: Epic 2 — Pipeline counts in heartbeat bar (requires pipeline data)
FR4: Epic 2 — No-CI cell state in heatmap
FR5: Epic 1 — Total commit count headline number in heartbeat bar
FR6: Epic 3 — Commit leaderboard widget
FR10: Epic 1 — PRs opened/merged headline numbers in heartbeat bar
FR11: Epic 3 — PR merge celebration ticker
FR12: Epic 3 — Ticker 2-minute polling
FR17: Epic 1 — PAT authentication via secrets.json
FR18: Epic 1 — 5-minute TTL cache
FR19: Epic 1 — Stale data indicator pattern
FR20: Epic 1 — Batch request strategy + rate limit compliance
FR21: Epic 1 — Carousel page registration
FR22: Epic 1 — Single viewport layout
FR23: Epic 1 — Background refresh without carousel disruption

## Epic List

### Epic 1: Org Stats Page Foundation & Heartbeat Numbers
Delivers a functioning new carousel page with org-wide velocity stats (total commits, PRs opened/merged, pipeline run counts). Proves end-to-end: PAT authentication, secrets handling, repo list fetching, rate-limited batch requests, caching, carousel registration, and heartbeat number rendering.
**FRs covered:** FR5, FR10, FR17, FR18, FR19, FR20, FR21, FR22, FR23

### Epic 2: Pipeline Health Heatmap
Delivers the page's primary operational signal: a color-coded spatial grid showing CI/CD status for all ~100 org repos. Developers can assess org-wide pipeline health in 2 seconds by reading the color pattern.
**FRs covered:** FR1, FR2, FR3, FR4

### Epic 3: Contributor Recognition & Live Feed
Delivers the social/recognition dimension: top-10 commit leaderboard with avatars and the PR merge celebration ticker with 2-minute near-real-time polling. Completes the "Who shipped something today?" signal.
**FRs covered:** FR6, FR11, FR12

---

## Epic 1: Org Stats Page Foundation & Heartbeat Numbers

Deliver a new carousel page slot that registers in the rotation, authenticates with the GitHub REST API via PAT, fetches the org repo list with rate-limited batching, caches data with 5-minute TTL, and renders the Org Heartbeat Numbers bar showing commits, PRs, and pipeline counts as headline stats.

### Story 1.1: Secrets Infrastructure & Carousel Page Shell

As a developer viewing the TV dashboard,
I want the org stats page to appear in the carousel rotation,
So that the page slot exists and is ready for widget content.

**Acceptance Criteria:**

**Given** the dashboard is running with `orgstats` in the `pages` config array
**When** the carousel rotates to the org stats page
**Then** a page with the header "ORG STATS" (in `--color-danger-alt` color) is displayed
**And** the page contains empty widget containers (heartbeat, heatmap, leaderboard, ticker) at their correct layout positions

**Given** `public/secrets.json` exists with a valid `githubPat` value
**When** the application initializes
**Then** `loadSecrets()` in config-loader.js fetches and parses secrets.json
**And** the PAT is available to OrgStatsController without being present in any committed file

**Given** `public/secrets.json` does NOT exist or is malformed
**When** the application initializes
**Then** `loadSecrets()` returns an empty object without throwing
**And** OrgStatsController renders a configuration error state: "Org Stats requires a GitHub PAT. See secrets.json.example"

**Given** the developer checks git status
**When** `public/secrets.json` is created locally
**Then** it is excluded by `.gitignore` and never committed

**Technical notes:**
- Create `public/secrets.json.example` (committed) with placeholder
- Add `public/secrets.json` to `.gitignore`
- Add `loadSecrets()` to `src/js/config-loader.js`
- Add `orgstats` to `config.json` pages array + pageIntervals + itemIntervals + orgStats config block
- Add org stats HTML structure to `src/index.html` with `data-page="orgstats"`
- Create `src/css/org-stats.css` with page layout zones (heartbeat 96px, main content 60%/40% split, ticker 52px)
- Create `src/js/org-stats.js` with OrgStatsController class shell (constructor, init, destroy, start/stop ticker stubs)
- Import and wire OrgStatsController in `src/js/main.js` on carousel page change

### Story 1.2: Org Repo List Fetch & Rate-Limited Batch Infrastructure

As a developer viewing the TV dashboard,
I want the org stats page to fetch the complete list of org repositories,
So that all downstream widgets have a stable, sorted repo list to work from.

**Acceptance Criteria:**

**Given** OrgStatsController initializes with a valid PAT and org name
**When** `init()` is called for the first time
**Then** it fetches all org repos via `GET /orgs/{org}/repos` (paginated if >100 repos)
**And** all requests include `Authorization: Bearer {pat}`, `User-Agent: github-latest-dashboard/1.0`, `Accept: application/vnd.github+json`, and `X-GitHub-Api-Version: 2022-11-28` headers

**Given** the org has repos
**When** the repo list fetch completes
**Then** repos are sorted alphabetically by `full_name` and stored in `_sortedRepos`
**And** the sort runs once and is reused across all subsequent widget renders within the refresh cycle

**Given** the repo list was fetched within the last 30 minutes
**When** a 5-minute refresh cycle fires
**Then** the cached repo list is reused (not re-fetched)

**Given** the batch request helper `_batchRequests(items, requestFn, batchSize, delayMs)`
**When** called with 100 items at batchSize=10, delayMs=100
**Then** it processes 10 parallel requests per batch with 100ms pause between batches
**And** uses `Promise.allSettled()` so individual failures don't abort the batch

**Given** the GitHub API returns a 403 with `x-ratelimit-remaining: 0`
**When** `_requestWithPAT()` processes the response
**Then** it returns null (not throws) and logs a warning with the reset timestamp
**And** the calling widget uses cached data

**Technical notes:**
- Implement `_requestWithPAT(url)` with all required headers
- Implement `_batchRequests(items, requestFn, batchSize, delayMs)` with Promise.allSettled
- Implement `_fetchOrgRepos()` with pagination (follow `Link: rel="next"` header)
- Cache repo list with 30-minute TTL separately from widget data (5-minute TTL)
- Handle 202 responses (return null, retry once after 3s)
- Handle 401 (expired PAT) with configuration error state

### Story 1.3: Heartbeat Numbers Data Fetch & Rendering

As a developer walking past the TV,
I want to see org-wide velocity numbers (commits, PRs opened, PRs merged, pipeline runs/failures) at a glance,
So that I have instant ambient awareness of the team's weekly output.

**Acceptance Criteria:**

**Given** OrgStatsController has a valid sorted repo list
**When** the full data refresh executes
**Then** it fetches contributor stats via `GET /repos/{org}/{repo}/stats/contributors` for all repos (batched)
**And** it fetches closed PRs via `GET /repos/{org}/{repo}/pulls?state=closed` for all repos (batched)
**And** aggregates total commits, PRs opened, PRs merged, pipeline runs, and pipeline failures for the trailing 7-day window

**Given** heartbeat data is available
**When** `_renderHeartbeat(data)` is called
**Then** it renders 4 stat boxes in the `#org-heartbeat` container
**And** stat numbers use 48px weight-600 font, formatted with `formatStatNumber()` (e.g., `1.2k`)
**And** labels use 12px uppercase muted text
**And** pipeline failure count >0 renders in `--color-danger-fg`
**And** vertical 1px dividers separate each stat box

**Given** the heartbeat data fetch is in progress
**When** the page first becomes active
**Then** stat numbers show `--` in muted color (skeleton/loading state)

**Given** a fetch fails and cached data exists from a previous cycle
**When** the stale TTL threshold (7.5 minutes) is exceeded
**Then** a "(stale · Xm ago)" badge appears in `--color-attention-fg` on the heartbeat bar
**And** at 3× TTL (15 minutes), the badge changes to `--color-danger-fg`

**Technical notes:**
- Implement `_fetchCommitContributors(repos)` — aggregate weekly commits from stats/contributors endpoint
- PR data aggregation (PRs opened/merged) feeds both heartbeat and later ticker
- Implement `_renderHeartbeat(data)` with heartbeat summary data shape
- Implement `_renderStaleIndicator(widgetEl, ageMs)` utility (reused by all widgets)
- Implement `formatStatNumber(n)` helper

### Story 1.4: Background Refresh & Timer Lifecycle

As a developer viewing the dashboard for extended periods,
I want the org stats data to refresh every 5 minutes without disrupting the carousel,
So that the numbers stay current throughout the day.

**Acceptance Criteria:**

**Given** OrgStatsController has completed initial data fetch
**When** 5 minutes elapse
**Then** a background refresh cycle fires, re-fetching all widget data
**And** widgets update in-place without full page reload
**And** carousel rotation is not interrupted during refresh

**Given** OrgStatsController is active
**When** `destroy()` is called (page unload or cleanup)
**Then** `_refreshTimer` is cleared via `clearInterval()` and set to null
**And** no further API calls are made
**And** no memory leaks occur from orphaned timers

**Given** a 24-hour continuous run
**When** memory usage is measured hourly
**Then** no measurable memory growth occurs from OrgStatsController

**Given** the cached data for a widget type has expired (>5 min TTL)
**When** the refresh cycle cannot reach the GitHub API
**Then** the stale cached data continues to display with the stale badge
**And** the widget never shows a blank/empty state

**Technical notes:**
- Set up `_refreshTimer = setInterval(() => this.refresh(), 5 * 60 * 1000)` after first init
- `refresh()` re-fetches data types whose cache has expired
- Implement graceful degradation: try/catch around refresh, log errors, keep stale data
- Validate timer cleanup in `destroy()` — null-guard pattern on all timers

---

## Epic 2: Pipeline Health Heatmap

Deliver the page's dominant visual widget: a spatially-stable, color-coded grid showing CI/CD pipeline status for all ~100 org repos. Green = passing, red = failing, yellow = running, gray = no CI configured. The heatmap enables developers to assess pipeline health in 2 seconds by reading the color pattern.

### Story 2.1: Pipeline Status Data Fetch

As a developer viewing the org stats page,
I want the system to fetch the latest GitHub Actions run status for each repo,
So that the pipeline heatmap can display current CI/CD health.

**Acceptance Criteria:**

**Given** OrgStatsController has the sorted repo list
**When** the pipeline data fetch executes
**Then** it calls `GET /repos/{org}/{repo}/actions/runs?per_page=1` for each repo (batched, 10 at a time, 100ms delay)
**And** extracts the conclusion of the most recent workflow run

**Given** a repo has a most recent workflow run
**When** the run has `conclusion: 'success'`
**Then** the repo's pipeline status is recorded as `'passing'`

**Given** a repo's most recent run has `conclusion: 'failure'`
**When** the status is recorded
**Then** the repo's pipeline status is `'failing'`

**Given** a repo's most recent run has `status: 'in_progress'` or `status: 'queued'`
**When** the status is recorded
**Then** the repo's pipeline status is `'running'`

**Given** a repo has no workflow runs (empty `workflow_runs` array)
**When** the status is recorded
**Then** the repo's pipeline status is `'no-ci'`

**Given** the fetch for a specific repo fails (network error or 5xx)
**When** cached data exists for that repo
**Then** the cached status is used and the stale badge is applied to the heatmap widget

**Technical notes:**
- Implement `_fetchPipelineStatuses(repos)` returning a Map keyed by `full_name`
- Use `per_page=1` to minimize response size — only the latest run is needed
- Aggregate `runCount7d` and `failCount7d` by fetching with `created` filter if needed, or derive from available data
- Pipeline data feeds both heatmap cells AND heartbeat pipeline counts (FR3)
- Update heartbeat pipeline numbers when pipeline data arrives

### Story 2.2: Heatmap Grid Rendering

As a developer walking past the TV,
I want to see a color-coded grid of all org repos' pipeline statuses,
So that I can assess CI/CD health in 2 seconds by reading the color pattern from 15 feet away.

**Acceptance Criteria:**

**Given** pipeline status data is available for all repos
**When** `_renderHeatmap(pipelineMap)` is called
**Then** it renders a CSS Grid inside `#pipeline-heatmap` with `grid-template-columns: repeat(auto-fill, minmax(90px, 1fr))` and 4px gap
**And** each cell corresponds to one repo in alphabetical order (matching `_sortedRepos`)

**Given** a repo has `status: 'passing'`
**When** its cell renders
**Then** the cell has class `.heatmap-cell--passing` with green-tinted background `rgba(45, 164, 78, 0.3)`, text color `#3fb950`, border `rgba(45, 164, 78, 0.4)`

**Given** a repo has `status: 'failing'`
**When** its cell renders
**Then** the cell has class `.heatmap-cell--failing` with red-tinted background `rgba(207, 34, 46, 0.4)`, text color `#f85149`, border `rgba(207, 34, 46, 0.5)`

**Given** a repo has `status: 'running'`
**When** its cell renders
**Then** the cell has class `.heatmap-cell--running` with yellow-tinted background

**Given** a repo has `status: 'no-ci'`
**When** its cell renders
**Then** the cell has class `.heatmap-cell--no-ci` with neutral gray background

**Given** any cell
**When** rendered
**Then** it contains the short repo name (max 12 chars, clipped) in 10px monospace text

**Technical notes:**
- Grid uses CSS Grid auto-fill for responsive cell count within 60% width zone
- Cells are static colored blocks — no hover, no click, no animation
- Repo order is deterministic (alphabetical) ensuring spatial stability (FR2)

### Story 2.3: Heatmap Widget Header & Legend

As a developer viewing the pipeline heatmap,
I want to see summary pipeline stats and a color legend,
So that I can read aggregate counts and understand what each color means.

**Acceptance Criteria:**

**Given** pipeline data is available
**When** the heatmap widget renders
**Then** a widget header shows "PIPELINE HEALTH" in 14px uppercase with `--color-danger-alt` accent
**And** right-aligned summary text shows "{total runs} runs · {failures} failed · 7d" in `--color-fg-muted`

**Given** the heatmap grid is rendered
**When** looking below the grid
**Then** a legend row shows 4 colored dots (green: pass, red: fail, yellow: running, gray: no CI) with labels in 12px `--color-fg-muted`

**Given** pipeline fetch is in progress
**When** the heatmap area is visible
**Then** it shows a skeleton placeholder (gray pulsing grid shape) until data arrives

**Technical notes:**
- FR3 is satisfied by the pipeline counts in the widget header
- FR4 is satisfied by the legend distinguishing no-CI from other states

### Story 2.4: Heatmap Pipeline Counts Feed to Heartbeat

As a developer viewing the heartbeat numbers,
I want the pipeline run and failure counts to update when pipeline data arrives,
So that the heartbeat bar shows accurate pipeline stats even though pipeline data loads after initial heartbeat render.

**Acceptance Criteria:**

**Given** the heartbeat bar initially renders with `--` for pipeline counts (data not yet available)
**When** pipeline status data fetch completes
**Then** the heartbeat bar's "PIPELINES" stat updates to show `{totalRuns} / ✗{failures}`
**And** if failures > 0, the failure count renders in `--color-danger-fg`
**And** no full heartbeat re-render occurs — only the pipeline stat cells update

**Given** pipeline data arrives before heartbeat first renders (race condition)
**When** heartbeat renders
**Then** it includes pipeline counts immediately without needing a separate update

**Technical notes:**
- This story wires the dependency between pipeline data (Epic 2) and heartbeat display (Epic 1)
- Use targeted DOM update (`getElementById` + textContent) not full innerHTML rebuild
- Heartbeat stat cells for pipelines should have stable IDs for targeted updates

---

## Epic 3: Contributor Recognition & Live Feed

Deliver the social dimension of the org stats page: a top-10 commit leaderboard with avatars (recognizable from 10 feet) and the PR merge celebration ticker that scrolls recently merged PRs as a live feed with 2-minute polling.

### Story 3.1: Commit Leaderboard Rendering

As a developer pausing at the TV during a coffee break,
I want to see the top-10 contributors by commit count with their avatars and names,
So that I can recognize who's shipping the most this week and create spontaneous recognition moments.

**Acceptance Criteria:**

**Given** contributor data has been aggregated from all repos (from Story 1.3 fetch)
**When** `_renderLeaderboard(contributors)` is called
**Then** it renders the top 10 contributors sorted by `totalCommits` descending in `#commit-leaderboard`
**And** each row shows: rank number, avatar circle (40px), display name (max 20 chars, ellipsis), proportional green bar, commit count

**Given** a contributor in rank 1–3
**When** their row renders
**Then** the rank number displays in `--color-accent-fg` (blue)
**And** contributors ranked 4–10 show rank in `--color-fg-muted`

**Given** an avatar URL is available for a contributor
**When** the row first renders
**Then** an SVG circle with 2-letter initials (uppercase) displays immediately (synchronous)
**And** the real avatar image loads asynchronously via `new Image()` with `onload` callback
**And** on successful load, the SVG is replaced by the `<img>` element
**And** on failure, the SVG initials remain

**Given** the leaderboard has fewer than 10 contributors
**When** rendering
**Then** only the available contributors are shown (no empty rows)

**Given** no contributors have commits in the last 7 days
**When** rendering
**Then** the widget shows "No commit activity in the last 7 days" centered in `--color-fg-muted`

**Given** data is loading
**When** the leaderboard area is visible
**Then** it shows skeleton placeholder rows (gray pulsing bars)

**Technical notes:**
- Widget header: "TOP CONTRIBUTORS · 7D" (13px uppercase, `--color-fg-muted`)
- Commit bar width proportional to leader's count (leader = 100%, others = count/leader × 100%)
- Commit bar color: `--color-success-alt` (green)
- Row height ~62px, 8px gap between rows
- Avatar uses `createAvatarElement(login, avatarUrl)` pattern from architecture doc

### Story 3.2: PR Merge Celebration Ticker

As a developer near the TV,
I want to see a scrolling live feed of recently merged PRs,
So that I have shared awareness of what's shipping across the org right now.

**Acceptance Criteria:**

**Given** merged PR data is available (last 24 hours, max 20 items)
**When** `_renderTicker(mergedPRs)` is called
**Then** it renders a horizontally scrolling ticker inside `#pr-ticker`
**And** each item shows: "🎉 {author} merged '{title}' → {repo} · {time_ago}"
**And** items are separated by " · " (spaced bullet separator)

**Given** the ticker track is rendered
**When** CSS animation activates
**Then** the track scrolls via `@keyframes ticker-scroll` with `transform: translateX(0)` to `translateX(-50%)`
**And** the animation loops seamlessly (content is doubled for infinite loop illusion)
**And** scroll speed targets ~80px/sec (duration calculated dynamically from content width)

**Given** the ticker on Raspberry Pi 3B hardware
**When** the animation runs continuously
**Then** it maintains ≥30fps using GPU-accelerated CSS transforms (`will-change: transform`)

**Given** no PRs have been merged in the last 24 hours
**When** the ticker renders
**Then** it shows "No recent merges · Watching for activity..." as static centered text in `--color-fg-muted`

**Given** PR titles exceed 60 characters
**When** items are rendered
**Then** titles are truncated to 60 characters with ellipsis

**Technical notes:**
- Ticker bar: 52px height, `--color-canvas-subtle` background
- Author text in `--color-accent-fg`, title in `--color-fg-default`, repo in `--color-fg-muted`
- Animation duration: `Math.max(20, contentWidth / 80)` seconds
- Content duplicated (original + clone) in track for seamless loop
- Cap at 20 most recent merged PRs to keep track length manageable on Pi

### Story 3.3: Ticker 2-Minute Polling & Animation Refresh

As a developer lingering near the TV,
I want the PR ticker to update with new merges within 2 minutes of occurrence,
So that the feed stays near real-time without stale information.

**Acceptance Criteria:**

**Given** OrgStatsController is active and the org stats page is the current carousel page
**When** `startTickerPolling()` is called
**Then** a 2-minute interval timer (`_tickerTimer`) begins polling for new merged PRs
**And** the poll fetches closed PRs from the top 30 most recently active repos only (by `pushed_at`)

**Given** the carousel rotates away from the org stats page
**When** a different page becomes active
**Then** `stopTickerPolling()` clears the `_tickerTimer` interval and sets it to null
**And** no unnecessary API calls are made while the page is not visible

**Given** new merged PR data arrives from a ticker poll
**When** the ticker DOM needs updating
**Then** the animation is paused (`animationPlayState: 'paused'`)
**And** the track content is replaced with new items (doubled for loop)
**And** the animation is reset and restarted cleanly (no jarring jump)

**Given** a ticker poll fails (API error or rate limit)
**When** the poll handler processes the error
**Then** the existing ticker content continues scrolling unchanged
**And** the stale badge appears on the ticker bar
**And** the next poll fires at the regular 2-minute interval

**Given** `destroy()` is called on OrgStatsController
**When** the ticker timer is active
**Then** `_tickerTimer` is cleared via `clearInterval()` and set to null
**And** no further polls execute

**Technical notes:**
- Ticker-only refresh uses cached `_sortedRepos` — does NOT re-fetch org repo list
- Only queries top 30 repos by `pushed_at` to stay within rate limit budget
- Animation restart pattern: `track.style.animation = 'none'` → `requestAnimationFrame(() => track.style.animation = '')`
- Total rate impact: ~30 calls per poll × 30 polls/hour = 900 additional req/hr (within budget)

---

## Validation

### FR Coverage Verification

| FR | Epic.Story | Covered |
|----|-----------|---------|
| FR1 | 2.1 | ✅ |
| FR2 | 2.2 | ✅ |
| FR3 | 2.3, 2.4 | ✅ |
| FR4 | 2.2, 2.3 | ✅ |
| FR5 | 1.3 | ✅ |
| FR6 | 3.1 | ✅ |
| FR10 | 1.3 | ✅ |
| FR11 | 3.2 | ✅ |
| FR12 | 3.3 | ✅ |
| FR17 | 1.1 | ✅ |
| FR18 | 1.2, 1.4 | ✅ |
| FR19 | 1.3, 1.4 | ✅ |
| FR20 | 1.2 | ✅ |
| FR21 | 1.1 | ✅ |
| FR22 | 1.1 | ✅ |
| FR23 | 1.4 | ✅ |

### NFR Coverage Verification

| NFR | Addressed In | Status |
|-----|-------------|--------|
| NFR-PERF | 1.1 (skeleton-first), all render stories | ✅ |
| NFR-MEM | 1.4 (timer lifecycle), 3.3 (ticker timer cleanup) | ✅ |
| NFR-COMPAT | All stories (ES2020, -webkit- prefixes) | ✅ |
| NFR-RATE | 1.2 (batch strategy), 3.3 (ticker budget) | ✅ |
| NFR-DEGRADE | 1.3, 1.4 (stale indicators, never blank) | ✅ |
| NFR-SEC | 1.1 (secrets.json gitignored) | ✅ |
| NFR-ANIM | 3.2 (CSS keyframes, GPU-accelerated) | ✅ |

### UX-DR Coverage Verification

| UX-DR | Story | Status |
|-------|-------|--------|
| UX-DR1 (Heartbeat bar) | 1.3 | ✅ |
| UX-DR2 (Heatmap) | 2.2, 2.3 | ✅ |
| UX-DR3 (Leaderboard) | 3.1 | ✅ |
| UX-DR4 (Ticker) | 3.2 | ✅ |
| UX-DR5 (Skeletons) | 1.3, 2.3, 3.1 | ✅ |
| UX-DR6 (Layout grid) | 1.1 | ✅ |
| UX-DR7 (Page accent) | 1.1 | ✅ |
| UX-DR8 (CSS naming) | All CSS stories | ✅ |

### Dependency Validation

- **Epic 1 is standalone:** Delivers functioning page with heartbeat numbers. No dependency on Epics 2 or 3.
- **Epic 2 depends on Epic 1:** Uses repo list, batch helper, cache, and stale badge from Epic 1. Does NOT depend on Epic 3.
- **Epic 3 depends on Epic 1:** Uses repo list, batch helper, cache, contributor data fetch, and stale badge from Epic 1. Does NOT depend on Epic 2.
- **Within each epic:** Stories are strictly sequential — each builds only on previous stories in that epic.

### Story Size Validation

All 11 stories are scoped for single dev agent completion:
- Story 1.1 is the largest (config + HTML + CSS layout + JS shell + wiring) but all pieces are additive boilerplate with clear architecture guidance
- No story requires more than one source file to be newly created (1.1 creates both, subsequent stories modify them)
- All acceptance criteria are specific and testable
