import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/http.error';

interface BodyParserError extends Error {
  type?: string;
}

const bodyParserErrors: Record<
  string,
  { statusCode: number; message: string }
> = {
  'entity.too.large': {
    statusCode: 413,
    message: 'Corpo da requisição excede o tamanho máximo permitido.',
  },
  'entity.parse.failed': {
    statusCode: 400,
    message: 'JSON inválido.',
  },
};

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): Response {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  const bodyParserError = bodyParserErrors[(err as BodyParserError).type ?? ''];

  if (bodyParserError) {
    return res.status(bodyParserError.statusCode).json({
      status: 'error',
      message: bodyParserError.message,
    });
  }

  console.error(err);

  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
  });
}
