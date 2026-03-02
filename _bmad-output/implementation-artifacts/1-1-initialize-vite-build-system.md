# Story 1.1: Initialize Vite Build System

Status: done

## Story

As a developer,
I want a Vite build system configured to bundle multi-file source into a single deployable HTML file,
So that I can develop carousel features in organized modules while maintaining the simple deployment model.

## Acceptance Criteria

**Given** I have Node.js and npm installed on my development machine
**When** I run `npm install`
**Then** Vite and required dependencies are installed successfully
**And** package.json includes vite dependency and build scripts (dev, build, preview)

**Given** I have a configured vite.config.js file
**When** I run `npm run build`
**Then** a single index.html file is produced in the project root
**And** the index.html contains inlined CSS and JavaScript (no external files)
**And** the file size is reasonable (< 500KB for initial build)

**Given** the Vite dev server is running
**When** I run `npm run dev`
**Then** the dev server starts on localhost:5173
**And** hot module replacement works for CSS and JS changes
**And** the browser automatically refreshes when files are modified

**Given** I want to test the production build locally
**When** I run `npm run build && npm run preview`
**Then** the built index.html is served on a local preview server
**And** the built artifact behaves identically to the dev server

**Given** the build process completes
**When** I inspect the output index.html
**Then** it contains no references to external CSS or JS files
**And** all assets are inlined in the single HTML file
**And** the file is ready to commit to git for Pi deployment

## Tasks / Subtasks

- [x] Initialize npm project (AC: 1)
  - [x] Run `npm init -y` to create package.json
  - [x] Install Vite: `npm install --save-dev vite`
  - [x] Install Vite plugin for HTML inlining (if needed): research and install appropriate plugin
  - [x] Verify dependencies in package.json
  
- [x] Configure Vite build system (AC: 2, 4, 5)
  - [x] Create vite.config.js with single HTML output configuration
  - [x] Configure Rollup options for inline CSS/JS (no external assets)
  - [x] Set build output directory to project root (where index.html currently lives)
  - [x] Configure build to NOT empty output directory (preserve other files)
  - [x] Test build produces single index.html < 500KB
  
- [x] Create package.json scripts (AC: 1, 3, 4)
  - [x] Add `"dev": "vite"` script for development server
  - [x] Add `"build": "vite build"` script for production build
  - [x] Add `"preview": "vite preview"` script for local testing
  - [x] Verify scripts execute correctly
  
- [x] Configure .gitignore (AC: 5)
  - [x] Create/update .gitignore to ignore node_modules/
  - [x] Ensure index.html is NOT ignored (needed for Pi deployment)
  - [x] Ensure package-lock.json is NOT ignored (reproducible builds)
  - [x] Verify git status shows correct tracking

- [x] Validate build pipeline (AC: 2, 3, 4, 5)
  - [x] Run `npm run dev` and verify server starts on localhost:5173
  - [x] Make a test HTML change, verify HMR works
  - [x] Run `npm run build` and verify index.html output in root
  - [x] Inspect built index.html for inlined assets
  - [x] Run `npm run preview` and verify built artifact works

## Dev Notes

### Epic Context

**Epic 1: Development Infrastructure Setup**
- **Goal:** Establish maintainable build system preserving MVP reliability while enabling carousel evolution
- **Why This Story Matters:** Foundation for all carousel features - without proper build infrastructure, multi-file component architecture is impossible
- **Dependencies:** This is Story 1 of Epic 1, the critical foundation - all subsequent stories depend on this infrastructure

### Critical Architecture Requirements

**Build System Must-Haves:**
1. **Single HTML Output:** Pi deployment expects index.html in project root - Vite MUST inline all CSS/JS
2. **No Build on Pi:** All compilation happens on dev machine - Pi only serves built artifact via Python http.server
3. **Git-Based Deployment:** Pi pulls latest from main branch - built index.html must be committed to repo
4. **Performance Constraints:** Pi 3B has limited resources - bundle size must stay reasonable (< 500KB target)
5. **Chromium 84 Compatibility:** Output must work in older Chromium version on Pi

