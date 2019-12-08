const { ApolloError, AuthenticationError } = require('apollo-server-express');

const { generateTeamId } = require('../../utils/helpers');
const eventData = require('../../data/eventData');

const eventRegister = async (_, args, context) => {
  const { isValid, db, client, logger } = context;
  const userId = context.id;
  const { eventId } = args;
  let teamId;

  if (isValid) {
    if (eventData.get(eventId) === undefined)
      throw new ApolloError('Wrong Event Details', 'WRONG_DETAILS');

    const verifyRegister = await db
      .collection('teams')
      .findOne({ event: eventId, members: userId });

    if (!verifyRegister) {
      const invites = await db
        .collection('users')
        .aggregate([
          { $match: { _id: userId } },
          { $unwind: '$teamInvitations' },
          { $match: { 'teamInvitations.eventId': eventId } },
          { $project: { teamInvitations: 1 } },
        ])
        .toArray();
      const inviteIds = invites.map(invite => invite.teamInvitations.teamId);

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
              name: null,
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
          const inviteRes = usersCollection.updateMany(
            { _id: userId },
            { $pull: { teamInvitations: { teamId: { $in: inviteIds } } } },
            { session }
          );

          return Promise.all([teamRes, userRes, inviteRes]);
        });
        logger('[INFO]', '[eventRegister]', 'userId:', userId, 'eventId:', eventId);
      } catch (err) {
        logger('[TRX_ERR]', err);
        throw new ApolloError('Something went wrong', 'TRX_FAILED');
      } finally {
        await session.endSession();
      }
      return {
        code: 200,
        success: true,
        message: 'User registered successfully',
        team: { teamId },
      };
    }
    throw new ApolloError('You are already registered for this event', 'ALREADY_REG');
  }
  throw new AuthenticationError('User is not logged in');
};

module.exports = eventRegister;
