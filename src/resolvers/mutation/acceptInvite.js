const { ApolloError, AuthenticationError } = require('apollo-server-express');

const acceptInvite = async (_, args, context) => {
  const { isValid, db, client, id } = context;

  if (isValid) {
    const { teamId } = args;
    const team = await db
      .collection('teams')
      .find({ _id: teamId, pendingInvitations: id })
      .toArray();

    if (team.length === 0) throw new ApolloError('Invalid Team');

    const user = await db
      .collection('users')
      .find({ _id: id, 'teamInvitations.teamId': teamId })
      .toArray();

    if (user.length === 0) throw new ApolloError('You are not invited');

    const invites = await db
      .collection('users')
      .aggregate([
        { $match: { _id: id } },
        { $unwind: '$teamInvitations' },
        { $match: { 'teamInvitations.eventId': team[0].event } },
        { $project: { 'teamInvitations.teamId': 1 } },
      ])
      .toArray();

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
            $push: { teams: { teamId, eventId: team[0].event } },
            $pull: { teamInvitations: { eventId: team[0].event } },
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
        const invitePromises = invites.map(invite => {
          return teamsCollection.updateOne(
            { _id: invite.teamInvitations.teamId },
            { $pull: { pendingInvitations: id } },
            { session }
          );
        });
        return Promise.all(invitePromises.concat([userRes, teamRes]));
      });
    } catch (err) {
      throw new ApolloError('Something went wrong', 'TRX_FAILED');
    } finally {
      await session.endSession();
    }
    return {
      code: 200,
      success: true,
      message: 'Invite accepted',
      team: {
        id: teamId,
      },
    };
  }
  throw new AuthenticationError('User is not logged in');
};

module.exports = acceptInvite;
