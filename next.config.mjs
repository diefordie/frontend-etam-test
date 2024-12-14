// next.config.mjs
import SomeWebpackPlugin from 'some-webpack-plugin';

export default {
  webpack(config) {
    config.plugins.push(new SomeWebpackPlugin());
    return config;
  },
};
