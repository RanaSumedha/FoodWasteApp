module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["./tests/setup.js"],
  testMatch: ["**/__tests__/**/*.js", "**/*.test.js"],
  passWithNoTests: true,
  collectCoverageFrom: ["src/**/*.js"],
  coverageDirectory: "coverage",
};
