const path = require('path');

let config = {
  entry: "./build/index.js",
  output: {
    filename: "asteroids.js",
    path: path.resolve(__dirname, "dist")
  }
};

module.exports = (env, argv) => {
  if (argv.mode === "development") {
    config.output.path = path.resolve(__dirname, "www/static/js");
  } else {
    config.output.path = path.resolve(__dirname, "dist");
  }
  return config;
};
