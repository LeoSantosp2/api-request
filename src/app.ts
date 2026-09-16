import express from 'express';
import swaggerUi from 'swagger-ui-express';
import cors, { CorsOptions } from 'cors';
import 'dotenv/config';
import 'express-async-errors';

import env from './infrastructure/config/env';

import usersRouter from './presentation/routes/user.router';
import authRouter from './presentation/routes/auth.router';

import { generateOpenApiDocument } from './infrastructure/docs/generate.document';

import { errorHandler } from './presentation/middleware/error.handler';

const corsOptions: CorsOptions = {
  origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
};

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
    this.app.use(cors(corsOptions));
  }

  routes() {
    this.app.use('/api/health', (req, res) => res.send({ status: 'ok' }));
    this.app.use('/api', usersRouter);
    this.app.use('/api', authRouter);
    this.app.use(
      '/api/docs',
      swaggerUi.serve,
      swaggerUi.setup(generateOpenApiDocument()),
    );
  }
}

export default new App().app;
