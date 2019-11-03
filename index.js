const redis = require('redis');
const moment = require('moment');

// Redis client
const client = redis.createClient();

/*
    Set the user IP as key in cache for reference
 */
const registerUser = (client, ip, minutesWindow) => {
    let entry = {
        hits: 1,
        firstHit: moment().unix(),
    };
    client.set(ip, JSON.stringify(entry), 'EX', minutesWindow * 60);
};

/*
    Send a 429 status response for too many requests
 */
const throttleUser = res => {
    res.status(429);
    res.json({ message: "Rate limit exceeded, slow down." });
};

/*
    Handle request by a user who already requested in the last window
 */
const handleRevisit = (result, maxHits, res, ip, minutesWindow) => {
    const data = JSON.parse(result);
    if (data.hits >= maxHits) {
        // Sub case - where the visited user has exceeded their limits
        throttleUser(res);
        return false;
    }
    ++data.hits;
    client.set(ip, JSON.stringify(data), 'EX', minutesWindow * 60);
    return true;
};

/*
    Middleware for throttling requests
 */
const requestThrottler = ({ minutesWindow, maxHits }) => {
    minutesWindow = minutesWindow || 1;
    maxHits = maxHits || 5;

    return (req, res, next) => {
        const ip = req.ip;

        client.exists(ip, (err, result) => {
            if (err) {
                console.error(`Failed connecting to Redis: ${err}`);
                return;
            }
            if (result) {
                // Case - where user has already visited in the current time window
                client.get(ip, (err, result) => {
                    const success = handleRevisit(result, maxHits, res, ip, minutesWindow);
                    if (success) next();
                });
            } else {
                // Case - a new user has made the request
                registerUser(client, ip, minutesWindow);
                next();
            }
        });
    };
};

module.exports = requestThrottler;
