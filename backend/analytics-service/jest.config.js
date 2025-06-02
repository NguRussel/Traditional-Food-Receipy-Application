/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
    '<rootDir>/src'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // If you use path aliases like @/
  },
  // Optional: Setup files to run before each test file
  // setupFilesAfterEnv: ['<rootDir>/src/testSetup.ts'],
  // Optional: Code coverage configuration
  // collectCoverage: true,
  // coverageDirectory: "coverage",
  // collectCoverageFrom: [
  //   "src/**/*.ts",
  //   "!src/**/*.d.ts",
  //   "!src/server.ts",
  //   "!src/swaggerConfig.ts"
  // ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  clearMocks: true,
}; 