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
    for (const m of models) {
      Container.set(m.name, m.model);
    }

    const agendaInstance = setUpAgendash();
    // const mgInstance = new Mailgun(formData);

    Container.set('agendaInstance', agendaInstance);
    Container.set('logger', LoggerInstance);
    // Container.set('emailClient', mgInstance.client({ key: config.emails.apiKey, username: config.emails.apiUsername }));
    Container.set('emailDomain', config.emails.domain);

    LoggerInstance.info('Agenda injected into container');

    return { agenda: agendaInstance };
  } catch (error) {
    LoggerInstance.error('Error on dependency injector loader: %o', error);
    throw error;
  }
}

export default dependencyLoader;
