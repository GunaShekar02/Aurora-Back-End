const user = require('./resolvers/query/user');

const signup = require('./resolvers/mutation/signup');
const login = require('./resolvers/mutation/login');

const resolvers = {
  Query: {
    user,
  },
  Mutation: {
    signup,
    login,
  },
};

module.exports = resolvers;
