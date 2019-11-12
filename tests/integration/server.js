const express = require('express');
const requestThrottler = require('../../index');
const port = 12000;
const app = express();
app.use(requestThrottler.redis({
  minutesWindow: 0.1,
  maxHits: 3,
  connection: {
    host: 'localhost',
    port: 6379,
  }
}));

app.get('/', (req, res) => {
  res.status(200);
  res.json({ status: 'UP' });
});

app.listen(port, () => console.log(`Server is running on ${port}`));
