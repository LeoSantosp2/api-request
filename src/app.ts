import express from 'express';
import 'dotenv/config';

import usersRouter from './routes/users-route';
import loginRouter from './routes/login-route';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
  }

  routes() {
    this.app.use('/users', usersRouter);
    this.app.use('/login', loginRouter);
  }
}

export default new App().app;
