---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-users', 'step-05-features', 'step-06-technical', 'step-07-implementation', 'step-08-risks', 'step-11-complete', 'step-e-01-discovery', 'step-e-02-review', 'step-e-03-edit']
inputDocuments: ['_bmad-output/planning-artifacts/product-brief-github-latest-dashboard-2026-02-17.md', '_bmad-output/brainstorming/brainstorming-session-2026-02-17.md', 'README.md', 'issues/4.md']
workflowType: 'prd'
briefCount: 1
brainstormingCount: 1
researchCount: 0
projectDocsCount: 1
lastEdited: '2026-03-02'
editHistory:
  - date: '2026-03-02'
    changes: 'Integrated carousel redesign as Post-MVP Phase 1: Added F4-F7 features (carousel architecture, split-view layout, dual rotation, detail rendering), TR6-TR8 technical requirements, enhanced success criteria, expanded user journey, detailed Phase 5 implementation plan'
classification:
  projectType: 'web_app'
  domain: 'general'
  complexity: 'low'
  projectContext: 'brownfield'
---

# Product Requirements Document - github-latest-dashboard

**Author:** Shane
**Date:** 2026-02-17

## Executive Summary

**GitHub Updates Office Dashboard** provides passive awareness of GitHub platform updates for development teams. The dashboard displays GitHub blog posts, changelog entries, and status incidents on an office TV, catching developers' attention as they walk by and prompting them to investigate relevant updates at their desks.

**Target Users:** Software engineers and technical staff who work with GitHub daily and walk past the office TV regularly in a high-traffic area.

**Problem Being Solved:** Development teams struggle to stay current with GitHub platform updates across three sources (blog, changelog, status page). Active monitoring creates friction that people avoid, leading to missed status updates, surprise breaking changes, undiscovered new features, and inconsistent team awareness.

**Evolution:** The MVP establishes the foundation with a three-column layout. Post-MVP Phase 1 introduces a carousel architecture with split-view detail panels, enabling deeper information engagement while maintaining passive awareness.

### What Makes This Special

**Trigger mechanism, not destination:** The TV sparks awareness and prompts action rather than serving as the primary information source. Developers see something interesting and investigate at their desk.

**Zero friction passive consumption:** Requires absolutely no effort from developers. Information is available when walking by - no active checking, no notifications to ignore, no interruptions to focused work.

**Shared team visibility:** Everyone sees the same updates simultaneously, creating common context that individual subscriptions or notifications cannot provide.

**Dead simple infrastructure:** Single HTML file + Raspberry Pi + kiosk mode = maximum reliability with minimal complexity. No cloud services, no complex deployment, no ongoing maintenance burden.

## Project Classification

- **Project Type:** Web App (single-page browser-based dashboard)
- **Domain:** General / Internal Tooling  
- **Complexity:** Low
- **Project Context:** Brownfield (enhancing existing working dashboard)

---

## Success Criteria

### Primary Success Indicator
Developers notice information on the dashboard and take action to investigate further.

**Observable Behaviors:**
- Developer walks by, sees something interesting (status incident, changelog update, new feature)
- Returns to their desk to investigate further
- Shares findings with team or adjusts work based on the information

### Qualitative Success Metrics
- Developers reference updates they saw on the board in conversation ("Hey, did you see that GitHub status thing on the TV?")
- Team demonstrates shared awareness of GitHub ecosystem changes
- Updates don't come as surprises because someone already spotted them on the dashboard

### Technical Success Metrics
- Dashboard runs reliably 24/7 without manual intervention
- Auto-refresh functionality works consistently
- Information displays clearly and is readable from walking distance
- Raspberry Pi setup requires minimal maintenance

### Post-MVP Carousel Success Metrics
- Developers pause briefly to read detail view content when item of interest is highlighted
- Item rotation timing allows comfortable reading without feeling rushed
- Page transitions feel smooth and natural, not disruptive
- Progress bar accurately tracks page position in rotation cycle

---

## User Personas

### Primary User: Development Team Members

**Profile:** Software engineers and technical staff who work with GitHub daily and regularly walk past the office TV in high-traffic area.

