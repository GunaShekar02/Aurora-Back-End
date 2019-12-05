const { ApolloError } = require('apollo-server-express');
// const jwt = require('jsonwebtoken');

// const { jwtHsSecret } = require('../../utils/config');

const verifyRegister = async (_, args, context) => {
  const { db } = context;
  const { token } = args;

  const verify = await db.collection('verify').findOne({ verifyHash: token });

  if (!verify) throw new ApolloError('Invalid token', 'JWT_ERROR');

  const user = await db.collection('users').findOne({ _id: verify._id });

  if (user.isVerified) throw new ApolloError('Already Verified', 'ALREADY_VERIFIED');

  await db.collection('users').updateOne({ _id: verify._id }, { $set: { isVerified: true } });
  await db.collection('verify').deleteOne({ _id: verify._id });

  return {
    code: 200,
    success: true,
    message: 'Your email has been successfully verified.',
  };
};

module.exports = verifyRegister;
