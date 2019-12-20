const { AuthenticationError } = require('apollo-server-express');

const userData = require('../../../data/userData');
const eventData = require('../../../data/eventData');

const adminMetadata = async (_, __, context) => {
  const { id, isValid, isEventAdmin, isRoot } = context;

  if (isValid && (isEventAdmin || isRoot)) {
    const userD = userData.get(id);

    let events;
    if (isRoot) {
      events = Array.from(eventData.values());
    } else {
      events = userD.eventIds.map(evtId => {
        return {
          id: evtId,
        };
      });
    }

    return {
      isRoot,
      isEventAdmin,
      events,
    };
  }
  throw new AuthenticationError('Go Home Kid');
};

module.exports = adminMetadata;
