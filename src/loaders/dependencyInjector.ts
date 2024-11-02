import { Container } from 'typedi';
import LoggerInstance from './logger';
import setUpAgendash from './agenda';
import config from '@/config';
import Agenda from 'agenda';
import { Db } from 'mongodb';
import mongoose from 'mongoose';

function dependencyLoader({
  mongoConnection,
  models,
}: {
  mongoConnection: Db;
  models: { name: string; model: mongoose.Model<never> }[];
}): {
  agenda: Agenda;
} {
  try {
    /**
     * WTF is going on here?
     *
     * We are injecting the mongoose models into the DI container.
     * I know this is controversial but will provide a lot of flexibility at the time
     * of writing unit tests, just go and check how beautiful they are!
     */

    for (const m of models) {
      Container.set(m.name, m.model);
    }

    const agendaInstance = setUpAgendash();

    Container.set('agenda', agendaInstance);
    Container.set('logger', LoggerInstance);
    Container.set('emailDomain', config.emails.domain);

    LoggerInstance.info('Agenda injected into container');

    return { agenda: agendaInstance };
  } catch (error) {
    LoggerInstance.error('Error on dependency injector loader: %o', error);
    throw error;
  }
}

export default dependencyLoader;
