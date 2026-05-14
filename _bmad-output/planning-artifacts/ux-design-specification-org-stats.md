---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments: 
  - '_bmad-output/planning-artifacts/prd-org-stats.md'
  - '_bmad-output/project-context.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
date: '2026-05-13'
project_name: 'GitHub Org Activity Dashboard Page'
user_name: 'Shane'
workflowStatus: 'complete'
lastStep: 14
visualArtifacts:
  - '_bmad-output/planning-artifacts/ux-mockup-org-stats.html'
---

# UX Design Specification — GitHub Org Activity Dashboard Page

**Author:** Shane
**Date:** 2026-05-13

---

## Executive Summary

### Project Vision

The GitHub Org Activity Dashboard Page is a new carousel slot for the existing Raspberry Pi 3B TV kiosk. Where the existing dashboard surfaces *GitHub platform updates* (blog posts, changelog, status), this new page surfaces *org-internal engineering health* — CI/CD pipeline posture, commit velocity, contributor recognition, and PR lifecycle signals across a ~100-repo GitHub organization.

The page is designed to be a **live instrument panel** seen from 15 feet. Every widget answers one of two questions: *"Is anything broken?"* or *"Who shipped something today?"* The combination of operational signals and social recognition creates a page developers both find useful and enjoy watching.

### Target Users

**Primary Users:** Software engineers and team leads passing the office TV during their workday — coffee breaks, walk-bys between meetings, standing conversations in the hallway.

**Usage Patterns:**
- **Walk-by glancer:** 2–5 seconds of passive attention. No cognitive effort. Must absorb pipeline health at a glance.
- **Coffee break lingerer:** 30–90 seconds of semi-engaged attention. Reads leaderboard names, watches ticker, processes heartbeat numbers.
- **Incident-aware responder:** Caught a red cluster on the heatmap. Immediately processes blast radius. Goes to laptop.

**Viewing Distance:** 10–15 feet from TV.

### Key Design Challenges

**C1: Signal Density at Distance**
This page carries significantly more concurrent information than the existing single-feed pages (Blog, Changelog, Status). Four distinct widgets must coexist without visual competition. Each must be independently legible at 15 feet without requiring the user to "parse" the page structure.

**C2: Org Scale Without Chart Junk**
~100 repos is a lot of data. The pipeline heatmap must communicate aggregate health instantly through color pattern, not through reading individual labels. Spatial consistency is critical — developers learn repo positions over time.

**C3: Social vs. Operational Balance**
The leaderboard and PR ticker are celebratory. The heatmap is operational. These two modes must coexist without the celebratory widgets trivializing incidents or the operational widgets making the leaderboard feel austere.

**C4: Raspberry Pi Performance**
All animations (PR ticker scroll, any pulsing) must run under the Pi 3B's rendering budget. CSS animation preferred over JS-driven RAF loops. No heavy particle effects.

### Design Opportunities

**O1: The Heatmap as Shared Mental Map**
If the repo grid stays spatially stable across refreshes, developers will internalize the layout over weeks. "The red cluster in the bottom-right is always infra-services" becomes shared team knowledge. No other tool creates this ambient spatial map.

**O2: Leaderboard as Recognition Moment**
Unlike a Slack message or a PR comment, the leaderboard is visible to the whole room simultaneously. A team lead mentioning "I saw you at #3" becomes a spontaneous recognition moment — zero cost to the lead, high value to the engineer.

**O3: Ticker as Shared Narrative**
The PR Merge Celebration ticker creates a running narrative of team output visible to everyone near the TV. It converts invisible async work into visible, shareable social currency.

---

## Core User Experience

### Defining Experience

The core interaction this page must nail:

> **"Red on the heatmap, I know before sitting down."**

A developer walking past the TV notices a red cluster in the heatmap within 2 seconds. They don't need to read any labels. They know something is broken in a spatial region they've internalized. This is the page's highest-value moment. Everything else (leaderboard, heartbeat numbers, ticker) is enrichment that deepens engagement for lingerers.

### Platform Strategy

**Identical to existing dashboard:** Chromium 84 fullscreen kiosk on Raspberry Pi 3B, 1920×1080, no user interaction. This new page is a carousel slot — it receives the same `30s rotation window` from `CarouselController`.

