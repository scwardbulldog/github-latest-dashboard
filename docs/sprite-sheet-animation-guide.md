# Sprite Sheet Animation Implementation Guide

## Overview

This guide documents the process for creating pixel-perfect sprite sheet animations using HTML5 Canvas, based on the Octocat Skater reference implementation. The approach handles complex challenges like chroma key background removal, per-row vertical offset correction, and interactive parameter tuning.

## Prerequisites

**Required Assets:**
- Sprite sheet image (PNG format recommended)
- Grid layout specifications (columns × rows)
- Background color to remove (hex format)

**Technical Stack:**
- HTML5 Canvas API
- ES6+ JavaScript
- RequestAnimationFrame for animation loop
- getImageData/putImageData for pixel manipulation

## Core Architecture: SpriteAnimator Class

### Class Structure

```javascript
class SpriteAnimator {
    constructor(config) {
        // Canvas context
        this.canvas = config.canvas;
        this.ctx = this.canvas.getContext('2d');
        
        // Sprite sheet configuration
        this.spriteSheetPath = config.spriteSheetPath;
        this.gridColumns = config.gridColumns || 5;
        this.gridRows = config.gridRows || 3;
        this.paletteRows = config.paletteRows || 0; // Rows to exclude from bottom
        
        // Frame extraction tuning
        this.framePadding = config.framePadding || 0;
        this.verticalOffsets = config.verticalOffsets || []; // Per-row camera tilt
        
        // Animation settings
        this.fps = config.fps || 6;
        this.scale = config.scale || 1;
        
        // Chroma key (background removal)
        this.chromaKeyEnabled = config.chromaKey !== false;
        this.chromaKeyColor = config.chromaKeyColor || '#161B22';
        this.chromaKeyTolerance = config.chromaKeyTolerance || 10;
        
        // State
        this.currentFrame = 0;
        this.isPlaying = false;
        this.totalFrames = this.gridColumns * (this.gridRows - this.paletteRows);
    }
}
```

### Key Methods

1. **`loadSpriteSheet()`** - Async image loading with onload callback
2. **`calculateFrameDimensions()`** - Compute frame width/height from grid
3. **`draw()`** - Extract and render current frame with offsets
4. **`applyChromaKey()`** - Pixel-by-pixel background removal
5. **`animate(timestamp)`** - RequestAnimationFrame loop with FPS control
6. **`setRowOffset(row, offset)`** - Per-row vertical adjustment

## Core Concepts

### 1. Frame Calculation Math

```javascript
// Grid-based frame dimensions
frameWidth = spriteSheet.width / gridColumns;
frameHeight = spriteSheet.height / gridRows;

// Total frames (excluding palette rows)
totalFrames = gridColumns × (gridRows - paletteRows);

// Frame position in grid
frameRow = Math.floor(currentFrame / gridColumns);
frameCol = currentFrame % gridColumns;

// Source coordinates
sourceX = (frameCol × frameWidth) + framePadding;
sourceY = (frameRow × frameHeight) + framePadding + rowOffset;
```

### 2. Chroma Key (Background Removal)

**Purpose:** Remove solid background color through pixel manipulation

**Algorithm:**
```javascript
applyChromaKey() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data; // RGBA array
    const chromaRGB = hexToRgb(chromaKeyColor);
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Euclidean distance color matching
        const distance = Math.sqrt(
            Math.pow(r - chromaRGB.r, 2) +
            Math.pow(g - chromaRGB.g, 2) +
            Math.pow(b - chromaRGB.b, 2)
        );
        
        // Make pixel transparent if matches chroma color
        if (distance < tolerance) {
            data[i + 3] = 0; // Set alpha to 0
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
}
```

**Key Parameters:**
- `chromaKeyColor`: Target background color (hex, e.g., `#161B22`)
- `chromaKeyTolerance`: Color match sensitivity (default: 10px)
- Higher tolerance = more aggressive removal (may affect art)

### 3. Per-Row Vertical Offset (Camera Tilt)

**Problem:** Sprite sheets may have inconsistent frame alignment across rows (e.g., wheels bleeding from top row into bottom row frames)

**Solution:** Independent vertical offset per row

```javascript
// Configuration
verticalOffsets: [44, 90]  // Row 0: shift down 44px, Row 1: shift down 90px

// In draw() method
const frameRow = Math.floor(currentFrame / gridColumns);
const rowOffset = verticalOffsets[frameRow] || 0;
const sourceY = (frameRow × frameHeight) + framePadding + rowOffset;
```

