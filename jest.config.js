const path = require('node:path');

/** @type {import("jest").Config} **/
module.exports = {
  rootDir: __dirname,
  roots: ['<rootDir>/src'],
  testEnvironment: "node",
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  transform: {
    "^.+\\.tsx?$": [require.resolve('ts-jest'), {
      tsconfig: path.join(__dirname, 'tsconfig.test.json'),
    }],
  },
};
