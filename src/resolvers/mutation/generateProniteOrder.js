const { ApolloError, AuthenticationError } = require('apollo-server-express');
const {
  // rzpOptions,
  rzpBackupOptions,
  extraCharges,
  proniteFee,
  evtOfferAmount,
  smallEvtOfferAmount,
} = require('../../utils/config');
const { generateReceipt, isEligibleForEvtRefund } = require('../../utils/helpers');

const generateProniteOrder = async (_, args, context) => {
  const { isValid, id, db, logger, userLoader, teamLoader, rzpBackup } = context;
  const userIds = args.userIds.map(user => user.toUpperCase());
  const uniqueUserIds = [...new Set(userIds)];

  if (isValid) {
    if (!uniqueUserIds.includes(id))
      throw new ApolloError('User not it given user ids', 'USER_NOT_FOUND');

    const users = await userLoader.loadMany(uniqueUserIds);

    if (users.includes(null)) throw new ApolloError('Invalid User ID', 'INVALID_USER');

    if (users.some(user => user.pronite.paid === true))
      throw new ApolloError('Some user(s) already have pronite passes', 'USR_HAVE_PASSES');

    // Fetch all reams beforehand to avoid multiple requests
    const allTeams = users.reduce((acc, cur) => acc.concat(cur.teams.map(team => team.teamId)), []);
    await teamLoader.loadMany(allTeams);

    const offerEligibleUsers = [];
    const smallOfferEligibleUsers = [];

    for (let i = 0; i < users.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const teams = await teamLoader.loadMany(users[i].teams.map(team => team.teamId));
      const evtRefund = isEligibleForEvtRefund(users[i], teams);
      if (evtRefund === 'hundred') offerEligibleUsers.push(users[i]);
      else if (evtRefund === 'fifty') smallOfferEligibleUsers.push(users[i]);
    }
    logger('going ahead, eli users=>', offerEligibleUsers.length, smallOfferEligibleUsers.length);

    const totalAmount =
      users.length * proniteFee -
      offerEligibleUsers.length * evtOfferAmount -
      smallOfferEligibleUsers.length * smallEvtOfferAmount;

    if (totalAmount > 0) {
      const receipt = await generateReceipt(id, db, 'proniteOrders');

      const finalAmount = Math.floor(totalAmount * 100 + totalAmount * extraCharges);

      const orderData = await rzpBackup.orders.create({
        amount: `${finalAmount}`,
        currency: 'INR',
        payment_capture: '1',
        receipt,
        notes: {
          for: 'pronite',
        },
      });

      logger(
        '[PRO_ORDER]',
        `order created by ${id} for [${uniqueUserIds}] orderId: ${orderData.id} amount: ${finalAmount}`
      );
      logger(
        '[PRO_ORDER]',
        'bigOffer=>',
        offerEligibleUsers.map(u => u._id),
        'smallOffer=>',
        smallOfferEligibleUsers.map(u => u._id)
      );

      try {
        await db.collection('proniteOrders').insertOne({
          orderId: orderData.id,
          paymentId: null,
          signature: null,
          receipt,
          paidBy: id,
          users: uniqueUserIds,
          amount: totalAmount,
          finalAmount,
          status: 'initiated',
          backup: true,
          timeSt: orderData.created_at,
        });
      } catch (err) {
        logger('[ERR] [ORDER]', err);
        throw new ApolloError('Some error occured', '[DB_ERR]');
      }

      return {
        order_id: orderData.id,
        amount: `${finalAmount}`,
        key: rzpBackupOptions.key_id,
      };
    }
    throw new ApolloError('Total amount for pronite cannot be 0', 'TOTAL_ZERO');
  }
  throw new AuthenticationError('User is not logged in');
};

module.exports = generateProniteOrder;
