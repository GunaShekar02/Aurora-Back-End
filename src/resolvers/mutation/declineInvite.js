const { ApolloError, AuthenticationError } = require('apollo-server-express');

const declineInvite = async (_, args, context) => {
  const { isValid, db, client, id } = context;
  if (isValid) {
    const { teamId } = args;
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
        // const teamsCollection = db.collection('teams');

        await usersCollection.updateOne(
          { _id: id },
          { $pull: { teamInvitations: { teamId } } },
          { session }
        );
        // await teamsCollection.updateOne(
        //   { _id: teamId },
        //   { $pull: { pendingInvitations: email } },
        //   { session }
        // );
      });
    } catch (err) {
      throw new ApolloError('Something went wrong', 'TRX_FAILED');
    }
    return {
      code: 200,
      success: true,
      message: 'Invite declined',
      team: {
        id: teamId,
      },
    };
  }
  throw new AuthenticationError('User is not logged in');
};

module.exports = declineInvite;
