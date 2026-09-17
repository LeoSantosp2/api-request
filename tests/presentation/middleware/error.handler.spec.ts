import { Request, Response } from 'express';
import { errorHandler } from '../../../src/presentation/middleware/error.handler';
import { HttpError } from '../../../src/presentation/utils/http.error';

describe('errorHandler middleware', () => {
  const mockReq = {} as Request;

  type MockRes = {
    status: jest.Mock;
    json: jest.Mock;
  };

  const createMockRes = (): MockRes => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });

    return { status, json };
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns status code and message correct for HttpError', () => {
    const err = new HttpError(400, 'Bad request');
    const res = createMockRes();

    errorHandler(err, mockReq, res as unknown as Response, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status().json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Bad request',
    });
  });

  it('returns status 500 for generic (non-HttpError) errors', () => {
    const err = new Error('some failure');
    const res = createMockRes();

    errorHandler(err, mockReq, res as unknown as Response, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.status().json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Erro interno do servidor',
    });
  });

  it('logs generic errors via console.error', () => {
    const err = new Error('oh no');
    const res = createMockRes();
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(err, mockReq, res as unknown as Response, jest.fn());

    expect(spy).toHaveBeenCalledWith(err);
  });

  it.each([400, 401, 404])(
    'handles HttpError with status %i correctly',
    (statusCode) => {
      const msg = `status ${statusCode}`;
      const err = new HttpError(statusCode, msg);
      const res = createMockRes();

      errorHandler(err, mockReq, res as unknown as Response, jest.fn());

      expect(res.status).toHaveBeenCalledWith(statusCode);
      expect(res.status().json).toHaveBeenCalledWith({
        status: 'error',
        message: msg,
      });
    },
  );

  it('returns 413 for a body-parser payload too large error', () => {
    const err = Object.assign(new Error('request entity too large'), {
      type: 'entity.too.large',
    });
    const res = createMockRes();
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(err, mockReq, res as unknown as Response, jest.fn());

    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.status().json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Corpo da requisição excede o tamanho máximo permitido.',
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it('returns 400 for a body-parser malformed JSON error', () => {
    const err = Object.assign(new SyntaxError('Unexpected token'), {
      type: 'entity.parse.failed',
    });
    const res = createMockRes();

    errorHandler(err, mockReq, res as unknown as Response, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status().json).toHaveBeenCalledWith({
      status: 'error',
      message: 'JSON inválido.',
    });
  });

  it('does not leak the internal message of a body-parser error', () => {
    const err = Object.assign(new Error('request entity too large'), {
      type: 'entity.too.large',
    });
    const res = createMockRes();

    errorHandler(err, mockReq, res as unknown as Response, jest.fn());

    expect(res.status().json).not.toHaveBeenCalledWith(
      expect.objectContaining({ message: 'request entity too large' }),
    );
  });

  it('falls back to 500 for an unknown body-parser type', () => {
    const err = Object.assign(new Error('nope'), { type: 'entity.unknown' });
    const res = createMockRes();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(err, mockReq, res as unknown as Response, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('handles a plain JavaScript Error', () => {
    const err = new Error('plain');
    const res = createMockRes();

    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(err, mockReq, res as unknown as Response, jest.fn());

    expect(spy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.status().json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Erro interno do servidor',
    });
  });
});
