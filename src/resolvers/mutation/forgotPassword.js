const { UserInputError } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const { jwtHsSecret } = require('../../utils/config');

const mailer = require('../../utils/mailer');

const forgotPassword = async (_, args, context) => {
  const { db } = context;
  const { email } = args;
  const user = await db.collection('users').findOne({ email });
  if (user) {
    const token = await jwt.sign({ email, sub: 'ForgotPassword' }, jwtHsSecret, {
      expiresIn: '1d',
    });
    console.log(token);
    const mailOptions = {
      to: email,
      text: token,
      from: 'mallik813@gmail.com',
      html: `<html><body>Hello, click here to reset your password <a href=${token}>Reset password</a></body></html>`,
      subject: 'Verify email',
    };
    await mailer(mailOptions);
    return `A Reset password Link has been sent to ${email}`;
  }
  throw new UserInputError('Invalid Email');
};

module.exports = forgotPassword;
