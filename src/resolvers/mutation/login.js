const { UserInputError, ApolloError } = require('apollo-server-express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { jwtSecret } = require('../../utils/config');

const login = async (_, args, context) => {
  const { db } = context;
  const { email, password } = args;

  const user = await db.collection('users').findOne({ $or: [{ email }, { _id: email }] });
  if (user) {
    if (user.isVerified) {
      const match = await bcrypt.compare(password, user.hash);
      if (match) {
        const payload = {
          email: user.email,
          id: user._id,
        };
        const token = jwt.sign(payload, jwtSecret.privKey, {
          algorithm: 'ES512',
          expiresIn: '30d',
        });
        return token;
      }
      throw new UserInputError('Invalid email or password');
    }
    throw new ApolloError('Please verify your email', 'VERIFY_EMAIL');
  }
  throw new UserInputError('Invalid email or password');
};

module.exports = login;
