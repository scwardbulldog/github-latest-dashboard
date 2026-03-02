# Story 1.4: Define GitHub Primer Design Tokens

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want all GitHub Primer design tokens defined as CSS custom properties,
So that I can enforce strict token usage throughout carousel implementation and maintain GitHub authenticity.

## Acceptance Criteria

**Given** I need GitHub Primer color tokens
**When** I define them in src/css/main.css under :root
**Then** all foundation colors are defined:
- `--color-canvas-default: #0d1117` (background)
- `--color-canvas-subtle: #161b22` (elevated surfaces)
- `--color-fg-default: #c9d1d9` (primary text)
- `--color-fg-muted: #7d8590` (secondary text)
- `--color-border-default: #21262d` (subtle borders)
**And** all semantic colors are defined:
- `--color-accent-fg: #58a6ff` (links)
- `--color-success-fg: #2da44e` (operational)
- `--color-attention-fg: #bf8700` (degraded)
- `--color-danger-fg: #cf222e` (critical)
- `--color-sponsor-fg: #8250df` (special emphasis)

**Given** I need spacing tokens
**When** I define them in src/css/main.css
**Then** the 8px base spacing scale is defined:
- `--space-1: 4px`
- `--space-2: 8px`
- `--space-3: 16px`
- `--space-4: 24px`
- `--space-5: 32px`
- `--space-6: 40px`
- `--space-8: 64px`

**Given** I need typography tokens
**When** I define them in src/css/main.css
**Then** font size tokens are defined:
- `--fontsize-h1: 32px` (section headers)
- `--fontsize-h2: 24px` (detail titles)
- `--fontsize-h3: 20px` (list titles)
- `--fontsize-base: 16px` (body text)
- `--fontsize-small: 14px` (metadata)
**And** font weight tokens are defined:
- `--fontweight-normal: 400`
- `--fontweight-semibold: 600`
**And** line height tokens are defined:
- `--lineheight-condensed: 1.25`
- `--lineheight-default: 1.5`

**Given** I need GitHub's font stack
**When** I define it in src/css/main.css
**Then** the exact GitHub Primer font-family is applied to body:
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", 
             Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
```

**Given** all tokens are defined
**When** I verify the existing MVP styles
**Then** no hardcoded color hex values exist outside token definitions
**And** no hardcoded pixel spacing values exist for padding/margin
**And** all styles reference tokens via `var(--token-name)`
**And** the build process includes these tokens in the final HTML

**Given** I want to validate GitHub Primer fidelity
**When** I compare token values to primer.style/design/color
**Then** all color values match GitHub Primer dark theme exactly
**And** spacing values follow the 8px base unit system
**And** typography scale aligns with GitHub standards

## Tasks / Subtasks

- [ ] Define GitHub Primer Color Tokens (AC: 1)
  - [ ] Create `:root` section at top of src/css/main.css for CSS custom properties
  - [ ] Add comment header: "/* GitHub Primer Design Tokens - https://primer.style/design/color */"
  - [ ] Define foundation colors with descriptive comments:
    - `--color-canvas-default: #0d1117;` /* Main background */
    - `--color-canvas-subtle: #161b22;` /* Elevated surfaces (cards, panels) */
    - `--color-fg-default: #c9d1d9;` /* Primary text color */
    - `--color-fg-muted: #7d8590;` /* Secondary text, timestamps, metadata */
    - `--color-border-default: #21262d;` /* Subtle borders and dividers */
  - [ ] Define semantic colors with usage comments:
    - `--color-accent-fg: #58a6ff;` /* Links, primary actions */
    - `--color-accent-emphasis: #1f6feb;` /* Link hover, active states */
    - `--color-success-fg: #2da44e;` /* Operational status, success states */
    - `--color-attention-fg: #bf8700;` /* Degraded status, warnings */
    - `--color-danger-fg: #cf222e;` /* Critical status, errors */
    - `--color-sponsor-fg: #8250df;` /* Special emphasis, featured content */
  - [ ] Verify hex values match GitHub Primer dark theme exactly (compare with GitHub.com)

