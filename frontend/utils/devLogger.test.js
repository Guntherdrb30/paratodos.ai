import { devLogger } from './devLogger.js';

describe('devLogger', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
  });

  it('logs messages in development mode', () => {
    process.env.NODE_ENV = 'development';
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    devLogger('hello');
    expect(logSpy).toHaveBeenCalledWith('hello');
  });

  it('does not log messages in production mode', () => {
    process.env.NODE_ENV = 'production';
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    devLogger('hello');
    expect(logSpy).not.toHaveBeenCalled();
  });
});
