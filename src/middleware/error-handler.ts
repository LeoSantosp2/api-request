import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/http-error';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): Response {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  console.error(err);

  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
  });
}
