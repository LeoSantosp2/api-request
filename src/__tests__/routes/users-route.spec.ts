import usersRouter from '../../routes/users-route';
import { Router } from 'express';

type RouterWithStack = Router & { stack: unknown[] };

describe('Testing Users Routes', () => {
  it('exports an express router with routes registered', () => {
    expect(usersRouter).toBeDefined();
    expect(
      (usersRouter as RouterWithStack).stack.length,
    ).toBeGreaterThanOrEqual(5);
  });
});
