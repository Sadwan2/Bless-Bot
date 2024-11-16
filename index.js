const fs = require('fs').promises;
const readline = require('readline');
const chalk = require('chalk');

// Define colors and styles
const colors = {
  header: chalk.hex('#FFD700'),         // Soft golden yellow
  info: chalk.hex('#87CEEB'),           // Sky blue
  success: chalk.hex('#32CD32'),        // Light green
  error: chalk.hex('#FF6347'),          // Tomato red
  timestamp: chalk.hex('#4682B4'),      // Soft blue
  id: chalk.hex('#FF69B4'),             // Pink
  ip: chalk.hex('#9370DB'),             // Light purple
};

// Display header information
function displayHeader() {
  console.log(colors.header('╔════════════════════════════════════════════════════════════╗'));
  console.log(colors.header('║                   🌟 Blessing Assistant 🌟                  ║'));
  console.log(colors.header('║                  ✨ Author: @wew404                         ║'));
  console.log(colors.header('║                   🚀 Version: 1.0.0                        ║'));
  console.log(colors.header('║           🛠 Node Registration & Management Tool             ║'));
  console.log(colors.header('╚════════════════════════════════════════════════════════════╝'));
  console.log();
}

// Log timestamped messages
function logTimestamped(message, style = colors.info) {
  console.log(`${colors.timestamp(`[${new Date().toISOString()}]`)} ${style(message)}`);
}

// Load fetch module
async function loadFetch() {
  const fetch = await import('node-fetch').then(module => module.default);
  return fetch;
}

// Read node and hardware ID list
async function readNodeAndHardwareIds() {
  try {
    const data = await fs.readFile('id.txt', 'utf-8');
    const ids = data
      .trim()
      .split('\n')
      .filter(line => line)
      .map(line => {
        const [nodeId, hardwareId] = line.split(':');
        return { nodeId, hardwareId };
      });
    logTimestamped(`Loaded ${ids.length} node configurations.`, colors.info);
    return ids;
  } catch (error) {
    logTimestamped(`Failed to read node configuration file: ${error.message}`, colors.error);
    throw error;
  }
}

// Read authorization token
async function readAuthToken() {
  try {
    const data = await fs.readFile('user.txt', 'utf-8');
    return data.trim();
  } catch (error) {
    logTimestamped(`Failed to read authorization token: ${error.message}`, colors.error);
    throw error;
  }
}

// Get IP address
async function fetchIpAddress(fetch) {
  try {
    const response = await fetch('https://tight-block-2413.txlabs.workers.dev');
    const data = await response.json();
    logTimestamped(`Fetched IP address: ${colors.ip(data.ip)}`, colors.success);
    return data.ip;
  } catch (error) {
    logTimestamped(`Failed to fetch IP address: ${error.message}`, colors.error);
    throw error;
  }
}

// Register node
async function registerNode(fetch, nodeId, hardwareId, authToken, ipAddress) {
  const registerUrl = `https://gateway-run.bls.dev/api/v1/nodes/${nodeId}`;
  logTimestamped(`Registering node ${colors.id(nodeId)}, hardware ID: ${colors.id(hardwareId)}, IP address: ${colors.ip(ipAddress)}`, colors.info);

  try {
    const response = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ ipAddress, hardwareId }),
    });

    const data = await response.json();
    logTimestamped(`Node registration successful: ${JSON.stringify(data, null, 2)}`, colors.success);
    return data;
  } catch (error) {
    logTimestamped(`Node registration failed: ${error.message}`, colors.error);
    throw error;
  }
}

// Start session
async function startSession(fetch, nodeId, authToken) {
  const sessionUrl = `https://gateway-run.bls.dev/api/v1/nodes/${nodeId}/start-session`;
  logTimestamped(`Starting session: ${colors.id(nodeId)}`, colors.info);

  try {
    const response = await fetch(sessionUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();
    logTimestamped(`Session started successfully: ${JSON.stringify(data, null, 2)}`, colors.success);
    return data;
  } catch (error) {
    logTimestamped(`Failed to start session: ${error.message}`, colors.error);
    throw error;
  }
}

// Ping node
async function pingNode(fetch, nodeId, authToken) {
  const pingUrl = `https://gateway-run.bls.dev/api/v1/nodes/${nodeId}/ping`;
  logTimestamped(`Pinging node: ${colors.id(nodeId)}`, colors.info);

  try {
    const response = await fetch(pingUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();
    logTimestamped(`Ping successful: ${JSON.stringify(data, null, 2)}`, colors.success);
    return data;
  } catch (error) {
    logTimestamped(`Ping failed: ${error.message}`, colors.error);
    throw error;
  }
}

// Process single node
async function processNode(fetch, nodeId, hardwareId, authToken) {
  try {
    const ipAddress = await fetchIpAddress(fetch);
    await registerNode(fetch, nodeId, hardwareId, authToken, ipAddress);
    await startSession(fetch, nodeId, authToken);
    setInterval(() => pingNode(fetch, nodeId, authToken), 60 * 1000);
  } catch (error) {
    logTimestamped(`Failed to process node ${nodeId}: ${error.message}`, colors.error);
  }
}

// Main run function
async function run() {
  try {
    displayHeader();

    const fetch = await loadFetch();
    const authToken = await readAuthToken();
    const ids = await readNodeAndHardwareIds();

    await Promise.all(
      ids.map(id => processNode(fetch, id.nodeId, id.hardwareId, authToken))
    );
  } catch (error) {
    logTimestamped(`Run failed: ${error.message}`, colors.error);
  }
}

run();
