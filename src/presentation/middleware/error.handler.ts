import { Request, Response, NextFunction } from 'express';

import {
  HttpError,
  BadRequestError,
  PayloadTooLargeError,
  InternalServerError,
} from '../../domain/errors/http.error';

function toHttpError(error: Error): HttpError {
  if (error instanceof HttpError) return error;

  if (
    error instanceof SyntaxError &&
    'type' in error &&
    error.type === 'entity.parse.failed'
  ) {
    return new BadRequestError('JSON inválido.');
  }

  if ('type' in error && error.type === 'entity.too.large') {
    return new PayloadTooLargeError(
      'Corpo da requisição excede o tamanho máximo permitido.',
    );
  }

  return new InternalServerError('Erro interno do servidor');
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): Response {
  const httpError = toHttpError(err);

  if (httpError.statusCode === 500) {
    console.error(err);
  }

  return res.status(httpError.statusCode).json({
    status: 'error',
    message: httpError.message,
    details: httpError.details,
  });
}
