const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  rootDir: process.cwd(),
  
  // Only test files in __tests__ directories
  testMatch: [
    '<rootDir>/__tests__/**/*.(ts|tsx|js)',
  ],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transform files
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: false
    }]
  },
  
  // Module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/index.tsx'
  ],
  
  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Ignore source files - only run tests from __tests__
  testPathIgnorePatterns: ['/src/', '/lib/', '/node_modules/'],
  
  // Transform ignore patterns - don't ignore anything
  transformIgnorePatterns: [],
};

module.exports = config;
