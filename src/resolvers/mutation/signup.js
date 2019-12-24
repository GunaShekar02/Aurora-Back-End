const { UserInputError, ApolloError } = require('apollo-server-express');
const bcrypt = require('bcrypt');

const xss = require('xss');
const { generateArId } = require('../../utils/helpers');
const getConfirmEmail = require('../../utils/emails/emailConfirm');

const mailer = require('../../utils/mailer');

const signup = async (_, args, context) => {
  const { db, client, logger } = context;
  let email = args.email.toLowerCase();

  const xssOptions = {
    whiteList: [],
    stripIgnoreTag: [],
    stripIgnoreTagBody: ['script'],
  };
  email = xss(args.email, xssOptions);
  const password = xss(args.password, xssOptions);
  const name = xss(args.name, xssOptions);
  const college = xss(args.college, xssOptions);
  const city = xss(args.city, xssOptions);
  const phone = xss(args.phone, xssOptions);
  const gender = xss(args.gender, xssOptions);

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
    const token = `${arId.replace(/-/g, '')}${Math.floor(Math.random() * 899999 + 100000)}`;
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
        const verifyCollection = db.collection('verify');

        await usersCollection.insertOne(
          {
            hash,
            ...payload,
          },
          { session }
        );

        await verifyCollection.insertOne(
          {
            _id: arId,
            verifyHash: token,
          },
          { session }
        );
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
