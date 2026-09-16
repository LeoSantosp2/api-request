import { Router } from 'express';

type RouterWithStack = Router & {
  stack: { route?: { path: string; methods: Record<string, boolean> } }[];
};

describe('Testing Auth Routes', () => {
  const loadRouter = () => {
    jest.resetModules();

    jest.doMock('../../../src/infrastructure/config/env', () => ({
      __esModule: true,
      default: {
        TOKEN_SECRET: 'test-secret',
        TOKEN_EXPIRATION: '30d',
        REFRESH_TOKEN_EXPIRATION: '7',
        API_PORT: '3000',
      },
    }));

    jest.doMock('../../../src/infrastructure/database/prisma.config', () => ({
      prisma: {},
    }));

    return import('../../../src/presentation/routes/auth.router').then(
      ({ default: authRouter }) => authRouter as RouterWithStack,
    );
  };

  it('exports an express router with routes registered', async () => {
    const authRouter = await loadRouter();

    expect(authRouter).toBeDefined();
    expect(authRouter.stack.length).toBeGreaterThanOrEqual(1);
  });

  it('registers POST /auth/login, /auth/refresh-token and /auth/logout', async () => {
    const authRouter = await loadRouter();

    const routes = authRouter.stack
      .filter((layer) => layer.route)
      .map((layer) => ({
        path: layer.route?.path,
        methods: Object.keys(layer.route?.methods ?? {}),
      }));

    expect(routes).toEqual(
      expect.arrayContaining([
        { path: '/auth/login', methods: ['post'] },
        { path: '/auth/refresh-token', methods: ['post'] },
        { path: '/auth/logout', methods: ['post'] },
      ]),
    );
  });
});
