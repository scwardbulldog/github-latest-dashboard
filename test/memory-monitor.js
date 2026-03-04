/**
 * Memory Leak Detection Tool - 24 Hour Burn-In Test
 * 
 * Uses Puppeteer and Chrome DevTools Protocol to monitor memory usage
 * over 24+ hours. Logs heap size, event listeners, and document count
 * every 5 minutes to detect memory leaks.
 * 
 * Usage: npm run test:memory
 * 
 * Success Criteria:
 * - Initial heap: ~15-25MB (including Chromium overhead)
 * - Acceptable growth: <10MB over 24 hours
 * - Event listeners: Should remain constant (no accumulation)
 * - Documents: Should remain at 1 (no orphaned DOMs)
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  url: process.env.TEST_URL || 'http://localhost:5173',
  interval: 5 * 60 * 1000, // 5 minutes
  duration: process.env.TEST_DURATION ? parseInt(process.env.TEST_DURATION) : (24 * 60 * 60 * 1000), // 24 hours default
  outputDir: path.join(__dirname, '../_bmad-output/test-results'),
  logFile: `memory-profile-${new Date().toISOString().split('T')[0]}.csv`
};

/**
 * Initialize output directory and CSV file
 */
function initializeOutput() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
  
  const csvPath = path.join(CONFIG.outputDir, CONFIG.logFile);
  const headers = 'timestamp,elapsed_hours,heap_used_mb,heap_limit_mb,heap_total_mb,documents,event_listeners,nodes,js_heap_growth_mb\n';
  fs.writeFileSync(csvPath, headers);
  
  return csvPath;
}

/**
 * Get memory metrics from browser
 */
async function getMemoryMetrics(page) {
  const metrics = await page.metrics();
  const memory = await page.evaluate(() => {
    if (performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        totalJSHeapSize: performance.memory.totalJSHeapSize
      };
    }
    return null;
  });
  
  return {
    heapUsed: memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0,
    heapLimit: memory ? Math.round(memory.jsHeapSizeLimit / 1024 / 1024) : 0,
    heapTotal: memory ? Math.round(memory.totalJSHeapSize / 1024 / 1024) : 0,
    documents: metrics.Documents || 0,
    jsEventListeners: metrics.JSEventListeners || 0,
    nodes: metrics.Nodes || 0
  };
}

/**
 * Log memory snapshot to console and CSV
 */
function logSnapshot(csvPath, startTime, baselineHeap, metrics) {
  const elapsed = Date.now() - startTime;
  const elapsedHours = (elapsed / (1000 * 60 * 60)).toFixed(2);
  const heapGrowth = metrics.heapUsed - baselineHeap;
  
  const timestamp = new Date().toISOString();
  const logLine = `${timestamp},${elapsedHours},${metrics.heapUsed},${metrics.heapLimit},${metrics.heapTotal},${metrics.documents},${metrics.jsEventListeners},${metrics.nodes},${heapGrowth}\n`;
  
  fs.appendFileSync(csvPath, logLine);
  
  console.log('\n' + '='.repeat(80));
  console.log(`📊 Memory Snapshot - ${timestamp}`);
  console.log('='.repeat(80));
  console.log(`⏱️  Elapsed: ${elapsedHours} hours`);
  console.log(`💾 Heap Used: ${metrics.heapUsed} MB (baseline: ${baselineHeap} MB)`);
  console.log(`📈 Heap Growth: ${heapGrowth} MB`);
  console.log(`🎯 Heap Limit: ${metrics.heapLimit} MB`);
  console.log(`📄 Documents: ${metrics.documents}`);
  console.log(`👂 Event Listeners: ${metrics.jsEventListeners}`);
  console.log(`🔗 DOM Nodes: ${metrics.nodes}`);
  
  // Warning indicators
  if (heapGrowth > 10) {
    console.log(`⚠️  WARNING: Heap growth exceeds 10MB threshold (${heapGrowth} MB)`);
  }
  if (metrics.documents > 1) {
    console.log(`⚠️  WARNING: Multiple documents detected (${metrics.documents}) - possible DOM leak`);
  }
  console.log('='.repeat(80) + '\n');
}

/**
 * Check for console errors
 */
