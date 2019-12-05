const { ApolloError } = require('apollo-server-express');

const verifyRegister = async (_, args, context) => {
  const { db } = context;
  const { token } = args;

  const verify = await db.collection('verify').findOne({ verifyHash: token });

  if (!verify) throw new ApolloError('Invalid token', 'JWT_ERROR');

  await db.collection('users').updateOne({ _id: verify._id }, { $set: { isVerified: true } });
  await db.collection('verify').deleteOne({ _id: verify._id });

  return {
    code: 200,
    success: true,
    message: 'Your email has been successfully verified.',
  };
};

module.exports = verifyRegister;
