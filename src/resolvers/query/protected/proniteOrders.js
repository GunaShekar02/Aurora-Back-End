const { AuthenticationError } = require('apollo-server-express');

const proniteOrders = async (_, args, context) => {
  const { isValid, isRoot, db } = context;

  if (isValid && isRoot) {
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

    const filter = status ? { status } : {};
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
    total = total[0].orders;

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
