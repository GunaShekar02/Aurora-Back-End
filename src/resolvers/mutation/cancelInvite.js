const { ApolloError, AuthenticationError } = require('apollo-server-express');
const ObjectId = require('mongodb').ObjectID;

const cancelInvite = async (_, args, context) => {
  const { isValid, db, client } = context;
  let { id } = context;
  if (isValid) {
    let { teamId } = args;
    const { email } = args;
    teamId = ObjectId(teamId);
    id = ObjectId(id);
    const team = await db
      .collection('teams')
      .find({ _id: teamId, members: id })
      .toArray();
    if (team.length === 0)
      throw new ApolloError('You should be a member of the team to cancel Invite');
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

        await usersCollection.updateOne(
          { email },
          { $pull: { teamInvitations: teamId } },
          { new: true }
        );
        await teamsCollection.updateOne(
          { _id: teamId, members: id },
          { $pull: { pendingInvitations: email } },
          { new: true }
        );
      });
    } catch (err) {
      throw new ApolloError('Something went wrong', 'TRX_FAILED');
    }
    return {
      code: 200,
      success: true,
      message: 'Invite sent successfully',
      team: {
        id: teamId,
        ...team[0],
      },
    };
  }
  throw new AuthenticationError('User is not logged in');
};

module.exports = cancelInvite;
