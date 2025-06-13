module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    // If you have path aliases in tsconfig.json, map them here
    // Example: '@config/(.*)': '<rootDir>/src/config/$1'
  },
  // setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'], // Optional: for global test setup
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  coverageThreshold: { // Optional: enforce coverage levels
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
}; 