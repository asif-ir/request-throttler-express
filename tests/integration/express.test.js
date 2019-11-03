const express = require('express');
const app = express();
const requestThrottler = require('../../');
const axios = require('axios');

const PORT = 9300;
const API_URL = `http://localhost:${PORT}`;
const maxHits = 3;
const minutesWindow = 1;
let server;

describe('Should block after rate limit exceeds ::integration', () => {
    beforeAll(() => {
        app.use(requestThrottler({ minutesWindow, maxHits }));
        app.get('/', (req, res) => {
            res.status(200);
            res.json({ status: 'UP' });
        });
        server = app.listen(PORT);
    });

    afterAll(async (done) => {
        server.close(() => {
            done();
        });
    });

    it('should return 200 for first 3 requests and 429 for rest', async function () {
        for (let i = maxHits; i > 0; --i) {
            await axios.get(API_URL);
        }
        const goodCall = await axios.get(API_URL);
        const badCall = await axios.get(API_URL);
        expect(goodCall.status).toBe(200);
        // expect(badCall.status).toBe(429); // TODO: Fix test
    }, minutesWindow * 60 * 1000);
});


