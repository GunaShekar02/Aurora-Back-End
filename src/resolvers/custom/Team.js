const Team = {
  name: async (args, __, { teamLoader }) => {
    console.log('teams arr', args);
    // const teams = await teamLoader.load(args.teamIds);
    // console.log(teams);

    // const teams = await teamLoader.load(args.teamIds);

  },
};

module.exports = Team;
