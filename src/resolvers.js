const user = require('./resolvers/query/user');
const publicUser = require('./resolvers/query/publicUser');
const publicUsers = require('./resolvers/query/publicUsers');
const caUsers = require('./resolvers/query/caUsers');

const allUsers = require('./resolvers/query/protected/allUsers');
const allTeams = require('./resolvers/query/protected/allTeams');
const eventTeams = require('./resolvers/query/protected/eventTeams');
const eventOrders = require('./resolvers/query/protected/eventOrders');
const proniteOrders = require('./resolvers/query/protected/proniteOrders');
const accOrders = require('./resolvers/query/protected/accOrders');
const adminMetadata = require('./resolvers/query/protected/adminMetadata');
const stats = require('./resolvers/query/protected/stats');
const allCA = require('./resolvers/query/protected/allCA');
const userDetails = require('./resolvers/query/protected/userDetails');

const signup = require('./resolvers/mutation/signup');
const alphaSignup = require('./resolvers/mutation/alphaSignup');
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
const updateProfile = require('./resolvers/mutation/updateProfile');
const uploadPhoto = require('./resolvers/mutation/uploadPhoto');
const setCA = require('./resolvers/mutation/setCA');

const generateEventOrder = require('./resolvers/mutation/generateEventOrder');
const verifyEventOrder = require('./resolvers/mutation/verifyEventOrder');
const generateAccOrder = require('./resolvers/mutation/generateAccOrder');
const verifyAccOrder = require('./resolvers/mutation/verifyAccOrder');
const generateProniteOrder = require('./resolvers/mutation/generateProniteOrder');
const verifyProniteOrder = require('./resolvers/mutation/verifyProniteOrder');

const makeEventAdmin = require('./resolvers/mutation/admin/makeEventAdmin');
const makeCA = require('./resolvers/mutation/admin/makeCA');
const impersonate = require('./resolvers/mutation/admin/impersonate');
const reVerifyEvtOrder = require('./resolvers/mutation/admin/reVerifyEvtOrder');
const reVerifyProniteOrder = require('./resolvers/mutation/admin/reVerifyProniteOrder');
const reVerifyAccOrder = require('./resolvers/mutation/admin/reVerifyAccOrder');
const issueBand = require('./resolvers/mutation/admin/issueBand');

const User = require('./resolvers/custom/User');
const PublicUser = require('./resolvers/custom/PublicUser');
const Team = require('./resolvers/custom/Team');
const NullTeam = require('./resolvers/custom/NullTeam');
const Event = require('./resolvers/custom/Event');

const resolvers = {
  Query: {
    user,
    publicUser,
    publicUsers,
    caUsers,
    allUsers,
    allTeams,
    eventTeams,
    eventOrders,
    proniteOrders,
    accOrders,
    adminMetadata,
    stats,
    allCA,
    userDetails,
  },
  Mutation: {
    signup,
    alphaSignup,
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
    generateProniteOrder,
    verifyProniteOrder,
    updateProfile,
    uploadPhoto,
    setCA,
    makeEventAdmin,
    makeCA,
    impersonate,
    reVerifyEvtOrder,
    reVerifyProniteOrder,
    reVerifyAccOrder,
    issueBand,
  },
  User,
  PublicUser,
  Team,
  NullTeam,
  PrivateTeam: Team,
  Event,
};

module.exports = resolvers;