**Vite Configuration Critical Points:**
- Output directory: Project root (where current index.html lives)
- Output filename: Must be `index.html` exactly (Pi systemd service expects this)
- Asset inlining: CSS and JS MUST be inlined, not separate files
- Empty outDir: MUST be `false` to preserve other project files (docs/, deploy/, _bmad/, etc.)
- Build validation: Any syntax errors must fail the build (prevent broken deployments)

**Source Structure (to be created in Story 1.2):**
```
/src
  /js
    main.js                    // Application entry point
    carousel-controller.js     // Page rotation (Story 2.x)
    item-highlighter.js        // Item highlighting (Story 3.x)
    detail-panel.js            // Detail view (Story 3.x)
    api-client.js              // API fetching with caching
    utils.js                   // formatDate, stripHtml, truncate
  /css
    main.css                   // GitHub Primer tokens
    layout.css                 // Grid and split-view
    carousel.css               // Page transitions
    components.css             // Item cards, detail panel
```

### Technology Stack & Patterns

**Package Dependencies:**
```json
{
  "devDependencies": {
    "vite": "^5.0.0",
    "vite-plugin-singlefile": "^0.13.5"  // For HTML inlining (research if needed)
  }
}
```

**Vite Config Pattern (CRITICAL):**
```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '.',              // Output to project root (Pi expects index.html here)
    emptyOutDir: false,       // DON'T delete other files
    rollupOptions: {
      input: 'index.html',     // Use existing root index.html as entry
      output: {
        entryFileNames: 'assets/[name].js',
        inlineDynamicImports: true, // Single bundle
      }
    }
  },
  server: {
    port: 5173,               // Standard Vite dev port
    open: true                // Auto-open browser
  }
});
```

**Important Note:** Research whether additional plugins are needed for complete CSS/JS inlining. The `vite-plugin-singlefile` plugin may be required - validate during implementation.

**Development Workflow (After This Story):**
```bash
# Daily development
npm run dev              # Vite dev server with hot reload

# Deployment
npm run build            # Produces index.html in project root
git add index.html src/  # Stage source and artifact
git commit -m "Add feature"
git push origin main     # Deploy to Pi (auto-pulls on restart)
```

**Raspberry Pi Deployment (Unchanged):**
- Pi runs `/home/pi/update-dashboard.sh` on boot via systemd
- Script executes: `git reset --hard origin/main`
- Python http.server serves index.html from project root
- No npm, no Node.js, no build tooling on Pi
- Zero changes to Pi configuration required

### File Structure Requirements

**Files to Create in This Story:**
1. `package.json` - npm project configuration with scripts
2. `vite.config.js` - Vite bundler configuration
3. `.gitignore` - Ignore node_modules/, keep index.html and package-lock.json

**Files NOT Created Yet (Future Stories):**
- `/src/` directory and contents (Story 1.2: Migrate Current MVP)
- Component skeleton files (Story 1.3: Create Component Skeleton)
- CSS token definitions (Story 1.4: Define GitHub Primer Tokens)

**Current State (Before This Story):**
- Single `index.html` (1312 lines) with inline CSS and JavaScript
- No build system, no dependencies, no source structure
- Existing files: index.html, README.md, deploy/, docs/, _bmad/, _references/

