import Agenda from 'agenda';
import config from '@/config';
import { Db } from 'mongodb';

function setUpAgendash({ mongoConnection }: { mongoConnection: Db }): Agenda {
  return new Agenda({
    mongo: mongoConnection,
    db: { address: '', collection: config.agenda.dbCollection },
    processEvery: config.agenda.pooltime,
    maxConcurrency: config.agenda.concurrency,
  });
  /**
   * This voodoo magic is proper from agenda.js, so I'm not going to explain too much here.
   * https://github.com/agenda/agenda#mongomongoclientinstance
   */
}

export default setUpAgendash;
