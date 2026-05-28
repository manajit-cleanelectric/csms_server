module.exports = {
    preset: 'ts-jest',

    testEnvironment: 'node',

    roots: ['<rootDir>/src/tests'],

    testMatch: [
        '**/*.spec.ts'
    ],

    moduleFileExtensions: [
        'ts',
        'js',
        'json'
    ],

    setupFilesAfterEnv: [
        '<rootDir>/src/tests/setup/setup.ts'
    ],

    globalTeardown:
        '<rootDir>/src/tests/setup/teardown.ts',

    collectCoverageFrom: [
        'src/**/*.ts',

        '!src/index.ts',
        '!src/tests/**',
        '!src/migrations/**'
    ],

    coverageDirectory: 'coverage',

    clearMocks: true,

    verbose: true,

    detectOpenHandles: true,

    forceExit: true,

    testTimeout: 30000
};