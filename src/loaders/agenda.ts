import Agenda from 'agenda';
import config from '@/config';

function setUpAgendash(): Agenda {
  return new Agenda({
    // mongo: mongoConnection,
    db: { address: config.databaseURL },
    processEvery: config.agenda.poolTime,
    maxConcurrency: config.agenda.concurrency,
  });
  /**
   * This voodoo magic is proper from agenda.js, so I'm not going to explain too much here.
   * https://github.com/agenda/agenda#mongomongoclientinstance
   */
}

export default setUpAgendash;
