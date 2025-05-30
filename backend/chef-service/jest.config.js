module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFiles: ['dotenv/config'], // Load .env file for tests
  // globals: {
  //   'ts-jest': {
  //     tsconfig: 'tsconfig.json', // Explicitly specify tsconfig if needed
  //   },
  // },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  verbose: true,
}; 