**Tuning Workflow:**
1. Start with 0px offset for all rows
2. Identify which row has bleeding artifacts
3. Incrementally increase offset until artifacts disappear
4. Fine-tune with interactive sliders (recommended range: 0-150px)

### 4. Pixel-Perfect Rendering

**CSS & Canvas Configuration:**
```css
canvas {
    image-rendering: pixelated;
    image-rendering: crisp-edges;
}
```

```javascript
// In resizeCanvas()
ctx.imageSmoothingEnabled = false;
```

**Purpose:** Preserve pixel art crisp edges when scaling

## Implementation Workflow

### Phase 1: Create Reference Workspace

**Purpose:** Build interactive tuning environment before production integration

1. **HTML Structure:**
```html
<canvas id="spriteCanvas"></canvas>

<div class="controls">
    <!-- Scale slider -->
    <input type="range" id="scaleSlider" min="1" max="8" value="1">
    
    <!-- FPS slider -->
    <input type="range" id="fpsSlider" min="1" max="30" value="6">
    
    <!-- Padding slider -->
    <input type="range" id="paddingSlider" min="0" max="20" value="0">
    
    <!-- Per-row offset sliders -->
    <input type="range" id="offset0Slider" min="0" max="150" value="0">
    <input type="range" id="offset1Slider" min="0" max="150" value="0">
    
    <!-- Playback buttons -->
    <button id="playBtn">Play</button>
    <button id="pauseBtn">Pause</button>
    <button id="resetBtn">Reset</button>
</div>
```

2. **SpriteAnimator Initialization:**
```javascript
const animator = new SpriteAnimator({
    canvas: document.getElementById('spriteCanvas'),
    spriteSheetPath: 'octocat-skater-v2.png',
    gridColumns: 5,
    gridRows: 3,
    paletteRows: 1,  // Exclude bottom palette row
    verticalOffsets: [0, 0],  // Start at 0, tune later
    fps: 6,
    scale: 1,
    chromaKey: true,
    chromaKeyColor: '#161B22',
    chromaKeyTolerance: 10,
    onLoad: (animator) => {
        console.log('✅ Sprite sheet loaded');
        animator.play();
    },
    onFrameChange: (frame) => {
        document.getElementById('currentFrame').textContent = frame;
    }
});
```

3. **Wire Up Controls:**
```javascript
// Scale control
document.getElementById('scaleSlider').addEventListener('input', (e) => {
    animator.setScale(parseInt(e.target.value));
});

// FPS control
document.getElementById('fpsSlider').addEventListener('input', (e) => {
    animator.setFPS(parseInt(e.target.value));
});

// Padding control
document.getElementById('paddingSlider').addEventListener('input', (e) => {
    animator.setPadding(parseInt(e.target.value));
});

// Per-row offset controls
document.getElementById('offset0Slider').addEventListener('input', (e) => {
    animator.setRowOffset(0, parseInt(e.target.value));
});

document.getElementById('offset1Slider').addEventListener('input', (e) => {
    animator.setRowOffset(1, parseInt(e.target.value));
});

// Playback controls
document.getElementById('playBtn').addEventListener('click', () => animator.play());
document.getElementById('pauseBtn').addEventListener('click', () => animator.pause());
document.getElementById('resetBtn').addEventListener('click', () => animator.reset());
```

### Phase 2: Tune Parameters

**Objective:** Find optimal extraction values through visual testing

1. **Initial Test:**
   - Open reference HTML in browser
   - Verify sprite sheet loads
   - Check if frames extract cleanly

2. **Identify Issues:**
   - **Frame bleeding:** Objects from one row appearing in another row's frames
   - **Chroma artifacts:** Background not fully removed
   - **Cropping:** Important parts of sprite cut off

3. **Adjust Parameters:**

**For Frame Bleeding:**
- Use per-row offset sliders
- Increase offset to shift extraction window DOWN
- Check each row independently
- Lock in values when clean

**For Chroma Issues:**
- Increase `chromaKeyTolerance` (10 → 15 → 20)
- Verify chroma color matches sprite background exactly
- Check console for errors

**For Cropping:**
- Reduce `framePadding` (try 0px first)
- Padding crops equally from all edges
- Use vertical offset instead for targeted adjustment

4. **Document Final Values:**
```javascript
// Production-ready configuration
{
    gridColumns: 5,
    gridRows: 3,
    paletteRows: 1,
    verticalOffsets: [44, 90],  // Dialed in through testing
    framePadding: 0,
    fps: 6,
    chromaKeyColor: '#161B22',
    chromaKeyTolerance: 10
}
```

