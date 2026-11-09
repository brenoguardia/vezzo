/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  testMatch: ["<rootDir>/src/**/*.test.tsx", "<rootDir>/src/{api,auth,components,features,i18n,lib,store}/**/*.test.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
};
