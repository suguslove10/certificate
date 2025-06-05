const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');
const portScanner = require('node-port-scanner');

const WEBSERVER_DATA_PATH = path.join(__dirname, '../data/webserver-data.json');

// Initialize filesystem
fs.ensureFileSync(WEBSERVER_DATA_PATH);
if (!fs.readFileSync(WEBSERVER_DATA_PATH).toString()) {
  fs.writeJSONSync(WEBSERVER_DATA_PATH, {
    lastScan: null,
    detections: []
  }, { spaces: 2 });
}

/**
 * Get process info by port
 */
async function getProcessByPort(port) {
  try {
    const { stdout } = await exec(`lsof -i :${port} -P -n -sTCP:LISTEN`);
    
    if (!stdout.trim()) {
      return null;
    }
    
    const lines = stdout.trim().split('\n');
    // Skip header
    if (lines.length < 2) {
      return null;
    }
    
    // Parse the first process entry
    const parts = lines[1].split(/\s+/);
    const processName = parts[0];
    const pid = parts[1];
    
    return { processName, pid };
  } catch (error) {
    console.error(`Failed to get process for port ${port}:`, error);
    return null;
  }
}

/**
 * Get web server identity from running processes
 */
async function identifyWebServer(port, processInfo) {
  if (!processInfo) {
    return null;
  }
  
  let serverType = 'unknown';
  let serverVersion = 'unknown';
  
  const { processName, pid } = processInfo;
  
  // Try to identify common web servers
  const lcProcessName = processName.toLowerCase();
  
  if (lcProcessName === 'nginx') {
    serverType = 'nginx';
    try {
      const { stdout } = await exec('nginx -v 2>&1');
      const match = stdout.match(/nginx\/(\d+\.\d+\.\d+)/);
      if (match) {
        serverVersion = match[1];
      }
    } catch (error) {
      console.error('Failed to get nginx version:', error);
    }
  } else if (lcProcessName === 'apache2' || lcProcessName === 'httpd') {
    serverType = 'apache';
    try {
      const { stdout } = await exec('apachectl -v');
      const match = stdout.match(/Apache\/(\d+\.\d+\.\d+)/);
      if (match) {
        serverVersion = match[1];
      }
    } catch (error) {
      console.error('Failed to get apache version:', error);
    }
  } else if (lcProcessName === 'node') {
    serverType = 'node.js';
    try {
      // Try to determine if it's Express, Koa, etc.
      const { stdout } = await exec(`ps -p ${pid} -o command=`);
      if (stdout.includes('express')) {
        serverType = 'express.js';
      } else if (stdout.includes('koa')) {
        serverType = 'koa.js';
      } else if (stdout.includes('hapi')) {
        serverType = 'hapi.js';
      } else if (stdout.includes('next')) {
        serverType = 'next.js';
      }
      
      // Get Node.js version
      const { stdout: nodeVersion } = await exec('node -v');
      serverVersion = nodeVersion.trim();
    } catch (error) {
      console.error('Failed to identify Node.js server type:', error);
    }
  }
  
  return {
    port,
    processName,
    pid,
    serverType,
    serverVersion
  };
}

/**
 * Scan for common web server ports
 */
async function scanPorts() {
  const commonPorts = [80, 443, 3000, 8000, 8080, 8443];
  
  try {
    const results = await portScanner('127.0.0.1', commonPorts);
    return {
      open: results.ports.open,
      closed: results.ports.closed
    };
  } catch (error) {
    console.error('Port scanning error:', error);
    return { open: [], closed: commonPorts };
  }
}

/**
 * Check HTTP response from a web server
 */
async function checkHttpResponse(port, secure = false) {
  const protocol = secure ? 'https' : 'http';
  const url = `${protocol}://localhost:${port}`;
  
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      timeout: 3000,
    });
    
    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error) {
    console.error(`Failed to check ${url}:`, error);
    return null;
  }
}

/**
 * Detect web servers on the system
 */
async function detectWebServers() {
  const scanResults = await scanPorts();
  const detections = [];
  
  for (const port of scanResults.open) {
    const processInfo = await getProcessByPort(port);
    if (processInfo) {
      const serverInfo = await identifyWebServer(port, processInfo);
      if (serverInfo) {
        const isSecure = port === 443 || port === 8443;
        const httpResponse = await checkHttpResponse(port, isSecure);
        
        detections.push({
          ...serverInfo,
          isSecure,
          httpResponse,
          detectedAt: new Date().toISOString()
        });
      }
    }
  }
  
  // Save the detection results
  const data = {
    lastScan: new Date().toISOString(),
    detections
  };
  
  await fs.writeJSON(WEBSERVER_DATA_PATH, data, { spaces: 2 });
  
  return detections;
}

/**
 * Get the last web server detection results
 */
async function getWebServerDetections() {
  try {
    return await fs.readJSON(WEBSERVER_DATA_PATH);
  } catch (error) {
    console.error('Error reading web server detections:', error);
    return {
      lastScan: null,
      detections: []
    };
  }
}

module.exports = {
  detectWebServers,
  getWebServerDetections,
  scanPorts
}; 