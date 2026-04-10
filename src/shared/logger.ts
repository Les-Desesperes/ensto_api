import pino from 'pino';
import { Request, Response, NextFunction } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

const baseOptions: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  base: { pid: false },
  timestamp: pino.stdTimeFunctions.isoTime,
};

const logger = isProduction
  ? pino(baseOptions)
  : pino({
      ...baseOptions,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    });

export default logger;

// Express request logger middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // log on response finish to capture status code and duration
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logPayload = {
      method: req.method,
      url: req.originalUrl || req.url,
      params: req.params,
      query: req.query,
      statusCode: res.statusCode,
      durationMs: duration,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };

    if (res.statusCode >= 500) {
      logger.error(logPayload, 'HTTP request failed');
      return;
    }

    if (res.statusCode >= 400) {
      logger.warn(logPayload, 'HTTP request completed with client error');
      return;
    }

    logger.info(logPayload, 'HTTP request completed');
  });

  next();
};

