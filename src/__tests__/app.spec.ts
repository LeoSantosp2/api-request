import 'dotenv/config';

import request from 'supertest';
import jwt from 'jsonwebtoken';

import env from '../config/env';

jest.mock('../services/users-service', () => ({
  listAll: jest.fn(),
  listOne: jest.fn(),
  create: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
}));

jest.mock('../services/login-service', () => ({
  loginUser: jest.fn(),
}));

describe('Testing App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/users returns json from service', async () => {
    const usersService = await import('../services/users-service');
    (usersService.listAll as jest.Mock).mockResolvedValueOnce([{ id: '1' }]);

    const app = (await import('../app')).default;

    const token = jwt.sign({ id: '1', email: 'a@a.com' }, env.TOKEN_SECRET);

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: '1' }]);
  });

  it('POST /api/login returns json from service', async () => {
    const loginService = await import('../services/login-service');
    (loginService.loginUser as jest.Mock).mockResolvedValueOnce({
      id: '1',
      email: 'a@a.com',
      token: 't',
    });

    const app = (await import('../app')).default;

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'a@a.com', password: '123' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: '1', email: 'a@a.com', token: 't' });
  });
});
