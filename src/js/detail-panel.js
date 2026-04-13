/**
 * DetailPanel - Manages detail view rendering for highlighted items
 * @class
 */
export class DetailPanel {
  // Counter for generating unique item IDs
  static itemIdCounter = 0;
  
  /**
   * Create a DetailPanel instance
   * @param {Object} config - Configuration options
   * @param {string} config.containerId - DOM element ID for detail panel (default: 'detail-panel')
   */
  constructor({ containerId = 'detail-panel' } = {}) {
    this.containerId = containerId;
    this.container = null;
    this.activePage = null; // Cache active page reference to avoid re-querying on every update
    this.isTransitioning = false; // Prevent overlapping transitions
    this.currentItemId = null; // Track current item to prevent stale updates
  }
  
  /**
   * Invalidate cached DOM references (call when page rotation occurs)
   * Forces render() / renderWithAsyncContent() to re-query the new active page
   */
  invalidateCache() {
    this.container = null;
    this.activePage = null;
  }
  
  /**
   * Render item details with smooth transition
   * @param {Object} item - Item data { title, timestamp, description, link }
   * @param {Object} options - Rendering options
   * @param {boolean} options.preserveHtml - Preserve HTML formatting in description (default: false)
   */
  async render(item, options = {}) {
    const { preserveHtml = false } = options;
    // Get active page's detail panel - re-query only when cache is stale
    const currentActivePage = document.querySelector('.carousel-page.active');
    if (!currentActivePage) {
      console.warn('DetailPanel: No active page found');
      return;
    }
    
    if (this.activePage !== currentActivePage || !this.container) {
      this.activePage = currentActivePage;
      this.container = currentActivePage.querySelector('.detail-panel');
    }
    
    if (!this.container) {
      console.error('DetailPanel: No .detail-panel found on active page');
      return;
    }
    
    // Prevent overlapping transitions
    if (this.isTransitioning) {
      console.debug('DetailPanel: Transition in progress, skipping render');
      return;
    }
    
    this.isTransitioning = true;
    
    try {
      // Phase 1: Fade out (100ms)
      this.container.style.opacity = '0';
      await this.wait(100);
      
      // Phase 2: Update content during invisible state
      this.container.innerHTML = this.buildContent(item, preserveHtml);
      
      // Phase 3: Fade in (100ms)
      this.container.style.opacity = '1';
      await this.wait(100);
    } catch (error) {
      console.error('DetailPanel: Error during render transition', error);
      // Ensure opacity is restored even if error occurs
      this.container.style.opacity = '1';
    } finally {
      this.isTransitioning = false;
    }
  }
  
