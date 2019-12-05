const { UserInputError, ApolloError } = require('apollo-server-express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { generateArId } = require('../../utils/helpers');
const getConfirmEmail = require('../../utils/emails/emailConfirm');

const { jwtHsSecret } = require('../../utils/config');
const mailer = require('../../utils/mailer');

const signup = async (_, args, context) => {
  const { db, client, logger } = context;
  const { password, name, college, phone, gender, city } = args;
  const email = args.email.toLowerCase();

  if (
    name === '' ||
    email === '' ||
    college === '' ||
    phone === '' ||
    password === '' ||
    gender === '' ||
    city === ''
  )
    throw new ApolloError('Required fields cannot be empty', 'FIELDS_REQUIRED');

  const user = await db.collection('users').findOne({ email });
  if (!user) {
    const arId = await generateArId(name, db);
    const payload = {
      _id: arId,
      email,
      name,
      college,
      phone,
      gender,
      city,
      displayPic: `profile-${gender}.jpg`,
      isVerified: false,
      accommodation: false,
      teams: [],
      teamInvitations: [],
      timeSt: `${Date.now()}`,
    };
    const token = await jwt.sign({ email, sub: 'ConfirmEmail' }, jwtHsSecret, {
      expiresIn: '360d',
    });
    console.log(token);
    const hash = await bcrypt.hash(password, 10);

    const mailOptions = getConfirmEmail(name, email, token);
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
      message: `A verification email has been sent to ${email}, verify your email to continue. Didn't get the verification email? Please check your spam folder.`,
      user: {
        id: arId,
        ...payload,
      },
    };
  }
  throw new UserInputError('Email already exists');
};

module.exports = signup;
