/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
    '<rootDir>/src'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // If you use path aliases like @/ for src/
  },
  // Optional: Setup files to run before each test file (e.g., for global mocks or env setup)
  // setupFilesAfterEnv: ['<rootDir>/src/testSetup.ts'],
  // Optional: Code coverage configuration
  // collectCoverage: true,
  // coverageDirectory: "coverage",
  // collectCoverageFrom: [
  //   "src/**/*.ts",
  //   "!src/**/*.d.ts", // Exclude type definition files
  //   "!src/server.ts", // Usually exclude server entry point from unit test coverage
  //   "!src/swaggerConfig.ts" // Exclude swagger config
  // ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
}; 