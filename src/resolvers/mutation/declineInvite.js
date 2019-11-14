const { ApolloError, AuthenticationError } = require('apollo-server-express');

const declineInvite = async (_, args, context) => {
  const { isValid, db, client, id, logger, userLoader } = context;

  if (isValid) {
    const { teamId } = args;

    const user = await userLoader.load(id);
    const verifyInvite = user.teamInvitations.some(invite => invite.teamId === teamId);

    if (!verifyInvite) throw new ApolloError('You are not invited');

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
        const teamsCollection = db.collection('teams');

        const userRes = usersCollection.updateOne(
          { _id: id },
          { $pull: { teamInvitations: { teamId } } },
          { session }
        );
        const teamRes = teamsCollection.updateOne(
          { _id: teamId },
          { $pull: { pendingInvitations: { id } } },
          { session }
        );

        return Promise.all([userRes, teamRes]);
      });
    } catch (err) {
      logger('[TRX_ERR]', err);
      throw new ApolloError('Something went wrong', 'TRX_FAILED');
    } finally {
      userLoader.clear(id);
      await session.endSession();
    }
    return {
      code: 200,
      success: true,
      message: 'Invite declined',
    };
  }
  throw new AuthenticationError('User is not logged in');
};

module.exports = declineInvite;
