const { ApolloError } = require('apollo-server-express');
const { verifyRzpSignature, getEventOffer } = require('../../utils/helpers');
const offerRefund = require('../../utils/offerRefund');

const verifyEventOrder = async (_, args, context) => {
  const { id, db, logger, client, rzp, teamLoader, userLoader } = context;
  const { orderId, paymentId, signature } = args;

  const isSignatureValid = verifyRzpSignature(orderId, paymentId, signature);
  if (!isSignatureValid) throw new ApolloError('Invalid payment signature', 'INVALID_SIGNATURE');

  const order = await db.collection('orders').findOne({ orderId });
  if (!order) throw new ApolloError('OrderID does not exist', 'INVALID_ORDER');

  const orderData = await rzp.orders.fetch(orderId);

  logger('[VERIFY_ORDER]', 'orderData =>', orderData);

  const teams = await teamLoader.loadMany(order.teams);
  const userMap = new Map();
  for (let i = 0; i < teams.length; i += 1) {
    const team = teams[i];
    team.members.forEach(uid => {
      let item = [];
      if (userMap.has(uid)) item = userMap.get(uid).push(team.event);
      else item = [team.event];

      userMap.set(uid, item);
    });
  }
  const users = userLoader.loadMany(userMap.keys());

  const hundredUsers = []; // status hundred, refund 100
  const hundredFiftyUsers = []; // status hundred, refund 50
  const fiftyUsers = []; // status fifty, refund 50

  for (let i = 0; i < users.length; i += 1) {
    const user = users[i];
    const { paid, gotAccOffer, gotEvtOffer } = user.pronite;
    if (paid && !gotAccOffer && !(gotEvtOffer === 'hundred')) {
      const eOffer = getEventOffer(userMap.get(user._id));
      // we can give upto rs 100
      if (eOffer === 'hundred') {
        if (gotEvtOffer === 'none') hundredUsers.push(user);
        else if (gotEvtOffer === 'fifty') hundredFiftyUsers.push(user);
      } // we can give upto rs 50
      else if (eOffer === 'fifty') {
        if (gotEvtOffer === 'none') fiftyUsers.push(user);
        else if (gotEvtOffer === 'fifty') hundredFiftyUsers.push(user);
      }
    }
  }

  hundredUsers.forEach(user => offerRefund(user, 100, rzp, db, 'evt'));
  hundredFiftyUsers.forEach(user => offerRefund(user, 50, rzp, db, 'evt'));
  fiftyUsers.forEach(user => offerRefund(user, 50, rzp, db, 'evt'));

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
      const usersCollection = db.collection('users');

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

      const userHundredRes = usersCollection.updateMany(
        { _id: { $in: hundredUsers.concat(hundredFiftyUsers).map(u => u._id) } },
        { $set: { 'pronite.gotEvtOffer': 'hundred' } },
        { session }
      );
      const userFiftyRes = usersCollection.updateMany(
        { _id: { $in: fiftyUsers.map(u => u._id) } },
        { $set: { 'pronite.gotEvtOffer': 'fifty' } },
        { session }
      );

      return Promise.all([orderRes, teamRes, userHundredRes, userFiftyRes]);
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
