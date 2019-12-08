const { ApolloError, AuthenticationError } = require('apollo-server-express');

const removeMember = async (_, args, context) => {
  const { isValid, db, client, id, logger, teamLoader } = context;

  if (isValid) {
    const teamId = args.teamId.toUpperCase();
    const arId = args.arId.toUpperCase();

    if (arId === id)
      throw new ApolloError('You cannot remove yourself from team.', 'CANNOT_REMOVE_YOURSELF');

    const team = await teamLoader.load(teamId);

    if (!team) throw new ApolloError('Invalid team', 'INVALID_TEAM');

    const verifyMember = team.members.some(member => member === id);
    if (!verifyMember) throw new ApolloError('You are not a member of this team', 'NOT_A_MEMBER');

    const verifyReceiver = team.members.some(member => member === arId);
    if (!verifyReceiver)
      throw new ApolloError('User is not a member of this team', 'USR_NOT_A_MEMBER');

    if (team.paymentStatus)
      throw new ApolloError('Cannot remove user after payment', 'PAID_CANNOT_REMOVE');

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
      logger('[TRX_ERR]', err);
      throw new ApolloError('Something went wrong', 'TRX_FAILED');
    } finally {
      teamLoader.clear(teamId);
      await session.endSession();
    }
    return {
      code: 200,
      success: true,
      message: 'Member removed',
      team: { teamId },
    };
  }
  throw new AuthenticationError('User is not logged in');
};

module.exports = removeMember;
