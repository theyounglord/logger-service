Here's the revised `README.md` to clarify that the `util.js` file is a helper that users need to place in their own project's `util` folder, along with the code for the `util.js` file:

---

# Logger PCK Documentation

A comprehensive guide to using the `logger_pck` package for robust, flexible logging with database integration, local fallback, and advanced features for log management.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Installation](#installation)
4. [Project Structure](#project-structure)
5. [Configuration](#configuration)
6. [Usage](#usage)
    - [Basic Logging](#basic-logging)
    - [Execution Time Logging](#execution-time-logging)
    - [Express Route Logging](#express-route-logging)
    - [Utility File Usage](#utility-file-usage)
7. [Advanced Features](#advanced-features)
    - [Failed Log Syncing](#failed-log-syncing)
    - [Accessing Logs via API Server](#accessing-logs-via-api-server)
8. [API Reference](#api-reference)
    - [Functions](#functions)
    - [Environment Variables](#environment-variables)
9. [Error Handling](#error-handling)
10. [License](#license)

---

## Introduction

`logger_pck` is a robust logging package with database and local fallback mechanisms. It logs messages to a PostgreSQL database and automatically falls back to local storage in case of database failures, ensuring no data is lost. Additionally, it provides user-friendly utilities for developers to easily integrate logging into their projects.

---

## Features

- **Database Logging**: Logs are stored centrally in a PostgreSQL database.
- **Local Fallback**: Logs are saved locally when the database is unreachable.
- **Log Levels**: Supports `info`, `error`, `warning`, and `success` levels.
- **Execution Time Monitoring**: Measure and log execution times for functions or routes.
- **API Integration**: Provides APIs to access and manage logs.
- **Custom Utility File**: A sample utility file (`util.js`) is provided for easy integration into user projects.
- **Environment Configuration**: Fully configurable via `.env` file.

---

## Installation

Install the package via npm:

```bash
npm install logger_pck
```

---

## Project Structure

```plaintext
logger_pck
├── package-lock.json
├── package.json
├── README.md
├── script.js
└── src
    ├── api.js                 # API server for log access
    ├── config.js              # Configuration and environment variable handling
    ├── db.js                  # Database connection and schema setup
    ├── fileSyncService.js     # Handles unsynced logs and retries
    ├── index.js               # Main entry point
    ├── logFunction.js         # Logging function for API and metadata tracking
    ├── logger-util.js         # Utility functions for advanced logging
    ├── logger.js              # Core logger implementation
    ├── sync.js                # Log syncing logic
    ├── syncReports.js         # Generates reports for synced logs
```

**Note:** The `util.js` file is not part of this package and needs to be manually added to your project's `util` folder.

---

## Configuration

### Step 1: Set Up PostgreSQL Database

Create a PostgreSQL database:

```sql
CREATE DATABASE logger;
```

### Step 2: Configure Environment Variables

Create a `.env` file in the project root with the following content:

```plaintext
PORT=3000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=logger
DB_PASSWORD=testbucket8600
DB_PORT=5432
DASHBOARD_URL=http://localhost:3000
APPLICATION_NAME=testapp
UNSYNCED_LOGS_PATH=./logs/unsynced_logs.json
SYNC_INTERVAL=60000
```

---

## Usage

### Basic Logging

Log messages with metadata:

```javascript
const { logMessage } = require('logger_pck/src/logger-util');

logMessage('Informational message', 'info', { userId: 123 });
logMessage('Error occurred', 'error', { error: 'File not found' });
```

### Execution Time Logging

Measure and log execution times for functions:

```javascript
const { logWithExecutionTime } = require('logger_pck/src/logger-util');

async function fetchData() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return 'Data fetched successfully';
}

const loggedFetchData = logWithExecutionTime(fetchData, 'fetchData');
loggedFetchData();
```

### Express Route Logging

Wrap Express route handlers to log execution times:

```javascript
const express = require('express');
const { logWithExecutionTime } = require('logger_pck/src/logger-util');

const app = express();

app.get('/test', logWithExecutionTime(async (req, res) => {
    res.send('Test endpoint');
}, '/test'));

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
```

---

## Utility File Usage

The `util.js` file is a helper that users need to create and integrate into their project. Place this file in a `util` folder inside your project.

### `util.js` Code:

```javascript
const { log } = require('logger_pck/src/logger-util');

/**
 * Logs a custom message with metadata.
 * @param {Object} logData - The log data containing various properties.
 */
function logMessage(logData = {}) {
    const {
        message = 'No message provided',
        logType = '', // Default log type
        apiEndpoint = '',
        severity = 'info',
        metadata = {},
        jsondata = {},
        transactionId
    } = logData;

    log({
        logType,
        message,
        severity,
        apiEndpoint,
        metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
        },
        jsondata: {
            ...jsondata,
            timestamp: new Date().toISOString(),
        },
        transactionId,
    });
}

/**
 * Logs an error message.
 * @param {Object} logData - The log data containing various properties.
 */
function logError(logData = {}) {
    logMessage({ ...logData, severity: 'error' });
}

/**
 * Logs a warning message.
 * @param {Object} logData - The log data containing various properties.
 */
function logWarning(logData = {}) {
    logMessage({ ...logData, severity: 'warning' });
}

/**
 * Logs a success message.
 * @param {Object} logData - The log data containing various properties.
 */
function logSuccess(logData = {}) {
    logMessage({ ...logData, severity: 'success' });
}

/**
 * Wraps a function to log its execution time and custom message.
 * @param {Function} func - The function to be wrapped.
 * @param {Object} config - The configuration object for logging.
 * @returns {Function} - A new function that logs execution time and calls the original function.
 */
function logWithExecutionTime(func, config = {}) {
    const { functionName = 'Unnamed Function', severity = 'info', apiEndpoint = '' } = config;

    return async function (...args) {
        const startTime = Date.now();
        let result;

        try {
            // Call the original function and store the result
            result = await func(...args);
        } catch (error) {
            // Log an error if the function throws an exception
            logError({
                message: `Error in ${functionName}: ${error.message}`,
                apiEndpoint,
                metadata: { functionName },
            });
            throw error; // Re-throw the error after logging
        } finally {
            const endTime = Date.now();
            const executionTime = endTime - startTime;

            // Log the execution time and details
            logMessage({
                message: `${functionName} executed`,
                logType,
                apiEndpoint,
                severity: 'info',
                metadata: {
                    functionName,
                    startTime,
                    endTime,
                    executionTime: `${executionTime}ms`,
                },
            });
        }

        return result; // Return the original function's result
    };
}

/**
 * Extracts user details from the request object.
 * @param {Object} req - The request object.
 * @returns {Object} - An object containing user details.
 */
function getUserDetails(req = {}) {
    const {
        user: { ipAddress = 'N/A', userID = 'N/A', email = 'N/A', name = 'N/A' } = {},
        ip,
        headers: { 'x-forwarded-for': forwardedFor } = {},
        connection: { remoteAddress } = {},
        transactionId = 'N/A',
        originalUrl = ''
    } = req;

    const USERIP = ipAddress || ip || forwardedFor || remoteAddress || 'N/A';
    const apiEndpoint = originalUrl.replace('/api', '');

    return { USERIP, USERID: userID, EMAIL: email, NAME: name, transactionId, apiEndpoint };
}

const apiLogger = (req, res, next) => {
  const start = Date.now();
  const transactionId = uuidv4(); // Generate a unique identifier
  req.transactionId = transactionId;

  // Extract user details from the request
  const { USERIP, USERID, EMAIL, NAME, apiEndpoint } = getUserDetails(req);

  // Log the incoming API request
  logMessage({
      message: `API request received for ${apiEndpoint}`,
      logType: 'request',
      severity: 'info',
      apiEndpoint,
      metadata: {
          transactionId,
          method: req.method,
          host: req.get('host'),
          url: req.originalUrl,
          userIP: USERIP,
          userID: USERID,
          userEmail: EMAIL,
          userName: NAME,
      },
      jsondata: {
          body: req.body,
          query: req.query,
          params: req.params,
      },
  });

  // Add transaction ID to the response header
  res.setHeader('X-Transaction-ID', transactionId);

  // Listen for the response's finish event to log response details
  res.on('finish', () => {
      const responseTime = Date.now() - start;

      logMessage({
          message: `API response sent for ${apiEndpoint}`,
          logType: 'response',
          severity: 'info',
          apiEndpoint,
          metadata: {
              transactionId,
              method: req.method,
              statusCode: res.statusCode,
              responseTime: `${responseTime}ms`,
              userIP: USERIP,
              userID: USERID,
              userEmail: EMAIL,
              userName: NAME,
          },
          jsondata: {
              statusMessage: res.statusMessage || 'N/A',
          },
      });
  });

  // Proceed to the next middleware or route handler
  next();
};

module.exports = { logMessage, logError, logWarning, logSuccess, logWithExecutionTime, getUserDetails, apiLogger };
```

### Example Usage:

```javascript
const { logInfo, logError } = require('./util/util');

// Log an informational message
logInfo('Server started', { port: 3000 });

// Log an error message
logError('Database connection failed', { db: 'PostgreSQL' });
```

---

## Advanced Features

### Failed Log Syncing

Logs saved locally are periodically synced to the database. Configure the sync interval using the `SYNC_INTERVAL` variable in `.env`.

### Accessing Logs via API Server

The package includes an optional Express-based API server to view and filter logs:

```javascript
const express = require('express');
const { setupApiRoutes } = require('logger_pck/src/api');

const app = express();
setupApiRoutes(app);

app.listen(3001, () => console.log('API server running on http://localhost:3001'));
```

---

## API Reference

### Functions

#### `logMessage(message, level, metadata)`
Logs a message with a specified level and metadata.

- `message`: String - The message to log.
- `level`: String - The log level (`info`, `error`, `warning`, `success`).
- `metadata`: Object - Additional metadata to log.

#### `logWithExecutionTime(fn, functionName)`
Wraps a function and logs its execution time.

- `fn`: Function - The function to wrap.
- `functionName`: String - The name of the function.

#### Utility File Functions

- `logInfo(message, metadata)`: Logs informational messages.
- `logError(message, metadata)`: Logs error messages.
- `logWarning(message, metadata)`: Logs warning messages.
- `logSuccess(message, metadata)`: Logs success messages.

### Environment Variables

- `PORT`: The port number for the application.
- `DB_USER`: PostgreSQL username.
- `DB_HOST`: PostgreSQL host.
- `DB_NAME`: PostgreSQL database name.
- `DB_PASSWORD`: PostgreSQL password.
- `DB_PORT`: PostgreSQL port.
- `DASHBOARD_URL`: URL for accessing the log dashboard.
- `UNSYNCED_LOGS_PATH`: Path for storing unsynced logs.
- `SYNC_INTERVAL`: Interval for syncing logs (in milliseconds).

---

## Error Handling

If logging to the database fails, logs are saved locally to ensure no data is lost. Errors are logged with details to aid troubleshooting.

---

## License

This project is licensed under the MIT License. See `LICENSE` for more details.

---

This README now makes it clear that users need to add the `util.js` file themselves and includes the full code for it.