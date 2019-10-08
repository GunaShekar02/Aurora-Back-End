const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
  Query: {
    user: (_, __, context) => {
    	const {isValid, email, id} = context;

      if(isValid){
        return {email, id}
      }
      else{
        throw new AuthenticationError('Must Authenticate');
      }
    },
  },
};

module.exports = resolvers;