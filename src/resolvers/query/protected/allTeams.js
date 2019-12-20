const { AuthenticationError } = require('apollo-server-express');

const allTeams = async (_, args, context) => {
  const { isValid, isRoot, db } = context;

  if (isValid && isRoot) {
    const limit = args.limit || 25;
    const page = args.page || 0;
    const sortBy = args.sortBy || 'none'; // dummy field
    const sortDir = args.sortDir || -1;

    const cursor = await db
      .collection('teams')
      .find({})
      .sort([[sortBy, sortDir]])
      .project({ _id: 1 });

    const total = await cursor.count();

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

module.exports = allTeams;
