const sentryAdapter = require('../adapters/monitoring/SentryAdapter');

function initializeSentry() {
  sentryAdapter.init();

  console.log('✅ Sentry iniciado');
}

module.exports = initializeSentry;