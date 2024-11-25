const fs = require('fs');
const path = require('path');
const config = require('./config');
const { log } = require('./logFunction');

async function syncFiles() {

    const isLocalAppSyncEnabled = config.localAppSyncEnabled;
    if (!isLocalAppSyncEnabled) {
        console.warn('Local app sync is not enabled, skipping file synchronization.');
        return;
    }

    const rootFolder = config.rootFolderPath;

    try {
        if (!fs.existsSync(rootFolder)) {
            console.warn(`Root folder not found: ${rootFolder}`);
            return;
        }

        const userFolders = fs.readdirSync(rootFolder);

        for (const userId of userFolders) {
            const userFolderPath = path.join(rootFolder, userId);

            if (!fs.existsSync(userFolderPath) || !fs.statSync(userFolderPath).isDirectory()) {
                console.warn(`Skipping invalid or missing folder: ${userFolderPath}`);
                continue;
            }

            const appFolders = fs.readdirSync(userFolderPath);

            for (const appId of appFolders) {
                const appFolderPath = path.join(userFolderPath, appId);

                if (!fs.existsSync(appFolderPath) || !fs.statSync(appFolderPath).isDirectory()) {
                    console.warn(`Skipping invalid or missing folder: ${appFolderPath}`);
                    continue;
                }

                const files = fs.readdirSync(appFolderPath);

                for (const file of files) {
                    const filePath = path.join(appFolderPath, file);

                    if (!fs.existsSync(filePath)) {
                        console.warn(`File not found, skipping: ${filePath}`);
                        continue;
                    }

                    if (file.endsWith('.report.json')) {
                        await processReportFile(filePath, userId, appId);
                    } else if (file.endsWith('.session.json')) {
                        await processSessionFile(filePath, userId, appId);
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Error during file synchronization:`, error);
    }
}

async function processReportFile(filePath, userId, appId) {
    try {
        if (!fs.existsSync(filePath)) {
            console.warn(`Report file not found, skipping: ${filePath}`);
            return;
        }

        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);

        if (jsonData.synced === true) {
            console.log(`File ${filePath} already synced, skipping.`);
            return;
        }

        // Process the report data
        await log({
            logType: 'report',
            message: `Report data from user ${userId}, app ${appId}`,
            severity: 'info',
            apiEndpoint: '/logSessionData',
            metadata: { userId, appId },
            jsondata: jsonData, // Directly pass the entire JSON content
        });

        // Add 'synced: true' to the JSON data
        jsonData.synced = true;

        // Write the updated JSON back to the file
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
        console.log(`File ${filePath} synced and updated.`);
    } catch (error) {
        console.error(`Error processing report file ${filePath}:`, error);
    }
}

async function processSessionFile(filePath, userId, appId) {
    try {
        if (!fs.existsSync(filePath)) {
            console.warn(`Session file not found, skipping: ${filePath}`);
            return;
        }

        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);

        await log({
            logType: 'session',
            message: `Session data from user ${userId}, app ${appId}`,
            severity: 'info',
            apiEndpoint: '/logSessionData',
            metadata: { userId, appId },
            jsondata: jsonData, // Directly pass the entire JSON content
        });

        // Delete the file after successful logging
        fs.unlinkSync(filePath);
        console.log(`File ${filePath} logged and deleted.`);
    } catch (error) {
        console.error(`Error processing session file ${filePath}:`, error);
    }
}

module.exports = { syncFiles };