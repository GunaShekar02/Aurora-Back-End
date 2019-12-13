const { AuthenticationError } = require('apollo-server-express');

const allUsers = async (_, args, context) => {
  const { isValid, isRoot, db } = context;

  if (isValid && isRoot) {
    const limit = args.limit || 25;
    const page = args.page || 0;
    const sortBy = args.sortBy || 'timeSt';
    const sortDir = args.sortDir || -1;

    const cursor = await db
      .collection('users')
      .find({})
      .sort([[sortBy, sortDir]])
      .project({ _id: 1 });

    const total = await cursor.count();

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
