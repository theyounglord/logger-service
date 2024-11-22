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
