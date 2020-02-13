const { AuthenticationError, ApolloError } = require('apollo-server-express');
const { canViewEvents, canViewUsers } = require('../../../utils/roles');

const getBandType = async (user, teamLoader) => {
  if (user.accommodation) return 'acc';
  if (user.pronite.paid) return 'pro';

  const teamIds = user.teams.map(t => t.teamId);

  const teams = await teamLoader.loadMany(teamIds);

  if (teams.some(t => t.paymentStatus)) return 'evt';

  return 'none';
};
const bandTypes = ['acc', 'pro', 'evt'];

const userDetails = async (_, args, context) => {
  const { id, userLoader, teamLoader, isValid } = context;

  if (isValid && ((await canViewEvents(id, userLoader)) || (await canViewUsers(id, userLoader)))) {
    const { arId } = args;

    const user = await userLoader.load(arId);

    if (!user) throw new ApolloError('Invalid User', 'INVALID_USER');

    const issuedBandType = user.band;
    const isBandIssued = bandTypes.some(type => type === issuedBandType);

    const bandType = await getBandType(user, teamLoader);

    return {
      bandType,
      issuedBandType,
      isBandIssued,
      user: {
        id: arId,
      },
    };
  }
  throw new AuthenticationError('Go Home Kid');
};

module.exports = userDetails;
