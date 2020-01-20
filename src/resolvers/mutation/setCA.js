const { ApolloError, AuthenticationError } = require('apollo-server-express');

const setCA = async (_, args, context) => {
  const { isValid, db, client, id, logger, userLoader } = context;

  if (isValid) {
    const caId = args.id.toUpperCase();

    const [ca, user] = await userLoader.loadMany([caId, id]);
    if (!ca) throw new ApolloError('Given user does not exist', 'INVALID_USER');

    if (!ca.ca.isCA) throw new ApolloError('User is not a Campus Ambassador', 'NOT_CA');

    if (user.ca.id) throw new ApolloError('You already referred a CA', 'ALREADY_REFERRED');

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
          { $set: { 'ca.id': caId } },
          { session }
        );

        const caRes = usersCollection.updateOne(
          { _id: caId },
          { $push: { 'ca.users': id } },
          { session }
        );
        return Promise.all([userRes, caRes]);
      });
    } catch (err) {
      logger('[TRX_ERR]', err);
      throw new ApolloError('Something went wrong', 'TRX_FAILED');
    } finally {
      logger('[SET_CA]', 'user =>', id, 'ca =>', caId);
      userLoader.clear(id);
      await session.endSession();
    }
    return {
      code: 200,
      success: true,
      message: 'Successfully referred CA',
      user: { id },
    };
  }
  throw new AuthenticationError('User is not logged in');
};

module.exports = setCA;
