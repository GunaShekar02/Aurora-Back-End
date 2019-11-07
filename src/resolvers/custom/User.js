const User = {
  name: async (args, __, { userLoader }) => {
    const { id } = args;
    console.log(id);
    const user = await userLoader.load(id);
    console.log('user =>', user);
    return user.name;
  },
  college: async (args, __, { userLoader }) => {
    const { id } = args;
    // console.log(id);
    const user = await userLoader.load(id);
    // console.log('user =>', user);
    return user.college;
  },
  isVerified: async (args, __, { userLoader }) => {
    const { id } = args;
    // console.log(id);
    const user = await userLoader.load(id);
    // console.log('user =>', user);
    return user.isVerified;
  },
  teams: async (args, __, { userLoader }) => {
    const { id } = args;
    console.log('sdff');
    const user = await userLoader.load(id);
    // TeamLoader
    // console.log('user =>', user);
    return { name: "abcd" };
  },
};

module.exports = User;
