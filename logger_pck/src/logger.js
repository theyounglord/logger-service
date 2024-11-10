const winston = require('winston');
const { Log } = require('./db');
const fs = require('fs');
const path = require('path');
const unsyncedLogsPath = path.join(__dirname, '../logs/unsynced_logs.json');

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/app.log' }),
    ],
});

async function log({ platform, logType, message, metadata = {} }) {
    try {
        await Log.create({ platform, date: new Date(), logType, message, metadata });
        logger.info(`Logged to DB: ${message}`);
    } catch (error) {
        logger.error(`DB logging failed: ${error.message}`);
        fs.appendFileSync(unsyncedLogsPath, JSON.stringify({ platform, logType, message, metadata }) + '\n');
    }
}

module.exports = { log };
