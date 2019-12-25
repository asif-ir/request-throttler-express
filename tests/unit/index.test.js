const requestThrottler = require('../../');
const {
  ipGetter,
  errorHandler,
  registerUser,
  throttleUser,
  handleRevisit,
  middleWareLogic,
  redisMiddleware,
  memcachedMiddleware,
} = require('../../').privates;

describe('request-throttler ::unit', () => {
  describe('requestThrottler', () => {
    it('should return a proper function', () => {
      expect(requestThrottler.redis).toBeInstanceOf(Function);
    });

    it('should return another function as the middleware', () => {
      expect(requestThrottler.redis({})).toBeInstanceOf(Function);
      expect(requestThrottler.redis()).toBeInstanceOf(Function);
    });
  });

  describe('ipGetter', () => {
    it('should return a usual express.js conforming IP', () => {
      const req = {ip: '1.2.3.4'};
      const ip = ipGetter(req);
      expect(ip).toBe('1.2.3.4');
    });
  });

  describe('errorHandler', () => {
    it('should return undefined', () => {
      const retVal = errorHandler({});
      expect(retVal).toBe(retVal);
    });
  });

  describe('throttleUserBySending429', () => {
    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(200);
      res.json = jest.fn().mockReturnValue({ message: 'Dummy Message' });
      return res;
    };

    it('should return 429 status', () => {
      const res = mockResponse();
      throttleUser(res);
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({ message: 'Rate limit exceeded, slow down.' });
    })
  })

  describe('throttleUser', () => {
    const originalConsoleErr = console.error;
    let consoleErrData = [];

    // Mocking console.err
    beforeEach(() => (console.error = (err) => consoleErrData.push(err)));
    afterEach(() => {
      console.error = originalConsoleErr;
      consoleErrData = [];
    });

    it('should return undefined', () => {
      const retVal = errorHandler({});
      expect(retVal).toBe(retVal);
    });

    it('should console log an error', () => {
      const errString = 'Something bad';
      errorHandler(errString);
      expect(consoleErrData.length).toBe(1);
      expect(consoleErrData[0]).toEqual(errString);
    });
  });
});
