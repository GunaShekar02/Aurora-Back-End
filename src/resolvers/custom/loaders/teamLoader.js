const batchTeams = async (ids, db) => {
  console.log('called batchTeams');
  const teams = await db
    .collection('teams')
    .find({ _id: { $in: ids } })
    .toArray();
  console.log('teams from bT', teams);
  //should group them first
  // const gU = _.groupBy(users, )
  // const mapperUsers = newIds.map(id => )
  return teams;
};

module.exports = { batchTeams };
