---
stepsCompleted: [1, 2, 3, 4]
status: complete
session_topic: 'GitHub Org Repo Statistics and Visualizers — new dashboard page'
session_goals: 'Identify stats, data points, and visual treatments for a TV kiosk page showing org-wide GitHub activity, CI/CD health (GitHub Actions + ADO), and team recognition'
selected_approach: 'Crazy 8s → divergent ideation across categories'
constraints:
  - ~100 repos in org
  - PAT-authenticated GitHub REST API
  - Dual pipeline support: GitHub Actions + Azure DevOps (migration in progress)
  - Last 7 days as primary timeframe
  - TV kiosk on Raspberry Pi 3B — glanceable from 10-15 feet
  - Vanilla JS, no frameworks, Chromium 84
  - Existing carousel page slot (30s rotation)
  - Balance: Recognition/pride + Operational awareness
ideas: []
---

# Brainstorming Session: GitHub Org Repo Statistics & Visualizers
**Date:** 2026-04-27
**Facilitator:** John (PM) + Brainstorming Mode

---

## Survivors (12 of 32)

### THEME A: "Org Vitals" — Always-visible heartbeat
*Big, glanceable numbers and ambient signals that work from 15 feet away*

- **#7 — Org Heartbeat Numbers** — Total commits, PRs opened/merged, pipelines run/failed this week. Bold ticker-style numbers, updated every 5 min.
- **#13 — Commit Wave** — Animated wave whose amplitude = commit frequency in last hour. Pure ambient rhythm, no numbers needed.
- **#24 — Code Density Pulse** — Lines added vs. deleted this week. Two opposing green/red bars. Building vs. paying tech debt.
- **#27 — Branch Debt Counter** — Single number: stale branches >14 days old with no activity. Color-coded health indicator.

### THEME B: "Who's Shipping" — Recognition and social energy
*Makes people visible and celebrated on the TV*

- **#2 — Commit Leaderboard** — Top-10 contributors by commits (7 days), big avatars, names, count. Sports scoreboard energy.
- **#5 — PR Merge Celebration** — Live animation/ticker when PRs merge anywhere in the org. Repo name, PR title, author. Makes the TV feel alive.
- **#17 — Repo Streak Counter** — Consecutive days with ≥1 commit per repo. Top streak-holders leaderboard. Celebrates consistency.
- **#25 — Review Response Time** — Avg hours from PR open → first review across org this week. Trend arrow vs. last week.

### THEME C: "Repo Intelligence" — Visual org map
*Data visualized spatially or structurally across 100 repos*

- **#1 — Pipeline Heatmap** — 100-repo grid, each cell red/yellow/green by last CI run status. GitHub Actions + ADO both represented. Full org health at a glance.
- **#30 — Repo Activity Constellation** — Dot map: size = commit volume, brightness = recency of last commit. Clusters by topic tag. A living star map.
- **#9 — PR Aging Wall** — Top 5 longest-open PRs across all repos, sorted by age. Ops awareness, not shame.
- **#8 — Code Language Globe** — Org-wide programming language breakdown. Animated donut or proportional bars. Ambient conversation starter.

---

## Page Architecture (Emerging)

| Zone | Content | Refresh |
|------|---------|---------|
| Top strip | Org Heartbeat Numbers (#7) + Code Density Pulse (#24) | 5 min |
| Main visual | Rotating: Heatmap (#1), Constellation (#30), Commit Wave (#13) | 30s each |
| Side panel | Commit Leaderboard (#2) + Streak Counter (#17) | 5 min |
| Live feed | PR Merge Celebration (#5) ticker | Real-time |
| Bottom strip | Review Response Time (#25), PR Aging Wall (#9), Branch Debt (#27), Language Globe (#8) | 5 min |

---

## Key Design North Star

Every survivor is **visual-first, no tables, no text walls**. All killed ideas were list/report style.
This page should feel like a **live instrument panel**, not a metrics dashboard.

---

## Constraints Captured

- ~100 repos in org
- PAT-authenticated GitHub REST API
- Dual pipeline support: GitHub Actions + Azure DevOps (migration in progress)
- Last 7 days as primary timeframe
- TV kiosk on Raspberry Pi 3B — glanceable from 10–15 feet
- Vanilla JS, no frameworks, Chromium 84
- Existing carousel page slot (30s rotation)
- Balance: Recognition/pride + Operational awareness

---

## Next Steps

- [ ] Invoke `bmad-create-prd` using this session as input
- [ ] Define GitHub REST API endpoints for each survivor widget
- [ ] Define ADO REST API endpoints for pipeline data
- [ ] Determine PAT scope requirements (read:org, repo, workflow)

