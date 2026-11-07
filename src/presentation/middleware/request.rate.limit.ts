import rateLimit from 'express-rate-limit';

import { TooManyRequestsError } from '../../domain/errors/http.error';

export const requestRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new TooManyRequestsError(
      'Muitas tentativas. Tente novamente mais tarde.',
    );
  },
});
