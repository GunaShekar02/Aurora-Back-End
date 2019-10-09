const { UserInputError } = require('apollo-server-express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { jwtSecret } = require('../../utils/config');

const login = async (_, args, context) => {
  const { db } = context;
  const { email, password } = args;

  const user = await db
    .collection('users')
    .find({ email })
    .toArray();
  if (user.length !== 0) {
    const match = await bcrypt.compare(password, user[0].hash);
    if (match) {
      const payload = {
        email: user[0].email,
        id: user[0]._id,
      };
      const token = await jwt.sign(payload, jwtSecret, {
        expiresIn: '30d',
      });
      return token;
    }
    throw new UserInputError('Invalid email or password');
  }
  throw new UserInputError('Invalid email or password');
};

module.exports = login;