  /**
   * Render item details with async content loading
   * Shows initial content immediately, then fetches full content asynchronously
   * @param {Object} item - Item data { title, timestamp, description, link, articleUrl }
   * @param {Function} contentFetcher - Async function to fetch full content (optional)
   * @param {Object} options - Additional options
   * @param {boolean} options.hideHeader - Hide the title and timestamp (useful when fetched content includes them)
   * @param {boolean} options.skipInitialContent - Skip showing initial description, only show loading state and fetched content
   */
  async renderWithAsyncContent(item, contentFetcher, options = {}) {
    const { hideHeader = false, skipInitialContent = false } = options;
    // Generate unique ID for this item render using counter for guaranteed uniqueness
    const itemId = `${item.link || ''}-${Date.now()}-${++DetailPanel.itemIdCounter}`;
    this.currentItemId = itemId;
    
    // Get active page's detail panel - re-query only when cache is stale
    const currentActivePage = document.querySelector('.carousel-page.active');
    if (!currentActivePage) {
      console.warn('DetailPanel: No active page found');
      return;
    }
    
    if (this.activePage !== currentActivePage || !this.container) {
      this.activePage = currentActivePage;
      this.container = currentActivePage.querySelector('.detail-panel');
    }
    
    if (!this.container) {
      console.error('DetailPanel: No .detail-panel found on active page');
      return;
    }
    
    // Prevent overlapping transitions
    if (this.isTransitioning) {
      console.debug('DetailPanel: Transition in progress, skipping render');
      return;
    }
    
    this.isTransitioning = true;
    
    try {
      // Phase 1: Fade out (100ms)
      this.container.style.opacity = '0';
      await this.wait(100);
      
      // Phase 2: Show initial content with loading indicator if we have a content fetcher
      const showLoading = !!contentFetcher && item.link;
      this.container.innerHTML = this.buildContentWithLoading(item, showLoading, hideHeader, skipInitialContent);
      
      // Phase 3: Fade in (100ms)
      this.container.style.opacity = '1';
      await this.wait(100);
    } catch (error) {
      console.error('DetailPanel: Error during render transition', error);
      this.container.style.opacity = '1';
    } finally {
      this.isTransitioning = false;
    }
    
    // If we have a content fetcher and a link, fetch the full content asynchronously
    if (contentFetcher && item.link) {
      try {
        console.log(`DetailPanel: Fetching full content for: ${item.title}`);
        const fullContent = await contentFetcher(item.link);
        
        // Check if this item is still the current one (prevent stale updates)
        if (this.currentItemId !== itemId) {
          console.debug('DetailPanel: Skipping stale content update (item changed during fetch)');
          return;
        }
        
        if (fullContent) {
          console.log(`DetailPanel: Successfully fetched content for: ${item.title}`);
          this.updateContent(fullContent, item);
        } else {
          console.warn(`DetailPanel: Fetch returned null/empty content for: ${item.title}`);
          // Only remove loading indicator if this item is still current
          if (this.currentItemId === itemId) {
            this.removeLoadingIndicator();
          }
        }
      } catch (error) {
        console.error(`DetailPanel: Error fetching async content for ${item.title}:`, error);
        // Only remove loading indicator if this item is still current
        // This prevents removing the spinner from a newer item when an old fetch times out
        if (this.currentItemId === itemId) {
          this.removeLoadingIndicator();
        } else {
          console.debug(`DetailPanel: Not removing loading indicator - item changed during fetch (expected ${itemId}, current ${this.currentItemId})`);
        }
      }
    }
  }
  
  /**
   * Build HTML content with optional loading indicator
   * @private
   * @param {Object} item - Item data
   * @param {boolean} showLoading - Whether to show loading indicator
   * @param {boolean} hideHeader - Whether to hide the title and timestamp (useful when fetched content includes them)
   * @param {boolean} skipInitialContent - Skip showing initial description, only show loading state
   * @returns {string} HTML string
   */
  buildContentWithLoading(item, showLoading = false, hideHeader = false, skipInitialContent = false) {
    const safeTitle = this.sanitizeHtml(item.title || 'Untitled');
    const safeTimestamp = item.timestamp || 'Unknown date';
    const safeDescription = this.sanitizeHtml(
      item.description || 'No description available'
    );
    const safeLink = item.link || '';
    
    const loadingIndicator = showLoading ? `
      <div class="detail-panel__loading" id="detail-loading">
        <div class="detail-panel__loading-spinner"></div>
        <span>Loading full article...</span>
      </div>
    ` : '';
    
    // Only show title and timestamp if hideHeader is false
    const headerHtml = hideHeader ? '' : `
        <h2 class="detail-panel__title">${safeTitle}</h2>
        <time class="detail-panel__timestamp">${safeTimestamp}</time>`;
    
    // If skipInitialContent is true, don't show description - only show loading state then fetched content
    const contentHtml = skipInitialContent ? '' : `<div class="detail-panel__content" id="detail-content">${safeDescription}</div>`;
    
    return `
      <div class="detail-panel-content">
        ${headerHtml}
        ${loadingIndicator}
        ${contentHtml}
        ${safeLink ? `<a href="${safeLink}" class="detail-panel__link" target="_blank" rel="noopener noreferrer">Read more →</a>` : ''}
      </div>
    `;
  }
  
