const { AuthenticationError, ApolloError } = require('apollo-server-express');
const jwt = require('jsonwebtoken');

const { jwtSecret } = require('../../../utils/config');

const makeEventAdmin = async (_, args, context) => {
  const { isValid, isRoot, userLoader } = context;

  if (isValid && isRoot) {
    const arId = args.arId.toUpperCase();

    const user = await userLoader.load(arId);

    if (!user) throw new ApolloError('User does not exist', 'USR_DOESNT_EXIST');

    let payload;

    if (user.role && user.role.isRoot) {
      payload = {
        email: user.email,
        id: user._id,
        role: 'root',
      };
    } else if (user.role && user.role.isEventAdmin) {
      payload = {
        email: user.email,
        id: user._id,
        role: 'evtAdm',
        evt: user.role.events,
      };
    } else {
      payload = {
        email: user.email,
        id: user._id,
      };
    }

    const token = jwt.sign(payload, jwtSecret.privKey, {
      algorithm: 'ES512',
      expiresIn: '30d',
    });

    return token;
  }
  throw new AuthenticationError('Go Home Kid');
};

module.exports = makeEventAdmin;
