const user = require('./resolvers/query/user');

const signup = require('./resolvers/mutation/signup');
const login = require('./resolvers/mutation/login');
const eventRegister = require('./resolvers/mutation/eventRegister');
const sendInvite = require('./resolvers/mutation/sendInvite');
const cancelInvite = require('./resolvers/mutation/cancelInvite');
const acceptInvite = require('./resolvers/mutation/acceptInvite');

const resolvers = {
  Query: {
    user,
  },
  Mutation: {
    signup,
    login,
    eventRegister,
    sendInvite,
    cancelInvite,
    acceptInvite,
  },
};

module.exports = resolvers;
