const { ApolloError, AuthenticationError } = require('apollo-server-express');

const leaveTeam = async (_, args, context) => {
  const { isValid, db, client, id, teamLoader, logger } = context;

  if (isValid) {
    const teamId = args.teamId.toUpperCase();

    const team = await teamLoader.load(teamId);
    if (!team) throw new ApolloError('Invalid team', 'INVALID_TEAM');

    const verifyMember = team.members.some(member => member === id);

    if (!verifyMember) throw new ApolloError('You are not a member of this team', 'NOT_A_MEMBER');

    const invites = team.pendingInvitations.map(invite => invite.id);

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
          { $pull: { teams: { teamId } } },
          { session }
        );

        if (team.members.length === 1) {
          const inviteRes = usersCollection.updateMany(
            { _id: { $in: invites } },
            { $pull: { teamInvitations: { teamId } } },
            { session }
          );

          const teamRes = teamsCollection.deleteOne({ _id: teamId }, { session });

          return Promise.all([userRes, teamRes, inviteRes]);
        }

        const teamRes = teamsCollection.updateOne(
          { _id: teamId },
          { $pull: { members: id } },
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
      message: 'Left from team',
    };
  }
  throw new AuthenticationError('User is not logged in');
};

module.exports = leaveTeam;
