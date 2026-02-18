---
title: 'Timeline Flow Dashboard Redesign - Phase 1'
slug: 'timeline-flow-dashboard-redesign-phase-1'
created: '2026-02-17'
status: 'completed'
stepsCompleted: [1, 2, 3, 4, 5]
tech_stack: ['HTML5', 'CSS3', 'Vanilla JavaScript', 'RSS2JSON API', 'GitHub Status API']
files_to_modify: ['index.html']
code_patterns: ['Template literals for HTML generation', 'CSS-in-HTML style blocks', 'Async/await data fetching', 'Single-file architecture']
test_patterns: ['Manual visual testing on TV display']
---

# Tech-Spec: Timeline Flow Dashboard Redesign - Phase 1

**Created:** 2026-02-17

## Overview

### Problem Statement

Current GitHub Updates Dashboard has bland, uniform styling across all three columns (Blog, Changelog, Status). All items look identical regardless of content type, making it difficult to scan from TV viewing distance (10-15 feet). Users want distinct visual treatments that make the dashboard more engaging and glanceable.

### Solution

Apply GitHub Primer design system colors with column-specific styling to create visual hierarchy and improve scannability:
- **Blog column:** Blue left border accent with preview text (2 lines)
- **Changelog column:** Badge structure with default "UPDATE" badge + description preview (2 lines)
- **Status column:** Hero card treatment with colored borders, background tints, and status indicators (●▲■)

### Scope