### Phase 3: Production Integration

**Objective:** Integrate tuned animation into main application

1. **Copy SpriteAnimator Class:**
   - Extract class from reference file
   - Place in main HTML or separate JS module

2. **Initialize with Production Values:**
```javascript
const progressAnimator = new SpriteAnimator({
    canvas: document.getElementById('progressCanvas'),
    spriteSheetPath: 'assets/octocat-skater-v2.png',
    gridColumns: 5,
    gridRows: 3,
    paletteRows: 1,
    verticalOffsets: [44, 90],  // Locked values from tuning
    framePadding: 0,
    fps: 6,
    scale: 1,
    chromaKey: true,
    chromaKeyColor: '#161B22',
    chromaKeyTolerance: 10,
    onLoad: (animator) => animator.play()
});
```

3. **Remove Debug Code:**
   - Remove `console.log()` statements
   - Remove interactive controls/sliders
   - Keep only essential functionality

## Reference Implementation: Octocat Skater

### Sprite Sheet Specifications

- **File:** `octocat-skater-v2.png` (2816×1536px, 6.5MB)
- **Grid:** 5 columns × 3 rows (15 total cells)
- **Layout:**
  - Row 0 (frames 0-4): First half of skateboard animation
  - Row 1 (frames 5-9): Second half of skateboard animation
  - Row 2: Color palette (excluded via `paletteRows: 1`)
- **Background:** Solid `#161B22` (GitHub dark theme color)

### Frame Math

```javascript
// Sprite sheet dimensions: 2816×1536
frameWidth = 2816 / 5 = 563px
frameHeight = 1536 / 3 = 512px

// Usable frames: 5 columns × 2 rows (skip palette row)
totalFrames = 10

// Example: Frame 7 position
frameRow = Math.floor(7 / 5) = 1  // Second row
frameCol = 7 % 5 = 2              // Third column
```

### Final Configuration

```javascript
{
    gridColumns: 5,
    gridRows: 3,
    paletteRows: 1,        // Exclude bottom row
    verticalOffsets: [44, 90],  // Per-row camera tilt
    framePadding: 0,       // No uniform padding needed
    fps: 6,                // Smooth skateboard pace
    scale: 1,
    chromaKey: true,
    chromaKeyColor: '#161B22',
    chromaKeyTolerance: 10
}
```

### Vertical Offset Derivation

**Problem:** Skateboard wheels from Row 0 bleeding into top of Row 1 frames

**Process:**
1. Started with uniform `framePadding: 1px` - still saw bleeding
2. Increased to `framePadding: 10px` - cropped bottom but didn't fix top bleed
3. Realized needed vertical shift, not uniform crop
4. Implemented per-row offset system
5. Tuned Row 0: 0px → 44px (eliminated row 0 bottom overflow)
6. Tuned Row 1: 0px → 90px (eliminated row 0 bleed into row 1)
7. Result: Clean frames with no artifacts

**Key Insight:** "Camera operator tilting camera down" vs "zooming out" — vertical offset is directional, padding is universal

## Common Pitfalls & Solutions

### Pitfall 1: Checkerboard Background Instead of Transparency

**Symptom:** Transparent background renders as alternating squares

**Cause:** Sprite sheet has baked-in transparency pattern, not solid color

**Solution:** Use chroma key to remove background programmatically
```javascript
chromaKey: true,
chromaKeyColor: '#161B22',  // Match sprite background
chromaKeyTolerance: 10
```

### Pitfall 2: Frame Bleeding Across Rows

**Symptom:** Elements from top row appear at top of bottom row frames

**Cause:** Inconsistent sprite alignment; frames not perfectly centered in grid cells

**Solution:** Per-row vertical offset
```javascript
verticalOffsets: [44, 90]  // Different shift per row
```

