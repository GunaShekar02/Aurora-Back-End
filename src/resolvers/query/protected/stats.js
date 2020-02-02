const { AuthenticationError } = require('apollo-server-express');
const { canViewUsers } = require('../../../utils/roles');

const stats = async (_, __, context) => {
  const { id, isValid, userLoader, db } = context;

  if (isValid && (await canViewUsers(id, userLoader))) {
    const total = await db
      .collection('users')
      .find({})
      .count();

    const verified = await db
      .collection('users')
      .find({ isVerified: true })
      .count();

    const pronite = await db
      .collection('users')
      .find({ 'pronite.paid': true })
      .count();

    const accommodation = await db
      .collection('users')
      .find({ accommodation: true })
      .count();

    const [events] = await db
      .collection('users')
      .aggregate([
        {
          $lookup: {
            from: 'teams',
            localField: 'teams.teamId',
            foreignField: '_id',
            as: 'teamList',
          },
        },
        {
          $match: { 'teamList.paymentStatus': true },
        },
        {
          $count: 'total',
        },
      ])
      .toArray();

    const [onsiteEvents] = await db
      .collection('users')
      .aggregate([
        {
          $lookup: {
            from: 'teams',
            localField: 'teams.teamId',
            foreignField: '_id',
            as: 'teamList',
          },
        },
        {
          $match: {
            teamList: {
              $elemMatch: {
                paymentStatus: true,
                event: { $nin: [15, 17, 18, 21, 22, 29] },
              },
            },
          },
        },
        {
          $count: 'total',
        },
      ])
      .toArray();

    const payload = {
      total,
      verified,
      pronite,
      accommodation,
      events: events.total,
      onsiteEvents: onsiteEvents.total,
    };

    return payload;
  }
  throw new AuthenticationError('Go Home Kid');
};

module.exports = stats;
