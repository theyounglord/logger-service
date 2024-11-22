// index.js
const express = require('express');
const { logMessage, logError, logWarning, logSuccess, logWithExecutionTime } = require('./utils');
require('dotenv').config();

const app = express();
const PORT = 0; // Set to 0 to dynamically assign an available port

// Example function to demonstrate logging within a custom function
async function exampleFunction(param) {
    // Simulate some processing
    await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
    return `Processed: ${param}`;
}

// Wrap `exampleFunction` with `logWithExecutionTime`
// Use severity 'medium' and specify the endpoint or function name
const loggedExampleFunction = logWithExecutionTime(exampleFunction, 'exampleFunction', 'medium', '/exampleFunction');

// Define a test endpoint to log execution time of `loggedExampleFunction`
app.get('/test', async (req, res) => {
    try {
        const result = await loggedExampleFunction('test param');
        logSuccess({
            message: 'Successfully processed test param',
            apiEndpoint: '/test',
            metadata: { result },
        });
        res.send(result);
    } catch (error) {
        logError({
            message: 'An error occurred while processing test param',
            apiEndpoint: '/test',
            metadata: { error: error.message },
        });
        res.status(500).send('Error occurred');
    }
});

// Start the server and log a success message with the dynamically assigned port
const server = app.listen(PORT, () => {
    const assignedPort = server.address().port;
    logSuccess({
        message: `Backend server running on http://localhost:${assignedPort}`,
        apiEndpoint: '/',
    });
    console.log(`Backend server running on http://localhost:${assignedPort}`);
});