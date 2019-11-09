const redis = require('redis');

class RedisClient {
  constructor(connection) {
    if (connection) this.client = redis.createClient(...connection);
    else this.client = redis.createClient();
  }

  getValue(key, cb) {
    cb = cb || (() => {});
    return this.client.get(key, cb);
  }

  setKey(key, value, expirationSeconds, cb) {
    cb = cb || (() => {});
    this.client.set(key, value, 'EX', expirationSeconds, cb);
  }
}

module.exports = RedisClient;
