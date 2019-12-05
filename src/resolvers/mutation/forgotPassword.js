const { ApolloError } = require('apollo-server-express');
const mailer = require('../../utils/mailer');
const getForgotEmail = require('../../utils/emails/forgotPass');

const forgotPassword = async (_, args, context) => {
  const { db, logger } = context;
  const { arIdOrEmail } = args;

  const user = await db
    .collection('users')
    .findOne({ $or: [{ email: arIdOrEmail.toLowerCase() }, { _id: arIdOrEmail.toUpperCase() }] });

  if (user) {
    if (user.isVerified === false)
      throw new ApolloError('Verify your email first.', 'EMAIL_NOT_VERIFIED');

    const token = `${user._id.replace(/-/g, '')}${Math.floor(Math.random() * 899999 + 100000)}`;

    const mailOptions = getForgotEmail(user.name, user.email, token);

    const forgot = await db.collection('forgot').findOne({ _id: user._id });

    if (forgot) {
      await db.collection('forgot').updateOne(
        {
          _id: user._id,
        },
        {
          $set: {
            forgotHash: token,
            timeSt: `${Date.now()}`,
          },
        }
      );
    } else {
      await db.collection('forgot').insertOne({
        _id: user._id,
        forgotHash: token,
        timeSt: `${Date.now()}`,
      });
    }

    mailer(mailOptions);

    logger('[FORGOT_PASS]', arIdOrEmail, token);
  }

  return {
    code: 200,
    success: true,
    message: `An email has been sent to your email account.`,
  };
};

module.exports = forgotPassword;
