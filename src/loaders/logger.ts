import winston, { format } from 'winston';
import config from '../config';
import * as fs from 'node:fs';
import moment, { now } from 'moment';

const transports = [];
const date = moment(now());

// Create Logs Dir, if not exists
try {
  fs.mkdirSync(config.logsDir, { recursive: true });
} catch (error) {
  // eslint-disable-next-line no-console
  console.log('Cannot create folder', error);
}

const fileName = config.logsDir + '/debug-' + date.format('DD-MMM-YYYY') + '.log';

/**
 * This following icons are explored on internet
 * you can find all these icons at following link
 *
 * https://emojipedia.org/
 */
const myFormat = format.printf(inputs => {
  const { level, timestamp } = inputs;
  let { message, label, stack } = inputs;

  /**
   * Faaltu kaam,
   * But it's works
   */
  const levelSymbol = Symbol.for('level') as unknown as string;

  /**
   * Modify Stack's path
   * if case LOG path prefix is defined
   */
  if (process.env.LOG_PATH_PREFIX && stack) {
    stack = stack.replaceAll(/\(([./A-Z_a-z]+):(\d+:\d+)\)/g, (a, b, c) => {
      b = b.replaceAll('/', '\\');
      return '(' + process.env.LOG_PATH_PREFIX + b + ':' + c + ')';
    });
  }

  if (inputs[levelSymbol] === 'error') {
    message = stack ? '\n' + level.replace('error', stack) : level.replace('error', message);
  }

  // Null or blank spaces check
  if (!message || message === '' || message.length === 0) {
    return '';
  }

  if (process.env.ENABLE_FORMATTED_LOG !== 'true') {
    return message;
  }

  /**
   * Setting default icon
   * to information
   */
  let icon = '✌️';

  if (inputs[levelSymbol] === 'error') {
    icon = '🔥';
  }

  if (inputs[levelSymbol] === 'warning') {
    icon = '⚠️ ';
  }

  label = label ? ', ' + label : '';

  if (inputs[levelSymbol] === 'info') {
    return `[${timestamp}${label}] ${level} : ${icon}  ${message}`;
  }

  if (inputs[levelSymbol] === 'error') {
    return `[${timestamp}${label}] ${level}: ${icon}  ${message}`;
  }

  return `[${timestamp}${label}] ${level}: ${icon}  ${message}`;
});

if (process.env.ENABLE_CONSOLE_LOG === 'true') {
  transports.push(
    new winston.transports.Console({
      level: config.logs.level,
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp({
          format: 'DD-MMM-YYYY hh:mm:ss A',
        }),
        myFormat,
      ),
    }),
  );
}

if (process.env.ENABLE_FILE_LOG === 'true') {
  transports.push(
    new winston.transports.File({
      filename: fileName,
      level: config.logs.level,
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp({
          format: 'DD-MMM-YYYY hh:mm:ss A',
        }),
        myFormat,
      ),
    }),
  );
}

winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'green',
});

const LoggerInstance = winston.createLogger({
  level: config.logs.level,
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.splat(),
    winston.format.json(),
  ),
  transports,
});

export default LoggerInstance;
