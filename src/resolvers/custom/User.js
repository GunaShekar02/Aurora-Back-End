const User = {
  name: async ({ id }, _, context) => {
    const { db } = context;
    const users = await db.collection('users').findOne({ _id: id });
    // eslint-disable-next-line no-console
    console.log(users);
    return users[0].name;
  },
};

module.exports = User;
