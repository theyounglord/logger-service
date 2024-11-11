// src/logger-util.js
const { initializeLoggerService } = require('./index');
const { Log, ensureLogTableExists } = require('./db');
const config = require('./config');
const fs = require('fs');
// use uid  
const { v4: uuidv4 } = require('uuid');
let logger;
let isTableReady = false; // Flag to check if the log table is ready

// Initialize logger service and ensure the Log table exists
async function initializeLogger() {
    try {
        await ensureLogTableExists(); // Ensure the log table exists
        isTableReady = true; // Set flag to indicate the table is ready
        logger = await initializeLoggerService(config); // Initialize the logger service
        console.log('Logger service initialized successfully.');
    } catch (error) {
        console.error('Failed to initialize the logger service or ensure log table exists:', error.message);
    }
}

// Save failed logs locally
function saveFailedLogLocally(logData) {
    try {
        fs.appendFileSync(config.failedLogsPath, JSON.stringify(logData) + '\n');
        console.log('Log saved locally due to database error');
    } catch (error) {
        console.error('Failed to save log locally:', error);
    }
}

// Main log function
async function log({ platform, logType, message, severity, apiEndpoint, metadata = {}, jsondata = {}, transactionId }) {
    const logData = {
        environment: config.enviornment,
        platform : config.applicationName,
        logType,
        severity,
        apiEndpoint,
        message,
        metadata: { ...metadata, timestamp: new Date().toISOString() },
        jsondata: { ...jsondata, timestamp: new Date().toISOString() },
        transactionId : transactionId || uuidv4(),
    };

    if (logger && logger.log) {
        try {
            await logger.log(logData);
            console.log('Log saved to database');
        } catch (error) {
            console.error('Failed to log to database:', error.message);
            saveFailedLogLocally(logData);
        }
    } else {
        console.warn('Logger not initialized. Logging locally:', message);
        saveFailedLogLocally(logData);
    }
}

// Initialize logger on startup
initializeLogger();

module.exports = { log };