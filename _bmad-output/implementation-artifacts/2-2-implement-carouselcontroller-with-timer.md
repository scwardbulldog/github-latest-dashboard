# Story 2.2: Implement CarouselController with Timer

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a working CarouselController that automatically rotates through pages every 30 seconds,
So that team members see all three data sources in a continuous cycle.

## Acceptance Criteria

**Given** I need the CarouselController to manage rotation
**When** I implement the start() method
**Then** it initializes setInterval with 30000ms (30 seconds)
**And** the interval ID is stored in this.timer
**And** the interval calls this.rotatePage() on each tick
**And** the timer starts immediately when start() is called

**Given** I need the page rotation logic
**When** I implement the rotatePage() method
**Then** it increments this.currentPage: `(currentPage + 1) % 3`
**And** it removes `.active` class from the current page element
**And** it adds `.active` class to the next page element
**And** it updates the page visibility correctly
**And** it triggers the onPageChange callback if defined: `if (this.onPageChange) this.onPageChange(pageName)`

**Given** I need to stop the rotation
**When** I implement the stop() method
**Then** it clears the interval: `clearInterval(this.timer)`
**And** it sets this.timer to null
**And** rotation stops immediately

**Given** I need to initialize the carousel
**When** I instantiate CarouselController in main.js
**Then** it accepts interval parameter: `new CarouselController({ interval: 30000 })`
**And** the pages array is set: `['blog', 'changelog', 'status']`
**And** currentPage is initialized to 0 (Blog page)
**And** start() is called to begin rotation

**Given** the carousel is running
**When** 30 seconds elapse
**Then** the page transitions from Blog to Changelog
**And** after another 30 seconds it transitions to Status
**And** after another 30 seconds it returns to Blog (cycles continuously)
**And** the rotation continues indefinitely without stopping

**Given** I want to verify timer accuracy
**When** I observe the dashboard for 5 minutes
**Then** pages rotate exactly every 30 seconds (use stopwatch to verify)
**And** no timer drift occurs
**And** rotation timing is consistent across cycles

## Tasks / Subtasks

- [x] Implement CarouselController.start() method (AC: 1)
  - [x] Create setInterval with this.interval milliseconds
  - [x] Store interval ID in this.timer
  - [x] Call this.rotatePage() on each interval tick
  - [x] Ensure immediate start when start() is called

- [x] Implement CarouselController.rotatePage() method (AC: 2)
  - [x] Calculate next page index: (this.currentPage + 1) % this.pages.length
  - [x] Get current page element: document.getElementById(`page-${this.pages[this.currentPage]}`)
  - [x] Get next page element: document.getElementById(`page-${this.pages[nextIndex]}`)
  - [x] Remove .active class from current page element
  - [x] Add .active class to next page element
  - [x] Update this.currentPage to nextIndex
  - [x] Call onPageChange callback if defined: if (this.onPageChange) this.onPageChange(this.pages[nextIndex])

- [x] Implement CarouselController.stop() method (AC: 3)
  - [x] Check if this.timer exists
  - [x] Call clearInterval(this.timer)
  - [x] Set this.timer = null

- [x] Initialize carousel in main.js (AC: 4)
  - [x] Import CarouselController: import { CarouselController } from './carousel-controller.js'
  - [x] Instantiate with config: const carousel = new CarouselController({ interval: 30000 })
  - [x] Call carousel.start() to begin rotation
  - [x] Add to initialization after data fetching setup

- [ ] Test page rotation (AC: 5) - **REQUIRES MANUAL TESTING**
  - [ ] Run npm run dev to start dev server
  - [ ] Verify Blog page displays initially
  - [ ] Wait 30 seconds, verify transition to Changelog
  - [ ] Wait 30 seconds, verify transition to Status
  - [ ] Wait 30 seconds, verify return to Blog (cycle completes)
  - [ ] Observe for 5 minutes to verify consistent timing

- [ ] Verify timer accuracy (AC: 6) - **REQUIRES MANUAL TESTING**
  - [ ] Use stopwatch to time page transitions
  - [ ] Verify exactly 30 seconds between transitions
  - [ ] Test for 5+ minutes to detect drift
  - [ ] Verify rotation continues across API refresh cycles (5 minutes)

## Dev Notes

### Epic 2 Context: Page Rotation System

