module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'controllers/**/*.js',
        'models/**/*.js',
        'helpers/**/*.js',
        '!**/node_modules/**',
        '!**/tests/**',
        'controllers/PaymentController.js',
        'useCases/payment/*.js',
        'models/Payment.js'
    ],
    testMatch: ['**/tests/**/*.test.js'],
    setupFilesAfterEnv: ['./tests/setup.js'],
    testTimeout: 10000,
    coverageReporters: ['text', 'html', 'lcov'],
}