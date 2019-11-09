class CacheClient {
  constructor(client) {
    this.client = client;
  }

  getValue (key, cb) {
    this.client.getValue(key, cb);
  }

  setKey(key, value, expirationSeconds, cb) {
    this.client.setKey(key, value, expirationSeconds, cb);
  }
}

module.exports = CacheClient;
