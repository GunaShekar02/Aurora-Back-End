const { ApolloError } = require('apollo-server-express');
const ObjectId = require('mongodb').ObjectID;

const sendInvite = async (_, args, context) => {
  const { isValid, db } = context;
  let { teamId } = args;
  const { email } = args;
  teamId = ObjectId(teamId);
  const team = await db
    .collection('teams')
    .find({ _id: teamId })
    .toArray();
  const eventId = ObjectId(team[0].event);
  const userId = ObjectId(team[0].members[0]);
  const event = await db
    .collection('events')
    .find({ _id: eventId })
    .toArray();
  const RegisteredUser = await db
    .collection('users')
    .find({ _id: userId, 'teams.eventId': eventId })
    .toArray();
  const { maxSize } = event[0];
  if (isValid) {
    if (RegisteredUser.length === 0) {
      throw new ApolloError('You are not registered for the event to invite');
    }
    const alreadyRegistered = await db
      .collection('users')
      .find({
        email,
        'teams.eventId': eventId,
      })
      .toArray();
    if (alreadyRegistered.length !== 0) {
      throw new ApolloError('The user is already in a team for the same event');
    }
    if (team[0].members.length + RegisteredUser[0].pendingInvitations.length < maxSize) {
      const Invited = await db
        .collection('users')
        .find({ email, teamInvitations: teamId })
        .toArray();
      if (Invited.length === 0) {
        await db
          .collection('users')
          .updateOne({ email }, { $push: { teamInvitations: teamId } }, { new: true });
        await db
          .collection('users')
          .updateOne(
            { _id: userId },
            { $push: { pendingInvitations: { eventId, email } } },
            { new: true }
          );
        return {
          code: 200,
          success: true,
          message: 'User registered successfully',
          user: {
            id: userId,
            ...RegisteredUser[0],
          },
        };
      }
      throw new ApolloError('Already Invited');
    } else throw new ApolloError('You cannot make any more requests');
  } else throw new ApolloError('User is not logged in');
};

module.exports = sendInvite;
