// src/config.js
require('dotenv').config();
const path = require('path');
const fs = require('fs');

// Get path for failed logs from environment or use default
const FAILED_LOGS_PATH = process.env.UNSYNCED_LOGS_PATH || path.join(__dirname, '../logs/unsynced_logs.json');

// Ensure the logs directory exists
if (!fs.existsSync(path.dirname(FAILED_LOGS_PATH))) {
    fs.mkdirSync(path.dirname(FAILED_LOGS_PATH), { recursive: true });
}

const config = {
    db: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    },
    apiPort: (parseInt(process.env.PORT, 10) || 4000) + 1,
    dashboardUrl: process.env.DASHBOARD_URL,
    applicationName: process.env.APPLICATION_NAME,
    failedLogsPath: FAILED_LOGS_PATH,
    syncInterval: parseInt(process.env.SYNC_INTERVAL, 10) || 60000, // Default to 1 minute if not specified
};

module.exports = config;