**Not This:** Uniform padding (crops equally from all sides, doesn't fix directional bleed)
```javascript
framePadding: 10  // ❌ Crops top AND bottom equally
```

### Pitfall 3: Blurry Pixel Art

**Symptom:** Sprite edges look fuzzy/anti-aliased when scaled

**Cause:** Browser image smoothing enabled by default

**Solution:** Disable smoothing
```css
canvas {
    image-rendering: pixelated;
    image-rendering: crisp-edges;
}
```

```javascript
ctx.imageSmoothingEnabled = false;
```

### Pitfall 4: Wrong Frame Count

**Symptom:** Animation includes palette row or skips frames

**Cause:** Incorrect `totalFrames` calculation

**Solution:** Exclude non-animation rows
```javascript
paletteRows: 1  // Exclude bottom row
totalFrames = gridColumns × (gridRows - paletteRows)
// Example: 5 × (3 - 1) = 10 frames
```

### Pitfall 5: Animation Too Fast/Slow

**Symptom:** Animation doesn't match desired pace

**Cause:** FPS not tuned for sprite action

**Solution:** Interactive FPS slider during tuning phase
```javascript
// Skateboard: 6 FPS (slower, casual)
// Race car: 12 FPS (faster, dynamic)
```

**Frame Interval Formula:**
```javascript
frameInterval = 1000 / fps  // milliseconds per frame
```

## Debug Logging Best Practices

### During Development

**Frame Transitions:**
```javascript
console.log(`🎬 Frame ${prevFrame} → ${currentFrame} (Row ${frameRow}, Col ${frameCol})`);
```

**Dimension Calculations:**
```javascript
console.log('📐 Frame dimensions calculated:');
console.log(`   Sprite sheet size: ${width}x${height}`);
console.log(`   Frame size (raw): ${frameWidth}x${frameHeight}`);
console.log(`   Frame size (after padding): ${displayWidth}x${displayHeight}`);
```

**Load Events:**
```javascript
console.log('✅ Sprite sheet loaded');
console.log('▶️ Starting animation playback');
```

### Before Production

**Remove:**
- All `console.log()` statements
- Debug overlays
- Interactive tuning controls (sliders)

**Keep:**
- Error handling (`console.error()` for critical failures)
- Performance warnings if needed

## Advanced: Square Cropping

**Use Case:** Non-square frames (e.g., 563×768) that need consistent aspect ratio

**Implementation:**
```javascript
// In resizeCanvas()
let displayWidth = frameWidth - (framePadding * 2);
let displayHeight = frameHeight - (framePadding * 2);

if (squareCrop) {
    const minDimension = Math.min(displayWidth, displayHeight);
    displayWidth = minDimension;
    displayHeight = minDimension;
}

// In draw()
let sourceWidth = frameWidth - (framePadding * 2);
let sourceHeight = frameHeight - (framePadding * 2);

if (squareCrop) {
    const minDimension = Math.min(sourceWidth, sourceHeight);
    sourceWidth = minDimension;
    sourceHeight = minDimension;
}
```

**Note:** May crop important sprite details. Test thoroughly. Octocat racer found better results WITHOUT square crop.

## Deployment Checklist

- [ ] Sprite sheet asset optimized and uploaded
- [ ] Final configuration values documented
- [ ] Debug logging removed
- [ ] Interactive controls removed (production)
- [ ] Canvas sizing appropriate for layout
- [ ] Browser compatibility tested (Chrome, Firefox, Safari)
- [ ] Performance tested (60fps target)
- [ ] Image rendering CSS applied
- [ ] Chroma key validates in dark/light themes
- [ ] Animation auto-plays or triggers correctly

## File Structure

```
project/
├── assets/
│   └── octocat-skater-v2.png       # Sprite sheet
├── octocat-skater-reference.html   # Interactive tuning workspace
├── index.html                       # Production integration
└── docs/
    └── sprite-sheet-animation-guide.md  # This document
```

## Key Takeaways

1. **Build reference workspace FIRST** - Interactive tuning is essential
2. **Use per-row offsets** - More precise than uniform padding
3. **Chroma key for transparency** - Better than baked-in transparency
4. **Iterate on values** - Use sliders to dial in exact pixels
5. **Disable image smoothing** - Critical for pixel art
6. **Document final config** - Lock in production values
7. **Remove debug code** - Clean up before integration

## Example: Complete Reference File Pattern

A reference implementation should include:
- Canvas element for rendering
- Interactive controls (scale, FPS, padding, per-row offsets)
- Playback buttons (play, pause, reset)
- Stats display (current frame, dimensions)
- Info panel (specifications, configuration)
- Full SpriteAnimator class implementation
- Event listeners wiring controls to animator methods

See `octocat-skater-reference.html` for complete working example.

---

**Last Updated:** February 19, 2026  
**Reference Implementation:** octocat-skater-reference.html  
**Sprite Sheet:** octocat-skater-v2.png (2816×1536, 5×3 grid, 10 frames)  
**Proven Configuration:** verticalOffsets [44, 90], framePadding 0, fps 6, chromaKey #161B22
