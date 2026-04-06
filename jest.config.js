module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/setup/jest.setup.js'],
  modulePathIgnorePatterns: ['<rootDir>/api_project_ref/'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  moduleNameMapper: {
    '^uuid$': '<rootDir>/tests/helpers/uuidMock.js',
  },
  detectOpenHandles: true,
  forceExit: true,
  testTimeout: 15000,
  verbose: true,
};
