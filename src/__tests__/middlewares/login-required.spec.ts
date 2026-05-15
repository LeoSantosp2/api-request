import { Request, Response } from 'express';

import prisma from '../../config/prisma';
import { loginRequired } from '../../middleware/login-required';
import { HttpError } from '../../utils/http-error';

jest.mock('../../config/prisma', () => ({
  __esModule: true,
  default: {
    users: {
      findFirst: jest.fn(),
    },
  },
}));

describe('Login Required Middleware', () => {
  const mockRequest = (headers?: Record<string, string>) =>
    ({ headers: headers || {} } as Request);

  const mockResponse = () => ({} as Response);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should return error message "NecessÃ¡rio fazer login" and statusCode "401"', async () => {
    const req = mockRequest();
    const res = mockResponse();

    const promise = loginRequired(req, res, jest.fn());

    await expect(promise).rejects.toBeInstanceOf(HttpError);
    await expect(promise).rejects.toMatchObject({ statusCode: 401 });
    await expect(promise).rejects.toHaveProperty(
      'message',
      'Necessário fazer login.',
    );
  });

  it('Should return error when token is invalid', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce(null);

    const req = mockRequest({ authorization: 'token' });
    const res = mockResponse();

    const promise = loginRequired(req, res, jest.fn());

    await expect(promise).rejects.toMatchObject({ statusCode: 401 });
    await expect(promise).rejects.toHaveProperty('message', 'Usuário inválido.');
  });

  it('Should call next when token is valid', async () => {
    (prisma.users.findFirst as jest.Mock).mockResolvedValueOnce({
      id: '1',
      token_auth: 'token',
    });

    const next = jest.fn();
    const req = mockRequest({ authorization: 'token' });
    const res = mockResponse();

    await loginRequired(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
