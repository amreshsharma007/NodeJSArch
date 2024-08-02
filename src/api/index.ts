import { Router } from 'express';
import auth from './routes/auth';
import agendash from './routes/agendash';
import setUpUserRoute from './routes/user';

// guaranteed to get dependencies
function setUpRoutes(): Router {
  const app = Router();
  auth(app);
  setUpUserRoute(app);
  agendash(app);

  return app;
}

export default setUpRoutes;
