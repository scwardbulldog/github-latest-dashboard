# Development Guide

Quick reference for developing the GitHub Latest Dashboard.

## Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Node.js | 18.0.0+ | Development runtime |
| npm | 7.0.0+ | Package management |
| Git | Any | Version control |

Install Node.js from [nodejs.org](https://nodejs.org/)

## Quick Start

```bash
# Clone repository
git clone https://github.com/scwardbulldog/github-latest-dashboard.git
cd github-latest-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
# Visit http://localhost:5173
```

## Available Scripts

| Command | Duration | Purpose |
|---------|----------|---------|
| `npm run dev` | Continuous | Start dev server with hot reload |
| `npm run build` | ~1 second | Build production artifact |
| `npm run preview` | Continuous | Preview built artifact locally |
| `npm run test:validate` | ~5 seconds | Check design token compliance |
| `npm run test:health` | ~30 seconds | Puppeteer dashboard health check |
| `npm run test:memory` | 24+ hours | Memory leak detection |
| `npm run test:burn-in` | 24+ hours | Complete validation suite |

## Development Workflow

### 1. Start Dev Server
```bash
npm run dev
```
Dashboard available at http://localhost:5173 with hot module replacement.

### 2. Edit Source Files
**Only edit files in `/src/` directory:**
- `src/index.html` - HTML structure
- `src/js/*.js` - JavaScript modules
- `src/css/*.css` - Stylesheets

### 3. Build for Production
```bash
npm run build
```
Creates `/dist/` (temporary) and copies to `/index.html` (committed).

### 4. Commit Changes
```bash
git add src/ index.html
git commit -m "feat: your changes"
git push origin main
```

## File Editing Rules

| Location | Action |
|----------|--------|
| ✅ `/src/**` | Edit source files here |
| ✅ `/docs/**` | Update documentation |
| ❌ `/index.html` (root) | Never edit - build artifact |
| ❌ `/dist/**` | Never edit - temporary build output |

## ES Module Requirements

### Import Extensions
Always use `.js` extensions in imports:
```javascript
// ✅ Correct
import { formatDate } from './utils.js';

// ❌ Wrong (will fail in browser)
import { formatDate } from './utils';
```

### Export Pattern
Use named exports for all classes and functions:
```javascript
// ✅ Correct
export class CarouselController { }
export function fetchBlog() { }
```

## Design Token Compliance

**All CSS must use GitHub Primer design tokens.**

### Colors
```css
/* ✅ Use tokens */
color: var(--color-fg-default);
background: var(--color-canvas-subtle);

/* ❌ Never hardcode */
color: #c9d1d9;
background: #161b22;
```

### Spacing (8px base)
```css
/* ✅ Use tokens or base-8 multiples */
margin: var(--space-4);     /* 24px */
padding: 16px;              /* Base-8 multiple */

/* ❌ Never use non-base-8 */
margin: 14px;
padding: 6px;
```

### Typography
```css
/* ✅ Use tokens */
font-size: var(--fontsize-h2);

/* ❌ Never hardcode */
font-size: 24px;
```

### Validation
Run before committing CSS changes:
```bash
npm run test:validate
```

## Component Pattern

### Producer (callback source)
```javascript
class CarouselController {
  constructor() {
    this.onPageChange = null;  // Callback property
  }
  
  rotatePage() {
    // ... rotation logic
    if (this.onPageChange) {
      this.onPageChange(this.pages[this.currentPage]);
    }
  }
}
```

### Consumer (callback handler)
```javascript
const carousel = new CarouselController();
carousel.onPageChange = (page) => {
  itemHighlighter.reset();
  console.log(`Page changed to: ${page}`);
};
```

## Error Handling

### Retry with Backoff
```javascript
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
      }
    }
  }
  throw new Error('All retries failed');
}
```

### Cached Fallback
```javascript
try {
  data = await fetchWithRetry(blogUrl);
  cache.blog = { data, timestamp: Date.now() };
} catch (error) {
  if (cache.blog.data) {
    data = cache.blog.data;  // Use stale cache
  } else {
    displayError('blog', 'Unable to load blog posts');
  }
}
```

## Performance Guidelines

### GPU-Accelerated Properties Only
```css
/* ✅ GPU-accelerated (smooth on Pi) */
transition: opacity 200ms ease;
transition: background-color 200ms ease;

/* ❌ CPU-intensive (laggy on Pi) */
transition: transform 200ms ease;
transition: box-shadow 200ms ease;
```

### Use DocumentFragment for Lists
```javascript
const fragment = document.createDocumentFragment();
items.forEach(item => {
  const el = document.createElement('div');
  // ... build element
  fragment.appendChild(el);  // No reflow
});
listEl.appendChild(fragment);  // Single reflow
```

### Timer Cleanup
```javascript
stop() {
  if (this.timer) {
    clearInterval(this.timer);
    this.timer = null;
  }
}
```

## Testing Before Deployment

### Quick Validation (~35 seconds)
```bash
npm run test:validate   # Design tokens
npm run build           # Verify build
npm run test:health     # Health check
```

### Production Readiness (24+ hours)
```bash
npm run test:burn-in    # Full validation suite
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Module not found | Add `.js` extension to import |
| Changes not showing | Run `npm run build` after editing |
| Styles not applying | Use Primer tokens, not hardcoded values |
| Timer drift | Check cleanup in `stop()` methods |
| Memory growth | Review timer cleanup, event listeners |

## Environment Setup

### VS Code Extensions (Recommended)
- ESLint
- Prettier
- Live Server (alternative to Vite for quick testing)

### Browser DevTools
- Console tab for JavaScript errors
- Network tab for API issues
- Performance tab for animation analysis
- Memory tab for leak detection
