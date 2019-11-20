const { UserInputError } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../utils/config');

const mailer = require('../../utils/mailer');

const forgotPassword = async (_, args, context) => {
  const { db } = context;
  const { email } = args;
  const user = await db.collection('users').findOne({ email });
  if (!user) {
    const token = await jwt.sign({ email }, jwtSecret.privKey, {
      algorithm: 'ES512',
      expiresIn: '1d',
    });
    console.log(token);
    const mailOptions = {
      to: email,
      text: token,
      from: 'mallik813@gmail.com',
      html: `<html><body>Hello</body></html>`,
      subject: 'Verify email',
    };
    await mailer(mailOptions);
  }
  throw new UserInputError('Invalid Email Error');
};

module.exports = forgotPassword;
