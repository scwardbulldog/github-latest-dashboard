/**
 * Timer Drift Analysis Script
 * 
 * Parses console logs from burn-in testing to analyze timer accuracy
 * for carousel page rotation (30s) and item highlighting (8s).
 * 
 * Usage: node test/analyze-timer-drift.js <log-file>
 * Example: node test/analyze-timer-drift.js _bmad-output/test-results/burn-in-24hr-2026-03-03.log
 * 
 * Success Criteria:
 * - Page rotation: ±1 second tolerance (29-31s acceptable)
 * - Item highlighting: ±0.5 second tolerance (7.5-8.5s acceptable)
 * - Cumulative drift: <5 seconds over 24 hours
 */

import fs from 'fs';
import path from 'path';

// Thresholds
const THRESHOLDS = {
  carousel: {
    interval: 30, // seconds
    tolerance: 1.0, // ±1 second
    name: 'Carousel Page Rotation'
  },
  item: {
    interval: 8, // seconds
    tolerance: 0.5, // ±0.5 seconds
    name: 'Item Highlighting'
  },
  cumulativeDrift: 5.0 // seconds over 24 hours
};

/**
 * Parse console log file to extract timer measurements
 */
function parseLogFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const carouselData = [];
  const itemData = [];
  
  // Extract timer accuracy logs
  const carouselPattern = /⏱️  Carousel Rotation #(\d+): drift=([-\d.]+)s/;
  const itemPattern = /⏱️  Item Highlight #(\d+): drift=([-\d.]+)s/;
  
  lines.forEach(line => {
    const carouselMatch = line.match(carouselPattern);
    if (carouselMatch) {
      carouselData.push({
        count: parseInt(carouselMatch[1]),
        drift: parseFloat(carouselMatch[2])
      });
    }
    
    const itemMatch = line.match(itemPattern);
    if (itemMatch) {
      itemData.push({
        count: parseInt(itemMatch[1]),
        drift: parseFloat(itemMatch[2])
      });
    }
  });
  
  return { carouselData, itemData };
}

/**
 * Calculate statistics for timer measurements
 */
function calculateStats(data, threshold) {
  if (data.length === 0) {
    return null;
  }
  
  const drifts = data.map(d => d.drift);
  const absDrifts = drifts.map(d => Math.abs(d));
  
  // Basic statistics
  const mean = drifts.reduce((a, b) => a + b, 0) / drifts.length;
  const absMean = absDrifts.reduce((a, b) => a + b, 0) / absDrifts.length;
  const min = Math.min(...drifts);
  const max = Math.max(...drifts);
  const absMax = Math.max(...absDrifts);
  
  // Variance and standard deviation
  const variance = drifts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / drifts.length;
  const stdDev = Math.sqrt(variance);
  
  // Cumulative drift (sum of all drifts)
  const cumulativeDrift = drifts.reduce((a, b) => a + b, 0);
  
  // Violations (drift exceeds threshold)
  const violations = absDrifts.filter(d => d > threshold).length;
  const violationRate = (violations / drifts.length) * 100;
  
  // Distribution analysis (within tolerance bands)
  const within50 = absDrifts.filter(d => d <= threshold * 0.5).length;
  const within75 = absDrifts.filter(d => d <= threshold * 0.75).length;
  const within100 = absDrifts.filter(d => d <= threshold).length;
  
  return {
    count: drifts.length,
    mean: mean,
    absMean: absMean,
    min: min,
    max: max,
    absMax: absMax,
    stdDev: stdDev,
    cumulativeDrift: cumulativeDrift,
    violations: violations,
    violationRate: violationRate,
    distribution: {
      within50: (within50 / drifts.length) * 100,
      within75: (within75 / drifts.length) * 100,
      within100: (within100 / drifts.length) * 100
    }
  };
}

/**
 * Determine pass/fail status
 */
