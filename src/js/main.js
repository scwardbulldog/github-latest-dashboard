// Import utility functions
import { formatDate, stripHtml, truncate } from './utils.js';

// Component skeletons imported for Epic 2+ implementation
// Current MVP functionality remains using existing code below
// TODO Epic 2: Wire carousel components and migrate logic
import { CarouselController } from './carousel-controller.js';
import { ItemHighlighter } from './item-highlighter.js';
import { DetailPanel } from './detail-panel.js';
// TODO Story 3.5: Import and wire API client when implementing data integration
/*
import {
    fetchBlog as fetchBlogFromApiClient,
    fetchChangelog as fetchChangelogFromApiClient,
    fetchStatus as fetchStatusFromApiClient
} from './api-client.js';
*/

// Configuration
// TODO Story 3.5: These will be used for API data integration
// const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json';
// const GITHUB_BLOG_RSS = 'https://github.blog/feed/';
// const GITHUB_CHANGELOG_RSS = 'https://github.blog/changelog/feed/';
// const GITHUB_STATUS_API = 'https://www.githubstatus.com/api/v2/incidents.json';
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Detect changelog badge type based on keywords
// TODO Story 3.5: Used for API data rendering
/*
function detectBadgeType(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.match(/\b(introducing|new|announcing|available|launched|release)\b/)) {
        return { type: 'NEW FEATURE', class: 'changelog-badge-new-feature' };
    }
    if (text.match(/\b(improved|faster|enhanced|better|performance|optimiz)\b/)) {
        return { type: 'IMPROVEMENT', class: 'changelog-badge-improvement' };
    }
    if (text.match(/\b(fix|resolved|corrected|bug|issue)\b/)) {
        return { type: 'BUG FIX', class: 'changelog-badge-bug-fix' };
    }
    if (text.match(/\b(UI|design|interface|visual|redesign)\b/)) {
        return { type: 'UI CHANGE', class: 'changelog-badge-ui-change' };
    }
    if (text.match(/\b(deprecat|removing|sunset|legacy|discontinu)\b/)) {
        return { type: 'DEPRECATION', class: 'changelog-badge-deprecation' };
    }
    
    return { type: 'UPDATE', class: '' };
}
*/

// Detect blog post badge from title and content
// TODO Story 3.5: Used for API data rendering
/*
function detectBlogBadgeType(title, content) {
    const combined = `${title} ${content}`.toLowerCase();
    
    // Check for release announcements
    if (combined.includes('release') || combined.includes('available') || combined.includes('announcing')) {
        return { type: 'RELEASE', class: 'blog-badge-release' };
    }
    
    // Check for security content
    if (combined.includes('security') || combined.includes('vulnerability') || combined.includes('cve-')) {
        return { type: 'SECURITY', class: 'blog-badge-security' };
    }
    
    // Check for community content
    if (combined.includes('community') || combined.includes('open source') || combined.includes('maintainer')) {
        return { type: 'COMMUNITY', class: 'blog-badge-community' };
    }
    
    // Check for engineering content
    if (combined.includes('engineering') || combined.includes('technical') || combined.includes('architecture')) {
        return { type: 'ENGINEERING', class: 'blog-badge-engineering' };
    }
    
    return { type: 'POST', class: '' };
}
*/

// Format categories to fit within a character limit
// TODO Story 3.5: Used for API data rendering
/*
function formatCategories(categories, maxLength = 35) {
    if (!categories || categories.length === 0) {
        return '';
    }
    
    let result = [];
    let currentLength = 0;
    
    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const addition = i === 0 ? category : `, ${category}`;
        const newLength = currentLength + addition.length;
        
        if (newLength > maxLength && result.length > 0) {
            // Would exceed limit, add "+N more" indicator
            const remaining = categories.length - i;
            result.push(` +${remaining}`);
            break;
        }
        
        result.push(i === 0 ? category : `, ${category}`);
        currentLength = newLength;
    }
    
    return result.join('');
}
*/

// Fetch GitHub Blog
// TODO Story 3.5: Implement API data integration
async function fetchBlog() {
    // Story 3.5 scope - API integration
    // Currently using static placeholder content in index.html
    console.log('fetchBlog(): Using static placeholder content (Story 3.5 will implement API)');
}

// Fetch GitHub Changelog
// TODO Story 3.5: Implement API data integration
async function fetchChangelog() {
    // Story 3.5 scope - API integration
    // Currently using static placeholder content in index.html
    console.log('fetchChangelog(): Using static placeholder content (Story 3.5 will implement API)');
}

// Fetch GitHub Status
// TODO Story 3.5: Implement API data integration
async function fetchStatus() {
    // Story 3.5 scope - API integration
    // Currently using static placeholder content in index.html
    console.log('fetchStatus(): Using static placeholder content (Story 3.5 will implement API)');
}

// ============================================================================
// SpriteAnimator Class - Production Version
// ============================================================================

