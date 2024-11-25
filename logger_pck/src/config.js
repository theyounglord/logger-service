// src/config.js
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const os = require('os');
const userPath = os.homedir(); // add \AppData\Roaming\ajnavidya-iti\data

// Get path for failed logs from environment or use default
const FAILED_LOGS_PATH = process.env.UNSYNCED_LOGS_PATH || path.join(__dirname, '../logs/unsynced_logs.json');
const localSystemPath = process.env.ROOT_FOLDER_PATH ;

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
    // add logger port if not found then 0
    loggerPort: parseInt(process.env.LOGGER_PORT, 10) || 0,
    environment: process.env.NODE_ENV || 'development',
    localAppSyncEnabled: process.env.LOCAL_APP_SYNC_ENABLED === 'true',
    apiPort: (parseInt(process.env.PORT, 10) || 4000) + 1,
    dashboardUrl: process.env.DASHBOARD_URL,
    applicationName: process.env.APPLICATION_NAME,
    failedLogsPath: FAILED_LOGS_PATH,
    syncInterval: parseInt(process.env.SYNC_INTERVAL, 10) || 60000, // Default to 1 minute if not specified
    rootFolderPath: userPath + localSystemPath,
    syncFilesInterval: parseInt(process.env.SYNC_FILES_INTERVAL, 10) || 300000, // Default to 5 minutes
};

module.exports = config;