This is the **second story of Epic 2**, which implements the core page rotation logic. Story 2.1 created the page layout structure; this story brings it to life with automatic rotation.

**Epic Goal:** Team members see one full-screen page at a time (Blog, Changelog, or Status) that automatically rotates every 30 seconds, with clear visual indication of which page they're viewing and where they are in the rotation cycle.

**What This Story Delivers:**
- Functional CarouselController with automatic 30-second page rotation
- Continuous cycling through Blog → Changelog → Status → Blog
- Foundation for page transition animations (Story 2.3)
- Foundation for progress indicator (Story 2.4)

**What This Story Does NOT Include:**
- Smooth CSS transitions between pages (Story 2.3)
- Progress bar showing rotation state (Story 2.4)
- Item-level highlighting within pages (Epic 3)
- Detail panel rendering (Epic 3)

### User Experience Goals

**From UX Design Specification:**

**Emotional Design Goals:**
- **Peaceful passive awareness:** Rotation timing feels natural and unhurried (30 seconds per page)
- **Calm confidence:** Users trust they'll see all content through the rotation cycle
- **Optional engagement:** Users can glance or not without missing critical information
- **No anxiety/pressure:** Unlike notifications, the carousel imposes no demands

**Critical Success Moment - The Glance Hook:**
User walks by mid-rotation and within 2-3 seconds understands what page they're viewing. The page header, color-coding, and layout must make this effortless.

**Rotation Timing Principles:**
- **30 seconds per page:** Accommodates coffee break glancers while not feeling sluggish to quick passers
- **Unhurried natural rhythm:** Never rushed, never jarring
- **Consistent timing:** Reliable rotation builds trust in the system

### Architecture Context

**From Architecture Document:**

**State Management Pattern - Simple setInterval:**
```javascript
class CarouselController {
  constructor({ interval = 30000 } = {}) {
    this.interval = interval;
    this.currentPage = 0;
    this.pages = ['blog', 'changelog', 'status'];
    this.timer = null;
    this.onPageChange = null; // Callback for future coordination
  }
  
  start() {
    this.timer = setInterval(() => this.rotatePage(), this.interval);
  }
  
  rotatePage() {
    this.currentPage = (this.currentPage + 1) % this.pages.length;
    // DOM manipulation to show/hide pages
    // Call onPageChange callback if defined
  }
  
  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
```

**Component Communication Pattern:**
- **Direct function callbacks** - No event bus, no custom events
- **Explicit callback properties:** onPageChange set in main.js for future coordination
- **Null-check before calling:** if (this.onPageChange) this.onPageChange(pageName)

**Timer Coordination (Future - Not This Story):**
- Page timer and item timer (Epic 3) operate independently
- Item timer will reset when page changes via onPageChange callback
- Timer state persists across API refresh cycles (5-minute intervals)

### Previous Story Learnings

**From Story 2.1 (Implement Page Layout Structure):**

✅ **Page Structure Created:**
- Three page containers exist: `#page-blog`, `#page-changelog`, `#page-status`
- Each has `.carousel-page` class
- Blog page has `.active` class initially
- CSS in [layout.css](../../src/css/layout.css) controls visibility

✅ **Page Headers and Color-Coding:**
- BLOG header: blue (`--color-accent-fg`)
- CHANGELOG header: purple (`--color-sponsor-fg`)
- STATUS header: green (`--color-success-fg`)
- All use `--fontsize-h1` (32px) and `--fontweight-semibold` (600)

✅ **CSS Layout Pattern:**
```css
.carousel-page {
  display: none;
}

.carousel-page.active {
  display: flex;
}
```

✅ **Data Fetching Still in main.js:**
- Blog data fetches to `#blog-content`
- Changelog data fetches to `#changelog-content`
- Status data fetches to `#status-content`
- No changes to API client needed this story

✅ **Build System Workflow:**
- `npm run dev` - Vite dev server at localhost:5173 with hot reload
- `npm run build` - Produces single index.html in project root
- Commit both source and built artifact
- Pi auto-pulls on restart

### Component Architecture

**From Project Context:**

**CarouselController Skeleton Already Exists:**
- File: [src/js/carousel-controller.js](../../src/js/carousel-controller.js)
- Class definition with constructor present
- Skeleton methods: start(), stop(), rotatePage()
- Properties: interval, pages, currentPage, timer, onPageChange
- **Just needs implementation** - structure is ready

