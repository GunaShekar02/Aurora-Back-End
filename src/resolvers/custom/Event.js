const Event = {
  name: async (args, __, { eventLoader }) => {
    const event = await eventLoader.load(args);
    return event.name;
  },
  fee: async (args, __, { eventLoader }) => {
    const event = await eventLoader.load(args);
    return event.fee;
  },
  id: async (args, __, { eventLoader }) => {
    const event = await eventLoader.load(args);
    return event._id;
  },
  maxSize: async (args, __, { eventLoader }) => {
    const event = await eventLoader.load(args);
    return event._id;
  },
};

module.exports = Event;
