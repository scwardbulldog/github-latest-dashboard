---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
inputDocuments:
  - '_bmad-output/brainstorming/brainstorming-session-2026-04-27.md'
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/project-context.md'
  - 'docs/'
workflowType: 'prd'
briefCount: 0
brainstormingCount: 1
researchCount: 0
projectDocsCount: 1
classification:
  projectType: 'web_app'
  domain: 'internal_tooling'
  complexity: 'medium'
  projectContext: 'brownfield'
lastEdited: '2026-05-13'
---

# Product Requirements Document — GitHub Org Activity Dashboard Page

**Author:** Shane
**Date:** 2026-05-13
**Input:** Brainstorming session 2026-04-27 (GitHub Org Repo Statistics and Visualizers)

---

## Executive Summary

**GitHub Org Activity Dashboard** is a new carousel page for the existing Raspberry Pi 3B TV kiosk, surfacing org-wide engineering velocity, CI/CD pipeline health, PR lifecycle health, and top contributor recognition across a ~100-repo GitHub organization. Data is pulled exclusively via PAT-authenticated GitHub REST API, displayed as visual-first widgets glanceable from 15 feet, refreshed every 5 minutes.

**Target Users:** Software engineers and team leads who walk past the office TV daily, seeking ambient awareness of collective team output and org-wide operational health without active monitoring.

**Problem Being Solved:** Individual developers have no passive visibility into org-wide engineering health. Pipeline failures in other teams, velocity trends, stale PRs, and top-contributor recognition all require active hunting across GitHub and Slack. The information exists but is never ambient.

**Why Now:** The org is mid-migration from Azure DevOps to GitHub Actions, consolidating CI/CD onto a single platform. The dashboard captures the org's GitHub Actions posture at a pivotal moment and establishes a shared health view that grows more valuable as more pipelines complete the migration.

### What Makes This Special

**Social energy and operational health in one page.** Most dashboards pick one — this page deliberately combines team recognition (leaderboard, PR celebrations, streaks) with operational signals (pipeline heatmap, branch debt, review latency) to create a page developers both enjoy and find useful. The mix makes people stop and look.

**Visual-first at distance, always.** Every widget is designed for 15-foot glanceability. No tables, no text walls. Bold numbers, colored grids, avatars, tickers. The page feels like a live instrument panel, not a metrics report.

**GitHub-native unified view.** All data comes from the GitHub REST API — commits, PRs, Actions runs, branches, languages. A single PAT, a single API surface, zero cross-system auth complexity. As the org completes its migration to GitHub Actions, the heatmap becomes a complete picture with no integration debt.

---

## Project Classification

- **Project Type:** Web App — new page slot in an existing single-page carousel dashboard
- **Domain:** Internal Tooling / DevOps
- **Complexity:** Medium — GitHub REST API, PAT authentication, ~100-repo aggregation, Raspberry Pi 3B performance constraints, Chromium 84 compatibility
- **Project Context:** Brownfield — extends the existing `github-latest-dashboard` Vite/Vanilla JS project

---

## Success Criteria

### User Success

- A developer walking past the TV can assess org-wide CI/CD health in under 5 seconds by reading the pipeline heatmap color pattern.
- Top contributors are recognizable by name and avatar from 10 feet without squinting.
- PR Merge Celebration ticker draws momentary attention and creates shared context between developers near the TV.
- Within one month of deployment, at least one developer references something they saw on the org stats page in conversation or standup.
- On-call engineers use the heatmap to visually confirm blast radius during an incident before opening a laptop.

### Business Success

- The org stats page increases the informational value of the existing dashboard, justifying the Pi deployment for the wider org (not just the three existing GitHub pages).
- Team leads report the leaderboard and streak counter create organic recognition moments without PM intervention.
- The dashboard becomes a shared reference point in team conversations about velocity and quality.

### Technical Success

- Page renders and is legible within 3 seconds of carousel rotation on Raspberry Pi 3B.
- All widgets for ~100 repos complete their API fetch and render within the 5-minute refresh window.
- GitHub REST API usage remains within the 5,000 requests/hour authenticated PAT rate limit during normal operation.
- No memory leaks across a 24-hour continuous run (consistent with existing dashboard burn-in standards).
- Graceful degradation: if the GitHub API is unavailable, last-cached data displays with a staleness indicator; no widget shows a blank state.

### Measurable Outcomes

- CI/CD heatmap color state accurately reflects pipeline run status within 10 minutes of a state change.
- Commit leaderboard reflects the correct top-10 contributors for the trailing 7-day window.
- PR Merge Celebration ticker fires within 2 minutes of a PR merge event across any org repo.
- Branch debt counter is within ±5% of the actual count of branches with no activity in >14 days.

