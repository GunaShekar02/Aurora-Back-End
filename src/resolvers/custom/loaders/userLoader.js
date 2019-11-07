const batchUsers = async (ids, db) => {
  console.log('called');
  const newIds = ids;
  let result = [];
  const users = await db
    .collection('users')
    .find({ _id: { $in: ids } })
    .toArray();
  console.log('users', users);
  //should group them first
  // const gU = _.groupBy(users, )
  // const mapperUsers = newIds.map(id => )
  return users;
};

module.exports = { batchUsers };
