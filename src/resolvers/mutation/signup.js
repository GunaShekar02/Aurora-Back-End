const { UserInputError, ApolloError } = require('apollo-server-express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { generateArId } = require('../../utils/helpers');

const { jwtHsSecret } = require('../../utils/config');
const mailer = require('../../utils/mailer');

const signup = async (_, args, context) => {
  const { db, client, logger } = context;
  const { email, password, name, college, phone } = args;

  if (name === '' || email === '' || college === '' || phone === '' || password === '')
    throw new ApolloError(
      'Name, email, password, college or phone cannot be empty',
      'FIELDS_REQUIRED'
    );

  const user = await db.collection('users').findOne({ email });
  if (!user) {
    const arId = await generateArId(name, db);
    const payload = {
      _id: arId,
      email,
      name,
      college,
      phone,
      isVerified: false,
      accommodation: false,
      teams: [],
      teamInvitations: [],
    };
    const token = await jwt.sign({ email, sub: 'ConfirmEmail' }, jwtHsSecret, {
      expiresIn: '1d',
    });
    console.log(token);
    const hash = await bcrypt.hash(password, 10);

    const mailOptions = {
      to: email,
      text: token,
      from: 'mallik813@gmail.com',
      html: `<html><body>Hello</body></html>`,
      subject: 'Verify email',
    };
    const session = client.startSession({
      defaultTransactionOptions: {
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' },
        readPreference: 'primary',
      },
    });

    try {
      await session.withTransaction(async () => {
        const usersCollection = db.collection('users');

        await usersCollection.insertOne({
          hash,
          ...payload,
        });
      });
    } catch (err) {
      logger('[TRX_ERR]', err);
      throw new ApolloError('Something went wrong', 'TRX_FAILED');
    } finally {
      await session.endSession();
    }

    await mailer(mailOptions);

    return {
      code: 200,
      success: true,
      message: `A mail has been sent to ${email}, verify email to continue...`,
      user: {
        id: arId,
        ...payload,
      },
    };
  }
  throw new UserInputError('Email already exists');
};

module.exports = signup;
