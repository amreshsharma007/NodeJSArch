import setUpExpress from './setUpExpress';
import jobsLoader from './jobs';
import Logger from './logger';
import './events';
import setUpMongoose from './mongoose';
import { Db } from 'mongodb';
import dependencyInjector from './dependencyInjector';
import { Application } from 'express';
import setUpModels from '@/loaders/models';
import setUpSwagger from '@/loaders/swagger';

async function setUpServer(
  loadMongoose: boolean,
  server: Application,
  loadJobs: boolean,
  mailTransportType: 'default' | 'stub' = 'default',
): Promise<void> {
  const mongoConnection: Db = await setUpMongoose();
  Logger.info('DB loaded and connected!');

  // It returns the agenda instance because it's needed in the subsequent loaders
  const { agenda } = dependencyInjector({
    mongoConnection,
    models: setUpModels(),
  });
  Logger.info('Dependency Injector loaded');

  if (loadJobs) {
    await jobsLoader({ agenda });
    Logger.info('Jobs loaded');
  }

  if (server) {
    setUpSwagger({ app: server });
    setUpExpress({ server });
    Logger.info('Server loaded');
  }
}

export default setUpServer;
