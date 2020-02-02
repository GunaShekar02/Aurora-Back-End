const rzp = require('razorpay');
const mailer = require('../utils/mailer');
const getReverifyInfoEmail = require('../utils/emails/reverifyInfo');

const checkOrder = async (data, db) => {
  if (data.event === 'order.paid') {
    const payment = data.payload.payment.entity;
    let order;

    order = await db.collection('orders').findOne({ orderId: payment.order_id });
    if (order) {
      if (order.status !== 'paid')
        mailer(
          getReverifyInfoEmail(payment.order_id, payment.amount / 100, payment.email, 'event')
        );
    } else {
      order = await db.collection('proniteOrders').findOne({ orderId: payment.order_id });
      if (order) {
        if (order.status !== 'paid')
          mailer(
            getReverifyInfoEmail(payment.order_id, payment.amount / 100, payment.email, 'pronite')
          );
      } else {
        order = await db.collection('accOrders').findOne({ orderId: payment.order_id });
        if (order) {
          if (order.status !== 'paid')
            mailer(
              getReverifyInfoEmail(
                payment.order_id,
                payment.amount / 100,
                payment.email,
                'accomodation'
              )
            );
        } else {
          console.log('order not found in database, data=>', data);
        }
      }
    }
  }
};

const rzpWebhook = (req, res, db) => {
  const data = req.body;
  const signature = req.headers['x-razorpay-signature'];

  const isValid = rzp.validateWebhookSignature(
    JSON.stringify(data),
    signature,
    process.env.RZP_WEBHOOK_SECRET
  );

  if (isValid) {
    setTimeout(() => {
      checkOrder(data, db);
    }, 10000);
  }

  res.status(200).json('got it');
};

module.exports = rzpWebhook;
