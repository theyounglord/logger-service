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
function logMessage(message, logType, apiEndpoint = '', severity = 'info', metadata = {}, jsondata = {}, transactionId) {
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
        transactionId: transactionId
    });
}

/**
 * Logs an error message.
 * @param {String} message - The error message.
 * @param {String} apiEndpoint - The API endpoint associated with the log.
 * @param {Object} metadata - Additional metadata for the log.
 */
function logError(message, logType, apiEndpoint = '', metadata = {}, jsondata = {}, transactionId) {
    logMessage(message, logType, apiEndpoint, 'error', metadata, jsondata, transactionId);
}

/**
 * Logs a warning message.
 * @param {String} message - The warning message.
 * @param {String} apiEndpoint - The API endpoint associated with the log.
 * @param {Object} metadata - Additional metadata for the log.
 */
function logWarning(message, apiEndpoint = '', metadata = {}, jsondata = {}, transactionId) {
    logMessage(message, 'warning', apiEndpoint, 'medium', metadata, jsondata, transactionId);
}

/**
 * Logs a success message.
 * @param {String} message - The success message.
 * @param {String} apiEndpoint - The API endpoint associated with the log.
 * @param {Object} metadata - Additional metadata for the log.
 */
function logSuccess(message, apiEndpoint = '', metadata = {}, jsondata = {}, transactionId) {
    logMessage(message, 'success', apiEndpoint, 'low', metadata, jsondata, transactionId);
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