- [ ] Define GitHub Primer Spacing Tokens (AC: 2)
  - [ ] Add comment: "/* Spacing Scale - 8px base unit */"
  - [ ] Define spacing scale following GitHub's 8px system:
    - `--space-1: 4px;` /* Micro spacing */
    - `--space-2: 8px;` /* Compact spacing */
    - `--space-3: 16px;` /* Default spacing */
    - `--space-4: 24px;` /* Medium spacing */
    - `--space-5: 32px;` /* Large spacing */
    - `--space-6: 40px;` /* Extra-large spacing */
    - `--space-8: 64px;` /* Section spacing */
  - [ ] Document usage patterns in comments for each scale level
  - [ ] Note: Story 1.5 will refactor existing hardcoded spacing to use these tokens

- [ ] Define Typography Tokens (AC: 3)
  - [ ] Add comment: "/* Typography - Font Sizes */"
  - [ ] Define font size scale optimized for TV viewing distance:
    - `--fontsize-h1: 32px;` /* Section headers (BLOG, CHANGELOG, STATUS) */
    - `--fontsize-h2: 24px;` /* Detail panel titles */
    - `--fontsize-h3: 20px;` /* List item titles */
    - `--fontsize-base: 16px;` /* Body text, descriptions */
    - `--fontsize-small: 14px;` /* Timestamps, metadata */
  - [ ] Add comment: "/* Typography - Font Weights */"
  - [ ] Define font weight tokens:
    - `--fontweight-normal: 400;` /* Regular body text */
    - `--fontweight-semibold: 600;` /* Headers, emphasis, highlighted items */
  - [ ] Add comment: "/* Typography - Line Heights */"
  - [ ] Define line height tokens:
    - `--lineheight-condensed: 1.25;` /* Tight spacing for headers */
    - `--lineheight-default: 1.5;` /* Comfortable reading for body text */
  - [ ] Verify sizes are readable from 10-15 feet (per TR4 display requirements)

- [ ] Update Font Stack to Match GitHub Primer (AC: 4)
  - [ ] Locate existing `body { font-family: ... }` rule in main.css (currently line 7)
  - [ ] Replace font-family with exact GitHub Primer stack:
    ```css
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", 
                 Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
    ```
  - [ ] Add comment above explaining this is GitHub's exact system font stack
  - [ ] Note: Current stack is close but missing "Noto Sans" and emoji fonts

- [ ] Refactor Existing Hardcoded Colors to Tokens (AC: 5)
  - [ ] Search main.css for hardcoded hex color values (e.g., `#0d1117`, `#c9d1d9`)
  - [ ] Replace hardcoded colors with token references:
    - `background: #0d1117;` → `background: var(--color-canvas-default);`
    - `color: #c9d1d9;` → `color: var(--color-fg-default);`
    - `border-color: #21262d;` → `border-color: var(--color-border-default);`
    - Progress bar gradient: `#1f6feb` → `var(--color-accent-emphasis)`, `#58a6ff` → `var(--color-accent-fg)`
    - Live indicator green: `#3fb950` → `var(--color-success-fg)`
  - [ ] Document each replacement in commit message for traceability
  - [ ] Verify NO hardcoded color hex values remain in CSS (except inside :root token definitions)

- [ ] Refactor Spacing to Use Tokens (AC: 5)
  - [ ] Search for hardcoded padding/margin pixel values
  - [ ] Replace common spacing values with tokens:
    - `padding: 24px;` → `padding: var(--space-4);`
    - `gap: 32px;` → `gap: var(--space-5);`
    - `padding: 12px 24px;` → `padding: var(--space-3) var(--space-4);`
    - `gap: 6px;` → `gap: calc(var(--space-1) + 2px);` OR leave as-is if 6px not in scale
  - [ ] Note: Some pixel values (like 1px borders) are acceptable and don't need tokens
  - [ ] Document which values were kept as hardcoded and why (e.g., 1px borders, 8px icon sizes)

- [ ] Validate Build and Visual Fidelity (AC: 5, 6)
  - [ ] Run `npm run dev` and verify dev server starts without errors
  - [ ] Open dashboard in browser and visually compare to previous version
  - [ ] Verify NO visual regressions (colors, spacing, typography should look identical)
  - [ ] Run `npm run build` and verify build completes successfully
  - [ ] Test built artifact in browser - verify token substitution worked correctly
  - [ ] Inspect computed styles in DevTools - confirm CSS variables resolved correctly
  - [ ] Compare side-by-side with GitHub.com using color picker tool (exact hex match)
  - [ ] Test on Raspberry Pi (deploy to Pi and verify no visual differences)

