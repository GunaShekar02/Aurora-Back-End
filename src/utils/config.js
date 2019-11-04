const fs = require('fs');
require('dotenv').config();

const privKey = fs.readFileSync('keys/ecd.pem');
const pubKey = fs.readFileSync('keys/ecd.pub.pem');

const config = {
  port: process.env.PORT,
  dbHost: process.env.DB_HOST,
  dbUser: process.env.DB_USER,
  dbPass: process.env.DB_PASS,
  dbName: process.env.DB_NAME,
  dbReplSet: process.env.DB_REPL_NAME,
  jwtSecret: {
    privKey,
    pubKey,
  },
};

module.exports = config;
