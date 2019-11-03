const redis = require('redis');
const moment = require('moment');

// Redis client
const client = redis.createClient();

/*
    Default implementation of getting IP address out of user request
 */
const _ipGetter = req => {
    return req.ip;
};

/*
    Set the user IP as key in cache for reference
 */
const _registerUser = (client, ip, minutesWindow) => {
    const entry = {
        hits: 1,
        firstHit: moment().unix(),
    };
    client.set(ip, JSON.stringify(entry), 'EX', minutesWindow * 60);
};

/*
    Send a 429 status response for too many requests
 */
const _throttleUser = res => {
    res.status(429);
    res.json({ message: "Rate limit exceeded, slow down." });
};

/*
    Handle request by a user who already requested in the last window
 */
const _handleRevisit = (result, maxHits, res, ip, minutesWindow) => {
    const data = JSON.parse(result);
    if (data.hits >= maxHits) {
        // Sub case - where the visited user has exceeded their limits
        _throttleUser(res);
        return false;
    }
    ++data.hits;
    client.set(ip, JSON.stringify(data), 'EX', minutesWindow * 60);
    return true;
};

/*
    Middleware for throttling requests
 */
const requestThrottler = options => {
    if (!options) options = {};
    let { minutesWindow, maxHits, ipGetter } = options;

    minutesWindow = minutesWindow || 1; // Size of the window in minutes
    maxHits = maxHits || 10; // Hit limit for a user in a time window
    ipGetter = ipGetter || _ipGetter; // A function to retrieve the user IP from the request object

    return (req, res, next) => {
        const ip = ipGetter(req);

        client.exists(ip, (err, result) => {
            if (err) {
                console.error(`Failed connecting to Redis: ${err}`);
                return;
            }
            if (result) {
                // Case - where user has already visited in the current time window
                client.get(ip, (err, result) => {
                    const success = _handleRevisit(result, maxHits, res, ip, minutesWindow);
                    if (success) next();
                });
            } else {
                // Case - a new user has made the request
                _registerUser(client, ip, minutesWindow);
                next();
            }
        });
    };
};

module.exports = requestThrottler;
