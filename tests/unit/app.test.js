const requestThrottler = require('../../');

describe('request-throttler ::unit', function () {
    it('should return a proper function', function () {
        expect(requestThrottler).toBeInstanceOf(Function);
    });

    it('should return another function as the middleware', function () {
        expect(requestThrottler({})).toBeInstanceOf(Function);
    });
});
