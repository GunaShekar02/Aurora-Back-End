const { UserInputError } = require('apollo-server-express');
let ObjectId = require('mongodb').ObjectID;

const eventRegister = async (_, args, context) => {
  const { isValid, db, client } = context;
  let { userId, eventId } = args;
  let teamId;
  userId = ObjectId(userId);
  eventId = ObjectId(eventId);
  if (isValid) {
    const User = await db
      .collection('users')
      .find({ _id: userId })
      .toArray();
    const updateUser = async (session) => {
      usersCollection = client.db(db.options.authSource).collection('users');
      teamsCollection = client.db(db.options.authSource).collection('teams');

      session.startTransaction({
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' },
      });

      try {
        // eslint-disable-next-line no-undef
        Team = await teamsCollection.insertOne({
          name: User[0].name,
          event: eventId,
          members: userId,
          paymentStatus: false,
        });
        teamId = Team.ops[0]._id;
        console.log('HII', Team.ops[0]._id);
        await usersCollection.updateOne(
          { _id: userId },
          { $push: { teams: teamId } },
          { new: true }
        );
        try {
          session.commitTransaction();
          console.log("Transaction committed.");
        } catch (error) {
          throw new UserInputError('FAiled', error);
        }
      } catch (error) {
        session.abortTransaction();
        throw new UserInputError(error);
      }
    };
    const session = client.startSession({defaultTransactionOptions: {
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' },
        readPreference: 'primary',
      },
    });
    try {
      updateUser(session);
    } catch (error) {
      throw new UserInputError(error);
    } finally {
      session.endSession();
    }
    const teamsList = await db
      .collection('teams')
      .find({ _id: { $in: User[0].teams } })
      .toArray();
    console.log(teamsList);
    return {
      code: 200,
      success: true,
      message: 'Event registered successfully',
      user: { ...User[0], teams: teamsList },
    };
  } 
  throw new UserInputError('User is not logged in');
};
module.exports = eventRegister;
