module.exports = {
  preset: "ts-jest",
  coverageDirectory: "coverage",
  collectCoverage: false,
  collectCoverageFrom: ["{lib,src}/**/*.{js,ts,jsx,tsx}"],
  globals: {
    "ts-jest": {
      isolatedModules: true
    }
  },
  testEnvironment: "node",
  reporters: ["default"],
  coverageThreshold: {
    global: {
      functions: 75,
      branches: 60
    }
  },
  coveragePathIgnorePatterns: [
    "index.ts",
    "schema.ts",
  ],
};
