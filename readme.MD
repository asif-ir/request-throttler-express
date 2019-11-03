# Request Throttler Express
A simple request rate throttler for node and express applications.
<h1>
<img src="https://api.travis-ci.org/asif-ir/request-throttler-express.svg?branch=master"/>
</h1>

## Installation
The following command will install and set it up for your current project:

```
    npm install request-throttler-express
```
## Usage
Request throttler can be used just as any other standard express.js middleware.

``` javascript
    const requestThrottler = require('request-throttler-express');
    
    // Registering as a middleware
    app.use(requestThrottler({
        minutesWindow: 5,
        allowedLimit: 20,
    }));
```

