jest.mock('@sentry/node')

const Sentry = require('@sentry/node')
const sentryAdapter = require('../../adapters/monitoring/SentryAdapter')

describe('SentryAdapter', () => {
  it('deve capturar exceções', () => {
    const error = new Error('Teste')

    sentryAdapter.captureException(error)

    expect(Sentry.captureException).toHaveBeenCalledWith(error)
  })
})