function evaluateResults(carouselStats, itemStats) {
  const issues = [];
  let passed = true;
  
  // Carousel evaluation
  if (carouselStats) {
    if (carouselStats.absMax > THRESHOLDS.carousel.tolerance) {
      issues.push({
        severity: 'WARNING',
        component: 'Carousel',
        message: `Max drift (${carouselStats.absMax.toFixed(3)}s) exceeds tolerance (${THRESHOLDS.carousel.tolerance}s)`
      });
    }
    
    if (carouselStats.violationRate > 10) {
      issues.push({
        severity: 'CRITICAL',
        component: 'Carousel',
        message: `High violation rate (${carouselStats.violationRate.toFixed(1)}%) - more than 10% of rotations exceed tolerance`
      });
      passed = false;
    }
    
    if (Math.abs(carouselStats.cumulativeDrift) > THRESHOLDS.cumulativeDrift) {
      issues.push({
        severity: 'CRITICAL',
        component: 'Carousel',
        message: `Cumulative drift (${carouselStats.cumulativeDrift.toFixed(2)}s) exceeds threshold (${THRESHOLDS.cumulativeDrift}s)`
      });
      passed = false;
    }
  }
  
  // Item highlighter evaluation
  if (itemStats) {
    if (itemStats.absMax > THRESHOLDS.item.tolerance) {
      issues.push({
        severity: 'WARNING',
        component: 'Item Highlighter',
        message: `Max drift (${itemStats.absMax.toFixed(3)}s) exceeds tolerance (${THRESHOLDS.item.tolerance}s)`
      });
    }
    
    if (itemStats.violationRate > 10) {
      issues.push({
        severity: 'CRITICAL',
        component: 'Item Highlighter',
        message: `High violation rate (${itemStats.violationRate.toFixed(1)}%) - more than 10% of highlights exceed tolerance`
      });
      passed = false;
    }
    
    if (Math.abs(itemStats.cumulativeDrift) > THRESHOLDS.cumulativeDrift) {
      issues.push({
        severity: 'CRITICAL',
        component: 'Item Highlighter',
        message: `Cumulative drift (${itemStats.cumulativeDrift.toFixed(2)}s) exceeds threshold (${THRESHOLDS.cumulativeDrift}s)`
      });
      passed = false;
    }
  }
  
  return { passed, issues };
}

/**
 * Print detailed report
 */
