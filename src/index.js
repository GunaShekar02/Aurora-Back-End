const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pdf = require('html-pdf');
const { MongoClient } = require('mongodb');
const { ApolloServer } = require('apollo-server-express');
const pdfTemplate = require('./template');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const provideContext = require('./context');

const rzpWebhook = require('./controllers/rzpWebhook');

const config = require('./utils/config');

const app = express();
app.use(cors());
app.use(bodyParser.json());

MongoClient.connect(config.dbHost, {
  auth: {
    user: config.dbUser,
    password: config.dbPass,
    authSource: config.dbName,
  },
  replicaSet: config.dbReplSet,
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(client => {
    const db = client.db(config.dbName);

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: req => provideContext(req, db, client),
      tracing: true,
    });

    const port = config.port || 3001;

    app.get('/api', (_req, res) => res.send('it is working.'));
    app.post('/api/rzpwebhook', (req, res) => {
      rzpWebhook(req, res, db);
    });
    app.post('/create-pdf', (req, res) => {
      console.log('came here', req.body);
      console.log(pdfTemplate(req.body));
      pdf.create(pdfTemplate(req.body), {}).toFile(`${__dirname}/result.pdf`, err => {
        if (err) {
          res.send(Promise.reject());
        }

        res.send(Promise.resolve());
      });
    });

    app.get('/fetch-pdf', (req, res) => {
      res.sendFile(`${__dirname}/result.pdf`);
    });
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
