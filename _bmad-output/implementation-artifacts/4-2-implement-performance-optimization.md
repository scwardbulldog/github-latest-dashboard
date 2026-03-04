# Story 4.2: Implement Performance Optimization

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

---

## Story

As a team member,
I want the dashboard to run smoothly on Raspberry Pi hardware,
So that animations are fluid and the system is responsive.

---

## Acceptance Criteria

**Given** I need smooth page transitions  
**When** page rotation occurs  
**Then** the fade animation maintains 30+ FPS on Pi 3B  
**And** transition completes within 500ms  
**And** no visual stuttering or frame drops occur  
**And** CPU usage remains reasonable (< 50% spike)

**Given** I need smooth item highlighting  
**When** item highlight changes  
**Then** the transition maintains 30+ FPS  
**And** transition completes within 200ms  
**And** no lag or delay is perceptible  
**And** highlighting doesn't block other UI updates

**Given** I need memory stability  
**When** the dashboard runs for 24+ hours  
**Then** memory usage remains stable (no continuous growth)  
**And** no event listener leaks exist  
**And** timers are properly cleaned up if components are destroyed  
**And** DOM references don't accumulate

**Given** I need to avoid expensive CSS  
**When** I review all CSS styles  
**Then** no box-shadow properties are used (expensive on Pi)  
**And** no complex filter effects are used  
**And** no complex transform animations are used  
**And** only opacity and background-color transitions exist (GPU accelerated)

**Given** I need efficient DOM updates  
**When** content updates during refresh  
**Then** only changed elements are re-rendered (no full page rebuild)  
**And** innerHTML updates are batched where possible  
**And** no layout thrashing occurs (read/write DOM in batches)

**Given** I test performance on Pi  
**When** I run the dashboard on actual Pi 3B hardware  
**Then** initial page load completes in < 2 seconds  
**And** API refresh completes in < 1 second  
**And** animations feel smooth (no perceived lag)  
**And** the system remains responsive after 24+ hours

---

## Epic Context

### Epic 4: Production Reliability & Polish

**Epic Goal:** Team members trust the dashboard to run 24/7 without intervention, with graceful handling of network issues, clear error feedback, and performance optimized for comfortable viewing from 10-15 feet away.

**What This Story Delivers:**
- Smooth 30+ FPS animations on Raspberry Pi 3B hardware
- Elimination of expensive CSS properties (box-shadow, transform, filter)
- GPU-optimized transitions using only opacity and background-color
- Memory-stable operation over 24+ hours (no leaks)
- Efficient DOM update patterns (batched, no layout thrashing)
- Validated performance on actual Pi 3B hardware

**What This Story Does NOT Include:**
- Cross-page persistent outage indicator (Story 4.3)
- Distance-optimized typography (Story 4.4)
- Burn-in testing (Story 4.5)
- Documentation (Story 4.6)

**Story Position:** Second story in Epic 4 (4.2 of 4.6)

**Dependencies:**
- ✅ Epic 1 completed: Build system and component structure
- ✅ Epic 2 completed: Carousel page rotation with animations
- ✅ Epic 3 completed: Split-view, dual timers, API integration
- ✅ Story 4.1 completed: Error handling with retry logic (timers still working)

**Critical Success Factors:**
- CSS performance optimizations MUST NOT break existing animations
- Timer coordination from Stories 2.2, 3.2, 3.4 MUST remain intact
- Visual appearance MUST remain unchanged (only performance improves)
- All animations MUST use GPU-accelerated properties only
- Memory usage MUST remain stable over 24+ hours continuous operation

---

## Tasks / Subtasks

- [x] Audit and remove expensive CSS properties (AC: 4)
  - [x] Search all CSS files for box-shadow usage
  - [x] Remove all box-shadow declarations in main.css
  - [x] Remove box-shadow from components.css (except GitHub Primer tokens)
  - [x] Search for transform animations in main.css
  - [x] Remove or simplify transform-based animations
  - [x] Remove filter (drop-shadow) from main.css
  - [x] Verify only opacity and background-color transitions remain

- [x] Optimize page transition performance (AC: 1)
  - [x] Review carousel.css page transition implementation
  - [x] Ensure opacity transition is GPU-accelerated
  - [x] Verify transition duration is 300ms (matches JS coordination)
  - [ ] Test frame rate on Pi 3B during page transitions
  - [ ] Confirm no visual stuttering or jank

