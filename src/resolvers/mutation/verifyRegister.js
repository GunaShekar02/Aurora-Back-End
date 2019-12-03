const { ApolloError } = require('apollo-server-express');
const jwt = require('jsonwebtoken');

const { jwtHsSecret } = require('../../utils/config');

const verifyRegister = async (_, args, context) => {
  const { db } = context;
  const { token } = args;
  let email;

  jwt.verify(token, jwtHsSecret, (err, decoded) => {
    if (!err && decoded.sub === 'ConfirmEmail') email = decoded.email;
    else throw new ApolloError('there was an error', err);
  });
  const user = await db.collection('users').findOne({ email });
  if (user.isVerified) throw new ApolloError('Already Verified', 'ALREADY_VERIFIED');
  await db.collection('users').updateOne({ email }, { $set: { isVerified: true } });
  return 'Verified';
};
module.exports = verifyRegister;
