// Import utility functions
import { formatDate, stripHtml, truncate } from './utils.js';

// Component skeletons imported for Epic 2+ implementation
// Current MVP functionality remains using existing code below
// TODO Epic 2: Wire carousel components and migrate logic
import { CarouselController } from './carousel-controller.js';
import { ItemHighlighter } from './item-highlighter.js';
import { DetailPanel } from './detail-panel.js';
// NOTE: Alias api-client exports to avoid colliding with existing
// fetchBlog/fetchChangelog/fetchStatus implementations in this file.
// These aliases will be wired in a later epic when the data layer
// is migrated out of main.js.
import {
    fetchBlog as fetchBlogFromApiClient,
    fetchChangelog as fetchChangelogFromApiClient,
    fetchStatus as fetchStatusFromApiClient
} from './api-client.js';

// Configuration
const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json';
const GITHUB_BLOG_RSS = 'https://github.blog/feed/';
const GITHUB_CHANGELOG_RSS = 'https://github.blog/changelog/feed/';
const GITHUB_STATUS_API = 'https://www.githubstatus.com/api/v2/incidents.json';
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Detect changelog badge type based on keywords
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

// Detect blog post badge from title and content
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

// Format categories to fit within a character limit
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

// Fetch GitHub Blog
async function fetchBlog() {
    try {
        const response = await fetch(`${RSS2JSON_API}?rss_url=${encodeURIComponent(GITHUB_BLOG_RSS)}`);
        const data = await response.json();
        
        if (data.status !== 'ok') {
            throw new Error('Failed to fetch blog RSS');
        }

        const container = document.getElementById('blog-content');
        if (!data.items || data.items.length === 0) {
            container.innerHTML = '<div class="error">No blog posts available</div>';
            return;
        }

        // Render all items - container overflow will handle display
        container.innerHTML = data.items.map(item => {
            const badge = detectBlogBadgeType(item.title, item.description || item.content || '');
            const categories = item.categories && item.categories.length > 0 
                ? formatCategories(item.categories) 
                : '';
            
            return `
                <div class="item blog-item">
                    <div class="item-title">
                        <a href="${item.link}" target="_blank">${item.title}</a>
                    </div>
                    <div class="item-preview">
                        ${truncate(stripHtml(item.description || item.content || ''), 150)}
                    </div>
                    <div class="item-date">
                        <span>
                            ${badge.type !== 'POST' ? `<span class="blog-badge ${badge.class}">[${badge.type}]</span>` : ''}
                            ${categories ? `<span class="blog-category">${categories}</span>` : ''}
                        </span>
                        <span>${formatDate(item.pubDate)}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error fetching blog:', error);
        document.getElementById('blog-content').innerHTML = 
            `<div class="error">Error loading blog posts: ${error.message}</div>`;
    }
}

// Fetch GitHub Changelog
async function fetchChangelog() {
    try {
        const response = await fetch(`${RSS2JSON_API}?rss_url=${encodeURIComponent(GITHUB_CHANGELOG_RSS)}`);
        const data = await response.json();
        
        if (data.status !== 'ok') {
            throw new Error('Failed to fetch changelog RSS');
        }

        const container = document.getElementById('changelog-content');
        if (!data.items || data.items.length === 0) {
            container.innerHTML = '<div class="error">No changelog entries available</div>';
            return;
        }

        // Render all items - container overflow will handle display
        container.innerHTML = data.items.map(item => {
            const badge = detectBadgeType(item.title, item.description || item.content || '');
            const categories = item.categories && item.categories.length > 0 
                ? formatCategories(item.categories) 
                : '';
            
            return `
                <div class="item changelog-item">
                    <div class="item-title">
                        <a href="${item.link}" target="_blank">${item.title}</a>
                    </div>
                    <div class="item-date">
                        <span>
                            <span class="changelog-badge ${badge.class}">[${badge.type}]</span>
                            ${categories ? `<span class="changelog-category">${categories}</span>` : ''}
                        </span>
                        <span>${formatDate(item.pubDate)}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error fetching changelog:', error);
        document.getElementById('changelog-content').innerHTML = 
            `<div class="error">Error loading changelog: ${error.message}</div>`;
    }
}

// Fetch GitHub Status
async function fetchStatus() {
    try {
        const response = await fetch(GITHUB_STATUS_API);
        const data = await response.json();

        const container = document.getElementById('status-content');
        
        if (!data.incidents || data.incidents.length === 0) {
            container.innerHTML = `
                <div class="item status-card status-card-operational">
                    <div class="item-title">
                        <span class="status-symbol">●</span>
                        All Systems Operational
                    </div>
                </div>
            `;
            return;
        }

        // Separate active and resolved incidents
        const activeIncidents = data.incidents.filter(inc => inc.status !== 'resolved');
        const resolvedIncidents = data.incidents.filter(inc => inc.status === 'resolved');
        
        // Function to render an incident card
        const renderIncident = (incident, isResolved) => {
            const impact = incident.impact;
            
            // If resolved, always show green. Otherwise use severity color.
            const severityClass = isResolved 
                ? 'status-card-operational'
                : impact === 'critical' || impact === 'major' 
                    ? 'status-card-major' 
                    : impact === 'minor' 
                        ? 'status-card-minor' 
                        : 'status-card-operational';
            
            const symbol = impact === 'critical' || impact === 'major' 
                ? '■' 
                : impact === 'minor' 
                    ? '▲' 
                    : '●';
            
            const symbolClass = impact === 'critical' || impact === 'major'
                ? 'status-symbol-major'
                : impact === 'minor'
                    ? 'status-symbol-minor'
                    : 'status-symbol-operational';
            
            const statusText = incident.status.replace(/_/g, ' ');
            const resolvedClass = isResolved ? ' resolved' : '';
            
            if (isResolved) {
                return `
                    <div class="item status-card ${severityClass}${resolvedClass}">
                        <div class="item-title">
                            <span class="status-symbol ${symbolClass}">${symbol}</span>
                            ${incident.name}
                        </div>
                        <div class="item-date">
                            <span class="status-text">${statusText}</span>
                            <span>${formatDate(incident.created_at)}</span>
                        </div>
                    </div>
                `;
            } else {
                const updateText = incident.incident_updates && incident.incident_updates.length > 0 
                    ? truncate(stripHtml(incident.incident_updates[0].body), 100)
                    : `Status: ${incident.status.replace(/_/g, ' ').toUpperCase()}`;
                
                return `
                    <div class="item status-card ${severityClass}${resolvedClass}">
                        <div class="item-title">
                            <span class="status-symbol ${symbolClass}">${symbol}</span>
                            ${incident.name}
                        </div>
                        <div class="item-preview">
                            ${updateText}
                        </div>
                        <div class="item-date">
                            <span class="status-text">${statusText}</span>
                            <span>${formatDate(incident.created_at)}</span>
                        </div>
                    </div>
                `;
            }
        };
        
        // If no active incidents, show operational status
        if (activeIncidents.length === 0) {
            let html = `
                <div class="item status-card status-card-operational">
                    <div class="item-title">
                        <span class="status-symbol">●</span>
                        All Systems Operational
                    </div>
                </div>
            `;
            
            // Add resolved section if there are any
            if (resolvedIncidents.length > 0) {
                html += '<div class="status-divider">Resolved</div>';
                html += resolvedIncidents.map(inc => renderIncident(inc, true)).join('');
            }
            
            container.innerHTML = html;
            return;
        }
        
        // Build HTML with active first, then divider, then resolved
        let html = '';
        
        // Active incidents section
        if (activeIncidents.length > 0) {
            html += activeIncidents.map(inc => renderIncident(inc, false)).join('');
        }
        
        // Divider if both sections exist
        if (activeIncidents.length > 0 && resolvedIncidents.length > 0) {
            html += '<div class="status-divider">Resolved</div>';
        }
        
        // Resolved incidents section
        if (resolvedIncidents.length > 0) {
            html += resolvedIncidents.map(inc => renderIncident(inc, true)).join('');
        }
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error fetching status:', error);
        document.getElementById('status-content').innerHTML = 
            `<div class="error">Error loading status: ${error.message}</div>`;
    }
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
async function fetchAllData() {
    if (isPaused) return;
    updateTimestamp();
    startProgressBar();
    await Promise.all([
        fetchBlog(),
        fetchChangelog(),
        fetchStatus()
    ]);
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

// Initialize dashboard
updateTimestamp();
fetchAllData();

// Initialize and start carousel rotation
// Store globally to prevent memory leaks during hot reload
if (window.carouselInstance) {
  window.carouselInstance.stop();
}
window.carouselInstance = new CarouselController({ interval: 5000 }); // 5 seconds for testing
window.carouselInstance.start();

// Optional: Set callback for future coordination (Epic 3)
window.carouselInstance.onPageChange = (pageName) => {
    console.log(`Page changed to: ${pageName}`);
    // Future: itemHighlighter.reset() will be called here in Epic 3
};

// Auto-refresh every 5 minutes
refreshIntervalId = setInterval(fetchAllData, REFRESH_INTERVAL);

// Pause button handler
document.getElementById('pauseButton').addEventListener('click', togglePause);

// Update timestamp every second
setInterval(updateTimestamp, 1000);
