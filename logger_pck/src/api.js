// src/api.js
const express = require('express');
const { Log } = require('./db');
const Sequelize = require('sequelize');
const app = express();
const cors = require('cors');
const { syncFiles } = require('./fileSyncService');

app.use(cors({ origin: '*' }));

// Route to trigger file synchronization manually
app.post('/syncDataNow', async (req, res) => {
    try {
        await syncFiles();
        res.status(200).json({ message: 'Data synchronization triggered successfully.' });
    } catch (error) {
        console.error('Error triggering data synchronization:', error);
        res.status(500).json({ error: 'Failed to trigger data synchronization.' });
    }
});

// Endpoint to retrieve logs (e.g., by platform, logType, date, apiEndpoint, sortBy, limit)
app.get('/logs', async (req, res) => {
    const {
        platform,
        logType,
        date,
        apiEndpoint,
        severity,
        userEmail,
        lastNMinutes,
        sortBy = 'createdAt',
        limit = 10
    } = req.query;
    // const { date } = req.body;

    // Building an array for the `AND` conditions
    const conditions = [];

    if (platform) conditions.push({ platform });
    if (logType) conditions.push({ logType });
    if (apiEndpoint) conditions.push({ apiEndpoint });
    if (severity) conditions.push({ severity });
    if (userEmail) conditions.push({ userEmail });

    // Handle `date` filter
    if (date) {
        conditions.push({ createdAt: { [Sequelize.Op.gte]: new Date(date) } });
    }

    // Handle `lastNMinutes` filter
    if (lastNMinutes) {
        const minutesAgo = new Date(Date.now() - parseInt(lastNMinutes) * 60000);
        conditions.push({ createdAt: { [Sequelize.Op.gte]: minutesAgo } });
    }

    const where = conditions.length ? { [Sequelize.Op.and]: conditions } : {};

    // Setting the order and limit options
    const options = {
        where,
        order: [[sortBy, 'DESC']], // Sort by createdAt or updatedAt, default to DESC
        limit: parseInt(limit),    // Convert limit to an integer
    };

    try {
        const logs = await Log.findAll(options);
        res.json(logs);
    } catch (error) {
        console.error('Error retrieving logs:', error); // Debugging log
        res.status(500).json({ error: 'Failed to retrieve logs', details: error.message });
    }
});

// create an API to get all unique API endpoints by platform or all if no platform specified
app.get('/apiendpoints', async (req, res) => {
    const { platform } = req.query;

    try {
        const where = platform ? { platform } : {}; // Filter by platform if provided
        const apiEndpoints = await Log.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('apiEndpoint')), 'apiEndpoint']],
            where,
        });

        // Add "All Endpoints" as the first entry and filter out empty or invalid values
        const result = ['All Endpoints', ...apiEndpoints.map(endpoint => endpoint.get('apiEndpoint')).filter(Boolean)];

        res.json(result); // Return an array of unique API endpoints with "All Endpoints"
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve API endpoints' });
    }
});


// Updated API to get all unique platforms with log counts and last log severity
app.get('/platforms', async (req, res) => {
    try {
        const platforms = await Log.findAll({
            attributes: [
                [Sequelize.col('platform'), 'DISTINCT'],
                [Sequelize.fn('COUNT', Sequelize.col('platform')), 'LOGCOUNT'],
                // Get the severity of the last log by ordering by createdAt and limiting to 1
                [Sequelize.literal(`(
                    SELECT "severity"
                    FROM "Logs" AS "LastLog"
                    WHERE "LastLog"."platform" = "Log"."platform"
                    ORDER BY "LastLog"."createdAt" DESC
                    LIMIT 1
                )`), 'lastSeverity']
            ],
            group: ['platform']
        });

        res.json(platforms.map(platform => ({
            DISTINCT: platform.get('DISTINCT'),
            LOGCOUNT: platform.get('LOGCOUNT'),
            lastSeverity: platform.get('lastSeverity')
        })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve platforms with log counts and last log severity' });
    }
});

// create an API to get all the unique log types by platform, or all if no platform specified
// Updated API to get all unique log types by platform or all if no platform is provided
app.get('/logtypes', async (req, res) => {
    const { platform } = req.query;

    try {
        const where = platform ? { platform } : {}; // Filter by platform if provided
        const logTypes = await Log.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('logType')), 'logType']],
            where,
        });

        // Add "All Types" as the first entry and filter out empty values
        const result = ['All Types', ...logTypes.map(type => type.get('logType')).filter(Boolean)];

        res.json(result); // Return an array of unique log types with "All Types"
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve log types' });
    }
});



// create an api to get last n unique transactionIds
app.get('/transactionids', async (req, res) => {
    const { limit = 10 } = req.query;

    try {
        const transactionIds = await Log.findAll({
            attributes: [
                [Sequelize.literal('DISTINCT ON ("transactionId") "transactionId"'), 'transactionId']
            ],
            order: [['transactionId', 'ASC'], ['createdAt', 'DESC']],
            limit: parseInt(limit),
        });

        res.json(transactionIds.map(item => item.transactionId));
    } catch (error) {
        console.log("Error message:", error.message);
        res.status(500).json({ error: 'Failed to retrieve transaction IDs' });
    }
});



// create an api to get all the logs based on the trasaction id
app.get('/logs/:transactionId', async (req, res) => {
    const { transactionId } = req.params;

    try {
        const logs = await Log.findAll({ where: { transactionId } });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve logs' });
    }
});

module.exports = app;
