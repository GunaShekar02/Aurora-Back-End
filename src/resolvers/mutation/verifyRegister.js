const { ApolloError } = require('apollo-server-express');
const jwt = require('jsonwebtoken');

const { jwtSecret } = require('../../utils/config');

const verifyRegister = async (_, args, context) => {
  const { db } = context;
  const { token } = args;
  let email;

  jwt.verify(token, jwtSecret.pubKey, { algorithm: 'ES512' }, (err, decoded) => {
    if (!err) email = decoded.email;
    else throw new ApolloError(err);
  });

  await db.collection('users').updateOne({ email }, { $set: { isVerified: true } });
  return 'Verified';
};
module.exports = verifyRegister;
