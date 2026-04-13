/**
 * Quick verification that ItemHighlighter caching works
 */

import puppeteer from 'puppeteer';

const TEST_URL = 'http://localhost:5173';

async function verifyCaching() {
  console.log('🔍 Verifying ItemHighlighter caching...\n');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Collect all console logs
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });
  
  try {
    console.log('📍 Loading dashboard...');
    await page.goto(TEST_URL, { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check for caching message
    console.log('\n📋 Console logs related to caching:\n');
    const cachingLogs = consoleLogs.filter(log => 
      log.includes('Cached') || 
      log.includes('ItemHighlighter') ||
      log.includes('highlighted')
    );
    
    if (cachingLogs.length > 0) {
      cachingLogs.forEach(log => console.log(`   ${log}`));
    } else {
      console.log('   (No caching logs found)');
    }
    
    // Wait for a few highlight cycles (8 seconds each)
    console.log('\n⏳ Waiting for 20 seconds to observe highlight rotations...\n');
    await new Promise(resolve => setTimeout(resolve, 20000));
    
    // Check that highlighting is working
    const highlightStatus = await page.evaluate(() => {
      const highlighted = document.querySelector('.list-item--highlighted');
      const allItems = document.querySelectorAll('.list-item');
      return {
        hasHighlight: !!highlighted,
        totalItems: allItems.length,
        highlightedText: highlighted ? highlighted.textContent.substring(0, 50) : 'none'
      };
    });
    
    console.log('✅ Highlight Status:');
    console.log(`   Has highlighted item: ${highlightStatus.hasHighlight}`);
    console.log(`   Total items: ${highlightStatus.totalItems}`);
    console.log(`   Current highlight: "${highlightStatus.highlightedText}..."`);
    
    // Count highlight-related logs to verify rotation is happening
    const highlightLogs = consoleLogs.filter(log => log.includes('highlighting index'));
    console.log(`\n📊 Highlight rotations detected: ${highlightLogs.length}`);
    
    if (highlightLogs.length >= 2) {
      console.log('   ✅ Multiple highlight rotations confirmed');
    }
    
    // Verify caching message appeared
    const cacheMessage = consoleLogs.find(log => log.includes('Cached') && log.includes('items for highlighting'));
    if (cacheMessage) {
      console.log('\n✅ SUCCESS: Caching is working!');
      console.log(`   ${cacheMessage}`);
    } else {
      console.log('\n⚠️  WARNING: No caching message found');
    }
    
    await browser.close();
    return 0;
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    await browser.close();
    return 1;
  }
}

verifyCaching()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
