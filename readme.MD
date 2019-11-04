# Request Throttler Express
A simple request rate throttler for node and express applications.
<h1>
<img src="https://api.travis-ci.org/asif-ir/request-throttler-express.svg?branch=master"/>
<img src="https://img.shields.io/npm/v/request-throttler-express.svg?style=flat-square"/>
<img src="https://img.shields.io/david/asif-ir/request-throttler-express.svg?style=flat-square"/>
</h1>

## Installation
The following command will install and set it up for your current project:

``` bash
    npm install request-throttler-express
```

Currently you need to have a redis server running for using this module. More caching stores will be added soon.

## Usage
Request throttler can be used just as any other standard express.js middleware.

``` javascript
    const requestThrottler = require('request-throttler-express');
    
    // Register as a middleware
    app.use(requestThrottler());
```

By default, it will limit to 10 requests per minute. To take more control, check out the possible options you can pass
to the middleware below.

## Options
The middleware function accepts a variety of optional parameters.

- ### minutesWindow
    The size of the time window in minutes. Default value is _1_.
    
- ### maxHits
    The maximum number of requests that can be made from any particular IP in a given window. Default value is _10_.

- ### ipGetter
    This parameter accepts a function with the request object as the argument. It expects the user to return the ip 
    address as a string. The default implementation retrieves the standard express _req.ip_.
    
- ### limitExceededHandler
    This parameter accepts a function with the request object as the argument. The user can do logging and similar 
    things based on their requirements here. By default it's a no-op.
        
## Example Usage
The options can be used in any combination like following:

``` javascript
    app.use(requestThrottler({
        minutesWindow: 5,
        maxHits: 20,
    }));
```


