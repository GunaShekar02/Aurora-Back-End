const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { ApolloServer } = require('apollo-server-express');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const provideContext = require('./context');

const config = require('./utils/config');

const app = express();
app.use(cors());

MongoClient.connect(config.dbHost, {
  auth: {
    user: config.dbUser,
    password: config.dbPass,
    authSource: config.dbName,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(client => {
    const db = client.db(config.dbName);

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: req => provideContext(req, db),
    });

    const port = config.port || 3001;

    app.get('/api', (_req, res) => res.send('it is working.'));

    server.applyMiddleware({ app, path: '/api/graphql' });

    app.listen(port, () =>
      // eslint-disable-next-line no-console
      console.log(`API server ready at http://localhost:${port}${server.graphqlPath}`)
    );
  })
  .catch(err => {
    // eslint-disable-next-line no-console
    console.log('I caught something', err);
  });
