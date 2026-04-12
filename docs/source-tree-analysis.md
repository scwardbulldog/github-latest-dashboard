# Source Tree Analysis

Annotated directory structure of the GitHub Latest Dashboard project.

## Complete Directory Tree

```
github-latest-dashboard/
├── src/                          # 📁 SOURCE FILES (EDIT THESE)
│   ├── index.html               # HTML structure and page templates
│   ├── js/                      # JavaScript ES modules
│   │   ├── main.js              # ⭐ Application entry point
│   │   ├── carousel-controller.js  # Page rotation (30s timer)
│   │   ├── item-highlighter.js     # Item cycling (8s timer)
│   │   ├── detail-panel.js         # Right panel content rendering
│   │   ├── api-client.js           # Data fetching with retry/cache
│   │   ├── persistent-alert.js     # Cross-page outage ticker
│   │   └── utils.js                # formatDate, stripHtml, truncate
│   └── css/                     # Stylesheets
│       ├── main.css             # ⭐ GitHub Primer design tokens + base styles
│       ├── layout.css           # Grid, split-view, carousel layout
│       ├── carousel.css         # Page transitions and animation
│       └── components.css       # Reusable component styles
│
├── docs/                        # 📁 DOCUMENTATION
│   ├── index.md                 # Documentation master index
│   ├── project-overview.md      # Project summary and quick reference
│   ├── architecture.md          # Component design and patterns
│   ├── contributing.md          # Development standards
│   ├── deployment.md            # Build and deploy procedures
│   ├── testing-guide.md         # Validation procedures
│   ├── troubleshooting.md       # Common issues and solutions
│   └── raspberry-pi-setup.md    # Complete kiosk deployment guide
│
├── deploy/                      # 📁 PI DEPLOYMENT CONFIGS
│   ├── README.md                # Deployment files overview
│   ├── start-kiosk.sh           # Chromium kiosk launcher
│   ├── update-dashboard.sh      # Git pull automation
│   ├── systemd/                 # systemd service files
│   │   ├── dashboard-server.service  # Python HTTP server
│   │   └── kiosk.service             # Openbox + Chromium session
│   └── openbox/                 # Window manager config
│       └── autostart            # Auto-launch configuration
│
├── test/                        # 📁 TESTING UTILITIES
│   ├── health-check.js          # Puppeteer-based dashboard validation
│   ├── memory-monitor.js        # Memory leak detection (24h+)
│   ├── validate-primer-colors.js    # Design token compliance
│   ├── analyze-memory-results.js    # Memory test analysis
│   ├── analyze-timer-drift.js       # Timer accuracy analysis
│   ├── burn-in-test.sh              # Complete test orchestration
│   ├── BURN-IN-TEST-PROCEDURE.md
│   ├── MEMORY-BASELINE.md
│   ├── API-REFRESH-VALIDATION.md
│   ├── CROSS-BROWSER-TESTING-CHECKLIST.md
│   ├── POWER-NETWORK-RESILIENCE-TESTING.md
│   └── PRODUCTION-READINESS-REPORT-TEMPLATE.md
│
├── img/                         # 📁 STATIC ASSETS
│   └── ghskatecate/             # Octocat animation frames
│
├── _bmad/                       # 📁 BMAD METHODOLOGY (internal)
│   └── ...                      # Build methodology configs
│
├── _bmad-output/                # 📁 BMAD ARTIFACTS (internal)
│   ├── planning-artifacts/      # PRD, specs, stories
│   └── implementation-artifacts/ # Story implementation docs
│
├── index.html                   # ⚠️ BUILD ARTIFACT (DO NOT EDIT)
├── package.json                 # npm dependencies and scripts
├── vite.config.js               # Vite build configuration
├── README.md                    # Project readme
├── IMPLEMENTATION_TRACKER.md    # Development progress tracking
└── .gitignore                   # Git ignore rules
```

## Critical Directories

### `/src/` - Source Files
**Always edit files here.** This is the only directory containing editable source code.

| Subdirectory | Purpose |
|--------------|---------|
| `src/js/` | ES module JavaScript components |
| `src/css/` | CSS stylesheets with Primer tokens |
| `src/index.html` | HTML template and structure |

### `/docs/` - Documentation
Project documentation for developers and operators.

### `/deploy/` - Deployment Configs
Raspberry Pi kiosk configuration files. Requires username customization before deployment.

### `/test/` - Testing Utilities
Automated validation scripts and test procedures. Run via npm scripts.

## Entry Points

| Entry Point | File | Description |
|-------------|------|-------------|
| **Application** | `src/js/main.js` | JavaScript entry point, imports all modules |
| **HTML** | `src/index.html` | HTML structure, CSS imports, script entry |
| **Build** | `vite.config.js` | Vite configuration for bundling |
| **Dev Server** | `npm run dev` | Starts Vite dev server on :5173 |

## Build Outputs

| Output | Location | Git Status |
|--------|----------|------------|
| Temporary build | `/dist/` | Ignored (.gitignore) |
| Production artifact | `/index.html` | **Committed** (required for Pi) |

## File Editing Rules

| File/Directory | Can Edit? | Notes |
|----------------|-----------|-------|
| `/src/**` | ✅ Yes | All source files go here |
| `/docs/**` | ✅ Yes | Documentation updates |
| `/deploy/**` | ✅ Yes | Pi deployment configs |
| `/test/**` | ✅ Yes | Test scripts |
| `/index.html` (root) | ❌ No | Build artifact - regenerated by `npm run build` |
| `/dist/**` | ❌ No | Temporary build output |
| `/node_modules/**` | ❌ No | npm dependencies |

## JavaScript Module Dependencies

```
main.js (entry)
├── utils.js (formatDate, stripHtml, truncate)
├── carousel-controller.js (page rotation)
├── item-highlighter.js (item cycling)
├── detail-panel.js (content display)
├── api-client.js (data fetching)
│   └── Exports: fetchBlog, fetchChangelog, fetchStatus, 
│                fetchVSCode, fetchVisualStudio, fetchAnthropic,
│                getCacheEntry, detectActiveOutages, fetchArticleContent
└── persistent-alert.js (outage indicator)
```

## CSS Architecture

```
main.css (entry - imported first)
├── CSS Custom Properties (design tokens)
├── Base styles (*, body, typography)
└── Header and global elements

layout.css
├── Dashboard container
├── Carousel pages
├── Split-view grid (35%/65%)
└── List view and detail panel structure

carousel.css
├── Page transitions
├── Progress indicators
└── Animation keyframes

components.css
├── Progress bar
├── Persistent alert ticker
├── List item highlighting
└── Detail panel content styles
```
