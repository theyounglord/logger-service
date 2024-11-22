// src/index.js
const { sequelize } = require('./db');
const api = require('./api');
const config = require('./config');
const { syncFailedLogs } = require('./sync');
const { ensureLogTableExists } = require('./db');

async function initializeLoggerService(customConfig = {}) {
    Object.assign(config, customConfig);

    await sequelize.authenticate();
    console.log(`Connected to database: ${config.db.database}`);

    await ensureLogTableExists(); // Ensure the Log table exists

    // Start API server for log viewing on any available port (port 0 lets OS assign a port)
    const server = api.listen(config.apiPort, () => {
        const assignedPort = server.address().port; // Retrieve the dynamically assigned port
        console.log(`API server started on port ${assignedPort}`);
    });

    // Sync any failed logs stored locally at startup
    syncFailedLogs();

    return { log: async (logData) => sequelize.models.Log.create(logData) };
}

module.exports = { initializeLoggerService };
