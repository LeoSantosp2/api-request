import express from 'express';
import swaggerUi from 'swagger-ui-express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import 'express-async-errors';

import env from './infrastructure/config/env';

import usersRouter from './presentation/routes/user.router';
import authRouter from './presentation/routes/auth.router';

import { generateOpenApiDocument } from './infrastructure/docs/generate.document';

import { errorHandler } from './presentation/middleware/error.handler';
import { HttpError } from './presentation/utils/http.error';

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
    if (env.NODE_ENV === 'production') {
      this.app.set('trust proxy', 1);
    }

    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json({ limit: '1mb' }));
    this.app.use(helmet({ hsts: false }));
    this.app.use((req, res, next) => {
      if (req.secure) {
        res.setHeader(
          'Strict-Transport-Security',
          'max-age=31536000; includeSubDomains',
        );
      }

      next();
    });
    this.app.use(cors(corsOptions));
  }

  routes() {
    this.app.use('/api/health', (req, res) => res.send({ status: 'ok' }));
    this.app.use('/api', usersRouter);
    this.app.use('/api', authRouter);

    const openApiDocument = generateOpenApiDocument();

    this.app.get('/api/docs.json', (req, res) => {
      if (!openApiDocument) {
        throw new HttpError(404, 'Documentação indisponível.');
      }

      return res.json(openApiDocument);
    });

    this.app.use(
      '/api/docs',
      swaggerUi.serve,
      swaggerUi.setup(openApiDocument),
    );
  }
}

export default new App().app;
