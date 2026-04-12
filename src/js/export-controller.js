/**
 * ExportController
 * Manages export/share functionality for dashboard items
 * Supports: Markdown, HTML, Link, QR Code
 * 
 * Designed for Raspberry Pi 3B (1GB RAM) - lightweight, no external libraries
 */

export class ExportController {
  constructor() {
    this.qrCodeSize = 256;
  }
  
  /**
   * Export item as Markdown
   * @param {Object} item - Dashboard item
   * @returns {string} Markdown content
   */
  exportMarkdown(item) {
    const date = new Date(item.pubDate || item.created_at || item.timestamp).toLocaleDateString();
    const source = item.source || 'GitHub';
    
    return `# ${item.title}

**Source:** ${source}  
**Date:** ${date}  
**Link:** ${item.link}

## Description

${item.description || item.content || 'No description available.'}

---
Exported from GitHub Latest Dashboard on ${new Date().toLocaleString()}
`;
  }
  
  /**
   * Export item as HTML
   * @param {Object} item - Dashboard item
   * @returns {string} HTML content
   */
  exportHTML(item) {
    const date = new Date(item.pubDate || item.created_at || item.timestamp).toLocaleDateString();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(item.title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      line-height: 1.6;
      color: #24292f;
    }
    h1 { color: #0969da; }
    .metadata { color: #57606a; font-size: 14px; margin-bottom: 20px; }
    .description { margin-top: 20px; }
    a { color: #0969da; text-decoration: none; }
    a:hover { text-decoration: underline; }
    footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #d0d7de; color: #57606a; font-size: 12px; }
  </style>
</head>
<body>
  <h1>${this.escapeHtml(item.title)}</h1>
  
  <div class="metadata">
    <strong>Source:</strong> ${this.escapeHtml(item.source || 'GitHub')}<br>
    <strong>Date:</strong> ${date}<br>
    <strong>Link:</strong> <a href="${item.link}" target="_blank">${item.link}</a>
  </div>
  
  <div class="description">
    ${this.escapeHtml(item.description || item.content || 'No description available.')}
  </div>
  
  <footer>
    Exported from GitHub Latest Dashboard on ${new Date().toLocaleString()}
  </footer>
</body>
</html>`;
  }
  
  /**
   * Copy link to clipboard
   * @param {Object} item - Dashboard item
   */
  async copyLink(item) {
    if (!item.link) {
      throw new Error('No link available for this item');
    }
    
    try {
      await navigator.clipboard.writeText(item.link);
      this.showToast('Link copied to clipboard!');
    } catch (error) {
      // Fallback for browsers without clipboard API
      this.fallbackCopyToClipboard(item.link);
    }
  }
  
  /**
   * Generate QR code for item link
   * @param {Object} item - Dashboard item
   * @param {string} format - 'png' or 'svg'
   * @returns {Promise<string>} Data URL
   */
  async generateQRCode(item, format = 'png') {
    if (!item.link) {
      throw new Error('No link available for this item');
    }
    
    // Use QR code API (lightweight approach for Pi 3B)
    const qrData = this.encodeQRData(item.link);
    
    if (format === 'svg') {
      return this.generateQRSVG(qrData, item.title);
    } else {
      return this.generateQRPNG(qrData, item.title);
    }
  }
  
  /**
   * Simple QR code encoder using external API
   * @param {string} url - URL to encode
   * @returns {string} QR code image URL
   */
  encodeQRData(url) {
    // Use public QR API to avoid adding libraries (Pi 3B optimization)
    return `https://api.qrserver.com/v1/create-qr-code/?size=${this.qrCodeSize}x${this.qrCodeSize}&data=${encodeURIComponent(url)}`;
  }
  
  /**
   * Generate QR code as PNG data URL
   * @param {string} qrDataUrl - QR code API URL
   * @param {string} title - Item title
   * @returns {Promise<string>} Data URL
   */
  async generateQRPNG(qrDataUrl, title) {
    try {
      // Fetch QR image from API
      const response = await fetch(qrDataUrl);
      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }
      const blob = await response.blob();
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('QR code generation error:', error);
      throw new Error('Failed to generate QR code. Please check your internet connection.');
    }
  }
  
  /**
   * Generate QR code as SVG (currently uses PNG approach)
   * @param {string} qrDataUrl - QR code API URL
   * @param {string} title - Item title
   * @returns {Promise<string>} Data URL
   */
  async generateQRSVG(qrDataUrl, title) {
    // For simplicity, use PNG approach (SVG generation would require more complex logic)
    return this.generateQRPNG(qrDataUrl, title);
  }
  
  /**
   * Download file
   * @param {string} content - File content
   * @param {string} filename - File name
   * @param {string} mimeType - MIME type
   */
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
  
  /**
   * Download data URL (for images)
   * @param {string} dataUrl - Data URL
   * @param {string} filename - File name
   */
  downloadDataURL(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  /**
   * Sanitize filename from title
   * @param {string} title - Item title
   * @returns {string} Sanitized filename
   */
  sanitizeFilename(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }
  
  /**
   * Escape HTML entities
   * @param {string} text - Text to escape
   * @returns {string} Escaped HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  /**
   * Fallback clipboard copy (for older browsers)
   * @param {string} text - Text to copy
   */
  fallbackCopyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      this.showToast('Link copied to clipboard!');
    } catch (error) {
      this.showToast('Failed to copy link', 'error');
    }
    
    document.body.removeChild(textarea);
  }
  
  /**
   * Show toast notification
   * @param {string} message - Toast message
   * @param {string} type - Toast type ('success' or 'error')
   */
  showToast(message, type = 'success') {
    // Implement GitHub Primer Flash component or simple toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 2000);
  }
}
