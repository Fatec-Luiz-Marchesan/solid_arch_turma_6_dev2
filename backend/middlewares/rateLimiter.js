const rateLimit = require('express-rate-limit');

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Muitas requisições. Tente novamente em 15 minutos.' }
});

const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Muitas requisições. Tente novamente mais tarde.' }
});

module.exports = { strictLimiter, standardLimiter };