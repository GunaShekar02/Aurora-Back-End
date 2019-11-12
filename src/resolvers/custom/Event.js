const eventData = require('../../data/eventData');

const Event = {
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
};

module.exports = Event;
