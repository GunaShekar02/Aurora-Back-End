const { ApolloError, AuthenticationError } = require('apollo-server-express');
const xss = require('xss');

const setTeamName = async (_, args, context) => {
  const { isValid, db, client, id, teamLoader, logger } = context;

  if (isValid) {
    const teamId = args.teamId.toUpperCase();

    const xssOptions = {
      whiteList: [],
      stripIgnoreTag: [],
      stripIgnoreTagBody: ['script'],
    };

    const name = xss(args.name, xssOptions);

    if (!name) throw new ApolloError('Invalid name', 'INVALID_NAME');

    const team = await teamLoader.load(teamId);
    if (!team) throw new ApolloError('Invalid team', 'INVALID_TEAM');

    const verifyMember = team.members.some(member => member === id);

    if (!verifyMember) throw new ApolloError('You are not a member of this team', 'NOT_A_MEMBER');

    if (team.paymentStatus)
      throw new ApolloError('Cannot change team name after payment', 'PAID_CANNOT_CHANGE');

    const session = client.startSession({
      defaultTransactionOptions: {
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' },
        readPreference: 'primary',
      },
    });

    try {
      await session.withTransaction(async () => {
        const teamsCollection = db.collection('teams');

        const userRes = teamsCollection.updateOne({ _id: teamId }, { $set: { name } }, { session });

        return userRes;
      });
    } catch (err) {
      logger('[TRX_ERR]', err);
      throw new ApolloError('Something went wrong', 'TRX_FAILED');
    } finally {
      teamLoader.clear(teamId);
      await session.endSession();
    }

    return {
      code: 200,
      success: true,
      message: 'Team name changed successfully',
      team: { teamId },
    };
  }
  throw new AuthenticationError('User is not logged in');
};

module.exports = setTeamName;