---

## Product Scope

### MVP — Phase 1

**Core Value Hypothesis:** Developers will engage with an org stats page if it answers two questions in under 10 seconds: "Is anything broken?" and "Who shipped something today?"

**Must-Have Widgets (MVP):**

| Widget | Theme | Primary Signal |
|--------|-------|---------------|
| Pipeline Heatmap (#1) | Org Vitals | Red/yellow/green grid, all repos, GitHub Actions |
| Org Heartbeat Numbers (#7) | Org Vitals | Total commits, PRs opened/merged, pipelines run/failed — 7 days |
| Commit Leaderboard (#2) | Who's Shipping | Top-10 contributors by commits, avatars, counts |
| PR Merge Celebration (#5) | Who's Shipping | Live ticker — repo name, PR title, author |

**Page Layout (MVP):**

```
┌─────────────────────────────────────────────────────────────┐
│  Org Heartbeat Numbers (commits / PRs / pipelines)          │
├─────────────────────────────────────┬───────────────────────┤
│                                     │                       │
│    Pipeline Heatmap                 │  Commit Leaderboard   │
│    (main visual zone)               │  (top 10 contributors)│
│                                     │                       │
├─────────────────────────────────────┴───────────────────────┤
│  PR Merge Celebration Ticker (live feed)                     │
└─────────────────────────────────────────────────────────────┘
```

### Phase 2 — Growth

Widgets that add depth without changing the core visual contract:

- **Code Density Pulse (#24):** Lines added vs. deleted — two opposing green/red bars
- **Branch Debt Counter (#27):** Single count of stale branches >14 days, color-coded health
- **Review Response Time (#25):** Avg PR-open-to-first-review hours, trend arrow vs. prior week
- **PR Aging Wall (#9):** Top 5 longest-open PRs across all repos, age in days
- **Repo Streak Counter (#17):** Consecutive days with ≥1 commit per repo; top streak-holders leaderboard

**Extended Layout (Phase 2):**

```
┌─────────────────────────────────────────────────────────────┐
│  Org Heartbeat Numbers              │  Code Density Pulse   │
├────────────────────┬────────────────┼───────────────────────┤
│  Pipeline Heatmap  │  Constellation │  Leaderboard +        │
│  (rotating main    │  or Wave       │  Streak Counter       │
│   visual)          │                │                       │
├────────────────────┴────────────────┴───────────────────────┤
│  PR Merge Ticker   │  Response Time │  Aging Wall  │ Branch  │
└─────────────────────────────────────────────────────────────┘
```

### Phase 3 — Vision

Ambient spatial visualizations and aesthetic depth:

- **Repo Activity Constellation (#30):** Dot map — size = commit volume, brightness = commit recency, clusters by topic tag. A living star map of the org.
- **Commit Wave (#13):** Animated wave whose amplitude = commit frequency in last hour. Pure ambient rhythm.
- **Code Language Globe (#8):** Org-wide programming language distribution as an animated donut or proportional bar.

---

## User Journeys

### Journey 1: Alex — Developer Walk-By (Operational Awareness)

Alex, a backend engineer, walks past the TV at 9:15am on a Monday. The carousel is showing the Org Stats page. The Pipeline Heatmap immediately draws her eye — three red cells in the `services/` cluster. She slows. One of those repos looks like the shared auth library her team depends on. She doesn't stop walking, but she pulls out her phone to check Slack. At standup 20 minutes later she mentions it. The team already knows and the fix is deploying. Zero friction awareness transfer — no alert, no Slack ping required.

**Journey reveals:** Heatmap must be spatially consistent (same repo always in same cell), repo names must be legible on hover or via stable position, failure state must be unmistakable at 15 feet.

### Journey 2: Marcus — Team Lead Checking In (Recognition)

Marcus, a team lead, glances at the TV after lunch. The Commit Leaderboard shows his team's junior dev, Priya, ranked #3 for the week. He pauses for a moment, smiles. At the afternoon check-in he mentions it: "Priya, saw you on the leaderboard." Priya's face lights up. The TV created a spontaneous recognition moment that cost Marcus nothing and cost the team nothing.

**Journey reveals:** Avatars must be large enough to identify faces from 10 feet. Names must be readable. Count numbers should convey scale. The leaderboard must feel celebratory, not competitive-threatening.

### Journey 3: PR Merge Celebration — Spontaneous Shared Context

Three developers are chatting near the coffee machine, TV visible in background. The PR Merge Celebration ticker fires: "🎉 sarah merged 'feat: new auth flow' → platform-api." One of them says, "Finally, that's been in review for days." Another: "Is that live now?" They glance over, briefly engaged. The TV created shared situational awareness between people who might never have seen the merge notification.

**Journey reveals:** Ticker must be visually distinct (animation, color pop). PR title must be readable at 10 feet. Timing — a new merge should appear within 2 minutes. Display should persist long enough to be read (5–8 seconds per item before advancing).

### Journey 4: On-Call Engineer — Incident Triage

It's 3pm. A PagerDuty alert fired. The on-call engineer, Dan, is walking to his desk and glances at the TV. The heatmap shows a cluster of failures in the `services/payments` column — five red cells in a row. Before he's even sat down, he has a mental map of blast radius. The heatmap gave spatial context that the alert notification didn't.

**Journey reveals:** Heatmap spatial layout should be stable and learnable (same repo, same position). Failure clusters must be visually obvious — red must be unmistakable. Repo grouping by topic/namespace is valuable for incident triage.

---

## Web App Specific Requirements

### Rendering Constraints

- Target resolution: 1920×1080 (Full HD TV kiosk, Chromium 84 in fullscreen kiosk mode)
- All widgets must fit within a single viewport — no scrolling, no overflow
- Text must be legible at 10–15 feet: minimum effective font size ~18–20px for labels, 36–48px for key numbers
- Colors must work under office lighting (avoid low-contrast combinations)
- `-webkit-` prefixes required for all CSS features used (Chromium 84 compatibility)
- No animations exceeding 60fps expectations on Pi 3B — prefer CSS transitions over JS-driven animations

### Data Architecture

- All API calls are client-side (browser) — no backend server, no Node.js on Pi
- PAT tokens stored in `public/config.json` (existing pattern), loaded at runtime
- Separate cache entries per data type in `api-client.js` (existing in-memory cache pattern)
- Parallel async fetches — widget data fetches must not block each other
- Fetch orchestration follows existing `api-client.js` retry/backoff pattern (3 retries, 1s/2s/4s delays)

### GitHub REST API Endpoints Required

| Data | Endpoint | Notes |
|------|----------|-------|
| Org repos list | `GET /orgs/{org}/repos` | Paginated, ~100 repos |
| Commit activity per repo | `GET /repos/{owner}/{repo}/stats/commit_activity` | Returns 52-week weekly data |
| Contributors per repo | `GET /repos/{owner}/{repo}/stats/contributors` | Weekly additions/deletions/commits |
| Pull requests list | `GET /repos/{owner}/{repo}/pulls?state=all` | Paginate for 7-day window |
| Workflow runs | `GET /repos/{owner}/{repo}/actions/runs` | GitHub Actions CI/CD status |
| Branches list | `GET /repos/{owner}/{repo}/branches` | For stale branch counting |
| Languages | `GET /repos/{owner}/{repo}/languages` | Byte counts per language |

**PAT Scopes Required:** `repo`, `read:org`, `workflow`

### Module Architecture

New source file: `src/js/org-stats.js` — data fetching and widget rendering for the org stats page. Follows existing class-based component pattern. Registers as a new carousel page in `main.js`.

New CSS: `src/css/org-stats.css` — widget layout and visual styles for the org stats page.

---

## Functional Requirements

### CI/CD Pipeline Health

- FR1 [MVP]: The system can fetch the latest CI/CD run status (pass/fail/pending) for each repo from GitHub Actions and display it as a color-coded cell in a grid.
- FR2 [MVP]: The system can display the heatmap grid with spatial consistency — each repo occupies the same cell position across refresh cycles.
- FR3 [MVP]: The system can display pipeline counts (total runs, total failures) for the org over the trailing 7 days as numeric indicators.
- FR4 [MVP]: The system can visually distinguish a repo with no CI pipeline configured from one with a passing or failing pipeline.

### Commit & Velocity Signals

- FR5 [MVP]: The system can display total commit count across all org repos for the trailing 7 days as a bold headline number.
- FR6 [MVP]: The system can display the top-10 contributors by commit count for the trailing 7 days with avatar image, display name, and commit count.
- FR7 [Phase 2]: The system can display org-wide lines added and lines deleted for the trailing 7 days as two opposing directional bars.
- FR8 [Phase 2]: The system can display per-repo commit streak (consecutive days with ≥1 commit) and surface the top 5 streak-holders.
- FR9 [Phase 3]: The system can visualize commit frequency as an animated commit wave whose amplitude is proportional to commit count in the trailing hour, updated every 5 minutes.

### PR Lifecycle Awareness

- FR10 [MVP]: The system can display total PRs opened and total PRs merged across all org repos for the trailing 7 days as numeric indicators.
- FR11 [MVP]: The system can display a live ticker of PRs merged within the trailing 24 hours, showing repo name, PR title, and author name/avatar.
- FR12 [MVP]: The system can poll for new merged PRs at a short interval (≤2 minutes) to keep the ticker near real-time.
- FR13 [Phase 2]: The system can display the top 5 longest-open PRs across all repos, sorted by age descending, showing repo name, PR title, and age in days.
- FR14 [Phase 2]: The system can calculate average time from PR open to first review comment/approval across the org for the trailing 7 days, displayed as hours with a week-over-week trend arrow.

### Repository Health Indicators

- FR15 [Phase 2]: The system can display a count of branches across all repos with no commit activity for >14 days as a single health indicator with color coding.
- FR16 [Phase 3]: The system can display org-wide programming language distribution as a proportional horizontal bar visualization using byte counts.

### Data Fetching & Authentication

- FR17 [MVP]: The system can authenticate with the GitHub REST API using a PAT loaded from a runtime configuration file.
- FR18 [MVP]: The system can cache each data type with a 5-minute TTL and serve cached data on subsequent renders within that window.
- FR19 [MVP]: The system can display stale cached data with a visual staleness indicator when a live fetch fails, rather than showing a blank widget.
- FR20 [MVP]: The system can complete the full data fetch cycle for ~100 repos within the 5-minute refresh window without hitting GitHub's authenticated rate limit (5,000 req/hr).

### TV Kiosk Display

- FR21 [MVP]: The org stats page renders as a registered carousel page slot within the existing 30-second rotation managed by the carousel component.
- FR22 [MVP]: All active widgets display within a single 1920×1080 viewport without scrolling.
- FR23 [MVP]: All widget data refreshes on a 5-minute background cycle without triggering a full page reload or carousel disruption.

---

## Non-Functional Requirements

### Performance

- All widgets must complete rendering within 3 seconds of data availability on Raspberry Pi 3B (ARM, 1GB RAM).
- Parallel async fetches are required — no widget fetch may block another widget from rendering.
- Animations (PR ticker, commit wave) must maintain ≥30fps on Pi 3B hardware throughout the 24-hour run.
- Memory usage must not grow over a 24-hour continuous run; all timers must have cleanup methods following the existing project pattern.

### Integration

- GitHub REST API: authenticated PAT; requests must include `User-Agent` header per GitHub policy; pagination handled for repos and PRs.
- Rate limiting: API calls for ~100 repos must complete within the 5,000 req/hr GitHub authenticated rate limit; caching must reduce repeat calls to avoid exhausting the limit.
- The GitHub API is treated as best-effort — the page must function (with stale cached data) if the API is temporarily unreachable.

### Reliability

- All API call failures must fall back to stale cached data; no uncaught errors may crash or blank the page.
- Stale data must display a visible age indicator ("last updated X min ago") when live fetch has failed.
- No CSS or JS feature may depend on capabilities not present in Chromium 84; all webkit prefixes applied as needed.
- The page must survive 24+ hours of continuous operation on Pi 3B as validated by existing burn-in test procedure (`test/burn-in-test.sh`).

### Security

- PAT tokens in `public/config.json` are read-only scoped (`repo`, `read:org`, `workflow`); principle of least privilege applied.
- `public/config.json` must be added to `.gitignore` to prevent PAT exposure in the repository. A `public/config.json.example` with placeholder values should be committed.
- No PAT values may appear in JavaScript source, HTML, or any committed file.

---

## Brainstorming Coverage Reconciliation

All 12 survivor ideas from the 2026-04-27 session are accounted for:

| Idea | Theme | PRD Landing |
|------|-------|-------------|
| #1 Pipeline Heatmap | Repo Intelligence | FR1–FR4 (MVP) |
| #2 Commit Leaderboard | Who's Shipping | FR6 (MVP) |
| #5 PR Merge Celebration | Who's Shipping | FR11–FR12 (MVP) |
| #7 Org Heartbeat Numbers | Org Vitals | FR5, FR10, FR3 (MVP) |
| #8 Code Language Globe | Repo Intelligence | FR16 (Phase 3 vision) |
| #9 PR Aging Wall | Repo Intelligence | FR13 (Phase 2) |
| #13 Commit Wave | Org Vitals | FR9 (Phase 3 vision) |
| #17 Repo Streak Counter | Who's Shipping | FR8 (Phase 2) |
| #24 Code Density Pulse | Org Vitals | FR7 (Phase 2) |
| #25 Review Response Time | Who's Shipping | FR14 (Phase 2) |
| #27 Branch Debt Counter | Org Vitals | FR15 (Phase 2) |
| #30 Repo Activity Constellation | Repo Intelligence | Phase 3 vision (no FR — deferred; spatial layout depends on Phase 2 data infrastructure) |
