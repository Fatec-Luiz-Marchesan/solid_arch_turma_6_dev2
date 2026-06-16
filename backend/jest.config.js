module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  transformIgnorePatterns: ['node_modules/(?!(uuid)/)'],
  setupFiles: ['./tests/globalMocks/petControllerMock.js'],
  setupFilesAfterEnv: ['./tests/setup.js'],
  testTimeout: 60000,
  forceExit: true,
  verbose: true,
  maxWorkers: 1
};
