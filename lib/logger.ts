/**
 * Logger - Development/Production log level separation
 * Only shows detailed logs in development mode
 */

const isDev = process.env.NODE_ENV !== 'production';

export const log = {
  /**
   * Info level - only in development
   */
  info: (...args: unknown[]) => {
    if (isDev) {
      console.log('[INFO]', ...args);
    }
  },

  /**
   * Debug level - only in development
   */
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Warning level - only in development
   */
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * Error level - always logged
   */
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
  },
};
