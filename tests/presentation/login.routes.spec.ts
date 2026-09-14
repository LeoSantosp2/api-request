import { Router } from 'express';

type RouterWithStack = Router & { stack: unknown[] };

describe('Testing Login Routes', () => {
  it('exports an express router with routes registered', () => {
    jest.resetModules();

    jest.doMock('../../src/config/env', () => ({
      __esModule: true,
      default: {
        TOKEN_SECRET: 'test-secret',
        API_PORT: '3000',
      },
    }));

    jest.doMock('../../src/infrastructure/database/prisma.config', () => ({
      prisma: {},
    }));

    return import('../../src/presentation/routes/login.router').then(
      ({ default: loginRouter }) => {
        expect(loginRouter).toBeDefined();
        expect(
          (loginRouter as RouterWithStack).stack.length,
        ).toBeGreaterThanOrEqual(1);
      },
    );
  });
});
