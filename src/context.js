const jwt = require('jsonwebtoken');
const DataLoader = require('dataloader');
const { jwtSecret } = require('./utils/config');
const logger = require('./utils/logger');
const rzp = require('./razorpay');

const { batchUsers } = require('./resolvers/custom/loaders/userLoader');
const { batchTeams } = require('./resolvers/custom/loaders/teamLoader');
const { batchEvents } = require('./resolvers/custom/loaders/eventLoader');

const provideContext = async (request, database, client) => {
  const userLoader = new DataLoader(ids => batchUsers(ids, database, logger));
  const teamLoader = new DataLoader(teamIds => batchTeams(teamIds, database, logger));
  const eventLoader = new DataLoader(eventIds => batchEvents(eventIds, database, logger));

  const { req } = request;
  const payload = {
    isValid: false,
    isRoot: false,
    isEventAdmin: false,
    eventIds: [],
    token: null,
    email: null,
    id: null,
    db: database,
    client,
    userLoader,
    teamLoader,
    eventLoader,
    logger,
    rzp,
  };
  const authHeader = req.headers.authorization || null;

  logger('\n-------------------------REQUEST--------------------------');

  if (authHeader) {
    const token = authHeader.replace('bearer ', '');

    try {
      const decoded = await jwt.verify(token, jwtSecret.pubKey, { algorithm: 'ES512' });
      payload.isValid = true;
      payload.token = token;
      payload.email = decoded.email;
      payload.id = decoded.id;
      const role = decoded.role || null;

      if (role && role === 'root') payload.isRoot = true;
      else if (role && role === 'evtAdm') {
        payload.isEventAdmin = true;
        payload.eventIds = decoded.evt;
      }

      logger('userId=>', decoded.id, 'email=>', decoded.email, 'role=>', role, '\n');
    } catch (err) {
      payload.isValid = false;
    }
  }

  return payload;
};

module.exports = provideContext;
