const axios = require('axios');
const PORT = 3000;
const API_URL = `http://localhost:${PORT}`;
const maxHits = 3;

describe('Should block after rate limit exceeds ::integration', () => {

    it('should return 200 for first 3 requests and 429 for rest', async function () {
        for (let i = maxHits; i > 0; --i) {
            await axios.get(API_URL);
        }

        axios.get(API_URL).then().catch(err => {
            expect(err.response.status).toBe(429);
        });
    });
});


