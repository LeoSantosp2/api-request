import { Request, Response } from 'express';
import { errorHandler } from '../../middleware/error-handler';
import { HttpError } from '../../utils/http-error';

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
    const spy = jest.spyOn(console, 'error').mockImplementation(() => { });

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

  it('handles a plain JavaScript Error', () => {
    const err = new Error('plain');
    const res = createMockRes();

    const spy = jest.spyOn(console, 'error').mockImplementation(() => { });

    errorHandler(err, mockReq, res as unknown as Response, jest.fn());

    expect(spy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.status().json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Erro interno do servidor',
    });
  });
});