**Critical constraint:** The page must render fully within 3 seconds of carousel rotation on Pi hardware. No long blocking API chains, no heavy computation on first render.

### Effortless Interactions

**E1: Color-Only Pipeline Assessment**
The heatmap communicates health via color alone. No labels, no numbers needed for immediate assessment. Green cluster = healthy. Red cell(s) = investigate. Yellow = in progress. Gray = no CI.

**E2: Instant Leaderboard Recognition**
Top 3 contributors are recognizable by avatar and name from 10 feet. Rank position is obvious without reading commit counts.

**E3: Ticker Readability**
PR merge items scroll slowly enough to read a full item (repo name + PR title + author) in one pass. Not so slow that it feels frozen.

**E4: Heartbeat Numbers at a Glance**
The four stat boxes in the heartbeat row communicate org-wide velocity with bold numbers that are readable without approaching the screen. Red failure count draws immediate attention if elevated.

### Critical Success Moments

**M1: The Red Cell (2 seconds)**
Developer spots a red cell or red cluster in the heatmap while walking. Understands a pipeline is failing without breaking stride. Pulls out phone or goes to laptop.

**M2: The Leaderboard Pause (10 seconds)**
Developer recognizes a colleague's name/avatar in top 3. Feels a social connection impulse. May mention it in conversation. Creates spontaneous recognition.

**M3: The Ticker Trigger (5 seconds)**
Developer reads a PR merge item and says "oh, that finally merged?" to a nearby colleague. Shared context created without any individual action.

**M4: The Heartbeat Scan (3 seconds)**
Developer reads commit count and merged PR count during coffee break. Forms a qualitative sense of "busy week" vs. "slow week." Useful ambient signal.

### Experience Principles

**P1: Color First, Text Second**
Every widget must deliver its primary signal via color and visual pattern before requiring any text reading. Text enriches; color informs.

**P2: Spatial Stability**
The heatmap grid is a learned map. Repos must occupy the same cells across refreshes. Spatial memory is the feature.

**P3: Celebratory Without Being Trivial**
The social widgets (leaderboard, ticker) celebrate without undermining the operational authority of the heatmap. Tone: "look what the team built" — not "gamification."

**P4: GitHub Primer Authenticity (Inherited)**
Zero deviation from the existing dashboard's design language. This page is visually indistinguishable from the rest of the kiosk in design character.

**P5: Pi Budget Discipline**
If a visual effect can't run at acceptable frame rate on Pi 3B, it doesn't ship. The ticker CSS animation is the only moving element in MVP.

---

## Desired Emotional Response

### Primary Emotional Goal

**Shared Pride + Operational Confidence**

The page should make developers feel two things simultaneously: *pride in collective output* (we shipped this much this week) and *confidence in operational health* (I know the state of our pipelines). Both feelings are passive — absorbed through presence, not earned through effort.

### Emotional Journey Mapping

**Walk-by — pipeline all green:**
- Relief: "Systems healthy, nothing to worry about"
- Pride: "Look at those commit numbers"
- Belonging: Seeing familiar colleague names on the leaderboard

**Walk-by — red cells in heatmap:**
- Alertness (not panic): "Something's broken, I should check that"
- Agency: "I know about this now, I can act"

**Coffee break — leaderboard:**
- Recognition: "Priya's killing it this week"
- Motivation: Light competitive nudge, not anxiety-inducing
- Warmth: Spontaneous conversation starter

**Ticker fires with familiar PR:**
- Delight: "Oh nice, that finally merged"
- Connection: Shared narrative with anyone near the TV

### Emotions to Avoid

- **Anxiety or information overload:** Too much data, too dense, competing visual weight → cognitive overwhelm
- **Competitive toxicity:** Leaderboard must feel celebratory, not "why am I not on there"
- **Alarm at normal pipeline states:** Yellow/pending states must not read as alarming

---

## UX Pattern Analysis & Inspiration

### Primary Inspiration Source

The **existing dashboard** is the canonical reference. This page inherits every design decision from `ux-design-specification.md` without deviation — GitHub Primer tokens, typography, spacing, border treatment, dark theme.

