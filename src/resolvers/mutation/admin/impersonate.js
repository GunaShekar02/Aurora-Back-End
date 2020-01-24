const { AuthenticationError, ApolloError } = require('apollo-server-express');
const jwt = require('jsonwebtoken');

const { jwtSecret } = require('../../../utils/config');
const { canEditUsers } = require('../../../utils/roles');

const makeEventAdmin = async (_, args, context) => {
  const { id, isValid, userLoader } = context;

  const auth = await canEditUsers(id, userLoader);

  if (isValid && auth) {
    const arId = args.arId.toUpperCase();

    const user = await userLoader.load(arId);

    if (!user) throw new ApolloError('User does not exist', 'USR_DOESNT_EXIST');

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
  throw new AuthenticationError('Go Home Kid');
};

module.exports = makeEventAdmin;