class SpriteAnimator {
    constructor(config) {
        this.canvas = config.canvas;
        this.ctx = this.canvas.getContext('2d');
        this.spriteSheetPath = config.spriteSheetPath;
        
        this.gridColumns = config.gridColumns || 5;
        this.gridRows = config.gridRows || 3;
        this.paletteRows = config.paletteRows || 1;
        this.framePadding = config.framePadding || 0;
        this.verticalOffsets = config.verticalOffsets || [44, 90];
        this.verticalOffset = config.verticalOffset || 0;
        
        this.fps = config.fps || 6;
        this.scale = config.scale || 1;
        
        this.chromaKeyEnabled = config.chromaKey !== false;
        this.chromaKeyColor = config.chromaKeyColor || '#161B22';
        this.chromaKeyTolerance = config.chromaKeyTolerance || 10;
        this.backgroundColor = config.backgroundColor || 'transparent';
        
        this.spriteSheet = null;
        this.frameWidth = 0;
        this.frameHeight = 0;
        this.totalFrames = this.gridColumns * (this.gridRows - this.paletteRows);
        this.currentFrame = 0;
        this.isPlaying = false;
        this.lastFrameTime = 0;
        this.animationId = null;
        
        this.onLoad = config.onLoad || null;
        
        this.loadSpriteSheet();
    }
    
    loadSpriteSheet() {
        this.spriteSheet = new Image();
        this.spriteSheet.onload = () => {
            this.calculateFrameDimensions();
            this.resizeCanvas();
            this.draw();
            if (this.onLoad) this.onLoad(this);
        };
        this.spriteSheet.src = this.spriteSheetPath;
    }
    
    calculateFrameDimensions() {
        this.frameWidth = Math.floor(this.spriteSheet.width / this.gridColumns);
        this.frameHeight = Math.floor(this.spriteSheet.height / this.gridRows);
    }
    
    resizeCanvas() {
        const displayWidth = (this.frameWidth - (this.framePadding * 2));
        const displayHeight = (this.frameHeight - (this.framePadding * 2));
        this.canvas.width = displayWidth * this.scale;
        this.canvas.height = displayHeight * this.scale;
        this.ctx.imageSmoothingEnabled = false;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.backgroundColor !== 'transparent') {
            this.ctx.fillStyle = this.backgroundColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        if (!this.spriteSheet) return;
        
        const frameRow = Math.floor(this.currentFrame / this.gridColumns);
        const frameCol = this.currentFrame % this.gridColumns;
        const rowOffset = this.verticalOffsets[frameRow] || this.verticalOffset;
        
        const sourceX = (frameCol * this.frameWidth) + this.framePadding;
        const sourceY = (frameRow * this.frameHeight) + this.framePadding + rowOffset;
        const sourceWidth = this.frameWidth - (this.framePadding * 2);
        const sourceHeight = this.frameHeight - (this.framePadding * 2);
        
        this.ctx.drawImage(
            this.spriteSheet,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, this.canvas.width, this.canvas.height
        );
        
        if (this.chromaKeyEnabled) this.applyChromaKey();
    }
    
    applyChromaKey() {
        try {
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = imageData.data;
            const chromaRGB = this.hexToRgb(this.chromaKeyColor);
            const tolerance = this.chromaKeyTolerance;
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const distance = Math.sqrt(
                    Math.pow(r - chromaRGB.r, 2) +
                    Math.pow(g - chromaRGB.g, 2) +
                    Math.pow(b - chromaRGB.b, 2)
                );
                if (distance < tolerance) data[i + 3] = 0;
            }
            
            this.ctx.putImageData(imageData, 0, 0);
        } catch (error) {
            console.error('Chroma key error:', error);
        }
    }
    
    hexToRgb(hex) {
        hex = hex.replace('#', '');
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    }
    
    animate(timestamp) {
        if (!this.isPlaying) return;
        
        const frameInterval = 1000 / this.fps;
        const elapsed = timestamp - this.lastFrameTime;
        
        if (elapsed >= frameInterval) {
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            this.draw();
            this.lastFrameTime = timestamp - (elapsed % frameInterval);
        }
        
        this.animationId = requestAnimationFrame((ts) => this.animate(ts));
    }
    
    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.lastFrameTime = performance.now();
        this.animationId = requestAnimationFrame((ts) => this.animate(ts));
    }
    
    pause() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

// ============================================================================
// Dashboard State
// ============================================================================

let isPaused = false;
let refreshIntervalId = null;
let skaterAnimator = null;

// Update timestamp
function updateTimestamp() {
    const now = new Date();
    document.getElementById('timestamp').textContent = 
        now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit'
        });
}

