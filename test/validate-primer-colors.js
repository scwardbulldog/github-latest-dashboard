/**
 * GitHub Primer Design Validation Script
 * 
 * Validates that the dashboard uses only GitHub Primer design tokens
 * for colors, spacing, and typography. Detects hardcoded values that
 * violate design system standards.
 * 
 * Usage: node test/validate-primer-colors.js
 * 
 * Success Criteria:
 * - All colors use var(--color-*) tokens (no hardcoded hex/rgb)
 * - All spacing uses var(--space-*) tokens or multiples of 8px
 * - All typography uses var(--fontsize-*) tokens
 * - No custom values outside design system
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GitHub Primer Design Tokens (from primer.style)
const PRIMER_TOKENS = {
  colors: {
    '--color-canvas-default': '#0d1117',
    '--color-canvas-subtle': '#161b22',
    '--color-canvas-overlay': '#1c2128',
    '--color-border-default': '#30363d',
    '--color-border-muted': '#21262d',
    '--color-fg-default': '#c9d1d9',
    '--color-fg-muted': '#8b949e',
    '--color-fg-subtle': '#6e7681',
    '--color-accent-fg': '#58a6ff',
    '--color-accent-emphasis': '#1f6feb',
    '--color-success-fg': '#3fb950',
    '--color-success-emphasis': '#238636',
    '--color-attention-fg': '#d29922',
    '--color-attention-emphasis': '#9e6a03',
    '--color-danger-fg': '#f85149',
    '--color-danger-emphasis': '#da3633',
  },
  spacing: {
    '--space-1': '4px',
    '--space-2': '8px',
    '--space-3': '12px',
    '--space-4': '16px',
    '--space-5': '20px',
    '--space-6': '24px',
    '--space-8': '32px',
    '--space-10': '40px',
    '--space-12': '48px',
    '--space-16': '64px',
  },
  typography: {
    '--fontsize-small': '12px',
    '--fontsize-default': '14px',
    '--fontsize-medium': '16px',
    '--fontsize-large': '20px',
    '--fontsize-xlarge': '24px',
    '--fontsize-xxlarge': '32px',
  }
};

/**
 * Read all CSS files from src/css/
 */
function readCSSFiles() {
  const cssDir = path.join(__dirname, '../src/css');
  const files = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
  
  const cssContent = files.map(file => {
    const filePath = path.join(cssDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    return { file, content };
  });
  
  return cssContent;
}

/**
 * Extract color values from CSS (hex, rgb, rgba, hsl)
 */
function findHardcodedColors(cssFiles) {
  const violations = [];
  
  const colorPatterns = [
    { pattern: /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g, type: 'hex' },
    { pattern: /rgb\s*\([^)]+\)/gi, type: 'rgb' },
    { pattern: /rgba\s*\([^)]+\)/gi, type: 'rgba' },
    { pattern: /hsl\s*\([^)]+\)/gi, type: 'hsl' },
  ];
  
  cssFiles.forEach(({ file, content }) => {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Skip comments
      if (line.trim().startsWith('/*') || line.trim().startsWith('*')) return;
      
      // Skip lines that use var() - these are valid
      if (line.includes('var(--color-')) return;
      
      // Skip :root definitions (where tokens are defined)
      if (content.substring(0, content.indexOf(line)).includes(':root')) {
        // Check if we're still inside :root block
        const beforeLine = content.substring(0, content.indexOf(line));
        const rootStartIndex = beforeLine.lastIndexOf(':root');
        const rootEndIndex = content.indexOf('}', rootStartIndex);
        const linePosition = content.indexOf(line);
        
        if (linePosition > rootStartIndex && linePosition < rootEndIndex) {
          return; // Skip, we're defining tokens
        }
      }
      
      colorPatterns.forEach(({ pattern, type }) => {
        const matches = line.matchAll(pattern);
        for (const match of matches) {
          violations.push({
            file,
            line: index + 1,
            type: 'color',
            subtype: type,
            value: match[0],
            context: line.trim()
          });
        }
      });
    });
  });
  
  return violations;
}

