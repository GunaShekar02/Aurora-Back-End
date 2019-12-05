const Team = {
  name: async ({ teamId }, __, { teamLoader }) => {
    const team = await teamLoader.load(teamId);
    return team.name;
  },

  id: async ({ teamId }) => teamId,

  members: async ({ teamId }, __, { teamLoader }) => {
    const team = await teamLoader.load(teamId);
    const members = team.members.map(member => {
      return { id: member };
    });
    return members;
  },

  event: async ({ teamId }, __, { teamLoader }) => {
    const team = await teamLoader.load(teamId);
    return { id: team.event };
  },

  pendingInvitations: async ({ teamId }, __, { teamLoader }) => {
    const team = await teamLoader.load(teamId);
    return team.pendingInvitations;
  },

  paymentStatus: async ({ teamId }, __, { teamLoader }) => {
    const team = await teamLoader.load(teamId);
    return team.paymentStatus;
  },
};

module.exports = Team;
