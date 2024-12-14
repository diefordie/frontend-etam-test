// next.config.js
module.exports = {
  webpack(config, { isProduction }) {
    if (isProduction) {
      // Disable CSS minimization to debug
      config.optimization.minimize = false;
    }
    return config;
  },
};
