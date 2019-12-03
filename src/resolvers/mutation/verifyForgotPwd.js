const { ApolloError } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const { jwtHsSecret } = require('../../utils/config');

const verifyForgotPwd = async (_, args) => {
  const { token } = args;
  jwt.verify(token, jwtHsSecret, (err, decoded) => {
    if (!err && decoded.sub !== 'ForgotPassword') throw new ApolloError(err, 'there was an error');
  });
  return token;
};

module.exports = verifyForgotPwd;
