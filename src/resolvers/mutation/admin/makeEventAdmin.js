const { AuthenticationError, ApolloError } = require('apollo-server-express');

const makeEventAdmin = async (_, args, context) => {
  const { isValid, isRoot, userLoader, db } = context;

  if (isValid && isRoot) {
    const arId = args.arId.toUpperCase();
    const { eventIds } = args;

    const user = await userLoader.load(arId);

    if (!user) throw new ApolloError('User does not exist', 'USR_DOESNT_EXIST');

    if (user.role && user.role.isEventAdmin) {
      const eventsToInsert = eventIds.filter(eId => !user.role.events.some(evtId => evtId === eId));
      db.collection('users').updateOne(
        { _id: arId },
        { $set: { 'role.events': user.role.events.concat(eventsToInsert) } }
      );
    } else {
      db.collection('users').updateOne(
        { _id: arId },
        { $set: { 'role.events': eventIds, 'role.isEventAdmin': true } }
      );
    }
    return {
      success: true,
      message: 'User is now eventAdmin',
      code: 200,
    };
  }
  throw new AuthenticationError('Go Home Kid');
};

module.exports = makeEventAdmin;
