const user = require('./resolvers/query/user');

const signup = require('./resolvers/mutation/signup');
const login = require('./resolvers/mutation/login');
const eventRegister = require('./resolvers/mutation/eventRegister');
const sendInvite = require('./resolvers/mutation/sendInvite');

const resolvers = {
  Query: {
    user,
  },
  Mutation: {
    signup,
    login,
    eventRegister,
    sendInvite,
  },
};

module.exports = resolvers;
