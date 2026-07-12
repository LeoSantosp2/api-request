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

  it('GET /api/users without a token returns 401 and does not call the service', async () => {
    const usersService = await import('../services/users-service');
    const app = (await import('../app')).default;

    const res = await request(app).get('/api/users');

    expect(res.status).toBe(401);
    expect(usersService.listAll).not.toHaveBeenCalled();
  });

  it('GET /api/users with an invalid token returns 401', async () => {
    const app = (await import('../app')).default;

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(res.status).toBe(401);
  });

  it('GET /api/users/:id without a token returns 401', async () => {
    const usersService = await import('../services/users-service');
    const app = (await import('../app')).default;

    const res = await request(app).get('/api/users/1');

    expect(res.status).toBe(401);
    expect(usersService.listOne).not.toHaveBeenCalled();
  });

  it('PUT /api/users/:id without a token returns 401 and does not call the service', async () => {
    const usersService = await import('../services/users-service');
    const app = (await import('../app')).default;

    const res = await request(app).put('/api/users/1').send({
      firstName: 'New',
      lastName: 'Name',
      email: 'new@email.com',
      password: '12345678',
      confirmPassword: '12345678',
    });

    expect(res.status).toBe(401);
    expect(usersService.updateUser).not.toHaveBeenCalled();
  });

  it('PUT /api/users/:id with a valid token passes through to the service', async () => {
    const usersService = await import('../services/users-service');
    (usersService.updateUser as jest.Mock).mockResolvedValueOnce(undefined);

    const app = (await import('../app')).default;

    const token = jwt.sign({ id: '1', email: 'a@a.com' }, env.TOKEN_SECRET);

    const res = await request(app)
      .put('/api/users/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'New',
        lastName: 'Name',
        email: 'new@email.com',
        password: '12345678',
        confirmPassword: '12345678',
      });

    expect(res.status).toBe(200);
    expect(usersService.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: 'New' }),
      '1',
      '1',
    );
  });

  it('DELETE /api/users/:id without a token returns 401 and does not call the service', async () => {
    const usersService = await import('../services/users-service');
    const app = (await import('../app')).default;

    const res = await request(app).delete('/api/users/1');

    expect(res.status).toBe(401);
    expect(usersService.deleteUser).not.toHaveBeenCalled();
  });

  it('DELETE /api/users/:id with a valid token passes through to the service', async () => {
    const usersService = await import('../services/users-service');
    (usersService.deleteUser as jest.Mock).mockResolvedValueOnce(undefined);

    const app = (await import('../app')).default;

    const token = jwt.sign({ id: '1', email: 'a@a.com' }, env.TOKEN_SECRET);

    const res = await request(app)
      .delete('/api/users/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(usersService.deleteUser).toHaveBeenCalledWith('1', '1');
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
      .send({ email: 'a@a.com', password: '12345678' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: '1', email: 'a@a.com', token: 't' });
  });
});
