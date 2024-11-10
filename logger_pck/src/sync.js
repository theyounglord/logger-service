// src/sync.js
const fs = require('fs');
const { Log } = require('./db');
const config = require('./config');

async function syncFailedLogs() {
    if (!fs.existsSync(config.failedLogsPath)) return;

    const logs = fs.readFileSync(config.failedLogsPath, 'utf8').split('\n').filter(line => line);
    const remainingLogs = [];

    for (const line of logs) {
        let logData;
        try {
            logData = JSON.parse(line); // Parse each line as JSON
        } catch (error) {
            console.error('Malformed log entry found and skipped:', line);
            continue; // Skip malformed entries
        }

        try {
            await Log.create(logData); // Attempt to save log to the database
            console.log('Synced log to database:', logData.message);
        } catch (error) {
            console.error('Failed to sync log:', error.message);
            remainingLogs.push(line); // Retain logs that couldn't be synced
        }
    }

    // Rewrite file with logs that still need syncing
    fs.writeFileSync(config.failedLogsPath, remainingLogs.join('\n'));
}

// Schedule syncing 
setInterval(syncFailedLogs, config.syncInterval);

module.exports = { syncFailedLogs };
