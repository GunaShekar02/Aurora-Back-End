const Razorpay = require('razorpay');
const { rzpOptions } = require('./utils/config');

const rzp = new Razorpay(rzpOptions);

module.exports = rzp;
