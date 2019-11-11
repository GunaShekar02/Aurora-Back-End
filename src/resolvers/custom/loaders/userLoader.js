const batchUsers = async (ids, db, logger) => {
  logger('fetch ids=>', ids);
  const users = await db
    .collection('users')
    .find({ _id: { $in: ids } })
    .toArray();

  const userMap = new Map();
  users.forEach((user, index) => {
    userMap.set(user._id, index);
  });

  const sortedUsers = ids.map(id => {
    const userIndex = userMap.get(id);
    if (userIndex === undefined) return null;
    return users[userIndex];
  });

  logger('got users=>', users);
  logger('sorted users=>', sortedUsers);

  return sortedUsers;
};

module.exports = { batchUsers };
