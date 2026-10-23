import rateLimit from 'express-rate-limit';

import { TooManyRequests } from '../../domain/errors/http.error';

export const requestRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new TooManyRequests('Muitas tentativas. Tente novamente mais tarde.');
  },
});
