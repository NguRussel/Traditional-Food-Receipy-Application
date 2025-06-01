/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/?(*.)+(spec|test).ts"
  ],
  moduleNameMapper: {
    // Handle module aliases (if you have them in tsconfig.json)
    // For example: '@src/(.*)': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: [
    // '<rootDir>/src/test-setup.ts' // if you have a global setup file
  ]
}; 