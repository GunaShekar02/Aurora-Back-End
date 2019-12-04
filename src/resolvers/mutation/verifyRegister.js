const { ApolloError } = require('apollo-server-express');
const jwt = require('jsonwebtoken');

const { jwtHsSecret } = require('../../utils/config');

const verifyRegister = async (_, args, context) => {
  const { db } = context;
  const { token } = args;
  let email;

  try {
    const decoded = await jwt.verify(token, jwtHsSecret, { subject: 'ConfirmEmail' });
    email = decoded.email;
  } catch (err) {
    throw new ApolloError('Invalid token', 'JWT_ERROR');
  }

  const user = await db.collection('users').findOne({ email });

  if (user.isVerified) throw new ApolloError('Already Verified', 'ALREADY_VERIFIED');

  await db.collection('users').updateOne({ email }, { $set: { isVerified: true } });

  return {
    code: 200,
    success: true,
    message: 'Your email has been successfully verified.',
  };
};

module.exports = verifyRegister;
