import express from 'express';
import request from 'supertest';
import rateLimit from 'express-rate-limit';

import { HttpError } from '../../../src/presentation/utils/http.error';
import { registerRateLimit } from '../../../src/presentation/middleware/register.rate.limit';

const errorHandler = (
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
};

describe('Register Rate Limit Middleware', () => {
  it('Should throw a 429 HttpError from the real handler when the limit is exceeded', async () => {
    const app = express();
    app.use(registerRateLimit);
    app.get('/users', (req, res) => res.json({ ok: true }));
    app.use(errorHandler);

    for (let i = 0; i < 5; i++) {
      await request(app).get('/users');
    }

    const overLimit = await request(app).get('/users');

    expect(overLimit.status).toBe(429);
    expect(overLimit.body).toEqual({
      message: 'Muitas tentativas de cadastro. Tente novamente mais tarde.',
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
          'Muitas tentativas de cadastro. Tente novamente mais tarde.',
        );
      },
    });

    const app = express();
    app.use(limiter);
    app.get('/users', (req, res) => res.json({ ok: true }));
    app.use(errorHandler);

    return app;
  };

  it('Should allow requests under the limit', async () => {
    const app = buildApp();

    const first = await request(app).get('/users');
    const second = await request(app).get('/users');

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
  });

  it('Should reject requests over the limit with 429', async () => {
    const app = buildApp();

    await request(app).get('/users');
    await request(app).get('/users');
    const third = await request(app).get('/users');

    expect(third.status).toBe(429);
    expect(third.body).toEqual({
      message: 'Muitas tentativas de cadastro. Tente novamente mais tarde.',
    });
  });
});
