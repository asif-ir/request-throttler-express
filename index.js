const moment = require('moment');
const CacheClient = require('./cache-client');
const RedisClient = require('./redis-client');

const noOp = () => {};

/*
    Default implementation of getting IP address out of user request
 */
const _ipGetter = req => {
  return req.ip;
};

/*
    Default implementation of handling client connection error
 */
const _errorHandler = err => {
  console.error(err);
};

/*
    Set the user IP as key in cache for reference
 */
const _registerUser = (client, ip, ttl) => {
  const entry = {
    hits: 1,
    firstHit: moment().unix(),
  };
  client.setKey(ip, JSON.stringify(entry), ttl);
};

/*
    Send a 429 status response for too many requests
 */
const _throttleUser = res => {
  res.status(429);
  res.json({ message: 'Rate limit exceeded, slow down.' });
};

/*
    Handle request by a user who already requested in the last window
 */
const _handleRevisit = (result, client, maxHits, res, ip, ttl) => {
  const data = JSON.parse(result);
  if (data.hits >= maxHits) {
    // Sub case - where the visited user has exceeded their limits
    _throttleUser(res);
    return false;
  }
  ++data.hits;
  client.setKey(ip, JSON.stringify(data), ttl);
  return true;
};

/*
  Main logic for middleware
 */
const _middleWareLogic = (options, client) => {
  let {
    ttl,
    maxHits,
    ipGetter,
    throttleHandler,
    errorHandler,
  } = options;

  ttl = ttl || 60; // Size of the window in seconds (time to live)
  maxHits = maxHits || 10; // Hit limit for a user in a time window
  ipGetter = ipGetter || _ipGetter; // Function to retrieve the user IP from the request object
  throttleHandler = throttleHandler || noOp; // Function to execute if limits were exceeded
  errorHandler = errorHandler || _errorHandler; // Function to execute if limits were exceeded

  const cacheClient = new CacheClient(client);

  return (req, res, next) => {
    const ip = ipGetter(req);

    cacheClient.getValue(ip, (err, result) => {
      if (err) return errorHandler(err);
      if (result) {
        // Case - where user has already visited in the current time window
        client.getValue(ip, (err, result) => {
          const success = _handleRevisit(
            result,
            client,
            maxHits,
            res,
            ip,
            ttl,
          );
          if (success) next();
          else throttleHandler(req);
        });
      } else {
        // Case - a new user has made the request
        _registerUser(client, ip, ttl);
        next();
      }
    });
  };
};

/*
  Middleware implementation with redis
 */
const redisMiddleware = options => {
  options = options || {};
  const { connection } = options;
  const redisClient = new RedisClient(connection);
  return _middleWareLogic(options, redisClient);
};

/*
  Middleware implementation with memcached
 */
const memcachedMiddleware = options => {
  throw {
    name: 'NotImplementedError',
    message: 'This feature is under development',
  };
};

/*
    Entry point for middleware access, more caching stores can be added
 */
const requestThrottler = {
  redis: redisMiddleware,
  memcached: memcachedMiddleware,
};

module.exports = requestThrottler;
