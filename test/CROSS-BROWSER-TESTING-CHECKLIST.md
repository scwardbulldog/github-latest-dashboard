# Cross-Browser Compatibility Testing Checklist

## Overview

This checklist guides manual testing across multiple browsers to ensure the GitHub Latest Dashboard works consistently across all target environments, with primary focus on Chromium 84 (Raspberry Pi target).

## Test Matrix

| Browser | Version | Platform | Priority | Notes |
|---------|---------|----------|----------|-------|
| Chromium | 84 | Raspberry Pi OS | 🔴 PRIMARY | Production target - must be perfect |
| Chrome | Latest (2026) | macOS/Windows | 🟡 SECONDARY | Development/QA environment |
| Firefox | Latest (2026) | macOS/Windows | 🟢 TERTIARY | Good-to-have compatibility |
| Edge | Latest (2026) | macOS/Windows | 🟢 TERTIARY | Good-to-have compatibility |

## Test Checklist (Per Browser)

Complete this checklist for **each browser** in the test matrix:

### Visual Rendering

- [ ] **Layout Structure**
  - [ ] Three-column layout displays correctly (Blog, Changelog, Status)
  - [ ] Split-view layout works (list on left, detail on right)
  - [ ] All content areas visible (no overflow, no cutoff)
  - [ ] Scrollbars appear only where intended

- [ ] **Styling**
  - [ ] Colors match GitHub Primer palette (dark theme)
  - [ ] Font rendering acceptable (may vary slightly by browser)
  - [ ] Spacing consistent (margins, padding, gaps)
  - [ ] Borders and dividers visible

- [ ] **Responsive Behavior** (if testing at non-1080p resolution)
  - [ ] Layout adapts to screen size appropriately
  - [ ] Text remains readable
  - [ ] No broken layouts

### Functional Testing

- [ ] **Page Rotation (Carousel)**
  - [ ] Dashboard starts on first page (Blog)
  - [ ] Pages rotate every 30 seconds
  - [ ] Fade transition smooth (300ms)
  - [ ] All three pages accessible in rotation
  - [ ] No flicker or visual glitches during transition
  - [ ] Progress bar animates from 0% to 100% over 30s

- [ ] **Item Highlighting**
  - [ ] First item highlighted immediately on page load
  - [ ] Highlight changes every 8 seconds
  - [ ] Highlight styling visible (background color change)
  - [ ] Highlight cycles through all items
  - [ ] Highlight resets when page changes
  - [ ] No jump or skip in highlighting sequence

- [ ] **Detail Panel**
  - [ ] Detail content updates when highlight changes
  - [ ] Title, author, date, description render correctly
  - [ ] Links in detail panel work (open in new tab)
  - [ ] Content truncates properly (no overflow)
  - [ ] Formatting preserved (lists, paragraphs, line breaks)

- [ ] **Data Loading**
  - [ ] Blog items load from GitHub Blog RSS
  - [ ] Changelog items load from GitHub Changelog RSS
  - [ ] Status incidents load from GitHub Status API
  - [ ] If no data, cached content displayed (or empty state)
  - [ ] Loading does not block timer startup

- [ ] **API Refresh**
  - [ ] Data refreshes every 5 minutes (observe for 10-15 min)
  - [ ] Timers continue during refresh (no pause)
  - [ ] Page/item positions maintained during refresh
  - [ ] No visible interruption during refresh

- [ ] **Network Status Indicator**
  - [ ] Green dot visible when online (top-right corner)
  - [ ] Indicator turns yellow/offline if network fails
  - [ ] Indicator returns to green when network recovers

### Performance Testing

- [ ] **Initial Load**
  - [ ] Dashboard loads within 5 seconds
  - [ ] No long whitewait before content appears
  - [ ] No layout shift after initial render

- [ ] **Animation Performance**
  - [ ] Fade transitions smooth (30+ FPS)
  - [ ] Progress bar animation smooth (not jerky)
  - [ ] No lag when hovering or interacting
  - [ ] CPU usage reasonable (check Task Manager/Activity Monitor)

- [ ] **Memory Usage (Quick Check)**
  - [ ] Open browser Task Manager (Shift+Esc in Chrome/Edge)
  - [ ] Note initial memory usage
  - [ ] After 15 minutes, check memory again
  - [ ] Memory growth <5 MB (rough estimate acceptable)

### Console & Errors

- [ ] **Console Output**
  - [ ] Open DevTools Console (F12 or Cmd+Option+I)
  - [ ] No JavaScript errors (red text)
  - [ ] No uncaught exceptions
  - [ ] Warnings acceptable (note what they are)

- [ ] **Network Errors**
  - [ ] Go to Network tab
  - [ ] Check for failed requests (404, 500, etc.)
  - [ ] CORS errors should not appear (all same-origin)

### Browser-Specific Checks

#### Chromium 84 (Raspberry Pi) - PRIMARY TARGET

- [ ] **CSS Compatibility**
  - [ ] `-webkit-line-clamp` works for text truncation
  - [ ] `-webkit-box-orient: vertical` supported
  - [ ] CSS Grid and Flexbox work correctly
  - [ ] CSS Custom Properties (variables) work

- [ ] **JavaScript Compatibility**
  - [ ] ES6+ features work (arrow functions, classes, async/await)
  - [ ] ES Modules work (import/export)
  - [ ] Optional chaining `?.` works
  - [ ] Nullish coalescing `??` works

- [ ] **Performance on Pi Hardware**
  - [ ] Animations acceptable (30 FPS minimum)
  - [ ] No stuttering during page rotation
  - [ ] No slowdown after running for 30+ minutes
  - [ ] Dashboard usable without lag

