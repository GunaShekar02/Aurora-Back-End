const jwt = require('jsonwebtoken');
const DataLoader = require('dataloader');
const { jwtSecret } = require('./utils/config');
const logger = require('./utils/logger');

const { batchUsers } = require('./resolvers/custom/loaders/userLoader');
const { batchTeams } = require('./resolvers/custom/loaders/teamLoader');
const { batchEvents } = require('./resolvers/custom/loaders/eventLoader');

const provideContext = (request, database, client) => {
  const userLoader = new DataLoader(ids => batchUsers(ids, database, logger));
  const teamLoader = new DataLoader(teamIds => batchTeams(teamIds, database));
  const eventLoader = new DataLoader(eventIds => batchEvents(eventIds, database));

  const { req } = request;
  const payload = {
    isValid: false,
    token: null,
    email: null,
    id: null,
    db: database,
    client,
    userLoader,
    teamLoader,
    eventLoader,
    logger,
  };
  const authHeader = req.headers.authorization || null;

  if (authHeader) {
    const token = authHeader.replace('bearer ', '');

    jwt.verify(token, jwtSecret.pubKey, { algorithm: 'ES512' }, (err, decoded) => {
      if (!err) {
        payload.isValid = true;
        payload.token = token;
        payload.email = decoded.email;
        payload.id = decoded.id;
      }
    });
  }
  return payload;
};

module.exports = provideContext;
