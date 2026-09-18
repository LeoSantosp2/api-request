import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

import { HttpError } from '../utils/http.error';

export const validateBody =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new HttpError(400, result.error.issues[0].message);
    }

    req.body = result.data;

    return next();
  };