**ES Module Pattern:**
```javascript
// src/js/carousel-controller.js
export class CarouselController {
  // Implementation here
}

// src/js/main.js
import { CarouselController } from './carousel-controller.js';
```

**Class-Based Component Structure (MANDATORY):**
- Constructor accepts configuration object with defaults
- State stored as class properties (this.currentPage, this.timer)
- Public methods for control: start(), stop(), rotatePage()
- Callback properties for communication: this.onPageChange

**DOM Manipulation Pattern:**
```javascript
// Get page elements
const currentPageElement = document.getElementById(`page-${this.pages[this.currentPage]}`);
const nextPageElement = document.getElementById(`page-${this.pages[nextIndex]}`);

// Toggle active class
currentPageElement.classList.remove('active');
nextPageElement.classList.add('active');
```

**Timer Cleanup Pattern (CRITICAL):**
```javascript
stop() {
  if (this.timer) {
    clearInterval(this.timer);
    this.timer = null;
  }
}
```

### Critical Implementation Details

**1. Timer Precision:**
- Use setInterval with exact 30000ms (30 seconds)
- No timer drift over extended runtime (tested for 24+ hours recommended)
- Timer state persists across API refresh cycles

**2. Page Index Management:**
- Use modulo operator for cycling: `(currentPage + 1) % pages.length`
- Pages array: `['blog', 'changelog', 'status']`
- Corresponding IDs: `page-blog`, `page-changelog`, `page-status`

**3. DOM Element Selection:**
- Always null-check elements before manipulation
- Handle cases where elements might not exist (graceful degradation)
- Use template literals for dynamic IDs: `page-${pageName}`

**4. Callback Invocation:**
- Always null-check before calling: `if (this.onPageChange) this.onPageChange(pageName)`
- Pass page name as string: 'blog', 'changelog', 'status'
- Callback is for future coordination with ItemHighlighter (Epic 3)

**5. Initialization Order:**
- Instantiate carousel after DOM ready
- Call start() immediately after instantiation
- Ensure first page (Blog) is already visible before rotation begins

### Testing Requirements

**Manual Testing in Dev Environment:**

1. **Initial State:**
   - Run `npm run dev`
   - Verify Blog page visible on load
   - Open browser DevTools console
   - Check for no errors

2. **First Rotation Cycle:**
   - Use stopwatch or timer
   - Wait exactly 30 seconds
   - Verify Blog → Changelog transition
   - Check console for errors
   - Verify Blog page now hidden, Changelog visible

3. **Complete Cycle:**
   - Continue timing
   - At 60 seconds: Changelog → Status
   - At 90 seconds: Status → Blog (cycle complete)
   - Verify smooth 3-page cycle

4. **Extended Runtime Test:**
   - Observe for 5+ minutes (10+ rotations)
   - Verify consistent 30-second timing (no drift)
   - Verify no console errors
   - Verify no visual glitches

5. **API Refresh Interaction:**
   - Wait for 5-minute API refresh to occur
   - Verify page rotation continues uninterrupted
   - Verify timing remains accurate after refresh
   - Check that content updates don't reset rotation

**Validation Checklist:**
- [ ] Blog page visible on initial load
- [ ] Page rotates from Blog to Changelog at 30 seconds
- [ ] Page rotates from Changelog to Status at 60 seconds
- [ ] Page rotates from Status to Blog at 90 seconds (cycle completes)
- [ ] Rotation timing consistent over 5+ minutes
- [ ] No timer drift detected
- [ ] No console errors during rotation
- [ ] Page rotation persists across API refresh cycles
- [ ] Only one page visible at a time (others hidden)
- [ ] Page headers display correctly on each page

**Build Validation:**
1. Run `npm run build`
2. Open built index.html in browser
3. Verify rotation works identically to dev server
4. Test for 5+ minutes in production build
5. Optional: Deploy to Pi and test on actual hardware

### Project Structure Notes

**Files to Modify:**
- ✏️ **src/js/carousel-controller.js** - Implement start(), stop(), rotatePage() methods
- ✏️ **src/js/main.js** - Import and instantiate CarouselController, call start()

