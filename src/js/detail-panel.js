/**
 * DetailPanel - Manages detail view rendering for highlighted items
 * @class
 */
export class DetailPanel {
  /**
   * Create a DetailPanel instance
   * @param {Object} config - Configuration options
   * @param {string} config.containerId - DOM element ID for detail panel (default: 'detail-panel')
   */
  constructor({ containerId = 'detail-panel' } = {}) {
    this.containerId = containerId;
    this.container = null;
    this.isTransitioning = false; // Prevent overlapping transitions
  }
  
  /**
   * Render item details with smooth transition
   * @param {Object} item - Item data { title, timestamp, description, link }
   */
  async render(item) {
    // Get active page's detail panel
    const activePage = document.querySelector('.carousel-page.active');
    if (!activePage) {
      console.warn('DetailPanel: No active page found');
      return;
    }
    
    this.container = activePage.querySelector('.detail-panel');
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
      this.container.innerHTML = this.buildContent(item);
      
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
   * Build HTML content for detail panel
   * @private
   * @param {Object} item - Item data
   * @returns {string} HTML string
   */
  buildContent(item) {
    // Extract and validate properties with fallbacks
    const safeTitle = this.sanitizeHtml(item.title || 'Untitled');
    const safeTimestamp = item.timestamp || 'Unknown date';
    const safeDescription = this.sanitizeHtml(
      item.description || 'No description available'
    );
    const safeLink = item.link || '';
    
    return `
      <div class="detail-panel-content">
        <h2 class="detail-panel__title">${safeTitle}</h2>
        <time class="detail-panel__timestamp">${safeTimestamp}</time>
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
