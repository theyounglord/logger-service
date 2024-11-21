// src/logFunction.js
const { Log } = require('./db');
const config = require('./config');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Helper function to save failed logs locally
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
        environment: config.environment,
        platform: platform || config.applicationName,
        logType,
        severity,
        apiEndpoint,
        message,
        metadata: { ...metadata, timestamp: new Date().toISOString() },
        jsondata: { ...jsondata, timestamp: new Date().toISOString() },
        transactionId: transactionId || uuidv4(),
    };

    try {
        await Log.create(logData);
        console.log('Log saved to database');
    } catch (error) {
        console.error('Failed to log to database:', error.message);
        saveFailedLogLocally(logData);
    }
}

module.exports = { log };
