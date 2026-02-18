# GitHub Updates Dashboard — Timeline Flow Design Specification

**Project:** github-latest-dashboard  
**Design Version:** Timeline Flow v1.0  
**Date:** 2026-02-17  
**Designer:** Sally (UX Designer)  
**Status:** Ready for Development Review

---

## 🎯 Design Overview

The Timeline Flow design transforms the GitHub Updates Dashboard into a more visually engaging, scannable interface that maintains GitHub's Primer design system aesthetic. Each column receives distinct visual treatment appropriate to its content type, with emphasis on status incidents and improved changelog categorization.

### Design Goals
- **Glanceable from distance:** Optimize for TV display viewing from 10-15 feet away
- **Visual hierarchy:** Status incidents demand attention, changelog is categorized, blog posts remain clean
- **GitHub authentic:** Use GitHub Primer color palette and design patterns
- **Scannable:** Clear visual indicators without relying on emojis

---

## 📐 Layout Structure

### Grid System
```
Container: 3-column grid layout
Column width: 1fr 1fr 1fr (equal widths)
Gap: 24px
Padding: 20px (body)
```

### Responsive Behavior
- **Above 1600px:** 3-column layout
- **Below 1600px:** Single column stack (existing behavior maintained)

---

## 🎨 Color Palette (GitHub Primer)

### Base Colors
```css
Background: #0d1117 (dark background)
Text Primary: #c9d1d9 (light gray)
Text Secondary: #7d8590 (muted gray)
Border/Divider: #21262d (subtle border)
Card Background: transparent (no cards currently)
Hover Background: #161b22 (subtle highlight)
```

### Accent Colors

#### Blog Column
```css
Border Accent: #1f6feb (GitHub blue)
```

#### Changelog Badges
```css
NEW FEATURE:   Background: #8250df (purple)
               Text: #ffffff (white)

IMPROVEMENT:   Background: #0969da (blue)
               Text: #ffffff (white)

BUG FIX:       Background: #1a7f37 (green)
               Text: #ffffff (white)

UI CHANGE:     Background: #bc4c00 (orange)
               Text: #ffffff (white)

DEPRECATION:   Background: #cf222e (red)
               Text: #ffffff (white)
```

#### Status Cards
```css
Operational:   Border/Header: #2da44e (green)
               Background: rgba(45, 164, 78, 0.1) (subtle green tint)
               Indicator: ● (filled circle)

Minor/Degraded: Border/Header: #bf8700 (yellow)
                Background: rgba(191, 135, 0, 0.1) (subtle yellow tint)
                Indicator: ▲ (filled triangle)

Major Outage:   Border/Header: #cf222e (red)
                Background: rgba(207, 34, 46, 0.1) (subtle red tint)
                Indicator: ■ (filled square)
```

---

## 📝 Typography

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
```

### Header Styles
```css
/* Main page header */
h1: 
  font-size: 1.5em (24px)
  font-weight: 600
  color: #c9d1d9
  margin-bottom: 4px

/* Last updated timestamp */
.last-updated:
  font-size: 0.75em (12px)
  color: #7d8590

/* Column headers */
h2 (Section headers):
  font-size: 1.25em (20px)
  font-weight: 600
  color: #c9d1d9
  text-transform: uppercase
  letter-spacing: 0.5px
```

### Content Styles
```css
/* Blog/Changelog item titles */
.item-title:
  font-size: 1.125em (18px)
  font-weight: 400
  color: #c9d1d9
  line-height: 1.4
  margin-bottom: 8px

/* Blog/Changelog links */
.item-title a:
  color: #58a6ff (link blue)
  text-decoration: none
  hover: #79c0ff (lighter blue)

/* Item descriptions/previews */
.item-description:
  font-size: 0.875em (14px)
  color: #7d8590
  line-height: 1.5
  max-lines: 2
  overflow: hidden

/* Timestamps */
.item-date:
  font-size: 0.75em (12px)
  color: #7d8590

/* Changelog badges */
.changelog-badge:
  font-size: 0.625em (10px)
  font-weight: 600
  text-transform: uppercase
  letter-spacing: 0.5px
  padding: 4px 8px
  border-radius: 4px
  display: inline-block
  margin-bottom: 8px

/* Changelog category tags */
.changelog-category:
  font-size: 0.75em (12px)
  color: #7d8590
  margin-bottom: 4px

/* Status card headers */
.status-header:
  font-size: 1.125em (18px)
  font-weight: 600
  margin-bottom: 12px

/* Status indicator symbol */
.status-indicator:
  font-size: 1.25em (20px)
  margin-right: 8px
  vertical-align: middle

/* Status body text */
.status-body:
  font-size: 0.875em (14px)
  line-height: 1.6
  color: #c9d1d9
