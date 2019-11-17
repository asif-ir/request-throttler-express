import moment from 'moment';
import CacheClient from './cache-client';
import RedisClient from './redis-client';

export const noOp = () => {};

/*
    Default implementation of getting IP address out of user request
 */
export const _ipGetter = req => {
  return req.ip;
};

/*
    Default implementation of handling client connection error
 */
export const _errorHandler = err => {
  console.error(err);
};

/*
    Set the user IP as key in cache for reference
 */
export const _registerUser = (client, ip, minutesWindow) => {
  const entry = {
    hits: 1,
    firstHit: moment().unix(),
  };
  client.setKey(ip, JSON.stringify(entry), minutesWindow * 60);
};

/*
    Send a 429 status response for too many requests
 */
export const _throttleUser = res => {
  res.status(429);
  res.json({ message: 'Rate limit exceeded, slow down.' });
};

/*
    Handle request by a user who already requested in the last window
 */
export const _handleRevisit = (
  result,
  client,
  maxHits,
  res,
  ip,
  minutesWindow,
) => {
  const data = JSON.parse(result);
  if (data.hits >= maxHits) {
    // Sub case - where the visited user has exceeded their limits
    _throttleUser(res);
    return false;
  }
  ++data.hits;
  client.setKey(ip, JSON.stringify(data), minutesWindow * 60);
  return true;
};

/*
  Main logic for middleware
 */
export const _middleWareLogic = (options, client) => {
  let {
    minutesWindow,
    maxHits,
    ipGetter,
    throttleHandler,
    errorHandler,
  } = options;

  minutesWindow = minutesWindow || 1; // Size of the window in minutes
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
            minutesWindow,
          );
          if (success) next();
          else throttleHandler(req);
        });
      } else {
        // Case - a new user has made the request
        _registerUser(client, ip, minutesWindow);
        next();
      }
    });
  };
};

/*
  Middleware implementation with redis
 */
export const redisMiddleware = options => {
  options = options || {};
  const { connection } = options;
  const redisClient = new RedisClient(connection);
  return _middleWareLogic(options, redisClient);
};

/*
  Middleware implementation with memcached
 */
export const memcachedMiddleware = options => {
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

export default requestThrottler;
