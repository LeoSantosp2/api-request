import express from 'express';
import swaggerUi from 'swagger-ui-express';
import cors, { CorsOptions } from 'cors';
import 'dotenv/config';
import 'express-async-errors';

import usersRouter from './presentation/routes/users';
import loginRouter from './presentation/routes/login';

import { generateOpenApiDocument } from './docs/generate.document';

import { errorHandler } from './middleware/error.handler';

const corsOptions: CorsOptions = {
  origin: ['http://localhost:3000'],
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
    this.app.use('/api', loginRouter);
    this.app.use(
      '/api/docs',
      swaggerUi.serve,
      swaggerUi.setup(generateOpenApiDocument()),
    );
  }
}

export default new App().app;
