/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: {
        esModuleInterop: true,
        isolatedModules: true,
      },
    }],
  },
};