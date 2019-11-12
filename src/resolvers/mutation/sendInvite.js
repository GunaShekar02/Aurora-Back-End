const { ApolloError, AuthenticationError } = require('apollo-server-express');
const eventData = require('../../data/eventData');

const sendInvite = async (_, args, context) => {
  const { isValid, db, client, id, userLoader, logger } = context;

  if (isValid) {
    const { teamId, arId } = args;
    const team = await db.collection('teams').findOne({ _id: teamId, members: id });

    if (!team)
      throw new ApolloError('Invalid team-Id or you are not a team member', 'UNAUTHORIZED');

    const eventId = team.event;

    const { maxSize } = eventData.get(eventId);

    const RegisteredUser = await db
      .collection('users')
      .findOne({ _id: id, 'teams.eventId': eventId });

    if (!RegisteredUser) {
      throw new ApolloError('You are not registered for the event to invite', 'EVT_NOT_REG');
    }
    const receiverUser = await userLoader.load(arId);

    if (!receiverUser) throw new ApolloError('User does not exist', 'USER_DOES_NOT_EXIST');

    const alreadyRegistered = receiverUser.teams.some(userTeam => userTeam.eventId === eventId);

    if (alreadyRegistered) {
      throw new ApolloError(
        'The user is already in some other team for the same event',
        'USR_ALREADY_REG'
      );
    }
    if (team.members.length + team.pendingInvitations.length < maxSize) {
      const alreadyInvited = receiverUser.teamInvitations.some(invite => invite.teamId === teamId);

      if (!alreadyInvited) {
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
              { _id: arId },
              { $push: { teamInvitations: { teamId, eventId, invitedBy: id } } },
              { session }
            );
            const teamRes = teamsCollection.updateOne(
              { event: eventId, _id: teamId },
              { $push: { pendingInvitations: { id: arId } } },
              { session }
            );

            return Promise.all([userRes, teamRes]);
          });
        } catch (err) {
          logger('[ERR]', err);
          throw new ApolloError('Something went wrong', 'TRX_FAILED');
        } finally {
          userLoader.clear(arId);
          await session.endSession();
        }
        return {
          code: 200,
          success: true,
          message: 'Invite sent successfully',
          team: { teamId },
        };
      }
      throw new ApolloError('Already Invited', 'ALREADY_INVITED');
    } else throw new ApolloError('You cannot make any more invites', 'INVITE_LIMIT_REACHED');
  } else throw new AuthenticationError('User is not logged in');
};

module.exports = sendInvite;
