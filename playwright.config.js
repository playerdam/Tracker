module.exports = {
  testDir: "./test",
  timeout: 30000,
  use: { baseURL: "http://localhost:3199", viewport: { width: 390, height: 844 } },
  webServer: {
    command: "node test/stub-server.js",
    port: 3199,
    reuseExistingServer: true,
  },
};
