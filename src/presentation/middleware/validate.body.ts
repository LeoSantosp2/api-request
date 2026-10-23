import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

import { BadRequest } from '../../domain/errors/http.error';

export const validateBody =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new BadRequest(result.error.issues[0].message);
    }

    req.body = result.data;

    return next();
  };