- [ ] **Kiosk Mode**
  - [ ] Dashboard runs in fullscreen (F11 equivalent)
  - [ ] No browser UI visible (address bar, tabs, buttons)
  - [ ] Mouse cursor hidden when idle (optional)

#### Chrome/Edge (Latest) - DEVELOPMENT TARGET

- [ ] All features work as expected
- [ ] Performance excellent (60 FPS animations)
- [ ] DevTools available for debugging

#### Firefox (Latest) - COMPATIBILITY TARGET

- [ ] **Known Differences (Acceptable)**
  - [ ] Font rendering may differ slightly
  - [ ] Scrollbar styling may not match (Firefox doesn't support some webkit styles)
  
- [ ] **Must Work**
  - [ ] All timers functioning
  - [ ] All data loading
  - [ ] All functionality intact

## Test Results Template

### Browser: ______________________________
### Version: ______________________________
### Platform: ______________________________
### Date: ______________________________
### Tester: ______________________________

**Visual Rendering:** PASS / FAIL  
Issues: ______________________________

**Functional Testing:** PASS / FAIL  
Issues: ______________________________

**Performance:** PASS / FAIL  
Issues: ______________________________

**Console Errors:** PASS / FAIL  
Issues: ______________________________

**Overall Result:** PASS / FAIL

**Notes:**
______________________________
______________________________
______________________________

## Pass/Fail Criteria

### PASS Requirements

**For Chromium 84 (Primary Target):**
- ✅ ALL visual, functional, and performance checks must pass
- ✅ NO JavaScript console errors
- ✅ Animation framerate acceptable (30+ FPS)
- ✅ Dashboard usable on Pi 3B hardware

**For Chrome/Firefox/Edge (Secondary/Tertiary):**
- ✅ ALL functional checks must pass (timers, data, rotation)
- ✅ NO critical JavaScript errors
- ✅ Visual differences acceptable (fonts, scrollbars)
- ✅ Performance acceptable (may be better than Pi)

### FAIL Triggers

**Critical Issues (MUST FIX BEFORE PRODUCTION):**
- ❌ Timers not working (page rotation or item highlighting broken)
- ❌ Data not loading or displaying
- ❌ JavaScript errors breaking functionality
- ❌ Chromium 84 incompatible (primary target must work)
- ❌ Major visual breakage (layout broken, content invisible)

**Non-Critical Issues (Document but OK):**
- ⚠️ Minor font rendering differences across browsers
- ⚠️ Scrollbar styling differences (Firefox)
- ⚠️ Slightly lower performance in Firefox/Edge vs Chrome
- ⚠️ DevTools warnings (not errors)

## Testing Procedure

### 1. Setup
1. Build dashboard: `npm run build`
2. Start dev server: `npm run dev`
3. Open http://localhost:5173 in target browser

### 2. Visual Check (2 minutes)
1. Observe initial render
2. Check layout, colors, spacing
3. Take screenshot for reference

### 3. Functional Test (10 minutes)
1. Watch page rotation (at least 2 cycles = 1 minute)
2. Watch item highlighting (at least 5 highlights = 40 seconds)
3. Observe detail panel updates
4. Wait for API refresh (at 5-minute mark)
5. Verify refresh does not interrupt timers

### 4. Performance Check (5 minutes)
1. Open Task Manager/Activity Monitor
2. Note memory usage
3. Observe animation smoothness
4. Check for any lag or stuttering

### 5. Console Check (1 minute)
1. Open DevTools Console
2. Review any errors or warnings
3. Open Network tab, check for failed requests

### 6. Document Results
1. Fill out test results template
2. Take screenshots of any issues
3. Note any browser-specific quirks

## Raspberry Pi Testing

### On-Device Testing (Recommended)

1. **Deploy to Pi:**
   ```bash
   # On dev machine
   npm run build
   git commit -am "Build for Pi testing"
   git push
   
   # On Pi
   cd ~/dashboard
   git pull
   python3 -m http.server 8000
   ```

2. **Open in Chromium on Pi:**
   - If SSH'd to Pi, can't easily test visual
   - Physically go to Pi + TV
   - Open Chromium: `chromium-browser --kiosk http://localhost:8000`

3. **Run full test checklist on Pi**

4. **Document Pi-specific results**

### Remote Testing (Alternative)

If can't physically access Pi, can test Chromium 84 using:
- Docker container with Chromium 84
- Virtual machine with older Ubuntu + Chromium 84
- Browserstack or similar testing service

**Note:** Performance will differ from real Pi 3B hardware.

## Known Browser Quirks

### Chromium 84
- Older version, missing some modern CSS/JS features
- Requires `-webkit` prefixes for some CSS
- Performance limited by Pi 3B hardware (30 FPS target)

### Chrome (Latest)
- Best performance and feature support
- Primary development environment
- May have features not available in Chromium 84

### Firefox
- Different rendering engine (Gecko vs Blink/WebKit)
- Scrollbar styling limited (doesn't support webkit pseudo-elements)
- Font rendering may differ slightly
- Generally good standards compliance

### Edge (Latest)
- Chromium-based (similar to Chrome)
- Should have nearly identical behavior to Chrome
- Good standards compliance

## References

- Browser Compatibility: [Can I Use](https://caniuse.com/)
- Chromium 84 Features: [Chromium Dash](https://chromiumdash.appspot.com/releases?platform=Linux)
- CSS Compatibility: [MDN Browser Compatibility](https://developer.mozilla.org/en-US/)
- Project Context: [_bmad-output/project-context.md](../_bmad-output/project-context.md)
