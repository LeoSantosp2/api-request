import logger from '../../src/presentation/utils/logger';

describe('Logger', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should log an info message', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

    logger.info('info message');

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('info message'));
  });

  it('Should log a success message', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

    logger.success('success message');

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('success message'),
    );
  });

  it('Should log a warning message', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    logger.warn('warn message');

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('warn message'));
  });

  it('Should log an error message with an error object', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('boom');

    logger.error('error message', error);

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('error message'),
      error,
    );
  });

  it('Should log an error message without an error object', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    logger.error('error message');

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('error message'),
      '',
    );
  });
});
