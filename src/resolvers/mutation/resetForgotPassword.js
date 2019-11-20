const { ApolloError } = require('apollo-server-express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { jwtSecret } = require('../../utils/config');

const resetForgotPassword = async (_, args, context) => {
  const { db } = context;
  const { token, password } = args;

  let email;
  jwt.verify(token, jwtSecret.pubKey, { algorithm: 'ES512' }, (err, decoded) => {
    if (!err) email = decoded.email;
    else throw new ApolloError(err, 'JWT_ERROR');
  });

  const hash = await bcrypt.hash(password, 10);
  await db.collection('users').updateOne({ email }, { $set: { hash } });

  return 'Password reset successfully';
};

module.exports = resetForgotPassword;
