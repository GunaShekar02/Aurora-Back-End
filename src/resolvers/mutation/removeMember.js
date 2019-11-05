const { ApolloError, AuthenticationError } = require('apollo-server-express');

const declineInvite = async (_, args, context) => {
  const { isValid, db, client, id } = context;

  if (isValid) {
    const { teamId, arId } = args;
    const team = await db
      .collection('teams')
      .find({ _id: teamId, members: [id, arId] })
      .toArray();

    if (team.length === 0)
      throw new ApolloError('Either You  or the user is not a member of this team');

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
          { _id: arId },
          { $pull: { teams: { teamId } } },
          { session }
        );
        const teamRes = teamsCollection.updateOne(
          { _id: teamId },
          { $pull: { members: arId } },
          { session }
        );

        return Promise.all([userRes, teamRes]);
      });
    } catch (err) {
      throw new ApolloError('Something went wrong', 'TRX_FAILED');
    }
    return {
      code: 200,
      success: true,
      message: 'Member removed',
      team: {
        id: teamId,
      },
    };
  }
  throw new AuthenticationError('User is not logged in');
};

module.exports = declineInvite;
