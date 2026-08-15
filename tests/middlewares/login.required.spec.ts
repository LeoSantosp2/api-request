import 'dotenv/config';

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import env from '../../src/config/env';
import { loginRequired } from '../../src/middleware/login.required';
import { HttpError } from '../../src/utils/http.error';
import { RequestProps } from '../../src/interfaces/request.props';

describe('Login Required Middleware', () => {
  const mockRequest = (headers?: Record<string, string>) =>
    ({ headers: headers || {} }) as Request;

  const mockResponse = () => ({}) as Response;

  it('Should throw error message "Necessário fazer login." and statusCode "401" when no token is sent', () => {
    const req = mockRequest();
    const res = mockResponse();

    expect(() => loginRequired(req, res, jest.fn())).toThrow(HttpError);

    try {
      loginRequired(req, res, jest.fn());
    } catch (error) {
      expect(error).toMatchObject({ statusCode: 401 });
      expect(error).toHaveProperty('message', 'Necessário fazer login.');
    }
  });

  it('Should throw error when authorization header has no Bearer scheme', () => {
    const req = mockRequest({ authorization: 'token' });
    const res = mockResponse();

    try {
      loginRequired(req, res, jest.fn());
    } catch (error) {
      expect(error).toMatchObject({ statusCode: 401 });
      expect(error).toHaveProperty('message', 'Token inválido.');
    }
  });

  it('Should throw error when token is invalid or expired', () => {
    const req = mockRequest({ authorization: 'Bearer invalid.token.here' });
    const res = mockResponse();

    try {
      loginRequired(req, res, jest.fn());
    } catch (error) {
      expect(error).toMatchObject({ statusCode: 401 });
      expect(error).toHaveProperty('message', 'Token expirado ou inválido.');
    }
  });

  it('Should throw error when token was signed with a different secret', () => {
    const token = jwt.sign(
      { id: '1', email: 'user@example.com' },
      'wrong-secret',
    );

    const req = mockRequest({ authorization: `Bearer ${token}` });
    const res = mockResponse();

    try {
      loginRequired(req, res, jest.fn());
    } catch (error) {
      expect(error).toMatchObject({ statusCode: 401 });
      expect(error).toHaveProperty('message', 'Token expirado ou inválido.');
    }
  });

  it('Should call next and attach userId when token is valid', () => {
    const token = jwt.sign(
      { id: '1', email: 'user@example.com' },
      env.TOKEN_SECRET,
    );

    const next = jest.fn();
    const req = mockRequest({ authorization: `Bearer ${token}` });
    const res = mockResponse();

    loginRequired(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((req as RequestProps).userId).toBe('1');
  });
});
