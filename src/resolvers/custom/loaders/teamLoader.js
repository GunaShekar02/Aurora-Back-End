const batchTeams = async (ids, db, logger) => {
  logger('fetching teamIds=>', ids);

  const teams = await db
    .collection('teams')
    .find({ _id: { $in: ids } })
    .toArray();

  const teamMap = new Map();
  teams.forEach((team, index) => {
    teamMap.set(team._id, index);
  });

  const sortedTeams = ids.map(id => {
    const teamIndex = teamMap.get(id);
    if (teamIndex === undefined) return null;
    return teams[teamIndex];
  });

  return sortedTeams;
};

module.exports = { batchTeams };
