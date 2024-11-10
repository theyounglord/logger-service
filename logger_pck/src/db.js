// src/db.js
const { Sequelize, DataTypes } = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize(config.db.database, config.db.user, config.db.password, {
    host: config.db.host,
    dialect: 'postgres',
    port: config.db.port,
    logging: false,
});

const Log = sequelize.define('Log', {
    platform: { type: DataTypes.STRING },
    logType: { type: DataTypes.STRING },
    severity: { type: DataTypes.STRING },
    message: { type: DataTypes.TEXT },
    apiEndpoint: { type: DataTypes.STRING },
    metadata: { type: DataTypes.JSONB },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Function to ensure the Log table exists
async function ensureLogTableExists() {
    try {
        await sequelize.authenticate();
        await sequelize.sync(); // Creates table if it doesn't exist
        console.log('Database connected and Log table ensured.');
    } catch (error) {
        console.error('Database connection or table creation failed:', error.message);
    }
}

module.exports = { sequelize, Log, ensureLogTableExists };
