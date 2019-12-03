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
  return {
    code: 200,
    success: true,
    message: 'Your email-id has been successfully verified, Login to continue...',
  };
};
module.exports = verifyRegister;
