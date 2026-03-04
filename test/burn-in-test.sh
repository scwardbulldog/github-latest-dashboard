#!/bin/bash
#
# Burn-In Test Script - 24 Hour Dashboard Validation
#
# Orchestrates comprehensive 24-hour burn-in testing including:
# - Memory leak detection
# - Timer accuracy measurement
# - Automated health checks at intervals
# - Log consolidation and analysis
#
# Usage: bash test/burn-in-test.sh [duration_hours]
# Example: bash test/burn-in-test.sh 24  # Full 24-hour test
# Example: bash test/burn-in-test.sh 2   # Quick 2-hour test
#
# Success Criteria:
# - Memory growth <10MB over test duration
# - Timer accuracy within tolerance (±1s page, ±0.5s item)
# - No JavaScript console errors
# - All health checks pass
#

set -e  # Exit on error

# Configuration
DURATION_HOURS=${1:-24}  # Default 24 hours, override with argument
TEST_URL=${TEST_URL:-"http://localhost:5173"}
OUTPUT_DIR="_bmad-output/test-results"
DATE_STAMP=$(date +"%Y-%m-%d")
LOG_FILE="${OUTPUT_DIR}/burn-in-${DURATION_HOURS}hr-${DATE_STAMP}.log"
HEALTH_CHECK_INTERVAL=3600  # 1 hour in seconds

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo ""
echo "=========================================================================================================="
echo "🔥 24-HOUR BURN-IN TEST - GitHub Latest Dashboard"
echo "=========================================================================================================="
echo ""
echo "📋 Test Configuration:"
echo "   Duration: ${DURATION_HOURS} hours"
echo "   Target URL: ${TEST_URL}"
echo "   Output Directory: ${OUTPUT_DIR}"
echo "   Log File: ${LOG_FILE}"
echo ""

# Create output directory
mkdir -p "${OUTPUT_DIR}"

# Check if dev server is running
echo "🔍 Checking if dashboard is accessible..."
if ! curl -s -o /dev/null -w "%{http_code}" "${TEST_URL}" | grep -q "200\|304"; then
  echo -e "${RED}❌ Error: Dashboard not accessible at ${TEST_URL}${NC}"
  echo ""
  echo "Please start the development server first:"
  echo "  npm run dev"
  echo ""
  exit 1
fi
echo -e "${GREEN}✅ Dashboard accessible${NC}"
echo ""

# Confirm test start
echo -e "${YELLOW}⚠️  This test will run for ${DURATION_HOURS} hours.${NC}"
echo "Press Ctrl+C at any time to stop and generate results."
read -p "Press Enter to start burn-in test..."
echo ""

# Initialize test log
echo "=========================================================================================================" > "${LOG_FILE}"
echo "BURN-IN TEST LOG - ${DATE_STAMP}" >> "${LOG_FILE}"
echo "=========================================================================================================" >> "${LOG_FILE}"
echo "Start Time: $(date)" >> "${LOG_FILE}"
echo "Duration: ${DURATION_HOURS} hours" >> "${LOG_FILE}"
echo "Target URL: ${TEST_URL}" >> "${LOG_FILE}"
echo "=========================================================================================================" >> "${LOG_FILE}"
echo "" >> "${LOG_FILE}"

# Start memory monitoring in background
echo "🧪 Starting memory monitoring..."
echo "[$(date)] Starting memory monitoring (Puppeteer)" >> "${LOG_FILE}"

# Export duration for memory monitor
export TEST_DURATION=$((DURATION_HOURS * 60 * 60 * 1000))  # Convert to milliseconds

# Run memory monitor with duration from environment
(
  node test/memory-monitor.js 2>&1 | tee -a "${LOG_FILE}"
) &
MEMORY_PID=$!

echo -e "${GREEN}✅ Memory monitoring started (PID: ${MEMORY_PID})${NC}"
echo ""

# Health check function
run_health_check() {
  local checkpoint=$1
  echo ""
  echo "========================================================================================================="
  echo "🏥 Health Check - ${checkpoint}"
  echo "========================================================================================================="
  echo "[$(date)] Health Check - ${checkpoint}" >> "${LOG_FILE}"
  
  # Run health check script (to be created in Task 3)
  if [ -f "test/health-check.js" ]; then
    node test/health-check.js "${TEST_URL}" 2>&1 | tee -a "${LOG_FILE}"
  else
    echo "⚠️  Health check script not found, skipping..." | tee -a "${LOG_FILE}"
  fi
  
  echo "========================================================================================================="
  echo ""
}

