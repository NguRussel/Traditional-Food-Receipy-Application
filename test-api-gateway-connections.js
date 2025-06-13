#!/usr/bin/env node

/**
 * API Gateway Connection Test Script
 * Tests all microservice connections through the API Gateway
 */

const axios = require('axios');

const API_GATEWAY_URL = 'http://localhost:8000';
const INDIVIDUAL_SERVICES = [
  { name: 'User Service', port: 8002 },
  { name: 'Recipe Service', port: 8001 },
  { name: 'Chef Service', port: 8003 },
  { name: 'Review Service', port: 8004 },
  { name: 'Media Service', port: 8005 },
  { name: 'Recommendation Service', port: 8006 },
  { name: 'Regional Service', port: 8007 },
  { name: 'Notification Service', port: 8008 },
  { name: 'Scanner Service', port: 8009 },
  { name: 'AI Assistant Service', port: 8010 },
  { name: 'Analytics Service', port: 8011 },
  { name: 'Admin Service', port: 8012 },
  { name: 'Meal Planner Service', port: 8013 }
];

const GATEWAY_ROUTES = [
  'users', 'recipes', 'chefs', 'reviews', 'media', 
  'recommendations', 'regional', 'notifications', 
  'scanner', 'ai-assistant', 'analytics', 'admin', 'meal-plans'
];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(url, description) {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    log(`✅ ${description} - Status: ${response.status}`, 'green');
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    const status = error.response ? error.response.status : 'No Response';
    log(`❌ ${description} - Status: ${status} - Error: ${error.message}`, 'red');
    return { success: false, status, error: error.message };
  }
}

async function testAPIGatewayHealth() {
  log('\n🔍 Testing API Gateway Health...', 'blue');
  return await testEndpoint(`${API_GATEWAY_URL}/health`, 'API Gateway Health Check');
}

async function testAPIGatewayStatus() {
  log('\n📊 Testing API Gateway Service Status...', 'blue');
  return await testEndpoint(`${API_GATEWAY_URL}/api/v1/status`, 'API Gateway Service Status');
}

async function testIndividualServices() {
  log('\n🏥 Testing Individual Service Health Checks...', 'blue');
  const results = [];
  
  for (const service of INDIVIDUAL_SERVICES) {
    const result = await testEndpoint(
      `http://localhost:${service.port}/health`, 
      `${service.name} Direct Health Check`
    );
    results.push({ service: service.name, ...result });
  }
  
  return results;
}

async function testGatewayRouting() {
  log('\n🌐 Testing API Gateway Routing...', 'blue');
  const results = [];
  
  for (const route of GATEWAY_ROUTES) {
    const result = await testEndpoint(
      `${API_GATEWAY_URL}/api/v1/${route}`, 
      `Gateway Route: /api/v1/${route}`
    );
    results.push({ route, ...result });
  }
  
  return results;
}

async function generateReport(gatewayHealth, gatewayStatus, individualServices, gatewayRouting) {
  log('\n📋 CONNECTION TEST REPORT', 'bold');
  log('=' .repeat(50), 'blue');
  
  // API Gateway Status
  log(`\n🚀 API Gateway Status:`, 'yellow');
  log(`   Health Check: ${gatewayHealth.success ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
  log(`   Service Status: ${gatewayStatus.success ? '✅ ACCESSIBLE' : '❌ INACCESSIBLE'}`);
  
  // Individual Services Summary
  const healthyServices = individualServices.filter(s => s.success).length;
  const totalServices = individualServices.length;
  log(`\n🏥 Individual Services: ${healthyServices}/${totalServices} HEALTHY`, 'yellow');
  
  individualServices.forEach(service => {
    const status = service.success ? '✅' : '❌';
    log(`   ${status} ${service.service}`);
  });
  
  // Gateway Routing Summary
  const workingRoutes = gatewayRouting.filter(r => r.success || (r.status && r.status !== 'No Response')).length;
  const totalRoutes = gatewayRouting.length;
  log(`\n🌐 Gateway Routing: ${workingRoutes}/${totalRoutes} ACCESSIBLE`, 'yellow');
  
  gatewayRouting.forEach(route => {
    const status = route.success ? '✅' : (route.status && route.status !== 'No Response' ? '⚠️' : '❌');
    log(`   ${status} /api/v1/${route.route} (${route.status || 'No Response'})`);
  });
  
  // Overall Status
  const overallHealthy = gatewayHealth.success && healthyServices === totalServices;
  log(`\n🎯 OVERALL STATUS: ${overallHealthy ? '✅ ALL SYSTEMS OPERATIONAL' : '⚠️ SOME ISSUES DETECTED'}`, 'bold');
  
  if (!overallHealthy) {
    log('\n📝 TROUBLESHOOTING TIPS:', 'yellow');
    log('   1. Ensure all services are running: docker-compose ps');
    log('   2. Check service logs: docker-compose logs [service-name]');
    log('   3. Verify MongoDB and Redis are running');
    log('   4. Check network connectivity between services');
  }
  
  log('\n' + '=' .repeat(50), 'blue');
}

async function runTests() {
  log('🚀 AFRI-PLATES API Gateway Connection Test', 'bold');
  log('Testing all microservice connections...\n', 'blue');
  
  try {
    // Run all tests
    const gatewayHealth = await testAPIGatewayHealth();
    const gatewayStatus = await testAPIGatewayStatus();
    const individualServices = await testIndividualServices();
    const gatewayRouting = await testGatewayRouting();
    
    // Generate comprehensive report
    await generateReport(gatewayHealth, gatewayStatus, individualServices, gatewayRouting);
    
  } catch (error) {
    log(`\n💥 Test execution failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Check if axios is available
try {
  require('axios');
} catch (error) {
  log('❌ axios is required. Install with: npm install axios', 'red');
  process.exit(1);
}

// Run the tests
if (require.main === module) {
  runTests().catch(error => {
    log(`\n💥 Unexpected error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint }; 