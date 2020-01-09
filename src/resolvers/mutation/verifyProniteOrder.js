const { ApolloError } = require('apollo-server-express');
const { verifyRzpSignature, isEligibleForEvtRefund } = require('../../utils/helpers');

const verifyProniteOrder = async (_, args, context) => {
  const { id, db, logger, client, rzp, userLoader, teamLoader } = context;
  const { orderId, paymentId, signature } = args;

  const isSignatureValid = verifyRzpSignature(orderId, paymentId, signature);
  if (!isSignatureValid) throw new ApolloError('Invalid payment signature', 'INVALID_SIGNATURE');

  const order = await db.collection('proniteOrders').findOne({ orderId });
  if (!order) throw new ApolloError('OrderID does not exist', 'INVALID_ORDER');

  const orderData = await rzp.orders.fetch(orderId);

  logger('[VERIFY_PRO_ORDER]', 'orderData =>', orderData);

  const users = await userLoader.loadMany(order.users);

  // Fetch all reams beforehand to avoid multiple requests
  const allTeams = users.reduce((acc, cur) => acc.concat(cur.teams.map(team => team.teamId)), []);
  await teamLoader.loadMany(allTeams);

  const offerEligibleUsers = [];
  const smallOfferEligibleUsers = [];
  const notEligibleUsers = [];

  for (let i = 0; i < users.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const teams = await teamLoader.loadMany(users[i].teams.map(team => team.teamId));
    const evtRefund = isEligibleForEvtRefund(users[i], teams);
    if (evtRefund === 'hundred') offerEligibleUsers.push(users[i]);
    else if (evtRefund === 'fifty') smallOfferEligibleUsers.push(users[i]);
    else notEligibleUsers.push(users[i]);
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
      const ordersCollection = db.collection('proniteOrders');

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
        { _id: { $in: notEligibleUsers.map(u => u._id) } },
        { $set: { 'pronite.paid': true, 'pronite.paidAmount': 349 } },
        { session }
      );

      const userSmallEvtRes = usersCollection.updateMany(
        { _id: { $in: smallOfferEligibleUsers.map(u => u._id) } },
        {
          $set: {
            'pronite.paid': true,
            'pronite.gotEvtOffer': 'fifty',
            'pronite.paidAmount': 299,
          },
        },
        { session }
      );

      const userEvtRes = usersCollection.updateMany(
        { _id: { $in: offerEligibleUsers.map(u => u._id) } },
        {
          $set: {
            'pronite.paid': true,
            'pronite.gotEvtOffer': 'hundred',
            'pronite.paidAmount': 249,
          },
        },
        { session }
      );

      return Promise.all([orderRes, userRes, userSmallEvtRes, userEvtRes]);
    });
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

module.exports = verifyProniteOrder;
