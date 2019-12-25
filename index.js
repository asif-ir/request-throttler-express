const moment = require('moment');
const CacheClient = require('./cache-client');
const RedisClient = require('./redis-client');

/*
  Private methods
 */
const _ = {};
_.noOp = () => {};

/*
    Default implementation of getting IP address out of user request
 */
_.ipGetter = req => {
  return req.ip;
};

/*
    Default implementation of handling client connection error
 */
_.errorHandler = err => {
  console.error(err);
};

/*
    Set the user IP as key in cache for reference
 */
_.registerUser = (client, ip, ttl) => {
  const entry = {
    hits: 1,
    firstHit: moment().unix(),
  };
  client.setKey(ip, JSON.stringify(entry), ttl);
};

/*
    Send a 429 status response for too many requests
 */
_.throttleUser = res => {
  res.status(429);
  res.json({ message: 'Rate limit exceeded, slow down.' });
};

/*
    Handle request by a user who already requested in the last window
 */
_.handleRevisit = (result, client, maxHits, res, ip, ttl) => {
  const data = JSON.parse(result);
  if (data.hits >= maxHits) {
    // Sub case - where the visited user has exceeded their limits
    _.throttleUser(res);
    return false;
  }
  ++data.hits;
  client.setKey(ip, JSON.stringify(data), ttl);
  return true;
};

/*
  Main logic for middleware
 */
_.middleWareLogic = (options, client) => {
  let { ttl, maxHits, ipGetter, throttleHandler, errorHandler } = options;

  ttl = ttl || 60; // Size of the window in seconds (time to live)
  maxHits = maxHits || 10; // Hit limit for a user in a time window
  ipGetter = ipGetter || _.ipGetter; // Function to retrieve the user IP from the request object
  throttleHandler = throttleHandler || _.noOp; // Function to execute if limits were exceeded
  errorHandler = errorHandler || _.errorHandler; // Function to execute if limits were exceeded

  const cacheClient = new CacheClient(client);

  return (req, res, next) => {
    const ip = ipGetter(req);

    cacheClient.getValue(ip, (err, result) => {
      if (err) return errorHandler(err);
      if (result) {
        // Case - where user has already visited in the current time window
        client.getValue(ip, (err, result) => {
          const success = _.handleRevisit(
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
        _.registerUser(client, ip, ttl);
        next();
      }
    });
  };
};

/*
  Middleware implementation with redis
 */
_.redisMiddleware = options => {
  options = options || {};
  const { connection } = options;
  const redisClient = new RedisClient(connection);
  return _.middleWareLogic(options, redisClient);
};

/*
  Middleware implementation with memcached
 */
_.memcachedMiddleware = options => {
  throw {
    name: 'NotImplementedError',
    message: 'This feature is under development',
  };
};

/*
    Entry point for middleware access, more caching stores can be added
 */
const requestThrottler = {
  redis: _.redisMiddleware,
  memcached: _.memcachedMiddleware,
};

module.exports = requestThrottler;
module.exports.privates = _;
