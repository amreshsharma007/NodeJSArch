import 'reflect-metadata'; // We need this in order to use @Decorators
import config from './config';

import Logger from './loaders/logger';
import LoggerInstance from './loaders/logger';
import Process from 'node:process';
import cluster from 'node:cluster';
import express from 'express';

async function startServer(): Promise<void> {
  // const server = Fastify({ logger: true });
  const server = express();

  /**
   * A little hack here
   * Import/Export can only be used in 'top-level code'
   * Well, at least in node 10 without babel and at the time of writing
   * So we are using good old require.
   **/
  await require('./loaders').default(true, server, true, true);

  server
    .listen(config.port, (): void => {
      Logger.info(`

      ###############################################################
      🛡️  Server listening on port: ${config.port} 🛡️
      🛡️
      🛡️  Links Configured
      🛡️  MongoDB: ${process.env.MONGODB_URI}
      ###############################################################

    `);
    })
    .on('error', err => {
      Logger.error(err);
      process.exit(1);
    });
}

async function startApplication(): Promise<void> {
  if (process.env.CLUSTER_ENABLED !== 'true') {
    return startServer();
  }

  let cCPUs = require('node:os').cpus().length - Number.parseInt(Process.env.CLUSTER_LEAVE_NUM_CORE);

  if (cCPUs < 1) {
    cCPUs++;
  }

  if (cluster.isPrimary) {
    // Create a worker for each CPU
    for (let i = 0; i < cCPUs; i++) {
      cluster.fork();
    }

    cluster.on('online', function (worker) {
      LoggerInstance.info('Worker ' + worker.process.pid + ' is online.');
    });

    cluster.on('exit', function (worker, code, signal) {
      LoggerInstance.info(`worker ${worker.process.pid} died.`);
    });
  } else {
    await startServer();
  }
}

startApplication().then(() => {
  LoggerInstance.info('Done');
});