/**
 * Find hardcoded spacing values (px values not using tokens)
 */
function findHardcodedSpacing(cssFiles) {
  const violations = [];
  
  // Valid base-8 spacing values (multiples of 8px are acceptable)
  const validSpacing = [0, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 72, 80, 96, 128];
  
  const spacingPattern = /:\s*(-?\d+)px/g;
  
  cssFiles.forEach(({ file, content }) => {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Skip comments
      if (line.trim().startsWith('/*') || line.trim().startsWith('*')) return;
      
      // Skip lines that use var() - these are valid
      if (line.includes('var(--space-')) return;
      
      // Skip :root definitions
      if (content.substring(0, content.indexOf(line)).includes(':root')) {
        const beforeLine = content.substring(0, content.indexOf(line));
        const rootStartIndex = beforeLine.lastIndexOf(':root');
        const rootEndIndex = content.indexOf('}', rootStartIndex);
        const linePosition = content.indexOf(line);
        
        if (linePosition > rootStartIndex && linePosition < rootEndIndex) {
          return;
        }
      }
      
      // Skip non-spacing properties (font-size, line-height, width, height, etc.)
      const spacingProps = ['margin', 'padding', 'gap', 'top', 'left', 'right', 'bottom', 'inset'];
      const isSpacingProp = spacingProps.some(prop => line.includes(prop + ':') || line.includes(prop + '-'));
      
      if (!isSpacingProp) return;
      
      const matches = line.matchAll(spacingPattern);
      for (const match of matches) {
        const value = parseInt(match[1]);
        
        // Allow 0 and valid base-8 values
        if (value === 0 || validSpacing.includes(Math.abs(value))) continue;
        
        violations.push({
          file,
          line: index + 1,
          type: 'spacing',
          subtype: 'non-base-8',
          value: match[0],
          context: line.trim()
        });
      }
    });
  });
  
  return violations;
}

/**
 * Find hardcoded typography values
 */
function findHardcodedTypography(cssFiles) {
  const violations = [];
  
  const fontSizePattern = /font-size:\s*(\d+)px/g;
  
  cssFiles.forEach(({ file, content }) => {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Skip comments
      if (line.trim().startsWith('/*') || line.trim().startsWith('*')) return;
      
      // Skip lines that use var() - these are valid
      if (line.includes('var(--fontsize-')) return;
      
      // Skip :root definitions
      if (content.substring(0, content.indexOf(line)).includes(':root')) {
        const beforeLine = content.substring(0, content.indexOf(line));
        const rootStartIndex = beforeLine.lastIndexOf(':root');
        const rootEndIndex = content.indexOf('}', rootStartIndex);
        const linePosition = content.indexOf(line);
        
        if (linePosition > rootStartIndex && linePosition < rootEndIndex) {
          return;
        }
      }
      
      const matches = line.matchAll(fontSizePattern);
      for (const match of matches) {
        violations.push({
          file,
          line: index + 1,
          type: 'typography',
          subtype: 'hardcoded-fontsize',
          value: match[0],
          context: line.trim()
        });
      }
    });
  });
  
  return violations;
}

/**
 * Print validation report
 */