- [ ] Document Token Usage Guidelines (Dev Notes)
  - [ ] Update Dev Notes section with token usage rules
  - [ ] Document when to use each token category (colors, spacing, typography)
  - [ ] Provide examples of correct usage patterns
  - [ ] List exceptions where hardcoded values are acceptable
  - [ ] Reference GitHub Primer documentation for future token additions

## Dev Notes

### Epic Context

**Epic 1: Development Infrastructure Setup**
- **Goal:** Establish maintainable build system preserving MVP reliability while enabling carousel evolution
- **Why This Story Matters:** Creates the design system foundation (GitHub Primer tokens) that enforces visual consistency and prevents color/spacing drift across all carousel components
- **Dependencies:**
  - **Requires:** Story 1.1 (Vite build) ✅, Story 1.2 (source migration) ✅, Story 1.3 (component skeletons) ✅
  - **Enables:** Story 1.5 (final validation), Epic 2 (carousel pages will use these tokens), Epic 3 (split-view layout), Epic 4 (production polish)

**Story Position in Epic:**
- ✅ **Story 1.1 DONE:** Vite build system configured and validated
- ✅ **Story 1.2 DONE:** MVP migrated to /src structure (main.js, utils.js, main.css)
- ✅ **Story 1.3 DONE:** Component skeleton files created for carousel architecture
- 🎯 **Story 1.4 (THIS STORY):** Define GitHub Primer tokens in CSS
- ⏭️ **Story 1.5:** Validate complete build pipeline and deployment

### Critical Design System Requirements

**GITHUB PRIMER STRICT ADHERENCE (NON-NEGOTIABLE):**

🚨 **CRITICAL RULE:** GitHub Primer is the single source of truth for ALL visual decisions. No deviations, no custom colors, no "close enough" approximations. Every color, spacing value, and typography choice MUST come directly from GitHub Primer design system.

**Why This Matters:**
- Dashboard represents GitHub platform - must feel authentically GitHub
- Users trust familiar GitHub visual language
- Design consistency prevents visual debt and maintenance burden
- Token-based system prevents color/spacing drift over time
- Story 1.5 validation includes side-by-side comparison with GitHub.com

**Token Categories to Define:**

**1. Color Tokens (Foundation + Semantic):**
```css
:root {
  /* GitHub Primer Design Tokens - https://primer.style/design/color */
  
  /* Foundation Colors - Core Palette */
  --color-canvas-default: #0d1117;      /* Main background */
  --color-canvas-subtle: #161b22;       /* Elevated surfaces (cards, panels) */
  --color-fg-default: #c9d1d9;          /* Primary text color */
  --color-fg-muted: #7d8590;            /* Secondary text, timestamps, metadata */
  --color-border-default: #21262d;      /* Subtle borders and dividers */
  
  /* Semantic Colors - Contextual Usage */
  --color-accent-fg: #58a6ff;           /* Links, primary actions */
  --color-accent-emphasis: #1f6feb;     /* Link hover, active states */
  --color-success-fg: #2da44e;          /* Operational status, success states */
  --color-attention-fg: #bf8700;        /* Degraded status, warnings */
  --color-danger-fg: #cf222e;           /* Critical status, errors */
  --color-sponsor-fg: #8250df;          /* Special emphasis, featured content */
}
```

**Usage Patterns:**
- `canvas-*` tokens for backgrounds and surfaces
- `fg-*` tokens for text and icons
- `border-*` tokens for dividers and outlines
- Semantic tokens (`accent`, `success`, `attention`, `danger`) for status and interaction states

**2. Spacing Tokens (8px Base System):**
```css
:root {
  /* Spacing Scale - 8px base unit */
  --space-1: 4px;    /* Micro spacing (tight gaps, icon margins) */
  --space-2: 8px;    /* Compact spacing (list items, small gaps) */
  --space-3: 16px;   /* Default spacing (comfortable gaps) */
  --space-4: 24px;   /* Medium spacing (section padding) */
  --space-5: 32px;   /* Large spacing (component separation) */
  --space-6: 40px;   /* Extra-large spacing (page margins) */
  --space-8: 64px;   /* Section spacing (major layout breaks) */
}
```

