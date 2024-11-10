// src/api.js
const express = require('express');
const { Log } = require('./db');
const Sequelize = require('sequelize');
const app = express();
app.use(express.json());

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

module.exports = app;
