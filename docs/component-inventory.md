# Component Inventory

Complete inventory of JavaScript components, CSS modules, and reusable patterns in the GitHub Latest Dashboard.

## JavaScript Components

### Core Components

| Component | File | Purpose | Timer |
|-----------|------|---------|-------|
| **CarouselController** | `carousel-controller.js` | Page rotation and transitions | 30s |
| **ItemHighlighter** | `item-highlighter.js` | Item cycling within pages | 8s |
| **DetailPanel** | `detail-panel.js` | Right panel content rendering | - |
| **APIClient** | `api-client.js` | Data fetching with caching | 5min |
| **PersistentAlert** | `persistent-alert.js` | Cross-page outage indicator | - |

### Utility Functions

| Function | File | Purpose |
|----------|------|---------|
| **formatDate** | `utils.js` | ISO timestamps to relative time ("2 hours ago") |
| **stripHtml** | `utils.js` | Safe HTML tag removal for XSS prevention |
| **truncate** | `utils.js` | Character truncation with ellipsis |

---

## Component Details

### CarouselController

**File:** `src/js/carousel-controller.js`

**Purpose:** Manages page rotation timing, smooth transitions, and progress indicator.

**Configuration:**
```javascript
{
  interval: 30000,          // Default rotation interval (30s)
  pages: ['blog', 'changelog', 'status', ...],
  pageIntervals: {}         // Optional per-page overrides
}
```

**Public API:**
| Method | Parameters | Description |
|--------|------------|-------------|
| `start()` | - | Begin page rotation |
| `stop()` | - | Stop rotation and cleanup timers |
| `goToPage(index)` | `number` | Jump to specific page |

**Callback:**
- `onPageChange(page: string)` - Fired when page changes

**Timer Accuracy:** Logs drift for burn-in testing (enable via `window.enableTimerLogging`)

---

### ItemHighlighter

**File:** `src/js/item-highlighter.js`

**Purpose:** Cycles through items on current page, highlighting each in turn.

**Configuration:**
```javascript
{
  interval: 8000    // Highlight interval (8s)
}
```

**Public API:**
| Method | Parameters | Description |
|--------|------------|-------------|
| `start(itemCount)` | `number` | Begin highlighting with count of items |
| `stop()` | - | Stop highlighting and cleanup timers |
| `reset()` | - | Reset to first item (called on page change) |
| `setInterval(ms)` | `number` | Update highlight interval |

**Callback:**
- `onItemHighlight(itemIndex: number)` - Fired when item changes

**DOM Interaction:**
- Adds/removes `list-item--highlighted` class
- Queries `.carousel-page.active .list-item` elements

---

### DetailPanel

**File:** `src/js/detail-panel.js`

**Purpose:** Renders full content for highlighted item in right panel.

**Configuration:**
```javascript
{
  containerId: 'detail-panel'  // Default container ID
}
```

**Public API:**
| Method | Parameters | Description |
|--------|------------|-------------|
| `render(item, options)` | `Object, Object` | Render item details with fade transition |
| `renderWithAsyncContent(item, contentFetcher, options)` | `Object, Function, Object` | Render with async content loading |

**Render Options:**
- `preserveHtml: boolean` - Preserve HTML formatting (default: false)
- `hideHeader: boolean` - Hide title/timestamp (default: false)
- `skipInitialContent: boolean` - Skip showing initial description

**Transition:** 100ms fade out → content update → 100ms fade in

---

### APIClient

**File:** `src/js/api-client.js`

**Purpose:** Fetches data from multiple sources with retry logic and caching.

**Exported Functions:**
| Function | Returns | Description |
|----------|---------|-------------|
| `fetchBlog()` | `Promise<Object>` | GitHub Blog RSS data |
| `fetchChangelog()` | `Promise<Object>` | GitHub Changelog RSS data |
| `fetchStatus()` | `Promise<Object>` | GitHub Status incidents |
| `fetchVSCode()` | `Promise<Object>` | VS Code Updates RSS |
| `fetchVisualStudio()` | `Promise<Object>` | Visual Studio DevBlog RSS |
| `fetchAnthropic()` | `Promise<Object>` | Claude Code Changelog RSS |
| `getCacheEntry(source)` | `Object` | Get cache metadata for source |
| `detectActiveOutages()` | `Object` | Check for active GitHub outages |
| `fetchArticleContent(url)` | `Promise<string>` | Fetch article HTML content |

**Caching:**
- **Duration:** 5 minutes
- **Strategy:** Return cached if fresh, fallback to stale on error
- **Isolation:** Per-source caching, one failure doesn't affect others

