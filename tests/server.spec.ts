describe('Testing Server bootstrap', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('calls app.listen with configured port', async () => {
    const fakeServer = { on: jest.fn(), close: jest.fn() };
    const listen = jest.fn((_: unknown, cb?: () => void) => {
      cb?.();
      return fakeServer;
    });

    jest.doMock('../src/app', () => ({
      __esModule: true,
      default: { listen },
    }));

    jest.doMock('../src/infrastructure/config/env', () => ({
      __esModule: true,
      default: {
        API_PORT: '3333',
      },
    }));

    jest.doMock('../src/infrastructure/database/prisma.config', () => ({
      prisma: { $disconnect: jest.fn() },
    }));

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await import('../src/server');

    expect(listen).toHaveBeenCalledWith(3333, expect.any(Function));
    expect(logSpy).toHaveBeenCalled();
    expect(fakeServer.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('falls back to port 3333 when API_PORT is not a number', async () => {
    const fakeServer = { on: jest.fn(), close: jest.fn() };
    const listen = jest.fn((_: unknown, cb?: () => void) => {
      cb?.();
      return fakeServer;
    });

    jest.doMock('../src/app', () => ({
      __esModule: true,
      default: { listen },
    }));

    jest.doMock('../src/infrastructure/config/env', () => ({
      __esModule: true,
      default: {
        API_PORT: '',
      },
    }));

    jest.doMock('../src/infrastructure/database/prisma.config', () => ({
      prisma: { $disconnect: jest.fn() },
    }));

    jest.spyOn(console, 'log').mockImplementation(() => {});

    await import('../src/server');

    expect(listen).toHaveBeenCalledWith(3333, expect.any(Function));
  });

  it('logs a port-in-use message and exits on EADDRINUSE', async () => {
    const fakeServer = { on: jest.fn(), close: jest.fn() };
    const listen = jest.fn((_: unknown, cb?: () => void) => {
      cb?.();
      return fakeServer;
    });

    jest.doMock('../src/app', () => ({
      __esModule: true,
      default: { listen },
    }));

    jest.doMock('../src/infrastructure/config/env', () => ({
      __esModule: true,
      default: { API_PORT: '3333' },
    }));

    jest.doMock('../src/infrastructure/database/prisma.config', () => ({
      prisma: { $disconnect: jest.fn() },
    }));

    jest.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation((() => undefined) as never);

    await import('../src/server');

    const errorHandler = fakeServer.on.mock.calls.find(
      ([event]) => event === 'error',
    )?.[1];

    errorHandler({ code: 'EADDRINUSE' });

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('already in use'),
      '',
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('logs a generic failure message and exits on other listen errors', async () => {
    const fakeServer = { on: jest.fn(), close: jest.fn() };
    const listen = jest.fn((_: unknown, cb?: () => void) => {
      cb?.();
      return fakeServer;
    });

    jest.doMock('../src/app', () => ({
      __esModule: true,
      default: { listen },
    }));

    jest.doMock('../src/infrastructure/config/env', () => ({
      __esModule: true,
      default: { API_PORT: '3333' },
    }));

    jest.doMock('../src/infrastructure/database/prisma.config', () => ({
      prisma: { $disconnect: jest.fn() },
    }));

    jest.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation((() => undefined) as never);

    await import('../src/server');

    const errorHandler = fakeServer.on.mock.calls.find(
      ([event]) => event === 'error',
    )?.[1];

    const genericError = new Error('unexpected');
    errorHandler(genericError);

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to start server'),
      genericError,
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('shuts down gracefully on SIGTERM', async () => {
    const fakeServer = {
      on: jest.fn(),
      close: jest.fn((cb?: () => void) => cb?.()),
    };
    const listen = jest.fn((_: unknown, cb?: () => void) => {
      cb?.();
      return fakeServer;
    });
    const disconnect = jest.fn().mockResolvedValue(undefined);

    jest.doMock('../src/app', () => ({
      __esModule: true,
      default: { listen },
    }));

    jest.doMock('../src/infrastructure/config/env', () => ({
      __esModule: true,
      default: { API_PORT: '3333' },
    }));

    jest.doMock('../src/infrastructure/database/prisma.config', () => ({
      prisma: { $disconnect: disconnect },
    }));

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const exitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation((() => undefined) as never);
    const onSpy = jest.spyOn(process, 'on');

    await import('../src/server');

    const sigtermHandler = onSpy.mock.calls.find(
      ([event]) => event === 'SIGTERM',
    )?.[1] as () => void;

    sigtermHandler();
    await Promise.resolve();
    await Promise.resolve();

    expect(fakeServer.close).toHaveBeenCalled();
    expect(disconnect).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(0);
  });
});
