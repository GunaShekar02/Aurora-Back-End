const User = {
  name: async (args, __, { userLoader }) => {
    const { id } = args;
    const user = await userLoader.load(id);
    return user.name;
  },
  email: async (args, __, { userLoader }) => {
    const { id } = args;
    const user = await userLoader.load(id);
    return user.email;
  },
  college: async (args, __, { userLoader }) => {
    const { id } = args;
    const user = await userLoader.load(id);
    return user.college;
  },
  city: async (args, __, { userLoader }) => {
    const { id } = args;
    const user = await userLoader.load(id);
    return user.city;
  },
  gender: async (args, __, { userLoader }) => {
    const { id } = args;
    const user = await userLoader.load(id);
    return user.gender;
  },
  timeSt: async (args, __, { userLoader }) => {
    const { id } = args;
    const user = await userLoader.load(id);
    return user.timeSt;
  },
  displayPic: async (args, __, { userLoader }) => {
    const { id } = args;
    const user = await userLoader.load(id);
    return user.displayPic;
  },
  isVerified: async (args, __, { userLoader }) => {
    const { id } = args;
    const user = await userLoader.load(id);
    return user.isVerified;
  },
  teams: async (args, __, { userLoader }) => {
    const { id } = args;
    const user = await userLoader.load(id);
    return user.teams;
  },
  phone: async (args, __, { userLoader }) => {
    const { id } = args;
    const user = await userLoader.load(id);
    return user.phone;
  },
  accommodation: async (args, __, { userLoader }) => {
    const { id } = args;
    const user = await userLoader.load(id);
    return user.accommodation;
  },
  pronite: async (args, __, { userLoader }) => {
    const { id } = args;
    const user = await userLoader.load(id);
    return user.pronite.paid;
  },
  teamInvitations: async (args, __, { userLoader }) => {
    const { id } = args;
    const user = await userLoader.load(id);
    return user.teamInvitations.map(invite => {
      return {
        team: {
          teamId: invite.teamId,
        },
        invitedBy: {
          id: invite.invitedBy,
        },
      };
    });
  },
  ca: async (args, __, { userLoader }) => {
    const { id } = args;
    const user = await userLoader.load(id);
    const { isCA, id: caId, users } = user.ca;
    return {
      isCA,
      caId,
      users: users.map(u => {
        return { id: u };
      }),
    };
  },
};

module.exports = User;
