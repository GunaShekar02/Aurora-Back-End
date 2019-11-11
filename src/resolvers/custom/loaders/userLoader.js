const batchUsers = async (ids, db) => {
  const users = await db
    .collection('users')
    .find({ _id: { $in: ids } })
    .toArray();
  return users;
};

module.exports = { batchUsers };
