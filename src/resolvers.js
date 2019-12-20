const user = require('./resolvers/query/user');
const publicUser = require('./resolvers/query/publicUser');
const publicUsers = require('./resolvers/query/publicUsers');
const allUsers = require('./resolvers/query/protected/allUsers');
const allTeams = require('./resolvers/query/protected/allTeams');
const eventTeams = require('./resolvers/query/protected/eventTeams');
const adminMetadata = require('./resolvers/query/protected/adminMetadata');

const signup = require('./resolvers/mutation/signup');
const login = require('./resolvers/mutation/login');
const eventRegister = require('./resolvers/mutation/eventRegister');
const sendInvite = require('./resolvers/mutation/sendInvite');
const cancelInvite = require('./resolvers/mutation/cancelInvite');
const acceptInvite = require('./resolvers/mutation/acceptInvite');
const declineInvite = require('./resolvers/mutation/declineInvite');
const removeMember = require('./resolvers/mutation/removeMember');
const leaveTeam = require('./resolvers/mutation/leaveTeam');
const contactUs = require('./resolvers/mutation/contactUs');
const verifyRegister = require('./resolvers/mutation/verifyRegister');
const forgotPassword = require('./resolvers/mutation/forgotPassword');
const resetPassword = require('./resolvers/mutation/resetPassword');
const setTeamName = require('./resolvers/mutation/setTeamName');
const generateEventOrder = require('./resolvers/mutation/generateEventOrder');
const verifyEventOrder = require('./resolvers/mutation/verifyEventOrder');
const generateAccOrder = require('./resolvers/mutation/generateAccOrder');
const verifyAccOrder = require('./resolvers/mutation/verifyAccOrder');

const User = require('./resolvers/custom/User');
const PublicUser = require('./resolvers/custom/PublicUser');
const Team = require('./resolvers/custom/Team');
const Event = require('./resolvers/custom/Event');

const resolvers = {
  Query: {
    user,
    publicUser,
    publicUsers,
    allUsers,
    allTeams,
    eventTeams,
    adminMetadata,
  },
  Mutation: {
    signup,
    login,
    eventRegister,
    sendInvite,
    cancelInvite,
    acceptInvite,
    declineInvite,
    removeMember,
    leaveTeam,
    contactUs,
    verifyRegister,
    forgotPassword,
    resetPassword,
    setTeamName,
    generateEventOrder,
    verifyEventOrder,
    generateAccOrder,
    verifyAccOrder,
  },
  User,
  PublicUser,
  Team,
  PrivateTeam: Team,
  Event,
};

module.exports = resolvers;
