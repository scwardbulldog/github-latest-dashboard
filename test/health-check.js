/**
 * Dashboard Health Check Script
 * 
 * Automated health verification for burn-in testing.
 * Checks if dashboard is functioning correctly (timers running,
 * data loaded, no console errors).
 * 
 * Usage: node test/health-check.js [url]
 * Example: node test/health-check.js http://localhost:5173
 * 
 * Exit Codes:
 * 0 - All checks passed
 * 1 - One or more checks failed
 */

import puppeteer from 'puppeteer';

const TEST_URL = process.argv[2] || 'http://localhost:5173';

/**
 * Run comprehensive health checks
 */
async function healthCheck() {
  console.log(`🏥 Running health checks on ${TEST_URL}...`);
  console.log('');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Collect console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({ text: msg.text(), location: msg.location() });
    }
  });
  
  page.on('pageerror', error => {
    errors.push({ text: error.message, stack: error.stack });
  });
  
  try {
    // Navigate to dashboard
    console.log('📍 Navigating to dashboard...');
    await page.goto(TEST_URL, { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    console.log('✅ Page loaded');
    console.log('');
    
    // Wait a bit for initialization
    await page.waitForTimeout(2000);
    
    // Check 1: Page structure exists
    console.log('1️⃣  Checking page structure...');
    const structure = await page.evaluate(() => {
      const blogPage = document.getElementById('page-blog');
      const changelogPage = document.getElementById('page-changelog');
      const statusPage = document.getElementById('page-status');
      const progressBar = document.getElementById('progressBar');
      
      return {
        blogExists: !!blogPage,
        changelogExists: !!changelogPage,
        statusExists: !!statusPage,
        progressBarExists: !!progressBar,
        activePage: !!document.querySelector('.carousel-page.active')
      };
    });
    
    if (structure.blogExists && structure.changelogExists && structure.statusExists) {
      console.log('   ✅ All pages exist');
    } else {
      console.log('   ❌ Missing page elements');
      console.log(`      Blog: ${structure.blogExists}, Changelog: ${structure.changelogExists}, Status: ${structure.statusExists}`);
    }
    
    if (structure.progressBarExists) {
      console.log('   ✅ Progress bar exists');
    } else {
      console.log('   ⚠️  Progress bar not found');
    }
    
    if (structure.activePage) {
      console.log('   ✅ Active page detected');
    } else {
      console.log('   ❌ No active page');
    }
    console.log('');
    
    // Check 2: Data loaded
    console.log('2️⃣  Checking data availability...');
    const dataStatus = await page.evaluate(() => {
      const blogItems = document.querySelectorAll('#page-blog .list-item');
      const changelogItems = document.querySelectorAll('#page-changelog .list-item');
      
      return {
        blogCount: blogItems.length,
        changelogCount: changelogItems.length,
        hasData: blogItems.length > 0 || changelogItems.length > 0
      };
    });
    
    if (dataStatus.hasData) {
      console.log('   ✅ Data loaded');
      console.log(`      Blog items: ${dataStatus.blogCount}, Changelog items: ${dataStatus.changelogCount}`);
    } else {
      console.log('   ⚠️  No data loaded (may be loading or API issue)');
    }
    console.log('');
    
    // Check 3: Timers functioning (observe for 10 seconds)
    console.log('3️⃣  Checking timer activity...');
    console.log('   ⏳ Observing for 10 seconds...');
    
    const initialState = await page.evaluate(() => ({
      progressWidth: document.getElementById('progressBar')?.style.width || '0%',
      highlightedItem: document.querySelector('.list-item--highlighted')?.textContent?.substring(0,30) || 'none'
    }));
    
    await page.waitForTimeout(10000);
    
    const laterState = await page.evaluate(() => ({
      progressWidth: document.getElementById('progressBar')?.style.width || '0%',
      highlightedItem: document.querySelector('.list-item--highlighted')?.textContent?.substring(0,30) || 'none'
    }));
    
    const progressChanged = initialState.progressWidth !== laterState.progressWidth;
    const highlightChanged = initialState.highlightedItem !== laterState.highlightedItem;
    
    if (progressChanged) {
      console.log('   ✅ Carousel timer active (progress bar changed)');
    } else {
      console.log('   ⚠️  Carousel timer may be inactive (progress bar unchanged)');
    }
    
    if (highlightChanged) {
      console.log('   ✅ Item highlighter active (highlight changed)');
    } else {
      console.log('   ⚠️  Item highlighter may be inactive (highlight unchanged)');
    }
    console.log('');
    
    // Check 4: Network status indicator
    console.log('4️⃣  Checking network status indicator...');
    const networkStatus = await page.evaluate(() => {
      const liveDot = document.querySelector('.live-dot');
      if (!liveDot) return { exists: false, offline: false };
      
      const isOffline = liveDot.classList.contains('offline');
      return { exists: true, offline: isOffline };
    });
    
    if (networkStatus.exists) {
      console.log('   ✅ Network indicator exists');
      console.log(`      Status: ${networkStatus.offline ? 'OFFLINE ⚠️' : 'ONLINE ✅'}`);
    } else {
      console.log('   ⚠️  Network indicator not found');
    }
    console.log('');
    
    // Check 5: Console errors
    console.log('5️⃣  Checking for JavaScript errors...');
    if (errors.length === 0) {
      console.log('   ✅ No console errors detected');
    } else {
      console.log(`   ❌ ${errors.length} console errors detected:`);
      errors.slice(0, 5).forEach((err, i) => {
        console.log(`      ${i + 1}. ${err.text.substring(0, 100)}`);
      });
      if (errors.length > 5) {
        console.log(`      ... and ${errors.length - 5} more`);
      }
    }
    console.log('');
    
    // Overall assessment
    console.log('========================================================================================================');
    const issues = [];
    if (!structure.blogExists || !structure.changelogExists || !structure.statusExists) {
      issues.push('Missing page elements');
    }
    if (!structure.activePage) {
      issues.push('No active page');
    }
    if (!dataStatus.hasData) {
      issues.push('No data loaded (may be acceptable at startup)');
    }
    if (!progressChanged && !highlightChanged) {
      issues.push('Timers appear inactive');
    }
    if (errors.length > 0) {
      issues.push(`${errors.length} console errors`);
    }
    
    if (issues.length === 0) {
      console.log('✅ HEALTH CHECK PASSED - Dashboard functioning normally');
      await browser.close();
      return 0;
    } else {
      console.log('⚠️  HEALTH CHECK WARNINGS:');
      issues.forEach(issue => console.log(`   - ${issue}`));
      
      const critical = issues.some(i => 
        i.includes('Missing page') || 
        i.includes('No active page') || 
        i.includes('Timers appear inactive')
      );
      
      if (critical) {
        console.log('');
        console.log('❌ CRITICAL ISSUES DETECTED - Dashboard may not be functioning correctly');
        await browser.close();
        return 1;
      } else {
        console.log('');
        console.log('⚠️  NON-CRITICAL ISSUES - Dashboard functioning but with warnings');
        await browser.close();
        return 0;
      }
    }
  } catch (error) {
    console.error('❌ Health check failed with error:', error.message);
    await browser.close();
    return 1;
  }
}

// Run health check
healthCheck()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
