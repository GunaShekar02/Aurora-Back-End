const crypto = require('crypto');
const { rzpOptions } = require('./config');

const generateRandomNumber = () => {
  return Math.floor(Math.random() * 899 + 100);
};

const findUser = async (arId, db) => {
  const user = await db.collection('users').findOne({ _id: arId });
  return user;
};

const findTeam = async (teamId, db) => {
  const team = await db.collection('teams').findOne({ _id: teamId });
  return team;
};

const generateArId = async (name, db) => {
  let shortName;
  if (!name.match(/[a-zA-Z]+/g)) {
    shortName = 'XXX';
  } else {
    shortName = name
      .match(/[a-zA-Z]+/g)
      .toString()
      .replace(/,/g, '')
      .substr(0, 3)
      .toUpperCase();
  }
  if (shortName.length === 1) shortName += 'XX';
  else if (shortName.length === 2) shortName += 'X';
  const randomNumber = generateRandomNumber();
  const arId = `AR-${shortName}-${randomNumber}`;
  if (!(await findUser(arId, db))) return arId;
  const newArId = await generateArId(name, db);
  return newArId;
};

const generateTeamId = async (arId, eventId, db) => {
  const randomNumber = generateRandomNumber();
  const teamId = `${arId}-${eventId}-${randomNumber}`;
  if (!(await findTeam(teamId, db))) return teamId;
  const newTeamId = await generateTeamId(arId, eventId, db);
  return newTeamId;
};

const generateReceipt = async (arId, db, collection) => {
  const randomNumber = Math.floor(Math.random() * 899999 + 100000);
  const receipt = `${arId}-${randomNumber}`;
  const verifyReceipt = await db.collection(collection).findOne({ receipt });
  if (!verifyReceipt) return receipt;
  const newReceipt = await generateReceipt(arId, db, collection);
  return newReceipt;
};

const verifyRzpSignature = (orderId, paymentId, signature) => {
  const generatedSignature = crypto
    .createHmac('SHA256', rzpOptions.key_secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

module.exports = { generateArId, generateTeamId, generateReceipt, verifyRzpSignature };
