import express from 'express';
import request from 'supertest';

import { HttpError } from '../../../src/presentation/utils/http.error';
import { requestRateLimit } from '../../../src/presentation/middleware/request.rate.limit';

const buildApp = () => {
  const app = express();

  app.use(requestRateLimit);
  app.get('/protected', (req, res) => res.json({ ok: true }));
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

describe('Request Rate Limit Middleware', () => {
  it('Should allow requests under the limit', async () => {
    const app = buildApp();

    for (let i = 0; i < 5; i++) {
      const res = await request(app).get('/protected');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
    }
  });

  it('Should throw a 429 HttpError when the limit is exceeded', async () => {
    const app = buildApp();

    for (let i = 0; i < 5; i++) {
      await request(app).get('/protected');
    }

    const overLimit = await request(app).get('/protected');

    expect(overLimit.status).toBe(429);
    expect(overLimit.body).toEqual({
      message: 'Muitas tentativas. Tente novamente mais tarde.',
    });
  });

  it('Should expose the standard rate limit headers', async () => {
    const app = buildApp();

    const res = await request(app).get('/protected');

    expect(res.headers['ratelimit-limit']).toBe('5');
    expect(res.headers['x-ratelimit-limit']).toBeUndefined();
  });
});
