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
// const bandTypes = ['acc', 'pro', 'evt'];

const issueBand = async (_, args, context) => {
  const { isValid, id, userLoader, teamLoader, db } = context;

  if (isValid && ((await canViewEvents(id, userLoader)) || (await canViewUsers(id, userLoader)))) {
    const arId = args.arId.toUpperCase();

    const user = await userLoader.load(arId);

    if (!user) throw new ApolloError('User does not exist', 'USR_DOESNT_EXIST');

    if (user.band !== 'none') throw new ApolloError('User already got a band', 'USR_GOT_BAND');

    const bandType = await getBandType(user, teamLoader);

    db.collection('users').updateOne({ _id: arId }, { $set: { band: bandType } });

    return {
      success: true,
      message: `User is issued a ${bandType} band`,
      code: 200,
    };
  }
  throw new AuthenticationError('Go Home Kid');
};

module.exports = issueBand;
