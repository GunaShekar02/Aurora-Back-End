const logger = require('./logger');
const mailer = require('./mailer');
const getAccRefundMail = require('./emails/accRefund');
const getEvtRefundMail = require('./emails/evtRefund');

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
      await rzp.payments.refund(order.paymentId, { amount: amount * 100 });
      const options =
        context === 'acc'
          ? getAccRefundMail(user.name, user.email, amount)
          : getEvtRefundMail(user.name, user.email, amount);
      mailer(options);
      logger('[REFUND]', 'refunded user:', user._id, 'amount: ', amount);
    } catch (err) {
      logger('[ERR] [REFUND] refund failed =>', err);
    }
  }
};

// const offerRefund = (users, amount, rzp, db) => {
//   users.forEach(user => refundUser(user, amount, rzp, db));
// };

module.exports = offerRefund;