**Spacing Guidelines:**
- Favor tokens over hardcoded pixel values
- 1px borders and constraints are acceptable exceptions
- Use calc() for in-between values: `calc(var(--space-2) + 2px)` for 10px
- Consistent spacing creates visual harmony and professional polish

**3. Typography Tokens (TV-Distance Optimized):**
```css
:root {
  /* Typography - Font Sizes */
  --fontsize-h1: 32px;       /* Section headers (BLOG, CHANGELOG, STATUS) */
  --fontsize-h2: 24px;       /* Detail panel titles */
  --fontsize-h3: 20px;       /* List item titles */
  --fontsize-base: 16px;     /* Body text, descriptions */
  --fontsize-small: 14px;    /* Timestamps, metadata */
  
  /* Typography - Font Weights */
  --fontweight-normal: 400;
  --fontweight-semibold: 600;
  
  /* Typography - Line Heights */
  --lineheight-condensed: 1.25;   /* Tight spacing for headers */
  --lineheight-default: 1.5;      /* Comfortable reading for body text */
}
```

**Typography Requirements (TR4):**
- Minimum 16px body text (readable from 10-15 feet)
- Clear hierarchy: 32px headers, 24px titles, 20px subtitles, 16px body
- WCAG AA contrast ratios (4.5:1 for body text, 3:1 for large text)
- Font weights: 400 (normal) and 600 (semibold) only - no extremes

**GitHub Primer Font Stack (MANDATORY):**
```css
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", 
               Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
}
```

**Why This Exact Stack:**
- `-apple-system`: Native San Francisco font on macOS/iOS
- `BlinkMacSystemFont`: Native Segoe UI on Windows
- `"Segoe UI"`: Fallback for older Windows
- `"Noto Sans"`: Cross-platform Open Source alternative
- System font stack = zero download time, native OS performance
- Emoji fonts ensure proper rendering of GitHub emoji in content

### Current CSS State Analysis (From Story 1.2)

**Existing Hardcoded Values to Replace:**

**Colors (Line-by-Line Audit Required):**
- Line 7: `background: #0d1117;` → `var(--color-canvas-default)`
- Line 8: `color: #c9d1d9;` → `var(--color-fg-default)`
- Line 26: Progress bar gradient `#1f6feb`, `#58a6ff` → token variables
- Line 30: Box-shadow color `rgba(31, 111, 235, 0.6)` → use accent token with opacity
- Line 97: `border-bottom: 1px solid #21262d;` → `var(--color-border-default)`
- Line 110: GitHub icon fill `#c9d1d9;` → `var(--color-fg-default)`
- Line 117: Header text `#c9d1d9;` → `var(--color-fg-default)`
- Line 131: Muted text `#7d8590;` → `var(--color-fg-muted)`
- Line 137: Success green `#3fb950;` → `var(--color-success-fg)`
- Additional colors throughout (~30-40 instances total)

**Spacing (Common Patterns):**
- `padding: 12px 24px;` → `var(--space-3) var(--space-4);` (header padding)
- `gap: 32px;` → `gap: var(--space-5);` (dashboard grid gap)
- `padding: 24px;` → `padding: var(--space-4);` (section padding)
- `gap: 16px;` → `gap: var(--space-3);` (header-right gap)
- `gap: 6px;` → Keep as-is OR use calc (6px not in standard 8px scale)
- `border-radius: 6px;` → Keep as-is (GitHub Primer uses 6px for buttons)

**Typography:**
- Font sizes: Mix of em and px units (standardize to px tokens)
- `font-size: 1.25em;` → `font-size: var(--fontsize-h3);` (20px)
- `font-size: 0.875em;` → `font-size: var(--fontsize-small);` (14px)
- Font weight 600 → `var(--fontweight-semibold)`

### Token Usage Rules & Exceptions