### Additional Pattern References

**GitHub Contribution Graph → Pipeline Heatmap**
The org contribution calendar (github.com/{user}) is the closest analog to the pipeline heatmap. Users already understand "green cell = activity." The heatmap borrows this spatial grid vocabulary but uses CI status colors (green/red/yellow/gray) instead of activity density shading.

**GitHub Actions Summary Page → Pipeline Status Cells**
The colored workflow run status indicators on github.com/org/repo/actions are the exact color vocabulary for cell states. ✅ green, ❌ red, 🟡 yellow (in progress), ⬜ gray (no CI). Users already know these.

**Live Sports Scoreboard → Heartbeat Numbers**
Large single-stat "headline number" boxes — bold, oversized, immediately legible from distance. Think ESPN on-screen score display. The stat is the message; the label is secondary.

**Twitch Viewer Leaderboard → Commit Leaderboard**
Ranked list with avatar, display name, and a count metric. Deliberately social. Not a sortable data table — a visual ranking with personality.

**News Ticker (CNN bottom bar) → PR Merge Celebration Ticker**
Scrolling text band at bottom of screen. Known pattern. Users immediately understand "this is a live feed." The celebratory tone differentiates it from a news ticker's urgency.

### Anti-Patterns to Avoid

- **Table-based heatmap with column/row headers:** Converts glanceable grid into a data table. Breaks 15-foot readability.
- **Tooltip-dependent repo identification:** Kiosk has no hover. Repo names in cells must be legible without interaction.
- **Animated cells pulsing continuously:** Chromium 84 + Pi 3B = skip continuous CSS animations per cell. Static colored cells only.
- **Avatar fetch blocking render:** Leaderboard must render with initials-based fallback avatars instantly; real avatars load progressively.
- **Ticker too fast:** Unreadable. Target 80–100 characters per 8 seconds of movement.

---

## Design System Foundation

### Design System Choice

**GitHub Primer (Strict Adherence — inherited from existing dashboard)**

All color tokens, typography, spacing, and border treatment are inherited verbatim from `src/css/main.css`. No new tokens are introduced.

