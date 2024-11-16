const fs = require('fs');
const readline = require('readline');
const crypto = require('crypto');

// Randomly generate public key
function generatePubKey(length = 52) {
    const prefix = "12D3KooW";
    const remainingLength = length - prefix.length;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return prefix + Array.from({ length: remainingLength }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');
}

// Randomly generate Mac device information
function generateMacDeviceInfo() {
    const macModels = ['MacBookPro15,1', 'MacBookAir10,1', 'MacMini9,1', 'iMac20,1', 'MacPro7,1'];
    const macOSVersions = ['macOS 12.6 Monterey', 'macOS 13.0 Ventura', 'macOS 11.7 Big Sur'];
    const cpuTypes = ['Apple M1', 'Apple M2', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9'];
    const memoryOptions = [8, 16, 32, 64];
    const storageOptions = [256, 512, 1024, 2048];
    const screenResolutions = ['2560x1600', '2880x1800', '3072x1920'];

    const model = macModels[Math.floor(Math.random() * macModels.length)];
    const macOS = macOSVersions[Math.floor(Math.random() * macOSVersions.length)];
    const cpu = cpuTypes[Math.floor(Math.random() * cpuTypes.length)];
    const memory = memoryOptions[Math.floor(Math.random() * memoryOptions.length)];
    const storage = storageOptions[Math.floor(Math.random() * storageOptions.length)];
    const resolution = screenResolutions[Math.floor(Math.random() * screenResolutions.length)];
    const battery = `${Math.floor(Math.random() * 100)}%`;
    const publicKey = generatePubKey();

    const hardwareInfo = {
        model,
        macOS,
        cpu,
        memory: `${memory}GB`,
        storage: `${storage}GB`,
        resolution,
        battery,
        retina: resolution === '2560x1600' || resolution === '2880x1800',
    };

    const hardwareID = generateHardwareID(hardwareInfo);

    return {
        ...hardwareInfo,
        publicKey,
        hardwareID,
    };
}

// Generate hardware ID based on hardware information
function generateHardwareID(hardwareInfo) {
    const hardwareString = JSON.stringify(hardwareInfo);
    const hash = crypto.createHash('sha256');
    hash.update(hardwareString);
    return hash.digest('hex');
}

// Save data to file
function saveToFile(filename, data) {
    try {
        fs.writeFileSync(filename, data);
        console.log(`✅ Data saved to ${filename}`);
    } catch (error) {
        console.error(`❌ Failed to save to file: ${error.message}`);
    }
}

// Main function
function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Enter the number of Mac devices to generate: ', (answer) => {
        const total = parseInt(answer, 10);

        if (isNaN(total) || total <= 0) {
            console.error('❌ Please enter a valid device number!');
            rl.close();
            return;
        }

        let output = '';
        console.log(`Starting to generate ${total} Mac device information...\n`);

        for (let i = 0; i < total; i++) {
            const deviceInfo = generateMacDeviceInfo();
            console.log(`Device ${i + 1}:\n`, deviceInfo);

            output += `Device ${i + 1}:\n${JSON.stringify(deviceInfo, null, 2)}\n\n`;
        }

        saveToFile('mac_devices.txt', output);
        rl.close();
    });
}

main();
