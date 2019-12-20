const publicUsers = async (_, args, context) => {
  const arIds = args.arIds.map(arId => arId.toUpperCase());
  const { userLoader } = context;

  const userRes = await userLoader.loadMany(arIds);

  const users = userRes.map(user => {
    return user ? { id: user._id } : null;
  });

  return users;
};

module.exports = publicUsers;
