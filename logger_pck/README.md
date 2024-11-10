# Logger PCK

A robust logging package with database integration and local storage fallback, allowing flexible logging for applications. This package is designed to log messages to a PostgreSQL database and automatically save logs locally if there’s a database failure, ensuring that no log data is lost.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Basic Logging](#basic-logging)
  - [Logging Execution Time for Functions](#logging-execution-time-for-functions)
  - [Using with Express Routes](#using-with-express-routes)
- [Advanced Usage](#advanced-usage)
  - [Syncing Failed Logs to Database](#syncing-failed-logs-to-database)
  - [Accessing Logs via the API Server](#accessing-logs-via-the-api-server)
- [Error Handling and Troubleshooting](#error-handling-and-troubleshooting)
- [License](#license)

## Features

- **Database Logging**: Logs messages to a PostgreSQL database for centralized, persistent logging.
- **Local Fallback**: If the database is unreachable, logs are stored locally in JSON format and automatically retried for syncing at configurable intervals.
- **Multiple Log Types and Severity Levels**: Supports various log levels (`info`, `error`, `warning`, `success`) and severity levels (`low`, `medium`, `high`) for flexible categorization.
- **Execution Time Logging**: Provides a utility for logging the execution time of functions or routes, helping to monitor performance and identify bottlenecks.
- **API Endpoint and Metadata Tracking**: Logs include structured metadata, API endpoint tracking, and function name identification for better traceability.
- **API Server for Log Access**: Includes an optional Express-based API server for viewing, filtering, and managing logs.
- **Environment Configuration**: Fully configurable via environment variables, allowing easy setup and customization for different environments.

## Installation

Install the package using npm:

```bash
npm install logger_pck
```

## Configuration

### Step 1: Set Up PostgreSQL Database

Ensure you have PostgreSQL installed and a database created for logging. You can create a new database using:

```sql
CREATE DATABASE logger;
```

### Step 2: Configure Environment Variables

Create a `.env` file in your project root directory and set the following variables:

```plaintext
PORT=3000
DB_USER=postgres          # Use 'postgres' as the user to match the owner
DB_HOST=localhost
DB_NAME=logger            # Ensure DB_NAME is set to 'logger'
DB_PASSWORD=testbucket8600
DB_PORT=5432
DASHBOARD_URL=http://localhost:3000
APPLICATION_NAME=testapp
UNSYNCED_LOGS_PATH=./logs/unsynced_logs.json  # Specify path for unsynced logs
SYNC_INTERVAL=60000  # Sync interval in milliseconds (1 minute = 60000 ms)
```

## Usage

### Basic Logging

To log messages, import the `logMessage` function and call it with your message and metadata.

```javascript
const { logMessage } = require('logger_pck/src/utils');

logMessage('This is an informational message', 'info', { userId: 123 });
logMessage('An error occurred', 'error', { error: 'File not found' });
```

### Logging Execution Time for Functions

You can log the execution time of any function by wrapping it with `logWithExecutionTime`.

```javascript
const { logWithExecutionTime } = require('logger_pck/src/utils');

async function fetchData() {
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return 'Data fetched successfully';
}

const loggedFetchData = logWithExecutionTime(fetchData, 'fetchData');
loggedFetchData();
```

This will log the start time, end time, and total execution time of `fetchData`.

### Using with Express Routes

To log the execution time of an Express route, use `logWithExecutionTime` to wrap the route handler:

```javascript
const express = require('express');
const { logWithExecutionTime } = require('logger_pck/src/utils');

const app = express();

app.get('/test', logWithExecutionTime(async (req, res) => {
    res.send('This is a test endpoint');
}, '/test'));

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
```

## Advanced Usage
You can use this comlte util also in your project
```javascript
// src/utils.js
const { log } = require('logger_pck/src/logger-util');

/**
 * Logs a custom message with metadata.
 * @param {String} message - The log message.
 * @param {String} logType - The type of log (e.g., 'info', 'error', 'success').
 * @param {String} apiEndpoint - The API endpoint or function associated with the log.
 * @param {String} severity - The severity level (e.g., 'low', 'medium', 'high').
 * @param {Object} metadata - Additional metadata for the log.
 */
function logMessage(message, logType = 'info', apiEndpoint = '', severity = 'low', metadata = {}) {
    log({
        logType,
        message,
        severity,
        apiEndpoint,
        metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
        },
    });
}

/**
 * Logs an error message.
 * @param {String} message - The error message.
 * @param {String} apiEndpoint - The API endpoint associated with the log.
 * @param {Object} metadata - Additional metadata for the log.
 */
function logError(message, apiEndpoint = '', metadata = {}) {
    logMessage(message, 'error', apiEndpoint, 'high', metadata);
}

/**
 * Logs a warning message.
 * @param {String} message - The warning message.
 * @param {String} apiEndpoint - The API endpoint associated with the log.
 * @param {Object} metadata - Additional metadata for the log.
 */
function logWarning(message, apiEndpoint = '', metadata = {}) {
    logMessage(message, 'warning', apiEndpoint, 'medium', metadata);
}

/**
 * Logs a success message.
 * @param {String} message - The success message.
 * @param {String} apiEndpoint - The API endpoint associated with the log.
 * @param {Object} metadata - Additional metadata for the log.
 */
function logSuccess(message, apiEndpoint = '', metadata = {}) {
    logMessage(message, 'success', apiEndpoint, 'low', metadata);
}

/**
 * Wraps a function to log its execution time and custom message.
 * @param {Function} func - The function to be wrapped.
 * @param {String} functionName - The name of the function being logged.
 * @param {String} severity - The severity level for execution log (default is 'low').
 * @param {String} apiEndpoint - The API endpoint or function associated with the log.
 * @returns {Function} - A new function that logs execution time and calls the original function.
 */
function logWithExecutionTime(func, functionName, severity = 'low', apiEndpoint = '') {
    return async function (...args) {
        const startTime = Date.now();
        let result;

        try {
            // Call the original function and store the result
            result = await func(...args);
        } catch (error) {
            // Log an error if the function throws an exception
            logError(`Error in ${functionName}: ${error.message}`, apiEndpoint, { functionName });
            throw error; // Re-throw the error after logging
        } finally {
            const endTime = Date.now();
            const executionTime = endTime - startTime;

            // Log the execution time and details
            logMessage(`${functionName} executed`, 'info', apiEndpoint, severity, {
                functionName,
                startTime,
                endTime,
                executionTime: `${executionTime}ms`,
            });
        }

        return result; // Return the original function's result
    };
}

module.exports = { logMessage, logError, logWarning, logSuccess, logWithExecutionTime };
```
Below is the example of how you can utilize util
```javascript
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
```

### Syncing Failed Logs to Database

If a log fails to be saved to the database, it will be stored locally in a JSON file (`logs/unsynced_logs.json`). The package automatically attempts to sync these failed logs to the database every 2 hours.

To configure the syncing interval, edit the `sync.js` file and adjust the `setInterval` function if needed.

### Accessing Logs via the API Server

The package includes an Express API server to view and filter logs. Start the server by calling:

```javascript
const { initializeLoggerService } = require('logger_pck/src/index');
initializeLoggerService();
```

#### API Endpoints

- **GET /logs**: Retrieves logs with optional query parameters.

  - **Query Parameters**:
    - `platform`: Filter by platform (e.g., app name).
    - `logType`: Filter by log type (e.g., info, error).
    - `date`: Filter by log date.

  - **Example**:
    ```bash
    curl http://localhost:4000/logs?platform=YourAppName&logType=info
    ```

## Error Handling and Troubleshooting

1. **Database Connection Issues**:
   - Ensure your PostgreSQL server is running and the credentials in `.env` are correct.
   - If connection issues persist, verify your network configuration or firewall settings.

2. **Syntax Errors in `unsynced_logs.json`**:
   - Malformed JSON in `unsynced_logs.json` can cause parsing errors during sync. Open the file, remove any incomplete or corrupted entries, and save it.

3. **Port Conflicts**:
   - If `EADDRINUSE` errors occur, change the port number for the API server in `.env` or by modifying `API_PORT` in `config.js`.

4. **Permission Issues**:
   - If you encounter file permission issues with `unsynced_logs.json`, ensure the application has write access to the directory.

## License

This package is licensed under the MIT License.