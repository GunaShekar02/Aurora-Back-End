const { ApolloError } = require('apollo-server-express');
const { verifyRzpSignature } = require('../../utils/helpers');

const verifyAccOrder = async (_, args, context) => {
  const { id, db, logger, client, rzp } = context;
  const { orderId, paymentId, signature } = args;

  const isSignatureValid = verifyRzpSignature(orderId, paymentId, signature);
  if (!isSignatureValid) throw new ApolloError('Invalid payment signature', 'INVALID_SIGNATURE');

  const order = await db.collection('accOrders').findOne({ orderId });
  if (!order) throw new ApolloError('OrderID does not exist', 'INVALID_ORDER');

  const orderData = await rzp.orders.fetch(orderId);

  logger('[VERIFY_ACC_ORDER]', 'orderData =>', orderData);

  const session = client.startSession({
    defaultTransactionOptions: {
      readConcern: { level: 'local' },
      writeConcern: { w: 'majority' },
      readPreference: 'primary',
    },
  });

  try {
    await session.withTransaction(async () => {
      const usersCollection = db.collection('users');
      const ordersCollection = db.collection('accOrders');

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

      const userRes = usersCollection.updateMany(
        { _id: { $in: order.users } },
        { $set: { accommodation: true } },
        { session }
      );

      return Promise.all([orderRes, userRes]);
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

module.exports = verifyAccOrder;
