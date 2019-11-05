const { ApolloError, AuthenticationError } = require('apollo-server-express');

const cancelInvite = async (_, args, context) => {
  const { isValid, db, client, id } = context;
  if (isValid) {
    const { teamId, arId } = args;

    const team = await db
      .collection('teams')
      .find({ _id: teamId, members: id })
      .toArray();

    if (team.length === 0)
      throw new ApolloError('You should be a member of the team to cancel Invite');

    const verifyInvite = await db
      .collection('teams')
      .find({ _id: teamId, pendingInvitations: arId })
      .toArray();

    if (verifyInvite.length === 0) throw new ApolloError('User not invited before');

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

        await usersCollection.updateOne(
          { _id: arId },
          { $pull: { teamInvitations: { teamId } } },
          false,
          true,
          { session }
        );
        await teamsCollection.updateOne(
          { _id: teamId, members: id },
          { $pull: { pendingInvitations: arId } },
          { session }
        );
      });
    } catch (err) {
      throw new ApolloError('Something went wrong', 'TRX_FAILED');
    }
    return {
      code: 200,
      success: true,
      message: 'Invite cancelled',
      team: {
        id: teamId,
        ...team[0],
      },
    };
  }
  throw new AuthenticationError('User is not logged in');
};

module.exports = cancelInvite;
