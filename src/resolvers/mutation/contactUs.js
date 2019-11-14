const { ApolloError } = require('apollo-server-express');
const mailer = require('../../utils/mailer');
const getContactEmail = require('../../utils/emails/contactUs');

const contactUs = async (_, args, { logger }) => {
  const { name, email, subject, message } = args;

  if (name === '' || email === '' || message === '')
    throw new ApolloError('Name, email or message cannot be empty', 'FIELDS_REQUIRED');

  const emailContent = getContactEmail(name, email, subject, message);
  logger('[CONTACT_US]', { name, email });

  const mailOptions = {
    to: 'info@aurorafest.org',
    subject: `[SUPPORT] request by ${name} for email ${email}`,
    ...emailContent,
    replyTo: email,
  };

  mailer(mailOptions);

  return {
    code: 200,
    success: true,
    message: 'Message sent successfully',
  };
};

module.exports = contactUs;
