const { AuthenticationError } = require('apollo-server-express');

const allUsers = async (_, args, context) => {
  const { isValid, isRoot, db } = context;

  if (isValid && isRoot) {
    const { filterBy, pattern } = args;
    const limit = args.limit || 0;
    const page = args.page || 0;
    const sortBy = args.sortBy || 'timeSt';
    const sortDir = args.sortDir || -1;

    const availableFilters = new Map([['arId', '_id'], ['name', 'name'], ['email', 'email']]);

    const filter = {};
    if (filterBy && pattern && availableFilters.has(filterBy)) {
      filter[availableFilters.get(filterBy)] = new RegExp(pattern, 'i');
    }

    const total = await db
      .collection('users')
      .find(filter)
      .count();

    const cursor = await db
      .collection('users')
      .find(filter)
      .sort([[sortBy, sortDir]])
      .project({ _id: 1 });

    const userRes = await cursor
      .skip(page * limit)
      .limit(limit)
      .toArray();

    const users = userRes.map(user => {
      return {
        id: user._id,
      };
    });

    return {
      total,
      users,
    };
  }
  throw new AuthenticationError('Go Home Kid');
};

module.exports = allUsers;