**Files to NOT Modify:**
- ❌ **src/css/layout.css** - Page layout already complete from Story 2.1
- ❌ **src/index.html** - HTML structure already correct
- ❌ **src/js/api-client.js** - No API changes needed
- ❌ **src/js/utils.js** - Utility functions unchanged

**Component Dependencies:**
- CarouselController → main.js (instantiation and initialization)
- CarouselController → DOM (page elements via getElementById)
- CarouselController → layout.css (.active class controls visibility)

### Common Pitfalls to Avoid

❌ **DON'T forget timer cleanup:**
```javascript
// WRONG - Memory leak
start() {
  setInterval(() => this.rotatePage(), this.interval);
}

// CORRECT - Store handle for cleanup
start() {
  this.timer = setInterval(() => this.rotatePage(), this.interval);
}
```

❌ **DON'T forget modulo for cycling:**
```javascript
// WRONG - Index out of bounds
rotatePage() {
  this.currentPage = this.currentPage + 1; // Breaks after 3rd page
}

// CORRECT - Cycles back to 0
rotatePage() {
  this.currentPage = (this.currentPage + 1) % this.pages.length;
}
```

❌ **DON'T forget null-check before callback:**
```javascript
// WRONG - Crashes if callback not set
rotatePage() {
  this.onPageChange(pageName); // TypeError if null
}

// CORRECT - Safe invocation
rotatePage() {
  if (this.onPageChange) this.onPageChange(pageName);
}
```

❌ **DON'T hardcode page count:**
```javascript
// WRONG - Breaks if pages change
this.currentPage = (this.currentPage + 1) % 3;

// CORRECT - Uses array length
this.currentPage = (this.currentPage + 1) % this.pages.length;
```

❌ **DON'T add CSS transitions yet:**
- Page transitions (fade animations) are Story 2.3
- This story: instant visibility toggle only
- CSS can be added later without touching JS logic

❌ **DON'T implement progress bar yet:**
- Progress indicator is Story 2.4
- Focus on basic rotation mechanics first
- Progress bar will hook into same timer later

### Implementation Guidance

**Step 1: Implement start() method**

Edit `src/js/carousel-controller.js`:
```javascript
start() {
  this.timer = setInterval(() => this.rotatePage(), this.interval);
}
```

**Step 2: Implement rotatePage() method**

```javascript
rotatePage() {
  // Calculate next page index
  const nextIndex = (this.currentPage + 1) % this.pages.length;
  
  // Get DOM elements
  const currentPageElement = document.getElementById(`page-${this.pages[this.currentPage]}`);
  const nextPageElement = document.getElementById(`page-${this.pages[nextIndex]}`);
  
  // Null-check (defensive programming)
  if (!currentPageElement || !nextPageElement) {
    console.error('CarouselController: Page elements not found');
    return;
  }
  
  // Update visibility
  currentPageElement.classList.remove('active');
  nextPageElement.classList.add('active');
  
  // Update state
  this.currentPage = nextIndex;
  
  // Trigger callback for future coordination
  if (this.onPageChange) {
    this.onPageChange(this.pages[this.currentPage]);
  }
}
```

**Step 3: Verify stop() method**

```javascript
stop() {
  if (this.timer) {
    clearInterval(this.timer);
    this.timer = null;
  }
}
```

**Step 4: Initialize in main.js**

Edit `src/js/main.js`:
```javascript
import { CarouselController } from './carousel-controller.js';

// ... existing code ...

// Initialize carousel after DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // ... existing initialization ...
  
  // Start carousel rotation
  const carousel = new CarouselController({ interval: 30000 });
  carousel.start();
  
  // Optional: Set callback for future coordination (Epic 3)
  carousel.onPageChange = (pageName) => {
    console.log(`Page changed to: ${pageName}`);
    // Future: itemHighlighter.reset() will be called here
  };
});
```

**Step 5: Test in dev server**

```bash
npm run dev
# Visit http://localhost:5173
# Use stopwatch to time rotations
# Verify 30-second intervals
```

**Step 6: Build and validate**

```bash
npm run build
# Open built index.html in browser
# Verify rotation works identically
```

### Future Integration Points

**Story 2.3 (Page Transitions):**
- CSS transitions will be added to layout.css
- rotatePage() method will be enhanced for fade timing
- No breaking changes to timer logic

