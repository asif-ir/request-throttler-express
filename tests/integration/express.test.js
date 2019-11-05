const axios = require('axios');
const redis = require('redis');
const PORT = 3000;
const API_URL = `http://localhost:${PORT}`;
const maxHits = 3;

const client = redis.createClient();

describe('Should block after rate limit exceeds ::integration', () => {
    beforeEach(async (done) => {
        const localIp = '::ffff:127.0.0.1';
        client.del([localIp], (err) => {
            if (!err) {
                client.keys('*', (err, res) => {
                    console.log('keys', res);
                });
                done();
            }
        });
    });

    it('should return 200 for first 3 requests and 429 for rest', async function () {
        for (let i = maxHits; i > 0; --i) {
            await axios.get(API_URL);
        }

        axios.get(API_URL).then().catch(err => {
            expect(err.response.status).toBe(429);
        });
    });
});


