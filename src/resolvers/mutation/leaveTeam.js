const { ApolloError, AuthenticationError } = require('apollo-server-express');

const declineInvite = async (_, args, context) => {
  const { isValid, db, client, id } = context;
  if (isValid) {
    const { teamId } = args;
    const team = await db
      .collection('teams')
      .find({ _id: teamId, members: id })
      .toArray();
    if (team.length === 0) throw new ApolloError('You are not a member of this team');
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
        await usersCollection.updateOne({ _id: id }, { $pull: { teams: { teamId } } }, { session });
        if (team[0].members.length === 1) {
          teamsCollection.deleteOne({ _id: teamId });
        } else {
          await teamsCollection.updateOne({ _id: teamId }, { $pull: { members: id } }, { session });
        }
      });
    } catch (err) {
      throw new ApolloError('Something went wrong', 'TRX_FAILED');
    }
    return {
      code: 200,
      success: true,
      message: 'Left from team',
      team: {
        id: teamId,
      },
    };
  }
  throw new AuthenticationError('User is not logged in');
};

module.exports = declineInvite;
