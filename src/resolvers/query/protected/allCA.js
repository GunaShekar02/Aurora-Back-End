const { AuthenticationError } = require('apollo-server-express');
const { canViewUsers } = require('../../../utils/roles');

const allUsers = async (_, args, context) => {
  const { id, userLoader, isValid, db } = context;

  if (isValid && (await canViewUsers(id, userLoader))) {
    const { filterBy, pattern } = args;
    const limit = args.limit || 99999;
    const page = args.page || 0;
    const sortBy = args.sortBy || 'timeSt';
    const sortDir = args.sortDir || -1;

    const availableFilters = new Map([['arId', '_id'], ['name', 'name'], ['email', 'email']]);

    const filter = { 'ca.isCA': true };
    if (filterBy && pattern && availableFilters.has(filterBy)) {
      filter[availableFilters.get(filterBy)] = new RegExp(pattern, 'i');
    }

    const total = await db
      .collection('users')
      .find(filter)
      .count();

    const userRes = await db
      .collection('users')
      .aggregate([
        { $match: filter },
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
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'teams',
            localField: 'user.teams.teamId',
            foreignField: '_id',
            as: 'teamList',
          },
        },
        {
          $match: {
            $or: [
              {
                'user.pronite.paid': true,
              },
              {
                teamList: {
                  $elemMatch: {
                    paymentStatus: true,
                    event: {
                      $nin: [15, 17, 18, 21, 22, 29],
                    },
                  },
                },
              },
              {
                user: {
                  $exists: false,
                },
              },
            ],
          },
        },
        {
          $group: {
            _id: '$_id',
            users: {
              $push: '$user',
            },
          },
        },
        { $sort: { [sortBy]: sortDir } },
        { $skip: page * limit },
        { $limit: limit },
      ])
      .toArray();

    const ca = userRes.map(user => {
      return {
        paidUsers: user.users.map(u => {
          return { id: u._id };
        }),
        user: {
          id: user._id,
        },
      };
    });

    return {
      total,
      ca,
    };
  }
  throw new AuthenticationError('Go Home Kid');
};

module.exports = allUsers;
