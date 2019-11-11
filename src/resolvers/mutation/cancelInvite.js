const { ApolloError, AuthenticationError } = require('apollo-server-express');

const cancelInvite = async (_, args, context) => {
  const { isValid, db, client, id, teamLoader } = context;
  if (isValid) {
    const { teamId, arId } = args;

    const team = await teamLoader.load(teamId);
    if (!team) throw new ApolloError('Team does not exist', 'INVALID_TEAM');

    const verifyMember = team.members.filter(member => member === id);

    if (verifyMember.length === 0)
      throw new ApolloError('You should be a member of the team to cancel Invite');

    const verifyInvite = team.pendingInvitations.filter(invite => invite.id === arId);

    if (verifyInvite.length === 0)
      throw new ApolloError('User not invited before', 'USR_NOT_INVITED');

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
          { $pull: { teamInvitations: { teamId } } },
          false,
          true,
          { session }
        );
        const teamRes = teamsCollection.updateOne(
          { _id: teamId, members: id },
          { $pull: { pendingInvitations: { id: arId } } },
          { session }
        );

        return Promise.all([userRes, teamRes]);
      });
    } catch (err) {
      throw new ApolloError('Something went wrong', 'TRX_FAILED');
    } finally {
      teamLoader.clear(teamId);
      await session.endSession();
    }
    return {
      code: 200,
      success: true,
      message: 'Invite cancelled',
      team: { teamId },
    };
  }
  throw new AuthenticationError('User is not logged in');
};

module.exports = cancelInvite;
