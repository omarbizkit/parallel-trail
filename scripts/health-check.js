#!/usr/bin/env node

/**
 * Health check script for Docker container
 * Checks if the application is responding correctly
 */

const http = require('http');
const port = process.env.PORT || 8080;
const host = 'localhost';

const options = {
  hostname: host,
  port: port,
  path: '/',
  method: 'GET',
  timeout: 5000,
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Health check passed');
    process.exit(0);
  } else {
    console.error(`❌ Health check failed: HTTP ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.error(`❌ Health check failed: ${err.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Health check timed out');
  req.destroy();
  process.exit(1);
});

req.end();