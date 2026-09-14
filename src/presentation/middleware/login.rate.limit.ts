import rateLimit from 'express-rate-limit';

import { HttpError } from '../utils/http.error';

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new HttpError(
      429,
      'Muitas tentativas de login. Tente novamente mais tarde.',
    );
  },
});
