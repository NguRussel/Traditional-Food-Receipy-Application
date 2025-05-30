module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'], // Look for tests in the src directory
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    // Handle module aliases (if you have them in tsconfig.json, e.g., @/components/*)
    // '@/(.*)': '<rootDir>/src/$1'
  },
  // setupFilesAfterEnv: ['<rootDir>/src/testSetup.ts'], // Optional: for setup files like Jest DOM extensions
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  coverageThreshold: { // Optional: enforce coverage thresholds
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10,
    },
  },
}; 