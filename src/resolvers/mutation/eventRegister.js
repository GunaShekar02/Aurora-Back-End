const { ApolloError } = require('apollo-server-express');
const ObjectId = require('mongodb').ObjectID;

const eventRegister = async (_, args, context) => {
  const { isValid, db, client } = context;
  let { userId, eventId } = args;
  let teamId;
  userId = ObjectId(userId);
  eventId = ObjectId(eventId);
  if (isValid) {
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
            members: userId,
            paymentStatus: false,
          },
          { session }
        );
        teamId = team.ops[0]._id;
        await usersCollection.updateOne(
          { _id: userId },
          { $push: { teams: teamId } },
          { new: true },
          { session }
        );
      });
    } catch (err) {
      throw new ApolloError('Could not complete Trx ', err);
    }
    return {
      code: 200,
      success: true,
      message: 'User registered successfully',
      user: { id: userId, ...user[0] },
    };
  }
  throw new ApolloError('User is not logged in');
};
module.exports = eventRegister;