```

---

## 🧩 Component Specifications

### 1. Blog Column Items

#### Structure
```
┃ [Title - 2 lines max]
┃ 
┃ [Preview text - 2 lines max]
┃ 
┃ [Timestamp]
└────────────────
```

#### Spacing
```css
.blog-item {
  padding: 12px 0 12px 12px;
  margin-bottom: 0;
  border-left: 3px solid #1f6feb;
  border-bottom: 1px solid #21262d;
}

.blog-item:hover {
  background-color: #161b22;
  padding-left: 16px; /* subtle indent on hover */
  transition: all 0.2s ease;
}
```

#### Content Rules
- **Title:** Max 2 lines, truncate with ellipsis
- **Preview:** Max 2 lines, truncate with ellipsis (strip HTML from description/content)
- **Timestamp:** Use existing formatDate() function

---

### 2. Changelog Column Items

#### Structure
```
┃ [BADGE TYPE]
┃ [Title - 2 lines max]
┃ 
┃ [Description - 2 lines max]
┃ 
┃ [Category tags]
┃ [Timestamp]
└────────────────
```

#### Spacing
```css
.changelog-item {
  padding: 12px 0 12px 12px;
  margin-bottom: 0;
  border-left: 3px solid #30363d;
  border-bottom: 1px solid #21262d;
}

.changelog-item:hover {
  background-color: #161b22;
  border-left-color: #484f58;
  transition: all 0.2s ease;
}

.changelog-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 0.625em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

#### Badge Logic (NEW!)
**This requires parsing changelog item titles or content to determine type:**

1. **Detection keywords:**
   - `[NEW FEATURE]`: "introducing", "new", "announcing", "available"
   - `[IMPROVEMENT]`: "improved", "faster", "enhanced", "better", "performance"
   - `[BUG FIX]`: "fix", "resolved", "corrected", "bug"
   - `[UI CHANGE]`: "UI", "design", "interface", "visual"
   - `[DEPRECATION]`: "deprecat", "removing", "sunset", "legacy"

2. **Fallback:** If no keywords match, default to `[UPDATE]` with neutral gray badge

3. **Badge colors:** See "Changelog Badges" in Color Palette section

#### Category Tags
- Parse from changelog content/categories if available
- Display as comma-separated plain text
- Color: #7d8590
- Examples: "API", "Security", "Pull Requests", "Actions"

---

### 3. Status Column Cards

#### Structure (Operational)
```
╔══════════════════════════╗
║  ● All Systems           ║
║    Operational           ║
║                          ║
║  No incidents reported.  ║
║  All services running    ║
║  normally.               ║
║                          ║
║  Last checked [time]     ║
╚══════════════════════════╝
```

#### Structure (Incident)
```
╔══════════════════════════╗
║  ▲ Minor Disruption      ║
║                          ║
║  [Incident Name]         ║
║                          ║
║  [Latest update body]    ║
║  [Truncated to ~3 lines] ║
║                          ║
║  [Timestamp]             ║
╚══════════════════════════╝
```

#### Spacing
```css
.status-card {
  border: 2px solid [severity-color];
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  background: [severity-color with 0.1 opacity];
}

.status-header {
  font-size: 1.125em;
  font-weight: 600;
  margin-bottom: 12px;
  color: #c9d1d9;
}

.status-indicator {
  display: inline-block;
  font-size: 1.25em;
  margin-right: 8px;
  color: [severity-color];
}

.status-body {
  font-size: 0.875em;
  line-height: 1.6;
  color: #c9d1d9;
  margin-bottom: 12px;
}

.status-timestamp {
  font-size: 0.75em;
  color: #7d8590;
}
```

#### Status Logic
- **No incidents:** Display "All Systems Operational" card (green)
- **Has incidents:** Display up to 5 most recent
- **Resolved incidents:** Show with `[RESOLVED]` tag, reduce opacity to 0.6
- **Severity mapping:**
  - `critical` or `major` → ■ Major (red)
  - `minor` → ▲ Minor (yellow)
  - `none` or operational → ● Operational (green)

---

## 📊 Data Processing Requirements

### Blog Items
- **Source:** RSS feed via rss2json.com
- **Display:** 10 items max
- **Content extraction:**
  - Title: Use `item.title`
  - Preview: Strip HTML from `item.description` or `item.content`, truncate to 150 chars
  - Timestamp: `item.pubDate` → formatDate()

### Changelog Items
- **Source:** RSS feed via rss2json.com
- **Display:** 10 items max
- **Content extraction:**
  - Title: Use `item.title`
  - Badge: Parse title/description for keywords (see Badge Logic above)
  - Description: Strip HTML from `item.description`, truncate to 120 chars
  - Categories: Parse from `item.categories` array if available, or extract from content
  - Timestamp: `item.pubDate` → formatDate()

### Status Items
- **Source:** githubstatus.com API
- **Display:** 
  - If 0 incidents: Show "All Systems Operational" card
  - If >0 incidents: Show up to 10 most recent
