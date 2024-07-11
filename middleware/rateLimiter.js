const rateLimit = require('express-rate-limit');

// Define the rate limiter function
const createRateLimiter = (windowMs, max) => {
    return rateLimit({
        windowMs: windowMs,
        max: max,
        message: `Too many requests, please try again after a while`
    });
};

module.exports = createRateLimiter;
