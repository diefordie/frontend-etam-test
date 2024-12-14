/** @type {import('next').NextConfig} */
const SomeWebpackPlugin = require('some-webpack-plugin');

const nextConfig = {
  webpack(config) {
    config.plugins.push(new SomeWebpackPlugin());
    return config;
  }
};

module.exports = nextConfig;
