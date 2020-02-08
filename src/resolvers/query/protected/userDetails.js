const { AuthenticationError } = require('apollo-server-express');
const { canViewEvents, canViewUsers } = require('../../../utils/roles');

const userDetails = async (_, args, context) => {
  const { id, userLoader, isValid } = context;

  if (isValid && ((await canViewEvents(id, userLoader)) || (await canViewUsers(id, userLoader)))) {
    const { arId } = args;

    return {
      id: arId,
    };
  }
  throw new AuthenticationError('Go Home Kid');
};

module.exports = userDetails;
