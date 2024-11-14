// src/index.js
const { sequelize } = require('./db');
const api = require('./api');
const config = require('./config');
const { syncFailedLogs } = require('./sync');

async function initializeLoggerService(customConfig = {}) {
    Object.assign(config, customConfig);

    await sequelize.authenticate();
    console.log(`Connected to database: ${config.db.database}`);

    // Start API server for log viewing
    api.listen(config.apiPort || 4000, () => {
        console.log(`Logger dashboard API server running on port ${config.apiPort}`);
    });

    // Sync any failed logs stored locally at startup
    syncFailedLogs();

    return { log: async (logData) => sequelize.models.Log.create(logData) };
}

module.exports = { initializeLoggerService };
