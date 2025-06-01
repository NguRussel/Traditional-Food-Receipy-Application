module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
    '<rootDir>/src'
  ],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\.(ts|tsx)$': 'ts-jest'
  },
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1'
  },
  // Optional: Setup files for before each test run, e.g., for environment variables or mocks
  // setupFilesAfterEnv: ['<rootDir>/src/testSetup.ts'],
  // Collect coverage from src, excluding specific files/folders
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts', // No need to cover declaration files
    '!src/server.ts', // Usually not unit tested directly, but through integration tests
    '!src/models/**', // Models are often simple data structures or tested via DB interactions
    '!src/routes/**', // Routes are tested via integration tests
    '!src/config/**', // Config files
    '!src/utils/logger.ts' // Or similar utility that is hard to unit test or is external
  ],
  coverageThreshold: { // Optional: Enforce coverage levels
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}; 