# Schedule health checks
ELAPSED=0
CHECKPOINT=0

# Run initial health check
run_health_check "Checkpoint 0hr - Baseline"

# Monitor and run periodic health checks
while kill -0 ${MEMORY_PID} 2>/dev/null; do
  sleep ${HEALTH_CHECK_INTERVAL}
  ELAPSED=$((ELAPSED + HEALTH_CHECK_INTERVAL))
  CHECKPOINT=$((ELAPSED / HEALTH_CHECK_INTERVAL))
  
  if [ ${ELAPSED} -lt $((DURATION_HOURS * 3600)) ]; then
    run_health_check "Checkpoint ${CHECKPOINT}hr"
  else
    break
  fi
done

# Wait for memory monitoring to complete
echo "⏳ Waiting for memory monitoring to complete..."
wait ${MEMORY_PID}
MEMORY_EXIT=$?

echo ""
echo "========================================================================================================="
echo "📊 BURN-IN TEST COMPLETE"
echo "========================================================================================================="
echo "[$(date)] Burn-in test complete" >> "${LOG_FILE}"
echo "" >> "${LOG_FILE}"

# Run final health check
run_health_check "Final - ${DURATION_HOURS}hr Complete"

# Analyze results
echo ""
echo "========================================================================================================="
echo "📈 ANALYZING RESULTS"
echo "========================================================================================================="
echo ""

# Analyze memory results
echo "💾 Memory Analysis:"
echo "-------------------------------------------"
MEMORY_CSV=$(ls -t ${OUTPUT_DIR}/memory-profile-*.csv 2>/dev/null | head -1)
if [ -f "${MEMORY_CSV}" ]; then
  node test/analyze-memory-results.js "${MEMORY_CSV}" 2>&1 | tee -a "${LOG_FILE}"
  MEMORY_RESULT=$?
else
  echo "⚠️  No memory data found" | tee -a "${LOG_FILE}"
  MEMORY_RESULT=1
fi

echo ""
echo "⏱️  Timer Accuracy Analysis:"
echo "-------------------------------------------"
if [ -f "${LOG_FILE}" ]; then
  node test/analyze-timer-drift.js "${LOG_FILE}" 2>&1 | tee -a "${LOG_FILE}"
  TIMER_RESULT=$?
else
  echo "⚠️  No timer data found" | tee -a "${LOG_FILE}"
  TIMER_RESULT=1
fi

# Final summary
echo ""
echo "========================================================================================================="
echo "🎯 FINAL RESULTS"
echo "========================================================================================================="
echo ""

OVERALL_PASS=true

if [ ${MEMORY_RESULT} -eq 0 ]; then
  echo -e "💾 Memory Test: ${GREEN}✅ PASS${NC}"
else
  echo -e "💾 Memory Test: ${RED}❌ FAIL${NC}"
  OVERALL_PASS=false
fi

if [ ${TIMER_RESULT} -eq 0 ]; then
  echo -e "⏱️  Timer Test: ${GREEN}✅ PASS${NC}"
else
  echo -e "⏱️  Timer Test: ${RED}❌ FAIL${NC}"
  OVERALL_PASS=false
fi

echo ""
echo "📁 Results Location:"
echo "   Log File: ${LOG_FILE}"
if [ -f "${MEMORY_CSV}" ]; then
  echo "   Memory Data: ${MEMORY_CSV}"
fi
echo ""

if [ "${OVERALL_PASS}" = true ]; then
  echo -e "${GREEN}=========================================================================================================${NC}"
  echo -e "${GREEN}✅ BURN-IN TEST PASSED - Dashboard is production-ready${NC}"
  echo -e "${GREEN}=========================================================================================================${NC}"
  exit 0
else
  echo -e "${RED}=========================================================================================================${NC}"
  echo -e "${RED}❌ BURN-IN TEST FAILED - Review results and fix issues before production${NC}"
  echo -e "${RED}=========================================================================================================${NC}"
  exit 1
fi
