import { z } from 'zod';
import { Request, Response } from 'express';

import { validateBody } from '../../src/middleware/validate-body';
import { HttpError } from '../../src/utils/http-error';

describe('Validate Body Middleware', () => {
  const schema = z.object({
    name: z.string().min(1, 'Nome é obrigatório.'),
  });

  const mockRequest = (body: unknown) => ({ body }) as Request;
  const mockResponse = () => ({}) as Response;

  it('Should throw HttpError with 400 when body is invalid', () => {
    const req = mockRequest({ name: '' });
    const res = mockResponse();

    try {
      validateBody(schema)(req, res, jest.fn());
      throw new Error('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      expect(error).toMatchObject({ statusCode: 400 });
      expect(error).toHaveProperty('message', 'Nome é obrigatório.');
    }
  });

  it('Should call next and replace req.body with the parsed data when valid', () => {
    const next = jest.fn();
    const req = mockRequest({ name: 'Leonardo' });
    const res = mockResponse();

    validateBody(schema)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.body).toEqual({ name: 'Leonardo' });
  });
});
