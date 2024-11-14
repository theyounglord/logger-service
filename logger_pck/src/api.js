// src/api.js
const express = require('express');
const { Log } = require('./db');
const Sequelize = require('sequelize');
const app = express();
const cors = require('cors');

app.use(cors({ origin: '*' }));

// Endpoint to retrieve logs (e.g., by platform, logType, date, apiEndpoint, sortBy, limit)
app.get('/logs', async (req, res) => {
    const { platform, logType, date, apiEndpoint, sortBy = 'createdAt', limit = 10 } = req.query;
    
    // Building an array for the `AND` conditions
    const conditions = [];

    if (platform) conditions.push({ platform });
    if (logType) conditions.push({ logType });
    if (date) conditions.push({ createdAt: { [Sequelize.Op.gte]: new Date(date) } });
    if (apiEndpoint) conditions.push({ apiEndpoint });

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
        res.status(500).json({ error: 'Failed to retrieve logs' });
    }
});

// create an api to get all the unique api endpoints of a platform
app.get('/apiendpoints', async (req, res) => {
    const { platform } = req.query;
    const options = {
        where: { platform },
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('apiEndpoint')), 'apiEndpoint']],
    };

    try {
        const apiEndpoints = await Log.findAll(options);
        res.json(apiEndpoints);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve API endpoints' });
    }
});

// create an api to get all the unique platforms
app.get('/platforms', async (req, res) => {
    try {
        const platforms = await Log.aggregate('platform', 'DISTINCT', { plain: false });
        res.json(platforms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve platforms' });
    }
});

// create an api to get all the unique log types
app.get('/logtypes', async (req, res) => {
    try {
        const logTypes = await Log.aggregate('logType', 'DISTINCT', { plain: false });
        res.json(logTypes);
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
