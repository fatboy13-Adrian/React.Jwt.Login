module.exports = {
  moduleDirectories: ["node_modules", "src"],
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
  },
  // Optional if using ESModules
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
};