const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const provideContext = require('./context');

require('dotenv').config();

const app = express();
app.use(cors());

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: req => provideContext(req),
});

const port = process.env.PORT || 3001;

app.get('/api', (req, res) => res.send('it is working.'));

server.applyMiddleware({ app, path: '/api/graphql' });

app.listen(port, () =>
  // eslint-disable-next-line no-console
  console.log(`API server ready at http://localhost:${port}${server.graphqlPath}`)
);
