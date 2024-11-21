// src/logger-util.js
const { initializeLoggerService } = require('./index');
const { ensureLogTableExists } = require('./db');
const { log } = require('./logFunction');
const config = require('./config');

// Initialize logger service and ensure the Log table exists
async function initializeLogger() {
    try {
        await ensureLogTableExists(); // Ensure the log table exists
        await initializeLoggerService(config); // Initialize the logger service
        console.log('Logger service initialized successfully.');

        // Schedule file synchronization after logger is initialized
        const { syncFiles } = require('./fileSyncService');
        setInterval(syncFiles, config.syncFilesInterval);
    } catch (error) {
        console.error('Failed to initialize the logger service or ensure log table exists:', error.message);
    }
}

// Initialize logger on startup
initializeLogger();

module.exports = { log };