const eventData = require('../../data/eventData');

const Event = {
  id: async ({ id }) => {
    return id;
  },
  name: async ({ id }) => {
    const event = eventData.get(id);
    return event.name;
  },
  fee: async ({ id }) => {
    const event = eventData.get(id);
    return event.fee;
  },
  maxSize: async ({ id }) => {
    const event = eventData.get(id);
    return event.maxSize;
  },
  parentEvent: async ({ id }) => {
    const event = eventData.get(id);
    return event.parentEvent;
  },
};

module.exports = Event;
