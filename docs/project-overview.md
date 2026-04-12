# Project Overview

## GitHub Latest Dashboard

A single-page web dashboard designed to run full-screen on a large office TV, displaying real-time updates from GitHub and developer tools. Built for 24/7 kiosk operation on Raspberry Pi hardware.

## Quick Reference

| Attribute | Value |
|-----------|-------|
| **Project Type** | Web Application |
| **Repository Type** | Monolith |
| **Primary Language** | JavaScript (ES Modules) |
| **Framework** | Vanilla JavaScript (no framework) |
| **Build Tool** | Vite 7.3.1 |
| **Design System** | GitHub Primer |
| **Target Hardware** | Raspberry Pi 3B |
| **Node.js** | v18.0.0+ |

## Purpose

The dashboard aggregates updates from multiple developer-focused sources:
- **GitHub Blog** - Latest blog posts from GitHub
- **GitHub Changelog** - Product updates and feature announcements
- **GitHub Status** - Real-time status and incident information
- **VS Code Updates** - Visual Studio Code release notes
- **Visual Studio DevBlog** - Visual Studio IDE updates
- **Claude Code Changelog** - Anthropic Claude Code updates

## Key Features

### Auto-Rotating Pages (30-second cycle)
The dashboard cycles through different data sources automatically, with smooth fade transitions (300ms duration).

### Item Highlighting (8-second cycle)
Within each page, individual items are highlighted in sequence, with the detail panel showing full content for the selected item.

### Resilient Data Fetching
- **5-minute refresh interval** for all APIs
- **Retry logic** with exponential backoff (3 attempts: 1s, 2s, 4s)
- **In-memory caching** with graceful degradation to stale data
- **Per-source error isolation** - one API failure doesn't break others

### Kiosk Optimizations
- Large fonts readable from 10-15 feet
- GPU-accelerated animations (opacity, background-color only)
- No scrollbars - content truncated for clean display
- Hidden mouse cursor after 1 second of inactivity
- Screen power management disabled for 24/7 operation

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
├─────────────────────────────────────────────────────────────┤
│  CarouselController (30s)  →  ItemHighlighter (8s)          │
│           ↓                           ↓                      │
│    Page Rotation              Item Selection                 │
│           ↓                           ↓                      │
│                      DetailPanel                             │
│                           ↓                                  │
│                   Content Display                            │
├─────────────────────────────────────────────────────────────┤
│                     APIClient                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  Blog   │ │Changelog│ │ Status  │ │  VSCode │ ...       │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
│       └───────────┴───────────┴───────────┘                 │
│                        ↓                                     │
│              5-min Refresh + Retry + Cache                   │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Language | JavaScript | ES2020+ | ES Modules with native browser support |
| Build | Vite | 7.3.1 | Bundling with single-file output |
| Design | GitHub Primer | - | Design tokens (colors, spacing, typography) |
| Testing | Puppeteer | 24.15.0 | Automated health checks |
| Minification | Terser | 5.46.0 | Production bundle optimization |
| HTTP Server | Python http.server | 3.x | Pi deployment (no Node.js on Pi) |

## Deployment Model

**Git-based deployment** - no build tools on Pi:
1. Edit source files in `/src/` directory
2. Build locally: `npm run build`
3. Commit source + built artifact
4. Push to GitHub
5. Pi pulls on restart and serves pre-built HTML

## Entry Points

| File | Purpose |
|------|---------|
| `src/index.html` | HTML structure (source - edit this) |
| `src/js/main.js` | Application entry point and orchestration |
| `index.html` | Built artifact (root - DO NOT EDIT) |

## Related Documentation

- [Architecture](architecture.md) - Component structure and design patterns
- [Contributing Guide](contributing.md) - Development standards and patterns
- [Deployment Guide](deployment.md) - Build and deploy procedures
- [Testing Guide](testing-guide.md) - Validation and burn-in procedures
- [Raspberry Pi Setup](raspberry-pi-setup.md) - Complete kiosk deployment
- [Troubleshooting](troubleshooting.md) - Common issues and solutions
