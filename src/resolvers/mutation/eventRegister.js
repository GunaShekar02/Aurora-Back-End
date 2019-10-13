const { ApolloError } = require('apollo-server-express');
const ObjectId = require('mongodb').ObjectID;

const eventRegister = async (_, args, context) => {
  const { isValid, db, client } = context;
  let { userId, eventId } = args;
  let teamId;
  userId = ObjectId(userId);
  eventId = ObjectId(eventId);
  if (isValid) {
    const verifyRegister = await db
      .collection('teams')
      .find({ event: eventId, 'members.0': userId })
      .toArray();
    if (verifyRegister.length === 0) {
      const user = await db
        .collection('users')
        .find({ _id: userId })
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
          const team = await teamsCollection.insertOne(
            {
              name: user[0].name,
              event: eventId,
              members: [userId],
              paymentStatus: false,
              pendingInvitations: [],
            },
            { session }
          );
          teamId = team.ops[0]._id;
          await usersCollection.updateOne(
            { _id: userId },
            { $push: { teams: { teamId, eventId } } },
            { new: true },
            { session }
          );
        });
      } catch (err) {
        throw new ApolloError('Something went wrong', 'TRX_FAILED');
      }
      const singleTeam = await db
        .collection('teams')
        .find({ _id: teamId })
        .toArray();
      const singleEvent = await db
        .collection('events')
        .find({ _id: eventId })
        .toArray();
      return {
        code: 200,
        success: true,
        message: 'User registered successfully',
        team: { id: teamId, ...singleTeam[0], event: { id: eventId, ...singleEvent[0] } },
      };
    }
    throw new Error('You are already registered for this event');
  }
  throw new ApolloError('User is not logged in');
};
module.exports = eventRegister;
