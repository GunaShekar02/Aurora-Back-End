const { AuthenticationError } = require('apollo-server-express');
const { canViewPronites } = require('../../../utils/roles');

const proniteOrders = async (_, args, context) => {
  const { isValid, id, userLoader, db } = context;

  if (isValid && (await canViewPronites(id, userLoader))) {
    const { filterBy, pattern, status } = args;
    const limit = args.limit || 9999999;
    const page = args.page || 0;
    const sortBy = args.sortBy || 'timeSt'; // dummy field
    const sortDir = args.sortDir || -1;

    const availableFilters = new Map([
      ['name', 'paidByUser.name'],
      ['email', 'paidByUser.email'],
      ['arId', 'paidByUser._id'],
      ['orderId', 'orderId'],
    ]);

    const filter = status && status !== 'all' ? { status } : {};
    if (filterBy && pattern && availableFilters.has(filterBy)) {
      filter[availableFilters.get(filterBy)] = new RegExp(pattern, 'i');
    }

    let total = await db
      .collection('proniteOrders')
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'paidBy',
            foreignField: '_id',
            as: 'paidByUser',
          },
        },
        { $match: filter },
        {
          $count: 'orders',
        },
      ])
      .toArray();
    total = total[0] ? total[0].orders : 0;

    const orderArray = await db
      .collection('proniteOrders')
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'paidBy',
            foreignField: '_id',
            as: 'paidByUser',
          },
        },
        { $match: filter },
        { $sort: { [sortBy]: sortDir } },
        { $skip: page * limit },
        { $limit: limit },
      ])
      .toArray();

    const orders = orderArray.map(o => {
      return {
        ...o,
        paidBy: {
          id: o.paidBy,
        },
        users: o.users.map(u => {
          return { id: u };
        }),
      };
    });

    return {
      total,
      orders,
    };
  }
  throw new AuthenticationError('Go Home Kid');
};

module.exports = proniteOrders;