**ALWAYS Use Tokens For:**
- Background colors: `var(--color-canvas-*)`
- Text colors: `var(--color-fg-*)`
- Border colors: `var(--color-border-*)`
- Link colors: `var(--color-accent-*)`
- Status colors: `var(--color-success-fg)`, `var(--color-attention-fg)`, `var(--color-danger-fg)`
- Component padding/margin: `var(--space-*)`
- Grid/flexbox gaps: `var(--space-*)`
- Font sizes: `var(--fontsize-*)`
- Font weights: `var(--fontweight-*)`
- Line heights: `var(--lineheight-*)`

**Acceptable Hardcoded Exceptions:**
- **1px borders:** `border: 1px solid var(--color-border-default);` (1px is constant)
- **Icon sizes:** `width: 32px; height: 32px;` (specific icon dimensions)
- **Transition durations:** `transition: 200ms ease;` (timing values)
- **Z-index layers:** `z-index: 1000;` (layering system)
- **Opacity values:** `opacity: 0.8;` (alpha transparency)
- **Transform values:** `translateX(-50%)` (positioning calculations)
- **Border radius (GitHub standard):** `border-radius: 6px;` (Primer uses 6px for medium components)
- **Viewport units:** `height: 100vh;` (responsive measurements)

**Special Cases:**
- **6px spacing:** Not in standard 8px scale, but GitHub uses it - keep as hardcoded or use `calc(var(--space-2) - 2px)`
- **Gradient colors:** Extract base colors to tokens, compose in gradient: `linear-gradient(90deg, var(--color-accent-emphasis) 0%, var(--color-accent-fg) 100%)`
- **RGBA with opacity:** Use token + opacity: `background: color-mix(in srgb, var(--color-accent-fg) 60%, transparent);` (modern) OR `rgba(88, 166, 255, 0.6)` (compatibility)

### Refactoring Strategy (Minimize Risk)

**Two-Phase Approach (Recommended):**

**Phase 1 (THIS STORY):**
- Define all tokens in `:root` section
- Update font-family to Primer stack
- Replace ONLY the most critical colors (backgrounds, text, borders)
- Replace common spacing patterns (grid gaps, padding)
- Validate visually - ensure no regressions

**Phase 2 (Future - Story 1.5 or Epic 2 kickoff):**
- Systematic replacement of remaining hardcoded values
- Component-by-component verification
- Edge case handling (gradients, shadows, rgba values)

**OR Single-Shot Approach (If Confident):**
- Define all tokens
- Search-and-replace all hardcoded color hex values
- Replace spacing values
- Update typography references
- Thorough visual regression testing

**Search Patterns for Find-and-Replace:**
```bash
# Find hardcoded colors
grep -n "#[0-9a-f]\{6\}" src/css/main.css

# Find hardcoded spacing (padding/margin with px)
grep -n "padding:\|margin:" src/css/main.css | grep "px"

# Find font-size in px
grep -n "font-size:.*px" src/css/main.css
```

### Visual Regression Prevention

**Validation Checklist:**
1. ✅ Dev server starts without errors (`npm run dev`)
2. ✅ Dashboard displays identically to pre-refactor version (side-by-side comparison)
3. ✅ All three columns render correctly (Blog, Changelog, Status)
4. ✅ Colors match GitHub.com exactly (use color picker to compare)
5. ✅ Typography hierarchy is clear and readable
6. ✅ Spacing feels consistent and GitHub-authentic
7. ✅ Build completes successfully (`npm run build`)
8. ✅ Built artifact displays identically to dev server
9. ✅ No console errors or CSS warnings
10. ✅ Pi deployment works without visual regressions

**Side-by-Side Comparison Method:**
- Open GitHub.com in one browser tab
- Open dashboard in adjacent tab
- Use browser color picker (DevTools) to sample colors
- Verify hex values match exactly
- Check spacing/padding against GitHub UI elements
- Confirm font rendering matches GitHub typography

### Previous Story Intelligence (Story 1.3)

**Key Learnings from Story 1.3 (Component Skeletons):**

**1. CSS Organization Strategy Established:**
- Story 1.3 focused on JavaScript component skeletons
- CSS organization deferred to this story (1.4) and future stories
- Plan: `main.css` (tokens), `layout.css` (grid/flexbox), `carousel.css` (transitions), `components.css` (UI elements)
- Tokens must be defined FIRST in `main.css` before other CSS files reference them

