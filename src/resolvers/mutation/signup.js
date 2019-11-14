const { UserInputError, ApolloError } = require('apollo-server-express');
const bcrypt = require('bcrypt');

const { generateArId } = require('../../utils/helpers');

const signup = async (_, args, context) => {
  const { db } = context;
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

    const hash = await bcrypt.hash(password, 10);

    await db.collection('users').insertOne({
      hash,
      ...payload,
    });

    return {
      code: 200,
      success: true,
      message: 'User registered successfully',
      user: {
        id: arId,
        ...payload,
      },
    };
  }
  throw new UserInputError('Email already exists');
};

module.exports = signup;
