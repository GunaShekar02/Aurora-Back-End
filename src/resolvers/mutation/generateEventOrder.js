const { ApolloError, AuthenticationError } = require('apollo-server-express');
const eventData = require('../../data/eventData');
const { rzpOptions, extraCharges } = require('../../utils/config');
const { generateReceipt } = require('../../utils/helpers');

const generateEventOrder = async (_, args, context) => {
  const { isValid, id, db, logger, teamLoader, rzp } = context;
  const { teamIds } = args;

  if (isValid) {
    const teams = await teamLoader.loadMany(teamIds);

    if (teams.some(team => team === null)) throw new ApolloError('Invalid Team ID', 'INVALID_TEAM');

    if (teams.some(team => !team.members.some(member => member === id)))
      throw new ApolloError('User is not a member of any one of listed teams', 'USR_NOT_MEMBER');

    if (teams.some(team => team.paymentStatus === true))
      throw new ApolloError('Payment already done for some of listed teams', 'TEAM_ALREADY_PAID');

    const totalAmount = teams.reduce((acc, team) => acc + eventData.get(team.event).fee, 0);

    if (totalAmount > 0) {
      const receipt = await generateReceipt(id, db, 'orders');

      const finalAmount = Math.floor(totalAmount * 100 + totalAmount * extraCharges);

      const orderData = await rzp.orders.create({
        amount: `${finalAmount}`,
        currency: 'INR',
        payment_capture: '1',
        receipt,
      });

      logger('[ORDER]', 'order created by', id, 'for', teamIds, 'orderId:', orderData.id);

      try {
        await db.collection('orders').insertOne({
          orderId: orderData.id,
          paymentId: null,
          signature: null,
          receipt,
          paidBy: id,
          teams: teamIds,
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
    try {
      logger('[ORDER]', 'Order with value 0; teamIds=>', teamIds);

      const teamsCollection = db.collection('teams');
      await teamsCollection.updateMany(
        { _id: { $in: teamIds } },
        { $set: { paymentStatus: true } }
      );
    } catch (err) {
      logger('[ERR] [ORDER]', err);
      throw new ApolloError('Some error occured', '[DB_ERR]');
    }

    return {
      order_id: '0',
      amount: '0',
      key: '0',
    };
  }
  throw new AuthenticationError('User is not logged in');
};

module.exports = generateEventOrder;
