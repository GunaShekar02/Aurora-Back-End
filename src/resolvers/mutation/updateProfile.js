const { ApolloError, AuthenticationError } = require('apollo-server-express');

const updateProfile = async (_, args, context) => {
  const { isValid, db, client, id, logger } = context;
  const { name, college, city, phone } = args;
  if (isValid) {
    if (!name || !college || !city || !phone)
      throw new ApolloError('Enter all fields', 'FIELDS_EMPTY');
    const regex = /^[6-9]\d{9}$/;
    const res = regex.test(phone);
    if (!res) throw new ApolloError('Enter valid phone number', 'PHONE_INVALID');
    const session = client.startSession({
      defaultTransactionOptions: {
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' },
        readPreference: 'primary',
      },
    });
    try {
      await session.withTransaction(async () => {
        const usersCollection = db.collection('users');

        const userRes = usersCollection.updateOne(
          { _id: id },
          { $set: { name, college, phone, city } },
          { session }
        );
        return Promise.all([userRes]);
      });
    } catch (err) {
      logger('[TRX_ERR]', err);
      throw new ApolloError('Something went wrong', 'TRX_FAILED');
    } finally {
      await session.endSession();
    }
    return {
      code: 200,
      success: true,
      message: 'Invite declined',
      user: { id },
    };
  }
  throw new AuthenticationError('User is not logged in');
};

module.exports = updateProfile;
