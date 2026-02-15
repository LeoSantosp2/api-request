import express from 'express';
import 'dotenv/config';
import 'express-async-errors';

import usersRouter from './routes/users-route';
import loginRouter from './routes/login-route';

import { errorHandler } from './middleware/error-handler';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
    this.app.use(errorHandler);
  }

  middlewares() {
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
  }

  routes() {
    this.app.use('/api', usersRouter);
    this.app.use('/api', loginRouter);
  }
}

export default new App().app;
