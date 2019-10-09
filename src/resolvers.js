const user = require('./resolvers/query/user');
const signup = require('./resolvers/mutation/signup');

const resolvers = {
  Query: {
    user,
  },
  Mutation: {
    signup,
  },
};

module.exports = resolvers;
