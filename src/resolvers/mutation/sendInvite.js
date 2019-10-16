const { ApolloError, AuthenticationError } = require('apollo-server-express');

const sendInvite = async (_, args, context) => {
  const { isValid, db, client, id } = context;
  if (isValid) {
    const { teamId, arId } = args;
    const team = await db
      .collection('teams')
      .find({ _id: teamId })
      .toArray();
    if (team.length === 0) throw new ApolloError('Invalid team-Id');
    const eventId = team[0].event;
    const event = await db
      .collection('events')
      .find({ _id: eventId })
      .toArray();
    const { maxSize } = event[0];
    const RegisteredUser = await db
      .collection('users')
      .find({ _id: id, 'teams.eventId': eventId })
      .toArray();
    if (RegisteredUser.length === 0) {
      throw new ApolloError('You are not registered for the event to invite');
    }
    const receiverUser = await db
      .collection('users')
      .find({ _id: arId })
      .toArray();
    if (receiverUser.length === 0) throw new ApolloError('User does not exist');
    const alreadyRegistered = await db
      .collection('users')
      .find({
        _id: arId,
        'teams.eventId': eventId,
      })
      .toArray();
    if (alreadyRegistered.length !== 0) {
      throw new ApolloError('The user is already in some other team for the same event');
    }
    if (team[0].members.length + team[0].pendingInvitations.length < maxSize) {
      const Invited = await db
        .collection('users')
        .find({ _id: arId, teamInvitations: teamId })
        .toArray();
      if (Invited.length === 0) {
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
              { _id: arId },
              { $push: { teamInvitations: teamId } },
              { session }
            );
            await teamsCollection.updateOne(
              { event: eventId, _id: teamId },
              { $push: { pendingInvitations: arId } },
              { session }
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
            event: { id: eventId },
          },
        };
      }
      throw new ApolloError('Already Invited');
    } else throw new ApolloError('You cannot make any more invites');
  } else throw new AuthenticationError('User is not logged in');
};

module.exports = sendInvite;
