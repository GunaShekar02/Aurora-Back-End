const logger = (...args) => {
  // eslint-disable-next-line no-console
  console.log('[LOG]', ...args);
};

module.exports = logger;