**Retry Logic:**
- **Attempts:** 3 (initial + 2 retries)
- **Backoff:** Exponential (1s, 2s, 4s)

---

### PersistentAlert

**File:** `src/js/persistent-alert.js`

**Purpose:** Displays GitHub outage notifications as scrolling news ticker in header.

**Public API:**
| Method | Parameters | Description |
|--------|------------|-------------|
| `show(outageData)` | `Object` | Display outage with severity and services |
| `hide()` | - | Hide the indicator |

**Outage Data Structure:**
```javascript
{
  severity: 'major_outage' | 'degraded_performance',
  count: number,
  services: [{ name: string, status: string }]
}
```

**Styling:**
- Major outage: Red background (`--color-danger-fg`)
- Degraded: Yellow background (`--color-attention-fg`)
- Auto-scroll when content overflows

---

## CSS Components

### Design Token Categories

| Category | Variable Pattern | Example |
|----------|-----------------|---------|
| Colors | `--color-*` | `--color-fg-default`, `--color-canvas-subtle` |
| Spacing | `--space-*` | `--space-1` (4px) to `--space-8` (64px) |
| Typography | `--fontsize-*` | `--fontsize-h1` (32px), `--fontsize-base` (16px) |
| Font Weight | `--fontweight-*` | `--fontweight-normal` (400), `--fontweight-semibold` (600) |
| Line Height | `--lineheight-*` | `--lineheight-condensed` (1.25), `--lineheight-default` (1.5) |

### Layout Components

| Component | File | CSS Class |
|-----------|------|-----------|
| Dashboard Container | `layout.css` | `.dashboard-container` |
| Carousel Page | `layout.css` | `.carousel-page`, `.carousel-page.active` |
| Split View | `layout.css` | `.split-view-container` (35%/65% grid) |
| List View | `layout.css` | `.list-view` (left panel) |
| Detail Panel | `layout.css` | `.detail-panel` (right panel) |

### UI Components

| Component | File | CSS Classes |
|-----------|------|-------------|
| Progress Bar | `components.css` | `.progress-container`, `.progress-bar` |
| List Item | `layout.css` + `components.css` | `.list-item`, `.list-item--highlighted` |
| Detail Content | `components.css` | `.detail-panel__title`, `.detail-panel__content` |
| Persistent Alert | `components.css` | `.persistent-alert`, `.persistent-alert--major` |
| Live Indicator | `main.css` | `.live-indicator`, `.live-dot` |
| Pause Button | `main.css` | `.pause-button` |

### Animation Classes

| Animation | File | Purpose |
|-----------|------|---------|
| `.live-dot` pulse | `main.css` | Heartbeat animation for live indicator |
| Ticker scroll | `components.css` | `@keyframes ticker-scroll` for alert |
| Page fade | `carousel.css` | Opacity transitions for page changes |

---

## State Management

**Pattern:** Direct callbacks (no event system, no pub/sub)

### Component Communication Flow

```
CarouselController.onPageChange
       ↓
ItemHighlighter.reset()
       ↓
ItemHighlighter.start(itemCount)
       ↓
ItemHighlighter.onItemHighlight
       ↓
DetailPanel.render(item)
```

### Timer Independence

All timers run independently:
- **Carousel timer** (30s) - Page rotation
- **Highlighter timer** (8s) - Item cycling  
- **API refresh timer** (5min) - Data fetch

No timer blocks or affects another. API fetch completes asynchronously without interrupting display timers.

---

## Data Flow

```
API Endpoints (5min interval)
├── RSS2JSON (Blog, Changelog, VSCode, VS DevBlog, Anthropic)
└── GitHub Status API
       ↓
   APIClient
       ↓ retryFetch() + cache
       ↓
   main.js
       ↓ renderXxxList() functions
       ↓
   DOM (list items with data-* attributes)
       ↓
   ItemHighlighter (reads data-* on highlight)
       ↓
   DetailPanel (renders full content)
```

## Reusable Patterns

### Render Pattern (lists)
```javascript
function renderRSSList(data, containerId, sourceName) {
  const fragment = document.createDocumentFragment();
  // Build items in fragment
  listEl.appendChild(fragment); // Single reflow
}
```

### Async Content Loading
```javascript
await detailPanel.renderWithAsyncContent(
  item,
  () => fetchArticleContent(item.link),
  { hideHeader: false }
);
```

### Error Isolation
Each data source has independent:
- Cache entry
- Retry logic
- Error display in UI column