// Toggle pause/resume
function togglePause() {
    isPaused = !isPaused;
    const pauseButton = document.getElementById('pauseButton');
    const pauseIcon = document.getElementById('pauseIcon');
    const pauseText = document.getElementById('pauseText');
    const liveText = document.getElementById('liveText');
    const liveDot = document.getElementById('liveDot');
    
    if (isPaused) {
        // Pause mode
        pauseIcon.textContent = '▶';
        pauseText.textContent = 'Resume';
        liveText.textContent = 'Paused';
        liveDot.classList.add('paused');
        
        // Clear refresh interval
        if (refreshIntervalId) {
            clearInterval(refreshIntervalId);
        }
        if (progressInterval) {
            clearInterval(progressInterval);
        }
        document.getElementById('refreshProgress').style.width = '0%';
    } else {
        // Resume mode
        pauseIcon.textContent = '⏸';
        pauseText.textContent = 'Pause';
        liveText.textContent = 'Live';
        liveDot.classList.remove('paused');
        
        // Restart refresh interval
        fetchAllData();
        refreshIntervalId = setInterval(fetchAllData, REFRESH_INTERVAL);
    }
}

// Refresh Progress Bar Animation
let progressInterval;
let progressStartTime;

function startProgressBar() {
    const progressBar = document.getElementById('refreshProgress');
    progressStartTime = Date.now();
    
    progressBar.style.width = '0%';
    progressBar.classList.remove('refreshing');
    
    if (progressInterval) clearInterval(progressInterval);
    
    progressInterval = setInterval(() => {
        const elapsed = Date.now() - progressStartTime;
        const progress = Math.min((elapsed / REFRESH_INTERVAL) * 100, 100);
        
        progressBar.style.width = progress + '%';
        
        // Update octocat sprite position
        const octocat = document.getElementById('octocatTraveler');
        octocat.style.left = progress + '%';
        
        // Add glow effect in last 10 seconds
        if (progress > 96.67) {
            progressBar.classList.add('refreshing');
        }
        
        // Reset when complete
        if (progress >= 100) {
            setTimeout(() => {
                progressBar.style.width = '0%';
                progressBar.classList.remove('refreshing');
                octocat.style.left = '0%';
            }, 500);
        }
    }, 1000);
}

// Fetch all data
// TODO Story 3.5: Wire API data fetching
async function fetchAllData() {
    if (isPaused) return;
    updateTimestamp();
    startProgressBar();
    
    // Story 3.5: Will implement API calls here
    // For now, working with static HTML placeholder content
    console.log('fetchAllData(): Using static content (Story 3.5 will add API integration)');
}

// Initialize sprite animator
const canvas = document.getElementById('spriteCanvas');
skaterAnimator = new SpriteAnimator({
    canvas: canvas,
    spriteSheetPath: 'octocat-skater-v2.png',
    gridColumns: 5,
    gridRows: 3,
    paletteRows: 1,
    framePadding: 0,
    verticalOffsets: [44, 90],
    fps: 6,
    scale: 0.15,
    chromaKey: true,
    chromaKeyColor: '#161B22',
    chromaKeyTolerance: 10,
    onLoad: (animator) => {
        animator.play();
    }
});

/**
 * Helper function to get item count for a specific page
 * @param {string} pageName - Page identifier ('blog', 'changelog', 'status')
 * @returns {number} Number of list items on the page
 */
function getItemCountForPage(pageName) {
    const pageElement = document.getElementById(`page-${pageName}`);
    if (!pageElement) {
        console.warn(`ItemHighlighter: Page ${pageName} not found`);
        return 0;
    }
    
    const listItems = pageElement.querySelectorAll('.list-item');
    return listItems.length;
}

// Initialize dashboard
updateTimestamp();
fetchAllData();

// Initialize and start carousel rotation
// Store globally to prevent memory leaks during hot reload
if (window.carouselInstance) {
  window.carouselInstance.stop();
}

window.carouselInstance = new CarouselController({ interval: 30000 }); // 30 seconds per page

// Initialize item highlighter
if (window.itemHighlighterInstance) {
  window.itemHighlighterInstance.stop();
}

window.itemHighlighterInstance = new ItemHighlighter({ interval: 8000 }); // 8 seconds per item

// Set carousel callback BEFORE starting
window.carouselInstance.onPageChange = (pageName) => {
    console.log(`Page changed to: ${pageName}`);
    
    // Reset item highlighting when page changes
    window.itemHighlighterInstance.reset();
    
    // Get item count for new page
    const itemCount = getItemCountForPage(pageName);
    
    // Start highlighting on new page if items exist
    if (itemCount > 0) {
        window.itemHighlighterInstance.start(itemCount);
        console.log(`ItemHighlighter started with ${itemCount} items on ${pageName}`);
    }
};

// Start carousel
window.carouselInstance.start();

// Story 3.2: Initialize ItemHighlighter with static content from HTML
// Start highlighting immediately on first page (blog)
const initialPage = window.carouselInstance.pages[window.carouselInstance.currentPage];
const initialItemCount = getItemCountForPage(initialPage);
if (initialItemCount > 0) {
    window.itemHighlighterInstance.start(initialItemCount);
    console.log(`ItemHighlighter initialized with ${initialItemCount} items on ${initialPage} page`);
}

// Auto-refresh every 5 minutes
refreshIntervalId = setInterval(fetchAllData, REFRESH_INTERVAL);

// Pause button handler
document.getElementById('pauseButton').addEventListener('click', togglePause);

// Update timestamp every second
setInterval(updateTimestamp, 1000);
