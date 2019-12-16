const PublicUser = {
  name: async (args, __, { userLoader }) => {
    const { id } = args;
    const user = await userLoader.load(id);
    return user.name;
  },
  displayPic: async (args, __, { userLoader }) => {
    const { id } = args;
    const user = await userLoader.load(id);
    return user.displayPic;
  },
};

module.exports = PublicUser;
