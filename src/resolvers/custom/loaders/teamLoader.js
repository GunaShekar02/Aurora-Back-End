const batchTeams = async (ids, db) => {
  const teams = await db
    .collection('teams')
    .find({ _id: { $in: ids } })
    .toArray();
  return teams;
};

module.exports = { batchTeams };
