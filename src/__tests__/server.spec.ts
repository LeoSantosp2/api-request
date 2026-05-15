describe('Testing Server bootstrap', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('calls app.listen with configured port', async () => {
    const listen = jest.fn((_: unknown, cb?: () => void) => cb?.());

    jest.doMock('../app', () => ({
      __esModule: true,
      default: { listen },
    }));

    jest.doMock('../config/env', () => ({
      __esModule: true,
      default: {
        API_PORT: '3333',
      },
    }));

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

    await import('../server');

    expect(listen).toHaveBeenCalledWith('3333', expect.any(Function));
    expect(logSpy).toHaveBeenCalled();
  });
});
