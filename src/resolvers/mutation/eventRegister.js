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
    const updateUser = async session => {
      const usersCollection = db.collection('users');
      const teamsCollection = db.collection('teams');

      session.startTransaction({
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' },
      });

      try {
        // eslint-disable-next-line no-undef
        const team = await teamsCollection.insertOne({
          name: user[0].name,
          event: eventId,
          members: userId,
          paymentStatus: false,
        });
        teamId = team.ops[0]._id;
        await usersCollection.updateOne(
          { _id: userId },
          { $push: { teams: teamId } },
          { new: true }
        );
        try {
          session.commitTransaction();
        } catch (error) {
          throw new ApolloError(error);
        }
      } catch (error) {
        session.abortTransaction();
        throw new ApolloError(error);
      }
    };
    const session = client.startSession({
      defaultTransactionOptions: {
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' },
        readPreference: 'primary',
      },
    });
    try {
      updateUser(session);
    } catch (error) {
      throw new ApolloError(error);
    } finally {
      session.endSession();
    }
    const teamsList = await db
      .collection('teams')
      .find({ _id: { $in: user[0].teams } })
      .toArray();
    return {
      code: 200,
      success: true,
      message: 'Event registered successfully',
      user: { ...user[0], teams: teamsList },
    };
  }
  throw new ApolloError('User is not logged in');
};
module.exports = eventRegister;
