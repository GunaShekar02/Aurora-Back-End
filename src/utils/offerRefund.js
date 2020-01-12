const logger = require('./logger');
const mailer = require('./mailer');
const getAccRefundMail = require('./emails/accRefund');
const getEvtRefundMail = require('./emails/evtRefund');
const getErrMail = require('./emails/err');

const offerRefund = async (user, amount, rzp, db, context) => {
  // + 5 is to prevent some edge cases where we would refuse to refund
  if (amount > user.pronite.paidAmount - user.pronite.refundedAmount + 5) {
    logger('[REFUND_ERR] attempted to refund more than paid. user:', user._id, 'amount:', amount);
    return;
  }
  const order = await db.collection('proniteOrders').findOne({ status: 'paid', users: user._id });
  if (!order) {
    logger('[ERR] [REFUND]', 'payment for pronite not found for user', user._id);
  } else {
    try {
      const refund = await rzp.payments.refund(order.paymentId, { amount: amount * 100 });
      console.log(refund);
      await db.collection('refunds').insertOne({
        refundId: refund.id,
        arId: user._id,
        context,
        amount,
        paymentId: refund.payment_id,
        timeSt: refund.created_at,
      });
      const options =
        context === 'acc'
          ? getAccRefundMail(user.name, user.email, amount)
          : getEvtRefundMail(user.name, user.email, amount);
      mailer(options);
      logger('[REFUND]', 'refunded user:', user._id, 'amount: ', amount);
    } catch (err) {
      const errOptions = getErrMail(
        `Error occured during Refund: id=> ${user._id}, paymentId=> ${order.paymentId}, amt=> ${amount}, ctx=> ${context}`,
        JSON.stringify(err, null, '\t')
      );
      mailer(errOptions);
      logger('[ERR] [REFUND] refund failed =>', err);
    }
  }
};

const refundUsers = async (users, amount, rzp, db, context) => {
  for (let i = 0; i < users.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await offerRefund(users[i], amount, rzp, db, context);
  }
};

module.exports = { refundUsers, offerRefund };
