const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

class SentryAdapter {
  init() {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
      integrations: [
        nodeProfilingIntegration(),
      ],
    });
  }

  captureException(error) {
    Sentry.captureException(error);
  }

  captureMessage(message) {
    Sentry.captureMessage(message);
  }

  getInstance() {
    return Sentry;
  }
}

module.exports = new SentryAdapter();