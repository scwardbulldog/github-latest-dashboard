/**
 * Focused security check for HTML entity encoding used by status incident rendering.
 * Usage: node test/escape-html.js
 */

import assert from 'node:assert/strict';

// Minimal DOM mock required because utils.js creates a reusable element at module load.
globalThis.document = {
  createElement() {
    return {
      innerHTML: '',
      textContent: '',
      innerText: ''
    };
  }
};

const { escapeHtml } = await import('../src/js/utils.js');

function runSecurityTests() {
  assert.equal(escapeHtml('Plain text'), 'Plain text');
  assert.equal(
    escapeHtml('<img src=x onerror="alert(1)">'),
    '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'
  );
  assert.equal(
    escapeHtml(`A&B "quote" 'single' <tag>`),
    'A&amp;B &quot;quote&quot; &#39;single&#39; &lt;tag&gt;'
  );

  console.log('✅ escapeHtml security checks passed');
}

runSecurityTests();
