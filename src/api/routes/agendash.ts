import { Router } from 'express';
import basicAuth from 'express-basic-auth';
import agendash from 'agendash';
import { Container } from 'typedi';
import config from '@/config';

function setUpAgendaRoute(app: Router): void {
  const agendaInstance = Container.get('agenda');

  app.use(
    '/dash',
    basicAuth({
      users: {
        [config.agendash.user]: config.agendash.password,
      },
      challenge: true,
    }),
    agendash(agendaInstance),
  );
}

export default setUpAgendaRoute;
