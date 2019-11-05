const express = require('express');
const requestThrottler = require('../../index');
const port = 3000;
const app = express();
app.use(requestThrottler({minutesWindow: 0.1, maxHits: 3}));

app.get('/', (req, res) => {
    res.status(200);
    res.json({status: 'UP'});
});

app.listen(port, () => console.log(`Server is running on ${port}`));