const fs = require('fs').promises;
const { HttpsProxyAgent } = require('https-proxy-agent');
const chalk = require('chalk');
const readline = require('readline');
const config = require('./config');

// API base URL and IP service URLs
const apiBaseUrl = "https://gateway-run.bls.dev/api/v1";
const ipServiceUrls = [
    "https://tight-block-2413.txlabs.workers.dev", 
    "https://api64.ipify.org?format=json"        
];
let useProxy;

// Colors and logging utility
const colors = {
    header: chalk.hex('#FFD700'),
    info: chalk.hex('#87CEEB'),
    success: chalk.hex('#32CD32'),
    error: chalk.hex('#FF6347'),
    timestamp: chalk.hex('#4682B4'),
    id: chalk.hex('#FF69B4'),
    ip: chalk.hex('#9370DB'),
};

function logTimestamped(message, style = colors.info) {
    console.log(`${colors.timestamp(`[${new Date().toISOString()}]`)} ${style(message)}`);
}

// Display header
function displayHeader() {
    console.log(colors.header('╔════════════════════════════════════════╗'));
    console.log(colors.header('║      🎀  Blessing Assistant Bless-Bot 🎀       ║'));
    console.log(colors.header('║     🐱 Written by: @qklxsqf                  ║'));
    console.log(colors.header('║  🎉 Telegram Channel: https://t.me/ksqxszq     ║'));
    console.log(colors.header('╚════════════════════════════════════════╝'));
    console.log();
}

// Prompt user to use proxy
async function promptUseProxy() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => {
        rl.question('Do you want to use a proxy? (y/n): ', answer => {
            rl.close();
            resolve(answer.trim().toLowerCase() === 'y');
        });
    });
}

// Load fetch module
async function loadFetch() {
    const fetch = await import('node-fetch').then(module => module.default);
    return fetch;
}

// Fetch IP address with fallback service
async function fetchIpAddressWithFallback(fetch, agent) {
    for (const url of ipServiceUrls) {
        try {
            const response = await fetch(url, { agent });
            const data = await response.json();
            logTimestamped(`Obtained IP Address: ${colors.ip(data.ip)} from ${url}`, colors.success);
            return data.ip;
        } catch (error) {
            logTimestamped(`Failed to get IP from service ${url}: ${error.message}`, colors.error);
        }
    }
    throw new Error("All IP services are unavailable");
}

// Register node
async function registerNode(nodeId, hardwareId, ipAddress, proxy, authToken) {
    const fetch = await loadFetch();
    const agent = proxy ? new HttpsProxyAgent(proxy) : null;
    const registerUrl = `${apiBaseUrl}/nodes/${nodeId}`;

    logTimestamped(`Registering node: ${colors.id(nodeId)}, IP: ${colors.ip(ipAddress)}, Hardware ID: ${hardwareId}`, colors.info);
    try {
        const response = await fetch(registerUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ ipAddress, hardwareId }),
            agent,
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
async function startSession(nodeId, proxy, authToken) {
    const fetch = await loadFetch();
    const agent = proxy ? new HttpsProxyAgent(proxy) : null;
    const sessionUrl = `${apiBaseUrl}/nodes/${nodeId}/start-session`;

    logTimestamped(`Starting session: ${colors.id(nodeId)}`, colors.info);
    try {
        const response = await fetch(sessionUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            agent,
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
async function pingNode(nodeId, proxy, ipAddress, authToken) {
    const fetch = await loadFetch();
    const agent = proxy ? new HttpsProxyAgent(proxy) : null;
    const pingUrl = `${apiBaseUrl}/nodes/${nodeId}/ping`;

    logTimestamped(`Pinging node: ${colors.id(nodeId)}`, colors.info);
    try {
        const response = await fetch(pingUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            agent,
        });
        const data = await response.json();
        logTimestamped(`Ping successful: ${JSON.stringify(data, null, 2)}`, colors.success);
        return data;
    } catch (error) {
        logTimestamped(`Ping failed: ${error.message}`, colors.error);
        throw error;
    }
}

// Recursive ping of node
async function keepPinging(nodeId, proxy, ipAddress, authToken) {
    try {
        await pingNode(nodeId, proxy, ipAddress, authToken);
    } catch (error) {
        logTimestamped(`Ping failed: ${error.message}`, colors.error);
    } finally {
        setTimeout(() => keepPinging(nodeId, proxy, ipAddress, authToken), 60000);
    }
}

// Infinite loop to process nodes
async function processNode(node, proxy, ipAddress, authToken) {
    while (true) {
        try {
            logTimestamped(`Processing node: ${colors.id(node.nodeId)}, Hardware ID: ${node.hardwareId}, IP: ${ipAddress}`, colors.info);

            const registrationResponse = await registerNode(node.nodeId, node.hardwareId, ipAddress, proxy, authToken);
            logTimestamped(`Node registration completed: ${JSON.stringify(registrationResponse, null, 2)}`, colors.success);

            const startSessionResponse = await startSession(node.nodeId, proxy, authToken);
            logTimestamped(`Session started: ${JSON.stringify(startSessionResponse, null, 2)}`, colors.success);

            keepPinging(node.nodeId, proxy, ipAddress, authToken);

            break; 
        } catch (error) {
            logTimestamped(`Node ${node.nodeId} processing failed, retrying: ${error.message}`, colors.error);
            await new Promise(res => setTimeout(res, 5000)); 
        }
    }
}

async function runAll(initialRun = true) {
    try {
        if (initialRun) {
            displayHeader();
            useProxy = await promptUseProxy();
            logTimestamped(`Using proxy: ${useProxy ? 'Yes' : 'No'}`, colors.info);
        }

        for (const user of config) {
            for (const node of user.nodes) {
                try {
                    const proxy = useProxy ? node.proxy : null;
                    const ipAddress = useProxy
                        ? await fetchIpAddressWithFallback(await loadFetch(), proxy ? new HttpsProxyAgent(proxy) : null)
                        : null;

                    await processNode(node, proxy, ipAddress, user.usertoken);
                } catch (error) {
                    logTimestamped(`Node ${node.nodeId} processing failed, skipping: ${error.message}`, colors.error);
                }
            }
        }
    } catch (error) {
        logTimestamped(`Run failed: ${error.message}`, colors.error);
    }
}

process.on('uncaughtException', (error) => {
    logTimestamped(`Uncaught exception: ${error.message}`, colors.error);
    setTimeout(() => runAll(false), 5000); // Restart after 5 seconds
});

runAll();