- **Content extraction:**
  - Name: `incident.name`
  - Status: `incident.status` (investigating, identified, monitoring, resolved)
  - Impact: `incident.impact` (critical, major, minor, none)
  - Latest update: `incident.incident_updates[0].body` (strip HTML, truncate to 200 chars)
  - Timestamp: `incident.created_at` → formatDate()

---

## 🎭 Interaction States

### Hover States
```css
/* Blog items */
.blog-item:hover {
  background-color: #161b22;
  padding-left: 16px;
  transition: all 0.2s ease;
}

/* Changelog items */
.changelog-item:hover {
  background-color: #161b22;
  border-left-color: #484f58;
  transition: all 0.2s ease;
}

/* Status cards - no hover (non-interactive display) */

/* Links */
a:hover {
  color: #79c0ff;
  text-decoration: underline;
}
```

### Loading States
```css
.loading {
  text-align: center;
  padding: 40px 0;
  font-size: 1em;
  color: #7d8590;
}
```

### Error States
```css
.error {
  background: transparent;
  border-left: 3px solid #f85149;
  padding: 12px 0 12px 12px;
  color: #f85149;
  margin: 8px 0;
}
```

---

## ♿ Accessibility Considerations

1. **Color contrast:** All text meets WCAG AA standards
2. **Status indicators:** Use shapes (●▲■) in addition to color for status differentiation
3. **Link affordance:** Clear hover states and underlines on hover
4. **Keyboard navigation:** Maintain focus states for interactive elements (links)
5. **Screen readers:** Semantic HTML structure with proper heading hierarchy

---

## 🚧 Known Implementation Challenges

### 1. Changelog Badge Detection
**Challenge:** RSS feed doesn't provide structured change type metadata  
**Proposed Solution:** Keyword-based parsing of title/description  
**Risk:** May misclassify some items  
**Mitigation:** Default to neutral `[UPDATE]` badge if uncertain

### 2. Category Tag Extraction
**Challenge:** Changelog items may not have structured category data  
**Proposed Solution:** Parse from `categories` array if available, otherwise extract keywords from content  
**Fallback:** Omit category tags if no data available

### 3. Status Card Content Truncation
**Challenge:** Some incident updates can be very long  
**Proposed Solution:** Truncate to ~200 chars (approx 3 lines at current font size)  
**Enhancement Opportunity:** Consider "Read more" link to GitHub status page

### 4. Timeline Flow Scroll Behavior
**Challenge:** Columns may have different heights based on content  
**Current Behavior:** Each section independently scrollable  
**Consideration:** Is this desired, or should columns sync-scroll?

---

## 📱 Responsive Breakpoints

```css
/* Maintain existing responsive behavior */
@media (max-width: 1600px) {
  .dashboard-container {
    grid-template-columns: 1fr; /* Stack to single column */
  }
}
```

**Note:** For TV display (primary use case), this breakpoint won't be hit. Maintains compatibility with smaller screens.

---

## 🔄 Animation & Performance

### Fade-in Animation (Existing)
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.item {
  animation: fadeIn 0.5s ease-out;
}
```

**Keep this for new items on refresh.**

### Performance Considerations
- Use `will-change` sparingly for animated elements
- Avoid animating expensive properties (stick to opacity and transform)
- Maintain 60fps on Raspberry Pi 3B hardware

---

## 📦 Assets Required

**None.** All visual elements use CSS, text, and Unicode characters (●▲■).

---

## ✅ Definition of Done

Design implementation is complete when:

1. ✅ All three columns render with distinct visual treatments
2. ✅ Blog items show blue left border and preview text
3. ✅ Changelog items display colored badges based on change type
4. ✅ Status cards render with colored borders and appropriate indicators (●▲■)
5. ✅ Color palette matches GitHub Primer specifications
6. ✅ Typography sizes and weights match specifications
7. ✅ Hover states work on blog and changelog items
8. ✅ Responsive breakpoint behavior maintained
9. ✅ Existing auto-refresh functionality continues to work
10. ✅ Display is readable from 10-15 feet away on TV

---

## 🎨 Design Sign-off

**Designer:** Sally (UX Designer)  
**Status:** ✅ Ready for development review  
**Next Step:** Party Mode review with development team

---

## Appendix: Visual Reference

```
BLOG COLUMN                  CHANGELOG COLUMN              STATUS COLUMN
━━━━━━━━━━━━━━━━━━━━        ━━━━━━━━━━━━━━━━━━━━          ━━━━━━━━━━━━━━━━━━━━

┃ Title here               ┃ [NEW FEATURE]              ╔══════════════════╗
┃                          ┃ Feature name               ║ ● Operational    ║
┃ Preview text             ┃                            ║                  ║
┃ excerpt...               ┃ Description here           ║ All good here... ║
┃                          ┃                            ║                  ║
┃ 2 hours ago              ┃ Category tags              ║ 1m ago           ║
└──────────────            ┃ Just now                   ╚══════════════════╝
                           └────────────────

Blue left border           Purple badge                Green border/bg
Clean & minimal            Categorized & labeled       Hero card treatment
```

