/**
 * Memory Analysis Script
 * 
 * Analyzes memory monitoring CSV results to detect memory leaks
 * and generate detailed reports with pass/fail determination.
 * 
 * Usage: node test/analyze-memory-results.js <csv-file>
 * Example: node test/analyze-memory-results.js _bmad-output/test-results/memory-profile-2026-03-03.csv
 * 
 * Success Criteria:
 * - Heap growth < 10MB over 24 hours
 * - No continuous upward trend (linear regression slope < 0.5 MB/hour)
 * - Document count remains at 1
 * - Event listener count stable (variance < 10%)
 */

import fs from 'fs';
import path from 'path';

// Thresholds
const THRESHOLDS = {
  maxHeapGrowth: 10, // MB
  maxSlopePerHour: 0.5, // MB/hour
  maxEventListenerVariance: 0.1, // 10%
  maxDocumentCount: 1
};

/**
 * Parse CSV file into structured data
 */
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').slice(1).filter(line => line.trim());
  
  return lines.map(line => {
    const [timestamp, elapsedHours, heapUsed, heapLimit, heapTotal, documents, eventListeners, nodes, heapGrowth] = line.split(',');
    return {
      timestamp,
      elapsedHours: parseFloat(elapsedHours),
      heapUsed: parseFloat(heapUsed),
      heapLimit: parseFloat(heapLimit),
      heapTotal: parseFloat(heapTotal),
      documents: parseInt(documents),
      eventListeners: parseInt(eventListeners),
      nodes: parseInt(nodes),
      heapGrowth: parseFloat(heapGrowth)
    };
  });
}

/**
 * Calculate linear regression to detect memory leak trend
 */
function linearRegression(data) {
  const n = data.length;
  const xValues = data.map(d => d.elapsedHours);
  const yValues = data.map(d => d.heapGrowth);
  
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}

/**
 * Calculate statistics for a data series
 */
function calculateStats(values) {
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  return { mean, variance, stdDev, min, max };
}

/**
 * Analyze memory data
 */
function analyzeMemory(data) {
  if (data.length === 0) {
    throw new Error('No data to analyze');
  }
  
  const baseline = data[0];
  const final = data[data.length - 1];
  
  // Heap growth analysis
  const heapGrowthValues = data.map(d => d.heapGrowth);
  const heapStats = calculateStats(heapGrowthValues);
  
  // Trend analysis (linear regression)
  const regression = linearRegression(data);
  
  // Event listener analysis
  const eventListenerValues = data.map(d => d.eventListeners);
  const listenerStats = calculateStats(eventListenerValues);
  const listenerVariance = (listenerStats.stdDev / listenerStats.mean) || 0;
  
  // Document count analysis
  const documentValues = data.map(d => d.documents);
  const maxDocuments = Math.max(...documentValues);
  
  return {
    duration: final.elapsedHours,
    samples: data.length,
    baseline: {
      heapUsed: baseline.heapUsed,
      eventListeners: baseline.eventListeners,
      documents: baseline.documents
    },
    heap: {
      finalGrowth: final.heapGrowth,
      maxGrowth: heapStats.max,
      minGrowth: heapStats.min,
      avgGrowth: heapStats.mean,
      trend: regression.slope
    },
    eventListeners: {
      baseline: baseline.eventListeners,
      final: final.eventListeners,
      variance: listenerVariance,
      stable: listenerVariance < THRESHOLDS.maxEventListenerVariance
    },
    documents: {
      max: maxDocuments,
      stable: maxDocuments === THRESHOLDS.maxDocumentCount
    }
  };
}

/**
 * Determine pass/fail and generate report
 */
function generateReport(analysis) {
  const issues = [];
  let passed = true;
  
  // Check heap growth
  if (analysis.heap.finalGrowth >= THRESHOLDS.maxHeapGrowth) {
    issues.push({
      severity: 'CRITICAL',
      message: `Final heap growth (${analysis.heap.finalGrowth.toFixed(2)} MB) exceeds threshold (${THRESHOLDS.maxHeapGrowth} MB)`
    });
    passed = false;
  }
  
  // Check growth trend
  if (analysis.heap.trend >= THRESHOLDS.maxSlopePerHour) {
    issues.push({
      severity: 'CRITICAL',
      message: `Memory growth trend (${analysis.heap.trend.toFixed(3)} MB/hour) indicates continuous leak`
    });
    passed = false;
  }
  
  // Check event listeners
  if (!analysis.eventListeners.stable) {
    issues.push({
      severity: 'WARNING',
      message: `Event listener count unstable (variance: ${(analysis.eventListeners.variance * 100).toFixed(1)}%)`
    });
  }
  
  // Check documents
  if (!analysis.documents.stable) {
    issues.push({
      severity: 'CRITICAL',
      message: `Multiple documents detected (${analysis.documents.max}) - possible DOM leak`
    });
    passed = false;
  }
  
  return { passed, issues };
}

