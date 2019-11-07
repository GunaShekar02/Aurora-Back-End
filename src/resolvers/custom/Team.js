const Team = {
  name: async (args, __, { teamLoader }) => {
    // console.log('teams arr', args);
    // console.log(args.teamId);
    const team = await teamLoader.load(args.teamId);
    return team.name;
    // console.log(teams);
    // return teams.name;
  },
  id: async args => args.teamId,
  members: async (args, __, { teamLoader }) => {
    // console.log(args);
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
};

module.exports = Team;
