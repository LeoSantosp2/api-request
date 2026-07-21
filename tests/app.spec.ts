import 'dotenv/config';

import request from 'supertest';
import jwt from 'jsonwebtoken';

import env from '../src/config/env';

jest.mock('../src/modules/users/user-service', () => ({
  service: {
    listAll: jest.fn(),
    listOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../src/modules/login/login-service', () => ({
  service: {
    login: jest.fn(),
  },
}));

describe('Testing App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/users returns json from service', async () => {
    const { service: usersService } = await import(
      '../src/modules/users/user-service'
    );
    (usersService.listAll as jest.Mock).mockResolvedValueOnce([{ id: '1' }]);

    const app = (await import('../src/app')).default;

    const token = jwt.sign({ id: '1', email: 'a@a.com' }, env.TOKEN_SECRET);

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: '1' }]);
  });

  it('GET /api/users without a token returns 401 and does not call the service', async () => {
    const { service: usersService } = await import(
      '../src/modules/users/user-service'
    );
    const app = (await import('../src/app')).default;

    const res = await request(app).get('/api/users');

    expect(res.status).toBe(401);
    expect(usersService.listAll).not.toHaveBeenCalled();
  });

  it('GET /api/users with an invalid token returns 401', async () => {
    const app = (await import('../src/app')).default;

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(res.status).toBe(401);
  });

  it('GET /api/users/:id without a token returns 401', async () => {
    const { service: usersService } = await import(
      '../src/modules/users/user-service'
    );
    const app = (await import('../src/app')).default;

    const res = await request(app).get('/api/users/1');

    expect(res.status).toBe(401);
    expect(usersService.listOne).not.toHaveBeenCalled();
  });

  it('PUT /api/users/:id without a token returns 401 and does not call the service', async () => {
    const { service: usersService } = await import(
      '../src/modules/users/user-service'
    );
    const app = (await import('../src/app')).default;

    const res = await request(app).put('/api/users/1').send({
      firstName: 'New',
      lastName: 'Name',
      email: 'new@email.com',
      password: '12345678',
      confirmPassword: '12345678',
    });

    expect(res.status).toBe(401);
    expect(usersService.update).not.toHaveBeenCalled();
  });

  it('PUT /api/users/:id with a valid token passes through to the service', async () => {
    const { service: usersService } = await import(
      '../src/modules/users/user-service'
    );
    (usersService.update as jest.Mock).mockResolvedValueOnce(undefined);

    const app = (await import('../src/app')).default;

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
    expect(usersService.update).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: 'New' }),
      '1',
      '1',
    );
  });

  it('DELETE /api/users/:id without a token returns 401 and does not call the service', async () => {
    const { service: usersService } = await import(
      '../src/modules/users/user-service'
    );
    const app = (await import('../src/app')).default;

    const res = await request(app).delete('/api/users/1');

    expect(res.status).toBe(401);
    expect(usersService.delete).not.toHaveBeenCalled();
  });

  it('DELETE /api/users/:id with a valid token passes through to the service', async () => {
    const { service: usersService } = await import(
      '../src/modules/users/user-service'
    );
    (usersService.delete as jest.Mock).mockResolvedValueOnce(undefined);

    const app = (await import('../src/app')).default;

    const token = jwt.sign({ id: '1', email: 'a@a.com' }, env.TOKEN_SECRET);

    const res = await request(app)
      .delete('/api/users/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(usersService.delete).toHaveBeenCalledWith('1', '1');
  });

  it('POST /api/login returns json from service', async () => {
    const { service: loginService } = await import(
      '../src/modules/login/login-service'
    );
    (loginService.login as jest.Mock).mockResolvedValueOnce({
      id: '1',
      email: 'a@a.com',
      token: 't',
    });

    const app = (await import('../src/app')).default;

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'a@a.com', password: '12345678' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: '1', email: 'a@a.com', token: 't' });
  });
});
