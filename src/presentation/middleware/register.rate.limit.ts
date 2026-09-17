import rateLimit from 'express-rate-limit';

import { HttpError } from '../utils/http.error';

export const registerRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new HttpError(
      429,
      'Muitas tentativas de cadastro. Tente novamente mais tarde.',
    );
  },
});
