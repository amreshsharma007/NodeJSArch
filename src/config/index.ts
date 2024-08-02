import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import process from 'node:process';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

const envFound = dotenv.config({
  path: ['.env.' + process.env.NODE_ENV, '.env'],
});
if (envFound.error) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
  /**
   * Your favorite port
   */
  port: Number.parseInt(process.env.PORT, 10),

  /**
   * That long string from mlab
   */
  databaseURL: process.env.MONGODB_URI,

  /**
   * Your secret sauce
   */
  jwtSecret: process.env.JWT_SECRET,
  jwtAlgorithm: process.env.JWT_ALGO as jwt.Algorithm,

  /**
   * Used by winston logger
   */
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },

  /**
   * Agenda.js stuff
   */
  agenda: {
    dbCollection: process.env.AGENDA_DB_COLLECTION,
    poolTime: process.env.AGENDA_POOL_TIME,
    concurrency: Number.parseInt(process.env.AGENDA_CONCURRENCY, 10),
  },

  /**
   * Agendash config
   */
  agendash: {
    user: 'agendash',
    password: '123456',
  },
  /**
   * API configs
   */
  api: {
    prefix: '/api/v1',
  },
  logsDir: './logs',
  /**
   * Mailgun email credentials
   */
  emails: {
    apiKey: process.env.MAILGUN_API_KEY,
    apiUsername: process.env.MAILGUN_USERNAME,
    domain: process.env.MAILGUN_DOMAIN,
  },

  redis: {
    redis1: {
      host: process.env.REDIS_MASTER_HOST,
      port: Number.parseInt(process.env.REDIS_MASTER_PORT),
      password: process.env.REDIS_MASTER_PASSWORD,
      username: process.env.REDIS_MASTER_USERNAME,
    },
    redis2: {
      host: process.env.REDIS_SLAVE1_HOST,
      port: Number.parseInt(process.env.REDIS_SLAVE1_PORT),
      password: process.env.REDIS_SLAVE1_PASSWORD,
      username: process.env.REDIS_SALVE1_USERNAME,
    },
    redis3: {
      host: process.env.REDIS_SLAVE2_HOST,
      port: Number.parseInt(process.env.REDIS_SLAVE2_PORT),
      password: process.env.REDIS_SLAVE2_PASSWORD,
      username: process.env.REDIS_SALVE2_USERNAME,
    },
  },
};
