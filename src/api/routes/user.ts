import { Request, Response, Router } from 'express';
import middlewares from '../middlewares';

const route = Router();

function setUpUserRoutes(app: Router) {
  app.use('/users', route);

  route.get('/me', middlewares.isAuth, middlewares.attachCurrentUser, (req: Request, res: Response) => {
    return res.json({ user: req.currentUser }).status(200);
  });
}

export default setUpUserRoutes;