**2. Multi-File Build Pipeline Validated:**
- Vite successfully bundles multiple `.js` files into single output
- Same approach works for multiple `.css` files (imported in main or linked in HTML)
- Build inlines all CSS into final `index.html` (Pi deployment pattern)
- Hot reload works perfectly with CSS changes

**3. Import Pattern for CSS Modules (Future):**
```css
/* src/css/main.css */
@import url('./layout.css');
@import url('./carousel.css');
@import url('./components.css');
```
OR link separately in HTML (both work with Vite)

**4. Token-First Development Pattern:**
- Define tokens BEFORE writing new component styles
- Enforces consistency from day one
- Prevents "we'll tokenize later" debt accumulation
- Makes Epic 2 carousel CSS development cleaner and faster

**5. Current main.css Status:**
- 596 lines of CSS (MVP styles)
- Mix of hardcoded colors, spacing, and typography
- Functional but not token-based (technical debt from MVP speed)
- THIS STORY cleans up technical debt before Epic 2 expansion

**Implications for This Story:**
- Token definitions go at TOP of main.css (before any styles)
- Systematic refactoring of existing 596 lines to use tokens
- Validate MVP still looks identical after tokenization
- Set precedent for Epic 2+ development (tokens mandatory from start)

### Architecture & Design System Context

**From Architecture Document:**

**Core Constraint (Cannot Violate):**
- "GitHub Primer strictness: No design deviations permitted - exact color/font/spacing tokens required"
- "Token-based CSS (colors, typography, spacing from Primer)"
- "Inspection of GitHub.com for patterns not explicitly documented"

**Design System Philosophy:**
- GitHub Primer as single source of truth (not Bootstrap, not custom)
- Token-based CSS prevents drift and maintains authenticity
- Side-by-side validation with GitHub.com to ensure fidelity

**From UX Design Document:**

**Experience Principle P4: GitHub Authenticity Above All**
- "Preserve the existing GitHub Primer design language, color palette, and visual patterns without deviation"
- "The dashboard represents GitHub and must feel authentically GitHub, not a custom interpretation"

**Emotional Goal: Calm Confidence**
- Familiar GitHub visual language creates trust and comfort
- Users recognize and trust the design system they use daily
- Visual consistency = credibility and professionalism

**Design Challenge C3: Maintaining GitHub Authenticity**
- All design evolution must preserve GitHub Primer design language
- Users already love the existing styling - don't break what works
- Token system enforces authenticity throughout carousel implementation

### Technical Implementation Patterns

**CSS Custom Property Syntax:**

**Definition (in `:root`):**
```css
:root {
  --color-canvas-default: #0d1117;
  --space-4: 24px;
  --fontsize-base: 16px;
}
```

**Usage (in styles):**
```css
body {
  background: var(--color-canvas-default);
  padding: var(--space-4);
  font-size: var(--fontsize-base);
}
```

**With Fallback (optional, not needed if tokens always defined):**
```css
color: var(--color-fg-default, #c9d1d9);
```

**In Calc Expressions:**
```css
padding: calc(var(--space-3) + var(--space-1));  /* 16px + 4px = 20px */
gap: calc(var(--space-2) - 2px);                /* 8px - 2px = 6px */
```

**Why CSS Custom Properties:**
- Native browser support (no preprocessor needed)
- Runtime values (can be changed dynamically if needed)
- Inheritance and cascading (root-level tokens available everywhere)
- DevTools inspection (see resolved values in browser)
- Zero performance cost (compiled by browser)

### Token Naming Conventions (GitHub Primer)

**Color Token Pattern:**
- Structure: `--color-{category}-{variant}`
- Categories: `canvas` (backgrounds), `fg` (foreground/text), `border`, `accent`, `success`, `attention`, `danger`, `sponsor`
- Variants: `default`, `subtle`, `emphasis`, `muted`, `strong`
- Examples: `--color-canvas-default`, `--color-fg-muted`, `--color-accent-emphasis`

**Spacing Token Pattern:**
- Structure: `--space-{number}`
- Based on 8px scale: 1 (4px), 2 (8px), 3 (16px), 4 (24px), 5 (32px), 6 (40px), 8 (64px)
- Numbers represent scale steps, not pixel values directly
- Gaps in scale are intentional (no --space-7, follows Primer system)

