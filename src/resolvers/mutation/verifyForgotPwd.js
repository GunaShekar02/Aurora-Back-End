const { ApolloError } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../utils/config');

const verifyForgotPwd = async (_, args) => {
  const { token } = args;
  jwt.verify(token, jwtSecret.pubKey, { algorithm: 'ES512' }, err => {
    if (err) throw new ApolloError(err, 'JWT_ERROR');
  });
  return token;
};

module.exports = verifyForgotPwd;
