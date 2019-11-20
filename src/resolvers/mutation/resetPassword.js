const { UserInputError, AuthenticationError, ApolloError } = require('apollo-server-express');
const bcrypt = require('bcrypt');

const resetPassword = async (_, args, context) => {
  const { db, id, isValid } = context;
  const { currentPassword, password } = args;

  if (isValid) {
    if (password === '') throw new ApolloError('Password cannot be empty', 'FIELDS_REQUIRED');

    const user = await db.collection('users').findOne({ _id: id });
    const match = await bcrypt.compare(currentPassword, user.hash);

    if (match) {
      const hash = await bcrypt.hash(password, 10);
      await db.collection('users').updateOne({ _id: id }, { $set: { hash } });

      return {
        code: 200,
        success: true,
        message: 'Password reset successfully',
      };
    }
    throw new UserInputError('Incorrect password');
  } else throw new AuthenticationError('User is not logged in');
};

module.exports = resetPassword;
