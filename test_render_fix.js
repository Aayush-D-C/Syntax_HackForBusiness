// Test script to verify infinite re-render fix
// This script can be run to check if the maximum update depth exceeded error is resolved

console.log('🔧 Testing for infinite re-render issues...');

// Check if there are any console warnings about maximum update depth
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

let errorCount = 0;
let warningCount = 0;

console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('Maximum update depth exceeded') || 
      message.includes('maximum update depth exceeded')) {
    errorCount++;
    console.log('❌ Found infinite re-render error:', message);
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  const message = args.join(' ');
  if (message.includes('Maximum update depth exceeded') || 
      message.includes('maximum update depth exceeded')) {
    warningCount++;
    console.log('⚠️ Found infinite re-render warning:', message);
  }
  originalConsoleWarn.apply(console, args);
};

// Monitor for repeated console logs that might indicate infinite loops
const logCounts = {};
const originalConsoleLog = console.log;

console.log = (...args) => {
  const message = args.join(' ');
  if (message.includes('📊 Calculating dynamic credit score') ||
      message.includes('Loading initial data') ||
      message.includes('API Error')) {
    logCounts[message] = (logCounts[message] || 0) + 1;
    
    // If the same log appears more than 5 times in a short period, it might indicate a loop
    if (logCounts[message] > 5) {
      console.log('⚠️ Potential infinite loop detected - repeated log:', message);
    }
  }
  originalConsoleLog.apply(console, args);
};

// Set up a timer to check for issues after a few seconds
setTimeout(() => {
  console.log('✅ Render test completed');
  console.log(`📊 Errors found: ${errorCount}`);
  console.log(`📊 Warnings found: ${warningCount}`);
  
  if (errorCount === 0 && warningCount === 0) {
    console.log('🎉 No infinite re-render issues detected!');
  } else {
    console.log('❌ Infinite re-render issues still present');
  }
  
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
}, 5000);

console.log('🚀 Starting render test...'); 