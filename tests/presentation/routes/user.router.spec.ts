import { Router } from 'express';

type RouterWithStack = Router & { stack: unknown[] };

describe('Testing Users Routes', () => {
  const loadRouter = (nodeEnv: string) => {
    jest.resetModules();

    jest.doMock('../../../src/infrastructure/config/env', () => ({
      __esModule: true,
      default: {
        TOKEN_SECRET: 'test-secret',
        API_PORT: '3000',
        NODE_ENV: nodeEnv,
      },
    }));

    jest.doMock('../../../src/infrastructure/database/prisma.config', () => ({
      prisma: {},
    }));

    return import('../../../src/presentation/routes/user.router').then(
      ({ default: usersRouter }) => usersRouter as RouterWithStack,
    );
  };

  const listRoutes = (router: RouterWithStack) =>
    router.stack.map((layer) => {
      const { route } = layer as {
        route: { path: string; methods: Record<string, boolean> };
      };

      return `${Object.keys(route.methods)[0]} ${route.path}`;
    });

  it('exports an express router with routes registered', async () => {
    const usersRouter = await loadRouter('test');

    expect(usersRouter).toBeDefined();
    expect(usersRouter.stack.length).toBeGreaterThanOrEqual(5);
  });

  it('registers GET /users outside production', async () => {
    const routes = listRoutes(await loadRouter('development'));

    expect(routes).toContain('get /users');
    expect(routes).toHaveLength(5);
  });

  it('does not register GET /users in production', async () => {
    const routes = listRoutes(await loadRouter('production'));

    expect(routes).not.toContain('get /users');
    expect(routes).toContain('get /users/:id');
    expect(routes).toHaveLength(4);
  });
});
