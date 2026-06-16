const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { message: 'Muitas requisições, tente novamente mais tarde.' },
  standardHeaders: true, 
  legacyHeaders: false, 
});

module.exports = limiter;