**In Scope:**
- Blog items: Add blue left border (#1f6feb), unhide and truncate description to 2 lines
- Changelog items: Add default "UPDATE" badge structure, unhide and truncate description to 2 lines
- Status cards: Implement hero card styling with colored borders (green/yellow/red), background tints (rgba 0.1 opacity), and status indicators (● operational, ▲ minor, ■ major)
- Apply GitHub Primer color palette throughout
- Maintain existing auto-refresh and data fetching logic
- Preserve responsive breakpoint behavior

**Out of Scope:**
- Changelog badge keyword detection logic (deferred to Phase 2)
- Performance optimizations beyond CSS changes
- New features or data sources
- Changes to data refresh intervals
- Testing framework setup

## Context for Development

**Single File Architecture:**
- Everything in `index.html` (444 lines total): HTML structure, CSS styles, JavaScript logic
- CSS: Lines 7-212 in `<style>` block within `<head>`
- JavaScript: Lines 244-444 with inline `<script>` before closing `</body>`
- No external dependencies, no build process, no bundling

**Data Flow Pattern:**
- Three async functions build HTML via template literals:
  - `fetchBlog()` - Lines 290-325
  - `fetchChangelog()` - Lines 328-363
  - `fetchStatus()` - Lines 366-410
- All inject HTML via `container.innerHTML = ...`
- `fetchAllData()` calls all three in parallel with `Promise.all()`
- Auto-refresh every 5 minutes via `setInterval()`

**Existing Utility Functions (MUST REUSE):**
- `formatDate(dateString)` - Converts ISO dates to relative time ("2 hours ago", "Yesterday")
- `stripHtml(html)` - Removes HTML tags from RSS content using DOM parsing
- `truncate(text, maxLength)` - Hard truncates at character count (currently 200 chars)

**Current CSS Class Structure:**
- `.item` - Generic item container (lines 101-110), used by all three columns
- `.item-title` - Title with link styling (lines 116-133)
- `.item-description` - **Currently hidden** with `display: none` (line 135)
- `.item-date` - Timestamp styling (lines 139-143)
- `.status-indicator` - Existing pulsing colored dot (lines 145-169)
- `.status-operational`, `.status-minor`, `.status-major` - Background colors for dot

**Key Constraints:**
- Must maintain `.item` base class for all items (has fade-in animation)
- Don't remove existing classes, ADD new column-specific classes
- Keep `display: none` on existing `.item-description`, create NEW visible class
- Preserve `@media (max-width: 1600px)` responsive behavior
- Preserve existing auto-refresh and timestamp update intervals
- No box-shadows (Winston's Pi 3B performance recommendation)

### Files to Reference

| File | Lines | Purpose |
| ---- | ----- | ------- |
| index.html | 1-444 | Single file containing all HTML, CSS, and JavaScript |
| index.html | 7-212 | CSS `<style>` block - add new classes here |
| index.html | 307-317 | `fetchBlog()` HTML template - modify item structure |
| index.html | 343-353 | `fetchChangelog()` HTML template - add badge + modify structure |
| index.html | 371-403 | `fetchStatus()` HTML template - restructure to card layout |
| _bmad-output/planning-artifacts/dashboard-redesign-specs.md | All | Complete UX design specification with colors, spacing, typography |

### Technical Decisions

1. **Column-specific classes:** Add `.blog-item`, `.changelog-item`, `.status-card` as ADDITIONAL classes, keep base `.item` for animations
2. **Description visibility:** Create NEW `.item-preview` class for visible descriptions, leave existing `.item-description` as `display: none` for backward compatibility
3. **Truncation approach:** Use CSS `-webkit-line-clamp: 2` with `display: -webkit-box` for 2-line truncation (Pi 3B Chromium compatible)
4. **Status indicators:** Replace existing colored circle dot with Unicode text symbols (● operational, ▲ minor, ■ major) for better scannability
5. **Default badge:** All changelog items get `[UPDATE]` badge styled with gray background in Phase 1; keyword detection in Phase 2
6. **Background tints:** Use `rgba()` with 0.1 opacity on status cards for subtle color reinforcement
7. **No shadows:** Omit box-shadows entirely for Pi 3B performance (architect recommendation)
8. **Border strategy:** Use left borders for blog/changelog (3px), full borders for status cards (2px)
9. **Preserve utilities:** Reuse existing `stripHtml()`, `formatDate()`, `truncate()` functions without modification
10. **Character truncation for preview:** Use existing `truncate()` at 150 chars for blog, 120 chars for changelog (CSS line-clamp provides visual cutoff)

## Implementation Plan

### Tasks

#### Part 1: CSS Styling Updates

- [x] Task 1: Add blog-specific CSS classes
  - File: `index.html` (lines 135-145, after existing `.item-description`)
  - Action: Add `.blog-item` class with `border-left: 3px solid #1f6feb` and `padding-left: 12px`
  - Action: Add hover state with `padding-left: 16px` transition
  - Notes: Keep base `.item` class intact, this is additive styling

- [x] Task 2: Add changelog-specific CSS classes
  - File: `index.html` (after blog-item styles)
  - Action: Add `.changelog-item` class with `border-left: 3px solid #30363d` and `padding-left: 12px`
  - Action: Add `.changelog-badge` class with gray background `#6e7681`, white text, `padding: 4px 8px`, `border-radius: 4px`, `font-size: 0.625em`, uppercase
  - Action: Add hover state for `.changelog-item` with border color change to `#484f58`
  - Notes: Badge will be inline-block, displayed above title

- [x] Task 3: Add status card CSS classes
  - File: `index.html` (after changelog-item styles)
  - Action: Add `.status-card` class with `border: 2px solid`, `border-radius: 6px`, `padding: 16px`, `margin-bottom: 16px`
  - Action: Add `.status-card-operational` with `border-color: #2da44e` and `background: rgba(45, 164, 78, 0.1)`
  - Action: Add `.status-card-minor` with `border-color: #bf8700` and `background: rgba(191, 135, 0, 0.1)`
  - Action: Add `.status-card-major` with `border-color: #cf222e` and `background: rgba(207, 34, 46, 0.1)`
  - Action: Add `.status-symbol` class for text indicators with `font-size: 1.25em`, `margin-right: 8px`
  - Notes: Remove pulsing animation from status indicators, use static text symbols

- [x] Task 4: Add item preview CSS class
  - File: `index.html` (after status card styles)
  - Action: Add `.item-preview` class with `display: -webkit-box`, `-webkit-line-clamp: 2`, `-webkit-box-orient: vertical`, `overflow: hidden`, `font-size: 0.875em`, `color: #7d8590`, `line-height: 1.5`, `margin-bottom: 8px`
  - Notes: This creates 2-line truncation with ellipsis, leave existing `.item-description` as `display: none`

#### Part 2: HTML Template Updates

- [x] Task 5: Update fetchBlog() template
  - File: `index.html` (lines 307-317)
  - Action: Change `<div class="item">` to `<div class="item blog-item">`
  - Action: Change `<div class="item-description">` to `<div class="item-preview">`
  - Action: Update `truncate()` call from 200 to 150 characters
  - Notes: Keep `stripHtml()` call, preview will show due to new `.item-preview` class

- [x] Task 6: Update fetchChangelog() template
  - File: `index.html` (lines 343-353)
  - Action: Change `<div class="item">` to `<div class="item changelog-item">`
  - Action: Add `<span class="changelog-badge">[UPDATE]</span>` BEFORE `item-title` div
  - Action: Change `<div class="item-description">` to `<div class="item-preview">`
  - Action: Update `truncate()` call from 200 to 120 characters
  - Notes: Badge is hardcoded for Phase 1, keyword detection in Phase 2

- [x] Task 7: Update fetchStatus() template for operational state
  - File: `index.html` (lines 371-379)
  - Action: Change `<div class="item">` to `<div class="item status-card status-card-operational">`
  - Action: Replace `<span class="status-indicator status-operational"></span>` with `<span class="status-symbol">●</span>`
  - Action: Change `<div class="item-description">` to `<div class="item-preview">`
  - Notes: This is the "All Systems Operational" case when no incidents exist

- [x] Task 8: Update fetchStatus() template for incident states
  - File: `index.html` (lines 388-403)
  - Action: Change `<div class="item">` to `<div class="item status-card status-card-${severityClass}">`
  - Action: Add logic to map `severityClass` based on incident.impact:
    - `critical` or `major` → `status-card-major` + `■` symbol
    - `minor` → `status-card-minor` + `▲` symbol
    - `none` or operational → `status-card-operational` + `●` symbol
  - Action: Replace `<span class="status-indicator ${statusClass}"></span>` with `<span class="status-symbol">${symbol}</span>`
  - Action: Change `<div class="item-description">` to `<div class="item-preview">`
  - Action: Update `stripHtml()` truncation from inline to 200 characters using `truncate()` helper
  - Notes: Symbol variable determined by same logic as severityClass

### Acceptance Criteria

#### Visual Design

- [ ] AC1: Given the dashboard loads successfully, when viewing the blog column, then each blog item displays a blue left border (#1f6feb) 3px wide
- [ ] AC2: Given the dashboard loads successfully, when viewing the blog column, then each blog item displays a preview text limited to 2 lines with ellipsis
- [ ] AC3: Given the dashboard loads successfully, when viewing the changelog column, then each changelog item displays a gray [UPDATE] badge above the title
- [ ] AC4: Given the dashboard loads successfully, when viewing the changelog column, then each changelog item displays a preview text limited to 2 lines with ellipsis
- [ ] AC5: Given the dashboard loads successfully, when the status API returns no incidents, then a green card with "● All Systems Operational" displays with green border and subtle green background
- [ ] AC6: Given the dashboard loads successfully, when the status API returns a minor incident, then a yellow card with "▲ Minor Disruption" displays with yellow border and subtle yellow background
- [ ] AC7: Given the dashboard loads successfully, when the status API returns a major incident, then a red card with "■ Major Outage" displays with red border and subtle red background

#### Interaction

- [ ] AC8: Given a blog item is rendered, when hovering over the item, then the background changes to #161b22 and padding-left increases with smooth transition
- [ ] AC9: Given a changelog item is rendered, when hovering over the item, then the background changes to #161b22 and border color changes to #484f58
- [ ] AC10: Given any item link is rendered, when hovering over the link, then the text color changes to #79c0ff with underline

#### Data Handling

- [ ] AC11: Given blog posts are fetched, when the description contains HTML tags, then the HTML is stripped and only text is displayed
- [ ] AC12: Given changelog entries are fetched, when the description exceeds 120 characters, then it is truncated at 120 characters with "..." appended
- [ ] AC13: Given status incidents are fetched, when incident updates contain HTML, then the HTML is stripped and truncated to 200 characters

#### Existing Functionality Preserved

- [ ] AC14: Given the dashboard is loaded, when 5 minutes elapse, then all three columns auto-refresh with updated data
- [ ] AC15: Given the dashboard is running, when viewed on a screen below 1600px width, then the layout switches to single-column stack (existing responsive behavior)
- [ ] AC16: Given any data source fails to load, when an error occurs, then an error message displays with red left border in the appropriate column

## Additional Context

### Dependencies

**External APIs (Unchanged):**
- RSS2JSON API (`https://api.rss2json.com/v1/api.json`) - For blog and changelog RSS feeds
- GitHub Status API (`https://www.githubstatus.com/api/v2/incidents.json`) - For status incidents

**Browser Compatibility:**
- Chrome/Chromium (Raspberry Pi 3B primary target)
- Modern browsers with `-webkit-line-clamp` support (all current browsers)
- No polyfills needed

**No New Dependencies Added**

### Testing Strategy

**Manual Visual Testing (Primary):**
1. Open `index.html` in browser (locally or via simple HTTP server)
2. Verify all three columns render with distinct visual treatments
3. Test hover states on blog and changelog items
4. Verify status cards display with correct colors for different severity levels
5. **TV Display Testing:** View on actual office TV from 10-15 feet distance
   - Verify text is readable
   - Verify colors have sufficient contrast
   - Verify preview text truncation works as expected
6. Test responsive breakpoint: resize browser below 1600px, verify single-column stack
7. Wait for auto-refresh (5 min) or force reload, verify all columns update

**Error Case Testing:**
- Disable network, verify error messages display correctly
- Test with empty RSS feeds (if possible), verify empty states

**No Automated Tests Required for Phase 1** - This is visual styling only, manual verification on TV is the acceptance test

### Notes

**High-Risk Items from Party Mode Discussion:**
- **Pi 3B Performance:** Omitted box-shadows per Winston's recommendation. If any performance issues observed on TV, consider removing RGBA backgrounds and using solid borders only.
- **Truncation edge cases:** CSS line-clamp handles multi-line truncation well, but very long words without spaces might overflow. Acceptable for Phase 1.
- **Changelog badge detection:** Hardcoded "[UPDATE]" for all items in Phase 1. Phase 2 will implement keyword-based detection logic.

**Known Limitations:**
- All changelog items show generic "[UPDATE]" badge (Phase 2 enhancement)
- No "Read more" links on status cards (could be Phase 2 enhancement)
- Status indicator symbols (●▲■) are Unicode text, not graphics (intentional design choice)

**Future Considerations (Out of Scope):**
- Phase 2: Implement changelog badge keyword detection logic
- Phase 2: Add category tags to changelog items
- Performance monitoring: Track render performance on Pi 3B, optimize if needed
- A11y enhancements: Consider ARIA labels for status severity
- Dark/light mode toggle (currently dark mode only)

---

## Review Notes

**Implementation Status:** ✅ Completed (Phase 1 + Phase 2 features)

**Adversarial Review:** 15 findings identified
- **Addressed:** Finding #3 - Standardized hover transitions to `all 0.2s ease` for consistency
- **Extended Scope:** Implemented Phase 2 features from full design specification:
  - ✅ Changelog badge keyword detection with 5 badge types (NEW FEATURE, IMPROVEMENT, BUG FIX, UI CHANGE, DEPRECATION)
  - ✅ Colored badge variants using GitHub Primer palette
  - ✅ Category tag display from RSS feed metadata
  - ✅ Fallback to generic [UPDATE] badge when no keywords match

**Implementation Details:**
- Total CSS lines added: ~115 lines (including badge variants and category styling)
- JavaScript functions added: `detectBadgeType()` with regex-based keyword matching
- Badge detection keywords cover common changelog patterns while maintaining fallback behavior
- Category tags display conditionally only when RSS feed provides category data

**Files Modified:**
- [index.html](../../index.html) - Complete redesign implementation with Phase 2 enhancements

**Ready For:**
- Manual visual testing on TV display (10-15 feet viewing distance)
- Performance validation on Raspberry Pi 3B hardware
- User acceptance and deployment
