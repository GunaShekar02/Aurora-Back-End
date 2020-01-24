const { AuthenticationError } = require('apollo-server-express');
const { canViewAllEvents } = require('../../../utils/roles');

const allTeams = async (_, args, context) => {
  const { isValid, db, id, userLoader } = context;

  if (isValid && (await canViewAllEvents(id, userLoader))) {
    const { filterBy, pattern } = args;
    const limit = args.limit || 0;
    const page = args.page || 0;
    const sortBy = args.sortBy || 'none'; // dummy field
    const sortDir = args.sortDir || -1;

    const availableFilters = new Map([
      ['member', 'members'],
      ['teamId', '_id'],
      ['eventId', 'event'],
    ]);

    const filter = {};
    if (filterBy && pattern && availableFilters.has(filterBy)) {
      filter[availableFilters.get(filterBy)] = new RegExp(pattern, 'i');
    }

    const total = await db
      .collection('teams')
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'members',
            foreignField: '_id',
            as: 'memberList',
          },
        },
        { $match: filter },
        {
          $count: 'teams',
        },
      ])
      .toArray();

    const teamRes = await db
      .collection('teams')
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'members',
            foreignField: '_id',
            as: 'memberList',
          },
        },
        { $match: filter },
        { $sort: { [sortBy]: sortDir } },
        { $skip: page * limit },
        { $limit: limit },
      ])
      .toArray();

    const teams = teamRes.map(team => {
      return {
        teamId: team._id,
      };
    });

    return {
      total: total[0].teams,
      teams,
    };
  }
  throw new AuthenticationError('Go Home Kid');
};

module.exports = allTeams;
