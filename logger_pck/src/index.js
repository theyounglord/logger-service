const { sequelize } = require('./db');
const api = require('./api');
const config = require('./config');
const { syncFailedLogs } = require('./sync');

async function initializeLoggerService(customConfig = {}) {
    Object.assign(config, customConfig);

    await sequelize.authenticate();
    console.log(`Connected to database: ${config.db.database}`);

    // Start API server on any available port
    const server = api.listen(0, () => {
        const port = server.address().port;
        console.log(`Logger dashboard API server running on available port ${port}`);
    });
 
    // Sync any failed logs stored locally at startup
    syncFailedLogs();

    return { log: async (logData) => sequelize.models.Log.create(logData) };
}

module.exports = { initializeLoggerService };
