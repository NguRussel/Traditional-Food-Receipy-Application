module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFiles: ['dotenv/config'], // Load .env file for tests
  // setupFilesAfterEnv: ['<rootDir>/src/testSetup.ts'], // If you have a test setup file
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  verbose: true,
  testTimeout: 30000, // Optional: Increase timeout for longer tests (e.g., DB interactions)
}; 