  /**
   * Update the content area with fetched content
   * @private
   * @param {string} content - The new HTML content
   * @param {Object} item - Original item data for fallback
   */
  updateContent(content, item) {
    if (!this.container) {
      console.warn('DetailPanel.updateContent: No container reference');
      return;
    }
    
    let contentEl = this.container.querySelector('#detail-content');
    const loadingEl = this.container.querySelector('#detail-loading');
    
    // If no content div exists (skipInitialContent was true), create it
    if (!contentEl) {
      contentEl = document.createElement('div');
      contentEl.className = 'detail-panel__content';
      contentEl.id = 'detail-content';
      
      // Insert it where the loading indicator is (or at the end)
      if (loadingEl) {
        loadingEl.parentNode.insertBefore(contentEl, loadingEl.nextSibling);
      } else {
        const panelContent = this.container.querySelector('.detail-panel-content');
        if (panelContent) {
          // Insert before the link if it exists, otherwise append
          const link = panelContent.querySelector('.detail-panel__link');
          if (link) {
            panelContent.insertBefore(contentEl, link);
          } else {
            panelContent.appendChild(contentEl);
          }
        } else {
          console.error('DetailPanel.updateContent: No .detail-panel-content container found');
          return;
        }
      }
    }
    
    // Sanitize and update content
    const sanitizedContent = this.sanitizeHtml(content);
    contentEl.innerHTML = sanitizedContent;
    console.log('DetailPanel: Updated with full article content');
    
    // Remove loading indicator after content is inserted
    if (loadingEl) {
      loadingEl.remove();
    }
  }
  
  /**
   * Remove the loading indicator
   * @private
   */
  removeLoadingIndicator() {
    if (!this.container) return;
    
    const loadingEl = this.container.querySelector('#detail-loading');
    if (loadingEl) {
      loadingEl.remove();
    }
  }
  
  /**
   * Build HTML content for detail panel
   * @private
   * @param {Object} item - Item data
   * @param {boolean} preserveHtml - Preserve HTML formatting in description
   * @returns {string} HTML string
   */
  buildContent(item, preserveHtml = false) {
    // Extract and validate properties with fallbacks
    const safeTitle = this.sanitizeHtml(item.title || 'Untitled');
    const safeTimestamp = item.timestamp || 'Unknown date';
    
    // For HTML content (like changelogs), preserve formatting; otherwise sanitize
    const safeDescription = preserveHtml 
      ? this.sanitizeHtml(item.description || 'No description available')
      : this.sanitizeHtml(item.description || 'No description available');
    const safeLink = item.link || '';
    
    // Hide timestamp if it's unknown (e.g., changelog items without dates)
    const timestampHtml = (safeTimestamp && safeTimestamp !== 'Unknown date') 
      ? `<time class="detail-panel__timestamp">${safeTimestamp}</time>` 
      : '';
    
    return `
      <div class="detail-panel-content">
        <h2 class="detail-panel__title">${safeTitle}</h2>
        ${timestampHtml}
        <div class="detail-panel__content">${safeDescription}</div>
        ${safeLink ? `<a href="${safeLink}" class="detail-panel__link" target="_blank" rel="noopener noreferrer">Read more →</a>` : ''}
      </div>
    `;
  }
  
  /**
   * Sanitize HTML content (allow safe HTML rendering)
   * Allows common HTML tags for rich content display
   * @private
   * @param {string} html - HTML content to sanitize
   * @returns {string} Sanitized HTML
   */
  sanitizeHtml(html) {
    if (!html) return '';
    
    // Create temporary element for parsing
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Remove dangerous tags (script, iframe, object, embed, etc.)
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'style'];
    dangerousTags.forEach(tag => {
      const elements = temp.querySelectorAll(tag);
      elements.forEach(el => el.remove());
    });
    
    // Remove event handler attributes (onclick, onerror, etc.)
    const allElements = temp.querySelectorAll('*');
    allElements.forEach(el => {
      const attributes = Array.from(el.attributes);
      attributes.forEach(attr => {
        if (attr.name.startsWith('on')) {
          el.removeAttribute(attr.name);
        }
      });
    });
    
    // Return sanitized HTML
    return temp.innerHTML;
  }
  
  /**
   * Promise wrapper for setTimeout
   * @private
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise} Resolves after specified time
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Show the detail panel (for future use)
   */
  show() {
    if (!this.container) {
      const activePage = document.querySelector('.carousel-page.active');
      if (activePage) {
        this.container = activePage.querySelector('.detail-panel');
      }
    }
    if (this.container) {
      this.container.style.display = 'block';
    }
  }
  
  /**
   * Hide the detail panel (for future use)
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }
}
