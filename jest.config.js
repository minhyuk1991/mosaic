module.exports = {
  clearMocks: true,
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["jest-plugin-context/setup"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],
};
