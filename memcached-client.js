class MemcachedClient {
  constructor(connection) {}

  getValue(key, cb) {}

  setKey(key, value, expirationSeconds, cb) {}
}

module.exports = MemcachedClient;
