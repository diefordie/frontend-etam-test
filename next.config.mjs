// next.config.js
const SomeWebpackPlugin = require('some-webpack-plugin');

module.exports = {
  webpack(config) {
    config.plugins.push(new SomeWebpackPlugin());
    return config;
  }
};