/**
 * Print detailed report
 */
function printReport(analysis, report) {
  console.log('\n' + '='.repeat(100));
  console.log('📊 MEMORY ANALYSIS REPORT');
  console.log('='.repeat(100));
  console.log('');
  
  // Test overview
  console.log('📋 Test Overview:');
  console.log(`   Duration: ${analysis.duration.toFixed(2)} hours`);
  console.log(`   Samples: ${analysis.samples}`);
  console.log(`   Sample Interval: ${(analysis.duration / analysis.samples * 60).toFixed(1)} minutes`);
  console.log('');
  
  // Baseline metrics
  console.log('📊 Baseline Metrics:');
  console.log(`   Initial Heap: ${analysis.baseline.heapUsed} MB`);
  console.log(`   Event Listeners: ${analysis.baseline.eventListeners}`);
  console.log(`   Documents: ${analysis.baseline.documents}`);
  console.log('');
  
  // Heap analysis
  console.log('💾 Heap Memory Analysis:');
  console.log(`   Final Growth: ${analysis.heap.finalGrowth.toFixed(2)} MB (threshold: ${THRESHOLDS.maxHeapGrowth} MB)`);
  console.log(`   Max Growth: ${analysis.heap.maxGrowth.toFixed(2)} MB`);
  console.log(`   Average Growth: ${analysis.heap.avgGrowth.toFixed(2)} MB`);
  console.log(`   Trend: ${analysis.heap.trend.toFixed(4)} MB/hour (threshold: ${THRESHOLDS.maxSlopePerHour} MB/hour)`);
  
  const heapStatus = analysis.heap.finalGrowth < THRESHOLDS.maxHeapGrowth && 
                     analysis.heap.trend < THRESHOLDS.maxSlopePerHour;
  console.log(`   Status: ${heapStatus ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  // Event listener analysis
  console.log('👂 Event Listener Analysis:');
  console.log(`   Baseline: ${analysis.eventListeners.baseline}`);
  console.log(`   Final: ${analysis.eventListeners.final}`);
  console.log(`   Variance: ${(analysis.eventListeners.variance * 100).toFixed(2)}% (threshold: ${THRESHOLDS.maxEventListenerVariance * 100}%)`);
  console.log(`   Status: ${analysis.eventListeners.stable ? '✅ STABLE' : '⚠️  UNSTABLE'}`);
  console.log('');
  
  // Document count analysis
  console.log('📄 Document Count Analysis:');
  console.log(`   Max Documents: ${analysis.documents.max} (expected: ${THRESHOLDS.maxDocumentCount})`);
  console.log(`   Status: ${analysis.documents.stable ? '✅ STABLE' : '❌ DOM LEAK'}`);
  console.log('');
  
  // Issues
  if (report.issues.length > 0) {
    console.log('⚠️  Issues Detected:');
    report.issues.forEach(issue => {
      const icon = issue.severity === 'CRITICAL' ? '❌' : '⚠️';
      console.log(`   ${icon} [${issue.severity}] ${issue.message}`);
    });
    console.log('');
  }
  
  // Final verdict
  console.log('='.repeat(100));
  if (report.passed) {
    console.log('✅ PASS: No memory leaks detected. Dashboard is production-ready.');
  } else {
    console.log('❌ FAIL: Memory leaks detected. Dashboard requires fixes before production.');
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
    console.error('❌ Error: No CSV file specified');
    console.log('');
    console.log('Usage: node test/analyze-memory-results.js <csv-file>');
    console.log('Example: node test/analyze-memory-results.js _bmad-output/test-results/memory-profile-2026-03-03.csv');
    process.exit(1);
  }
  
  const csvPath = args[0];
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Error: File not found: ${csvPath}`);
    process.exit(1);
  }
  
  console.log(`📄 Analyzing: ${csvPath}\n`);
  
  try {
    const data = parseCSV(csvPath);
    const analysis = analyzeMemory(data);
    const report = generateReport(analysis);
    
    printReport(analysis, report);
    
    // Exit with appropriate code
    process.exit(report.passed ? 0 : 1);
  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
    process.exit(1);
  }
}

// Run analysis
main();
