const generateRandomNumber = () => {
  return Math.floor(Math.random() * 899 + 100);
};

const findUser = async (arId, db) => {
  const user = await db
    .collection('users')
    .find({ _id: arId })
    .toArray();
  return user.length;
};

const findTeam = async (teamId, db) => {
  const team = await db
    .collection('teams')
    .find({ _id: teamId })
    .toArray();
  return team.length;
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
      .toUpperCase()
      .substr(0, 3);
  }
  if (shortName.length === 1) shortName += 'XX';
  else if (shortName.length === 2) shortName += 'X';
  const randomNumber = generateRandomNumber();
  const arId = `AR-${shortName}-${randomNumber}`;
  if (!(await findUser(arId, db))) {
    return arId;
  }
  const newArId = await generateArId(name, db);
  return newArId;
};

const generateTeamId = (arId, eventId, db) => {
  let randomNumber;
  let teamId;
  for (;;) {
    randomNumber = generateRandomNumber();
    teamId = `${arId}-${eventId}-${randomNumber}`;
    if (!findTeam(teamId, db)) return teamId;
  }
};

module.exports = { generateArId, generateTeamId };
