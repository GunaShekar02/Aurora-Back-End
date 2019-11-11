const Team = {
  name: async (args, __, { teamLoader }) => {
    const team = await teamLoader.load(args.teamId);
    return team.name;
  },
  id: async args => args.teamId,

  members: async (args, __, { teamLoader }) => {
    const team = await teamLoader.load(args.teamId);
    const members = team.members.map(member => {
      return { id: member };
    });
    return members;
  },
  event: async (args, __, { teamLoader }) => {
    const team = await teamLoader.load(args.teamId);
    return team.event;
  },
  paymentStatus: async (args, __, { teamLoader }) => {
    const team = await teamLoader.load(args.teamId);
    return team.paymentStatus;
  },
};

module.exports = Team;
