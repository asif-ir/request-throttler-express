import requestThrottler from '../../';

describe('request-throttler ::unit', function() {
  it('should return a proper function', function() {
    expect(requestThrottler.redis).toBeInstanceOf(Function);
  });

  it('should return another function as the middleware', function() {
    expect(requestThrottler.redis({})).toBeInstanceOf(Function);
    expect(requestThrottler.redis()).toBeInstanceOf(Function);
  });
});