function printReport(carouselStats, itemStats, evaluation) {
  console.log('\n' + '='.repeat(100));
  console.log('⏱️  TIMER ACCURACY ANALYSIS REPORT');
  console.log('='.repeat(100));
  console.log('');
  
  // Carousel statistics
  if (carouselStats) {
    console.log(`📊 ${THRESHOLDS.carousel.name}:`);
    console.log(`   Interval: ${THRESHOLDS.carousel.interval}s (tolerance: ±${THRESHOLDS.carousel.tolerance}s)`);
    console.log(`   Total Rotations: ${carouselStats.count}`);
    console.log(`   Average Drift: ${carouselStats.mean.toFixed(3)}s (absolute: ${carouselStats.absMean.toFixed(3)}s)`);
    console.log(`   Drift Range: ${carouselStats.min.toFixed(3)}s to ${carouselStats.max.toFixed(3)}s`);
    console.log(`   Max Absolute Drift: ${carouselStats.absMax.toFixed(3)}s`);
    console.log(`   Standard Deviation: ${carouselStats.stdDev.toFixed(3)}s`);
    console.log(`   Cumulative Drift: ${carouselStats.cumulativeDrift.toFixed(2)}s (threshold: ${THRESHOLDS.cumulativeDrift}s)`);
    console.log(`   Violations: ${carouselStats.violations} (${carouselStats.violationRate.toFixed(1)}%)`);
    console.log(`   Distribution:`);
    console.log(`     - Within 50% tolerance: ${carouselStats.distribution.within50.toFixed(1)}%`);
    console.log(`     - Within 75% tolerance: ${carouselStats.distribution.within75.toFixed(1)}%`);
    console.log(`     - Within 100% tolerance: ${carouselStats.distribution.within100.toFixed(1)}%`);
    
    const carouselPassed = carouselStats.absMax <= THRESHOLDS.carousel.tolerance && 
                           carouselStats.violationRate <= 10 &&
                           Math.abs(carouselStats.cumulativeDrift) <= THRESHOLDS.cumulativeDrift;
    console.log(`   Status: ${carouselPassed ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');
  } else {
    console.log(`📊 ${THRESHOLDS.carousel.name}: ⚠️  NO DATA FOUND`);
    console.log('');
  }
  
  // Item highlighter statistics
  if (itemStats) {
    console.log(`📊 ${THRESHOLDS.item.name}:`);
    console.log(`   Interval: ${THRESHOLDS.item.interval}s (tolerance: ±${THRESHOLDS.item.tolerance}s)`);
    console.log(`   Total Highlights: ${itemStats.count}`);
    console.log(`   Average Drift: ${itemStats.mean.toFixed(3)}s (absolute: ${itemStats.absMean.toFixed(3)}s)`);
    console.log(`   Drift Range: ${itemStats.min.toFixed(3)}s to ${itemStats.max.toFixed(3)}s`);
    console.log(`   Max Absolute Drift: ${itemStats.absMax.toFixed(3)}s`);
    console.log(`   Standard Deviation: ${itemStats.stdDev.toFixed(3)}s`);
    console.log(`   Cumulative Drift: ${itemStats.cumulativeDrift.toFixed(2)}s (threshold: ${THRESHOLDS.cumulativeDrift}s)`);
    console.log(`   Violations: ${itemStats.violations} (${itemStats.violationRate.toFixed(1)}%)`);
    console.log(`   Distribution:`);
    console.log(`     - Within 50% tolerance: ${itemStats.distribution.within50.toFixed(1)}%`);
    console.log(`     - Within 75% tolerance: ${itemStats.distribution.within75.toFixed(1)}%`);
    console.log(`     - Within 100% tolerance: ${itemStats.distribution.within100.toFixed(1)}%`);
    
    const itemPassed = itemStats.absMax <= THRESHOLDS.item.tolerance && 
                       itemStats.violationRate <= 10 &&
                       Math.abs(itemStats.cumulativeDrift) <= THRESHOLDS.cumulativeDrift;
    console.log(`   Status: ${itemPassed ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');
  } else {
    console.log(`📊 ${THRESHOLDS.item.name}: ⚠️  NO DATA FOUND`);
    console.log('');
  }
  
  // Issues
  if (evaluation.issues.length > 0) {
    console.log('⚠️  Issues Detected:');
    evaluation.issues.forEach(issue => {
      const icon = issue.severity === 'CRITICAL' ? '❌' : '⚠️';
      console.log(`   ${icon} [${issue.severity}] ${issue.component}: ${issue.message}`);
    });
    console.log('');
  }
  
  // Final verdict
  console.log('='.repeat(100));
  if (evaluation.passed) {
    console.log('✅ PASS: Timer accuracy within acceptable limits. Dashboard timers production-ready.');
  } else {
    console.log('❌ FAIL: Timer accuracy issues detected. Review timer implementation before production.');
  }
  console.log('='.repeat(100));
  console.log('');
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Error: No log file specified');
    console.log('');
    console.log('Usage: node test/analyze-timer-drift.js <log-file>');
    console.log('Example: node test/analyze-timer-drift.js _bmad-output/test-results/burn-in-24hr-2026-03-03.log');
    console.log('');
    console.log('Note: Log file must contain timer accuracy measurements from carousel and item highlighter.');
    console.log('      Enable logging by setting window.enableTimerLogging = true before dashboard loads.');
    process.exit(1);
  }
  
  const logPath = args[0];
  
  if (!fs.existsSync(logPath)) {
    console.error(`❌ Error: File not found: ${logPath}`);
    process.exit(1);
  }
  
  console.log(`📄 Analyzing: ${logPath}\n`);
  
  try {
    const { carouselData, itemData } = parseLogFile(logPath);
    
    const carouselStats = calculateStats(carouselData, THRESHOLDS.carousel.tolerance);
    const itemStats = calculateStats(itemData, THRESHOLDS.item.tolerance);
    
    if (!carouselStats && !itemStats) {
      console.error('❌ Error: No timer accuracy data found in log file');
      console.log('');
      console.log('Make sure timer logging is enabled:');
      console.log('1. Open browser console');
      console.log('2. Run: window.enableTimerLogging = true');
      console.log('3. Reload dashboard');
      console.log('4. Timer accuracy logs will appear in console');
      process.exit(1);
    }
    
    const evaluation = evaluateResults(carouselStats, itemStats);
    
    printReport(carouselStats, itemStats, evaluation);
    
    // Exit with appropriate code
    process.exit(evaluation.passed ? 0 : 1);
  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
    process.exit(1);
  }
}

// Run analysis
main();
