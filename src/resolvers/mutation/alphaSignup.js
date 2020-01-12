const { UserInputError, ApolloError } = require('apollo-server-express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const xss = require('xss');

const { jwtSecret } = require('../../utils/config');
const { generateArId } = require('../../utils/helpers');
const getAlphaEmail = require('../../utils/emails/emailAlpha');

const mailer = require('../../utils/mailer');

const alphaSignup = async (_, args, context) => {
  const { db, client, logger } = context;
  let email = args.email.toLowerCase();
  const { passcode } = args;

  if (passcode !== 'betagamma') throw new ApolloError('Go Home Kid.', 'GO_HOME_KID');

  const xssOptions = {
    whiteList: [],
    stripIgnoreTag: [],
    stripIgnoreTagBody: ['script'],
  };
  email = xss(email, xssOptions);
  const name = xss(args.name, xssOptions);
  const college = xss(args.college, xssOptions);
  const city = xss(args.city, xssOptions);
  const phone = xss(args.phone, xssOptions);
  const gender = xss(args.gender, xssOptions);

  if (name === '' || email === '' || college === '' || phone === '' || gender === '' || city === '')
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
      isVerified: true,
      accommodation: false,
      pronite: {
        paid: false,
        paidAmount: 0,
        refundedAmount: 0,
        gotAccOffer: false,
        gotEvtOffer: 'none',
      },
      teams: [],
      teamInvitations: [],
      timeSt: `${Date.now()}`,
    };
    const password = arId.replace(/-/g, '').toLowerCase();
    console.log(password);
    const hash = await bcrypt.hash(password, 10);

    const mailOptions = getAlphaEmail(name, email, password);
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

        await usersCollection.insertOne(
          {
            hash,
            ...payload,
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

    const jwtPayload = {
      email,
      id: arId,
    };

    const token = jwt.sign(jwtPayload, jwtSecret.privKey, {
      algorithm: 'ES512',
      expiresIn: '30d',
    });

    mailer(mailOptions);

    return token;
  }
  throw new UserInputError('Email already exists');
};

module.exports = alphaSignup;