**Expected State (After This Story):**
- `package.json` with Vite dependency and scripts
- `vite.config.js` configured for single HTML output
- `node_modules/` installed (ignored by git)
- `.gitignore` properly configured
- Build pipeline validated but no actual migration yet (that's Story 1.2)

### Testing & Validation Strategy

**Build Validation Checklist:**
1. **Installation Test:** `npm install` succeeds without errors
2. **Dev Server Test:** `npm run dev` starts on localhost:5173
3. **Build Test:** `npm run build` produces index.html in project root
4. **Preview Test:** `npm run preview` serves built artifact
5. **Output Validation:** Built index.html has no external CSS/JS references
6. **Size Check:** Built file < 500KB (should be smaller for this initial setup)
7. **Git Tracking:** node_modules/ ignored, index.html and package-lock.json tracked

**Hot Module Replacement Validation:**
1. Start dev server: `npm run dev`
2. Make a test change to HTML (add a comment, change text)
3. Verify browser updates without full page reload
4. Verify console shows HMR update confirmation

**Build Artifact Validation:**
1. Inspect built index.html source
2. Confirm all `<style>` tags are inline (no external CSS links)
3. Confirm all `<script>` tags are inline (no external JS files)
4. Verify no `/assets/` folder created in project root
5. Verify built file is valid HTML and can be opened directly in browser

**Deployment Simulation:**
1. Commit built index.html to git
2. Push to GitHub
3. Test Pi can pull and serve the file (if Pi available)
4. Verify no regression from current MVP behavior

### GitHub Primer Design Requirements

**(Not applicable to this infrastructure story - relevant for Stories 1.4+)**

This story establishes the build tooling that will later enforce GitHub Primer token usage. No design implementation in this story.

### Performance Considerations

**Build Performance:**
- Vite is optimized for speed - builds should complete in < 10 seconds
- Development server starts nearly instantly with HMR
- No performance concerns at this stage (initial setup is lightweight)

**Runtime Performance (Pi 3B Considerations):**
- Built artifact must load quickly on Pi 3B (< 2 second page load)
- Inlined CSS/JS reduces HTTP requests (good for performance)
- Tree-shaking removes unused code (Vite handles automatically)
- Bundle size target: < 500KB initially, monitor as features are added

**Memory Considerations:**
- Development: node_modules/ can be large (~100-200MB) but only on dev machine
- Pi: Zero Node.js footprint, only serves built HTML file
- No memory concerns for this infrastructure story

### Error Handling & Edge Cases

**Common Vite Configuration Issues:**
1. **External File References:** If CSS/JS not properly inlined, build fails silently - validate output
2. **Output Directory Conflicts:** Setting `emptyOutDir: true` will DELETE all project files - MUST be false
3. **Path Resolution:** Vite uses `/` root for imports - verify relative paths work correctly
4. **Plugin Compatibility:** If using vite-plugin-singlefile, ensure version compatibility

**Deployment Gotchas:**
1. **Forgetting to Commit Built Artifact:** index.html must be committed for Pi deployment
2. **Breaking Pi Systemd Service:** index.html MUST remain in project root or Pi service breaks
3. **Large Bundle Size:** If dependencies grow too large, Pi may struggle - monitor bundle size

**Network Dependency:**
- npm installation requires internet connection
- Build process is offline-capable after installation
- Pi deployment requires git connectivity only (no npm)

### References

**Source Documents:**
- [Architecture: Build Tooling & Project Structure](../_bmad-output/planning-artifacts/architecture.md#build-tooling--project-structure)
- [Architecture: Development Workflow](../_bmad-output/planning-artifacts/architecture.md#development-workflow)
- [Project Context: Technology Stack & Versions](../_bmad-output/project-context.md#technology-stack--versions)
- [Project Context: Build & Deployment Workflow](../_bmad-output/project-context.md#build--deployment-workflow)
- [Epic 1: Development Infrastructure Setup](../_bmad-output/planning-artifacts/epics.md#epic-1-development-infrastructure-setup)

**External Documentation:**
- [Vite Official Guide](https://vitejs.dev/guide/)
- [Vite Config Reference](https://vitejs.dev/config/)
- [Vite Plugin SingleFile](https://github.com/richardtallent/vite-plugin-singlefile) (if needed)

**Related Files:**
- Current: `/index.html` (1312 lines - current MVP to be migrated in Story 1.2)
- Current: `/deploy/README.md` (Pi deployment documentation)
- Current: `/deploy/systemd/dashboard-server.service` (systemd service expects index.html in root)
- Future: `/src/index.html` (to be created in Story 1.2)
- Future: `/src/js/main.js` (to be created in Story 1.2)
 - Current: `/octocat-racer-reference.html` (visual reference asset, outside this story's scope)
 - Current: `/octocat-skater.png` (sprite reference asset, outside this story's scope)

### Success Criteria Summary

**This story is complete when:**
1. ✅ `npm install` succeeds and installs Vite dependencies
2. ✅ `npm run dev` starts Vite dev server on localhost:5173
3. ✅ `npm run build` produces single index.html in project root with inlined assets
4. ✅ `npm run preview` serves built artifact for local testing
5. ✅ Built index.html has zero external CSS/JS file references
6. ✅ .gitignore properly configured (node_modules/ ignored, index.html tracked)
7. ✅ Build artifact size < 500KB
8. ✅ Hot module replacement works for HTML/CSS/JS changes

**Story does NOT include:**
- Migrating current MVP to /src structure (that's Story 1.2)
- Creating component skeleton files (that's Story 1.3)
- Defining GitHub Primer tokens (that's Story 1.4)
- Any functional changes to current dashboard behavior

**Next Story:** 1.2 - Migrate Current MVP to Source Structure (requires this build system)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5

### Implementation Plan

1. **Initialize npm project** - Run `npm init -y` and configure for ES modules
2. **Install dependencies** - Install Vite, vite-plugin-singlefile, and terser
3. **Configure Vite** - Create vite.config.js with single-file output settings
4. **Add npm scripts** - Configure dev, build, and preview commands
5. **Configure .gitignore** - Ignore node_modules/ while tracking build artifacts
6. **Validate pipeline** - Test all commands and verify single-file output

### Debug Log References

**Issue: Terser Dependency Missing**
- **Problem:** Initial build failed with "terser not found" error
- **Cause:** Vite v3+ requires terser as optional dependency for minification
- **Solution:** Installed terser separately: `npm install --save-dev terser`
- **Result:** Build succeeded after terser installation

**Configuration Decision: vite-plugin-singlefile**
- **Research:** Evaluated need for complete CSS/JS inlining
- **Decision:** Installed vite-plugin-singlefile v2.3.0 for complete asset inlining
- **Reason:** Pi deployment requires single HTML file with no external dependencies
- **Validation:** Test build confirmed all assets inlined successfully with output well under the 500KB requirement

**Build Output Configuration**
- **Setting:** `outDir: '.'` outputs to project root as required for Pi deployment
- **Warning:** Vite warns about root directory output (expected and safe)
- **Setting:** `emptyOutDir: false` preserves other project files
- **Setting:** `input: 'index.html'` uses the existing root entry until Story 1.2 migrates the MVP into /src

### Completion Notes List

✅ **All Tasks Completed Successfully**

1. **npm project initialized** - package.json created with ES module support
2. **Dependencies installed** - Vite 7.3.1, vite-plugin-singlefile 2.3.0, terser
3. **Vite configured** - Single-file output targeting project root with asset inlining
4. **Scripts added** - dev, build, and preview commands functional
5. **.gitignore created** - node_modules/ ignored, build artifacts tracked
6. **Pipeline validated** - All commands tested and working correctly

**Validation Results:**
- Dev server: ✅ Starts on localhost:5173 successfully
- Build command: ✅ Produces single HTML file with inlined assets
- Preview command: ✅ Serves built artifact on localhost:4173
- Output size: ✅ Built index.html is ~46KB (well under the 500KB requirement)
- Git tracking: ✅ Correct files tracked/ignored

**Ready for Story 1.2:** Build system is now prepared for migrating current MVP to /src/ structure.

### File List

**Created:**
- `package.json` - npm project configuration with ES module support and scripts
- `package-lock.json` - Dependency lockfile for reproducible builds
- `vite.config.js` - Vite configuration for single-file output with asset inlining
- `.gitignore` - Git ignore rules for node_modules/ and temporary build outputs

**Modified:**
- None (fresh infrastructure setup)

**Dependencies Installed:**
- vite@7.3.1 - Modern build tool and dev server
- vite-plugin-singlefile@2.3.0 - Complete HTML/CSS/JS inlining plugin
- terser - JavaScript minifier for production builds
- 79 total packages in node_modules/ (ignored by git)

## Change Log

### 2026-03-02 - Initial Build System Setup (Story 1.1 Complete)

**Infrastructure Created:**
- Initialized npm project with ES module support
- Installed Vite build system (v7.3.1) with dev server and HMR
- Configured vite-plugin-singlefile for complete asset inlining
- Created vite.config.js targeting single-file HTML output
- Added npm scripts: dev, build, preview
- Configured .gitignore for proper dependency management

**Validation Completed:**
- Dev server tested on localhost:5173
- Build pipeline verified with single-file output (< 500KB)
- Preview server validated on localhost:4173
- Git tracking confirmed correct

**Next Story:** Ready for Story 1.2 to migrate current MVP to /src/ structure
