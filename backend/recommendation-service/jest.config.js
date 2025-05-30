/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\.(ts|tsx)$': ['ts-jest', {
      // ts-jest configuration options
      tsconfig: 'tsconfig.json', // or your specific tsconfig for tests if you have one
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Optional: Setup files after env is setup
  // setupFilesAfterEnv: ['<rootDir>/src/testSetup.ts'], 
  // Optional: Code coverage configuration
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8", // or "babel"
  collectCoverageFrom: [
    "src/**/*.{ts,js}",
    "!src/**/*.d.ts",
    "!src/server.ts", // Usually, server setup is not part of unit tests directly
    // You might want to exclude models or other specific files/patterns if not testing them directly
    // "!src/models/**/*.ts",
  ],
  // Module name mapper for handling aliases (if you use them in tsconfig.paths)
  // moduleNameMapper: {
  //   '^@/(.*)$': '<rootDir>/src/$1',
  // },
}; 