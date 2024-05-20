import express from 'express';
import dotenv from 'dotenv';

class App {
  public app: express.Application;

  constructor() {
    dotenv.config();
    this.app = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
  }

  routes() {}
}

export default new App().app;
