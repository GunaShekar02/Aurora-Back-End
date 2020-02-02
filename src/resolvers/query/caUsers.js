const { AuthenticationError, ApolloError } = require('apollo-server-express');

const caUsers = async (_, __, context) => {
  const { isValid, id, userLoader, db } = context;

  if (isValid) {
    const user = await userLoader.load(id);

    if (!user.ca.isCA) throw new ApolloError('User is not a CA', 'NOT_A_CA');

    const users = await db
      .collection('users')
      .aggregate([
        {
          $match: { _id: id },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'ca.users',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
            includeArrayIndex: '_id',
          },
        },
        {
          $lookup: {
            from: 'teams',
            localField: 'user.teams.teamId',
            foreignField: '_id',
            as: 'teams',
          },
        },
        {
          $match: {
            $or: [
              {
                teams: {
                  $elemMatch: {
                    paymentStatus: true,
                    event: { $nin: [15, 17, 18, 21, 22, 29] },
                  },
                },
              },
              {
                'user.pronite.paid': true,
              },
            ],
          },
        },
      ])
      .toArray();

    return users.map(u => {
      return {
        id: u.user._id,
      };
    });
  }
  throw new AuthenticationError('Must Authenticate');
};

module.exports = caUsers;
