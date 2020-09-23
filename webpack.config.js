const path = require('path');

module.exports = {
  entry: "./build/index.js",
  output: {
    filename: "asteroids.js",
    path: path.resolve(__dirname, "www/static/js")
  }
};
