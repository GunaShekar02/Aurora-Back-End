const { AuthenticationError, ApolloError } = require('apollo-server-express');
const { refundUsers } = require('../../../utils/offerRefund');
const mailer = require('../../../utils/mailer');
const getAccEmail = require('../../../utils/emails/accomodation');
const { canEditAcc } = require('../../../utils/roles');

const reVerifyAccOrder = async (_, args, context) => {
  const { isValid, id, db, rzp, client, userLoader, logger } = context;

  if (isValid && (await canEditAcc(id, userLoader))) {
    const { orderId } = args;

    const orderCollection = db.collection('accOrders');

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
              status: rzpOrder.status,
              paymentId: payment.id,
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

      users.forEach(u => mailer(getAccEmail(u.name, u.email, u._id, order.receipt, 799)));
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

module.exports = reVerifyAccOrder;
