const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    // errors luôn log để dễ debug trong production nếu cần
    console.error(...args);
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },
};