**Story 2.4 (Progress Indicator):**
- Progress bar will use same timer interval
- updateProgress() method will be added
- May need to track elapsed time within interval

**Epic 3 (Item Highlighting):**
- onPageChange callback will coordinate with ItemHighlighter
- callback will call itemHighlighter.reset() on page change
- Ensures item highlighting restarts on new page

### Success Criteria Summary

**When this story is complete:**
✅ CarouselController.start() initializes setInterval with 30-second timer
✅ Pages rotate automatically: Blog → Changelog → Status → Blog (continuous cycle)
✅ rotatePage() updates DOM classes to show/hide pages correctly
✅ Only one page visible at a time (others have display: none via CSS)
✅ Timer accuracy: exactly 30 seconds between transitions (verified with stopwatch)
✅ No timer drift over 5+ minutes of observation
✅ Rotation continues across API refresh cycles (5-minute intervals)
✅ No console errors during rotation
✅ Build produces working artifact with rotation
✅ Foundation ready for transitions (Story 2.3) and progress indicator (Story 2.4)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References

No errors encountered during implementation. Build succeeded with no warnings.

### Completion Notes List

✅ **CarouselController.start() Implementation:**
- Created setInterval with this.interval milliseconds (30000ms/30 seconds)
- Stored interval ID in this.timer for cleanup
- Configured to call this.rotatePage() on each tick
- Timer starts immediately when start() is called

✅ **CarouselController.rotatePage() Implementation:**
- Calculates next page index using modulo: `(this.currentPage + 1) % this.pages.length`
- Gets current and next page elements using template literals: `page-${pageName}`
- Added defensive null-checking for page elements (logs error if not found)
- Toggles .active class: removes from current, adds to next
- Updates this.currentPage state to nextIndex
- Invokes onPageChange callback if defined: `if (this.onPageChange) this.onPageChange(pageName)`

✅ **CarouselController.stop() Verification:**
- Method already correctly implemented from Story 1.3 skeleton
- Properly checks if timer exists before clearing
- Calls clearInterval(this.timer) and sets this.timer = null
- Prevents memory leaks for 24/7 kiosk operation

✅ **Carousel Initialization in main.js:**
- Instantiated CarouselController with 30-second interval: `new CarouselController({ interval: 30000 })`
- Called carousel.start() immediately after instantiation
- Added onPageChange callback with console.log for debugging
- Callback prepared for future ItemHighlighter coordination (Epic 3)
- Placed initialization after fetchAllData() and before auto-refresh setup

✅ **Build Verification:**
- Ran `npm run build` successfully - no errors
- Vite bundled and minified code correctly
- Output: single index.html with inlined JS (65.28 kB, gzip: 10.95 kB)
- Build artifact ready for Pi deployment

✅ **Code Review Fixes Applied (Post-Implementation):**
- Added constructor input validation for interval parameter
- Added error handling in start() method with try-catch wrapper
- Implemented memory leak prevention: stop() called before creating new timer
- Enhanced element null-check to stop timer on persistent failure
- Implemented global instance cleanup to prevent multiple competing timers during hot reload
- Added browser compatibility documentation (Chromium 84+ requirement)
- Updated File List to document all modified files including sprint-status.yaml

⚠️ **Manual Testing Required:**
Implementation is complete and builds successfully, but the following manual tests must be performed:
1. Verify page rotation timing (30-second intervals with stopwatch)
2. Confirm complete rotation cycle: Blog → Changelog → Status → Blog
3. Observe for 5+ minutes to detect any timer drift
4. Verify rotation persists across 5-minute API refresh cycles
5. Check browser console for errors during rotation

**Testing Instructions:**
- Dev server running at: http://localhost:5175/
- Use browser DevTools console to monitor page changes
- Callback logs: "Page changed to: [pageName]" on each 30-second rotation
- Verify only one page visible at a time (Blog initially)

### File List

**Modified Files:**
- `src/js/carousel-controller.js` - Implemented start() and rotatePage() methods with error handling and memory leak prevention
- `src/js/main.js` - Added carousel initialization and wiring with cleanup
- `src/index.html` - Source file with page structure (not in git, removed during build migration)
- `index.html` - Built artifact with bundled carousel code (auto-generated by Vite)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` - Updated story 2-2 status to in-progress
