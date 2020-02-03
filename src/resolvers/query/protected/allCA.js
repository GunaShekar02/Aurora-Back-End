const { AuthenticationError } = require('apollo-server-express');
const { canViewCA } = require('../../../utils/roles');

const allCA = async (_, args, context) => {
  const { id, userLoader, isValid, db } = context;

  if (isValid && (await canViewCA(id, userLoader))) {
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
            as: 'user.teamList',
          },
        },
        {
          $project: {
            timeSt: 1,
            name: 1,
            college: 1,
            email: 1,
            'user._id': 1,
            'user.pronite': 1,
            'user.teamList': {
              $filter: {
                input: '$user.teamList',
                as: 'team',
                cond: {
                  $eq: ['$$team.paymentStatus', true],
                },
              },
            },
          },
        },
        {
          $project: {
            timeSt: 1,
            name: 1,
            college: 1,
            email: 1,
            'user._id': 1,
            'user.pronite': 1,
            'user.teamList': 1,
            'user.teamSize': {
              $reduce: {
                input: '$user.teamList',
                initialValue: 0,
                in: {
                  $add: ['$$value', 1],
                },
              },
            },
          },
        },
        {
          $group: {
            _id: '$_id',
            users: {
              $push: '$user',
            },
            timeSt: {
              $first: '$timeSt',
            },
            name: {
              $first: '$name',
            },
            college: {
              $first: '$college',
            },
            email: {
              $first: '$email',
            },
          },
        },
        {
          $project: {
            timeSt: 1,
            name: 1,
            college: 1,
            email: 1,
            users: {
              $filter: {
                input: '$users',
                as: 'user',
                cond: {
                  $or: [
                    {
                      $eq: ['$$user.pronite.paid', true],
                    },
                    {
                      $gt: ['$$user.teamSize', 0],
                    },
                  ],
                },
              },
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

module.exports = allCA;
