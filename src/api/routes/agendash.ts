// import { Router } from 'express';
// import basicAuth from 'express-basic-auth';
// import agendash from 'agendash';
// import { Container } from 'typedi';
// import config from '@/config';
// import { FastifyInstance } from 'fastify';
//
// function setUpAgendaRoute(fastify: FastifyInstance, opts) {
//   const agendaInstance = Container.get('agendaInstance');
//
//   fastify.head(
//     '/dash',
//     basicAuth({
//       users: {
//         [config.agendash.user]: config.agendash.password,
//       },
//       challenge: true,
//     }),
//     agendash(agendaInstance),
//   );
// }
//
// export default setUpAgendaRoute;
