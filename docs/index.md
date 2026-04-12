# GitHub Latest Dashboard Documentation

Master index for project documentation - the primary AI retrieval source.

---

## Project Overview

**Type:** Web Application (Monolith)  
**Primary Language:** JavaScript (ES Modules)  
**Architecture:** Component-based with timer orchestration  
**Target:** Raspberry Pi 3B kiosk for office TV display

### Quick Reference

| Attribute | Value |
|-----------|-------|
| Framework | Vanilla JavaScript (no framework) |
| Build Tool | Vite 7.3.1 |
| Design System | GitHub Primer |
| Node.js | ≥18.0.0 |
| Entry Point | `src/js/main.js` |
| Source Dir | `/src/` (HTML, JS, CSS) |
| Build Artifact | `/index.html` (root) |

---

## Generated Documentation

### Core Documentation

- [Project Overview](./project-overview.md) - Purpose, features, architecture summary
- [Architecture](./architecture.md) - Component structure and design patterns
- [Configuration Guide](./configuration.md) - Customize settings via config.json
- [Source Tree Analysis](./source-tree-analysis.md) - Annotated directory structure
- [Component Inventory](./component-inventory.md) - All JS and CSS components

### Development

- [Development Guide](./development-guide.md) - Quick start and patterns
- [Contributing Guide](./contributing.md) - Coding standards and conventions

### Operations

- [Deployment Guide](./deployment.md) - Build and deploy procedures
- [Raspberry Pi Setup](./raspberry-pi-setup.md) - Complete kiosk deployment
- [Testing Guide](./testing-guide.md) - Validation and burn-in procedures
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions

---

## Key Components

### JavaScript Modules (`src/js/`)

| Module | Timer | Purpose |
|--------|-------|---------|
| `main.js` | - | Entry point, orchestration |
| `config-loader.js` | - | User configuration (config.json) |
| `carousel-controller.js` | 30s | Page rotation |
| `item-highlighter.js` | 8s | Item cycling |
| `detail-panel.js` | - | Content rendering |
| `api-client.js` | 5min | Data fetching with cache |
| `persistent-alert.js` | - | Outage indicator |
| `utils.js` | - | Shared utilities |

### CSS Modules (`src/css/`)

| File | Purpose |
|------|---------|
| `main.css` | GitHub Primer tokens, base styles |
| `layout.css` | Grid, split-view, carousel |
| `carousel.css` | Page transitions |
| `components.css` | Reusable UI components |

---

## Development Quick Start

```bash
# Install and start
npm install
npm run dev
# Visit http://localhost:5173

# Build for production
npm run build

# Deploy to Pi
git add src/ index.html
git commit -m "feat: changes"
git push origin main
```

---

## Critical Rules

### File Editing
- ✅ **Edit:** `/src/**` (source files)
- ❌ **Never edit:** `/index.html` (root - build artifact)

### Design Compliance
- Use `var(--color-*)` for colors
- Use `var(--space-*)` or base-8 multiples for spacing
- Validate with `npm run test:validate`

### ES Modules
- Always use `.js` extensions in imports
- Use named exports

---

## Data Sources

| Source | API | Refresh |
|--------|-----|---------|
| GitHub Blog | RSS2JSON | 5 min |
| GitHub Changelog | RSS2JSON | 5 min |
| GitHub Status | githubstatus.com | 5 min |
| VS Code Updates | RSS2JSON | 5 min |
| VS DevBlog | RSS2JSON | 5 min |
| Claude Code | RSS2JSON | 5 min |

---

## Testing

| Command | Duration | Purpose |
|---------|----------|---------|
| `npm run test:validate` | ~5s | Design token check |
| `npm run test:health` | ~30s | Dashboard health |
| `npm run test:memory` | 24h+ | Memory leak detection |
| `npm run test:burn-in` | 24h+ | Full validation |

---

## Deployment Architecture

```
Development Machine          Raspberry Pi
┌─────────────────┐         ┌─────────────────┐
│ npm run build   │   git   │ Python HTTP     │
│ ────────────────│ ──────> │ server (8000)   │
│ Commit artifact │  push   │                 │
└─────────────────┘         │ Chromium kiosk  │
                            └─────────────────┘
```

**No build tools on Pi** - serves pre-built HTML directly.

---

## Metadata

| Field | Value |
|-------|-------|
| Generated | 2026-04-12 |
| Scan Level | Deep |
| Workflow | initial_scan |
| Documentation Files | 11 |
