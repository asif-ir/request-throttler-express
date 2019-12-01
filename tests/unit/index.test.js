import requestThrottler, {
  noOp,
  _ipGetter
} from '../../';

describe('request-throttler ::unit', function() {
  it('should return a proper function', function() {
    expect(requestThrottler.redis).toBeInstanceOf(Function);
  });

  it('should return another function as the middleware', function() {
    expect(requestThrottler.redis({})).toBeInstanceOf(Function);
    expect(requestThrottler.redis()).toBeInstanceOf(Function);
  });
});

describe('noOp ::unit', function() {
  it('should be a function', function() {
    expect(noOp).toBeInstanceOf(Function);
  });

  it('should return undefined', function() {
    expect(noOp()).toBe(undefined);
  });
});

describe('_ipGetter ::unit', function() {
  it('should be a function', function() {
    expect(_ipGetter).toBeInstanceOf(Function);
  });

  it('should return IP address from express request object', function() {
    const request = { ip: '1.2.3.4' };
    expect(_ipGetter(request)).toEqual('1.2.3.4');
  });
});