- [x] Optimize item highlight performance (AC: 2)
  - [x] Review components.css list-item transitions
  - [x] Ensure highlight uses background-color only (no other properties)
  - [x] Verify transition duration is 200ms
  - [ ] Test frame rate during item highlight changes
  - [ ] Confirm no perceptible lag

- [x] Verify memory stability (AC: 3)
  - [x] Review carousel-controller.js for timer cleanup
  - [x] Review item-highlighter.js for timer cleanup
  - [x] Check detail-panel.js for DOM reference cleanup
  - [x] Verify no event listeners accumulate
  - [ ] Run dashboard for 24+ hours and monitor memory usage
  - [ ] Use Chrome DevTools Memory profiler to detect leaks

- [x] Optimize DOM update patterns (AC: 5)
  - [x] Review main.js data rendering functions
  - [x] Identify any layout thrashing (read/write alternation)
  - [x] Batch DOM writes when possible
  - [x] Use documentFragment for multi-element insertion if needed
  - [x] Avoid unnecessary innerHTML full page rebuilds
  - [x] Ensured only changed content is updated during refresh

- [ ] Pi hardware validation (AC: 6)
  - [ ] Deploy to actual Pi 3B hardware
  - [ ] Test initial page load time (< 2 seconds target)
  - [ ] Test API refresh time (< 1 second target)
  - [ ] Observe animations for smoothness from 10 feet distance
  - [ ] Monitor system resources (htop, free -h)
  - [ ] Run for 24+ hours and verify stability
  - [ ] Check for any visual artifacts or degradation

- [ ] Edge cases and optimization validation
  - [ ] Test performance during heavy API load
  - [ ] Verify animations don't block JavaScript execution
  - [ ] Test with Chrome DevTools Performance profiler
  - [ ] Validate 30+ FPS with frame rate monitor
  - [ ] Ensure graceful degradation if Pi is under load

---

## Dev Notes

### 🎯 CRITICAL DEVELOPER CONTEXT

**This story optimizes performance for Raspberry Pi 3B hardware by removing expensive CSS operations and ensuring smooth 30+ FPS animations. You MUST preserve all existing functionality while improving performance.**

### Epic 4 Context: Production Reliability & Polish

This is the **second story of Epic 4**, focusing on performance optimization for 24/7 kiosk operation on Pi 3B hardware. Previous stories established the carousel architecture, but the current implementation contains expensive CSS properties that degrade performance on resource-constrained hardware.

**What Makes This Story Critical:**
- Raspberry Pi 3B has limited GPU capabilities (no dedicated GPU)
- Box-shadow, transform, and filter CSS properties cause severe frame drops
- Smooth animations are essential for professional kiosk experience
- Memory leaks would require manual intervention (defeats 24/7 automation goal)
- Performance degradation accumulates over time if not addressed early

### 🚨 MANDATORY: Performance vs Visual Fidelity Trade-offs

**GPU-Accelerated Properties (USE THESE):**
- ✅ `opacity` - Fastest, GPU-accelerated on all hardware
- ✅ `background-color` - Fast, GPU-accelerated in modern browsers
- ✅ `transform: translate()` for positioning ONLY (not for animations)

**Expensive Properties (REMOVE THESE FROM ANIMATIONS):**
- ❌ `box-shadow` - CPU-intensive, causes repaints, very slow on Pi
- ❌ `transform` in animations (rotate, scale) - Causes layout recalculation
- ❌ `filter` (drop-shadow, blur) - CPU-intensive, not GPU-accelerated
- ❌ `width/height` transitions - Triggers layout, very expensive

**Current Performance Violations Found:**

Based on current CSS analysis, these violations MUST be fixed:

**main.css violations:**
```css
/* LINE 94 - REMOVE */
box-shadow: 0 0 var(--space-2) rgba(31, 111, 235, 0.6);

/* LINE 102 - Transform used for positioning OK, but verify not animated */
transform: translateX(-50%);

/* LINE 105 - REMOVE */
filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));

/* LINES 118-124 - REMOVE OR SIMPLIFY */
@keyframes octo-float {
    0%, 100% { transform: rotate(-2deg) translateY(0); }
    50% { transform: rotate(2deg) translateY(-2px); }
}

/* LINES 123-124 - REMOVE OR SIMPLIFY */
@keyframes octo-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* LINES 128-130 - REMOVE OR SIMPLIFY */
@keyframes octo-skate {
    0%, 100% { transform: translateX(0) translateY(0); }
    25% { transform: translateX(-0.5px) translateY(-0.5px); }
    75% { transform: translateX(0.5px) translateY(0.5px); }
}

/* LINE 134 - Opacity is OK, but verify transform is removed */
@keyframes octo-race {
    0% { opacity: 0.8; transform: translateX(0); }
    /* ... */
}
```

