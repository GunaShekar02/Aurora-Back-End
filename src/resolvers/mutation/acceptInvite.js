const { ApolloError, AuthenticationError } = require('apollo-server-express');

const acceptInvite = async (_, args, context) => {
  const { isValid, db, client, id, userLoader, logger } = context;

  if (isValid) {
    const { teamId } = args;
    const team = await db.collection('teams').findOne({ _id: teamId, pendingInvitations: { id } });

    if (!team) throw new ApolloError('Invalid Team or you are not Invited', 'UNAUTHORIZED');

    const user = await userLoader.load(id);
    const verifyInvite = user.teamInvitations.some(invite => invite.teamId === teamId);

    if (!verifyInvite) throw new ApolloError('You are not invited', 'USR_NOT_INVITED');

    const invites = [];
    user.teamInvitations.forEach(invite => {
      if (invite.eventId === team.event) invites.push(invite.teamId);
    });

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
          {
            $push: { teams: { teamId, eventId: team.event } },
            $pull: { teamInvitations: { eventId: team.event } },
          },
          { session }
        );
        const teamRes = teamsCollection.updateOne(
          { _id: teamId },
          {
            $push: { members: id },
          },
          { session }
        );
        const inviteRes = teamsCollection.updateMany(
          { _id: { $in: invites } },
          { $pull: { pendingInvitations: { id } } },
          { session }
        );

        return Promise.all([userRes, teamRes, inviteRes]);
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
      message: 'Invite accepted',
      team: { teamId },
    };
  }
  throw new AuthenticationError('User is not logged in');
};

module.exports = acceptInvite;
