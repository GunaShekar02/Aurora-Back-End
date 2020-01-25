const { AuthenticationError, ApolloError } = require('apollo-server-express');
const { canViewEvents, canViewAllEvents } = require('../../../utils/roles');

const eventTeams = async (_, args, context) => {
  const { isValid, id, userLoader, db } = context;

  if (isValid && (await canViewEvents(id, userLoader))) {
    const { filterBy, pattern, paymentStatus } = args;
    const eventId = args.eventId || 0;
    const limit = args.limit || 9999999;
    const page = args.page || 0;
    const sortBy = args.sortBy || 'timeSt';
    const sortDir = args.sortDir || -1;

    const user = await userLoader.load(id);

    if (
      !((await canViewAllEvents(id, userLoader)) || user.role.events.some(eId => eId === eventId))
    )
      throw new ApolloError('Invalid eventId', 'INVALID_EVENTID');

    const availableFilters = new Map([
      ['member', 'memberList.name'],
      ['memberEmail', 'memberList.email'],
      ['memberId', 'memberList._id'],
      ['teamId', '_id'],
    ]);

    const filter = eventId === 0 ? { paymentStatus } : { event: eventId, paymentStatus };
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

    // const cursor = await db
    //   .collection('teams')
    //   .find(filter)
    //   .sort([[sortBy, sortDir]])
    //   .project({ _id: 1 });

    // const teamRes = await cursor
    //   .skip(page * limit)
    //   .limit(limit)
    //   .toArray();
    const skip = page * limit;
    console.log('skippin', skip);
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
        { $skip: skip },
        { $limit: limit },
      ])
      .toArray();

    const teams = teamRes.map(team => {
      return {
        teamId: team._id,
      };
    });

    return {
      total: total[0] ? total[0].teams : 0,
      teams,
    };
  }
  throw new AuthenticationError('Go Home Kid');
};

module.exports = eventTeams;
