const { AuthenticationError } = require('apollo-server-express');

const eventData = require('../../../data/eventData');

const adminMetadata = async (_, __, context) => {
  const { isValid, isEventAdmin, isRoot, eventIds } = context;

  if (isValid && (isEventAdmin || isRoot)) {
    let events;

    if (isRoot) {
      events = Array.from(eventData.values());
    } else {
      events = eventIds.map(evtId => {
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
