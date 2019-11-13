const nodemailer = require('nodemailer');
const { smtpCreds } = require('../utils/config');
const logger = require('../utils/logger');

const mailer = async options => {
  /*
  options = {
    to:
    from:
    subject:
    text:
    html:
  }
  */
  const defaultOptions = {
    from: '"Aurora Support" <support@aurorafest.org>',
    subject: 'Verify your email to complete registration',
  };

  const transporter = nodemailer.createTransport(smtpCreds);

  try {
    const info = await transporter.sendMail({
      ...defaultOptions,
      ...options,
    });

    logger('Email Sent:', info.messageId);
  } catch (err) {
    logger('[EMAIL_ERR]', err);
  }
};

module.exports = mailer;
