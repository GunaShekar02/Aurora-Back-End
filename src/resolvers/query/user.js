const { AuthenticationError } = require('apollo-server-express');

const user = (_, __, context) => {
  const { isValid, email, id } = context;

  if (isValid) {
    return { email, id };
  }
  throw new AuthenticationError('Must Authenticate');
};

module.exports = user;
