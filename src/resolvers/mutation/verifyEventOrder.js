const { ApolloError } = require('apollo-server-express');
const crypto = require('crypto');
const { rzpOptions } = require('../../utils/config');

const verifySignature = (orderId, paymentId, signature) => {
  const generatedSignature = crypto
    .createHmac('SHA256', rzpOptions.key_secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

const verifyEventOrder = async (_, args, context) => {
  const { id, db, logger, client, rzp } = context;
  const { orderId, paymentId, signature } = args;

  const isSignatureValid = verifySignature(orderId, paymentId, signature);
  if (!isSignatureValid) throw new ApolloError('Invalid payment signature', 'INVALID_SIGNATURE');

  const order = await db.collection('orders').findOne({ orderId });
  if (!order) throw new ApolloError('OrderID does not exist', 'INVALID_ORDER');

  const orderData = await rzp.orders.fetch(orderId);

  logger('[VERIFY_ORDER]', 'orderData =>', orderData);

  const session = client.startSession({
    defaultTransactionOptions: {
      readConcern: { level: 'local' },
      writeConcern: { w: 'majority' },
      readPreference: 'primary',
    },
  });

  try {
    await session.withTransaction(async () => {
      const teamsCollection = db.collection('teams');
      const ordersCollection = db.collection('orders');

      const orderRes = ordersCollection.updateOne(
        { orderId },
        {
          $set: {
            status: orderData.status,
            signature,
            paymentId,
          },
        },
        { session }
      );

      const teamRes = teamsCollection.updateMany(
        { _id: { $in: order.teams } },
        { $set: { paymentStatus: true } },
        { session }
      );

      return Promise.all([orderRes, teamRes]);
    });
  } catch (err) {
    logger('[VERIFY_ORDER]', '[TRX_ERR]', err);
    throw new ApolloError('Something went wrong', 'TRX_FAILED');
  } finally {
    // teamLoader.clear(teamId);
    await session.endSession();
  }

  return {
    code: 200,
    message: 'Payment successful',
    success: true,
    user: {
      id,
    },
  };
};

module.exports = verifyEventOrder;
