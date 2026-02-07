/**
 * Logger utility - suppresses logs in production
 */
const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
    log: (...args: unknown[]) => {
        if (!isProduction) console.log(...args);
    },
    info: (...args: unknown[]) => {
        if (!isProduction) console.info(...args);
    },
    warn: (...args: unknown[]) => {
        console.warn(...args);
    },
    error: (...args: unknown[]) => {
        console.error(...args);
    },
    debug: (...args: unknown[]) => {
        if (!isProduction) console.debug(...args);
    },
};

export default logger;
