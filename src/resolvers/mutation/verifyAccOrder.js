const { ApolloError } = require('apollo-server-express');
const { verifyRzpSignature } = require('../../utils/helpers');
const { refundUsers } = require('../../utils/offerRefund');

const verifyAccOrder = async (_, args, context) => {
  const { id, db, logger, client, rzp, userLoader } = context;
  const { orderId, paymentId, signature } = args;

  const isSignatureValid = verifyRzpSignature(orderId, paymentId, signature);
  if (!isSignatureValid) throw new ApolloError('Invalid payment signature', 'INVALID_SIGNATURE');

  const order = await db.collection('accOrders').findOne({ orderId });
  if (!order) throw new ApolloError('OrderID does not exist', 'INVALID_ORDER');

  const orderData = await rzp.orders.fetch(orderId);

  logger('[VERIFY_ACC_ORDER]', 'orderData =>', orderData);

  const users = await userLoader.loadMany(order.users);

  const fullUsers = [];
  const hundredUsers = [];
  const fiftyUsers = [];
  const noRefundUsers = [];
  for (let i = 0; i < users.length; i += 1) {
    const user = users[i];
    const { paid, gotEvtOffer } = user.pronite;
    if (paid) {
      if (gotEvtOffer === 'none') fullUsers.push(user);
      else if (gotEvtOffer === 'fifty') fiftyUsers.push(user);
      else if (gotEvtOffer === 'hundred') hundredUsers.push(user);
    } else {
      noRefundUsers.push(user);
    }
  }

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
        { $set: { accommodation: true, 'pronite.paid': true, 'pronite.gotAccOffer': true } },
        { session }
      );

      const fullRes = usersCollection.updateMany(
        { _id: { $in: fullUsers.map(u => u._id) } },
        { $inc: { 'pronite.refundedAmount': 349 } },
        { session }
      );

      const fiftyRes = usersCollection.updateMany(
        { _id: { $in: fiftyUsers.map(u => u._id) } },
        { $inc: { 'pronite.refundedAmount': 299 } },
        { session }
      );

      const hundredRes = usersCollection.updateMany(
        { _id: { $in: hundredUsers.map(u => u._id) } },
        { $inc: { 'pronite.refundedAmount': 249 } },
        { session }
      );

      return Promise.all([orderRes, userRes, fullRes, fiftyRes, hundredRes]);
    });

    const refund = async () => {
      await refundUsers(fullUsers, 349, rzp, db, 'acc');
      await refundUsers(fiftyUsers, 299, rzp, db, 'acc');
      await refundUsers(hundredUsers, 249, rzp, db, 'acc');
    };
    refund();
  } catch (err) {
    logger('[VERIFY_ORDER]', '[TRX_ERR]', err);
    throw new ApolloError('Something went wrong', 'TRX_FAILED');
  } finally {
    // teamLoader.clear(teamId);
    userLoader.clear(id);
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
