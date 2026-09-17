import 'dotenv/config';

import request from 'supertest';
import jwt from 'jsonwebtoken';

import env from '../src/infrastructure/config/env';

jest.mock('../src/infrastructure/repositories/prisma.users.repository', () => ({
  PrismaUsersRepository: jest.fn().mockImplementation(() => ({
    listAll: jest.fn(),
    listOne: jest.fn(),
    listPublic: jest.fn(),
    showByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
}));

jest.mock(
  '../src/infrastructure/repositories/prisma.refresh.token.repository',
  () => ({
    PrismaRefreshTokenRepository: jest.fn().mockImplementation(() => ({
      listByHash: jest.fn(),
      create: jest.fn(),
      revoke: jest.fn(),
      revokeAll: jest.fn(),
    })),
  }),
);

describe('Testing App', () => {
  type MockedUsersRepository = {
    listAll: jest.Mock;
    listOne: jest.Mock;
    listPublic: jest.Mock;
    showByEmail: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  type MockedRefreshTokenRepository = {
    listByHash: jest.Mock;
    create: jest.Mock;
    revoke: jest.Mock;
    revokeAll: jest.Mock;
  };

  const loadApp = async () => {
    const { PrismaUsersRepository } = await import(
      '../src/infrastructure/repositories/prisma.users.repository'
    );
    const { PrismaRefreshTokenRepository } = await import(
      '../src/infrastructure/repositories/prisma.refresh.token.repository'
    );
    const app = (await import('../src/app')).default;

    // user.router.ts constructs the users repository first, auth.router.ts
    // second (import order in app.ts).
    const [usersRepository, authUsersRepository] = (
      PrismaUsersRepository as unknown as jest.Mock
    ).mock.results.map((result) => result.value as MockedUsersRepository);

    const [refreshTokenRepository] = (
      PrismaRefreshTokenRepository as unknown as jest.Mock
    ).mock.results.map(
      (result) => result.value as MockedRefreshTokenRepository,
    );

    return {
      app,
      usersRepository,
      authUsersRepository,
      refreshTokenRepository,
    };
  };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('GET /api/health returns ok', async () => {
    const { app } = await loadApp();

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /api/docs.json returns the OpenAPI document', async () => {
    const { app } = await loadApp();

    const res = await request(app).get('/api/docs.json');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body.openapi).toBe('3.0.0');
    expect(res.body.info).toEqual(
      expect.objectContaining({ title: 'API Request' }),
    );
  });

  it('GET /api/docs.json exposes the documented paths', async () => {
    const { app } = await loadApp();

    const res = await request(app).get('/api/docs.json');

    expect(Object.keys(res.body.paths)).toEqual(
      expect.arrayContaining([
        '/api/auth/login',
        '/api/auth/refresh-token',
        '/api/auth/logout',
        '/api/docs.json',
        '/api/health',
        '/api/users',
        '/api/users/{id}',
      ]),
    );
  });

  it('GET /api/docs.json does not shadow the swagger ui on /api/docs', async () => {
    const { app } = await loadApp();

    const res = await request(app).get('/api/docs/');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
  });

  it('GET /api/docs.json returns 404 in production', async () => {
    const originalNodeEnv = process.env.NODE_ENV;

    try {
      // env.ts parses process.env at import time, and loadApp() re-imports it
      // after jest.resetModules(), so the new value is picked up.
      process.env.NODE_ENV = 'production';

      const { app } = await loadApp();

      const res = await request(app).get('/api/docs.json');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        status: 'error',
        message: 'Documentação indisponível.',
      });
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it('GET /api/users returns json from the repository', async () => {
    const { app, usersRepository } = await loadApp();
    usersRepository.listAll.mockResolvedValueOnce([{ id: '1' }]);

    const token = jwt.sign({ id: '1', email: 'a@a.com' }, env.TOKEN_SECRET);

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: '1' }]);
  });

  it('GET /api/users without a token returns 401 and does not call the repository', async () => {
    const { app, usersRepository } = await loadApp();

    const res = await request(app).get('/api/users');

    expect(res.status).toBe(401);
    expect(usersRepository.listAll).not.toHaveBeenCalled();
  });

  it('GET /api/users with an invalid token returns 401', async () => {
    const { app } = await loadApp();

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(res.status).toBe(401);
  });

  it('GET /api/users/:id without a token returns 401', async () => {
    const { app, usersRepository } = await loadApp();

    const res = await request(app).get('/api/users/1');

    expect(res.status).toBe(401);
    expect(usersRepository.listPublic).not.toHaveBeenCalled();
  });

  it('PUT /api/users/:id without a token returns 401 and does not call the repository', async () => {
    const { app, usersRepository } = await loadApp();

    const res = await request(app).put('/api/users/1').send({
      firstName: 'New',
      lastName: 'Name',
      email: 'new@email.com',
      password: '12345678',
      confirmPassword: '12345678',
    });

    expect(res.status).toBe(401);
    expect(usersRepository.update).not.toHaveBeenCalled();
  });

  it('PUT /api/users/:id with a valid token passes through to the repository', async () => {
    const { app, usersRepository } = await loadApp();
    usersRepository.listOne.mockResolvedValueOnce({
      id: '1',
      first_name: 'Old',
      last_name: 'Name',
      email: 'new@email.com',
      password: 'hashed',
    });

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

    expect(res.status).toBe(204);
    expect(usersRepository.update).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ first_name: 'New' }),
    );
  });

  it('DELETE /api/users/:id without a token returns 401 and does not call the repository', async () => {
    const { app, usersRepository } = await loadApp();

    const res = await request(app).delete('/api/users/1');

    expect(res.status).toBe(401);
    expect(usersRepository.delete).not.toHaveBeenCalled();
  });

  it('DELETE /api/users/:id with a valid token passes through to the repository', async () => {
    const { app, usersRepository } = await loadApp();
    usersRepository.delete.mockResolvedValueOnce(undefined);

    const token = jwt.sign({ id: '1', email: 'a@a.com' }, env.TOKEN_SECRET);

    const res = await request(app)
      .delete('/api/users/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
    expect(usersRepository.delete).toHaveBeenCalledWith('1');
  });

  it('POST /api/auth/login returns 401 when the repository finds no matching user', async () => {
    const { app, authUsersRepository } = await loadApp();
    authUsersRepository.showByEmail.mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@a.com', password: '12345678' });

    expect(res.status).toBe(401);
  });

  it('POST /api/auth/login returns 400 for an invalid body', async () => {
    const { app, authUsersRepository } = await loadApp();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: '' });

    expect(res.status).toBe(400);
    expect(authUsersRepository.showByEmail).not.toHaveBeenCalled();
  });

  it('POST /api/auth/refresh-token returns 400 when refreshToken is missing', async () => {
    const { app, refreshTokenRepository } = await loadApp();

    const res = await request(app).post('/api/auth/refresh-token').send({});

    expect(res.status).toBe(400);
    expect(refreshTokenRepository.listByHash).not.toHaveBeenCalled();
  });

  it('POST /api/auth/refresh-token returns 401 for an unknown token', async () => {
    const { app, refreshTokenRepository } = await loadApp();
    refreshTokenRepository.listByHash.mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken: 'unknown-token' });

    expect(res.status).toBe(401);
    expect(refreshTokenRepository.create).not.toHaveBeenCalled();
  });

  it('POST /api/auth/logout returns 400 when refreshToken is missing', async () => {
    const { app, refreshTokenRepository } = await loadApp();

    const res = await request(app).post('/api/auth/logout').send({});

    expect(res.status).toBe(400);
    expect(refreshTokenRepository.revoke).not.toHaveBeenCalled();
  });

  it('POST /api/auth/logout returns 401 for an unknown token', async () => {
    const { app, refreshTokenRepository } = await loadApp();
    refreshTokenRepository.listByHash.mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/api/auth/logout')
      .send({ refreshToken: 'unknown-token' });

    expect(res.status).toBe(401);
    expect(refreshTokenRepository.revoke).not.toHaveBeenCalled();
  });
});
