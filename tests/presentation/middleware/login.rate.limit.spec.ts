import express from 'express';
import request from 'supertest';
import rateLimit from 'express-rate-limit';

import { HttpError } from '../../../src/presentation/utils/http.error';
import { loginRateLimit } from '../../../src/presentation/middleware/login.rate.limit';

describe('Login Rate Limit Middleware', () => {
  it('Should throw a 429 HttpError from the real handler when the limit is exceeded', async () => {
    const app = express();
    app.use(loginRateLimit);
    app.get('/login', (req, res) => res.json({ ok: true }));
    app.use(
      (
        err: Error,
        req: express.Request,
        res: express.Response,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        next: express.NextFunction,
      ) => {
        if (err instanceof HttpError) {
          return res.status(err.statusCode).json({ message: err.message });
        }

        return res.status(500).json({ message: 'unexpected error' });
      },
    );

    for (let i = 0; i < 5; i++) {
      await request(app).get('/login');
    }

    const overLimit = await request(app).get('/login');

    expect(overLimit.status).toBe(429);
    expect(overLimit.body).toEqual({
      message: 'Muitas tentativas de login. Tente novamente mais tarde.',
    });
  });

  const buildApp = () => {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 2,
      standardHeaders: true,
      legacyHeaders: false,
      handler: () => {
        throw new HttpError(
          429,
          'Muitas tentativas de login. Tente novamente mais tarde.',
        );
      },
    });

    const app = express();
    app.use(limiter);
    app.get('/login', (req, res) => res.json({ ok: true }));
    app.use(
      (
        err: Error,
        req: express.Request,
        res: express.Response,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        next: express.NextFunction,
      ) => {
        if (err instanceof HttpError) {
          return res.status(err.statusCode).json({ message: err.message });
        }

        return res.status(500).json({ message: 'unexpected error' });
      },
    );

    return app;
  };

  it('Should allow requests under the limit', async () => {
    const app = buildApp();

    const first = await request(app).get('/login');
    const second = await request(app).get('/login');

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
  });

  it('Should reject requests over the limit with 429', async () => {
    const app = buildApp();

    await request(app).get('/login');
    await request(app).get('/login');
    const third = await request(app).get('/login');

    expect(third.status).toBe(429);
    expect(third.body).toEqual({
      message: 'Muitas tentativas de login. Tente novamente mais tarde.',
    });
  });
});