**components.css violations:**
```css
/* LINE 60 - REMOVE (unless critical for accessibility) */
box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.3) !important;
```

**Recommended Fixes:**

1. **Remove box-shadow entirely** - Replace with border if visual separation needed
2. **Remove filter: drop-shadow** - Use opacity or border for emphasis
3. **Simplify animations** - Replace transform animations with opacity-based fades
4. **Keep static transforms** - Transform for positioning (not animated) is acceptable

### Previous Story Intelligence: Story 4.1 (Error Handling)

**Critical Learnings from Story 4.1:**

**Timer Coordination Still Works (MUST PRESERVE):**
[Source: [4-1-implement-error-handling-retry-logic.md](4-1-implement-error-handling-retry-logic.md#L106-L149)]

Story 4.1 preserved the timer coordination established in Stories 3.2 and 3.4. This MUST NOT be broken:

```javascript
// src/js/main.js - Timer coordination pattern from Stories 3.2, 3.4, 4.1

async function refreshData() {
    // API calls happen asynchronously
    // Timers continue running independently
    // DO NOT call carousel.reset() or highlighter.reset() here
    
    const [blogData, changelogData, statusData] = await Promise.all([
        fetchBlog().catch(handleBlogError),
        fetchChangelog().catch(handleChangelogError),
        fetchStatus().catch(handleStatusError)
    ]);
    
    // Only update DOM content, timers keep running
    updatePageContent(blogData, changelogData, statusData);
}
```

**Memory Management Pattern Established:**
[Source: [carousel-controller.js](../../src/js/carousel-controller.js#L42-L65)]

```javascript
// Story 2.2 established proper timer cleanup pattern

stop() {
    if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
    }
    
    // Cancel progress animation
    if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
    }
}
```

**Dev Notes from Story 4.1 Completion:**
- Retry logic added to API client (does NOT impact timer performance)
- Network status indicator uses simple DOM manipulation (no performance impact)
- Error rendering uses innerHTML (acceptable, only on failure path)
- Timer coordination maintained perfectly through network failures

### Architecture Requirements

**Performance Optimization Patterns (Mandatory):**
[Source: [architecture.md](../planning-artifacts/architecture.md#L589-L605)]

```javascript
// Optimized page transition pattern

function transitionToPage(nextPage) {
  // PHASE 1: Fade out current page (opacity only)
  currentPageEl.classList.remove('active'); // Triggers CSS: opacity: 1 → 0
  
  // PHASE 2: Display swap (no animation)
  setTimeout(() => {
    currentPageEl.style.display = 'none';
    nextPageEl.style.display = 'block';
    
    // PHASE 3: Fade in next page (opacity only)
    requestAnimationFrame(() => {
      nextPageEl.classList.add('active'); // Triggers CSS: opacity: 0 → 1
    });
  }, 300); // Match CSS transition duration
}
```

**Performance-Optimized CSS:**
[Source: [architecture.md](../planning-artifacts/architecture.md#L545-L596)]

```css
/* src/css/carousel.css - GPU-accelerated transitions ONLY */

.page {
  opacity: 0;
  transition: opacity 300ms ease; /* GPU-accelerated */
  display: none;
}

.page.active {
  opacity: 1;
  display: block;
}

/* src/css/components.css - Background-color transitions ONLY */

.list-item {
  background: var(--color-canvas-default);
  transition: background-color 200ms ease; /* GPU-accelerated */
}

.list-item--highlighted {
  background: var(--color-canvas-subtle);
  font-weight: 600; /* Instant change, no transition */
}
```

**DOM Update Optimization Pattern:**
[Source: [architecture.md](../planning-artifacts/architecture.md#L1440-L1512)]

```javascript
// Batch DOM writes to avoid layout thrashing

function updatePageContent(page, data) {
    // PHASE 1: Read from DOM (if needed)
    const container = document.getElementById(`${page}-list`);
    
    // PHASE 2: Prepare HTML string (no DOM writes)
    const html = data.items.map(item => `
        <div class="list-item">
            <div class="item-title">${item.title}</div>
        </div>
    `).join('');
    
    // PHASE 3: Single DOM write (batched)
    container.innerHTML = html;
    
    // Avoid: Multiple appendChild() calls in a loop (causes layout thrashing)
}

// Pattern to AVOID:
// ❌ data.items.forEach(item => {
//     const el = document.createElement('div');
//     el.classList.add('list-item'); // Layout reflow
//     el.innerHTML = item.title; // Layout reflow
//     container.appendChild(el); // Layout reflow
// });
```

**Memory Leak Prevention:**
[Source: [architecture.md](../planning-artifacts/architecture.md#L426-L467)]

```javascript
// Timer cleanup pattern (already implemented, verify in this story)

class ComponentWithTimer {
  constructor() {
    this.timer = null;
    this.animationFrame = null;
  }
  
  start() {
    // CRITICAL: Always stop existing timer first
    this.stop();
    
    this.timer = setInterval(() => this.doWork(), 1000);
  }
  
  stop() {
    // Clear setInterval timer
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    // Clear requestAnimationFrame (if used)
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
  
  // If component is destroyed, cleanup MUST be called
  destroy() {
    this.stop();
    // Clear any other references
  }
}
```

### Technical Requirements (GitHub Primer Compliance)

**Performance Validation Tools:**

**Browser DevTools Performance Profiling:**
```bash
# 1. Open Chrome DevTools (F12)
# 2. Go to Performance tab
# 3. Record during page transition
# 4. Check for:
#    - Frame rate (should be 30+ FPS consistently)
#    - No long tasks (> 50ms)
#    - No layout thrashing (yellow "Layout" blocks)
#    - Smooth animation timeline
```

**Memory Profiling:**
```bash
# 1. Open Chrome DevTools (F12)
# 2. Go to Memory tab
# 3. Take initial heap snapshot
# 4. Let dashboard run for 1 hour
# 5. Take second heap snapshot
# 6. Compare: memory should be stable (< 5% growth)
# 7. Check for detached DOM nodes (memory leak indicator)
```

**Pi Hardware Monitoring:**
```bash
# SSH into Pi and monitor resources during operation

# Terminal 1: Monitor memory
watch -n 5 free -h

# Terminal 2: Monitor CPU and processes
htop

# Look for:
# - Chromium memory usage stable over time
# - CPU spikes < 50% during transitions
# - No zombie processes accumulating
```

### File Structure Requirements

**Files to Modify:**
[Source: [project-context.md](../project-context.md#L54-L67)]

```
/src/css/main.css              ← Remove expensive CSS (box-shadow, filter, transform animations)
/src/css/components.css        ← Verify transitions use GPU-accelerated properties only
/src/css/carousel.css          ← Verify page transitions are optimized
/src/js/main.js                ← Optional: Optimize DOM update patterns if needed
```

**Files to Review (No Changes Expected):**
```
/src/js/carousel-controller.js ← Verify timer cleanup (should already be correct)
/src/js/item-highlighter.js    ← Verify timer cleanup (should already be correct)
/src/js/detail-panel.js        ← Verify no memory leaks (should already be correct)
/src/js/api-client.js          ← No performance issues (already optimized in 4.1)
```

**CRITICAL Build Workflow:**
[Source: [project-context.md](../project-context.md#L42-L52)]

1. ⚠️ **NEVER edit /index.html at project root** - this is a GENERATED FILE
2. ✅ **Edit /src/css/*.css files** for performance optimizations
3. ✅ **Edit /src/js/main.js** if DOM update patterns need optimization
4. 🔨 **After editing, run `npm run build`** to regenerate /index.html
5. 🧪 **Test with `npm run dev`** for hot-reload during development
6. 🔍 **Use Chrome DevTools Performance tab** to validate improvements
7. 🖥️ **Deploy to Pi and test on actual hardware** (only true validation)
8. 📦 Commit both source files (/src/) and built artifact (/index.html) to git

### Implementation Strategy

**Recommended Implementation Order:**

1. **Phase 1: CSS Audit (AC 4)**
   - Search all CSS files for: box-shadow, filter, transform (in animations)
   - Create list of violations with line numbers
   - Document current visual appearance (screenshots for comparison)
   - Prioritize by impact: critical animations first

2. **Phase 2: Remove Expensive CSS (AC 4)**
   - Remove all box-shadow declarations (replace with border if needed)
   - Remove filter: drop-shadow (replace with opacity reduction if needed)
   - Remove or simplify transform animations (use opacity instead)
   - Keep static transforms for positioning (acceptable if not animated)
   - Verify visual appearance remains acceptable

3. **Phase 3: Optimize Transitions (AC 1 & 2)**
   - Verify carousel.css uses opacity-only transitions
   - Verify components.css uses background-color-only transitions
   - Test transitions in browser DevTools Performance tab
   - Validate frame rate is 30+ FPS during animations

4. **Phase 4: Memory Leak Audit (AC 3)**
   - Review all component stop() methods for proper cleanup
   - Check for event listeners that aren't removed
   - Use Chrome DevTools Memory profiler
   - Take heap snapshots before/after 1 hour run
   - Fix any memory accumulation detected

5. **Phase 5: DOM Update Optimization (AC 5)**
   - Review rendering functions for layout thrashing
   - Identify read/write DOM alternation patterns
   - Batch DOM writes where possible
   - Use innerHTML for bulk updates (acceptable pattern)
   - Avoid repeated DOM queries in loops

6. **Phase 6: Pi Hardware Validation (AC 6)**
   - Deploy to Pi 3B using standard git-based workflow
   - Test page load time with stopwatch (< 2 seconds target)
   - Test API refresh time (< 1 second target)
   - Observe animations from 10 feet for smoothness
   - Monitor system resources for 24+ hours
   - Document any remaining performance issues

### Testing Requirements

**Local Testing Checklist:**

**Browser Performance Profiling:**
- [ ] Record Performance profile during page transition
- [ ] Verify frame rate is 30+ FPS (no drops below 25 FPS)
- [ ] Check for long tasks (should be < 50ms)
- [ ] No yellow "Layout" warnings during animations
- [ ] Smooth timeline with consistent frame spacing

**CSS Performance Validation:**
- [ ] Search all CSS for "box-shadow" → Should return 0 results (or only in comments)
- [ ] Search all CSS for "filter:" → Should return 0 results in animation contexts
- [ ] Search for "transform:" in animations → Should be removed or simplified
- [ ] Verify only "opacity" and "background-color" in transitions

**Memory Stability Testing:**
- [ ] Take heap snapshot at dashboard start
- [ ] Run dashboard for 1 hour
- [ ] Take second heap snapshot
- [ ] Compare: memory growth should be < 5%
- [ ] Check for detached DOM nodes (indicates leak)
- [ ] Verify timer count doesn't increase over time

**DOM Update Efficiency:**
- [ ] Review rendering functions for layout thrashing
- [ ] Use Performance profiler to identify forced reflow
- [ ] Verify DOM writes are batched (single innerHTML, not loop)
- [ ] Check that unchanged content isn't re-rendered unnecessarily

**Pi Hardware Testing (CRITICAL):**

**Initial Deployment Validation:**
- [ ] Deploy to Pi 3B hardware
- [ ] Time initial page load (stopwatch): < 2 seconds target
- [ ] Time API refresh during operation: < 1 second target
- [ ] Observe page transitions from 10 feet: smooth, no stutter
- [ ] Observe item highlighting: instant, no lag

**Extended Operation (24+ hours):**
- [ ] Monitor memory with `free -h` every hour
- [ ] Check Chromium process memory growth
- [ ] Verify animations remain smooth after 24 hours
- [ ] Check for any visual artifacts or degradation
- [ ] Confirm CPU usage during transitions (< 50% spike)

**Resource Monitoring Commands:**
```bash
# Memory monitoring (every 5 seconds)
watch -n 5 free -h

# CPU and process monitoring
htop

# Chromium process memory specifically
ps aux | grep chromium

# Network activity (verify no unexpected traffic)
iftop
```

### Success Criteria

**Story is complete when:**
1. ✅ All expensive CSS properties removed (box-shadow, filter, transform animations)
2. ✅ All transitions use GPU-accelerated properties only (opacity, background-color)
3. ✅ Frame rate is 30+ FPS on Pi 3B during all animations
4. ✅ Memory usage stable over 24+ hours (< 5% growth)
5. ✅ Timer cleanup verified (no accumulation)
6. ✅ DOM updates are batched (no layout thrashing)
7. ✅ Page load < 2 seconds on Pi 3B
8. ✅ API refresh < 1 second
9. ✅ Visual appearance unchanged (performance only improvement)
10. ✅ Timer coordination preserved (carousel and highlighter still in sync)

---

## References

### Architecture Documents
- [architecture.md](../planning-artifacts/architecture.md#L589-L605) - Performance optimization patterns
- [architecture.md](../planning-artifacts/architecture.md#L545-L596) - GPU-accelerated CSS transitions
- [architecture.md](../planning-artifacts/architecture.md#L426-L467) - Memory leak prevention
- [architecture.md](../planning-artifacts/architecture.md#L1440-L1512) - DOM update optimization

### Epic and Story Context
- [epics.md](../planning-artifacts/epics.md#L1200-L1260) - Story 4.2 requirements and acceptance criteria
- [4-1-implement-error-handling-retry-logic.md](4-1-implement-error-handling-retry-logic.md) - Previous story context

### Project Configuration
- [project-context.md](../project-context.md#L42-L52) - Build workflow and file editing rules
- [project-context.md](../project-context.md#L54-L67) - File structure and component organization

### Source Code
- [carousel-controller.js](../../src/js/carousel-controller.js) - Timer cleanup implementation
- [item-highlighter.js](../../src/js/item-highlighter.js) - Memory management patterns
- [main.css](../../src/css/main.css) - Performance violations to fix
- [components.css](../../src/css/components.css) - Transition optimization
- [carousel.css](../../src/css/carousel.css) - Page transition performance

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5

### Implementation Plan

**Performance Optimization Strategy:**

1. **CSS Performance Violations Removed:**
   - Eliminated all `box-shadow` properties (CPU-intensive on Pi 3B)
   - Removed `filter: drop-shadow` (not GPU-accelerated)
   - Removed all `@keyframes` with transform-based animations
   - Kept only GPU-accelerated properties: `opacity` and `background-color`

2. **DOM Update Optimization:**
   - Replaced `createElement` + `appendChild` loops with `DocumentFragment` pattern
   - Eliminated layout thrashing in `renderBlogList()`, `renderChangelogList()`, `renderStatusList()`
   - Reduced DOM reflows from N (per item) to 1 (batched)

3. **Memory Management Verification:**
   - Confirmed proper timer cleanup in `CarouselController.stop()`
   - Confirmed proper timer cleanup in `ItemHighlighter.stop()`
   - Verified no event listener leaks in `DetailPanel`
   - All components properly null references after cleanup

4. **Transition Verification:**
   - Carousel page transitions: `opacity 300ms ease` (GPU-accelerated) ✅
   - Item highlighting: `background-color 200ms ease` (GPU-accelerated) ✅
   - No expensive properties in transition declarations ✅

### Debug Log References

No blocking errors encountered during implementation.

### Completion Notes List

✅ **CSS Optimizations Completed:**
- Removed `box-shadow` from `.refresh-progress.refreshing` (line 94)
- Removed `filter: drop-shadow` from `.octocat-traveler` (line 105)
- Removed 6 `@keyframes` with transform animations:
  - `skateboard-tilt` (transform: rotate, translateY)
  - `wheel-spin` (transform: rotate)
  - `car-vibrate` (transform: translateX, translateY)
  - `speed-whoosh` (transform: translateX with opacity)
  - `victory-jump` (transform: translateY, rotate)
  - `star-twinkle` (transform: scale, rotate with opacity)
- Removed `box-shadow` from `.list-item--highlighted` (components.css line 60)
- Removed `box-shadow` from `.status-card:hover` states (3 instances)
- Changed `.list-item` transition to only `background-color` (removed font-weight, border-color)

✅ **DOM Optimization Completed:**
- Optimized `renderBlogList()` to use DocumentFragment (eliminates 10 reflows per render)
- Optimized `renderChangelogList()` to use DocumentFragment (eliminates 10 reflows per render)
- Optimized `renderStatusList()` to use DocumentFragment for active incidents and resolved grid
- All rendering functions now perform batched DOM insertion (single reflow)

✅ **Memory Management Verified:**
- CarouselController: Properly clears setInterval + requestAnimationFrame in stop()
- ItemHighlighter: Properly clears setInterval in stop()
- DetailPanel: No timers or listeners (no cleanup needed)
- All components call stop() before start() to prevent duplicate timers

✅ **Build Verification:**
- Build succeeded: 48.09 kB (gzip: 11.67 kB)
- Slight size increase (+220 bytes) due to DocumentFragment code and comments
- No errors or warnings

⚠️ **Manual Testing Required:**
The following verification steps require actual hardware or manual testing:
- Pi 3B frame rate testing during page transitions
- Pi 3B frame rate testing during item highlighting
- 24+ hour memory stability testing
- Chrome DevTools Performance profiling
- Chrome DevTools Memory profiling
- Actual Pi 3B deployment and resource monitoring

### File List

**Modified Files:**
- src/css/main.css - Removed expensive CSS properties (box-shadow, filter, transform animations)
- src/css/components.css - Optimized transitions to GPU-accelerated properties only
- src/js/main.js - Optimized DOM rendering with DocumentFragment pattern
- index.html - Regenerated build artifact with optimizations