**Typography Token Pattern:**
- Font sizes: `--fontsize-{role}` (h1, h2, h3, base, small)
- Font weights: `--fontweight-{name}` (normal, semibold)
- Line heights: `--lineheight-{name}` (condensed, default)
- Family-based semantic naming rather than numeric scale

**Why These Conventions:**
- Matches GitHub Primer official documentation
- Self-documenting (names explain usage)
- Semantic rather than presentational (canvas-subtle vs bg-gray-2)
- Future-proof for design system evolution

### Testing & Validation Strategy

**Unit-Level Validation:**
- [ ] All token values defined in `:root`
- [ ] No syntax errors in CSS (check browser console)
- [ ] All hardcoded colors replaced (except :root definitions)
- [ ] Spacing values use tokens where appropriate
- [ ] Typography references tokens consistently

**Visual Regression Testing:**
- [ ] Side-by-side screenshots: before vs after tokenization
- [ ] Color picker verification: hex values match GitHub.com
- [ ] Spacing measurements: padding/margin matches expected token values
- [ ] Typography hierarchy: sizes, weights, line-heights render correctly
- [ ] Cross-browser check: Chromium dev vs Pi (ARM) rendering

**Build Pipeline Validation:**
- [ ] Dev server compiles CSS without errors
- [ ] Hot reload updates tokens correctly
- [ ] Build output includes inlined CSS with resolved tokens
- [ ] Final HTML file size acceptable (tokens don't bloat output)

**Deployment Validation (Story 1.5):**
- [ ] Pi pulls updated code successfully
- [ ] Dashboard loads and displays correctly
- [ ] No visual regressions on actual TV hardware
- [ ] 24-hour stability test (tokens don't cause runtime issues)

### Risk Analysis & Mitigation

**Risk 1: Visual Regression from Incorrect Token Values**
- **Impact:** Dashboard looks broken or different from MVP
- **Mitigation:** 
  - Copy hex values EXACTLY from current CSS
  - Verify against GitHub Primer documentation
  - Side-by-side visual comparison before committing
  - Git allows instant rollback if issues found

**Risk 2: Missing Token Definitions Break Styles**
- **Impact:** Some elements lose styling (blank/default appearance)
- **Mitigation:**
  - Define ALL tokens upfront before refactoring
  - Test in dev server after each batch of changes
  - Browser DevTools shows which tokens are undefined/invalid

**Risk 3: Calc() Expressions or Complex Values Don't Work**
- **Impact:** Spacing or sizing breaks in edge cases
- **Mitigation:**
  - Test calc() expressions in isolation first
  - Keep complex values as comments during refactor for debugging
  - Fall back to hardcoded values for genuinely complex cases

**Risk 4: Build Pipeline Issues with Token Resolution**
- **Impact:** Vite fails to inline CSS properly, tokens don't resolve in build
- **Mitigation:**
  - Native CSS custom properties work in Vite without plugins
  - Test `npm run build` frequently during refactoring
  - Build output is readable HTML - can inspect directly for token resolution

**Risk 5: Pi/Chromium Compatibility with CSS Custom Properties**
- **Impact:** Tokens don't work on actual deployment hardware
- **Mitigation:**
  - CSS custom properties supported since Chrome 49 (Chromium 84 on Pi is much newer)
  - Zero compatibility risk for this Pi/Chromium version
  - Manual test on Pi after deployment (Story 1.5 validation)

### File Changes Summary

**Files Modified:**
- `src/css/main.css` - Add :root token definitions, refactor existing styles to use tokens (~80-100 line changes out of 596 total)

**Files NOT Modified (Remain for Future Stories):**
- `src/index.html` - No HTML changes needed (CSS only)
- `src/js/*.js` - No JavaScript changes (pure CSS story)
- Component skeleton files - Unchanged (Story 1.3 deliverables)

**Build Artifacts:**
- `index.html` (project root) - Rebuilt with updated CSS (Vite inlines updated main.css)

**Git Workflow:**
```bash
# Make changes to src/css/main.css
git add src/css/main.css
git commit -m "Story 1.4: Define GitHub Primer design tokens

- Add :root section with color, spacing, typography tokens
- Refactor hardcoded values to use token variables
- Update font-family to exact GitHub Primer stack
- Preserve visual appearance (no regressions)
- Enable token-based development for Epic 2+"

# Build and commit artifact
npm run build
git add index.html
git commit -m "Build: Update with Primer tokens"
git push origin main
```

### Project Structure Notes

**Alignment with Unified Project Structure:**
- CSS custom properties in `src/css/main.css` follow industry standard pattern
- Token definitions at file top (before all other styles) is best practice
- Modular CSS architecture (main.css + future layout.css, etc.) matches architecture plan
- Build pipeline inlines all CSS into single output (deployment requirement)

**Architecture Document References:**
- Token-based styling: [architecture.md](/_bmad-output/planning-artifacts/architecture.md#styling-system-requirements)
- GitHub Primer requirement: [architecture.md](/_bmad-output/planning-artifacts/architecture.md#technical-constraints-dependencies)
- CSS organization plan: [architecture.md](/_bmad-output/planning-artifacts/architecture.md#source-structure)

**UX Design References:**
- GitHub authenticity principle: [ux-design-specification.md](/_bmad-output/planning-artifacts/ux-design-specification.md#experience-principles)
- Distance-optimized typography: [ux-design-specification.md](/_bmad-output/planning-artifacts/ux-design-specification.md#visual-design-requirements)
- Color usage for status: [ux-design-specification.md](/_bmad-output/planning-artifacts/ux-design-specification.md#critical-user-experience-needs)

**Project Context References:**
- CSS token patterns: [project-context.md](/_bmad-output/project-context.md#github-primer-design-system-non-negotiable)
- Spacing scale usage: [project-context.md](/_bmad-output/project-context.md#layout-spacing-github-primer-scale)
- Typography requirements: [project-context.md](/_bmad-output/project-context.md#typography-distance-optimized)

### Next Story Preview

**Story 1.5: Validate Build Pipeline & Deployment**
- Comprehensive validation of complete Epic 1 infrastructure
- Build pipeline testing (dev, build, preview workflows)
- Pi deployment validation (git pull, auto-restart, display verification)
- 24-hour stability test on hardware
- GitHub Primer fidelity validation (side-by-side with GitHub.com)
- Readiness checkpoint before Epic 2 (Page Rotation System) begins

**Why Token Story MUST Complete Before Story 1.5:**
- Story 1.5 validates the COMPLETE infrastructure including token system
- Tokenization affects visual fidelity tests (must be stable first)
- Epic 2 development depends on token foundation being solid
- Prevents half-tokenized codebase entering Epic 2

### References

**Source Material:**
- [Epic 1: Development Infrastructure Setup](/_bmad-output/planning-artifacts/epics.md#epic-1-development-infrastructure-setup)
- [Story 1.4 Requirements](/_bmad-output/planning-artifacts/epics.md#story-14-define-github-primer-design-tokens)
- [Architecture: Styling System Requirements](/_bmad-output/planning-artifacts/architecture.md#styling-system-requirements)
- [Architecture: GitHub Primer Constraint](/_bmad-output/planning-artifacts/architecture.md#technical-constraints-dependencies)
- [UX Design: GitHub Authenticity Principle](/_bmad-output/planning-artifacts/ux-design-specification.md#experience-principles)
- [UX Design: Visual Design Requirements](/_bmad-output/planning-artifacts/ux-design-specification.md#visual-design-requirements)
- [Project Context: Design System Rules](/_bmad-output/project-context.md#github-primer-design-system-non-negotiable)
- [Story 1.3: Component Skeleton Files](/_bmad-output/implementation-artifacts/1-3-create-component-skeleton-files.md)
- [GitHub Primer Official Documentation](https://primer.style/design/color)

**External Resources:**
- GitHub Primer Colors: https://primer.style/design/color
- GitHub Primer Primitives: https://primer.style/design/foundations/primitives
- CSS Custom Properties (MDN): https://developer.mozilla.org/en-US/docs/Web/CSS/--*

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent during implementation_

### Debug Log References

_To be filled by dev agent during implementation_

### Completion Notes List

_To be filled by dev agent during implementation_

### File List

**Expected Files Modified:**
- src/css/main.css (add tokens, refactor existing styles)

**Expected Build Artifacts:**
- index.html (rebuilt with updated CSS)