**Needs:**
- Passive awareness of GitHub status incidents that might affect their work
- Knowledge of changelog updates about new features or breaking changes
- Discovery of blog posts about platform improvements
- Zero-effort information consumption that doesn't interrupt focused work

**Success State:** Glancing at the TV while walking to/from their desk and catching important updates without needing to actively check multiple sources.

**User Journey:**
1. **Passive Discovery:** Developer walks past TV in high-traffic area
2. **Glance & Absorb:** Quick visual scan of displayed information (5-10 seconds)
3. **Interest Triggered:** Something catches their attention (status incident, relevant changelog, interesting feature)
4. **Deep Dive:** Returns to desk to investigate further via GitHub directly
5. **Ongoing Awareness:** Regular walk-bys create ambient awareness of GitHub ecosystem

**Post-MVP Carousel Journey:**
1. **Page Awareness:** Developer notices current page context (Blog/Changelog/Status)
2. **List Scan:** Quickly scans left-side item list for topics of interest
3. **Detail View:** Observes highlighted item detail on right side
4. **Wait or Walk:** If interested, pauses briefly to read detail; otherwise continues walking
5. **Return for Deep Dive:** Returns to desk if detail view sparks strong interest

---

## MVP Feature Requirements

**Note:** MVP features may already be implemented via Quick Dev workflows. This section establishes the baseline functionality.

### F1: Dashboard UI - Basic GitHub Styling

**Description:** Apply basic GitHub-inspired color scheme and typography to existing dashboard for MVP deployment.

**Requirements:**
- Apply GitHub-inspired dark theme colors (dark backgrounds, appropriate accent colors)
- Use GitHub-compatible typography and font stack
- Ensure readable layout optimized for TV viewing from walking distance
- Maintain current three-column layout (Blog, Changelog, Status)

**Acceptance Criteria:**
- [ ] Dashboard uses GitHub-inspired color palette
- [ ] Typography is readable from 10+ feet away
- [ ] Layout remains clean and scannable at TV resolution
- [ ] Existing data feeds continue to display correctly

**Post-MVP:** Full GitHub design system implementation with Sally's design expertise, including mockups and detailed styling specifications.

### F2: Data Sources - Existing Feeds

**Description:** Maintain existing GitHub data source integrations (no changes for MVP).

**Current Implementation:**
- GitHub Blog - RSS feed via rss2json.com API
- GitHub Changelog - RSS feed via rss2json.com API  
- GitHub Status - REST API from githubstatus.com
- Auto-refresh every 5 minutes
- Display 10 items per section

**Acceptance Criteria:**
- [ ] All three data sources continue to function correctly
- [ ] Auto-refresh continues to work every 5 minutes
- [ ] API calls handle errors gracefully

**Post-MVP:** Visual emphasis for critical status incidents, additional data sources if team finds value.

### F3: Raspberry Pi Kiosk Deployment

**Description:** Configure Raspberry Pi to run Chromium in kiosk mode, auto-starting the dashboard on boot.

**Requirements:**
- Raspberry Pi OS Lite installation
- Chromium browser in kiosk mode (fullscreen, no UI elements)
- Auto-start on boot directly to dashboard
- Hide mouse cursor (`unclutter` utility)
- Disable screensaver and screen sleep
- Local HTTP server serving the dashboard HTML file
- Connected to guest WiFi network

**Acceptance Criteria:**
- [ ] Pi boots directly into fullscreen dashboard (no desktop visible)
- [ ] Mouse cursor is hidden
- [ ] Screen never sleeps or shows screensaver
- [ ] Dashboard loads automatically on boot
- [ ] System survives power outages and auto-recovers
- [ ] Setup is documented for future replication

**Technical Specifications:**
- **Hardware:** Raspberry Pi (model 3 or newer)
- **OS:** Raspberry Pi OS Lite (headless, minimal footprint)
- **Browser:** Chromium with kiosk mode flags
- **HTTP Server:** Python built-in HTTP server (`python -m http.server`)
- **Network:** Guest WiFi (isolated from corporate network)
- **Power Management:** Always-on, auto-reboot on power loss
- **Maintenance:** Physical access only, no remote management

