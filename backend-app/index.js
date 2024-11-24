// index.js
const express = require('express');
const { logMessage, logError, logWarning, logSuccess, logWithExecutionTime } = require('./utils');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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
        logSuccess('GET /test endpoint accessed', '/test', { method: 'GET' });
        res.send(result);
    } catch (error) {
        logError('Error accessing /test endpoint', '/test', { method: 'GET' });
        res.status(500).send('Error occurred');
    }
});

// Start the server and log a success message
app.listen(PORT, () => {
    logSuccess(`Server started on port ${PORT}`, '/start', { port: PORT });
    console.log(`Backend server running on http://localhost:${PORT}`);
});
