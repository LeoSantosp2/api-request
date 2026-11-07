import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

import { BadRequestError } from '../../domain/errors/http.error';

export const validateBody =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new BadRequestError('Erro de validação', result.error.issues);
    }

    req.body = result.data;

    return next();
  };
