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
};

module.exports = User;
