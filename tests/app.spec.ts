import 'dotenv/config';

import request from 'supertest';
import jwt from 'jsonwebtoken';

import env from '../src/config/env';

jest.mock('../src/infrastructure/database/prisma.users.repository', () => ({
  PrismaRepository: jest.fn().mockImplementation(() => ({
    listAll: jest.fn(),
    listOne: jest.fn(),
    listPublic: jest.fn(),
    showByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
}));

describe('Testing App', () => {
  type MockedRepository = {
    listAll: jest.Mock;
    listOne: jest.Mock;
    listPublic: jest.Mock;
    showByEmail: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const loadApp = async () => {
    const { PrismaRepository } = await import(
      '../src/infrastructure/database/prisma.users.repository'
    );
    const app = (await import('../src/app')).default;

    const instances = (PrismaRepository as jest.Mock).mock.results.map(
      (result) => result.value as MockedRepository,
    );

    // src/presentation/routes/users.ts constructs the repository first,
    // src/presentation/routes/login.ts second (import order in app.ts).
    const [usersRepository, loginRepository] = instances;

    return { app, usersRepository, loginRepository };
  };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
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

  it('POST /api/login returns 401 when the repository finds no matching user', async () => {
    const { app, loginRepository } = await loadApp();
    loginRepository.showByEmail.mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'a@a.com', password: '12345678' });

    expect(res.status).toBe(401);
  });
});