**One Addition — Page Accent Color:**
Each carousel page has a distinct header accent color. Existing assignments:
- Blog → `--color-accent-fg` (#58a6ff, blue)
- Changelog → `--color-sponsor-fg` (#8250df, purple)
- Status → `--color-success-fg` (#2da44e, green)
- Anthropic → `--color-attention-fg` (#bf8700, amber)

**Org Stats → `--color-danger-alt` (#f85149, coral-orange)**

Rationale: Coral-orange is visually distinct from all existing page colors. It evokes "activity/energy" appropriate for engineering velocity. It is not confused with the danger/error semantic because it's used only as a page identity accent (header text color), not as a status signal.

### Visual Foundation

All values inherited from `src/css/main.css` — listed here for widget design reference:

**Canvas:**
- Background: `#0d1117` (`--color-canvas-default`)
- Elevated surfaces: `#161b22` (`--color-canvas-subtle`)
- Borders: `#21262d` (`--color-border-default`)

**Status colors for heatmap cells:**
- Passing: `#2da44e` (`--color-success-fg`) — background-tinted cell
- Failing: `#cf222e` (`--color-danger-fg`) — background-tinted cell
- In Progress: `#bf8700` (`--color-attention-fg`) — background-tinted cell
- No CI: `#30363d` (`--color-border-strong`) — neutral gray cell

**Typography (key sizes for widgets):**
- Heartbeat stat numbers: 48px, weight 600
- Heartbeat stat labels: 14px, weight 400, `--color-fg-muted`
- Heatmap cell labels: 10px, weight 400, 70% opacity white
- Leaderboard rank: 20px, weight 600
- Leaderboard name: 16px, weight 400
- Leaderboard count: 20px, weight 600, `--color-accent-fg`
- Ticker text: 16px, weight 400

---

## Design Direction Decision

### Chosen Direction: "Instrument Panel"

A single clear design direction was selected based on the PRD principles and constraints. There are no competing directions to evaluate — the constraints (Pi 3B, GitHub Primer, 1920×1080, 15-foot viewing) converge on one solution.

**Layout Philosophy:** Strict information zones with clear visual hierarchy. No ambiguity about what zone does what. Heartbeat numbers occupy the full width at top (scan-first). Heatmap takes 60% width center-left (primary operational signal). Leaderboard takes 40% center-right (social/recognition signal). Ticker anchors the bottom (live feed signal).

**Visual Treatment:**
- Cells in the heatmap: filled color backgrounds with short repo name labels, no borders between cells, small gap between cells. Color is the data.
- Leaderboard rows: subtle alternating backgrounds, avatar circles, commit bars proportional to leader. Clean, not decorative.
- Heartbeat boxes: large stat number + small label, separated by vertical dividers. Maximum legibility at distance.
- Ticker: smooth horizontal scroll. Celebratory emoji (🎉) prefix per item. Slightly elevated background from main canvas.

### Design Rationale

The instrument panel metaphor is appropriate because developers treat this page like a status board — something they scan, not read. Each widget occupies a defined zone with a defined signal. The heatmap commands the most visual weight because pipeline health is the highest-value signal. The leaderboard earns its position by being the most visually interesting (faces, names, bars) for lingerers.

---

## User Journey Flows

### Journey 1: Walk-By Pipeline Assessment (2 seconds)

```
Developer walks past TV
  → Heatmap is visible in left zone
  → Color pattern registered: mostly green, 2 red cells
  → Brain processes: "Something's failing in [spatial region]"
  → [No action, OR] pulls out phone / goes to desk
```

**UX requirements:**
- Heatmap must occupy dominant visual space (60% width, full main content height)
- Red cells must be unmistakable from 15 feet (not a hint of red — full `#cf222e` background)
- Spatial position must be stable — same repo = same cell every refresh

### Journey 2: Leaderboard Recognition (10–30 seconds)

```
Developer pauses at TV during coffee break
  → Glances at leaderboard (right zone)
  → Recognizes colleague avatar/name in top 3
  → Reads commit count with pride or curiosity
  → May turn to nearby colleague: "Did you see Priya is #3?"
  → Walk away, positive social residue
```

**UX requirements:**
- Avatar circles must be ≥40px diameter, large enough for face recognition at 10 feet
- Names must be ≥16px, white/default color, weight 400
- Top 3 rows get subtle accent treatment (rank number in `--color-accent-fg`)

### Journey 3: Incident Triage (5 seconds)

```
On-call developer walks past TV after PagerDuty alert
  → Heatmap shows cluster of red cells
  → Spatial position of cluster maps to "services/ namespace" (learned over time)
  → Developer mentally maps blast radius before reaching desk
  → Sits down with context already formed
```

**UX requirements:**
- Cell grouping/ordering must be namespace-consistent (sorted by repo name = natural namespace clustering)
- Cluster visibility: adjacent red cells must be unmistakably a cluster, not isolated noise
- No decorative elements that break the spatial grid pattern

### Journey 4: PR Ticker Shared Moment (5–8 seconds)

```
Three developers chatting near coffee machine, TV in background
  → Ticker fires: "🎉 sarah merged 'feat: new auth flow' → platform-api"
  → One developer: "Finally, that's been in review for days"
  → Shared context created
  → Zero action required from any party
```

**UX requirements:**
- Ticker must be readable from 12–15 feet: minimum 16px, good contrast on elevated background
- Items must linger long enough to be read (80–100 chars at smooth scroll speed)
- Multiple items queue; smooth continuous scroll, not "slide in" per item

---

## Component Strategy

### Existing Components Used (No Changes)

- `.page-header` — Org Stats page title bar ("ORG STATS"), using `--color-danger-alt` accent
- `.progress-container` / `.progress-bar` — Rotation progress (inherited)
- Global header (`div.header`) — Inherited, unchanged
- `.carousel-page` / `.carousel-page.active` — Inherited page slot pattern

### New Custom Components (MVP)

---

#### Widget: Org Heartbeat Numbers

**Purpose:** Display 4 org-wide velocity stats for trailing 7 days in a single scannable row.

**Anatomy:**
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│   1,247      │     89       │     67       │  234 / ✗12  │
│  COMMITS     │ PRs OPENED   │ PRs MERGED   │  PIPELINES   │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**States:**
- Default: White/default stat number, muted label
- Pipeline failure count > 0: Failure sub-number in `--color-danger-fg`
- Loading: Number shows `--` with muted color
- Stale data: Adds "(stale)" label in `--color-attention-fg`

**Sizing:**
- Row height: 96px (including 16px padding top/bottom)
- Stat number: 48px, weight 600
- Label: 12px, weight 400, `--color-fg-muted`, uppercase, letter-spacing 0.5px
- Vertical dividers between stats: 1px `--color-border-default`

**CSS Class:** `.org-heartbeat-bar` containing `.heartbeat-stat` cells

---

#### Widget: Pipeline Heatmap

**Purpose:** Display CI/CD status of all org repos as a color-coded spatial grid. Primary operational signal.

**Anatomy:**
```
┌─ PIPELINE HEALTH ───────── [234 runs · 12 failed · 7d] ───┐
│  ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐               │
│  │███│███│███│   │███│███│███│███│███│███│ ← row 1       │
│  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤               │
│  │███│███│   │███│███│███│███│███│███│███│ ← row 2       │
│  ... (10 rows for ~100 repos)                              │
│  └───────────────────────────────────────┘               │
│  ● pass  ● fail  ● running  ○ no CI                      │
└───────────────────────────────────────────────────────────┘
```

**Cell states:**
- `passing`: bg `rgba(45, 164, 78, 0.3)`, text `#3fb950`, border `rgba(45, 164, 78, 0.4)`
- `failing`: bg `rgba(207, 34, 46, 0.4)`, text `#f85149`, border `rgba(207, 34, 46, 0.5)` — most saturated
- `running`: bg `rgba(191, 135, 0, 0.25)`, text `#d29922`, border `rgba(191, 135, 0, 0.35)`
- `no-ci`: bg `rgba(48, 54, 61, 0.5)`, text `#7d8590`, border `transparent`

**Cell content:** Short repo name (12 chars max, clipped). Monospace fragment. 10px, weight 400.

**Grid layout:** CSS Grid, `auto-fill`, `minmax(90px, 1fr)`. Repos sorted alphabetically (natural namespace clustering). Gap: 4px.

**Widget sections:**
- Widget header: "PIPELINE HEALTH" (uppercase, 14px, letter-spacing 1px, `--color-danger-alt` accent color) + run summary stats right-aligned
- Grid body: fills remaining height
- Legend row: 4 color dots + labels, 12px, `--color-fg-muted`

**CSS Classes:** `.pipeline-heatmap-widget`, `.heatmap-grid`, `.heatmap-cell`, `.heatmap-cell--passing`, `.heatmap-cell--failing`, `.heatmap-cell--running`, `.heatmap-cell--no-ci`

---

#### Widget: Commit Leaderboard

**Purpose:** Display top-10 contributors by commit count for trailing 7 days with avatar, name, and proportional bar.

**Anatomy (per row):**
```
  [rank]  [●avatar]  [Name Surname]  [████████░░░░]  [42]
```

**Row structure:**
- Rank number: 24px, weight 600 — top 3 in `--color-accent-fg`, rest in `--color-fg-muted`
- Avatar circle: 40px diameter, `border-radius: 50%`. Shows `<img>` with initial-based SVG fallback
- Name: 16px, weight 400, `--color-fg-default`, max 20 chars truncated with ellipsis
- Commit bar: flex-fill, `border-radius: 3px`, green (`--color-success-alt`), proportional to leader's count
- Count number: 20px, weight 600, `--color-fg-default`

**Row spacing:** 8px gap between rows. Row height ~62px.

**Widget header:** "TOP CONTRIBUTORS · 7D" (uppercase, 13px, letter-spacing 1px, `--color-fg-muted`)

**Loading state:** Skeleton rows (pulsing gray bars) in place of real data.

**CSS Classes:** `.leaderboard-widget`, `.leaderboard-row`, `.leaderboard-rank`, `.leaderboard-avatar`, `.leaderboard-name`, `.leaderboard-bar-wrap`, `.leaderboard-bar`, `.leaderboard-count`

---

#### Widget: PR Merge Celebration Ticker

**Purpose:** Scrolling live feed of recently merged PRs across all org repos.

**Anatomy:**
```
┌─────────────────────────────────────────────────────────────┐
│  🎉 sarah merged 'feat: new auth flow' → platform-api · 3m ago   🎉 marcus merged ...  │
└─────────────────────────────────────────────────────────────┘
```

**Item format:** `🎉 {author} merged '{pr_title}' → {repo_name} · {time_ago}`

**Separator between items:** `   ·   ` (3 spaces, bullet, 3 spaces)

**Animation:** CSS `@keyframes` horizontal translate. Duration calculated to maintain readable scroll speed (~80px/sec). Animation loops seamlessly (duplicate item set appended for infinite scroll illusion).

**Background:** `--color-canvas-subtle` (#161b22) — slightly elevated from page canvas

**Typography:** 16px, weight 400. Author in `--color-accent-fg`. PR title in `--color-fg-default`. Repo in `--color-fg-muted`.

**Height:** 52px. Vertically centered text via `line-height: 52px`.

**Empty state:** "No recent merges in the last 24 hours" static centered text in `--color-fg-muted`.

**CSS Classes:** `.pr-ticker-bar`, `.pr-ticker-track`, `.pr-ticker-item`, `.pr-ticker-item__author`, `.pr-ticker-item__title`, `.pr-ticker-item__repo`

---

### Component Interaction Notes

- Heatmap and leaderboard render in the same horizontal band, separated by a `1px --color-border-default` vertical divider (consistent with existing `.list-view` / `.detail-panel` pattern)
- Heartbeat numbers row uses full-width layout with internal dividers
- Ticker sits in a full-width bar flush to the bottom of the page content area
- No component interacts with another — all are read-only display widgets

---

## UX Consistency Patterns

### Data Loading States

All widgets follow this sequence:
1. **Skeleton state** (immediate): Dimmed placeholder shapes at actual size. No layout shift.
2. **Populated state** (on data arrival): Smooth opacity transition (200ms) from skeleton to real data.
3. **Stale state** (on fetch failure after TTL): Existing data retained. Small `(stale)` badge in `--color-attention-fg` on widget header.
4. **Error state** (no data available): Widget header shows "last updated: N/A". Content area shows centered `--color-fg-muted` message.

### Refresh Behavior

Following the existing dashboard pattern:
- 5-minute background refresh cycle
- Uses existing `api-client.js` in-memory cache with TTL
- No full page reload — data injected into widget DOM nodes directly
- No disruption to carousel rotation during refresh

### Empty States

- **Heatmap with 0 repos:** "No repositories found for this org" centered in gray
- **Leaderboard with no commits:** "No commit activity in the last 7 days" centered in gray
- **Ticker with no merges:** Static label "No recent merges · Watching for activity..."
- **Heartbeat with 0s:** Show zeroes, not blanks. `0` is valid data.

### Number Formatting

- Commit counts ≥ 1000: `1.2k` format (never `1,247` — too many characters at display sizes)
- PR counts: Raw integer always (rarely exceeds 999 in practice)
- Pipeline counts: Raw integer for total; `✗ N` prefix format for failure count
- Time ago in ticker: `Xm ago` (minutes), `Xh ago` (hours), `Xd ago` (days) — no "just now"

---

## Responsive Design & Accessibility

### Display Target: Fixed Single Viewport

This page targets one specific display: **1920×1080 fullscreen Chromium 84 kiosk**. There is no responsive breakpoint strategy — the layout is fixed for this resolution.

**No responsive behavior required.** If the dashboard is ever viewed on a smaller screen (dev machine browser), the page may scroll or clip — this is acceptable since the Pi kiosk is the only deployment target.

### Layout Grid (1920×1080)

```
Total viewport: 1920 × 1080

Chrome elements (inherited):
  Progress bar:      4px    (fixed, top)
  Global header:    64px    (fixed, below progress bar)
  Page padding:     24px    (dashboard-container padding top + bottom = 48px total)

Available page content height: 1080 - 4 - 64 - 48 = 964px
Available page content width:  1920 - 48 = 1872px (24px padding left + right)

Page content zone breakdown:
  ORG STATS page header:     40px    (page-header + border)
  Heartbeat numbers row:     96px    (including internal padding)
  [border/gap]:               8px
  Main content zone:         712px   (heatmap + leaderboard side by side)
  [gap]:                      8px
  PR ticker:                 52px
  [gap]:                      8px
  ─────────────────────────────────
  Total:                     924px   (fits within 964px with 40px breathing room)

Main content zone split:
  Pipeline Heatmap:  60% = 1123px wide × 712px tall
  Leaderboard:       40% =  749px wide × 712px tall
  Divider: 1px border
```

### Font Sizes at Viewing Distance

All sizes validated for 10–15 foot legibility:

| Element | Size | Min Readable Distance |
|---------|------|-----------------------|
| Heartbeat stat numbers | 48px | 18 feet |
| Leaderboard count numbers | 20px | 10 feet |
| Heatmap cell labels | 10px | 5 feet (acceptable — supplementary to color) |
| Ticker text | 16px | 8 feet |
| Widget headers | 13–14px | 6 feet (supplementary context labels) |
| Leaderboard names | 16px | 8 feet |

### Chromium 84 Compatibility Requirements

- `grid-template-columns: repeat(auto-fill, minmax(90px, 1fr))` — supported in Chromium 84 ✅
- `-webkit-line-clamp` for repo name truncation in heatmap cells — required prefix ✅
- CSS `@keyframes` for ticker animation — fully supported ✅
- `border-radius: 50%` for avatar circles — fully supported ✅
- No `gap` shorthand for flexbox (use `column-gap` + `row-gap`) — Chromium 84 compat ✅
- No `aspect-ratio` CSS property (use explicit height/width) — not supported in Chromium 84 ❌ → avoid
- No `@container` queries — not supported ❌ → not needed anyway

### Accessibility Notes

As a passive kiosk display with zero user interaction, traditional accessibility requirements (keyboard navigation, ARIA roles for interactive elements) do not apply. The display is inaccessible by design — users who need accessible content use their own GitHub.com access.

**Contrast compliance (for visual design integrity):**
- All text on cell backgrounds must maintain ≥ 3:1 contrast ratio (large text standard)
- Heatmap cell text colors are chosen to meet this bar against their respective tinted backgrounds
- Heartbeat numbers: `#c9d1d9` on `#0d1117` — 11.5:1 ratio ✅

---

## Visual Artifact

The interactive HTML mockup is available at:

**[`_bmad-output/planning-artifacts/ux-mockup-org-stats.html`](./ux-mockup-org-stats.html)**

The mockup includes:
1. **Full 1920×1080 page simulation** — realistic representation of the complete carousel page
2. **Widget anatomy breakdowns** — each widget enlarged and annotated
3. **State variations** — loading, populated, stale, and error states for key widgets
4. **Heatmap data simulation** — ~100 repos with randomized CI status distribution
5. **Color token reference** — all token values used in the page

---

## Implementation Notes for Developers

### New Files to Create
- `src/js/org-stats.js` — data fetching + widget rendering class
- `src/css/org-stats.css` — widget layout and styles

### Registration Pattern (following existing convention)
In `src/js/main.js`, register new carousel page:
```javascript
import { OrgStatsPage } from './org-stats.js';
// Add 'org-stats' to carousel pages array
// Instantiate and wire up OrgStatsPage with api-client.js
```

### In `src/index.html`, add page slot:
```html
<div class="carousel-page" id="page-org-stats">
  <div class="page-header">ORG STATS</div>
  <div class="page-content">
    <!-- Widgets injected by org-stats.js -->
  </div>
</div>
```

### config.json additions required:
```json
{
  "githubOrg": "your-org-name",
  "githubToken": "ghp_...",
  "orgStatsEnabled": true
}
```

### API Rate Limit Strategy
For ~100 repos:
- Batch workflow runs: fetch last 1 run per repo = 100 requests per refresh cycle
- Commit stats: use `/stats/contributors` endpoint which returns cached weekly data (very cheap)
- PR data: fetch recent merged PRs org-wide using search API (`GET /search/issues?q=type:pr+org:{org}+merged:>{date}`) = 1 request for ticker + heartbeat
- Total per 5-min refresh: ~110 requests (safely within 5,000/hr PAT limit)

