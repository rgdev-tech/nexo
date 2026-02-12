/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['ts', 'js', 'json'],
  rootDir: '.',
  testRegex: '.e2e-spec.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleNameMapper: {
    '^shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  testTimeout: 30000,
  forceExit: true,
};
