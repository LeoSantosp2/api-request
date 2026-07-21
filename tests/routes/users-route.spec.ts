import { Router } from 'express';

type RouterWithStack = Router & { stack: unknown[] };

describe('Testing Users Routes', () => {
  it('exports an express router with routes registered', () => {
    jest.resetModules();

    jest.doMock('../../src/config/env', () => ({
      __esModule: true,
      default: {
        TOKEN_SECRET: 'test-secret',
        API_PORT: '3000',
      },
    }));

    jest.doMock('../../src/config/prisma', () => ({
      __esModule: true,
      default: {},
    }));

    return import('../../src/modules/users/user-router').then(
      ({ default: usersRouter }) => {
        expect(usersRouter).toBeDefined();
        expect(
          (usersRouter as RouterWithStack).stack.length,
        ).toBeGreaterThanOrEqual(5);
      },
    );
  });
});