function printReport(colorViolations, spacingViolations, typographyViolations) {
  console.log('\n' + '='.repeat(100));
  console.log('🎨 GITHUB PRIMER DESIGN VALIDATION REPORT');
  console.log('='.repeat(100));
  console.log('');
  
  // Color violations
  console.log('🎨 Color Validation:');
  if (colorViolations.length === 0) {
    console.log('   ✅ No hardcoded colors found - all using Primer tokens');
  } else {
    console.log(`   ❌ ${colorViolations.length} hardcoded color(s) found:`);
    console.log('');
    
    colorViolations.forEach((v, i) => {
      console.log(`   ${i + 1}. ${v.file}:${v.line}`);
      console.log(`      Type: ${v.subtype}`);
      console.log(`      Value: ${v.value}`);
      console.log(`      Context: ${v.context}`);
      console.log('');
    });
    
    console.log('   💡 Fix: Replace hardcoded colors with Primer tokens:');
    console.log('      Example: color: #58a6ff; → color: var(--color-accent-fg);');
  }
  console.log('');
  
  // Spacing violations
  console.log('📏 Spacing Validation:');
  if (spacingViolations.length === 0) {
    console.log('   ✅ All spacing uses base-8 system or Primer tokens');
  } else {
    console.log(`   ⚠️  ${spacingViolations.length} non-base-8 spacing value(s) found:`);
    console.log('');
    
    spacingViolations.forEach((v, i) => {
      console.log(`   ${i + 1}. ${v.file}:${v.line}`);
      console.log(`      Value: ${v.value}`);
      console.log(`      Context: ${v.context}`);
      console.log('');
    });
    
    console.log('   💡 Fix: Use base-8 multiples (0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64) or Primer tokens:');
    console.log('      Example: margin: 10px; → margin: 8px; OR margin: var(--space-2);');
  }
  console.log('');
  
  // Typography violations
  console.log('📝 Typography Validation:');
  if (typographyViolations.length === 0) {
    console.log('   ✅ All font sizes use Primer tokens');
  } else {
    console.log(`   ❌ ${typographyViolations.length} hardcoded font-size(s) found:`);
    console.log('');
    
    typographyViolations.forEach((v, i) => {
      console.log(`   ${i + 1}. ${v.file}:${v.line}`);
      console.log(`      Value: ${v.value}`);
      console.log(`      Context: ${v.context}`);
      console.log('');
    });
    
    console.log('   💡 Fix: Replace hardcoded font-size with Primer tokens:');
    console.log('      Example: font-size: 14px; → font-size: var(--fontsize-default);');
  }
  console.log('');
  
  // Summary
  const totalViolations = colorViolations.length + spacingViolations.length + typographyViolations.length;
  const criticalViolations = colorViolations.length + typographyViolations.length;
  
  console.log('='.repeat(100));
  console.log('📊 Summary:');
  console.log(`   Color Violations: ${colorViolations.length} ${colorViolations.length === 0 ? '✅' : '❌'}`);
  console.log(`   Spacing Violations: ${spacingViolations.length} ${spacingViolations.length === 0 ? '✅' : '⚠️'}`);
  console.log(`   Typography Violations: ${typographyViolations.length} ${typographyViolations.length === 0 ? '✅' : '❌'}`);
  console.log(`   Total: ${totalViolations}`);
  console.log('');
  
  // Pass/Fail determination
  const passed = criticalViolations === 0;
  
  if (passed) {
    console.log('✅ PASS: Dashboard follows GitHub Primer design system');
    console.log('');
    if (spacingViolations.length > 0) {
      console.log('   Note: Minor spacing violations acceptable but should be reviewed');
    }
  } else {
    console.log('❌ FAIL: Design system violations detected');
    console.log('');
    console.log('   Critical violations (colors, typography) must be fixed before production.');
    console.log('   Spacing violations are warnings - review for consistency.');
  }
  console.log('='.repeat(100));
  console.log('');
  
  return passed;
}

/**
 * Main validation function
 */
function validatePrimerDesign() {
  console.log('🎨 Validating GitHub Primer design compliance...\n');
  
  try {
    const cssFiles = readCSSFiles();
    console.log(`📄 Analyzing ${cssFiles.length} CSS file(s)...\n`);
    
    const colorViolations = findHardcodedColors(cssFiles);
    const spacingViolations = findHardcodedSpacing(cssFiles);
    const typographyViolations = findHardcodedTypography(cssFiles);
    
    const passed = printReport(colorViolations, spacingViolations, typographyViolations);
    
    process.exit(passed ? 0 : 1);
  } catch (error) {
    console.error('❌ Error during validation:', error.message);
    process.exit(1);
  }
}

// Run validation
validatePrimerDesign();