---

## Post-MVP Feature Requirements

### F4: Carousel Page Architecture

**Description:** Transform single-page layout into multi-page carousel where each page represents a data source (Blog, Changelog, Status).

**Requirements:**
- Each page displays one data source (replaces simultaneous three-column layout)
- Pages rotate automatically on configurable timer (default: 30 seconds per page)
- Progress bar tracks page-level transitions only
- Progress bar resets when moving to next page
- Page transitions complete within 500ms with fade animation, no visible flicker or content jump
- Page rotation continues indefinitely in cycle

**Acceptance Criteria:**
- [ ] Three pages implemented: Blog page, Changelog page, Status page
- [ ] Page rotation timer configurable (minimum 10 seconds, maximum 120 seconds)
- [ ] Progress bar displays page position and animates transition
- [ ] Page transitions render smoothly without visual artifacts
- [ ] Rotation cycle restarts after final page completes

### F5: Split-View Layout

**Description:** Each page displays split-view with item list on left and detail view on right.

**Requirements:**
- **Left side:** List of items (styled similar to original column layout)
- **Right side:** Expanded detail view of currently highlighted item
- Left side maintains vertical list format with minimum 16px spacing between items
- Right side provides expanded content area for detailed information
- Layout responsive to maintain readability at TV resolution (1920x1080)
- Split-view proportions: left side 35% width, right side 65% width (configurable via CSS variables)

**Acceptance Criteria:**
- [ ] Left side displays item list in vertical layout
- [ ] Right side displays detail content for selected item
- [ ] List items show title and timestamp
- [ ] Detail view shows title, timestamp, full description/content, and link
- [ ] Layout maintains proper proportions at 1920x1080 resolution
- [ ] Content readable from 10+ feet away

### F6: Dual Rotation System

**Description:** Independent rotation timers for page transitions and item highlighting within pages.

**Requirements:**
- **Page-level timer:** Controls page transitions (independent)
- **Item-level timer:** Controls highlighted item within current page (independent)
- Item rotation timer configurable (default: 8 seconds per item)
- Visual indicator shows which item is currently highlighted
- Item rotation cycles through all items on current page
- Item rotation resets when page changes
- Both timers operate independently without interference

**Acceptance Criteria:**
- [ ] Page timer and item timer operate independently
- [ ] Item highlight cycles through all items on current page
- [ ] Visual highlight indicator uses: bold text (font-weight: 700), distinct background color (contrast ratio ≥ 3:1 with unhighlighted items), and optional icon
- [ ] Item timer configurable (minimum 3 seconds, maximum 30 seconds)
- [ ] Item rotation resets when page transitions occur
- [ ] Highlight transitions complete within 300ms with no visible flicker

### F7: Detail View Rendering System

**Description:** Right-side panel dynamically renders detail content for currently highlighted item.

**Requirements:**
- Detail view updates when highlighted item changes
- Content transitions complete within 200ms using fade effect (opacity 0 to 1)
- Detail view renders full item information:
  - Full title (no truncation)
  - Complete timestamp with relative time
  - Full description or summary (from RSS/API)
  - Direct link URL (displayed for reference)
- Content formatted for readability: minimum 20px line-height, 16px minimum font size, WCAG AA contrast ratio (4.5:1 for body text)
- Handle missing content gracefully (e.g., no description available)

**Acceptance Criteria:**
- [ ] Detail view updates within 200ms of item highlight change
- [ ] All item metadata displayed: title, timestamp, description, link
- [ ] Content transitions render smoothly (fade or slide animation)
- [ ] Typography optimized for TV viewing distance (10+ feet)
- [ ] Missing content shows placeholder message, not broken layout
- [ ] HTML content from RSS feeds properly sanitized and rendered

**Technical Considerations:**
- Memory management: Ensure no memory leaks during continuous rotation
- Performance: Detail view rendering must not cause UI lag or timer drift
- State management: Track current page, current item, timer states independently
- Accessibility: Maintain semantic HTML structure even though interaction is passive

---

## Technical Requirements

