const sentryAdapter = require('../adapters/monitoring/SentryAdapter');
const logger = require('../config/logger');

module.exports = (err, req, res, next) => {
  logger.error(err.message);

  sentryAdapter.captureException(err);

  return res.status(500).json({
    message: 'Erro interno do servidor',
  });
};