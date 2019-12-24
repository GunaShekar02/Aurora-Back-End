const { AuthenticationError, ApolloError } = require('apollo-server-express');

const eventTeams = async (_, args, context) => {
  const { isValid, isEventAdmin, isRoot, db, eventIds } = context;

  if (isValid && (isEventAdmin || isRoot)) {
    const eventId = args.eventId || 1;
    const limit = args.limit || 0;
    const page = args.page || 0;
    const sortBy = args.sortBy || 'none'; // dummy field
    const sortDir = args.sortDir || -1;

    if (!(isRoot || eventIds.some(eId => eId === eventId)))
      throw new ApolloError('Invalid eventId', 'INVALID_EVENTID');

    const total = await db
      .collection('teams')
      .find({ event: eventId })
      .count();

    const cursor = await db
      .collection('teams')
      .find({ event: eventId })
      .sort([[sortBy, sortDir]])
      .project({ _id: 1 });

    const teamRes = await cursor
      .skip(page * limit)
      .limit(limit)
      .toArray();

    const teams = teamRes.map(team => {
      return {
        teamId: team._id,
      };
    });

    return {
      total,
      teams,
    };
  }
  throw new AuthenticationError('Go Home Kid');
};

module.exports = eventTeams;
