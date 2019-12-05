const { ApolloError } = require('apollo-server-express');
const bcrypt = require('bcrypt');

const resetPassword = async (_, args, context) => {
  const { db } = context;
  const { token, password } = args;

  if (password === '') throw new ApolloError('Password cannot be empty', 'PASSWORD_REQUIRED');

  const forgot = await db.collection('forgot').findOne({ forgotHash: token });
  if (!forgot) throw new ApolloError('Invalid token', 'JWT_ERROR');

  const hash = await bcrypt.hash(password, 10);

  await db.collection('users').updateOne({ _id: forgot._id }, { $set: { hash } });
  await db.collection('forgot').deleteOne({ _id: forgot._id });

  return {
    code: 200,
    success: true,
    message: 'Your password has been changed successfully.',
  };
};

module.exports = resetPassword;
