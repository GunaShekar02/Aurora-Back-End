const { AuthenticationError, ApolloError } = require('apollo-server-express');
const { getEventOffer } = require('../../../utils/helpers');
const { refundUsers } = require('../../../utils/offerRefund');
const mailer = require('../../../utils/mailer');
const getEvtEmail = require('../../../utils/emails/evtRegister');
const getInfoEvtEmail = require('../../../utils/emails/infoEvt');
const eventMap = require('../../../data/eventData');
const { canEditOrders } = require('../../../utils/roles');

const reVerifyEvtOrder = async (_, args, context) => {
  const { isValid, id, db, rzp, client, userLoader, teamLoader, logger } = context;

  if (isValid && (await canEditOrders(id, userLoader))) {
    const { orderId } = args;

    const orderCollection = db.collection('orders');

    const order = await orderCollection.findOne({ orderId });

    if (!order) throw new ApolloError('Order does not exist', 'INVALID_ORDER');

    if (order.status === 'paid') throw new ApolloError('Order is already paid', 'ORDER_PAID');

    const rzpOrder = await rzp.orders.fetch(orderId);
    const paymentList = await rzp.orders.fetchPayments(orderId);

    console.log(rzpOrder, paymentList);

    const [payment] = paymentList.items.filter(p => p.status === 'captured');

    console.log(payment);
    if (rzpOrder.status !== 'paid')
      throw new ApolloError('Order is still unpaid', 'RZPORDER_UNPAID');

    if (!payment) throw new ApolloError('No valid payment found', 'NO_PAYMENT');

    const teams = await teamLoader.loadMany(order.teams);
    const userMap = new Map();
    for (let i = 0; i < teams.length; i += 1) {
      const team = teams[i];
      team.members.forEach(uid => {
        const item = userMap.has(uid) ? userMap.get(uid) : [];
        item.push(team.event);

        userMap.set(uid, item);
      });
    }
    console.log(userMap);
    const uids = Array.from(userMap.keys());
    const users = await userLoader.loadMany(uids);

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

    logger('arey', hundredUsers, hundredFiftyUsers, fiftyUsers);

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
              status: rzpOrder.status,
              paymentId: payment.id,
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
          { _id: { $in: hundredUsers.map(u => u._id) } },
          {
            $set: { 'pronite.gotEvtOffer': 'hundred' },
            $inc: { 'pronite.refundedAmount': 100 },
          },
          { session }
        );
        const userHundredFiftyRes = usersCollection.updateMany(
          { _id: { $in: hundredFiftyUsers.map(u => u._id) } },
          {
            $set: { 'pronite.gotEvtOffer': 'hundred' },
            $inc: { 'pronite.refundedAmount': 50 },
          },
          { session }
        );
        const userFiftyRes = usersCollection.updateMany(
          { _id: { $in: fiftyUsers.map(u => u._id) } },
          {
            $set: { 'pronite.gotEvtOffer': 'fifty' },
            $inc: { 'pronite.refundedAmount': 50 },
          },
          { session }
        );

        return Promise.all([orderRes, teamRes, userHundredRes, userHundredFiftyRes, userFiftyRes]);
      });

      const refund = async () => {
        await refundUsers(hundredUsers, 100, rzp, db, 'evt');
        await refundUsers(hundredFiftyUsers, 50, rzp, db, 'evt');
        await refundUsers(fiftyUsers, 50, rzp, db, 'evt');
      };
      refund();
    } catch (err) {
      logger('[VERIFY_ORDER]', '[TRX_ERR]', err);
      throw new ApolloError('Something went wrong', 'TRX_FAILED');
    } finally {
      const payUser = await userLoader.load(id);
      teams.forEach(t => {
        const { name, fee } = eventMap.get(t.event);
        mailer(getInfoEvtEmail(id, payUser.name, payUser.email, name, fee, t._id));
      });

      users.forEach(user => {
        const { name, email } = user;
        userMap.get(user._id).forEach(eId => {
          const { name: evtName, fee } = eventMap.get(eId);
          mailer(getEvtEmail(name, email, evtName, order.receipt, fee));
        });
      });
      console.log('done');
      // teamLoader.clear(teamId);
      order.teams.forEach(tid => teamLoader.clear(tid));
      await session.endSession();
    }

    return {
      success: true,
      message: 'Re-verified order status',
      code: 200,
    };
  }
  throw new AuthenticationError('Go Home Kid');
};

module.exports = reVerifyEvtOrder;
