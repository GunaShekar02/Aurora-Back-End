const publicUser = async (_, args, context) => {
  const arId = args.arId.toUpperCase();
  const { userLoader } = context;

  const user = await userLoader.load(arId);

  return user
    ? {
        id: user._id,
      }
    : null;
};

module.exports = publicUser;