async function setupConsoleMonitoring(page) {
  const errors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const error = {
        timestamp: new Date().toISOString(),
        text: msg.text(),
        location: msg.location()
      };
      errors.push(error);
      console.log(`❌ Console Error: ${error.text}`);
    }
  });
  
  page.on('pageerror', error => {
    const errorObj = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack
    };
    errors.push(errorObj);
    console.log(`❌ Page Error: ${error.message}`);
  });
  
  return errors;
}

/**
 * Generate summary report
 */
function generateSummary(csvPath, startTime, errors) {
  const elapsed = (Date.now() - startTime) / (1000 * 60 * 60);
  const data = fs.readFileSync(csvPath, 'utf8').split('\n').slice(1).filter(line => line);
  
  if (data.length === 0) {
    console.log('⚠️  No data collected');
    return;
  }
  
  const rows = data.map(line => {
    const values = line.split(',');
    return {
      heapGrowth: parseFloat(values[8])
    };
  });
  
  const finalGrowth = rows[rows.length - 1].heapGrowth;
  const maxGrowth = Math.max(...rows.map(r => r.heapGrowth));
  
  console.log('\n' + '='.repeat(80));
  console.log('📋 MEMORY MONITORING SUMMARY');
  console.log('='.repeat(80));
  console.log(`⏱️  Test Duration: ${elapsed.toFixed(2)} hours`);
  console.log(`📊 Total Snapshots: ${data.length}`);
  console.log(`📈 Final Heap Growth: ${finalGrowth} MB`);
  console.log(`📈 Max Heap Growth: ${maxGrowth} MB`);
  console.log(`❌ Console Errors: ${errors.length}`);
  console.log('');
  
  // Pass/Fail determination
  const passed = finalGrowth < 10 && maxGrowth < 15;
  if (passed) {
    console.log('✅ PASS: Memory usage within acceptable limits');
  } else {
    console.log('❌ FAIL: Memory leak detected');
    if (finalGrowth >= 10) {
      console.log(`   - Final heap growth (${finalGrowth} MB) exceeds 10MB threshold`);
    }
    if (maxGrowth >= 15) {
      console.log(`   - Max heap growth (${maxGrowth} MB) exceeds 15MB threshold`);
    }
  }
  
  console.log('='.repeat(80) + '\n');
  console.log(`📁 Full results saved to: ${csvPath}`);
}

/**
 * Main monitoring function
 */
async function monitorMemory() {
  console.log('🚀 Starting 24-hour memory monitoring...');
  console.log(`📍 URL: ${CONFIG.url}`);
  console.log(`⏱️  Sample Interval: ${CONFIG.interval / 1000 / 60} minutes`);
  console.log(`⏱️  Duration: ${CONFIG.duration / 1000 / 60 / 60} hours`);
  console.log('');
  
  const csvPath = initializeOutput();
  console.log(`📁 Logging to: ${csvPath}\n`);
  
  // Launch browser
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  const errors = await setupConsoleMonitoring(page);
  
  // Navigate to dashboard
  console.log(`🌐 Loading ${CONFIG.url}...`);
  await page.goto(CONFIG.url, { waitUntil: 'networkidle2' });
  console.log('✅ Dashboard loaded\n');
  
  const startTime = Date.now();
  
  // Get baseline measurement
  const baselineMetrics = await getMemoryMetrics(page);
  const baselineHeap = baselineMetrics.heapUsed;
  console.log(`📊 Baseline heap size: ${baselineHeap} MB\n`);
  
  // Log initial snapshot
  logSnapshot(csvPath, startTime, baselineHeap, baselineMetrics);
  
  // Monitor loop
  while (Date.now() - startTime < CONFIG.duration) {
    await new Promise(resolve => setTimeout(resolve, CONFIG.interval));
    
    const metrics = await getMemoryMetrics(page);
    logSnapshot(csvPath, startTime, baselineHeap, metrics);
  }
  
  // Generate summary
  generateSummary(csvPath, startTime, errors);
  
  await browser.close();
  console.log('✅ Memory monitoring complete');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️  Interrupted by user. Generating summary...');
  process.exit(0);
});

// Run monitoring
monitorMemory().catch(error => {
  console.error('❌ Error during memory monitoring:', error);
  process.exit(1);
});
