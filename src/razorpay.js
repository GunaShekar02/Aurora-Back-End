const Razorpay = require('razorpay');
const { rzpOptions, rzpBackupOptions } = require('./utils/config');

const rzp = new Razorpay(rzpOptions);

const rzpBackup = new Razorpay(rzpBackupOptions);

module.exports = { rzp, rzpBackup };