### TR1: Browser Compatibility
- Primary target: Chromium on Raspberry Pi OS
- Fallback compatibility: Chrome, Firefox, Edge (for development/testing)

### TR2: Performance Requirements
- Dashboard page load time: < 2 seconds on Raspberry Pi
- Auto-refresh execution: < 1 second to update content
- No memory leaks over extended runtime (tested for 7+ days continuous operation)

### TR3: Network Requirements
- Guest WiFi connectivity: minimum 5 Mbps download, 1 Mbps upload (no corporate network access required)
- Network interruption handling: 3 retry attempts with exponential backoff (1s, 2s, 4s), display cached content during outages
- API rate limits: rss2json.com 10,000 requests/day max, GitHub Status API 60 requests/hour max, implement request caching to stay within limits

### TR4: Display Requirements
- Display resolution: 1920x1080 minimum, scales to 4K (3840x2160)
- Content readable from 10+ feet away: minimum 16px font size for body text, 24px for headings
- High contrast: WCAG AA compliance (4.5:1 ratio for normal text, 3:1 for large text) for visibility in office lighting conditions

### TR5: Reliability Requirements
- Uptime target: 99.5% (approximately 3.6 hours downtime per month) with auto-recovery from failures
- Automatic restart of browser if it crashes (watchdog checks every 60 seconds)
- Automatic reboot recovery after power outages (auto-relaunch within 2 minutes of power restoration)
- Manual intervention required: no more than once per month for routine maintenance

### TR6: Carousel State Management (Post-MVP)
- Dual timer architecture: page timer and item timer operate independently
- Timer state persists across auto-refresh cycles (5 minute intervals)
- No timer drift over extended runtime (tested for 24+ hours)
- State resets properly: item timer resets on page change, page timer cycles continuously
- Memory footprint remains stable during continuous rotation (no leaks)

### TR7: Carousel Rendering Performance (Post-MVP)
- Page transitions complete within 500ms
- Item highlight changes render within 200ms
- Detail view updates without blocking UI thread
- Smooth animations maintain 30+ FPS on Raspberry Pi 3B
- No visual flicker or content jump during transitions

### TR8: Carousel Configuration (Post-MVP)
- Page rotation timer: configurable 10-120 seconds (default: 30 seconds)
- Item rotation timer: configurable 3-30 seconds (default: 8 seconds)
- Split-view layout proportions: configurable via CSS variables
- Configuration persists across browser refreshes

---

## Out of Scope for MVP

The following features are explicitly out of scope for the MVP release:

- **Carousel architecture:** Multi-page carousel deferred to Post-MVP Phase 1
- **Split-view detail panels:** Item detail view deferred to Post-MVP Phase 1
- **Polished GitHub UI/UX:** Full design system implementation deferred to future iteration
- **Visual emphasis for critical incidents:** Enhanced styling for GitHub status outages/degradations  
- **Additional data sources:** Beyond current three feeds (blog, changelog, status)
- **Interactive features:** Dashboard remains display-only, no user interaction
- **Remote management:** No VNC, SSH, or remote administration capabilities
- **Advanced monitoring:** No health checks, logging, or alerting systems

---

## Implementation Plan

### Phase 1: UI Enhancement (Week 1)
1. Apply basic GitHub dark theme color palette to HTML/CSS
2. Update typography for TV readability
3. Test visibility from actual viewing distance
4. Validate all data sources still function correctly

### Phase 2: Raspberry Pi Setup (Week 1-2)
1. Install Raspberry Pi OS Lite
2. Configure Chromium kiosk mode with proper flags
3. Set up auto-start scripts
4. Install and configure `unclutter` for cursor hiding
5. Disable screensaver and power management
6. Configure local HTTP server to serve dashboard
7. Connect to guest WiFi network
8. Test auto-recovery from power outages

### Phase 3: Deployment & Validation (Week 2)
1. Physical installation: Connect Pi to office TV via HDMI
2. Position and secure hardware
3. Configure TV input and display settings
4. Run burn-in test (48+ hours continuous operation)
5. Document setup procedure for future reference
6. Monitor for issues during first week of operation

