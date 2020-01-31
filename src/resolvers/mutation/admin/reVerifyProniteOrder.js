const { AuthenticationError, ApolloError } = require('apollo-server-express');
const { isEligibleForEvtRefund } = require('../../../utils/helpers');
const mailer = require('../../../utils/mailer');
const getProniteEmail = require('../../../utils/emails/pronite');
const getInfoProEmail = require('../../../utils/emails/infoPronite');
const { canEditPronites } = require('../../../utils/roles');

const reVerifyEvtOrder = async (_, args, context) => {
  const { isValid, id, db, rzp, client, userLoader, teamLoader, logger } = context;

  if (isValid && (await canEditPronites(id, userLoader))) {
    const { orderId } = args;

    const orderCollection = db.collection('proniteOrders');

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

    const users = await userLoader.loadMany(order.users);

    const gotPronite = users.some(u => u.pronite.paid);
    if (gotPronite) throw new ApolloError('Some user(s) already got Pronite', 'ALREADY_PAID');

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
              status: rzpOrder.status,
              paymentId: payment.id,
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

      notEligibleUsers.forEach(u => {
        mailer(getProniteEmail(u.name, u.email, u._id, order.receipt, 349));
        mailer(getInfoProEmail(u._id, u.name, u.email, orderId, 349));
      });
      smallOfferEligibleUsers.forEach(u => {
        mailer(getProniteEmail(u.name, u.email, u._id, order.receipt, 299));
        mailer(getInfoProEmail(u._id, u.name, u.email, orderId, 299));
      });
      offerEligibleUsers.forEach(u => {
        mailer(getProniteEmail(u.name, u.email, u._id, order.receipt, 249));
        mailer(getInfoProEmail(u._id, u.name, u.email, orderId, 249));
      });
    } catch (err) {
      logger('[VERIFY_ORDER]', '[TRX_ERR]', err);
      throw new ApolloError('Something went wrong', 'TRX_FAILED');
    } finally {
      // teamLoader.clear(teamId);
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
