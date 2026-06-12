{
  "testEnvironment": "node",
  "testMatch": ["**/__tests__/**/*.test.js"],
  "collectCoverageFrom": [
    "lib/**/*.js",
    "hooks/**/*.js",
    "!**/*.test.js"
  ],
  "coveragePathIgnorePatterns": [
    "/node_modules/",
    "/.next/"
  ],
  "moduleNameMapper": {
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    "^@/hooks/(.*)$": "<rootDir>/hooks/$1"
  }
}
