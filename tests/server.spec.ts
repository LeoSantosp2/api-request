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

    jest.doMock('../src/config/env', () => ({
      __esModule: true,
      default: {
        API_PORT: '3333',
      },
    }));

    jest.doMock('../src/config/prisma', () => ({
      __esModule: true,
      default: { $disconnect: jest.fn() },
    }));

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await import('../src/server');

    expect(listen).toHaveBeenCalledWith('3333', expect.any(Function));
    expect(logSpy).toHaveBeenCalled();
    expect(fakeServer.on).toHaveBeenCalledWith('error', expect.any(Function));
  });
});
