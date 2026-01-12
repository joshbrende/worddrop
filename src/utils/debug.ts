/**
 * Debug utilities - Conditional logging for development/production
 * Only logs in development mode, strips in production
 */

const DEBUG = import.meta.env.DEV;

/**
 * Log debug message (only in development)
 */
export const debugLog = (...args: unknown[]): void => {
  if (DEBUG) {
    console.log(...args);
  }
};

/**
 * Log debug warning (only in development)
 */
export const debugWarn = (...args: unknown[]): void => {
  if (DEBUG) {
    console.warn(...args);
  }
};

/**
 * Log error (always logs, even in production)
 * Errors should always be visible for debugging
 */
export const debugError = (...args: unknown[]): void => {
  console.error(...args);
  // TODO: In production, send to error tracking service (e.g., Sentry)
};

/**
 * Log info message (only in development)
 */
export const debugInfo = (...args: unknown[]): void => {
  if (DEBUG) {
    console.info(...args);
  }
};
