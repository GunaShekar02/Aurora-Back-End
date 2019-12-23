const { ApolloError, AuthenticationError } = require('apollo-server-express');
const { rzpOptions, extraCharges, accomodationFee } = require('../../utils/config');
const { generateReceipt } = require('../../utils/helpers');

const generateAccOrder = async (_, args, context) => {
  const { isValid, id, db, logger, userLoader, rzp } = context;
  const userIds = args.userIds.map(user => user.toUpperCase());

  if (isValid) {
    if (!userIds.some(user => user === id))
      throw new ApolloError('User not it given user ids', 'USER_NOT_FOUND');

    const users = await userLoader.loadMany(userIds);

    if (users.some(user => user === null)) throw new ApolloError('Invalid User ID', 'INVALID_USER');

    if (users.some(user => user.accommodation === true))
      throw new ApolloError('Some user(s) already have accomodation', 'USR_HAVE_ACC');

    const totalAmount = users.length * accomodationFee;

    if (totalAmount > 0) {
      const receipt = await generateReceipt(id, db, 'accOrders');

      const finalAmount = Math.floor(totalAmount * 100 + totalAmount * extraCharges);

      const orderData = await rzp.orders.create({
        amount: `${finalAmount}`,
        currency: 'INR',
        payment_capture: '1',
        receipt,
        notes: {
          for: 'accomodation',
        },
      });

      logger('[ACC_ORDER]', 'order created by', id, 'for', userIds, 'orderId:', orderData.id);

      try {
        await db.collection('accOrders').insertOne({
          orderId: orderData.id,
          paymentId: null,
          signature: null,
          receipt,
          paidBy: id,
          users: userIds,
          amount: totalAmount,
          finalAmount,
          status: 'initiated',
          timeSt: orderData.created_at,
        });
      } catch (err) {
        logger('[ERR] [ORDER]', err);
        throw new ApolloError('Some error occured', '[DB_ERR]');
      }

      return {
        order_id: orderData.id,
        amount: `${finalAmount}`,
        key: rzpOptions.key_id,
      };
    }
    throw new ApolloError('Total amount for accomodation cannot be 0', 'TOTAL_ZERO');
  }
  throw new AuthenticationError('User is not logged in');
};

module.exports = generateAccOrder;
