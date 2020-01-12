const fs = require('fs');
require('dotenv').config();

const privKey = fs.readFileSync('keys/ecd.pem');
const pubKey = fs.readFileSync('keys/ecd.pub.pem');

const {
  PORT,
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME,
  DB_REPL_NAME,
  SMTP_HOST,
  SMTP_USER,
  SMTP_PASS,
  RZP_KEY_ID,
  RZP_KEY_SECRET,
} = process.env;

const config = {
  port: PORT,
  dbHost: DB_HOST,
  dbUser: DB_USER,
  dbPass: DB_PASS,
  dbName: DB_NAME,
  dbReplSet: DB_REPL_NAME,
  jwtSecret: {
    privKey,
    pubKey,
  },
  smtpCreds: {
    host: SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  },
  rzpOptions: {
    key_id: RZP_KEY_ID,
    key_secret: RZP_KEY_SECRET,
  },
  extraCharges: 2.42,
  accomodationFee: 799,
  proniteFee: 349,
  evtOfferAmount: 100,
  smallEvtOfferAmount: 50,
};

module.exports = config;
