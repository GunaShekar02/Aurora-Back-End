const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./utils/config');

const provideContext = (request, database, client) => {
  const { req } = request;
  const payload = {
    isValid: false,
    token: null,
    email: null,
    id: null,
    db: database,
    client: client,
  };
  const authHeader = req.headers.authorization || null;

  if (authHeader) {
    const token = authHeader.replace('bearer ', '');

    jwt.verify(token, jwtSecret, (err, decoded) => {
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
