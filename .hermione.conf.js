module.exports = {
  sets: {
    desktop: {
      files: "test/hermione",
    },
  },

  browsers: {
    chrome: {
      automationProtocol: "devtools",
      desiredCapabilities: {
        browserName: "chrome",
      },
      windowSize: {
        width: 7680,
        height: 4320
      },
    },
  },
  plugins: {
    "html-reporter/hermione": {
      enabled: true,
    },
  },
};