### Phase 4: Post-MVP User Feedback (Week 3+)
1. Monitor dashboard usage and developer engagement
2. Gather qualitative feedback on readability and usefulness
3. Identify pain points or missing information
4. Assess readiness for carousel evolution

### Phase 5: Carousel Redesign Implementation (Post-MVP Phase 1)

**Timeline:** 2-3 weeks after MVP deployment

**Prerequisites:**
- MVP deployed and stable for 2+ weeks
- User feedback collected and analyzed
- Team confirms value in deeper information engagement

**Sub-Phase 5A: Carousel Architecture (Week 1)**
1. Design dual timer system (page timer + item timer)
2. Implement state management for rotation tracking
3. Build page transition mechanism
4. Refactor current layout to support multi-page structure
5. Test timer independence and state persistence

**Sub-Phase 5B: Split-View Layout (Week 1-2)**
1. Design split-view CSS grid layout (list + detail)
2. Refactor item rendering for list view (left side)
3. Create detail view component (right side)
4. Implement responsive proportions (30/70 or 40/60)
5. Test readability at TV viewing distance

**Sub-Phase 5C: Item Highlighting & Detail Rendering (Week 2)**
1. Implement item-level rotation timer
2. Build highlight indicator system (visual feedback)
3. Create detail view rendering logic
4. Handle content transitions (fade/slide animations)
5. Test smooth highlight cycling through item list

**Sub-Phase 5D: Integration & Testing (Week 2-3)**
1. Integrate carousel with existing auto-refresh (5 min)
2. Ensure progress bar tracks page transitions only
3. Test dual timer coordination and independence
4. Verify memory stability over 48+ hour runtime
5. Performance testing on Raspberry Pi 3B
6. Deploy to Pi and run burn-in test

**Sub-Phase 5E: Refinement (Week 3)**
1. Gather initial feedback on carousel UX
2. Adjust timer defaults based on observation
3. Fine-tune detail view content formatting
4. Optimize transition animations if needed
5. Document carousel architecture and configuration

### Post-Carousel Iteration
- Iterate on UI/UX based on carousel feedback
- Consider visual enhancements for critical incidents
- Evaluate additional data sources based on team interest
- Explore configuration UI for timer adjustments

---

## Risks & Mitigations

### R1: API Rate Limiting
**Risk:** GitHub APIs or rss2json.com may rate limit requests from guest WiFi IP address.
**Mitigation:** Monitor for rate limit errors. If encountered, implement request caching or reduce refresh frequency.
**Likelihood:** Low | **Impact:** Medium

### R2: TV Input/Power Management
**Risk:** TV may automatically switch inputs or enter power-saving mode.
**Mitigation:** Configure TV settings on initial setup. Document TV model and settings for future reference.
**Likelihood:** Medium | **Impact:** Low

### R3: WiFi Stability
**Risk:** Guest WiFi network may be unreliable or require periodic re-authentication.
**Mitigation:** Test WiFi stability during burn-in period. Have ethernet cable available as fallback.
**Likelihood:** Low | **Impact:** Medium

### R4: Raspberry Pi Hardware Failure
**Risk:** SD card corruption or hardware failure could cause downtime.
**Mitigation:** Document complete setup procedure. Keep spare SD card with configured image as backup.
**Likelihood:** Low | **Impact:** Medium

---

## Appendix: Future Vision

### Post-Phase 1 Enhancements
- **Full GitHub Design System:** Professional UI implementation with comprehensive design specifications
- **Visual Alerts:** Pulsing borders, color changes, or prominence shifts for critical GitHub status incidents
- **Team-Specific Content:** Integration with organization's repository activity or team-specific GitHub data
- **Smart Prominence:** Automatically emphasize more important or time-sensitive updates
- **Configuration UI:** Browser-based settings for timer adjustments and layout preferences

### Long-Term Possibilities
- **Other Information Sources:** Expand beyond GitHub to other relevant development ecosystem updates
- **Customizable Layouts:** Allow configuration of which data sources appear and how they're displayed
- **Historical Trending:** Show patterns over time (e.g., "GitHub status has had 3 incidents this week")

---

