module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/utils/',
    '/__tests__/integration/helpers/',
    '__tests__/setup.ts'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        baseUrl: '.',
        paths: {
          '@application/*': ['src/application/*'],
          '@domain/*': ['src/domain/*'],
          '@infrastructure/*': ['src/infrastructure/*'],
          '@shared/*': ['src/shared/*'],
          '@tests/*': ['src/__tests__/*'],
          '@/*': ['src/*']
        }
      }
    }]
  },

  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@tests/(.*)$': '<rootDir>/src/__tests__/$1',
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/**/index.ts',
  ],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};