const { ApolloError, AuthenticationError } = require('apollo-server-express');
const xss = require('xss');

const updateProfile = async (_, args, context) => {
  const { isValid, db, client, id, logger } = context;

  const xssOptions = {
    whiteList: [],
    stripIgnoreTag: [],
    stripIgnoreTagBody: ['script'],
  };

  const name = xss(args.name, xssOptions);
  const college = xss(args.college, xssOptions);
  const city = xss(args.city, xssOptions);
  const phone = xss(args.phone, xssOptions);

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
        return userRes;
      });
    } catch (err) {
      logger('[TRX_ERR]', err);
      throw new ApolloError('Something went wrong', 'TRX_FAILED');
    } finally {
      logger('[PROFILE_UPDATE]', 'user =>', id);
      await session.endSession();
    }
    return {
      code: 200,
      success: true,
      message: 'Profile updated successfully',
      user: { id },
    };
  }
  throw new AuthenticationError('User is not logged in');
};

module.exports = updateProfile;
