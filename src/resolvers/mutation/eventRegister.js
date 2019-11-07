const { ApolloError, AuthenticationError } = require('apollo-server-express');

const { generateTeamId } = require('../../utils/helpers');

const eventRegister = async (_, args, context) => {
  const { isValid, db, client } = context;
  const userId = context.id;
  const { eventId } = args;
  let teamId;

  if (isValid) {
    const singleEvent = await db
      .collection('events')
      .find({ _id: eventId })
      .toArray();

    if (singleEvent.length === 0) throw new ApolloError('wrong Event Details');

    const verifyRegister = await db
      .collection('teams')
      .find({ event: eventId, members: userId })
      .toArray();

    if (verifyRegister.length === 0) {
      const invites = await db
        .collection('users')
        .aggregate([
          { $match: { _id: userId } },
          { $unwind: '$teamInvitations' },
          { $match: { 'teamInvitations.eventId': eventId } },
          { $project: { teamInvitations: 1 } },
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

          teamId = await generateTeamId(userId, eventId, db);

          const teamRes = teamsCollection.insertOne(
            {
              _id: teamId,
              name: 'currently not req',
              event: eventId,
              members: [userId],
              paymentStatus: false,
              pendingInvitations: [],
            },
            { session }
          );
          const userRes = usersCollection.updateOne(
            { _id: userId },
            { $push: { teams: { teamId, eventId } } },
            { session }
          );
          const invitePromises = invites.map(invite => {
            return usersCollection.updateOne(
              { _id: userId },
              { $pull: { teamInvitations: { teamId: invite.teamInvitations.teamId } } },
              { session }
            );
          });

          return Promise.all(invitePromises.concat([teamRes, userRes]));
        });
      } catch (err) {
        throw new ApolloError('Something went wrong', 'TRX_FAILED');
      } finally {
        await session.endSession();
      }
      return {
        code: 200,
        success: true,
        message: 'User registered successfully',
        team: { id: teamId, paymentStatus: false },
      };
    }
    throw new Error('You are already registered for this event');
  }
  throw new AuthenticationError('User is not logged in');
};

module.exports = eventRegister;
