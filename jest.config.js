/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFiles: ["<rootDir>/jest.setup.js"],
  testMatch: [
    "<rootDir>/src/**/*.test.tsx",
    "<rootDir>/src/{api,auth,components,features,i18n,lib,store}/**/*.test.ts",
  ],
  moduleNameMapper: {
    "\\.svg$": "<rootDir>/test/svg-mock.js",
    "^@/assets/(.*)$": "<rootDir>/assets/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
