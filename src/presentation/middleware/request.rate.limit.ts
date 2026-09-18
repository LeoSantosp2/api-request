import rateLimit from 'express-rate-limit';

import { HttpError } from '../utils/http.error';

export const requestRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new HttpError(429, 'Muitas tentativas. Tente novamente mais tarde.');
  },
});
